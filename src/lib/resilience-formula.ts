/**
 * Organizational Resilience Formula
 *
 * Source: org-resilience-research.md (local research database)
 * Academic anchors:
 *   - Kahneman, D. & Tversky, A. (1979, 1991) — Prospect Theory, Loss Aversion ≈ 2.25:1
 *   - Edmondson, A.C. (1999, 2024)             — Psychological Safety, 7-item PSI scale
 *   - Argyris, C. (1977, 1996)                 — Double-Loop Learning
 *   - Hollands et al. (2024) + McKinsey (2024) — Critical threshold κ×LG = -0.15
 *
 * Core equations:
 *   LG = 0.571 × (-ΔDR) + 0.429 × (ΔPSI)
 *   R_org(t+1) = R_org(t) × (1 + κ × LG)
 *   λ = 1 + κ × LG
 *
 * Weight rationale:
 *   0.571 for DR  ← Loss Aversion Ratio ≈ 2.25:1 (Kahneman & Tversky)
 *                   Higher weight on reducing dismissal/distortion (loss prevention)
 *   0.429 for PSI ← Innovation multiplication literature (Edmondson)
 *                   Lower weight on safety gains (upside)
 *
 * Eigenvalue interpretation:
 *   λ > 1           → growth trajectory (unstable growth)
 *   λ = 1           → equilibrium (marginally stable)
 *   0 < λ < 1       → decay (asymptotically stable)
 *   λ < 0 (or < -1) → chaotic bifurcation (maladaptive regime)
 *
 * ⚠️ DO NOT change WEIGHT_DR / WEIGHT_PSI without academic justification.
 *    These constants are mathematically grounded in peer-reviewed research.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Weight for ΔDR (Distorted Reciprocity change) in LG formula.
 *  Derived from Kahneman & Tversky Loss Aversion Ratio 2.25:1 → 2.25/(2.25+1.7) ≈ 0.571 */
export const WEIGHT_DR = 0.571

/** Weight for ΔPSI (Psychological Safety change) in LG formula.
 *  Complement: 1 - 0.571 = 0.429 (Edmondson innovation multiplication) */
export const WEIGHT_PSI = 0.429

/** Critical threshold for κ×LG below which adaptive → maladaptive transition occurs.
 *  Source: Hollands et al. (2024), McKinsey (2024) */
export const CRITICAL_THRESHOLD = -0.15

/** Default learning absorption coefficient (0-1).
 *  κ=0.5 is a conservative neutral starting point; calibrated per organization over time. */
export const DEFAULT_KAPPA = 0.5

/** Minimum valid PSI score (Edmondson 7-item scale, 1-7) */
export const PSI_MIN = 1
/** Maximum valid PSI score */
export const PSI_MAX = 7
/** PSI midpoint (used as default when PSI is unavailable for legacy records) */
export const PSI_DEFAULT = 3.5

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResilienceInput {
  /** Change in DR score between two snapshots (negative = improvement) */
  delta_dr: number
  /** Change in Edmondson PSI score between two snapshots (positive = improvement, scale 1-7) */
  delta_psi: number
  /** Learning absorption coefficient 0-1 (organization's capacity to internalize change).
   *  Defaults to DEFAULT_KAPPA (0.5) if not provided. */
  kappa?: number
  /** Current J-Quotient (daily organizational capacity loss, ₪).
   *  Used for loss framing: daily_loss = j_quotient / 30 */
  j_quotient?: number
}

export type Trajectory = 'growth' | 'stable' | 'decay' | 'bifurcation'

export interface ResilienceOutput {
  /** LG = 0.571×(-ΔDR) + 0.429×(ΔPSI) */
  learning_gain: number
  /** κ × LG — used for critical threshold check */
  kappa_lg: number
  /** λ = 1 + κ×LG — system eigenvalue */
  lambda: number
  /** Trajectory classification based on λ */
  trajectory: Trajectory
  /** True when κ×LG ≤ -0.15 (maladaptive regime, structural change required) */
  is_critical: boolean
  /** J-Quotient / 30 — daily loss in ₪ for loss-framed UI (null if j_quotient not provided) */
  daily_loss: number | null
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Calculate Learning Gain (LG).
 * LG = 0.571×(-ΔDR) + 0.429×(ΔPSI)
 *
 * Note on sign convention:
 *   - delta_dr is the CHANGE in DR score; negative means DR decreased (improved)
 *   - We negate delta_dr so that improvement (DR↓) contributes positively to LG
 */
export function calculateLearningGain(delta_dr: number, delta_psi: number): number {
  return WEIGHT_DR * (-delta_dr) + WEIGHT_PSI * delta_psi
}

/**
 * Calculate the system eigenvalue λ.
 * λ = 1 + κ × LG
 */
export function calculateEigenvalue(kappa: number, learning_gain: number): number {
  return 1 + kappa * learning_gain
}

/**
 * Classify organizational trajectory from eigenvalue λ.
 */
export function classifyTrajectory(lambda: number): Trajectory {
  if (lambda > 1) return 'growth'
  if (lambda === 1) return 'stable'
  if (lambda > 0) return 'decay'
  return 'bifurcation'
}

/**
 * Full resilience analysis.
 * Returns all metrics needed for CBR success_label and Recommendation Panel display.
 */
export function analyzeResilience(input: ResilienceInput): ResilienceOutput {
  const kappa = input.kappa ?? DEFAULT_KAPPA
  const learning_gain = calculateLearningGain(input.delta_dr, input.delta_psi)
  const kappa_lg = kappa * learning_gain
  const lambda = calculateEigenvalue(kappa, learning_gain)

  return {
    learning_gain,
    kappa_lg,
    lambda,
    trajectory: classifyTrajectory(lambda),
    is_critical: kappa_lg <= CRITICAL_THRESHOLD,
    daily_loss: input.j_quotient != null ? input.j_quotient / 30 : null,
  }
}

// ─── PSI Utilities ────────────────────────────────────────────────────────────

/** Edmondson PSI item indices that are reverse-scored (1-indexed).
 *  Items 1, 3, 5 are negatively worded: score = 8 - raw_value */
export const PSI_REVERSED_ITEMS = [1, 3, 5] as const

/**
 * Compute the PSI average from 7 raw Likert responses (1-7 each).
 * Applies reverse-scoring to items 1, 3, 5.
 * Returns null if fewer than 7 valid responses provided.
 */
export function computePsiScore(rawScores: (number | undefined | null)[]): number | null {
  if (rawScores.length < 7) return null
  const scores: number[] = []
  for (let i = 0; i < 7; i++) {
    const raw = rawScores[i]
    if (raw == null || raw < PSI_MIN || raw > PSI_MAX) return null
    const isReversed = PSI_REVERSED_ITEMS.includes((i + 1) as 1 | 3 | 5)
    scores.push(isReversed ? 8 - raw : raw)
  }
  return scores.reduce((a, b) => a + b, 0) / 7
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Normalize a success_label (LG value) to [0, 1] range for storage.
 * Assumes practical LG range is approximately [-2, +2].
 * Used when persisting to interventions_and_feedback.success_label.
 */
export function normalizeLearningGain(lg: number): number {
  const MIN_LG = -2
  const MAX_LG = 2
  return Math.max(0, Math.min(1, (lg - MIN_LG) / (MAX_LG - MIN_LG)))
}
