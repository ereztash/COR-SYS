import { notFound } from 'next/navigation'
import { getAssessmentByToken, getClientById } from '@/lib/data'
import { getOptionById } from '@/lib/service-catalog'
import type { QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { computeDiagnostic } from '@/lib/diagnostic'
import { EntropyDots, DSMDiagnosisCard, ComorbidityMap, InterventionProtocolsCard } from '@/components/diagnostic'

export const dynamic = 'force-dynamic'

export default async function AssessResultsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const assessment = await getAssessmentByToken(token)
  if (!assessment) notFound()
  const answers = (assessment.answers ?? {}) as QuestionnaireAnswer
  const clientName = assessment.client_id
    ? (await getClientById(assessment.client_id))?.name ?? 'הערכה'
    : 'הערכה'

  let planResult: ReturnType<typeof computeDiagnostic>['planResult'] | null = null
  let dsmDiagnosis: ReturnType<typeof computeDiagnostic>['dsmDiagnosis'] | null = null
  let comorbidityEdges: ReturnType<typeof computeDiagnostic>['comorbidityEdges'] = []
  let interventionProtocols: ReturnType<typeof computeDiagnostic>['interventionProtocols'] = []

  try {
    const diagnostic = computeDiagnostic(clientName, answers)
    planResult = diagnostic.planResult
    dsmDiagnosis = diagnostic.dsmDiagnosis
    comorbidityEdges = diagnostic.comorbidityEdges
    interventionProtocols = diagnostic.interventionProtocols
  } catch {
    // show minimal view
  }

  const recommendedOption = planResult?.recommendedOptionId
    ? getOptionById(planResult.recommendedOptionId)
    : null

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            C
          </div>
          <span className="font-black text-white text-xl" style={{ fontFamily: 'Heebo, sans-serif' }}>
            COR-SYS
          </span>
        </div>
        <h1 className="text-2xl font-black text-white mt-2">תוצאות האבחון</h1>
        <p className="text-slate-400 text-sm mt-1 mb-8">סיכום אבחון DSM ארגוני ופרוטוקולי התערבות מומלצים</p>

        <div className="space-y-5">
          {planResult && (
            <div className="bento-card p-5">
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">ציון אנטרופיה ארגונית</p>
              <EntropyDots score={planResult.entropyScore} />
            </div>
          )}
          {planResult?.dynamicSummary.roleParagraph && (
            <div className="bento-card p-6">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-2">תפקיד ושלב ארגוני</p>
              <p className="text-sm text-slate-300 leading-relaxed">{planResult.dynamicSummary.roleParagraph}</p>
            </div>
          )}
          {planResult?.dynamicSummary.diagnosisParagraph && (
            <div className="bento-card p-6 border-r-4 border-r-orange-500">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-2">אבחון פתולוגיות</p>
              <p className="text-sm text-slate-300 leading-relaxed">{planResult.dynamicSummary.diagnosisParagraph}</p>
            </div>
          )}
          {recommendedOption && (
            <div className="bento-card p-6 border-r-4 border-r-blue-500">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">המלצת שירות</p>
              <p className="font-bold text-white text-lg">{recommendedOption.nameHe}</p>
              <p className="text-xs text-slate-400 mt-0.5">{recommendedOption.description}</p>
              <p className="text-emerald-400 font-bold text-sm mt-2">{recommendedOption.priceLabel}</p>
            </div>
          )}
          {planResult?.dynamicSummary.ctaParagraph && (
            <div className="bento-card p-6 border-t-4 border-t-emerald-500">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-2">המלצה אופרטיבית</p>
              <p className="text-sm text-emerald-300 leading-relaxed font-medium">
                {planResult.dynamicSummary.ctaParagraph}
              </p>
            </div>
          )}
          {dsmDiagnosis && <DSMDiagnosisCard diagnosis={dsmDiagnosis} />}
          {dsmDiagnosis && <ComorbidityMap edges={comorbidityEdges} diagnosis={dsmDiagnosis} />}
          <InterventionProtocolsCard protocols={interventionProtocols} />
          {planResult?.nextSteps && (
            <div className="bento-card p-6">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">צעדים מומלצים</p>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{planResult.nextSteps}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
