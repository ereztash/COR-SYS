/**
 * Shared utilities for the CBR module.
 * Imported by recommend.ts, trajectory.ts, and calibration.ts.
 */

// ─── Null-safe average ────────────────────────────────────────────────────────

/** Returns null when the array is empty or contains only null/undefined values. */
export function avg(values: (number | null | undefined)[]): number | null {
  const valid = values.filter((v): v is number => v != null)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

// ─── Success Criteria Thresholds (cbr-execution-roadmap.md Step 3.1) ─────────

/** A case is successful if entropy dropped by more than this amount. */
export const SUCCESS_ENTROPY_DELTA = -1.5

/** A case is successful if J-Quotient recovered by more than this fraction. */
export const SUCCESS_J_QUOTIENT_THRESHOLD = 0.05

/**
 * When follow-up omits optional ΔEntropy / ΔJ, Wilson grouping still uses LG from ΔDR/ΔPSI.
 * Success if learning gain is strictly above this (positive organizational outcome).
 */
export const SUCCESS_LEARNING_GAIN_MIN = 0

// ─── Wilson Score Confidence Thresholds ───────────────────────────────────────

export const CONFIDENCE_HIGH_THRESHOLD = 0.6
export const CONFIDENCE_MEDIUM_THRESHOLD = 0.35
export const CONFIDENCE_LOW_THRESHOLD = 0.1

// ─── Trajectory Trend Detection ───────────────────────────────────────────────

/** λ delta between first/second half of series needed to call a trend. */
export const LAMBDA_TREND_THRESHOLD = 0.05

// ─── Jensen-Shannon Similarity ────────────────────────────────────────────────
// Used by the score-based KL fallback in similarity.ts when feature_vectors are NULL.
//
// Math basis: Information Geometry (Amari 2016)
// JSD(P||Q) = (KL(P||M) + KL(Q||M)) / 2,  M = (P+Q)/2
// JSD ∈ [0, ln2] — bounded, symmetric, defined even when p_i = 0 (unlike raw KL).
// Similarity = 1 - JSD/ln(2)  → [0, 1], higher = more similar.
//
// Iteration 3 insight: normalizing scores alone loses absolute severity information.
// We use a 6-dim HYBRID vector: [dr/sum, nd/sum, uc/sum, dr/10, nd/10, uc/10]
// so both proportional shape AND absolute level contribute to the distance.

const LN2 = Math.LN2

/** KL(P || Q) — raw, requires M = (P+Q)/2 to guarantee no division by zero. */
function klRaw(p: number[], q: number[]): number {
  return p.reduce((sum, pi, i) => {
    if (pi === 0) return sum
    return sum + pi * Math.log(pi / q[i])
  }, 0)
}

/**
 * Jensen-Shannon Divergence between two probability distributions.
 * Input arrays must have equal length and non-negative values.
 * Returns a value in [0, ln2].
 */
export function jensenShannon(p: number[], q: number[]): number {
  const m = p.map((pi, i) => (pi + q[i]) / 2)
  return (klRaw(p, m) + klRaw(q, m)) / 2
}

/**
 * Normalize a score vector to a probability distribution (sums to 1).
 * Pads with a small epsilon to keep all values > 0.
 * Returns a uniform distribution if all scores are zero.
 */
function toDistribution(scores: number[]): number[] {
  const sum = scores.reduce((a, b) => a + b, 0)
  if (sum === 0) return scores.map(() => 1 / scores.length)
  return scores.map((s) => s / sum)
}

/**
 * Hybrid 6-dimensional similarity between two snapshot score sets.
 *
 * Combines:
 *  - JSD on normalized [dr, nd, uc, psi_norm] (captures pathological shape)
 *  - L2 distance on absolute [dr/10, nd/10, uc/10, psi_norm] (captures severity level)
 *
 * Returns similarity ∈ [0, 1], higher = more similar.
 *
 * @param a  Query scores: [dr, nd, uc, psi_normalized]
 * @param b  Candidate scores: same format
 */
export function hybridScoreSimilarity(a: number[], b: number[]): number {
  // JSD component (shape similarity)
  const pa = toDistribution(a)
  const pb = toDistribution(b)
  const jsd = jensenShannon(pa, pb)
  const jsdSim = 1 - jsd / LN2 // normalize to [0, 1]

  // L2 component (absolute severity similarity)
  const l2 = Math.sqrt(a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0))
  // Max possible L2 on [0,1]^4 = 2, so normalize by 2
  const l2Sim = Math.max(0, 1 - l2 / 2)

  // Equal-weight blend
  return (jsdSim + l2Sim) / 2
}

/** PSI default (Edmondson scale midpoint, normalized to [0,1]). */
export const PSI_NORM_DEFAULT = (4.0 - 1) / 6 // ≈ 0.5
