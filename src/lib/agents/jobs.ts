import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { AgentJobRow } from '@/types/database'
import { computeGammaMetrics } from './gamma'

type DbClient = SupabaseClient<Database>

export async function claimDueAgentJobs(supabase: DbClient, limit = 5): Promise<AgentJobRow[]> {
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('agent_jobs')
    .select('*')
    .in('status', ['pending', 'failed'])
    .or(`not_before.is.null,not_before.lte.${now}`)
    .order('created_at', { ascending: true })
    .limit(limit)

  const jobs = ((data ?? []) as AgentJobRow[]).filter(
    (job) => !(job.approval_required && !job.approved_at)
  )

  for (const job of jobs) {
    await supabase
      .from('agent_jobs')
      // @ts-expect-error Supabase SSR generic infers update as never for JSONB-backed tables
      .update({
        status: 'claimed',
        started_at: now,
        attempts: (job.attempts ?? 0) + 1,
      })
      .eq('job_id', job.job_id)
  }

  return jobs
}

export async function processAgentJob(job: AgentJobRow, supabase: DbClient): Promise<Record<string, unknown>> {
  if (job.job_type === 'gamma-monitor' || job.job_type === 'feedback-eval') {
    if (!job.client_id) throw new Error('client_id required')
    return (await computeGammaMetrics({ clientId: job.client_id, persist: true, supabase })) as unknown as Record<
      string,
      unknown
    >
  }

  if (job.job_type === 'network-refresh') {
    return { status: 'skipped', reason: 'network_refresh_is_request_driven' }
  }

  return { status: 'skipped', reason: 'delta_refresh_is_ui_driven' }
}

export async function finalizeAgentJob(
  supabase: DbClient,
  jobId: string,
  status: 'completed' | 'failed',
  result: Record<string, unknown>
) {
  await supabase
    .from('agent_jobs')
    // @ts-expect-error Supabase SSR generic infers update as never for JSONB-backed tables
    .update({
      status,
      result,
      last_error: status === 'failed' ? String(result.error ?? 'unknown') : null,
      finished_at: new Date().toISOString(),
    })
    .eq('job_id', jobId)
}
