import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findSimilarCases, getRecommendations } from '@/lib/cbr'
import { simulateRecommendation } from '@/lib/agents/beta'
import type { DsmDiagnosticSnapshot, OrganizationContext } from '@/types/database'
import { getAgentMemory, hashAgentInput, setAgentMemory } from '@/lib/agents/memory'

interface BetaRequestBody {
  snapshotId: string
  interventionTypes?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BetaRequestBody
    const useCache = request.nextUrl.searchParams.get('use_cache') !== '0'
    const ttlMinutes = parseInt(request.nextUrl.searchParams.get('ttl_minutes') ?? '60', 10)
    const inputHash = hashAgentInput(body)
    if (useCache) {
      const cached = await getAgentMemory<Record<string, unknown>>('beta', 'snapshot', body.snapshotId, inputHash)
      if (cached) return NextResponse.json({ ...cached, cached: true })
    }

    if (!body.snapshotId) {
      return NextResponse.json({ error: 'snapshotId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: snapshotRaw } = await supabase
      .from('dsm_diagnostic_snapshots')
      .select('*')
      .eq('snapshot_id', body.snapshotId)
      .single()

    const snapshot = (snapshotRaw ?? null) as DsmDiagnosticSnapshot | null
    if (!snapshot) {
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 })
    }

    const { data: orgRaw } = await supabase
      .from('organizations_context')
      .select('*')
      .eq('org_id', snapshot.org_id)
      .single()

    const org = (orgRaw ?? null) as OrganizationContext | null
    if (!org) {
      return NextResponse.json({ error: 'Organization context not found' }, { status: 404 })
    }

    const rankedCases = await findSimilarCases({ snapshot, org, top_k: 8 })
    const { recommendations } = getRecommendations({ rankedCases, snapshot })
    const targets = body.interventionTypes?.length
      ? recommendations.filter((recommendation) => body.interventionTypes?.includes(recommendation.intervention_type))
      : recommendations.slice(0, 3)

    const response = {
      snapshotId: body.snapshotId,
      simulations: targets.map((recommendation) =>
        simulateRecommendation({
          interventionType: recommendation.intervention_type,
          recommendation,
          rankedCases,
          dailyLossEstimate: recommendation.daily_loss_estimate ?? 2000,
          seed: `${body.snapshotId}:${recommendation.intervention_type}`,
        })
      ),
    }
    await setAgentMemory('beta', 'snapshot', body.snapshotId, inputHash, response, ttlMinutes, 0.8)
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Beta simulation failed', detail: error instanceof Error ? error.message : 'unknown' },
      { status: 500 }
    )
  }
}
