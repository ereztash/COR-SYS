/**
 * CBR Retrieval Evaluation Harness — SOTA Measurement
 *
 * Evaluates the quality of the CBR retrieval pipeline against a golden set
 * of labeled query→case pairs. Computes MRR (Mean Reciprocal Rank) and
 * top-K hit rate as the primary retrieval quality metrics.
 *
 * Usage:
 *   const result = await evaluateRetrieval(goldenSet, supabase)
 *
 * Golden set format:
 *   Each entry is a query snapshot + the expected relevant intervention_type(s).
 *   A "hit" at rank K means the correct intervention_type appears in top-K results.
 *
 * Metrics:
 *   MRR  — Mean Reciprocal Rank: 1/rank of first relevant result (higher = better)
 *   Hit@K — fraction of queries where correct type appears in top-K (K=1,3,5)
 *   Failure rate — fraction of queries returning 0 results (cold start)
 *
 * Research basis:
 *   - Anthropic Contextual Retrieval (2024): -49% retrieval failure vs naive
 *   - arXiv:2510.05381 (2025): Retrieve K=20 → filter to Top-5
 *   - SOTA target: failure rate < 10%, MRR > 0.6
 */

import type { DsmDiagnosticSnapshot, OrganizationContext } from '@/types/database'
import { findSimilarCases } from './similarity'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single golden query: a snapshot + org context + the expected best intervention type.
 * The harness checks whether the retrieval pipeline surfaces this type in top-K.
 */
export interface GoldenQuery {
  /** Human-readable label for this test case */
  label: string
  snapshot: Pick<
    DsmDiagnosticSnapshot,
    'score_dr' | 'score_nd' | 'score_uc' | 'psi_score' | 'severity_profile' | 'j_quotient' | 'decision_latency' | 'total_entropy' | 'bottleneck_text' | 'snapshot_id' | 'org_id' | 'created_at' | 'score_sc' | 'feature_vector'
  >
  org: Pick<OrganizationContext, 'org_id' | 'industry_sector' | 'employee_size_band' | 'culture_archetype' | 'client_id' | 'created_at'>
  /** The intervention type(s) that should appear in top-K results */
  expected_cta: string[]
}

export interface RetrievalEvalResult {
  label: string
  retrieved_types: string[]
  hit_at_1: boolean
  hit_at_3: boolean
  hit_at_5: boolean
  reciprocal_rank: number  // 1/rank of first hit, 0 if no hit in top-5
  cold_start: boolean
}

export interface HarnessReport {
  evaluated_at: string
  n_queries: number
  mrr: number
  hit_at_1: number
  hit_at_3: number
  hit_at_5: number
  failure_rate: number  // fraction returning 0 results
  results: RetrievalEvalResult[]
  /** Whether MRR meets SOTA target (> 0.6) */
  sota_mrr_met: boolean
  /** Whether failure rate meets SOTA target (< 0.10) */
  sota_failure_met: boolean
}

// ─── SOTA Targets ─────────────────────────────────────────────────────────────

export const RETRIEVAL_SOTA_TARGETS = {
  mrr_min: 0.60,
  failure_rate_max: 0.10,
  hit_at_5_min: 0.80,
} as const

// ─── Evaluation ───────────────────────────────────────────────────────────────

/**
 * Evaluate the retrieval pipeline against a golden set.
 * Calls findSimilarCases for each query and computes MRR + hit rates.
 *
 * @param goldenSet  Array of labeled query→expected_cta pairs
 * @param top_k      Number of results to retrieve per query (default 5)
 */
export async function evaluateRetrieval(
  goldenSet: GoldenQuery[],
  top_k = 5
): Promise<HarnessReport> {
  const results: RetrievalEvalResult[] = []

  for (const query of goldenSet) {
    let retrieved: string[] = []
    let cold_start = false

    try {
      const rankedCases = await findSimilarCases({
        snapshot: query.snapshot,
        org: query.org,
        top_k,
      })

      cold_start = rankedCases.length === 0
      retrieved = rankedCases.map((c) => c.intervention_type)
    } catch {
      cold_start = true
    }

    // Compute reciprocal rank: position of first expected CTA in results
    let reciprocal_rank = 0
    for (let i = 0; i < retrieved.length; i++) {
      if (query.expected_cta.includes(retrieved[i])) {
        reciprocal_rank = 1 / (i + 1)
        break
      }
    }

    results.push({
      label: query.label,
      retrieved_types: retrieved,
      hit_at_1: retrieved.slice(0, 1).some((t) => query.expected_cta.includes(t)),
      hit_at_3: retrieved.slice(0, 3).some((t) => query.expected_cta.includes(t)),
      hit_at_5: retrieved.slice(0, 5).some((t) => query.expected_cta.includes(t)),
      reciprocal_rank,
      cold_start,
    })
  }

  const n = results.length
  if (n === 0) {
    return {
      evaluated_at: new Date().toISOString(),
      n_queries: 0,
      mrr: 0,
      hit_at_1: 0,
      hit_at_3: 0,
      hit_at_5: 0,
      failure_rate: 0,
      results: [],
      sota_mrr_met: false,
      sota_failure_met: true,
    }
  }

  const mrr = results.reduce((s, r) => s + r.reciprocal_rank, 0) / n
  const hit_at_1 = results.filter((r) => r.hit_at_1).length / n
  const hit_at_3 = results.filter((r) => r.hit_at_3).length / n
  const hit_at_5 = results.filter((r) => r.hit_at_5).length / n
  const failure_rate = results.filter((r) => r.cold_start).length / n

  return {
    evaluated_at: new Date().toISOString(),
    n_queries: n,
    mrr,
    hit_at_1,
    hit_at_3,
    hit_at_5,
    failure_rate,
    results,
    sota_mrr_met: mrr >= RETRIEVAL_SOTA_TARGETS.mrr_min,
    sota_failure_met: failure_rate <= RETRIEVAL_SOTA_TARGETS.failure_rate_max,
  }
}

// ─── Seed Golden Set ──────────────────────────────────────────────────────────

/**
 * Minimal synthetic golden set for bootstrapping evaluation before real data accumulates.
 * Each case represents a prototypical DSM profile → expected intervention.
 *
 * These are derived from the policy engine mappings in dsm-policy-engine.ts:
 *   - High DR (> 7) + Critical/Systemic → sprint
 *   - High ND + At-risk → retainer
 *   - Low entropy + Healthy → live-demo
 */
export function buildSyntheticGoldenSet(): GoldenQuery[] {
  const baseOrg: GoldenQuery['org'] = {
    org_id: 'synthetic-org-1',
    client_id: null,
    industry_sector: 'tech',
    employee_size_band: '50_150',
    culture_archetype: null,
    created_at: new Date().toISOString(),
  }

  const baseSnap = (overrides: Partial<GoldenQuery['snapshot']>): GoldenQuery['snapshot'] => ({
    snapshot_id: `synthetic-snap-${Math.random().toString(36).slice(2, 8)}`,
    org_id: 'synthetic-org-1',
    created_at: new Date().toISOString(),
    score_sc: 5.0,
    feature_vector: null,
    bottleneck_text: null,
    j_quotient: null,
    decision_latency: null,
    psi_score: null,
    score_dr: 5,
    score_nd: 5,
    score_uc: 5,
    total_entropy: 15,
    severity_profile: 'At-risk',
    ...overrides,
  })

  return [
    {
      label: 'High DR + Critical severity → sprint',
      snapshot: baseSnap({ score_dr: 8.5, score_nd: 6, score_uc: 5, total_entropy: 19.5, severity_profile: 'Critical' }),
      org: baseOrg,
      expected_cta: ['sprint'],
    },
    {
      label: 'Systemic collapse → sprint (urgent)',
      snapshot: baseSnap({ score_dr: 9, score_nd: 8, score_uc: 7.5, total_entropy: 24.5, severity_profile: 'Systemic-collapse' }),
      org: baseOrg,
      expected_cta: ['sprint'],
    },
    {
      label: 'High ND + At-risk → retainer',
      snapshot: baseSnap({ score_dr: 4, score_nd: 7.5, score_uc: 4, total_entropy: 15.5, severity_profile: 'At-risk' }),
      org: baseOrg,
      expected_cta: ['retainer'],
    },
    {
      label: 'Low entropy + Healthy → live-demo',
      snapshot: baseSnap({ score_dr: 2, score_nd: 2, score_uc: 2, total_entropy: 6, severity_profile: 'Healthy' }),
      org: baseOrg,
      expected_cta: ['live-demo'],
    },
    {
      label: 'Moderate all dimensions → retainer or sprint',
      snapshot: baseSnap({ score_dr: 5.5, score_nd: 5.5, score_uc: 5.5, total_entropy: 16.5, severity_profile: 'At-risk' }),
      org: baseOrg,
      expected_cta: ['retainer', 'sprint'],
    },
  ]
}
