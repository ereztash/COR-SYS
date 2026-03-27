import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'

type AgentName = 'alpha' | 'beta' | 'gamma' | 'delta'
type SubjectType = 'client' | 'snapshot' | 'plan'

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
  return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`).join(',')}}`
}

export function hashAgentInput(input: unknown): string {
  return createHash('sha256').update(stableStringify(input)).digest('hex')
}

export async function getAgentMemory<T>(
  agentName: AgentName,
  subjectType: SubjectType,
  subjectId: string,
  inputHash: string
): Promise<T | null> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('agent_memories')
    .select('result,expires_at')
    .eq('agent_name', agentName)
    .eq('subject_type', subjectType)
    .eq('subject_id', subjectId)
    .eq('input_hash', inputHash)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const row = data as unknown as { result?: T } | null
  return row?.result ?? null
}

export async function setAgentMemory(
  agentName: AgentName,
  subjectType: SubjectType,
  subjectId: string,
  inputHash: string,
  result: Record<string, unknown>,
  ttlMinutes: number,
  confidence?: number | null
) {
  const supabase = await createClient()
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString()
  // @ts-expect-error Supabase SSR generic infers insert as never for JSONB-backed tables
  await supabase.from('agent_memories').upsert({
    agent_name: agentName,
    subject_type: subjectType,
    subject_id: subjectId,
    input_hash: inputHash,
    result,
    confidence: confidence ?? null,
    expires_at: expiresAt,
  }, { onConflict: 'agent_name,subject_type,subject_id,input_hash' })
}
