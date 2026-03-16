import { getClientById, getPlanByClientId } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getOptionById } from '@/lib/service-catalog'
import type { QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { computeDiagnostic } from '@/lib/diagnostic'
import { EntropyDots, DSMDiagnosisCard, ComorbidityMap, InterventionProtocolsCard, PlanProtocolsCta } from '@/components/diagnostic'
import { PlanQuestionnaireForm } from './PlanQuestionnaireForm'

export const dynamic = 'force-dynamic'

export default async function ClientPlanPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const [client, plan] = await Promise.all([
    getClientById(clientId),
    getPlanByClientId(clientId),
  ])
  if (!client) notFound()

  const recommendedOption = plan?.recommended_option_id ? getOptionById(plan.recommended_option_id) : null

  let planResult: ReturnType<typeof computeDiagnostic>['planResult'] | null = null
  let dsmDiagnosis: ReturnType<typeof computeDiagnostic>['dsmDiagnosis'] | null = null
  let comorbidityEdges: ReturnType<typeof computeDiagnostic>['comorbidityEdges'] = []
  let interventionProtocols: ReturnType<typeof computeDiagnostic>['interventionProtocols'] = []

  if (plan?.questionnaire_response) {
    const qa = plan.questionnaire_response as QuestionnaireAnswer
    try {
      const diagnostic = computeDiagnostic(client.name, qa)
      planResult = diagnostic.planResult
      dsmDiagnosis = diagnostic.dsmDiagnosis
      comorbidityEdges = diagnostic.comorbidityEdges
      interventionProtocols = diagnostic.interventionProtocols
    } catch {
      // graceful fallback — show stored data only
    }
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Link href={`/clients/${clientId}`} className="text-slate-400 hover:text-white text-sm transition-colors">← {client.name}</Link>
        <h1 className="text-2xl font-black text-white mt-2">תוכנית עסקית — {client.name}</h1>
        <p className="text-slate-400 text-sm mt-1">שאלון COR-SYS ומבנה תוכנית לפי פתולוגיות ו-ICP</p>

        {plan ? (
          <div className="mt-8 space-y-5">

            {/* Entropy Score */}
            {planResult && (
              <div className="bento-card p-5">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">ציון אנטרופיה ארגונית</p>
                <EntropyDots score={planResult.entropyScore} />
              </div>
            )}

            {/* Role paragraph */}
            {planResult?.dynamicSummary.roleParagraph && (
              <div className="bento-card p-6">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">תפקיד ושלב ארגוני</p>
                <p className="text-sm text-slate-300 leading-relaxed">{planResult.dynamicSummary.roleParagraph}</p>
              </div>
            )}

            {/* Diagnosis paragraph */}
            {planResult?.dynamicSummary.diagnosisParagraph && (
              <div className="bento-card p-6 border-r-4 border-r-orange-500">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">אבחון פתולוגיות</p>
                <p className="text-sm text-slate-300 leading-relaxed">{planResult.dynamicSummary.diagnosisParagraph}</p>
              </div>
            )}

            {/* Recommended service */}
            {recommendedOption && (
              <div className="bento-card p-6 border-r-4 border-r-blue-500">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">המלצת שירות</p>
                <p className="font-bold text-white text-lg">{recommendedOption.nameHe}</p>
                <p className="text-xs text-slate-400 mt-0.5">{recommendedOption.description}</p>
                <p className="text-emerald-400 font-bold text-sm mt-2">{recommendedOption.priceLabel}</p>
              </div>
            )}

            {/* CTA paragraph */}
            {planResult?.dynamicSummary.ctaParagraph && (
              <div className="bento-card p-6 border-t-4 border-t-emerald-500">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">המלצה אופרטיבית</p>
                <p className="text-sm text-emerald-300 leading-relaxed font-medium">{planResult.dynamicSummary.ctaParagraph}</p>
              </div>
            )}

            {/* DSM Diagnosis */}
            {dsmDiagnosis && <DSMDiagnosisCard diagnosis={dsmDiagnosis} />}

            {/* Comorbidity Map */}
            {dsmDiagnosis && <ComorbidityMap edges={comorbidityEdges} diagnosis={dsmDiagnosis} />}

            {/* Intervention Protocols */}
            <InterventionProtocolsCard protocols={interventionProtocols} ctaSlot={<PlanProtocolsCta />} />

            {/* Summary fallback */}
            {!planResult && plan.summary && (
              <div className="bento-card p-6 border-t-4 border-t-emerald-500">
                <h2 className="text-lg font-bold text-white mb-2">סיכום</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{plan.summary}</p>
              </div>
            )}

            {/* Next steps */}
            <div className="bento-card p-6">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">צעדים מומלצים</p>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{plan.next_steps ?? '—'}</p>
            </div>

            <div className="flex justify-end">
              <a
                href={`/api/plans/${clientId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-bold transition-colors"
              >
                הורד דו"ח PDF
              </a>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <details className="group">
                <summary className="text-sm text-slate-400 cursor-pointer hover:text-white list-none">
                  <span className="group-open:hidden">עדכן תוכנית (שאלון מחדש)</span>
                  <span className="hidden group-open:inline">סגור שאלון</span>
                </summary>
                <div className="mt-3">
                  <PlanQuestionnaireForm clientId={clientId} clientName={client.name} />
                </div>
              </details>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <p className="text-slate-400 text-sm mb-6">מלא את השאלון לפי מודל COR-SYS. התוכנית תיבנה אוטומטית (המלצת ערוץ, שירות וצעדים).</p>
            <PlanQuestionnaireForm clientId={clientId} clientName={client.name} />
          </div>
        )}

        <p className="mt-8 text-[10px] text-slate-500">
          אם שמירה נכשלת — וודא שהרצת את המיגרציה <code className="bg-slate-800 px-1 rounded">supabase-migration-client-plans.sql</code> ב-Supabase.
        </p>
      </div>
    </div>
  )
}
