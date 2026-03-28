import { createClient } from '@/lib/supabase/server'
import type { Client, Sprint, ClientDiagnosticSummary } from '@/types/database'
import type { SeverityProfile } from '@/lib/dsm-engine'

/** Postgres `date` / JSON can surface as unexpected shapes — never throw from dashboard aggregates. */
function periodMonthKey(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

function parseDiagnosticSummary(raw: unknown): ClientDiagnosticSummary | null {
  if (raw == null || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const dr = Number(o.drScore ?? o.dr_score)
  const nd = Number(o.ndScore ?? o.nd_score)
  const uc = Number(o.ucScore ?? o.uc_score)
  const entropy = Number(o.entropyScore ?? o.entropy_score)
  const sp = o.severityProfile ?? o.severity_profile
  if (!Number.isFinite(dr) || !Number.isFinite(nd) || !Number.isFinite(uc)) return null
  if (typeof sp !== 'string' || !sp) return null
  return {
    drScore: dr,
    ndScore: nd,
    ucScore: uc,
    severityProfile: sp as SeverityProfile,
    entropyScore: Number.isFinite(entropy) ? entropy : 0,
  }
}

export type DashboardData = {
  clients: Client[]
  activeClients: Client[]
  sprints: (Sprint & { clients: { name: string; company: string | null } | null })[]
  activeSprints: (Sprint & { clients: { name: string; company: string | null } | null })[]
  openTasks: number
  totalLatency: number
  revenueThisMonth: number
  totalRevenue: number
  portfolioAnalytics: PortfolioAnalytics | null
}

export type PortfolioAnalytics = {
  byProfile: { healthy: number; atRisk: number; critical: number; systemicCollapse: number }
  avgDR: number
  avgND: number
  avgUC: number
  /** null when no client has a score >= 7 on any pathology */
  mostCommonPathology: 'DR' | 'ND' | 'UC' | null
  totalClientsWithDiagnostics: number
}

export function computePortfolioAnalytics(diagnostics: { client_id: string; created_at: string; dsm_summary: unknown }[]): PortfolioAnalytics | null {
  if (diagnostics.length === 0) return null
  const byClient = new Map<string, { created_at: string; dsm_summary: ClientDiagnosticSummary }>()
  for (const d of diagnostics) {
    const summary = parseDiagnosticSummary(d.dsm_summary)
    if (!summary) continue
    const existing = byClient.get(d.client_id)
    if (!existing || d.created_at > existing.created_at) {
      byClient.set(d.client_id, { created_at: d.created_at, dsm_summary: summary })
    }
  }
  const latest = Array.from(byClient.values()).map((v) => v.dsm_summary)
  if (latest.length === 0) return null
  const byProfile = { healthy: 0, atRisk: 0, critical: 0, systemicCollapse: 0 }
  const profileKeyMap: Record<string, keyof typeof byProfile> = {
    healthy: 'healthy',
    'at-risk': 'atRisk',
    critical: 'critical',
    'systemic-collapse': 'systemicCollapse',
  }
  let sumDR = 0
  let sumND = 0
  let sumUC = 0
  const levelCounts = { DR: 0, ND: 0, UC: 0 }
  for (const s of latest) {
    const key = profileKeyMap[s.severityProfile] ?? 'healthy'
    byProfile[key]++
    sumDR += s.drScore
    sumND += s.ndScore
    sumUC += s.ucScore
    if (s.drScore >= 7) levelCounts.DR++
    if (s.ndScore >= 7) levelCounts.ND++
    if (s.ucScore >= 7) levelCounts.UC++
  }
  const n = latest.length
  // Only report a dominant pathology when at least one client has a score >= 7
  const hasDominant = levelCounts.DR > 0 || levelCounts.ND > 0 || levelCounts.UC > 0
  const mostCommon: 'DR' | 'ND' | 'UC' | null = hasDominant
    ? (['DR', 'ND', 'UC'] as const).reduce((a, b) => (levelCounts[a] >= levelCounts[b] ? a : b))
    : null
  return {
    byProfile,
    avgDR: n ? sumDR / n : 0,
    avgND: n ? sumND / n : 0,
    avgUC: n ? sumUC / n : 0,
    mostCommonPathology: mostCommon,
    totalClientsWithDiagnostics: n,
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const [clientsRes, sprintsRes, tasksCountRes, financialsRes, diagnosticsRes] = await Promise.all([
    // Fetch only dashboard-needed columns to reduce payload and parse cost.
    supabase.from('clients').select('id, name, company, status, decision_latency_hours, created_at').order('created_at', { ascending: false }),
    supabase.from('sprints').select('id, title, client_id, status, end_date, created_at, clients(name, company)').order('created_at', { ascending: false }),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).neq('status', 'done'),
    supabase.from('financials').select('revenue, period_month').order('period_month', { ascending: false }),
    supabase.from('client_diagnostics').select('client_id, created_at, dsm_summary').order('created_at', { ascending: false }),
  ])

  if (clientsRes.error) console.error('[data/dashboard] clients', clientsRes.error.message)
  if (sprintsRes.error) console.error('[data/dashboard] sprints', sprintsRes.error.message)
  if (tasksCountRes.error) console.error('[data/dashboard] tasks', tasksCountRes.error.message)
  if (financialsRes.error) console.error('[data/dashboard] financials', financialsRes.error.message)
  if (diagnosticsRes.error) console.error('[data/dashboard] diagnostics', diagnosticsRes.error.message)

  const diagnostics = diagnosticsRes.error ? [] : (diagnosticsRes.data ?? []) as { client_id: string; created_at: string; dsm_summary: unknown }[]

  const clients = (clientsRes.data ?? []) as Client[]
  const sprints = (sprintsRes.data ?? []) as (Sprint & { clients: { name: string; company: string | null } | null })[]
  const tasksCount = tasksCountRes.count ?? 0
  const financials = financialsRes.data ?? []

  const activeClients = clients.filter((c: Client) => c.status === 'active' || c.status === 'volunteer')
  const totalLatency = activeClients.reduce((sum: number, c: Client) => sum + (c.decision_latency_hours ?? 0), 0)
  const activeSprints = sprints.filter((s: Sprint & { status: string }) => s.status === 'active')
  const openTasks = tasksCount

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const revenueThisMonth = financials
    .filter((f: { period_month: unknown }) => periodMonthKey(f.period_month).startsWith(thisMonth))
    .reduce((sum: number, f: { revenue: number }) => sum + (f.revenue ?? 0), 0)
  const totalRevenue = financials.reduce((sum: number, f: { revenue: number }) => sum + (f.revenue ?? 0), 0)

  let portfolioAnalytics: PortfolioAnalytics | null = null
  try {
    portfolioAnalytics = computePortfolioAnalytics(diagnostics)
  } catch (e) {
    console.error('[data/dashboard] portfolioAnalytics', e)
  }

  return {
    clients,
    activeClients,
    sprints,
    activeSprints,
    openTasks,
    totalLatency,
    revenueThisMonth,
    totalRevenue,
    portfolioAnalytics,
  }
}
