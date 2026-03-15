'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidUuid, isSprintStatus } from '@/lib/validation'

type SprintPayload = {
  client_id: string
  sprint_number: number
  title: string
  start_date: string
  end_date: string
  status: string
  goal: string | null
}

export async function createSprintAction(payload: SprintPayload): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!isValidUuid(payload.client_id)) return { ok: false, error: 'מזהה לקוח לא חוקי' }
  if (!isSprintStatus(payload.status)) return { ok: false, error: 'סטטוס ספרינט לא חוקי' }
  const supabase = await createClient()
  // @ts-expect-error Supabase inferred types are strict; payload matches sprints Insert shape
  const { data, error } = await supabase.from('sprints').insert(payload).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/sprints')
  revalidatePath(`/clients/${payload.client_id}`)
  return { ok: true, id: (data as { id: string } | null)?.id }
}

export async function updateSprintAction(id: string, clientId: string, payload: Partial<SprintPayload>): Promise<{ ok: boolean; error?: string }> {
  if (!isValidUuid(id) || !isValidUuid(clientId)) return { ok: false, error: 'מזהה לא חוקי' }
  if (payload.status != null && !isSprintStatus(payload.status)) return { ok: false, error: 'סטטוס ספרינט לא חוקי' }
  const supabase = await createClient()
  // @ts-expect-error Supabase inferred types are strict; payload matches sprints Update shape
  const { error } = await supabase.from('sprints').update(payload).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/sprints')
  revalidatePath(`/clients/${clientId}`)
  revalidatePath(`/clients/${clientId}/sprints/${id}`)
  return { ok: true }
}
