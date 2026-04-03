/**
 * Unified diagnostic → treatment pipeline (single CDSS output for UI, PDF, wizard).
 */

import type { QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import type { DSMDiagnosis } from '@/lib/dsm-engine'
import { getInterventionProtocols, type InterventionProtocol } from '@/lib/dsm-engine'
import {
  buildActionPlan,
  build90DayGateReviews,
  evaluateTriggerRules,
  profileFromScores,
  getDominantAxis,
  PATHOLOGY_PROTOCOL_MAP,
  type ActionPlanItem,
  type ConstraintEnvelope,
  type TriggerRule,
  type DiagnosticRuntimeConfig,
} from '@/lib/diagnostic/action-plan'
import type { PathologyType } from '@/lib/diagnostic/pathology-kb'
import {
  primaryOrgPathologyFromAxisScores,
  type PrimaryOrgPathologyResult,
} from '@/lib/diagnostic/dsm-synthesis'

/** When SC is absent from telemetry, assume structural ambiguity typical of scale-ups. */
export const DEFAULT_SC_WHEN_MISSING = 6

export interface UnifiedAxisScores {
  dr: number
  nd: number
  uc: number
  sc?: number
}

export interface UnifiedPipelineInput {
  scores: UnifiedAxisScores
  answers?: QuestionnaireAnswer | null
  envelope?: ConstraintEnvelope
  runtimeConfig?: Pick<DiagnosticRuntimeConfig, 'evidenceProfiles'>
}

export interface UnifiedTreatmentPlanResult {
  orgPathology: PrimaryOrgPathologyResult
  items: ActionPlanItem[]
  /** Legacy 60–90d / multi-month protocol blocks (from dsm-engine) for “building phase”. */
  longHorizonProtocols: InterventionProtocol[]
  narrative_primary_he: string
  operative_triggers: TriggerRule[]
  gate_reviews: ReturnType<typeof build90DayGateReviews>
  sequencing_alerts_he: string[]
  /** Engine version for snapshot compatibility. */
  pipelineVersion: string
}

const PIPELINE_VERSION = 'unified-1'

function resolvedScores(input: UnifiedPipelineInput): {
  dr: number
  nd: number
  uc: number
  sc: number
} {
  const sc = input.scores.sc ?? DEFAULT_SC_WHEN_MISSING
  return { dr: input.scores.dr, nd: input.scores.nd, uc: input.scores.uc, sc }
}

function interventionIdFor(item: ActionPlanItem): string {
  const safeTag = item.tag.replace(/\s+/g, '_')
  return `${safeTag}_${item.axis}_${item.horizon}`
}

function miluimTag(answers?: QuestionnaireAnswer | null): string | undefined {
  if (!answers) return undefined
  if (answers.engagementProxy === 'burnout') return 'Miluim_Multiplier'
  return undefined
}

function applySequencingAndTags(
  items: ActionPlanItem[],
  ctx: {
    primaryType: PathologyType
    csAmplifier: boolean
    scores: { dr: number; nd: number; uc: number; sc: number }
    answers?: QuestionnaireAnswer | null
  }
): { items: ActionPlanItem[]; alerts: string[] } {
  const alerts: string[] = []
  const { primaryType, csAmplifier, scores } = ctx

  if (csAmplifier && (scores.uc >= 8 || scores.dr >= 8)) {
    alerts.push(
      '\u05D6\u05D5\u05D4\u05D4 \u05DE\u05E6\u05D1 \u05E7\u05E1\u05E7\u05D3\u05D4 (CS) \u05E2\u05DD \u05E2\u05D5\u05DE\u05E1 \u05D2\u05D1\u05D5\u05D4 \u05E2\u05DC \u05D4\u05E6\u05D9\u05E8\u05D9\u05DD. \u05D1\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA \u05E8\u05D0\u05E9\u05D5\u05E0\u05D4: \u05E2\u05E6\u05D9\u05E8\u05EA \u05D3\u05D9\u05DE\u05D5\u05DD \u05D5\u05D9\u05D9\u05E6\u05D5\u05D1 \u05D1\u05D0\u05D5\u05E4\u05E7 30 \u05D4\u05D9\u05DE\u05D9\u05DD \u05D4\u05E8\u05D0\u05E9\u05D5\u05E0\u05D9\u05DD.'
    )
  }

  const extra = miluimTag(ctx.answers)

  return {
    items: items.map((item) => {
      let sequencing_locked = item.sequencing_locked
      let sequencing_lock_reason_he = item.sequencing_lock_reason_he

      if (primaryType === 'NOD' && scores.sc >= 6) {
        const nodOnly =
          item.target_pathologies.includes('NOD') && item.axis !== 'SC'
        if (nodOnly && item.axis === 'ND' && item.priority === 1) {
          sequencing_locked = true
          sequencing_lock_reason_he =
            '\u05E0\u05E2\u05D9\u05DC\u05D4: \u05D9\u05E9 \u05DC\u05D4\u05D1\u05D4\u05D9\u05E8 \u05D1\u05E2\u05DC\u05D5\u05EA \u05D5\u05D4\u05D9\u05E8\u05E8\u05DB\u05D9\u05D4 (SC) \u05DC\u05E4\u05E0\u05D9 \u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05D9\u05D5\u05EA \u05D0\u05DB\u05D9\u05E4\u05D4 \u05E2\u05DC \u05E0\u05E8\u05DE\u05D5\u05DC \u05E1\u05D8\u05D9\u05D5\u05EA.'
        }
      }

      if (primaryType === 'OLD' && scores.nd >= 6 && scores.dr < 5) {
        const oldDeep =
          item.target_pathologies.length === 1 &&
          item.target_pathologies[0] === 'OLD' &&
          item.horizon === '90d'
        if (oldDeep) {
          sequencing_locked = true
          sequencing_lock_reason_he =
            '\u05E0\u05E2\u05D9\u05DC\u05D4: \u05D9\u05E9 \u05DC\u05D9\u05D9\u05E6\u05D1 \u05D1\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9 \u05D5\u05EA\u05DE\u05E8\u05D9\u05E6\u05D9\u05DD (ZSG) \u05DC\u05E4\u05E0\u05D9 \u05D0\u05E8\u05DB\u05D9\u05D8\u05E7\u05D8\u05D5\u05E8\u05EA \u05DC\u05DE\u05D9\u05D3\u05D4 \u05E2\u05DE\u05D5\u05E7\u05D4.'
        }
      }

      const display_tags = [...(item.display_tags ?? [])]
      if (item._ius?.mvc_revised) display_tags.push('MVC')
      if (extra && !display_tags.includes(extra)) display_tags.push(extra)

      const narrative_rationale_he =
        item.narrative_rationale_he ??
        `${item.title_he} — \u05DE\u05D5\u05EA\u05D0\u05DD \u05DC\u05E6\u05D9\u05E8 ${item.axis} \u05D5\u05D0\u05D5\u05E4\u05E7 ${item.horizon}.`

      return {
        ...item,
        interventionId: item.interventionId ?? interventionIdFor(item),
        narrative_rationale_he,
        display_tags: display_tags.length ? display_tags : undefined,
        sequencing_locked,
        sequencing_lock_reason_he,
      }
    }),
    alerts,
  }
}

/**
 * Single entry: axis scores + optional questionnaire → ranked ActionPlanItem[] + metadata.
 */
export function runUnifiedTreatmentPipeline(input: UnifiedPipelineInput): UnifiedTreatmentPlanResult {
  const scores = resolvedScores(input)
  const syn = primaryOrgPathologyFromAxisScores(scores, input.answers ?? null)
  const profile = profileFromScores(scores)
  const axis = getDominantAxis(scores)
  const envelope: ConstraintEnvelope = input.envelope ?? { t_max: 90, r_max: 3 }

  const rawItems = buildActionPlan(
    axis,
    profile,
    scores,
    syn.primaryType,
    syn.csAmplifier,
    envelope,
    input.runtimeConfig
  )

  const { items: tagged, alerts } = applySequencingAndTags(rawItems, {
    primaryType: syn.primaryType,
    csAmplifier: syn.csAmplifier,
    scores,
    answers: input.answers,
  })

  const protocolRow = PATHOLOGY_PROTOCOL_MAP[syn.primaryType]
  const narrative_primary_he = `${protocolRow.protocol} — ${protocolRow.successKpi}`

  const triggers = evaluateTriggerRules({
    profile,
    dominantAxis: axis,
    scores,
    pathologyType: syn.primaryType,
  })

  return {
    orgPathology: syn,
    items: tagged,
    longHorizonProtocols: [] as InterventionProtocol[],
    narrative_primary_he,
    operative_triggers: triggers,
    gate_reviews: build90DayGateReviews(),
    sequencing_alerts_he: alerts,
    pipelineVersion: PIPELINE_VERSION,
  }
}

/**
 * Run pipeline from full DSM diagnosis + questionnaire (plan page / PDF).
 */
export function runUnifiedTreatmentPipelineFromDiagnosis(
  diagnosis: DSMDiagnosis,
  answers: QuestionnaireAnswer | null | undefined,
  envelope?: ConstraintEnvelope,
  runtimeConfig?: Pick<DiagnosticRuntimeConfig, 'evidenceProfiles'>
): UnifiedTreatmentPlanResult {
  const m = Object.fromEntries(diagnosis.pathologies.map((p) => [p.code, p.score])) as Record<
    string,
    number
  >
  const base = runUnifiedTreatmentPipeline({
    scores: {
      dr: m.DR ?? 0,
      nd: m.ND ?? 0,
      uc: m.UC ?? 0,
      sc: m.SC,
    },
    answers: answers ?? null,
    envelope,
    runtimeConfig,
  })
  const longHorizonProtocols = getInterventionProtocols(diagnosis, answers ?? undefined)
  return { ...base, longHorizonProtocols }
}

export function stableJsonForPlanCompare(result: UnifiedTreatmentPlanResult): string {
  const minimal = {
    v: result.pipelineVersion,
    primary: result.orgPathology.primaryType,
    cs: result.orgPathology.csAmplifier,
    ids: result.items.map((i) => i.interventionId),
    titles: result.items.map((i) => i.title_he),
  }
  return JSON.stringify(minimal)
}
