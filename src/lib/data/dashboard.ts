import { createClient } from '@/lib/supabase/server'
import type { Client, Sprint, Task, Financial } from '@/types/database'

export type DashboardData = {
  clients: Client[]
  activeClients: Client[]
  sprints: (Sprint & { clients: { name: string; company: string | null } | null })[]
  activeSprints: (Sprint & { clients: { name: string; company: string | null } | null })[]
  openTasks: number
  totalLatency: number
  revenueThisMonth: number
  totalRevenue: number
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const [clientsRes, sprintsRes, tasksRes, financialsRes] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('sprints').select('*, clients(name, company)').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').neq('status', 'done'),
    supabase.from('financials').select('revenue, period_month').order('period_month', { ascending: false }),
  ])

  if (clientsRes.error) console.error('[data/dashboard] clients', clientsRes.error.message)
  if (sprintsRes.error) console.error('[data/dashboard] sprints', sprintsRes.error.message)
  if (tasksRes.error) console.error('[data/dashboard] tasks', tasksRes.error.message)
  if (financialsRes.error) console.error('[data/dashboard] financials', financialsRes.error.message)

  const clients = (clientsRes.data ?? []) as Client[]
  const sprints = (sprintsRes.data ?? []) as (Sprint & { clients: { name: string; company: string | null } | null })[]
  const tasks = (tasksRes.data ?? []) as Task[]
  const financials = financialsRes.data ?? []

  const activeClients = clients.filter((c: Client) => c.status === 'active' || c.status === 'volunteer')
  const totalLatency = activeClients.reduce((sum: number, c: Client) => sum + (c.decision_latency_hours ?? 0), 0)
  const activeSprints = sprints.filter((s: Sprint & { status: string }) => s.status === 'active')
  const openTasks = tasks.length

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const revenueThisMonth = financials
    .filter((f: { period_month: string }) => f.period_month.startsWith(thisMonth))
    .reduce((sum: number, f: { revenue: number }) => sum + (f.revenue ?? 0), 0)
  const totalRevenue = financials.reduce((sum: number, f: { revenue: number }) => sum + (f.revenue ?? 0), 0)

  return {
    clients,
    activeClients,
    sprints,
    activeSprints,
    openTasks,
    totalLatency,
    revenueThisMonth,
    totalRevenue,
  }
}
