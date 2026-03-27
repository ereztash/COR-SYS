/**
 * GET /api/cbr/eval
 *
 * Runs the CBR retrieval harness against the synthetic golden set
 * and returns MRR, hit rates, and failure rate.
 *
 * Query params:
 *   top_k (default 5) - number of results per query
 *
 * Response: HarnessReport (src/lib/cbr/retrieval-harness.ts)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/api/require-user'
import { evaluateRetrieval, buildSyntheticGoldenSet } from '@/lib/cbr/retrieval-harness'

export async function GET(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const top_k = parseInt(request.nextUrl.searchParams.get('top_k') ?? '5', 10)

  try {
    const goldenSet = buildSyntheticGoldenSet()
    const report = await evaluateRetrieval(goldenSet, top_k)
    return NextResponse.json(report)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Retrieval evaluation failed', detail: message }, { status: 500 })
  }
}
