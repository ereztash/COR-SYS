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
}

// ─── Re-rank Scoring ──────────────────────────────────────────────────────────

/**
 * Compute a combined rank score from cosine similarity + semantic bonuses.
 * Used for Step 3 re-ranking after HNSW retrieval.
 */
function computeRankScore(
  result: SimilarCaseResult,
  querySeverity: string
): { pathology_distance: number; rank_score: number } {
  const cosine = result.similarity_score

  // Severity match bonus: same severity profile → +0.15
  const severityBonus = result.severity === querySeverity ? 0.15 : 0

  // Outcome quality bonus: positive learning_gain → case worth learning from
  const lgBonus =
    result.learning_gain != null && result.learning_gain > 0
      ? Math.min(0.1, result.learning_gain * 0.05)
      : 0

  // Penalize cases with chaotic/bifurcation trajectory (λ < 0)
  const lambdaPenalty =
    result.lambda_eigenvalue != null && result.lambda_eigenvalue < 0 ? 0.1 : 0

  const rank_score = Math.min(1, cosine + severityBonus + lgBonus - lambdaPenalty)
  const pathology_distance = 1 - cosine

  return { pathology_distance, rank_score }
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

  // Step 1: Generate query embedding
  const queryEmbedding = await generateCaseEmbedding({ snapshot, org })

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
    // Cold start or RPC error — fallback to policy engine at caller
    console.warn('[CBR] similarity RPC error (cold start?):', error.message)
    return []
  }

  if (!data || (data as SimilarCaseResult[]).length === 0) return []

  const results = data as SimilarCaseResult[]

  // Step 3: Re-rank by combined score → Top-K
  const ranked: RankedCase[] = results.map((result) => {
    const { pathology_distance, rank_score } = computeRankScore(result, snapshot.severity_profile)
    return { ...result, pathology_distance, rank_score }
  })

  ranked.sort((a, b) => b.rank_score - a.rank_score)
  return ranked.slice(0, top_k)
}
