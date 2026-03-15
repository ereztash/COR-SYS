'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { diagnoseFromScores, SEVERITY_PROFILES, LEVEL_COLORS, type DSMDiagnosis } from '@/lib/dsm-engine'

function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

// ─── Mini Comorbidity Map (compact SVG) ──────────────────────────────────────

function MiniComorbidityMap({ diagnosis }: { diagnosis: DSMDiagnosis }) {
  const CORRELATIONS = [
    { from: 'DR', to: 'ND', r: 0.19, dir: 'positive' as const },
    { from: 'DR', to: 'UC', r: -0.27, dir: 'negative' as const },
    { from: 'ND', to: 'UC', r: 0.28, dir: 'positive' as const },
  ]
  const nodes = [
    { code: 'DR', cx: 80, cy: 25 },
    { code: 'ND', cx: 30, cy: 95 },
    { code: 'UC', cx: 130, cy: 95 },
  ]
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.code, n]))
  const pathologyMap = Object.fromEntries(diagnosis.pathologies.map((p) => [p.code, p]))

  return (
    <svg viewBox="0 0 160 120" className="w-full max-w-[160px]" dir="ltr">
      {CORRELATIONS.map(({ from, to, r, dir }) => {
        const f = nodeMap[from], t = nodeMap[to]
        const active = pathologyMap[from].level >= 2 && pathologyMap[to].level >= 2
        return (
          <line key={`${from}-${to}`}
            x1={f.cx} y1={f.cy} x2={t.cx} y2={t.cy}
            stroke={dir === 'positive' ? '#3b82f6' : '#f97316'}
            strokeWidth={active ? 2 : 0.8} opacity={active ? 0.8 : 0.2}
            strokeDasharray={active ? 'none' : '3,3'}
          />
        )
      })}
      {nodes.map((node) => {
        const p = pathologyMap[node.code]
        const colors = LEVEL_COLORS[p.level]
        return (
          <g key={node.code}>
            <circle cx={node.cx} cy={node.cy} r={14} className={`${colors.bg} opacity-30`} fill="currentColor" />
            <text x={node.cx} y={node.cy + 4} textAnchor="middle" className="text-[10px] font-bold fill-white">
              {node.code}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  // Diagnostic sliders (0–10)
  const [drScore, setDrScore] = useState(5)
  const [ndScore, setNdScore] = useState(5)
  const [ucScore, setUcScore] = useState(5)

  // Economic inputs
  const [managers, setManagers] = useState(5)
  const [hoursPerWeek, setHoursPerWeek] = useState(15)
  const [monthlySalary, setMonthlySalary] = useState(35000)

  // DSM diagnosis (real-time)
  const diagnosis = useMemo(
    () => diagnoseFromScores(drScore, ndScore, ucScore, hoursPerWeek),
    [drScore, ndScore, ucScore, hoursPerWeek]
  )
  const profile = SEVERITY_PROFILES[diagnosis.severityProfile]

  // Economic calculation
  const hourlyRate = monthlySalary / 160
  const weeklyWaste = managers * hoursPerWeek * hourlyRate
  const annualWaste = weeklyWaste * 52
  const jQuotient = Math.max((40 - hoursPerWeek) / 40, 0)
  const jColor = jQuotient < 0.35 ? 'text-red-400' : jQuotient < 0.6 ? 'text-yellow-400' : 'text-emerald-400'

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Link href="/services" className="text-slate-400 hover:text-white text-sm transition-colors">← שירותים</Link>
        <h1 className="text-2xl font-black text-white mt-2">מחשבון אבחון מהיר</h1>
        <p className="text-slate-400 text-sm mt-1">אבחון DSM ארגוני + כימות הפסד כלכלי — לפי מודל COR-SYS</p>

        {/* ── Section 1: Quick Diagnostic ── */}
        <div className="mt-8 bento-card p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-400 uppercase">אבחון פתולוגיות</h2>

          <SliderInput
            label="רמת תחרות פנימית (DR)"
            sublabel="Distorted Reciprocity — חשיבה אפס-סכומית, אגירת משאבים"
            value={drScore}
            onChange={setDrScore}
            min={0} max={10}
            colorFn={(v) => v > 6.5 ? 'text-red-400' : v > 3 ? 'text-yellow-400' : 'text-emerald-400'}
          />
          <SliderInput
            label="רמת עקיפת נהלים (ND)"
            sublabel="Normalization of Deviance — קיצורי דרך, לחץ ייצור גובר על נהלים"
            value={ndScore}
            onChange={setNdScore}
            min={0} max={10}
            colorFn={(v) => v > 6.5 ? 'text-red-400' : v > 3 ? 'text-yellow-400' : 'text-emerald-400'}
          />
          <SliderInput
            label="רמת כשל למידה (UC)"
            sublabel="Unrepresentative Calibration — חוסר בטחון פסיכולוגי, למידה חד-לולאתית"
            value={ucScore}
            onChange={setUcScore}
            min={0} max={10}
            colorFn={(v) => v > 6.5 ? 'text-red-400' : v > 3 ? 'text-yellow-400' : 'text-emerald-400'}
          />
        </div>

        {/* ── DSM Results ── */}
        <div className={`mt-5 bento-card p-6 border-t-4 ${profile.borderColor} space-y-4`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">תוצאת אבחון DSM</p>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${profile.bgColor} ${profile.color}`}>
              {profile.labelHe}
            </span>
          </div>

          <div className="flex items-start gap-5">
            <div className="flex-1 space-y-2">
              {diagnosis.pathologies.map((p) => {
                const colors = LEVEL_COLORS[p.level]
                return (
                  <div key={p.code} className="flex items-center gap-2">
                    <code className={`text-xl font-black font-mono ${colors.text} w-14 shrink-0`}>
                      {p.code}-{p.level}
                    </code>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{p.nameHe}</span>
                        <span className={`text-xs font-bold ${colors.text}`}>{p.score.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1">
                        <div className={`h-1 rounded-full ${colors.bar}`} style={{ width: `${(p.score / 10) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <MiniComorbidityMap diagnosis={diagnosis} />
          </div>
        </div>

        {/* ── Section 2: Economic Impact ── */}
        <div className="mt-5 bento-card p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-400 uppercase">כימות הפסד כלכלי</h2>

          <SliderInput
            label="מספר מנהלים"
            value={managers} onChange={setManagers}
            min={1} max={50}
            colorFn={() => 'text-blue-400'}
          />
          <SliderInput
            label="שעות אבודות בשבוע — למנהל"
            value={hoursPerWeek} onChange={setHoursPerWeek}
            min={1} max={40}
            colorFn={(v) => v > 15 ? 'text-red-400' : v >= 5 ? 'text-yellow-400' : 'text-emerald-400'}
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              שכר חודשי ממוצע למנהל (₪)
            </label>
            <input
              type="number"
              min={10000} max={200000} step={1000}
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-800/60 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">הפסד שנתי</p>
              <p className="text-2xl font-black text-white">{formatILS(annualWaste)}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{formatILS(weeklyWaste)} / שבוע</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">J-Quotient</p>
              <p className={`text-2xl font-black ${jColor}`}>{jQuotient.toFixed(2)}</p>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full transition-all ${jQuotient < 0.35 ? 'bg-red-500' : jQuotient < 0.6 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                  style={{ width: `${jQuotient * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="mt-5 bento-card p-6 border-t-4 border-t-blue-500">
          <p className="text-sm font-bold text-white mb-1">לאבחון מלא — שאלון COR-SYS</p>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            האבחון המהיר מבוסס על הערכה עצמית. לתוצאות מדויקות יותר עם קודי DSM, מפת קומורבידיות מלאה ופרוטוקולי התערבות — מלא את השאלון המלא.
          </p>
          <div className="flex gap-3">
            <Link
              href="/clients"
              className="flex-1 text-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors"
            >
              שאלון COR-SYS מלא ←
            </Link>
            <Link
              href="/services"
              className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-400 hover:text-white text-sm transition-colors"
            >
              ← שירותים
            </Link>
          </div>
        </div>

        <p className="mt-6 text-[10px] text-slate-600 leading-relaxed">
          מבוסס על: Integrated Diagnostic-Prescriptive Model for Organizational Resilience (N=10,000).
          DR = Distorted Reciprocity (Różycka-Tran BZSG); ND = Normalization of Deviance (Vaughan 1996);
          UC = Unrepresentative Calibration (Edmondson 1999, Argyris Double-Loop).
          J-Quotient = C(t)/E(t), סף קריסה: J {'<'} 0.35.
        </p>
      </div>
    </div>
  )
}

// ─── Reusable Slider ─────────────────────────────────────────────────────────

function SliderInput({
  label,
  sublabel,
  value,
  onChange,
  min,
  max,
  colorFn,
}: {
  label: string
  sublabel?: string
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
      {sublabel && <p className="text-[10px] text-slate-500 mb-2">{sublabel}</p>}
      <input
        type="range"
        min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
      <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  )
}
