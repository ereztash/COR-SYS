'use server'

import { createClient } from '@/lib/supabase/server'
import { buildPlanFromQuestionnaire, type QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { revalidatePath } from 'next/cache'
import { isValidUuid } from '@/lib/validation'

export async function savePlanFromQuestionnaire(clientId: string, clientName: string, answers: QuestionnaireAnswer): Promise<{ ok: boolean; error?: string }> {
  if (!isValidUuid(clientId)) return { ok: false, error: 'מזהה לקוח לא חוקי' }
  const supabase = await createClient()
  const { title, summary, nextSteps, recommendedChannelId, recommendedOptionId } = buildPlanFromQuestionnaire(clientName, answers)

  // @ts-expect-error Supabase inferred types are strict; payload matches client_business_plans upsert shape
  const { error } = await supabase.from('client_business_plans').upsert(
    {
      client_id: clientId,
      status: 'active',
      title,
      questionnaire_response: answers as unknown as Record<string, unknown>,
      recommended_channel_id: recommendedChannelId,
      recommended_option_id: recommendedOptionId,
      summary,
      next_steps: nextSteps,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'client_id' }
  )

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/clients/${clientId}`)
  revalidatePath(`/clients/${clientId}/plan`)
  return { ok: true }
}
