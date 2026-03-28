/**
 * Single entry point for computing full diagnostic from questionnaire answers.
 * Used by plan page, assess results page, and PDF route.
 *
 * Axis-level diagnosis (`dsmDiagnosis`) is produced by `diagnose` (dsm-engine).
 * Organizational DSM-Org type is unified via `primaryOrgPathologyFromDiagnosis`.
 * Treatment ranking uses `runUnifiedTreatmentPipelineFromDiagnosis` (single CDSS output).
 */
import { buildPlanFromQuestionnaire, type QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { diagnose, getComorbidityMap, getInterventionProtocols, type ComorbidityEdge, type DSMDiagnosis, type InterventionProtocol } from '@/lib/dsm-engine'
import {
  primaryOrgPathologyFromDiagnosis,
  type PrimaryOrgPathologyResult,
} from '@/lib/diagnostic/dsm-synthesis'
import {
  runUnifiedTreatmentPipelineFromDiagnosis,
  stableJsonForPlanCompare,
  type UnifiedTreatmentPlanResult,
} from '@/lib/diagnostic/unified-pipeline'

export type { PrimaryOrgPathologyResult }
export type { UnifiedTreatmentPlanResult }

export type DiagnosticResult = {
  planResult: ReturnType<typeof buildPlanFromQuestionnaire>
  dsmDiagnosis: DSMDiagnosis
  /** NOD / ZSG_* / OLD / CLT / CS + CS amplifier — aligned with unified pipeline input. */
  orgPathology: PrimaryOrgPathologyResult
  comorbidityEdges: ComorbidityEdge[]
  /** @deprecated Prefer `unifiedTreatmentPlan`. Retained for shadow diff when UNIFIED_PIPELINE_SHADOW=true. */
  interventionProtocols: InterventionProtocol[]
  unifiedTreatmentPlan: UnifiedTreatmentPlanResult
}

export function computeDiagnostic(clientName: string, answers: QuestionnaireAnswer): DiagnosticResult {
  const planResult = buildPlanFromQuestionnaire(clientName, answers)
  const dsmDiagnosis = diagnose(answers)
  const orgPathology = primaryOrgPathologyFromDiagnosis(dsmDiagnosis, answers)
  const comorbidityEdges = getComorbidityMap(dsmDiagnosis)
  const interventionProtocols = getInterventionProtocols(dsmDiagnosis, answers)
  const unifiedTreatmentPlan = runUnifiedTreatmentPipelineFromDiagnosis(dsmDiagnosis, answers)

  if (process.env.UNIFIED_PIPELINE_SHADOW === 'true') {
    console.log('[unified-pipeline shadow]', {
      legacyProtocolIds: interventionProtocols.map((p) => p.id),
      unifiedInterventionIds: unifiedTreatmentPlan.items.map((i) => i.interventionId),
      stableJson: stableJsonForPlanCompare(unifiedTreatmentPlan),
    })
  }

  return {
    planResult,
    dsmDiagnosis,
    orgPathology,
    comorbidityEdges,
    interventionProtocols,
    unifiedTreatmentPlan,
  }
}
