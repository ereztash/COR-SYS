import { createClient } from '@/lib/supabase/server'
import type { ClientAssessment } from '@/types/database'

export async function getAssessmentByToken(token: string): Promise<ClientAssessment | null> {
  if (!token) return null
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('client_assessments')
    .select('*')
    .eq('token', token)
    .single()
  if (error) {
    console.error('[data/assessments] getAssessmentByToken', token, error.message)
    return null
  }
  return data as ClientAssessment
}
