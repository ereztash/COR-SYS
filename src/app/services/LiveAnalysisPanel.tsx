'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildActionPlan,
  getDominantAxis,
  HORIZON_LABELS,
  PROFILE_LABELS,
  profileFromScores,
} from '@/lib/diagnostic/action-plan'
import { logUxEvent } from '@/lib/ux-metrics'

type Axis = 'DR' | 'ND' | 'UC'

interface Question {
  id: string
  label: string
  help: string
  axis: Axis
  group: 'alignment' | 'execution' | 'capacity'
}

type PersonaPreset = 'manager' | 'freelancer' | 'balanced'

const QUESTIONS: Question[] = [
  { id: 'q1', label: 'כשיש בעיה דחופה, יש אדם ברור שמחליט תוך 48 שעות?', help: 'אם אין בעל החלטה ברור, זמן ההשהיה הופך למס כרוני.', axis: 'DR', group: 'alignment' },
  { id: 'q2', label: 'בסוף כל ישיבה קריטית יוצאים עם החלטה, Owner ודדליין?', help: 'סוגר התנגדות של \"נדבר על זה\" ומעביר לעשייה.', axis: 'DR', group: 'alignment' },
  { id: 'q3', label: 'האם אנשים עובדים לפי נוהל גם כשיש לחץ, ולא עוברים למעקפים?', help: 'מעקפים חוסכים דקה עכשיו וגובים שבועות אחר כך.', axis: 'ND', group: 'execution' },
  { id: 'q4', label: 'כשמשהו נשבר, מטפלים גם בשורש ולא רק בסימפטום?', help: 'בלי תיקון שורש — אותה בעיה תחזור עם מחיר גבוה יותר.', axis: 'ND', group: 'execution' },
  { id: 'q5', label: 'אנשים מרגישים בטוח להציף טעות מוקדם, בלי פחד מהאשמה?', help: 'דיווח מוקדם מוריד עלות תיקון ומונע קריסה מתגלגלת.', axis: 'ND', group: 'alignment' },
  { id: 'q6', label: 'אם איש מפתח יוצא לחופשה/מילואים, התהליך ממשיך בלי תקיעה?', help: 'תלות באדם יחיד היא סיכון תפעולי מיידי.', axis: 'UC', group: 'capacity' },
  { id: 'q7', label: 'ה-Roadmap בנוי לפי קיבולת אמיתית, לא אופטימית?', help: 'כיול לא ריאלי מייצר שחיקה והתנגדות לשינוי.', axis: 'UC', group: 'capacity' },
  { id: 'q8', label: 'אנשים מסיימים יום עם מעט קצוות פתוחים ולא עם עומס מנטלי?', help: 'קצוות פתוחים = Attention Residue = ירידת ביצוע.', axis: 'DR', group: 'execution' },
  { id: 'q9', label: 'יש בלמידה הארגונית מעבר קבוע מ\"כיבוי שריפה\" ל\"שיפור מערכת\"?', help: 'המהלך הזה מייצר תחושת מסוגלות ומקטין דחיינות.', axis: 'UC', group: 'execution' },
  { id: 'q10', label: 'האם מה שכתוב במדיניות באמת תואם למה שקורה בשטח?', help: 'פער בין נוהל לשטח הוא התנגדות סמויה לביצוע.', axis: 'ND', group: 'alignment' },
]

function axisColor(axis: Axis) {
  if (axis === 'DR') return 'axis-dr'
  if (axis === 'ND') return 'axis-nd'
  return 'axis-uc'
}

const PRESETS: Record<PersonaPreset, Record<string, number>> = {
  manager: { q1: 7, q2: 7, q3: 6, q4: 6, q5: 5, q6: 6, q7: 7, q8: 8, q9: 5, q10: 6 },
  freelancer: { q1: 6, q2: 6, q3: 4, q4: 4, q5: 4, q6: 3, q7: 5, q8: 8, q9: 6, q10: 4 },
  balanced: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5 },
}

export function LiveAnalysisPanel() {
  const openedAtRef = useRef<number>(Date.now())
  const firstInteractionSent = useRef(false)
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, 5]))
  )
  const [selectedPreset, setSelectedPreset] = useState<PersonaPreset>('balanced')
  const [activeGroup, setActiveGroup] = useState<Question['group']>('alignment')
  const [copied, setCopied] = useState(false)
  const [managers, setManagers] = useState(12)
  const [hourlyCost, setHourlyCost] = useState(260)

  const scores = useMemo(() => {
    const byAxis: Record<Axis, number[]> = { DR: [], ND: [], UC: [] }
    for (const q of QUESTIONS) byAxis[q.axis].push(values[q.id] ?? 5)
    return {
      dr: byAxis.DR.reduce((a, b) => a + b, 0) / byAxis.DR.length,
      nd: byAxis.ND.reduce((a, b) => a + b, 0) / byAxis.ND.length,
      uc: byAxis.UC.reduce((a, b) => a + b, 0) / byAxis.UC.length,
    }
  }, [values])

  const roundedScores = {
    dr: Number(scores.dr.toFixed(1)),
    nd: Number(scores.nd.toFixed(1)),
    uc: Number(scores.uc.toFixed(1)),
  }

  const dominantAxis = getDominantAxis(roundedScores)
  const profile = profileFromScores(roundedScores)
  const actionPlan = buildActionPlan(dominantAxis, profile, roundedScores)
  const completion = Math.round(
    (Object.values(values).filter((v) => v !== 5).length / QUESTIONS.length) * 100
  )
  const strongestQuestion = [...QUESTIONS]
    .sort((a, b) => (values[b.id] ?? 0) - (values[a.id] ?? 0))[0]
  const visibleQuestions = QUESTIONS.filter((q) => q.group === activeGroup)
  const avgBurden = (roundedScores.dr * 0.45) + (roundedScores.nd * 0.3) + (roundedScores.uc * 0.25)
  const weeklyHoursPerManager = Number((avgBurden * 1.8).toFixed(1))
  const annualCostILS = Math.round(weeklyHoursPerManager * managers * hourlyCost * 52)
  const top3Friction = [...QUESTIONS]
    .sort((a, b) => (values[b.id] ?? 0) - (values[a.id] ?? 0))
    .slice(0, 3)

  useEffect(() => {
    logUxEvent({ name: 'live_analysis_opened', ts: openedAtRef.current })
  }, [])

  const markFirstInteraction = () => {
    if (firstInteractionSent.current) return
    firstInteractionSent.current = true
    logUxEvent({
      name: 'first_interaction',
      ts: Date.now(),
      data: { ttfis_ms: Date.now() - openedAtRef.current },
    })
  }

  function applyPreset(preset: PersonaPreset) {
    markFirstInteraction()
    setSelectedPreset(preset)
    setValues(PRESETS[preset])
    logUxEvent({ name: 'preset_applied', ts: Date.now(), data: { preset } })
  }

  async function copySummary() {
    markFirstInteraction()
    const lines = [
      'סיכום ניתוח לייב — COR-SYS',
      `DR: ${roundedScores.dr} | ND: ${roundedScores.nd} | UC: ${roundedScores.uc}`,
      `ציר דומיננטי: ${dominantAxis}`,
      `פרופיל: ${PROFILE_LABELS[profile]}`,
      `חסם מוביל: ${strongestQuestion.label} (${values[strongestQuestion.id]}/10)`,
      '',
      'תוכנית פעולה מוצעת:',
      ...actionPlan.map((item, i) => `${i + 1}. ${item.title_he} (${HORIZON_LABELS[item.horizon]})`),
    ]
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    logUxEvent({
      name: 'copy_summary_clicked',
      ts: Date.now(),
      data: { profile, dominant_axis: dominantAxis },
    })
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section id="live-analysis" className="bento-card motion-card p-6 border-t-4 border-t-indigo-500 smooth-section">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="type-h1 text-white">ניתוח לייב: 10 שאלות</h2>
          <p className="type-body text-slate-400">
            כל שאלה מנוסחת כדי לחשוף חסם אמיתי, לפרק התנגדות ולהעביר לצעד הבא.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="status-badge status-info">Live Diagnostic</span>
          <a
            href="https://org-fortify.lovable.app"
            target="_blank"
            rel="noreferrer"
            className="status-badge status-info px-3 py-1.5"
            onClick={() => {
              markFirstInteraction()
              logUxEvent({ name: 'outbound_roi_clicked', ts: Date.now() })
            }}
          >
            מחשבון ROI
          </a>
          <a
            href="https://stop-delay-gain.base44.app"
            target="_blank"
            rel="noreferrer"
            className="status-badge status-warning px-3 py-1.5"
            onClick={() => {
              markFirstInteraction()
              logUxEvent({ name: 'outbound_delay_clicked', ts: Date.now() })
            }}
          >
            מחשבון דחיינות
          </a>
        </div>
      </div>

      <div className="surface-strong rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="type-meta normal-case">זרימה מונחית: קבע פריסט → דייק סליידרים → העתק תוכנית</p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => applyPreset('manager')}
              className={`status-badge px-3 py-1.5 ${selectedPreset === 'manager' ? 'status-info' : 'border border-slate-700 text-slate-300'}`}
            >
              מנהל צוות
            </button>
            <button
              type="button"
              onClick={() => applyPreset('freelancer')}
              className={`status-badge px-3 py-1.5 ${selectedPreset === 'freelancer' ? 'status-warning' : 'border border-slate-700 text-slate-300'}`}
            >
              עצמאי/פרילנסר
            </button>
            <button
              type="button"
              onClick={() => applyPreset('balanced')}
              className={`status-badge px-3 py-1.5 ${selectedPreset === 'balanced' ? 'status-success' : 'border border-slate-700 text-slate-300'}`}
            >
              נייטרלי
            </button>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>התקדמות כיול</span>
            <span className="type-kpi">{completion}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800">
            <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              markFirstInteraction()
              setActiveGroup('alignment')
              logUxEvent({ name: 'group_switched', ts: Date.now(), data: { group: 'alignment' } })
            }}
            className={`status-badge px-3 py-1.5 ${activeGroup === 'alignment' ? 'status-info' : 'border border-slate-700 text-slate-300'}`}
          >
            1) Alignment
          </button>
          <button
            type="button"
            onClick={() => {
              markFirstInteraction()
              setActiveGroup('execution')
              logUxEvent({ name: 'group_switched', ts: Date.now(), data: { group: 'execution' } })
            }}
            className={`status-badge px-3 py-1.5 ${activeGroup === 'execution' ? 'status-warning' : 'border border-slate-700 text-slate-300'}`}
          >
            2) Execution
          </button>
          <button
            type="button"
            onClick={() => {
              markFirstInteraction()
              setActiveGroup('capacity')
              logUxEvent({ name: 'group_switched', ts: Date.now(), data: { group: 'capacity' } })
            }}
            className={`status-badge px-3 py-1.5 ${activeGroup === 'capacity' ? 'status-danger' : 'border border-slate-700 text-slate-300'}`}
          >
            3) Capacity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          {visibleQuestions.map((q) => (
            <div key={q.id} className="surface-strong rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm text-slate-200 font-medium">
                  {q.label}
                </p>
                <span className={`type-meta normal-case ${axisColor(q.axis)}`}>{q.axis}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{q.help}</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={values[q.id]}
                  onChange={(e) => {
                    markFirstInteraction()
                    const nextVal = Number(e.target.value)
                    setValues((prev) => ({ ...prev, [q.id]: nextVal }))
                    logUxEvent({ name: 'slider_changed', ts: Date.now(), data: { question_id: q.id, value: nextVal } })
                  }}
                  className="w-full accent-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 rounded-md"
                />
                <span className="type-kpi text-sm text-white w-6 text-center">{values[q.id]}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="surface-strong rounded-xl p-4">
            <p className="type-meta mb-2">תמונת מצב (DR / ND / UC)</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg panel-dr p-3 text-center">
                <p className="type-meta normal-case text-intent-danger">DR</p>
                <p className="text-xl font-black type-kpi text-intent-danger">{roundedScores.dr}</p>
              </div>
              <div className="rounded-lg panel-nd p-3 text-center">
                <p className="type-meta normal-case text-intent-warning">ND</p>
                <p className="text-xl font-black type-kpi text-intent-warning">{roundedScores.nd}</p>
              </div>
              <div className="rounded-lg panel-uc p-3 text-center">
                <p className="type-meta normal-case text-intent-info">UC</p>
                <p className="text-xl font-black type-kpi text-intent-info">{roundedScores.uc}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <span className="status-badge status-warning">ציר דומיננטי: {dominantAxis}</span>
              <span className="status-badge status-danger">פרופיל: {PROFILE_LABELS[profile]}</span>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              חסם מוביל כרגע: <span className="text-white font-semibold">{strongestQuestion.label}</span>{' '}
              <span className="type-kpi text-slate-500">({values[strongestQuestion.id]}/10)</span>
            </p>
          </div>

          <div className="surface-strong rounded-xl p-4">
            <p className="type-meta mb-3">Cost of Delay — הערכת ROI בזמן אמת</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <label className="text-xs text-slate-400">
                מנהלים מושפעים
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={managers}
                  onChange={(e) => {
                    markFirstInteraction()
                    setManagers(Number(e.target.value))
                  }}
                  className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white type-kpi"
                />
              </label>
              <label className="text-xs text-slate-400">
                עלות שעת ניהול (₪)
                <input
                  type="number"
                  min={80}
                  max={1200}
                  value={hourlyCost}
                  onChange={(e) => {
                    markFirstInteraction()
                    setHourlyCost(Number(e.target.value))
                  }}
                  className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white type-kpi"
                />
              </label>
            </div>
            <div className="rounded-lg panel-dr px-3 py-2">
              <p className="text-xs text-intent-danger">שעות שיהוי לשבוע למנהל: <span className="type-kpi font-bold">{weeklyHoursPerManager}h</span></p>
              <p className="text-sm text-white font-bold type-kpi mt-0.5">עלות שנתית מוערכת: ₪{annualCostILS.toLocaleString('he-IL')}</p>
            </div>
          </div>

          <div className="surface-strong rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="type-meta">תוכנית פעולה מוצעת (הצלבה אוטומטית)</p>
              <button
                type="button"
                onClick={copySummary}
                className={`status-badge px-3 py-1.5 ${copied ? 'status-success' : 'status-info'}`}
              >
                {copied ? 'הועתק' : 'העתק סיכום'}
              </button>
            </div>
            <div className="space-y-2">
              {actionPlan.map((item, i) => (
                <div key={`${item.axis}-${item.priority}-${i}`} className="rounded-lg bg-slate-800/60 border border-slate-700/60 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-white">{i + 1}. {item.title_he}</p>
                    <span className="status-badge status-success">
                      {HORIZON_LABELS[item.horizon]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-1.5">{item.what_he}</p>
                  <p className="text-[11px] text-slate-500">מדד הצלחה: {item.metric_he}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800">
              <p className="type-meta mb-2">Top 3 frictions לפתיחה מיידית</p>
              <div className="space-y-1.5">
                {top3Friction.map((q, i) => (
                  <p key={q.id} className="text-xs text-slate-300">
                    {i + 1}. {q.label}{' '}
                    <span className="type-kpi text-slate-500">({values[q.id]}/10)</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

