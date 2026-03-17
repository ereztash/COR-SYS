'use server'

import { createClient } from '@/lib/supabase/server'
import type { ClientBusinessPlanUpsert } from '@/types/database'
import { buildPlanFromQuestionnaire, type QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { diagnose } from '@/lib/dsm-engine'
import { insertDiagnostic } from '@/lib/data'
import { revalidatePath } from 'next/cache'
import { isValidUuid } from '@/lib/validation'

export async function savePlanFromQuestionnaire(clientId: string, clientName: string, answers: QuestionnaireAnswer): Promise<{ ok: boolean; error?: string }> {
  if (!isValidUuid(clientId)) return { ok: false, error: 'מזהה לקוח לא חוקי' }
  const supabase = await createClient()

  let planResult: ReturnType<typeof buildPlanFromQuestionnaire>
  let dsmDiagnosis: ReturnType<typeof diagnose>
  try {
    planResult = buildPlanFromQuestionnaire(clientName, answers)
    dsmDiagnosis = diagnose(answers)
  } catch (e) {
    console.error('[savePlanFromQuestionnaire] DSM computation failed', e)
    return { ok: false, error: 'שגיאה בחישוב האבחון — נסה שוב' }
  }

  const { title, summary, nextSteps, recommendedChannelId, recommendedOptionId } = planResult
  const scoreMap = Object.fromEntries(dsmDiagnosis.pathologies.map((p) => [p.code, p.score]))
  const dsmSummary = {
    drScore: scoreMap.DR ?? 0,
    ndScore: scoreMap.ND ?? 0,
    ucScore: scoreMap.UC ?? 0,
    severityProfile: dsmDiagnosis.severityProfile,
    entropyScore: planResult.entropyScore,
  }

  const upsertPayload: ClientBusinessPlanUpsert = {
    client_id: clientId,
    status: 'active',
    title,
    questionnaire_response: answers as unknown as Record<string, unknown>,
    recommended_channel_id: recommendedChannelId,
    recommended_option_id: recommendedOptionId,
    summary,
    next_steps: nextSteps,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('client_business_plans')
    // @ts-expect-error Postgrest infers upsert as never for tables with jsonb
    .upsert(upsertPayload, { onConflict: 'client_id' })

  if (error) return { ok: false, error: error.message }

  // Diagnostic insert is best-effort — a failure here should not block the plan save
  try {
    await insertDiagnostic(clientId, answers as unknown as Record<string, unknown>, dsmSummary)
  } catch (e) {
    console.error('[savePlanFromQuestionnaire] insertDiagnostic failed', e)
  }

  revalidatePath(`/clients/${clientId}`)
  revalidatePath(`/clients/${clientId}/plan`)
  return { ok: true }
}
