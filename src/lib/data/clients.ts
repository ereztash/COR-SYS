import { createClient } from '@/lib/supabase/server'
import type { Client } from '@/types/database'

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('[data/clients] getClients', error.message)
    return []
  }
  return data ?? []
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
  if (error) {
    console.error('[data/clients] getClientById', id, error.message)
    return null
  }
  return data
}

export type ClientWithPlan = {
  client: Client
  plan: { id: string; title: string | null; summary: string | null; recommended_option_id: string | null } | null
}

export async function getClientWithPlan(clientId: string): Promise<ClientWithPlan | null> {
  const supabase = await createClient()
  const [clientRes, planRes] = await Promise.all([
    supabase.from('clients').select('*').eq('id', clientId).single(),
    supabase.from('client_business_plans').select('id, title, summary, recommended_option_id').eq('client_id', clientId).maybeSingle(),
  ])
  if (clientRes.error) {
    console.error('[data/clients] getClientWithPlan', clientId, clientRes.error.message)
    return null
  }
  const clientData = clientRes.data
  if (!clientData) return null
  let plan: ClientWithPlan['plan'] = null
  if (!planRes.error && planRes.data) plan = planRes.data as ClientWithPlan['plan']
  if (planRes.error) console.error('[data/clients] getClientWithPlan plan', clientId, planRes.error.message)
  return { client: clientData as Client, plan }
}
