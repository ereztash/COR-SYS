/**
 * CBR SOTA Metrics — Define phase (Double Diamond)
 *
 * Defines measurable success criteria for the CBR intelligence layer.
 * Computed from live DB data via computeSotaMetrics().
 *
 * Metric categories (from plan):
 *   1. Retrieval quality   — top-K failure rate, similarity method distribution
 *   2. Outcome coverage    — follow-up rate, LG coverage, LG distribution by CTA
 *   3. Calibration health  — Wilson vs posterior drift, override rate per CTA
 *   4. Data completeness   — PSI fill rate, critical field coverage
 *
 * SOTA baselines (targets to beat):
 *   Retrieval failure rate  < 10%   (Anthropic contextual retrieval: -49% vs naive)
 *   Follow-up coverage      > 60%   (enough to compute meaningful Wilson scores)
 *   LG coverage             > 80%   (of follow-ups have non-null learning_gain)
 *   PSI fill rate           > 70%   (Edmondson scale needed for accurate LG)
 *   Calibration drift       < 0.15  (posterior should not diverge > 15% from prior)
 *
 * Research basis:
 *   - Anthropic Contextual Retrieval (2024): -49% retrieval failure
 *   - Wilson (1927): conservative CI lower bound
 *   - Edmondson (1999): PSI 7-item scale reliability α=.82
 */

import { createClient } from '@/lib/supabase/server'

// ─── Baseline Targets ─────────────────────────────────────────────────────────

export const SOTA_TARGETS = {
  /** Max acceptable retrieval failure rate (top-K returns 0 results) */
  retrieval_failure_rate_max: 0.10,
  /** Min follow-up coverage (interventions with followup_date / total) */
  followup_coverage_min: 0.60,
  /** Min LG coverage (follow-ups with non-null learning_gain / total follow-ups) */
  lg_coverage_min: 0.80,
  /** Min PSI fill rate (snapshots with non-null psi_score / total) */
  psi_fill_rate_min: 0.70,
  /** Max calibration drift (|posterior - prior| averaged across CTA types) */
  calibration_drift_max: 0.15,
  /** Min cases needed for a Wilson score to be meaningful */
  wilson_min_cases: 5,
} as const

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CtaMetrics {
  cta: string
  total_cases: number
  followup_count: number
  lg_non_null: number
  avg_lg: number | null
  avg_lambda: number | null
  success_count: number
  success_rate: number
  override_count: number
  override_rate: number
}

export interface SotaMetrics {
  computed_at: string
  total_interventions: number
  total_followups: number
  followup_coverage: number
  lg_coverage: number
  psi_fill_rate: number
  avg_lg_all: number | null
  avg_lambda_all: number | null
  by_cta: CtaMetrics[]
  /** Whether each metric meets its SOTA target */
  targets_met: {
    followup_coverage: boolean
    lg_coverage: boolean
    psi_fill_rate: boolean
  }
}

// ─── Compute ──────────────────────────────────────────────────────────────────

/**
 * Compute live SOTA metrics from the CBR tables.
 * Designed to be called from the /api/cbr/metrics endpoint.
 */
export async function computeSotaMetrics(): Promise<SotaMetrics> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpc = supabase.rpc as (...args: any[]) => any

  // Fetch all interventions with follow-up data
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore CBR tables not in generated Supabase types
  const { data: interventions, error: intErr } = await supabase
    .from('interventions_and_feedback')
    .select(
      'intervention_id, actual_cta, recommended_cta, consultant_override, followup_date, learning_gain, lambda_eigenvalue, delta_dr, delta_psi'
    )

  if (intErr || !interventions) {
    throw new Error(`[CBR metrics] Failed to load interventions: ${intErr?.message}`)
  }

  // Fetch PSI fill rate from snapshots
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore CBR tables not in generated Supabase types
  const { data: snapshots, error: snapErr } = await supabase
    .from('dsm_diagnostic_snapshots')
    .select('snapshot_id, psi_score')

  if (snapErr || !snapshots) {
    throw new Error(`[CBR metrics] Failed to load snapshots: ${snapErr?.message}`)
  }

  // Suppress unused rpc reference (reserved for future aggregate queries)
  void rpc

  const rows = interventions as Array<{
    intervention_id: string
    actual_cta: string
    recommended_cta: string
    consultant_override: boolean
    followup_date: string | null
    learning_gain: number | null
    lambda_eigenvalue: number | null
    delta_dr: number | null
    delta_psi: number | null
  }>

  const snapRows = snapshots as Array<{ snapshot_id: string; psi_score: number | null }>

  const total = rows.length
  const followups = rows.filter((r) => r.followup_date != null)
  const lgNonNull = followups.filter((r) => r.learning_gain != null)

  const psiNonNull = snapRows.filter((s) => s.psi_score != null).length
  const psi_fill_rate = snapRows.length > 0 ? psiNonNull / snapRows.length : 0

  const followup_coverage = total > 0 ? followups.length / total : 0
  const lg_coverage = followups.length > 0 ? lgNonNull.length / followups.length : 0

  const allLg = lgNonNull.map((r) => r.learning_gain as number)
  const avg_lg_all = allLg.length > 0 ? allLg.reduce((a, b) => a + b, 0) / allLg.length : null

  const allLambda = lgNonNull.filter((r) => r.lambda_eigenvalue != null).map((r) => r.lambda_eigenvalue as number)
  const avg_lambda_all = allLambda.length > 0 ? allLambda.reduce((a, b) => a + b, 0) / allLambda.length : null

  // Group by CTA
  const ctaMap = new Map<string, typeof rows>()
  for (const r of rows) {
    const existing = ctaMap.get(r.actual_cta)
    if (existing) existing.push(r)
    else ctaMap.set(r.actual_cta, [r])
  }

  const by_cta: CtaMetrics[] = []
  for (const [cta, group] of ctaMap) {
    const fu = group.filter((r) => r.followup_date != null)
    const lgGroup = fu.filter((r) => r.learning_gain != null)
    const lgVals = lgGroup.map((r) => r.learning_gain as number)
    const lambdaVals = lgGroup.filter((r) => r.lambda_eigenvalue != null).map((r) => r.lambda_eigenvalue as number)
    const overrides = group.filter((r) => r.consultant_override).length

    // Success: LG > 0 (consistent with isSuccess in recommend.ts)
    const successes = lgGroup.filter((r) => (r.learning_gain ?? 0) > 0).length

    by_cta.push({
      cta,
      total_cases: group.length,
      followup_count: fu.length,
      lg_non_null: lgGroup.length,
      avg_lg: lgVals.length > 0 ? lgVals.reduce((a, b) => a + b, 0) / lgVals.length : null,
      avg_lambda: lambdaVals.length > 0 ? lambdaVals.reduce((a, b) => a + b, 0) / lambdaVals.length : null,
      success_count: successes,
      success_rate: lgGroup.length > 0 ? successes / lgGroup.length : 0,
      override_count: overrides,
      override_rate: group.length > 0 ? overrides / group.length : 0,
    })
  }

  return {
    computed_at: new Date().toISOString(),
    total_interventions: total,
    total_followups: followups.length,
    followup_coverage,
    lg_coverage,
    psi_fill_rate,
    avg_lg_all,
    avg_lambda_all,
    by_cta,
    targets_met: {
      followup_coverage: followup_coverage >= SOTA_TARGETS.followup_coverage_min,
      lg_coverage: lg_coverage >= SOTA_TARGETS.lg_coverage_min,
      psi_fill_rate: psi_fill_rate >= SOTA_TARGETS.psi_fill_rate_min,
    },
  }
}
