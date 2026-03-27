import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/api/require-user'
import { computeGammaMetrics } from '@/lib/agents/gamma'
import { getAgentMemory, hashAgentInput, setAgentMemory } from '@/lib/agents/memory'

export async function GET(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response

  try {
    const clientId = request.nextUrl.searchParams.get('clientId')
    const persist = request.nextUrl.searchParams.get('persist') === '1'
    const useCache = request.nextUrl.searchParams.get('use_cache') !== '0'
    const ttlMinutes = parseInt(request.nextUrl.searchParams.get('ttl_minutes') ?? '30', 10)

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
    }

    const inputHash = hashAgentInput({ clientId, persist })
    if (useCache) {
      const cached = await getAgentMemory<Record<string, unknown>>('gamma', 'client', clientId, inputHash)
      if (cached) return NextResponse.json({ ...cached, cached: true })
    }

    const result = await computeGammaMetrics({ clientId, persist })
    await setAgentMemory('gamma', 'client', clientId, inputHash, result as unknown as Record<string, unknown>, ttlMinutes, 0.75)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Gamma metrics failed', detail: error instanceof Error ? error.message : 'unknown' },
      { status: 500 }
    )
  }
}
