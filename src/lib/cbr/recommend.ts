/**
 * CBR Recommendation Engine — Phase 3 Intelligence Layer
 *
 * Converts RankedCase[] from the retrieval pipeline into ranked,
 * evidence-based intervention recommendations with Wilson-score confidence
 * and loss-framed economic signals.
 *
 * Algorithm:
 *   1. Group cases by intervention_type
 *   2. Per group: success_rate, Wilson CI lower-bound, avg outcomes
 *   3. Sort by wilson_score DESC (conservative, anti-popularity-bias)
 *   4. Cold-start: fallback to dsm-policy-engine when no cases exist
 *
 * Research basis:
 *   - Wilson (1927) score interval — conservative CI lower bound
 *   - Kahneman & Tversky (1991) — daily_loss_estimate for loss framing
 *   - Aamodt & Plaza (1994) — CBR Retrieve-Reuse cycle
 */

import type { RankedCase } from './similarity'
import type { RecommendationResult } from '@/types/database'
import type { DsmDiagnosticSnapshot } from '@/types/database'
import type { DSMDiagnosis } from '@/lib/dsm-engine'
import { buildGoldenQuestions } from '@/lib/dsm-policy-engine'
import { calculateEdgeOfChaos } from '@/lib/resilience-formula'
import {
  avg,
  SUCCESS_ENTROPY_DELTA,
  SUCCESS_J_QUOTIENT_THRESHOLD,
  SUCCESS_LEARNING_GAIN_MIN,
  CONFIDENCE_HIGH_THRESHOLD,
  CONFIDENCE_MEDIUM_THRESHOLD,
  CONFIDENCE_LOW_THRESHOLD,
} from './utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecommendationInput {
  rankedCases: RankedCase[]
  /** Used for daily_loss_estimate = j_quotient / 30 */
  snapshot: Pick<DsmDiagnosticSnapshot, 'j_quotient'>
  /**
   * Optional: provide for cold-start fallback to policy engine.
   * If rankedCases is empty and this is provided, returns a single
   * policy-derived recommendation with confidence_level='insufficient'.
   */
  coldStartDiagnosis?: DSMDiagnosis
  coldStartEconomicParams?: { managers: number; hoursPerWeek: number; monthlySalary: number }
}

export interface RecommendationOutput {
  recommendations: RecommendationResult[]
  cold_start: boolean
}

// ─── Wilson Score ─────────────────────────────────────────────────────────────

/**
 * Wilson score lower-bound confidence interval.
 * Source: Wilson (1927), used in CBR to penalize small sample recommendations.
 *
 * Returns a conservative estimate of the true success rate.
 * High N + high success → approaches raw success_rate.
 * Low N (< 5) → heavily penalized.
 */
function wilsonScore(successes: number, total: number, z = 1.96): number {
  if (total === 0) return 0
  const p = successes / total
  const denominator = 1 + (z * z) / total
  const center = p + (z * z) / (2 * total)
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total)
  return (center - spread) / denominator
}

// ─── Success Criterion ────────────────────────────────────────────────────────

/**
 * A case is considered successful if:
 *   - entropy decreased by more than 1.5 points, OR
 *   - J-Quotient recovered by more than 5%, OR
 *   - learning gain is positive (when optional ΔEntropy/ΔJ were not recorded on follow-up,
 *     LG still comes from ΔDR/ΔPSI via the resilience formula)
 *
 * Threshold source: cbr-execution-roadmap.md Step 3.1; LG aligns with resilience-formula.ts
 */
function isSuccess(c: RankedCase): boolean {
  if (c.delta_total_entropy != null && c.delta_total_entropy < SUCCESS_ENTROPY_DELTA) return true
  if (c.j_quotient_recovered != null && c.j_quotient_recovered > SUCCESS_J_QUOTIENT_THRESHOLD) return true
  if (c.learning_gain != null && c.learning_gain > SUCCESS_LEARNING_GAIN_MIN) return true
  return false
}

// ─── Confidence Mapping ───────────────────────────────────────────────────────

function mapConfidence(wilson: number): RecommendationResult['confidence_level'] {
  if (wilson >= CONFIDENCE_HIGH_THRESHOLD) return 'high'
  if (wilson >= CONFIDENCE_MEDIUM_THRESHOLD) return 'medium'
  if (wilson >= CONFIDENCE_LOW_THRESHOLD) return 'low'
  return 'insufficient'
}

// ─── Cold-Start Fallback ──────────────────────────────────────────────────────

/**
 * Converts a policy-engine recommendation into a synthetic RecommendationResult.
 * Used when no historical CBR cases exist.
 * confidence_level is always 'insufficient' — signals to UI to show notice.
 */
function buildColdStartResult(
  diagnosis: DSMDiagnosis,
  economicParams: { managers: number; hoursPerWeek: number; monthlySalary: number },
  dailyLoss: number | null
): RecommendationResult {
  const golden = buildGoldenQuestions(diagnosis, economicParams)
  return {
    intervention_type: golden.recommendedAction.ctaType,
    success_rate: 0,
    wilson_score: 0,
    confidence_level: 'insufficient',
    supporting_cases: 0,
    avg_j_quotient_recovered: null,
    daily_loss_estimate: dailyLoss,
    avg_lambda: null,
    avg_eoc_score: null,
    recommendation_boldness: 'balanced',
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Derive ranked intervention recommendations from CBR cases.
 *
 * Returns empty recommendations with cold_start=true when no cases exist
 * and no cold-start diagnosis is provided.
 */
export function getRecommendations(input: RecommendationInput): RecommendationOutput {
  const { rankedCases, snapshot, coldStartDiagnosis, coldStartEconomicParams } = input

  const dailyLoss = snapshot.j_quotient != null ? snapshot.j_quotient / 30 : null

  // ── Cold start ──────────────────────────────────────────────────────────────
  if (rankedCases.length === 0) {
    if (coldStartDiagnosis && coldStartEconomicParams) {
      return {
        recommendations: [buildColdStartResult(coldStartDiagnosis, coldStartEconomicParams, dailyLoss)],
        cold_start: true,
      }
    }
    return { recommendations: [], cold_start: true }
  }

  // ── Group by intervention_type ──────────────────────────────────────────────
  const groups = new Map<string, RankedCase[]>()
  for (const c of rankedCases) {
    const key = c.intervention_type
    const existing = groups.get(key)
    if (existing) {
      existing.push(c)
    } else {
      groups.set(key, [c])
    }
  }

  // ── Score each group ────────────────────────────────────────────────────────
  const results: RecommendationResult[] = []
  for (const [intervention_type, cases] of groups) {
    const total = cases.length
    const successes = cases.filter(isSuccess).length
    const success_rate = total > 0 ? successes / total : 0
    const wilson = wilsonScore(successes, total)

    results.push({
      intervention_type,
      success_rate,
      wilson_score: wilson,
      confidence_level: mapConfidence(wilson),
      supporting_cases: total,
      avg_j_quotient_recovered: avg(cases.map((c) => c.j_quotient_recovered)),
      daily_loss_estimate: dailyLoss,
      avg_lambda: avg(cases.map((c) => c.lambda_eigenvalue)),
      avg_eoc_score: avg(cases.map((c) => (c.lambda_eigenvalue != null ? calculateEdgeOfChaos(c.lambda_eigenvalue) : null))),
      recommendation_boldness:
        (avg(cases.map((c) => (c.lambda_eigenvalue != null ? calculateEdgeOfChaos(c.lambda_eigenvalue) : null))) ?? 0) > 0.75
          ? 'bold'
          : (avg(cases.map((c) => (c.lambda_eigenvalue != null ? calculateEdgeOfChaos(c.lambda_eigenvalue) : null))) ?? 0) > 0.45
            ? 'balanced'
            : 'safe',
    })
  }

  // ── Sort by Wilson score DESC ────────────────────────────────────────────────
  results.sort(
    (a, b) =>
      (b.wilson_score + (b.avg_eoc_score ?? 0) * 0.08) -
      (a.wilson_score + (a.avg_eoc_score ?? 0) * 0.08)
  )

  return { recommendations: results, cold_start: false }
}
