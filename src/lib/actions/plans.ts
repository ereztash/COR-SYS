'use server'

import { createClient } from '@/lib/supabase/server'
import type { ClientBusinessPlanUpsert } from '@/types/database'
import { buildPlanFromQuestionnaire, mergeOperatingContextFromClient, type QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { diagnose } from '@/lib/dsm-engine'
import { runUnifiedTreatmentPipelineFromDiagnosis } from '@/lib/diagnostic/unified-pipeline'
import { insertDiagnostic } from '@/lib/data'
import { revalidatePath } from 'next/cache'
import { isValidUuid } from '@/lib/validation'

export async function savePlanFromQuestionnaire(clientId: string, clientName: string, answers: QuestionnaireAnswer): Promise<{ ok: boolean; error?: string }> {
  if (!isValidUuid(clientId)) return { ok: false, error: 'מזהה לקוח לא חוקי' }
  const supabase = await createClient()

  const { data: clientRow } = await supabase
    .from('clients')
    .select('operating_context')
    .eq('id', clientId)
    .single()
  const merged = mergeOperatingContextFromClient(
    answers,
    clientRow as { operating_context?: string | null } | null
  )

  let planResult: ReturnType<typeof buildPlanFromQuestionnaire>
  let dsmDiagnosis: ReturnType<typeof diagnose>
  try {
    planResult = buildPlanFromQuestionnaire(clientName, merged)
    dsmDiagnosis = diagnose(merged)
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

  const unified = runUnifiedTreatmentPipelineFromDiagnosis(dsmDiagnosis, merged)
  const questionnaire_response = {
    ...(merged as unknown as Record<string, unknown>),
    unified_action_plan_snapshot: {
      version: unified.pipelineVersion,
      generated_at: new Date().toISOString(),
      narrative_primary_he: unified.narrative_primary_he,
      primary_type: unified.orgPathology.primaryType,
      cs_amplifier: unified.orgPathology.csAmplifier,
      intervention_ids: unified.items.map((i) => i.interventionId),
      items: unified.items,
    },
  }

  const upsertPayload: ClientBusinessPlanUpsert = {
    client_id: clientId,
    status: 'active',
    title,
    questionnaire_response,
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
    await insertDiagnostic(clientId, merged as unknown as Record<string, unknown>, dsmSummary)
  } catch (e) {
    console.error('[savePlanFromQuestionnaire] insertDiagnostic failed', e)
  }

  revalidatePath(`/clients/${clientId}`)
  revalidatePath(`/clients/${clientId}/plan`)
  return { ok: true }
}
