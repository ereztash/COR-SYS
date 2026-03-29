import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Client, ClientBusinessPlan, ClientOperatingContext, ClientStatus } from '@/types/database'

/** שורה מצומצמת לסטטיסטיקות — PostgREST לפעמים מסיק `never` ל-select חלקי */
type ClientStatsRow = Pick<Client, 'id' | 'status'> & {
  operating_context?: ClientOperatingContext | null
}

type PlanStatsRow = Pick<ClientBusinessPlan, 'client_id' | 'recommended_option_id'>

const STATUS_LIST: ClientStatus[] = ['active', 'prospect', 'churned', 'paused', 'volunteer']

/** סטטיסטיקות מצטברות לדשבורד לקוחות */
export type ClientPortfolioStats = {
  total: number
  byStatus: Record<ClientStatus, number>
  operating: { team: number; one_man_show: number; unset: number }
  clientsWithPlan: number
  /** ספירה לפי recommended_option_id מתוכניות שמורות */
  recommendations: Record<string, number>
}

export const getClientPortfolioStats = cache(async function getClientPortfolioStats(): Promise<ClientPortfolioStats | null> {
  const supabase = await createClient()
  const { data: clients, error: cErr } = await supabase
    .from('clients')
    .select('id, status, operating_context')
    .order('created_at', { ascending: false })
  if (cErr) {
    console.error('[data/clients] getClientPortfolioStats', cErr.message)
    return null
  }
  const { data: plans, error: pErr } = await supabase
    .from('client_business_plans')
    .select('client_id, recommended_option_id')
  if (pErr) console.error('[data/clients] getClientPortfolioStats plans', pErr.message)

  const byStatus = Object.fromEntries(STATUS_LIST.map((s) => [s, 0])) as Record<ClientStatus, number>
  const operating = { team: 0, one_man_show: 0, unset: 0 }
  const rows = (clients ?? []) as ClientStatsRow[]
  const clientIds = new Set(rows.map((c) => c.id))

  for (const c of rows) {
    const st = c.status as ClientStatus
    if (st in byStatus) byStatus[st]++
    const oc = c.operating_context
    if (oc === 'one_man_show') operating.one_man_show++
    else if (oc === 'team') operating.team++
    else operating.unset++
  }

  const recommendations: Record<string, number> = {}
  const withPlanSet = new Set<string>()
  for (const p of (plans ?? []) as PlanStatsRow[]) {
    const cid = p.client_id as string | null
    if (cid && clientIds.has(cid)) {
      withPlanSet.add(cid)
      const opt = (p.recommended_option_id as string | null) ?? '—'
      recommendations[opt] = (recommendations[opt] ?? 0) + 1
    }
  }

  return {
    total: rows.length,
    byStatus,
    operating,
    clientsWithPlan: withPlanSet.size,
    recommendations,
  }
})

export const getClients = cache(async function getClients(): Promise<Client[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('[data/clients] getClients', error.message)
    return []
  }
  return data ?? []
})

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
