/**
 * GET /api/cbr/metrics
 *
 * Returns live SOTA metrics for the CBR intelligence layer.
 * Used for monitoring retrieval quality, LG coverage, calibration health,
 * and data completeness against defined targets.
 *
 * Response: SotaMetrics (src/lib/cbr/metrics.ts)
 */

import { NextResponse } from 'next/server'
import { computeSotaMetrics } from '@/lib/cbr/metrics'

export async function GET() {
  try {
    const metrics = await computeSotaMetrics()
    return NextResponse.json(metrics)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to compute CBR metrics', detail: message }, { status: 500 })
  }
}
