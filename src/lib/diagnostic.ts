/**
 * Single entry point for computing full diagnostic from questionnaire answers.
 * Used by plan page, assess results page, and PDF route.
 */
import { buildPlanFromQuestionnaire, type QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { diagnose, getComorbidityMap, getInterventionProtocols, type ComorbidityEdge, type DSMDiagnosis, type InterventionProtocol } from '@/lib/dsm-engine'

export type DiagnosticResult = {
  planResult: ReturnType<typeof buildPlanFromQuestionnaire>
  dsmDiagnosis: DSMDiagnosis
  comorbidityEdges: ComorbidityEdge[]
  interventionProtocols: InterventionProtocol[]
}

export function computeDiagnostic(clientName: string, answers: QuestionnaireAnswer): DiagnosticResult {
  const planResult = buildPlanFromQuestionnaire(clientName, answers)
  const dsmDiagnosis = diagnose(answers)
  const comorbidityEdges = getComorbidityMap(dsmDiagnosis)
  const interventionProtocols = getInterventionProtocols(dsmDiagnosis, answers)
  return { planResult, dsmDiagnosis, comorbidityEdges, interventionProtocols }
}
