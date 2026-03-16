'use server'

import { createClient } from '@/lib/supabase/server'
import type { QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { revalidatePath } from 'next/cache'
import { isValidUuid } from '@/lib/validation'
import { getAssessmentByToken, getClientById } from '@/lib/data'
import { diagnose } from '@/lib/dsm-engine'
import { sendAssessmentCompletedEmail } from '@/lib/email'

/** יועץ מאומת: יוצר לינק הערכה ומוחזר URL */
export async function createAssessment(clientId: string | null): Promise<{ ok: boolean; url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'נדרשת התחברות' }

  const { data, error } = await supabase
    .from('client_assessments')
    .insert({
      client_id: clientId && isValidUuid(clientId) ? clientId : null,
      status: 'pending',
    })
    .select('token')
    .single()

  if (error) return { ok: false, error: error.message }
  if (!data?.token) return { ok: false, error: 'לא נוצר token' }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const url = origin ? `${origin}/assess/${data.token}` : `/assess/${data.token}`
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
  const { error } = await supabase
    .from('client_assessments')
    .update({
      answers: answers as unknown as Record<string, unknown>,
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('token', token)
  if (error) return { ok: false, error: error.message }

  const to = process.env.RESEND_TO
  if (to) {
    const assessment = await getAssessmentByToken(token)
    const clientName = assessment?.client_id
      ? (await getClientById(assessment.client_id))?.name ?? 'לקוח'
      : 'לקוח עצמאי'
    const base = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const resultsUrl = base ? `${base}/assess/${token}/results` : `/assess/${token}/results`
    const dsmDiagnosis = diagnose(answers)
    await sendAssessmentCompletedEmail(to, {
      clientName,
      resultsUrl,
      dsmCodes: dsmDiagnosis.codes,
    })
  }

  return { ok: true }
}
