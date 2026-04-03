'use server'

import { createClient } from '@/lib/supabase/server'
import type { ClientAssessmentInsert, ClientAssessmentUpdate } from '@/types/database'
import { mergeOperatingContextFromClient, type QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { revalidatePath } from 'next/cache'
import { isValidUuid } from '@/lib/validation'
import { getAssessmentByToken, getClientById, insertDiagnostic } from '@/lib/data'
import { buildPlanFromQuestionnaire } from '@/lib/corsys-questionnaire'
import { diagnose } from '@/lib/dsm-engine'
import { sendAssessmentCompletedEmail } from '@/lib/email'

/** \u05D9\u05D5\u05E2\u05E5 \u05DE\u05D0\u05D5\u05DE\u05EA: \u05D9\u05D5\u05E6\u05E8 \u05DC\u05D9\u05E0\u05E7 \u05D4\u05E2\u05E8\u05DB\u05D4 \u05D5\u05DE\u05D5\u05D7\u05D6\u05E8 URL */
export async function createAssessment(clientId: string | null): Promise<{ ok: boolean; url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: '\u05E0\u05D3\u05E8\u05E9\u05EA \u05D4\u05EA\u05D7\u05D1\u05E8\u05D5\u05EA' }

  const insertPayload: ClientAssessmentInsert = {
    client_id: clientId && isValidUuid(clientId) ? clientId : null,
    status: 'pending',
  }
  const { data, error } = await supabase
    .from('client_assessments')
    // @ts-expect-error Postgrest infers insert as never for tables with jsonb
    .insert(insertPayload)
    .select('token')
    .single()

  if (error) return { ok: false, error: error.message }
  const token = (data as { token?: string } | null)?.token
  if (!token) return { ok: false, error: '\u05DC\u05D0 \u05E0\u05D5\u05E6\u05E8 token' }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const url = origin ? `${origin}/assess/${token}` : `/assess/${token}`
  revalidatePath('/clients')
  return { ok: true, url }
}

/** \u05E9\u05DE\u05D9\u05E8\u05EA \u05EA\u05E9\u05D5\u05D1\u05D5\u05EA \u05D4\u05E2\u05E8\u05DB\u05D4 (\u05E7\u05E8\u05D9\u05D0\u05D4 \u05DE\u05DC\u05D9\u05E0\u05E7 \u05E6\u05D9\u05D1\u05D5\u05E8\u05D9 — \u05D0\u05E0\u05D5\u05E0\u05D9\u05DE\u05D9 \u05D9\u05DB\u05D5\u05DC \u05DC\u05E2\u05D3\u05DB\u05DF). \u05D0\u05D7\u05E8\u05D9 \u05D4\u05E6\u05DC\u05D7\u05D4 — \u05E9\u05D5\u05DC\u05D7 \u05DE\u05D9\u05D9\u05DC \u05D4\u05EA\u05E8\u05D0\u05D4 \u05DC\u05D9\u05D5\u05E2\u05E5. */
export async function saveAssessmentAnswers(
  token: string,
  answers: QuestionnaireAnswer
): Promise<{ ok: boolean; error?: string }> {
  if (!token) return { ok: false, error: '\u05D7\u05E1\u05E8 token' }
  const supabase = await createClient()

  const assessmentPre = await getAssessmentByToken(token)
  const clientForMerge = assessmentPre?.client_id
    ? await getClientById(assessmentPre.client_id)
    : null
  const merged = mergeOperatingContextFromClient(answers, clientForMerge)

  const updatePayload: ClientAssessmentUpdate = {
    answers: merged as unknown as Record<string, unknown>,
    status: 'completed',
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase
    .from('client_assessments')
    // @ts-expect-error Postgrest infers update as never for tables with jsonb
    .update(updatePayload)
    .eq('token', token)
  if (error) return { ok: false, error: error.message }

  // DSM + diagnostic — wrapped so a computation failure never blocks the client
  let dsmDiagnosis: ReturnType<typeof diagnose> | null = null
  try {
    dsmDiagnosis = diagnose(merged)
  } catch (e) {
    console.error('[saveAssessmentAnswers] diagnose failed', e)
  }

  const assessment = await getAssessmentByToken(token)

  if (dsmDiagnosis && assessment?.client_id) {
    try {
      const clientName = (await getClientById(assessment.client_id))?.name ?? '\u05DC\u05E7\u05D5\u05D7'
      const planResult = buildPlanFromQuestionnaire(clientName, merged)
      const scoreMap = Object.fromEntries(dsmDiagnosis.pathologies.map((p) => [p.code, p.score]))
      await insertDiagnostic(assessment.client_id, merged as unknown as Record<string, unknown>, {
        drScore: scoreMap.DR ?? 0,
        ndScore: scoreMap.ND ?? 0,
        ucScore: scoreMap.UC ?? 0,
        severityProfile: dsmDiagnosis.severityProfile,
        entropyScore: planResult.entropyScore,
      })
    } catch (e) {
      console.error('[saveAssessmentAnswers] insertDiagnostic failed', e)
    }
  }

  const to = process.env.RESEND_TO
  if (to && dsmDiagnosis) {
    try {
      const clientName = assessment?.client_id
        ? (await getClientById(assessment.client_id))?.name ?? '\u05DC\u05E7\u05D5\u05D7'
        : '\u05DC\u05E7\u05D5\u05D7 \u05E2\u05E6\u05DE\u05D0\u05D9'
      const base = process.env.NEXT_PUBLIC_APP_URL ?? ''
      const resultsUrl = base ? `${base}/assess/${token}/results` : `/assess/${token}/results`
      await sendAssessmentCompletedEmail(to, {
        clientName,
        resultsUrl,
        dsmCodes: dsmDiagnosis.codes,
      })
    } catch (e) {
      console.error('[saveAssessmentAnswers] sendAssessmentCompletedEmail failed', e)
    }
  }

  return { ok: true }
}
