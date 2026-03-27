import { NextResponse } from 'next/server'
import { claimDueAgentJobs, finalizeAgentJob, processAgentJob } from '@/lib/agents/jobs'
import { verifyCronRequest } from '@/lib/api/verify-cron'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

async function handleCronRequest(request: Request) {
  const denied = verifyCronRequest(request)
  if (denied) return denied

  let supabase
  try {
    supabase = createServiceRoleClient()
  } catch {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 503 }
    )
  }

  const jobs = await claimDueAgentJobs(supabase, 5)
  const processed: Array<{ jobId: string; status: string }> = []

  for (const job of jobs) {
    try {
      const result = await processAgentJob(job, supabase)
      await finalizeAgentJob(supabase, job.job_id, 'completed', result)
      processed.push({ jobId: job.job_id, status: 'completed' })
    } catch (error) {
      await finalizeAgentJob(supabase, job.job_id, 'failed', {
        error: error instanceof Error ? error.message : 'unknown',
      })
      processed.push({ jobId: job.job_id, status: 'failed' })
    }
  }

  return NextResponse.json({ processed })
}

export async function POST(request: Request) {
  return handleCronRequest(request)
}

/** Vercel Cron invokes scheduled jobs with HTTP GET (same auth as POST). */
export async function GET(request: Request) {
  return handleCronRequest(request)
}
