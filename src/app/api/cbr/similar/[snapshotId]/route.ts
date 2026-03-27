/**
 * GET /api/cbr/similar/[snapshotId]
 *
 * Returns Top-K similar organizational cases for a given DSM snapshot.
 * Used by the Recommendation Panel and for debugging.
 *
 * Query params:
 *   top_k  (optional, default 5) - number of results
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/api/require-user'
import type { DsmDiagnosticSnapshot, OrganizationContext } from '@/types/database'
import { findSimilarCases } from '@/lib/cbr'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ snapshotId: string }> }
) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response

  const { snapshotId } = await params
  const topK = parseInt(request.nextUrl.searchParams.get('top_k') ?? '5', 10)

  const { supabase } = auth

  // 1. Load the snapshot
  const { data: snapshotRaw, error: snapErr } = await supabase
    .from('dsm_diagnostic_snapshots')
    .select('*')
    .eq('snapshot_id', snapshotId)
    .single()

  if (snapErr || !snapshotRaw) {
    return NextResponse.json(
      { error: 'Snapshot not found', detail: snapErr?.message },
      { status: 404 }
    )
  }

  const snapshot = snapshotRaw as unknown as DsmDiagnosticSnapshot

  // 2. Load the org context
  const { data: orgRaw, error: orgErr } = await supabase
    .from('organizations_context')
    .select('*')
    .eq('org_id', snapshot.org_id)
    .single()

  if (orgErr || !orgRaw) {
    return NextResponse.json(
      { error: 'Organization context not found', detail: orgErr?.message },
      { status: 404 }
    )
  }

  const org = orgRaw as unknown as OrganizationContext

  // 3. Check for OpenAI key
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: 'OPENAI_API_KEY not configured',
        hint: 'Add OPENAI_API_KEY to .env.local to enable CBR similarity search',
      },
      { status: 503 }
    )
  }

  // 4. Run CBR similarity search
  try {
    const results = await findSimilarCases({ snapshot, org, top_k: topK })

    return NextResponse.json({
      snapshot_id: snapshotId,
      org_industry: org.industry_sector,
      severity: snapshot.severity_profile,
      total_results: results.length,
      results,
      cold_start: results.length === 0,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'CBR search failed', detail: message }, { status: 500 })
  }
}
