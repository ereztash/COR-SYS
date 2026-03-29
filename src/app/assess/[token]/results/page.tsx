import { notFound } from 'next/navigation'
import { getAssessmentByToken, getClientById } from '@/lib/data'
import { getOptionById } from '@/lib/service-catalog'
import {
  type QuestionnaireAnswer,
  mergeOperatingContextFromClient,
  effectiveOperatingContext,
} from '@/lib/corsys-questionnaire'
import { computeDiagnostic } from '@/lib/diagnostic'
import { contextAwareLabels } from '@/lib/client-context-labels'
import { PATHOLOGY_TYPE_LABELS } from '@/lib/diagnostic/action-plan'
import { SEVERITY_PROFILES, type PathologySeverity } from '@/lib/dsm-engine'
import { ComorbidityMap, InterventionProtocolsCard } from '@/components/diagnostic'
import { ModeBlurb } from '@/components/ui/ModeBlurb'

export const dynamic = 'force-dynamic'

// ─── DSM Radar — 4D Spider Chart ─────────────────────────────────────────────

function DSMRadar({ pathologies, severity }: { pathologies: PathologySeverity[]; severity: string }) {
  const scores = Object.fromEntries(pathologies.map(p => [p.code, p.score]))
  const cx = 130, cy = 130, maxR = 96

  const axes = [
    { code: 'DR', angle: -90, labelHe: 'הדדיות' },
    { code: 'UC', angle:   0, labelHe: 'כיול'   },
    { code: 'ND', angle:  90, labelHe: 'סטייה'  },
    { code: 'SC', angle: 180, labelHe: 'מבנה'   },
  ]

  const rad = (d: number) => (d * Math.PI) / 180
  const pt  = (angle: number, r: number) => ({
    x: cx + r * Math.cos(rad(angle)),
    y: cy + r * Math.sin(rad(angle)),
  })

  const scorePoints = axes.map(a => pt(a.angle, ((scores[a.code] ?? 5) / 10) * maxR))
  const polPts = scorePoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const strokeColor =
    severity === 'healthy'          ? '#34d399'
    : severity === 'at-risk'        ? '#fbbf24'
    : severity === 'critical'       ? '#fb923c'
    : '#f43f5e'

  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-[260px] mx-auto" aria-hidden="true" style={{ direction: 'ltr' } as React.CSSProperties}>
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={strokeColor} stopOpacity="0.12" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx={cx} cy={cy} r={maxR + 18} fill="url(#radarGlow)" />

      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1.0].map((level, i) => {
        const gpts = axes.map(a => pt(a.angle, maxR * level))
        return (
          <polygon
            key={i}
            points={gpts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
            fill="none"
            stroke="rgba(148,163,184,0.09)"
            strokeWidth="1"
          />
        )
      })}

      {/* Axis lines */}
      {axes.map(a => {
        const end = pt(a.angle, maxR)
        return (
          <line
            key={a.code}
            x1={cx} y1={cy}
            x2={end.x.toFixed(1)} y2={end.y.toFixed(1)}
            stroke="rgba(148,163,184,0.13)"
            strokeWidth="1"
          />
        )
      })}

      {/* Score polygon */}
      <polygon
        points={polPts}
        fill={`${strokeColor}22`}
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 10px ${strokeColor}55)` }}
      />

      {/* Score dots */}
      {scorePoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x.toFixed(1)} cy={p.y.toFixed(1)}
          r="5"
          fill={strokeColor}
          style={{ filter: `drop-shadow(0 0 5px ${strokeColor})` }}
        />
      ))}

      {/* Axis labels */}
      {axes.map(a => {
        const lp    = pt(a.angle, maxR + 22)
        const score = scores[a.code] ?? 5
        const lc    = score > 5.5 ? '#f87171' : score > 2.5 ? '#fbbf24' : '#34d399'
        return (
          <g key={a.code}>
            <text
              x={lp.x.toFixed(1)} y={(lp.y - 4).toFixed(1)}
              textAnchor="middle" fill={lc}
              fontSize="10" fontWeight="bold" fontFamily="monospace"
            >
              {a.code}
            </text>
            <text
              x={lp.x.toFixed(1)} y={(lp.y + 9).toFixed(1)}
              textAnchor="middle" fill="rgba(148,163,184,0.6)"
              fontSize="8.5"
            >
              {score.toFixed(1)}
            </text>
          </g>
        )
      })}

      {/* Center label */}
      <text x={cx} y={cy + 5} textAnchor="middle" fill="rgba(148,163,184,0.25)" fontSize="9">
        4D
      </text>
    </svg>
  )
}

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY_ACCENT: Record<string, string> = {
  'healthy':          '#34d399',
  'at-risk':          '#fbbf24',
  'critical':         '#fb923c',
  'systemic-collapse':'#f43f5e',
}

const HERO_GRADIENT: Record<string, string> = {
  'healthy':           'linear-gradient(135deg,rgba(6,78,59,0.38) 0%,rgba(6,13,31,0.97) 60%)',
  'at-risk':           'linear-gradient(135deg,rgba(120,53,15,0.48) 0%,rgba(6,13,31,0.97) 60%)',
  'critical':          'linear-gradient(135deg,rgba(136,19,55,0.55) 0%,rgba(6,13,31,0.97) 58%)',
  'systemic-collapse': 'linear-gradient(135deg,rgba(127,29,29,0.68) 0%,rgba(6,13,31,0.99) 52%)',
}

const PATHOLOGY_CARD_ACCENT: Record<string, string> = {
  1: '#34d399',
  2: '#fbbf24',
  3: '#f43f5e',
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default async function AssessResultsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const assessment = await getAssessmentByToken(token)
  if (!assessment) notFound()

  const answersRaw = (assessment.answers ?? {}) as QuestionnaireAnswer
  const linkedClient = assessment.client_id ? await getClientById(assessment.client_id) : null
  const clientName = linkedClient?.name ?? 'הארגון'
  const answers = mergeOperatingContextFromClient(answersRaw, linkedClient)
  const uiLabels = contextAwareLabels(effectiveOperatingContext(answers))

  let planResult:           ReturnType<typeof computeDiagnostic>['planResult']           | null = null
  let dsmDiagnosis:         ReturnType<typeof computeDiagnostic>['dsmDiagnosis']         | null = null
  let orgPathology:         ReturnType<typeof computeDiagnostic>['orgPathology']         | null = null
  let comorbidityEdges:     ReturnType<typeof computeDiagnostic>['comorbidityEdges']           = []
  let unifiedTreatmentPlan: ReturnType<typeof computeDiagnostic>['unifiedTreatmentPlan'] | null =
    null
  let ignition: ReturnType<typeof computeDiagnostic>['ignition'] | null = null

  try {
    const d = computeDiagnostic(clientName, answers, linkedClient)
    planResult            = d.planResult
    dsmDiagnosis          = d.dsmDiagnosis
    orgPathology          = d.orgPathology
    comorbidityEdges      = d.comorbidityEdges
    unifiedTreatmentPlan  = d.unifiedTreatmentPlan
    ignition              = d.ignition
  } catch { /* show minimal view */ }

  const severity  = dsmDiagnosis?.severityProfile ?? 'at-risk'
  const profile   = SEVERITY_PROFILES[severity]
  const accent    = SEVERITY_ACCENT[severity]  ?? '#818cf8'
  const heroGrad  = HERO_GRADIENT[severity]    ?? HERO_GRADIENT['at-risk']
  const recommended = planResult?.recommendedOptionId ? getOptionById(planResult.recommendedOptionId) : null

  return (
    <div className="min-h-screen" style={{ background: '#060d1f' }}>

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5"
        style={{ background: 'rgba(6,13,31,0.85)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}
          >
            C
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-black text-white text-lg" style={{ fontFamily: 'Heebo, sans-serif' }}>
              COR-SYS
            </span>
            <span className="text-[10px] text-slate-600 font-mono hidden sm:block">Deep-Grid v2.2</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 font-mono hidden sm:flex items-center gap-2">
          <span>J(t) = C(t) / E(t)</span>
          <span className="text-slate-800">·</span>
          <span>DSM Organizational Assessment</span>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: heroGrad }}>
        {/* Grid texture */}
        <div className="absolute inset-0 grid-texture opacity-100" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
             style={{ background: 'linear-gradient(to bottom, transparent, #060d1f)' }} />

        <div className="relative max-w-5xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">

            {/* Text */}
            <div className="lg:col-span-3 animate-fade-up">
              {/* Live severity indicator */}
              <div className="flex items-center gap-2.5 mb-5">
                <span className="relative flex h-3 w-3">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full animate-pulse-ring"
                    style={{ background: accent }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-3 w-3"
                    style={{ background: accent }}
                  />
                </span>
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: accent }}
                >
                  {uiLabels.dsmBadgeLine} &nbsp;·&nbsp;{' '}
                  {new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4"
                style={{ fontFamily: 'Heebo, sans-serif' }}
              >
                {clientName}
              </h1>

              <p className="text-slate-400 text-base leading-relaxed mb-7 max-w-lg">
                {planResult?.dynamicSummary.roleParagraph ?? uiLabels.heroFallbackParagraph}
              </p>
              <ModeBlurb
                className="mb-5"
                beginner="זה דוח מצב: איפה הכאב המרכזי ומה הצעד הבא להתחלה."
                advanced="Diagnostic snapshot linking severity, bottlenecks, and initial intervention direction."
                research="Integrated output layer for pathology-state interpretation and intervention design."
              />

              {/* Severity badge */}
              <div
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border font-bold"
                style={{
                  background:   `${accent}12`,
                  borderColor:  `${accent}35`,
                  color: accent,
                }}
              >
                <span className="text-xl leading-none">
                  {severity === 'healthy' ? '◎' : severity === 'at-risk' ? '◈' : '⬡'}
                </span>
                <span>{profile.labelHe}</span>
              </div>

              {orgPathology && (
                <p className="text-xs text-slate-400 mt-3 max-w-lg">
                  <span className="text-slate-500">סוג DSM-Org (מיפוי מאוחד):</span>{' '}
                  <span className="text-indigo-300 font-semibold">
                    {PATHOLOGY_TYPE_LABELS[orgPathology.primaryType]}
                  </span>
                </p>
              )}

              {/* Entropy score */}
              {planResult?.entropyScore !== undefined && (
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-xs text-slate-600 font-mono">{uiLabels.entropyMetric}</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border transition-all"
                        style={
                          i < planResult!.entropyScore
                            ? { background: accent, borderColor: accent, boxShadow: `0 0 6px ${accent}` }
                            : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold" style={{ color: accent }}>
                    {planResult.entropyScore}/4
                  </span>
                </div>
              )}
            </div>

            {/* Radar chart */}
            <div className="lg:col-span-2 flex items-center justify-center">
              {dsmDiagnosis && (
                <DSMRadar pathologies={dsmDiagnosis.pathologies} severity={severity} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">

        {/* 4-card pathology grid */}
        {dsmDiagnosis && (
          <section>
            <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-4">
              {uiLabels.pathologyGridTitle}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dsmDiagnosis.pathologies.map(p => {
                const ca = PATHOLOGY_CARD_ACCENT[p.level] ?? '#818cf8'
                const pct = (p.score / 10) * 100
                return (
                  <div
                    key={p.code}
                    className="rounded-2xl p-5 border relative overflow-hidden"
                    style={{
                      background:  `linear-gradient(135deg,${ca}09 0%,rgba(6,13,31,0.92) 70%)`,
                      borderColor: `${ca}22`,
                    }}
                  >
                    {/* Top accent bar */}
                    <div
                      className="absolute top-0 left-0 h-0.5 rounded-t-2xl"
                      style={{ width: `${pct}%`, background: ca, opacity: 0.7 }}
                    />
                    <div className="flex items-start justify-between mb-3">
                      <code
                        className="text-2xl font-black font-mono leading-none"
                        style={{ color: ca }}
                      >
                        {p.code}
                      </code>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${ca}18`, color: ca }}
                      >
                        {p.score.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 leading-snug">{p.nameHe}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5 mb-3">{p.nameEn}</p>
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div
                        className="h-1 rounded-full"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg,${ca}70,${ca})` }}
                      />
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: `${ca}99` }}>{p.levelLabel}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Diagnosis narrative */}
        {planResult?.dynamicSummary.diagnosisParagraph && (
          <div
            className="rounded-2xl p-7 border-r-4 relative overflow-hidden"
            style={{
              background:       'rgba(12,20,40,0.6)',
              borderRightColor: accent,
              borderTopColor:   'rgba(255,255,255,0.05)',
              borderBottomColor:'rgba(255,255,255,0.05)',
              borderLeftColor:  'rgba(255,255,255,0.05)',
              borderWidth: '1px',
              borderRightWidth: '4px',
            }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-full pointer-events-none"
              style={{ background: `linear-gradient(270deg,${accent}08,transparent)` }}
            />
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: accent }}
            >
              {uiLabels.diagnosisSectionTitle}
            </p>
            <p className="text-slate-200 leading-relaxed">{planResult.dynamicSummary.diagnosisParagraph}</p>
          </div>
        )}

        {(planResult?.dynamicSummary.ignitionParagraph ?? ignition) && (
          <div
            className="rounded-2xl p-7 border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg,rgba(245,158,11,0.08) 0%,rgba(6,13,31,0.92) 65%)',
              borderColor: 'rgba(245,158,11,0.25)',
            }}
          >
            <p className="text-[11px] font-bold text-amber-400/90 uppercase tracking-widest mb-3">
              התנעה עסקית
            </p>
            <p className="text-slate-200 leading-relaxed text-sm">
              {planResult?.dynamicSummary.ignitionParagraph ??
                (ignition ? `${ignition.narrativeHe} צעד ראשון: ${ignition.firstMoveHe}` : '')}
            </p>
          </div>
        )}

        {/* Recommended service */}
        {recommended && (
          <div
            className="rounded-2xl p-8 border relative overflow-hidden"
            style={{
              background:  'linear-gradient(135deg,rgba(99,102,241,0.13) 0%,rgba(6,13,31,0.96) 60%)',
              borderColor: 'rgba(99,102,241,0.28)',
            }}
          >
            {/* Top shimmer line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.6),transparent)' }}
            />

            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-2">
                  המלצת שירות
                </p>
                <h3
                  className="text-2xl font-black text-white mb-2 leading-tight"
                  style={{ fontFamily: 'Heebo, sans-serif' }}
                >
                  {recommended.nameHe}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-lg">
                  {recommended.description}
                </p>
                {planResult?.dynamicSummary.ctaParagraph && (
                  <p className="text-emerald-400 text-sm font-medium leading-relaxed">
                    {planResult.dynamicSummary.ctaParagraph}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-center sm:text-left">
                <div
                  className="text-4xl font-black text-white"
                  style={{ fontFamily: 'Heebo, sans-serif' }}
                >
                  {recommended.priceLabel}
                </div>
                <p className="text-xs text-slate-600 mt-1 font-mono">לחודש</p>
              </div>
            </div>
          </div>
        )}

        {/* Comorbidity map */}
        {dsmDiagnosis && (
          <ComorbidityMap edges={comorbidityEdges} diagnosis={dsmDiagnosis} />
        )}

        {/* Unified treatment plan */}
        {unifiedTreatmentPlan && <InterventionProtocolsCard unifiedPlan={unifiedTreatmentPlan} />}

        {/* Next steps */}
        {planResult?.nextSteps && (
          <div
            className="rounded-2xl p-7 border"
            style={{ background: 'rgba(12,20,40,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3">
              צעדים מומלצים
            </p>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {planResult.nextSteps}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-white/5 pt-8 pb-4 text-center space-y-1.5">
          <p className="text-[11px] text-slate-700 font-mono">
            COR-SYS · Deep-Grid v2.2 · DSM Organizational Diagnostic Engine
          </p>
          <p className="text-[10px] text-slate-800 font-mono">
            J(t) = C(t)/E(t) &nbsp;·&nbsp; LG = 0.571(−ΔDR) + 0.429(ΔPSI) &nbsp;·&nbsp; λ = 1 + κ×LG
          </p>
          <p className="text-[10px] text-slate-800 font-mono">
            Kahneman & Tversky (1991) · Edmondson (1999) · Argyris (1977) · Vaughan (1996)
          </p>
        </footer>

      </main>
    </div>
  )
}
