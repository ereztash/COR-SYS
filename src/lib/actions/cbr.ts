'use server'

/**
 * CBR Server Actions — Phase 3 write path
 *
 * saveIntervention  — consultant records which CTA was applied (with optional override)
 * saveFollowup      — consultant records post-intervention outcomes (δ metrics)
 *                     → auto-computes learning_gain, λ, success_label
 *
 * Patterns follow src/lib/actions/assessments.ts:
 *   - createClient from @/lib/supabase/server (SSR)
 *   - revalidatePath after writes
 *   - Explicit typed insert payloads (no @ts-expect-error needed — no jsonb columns in CBR tables)
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InterventionAndFeedbackInsert } from '@/types/database'
import { analyzeResilience, normalizeLearningGain } from '@/lib/resilience-formula'

// ─── saveIntervention ────────────────────────────────────────────────────────

export interface SaveInterventionPayload {
  snapshot_id: string
  recommended_cta: string
  actual_cta: string
  override_reason?: string | null
  clientId: string  // for revalidatePath only — not stored
}

export async function saveIntervention(
  payload: SaveInterventionPayload
): Promise<{ ok: boolean; intervention_id?: string; error?: string }> {
  const supabase = await createClient()

  const insert: InterventionAndFeedbackInsert = {
    snapshot_id: payload.snapshot_id,
    recommended_cta: payload.recommended_cta,
    actual_cta: payload.actual_cta,
    consultant_override: payload.actual_cta !== payload.recommended_cta,
    override_reason: payload.override_reason ?? null,
  }

  const { data, error } = await supabase
    .from('interventions_and_feedback')
    // @ts-expect-error Postgrest SSR generic infers insert as never for CBR tables
    .insert(insert)
    .select('intervention_id')
    .single()

  if (error) return { ok: false, error: error.message }

  const intervention_id = (data as { intervention_id?: string } | null)?.intervention_id
  revalidatePath(`/clients/${payload.clientId}`)
  return { ok: true, intervention_id }
}

// ─── saveFollowup ─────────────────────────────────────────────────────────────

export interface SaveFollowupPayload {
  intervention_id: string
  /** New DR score (post-intervention) */
  new_score_dr: number
  /** Previous DR score (pre-intervention, from original snapshot) */
  prev_score_dr: number
  /** New PSI score (post-intervention, 1-7) */
  new_psi_score: number | null
  /** Previous PSI score (1-7) */
  prev_psi_score: number | null
  /** Change in J-Quotient */
  delta_j_quotient?: number | null
  /** Change in total entropy */
  delta_entropy?: number | null
  /** κ coefficient for this org (defaults to 0.5) */
  kappa?: number
  clientId: string  // for revalidatePath only
}

export async function saveFollowup(
  payload: SaveFollowupPayload
): Promise<{ ok: boolean; learning_gain?: number; lambda?: number; error?: string }> {
  const supabase = await createClient()

  const delta_dr = payload.new_score_dr - payload.prev_score_dr
  const delta_psi =
    (payload.new_psi_score ?? 3.5) - (payload.prev_psi_score ?? 3.5)

  const resilience = analyzeResilience({
    delta_dr,
    delta_psi,
    kappa: payload.kappa,
  })

  const success_label = normalizeLearningGain(resilience.learning_gain)

  const update: Partial<InterventionAndFeedbackInsert> = {
    followup_date: new Date().toISOString(),
    delta_dr,
    delta_psi,
    delta_j_quotient: payload.delta_j_quotient ?? null,
    delta_entropy: payload.delta_entropy ?? null,
    learning_gain: resilience.learning_gain,
    lambda_eigenvalue: resilience.lambda,
    success_label,
  }

  const { error } = await supabase
    .from('interventions_and_feedback')
    // @ts-expect-error Postgrest SSR generic infers update as never for CBR tables
    .update(update)
    .eq('intervention_id', payload.intervention_id)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/clients/${payload.clientId}`)
  revalidatePath(`/clients/${payload.clientId}/followup`)
  return {
    ok: true,
    learning_gain: resilience.learning_gain,
    lambda: resilience.lambda,
  }
}
