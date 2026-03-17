'use server'

import { createClient } from '@/lib/supabase/server'
import type { ClientAssessmentInsert, ClientAssessmentUpdate } from '@/types/database'
import type { QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { revalidatePath } from 'next/cache'
import { isValidUuid } from '@/lib/validation'
import { getAssessmentByToken, getClientById, insertDiagnostic } from '@/lib/data'
import { buildPlanFromQuestionnaire } from '@/lib/corsys-questionnaire'
import { diagnose } from '@/lib/dsm-engine'
import { sendAssessmentCompletedEmail } from '@/lib/email'

/** יועץ מאומת: יוצר לינק הערכה ומוחזר URL */
export async function createAssessment(clientId: string | null): Promise<{ ok: boolean; url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'נדרשת התחברות' }

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
  if (!token) return { ok: false, error: 'לא נוצר token' }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const url = origin ? `${origin}/assess/${token}` : `/assess/${token}`
  revalidatePath('/clients')
  return { ok: true, url }
}

/** שמירת תשובות הערכה (קריאה מלינק ציבורי — אנונימי יכול לעדכן). אחרי הצלחה — שולח מייל התראה ליועץ. */
export async function saveAssessmentAnswers(
  token: string,
  answers: QuestionnaireAnswer
): Promise<{ ok: boolean; error?: string }> {
  if (!token) return { ok: false, error: 'חסר token' }
  const supabase = await createClient()
  const updatePayload: ClientAssessmentUpdate = {
    answers: answers as unknown as Record<string, unknown>,
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
    dsmDiagnosis = diagnose(answers)
  } catch (e) {
    console.error('[saveAssessmentAnswers] diagnose failed', e)
  }

  const assessment = await getAssessmentByToken(token)

  if (dsmDiagnosis && assessment?.client_id) {
    try {
      const clientName = (await getClientById(assessment.client_id))?.name ?? 'לקוח'
      const planResult = buildPlanFromQuestionnaire(clientName, answers)
      const scoreMap = Object.fromEntries(dsmDiagnosis.pathologies.map((p) => [p.code, p.score]))
      await insertDiagnostic(assessment.client_id, answers as unknown as Record<string, unknown>, {
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
        ? (await getClientById(assessment.client_id))?.name ?? 'לקוח'
        : 'לקוח עצמאי'
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
