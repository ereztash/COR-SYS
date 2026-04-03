import { createClient } from '@/lib/supabase/server'
import type { OrgNetworkMetricRow, OrgNetworkRow } from '@/types/database'
import { evaluateGovernance, inferRiskLevel, type GovernanceDecision } from './governance'

export interface AlphaDocumentInput {
  title: string
  content: string
}

export interface AlphaNetworkSurveyInput {
  teams?: string[]
  communicationMode?: 'centralized' | 'distributed' | 'hybrid'
  hubs?: string[]
  silos?: string[]
}

export interface AlphaAnalyzeInput {
  clientId: string
  answers?: Record<string, unknown>
  documents?: AlphaDocumentInput[]
  network?: AlphaNetworkSurveyInput
  apply?: boolean
  approvalGranted?: boolean
}

export interface AlphaBoundedContext {
  id: string
  label: string
  confidence: number
  signals: string[]
  evidence: string[]
}

export interface AlphaAnalyzeResult {
  governance: GovernanceDecision
  boundedContexts: AlphaBoundedContext[]
  contradictionLoss: number
  networkNodes: Omit<OrgNetworkRow, 'id' | 'created_at' | 'updated_at'>[]
  networkMetrics: Omit<OrgNetworkMetricRow, 'metric_id' | 'computed_at'>
}

const CONTEXT_PATTERNS: Array<{ id: string; label: string; keywords: string[] }> = [
  { id: 'strategy', label: 'Strategy Execution', keywords: ['strategy', 'vision', 'roadmap', 'priorit', '\u05D9\u05E2\u05D3', '\u05D0\u05E1\u05D8\u05E8\u05D8\u05D2'] },
  { id: 'leadership', label: 'Leadership Cascade', keywords: ['leader', 'manager', 'executive', 'approval', '\u05DE\u05E0\u05D4\u05DC', '\u05D4\u05E0\u05D4\u05DC\u05D4'] },
  { id: 'operations', label: 'Operational Flow', keywords: ['process', 'workflow', 'handoff', 'queue', 'ops', '\u05EA\u05D4\u05DC\u05D9\u05DA'] },
  { id: 'communication', label: 'Communication Network', keywords: ['meeting', 'slack', 'communicat', 'silo', 'voice', '\u05EA\u05E7\u05E9\u05D5\u05E8\u05EA'] },
  { id: 'decision', label: 'Decision Rights', keywords: ['decision', 'ownership', 'authority', 'latency', '\u05D4\u05D7\u05DC\u05D8', '\u05E1\u05DE\u05DB\u05D5\u05EA'] },
  { id: 'culture', label: 'Culture and Safety', keywords: ['trust', 'safety', 'fear', 'blame', 'culture', '\u05D0\u05DE\u05D5\u05DF'] },
]

const CONTRADICTION_MARKERS = ['but', 'however', 'except', 'conflict', 'versus', 'vs', '\u05D0\u05D1\u05DC', '\u05DC\u05E2\u05D5\u05DE\u05EA', '\u05E1\u05EA\u05D9\u05E8\u05D4']

function normalizeText(input: AlphaAnalyzeInput): string[] {
  const answerText = Object.entries(input.answers ?? {})
    .map(([key, value]) => `${key}: ${String(value)}`)
  const docText = (input.documents ?? []).map((doc) => `${doc.title}\n${doc.content}`)
  return [...answerText, ...docText].filter(Boolean)
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function scoreContext(chunks: string[], keywords: string[]): { score: number; evidence: string[]; signals: string[] } {
  const lowerKeywords = keywords.map((keyword) => keyword.toLowerCase())
  const evidence = chunks.filter((chunk) =>
    lowerKeywords.some((keyword) => chunk.toLowerCase().includes(keyword))
  )
  const hitCount = evidence.reduce(
    (sum, chunk) =>
      sum + lowerKeywords.filter((keyword) => chunk.toLowerCase().includes(keyword)).length,
    0
  )
  return {
    score: clamp01(hitCount / Math.max(lowerKeywords.length * 2, 1)),
    evidence: evidence.slice(0, 3),
    signals: lowerKeywords.filter((keyword) => evidence.some((chunk) => chunk.toLowerCase().includes(keyword))),
  }
}

function buildNetwork(clientId: string, survey?: AlphaNetworkSurveyInput) {
  const teams = survey?.teams?.length ? survey.teams : ['Leadership', 'Delivery', 'Commercial']
  const hubs = new Set(survey?.hubs?.length ? survey.hubs : [teams[0]])
  const silos = new Set(survey?.silos ?? [])
  const mode = survey?.communicationMode ?? 'hybrid'

  const networkNodes: Omit<OrgNetworkRow, 'id' | 'created_at' | 'updated_at'>[] = teams.map((team, index) => {
    const neighbors = teams.filter((candidate) => candidate !== team && (mode !== 'centralized' || hubs.has(team) || hubs.has(candidate)))
    const adjacency = Object.fromEntries(
      neighbors.map((neighbor) => [
        neighbor.toLowerCase().replace(/\s+/g, '-'),
        {
          weight: silos.has(team) || silos.has(neighbor) ? 0.3 : hubs.has(team) || hubs.has(neighbor) ? 0.95 : 0.7,
        },
      ])
    )
    return {
      client_id: clientId,
      node_id: team.toLowerCase().replace(/\s+/g, '-'),
      node_type: hubs.has(team) ? 'hub' : index === 0 ? 'leader' : 'team',
      adjacency,
      node_label: team,
      metadata: { silo: silos.has(team), communication_mode: mode },
    }
  })

  const edgeCount = networkNodes.reduce(
    (sum, node) => sum + Object.keys(node.adjacency as Record<string, unknown>).length,
    0
  )
  const n = Math.max(networkNodes.length, 1)
  const density = n <= 1 ? 0 : edgeCount / (n * (n - 1))
  const clustering = clamp01(
    networkNodes.reduce((sum, node) => {
      const degree = Object.keys(node.adjacency as Record<string, unknown>).length
      return sum + (degree > 1 ? degree / Math.max(n - 1, 1) : 0)
    }, 0) / n
  )
  const centrality = Object.fromEntries(
    networkNodes.map((node) => [
      node.node_id,
      clamp01(Object.keys(node.adjacency as Record<string, unknown>).length / Math.max(n - 1, 1)),
    ])
  )

  return {
    networkNodes,
    networkMetrics: {
      client_id: clientId,
      density,
      diameter: n <= 2 ? Math.max(1, n - 1) : mode === 'centralized' ? 2 : 3,
      clustering_coefficient: clustering,
      betweenness_centrality: centrality,
    },
  }
}

export async function analyzeAlpha(input: AlphaAnalyzeInput): Promise<AlphaAnalyzeResult> {
  const chunks = normalizeText(input)
  const boundedContexts = CONTEXT_PATTERNS
    .map((pattern) => {
      const { score, evidence, signals } = scoreContext(chunks, pattern.keywords)
      return {
        id: pattern.id,
        label: pattern.label,
        confidence: score,
        signals,
        evidence,
      } satisfies AlphaBoundedContext
    })
    .filter((context) => context.confidence > 0.15)

  const contradictionHits = chunks.reduce((sum, chunk) => {
    const lower = chunk.toLowerCase()
    return sum + CONTRADICTION_MARKERS.filter((marker) => lower.includes(marker)).length
  }, 0)
  const overlapPenalty = Math.max(0, boundedContexts.length - new Set(boundedContexts.flatMap((ctx) => ctx.signals)).size / 2)
  const contradictionLoss = clamp01((contradictionHits * 0.08) + overlapPenalty * 0.05)
  const confidence =
    boundedContexts.length === 0
      ? 0.2
      : boundedContexts.reduce((sum, context) => sum + context.confidence, 0) / boundedContexts.length

  const { networkNodes, networkMetrics } = buildNetwork(input.clientId, input.network)
  const impactScore = Math.max(contradictionLoss, networkMetrics.density < 0.35 ? 0.7 : 0.35)
  const governance = evaluateGovernance({
    agentName: 'alpha',
    confidence,
    riskLevel: inferRiskLevel(confidence, impactScore),
    requestedMutation: !!input.apply,
    approvalGranted: input.approvalGranted,
    hardLimitViolations: boundedContexts.length === 0 ? ['no_contexts_detected'] : [],
  })

  if (input.apply && governance.canWrite) {
    const supabase = await createClient()

    await supabase
      .from('clients')
      .update(({
        bounded_contexts: boundedContexts,
        contradiction_loss: contradictionLoss,
        agent_notes: `Alpha updated ${boundedContexts.length} contexts`,
      }) as never)
      .eq('id', input.clientId)

    await supabase.from('org_network').delete().eq('client_id', input.clientId)
    if (networkNodes.length > 0) {
      // @ts-expect-error Supabase SSR generic infers insert as never for JSONB-backed tables
      await supabase.from('org_network').insert(networkNodes)
    }
    // @ts-expect-error Supabase SSR generic infers insert as never for JSONB-backed tables
    await supabase.from('org_network_metrics').insert(networkMetrics)
  }

  return {
    governance,
    boundedContexts,
    contradictionLoss,
    networkNodes,
    networkMetrics,
  }
}
