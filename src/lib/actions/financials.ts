'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidUuid, clampRevenue } from '@/lib/validation'

type FinancialPayload = {
  client_id: string
  period_month: string
  revenue: number
  invoiced?: boolean
  paid_date?: string | null
  notes?: string | null
}

export async function createFinancialAction(payload: FinancialPayload): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!isValidUuid(payload.client_id)) return { ok: false, error: 'מזהה לקוח לא חוקי' }
  const revenue = clampRevenue(Number(payload.revenue) || 0)
  const supabase = await createClient()
  const insert = {
    client_id: payload.client_id,
    period_month: payload.period_month,
    revenue,
    invoiced: payload.invoiced ?? false,
    paid_date: payload.paid_date ?? null,
    notes: payload.notes ?? null,
  }
  // @ts-expect-error Supabase inferred types are strict; insert matches financials Insert shape
  const { data, error } = await supabase.from('financials').insert(insert).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/financials')
  revalidatePath(`/clients/${payload.client_id}`)
  return { ok: true, id: (data as { id: string } | null)?.id }
}
