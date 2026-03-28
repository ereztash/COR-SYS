'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  diagnoseFromScores,
  SEVERITY_PROFILES,
  LEVEL_COLORS,
  type DSMDiagnosis,
  type PathologyCode,
} from '@/lib/dsm-engine'
import {
  buildGoldenQuestions,
  getBenchmarkForScore,
  RESEARCH_MODULES,
  type GoldenQuestionAnswers,
} from '@/lib/dsm-policy-engine'
import { PATHOLOGY_TYPE_LABELS } from '@/lib/diagnostic/action-plan'
import { primaryOrgPathologyFromDiagnosis } from '@/lib/diagnostic/dsm-synthesis'
import { ModeBlurb } from '@/components/ui/ModeBlurb'

function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

// ─── Heuristic label per slider value ────────────────────────────────────────

const DR_HEURISTICS = (v: number) =>
  v <= 2.5
    ? 'תחושת win-win, קונפליקטים בין-מחלקתיים נדירים'
    : v <= 5.5
      ? 'חיכוכים קיימים סביב מדדים ויעדים'
      : 'תחרות פנימית היא ברירת המחדל — הצלחה של יחידה אחת על חשבון אחרת'

const ND_HEURISTICS = (v: number) =>
  v <= 2.5
    ? 'נהלים תומכים בעבודה, עקיפת נהלים נדירה'
    : v <= 5.5
      ? 'Workarounds מופיעים בעיקר בתקופות עומס'
      : 'עקיפת נהלים היא הנורמה — המערכת נשענת על אקסלים צדדיים'

const UC_HEURISTICS = (v: number) =>
  v <= 2.5
    ? 'למידה דו-לולאתית, שפה ארגונית ברורה'
    : v <= 5.5
      ? 'עושים תחקירים, אך לא תמיד מתרגמים לשינוי עומק'
      : 'כיבוי שריפות, תרבות האשמה וסחיפה סמנטית גבוהה'

// ─── Mini Comorbidity Map ─────────────────────────────────────────────────────

function ComorbidityMap({ diagnosis }: { diagnosis: DSMDiagnosis }) {
  const EDGES = [
    { from: 'DR', to: 'ND', r: 0.19, dir: 'positive' as const, label: 'r=.19' },
    { from: 'DR', to: 'UC', r: -0.27, dir: 'negative' as const, label: 'r=−.27' },
    { from: 'ND', to: 'UC', r: 0.28, dir: 'positive' as const, label: 'r=.28' },
  ]
  const nodes = [
    { code: 'DR', cx: 80, cy: 22 },
    { code: 'ND', cx: 28, cy: 98 },
    { code: 'UC', cx: 132, cy: 98 },
  ]
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.code, n]))
  const pathMap = Object.fromEntries(diagnosis.pathologies.map((p) => [p.code, p]))

  return (
    <svg viewBox="0 0 160 125" className="w-full max-w-[160px]" direction="ltr">
      {EDGES.map(({ from, to, dir, label }) => {
        const f = nodeMap[from], t = nodeMap[to]
        const active = pathMap[from].level >= 2 && pathMap[to].level >= 2
        const mx = (f.cx + t.cx) / 2
        const my = (f.cy + t.cy) / 2
        return (
          <g key={`${from}-${to}`}>
            <line
              x1={f.cx} y1={f.cy} x2={t.cx} y2={t.cy}
              stroke={dir === 'positive' ? '#3b82f6' : '#f97316'}
              strokeWidth={active ? 2 : 0.8}
              opacity={active ? 0.85 : 0.2}
              strokeDasharray={active ? 'none' : '3,3'}
            />
            {active && (
              <text x={mx} y={my - 3} textAnchor="middle" fontSize="7" fill={dir === 'positive' ? '#93c5fd' : '#fdba74'} opacity={0.9}>
                {label}
              </text>
            )}
          </g>
        )
      })}
      {nodes.map((node) => {
        const p = pathMap[node.code]
        const colors = LEVEL_COLORS[p.level]
        return (
          <g key={node.code}>
            <circle cx={node.cx} cy={node.cy} r={15} className={`${colors.bg} opacity-25`} fill="currentColor" />
            <circle cx={node.cx} cy={node.cy} r={15} stroke="currentColor" strokeWidth={p.level >= 2 ? 1.5 : 0.5} className={colors.text} fill="none" opacity={0.6} />
            <text x={node.cx} y={node.cy + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">
              {node.code}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Golden Question Cards ────────────────────────────────────────────────────

function GoldenQ1({ gq }: { gq: GoldenQuestionAnswers }) {
  const profile = SEVERITY_PROFILES[gq.systemState.profile as keyof typeof SEVERITY_PROFILES]
  return (
    <div className={`bento-card p-5 border-t-4 ${profile.borderColor}`}>
      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">שאלה 1 — מה מצב ה‑DSM הארגוני?</p>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1.5 flex-wrap">
          {gq.systemState.codes.map((c) => (
            <code key={c} className="text-xs font-black font-mono text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded">{c}</code>
          ))}
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${profile.bgColor} ${profile.color} shrink-0 mr-1`}>
          {profile.labelHe}
        </span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{gq.systemState.narrativeHe}</p>
    </div>
  )
}

function GoldenQ2({ gq, diagnosis }: { gq: GoldenQuestionAnswers; diagnosis: DSMDiagnosis }) {
  const primary = diagnosis.pathologies.find((p) => p.code === gq.bottleneck.pathologyCode)!
  const colors = LEVEL_COLORS[primary.level]
  const benchmark = getBenchmarkForScore(primary.code, primary.score)

  return (
    <div className="bento-card p-5">
      <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">שאלה 2 — איפה צוואר הבקבוק הראשי?</p>
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <code className={`text-2xl font-black font-mono ${colors.text}`}>{primary.code}-{primary.level}</code>
            <div>
              <p className="text-xs font-bold text-white">{primary.nameHe}</p>
              <p className="text-[10px] text-slate-500">{primary.levelLabel}</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{gq.bottleneck.bottleneckNarrativeHe}</p>
          {benchmark && (
            <div className="bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/50">
              <p className="text-[10px] text-slate-400 font-semibold">{benchmark.percentileEstimate}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{benchmark.cohortNote}</p>
            </div>
          )}
          {gq.bottleneck.activeComorbidities.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">קשרי קומורבידיות פעילים</p>
              {gq.bottleneck.activeComorbidities.map((c) => (
                <p key={c} className="text-[10px] text-blue-400">{c}</p>
              ))}
            </div>
          )}
        </div>
        <ComorbidityMap diagnosis={diagnosis} />
      </div>
    </div>
  )
}

function GoldenQ3({ gq }: { gq: GoldenQuestionAnswers }) {
  const { annualWasteILS, weeklyWasteILS, jQuotient, jInterpretationHe, urgencySignal } = gq.economicImpact
  const jColor = jQuotient < 0.35 ? 'text-red-400' : jQuotient < 0.6 ? 'text-yellow-400' : 'text-emerald-400'
  const urgencyColor = urgencySignal === 'critical' ? 'text-red-400 bg-red-950/30 border-red-700/40' : urgencySignal === 'elevated' ? 'text-yellow-400 bg-yellow-950/20 border-yellow-700/40' : 'text-emerald-400 bg-emerald-950/20 border-emerald-700/40'

  return (
    <div className="bento-card p-5">
      <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">שאלה 3 — כמה כסף/קיבולת הולכים לאיבוד?</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/60 rounded-xl p-4">
          <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">הפסד שנתי</p>
          <p className="text-xl font-black text-white">{formatILS(annualWasteILS)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{formatILS(weeklyWasteILS)} / שבוע</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4">
          <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">J-Quotient</p>
          <p className={`text-xl font-black ${jColor}`}>{jQuotient.toFixed(2)}</p>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full transition-all ${jQuotient < 0.35 ? 'bg-red-500' : jQuotient < 0.6 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
              style={{ width: `${jQuotient * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className={`mt-3 rounded-lg px-3 py-2 border text-[10px] font-medium leading-relaxed ${urgencyColor}`}>
        {jInterpretationHe}
      </div>
    </div>
  )
}

function GoldenQ4({ gq }: { gq: GoldenQuestionAnswers }) {
  const { ctaType, ctaLabelHe, timeToActMonths, rationale } = gq.recommendedAction
  const ctaColors = {
    sprint: 'border-red-500 bg-red-600 hover:bg-red-500',
    retainer: 'border-blue-500 bg-blue-600 hover:bg-blue-500',
    'live-demo': 'border-emerald-500 bg-emerald-700 hover:bg-emerald-600',
  }
  const urgencyLabel = timeToActMonths === 0 ? 'מיידי' : `תוך ${timeToActMonths} חודש${timeToActMonths > 1 ? 'ים' : ''}`

  return (
    <div className={`bento-card p-5 border-t-4 ${ctaType === 'sprint' ? 'border-t-red-500' : ctaType === 'retainer' ? 'border-t-blue-500' : 'border-t-emerald-500'}`}>
      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">שאלה 4 — מה מהלך ההתערבות המומלץ?</p>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-black text-white">{ctaLabelHe}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">חלון פעולה מומלץ: <span className="font-bold text-slate-300">{urgencyLabel}</span></p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${ctaType === 'sprint' ? 'text-red-300 border-red-700/50 bg-red-950/30' : ctaType === 'retainer' ? 'text-blue-300 border-blue-700/50 bg-blue-950/30' : 'text-emerald-300 border-emerald-700/50 bg-emerald-950/30'}`}>
          {ctaType.toUpperCase()}
        </span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{rationale}</p>
      <Link
        href="/clients"
        className={`block text-center px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-colors ${ctaColors[ctaType]}`}
      >
        {ctaLabelHe} ←
      </Link>
    </div>
  )
}

// ─── Research Module Tooltip ──────────────────────────────────────────────────

function ResearchBadge({ pathologyCode }: { pathologyCode: PathologyCode }) {
  const modules = RESEARCH_MODULES.filter((m) => m.pathologyMapping.includes(pathologyCode))
  if (modules.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {modules.map((m) => (
        <span key={m.id} title={m.empiricalEvidence} className="text-[9px] text-slate-600 bg-slate-800/40 border border-slate-700/30 px-1.5 py-0.5 rounded cursor-help">
          {m.name.split(' ')[0]}
        </span>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [drScore, setDrScore] = useState(5)
  const [ndScore, setNdScore] = useState(5)
  const [ucScore, setUcScore] = useState(5)
  const [managers, setManagers] = useState(5)
  const [hoursPerWeek, setHoursPerWeek] = useState(15)
  const [monthlySalary, setMonthlySalary] = useState(35000)
  const [showResearch, setShowResearch] = useState(false)

  const diagnosis = useMemo(
    () => diagnoseFromScores(drScore, ndScore, ucScore, hoursPerWeek),
    [drScore, ndScore, ucScore, hoursPerWeek]
  )

  const goldenQuestions = useMemo(
    () => buildGoldenQuestions(diagnosis, { managers, hoursPerWeek, monthlySalary }),
    [diagnosis, managers, hoursPerWeek, monthlySalary]
  )

  const orgPathology = useMemo(() => primaryOrgPathologyFromDiagnosis(diagnosis), [diagnosis])

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Link href="/services" className="text-slate-400 hover:text-white text-sm transition-colors">← שירותים</Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">מחשבון אבחון DSM ארגוני</h1>
            <p className="text-slate-400 text-sm mt-1">Decision Engine — 4 שאלות זהב, Policy Engine, Benchmark Context</p>
            <ModeBlurb
              className="mt-2"
              beginner="ממלאים כמה שדות ומקבלים תמונת מצב + המלצה ראשונה."
              advanced="Interactive diagnostic calculator with structured recommendation framing."
              research="Score-driven policy inference sandbox with benchmark and comorbidity overlays."
            />
          </div>
          <button
            onClick={() => setShowResearch((v) => !v)}
            className="shrink-0 text-[10px] text-slate-500 hover:text-slate-300 border border-slate-700 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            {showResearch ? 'הסתר מחקר' : 'בסיס מחקרי'}
          </button>
        </div>

        {/* ── Research Module Panel ── */}
        {showResearch && (
          <div className="mt-4 bento-card p-5 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase">מודולים מחקריים — בסיס תיאורטי</p>
            {RESEARCH_MODULES.map((m) => (
              <div key={m.id} className="border-b border-slate-700/40 pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-200">{m.name}</p>
                  <div className="flex gap-1 shrink-0">
                    {m.pathologyMapping.map((c) => (
                      <span key={c} className="text-[9px] font-mono text-slate-500 bg-slate-700/40 px-1.5 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{m.theoreticalBasis}</p>
                <p className="text-[10px] text-slate-600 mt-0.5 italic">{m.empiricalEvidence}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Section 1: Pathology Sliders ── */}
        <div className="mt-6 bento-card p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-400 uppercase">אבחון פתולוגיות</h2>

          <SliderInput
            label="רמת תחרות פנימית (DR)"
            sublabel="Distorted Reciprocity — חשיבה אפס-סכומית, אגירת משאבים"
            heuristicLabel={DR_HEURISTICS(drScore)}
            value={drScore} onChange={setDrScore} min={0} max={10}
            colorFn={(v) => v > 5.5 ? 'text-intent-danger' : v > 2.5 ? 'text-intent-warning' : 'text-intent-success'}
          />
          <ResearchBadge pathologyCode="DR" />

          <SliderInput
            label="רמת עקיפת נהלים (ND)"
            sublabel="Normalization of Deviance — קיצורי דרך, לחץ ייצור גובר על נהלים"
            heuristicLabel={ND_HEURISTICS(ndScore)}
            value={ndScore} onChange={setNdScore} min={0} max={10}
            colorFn={(v) => v > 5.5 ? 'text-intent-danger' : v > 2.5 ? 'text-intent-warning' : 'text-intent-success'}
          />
          <ResearchBadge pathologyCode="ND" />

          <SliderInput
            label="רמת כשל למידה (UC)"
            sublabel="Unrepresentative Calibration — חוסר בטחון פסיכולוגי, למידה חד-לולאתית"
            heuristicLabel={UC_HEURISTICS(ucScore)}
            value={ucScore} onChange={setUcScore} min={0} max={10}
            colorFn={(v) => v > 5.5 ? 'text-intent-danger' : v > 2.5 ? 'text-intent-warning' : 'text-intent-success'}
          />
          <ResearchBadge pathologyCode="UC" />
        </div>

        {/* ── Section 2: Economic Inputs ── */}
        <div className="mt-4 bento-card p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-400 uppercase">פרמטרים כלכליים</h2>
          <SliderInput
            label="מספר מנהלים"
            value={managers} onChange={setManagers} min={1} max={50}
            colorFn={() => 'text-blue-400'}
          />
          <SliderInput
            label="שעות אבודות בשבוע — למנהל"
            heuristicLabel={
              hoursPerWeek > 15
                ? 'Decision Latency קריטי — מעל 15h/שבוע (over_15)'
                : hoursPerWeek >= 5
                  ? 'Decision Latency מתון — 5–15h/שבוע (5_to_15)'
                  : 'Decision Latency נמוך — מתחת ל-5h/שבוע (under_5)'
            }
            value={hoursPerWeek} onChange={setHoursPerWeek} min={1} max={40}
            colorFn={(v) => v > 15 ? 'text-intent-danger' : v >= 5 ? 'text-intent-warning' : 'text-intent-success'}
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">שכר חודשי ממוצע למנהל (₪)</label>
            <input
              type="number" min={10000} max={200000} step={1000}
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* ── 4 Golden Questions ── */}
        <div className="mt-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase">4 שאלות זהב — Decision Engine</h2>
          <GoldenQ1 gq={goldenQuestions} />
          <GoldenQ2 gq={goldenQuestions} diagnosis={diagnosis} />
          <GoldenQ3 gq={goldenQuestions} />
          <GoldenQ4 gq={goldenQuestions} />
        </div>

        {/* ── Pathology Detail Strip ── */}
        <div className="mt-4 bento-card p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">סוג DSM-Org (מיפוי מאוחד)</p>
          <p className="text-sm text-indigo-200 font-semibold mb-3">
            {PATHOLOGY_TYPE_LABELS[orgPathology.primaryType]}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">ציוני פתולוגיה — פירוט</p>
          <div className="space-y-2.5">
            {diagnosis.pathologies.map((p) => {
              const colors = LEVEL_COLORS[p.level]
              const benchmark = getBenchmarkForScore(p.code, p.score)
              return (
                <div key={p.code}>
                  <div className="flex items-center gap-2">
                    <code className={`text-lg font-black font-mono ${colors.text} w-14 shrink-0`}>
                      {p.code}-{p.level}
                    </code>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{p.nameHe}</span>
                        <span className={`text-xs font-bold ${colors.text}`}>{p.score.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                        <div className={`h-1 rounded-full transition-all ${colors.bar}`} style={{ width: `${(p.score / 10) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  {benchmark && (
                    <p className="text-[9px] text-slate-600 mt-0.5 mr-16">{benchmark.percentileEstimate}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="mt-6 text-[10px] text-slate-600 leading-relaxed">
          מבוסס על: Integrated Diagnostic-Prescriptive Model for Organizational Resilience (N=10,000).
          DR = Distorted Reciprocity (Różycka-Tran BZSG); ND = Normalization of Deviance (Vaughan 1996);
          UC = Unrepresentative Calibration (Edmondson 1999, Argyris Double-Loop, Floridi 2014).
          J-Quotient = C(t)/E(t), סף קריסה: J {'<'} 0.35. Benchmark: McKinsey OHI, CultureAmp, Qualtrics.
        </p>
      </div>
    </div>
  )
}

// ─── Reusable Slider ──────────────────────────────────────────────────────────

function SliderInput({
  label,
  sublabel,
  heuristicLabel,
  value,
  onChange,
  min,
  max,
  colorFn,
}: {
  label: string
  sublabel?: string
  heuristicLabel?: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  colorFn: (v: number) => string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label}
        <span className={`font-bold ml-2 ${colorFn(value)}`}>{value}</span>
      </label>
      {sublabel && <p className="text-[10px] text-slate-500 mb-1">{sublabel}</p>}
      {heuristicLabel && (
        <p className={`text-[10px] mb-2 font-medium ${colorFn(value)}`}>{heuristicLabel}</p>
      )}
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
      <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  )
}
