/**
 * COR-SYS Action Plan Knowledge Graph
 *
 * Intervention taxonomy (per COR-SYS sprint methodology):
 *   P1 — "\u05D7\u05D5\u05E1\u05DD \u05E2\u05D5\u05E8\u05E7\u05D9\u05DD"      (14d)  minimal effort / maximum bleeding-stop
 *   P2 — "\u05D4\u05D6\u05E8\u05E7\u05EA \u05DC\u05D5\u05D2\u05D9\u05E7\u05D4"     (30d)  structural change to the pattern
 *   P3 — "\u05D0\u05E8\u05DB\u05D9\u05D8\u05E7\u05D8\u05D5\u05E8\u05EA \u05D7\u05D5\u05E1\u05DF"  (90d)  prevents recurrence at system level
 *
 * Each intervention carries:
 *   tam_impact         — which cost axis (T/A/M) it targets
 *   applicable_profiles — which severity levels it is calibrated for
 *   target_pathologies  — which DSM-Org types it directly addresses
 *
 * buildActionPlan() now uses BOTH axis (DR/ND/UC) AND pathology type (NOD/ZSG/OLD/CLT/CS)
 * to select the most contextually precise interventions.
 *
 * Theoretical grounding:
 *   DR → Hobfoll COR resource-loss spiral, decision-latency tax
 *   ND → Vaughan Normalization of Deviance, Argyris Double-Loop Learning
 *   UC → Cognitive Load Theory (Sweller), key-person dependency, Miluim Multiplier
 *   ZSG → Edmondson Psychological Safety, Rousseau Psychological Contract
 *   CS → Hobfoll Loss Spiral, MBI Emotional Exhaustion
 */

import type { DiagnosticAxis } from './questions'
import type { PathologyProfile, PathologyType } from './pathology-kb'

export type InterventionHorizon = '14d' | '30d' | '90d'
export type InterventionPriority = 1 | 2 | 3
export type EvidenceLevel = 'high' | 'contextual' | 'gap'

export interface TamImpact {
  t: 1 | 2 | 3   // how strongly this intervention reduces Time cost (1=low, 3=high)
  a: 1 | 2 | 3   // Attention
  m: 1 | 2 | 3   // Money
}

/**
 * ConstraintEnvelope — binary gate applied BEFORE IUS scoring.
 *   t_max: maximum horizon in days the org can commit to
 *   r_max: change-fatigue level (1=ready for change, 5=exhausted)
 */
export interface ConstraintEnvelope {
  t_max: 30 | 60 | 90
  r_max: 1 | 2 | 3 | 4 | 5
  /** Max intervention budget index (optional; reserved for future IUS / cost gating). */
  b_max?: number
}

/**
 * IUSScore — result of computeIUS() per intervention.
 *   raw:              weighted sum of IAM+AIM+FIM+Impact (1.0–5.0 scale)
 *   score:            normalised 0–100, with MVC penalty applied
 *   constraint_penalty: points deducted for MVC revision
 *   mvc_revised:      true if intervention was revised to fit constraints
 *   mvc_description:  Hebrew description of the MVC revision
 */
export interface IUSScore {
  raw: number
  score: number
  constraint_penalty: number
  mvc_revised: boolean
  mvc_description?: string
}

export interface ActionPlanItem {
  /** Stable id for snapshots and UI keys (set by unified pipeline). */
  interventionId?: string
  priority: InterventionPriority
  horizon: InterventionHorizon
  axis: DiagnosticAxis
  title_he: string
  what_he: string
  why_he: string
  metric_he: string
  tag: string
  tam_impact: TamImpact
  // IUS components — Proctor/Weiner implementation science
  iam: 1 | 2 | 3 | 4 | 5   // Intervention Appropriateness Measure
  aim: 1 | 2 | 3 | 4 | 5   // Acceptability of Intervention Measure
  fim: 1 | 2 | 3 | 4 | 5   // Feasibility of Intervention Measure
  impact: 1 | 2 | 3 | 4 | 5 // Expected effect size (CBR/research grounded)
  _ius?: IUSScore            // populated by computeIUS(); absent on raw items
  applicable_profiles: PathologyProfile[]
  target_pathologies: PathologyType[]
  evidence?: InterventionEvidence
  kpi_stack?: InterventionKpiStack
  /** Short rationale for PDF / UI (Hebrew). */
  narrative_rationale_he?: string
  /** Links to 7×21 content ids when populated. */
  related_content_ids?: string[]
  /** UX tags e.g. Miluim_Multiplier, MVC */
  display_tags?: string[]
  /** Sequencing: item is deferred until prerequisite wave (set by pipeline). */
  sequencing_locked?: boolean
  sequencing_lock_reason_he?: string
}

export interface InterventionEvidence {
  level: EvidenceLevel
  citations: string[]
  evidence_note: string
}

export interface KpiMetric {
  name: string
  horizon: '1-2w' | '4-12w'
}

export interface InterventionKpiStack {
  leading: KpiMetric[]
  lagging: KpiMetric[]
  baseline: string
  cadence: string
  target_range: string
}

export interface TriggerRule {
  id: string
  if_condition: string
  then_action: string
  severity: 'high' | 'medium'
}

export interface GateReview {
  id: 'gate-1' | 'gate-2' | 'gate-3' | 'gate-4'
  week: 2 | 4 | 8 | 12
  title_he: string
  pass_criteria: string[]
}

export interface TriggerEvaluationInput {
  profile: PathologyProfile
  dominantAxis: DiagnosticAxis
  scores: { dr: number; nd: number; uc: number; sc?: number }
  pathologyType?: PathologyType
}

export interface EvidenceProfileRow {
  intervention_tag: string
  evidence_level: EvidenceLevel
  citations: string[]
  evidence_note: string
}

export interface DiagnosticRuntimeConfig {
  triggerRules?: TriggerRule[]
  evidenceProfiles?: EvidenceProfileRow[]
  gateReviews?: GateReview[]
}

// ─── DR Interventions (Decision Latency) ─────────────────────────────────────

const DR_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'DR',
    title_he: '\u05DE\u05D9\u05E0\u05D5\u05D9 Owner \u05D9\u05D7\u05D9\u05D3 \u05DC\u05DB\u05DC \u05D4\u05D7\u05DC\u05D8\u05D4',
    what_he: '\u05DC\u05E8\u05E9\u05D5\u05DD \u05D0\u05EA 5 \u05D4\u05D4\u05D7\u05DC\u05D8\u05D5\u05EA \u05E9\u05E0\u05EA\u05E7\u05E2\u05D5\u05EA \u05D4\u05DB\u05D9 \u05D4\u05E8\u05D1\u05D4. \u05DC\u05DB\u05DC \u05D0\u05D7\u05EA — owner \u05D0\u05D7\u05D3 \u05D1\u05DC\u05D1\u05D3 + SLA \u05E9\u05DC 48 \u05E9\u05E2\u05D5\u05EA. \u05DC\u05E4\u05E8\u05E1\u05DD \u05D1\u05E8\u05E9\u05D9\u05DE\u05D4 \u05E9\u05DB\u05D5\u05DC\u05DD \u05E8\u05D5\u05D0\u05D9\u05DD.',
    why_he: '\u05DC\u05D5\u05DC\u05D0\u05D5\u05EA \u05D0\u05D9\u05E9\u05D5\u05E8 \u05E0\u05D5\u05E6\u05E8\u05D5\u05EA \u05DB\u05E9\u05D0\u05D9\u05DF \u05D1\u05D4\u05D9\u05E8\u05D5\u05EA \u05E2\u05DC \u05DE\u05D9 \u05DE\u05D7\u05DC\u05D9\u05D8. owner \u05DE\u05D5\u05D2\u05D3\u05E8 \u05DE\u05D7\u05D9\u05D9\u05D1 \u05D0\u05D7\u05E8\u05D9\u05D5\u05EA \u05D5\u05DE\u05D1\u05D8\u05DC "\u05D4\u05DE\u05EA\u05E0\u05D4 \u05DC\u05D0\u05D7\u05E8".',
    metric_he: '\u05D6\u05DE\u05DF \u05DE\u05D7\u05D6\u05D5\u05E8 \u05D4\u05D7\u05DC\u05D8\u05D4 \u05EA\u05E4\u05E2\u05D5\u05DC\u05D9\u05EA ≤ 48 \u05E9\u05E2\u05D5\u05EA \u05EA\u05D5\u05DA \u05E9\u05D1\u05D5\u05E2',
    tag: 'Decision Latency',
    tam_impact: { t: 3, a: 2, m: 2 },
    iam: 5, aim: 4, fim: 5, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['NOD', 'CS'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'DR',
    title_he: '\u05D8\u05E7\u05E1\u05D5\u05E0\u05D5\u05DE\u05D9\u05D9\u05EA \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA \u05DC\u05E4\u05D9 \u05D3\u05E8\u05D2',
    what_he: '\u05DC\u05E1\u05D5\u05D5\u05D2 \u05DB\u05DC \u05E1\u05D5\u05D2 \u05D4\u05D7\u05DC\u05D8\u05D4: \u05EA\u05E4\u05E2\u05D5\u05DC\u05D9\u05EA / \u05D8\u05E7\u05D8\u05D9\u05EA / \u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9\u05EA. \u05DC\u05E7\u05D1\u05D5\u05E2 \u05DE\u05D9 \u05DE\u05D5\u05E1\u05DE\u05DA \u05DC\u05D4\u05D7\u05DC\u05D9\u05D8 \u05D1\u05DB\u05DC \u05E8\u05DE\u05D4, \u05D5\u05DC\u05E4\u05E8\u05E1\u05DD \u05D5\u05DC\u05D4\u05DB\u05E9\u05D9\u05E8.',
    why_he: '80% \u05DE\u05D4\u05E1\u05DC\u05DE\u05E6\u05D9\u05D5\u05EA \u05DC-C-suite \u05D4\u05DF \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA \u05EA\u05E4\u05E2\u05D5\u05DC\u05D9\u05D5\u05EA \u05D1\u05EA\u05D7\u05E4\u05D5\u05E9\u05EA \u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9\u05EA. \u05E1\u05D9\u05D5\u05D5\u05D2 \u05DE\u05D5\u05E0\u05E2 \u05D7\u05D9\u05DB\u05D5\u05DA \u05DE\u05D9\u05D5\u05EA\u05E8.',
    metric_he: '\u05D9\u05E8\u05D9\u05D3\u05D4 ≥ 40% \u05D1\u05D4\u05E1\u05DC\u05DE\u05D5\u05EA \u05DC\u05D3\u05E8\u05D2 \u05D4\u05D1\u05DB\u05D9\u05E8 \u05EA\u05D5\u05DA 30 \u05D9\u05D5\u05DD',
    tag: 'Decision Architecture',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 4, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['NOD', 'ZSG_SAFETY', 'ZSG_CULTURE'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'DR',
    title_he: '\u05E4\u05D9\u05E8\u05D5\u05E7 \u05E6\u05D5\u05D5\u05D0\u05E8 \u05D4\u05D1\u05E7\u05D1\u05D5\u05E7 \u05D4\u05DE\u05D1\u05E0\u05D9',
    what_he: '\u05DC\u05D6\u05D4\u05D5\u05EA \u05D0\u05EA \u05D4\u05D7\u05D5\u05DC\u05D9\u05D4 \u05D4\u05D7\u05D5\u05D6\u05E8\u05EA \u05E9\u05E2\u05D5\u05E6\u05E8\u05EA \u05D6\u05E8\u05D9\u05DE\u05EA \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA. \u05DC\u05D1\u05D3\u05D5\u05E7: \u05D4\u05D0\u05DD \u05D6\u05D5 \u05D1\u05E2\u05D9\u05D4 \u05E9\u05DC \u05DE\u05D1\u05E0\u05D4, \u05E9\u05DC \u05D0\u05D9\u05E0\u05E4\u05D5\u05E8\u05DE\u05E6\u05D9\u05D4, \u05D0\u05D5 \u05E9\u05DC \u05D0\u05DE\u05D5\u05DF? \u05DC\u05E9\u05E0\u05D5\u05EA \u05D0\u05EA \u05D4-reporting line \u05D4\u05E8\u05DC\u05D5\u05D5\u05E0\u05D8\u05D9.',
    why_he: '\u05EA\u05D9\u05E7\u05D5\u05DF \u05D8\u05E7\u05D8\u05D9 (owner/SLA) \u05DE\u05E4\u05D7\u05D9\u05EA \u05DB\u05D0\u05D1. \u05EA\u05D9\u05E7\u05D5\u05DF \u05DE\u05D1\u05E0\u05D9 \u05DE\u05D5\u05E0\u05E2 \u05D7\u05D6\u05E8\u05EA\u05D5 — Argyris Double-Loop Learning.',
    metric_he: '\u05D0\u05E4\u05E1 \u05D7\u05D6\u05E8\u05D5\u05EA \u05E2\u05DC \u05D0\u05D5\u05EA\u05D5 \u05E1\u05D5\u05D2 \u05EA\u05E7\u05D9\u05E2\u05D4 \u05D1\u05DE\u05E9\u05DA \u05E8\u05D1\u05E2\u05D5\u05DF',
    tag: 'Structural Fix',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 5, aim: 2, fim: 3, impact: 5,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['NOD', 'OLD'],
  },
]

// ─── ND Interventions (Normalization of Deviance) ────────────────────────────

const ND_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'ND',
    title_he: '\u05D1\u05D9\u05E7\u05D5\u05E8\u05EA Vaughan — \u05E8\u05E9\u05D9\u05DE\u05EA \u05D4\u05E1\u05D8\u05D9\u05D5\u05EA \u05D4\u05E9\u05E7\u05D8\u05D5\u05EA',
    what_he: '\u05DC\u05E9\u05D1\u05EA \u05E2\u05DD \u05D4\u05E6\u05D5\u05D5\u05EA \u05D5\u05DC\u05E8\u05E9\u05D5\u05DD 5 \u05D3\u05D1\u05E8\u05D9\u05DD \u05E9"\u05DB\u05D5\u05DC\u05DD \u05D9\u05D5\u05D3\u05E2\u05D9\u05DD \u05E9\u05DC\u05D0 \u05D1\u05E1\u05D3\u05E8 \u05D0\u05D1\u05DC \u05DC\u05D0 \u05E2\u05D5\u05E6\u05E8\u05D9\u05DD". \u05DC\u05DB\u05DC \u05D0\u05D7\u05D3 — owner + deadline. \u05DC\u05E4\u05E8\u05E1\u05DD \u05D1-public tracker.',
    why_he: '\u05DE\u05EA\u05DF \u05E9\u05DD \u05DC\u05E1\u05D8\u05D9\u05D9\u05D4 \u05E9\u05D5\u05D1\u05E8\u05EA \u05D0\u05EA \u05DC\u05D5\u05DC\u05D0\u05EA \u05D4\u05E0\u05E8\u05DE\u05D5\u05DC. \u05D5\u05D5\u05DF: "\u05EA\u05E7\u05D5\u05E4\u05EA \u05D4\u05D3\u05D2\u05D9\u05E8\u05D4" \u05E0\u05D2\u05DE\u05E8\u05EA \u05DB\u05E9\u05DE\u05D9\u05E9\u05D4\u05D5 \u05E7\u05D5\u05E8\u05D0 \u05DC\u05E1\u05D8\u05D9\u05D9\u05D4 \u05D1\u05E9\u05DE\u05D4.',
    metric_he: '3/5 \u05E1\u05D8\u05D9\u05D5\u05EA \u05E1\u05D2\u05D5\u05E8\u05D5\u05EA \u05EA\u05D5\u05DA 30 \u05D9\u05D5\u05DD',
    tag: 'Normalization of Deviance',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 5, aim: 4, fim: 5, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['NOD'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'ND',
    title_he: '\u05E4\u05E8\u05D5\u05D8\u05D5\u05E7\u05D5\u05DC Post-Mortem \u05D3\u05D5-\u05DC\u05D5\u05DC\u05D0\u05EA\u05D9',
    what_he: '\u05DC\u05D4\u05EA\u05E7\u05D9\u05DF review \u05E7\u05D1\u05D5\u05E2 \u05D0\u05D7\u05E8\u05D9 \u05DB\u05DC \u05D0\u05D9\u05E8\u05D5\u05E2: \u05DC\u05D0 \u05E8\u05E7 "\u05DE\u05D4 \u05E7\u05E8\u05D4" \u05D0\u05DC\u05D0 "\u05D0\u05D9\u05D6\u05D5 \u05D4\u05E0\u05D7\u05D4 \u05DE\u05D5\u05E1\u05D3\u05D9\u05EA \u05D0\u05E4\u05E9\u05E8\u05D4 \u05DC\u05D6\u05D4 \u05DC\u05E7\u05E8\u05D5\u05EA". \u05DC\u05EA\u05E2\u05D3 \u05D5\u05DC\u05E2\u05E7\u05D5\u05D1 \u05D0\u05D7\u05E8\u05D9 \u05E9\u05D9\u05E0\u05D5\u05D9 \u05D4\u05D4\u05E0\u05D7\u05D4.',
    why_he: '\u05DC\u05DE\u05D9\u05D3\u05D4 \u05D7\u05D3-\u05DC\u05D5\u05DC\u05D0\u05EA\u05D9\u05EA \u05DE\u05EA\u05E7\u05E0\u05EA \u05EA\u05E1\u05DE\u05D9\u05E0\u05D9\u05DD. \u05DC\u05DE\u05D9\u05D3\u05D4 \u05D3\u05D5-\u05DC\u05D5\u05DC\u05D0\u05EA\u05D9\u05EA (Argyris) \u05DE\u05EA\u05E7\u05E0\u05EA \u05D4\u05E0\u05D7\u05D5\u05EA — \u05DE\u05D5\u05E0\u05E2\u05EA \u05D4\u05D9\u05E9\u05E0\u05D5\u05EA.',
    metric_he: '\u05E9\u05D9\u05E2\u05D5\u05E8 post-mortem ≥ 80% \u05DE\u05D4\u05D0\u05D9\u05E8\u05D5\u05E2\u05D9\u05DD, \u05E2\u05DD action items \u05E2\u05DD owners',
    tag: 'Double-Loop Learning',
    tam_impact: { t: 2, a: 3, m: 3 },
    iam: 4, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['NOD', 'OLD'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'ND',
    title_he: '\u05D4\u05D8\u05DE\u05E2\u05EA Just Culture Algorithm',
    what_he: '\u05DC\u05D0\u05DE\u05E5 \u05E4\u05E8\u05D5\u05D8\u05D5\u05E7\u05D5\u05DC \u05D4\u05DE\u05D1\u05D3\u05D9\u05DC: \u05D8\u05E2\u05D5\u05EA \u05D0\u05E0\u05D5\u05E9 (→ \u05EA\u05DE\u05D9\u05DB\u05D4 + \u05E9\u05D9\u05E4\u05D5\u05E8 \u05EA\u05D4\u05DC\u05D9\u05DA) / \u05D4\u05EA\u05E0\u05D4\u05D2\u05D5\u05EA \u05DE\u05E1\u05D5\u05DB\u05E0\u05EA (→ \u05D7\u05E0\u05D9\u05DB\u05D4) / \u05E8\u05E9\u05DC\u05E0\u05D5\u05EA (→ \u05E1\u05E0\u05E7\u05E6\u05D9\u05D4). \u05DC\u05D4\u05DB\u05E9\u05D9\u05E8 \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD.',
    why_he: '\u05EA\u05E8\u05D1\u05D5\u05EA \u05D4\u05D0\u05E9\u05DE\u05D4 \u05D4\u05D5\u05E8\u05E1\u05EA \u05D1\u05D9\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9 — \u05D0\u05E0\u05E9\u05D9\u05DD \u05DE\u05E1\u05EA\u05D9\u05E8\u05D9\u05DD \u05EA\u05E7\u05DC\u05D5\u05EA. Just Culture (Edmondson) \u05E9\u05D5\u05DE\u05E8\u05EA \u05D0\u05D7\u05E8\u05D9\u05D5\u05EA \u05DE\u05D1\u05DC\u05D9 \u05DC\u05D4\u05E8\u05D5\u05D2 \u05D3\u05D9\u05D5\u05D5\u05D7 \u05DE\u05D5\u05E7\u05D3\u05DD.',
    metric_he: '\u05E9\u05D9\u05E2\u05D5\u05E8 \u05D3\u05D9\u05D5\u05D5\u05D7 near-miss \u05E2\u05D5\u05DC\u05D4 ≥ \u05E4\u05D9 3 \u05EA\u05D5\u05DA \u05E8\u05D1\u05E2\u05D5\u05DF',
    tag: 'Just Culture',
    tam_impact: { t: 2, a: 3, m: 3 },
    iam: 5, aim: 2, fim: 3, impact: 5,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['NOD', 'ZSG_SAFETY', 'ZSG_CULTURE'],
  },
]

// ─── UC Interventions (Uncertainty / Calibration) ────────────────────────────

const UC_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'UC',
    title_he: '\u05DE\u05D9\u05E4\u05D5\u05D9 \u05E0\u05E7\u05D5\u05D3\u05D5\u05EA \u05DB\u05E9\u05DC \u05D9\u05D7\u05D9\u05D3\u05D5\u05EA (Key-Person Risk)',
    what_he: '\u05DC\u05D6\u05D4\u05D5\u05EA 3 \u05DE\u05E2\u05E8\u05DB\u05D5\u05EA / \u05EA\u05D4\u05DC\u05D9\u05DB\u05D9\u05DD \u05E7\u05E8\u05D9\u05D8\u05D9\u05D9\u05DD \u05E9\u05E8\u05E7 \u05D0\u05D3\u05DD \u05D0\u05D7\u05D3 \u05DE\u05D1\u05D9\u05DF \u05D0\u05D5\u05EA\u05DD \u05DC\u05E2\u05D5\u05DE\u05E7. \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC \u05EA\u05D9\u05E2\u05D5\u05D3 \u05E9\u05D9\u05D7\u05EA "\u05D4\u05E2\u05D1\u05E8\u05EA \u05D9\u05D3\u05E2" \u05E9\u05DC 2 \u05E9\u05E2\u05D5\u05EA \u05E2\u05DD \u05DB\u05DC \u05D0\u05D7\u05D3.',
    why_he: '\u05D9\u05D3\u05E2 \u05E1\u05DE\u05D5\u05D9 (tacit knowledge) \u05E2\u05D5\u05D6\u05D1 \u05E2\u05DD \u05D4\u05D0\u05D3\u05DD. "\u05DE\u05DB\u05E4\u05D9\u05DC \u05D4\u05DE\u05D9\u05DC\u05D5\u05D0\u05D9\u05DD" \u05D4\u05D9\u05E9\u05E8\u05D0\u05DC\u05D9 \u05D4\u05D5\u05DB\u05D9\u05D7: \u05D4\u05D9\u05E2\u05D3\u05E8\u05D5\u05EA \u05E9\u05DC key-person \u05D0\u05D7\u05D3 \u05DE\u05E9\u05EA\u05E7\u05EA \u05DE\u05D7\u05DC\u05E7\u05D4 \u05E9\u05DC\u05DE\u05D4.',
    metric_he: '\u05D0\u05E4\u05E1 \u05DE\u05E6\u05D1\u05D9 "\u05E8\u05E7 X \u05D9\u05D5\u05D3\u05E2" \u05D1\u05E9\u05DC\u05D5\u05E9\u05EA \u05D4\u05DE\u05E2\u05E8\u05DB\u05D5\u05EA \u05D4\u05E7\u05E8\u05D9\u05D8\u05D9\u05D5\u05EA',
    tag: 'Knowledge Resilience',
    tam_impact: { t: 2, a: 2, m: 3 },
    iam: 4, aim: 4, fim: 5, impact: 3,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['CLT', 'OLD'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'UC',
    title_he: '\u05DB\u05D9\u05D5\u05DC Roadmap \u05E2\u05DD \u05D0\u05D9\u05DC\u05D5\u05E6\u05D9 \u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05D0\u05DE\u05D9\u05EA\u05D9\u05D9\u05DD',
    what_he: '\u05DC\u05E7\u05D7\u05EA \u05D0\u05EA \u05D4-roadmap \u05D4\u05E0\u05D5\u05DB\u05D7\u05D9 \u05D5\u05DC\u05D4\u05E2\u05DE\u05D9\u05D3 \u05D0\u05D5\u05EA\u05D5 \u05DE\u05D5\u05DC \u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05D4\u05E0\u05D3\u05E1\u05D9\u05EA \u05D1\u05E4\u05D5\u05E2\u05DC (\u05DC\u05D0 \u05EA\u05D9\u05D0\u05D5\u05E8\u05D8\u05D9\u05EA). \u05DC\u05E1\u05D3\u05E8 \u05E2\u05D3\u05D9\u05E4\u05D5\u05D9\u05D5\u05EA \u05DE\u05D7\u05D3\u05E9. \u05DC\u05EA\u05E7\u05E9\u05E8 \u05E9\u05D9\u05E0\u05D5\u05D9\u05D9\u05DD \u05DE\u05E4\u05D5\u05E8\u05E9\u05D5\u05EA.',
    why_he: '62% \u05DE\u05D7\u05D1\u05E8\u05D5\u05EA \u05D4\u05D4\u05D9\u05D9\u05D8\u05E7 \u05D1\u05D9\u05E9\u05E8\u05D0\u05DC 2024-2026 \u05DC\u05D0 \u05E2\u05DE\u05D3\u05D5 \u05D1-roadmap — \u05D4\u05E1\u05D9\u05D1\u05D4: \u05EA\u05DB\u05E0\u05D5\u05DF \u05E2\u05DC \u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05D0\u05D5\u05E4\u05D8\u05D9\u05DE\u05D9\u05E1\u05D8\u05D9\u05EA (Uncalibrated capacity, Hyperbolic Discounting).',
    metric_he: '\u05D0\u05D7\u05D5\u05D6 \u05D4\u05E9\u05DC\u05DE\u05EA \u05E1\u05E4\u05E8\u05D9\u05E0\u05D8 ≥ 80% \u05D1\u05E9\u05DC\u05D5\u05E9\u05EA \u05D4\u05E1\u05E4\u05E8\u05D9\u05E0\u05D8\u05D9\u05DD \u05D4\u05D1\u05D0\u05D9\u05DD',
    tag: 'Capacity Calibration',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 4, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['CLT', 'CS'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'UC',
    title_he: '\u05E4\u05E8\u05D5\u05D8\u05D5\u05E7\u05D5\u05DC \u05D4\u05E2\u05D1\u05E8\u05EA \u05D9\u05D3\u05E2 \u05DC\u05E4\u05E0\u05D9 \u05DB\u05DC \u05D9\u05E6\u05D9\u05D0\u05D4',
    what_he: '\u05DC\u05D1\u05E0\u05D5\u05EA off-boarding \u05DE\u05D1\u05E0\u05D9: \u05DB\u05DC \u05E2\u05D5\u05D1\u05D3 \u05E9\u05E2\u05D5\u05D6\u05D1 \u05DE\u05DE\u05DC\u05D0 "\u05DE\u05E4\u05EA \u05D9\u05D3\u05E2" + \u05E9\u05D9\u05D7\u05EA \u05D4\u05E2\u05D1\u05E8\u05D4 + \u05D1\u05D3\u05D9\u05E7\u05D4 \u05E9\u05D4\u05DE\u05D7\u05DC\u05D9\u05E3 \u05D9\u05D5\u05D3\u05E2 \u05DC\u05E4\u05E2\u05D5\u05DC \u05E2\u05E6\u05DE\u05D0\u05D9\u05EA. \u05DC\u05D0\u05DE\u05E5 \u05D2\u05DD \u05DC\u05EA\u05D7\u05D9\u05DC\u05EA \u05DE\u05D9\u05DC\u05D5\u05D0\u05D9\u05DD \u05DE\u05DE\u05D5\u05E9\u05DB\u05D9\u05DD.',
    why_he: '\u05D9\u05D3\u05E2 \u05DE\u05D5\u05E1\u05D3\u05D9 \u05E2\u05D5\u05D6\u05D1 \u05DE\u05D4\u05E8 \u05DE\u05DE\u05D4 \u05E9\u05D0\u05E4\u05E9\u05E8 \u05DC\u05D2\u05D9\u05D9\u05E1. \u05EA\u05D9\u05E2\u05D5\u05D3 \u05DE\u05D1\u05E0\u05D9 \u05D4\u05D5\u05D0 \u05D4\u05E4\u05D5\u05DC\u05D9\u05E1\u05D4 \u05D4\u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05EA \u05D4\u05D6\u05D5\u05DC\u05D4 \u05D1\u05D9\u05D5\u05EA\u05E8.',
    metric_he: '\u05E7\u05D9\u05E6\u05D5\u05E8 \u05D6\u05DE\u05DF productivity \u05E9\u05DC \u05E2\u05D5\u05D1\u05D3/\u05DE\u05DE\u05DC\u05D0-\u05DE\u05E7\u05D5\u05DD \u05D7\u05D3\u05E9 ≥ 30%',
    tag: 'Knowledge Transfer',
    tam_impact: { t: 2, a: 2, m: 3 },
    iam: 3, aim: 3, fim: 4, impact: 3,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['OLD', 'CS'],
  },
]

// ─── SC Interventions (Structural Clarity) ───────────────────────────────────

const SC_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'SC',
    title_he: '\u05D1\u05D9\u05E7\u05D5\u05E8\u05EA RACI \u05DE\u05D4\u05D9\u05E8\u05D4 \u05DC-5 \u05EA\u05D4\u05DC\u05D9\u05DB\u05D9 \u05DC\u05D9\u05D1\u05D4',
    what_he: '\u05DC\u05DE\u05E4\u05D5\u05EA Responsible/Accountable/Consulted/Informed \u05E2\u05D1\u05D5\u05E8 5 \u05EA\u05D4\u05DC\u05D9\u05DB\u05D9\u05DD \u05E7\u05E8\u05D9\u05D8\u05D9\u05D9\u05DD \u05D5\u05DC\u05E1\u05D2\u05D5\u05E8 \u05DB\u05E4\u05D9\u05DC\u05D5\u05D9\u05D5\u05EA \u05D0\u05D5 \u05D7\u05D5\u05E8\u05D9\u05DD \u05D1\u05D1\u05E2\u05DC\u05D5\u05EA.',
    why_he: '\u05D7\u05D5\u05E1\u05E8 \u05D1\u05D4\u05D9\u05E8\u05D5\u05EA \u05D1\u05D1\u05E2\u05DC\u05D5\u05EA \u05D9\u05D5\u05E6\u05E8 \u05E6\u05D5\u05D5\u05D0\u05E8\u05D9 \u05D1\u05E7\u05D1\u05D5\u05E7, \u05D4\u05E1\u05DC\u05DE\u05D5\u05EA, \u05D5\u05E2\u05D1\u05D5\u05D3\u05EA-\u05DB\u05E4\u05D9\u05DC\u05D5\u05EA.',
    metric_he: '100% \u05DE-5 \u05D4\u05EA\u05D4\u05DC\u05D9\u05DB\u05D9\u05DD \u05E2\u05DD Responsible \u05D5-Accountable \u05D1\u05E8\u05D5\u05E8\u05D9\u05DD \u05EA\u05D5\u05DA 14 \u05D9\u05D5\u05DD',
    tag: 'RACI Audit',
    tam_impact: { t: 3, a: 2, m: 2 },
    iam: 5, aim: 4, fim: 5, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['OLD', 'CLT'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'SC',
    title_he: '\u05DE\u05E0\u05D2\u05E0\u05D5\u05DF Strategy Cascade \u05D3\u05D5-\u05E9\u05D1\u05D5\u05E2\u05D9',
    what_he: '\u05DC\u05EA\u05E8\u05D2\u05DD \u05DB\u05DC \u05D4\u05D7\u05DC\u05D8\u05D4 \u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9\u05EA \u05DC\u05D9\u05E2\u05D3\u05D9\u05DD \u05EA\u05E4\u05E2\u05D5\u05DC\u05D9\u05D9\u05DD, \u05D1\u05E2\u05DC\u05D9 \u05EA\u05E4\u05E7\u05D9\u05D3\u05D9\u05DD, \u05D5\u05D3\u05D3-\u05DC\u05D9\u05D9\u05E0\u05D9\u05DD, \u05D5\u05DC\u05D1\u05D3\u05D5\u05E7 \u05E1\u05D8\u05D8\u05D5\u05E1 \u05DB\u05DC \u05E9\u05D1\u05D5\u05E2\u05D9\u05D9\u05DD.',
    why_he: '\u05DC\u05DC\u05D0 Cascade, \u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9\u05D4 \u05E0\u05E9\u05D0\u05E8\u05EA \u05DE\u05E6\u05D2\u05EA \u05D5\u05DC\u05D0 \u05D4\u05D5\u05E4\u05DB\u05EA \u05DC\u05D1\u05D9\u05E6\u05D5\u05E2.',
    metric_he: '≥80% \u05DE\u05D4\u05D4\u05D7\u05DC\u05D8\u05D5\u05EA \u05D4\u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9\u05D5\u05EA \u05DE\u05E7\u05D1\u05DC\u05D5\u05EA owner + deadline + KPI \u05EA\u05D5\u05DA 30 \u05D9\u05D5\u05DD',
    tag: 'Strategy Cascade',
    tam_impact: { t: 2, a: 2, m: 3 },
    iam: 4, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['OLD', 'ZSG_CULTURE'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'SC',
    title_he: '\u05D0\u05E8\u05DB\u05D9\u05D8\u05E7\u05D8\u05D5\u05E8\u05EA \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA \u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05EA',
    what_he: '\u05DC\u05D1\u05E0\u05D5\u05EA Decision Rights Catalog: \u05DE\u05D9 \u05DE\u05D7\u05DC\u05D9\u05D8 \u05DE\u05D4, \u05DC\u05E4\u05D9 \u05D0\u05D9\u05D6\u05D4 \u05DE\u05D9\u05D3\u05E2, \u05D5\u05D1\u05D0\u05D9\u05D6\u05D4 SLA, \u05DB\u05D5\u05DC\u05DC \u05DE\u05E0\u05D2\u05E0\u05D5\u05DF \u05D7\u05E8\u05D9\u05D2\u05D5\u05EA.',
    why_he: '\u05E4\u05E8\u05D5\u05D8\u05D5\u05E7\u05D5\u05DC \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA \u05E7\u05D1\u05D5\u05E2 \u05DE\u05E4\u05D7\u05D9\u05EA \u05EA\u05DC\u05D5\u05EA \u05D1\u05D3\u05DE\u05D5\u05D9\u05D5\u05EA \u05D1\u05D5\u05D3\u05D3\u05D5\u05EA \u05D5\u05DE\u05D5\u05E0\u05E2 bottleneck \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9.',
    metric_he: '\u05D9\u05E8\u05D9\u05D3\u05D4 ≥35% \u05D1\u05D6\u05DE\u05E0\u05D9 \u05D4\u05E1\u05DC\u05DE\u05D4 + \u05D9\u05E8\u05D9\u05D3\u05D4 ≥30% \u05D1\u05D4\u05D7\u05DC\u05D8\u05D5\u05EA \u05E9\u05D7\u05D5\u05D6\u05E8\u05D5\u05EA \u05DC\u05E4\u05EA\u05D9\u05D7\u05D4',
    tag: 'Decision Protocol',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 4, aim: 2, fim: 3, impact: 5,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['OLD', 'CS'],
  },
]

// ─── ZSG_SAFETY (Edmondson / reporting) ─────────────────────────────────────

const ZSG_SAFETY_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'ND',
    title_he: '\u05DE\u05D3\u05D3 \u05D1\u05D9\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9 — Edmondson Baseline',
    what_he: '\u05DC\u05D4\u05E8\u05D9\u05E5 7 \u05E9\u05D0\u05DC\u05D5\u05EA \u05D4-Psychological Safety Survey \u05E9\u05DC Edmondson \u05D1\u05DB\u05DC \u05E6\u05D5\u05D5\u05EA. \u05DC\u05E4\u05E8\u05E1\u05DD \u05EA\u05D5\u05E6\u05D0\u05D5\u05EA (\u05D1\u05E8\u05DE\u05EA \u05E6\u05D5\u05D5\u05EA, \u05DC\u05D0 \u05E4\u05E8\u05D8). \u05DC\u05D4\u05DB\u05E8\u05D9\u05D6 \u05E9\u05D4\u05DE\u05D3\u05D3 \u05D9\u05D7\u05D6\u05D5\u05E8 \u05DB\u05DC 90 \u05D9\u05D5\u05DD.',
    why_he: '\u05D7\u05E1\u05DD \u05D3\u05D9\u05D5\u05D5\u05D7 \u05D5\u05E9\u05D7\u05D9\u05E7\u05EA \u05D0\u05DE\u05D5\u05DF \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA \u05DE\u05E1\u05EA\u05EA\u05E8\u05D9\u05DD: \u05DE\u05D3\u05D3 explicit \u05E9\u05D5\u05D1\u05E8 \u05E9\u05EA\u05D9\u05E7\u05D4 — \u05D9\u05E8\u05D9\u05D3\u05D4 \u05E9\u05DC 20%+ \u05DE-baseline \u05D4\u05D9\u05D0 \u05D0\u05D9\u05E0\u05D3\u05D9\u05E7\u05D8\u05D5\u05E8 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9.',
    metric_he: 'Edmondson score ≥ 6.5/7 \u05D1\u05DB\u05DC \u05D4\u05E6\u05D5\u05D5\u05EA\u05D9\u05DD \u05EA\u05D5\u05DA 90 \u05D9\u05D5\u05DD',
    tag: 'Psychological Safety',
    tam_impact: { t: 1, a: 3, m: 3 },
    iam: 5, aim: 3, fim: 5, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['ZSG_SAFETY'],
  },
]

// ─── ZSG_CULTURE (zero-sum / incentives) ────────────────────────────────────

const ZSG_CULTURE_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 2,
    horizon: '30d',
    axis: 'ND',
    title_he: '\u05DE\u05D3\u05D3\u05D9\u05DD \u05DE\u05E9\u05D5\u05EA\u05E4\u05D9\u05DD \u05D7\u05D5\u05E6\u05D9-\u05E6\u05D5\u05D5\u05EA (Shared OKRs)',
    what_he: '\u05DC\u05D6\u05D4\u05D5\u05EA \u05E0\u05E7\u05D5\u05D3\u05EA \u05D4\u05D7\u05D9\u05DB\u05D5\u05DA \u05D1\u05D9\u05DF \u05E9\u05E0\u05D9 \u05E6\u05D5\u05D5\u05EA\u05D9\u05DD \u05E2\u05DD \u05D7\u05D9\u05DB\u05D5\u05DA \u05E4\u05E0\u05D9\u05DD-\u05D0\u05E8\u05D2\u05D5\u05E0\u05D9 \u05D2\u05D1\u05D5\u05D4. \u05DC\u05D1\u05E0\u05D5\u05EA OKR \u05DE\u05E9\u05D5\u05EA\u05E3 \u05D0\u05D7\u05D3 \u05E9\u05DE\u05D3\u05D9\u05D3 \u05DC\u05E9\u05E0\u05D9\u05D4\u05DD. \u05DC\u05EA\u05DE\u05D7\u05E8 \u05D0\u05EA \u05D4-upside \u05E9\u05DC \u05E9\u05D9\u05EA\u05D5\u05E3 \u05E4\u05E2\u05D5\u05DC\u05D4 \u05D1\u05DE\u05E4\u05D5\u05E8\u05E9.',
    why_he: '\u05EA\u05E8\u05D1\u05D5\u05EA \u05E1\u05DB\u05D5\u05DD-\u05D0\u05E4\u05E1 \u05DE\u05D5\u05E0\u05E2\u05EA \u05E2\u05DC \u05D9\u05D3\u05D9 \u05DE\u05D1\u05E0\u05D4 \u05EA\u05DE\u05E8\u05D9\u05E6\u05D9\u05DD. \u05DB\u05E9\u05D0\u05E0\u05E9\u05D9\u05DD \u05DE\u05E0\u05E6\u05D7\u05D9\u05DD \u05D9\u05D7\u05D3, \u05D4\u05DD \u05DE\u05E4\u05E1\u05D9\u05E7\u05D9\u05DD \u05DC\u05E1\u05E4\u05D5\u05E8 \u05E0\u05D9\u05E6\u05D7\u05D5\u05E0\u05D5\u05EA \u05E0\u05E4\u05E8\u05D3\u05D9\u05DD.',
    metric_he: '\u05D9\u05E8\u05D9\u05D3\u05D4 ≥ 50% \u05D1-escalations \u05D1\u05D9\u05DF \u05D4\u05E6\u05D5\u05D5\u05EA\u05D9\u05DD \u05EA\u05D5\u05DA 30 \u05D9\u05D5\u05DD',
    tag: 'Incentive Architecture',
    tam_impact: { t: 2, a: 3, m: 3 },
    iam: 4, aim: 3, fim: 4, impact: 3,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['ZSG_CULTURE', 'OLD'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'ND',
    title_he: '\u05D0\u05E8\u05DB\u05D9\u05D8\u05E7\u05D8\u05D5\u05E8\u05EA RevOps / Chief of Staff',
    what_he: '\u05DC\u05D1\u05E0\u05D5\u05EA \u05EA\u05E4\u05E7\u05D9\u05D3 \u05EA\u05D9\u05D0\u05D5\u05DD \u05D0\u05E8\u05DB\u05D9\u05D8\u05E7\u05D8\u05D5\u05E0\u05D9 (RevOps \u05DC\u05D0\u05E8\u05D2\u05D5\u05DF GTM, CoS \u05DC\u05D0\u05E8\u05D2\u05D5\u05DF \u05DE\u05D5\u05E6\u05E8/R&D). \u05EA\u05E4\u05E7\u05D9\u05D3 \u05D6\u05D4 \u05D9\u05D5\u05E6\u05E8 \u05E9\u05DB\u05D1\u05EA \u05DE\u05DE\u05E9\u05E7 \u05E0\u05D9\u05D8\u05E8\u05DC\u05D9\u05EA \u05E9\u05DE\u05D5\u05E0\u05E2\u05EA Handoff Overload.',
    why_he: 'RevOps \u05DE\u05D0\u05D7\u05D3 Sales, Marketing \u05D5-CS \u05EA\u05D7\u05EA \u05DE\u05D3\u05D3\u05D9\u05DD \u05DE\u05E9\u05D5\u05EA\u05E4\u05D9\u05DD — \u05DE\u05D1\u05D8\u05DC zero-sum \u05DE\u05D1\u05E0\u05D9. CoS \u05DE\u05D8\u05E4\u05DC \u05D1\u05E7\u05D5\u05E0\u05E4\u05DC\u05D9\u05E7\u05D8\u05D9\u05DD \u05D1\u05E8\u05DE\u05EA \u05D4-C-suite.',
    metric_he: '\u05D9\u05E8\u05D9\u05D3\u05D4 ≥ 30% \u05D1-duplicate initiatives \u05D5-build overlap \u05D1\u05D9\u05DF \u05DE\u05D7\u05DC\u05E7\u05D5\u05EA',
    tag: 'Coordination Architecture',
    tam_impact: { t: 2, a: 2, m: 3 },
    iam: 4, aim: 2, fim: 2, impact: 5,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['ZSG_CULTURE', 'CLT'],
  },
]

// ─── CLT Interventions (Chronic Cognitive Load) ───────────────────────────────

const CLT_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'UC',
    title_he: '\u05D1\u05D9\u05E7\u05D5\u05E8\u05EA \u05D9\u05E9\u05D9\u05D1\u05D5\u05EA — \u05E4\u05E8\u05D5\u05D8\u05D5\u05E7\u05D5\u05DC Gloria Mark',
    what_he: '\u05DC\u05E8\u05E9\u05D5\u05DD \u05D0\u05EA \u05DB\u05DC \u05D4\u05D9\u05E9\u05D9\u05D1\u05D5\u05EA \u05D4\u05E9\u05D1\u05D5\u05E2\u05D9\u05D5\u05EA. \u05DC\u05E1\u05D5\u05D5\u05D2 \u05DB\u05DC \u05D9\u05E9\u05D9\u05D1\u05D4: \u05D4\u05D7\u05DC\u05D8\u05D4 / \u05DE\u05D9\u05D3\u05E2 / \u05E1\u05E0\u05DB\u05E8\u05D5\u05DF. \u05DC\u05D1\u05D8\u05DC \u05DB\u05DC \u05D9\u05E9\u05D9\u05D1\u05EA "\u05DE\u05D9\u05D3\u05E2" \u05E9\u05E0\u05D9\u05EA\u05DF \u05DC\u05D4\u05D7\u05DC\u05D9\u05E4\u05D4 \u05D1-async update. \u05DC\u05E9\u05DE\u05D5\u05E8 2 \u05D1\u05DC\u05D5\u05E7\u05D9 Deep Work \u05D1\u05D9\u05D5\u05DD (90 \u05D3\u05E7\u05D5\u05EA \u05DB\u05DC \u05D0\u05D7\u05D3, \u05DC\u05DC\u05D0 \u05E4\u05D2\u05D9\u05E2\u05D5\u05EA).',
    why_he: '\u05D2\u05DC\u05D5\u05E8\u05D9\u05D4 \u05DE\u05D0\u05E8\u05E7 (UC Irvine): \u05D4\u05D7\u05DC\u05E4\u05EA \u05D4\u05E7\u05E9\u05E8 \u05E2\u05D5\u05DC\u05D4 23 \u05D3\u05E7\u05D5\u05EA \u05DC\u05D4\u05EA\u05D0\u05D5\u05E9\u05E9\u05D5\u05EA. 15 \u05D4\u05D7\u05DC\u05E4\u05D5\u05EA \u05D1\u05D9\u05D5\u05DD = 5.75 \u05E9\u05E2\u05D5\u05EA \u05D0\u05D1\u05D5\u05D3\u05D5\u05EA. \u05D1\u05D9\u05D8\u05D5\u05DC \u05D9\u05E9\u05D9\u05D1\u05D4 \u05D0\u05D7\u05EA \u05E9\u05D5\u05D5\u05D4 \u05D9\u05D5\u05EA\u05E8 \u05DE\u05DB\u05DC productivity tip \u05D0\u05D7\u05E8.',
    metric_he: '\u05D9\u05E8\u05D9\u05D3\u05D4 ≥ 30% \u05D1\u05E9\u05E2\u05D5\u05EA \u05D9\u05E9\u05D9\u05D1\u05D4 \u05E9\u05D1\u05D5\u05E2\u05D9\u05D5\u05EA + 2 \u05D1\u05DC\u05D5\u05E7\u05D9 Focus Time \u05DE\u05D5\u05D2\u05E0\u05D9\u05DD \u05D1\u05D9\u05D5\u05DD',
    tag: 'Cognitive Load',
    tam_impact: { t: 2, a: 3, m: 2 },
    iam: 5, aim: 4, fim: 5, impact: 5,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['CLT'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'UC',
    title_he: 'Notification Hygiene — \u05E4\u05E8\u05D5\u05D8\u05D5\u05E7\u05D5\u05DC Async-First',
    what_he: '\u05DC\u05D4\u05D2\u05D3\u05D9\u05E8: Slack/Teams = async (\u05EA\u05D2\u05D5\u05D1\u05D4 \u05EA\u05D5\u05DA 4 \u05E9\u05E2\u05D5\u05EA). Call = \u05D3\u05D7\u05D5\u05E3 \u05D1\u05DC\u05D1\u05D3. Email = \u05DC\u05D0-\u05D3\u05D7\u05D5\u05E3. \u05DC\u05E1\u05D2\u05D5\u05E8 \u05DB\u05DC notification push \u05D1\u05E9\u05E2\u05D5\u05EA \u05D4-Deep Work. \u05DC\u05D4\u05DB\u05E9\u05D9\u05E8 \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD \u05DC\u05D0 \u05DC\u05E6\u05E4\u05D5\u05EA \u05DC\u05EA\u05D2\u05D5\u05D1\u05D4 \u05DE\u05D9\u05D9\u05D3\u05D9\u05EA.',
    why_he: '\u05DB\u05DC notification \u05E9\u05DE\u05D2\u05D9\u05E2\u05D4 \u05D1\u05DE\u05D4\u05DC\u05DA Deep Work \u05E9\u05D5\u05D1\u05E8\u05EA Focus Session. \u05E4\u05E8\u05D5\u05D8\u05D5\u05E7\u05D5\u05DC async-first \u05DE\u05E2\u05D1\u05D9\u05E8 \u05D0\u05EA \u05E2\u05DC\u05D5\u05EA \u05D4\u05D4\u05D7\u05DC\u05D8\u05D4 "\u05D3\u05D7\u05D5\u05E3 \u05DB\u05DE\u05D4?" \u05DE\u05D4\u05DE\u05E7\u05D1\u05DC \u05DC\u05E9\u05D5\u05DC\u05D7 — \u05E9\u05DD \u05D4\u05E9\u05D9\u05E4\u05D5\u05D8 \u05D8\u05D5\u05D1 \u05D9\u05D5\u05EA\u05E8.',
    metric_he: '\u05D9\u05E8\u05D9\u05D3\u05D4 ≥ 60% \u05D1\u05D4\u05D5\u05D3\u05E2\u05D5\u05EA \u05E9\u05DE\u05E1\u05D5\u05DE\u05E0\u05D5\u05EA "\u05D3\u05D7\u05D5\u05E3" \u05E9\u05D0\u05D9\u05E0\u05DF \u05D3\u05D7\u05D5\u05E4\u05D5\u05EA',
    tag: 'Async Architecture',
    tam_impact: { t: 1, a: 3, m: 2 },
    iam: 4, aim: 3, fim: 5, impact: 4,
    applicable_profiles: ['at-risk', 'critical'],
    target_pathologies: ['CLT', 'NOD'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'UC',
    title_he: '\u05D0\u05E8\u05DB\u05D9\u05D8\u05E7\u05D8\u05D5\u05E8\u05EA Nudge — \u05E2\u05D9\u05E6\u05D5\u05D1 \u05E1\u05D1\u05D9\u05D1\u05EA \u05D1\u05E8\u05D9\u05E8\u05EA \u05D4\u05DE\u05D7\u05D3\u05DC',
    what_he: '\u05DC\u05D6\u05D4\u05D5\u05EA \u05D0\u05EA 3 \u05D4\u05E0\u05EA\u05D9\u05D1\u05D9\u05DD \u05E9\u05D1\u05D4\u05DD \u05D0\u05E0\u05E9\u05D9\u05DD "\u05DE\u05D3\u05DC\u05D2\u05D9\u05DD" (\u05D1\u05D2\u05DC\u05DC CLT, \u05DC\u05D0 \u05E2\u05E6\u05DC\u05D5\u05EA). \u05DC\u05E2\u05E6\u05D1 \u05DE\u05D7\u05D3\u05E9 \u05D0\u05EA \u05D1\u05E8\u05D9\u05E8\u05EA \u05D4\u05DE\u05D7\u05D3\u05DC \u05DB\u05DA \u05E9\u05D4\u05E0\u05EA\u05D9\u05D1 \u05D4\u05E0\u05DB\u05D5\u05DF \u05E7\u05DC \u05D9\u05D5\u05EA\u05E8. \u05D3\u05D5\u05D2\u05DE\u05D4: dashboard \u05E9\u05DE\u05E8\u05DB\u05D6 \u05DE\u05D9\u05D3\u05E2 \u05DE-7 \u05DE\u05E2\u05E8\u05DB\u05D5\u05EA — \u05DC\u05D0 \u05E6\u05E8\u05D9\u05DA \u05DC\u05D1\u05D3\u05D5\u05E7 7 \u05DE\u05E7\u05D5\u05DE\u05D5\u05EA.',
    why_he: 'CLT \u05DE\u05EA\u05D7\u05D9\u05DC \u05DB\u05E9\u05D4\u05E0\u05EA\u05D9\u05D1 \u05E9\u05DC "\u05DC\u05D3\u05DC\u05D2" \u05E7\u05DC \u05D9\u05D5\u05EA\u05E8 \u05DE\u05D4\u05E0\u05EA\u05D9\u05D1 \u05E9\u05DC "\u05DC\u05E2\u05E9\u05D5\u05EA \u05E0\u05DB\u05D5\u05DF". Nudge \u05D4\u05D5\u05E4\u05DA \u05D0\u05EA \u05D4\u05E0\u05EA\u05D9\u05D1 \u05D4\u05E0\u05DB\u05D5\u05DF \u05DC\u05E0\u05EA\u05D9\u05D1 \u05D4\u05E7\u05DC — \u05DE\u05D1\u05DC\u05D9 \u05DC\u05D4\u05D5\u05E1\u05D9\u05E3 \u05D0\u05D7\u05E8\u05D9\u05D5\u05EA.',
    metric_he: '\u05D9\u05E8\u05D9\u05D3\u05D4 ≥ 40% \u05D1-manual context-switching \u05D1\u05D9\u05DF \u05DB\u05DC\u05D9\u05DD',
    tag: 'Nudge Management',
    tam_impact: { t: 2, a: 3, m: 2 },
    iam: 4, aim: 3, fim: 3, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['CLT', 'NOD'],
  },
]

// ─── CS Interventions (Chronic Stress amplifier) ──────────────────────────────

const CS_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'DR',
    title_he: 'Tech Tourniquet — \u05E2\u05E6\u05D9\u05E8\u05EA \u05D4\u05D3\u05D9\u05DE\u05D5\u05DD \u05D4\u05DE\u05D9\u05D9\u05D3\u05D9\u05EA',
    what_he: '\u05DC\u05D6\u05D4\u05D5\u05EA \u05D0\u05EA \u05E6\u05D5\u05D5\u05D0\u05E8 \u05D4\u05D1\u05E7\u05D1\u05D5\u05E7 \u05D4\u05E7\u05E8\u05D9\u05D8\u05D9 \u05D1\u05D9\u05D5\u05EA\u05E8 \u05E9\u05DE\u05D5\u05E1\u05D9\u05E3 \u05E2\u05D5\u05DE\u05E1 \u05DC\u05E6\u05D5\u05D5\u05EA \u05E2\u05DB\u05E9\u05D9\u05D5. \u05DC\u05D1\u05E0\u05D5\u05EA \u05DE\u05DE\u05E9\u05E7 \u05DE\u05D9\u05E0\u05D9\u05DE\u05DC\u05D9 \u05E9\u05E2\u05D5\u05E6\u05E8 \u05D0\u05EA \u05D4\u05D3\u05D9\u05DE\u05D5\u05DD. \u05DC\u05D0 \u05DC\u05E4\u05EA\u05D5\u05E8 \u05D4\u05DB\u05DC — \u05DC\u05E4\u05EA\u05D5\u05E8 \u05D0\u05EA \u05D4\u05D3\u05D1\u05E8 \u05E9\u05DE\u05DB\u05D1\u05D9\u05D3 \u05D4\u05DB\u05D9 \u05D4\u05E8\u05D1\u05D4.',
    why_he: 'CS \u05DE\u05D2\u05D1\u05D9\u05E8 \u05D0\u05EA \u05DB\u05DC \u05E9\u05D0\u05E8 \u05D4\u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA. \u05DB\u05D0\u05E9\u05E8 CS \u05E4\u05E2\u05D9\u05DC, \u05DB\u05DC \u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05D0\u05D7\u05E8\u05EA \u05EA\u05D4\u05D9\u05D4 \u05E4\u05D7\u05D5\u05EA \u05D9\u05E2\u05D9\u05DC\u05D4. Tourniquet \u05E7\u05D5\u05D3\u05DD — Diagnosis \u05D0\u05D7\u05E8 \u05DB\u05DA.',
    metric_he: '\u05D9\u05E8\u05D9\u05D3\u05D4 \u05DE\u05D3\u05D5\u05D3\u05D4 \u05D1\u05E9\u05E2\u05D5\u05EA Firefighting \u05E9\u05D1\u05D5\u05E2\u05D9\u05D5\u05EA \u05E9\u05DC \u05D4\u05E6\u05D5\u05D5\u05EA ≥ 20% \u05EA\u05D5\u05DA \u05E9\u05D1\u05D5\u05E2\u05D9\u05D9\u05DD',
    tag: 'Tech Tourniquet',
    tam_impact: { t: 3, a: 3, m: 3 },
    iam: 5, aim: 4, fim: 4, impact: 4,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['CS', 'CLT'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'UC',
    title_he: 'TTX — \u05EA\u05E8\u05D2\u05D9\u05DC \u05DC\u05D7\u05E5 \u05DE\u05D1\u05D5\u05E7\u05E8 (Tabletop Exercise)',
    what_he: '\u05DC\u05EA\u05DB\u05E0\u05DF \u05EA\u05E8\u05D7\u05D9\u05E9 \u05DB\u05E9\u05DC \u05E9\u05E2\u05DC\u05D5\u05DC \u05DC\u05E7\u05E8\u05D5\u05EA (\u05DC\u05D0 \u05D4\u05D9\u05E4\u05D5\u05EA\u05D8\u05D9 — \u05DE\u05D4 \u05E9\u05D4\u05DB\u05D9 \u05DE\u05E4\u05D7\u05D9\u05D3 \u05D0\u05EA \u05D4\u05E6\u05D5\u05D5\u05EA). \u05DC\u05E0\u05D4\u05DC session \u05E9\u05DC 2-4 \u05E9\u05E2\u05D5\u05EA \u05E9\u05D1\u05D5 \u05DE\u05D3\u05DE\u05D9\u05DD \u05D0\u05EA \u05D4\u05DB\u05E9\u05DC. \u05DC\u05EA\u05E2\u05D3 \u05D0\u05EA \u05D4\u05D4\u05E0\u05D7\u05D5\u05EA \u05E9\u05E0\u05D7\u05E9\u05E4\u05D5. \u05DC\u05E1\u05D2\u05D5\u05E8 action items.',
    why_he: 'TTX \u05DE\u05D8\u05E4\u05DC \u05D1-CS \u05D3\u05E8\u05DA \u05D7\u05E9\u05D9\u05E4\u05D4 \u05DE\u05D1\u05D5\u05E7\u05E8\u05EA \u05DC\u05DC\u05D7\u05E5 — \u05DE\u05D5\u05E8\u05D9\u05D3 \u05D0\u05EA \u05E2\u05D5\u05E6\u05DE\u05EA \u05D4-unknown threat. \u05DE\u05D8\u05E4\u05DC \u05D1-OLD \u05D3\u05E8\u05DA \u05D7\u05E9\u05D9\u05E4\u05EA \u05D4\u05E0\u05D7\u05D5\u05EA \u05E1\u05DE\u05D5\u05D9\u05D5\u05EA \u05E9\u05D0\u05D9 \u05D0\u05E4\u05E9\u05E8 \u05DC\u05D2\u05DC\u05D5\u05EA \u05D1\u05E9\u05D2\u05E8\u05D4.',
    metric_he: '\u05D9\u05E8\u05D9\u05D3\u05D4 ≥ 40% \u05D1\u05D6\u05DE\u05DF \u05EA\u05D2\u05D5\u05D1\u05D4 \u05DC\u05D0\u05D9\u05E8\u05D5\u05E2\u05D9\u05DD \u05D3\u05D5\u05DE\u05D9\u05DD \u05DC\u05D0\u05D7\u05E8 \u05D4-TTX',
    tag: 'TTX Protocol',
    tam_impact: { t: 2, a: 3, m: 2 },
    iam: 4, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['CS', 'OLD'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'DR',
    title_he: '\u05D4\u05E4\u05D7\u05EA\u05EA \u05E2\u05D5\u05DE\u05E1 \u05DE\u05D1\u05E0\u05D9\u05EA — Slack Capacity Buffer',
    what_he: '\u05DC\u05D4\u05D2\u05D3\u05D9\u05E8 \u05DE\u05D3\u05D9\u05E0\u05D9\u05D5\u05EA: 20% \u05DE\u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05DB\u05DC \u05E6\u05D5\u05D5\u05EA \u05E9\u05DE\u05D5\u05E8\u05D4 \u05DC\u05D0\u05D9-\u05EA\u05DB\u05E0\u05D5\u05DF (\u05DC\u05D0 \u05D9\u05D5\u05E2\u05D3\u05D5 \u05DC-sprint). \u05E2\u05D5\u05DE\u05E1 \u05E4\u05D5\u05E8\u05DE\u05DC\u05D9 \u05DE\u05E7\u05E1\u05D9\u05DE\u05DC\u05D9: 80% \u05DE\u05D4\u05E7\u05D9\u05D1\u05D5\u05DC\u05EA. \u05DC\u05D3\u05D5\u05D5\u05D7 \u05E2\u05DC \u05E0\u05D9\u05E6\u05D5\u05DC \u05D1\u05E4\u05D5\u05E2\u05DC \u05DB\u05DC \u05E9\u05D1\u05D5\u05E2\u05D9\u05D9\u05DD.',
    why_he: '\u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05DD \u05EA\u05D7\u05EA CS \u05DE\u05EA\u05DB\u05E0\u05E0\u05D9\u05DD \u05E2\u05DC 100% \u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05D5\u05D0\u05D6 \u05E0\u05DB\u05E9\u05DC\u05D9\u05DD. 20% Slack \u05DE\u05D0\u05E4\u05E9\u05E8 \u05E1\u05E4\u05D9\u05D2\u05EA \u05D4\u05E4\u05EA\u05E2\u05D5\u05EA \u05D5\u05DE\u05E4\u05D7\u05D9\u05EA Loss Spiral (Hobfoll). \u05D6\u05D4 \u05DC\u05D0 \u05D1\u05D6\u05D1\u05D5\u05D6 — \u05D6\u05D5 \u05E4\u05D5\u05DC\u05D9\u05E1\u05EA \u05D1\u05D9\u05D8\u05D5\u05D7.',
    metric_he: 'Firefighting time < 15% \u05DE\u05D6\u05DE\u05DF \u05D4\u05E6\u05D5\u05D5\u05EA \u05D4\u05E9\u05D1\u05D5\u05E2\u05D9 + sprint completion rate ≥ 80%',
    tag: 'Capacity Buffer',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 3, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['CS', 'CLT'],
  },
]

// ─── Pathology-type banks ─────────────────────────────────────────────────────

const PATHOLOGY_BANKS: Record<PathologyType, ActionPlanItem[]> = {
  NOD: ND_INTERVENTIONS,
  ZSG_SAFETY: ZSG_SAFETY_INTERVENTIONS,
  ZSG_CULTURE: ZSG_CULTURE_INTERVENTIONS,
  OLD: [
    // OLD uses ND P2 (double-loop) as its primary, then adds UC P3 (knowledge transfer)
    ND_INTERVENTIONS[1],   // Post-Mortem double-loop
    UC_INTERVENTIONS[2],   // Knowledge transfer protocol
    DR_INTERVENTIONS[2],   // Structural bottleneck fix
  ],
  CLT: CLT_INTERVENTIONS,
  CS:  CS_INTERVENTIONS,
}

export const OPERATIONAL_TRIGGER_RULES: TriggerRule[] = [
  {
    id: 'tr-hotfix-spike',
    if_condition: 'IF Hotfix Frequency \u05E2\u05D5\u05DC\u05D4 \u05D1-25% \u05DE\u05E2\u05DC baseline \u05D7\u05D5\u05D3\u05E9\u05D9',
    then_action: 'THEN \u05D4\u05E4\u05E2\u05DC NOD protocol: Near-miss triage + Just Culture + debt allocation',
    severity: 'high',
  },
  {
    id: 'tr-aim-low',
    if_condition: 'IF AIM < 3.0 \u05DC\u05E4\u05E0\u05D9 rollout',
    then_action: 'THEN \u05D4\u05E7\u05E4\u05D0 rollout \u05D5\u05D1\u05E6\u05E2 friction mapping \u05DC\u05E4\u05E0\u05D9 \u05E4\u05E8\u05D9\u05E1\u05D4',
    severity: 'high',
  },
  {
    id: 'tr-near-miss-zero',
    if_condition: 'IF near-miss reporting = 0 \u05DC\u05D0\u05D5\u05E8\u05DA \u05E8\u05D1\u05E2\u05D5\u05DF',
    then_action: 'THEN \u05D4\u05E4\u05E2\u05DC ZSG reboot: no-blame reporting + safety activation',
    severity: 'high',
  },
  {
    id: 'tr-daci-latency',
    if_condition: 'IF decision latency > 48h \u05D1\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9 \u05DC\u05D9\u05D1\u05D4',
    then_action: 'THEN \u05D4\u05E4\u05E2\u05DC DACI tightening \u05E2\u05DD Driver/Approver \u05D9\u05D7\u05D9\u05D3',
    severity: 'high',
  },
  {
    id: 'tr-fim-low',
    if_condition: 'IF FIM < 2.5 \u05E2\u05E7\u05D1 \u05DE\u05D7\u05E1\u05D5\u05E8 \u05EA\u05E9\u05EA\u05D9\u05EA\u05D9',
    then_action: 'THEN \u05D4\u05E2\u05D1\u05E8 \u05E7\u05D9\u05D1\u05D5\u05DC\u05EA \u05DE\u05D9\u05D9\u05D3\u05D9\u05EA \u05DC-Platform/Enablement \u05DC\u05E4\u05E0\u05D9 \u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05E2\u05D5\u05DE\u05E7',
    severity: 'medium',
  },
  {
    id: 'tr-cs-freeze',
    if_condition: 'IF systemic stress (CS amplifier) \u05DE\u05D6\u05D5\u05D4\u05D4',
    then_action: 'THEN \u05D4\u05E4\u05E2\u05DC Systemic Friction Halt \u05D5-stop new change initiatives',
    severity: 'high',
  },
]

export const MANDATORY_COMORBIDITY_SEQUENCES: Array<{
  id:
    | 'clt-before-cs'
    | 'zsg-before-old'
    | 'zsg-safety-before-old'
    | 'zsg-culture-before-old'
    | 'sc-before-nod'
  when: string
  first: PathologyType | 'SC'
  then: PathologyType
}> = [
  { id: 'clt-before-cs', when: 'CS amplifier + high UC', first: 'CLT', then: 'CS' },
  { id: 'zsg-safety-before-old', when: 'OLD with low psychological safety', first: 'ZSG_SAFETY', then: 'OLD' },
  { id: 'zsg-culture-before-old', when: 'OLD with zero-sum culture', first: 'ZSG_CULTURE', then: 'OLD' },
  { id: 'sc-before-nod', when: 'NOD with high structural ambiguity', first: 'SC', then: 'NOD' },
]

export const DEFAULT_GATE_REVIEWS: GateReview[] = [
  {
    id: 'gate-1',
    week: 2,
    title_he: 'Gate 1 — \u05D9\u05D9\u05E6\u05D5\u05D1 \u05E2\u05D5\u05DE\u05E1 \u05D5\u05E7\u05D9\u05E6\u05D5\u05E8 \u05E9\u05D9\u05D4\u05D5\u05D9',
    pass_criteria: ['Decision latency <= 48h \u05D1\u05E4\u05E8\u05D5\u05D9\u05E7\u05D8\u05D9 \u05DC\u05D9\u05D1\u05D4', '>=80% \u05E9\u05DE\u05D9\u05E8\u05D4 \u05E2\u05DC guarded blocks'],
  },
  {
    id: 'gate-2',
    week: 4,
    title_he: 'Gate 2 — \u05E4\u05EA\u05D9\u05D7\u05D5\u05EA \u05D5\u05D3\u05D9\u05D5\u05D5\u05D7 \u05D1\u05D8\u05D5\u05D7',
    pass_criteria: ['Near-miss \u05E2\u05D5\u05DC\u05D4 \u05DE\u05D0\u05E4\u05E1 \u05DC-flow \u05E4\u05E2\u05D9\u05DC', 'No-blame response \u05E0\u05E9\u05DE\u05E8 \u05DC\u05DC\u05D0 \u05E1\u05E0\u05E7\u05E6\u05D9\u05D5\u05EA \u05D3\u05D9\u05D5\u05D5\u05D7'],
  },
  {
    id: 'gate-3',
    week: 8,
    title_he: 'Gate 3 — \u05E2\u05E7\u05D9\u05E8\u05EA \u05E1\u05D8\u05D9\u05D5\u05EA \u05D5\u05DC\u05DE\u05D9\u05D3\u05D4 \u05DB\u05E4\u05D5\u05DC\u05D4',
    pass_criteria: ['>=40% \u05D9\u05E8\u05D9\u05D3\u05D4 \u05D1-hotfixes', 'AARs \u05DB\u05D5\u05DC\u05DC\u05D9\u05DD \u05E9\u05D9\u05E0\u05D5\u05D9 \u05D4\u05E0\u05D7\u05D5\u05EA (double-loop)'],
  },
  {
    id: 'gate-4',
    week: 12,
    title_he: 'Gate 4 — \u05E7\u05D9\u05D1\u05D5\u05E2 \u05D7\u05D5\u05E1\u05DF \u05D5\u05DE\u05E0\u05D9\u05E2\u05EA \u05E8\u05D9\u05D1\u05D0\u05D5\u05E0\u05D3',
    pass_criteria: ['\u05E9\u05D9\u05E4\u05D5\u05E8 OHI/health \u05D9\u05E6\u05D9\u05D1', 'Change fatigue \u05E0\u05E9\u05D0\u05E8\u05EA \u05D1\u05D8\u05D5\u05D5\u05D7 \u05E0\u05E1\u05D1\u05DC'],
  },
]

// ─── IUS Engine ───────────────────────────────────────────────────────────────

const HORIZON_DAYS: Record<InterventionHorizon, number> = {
  '14d': 14,
  '30d': 30,
  '90d': 90,
}

// IUS weights: α=IAM β=AIM γ=FIM δ=Impact (must sum to 1.0)
const W = { iam: 0.25, aim: 0.20, fim: 0.20, impact: 0.35 }

/**
 * computeIUS — Scores a single intervention against a ConstraintEnvelope.
 *
 * Constraint logic (binary gate BEFORE scoring):
 *   T-constraint: horizon_days > t_max → T-violation → try MVC
 *   R-constraint: item.aim < r_max → R-violation → try MVC
 *
 * MVC revision: if either constraint violated but IAM >= 4,
 *   the intervention is revised to minimal footprint and flagged mvc_revised.
 *   Penalty = 10 points off normalised score.
 *
 * Returns null if intervention cannot be fit even as MVC.
 */
export function computeIUS(
  item: ActionPlanItem,
  envelope: ConstraintEnvelope
): IUSScore | null {
  const horizonDays = HORIZON_DAYS[item.horizon]
  const tViolation = horizonDays > envelope.t_max
  const rViolation = item.aim < envelope.r_max

  let mvc_revised = false
  let mvc_description: string | undefined
  let constraint_penalty = 0

  if (tViolation || rViolation) {
    // Attempt MVC: item needs IAM >= 4 to be worth revising
    if (item.iam < 4) return null

    mvc_revised = true
    constraint_penalty = 10

    if (tViolation && rViolation) {
      mvc_description = `\u05D2\u05E8\u05E1\u05EA MVC: \u05DE\u05D9\u05D5\u05E9\u05DE\u05EA \u05E2\u05DD \u05E6\u05D5\u05D5\u05EA-\u05E4\u05D9\u05D9\u05DC\u05D5\u05D8 \u05D0\u05D7\u05D3 \u05D1\u05DC\u05D1\u05D3 \u05EA\u05D5\u05DA ${envelope.t_max} \u05D9\u05D5\u05DD — \u05DC\u05DC\u05D0 \u05E9\u05D9\u05E0\u05D5\u05D9 \u05DE\u05DC\u05D0 \u05E2\u05D3 \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8 \u05EA\u05D5\u05E6\u05D0\u05D5\u05EA`
    } else if (tViolation) {
      mvc_description = `\u05D2\u05E8\u05E1\u05EA MVC: \u05DE\u05E6\u05D5\u05DE\u05E6\u05DE\u05EA \u05DC-${envelope.t_max} \u05D9\u05D5\u05DD — \u05DE\u05D9\u05D9\u05E9\u05DE\u05D9\u05DD \u05E8\u05E7 \u05D0\u05EA \u05E8\u05DB\u05D9\u05D1 \u05D4-Tourniquet \u05D4\u05D9\u05E9\u05D9\u05E8`
    } else {
      mvc_description = `\u05D2\u05E8\u05E1\u05EA MVC: \u05DE\u05D9\u05D5\u05E9\u05DE\u05EA \u05DB-pilot \u05E2\u05DD \u05E7\u05D1\u05D5\u05E6\u05D4 \u05DE\u05D5\u05DB\u05E0\u05D4 \u05D0\u05D7\u05EA (\u05DC\u05D0 org-wide) — \u05DE\u05E4\u05D7\u05D9\u05EA\u05D4 \u05D0\u05EA \u05E8\u05DE\u05EA \u05D4\u05D4\u05E4\u05E8\u05E2\u05D4`
    }
  }

  // Raw IUS score: weighted sum on 1–5 scale
  const raw =
    W.iam * item.iam +
    W.aim * item.aim +
    W.fim * item.fim +
    W.impact * item.impact

  // Normalise to 0–100, apply penalty
  const normalised = ((raw - 1) / 4) * 100
  const score = Math.max(0, Math.round(normalised - constraint_penalty))

  return { raw, score, constraint_penalty, mvc_revised, mvc_description }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns 3 prioritised interventions for a given diagnosis.
 *
 * Selection strategy:
 *   1. Candidate pool assembled from pathology-type bank or axis bank
 *   2. Filter by applicable_profiles
 *   3. Apply ConstraintEnvelope (binary gate) via computeIUS — exclude if null
 *   4. Rank by IUS score descending
 *   5. Return top 3 with _ius attached
 */
export function buildActionPlan(
  dominantAxis: DiagnosticAxis,
  profile: PathologyProfile,
  scores: { dr: number; nd: number; uc: number; sc?: number },
  pathologyType?: PathologyType,
  csAmplifier?: boolean,
  envelope?: ConstraintEnvelope,
  runtimeConfig?: Pick<DiagnosticRuntimeConfig, 'evidenceProfiles'>
): ActionPlanItem[] {
  const byAxis: Record<DiagnosticAxis, ActionPlanItem[]> = {
    DR: DR_INTERVENTIONS,
    ND: ND_INTERVENTIONS,
    UC: UC_INTERVENTIONS,
    SC: SC_INTERVENTIONS,
  }

  // ── Step 1: Assemble candidate pool ──────────────────────────────────────
  let candidates: ActionPlanItem[]

  if (csAmplifier) {
    const cltFirst = (scores.uc >= 6 || scores.dr >= 6) ? CLT_INTERVENTIONS : []
    candidates = [...cltFirst, ...CS_INTERVENTIONS]
  } else if (pathologyType && pathologyType !== 'CS') {
    const bank = PATHOLOGY_BANKS[pathologyType]
    // augment with secondary-axis items for diversity
    const axisScores: [DiagnosticAxis, number][] = [
      ['DR', scores.dr],
      ['ND', scores.nd],
      ['UC', scores.uc],
      ['SC', scores.sc ?? 0],
    ]
    axisScores.sort((a, b) => b[1] - a[1])
    const secondAxis = axisScores.find(([a]) => a !== dominantAxis)?.[0] ?? dominantAxis
    const scBeforeNod = pathologyType === 'NOD' && (scores.sc ?? 0) >= 6
    const primary = scBeforeNod ? byAxis.SC : bank
    candidates = [...primary, ...bank, ...byAxis[secondAxis]]
    if (pathologyType === 'OLD' && scores.nd >= 5) {
      candidates = [
        ...ZSG_SAFETY_INTERVENTIONS,
        ...ZSG_CULTURE_INTERVENTIONS,
        ...candidates,
      ]
    }
  } else {
    const axisScores: [DiagnosticAxis, number][] = [
      ['DR', scores.dr],
      ['ND', scores.nd],
      ['UC', scores.uc],
      ['SC', scores.sc ?? 0],
    ]
    axisScores.sort((a, b) => b[1] - a[1])
    const secondAxis = axisScores.find(([a]) => a !== dominantAxis)?.[0] ?? dominantAxis
    candidates = [...byAxis[dominantAxis], ...byAxis[secondAxis]]
  }

  // ── Step 2: Filter by profile ─────────────────────────────────────────────
  const profileFiltered = candidates.filter(i => i.applicable_profiles.includes(profile))

  // ── Step 3: Apply ConstraintEnvelope (binary gate) + score ───────────────
  if (envelope) {
    const scored: Array<ActionPlanItem & { _ius: IUSScore }> = []
    const seen = new Set<string>()

    for (const item of profileFiltered) {
      // deduplicate by title (pool may contain duplicates from augmentation)
      if (seen.has(item.title_he)) continue
      seen.add(item.title_he)

      const ius = computeIUS(item, envelope)
      if (ius === null) continue  // fails constraint and cannot be MVC-revised

      scored.push({
        ...item,
        _ius: ius,
        evidence: inferEvidence(item, runtimeConfig?.evidenceProfiles),
        kpi_stack: buildKpiStack(item),
      })
    }

    // ── Step 4: Rank by IUS score descending ─────────────────────────────
    scored.sort((a, b) => b._ius.score - a._ius.score)

    // ── Step 5: Return top 3 ──────────────────────────────────────────────
    return scored.slice(0, 3)
  }

  // ── No envelope: legacy behaviour (deduplicated, first 3) ─────────────────
  const seen = new Set<string>()
  const result: ActionPlanItem[] = []
  for (const item of profileFiltered) {
    if (seen.has(item.title_he)) continue
    seen.add(item.title_he)
    result.push({
      ...item,
      evidence: inferEvidence(item, runtimeConfig?.evidenceProfiles),
      kpi_stack: buildKpiStack(item),
    })
    if (result.length === 3) break
  }
  return result
}

function inferEvidence(item: ActionPlanItem, profiles?: EvidenceProfileRow[]): InterventionEvidence {
  const override = profiles?.find((p) => p.intervention_tag === item.tag)
  if (override) {
    return {
      level: override.evidence_level,
      citations: override.citations,
      evidence_note: override.evidence_note,
    }
  }
  if (item.tag.includes('Just Culture') || item.tag.includes('Psychological Safety')) {
    return {
      level: 'high',
      citations: ['Edmondson (1999)', 'ECRI Just Culture'],
      evidence_note: 'Validated implementation outcomes and safety effects in high-risk settings.',
    }
  }
  if (item.tag.includes('Double-Loop') || item.tag.includes('Cognitive Load') || item.tag.includes('DACI')) {
    return {
      level: 'contextual',
      citations: ['Argyris Double-Loop', 'Team Topologies', 'Decision frameworks'],
      evidence_note: 'Strong contextual evidence; requires local baseline calibration.',
    }
  }
  return {
    level: 'gap',
    citations: ['Local baseline required'],
    evidence_note: 'Needs controlled local validation before broad rollout.',
  }
}

function buildKpiStack(item: ActionPlanItem): InterventionKpiStack {
  return {
    leading: [
      { name: item.metric_he, horizon: '1-2w' },
      { name: 'AIM/IAM pulse', horizon: '1-2w' },
      { name: 'Decision/Execution friction signal', horizon: '1-2w' },
    ],
    lagging: [
      { name: 'Defect/Hotfix trend', horizon: '4-12w' },
      { name: 'Throughput and cycle stability', horizon: '4-12w' },
      { name: 'Retention / burnout markers', horizon: '4-12w' },
    ],
    baseline: '30-day historical baseline before intervention',
    cadence: item.horizon === '14d' ? 'Weekly' : item.horizon === '30d' ? 'Bi-weekly' : 'Every 14 days + monthly board review',
    target_range: item.horizon === '14d' ? 'Early stabilization within 2 weeks' : item.horizon === '30d' ? '>=20-40% trend improvement by week 4-6' : 'Sustained improvement without rebound by week 12',
  }
}

export function evaluateTriggerRules(input: TriggerEvaluationInput): TriggerRule[] {
  return evaluateTriggerRulesWithConfig(input, OPERATIONAL_TRIGGER_RULES)
}

export function evaluateTriggerRulesWithConfig(
  input: TriggerEvaluationInput,
  rules: TriggerRule[]
): TriggerRule[] {
  const out: TriggerRule[] = []
  const byId = new Map(rules.map((r) => [r.id, r]))
  if (input.scores.dr >= 6 || input.dominantAxis === 'DR') {
    const r = byId.get('tr-daci-latency')
    if (r) out.push(r)
  }
  if (input.scores.nd >= 6 || input.pathologyType === 'NOD') {
    const r = byId.get('tr-hotfix-spike')
    if (r) out.push(r)
  }
  if (
    input.pathologyType === 'ZSG_SAFETY' ||
    input.pathologyType === 'ZSG_CULTURE' ||
    input.profile === 'critical' ||
    input.profile === 'systemic-collapse'
  ) {
    const r = byId.get('tr-near-miss-zero')
    if (r) out.push(r)
  }
  if (input.pathologyType === 'CS' || (input.scores.dr >= 6 && input.scores.nd >= 6 && input.scores.uc >= 6)) {
    const r = byId.get('tr-cs-freeze')
    if (r) out.push(r)
  }
  if (input.profile === 'at-risk') {
    const r = byId.get('tr-aim-low')
    if (r) out.push(r)
  }
  return Array.from(new Map(out.map((r) => [r.id, r])).values())
}

export function build90DayGateReviews(): GateReview[] {
  return DEFAULT_GATE_REVIEWS
}

export function build90DayGateReviewsWithConfig(gates?: GateReview[]): GateReview[] {
  return gates && gates.length > 0 ? gates : DEFAULT_GATE_REVIEWS
}

/**
 * Derives dominant axis from DR/ND/UC/SC scores.
 */
export function getDominantAxis(scores: { dr: number; nd: number; uc: number; sc?: number }): DiagnosticAxis {
  const axisScores: Array<[DiagnosticAxis, number]> = [
    ['DR', scores.dr],
    ['ND', scores.nd],
    ['UC', scores.uc],
    ['SC', scores.sc ?? 0],
  ]
  axisScores.sort((a, b) => b[1] - a[1])
  return axisScores[0][0]
}

/**
 * Derives severity profile from slider scores (fast-path triage, no embedding).
 */
export function profileFromScores(scores: { dr: number; nd: number; uc: number; sc?: number }): PathologyProfile {
  const max = Math.max(scores.dr, scores.nd, scores.uc, scores.sc ?? 0)
  if (max < 2.5) return 'healthy'
  if (max < 5)   return 'at-risk'
  if (max < 7.5) return 'critical'
  return 'systemic-collapse'
}

export const PROFILE_LABELS: Record<PathologyProfile, string> = {
  'healthy':           '\u05EA\u05E7\u05D9\u05DF',
  'at-risk':           '\u05D1\u05E1\u05D9\u05DB\u05D5\u05DF',
  'critical':          '\u05E7\u05E8\u05D9\u05D8\u05D9',
  'systemic-collapse': '\u05E7\u05E8\u05D9\u05E1\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA',
}

export const HORIZON_LABELS: Record<InterventionHorizon, string> = {
  '14d': '14 \u05D9\u05D5\u05DD',
  '30d': '30 \u05D9\u05D5\u05DD',
  '90d': '90 \u05D9\u05D5\u05DD',
}

export const PATHOLOGY_TYPE_LABELS: Record<PathologyType, string> = {
  NOD: '\u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D4 \u05E9\u05DC \u05E1\u05D8\u05D9\u05D9\u05D4',
  ZSG_SAFETY: '\u05D2\u05D9\u05E8\u05E2\u05D5\u05DF \u05D1\u05D1\u05D9\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9',
  ZSG_CULTURE: '\u05EA\u05E8\u05D1\u05D5\u05EA \u05E0\u05D9\u05DB\u05D5\u05E8 \u05E4\u05E0\u05D9\u05DD-\u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05EA (\u05E1\u05DB\u05D5\u05DD-\u05D0\u05E4\u05E1)',
  OLD: '\u05DE\u05D5\u05D2\u05D1\u05DC\u05D5\u05EA \u05DC\u05DE\u05D9\u05D3\u05D4 \u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05EA',
  CLT: '\u05E2\u05D5\u05DE\u05E1 \u05E7\u05D5\u05D2\u05E0\u05D9\u05D8\u05D9\u05D1\u05D9 \u05DB\u05E8\u05D5\u05E0\u05D9',
  CS:  '\u05DC\u05D7\u05E5 \u05DB\u05E8\u05D5\u05E0\u05D9 — \u05DE\u05D2\u05D1\u05D9\u05E8 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9',
}

export const PATHOLOGY_PROTOCOL_MAP: Record<PathologyType, { protocol: string; successKpi: string }> = {
  NOD: { protocol: 'Vaughan Audit + Just Culture', successKpi: 'Hotfix Rate \u05D9\u05D5\u05E8\u05D3, near-miss reporting \u05E2\u05D5\u05DC\u05D4' },
  ZSG_SAFETY: { protocol: 'Edmondson PSI + Just Culture', successKpi: '\u05DE\u05D3\u05D3 \u05D1\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9 \u05E2\u05D5\u05DC\u05D4, \u05D3\u05D9\u05D5\u05D5\u05D7 \u05DE\u05D5\u05E7\u05D3\u05DD \u05E2\u05D5\u05DC\u05D4' },
  ZSG_CULTURE: { protocol: 'Shared OKRs + RevOps/CoS', successKpi: 'Escalations \u05D1\u05D9\u05DF \u05E6\u05D5\u05D5\u05EA\u05D9\u05DD \u05D9\u05D5\u05E8\u05D3\u05D5\u05EA, \u05DB\u05E4\u05D9\u05DC\u05D5\u05D9\u05D5\u05EA \u05D9\u05D5\u05E8\u05D3\u05D5\u05EA' },
  OLD: { protocol: 'Double-Loop Learning + TTX', successKpi: 'Recurring Action Items \u05D9\u05D5\u05E8\u05D3\u05D9\u05DD \u05DE\u05EA\u05D7\u05EA 20%' },
  CLT: { protocol: 'Nudge Management + Async-First', successKpi: 'Context Switches \u05D9\u05D5\u05E8\u05D3\u05D9\u05DD, Focus Time \u05E2\u05D5\u05DC\u05D4' },
  CS: { protocol: 'Tech Tourniquet + Capacity Buffer', successKpi: 'Decision Latency \u05DE\u05EA\u05E7\u05E6\u05E8, MBI Exhaustion \u05D9\u05D5\u05E8\u05D3' },
}
