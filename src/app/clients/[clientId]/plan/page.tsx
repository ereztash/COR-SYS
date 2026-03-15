import { getClientById, getPlanByClientId } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getOptionById } from '@/lib/service-catalog'
import { buildPlanFromQuestionnaire, type QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { diagnose, getComorbidityMap, getInterventionProtocols, SEVERITY_PROFILES, LEVEL_COLORS, type DSMDiagnosis, type ComorbidityEdge, type InterventionProtocol } from '@/lib/dsm-engine'
import { PlanQuestionnaireForm } from './PlanQuestionnaireForm'

export const dynamic = 'force-dynamic'

function EntropyDots({ score }: { score: number }) {
  const colors = ['bg-emerald-500', 'bg-yellow-400', 'bg-orange-400', 'bg-red-500']
  const labels = ['נמוכה', 'בינונית', 'גבוהה', 'קריטית']
  const level = score === 0 ? 0 : score <= 1 ? 1 : score <= 2 ? 2 : 3
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < score ? colors[Math.min(score - 1, 3)] : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-slate-400">
        {score}/4 פתולוגיות —{' '}
        <span className={score >= 3 ? 'text-red-400' : score >= 2 ? 'text-orange-400' : score >= 1 ? 'text-yellow-400' : 'text-emerald-400'}>
          אנטרופיה {labels[level]}
        </span>
      </span>
    </div>
  )
}

// ─── DSM Diagnosis Card ──────────────────────────────────────────────────────

function DSMDiagnosisCard({ diagnosis }: { diagnosis: DSMDiagnosis }) {
  const profile = SEVERITY_PROFILES[diagnosis.severityProfile]
  return (
    <div className={`bento-card p-6 border-t-4 ${profile.borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase">אבחון DSM ארגוני</p>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${profile.bgColor} ${profile.color}`}>
          {profile.labelHe}
        </span>
      </div>
      <div className="space-y-3">
        {diagnosis.pathologies.map((p) => {
          const colors = LEVEL_COLORS[p.level]
          return (
            <div key={p.code} className="flex items-center gap-3">
              <code className={`text-lg font-black font-mono ${colors.text} w-14 shrink-0`}>
                {p.code}-{p.level}
              </code>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-300">{p.nameHe}</span>
                  <span className={`text-xs font-bold ${colors.text}`}>{p.score.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${colors.bar}`}
                    style={{ width: `${(p.score / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Comorbidity Map (SVG) ───────────────────────────────────────────────────

function ComorbidityMap({ edges, diagnosis }: { edges: ComorbidityEdge[]; diagnosis: DSMDiagnosis }) {
  const activeEdges = edges.filter((e) => e.active)
  if (activeEdges.length === 0 && diagnosis.severityProfile === 'healthy') return null

  // Triangle layout: DR top, ND bottom-left, UC bottom-right
  const nodes: { code: string; cx: number; cy: number; nameHe: string }[] = [
    { code: 'DR', cx: 150, cy: 40, nameHe: 'הדדיות מעוותת' },
    { code: 'ND', cx: 60, cy: 160, nameHe: 'נורמליזציית סטייה' },
    { code: 'UC', cx: 240, cy: 160, nameHe: 'כיול לא-מייצג' },
  ]
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.code, n]))
  const pathologyMap = Object.fromEntries(diagnosis.pathologies.map((p) => [p.code, p]))

  return (
    <div className="bento-card p-6">
      <p className="text-xs font-bold text-slate-500 uppercase mb-3">מפת קומורבידיות</p>
      <svg viewBox="0 0 300 200" className="w-full max-w-sm mx-auto" dir="ltr">
        {/* Edges */}
        {edges.map((edge) => {
          const from = nodeMap[edge.from]
          const to = nodeMap[edge.to]
          const color = edge.direction === 'positive' ? '#3b82f6' : '#f97316'
          const opacity = edge.active ? 0.9 : 0.2
          const strokeWidth = edge.active ? 2.5 : 1
          const dashArray = edge.active ? 'none' : '4,4'
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy}
                stroke={color} strokeWidth={strokeWidth} opacity={opacity}
                strokeDasharray={dashArray}
              />
              {edge.active && (
                <text
                  x={(from.cx + to.cx) / 2}
                  y={(from.cy + to.cy) / 2 - 6}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400"
                >
                  r={edge.correlation.toFixed(2)}
                </text>
              )}
            </g>
          )
        })}
        {/* Nodes */}
        {nodes.map((node) => {
          const p = pathologyMap[node.code]
          const colors = p ? LEVEL_COLORS[p.level] : LEVEL_COLORS[1]
          return (
            <g key={node.code}>
              <circle cx={node.cx} cy={node.cy} r={22} className={`${colors.bg} opacity-20`} fill="currentColor" />
              <circle cx={node.cx} cy={node.cy} r={18} className={`${colors.bg} opacity-60`} fill="currentColor" />
              <text x={node.cx} y={node.cy + 4} textAnchor="middle" className="text-xs font-bold fill-white">
                {node.code}
              </text>
            </g>
          )
        })}
      </svg>
      {activeEdges.length > 0 && (
        <div className="mt-3 space-y-2">
          {activeEdges.map((edge) => (
            <div key={`${edge.from}-${edge.to}-desc`} className="text-xs text-slate-400 leading-relaxed">
              <span className={edge.direction === 'positive' ? 'text-blue-400' : 'text-orange-400'}>
                {edge.from} ↔ {edge.to} (r={edge.correlation.toFixed(2)})
              </span>
              {' — '}{edge.mechanism}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Intervention Protocols Card ─────────────────────────────────────────────

function InterventionProtocolsCard({ protocols }: { protocols: InterventionProtocol[] }) {
  if (protocols.length === 0) return null
  return (
    <div className="bento-card p-6 border-r-4 border-r-red-500">
      <p className="text-xs font-bold text-slate-500 uppercase mb-4">פרוטוקולי התערבות מומלצים</p>
      <div className="space-y-5">
        {protocols.map((protocol) => (
          <div key={protocol.id} className="bg-slate-800/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">{protocol.nameHe}</h3>
              <span className="text-[10px] text-slate-500 font-mono">{protocol.phase}</span>
            </div>
            <ul className="space-y-1.5 mb-3">
              {protocol.components.map((c, i) => (
                <li key={i} className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-200">{c.step}</span>
                  {' — '}{c.detail}
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-700 pt-2">
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">מדדי הצלחה</p>
              <ul className="space-y-0.5">
                {protocol.successMetrics.map((m, i) => (
                  <li key={i} className="text-[11px] text-emerald-400/80">{m}</li>
                ))}
              </ul>
            </div>
            <p className="text-[10px] text-slate-600 mt-2">{protocol.researchBasis}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-4">
        <Link
          href="/services"
          className="flex-1 text-center px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors"
        >
          הזמן התערבות ←
        </Link>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ClientPlanPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const [client, plan] = await Promise.all([
    getClientById(clientId),
    getPlanByClientId(clientId),
  ])
  if (!client) notFound()

  const recommendedOption = plan?.recommended_option_id ? getOptionById(plan.recommended_option_id) : null

  // Reconstruct rich diagnostic from stored questionnaire answers
  let planResult: ReturnType<typeof buildPlanFromQuestionnaire> | null = null
  let dsmDiagnosis: DSMDiagnosis | null = null
  let comorbidityEdges: ComorbidityEdge[] = []
  let interventionProtocols: InterventionProtocol[] = []

  if (plan?.questionnaire_response) {
    const qa = plan.questionnaire_response as QuestionnaireAnswer
    try {
      planResult = buildPlanFromQuestionnaire(client.name, qa)
    } catch {
      // graceful fallback — show stored data only
    }
    try {
      dsmDiagnosis = diagnose(qa)
      comorbidityEdges = getComorbidityMap(dsmDiagnosis)
      interventionProtocols = getInterventionProtocols(dsmDiagnosis, qa)
    } catch {
      // graceful fallback
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
            <InterventionProtocolsCard protocols={interventionProtocols} />

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
