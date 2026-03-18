/**
 * CBR Bayesian Calibration Module — Phase 3
 *
 * Updates per-intervention-type success priors as new follow-up observations arrive.
 * Implements Tier 1 (pure functions, no DB persistence).
 * Tier 2 (persist priors to calibration_priors table) is a future extension.
 *
 * Research basis:
 *   - Bayes (1763) theorem: Posterior ∝ Prior × Likelihood
 *   - Analogous to ACC-Insula Prediction Error loop (meta-research-engine.md)
 *   - Wilson (1927) score as prior initialization
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalibrationInput {
  /** Intervention identifier (e.g., 'sprint', 'retainer', 'live-demo') */
  rule_id: string
  /**
   * Current belief about success rate (0–1).
   * Clamped to [0.01, 0.99] to prevent prior from becoming absorbing.
   */
  prior_success_rate: number
  /** Did the intervention succeed this time? */
  new_observation: boolean
  /** Optional: industry-specific sub-calibration (future use) */
  industry?: string
}

export interface CalibrationResult {
  rule_id: string
  prior: number
  posterior: number
  /** How many observations have been incorporated (tracked externally) */
  calibration_needed: boolean  // true when posterior diverges > 0.2 from prior
}

// ─── Bayesian Update ──────────────────────────────────────────────────────────

/**
 * Clamp prior to (0, 1) exclusive to prevent degenerate posteriors.
 * A prior of 0 or 1 would make Bayesian update trivially absorbing.
 */
function clampPrior(p: number): number {
  return Math.max(0.01, Math.min(0.99, p))
}

/**
 * Single Bayesian update: Prior × Likelihood → Posterior.
 *
 * Likelihood model (Bernoulli):
 *   P(observation=true  | success) = prior
 *   P(observation=false | failure) = 1 - prior
 *
 * P(success | observation) = (prior × L_success) /
 *   (prior × L_success + (1-prior) × L_failure)
 *
 * where L_success = likelihood of this outcome given it was a success
 *       L_failure = likelihood of this outcome given it was a failure
 */
export function bayesianUpdate(prior: number, observation: boolean): number {
  const p = clampPrior(prior)
  const likelihoodSuccess = observation ? p : (1 - p)
  const likelihoodFailure = observation ? (1 - p) : p
  const posterior =
    (p * likelihoodSuccess) / (p * likelihoodSuccess + (1 - p) * likelihoodFailure)
  return Math.max(0.01, Math.min(0.99, posterior))
}

/**
 * Apply a Bayesian update from a CalibrationInput and return structured result.
 */
export function calibrate(input: CalibrationInput): CalibrationResult {
  const prior = clampPrior(input.prior_success_rate)
  const posterior = bayesianUpdate(prior, input.new_observation)

  return {
    rule_id: input.rule_id,
    prior,
    posterior,
    calibration_needed: Math.abs(posterior - prior) > 0.2,
  }
}

// ─── Batch Calibration ────────────────────────────────────────────────────────

/**
 * Apply multiple observations to a single prior in sequence.
 * Each observation updates the prior for the next — reflects Bayesian sequential updating.
 *
 * @param prior     Starting success rate belief
 * @param outcomes  Array of boolean outcomes (true = success)
 * @returns         Final posterior after all observations
 */
export function batchCalibrate(prior: number, outcomes: boolean[]): number {
  return outcomes.reduce((p, obs) => bayesianUpdate(p, obs), prior)
}

// ─── Override Rate Calibration (consultant feedback path) ────────────────────

export interface OverrideSignal {
  intervention_type: string
  total_sessions: number
  override_count: number
  avg_confidence: number
}

/**
 * Compute override rate per intervention type from consultant feedback records.
 * High override rate (> 0.3) signals the prior for that intervention is miscalibrated.
 *
 * Mirrors computeCalibrationSignals from dsm-policy-engine.ts but operates
 * on CBR outcome data rather than rule-based engine data.
 */
export function computeOverrideSignals(
  records: Array<{
    actual_cta: string
    recommended_cta: string
    consultant_override: boolean
  }>
): OverrideSignal[] {
  const grouped = new Map<string, typeof records>()
  for (const r of records) {
    const key = r.recommended_cta
    const existing = grouped.get(key)
    if (existing) existing.push(r)
    else grouped.set(key, [r])
  }

  const signals: OverrideSignal[] = []
  for (const [intervention_type, group] of grouped) {
    const overrides = group.filter((r) => r.consultant_override).length
    signals.push({
      intervention_type,
      total_sessions: group.length,
      override_count: overrides,
      avg_confidence: group.length > 0 ? (group.length - overrides) / group.length : 0,
    })
  }
  return signals
}
