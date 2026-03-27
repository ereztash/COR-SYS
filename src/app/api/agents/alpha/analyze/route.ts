import { NextRequest, NextResponse } from 'next/server'
import { analyzeAlpha, type AlphaAnalyzeInput } from '@/lib/agents/alpha'
import { getAgentMemory, hashAgentInput, setAgentMemory } from '@/lib/agents/memory'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AlphaAnalyzeInput
    if (!body?.clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
    }

    const useCache = request.nextUrl.searchParams.get('use_cache') !== '0'
    const ttlMinutes = parseInt(request.nextUrl.searchParams.get('ttl_minutes') ?? '120', 10)
    const inputHash = hashAgentInput(body)

    if (useCache) {
      const cached = await getAgentMemory<Awaited<ReturnType<typeof analyzeAlpha>>>('alpha', 'client', body.clientId, inputHash)
      if (cached) return NextResponse.json({ ...cached, cached: true })
    }

    const result = await analyzeAlpha(body)
    await setAgentMemory('alpha', 'client', body.clientId, inputHash, result as unknown as Record<string, unknown>, ttlMinutes, result.governance.autonomy.confidence)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Alpha analyze failed', detail: error instanceof Error ? error.message : 'unknown' },
      { status: 500 }
    )
  }
}
