'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidUuid, isClientStatus, isClientOperatingContext, toFiniteNumber } from '@/lib/validation'

/** שגיאת PostgREST/PG כש־operating_context לא בטבלה או לא בקאש הסכמה */
function isOperatingContextSchemaError(message: string, code?: string): boolean {
  const m = `${message} ${code ?? ''}`.toLowerCase()
  return (
    m.includes('operating_context') ||
    m.includes('schema cache') ||
    (m.includes('could not find') && m.includes('column')) ||
    m.includes('pgrst204')
  )
}

function omitOperatingContext(row: Record<string, unknown>): Record<string, unknown> {
  const { operating_context: _oc, ...rest } = row
  return rest
}

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
  const safePayload: Record<string, unknown> = {
    ...payload,
    operating_context:
      payload.operating_context && isClientOperatingContext(payload.operating_context)
        ? payload.operating_context
        : null,
    hourly_rate: toFiniteNumber(payload.hourly_rate) ?? null,
    monthly_retainer: toFiniteNumber(payload.monthly_retainer) ?? null,
    decision_latency_hours: toFiniteNumber(payload.decision_latency_hours) ?? null,
  }
  if (safePayload.operating_context == null || safePayload.operating_context === '') {
    delete safePayload.operating_context
  }

  const supabase = await createClient()
  // @ts-expect-error row shape
  let { data, error } = await supabase.from('clients').insert(safePayload).select('id').single()
  if (error && isOperatingContextSchemaError(error.message, error.code)) {
    const wanted =
      payload.operating_context && isClientOperatingContext(payload.operating_context)
        ? payload.operating_context
        : null
    if (wanted) {
      return {
        ok: false,
        error:
          'לא ניתן לשמור "הקשר שאלונים": ודא שהרצת ב-Supabase את הקובץ supabase-migration-client-operating-context.sql (כולל NOTIFY בסוף), או המתן דקה לרענון סכמה.',
      }
    }
    // @ts-expect-error row shape
    const retry = await supabase.from('clients').insert(omitOperatingContext(safePayload)).select('id').single()
    data = retry.data
    error = retry.error
  }
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
  const body: Record<string, unknown> = { ...safePayload }

  const supabase = await createClient()
  // @ts-expect-error row shape
  let { error } = await supabase.from('clients').update(body).eq('id', id)
  if (error && isOperatingContextSchemaError(error.message, error.code)) {
    const wanted =
      payload.operating_context !== undefined &&
      payload.operating_context &&
      isClientOperatingContext(payload.operating_context)
        ? payload.operating_context
        : null
    if (wanted) {
      return {
        ok: false,
        error:
          'לא ניתן לשמור "הקשר שאלונים": הרץ את supabase-migration-client-operating-context.sql ב-SQL Editor (או רענון סכמה ב-API).',
      }
    }
    // @ts-expect-error row shape
    const retry = await supabase.from('clients').update(omitOperatingContext(body)).eq('id', id)
    error = retry.error
  }
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return { ok: true }
}
