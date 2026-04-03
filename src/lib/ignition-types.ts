/** \u05D8\u05D9\u05E4\u05D5\u05E1\u05D9\u05DD \u05D5\u05E7\u05D1\u05D5\u05E2\u05D9\u05DD \u05DC\u05E9\u05D0\u05DC\u05D5\u05DF \u05D4\u05EA\u05E0\u05E2\u05D4 — \u05DC\u05DC\u05D0 \u05EA\u05DC\u05D5\u05EA \u05D1-corsys-questionnaire */

export const IGNITION_PRIMARY_VECTORS = [
  'internal_push',
  'market_pull',
  'capital_blitz',
  'momentum_transfer',
] as const
export type IgnitionPrimaryVector = (typeof IGNITION_PRIMARY_VECTORS)[number]

export const IGNITION_DOMINANT_TRAPS = [
  'prep_trap',
  'over_learn',
  'free_value',
  'busy_motion',
  'none_clear',
] as const
export type IgnitionDominantTrap = (typeof IGNITION_DOMINANT_TRAPS)[number]

export const IGNITION_COMMERCIAL_ASKS = [
  'within_7d',
  'within_30d',
  'within_90d',
  'over_90d',
  'never_recent',
] as const
export type IgnitionCommercialAsk = (typeof IGNITION_COMMERCIAL_ASKS)[number]

export const IGNITION_LIFECYCLE_STAGES = [
  'early_under_1y',
  'one_to_three',
  'three_plus',
  'prefer_not',
] as const
export type IgnitionLifecycleStage = (typeof IGNITION_LIFECYCLE_STAGES)[number]

export type IgnitionUrgency = 'low' | 'medium' | 'high'

export type IgnitionFirstMoveTag =
  | 'direct_commercial_touch'
  | 'smallest_paid_ask'
  | 'validate_demand_fast'
  | 'bricolage_next_step'
  | 'attach_external_wave'
  | 'focus_single_offer'

export type IgnitionProfile = {
  primaryVector: IgnitionPrimaryVector
  dominantTrap: IgnitionDominantTrap
  lastCommercialAsk: IgnitionCommercialAsk
  lifecycleStage?: IgnitionLifecycleStage
  urgency: IgnitionUrgency
  firstMoveTag: IgnitionFirstMoveTag
  narrativeHe: string
  firstMoveHe: string
  suggestsSprintNudge: boolean
}

/** \u05E9\u05D3\u05D5\u05EA \u05E9\u05D0\u05DC\u05D5\u05DF \u05E0\u05D3\u05E8\u05E9\u05D9\u05DD \u05DC\u05BEcomputeIgnitionProfile — \u05DC\u05DC\u05D0 \u05D9\u05D9\u05D1\u05D5\u05D0 \u05DE\u05BEcorsys-questionnaire */
export type IgnitionAnswerFields = {
  operatingContext?: 'team' | 'one_man_show'
  ignitionPrimaryVector?: IgnitionPrimaryVector
  ignitionDominantTrap?: IgnitionDominantTrap
  ignitionLastCommercialAsk?: IgnitionCommercialAsk
  ignitionLifecycleStage?: IgnitionLifecycleStage
}
