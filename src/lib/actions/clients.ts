'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidUuid, isClientStatus, isClientOperatingContext, toFiniteNumber } from '@/lib/validation'

type ClientPayload = {
  name: string
  company: string | null
  industry: string | null
  status: string
  operating_context: string | null
  hourly_rate: number | null
  monthly_retainer: number | null
  decision_latency_hours: number | null
  engagement_start: string | null
  notes: string | null
}

export async function createClientAction(payload: ClientPayload): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!isClientStatus(payload.status)) return { ok: false, error: 'סטטוס לא חוקי' }
  if (payload.operating_context != null && payload.operating_context !== '' && !isClientOperatingContext(payload.operating_context)) {
    return { ok: false, error: 'הקשר תפעולי לא חוקי' }
  }
  const safePayload = {
    ...payload,
    operating_context:
      payload.operating_context && isClientOperatingContext(payload.operating_context)
        ? payload.operating_context
        : null,
    hourly_rate: toFiniteNumber(payload.hourly_rate) ?? null,
    monthly_retainer: toFiniteNumber(payload.monthly_retainer) ?? null,
    decision_latency_hours: toFiniteNumber(payload.decision_latency_hours) ?? null,
  }
  const supabase = await createClient()
  // @ts-expect-error Supabase inferred types are strict; payload matches clients Insert shape
  const { data, error } = await supabase.from('clients').insert(safePayload).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/clients')
  return { ok: true, id: (data as { id: string } | null)?.id }
}

export async function updateClientAction(id: string, payload: Partial<ClientPayload>): Promise<{ ok: boolean; error?: string }> {
  if (!isValidUuid(id)) return { ok: false, error: 'מזהה לא חוקי' }
  if (payload.status != null && !isClientStatus(payload.status)) return { ok: false, error: 'סטטוס לא חוקי' }
  if (
    payload.operating_context != null &&
    payload.operating_context !== '' &&
    !isClientOperatingContext(payload.operating_context)
  ) {
    return { ok: false, error: 'הקשר תפעולי לא חוקי' }
  }
  const safePayload = { ...payload }
  if (payload.operating_context !== undefined) {
    safePayload.operating_context =
      payload.operating_context && isClientOperatingContext(payload.operating_context)
        ? payload.operating_context
        : null
  }
  if (payload.hourly_rate !== undefined) safePayload.hourly_rate = toFiniteNumber(payload.hourly_rate) ?? null
  if (payload.monthly_retainer !== undefined) safePayload.monthly_retainer = toFiniteNumber(payload.monthly_retainer) ?? null
  if (payload.decision_latency_hours !== undefined) safePayload.decision_latency_hours = toFiniteNumber(payload.decision_latency_hours) ?? null
  const supabase = await createClient()
  // @ts-expect-error Supabase inferred types are strict; payload matches clients Update shape
  const { error } = await supabase.from('clients').update(safePayload).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return { ok: true }
}
