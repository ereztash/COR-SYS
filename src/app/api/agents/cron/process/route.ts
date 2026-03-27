import { NextResponse } from 'next/server'
import { claimDueAgentJobs, finalizeAgentJob, processAgentJob } from '@/lib/agents/jobs'

export async function POST() {
  const jobs = await claimDueAgentJobs(5)
  const processed: Array<{ jobId: string; status: string }> = []

  for (const job of jobs) {
    try {
      const result = await processAgentJob(job)
      await finalizeAgentJob(job.job_id, 'completed', result)
      processed.push({ jobId: job.job_id, status: 'completed' })
    } catch (error) {
      await finalizeAgentJob(job.job_id, 'failed', {
        error: error instanceof Error ? error.message : 'unknown',
      })
      processed.push({ jobId: job.job_id, status: 'failed' })
    }
  }

  return NextResponse.json({ processed })
}
