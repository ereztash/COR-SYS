import { createClient } from '@/lib/supabase/server'
import { findSimilarCases, getRecommendations } from '@/lib/cbr'
import { diagnoseFromScores } from '@/lib/dsm-engine'
import type { Client, DsmDiagnosticSnapshot, OrganizationContext } from '@/types/database'
import { simulateRecommendation, type BetaSimulationResult } from './beta'
import { computeGammaMetrics } from './gamma'

export interface DeltaReasoningStep {
  title: string
  detail: string
}

export interface DeltaPayload {
  planId: string
  clientId: string
  alphaSummary: {
    boundedContexts: Array<{ label: string; confidence: number }>
    contradictionLoss: number | null
  }
  gamma: Awaited<ReturnType<typeof computeGammaMetrics>>
  simulations: BetaSimulationResult[]
  reasoningTrace: DeltaReasoningStep[]
  socraticQuestions: string[]
}

export async function buildDeltaPayload(planId: string): Promise<DeltaPayload> {
  const supabase = await createClient()
  const { data: plan } = await supabase
    .from('client_business_plans')
    .select('id,client_id')
    .eq('id', planId)
    .single()

  if (!plan) {
    throw new Error('Plan not found')
  }

  const clientId = (plan as { client_id: string }).client_id
  const [{ data: client }, { data: orgRows }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', clientId).single(),
    supabase.from('organizations_context').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1),
  ])

  const org = (orgRows?.[0] ?? null) as OrganizationContext | null
  if (!client || !org) {
    throw new Error('Delta context not found')
  }

  const { data: snapshotRows } = await supabase
    .from('dsm_diagnostic_snapshots')
    .select('*')
    .eq('org_id', org.org_id)
    .order('created_at', { ascending: false })
    .limit(1)

  const snapshot = (snapshotRows?.[0] ?? null) as DsmDiagnosticSnapshot | null
  if (!snapshot) {
    throw new Error('Delta snapshot not found')
  }

  const rankedCases = await findSimilarCases({
    snapshot,
    org,
    top_k: 6,
  })

  const diagnosis = diagnoseFromScores(
    snapshot.score_dr,
    snapshot.score_nd,
    snapshot.score_uc,
    snapshot.decision_latency ?? 0,
    snapshot.score_sc,
    { psiAverage: snapshot.psi_score ?? undefined }
  )
  const { recommendations } = getRecommendations({
    rankedCases,
    snapshot,
    coldStartDiagnosis: diagnosis,
    coldStartEconomicParams: {
      managers: 5,
      hoursPerWeek: 10,
      monthlySalary: (client as Client).monthly_retainer ?? 25000,
    },
  })

  const simulations = recommendations.slice(0, 3).map((recommendation) =>
    simulateRecommendation({
      interventionType: recommendation.intervention_type,
      recommendation,
      rankedCases,
      dailyLossEstimate: recommendation.daily_loss_estimate ?? 2000,
      seed: `${snapshot.snapshot_id}:${recommendation.intervention_type}`,
    })
  )

  const gamma = await computeGammaMetrics({ clientId, persist: false })

  const topRecommendation = recommendations[0]
  const topSimulation = simulations[0]
  const reasoningTrace: DeltaReasoningStep[] = [
    {
      title: 'System state',
      detail: `Severity ${snapshot.severity_profile} עם DR=${snapshot.score_dr.toFixed(1)}, ND=${snapshot.score_nd.toFixed(1)}, UC=${snapshot.score_uc.toFixed(1)}.`,
    },
    {
      title: 'Case memory',
      detail: `נמצאו ${rankedCases.length} מקרים דומים, מדורגים באמצעות Wilson + EoC-aware ranking.`,
    },
    {
      title: 'Recommended intervention',
      detail: topRecommendation
        ? `${topRecommendation.intervention_type} הוא המסלול המוביל עם Wilson ${topRecommendation.wilson_score.toFixed(2)} ותמיכת ${topRecommendation.supporting_cases} מקרים.`
        : 'אין מספיק מקרים ולכן נדרש fallback מדיניות.',
    },
    {
      title: 'Simulation',
      detail: topSimulation
        ? `Beta מעריך ROI חציוני ${topSimulation.roiPercentiles.p50.toFixed(2)} ותחום סיכון ${topSimulation.riskPercentiles.p5.toFixed(0)}-${topSimulation.riskPercentiles.p95.toFixed(0)}.`
        : 'אין סימולציה זמינה.',
    },
  ]

  const socraticQuestions = [
    gamma.feedbackLoopType === 'runaway'
      ? 'איזו לולאה מחזקת כרגע את ההסלמה בין DR, ND ו-UC?'
      : 'מהו האילוץ הארגוני שאם נשנה אותו, יפחית את זמן ההחלטה מהר ביותר?',
    gamma.semanticDriftKl > 0.45
      ? 'איפה המסרים המוצהרים של ההנהלה אינם תואמים להתנהגות בפועל?'
      : 'איזו יחידה ארגונית יכולה לשמש מוקד ניסוי מהיר ללא סיכון מערכתי?',
    'איזו הנחת יסוד בתוכנית הנוכחית טרם נבדקה אמפירית?',
  ]

  return {
    planId,
    clientId,
    alphaSummary: {
      boundedContexts: (((client as Client).bounded_contexts ?? []) as Array<{ label?: string; confidence?: number }>).map((item) => ({
        label: item.label ?? 'Unknown',
        confidence: item.confidence ?? 0,
      })),
      contradictionLoss: (client as Client).contradiction_loss ?? null,
    },
    gamma,
    simulations,
    reasoningTrace,
    socraticQuestions,
  }
}
