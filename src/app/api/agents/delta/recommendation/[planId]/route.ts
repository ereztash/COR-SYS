import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api/require-user'
import { buildDeltaPayload } from '@/lib/agents/delta'
import { getAgentMemory, hashAgentInput, setAgentMemory } from '@/lib/agents/memory'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response

  try {
    const { planId } = await params
    const url = new URL(request.url)
    const useCache = url.searchParams.get('use_cache') !== '0'
    const ttlMinutes = parseInt(url.searchParams.get('ttl_minutes') ?? '45', 10)
    const inputHash = hashAgentInput({ planId })

    if (useCache) {
      const cached = await getAgentMemory<Record<string, unknown>>('delta', 'plan', planId, inputHash)
      if (cached) return NextResponse.json({ ...cached, cached: true })
    }

    const result = await buildDeltaPayload(planId)
    await setAgentMemory('delta', 'plan', planId, inputHash, result as unknown as Record<string, unknown>, ttlMinutes, 0.8)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Delta recommendation failed', detail: error instanceof Error ? error.message : 'unknown' },
      { status: 500 }
    )
  }
}
