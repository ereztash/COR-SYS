/**
 * CBR Trajectory Prediction Module — Phase 3
 *
 * Computes organizational resilience trajectory from a sequence of DSM snapshots.
 * Uses the resilience formula (λ = 1 + κ×LG) to derive eigenvalue trends over time.
 *
 * Input:  2+ DsmDiagnosticSnapshot records for the same org, sorted by created_at
 * Output: TrajectoryPrediction — λ series, trend, confidence
 *
 * Confidence rule:
 *   N ≥ 3 consecutive pairs → 'high'
 *   N = 2 pairs             → 'medium'
 *   N = 1 pair              → 'low'
 *   N = 0 pairs             → throws (caller must guard)
 *
 * Research basis:
 *   - LG = 0.571(-ΔDR) + 0.429(ΔPSI) — Kahneman/Edmondson weighted formula
 *   - λ < 0 = bifurcation (maladaptive regime, structural intervention required)
 *   - κ×LG ≤ -0.15 = critical threshold (Hollands et al. 2024)
 */

import type { DsmDiagnosticSnapshot } from '@/types/database'
import {
  analyzeResilience,
  classifyTrajectory,
  PSI_DEFAULT,
  DEFAULT_KAPPA,
} from '@/lib/resilience-formula'
import type { Trajectory } from '@/lib/resilience-formula'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrajectoryPrediction {
  /** λ value for each consecutive snapshot pair */
  lambda_series: number[]
  /** λ from the most recent pair */
  current_lambda: number
  /** Mean λ across all pairs */
  mean_lambda: number
  /** Trend direction based on comparing first half vs second half of lambda_series */
  trend: 'improving' | 'declining' | 'stable'
  /** Trajectory class of current_lambda */
  predicted_trajectory: Trajectory
  /** True when latest κ×LG ≤ -0.15 */
  is_critical: boolean
  /** Confidence based on number of snapshot pairs available */
  confidence: 'high' | 'medium' | 'low'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avg(values: number[]): number {
  if (values.length === 0) return 1
  return values.reduce((a, b) => a + b, 0) / values.length
}

function detectTrend(lambdaSeries: number[]): TrajectoryPrediction['trend'] {
  if (lambdaSeries.length < 2) return 'stable'

  const mid = Math.floor(lambdaSeries.length / 2)
  const firstHalf = lambdaSeries.slice(0, mid)
  const secondHalf = lambdaSeries.slice(mid)

  if (firstHalf.length === 0) return 'stable'

  const avgFirst = avg(firstHalf)
  const avgSecond = avg(secondHalf)
  const delta = avgSecond - avgFirst

  if (delta > 0.05) return 'improving'
  if (delta < -0.05) return 'declining'
  return 'stable'
}

function mapConfidence(pairCount: number): TrajectoryPrediction['confidence'] {
  if (pairCount >= 3) return 'high'
  if (pairCount >= 2) return 'medium'
  return 'low'
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Compute trajectory prediction from an array of DSM snapshots.
 *
 * @param snapshots   2+ snapshots for the same org, sorted ascending by created_at.
 *                    If fewer than 2 are provided, returns a stable/low-confidence result.
 * @param kappa       Learning absorption coefficient (default 0.5).
 */
export function computeTrajectory(
  snapshots: Pick<
    DsmDiagnosticSnapshot,
    'score_dr' | 'score_nd' | 'psi_score' | 'j_quotient' | 'created_at'
  >[],
  kappa = DEFAULT_KAPPA
): TrajectoryPrediction {
  // Need at least 2 snapshots to compute one pair
  if (snapshots.length < 2) {
    return {
      lambda_series: [],
      current_lambda: 1,
      mean_lambda: 1,
      trend: 'stable',
      predicted_trajectory: 'stable',
      is_critical: false,
      confidence: 'low',
    }
  }

  // Sort by created_at ascending (caller should pass sorted, but guard anyway)
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const lambdaSeries: number[] = []
  let latestIsCritical = false

  for (let i = 0; i < sorted.length - 1; i++) {
    const prev = sorted[i]
    const curr = sorted[i + 1]

    const delta_dr = curr.score_dr - prev.score_dr
    const delta_psi =
      (curr.psi_score ?? PSI_DEFAULT) - (prev.psi_score ?? PSI_DEFAULT)

    const result = analyzeResilience({ delta_dr, delta_psi, kappa })
    lambdaSeries.push(result.lambda)

    if (i === sorted.length - 2) {
      latestIsCritical = result.is_critical
    }
  }

  const current_lambda = lambdaSeries[lambdaSeries.length - 1]
  const mean_lambda = avg(lambdaSeries)

  return {
    lambda_series: lambdaSeries,
    current_lambda,
    mean_lambda,
    trend: detectTrend(lambdaSeries),
    predicted_trajectory: classifyTrajectory(current_lambda),
    is_critical: latestIsCritical,
    confidence: mapConfidence(lambdaSeries.length),
  }
}
