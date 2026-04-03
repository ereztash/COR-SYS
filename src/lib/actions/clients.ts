'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidUuid, isClientStatus, isClientOperatingContext, toFiniteNumber } from '@/lib/validation'

/** \u05E9\u05D2\u05D9\u05D0\u05EA PostgREST/PG \u05DB\u05E9\u05BEoperating_context \u05DC\u05D0 \u05D1\u05D8\u05D1\u05DC\u05D4 \u05D0\u05D5 \u05DC\u05D0 \u05D1\u05E7\u05D0\u05E9 \u05D4\u05E1\u05DB\u05DE\u05D4 */
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
  if (!isClientStatus(payload.status)) return { ok: false, error: '\u05E1\u05D8\u05D8\u05D5\u05E1 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
  if (payload.operating_context != null && payload.operating_context !== '' && !isClientOperatingContext(payload.operating_context)) {
    return { ok: false, error: '\u05D4\u05E7\u05E9\u05E8 \u05EA\u05E4\u05E2\u05D5\u05DC\u05D9 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
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
          '\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05E9\u05DE\u05D5\u05E8 "\u05D4\u05E7\u05E9\u05E8 \u05E9\u05D0\u05DC\u05D5\u05E0\u05D9\u05DD": \u05D5\u05D3\u05D0 \u05E9\u05D4\u05E8\u05E6\u05EA \u05D1-Supabase \u05D0\u05EA \u05D4\u05E7\u05D5\u05D1\u05E5 supabase-migration-client-operating-context.sql (\u05DB\u05D5\u05DC\u05DC NOTIFY \u05D1\u05E1\u05D5\u05E3), \u05D0\u05D5 \u05D4\u05DE\u05EA\u05DF \u05D3\u05E7\u05D4 \u05DC\u05E8\u05E2\u05E0\u05D5\u05DF \u05E1\u05DB\u05DE\u05D4.',
      }
    }
    // @ts-expect-error row shape
    const retry = await supabase.from('clients').insert(omitOperatingContext(safePayload)).select('id').single()
    data = retry.data
    error = retry.error
  }
  if (error) return { ok: false, error: error.message }
  revalidatePath('/', 'layout')
  revalidatePath('/clients', 'layout')
  return { ok: true, id: (data as { id: string } | null)?.id }
}

export async function updateClientAction(id: string, payload: Partial<ClientPayload>): Promise<{ ok: boolean; error?: string }> {
  if (!isValidUuid(id)) return { ok: false, error: '\u05DE\u05D6\u05D4\u05D4 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
  if (payload.status != null && !isClientStatus(payload.status)) return { ok: false, error: '\u05E1\u05D8\u05D8\u05D5\u05E1 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
  if (
    payload.operating_context != null &&
    payload.operating_context !== '' &&
    !isClientOperatingContext(payload.operating_context)
  ) {
    return { ok: false, error: '\u05D4\u05E7\u05E9\u05E8 \u05EA\u05E4\u05E2\u05D5\u05DC\u05D9 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9' }
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
          '\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05E9\u05DE\u05D5\u05E8 "\u05D4\u05E7\u05E9\u05E8 \u05E9\u05D0\u05DC\u05D5\u05E0\u05D9\u05DD": \u05D4\u05E8\u05E5 \u05D0\u05EA supabase-migration-client-operating-context.sql \u05D1-SQL Editor (\u05D0\u05D5 \u05E8\u05E2\u05E0\u05D5\u05DF \u05E1\u05DB\u05DE\u05D4 \u05D1-API).',
      }
    }
    // @ts-expect-error row shape
    const retry = await supabase.from('clients').update(omitOperatingContext(body)).eq('id', id)
    error = retry.error
  }
  if (error) return { ok: false, error: error.message }
  revalidatePath('/', 'layout')
  revalidatePath('/clients', 'layout')
  revalidatePath(`/clients/${id}`, 'layout')
  revalidatePath(`/clients/${id}/plan`, 'layout')
  revalidatePath(`/clients/${id}/edit`, 'page')
  return { ok: true }
}
