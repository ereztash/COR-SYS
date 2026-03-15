import { createClient } from '@/lib/supabase/server'
import type { Financial } from '@/types/database'

type FinancialWithClient = Financial & { clients: { name: string; company: string | null } | null }

export async function getFinancials(): Promise<FinancialWithClient[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('financials').select('*, clients(name, company)').order('period_month', { ascending: false })
  if (error) {
    console.error('[data/financials] getFinancials', error.message)
    return []
  }
  return (data ?? []) as FinancialWithClient[]
}

export async function getFinancialsByClient(clientId: string): Promise<Financial[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('financials').select('*').eq('client_id', clientId).order('period_month', { ascending: false })
  if (error) {
    console.error('[data/financials] getFinancialsByClient', clientId, error.message)
    return []
  }
  return data ?? []
}

export async function getClientsForSelect(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('clients').select('id, name').order('name')
  if (error) {
    console.error('[data/financials] getClientsForSelect', error.message)
    return []
  }
  return data ?? []
}
