/**
 * Single entry point for computing full diagnostic from questionnaire answers.
 * Used by plan page, assess results page, and PDF route.
 *
 * Axis-level diagnosis (`dsmDiagnosis`) is produced by `diagnose` (dsm-engine).
 * Organizational DSM-Org type is unified via `primaryOrgPathologyFromDiagnosis`.
 * Treatment ranking uses `runUnifiedTreatmentPipelineFromDiagnosis` (single CDSS output).
 */
import {
  buildPlanFromQuestionnaire,
  effectiveOperatingContext,
  mergeOperatingContextFromClient,
  type QuestionnaireAnswer,
} from '@/lib/corsys-questionnaire'
import { computeIgnitionProfile } from '@/lib/business-ignition'
import type { IgnitionProfile } from '@/lib/ignition-types'
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
export type { IgnitionProfile }

export type DiagnosticResult = {
  planResult: ReturnType<typeof buildPlanFromQuestionnaire>
  dsmDiagnosis: DSMDiagnosis
  /** NOD / ZSG_* / OLD / CLT / CS + CS amplifier — aligned with unified pipeline input. */
  orgPathology: PrimaryOrgPathologyResult
  comorbidityEdges: ComorbidityEdge[]
  /** @deprecated Prefer `unifiedTreatmentPlan`. Retained for shadow diff when UNIFIED_PIPELINE_SHADOW=true. */
  interventionProtocols: InterventionProtocol[]
  unifiedTreatmentPlan: UnifiedTreatmentPlanResult
  /** פרופיל התנעה לעצמאים — null כשלא רלוונטי או לא מולא שאלון */
  ignition: IgnitionProfile | null
}

export function computeDiagnostic(
  clientName: string,
  answers: QuestionnaireAnswer,
  client?: { operating_context?: string | null } | null
): DiagnosticResult {
  const merged = mergeOperatingContextFromClient(answers, client ?? null)
  const clientCtx =
    client?.operating_context === 'one_man_show' || client?.operating_context === 'team'
      ? client.operating_context
      : null
  const effCtx = effectiveOperatingContext(merged, clientCtx)
  const ignition = computeIgnitionProfile(merged, effCtx)
  const planResult = buildPlanFromQuestionnaire(clientName, merged)
  const dsmDiagnosis = diagnose(merged)
  const orgPathology = primaryOrgPathologyFromDiagnosis(dsmDiagnosis, merged)
  const comorbidityEdges = getComorbidityMap(dsmDiagnosis)
  const interventionProtocols = getInterventionProtocols(dsmDiagnosis, merged)
  const unifiedTreatmentPlan = runUnifiedTreatmentPipelineFromDiagnosis(dsmDiagnosis, merged)

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
    ignition,
  }
}
