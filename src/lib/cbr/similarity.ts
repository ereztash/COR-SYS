/**
 * CBR Similarity Search Module
 *
 * Pattern: Retrieve-then-Solve (RAG research, +15-20% accuracy)
 *
 * Pipeline:
 *   Step 1: Pre-filter by industry + severity + DLI (SQL WHERE) → ~100 candidates
 *   Step 2: ANN search via HNSW pgvector cosine → Top-20
 *   Step 3: Re-rank by combined score (cosine + severity + outcome quality) → Top-K
 *   Step 4: Return with confidence + metadata
 *
 * K=15 for RPC (validated: PDF p.14, Anthropic RAG study sweet spot K=15-20)
 * K=5  for final re-ranked output (UI display limit)
 */

import { createClient } from '@/lib/supabase/server'
import type { SimilarCaseResult } from '@/types/database'
import type { DsmDiagnosticSnapshot, OrganizationContext } from '@/types/database'
import { generateCaseEmbedding } from './embedding'
import type { EmbeddingInput } from './embedding'
import { hybridScoreSimilarity, PSI_NORM_DEFAULT } from './utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SimilaritySearchInput extends EmbeddingInput {
  /** Max Decision Latency Index for pre-filtering (days) */
  max_dli?: number
  /** Number of cases to return from HNSW (default 15) */
  hnsw_k?: number
  /** Number of cases after re-rank (default 5) */
  top_k?: number
}

export interface RankedCase extends SimilarCaseResult {
  /** L2 distance on DR/ND/UC vs query snapshot (lower = more similar pathology) */
  pathology_distance: number
  /** Final combined rank score (0-1, higher = better match) */
  rank_score: number
  /** Which similarity path produced this result */
  similarity_method: 'hnsw' | 'kl' | 'hybrid'
}

// ─── Re-rank Scoring ──────────────────────────────────────────────────────────

/**
 * Compute a combined rank score from a base similarity + semantic bonuses.
 *
 * @param result        Case from HNSW or KL path
 * @param querySeverity Severity profile of the query snapshot
 * @param severityBonus Bonus for severity match — higher for KL path (0.25) since
 *                      there is no semantic signal, lower for HNSW path (0.15).
 */
function computeRankScore(
  result: SimilarCaseResult,
  querySeverity: string,
  severityBonus = 0.15
): { pathology_distance: number; rank_score: number } {
  const base = result.similarity_score

  const severityMatch = result.severity === querySeverity ? severityBonus : 0

  // Outcome quality bonus: positive learning_gain → case worth learning from
  const lgBonus =
    result.learning_gain != null && result.learning_gain > 0
      ? Math.min(0.1, result.learning_gain * 0.05)
      : 0

  // Penalize cases with chaotic/bifurcation trajectory (λ < 0)
  const lambdaPenalty =
    result.lambda_eigenvalue != null && result.lambda_eigenvalue < 0 ? 0.1 : 0

  const rank_score = Math.min(1, base + severityMatch + lgBonus - lambdaPenalty)
  const pathology_distance = 1 - base

  return { pathology_distance, rank_score }
}

// ─── Score-based KL Fallback ──────────────────────────────────────────────────

/**
 * Normalize PSI from Edmondson 1-7 scale to [0, 1].
 * Returns PSI_NORM_DEFAULT when psi_score is null.
 */
function normalizePsi(psi: number | null): number {
  if (psi == null) return PSI_NORM_DEFAULT
  return Math.max(0, Math.min(1, (psi - 1) / 6))
}

/**
 * Build the 4-dimensional score vector for hybrid similarity.
 * [dr/10, nd/10, uc/10, psi_norm]
 */
function toScoreVector(dr: number, nd: number, uc: number, psi: number | null): number[] {
  return [dr / 10, nd / 10, uc / 10, normalizePsi(psi)]
}

// ─── Internal query types (Supabase SSR generic doesn't infer custom table types) ──

interface InterventionRow {
  intervention_id: string
  snapshot_id: string
  actual_cta: string
  delta_entropy: number | null
  delta_j_quotient: number | null
  learning_gain: number | null
  lambda_eigenvalue: number | null
}

interface SnapshotScoreRow {
  snapshot_id: string
  score_dr: number
  score_nd: number
  score_uc: number
  psi_score: number | null
  severity_profile: string
  org_id: string
}

interface OrgRow {
  org_id: string
  industry_sector: string
}

/**
 * Score-based fallback when HNSW returns no results (feature_vectors are NULL).
 *
 * Pipeline:
 *   1. Fetch all completed interventions (followup_date IS NOT NULL)
 *   2. Fetch snapshot scores for those interventions
 *   3. Fetch org industry for those snapshots
 *   4. Compute hybrid JSD+L2 similarity in TypeScript
 *   5. Re-rank and return Top-K
 *
 * // TODO: when cases > 200, move KL computation to SQL function with pre-filter on severity
 */
async function findSimilarCasesByScore(
  querySnapshot: Pick<DsmDiagnosticSnapshot, 'score_dr' | 'score_nd' | 'score_uc' | 'psi_score' | 'severity_profile'>,
  _org: Pick<OrganizationContext, 'industry_sector'>,
  top_k: number
): Promise<RankedCase[]> {
  const supabase = await createClient()

  // Step 1: all completed interventions
  // Supabase SSR generic doesn't infer custom table types — explicit cast required (LOG.md pattern)
  const { data: intRaw, error: intErr } = await supabase
    .from('interventions_and_feedback')
    .select('intervention_id, snapshot_id, actual_cta, delta_entropy, delta_j_quotient, learning_gain, lambda_eigenvalue')
    .not('followup_date', 'is', null)
    .limit(50)
  const interventions = (intRaw ?? []) as InterventionRow[]

  if (intErr || interventions.length === 0) {
    console.warn('[CBR/kl] no completed interventions found:', intErr?.message)
    return []
  }

  // Step 2: snapshot scores for those interventions
  const snapshotIds = interventions.map((i) => i.snapshot_id)
  const { data: snapRaw, error: snapErr } = await supabase
    .from('dsm_diagnostic_snapshots')
    .select('snapshot_id, score_dr, score_nd, score_uc, psi_score, severity_profile, org_id')
    .in('snapshot_id', snapshotIds)
  const snapshots = (snapRaw ?? []) as SnapshotScoreRow[]

  if (snapErr || snapshots.length === 0) {
    console.warn('[CBR/kl] failed to fetch snapshot scores:', snapErr?.message)
    return []
  }

  // Step 3: org industry
  const orgIds = [...new Set(snapshots.map((s) => s.org_id))]
  const { data: orgRaw } = await supabase
    .from('organizations_context')
    .select('org_id, industry_sector')
    .in('org_id', orgIds)
  const orgs = (orgRaw ?? []) as OrgRow[]

  const orgMap = new Map(orgs.map((o) => [o.org_id, o.industry_sector]))
  const snapMap = new Map(snapshots.map((s) => [s.snapshot_id, s]))

  // Step 4: compute hybrid similarity for each intervention
  const queryVec = toScoreVector(
    querySnapshot.score_dr,
    querySnapshot.score_nd,
    querySnapshot.score_uc,
    querySnapshot.psi_score
  )

  const results: RankedCase[] = []
  for (const intervention of interventions) {
    const snap = snapMap.get(intervention.snapshot_id)
    if (!snap) continue

    const candidateVec = toScoreVector(snap.score_dr, snap.score_nd, snap.score_uc, snap.psi_score)
    const similarity_score = hybridScoreSimilarity(queryVec, candidateVec)

    const simResult: SimilarCaseResult = {
      case_id: intervention.intervention_id,
      org_industry: orgMap.get(snap.org_id) ?? 'unknown',
      severity: snap.severity_profile,
      intervention_type: intervention.actual_cta,
      delta_total_entropy: intervention.delta_entropy,
      j_quotient_recovered: intervention.delta_j_quotient,
      learning_gain: intervention.learning_gain,
      lambda_eigenvalue: intervention.lambda_eigenvalue,
      similarity_score,
    }

    const { pathology_distance, rank_score } = computeRankScore(
      simResult,
      querySnapshot.severity_profile,
      0.25 // Iteration 6: higher severity bonus for KL path (no semantic signal)
    )

    results.push({ ...simResult, pathology_distance, rank_score, similarity_method: 'kl' })
  }

  results.sort((a, b) => b.rank_score - a.rank_score)
  return results.slice(0, top_k)
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Find similar organizational cases using the CBR retrieval pipeline.
 * Returns Top-K ranked cases — empty array on cold start (no cases yet).
 */
export async function findSimilarCases(input: SimilaritySearchInput): Promise<RankedCase[]> {
  const {
    snapshot,
    org,
    max_dli = snapshot.decision_latency ?? 30,
    hnsw_k = 15,
    top_k = 5,
  } = input

  // Step 1: Generate query embedding — graceful fallback if OpenAI unavailable (quota/key).
  // When embedding fails we skip HNSW entirely and go straight to score-based KL path.
  let queryEmbedding: number[] | null = null
  try {
    queryEmbedding = await generateCaseEmbedding({ snapshot, org })
  } catch (embErr) {
    console.warn('[CBR] embedding unavailable, using score-based fallback:', embErr)
    return findSimilarCasesByScore(snapshot, org, top_k)
  }

  // Step 2: RPC — Pre-filter (industry + severity + DLI) + HNSW ANN
  const supabase = await createClient()

  // Supabase SSR client RPC generic doesn't infer custom Functions type.
  // Using explicit cast is safe here — runtime args are validated by SQL function.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpc = supabase.rpc as (...args: any[]) => any
  const { data, error } = await rpc('get_similar_cases_with_stats', {
    query_embedding: queryEmbedding,
    target_industry: org.industry_sector,
    target_severity: snapshot.severity_profile as string,
    max_dli: max_dli,
    match_limit: hnsw_k,
  })

  if (error) {
    console.warn('[CBR/hnsw] RPC error, trying score-based KL fallback:', error.message)
    return findSimilarCasesByScore(snapshot, org, top_k)
  }

  if (!data || (data as SimilarCaseResult[]).length === 0) {
    // HNSW returned no results (likely feature_vectors are NULL).
    // Fall back to score-based Jensen-Shannon similarity.
    console.info('[CBR] HNSW returned 0 results — switching to KL score fallback')
    return findSimilarCasesByScore(snapshot, org, top_k)
  }

  const results = data as SimilarCaseResult[]

  // Step 3: Re-rank by combined score → Top-K
  const ranked: RankedCase[] = results.map((result) => {
    const { pathology_distance, rank_score } = computeRankScore(result, snapshot.severity_profile)
    return { ...result, pathology_distance, rank_score, similarity_method: 'hnsw' as const }
  })

  ranked.sort((a, b) => b.rank_score - a.rank_score)
  return ranked.slice(0, top_k)
}
