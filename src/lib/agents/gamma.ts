import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type {
  Client,
  DsmDiagnosticSnapshot,
  InterventionAndFeedback,
  OrganizationContext,
} from '@/types/database'
import { classifyFeedbackLoop, detectEmergence, type FeedbackLoopType } from './feedback-loop'

type DbClient = SupabaseClient<Database>

export interface GammaMetricInput {
  clientId: string
  persist?: boolean
  /** When set (e.g. service role from cron), used instead of cookie-bound server client */
  supabase?: DbClient
}

export interface GammaMetricResult {
  semanticDriftKl: number
  currentJ: number
  feedbackLoopType: FeedbackLoopType | null
  emergenceSignal: 'continuous' | 'discontinuous'
  alert: string | null
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)
}

function distributionFromText(texts: string[]): Map<string, number> {
  const tokens = texts.flatMap(tokenize)
  const total = Math.max(tokens.length, 1)
  const counts = new Map<string, number>()
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1 / total)
  }
  return counts
}

function klDivergence(p: Map<string, number>, q: Map<string, number>): number {
  const epsilon = 1e-6
  const keys = new Set([...p.keys(), ...q.keys()])
  let sum = 0
  for (const key of keys) {
    const pk = p.get(key) ?? epsilon
    const qk = q.get(key) ?? epsilon
    sum += pk * Math.log(pk / qk)
  }
  return Number.isFinite(sum) ? sum : 0
}

export function computeTokenKlDivergence(declaredTexts: string[], observedTexts: string[]): number {
  return klDivergence(distributionFromText(declaredTexts), distributionFromText(observedTexts))
}

function computeCurrentJ(snapshot: DsmDiagnosticSnapshot): number {
  if (snapshot.j_quotient != null) return snapshot.j_quotient
  const capacity = Math.max(0.2, 12 - snapshot.total_entropy)
  const entropyLoad = Math.max(1, snapshot.score_dr + snapshot.score_nd + snapshot.score_uc + snapshot.score_sc)
  return capacity / entropyLoad
}

async function loadGammaContext(clientId: string, existing?: DbClient) {
  const supabase = existing ?? (await createClient())
  const [{ data: client }, { data: org }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', clientId).single(),
    supabase.from('organizations_context').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1).single(),
  ])

  if (!client || !org) {
    throw new Error('Gamma context not found')
  }

  const { data: snapshots } = await supabase
    .from('dsm_diagnostic_snapshots')
    .select('*')
    .eq('org_id', (org as OrganizationContext).org_id)
    .order('created_at', { ascending: true })

  const { data: plans } = await supabase
    .from('client_business_plans')
    .select('summary,next_steps')
    .eq('client_id', clientId)
    .order('updated_at', { ascending: false })
    .limit(1)

  const snapshotIds = (snapshots ?? []).map((snapshot: { snapshot_id: string }) => snapshot.snapshot_id)
  const { data: interventions } = snapshotIds.length
    ? await supabase
        .from('interventions_and_feedback')
        .select('*')
        .in('snapshot_id', snapshotIds)
        .order('created_at', { ascending: false })
        .limit(6)
    : { data: [] as InterventionAndFeedback[] }

  return {
    supabase,
    client: client as Client,
    org: org as OrganizationContext,
    snapshots: (snapshots ?? []) as DsmDiagnosticSnapshot[],
    plan: (plans?.[0] ?? null) as { summary?: string | null; next_steps?: string | null } | null,
    interventions: (interventions ?? []) as InterventionAndFeedback[],
  }
}

export async function computeGammaMetrics(input: GammaMetricInput): Promise<GammaMetricResult> {
  const { supabase, client, snapshots, plan, interventions } = await loadGammaContext(input.clientId, input.supabase)
  const latestSnapshot = snapshots[snapshots.length - 1]
  if (!latestSnapshot) {
    throw new Error('Gamma requires at least one diagnostic snapshot')
  }

  const semanticDriftKl = computeTokenKlDivergence(
    [
      plan?.summary ?? '',
      plan?.next_steps ?? '',
      client.notes ?? '',
      JSON.stringify(client.bounded_contexts ?? []),
    ],
    [
      latestSnapshot.bottleneck_text ?? '',
      interventions.map((item) => `${item.recommended_cta} ${item.actual_cta} ${item.override_reason ?? ''}`).join(' '),
    ]
  )
  const currentJ = computeCurrentJ(latestSnapshot)
  const loopType = classifyFeedbackLoop(interventions[0] ?? null)
  const emergence = detectEmergence(snapshots)

  let alert: string | null = null
  if (semanticDriftKl > 0.45) {
    alert = 'semantic_drift'
  } else if (loopType === 'runaway') {
    alert = 'runaway_loop'
  } else if (currentJ > 0.8) {
    alert = 'high_j'
  }

  if (input.persist) {
    await supabase
      .from('clients')
      .update(({
        current_j_quotient: currentJ,
        semantic_drift_kl: semanticDriftKl,
        runaway_loop_detected: loopType === 'runaway',
      }) as never)
      .eq('id', input.clientId)

    await supabase
      .from('dsm_diagnostic_snapshots')
      .update(({
        emergence_signal: emergence.signal,
      }) as never)
      .eq('snapshot_id', latestSnapshot.snapshot_id)

    if (loopType || alert || emergence.signal === 'discontinuous') {
      const { data: eventRows } = await supabase
        .from('feedback_events')
        // @ts-expect-error Supabase SSR generic infers insert as never for JSONB-backed tables
        .insert({
          client_id: input.clientId,
          snapshot_id: latestSnapshot.snapshot_id,
          intervention_id: interventions[0]?.intervention_id ?? null,
          event_type:
            emergence.signal === 'discontinuous'
              ? 'phase-transition'
              : loopType === 'runaway'
                ? 'runaway-detected'
                : loopType === 'negative'
                  ? 'negative-feedback'
                  : 'positive-feedback',
          loop_type: loopType,
          payload: {
            semantic_drift_kl: semanticDriftKl,
            current_j: currentJ,
            alert,
          },
        })
        .select('event_id')

      const eventId = (eventRows?.[0] as { event_id?: string } | undefined)?.event_id
      if (eventId && alert) {
        // @ts-expect-error Supabase SSR generic infers insert as never for JSONB-backed tables
        await supabase.from('feedback_actions').insert({
          event_id: eventId,
          action_type: currentJ > 0.8 ? 'alert' : 'recommendation',
          status: 'pending',
          result: { alert },
        })
      }
    }
  }

  return {
    semanticDriftKl,
    currentJ,
    feedbackLoopType: loopType,
    emergenceSignal: emergence.signal,
    alert,
  }
}
