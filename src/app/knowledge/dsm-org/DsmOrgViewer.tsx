'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DSM_PATHOLOGIES,
  DSM_INTERVENTION_PLAYBOOKS,
  DSM_ASSESSMENT_INSTRUMENTS,
  DSM_DIAGNOSTIC_PROCESS,
  DSM_COMORBIDITY_MATRIX,
  type DsmPathologyEntry,
  type InterventionPlaybook,
} from '@/lib/diagnostic/dsm-org-model'
import { PATHOLOGY_PROTOCOL_MAP, MANDATORY_COMORBIDITY_SEQUENCES } from '@/lib/diagnostic/action-plan'
import { DSM_ORG_PARTS, SEQUENCING_RULES } from '@/lib/dsm-org-taxonomy'
import { DSM_CONTENT_INDEX } from '@/lib/diagnostic/dsm-content-index'
import { logUxEvent } from '@/lib/ux-metrics'

// ─── Nav sections ─────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'intro',         label: 'I. מבוא ו-T/A/M' },
  { id: 'process',       label: 'II. תהליך אבחון' },
  { id: 'taxonomy',      label: 'III. טקסונומיה קלינית' },
  { id: 'comorbidity',   label: 'III.6 Comorbidity' },
  { id: 'sequencing',    label: 'IV. חוקי סיקוונסינג' },
  { id: 'interventions', label: 'V. חוברות התערבות' },
  { id: 'instruments',   label: 'VI. כלי מדידה' },
  { id: 'dsm7x21',       label: 'VII. DSM 7×21' },
]

// ─── Severity badge ───────────────────────────────────────────────────────────

function SeverityBadge({ level }: { level: 'mild' | 'moderate' | 'severe' }) {
  const map = {
    mild:     'status-badge status-warning',
    moderate: 'status-badge status-warning',
    severe:   'status-badge status-danger',
  }
  const labels = { mild: 'קל', moderate: 'בינוני', severe: 'חמור' }
  return <span className={map[level]}>{labels[level]}</span>
}

// ─── T/A/M strip ─────────────────────────────────────────────────────────────

function TamStrip({ t, a, m, total }: { t: number; a: number; m: number; total: number }) {
  return (
    <div className="grid grid-cols-4 gap-px rounded-lg overflow-hidden border border-slate-700/60 text-center text-xs">
      <div className="bg-emerald-950/40 p-2">
        <p className="type-meta normal-case text-emerald-300 mb-0.5">TIME</p>
        <p className="type-kpi text-lg font-black text-emerald-200">{t}</p>
      </div>
      <div className="bg-amber-950/40 p-2">
        <p className="type-meta normal-case text-amber-300 mb-0.5">ATTENTION</p>
        <p className="type-kpi text-lg font-black text-amber-200">{a}</p>
      </div>
      <div className="bg-red-950/40 p-2">
        <p className="type-meta normal-case text-red-300 mb-0.5">MONEY</p>
        <p className="type-kpi text-lg font-black text-red-200">{m}</p>
      </div>
      <div className="surface-strong p-2">
        <p className="type-meta normal-case mb-0.5">TOTAL</p>
        <p className="type-kpi text-lg font-black text-white">{total}</p>
      </div>
    </div>
  )
}

// ─── Pathology Card ───────────────────────────────────────────────────────────

function PathologyCard({ entry }: { entry: DsmPathologyEntry }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (section: string) => {
    const next = expanded === section ? null : section
    setExpanded(next)
    if (next) {
      logUxEvent({ name: 'pathology_viewed', ts: Date.now(), data: { type: entry.type, section: next } })
    }
  }

  const typeColors: Record<string, string> = {
    NOD: 'border-t-red-500',
    ZSG: 'border-t-orange-500',
    OLD: 'border-t-yellow-500',
    CLT: 'border-t-indigo-500',
    CS:  'border-t-purple-500',
  }

  return (
    <div id={`pathology-${entry.type}`} className={`bento-card border-t-4 ${typeColors[entry.type] ?? 'border-t-slate-500'} p-5 md:p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <p className="type-meta mb-1">{entry.code}</p>
          <h3 className="type-h1 text-white">{entry.label_he}</h3>
          <p className="type-body text-slate-400">{entry.label_en}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="status-badge status-danger">T/A/M {entry.tam.total}/15</span>
          {entry.type === 'CS' && (
            <span className="status-badge status-warning">מגביר מערכתי</span>
          )}
        </div>
      </div>

      {/* T/A/M */}
      <div className="mb-4">
        <TamStrip {...entry.tam} />
      </div>

      {/* Criteria */}
      <div className="space-y-2 mb-4">
        <button
          type="button"
          onClick={() => toggle('criteria')}
          className="w-full flex items-center justify-between surface-strong rounded-lg px-3 py-2 text-sm font-bold text-slate-200 hover:text-white"
        >
          <span>קריטריונים אבחוניים A/B/C</span>
          <span className="type-kpi text-slate-500">{expanded === 'criteria' ? '▲' : '▼'}</span>
        </button>
        {expanded === 'criteria' && (
          <div className="surface-strong rounded-xl p-4 space-y-3 smooth-section">
            <div>
              <p className="type-meta text-red-300 mb-2">A — קריטריון מרכזי (נדרש)</p>
              {entry.criteriaA.map(c => (
                <div key={c.letter} className="flex gap-3 mb-2">
                  <span className="type-kpi text-slate-500 shrink-0 w-6">{c.letter}</span>
                  <p className="text-sm text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="type-meta text-amber-300 mb-2">B — קריטריונים תומכים (נדרשים לפחות 2 מתוך {entry.criteriaB.length})</p>
              {entry.criteriaB.map(c => (
                <div key={c.letter} className="flex gap-3 mb-2">
                  <span className="type-kpi text-slate-500 shrink-0 w-6">{c.letter}</span>
                  <p className="text-sm text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="type-meta text-slate-400 mb-2">C — קריטריון שלילה</p>
              {entry.criteriaC.map(c => (
                <div key={c.letter} className="flex gap-3 mb-2">
                  <span className="type-kpi text-slate-500 shrink-0 w-6">{c.letter}</span>
                  <p className="text-sm text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Severity */}
      <div className="space-y-2 mb-4">
        <button
          type="button"
          onClick={() => toggle('severity')}
          className="w-full flex items-center justify-between surface-strong rounded-lg px-3 py-2 text-sm font-bold text-slate-200 hover:text-white"
        >
          <span>Severity Specifiers</span>
          <span className="type-kpi text-slate-500">{expanded === 'severity' ? '▲' : '▼'}</span>
        </button>
        {expanded === 'severity' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 smooth-section">
            {entry.severitySpecifiers.map(s => (
              <div key={s.level} className={`rounded-xl p-3 ${s.level === 'severe' ? 'panel-dr' : s.level === 'moderate' ? 'panel-nd' : 'panel-uc'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <SeverityBadge level={s.level} />
                  <span className="type-kpi text-xs text-slate-400">{s.tamRange}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mechanism + Context */}
      <div className="space-y-2 mb-4">
        <button
          type="button"
          onClick={() => toggle('theory')}
          className="w-full flex items-center justify-between surface-strong rounded-lg px-3 py-2 text-sm font-bold text-slate-200 hover:text-white"
        >
          <span>מנגנון תאורטי + הקשר ישראלי</span>
          <span className="type-kpi text-slate-500">{expanded === 'theory' ? '▲' : '▼'}</span>
        </button>
        {expanded === 'theory' && (
          <div className="surface-strong rounded-xl p-4 space-y-3 smooth-section">
            <p className="text-sm text-slate-300 leading-relaxed">{entry.theoreticalMechanism}</p>
            <div className="border-t border-slate-700/60 pt-3">
              <p className="type-meta text-blue-300 mb-1.5">הקשר ישראלי</p>
              <p className="text-sm text-slate-300 leading-relaxed">{entry.israeliContext}</p>
            </div>
          </div>
        )}
      </div>

      {/* Differential */}
      <div className="space-y-2 mb-4">
        <button
          type="button"
          onClick={() => toggle('differential')}
          className="w-full flex items-center justify-between surface-strong rounded-lg px-3 py-2 text-sm font-bold text-slate-200 hover:text-white"
        >
          <span>אבחנה מבדלת</span>
          <span className="type-kpi text-slate-500">{expanded === 'differential' ? '▲' : '▼'}</span>
        </button>
        {expanded === 'differential' && (
          <div className="surface-strong rounded-xl overflow-hidden smooth-section">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-right px-3 py-2 type-meta text-slate-400">הבחנה מ-</th>
                  <th className="text-right px-3 py-2 type-meta text-slate-400">כיצד להבדיל</th>
                </tr>
              </thead>
              <tbody>
                {entry.differential.map((d, i) => (
                  <tr key={i} className="border-b border-slate-800/60 last:border-0">
                    <td className="px-3 py-2 font-bold text-slate-200 whitespace-nowrap">{d.versus}</td>
                    <td className="px-3 py-2 text-slate-300 leading-relaxed">{d.howToDistinguish}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vignettes */}
      {entry.vignettes.length > 0 && (
        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={() => toggle('vignettes')}
            className="w-full flex items-center justify-between surface-strong rounded-lg px-3 py-2 text-sm font-bold text-slate-200 hover:text-white"
          >
            <span>מקרי בוחן ({entry.vignettes.length})</span>
            <span className="type-kpi text-slate-500">{expanded === 'vignettes' ? '▲' : '▼'}</span>
          </button>
          {expanded === 'vignettes' && (
            <div className="space-y-2 smooth-section">
              {entry.vignettes.map(v => (
                <div key={v.id} className="surface-strong rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-bold text-white">{v.title}</p>
                    <div className="flex gap-1">
                      {v.tags.map(t => (
                        <span key={t} className="status-badge status-info">{t}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prognosis */}
      <div className="rounded-xl panel-uc p-3">
        <p className="type-meta text-indigo-300 mb-1.5">מהלך ופרוגנוזה</p>
        <p className="text-xs text-slate-300 leading-relaxed">{entry.prognosis}</p>
      </div>
    </div>
  )
}

// ─── Intervention Card ────────────────────────────────────────────────────────

function InterventionCard({ playbook }: { playbook: InterventionPlaybook }) {
  const [open, setOpen] = useState(false)

  const timelineLabel: Record<string, string> = {
    '14d': '14 יום', '30d': '30 יום', '90d': '90 יום',
    'ongoing': 'שוטף', 'one-time': 'חד-פעמי',
  }

  return (
    <div className="bento-card motion-card border-t-4 border-t-emerald-500 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="type-meta mb-0.5">{playbook.id}</p>
          <h4 className="type-h2 text-white">{playbook.title}</h4>
        </div>
        <span className="status-badge status-success shrink-0">{timelineLabel[playbook.timeline] ?? playbook.timeline}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {playbook.target.map(t => (
          <span key={t} className="status-badge status-warning">{t}</span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          setOpen(v => !v)
          if (!open) logUxEvent({ name: 'protocol_clicked', ts: Date.now(), data: { playbook_id: playbook.id } })
        }}
        className="w-full text-left surface-strong rounded-lg px-3 py-2 text-xs text-slate-300 hover:text-white font-medium"
      >
        {open ? 'הסתר פרוטוקול ▲' : 'הצג פרוטוקול ▼'}
      </button>
      {open && (
        <div className="mt-2 smooth-section">
          <div className="surface-strong rounded-xl p-3 mb-2">
            <p className="type-meta text-emerald-300 mb-1.5">פרוטוקול</p>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">{playbook.protocol}</pre>
          </div>
          <div className="rounded-lg panel-uc px-3 py-2">
            <p className="type-meta text-indigo-300 mb-1">מדד הצלחה</p>
            <p className="text-xs text-slate-300">{playbook.successMetric}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Viewer ──────────────────────────────────────────────────────────────

export function DsmOrgViewer() {
  const [activeSection, setActiveSection] = useState('intro')

  const handleNavClick = (id: string) => {
    setActiveSection(id)
    logUxEvent({ name: 'section_opened', ts: Date.now(), data: { section: id } })
    const el = document.getElementById(`section-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">← דשבורד</Link>
              <h1 className="type-display text-white mt-2">DSM-Org <span className="text-slate-400 font-light">v1.0</span></h1>
              <p className="type-body text-slate-400 mt-1">מדריך אבחוני וסטטיסטי לפתולוגיות מערכתיות ארגוניות — מהדורת הייטק ישראלי 2024–2026</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="status-badge status-info">COR-SYS Clinical Reference</span>
              <span className="status-badge status-warning">POC 0.70–0.80</span>
              <button
                type="button"
                onClick={() => {
                  logUxEvent({ name: 'dsm_export_clicked', ts: Date.now() })
                  window.print()
                }}
                className="status-badge status-success px-3 py-1.5 cursor-pointer"
              >
                הדפס / PDF
              </button>
            </div>
          </div>

          {/* Cover meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px mt-4 rounded-xl overflow-hidden border border-slate-700/60">
            {[
              { label: 'VERSION',        value: '1.0 | 2026' },
              { label: 'FRAMEWORK',      value: 'COR-SYS T/A/M' },
              { label: 'CLASSIFICATION', value: 'מסמך עבודה קליני' },
              { label: 'SCOPE',          value: 'Israeli High-Tech, 50–300 FTE' },
              { label: 'ICP',            value: 'COO / CFO / VP People' },
              { label: 'POC CONFIDENCE', value: '0.70 – 0.80' },
            ].map(cell => (
              <div key={cell.label} className="surface-strong px-3 py-2">
                <p className="type-meta mb-0.5">{cell.label}</p>
                <p className="text-xs text-slate-200 font-medium">{cell.value}</p>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div className="mt-4 rounded-xl panel-dr px-4 py-3">
            <p className="type-meta text-red-300 mb-1">הצהרת זהירות לשימוש קליני</p>
            <p className="text-xs text-slate-300 leading-relaxed">DSM-Org הוא כלי אבחוני מובנה, לא כלי ניבוי. הקריטריונים מספקים מסגרת לזיהוי וסיווג פתולוגיות ארגוניות. הם אינם מחליפים שיקול דעת קליני. אבחון שלם דורש הפעלת תהליך שבעת השלבים, איסוף נתונים כמותיים, והפעלת שאלונים מאומתים.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)] gap-6">

          {/* Sticky sidebar nav */}
          <aside className="hidden xl:block">
            <div className="sticky top-4 bento-card p-3">
              <p className="type-meta mb-3">ניווט מהיר</p>
              <nav className="space-y-1">
                {NAV_SECTIONS.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleNavClick(s.id)}
                    className={`w-full text-right text-xs px-3 py-2 rounded-lg transition-all ${
                      activeSection === s.id
                        ? 'cta-primary font-bold'
                        : 'nav-chip'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-1">
                <p className="type-meta mb-2">פתולוגיות</p>
                {DSM_PATHOLOGIES.map(p => (
                  <a
                    key={p.type}
                    href={`#pathology-${p.type}`}
                    onClick={() => logUxEvent({ name: 'pathology_viewed', ts: Date.now(), data: { type: p.type, section: 'nav' } })}
                    className="block text-xs px-3 py-1.5 rounded-lg nav-chip"
                  >
                    {p.type} — {p.label_he}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-10">

            {/* Section I: Intro & T/A/M */}
            <section id="section-intro" className="smooth-section">
              <div className="bento-card p-5 md:p-6 border-t-4 border-t-blue-500">
                <p className="type-meta mb-1">חלק I</p>
                <h2 className="type-h1 text-white mb-2">מבוא: הפרדוקס המאקרו-כלכלי</h2>
                <p className="type-body text-slate-400 mb-5">ההייטק הישראלי 2024–2026 מציג פרדוקס שבו שיא M&A חי לצד קריסת הון אנושי. פרק זה מגדיר את המציאות האמפירית שממנה נגזרת המסגרת האבחונית.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {[
                    { val: '$70–80B', lbl: 'יציאות M&A, 2025' },
                    { val: '8,300',   lbl: 'בריחת מוחות מהסקטור' },
                    { val: '83%',     lbl: 'מפתחים בשחיקה חמורה' },
                    { val: '409K',    lbl: 'כוח עבודה (ירידה מ-417K)' },
                  ].map(s => (
                    <div key={s.lbl} className="surface-strong rounded-xl p-3 text-center">
                      <p className="type-kpi text-xl font-black text-intent-danger">{s.val}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.lbl}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl panel-nd px-4 py-3 mb-5">
                  <p className="type-meta text-amber-300 mb-1">Silent Stagnation Crossover</p>
                  <p className="text-sm text-slate-300">ניתוח סנטימנט של שיח ארגוני פנימי חושף נקודת מפנה שהתרחשה באמצע 2023. מילות "burnout/survival" מהוות <strong className="text-white">97.1%</strong> מהשיח הארגוני הפנימי ב-2026. כשהשפה הארגונית עוברת מ"מה אנחנו בונים" ל"איך אנחנו שורדים" — המערכת עברה סף.</p>
                </div>

                <div>
                  <p className="type-meta mb-3">מערכת המדידה T/A/M</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700/60">
                          <th className="text-right px-3 py-2 type-meta">ציר</th>
                          <th className="text-right px-3 py-2 type-meta">שם מלא</th>
                          <th className="text-right px-3 py-2 type-meta">מה נמדד</th>
                          <th className="text-right px-3 py-2 type-meta hidden md:table-cell">אינדיקטורים נציגים</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-800/60">
                          <td className="px-3 py-2 font-black text-emerald-300 type-kpi">T</td>
                          <td className="px-3 py-2 font-bold text-slate-200">Time</td>
                          <td className="px-3 py-2 text-slate-300">זמן אבוד, שיהוי החלטות, מחזורי עבודה</td>
                          <td className="px-3 py-2 text-slate-400 text-xs hidden md:table-cell">Decision Latency, Cycle Time, Handoff Count, Deployment Frequency</td>
                        </tr>
                        <tr className="border-b border-slate-800/60">
                          <td className="px-3 py-2 font-black text-amber-300 type-kpi">A</td>
                          <td className="px-3 py-2 font-bold text-slate-200">Attention</td>
                          <td className="px-3 py-2 text-slate-300">עומס קוגניטיבי, פיזור קשב, שחיקה</td>
                          <td className="px-3 py-2 text-slate-400 text-xs hidden md:table-cell">Context Switches/Day, Notification Load, MBI Score, Focus Time %</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-black text-red-300 type-kpi">M</td>
                          <td className="px-3 py-2 font-bold text-slate-200">Money</td>
                          <td className="px-3 py-2 text-slate-300">דליפת משאבים, עלות חיכוך, עלות אי-פעולה</td>
                          <td className="px-3 py-2 text-slate-400 text-xs hidden md:table-cell">Rework %, Attrition Cost, Revenue per Employee, Cost of Delay</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 px-1">סכום 6–8: חומרה קלה. סכום 9–11: חומרה בינונית. סכום 12–15: חומרה חמורה — דורש Tech Tourniquet מיידי.</p>
                </div>
              </div>
            </section>

            {/* Section II: Diagnostic Process */}
            <section id="section-process" className="smooth-section">
              <div className="bento-card p-5 md:p-6 border-t-4 border-t-indigo-500">
                <p className="type-meta mb-1">חלק II</p>
                <h2 className="type-h1 text-white mb-2">תהליך האבחון בשבעה שלבים</h2>
                <p className="type-body text-slate-400 mb-5">המסגרת שמתרגמת תלונות עמומות למדדים כמותיים על צירי T/A/M, ומשם לאבחנות ממוספרות עם פרוטוקולי התערבות.</p>
                <div className="space-y-3">
                  {DSM_DIAGNOSTIC_PROCESS.map((step, i) => (
                    <div key={step.number} className="flex gap-4 pb-3 border-b border-slate-800/60 last:border-0">
                      <div className="w-10 h-10 rounded-lg cta-primary flex items-center justify-center type-kpi font-black text-white shrink-0">{step.number}</div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-200 text-sm mb-0.5">{step.title}</p>
                        <p className="text-xs text-slate-400 leading-relaxed mb-1.5">{step.description}</p>
                        <p className="type-kpi text-[10px] text-slate-500">OUTPUT → {step.output}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Decision tree */}
                <div className="mt-5 rounded-xl panel-uc p-4">
                  <p className="type-meta text-indigo-300 mb-2">עץ החלטות אבחוני (2.8)</p>
                  <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
                    <p><strong className="text-white">שאלה 1:</strong> האם ציר A הוא הגבוה ביותר?</p>
                    <p className="pr-4">→ כן + MBI תשישות רגשית &gt; 27 → חשד ל-<strong className="text-purple-300">CS</strong></p>
                    <p className="pr-4">→ כן + MBI &lt; 27 + Context Switches &gt; 15/day → חשד ל-<strong className="text-indigo-300">CLT</strong></p>
                    <p><strong className="text-white">שאלה 2:</strong> האם ציר M הוא הגבוה ביותר?</p>
                    <p className="pr-4">→ כן + Edmondson &lt; 3.5 → חשד ל-<strong className="text-orange-300">ZSG</strong></p>
                    <p className="pr-4">→ כן + Hotfix Rate &gt; 3x baseline → חשד ל-<strong className="text-red-300">NOD</strong></p>
                    <p><strong className="text-white">שאלה 3:</strong> האם אותם כשלים חוזרים &gt; 3 פעמים ב-6 חודשים?</p>
                    <p className="pr-4">→ כן + Retro Action Items חוזרים → חשד ל-<strong className="text-yellow-300">OLD</strong></p>
                    <p><strong className="text-white">שאלה 4:</strong> האם יותר מפתולוגיה אחת מזוהה?</p>
                    <p className="pr-4">→ כן → עבור ל-Comorbidity Mapping (סעיף III.6)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section III: Taxonomy */}
            <section id="section-taxonomy">
              <div className="mb-4">
                <p className="type-meta mb-1">חלק III</p>
                <h2 className="type-h1 text-white">הטקסונומיה הקלינית: חמש הפתולוגיות</h2>
                <p className="type-body text-slate-400 mt-1">כל פתולוגיה מוצגת במבנה DSM: קריטריונים אבחוניים ממוספרים, specifiers לחומרה, מנגנון תאורטי, הקשר תרבותי, אבחנה מבדלת, comorbidity, מהלך ופרוגנוזה, ו-clinical vignettes.</p>
              </div>
              <div className="space-y-6">
                {DSM_PATHOLOGIES.map(entry => (
                  <PathologyCard key={entry.type} entry={entry} />
                ))}
              </div>
            </section>

            {/* Section III.6: Comorbidity */}
            <section id="section-comorbidity" className="smooth-section">
              <div className="bento-card p-5 md:p-6 border-t-4 border-t-purple-500">
                <p className="type-meta mb-1">חלק III.6</p>
                <h2 className="type-h1 text-white mb-2">Comorbidity — דפוסי אינטראקציה בין פתולוגיות</h2>
                <p className="type-body text-slate-400 mb-4">ארגון מציג לעיתים רחוקות פתולוגיה אחת בלבד. CS תמיד ראשון אם קיים — כי הוא amplifier שמחמיר הכל.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700/60">
                        <th className="text-right px-3 py-2 type-meta">צמד</th>
                        <th className="text-right px-3 py-2 type-meta">מנגנון אינטראקציה</th>
                        <th className="text-right px-3 py-2 type-meta">שכיחות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DSM_COMORBIDITY_MATRIX.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800/60 last:border-0">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="status-badge status-danger">{row.from}</span>
                            <span className="mx-1 text-slate-500">→</span>
                            <span className="status-badge status-warning">{row.to}</span>
                          </td>
                          <td className="px-3 py-2 text-slate-300 text-xs leading-relaxed">{row.mechanism}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`status-badge ${row.prevalence === 'high' ? 'status-danger' : row.prevalence === 'medium-high' ? 'status-warning' : 'status-info'}`}>
                              {row.prevalence === 'high' ? 'גבוהה' : row.prevalence === 'medium-high' ? 'בינונית-גבוהה' : 'בינונית'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 rounded-xl panel-nd px-4 py-3">
                  <p className="type-meta text-amber-300 mb-1">כלל קליני: כיוון הטיפול ב-Comorbidity</p>
                  <p className="text-xs text-slate-300">כאשר מזוהות מספר פתולוגיות, סדר ההתערבות נקבע לפי שני קריטריונים: (1) CS תמיד ראשון אם קיים. (2) בין שאר הפתולוגיות, טפל קודם בזו שמזינה את האחרות (upstream). לדוגמה: NOD → OLD = טפל ב-NOD קודם.</p>
                </div>
              </div>
            </section>

            {/* Section V: Interventions */}
            <section id="section-interventions" className="smooth-section">
              <div className="mb-4">
                <p className="type-meta mb-1">חלק V</p>
                <h2 className="type-h1 text-white">חוברות התערבות קליניות</h2>
                <p className="type-body text-slate-400 mt-1">כל התערבות בנויה לפי העיקרון: חוסם עורקים (1–3 ימים) → שינוי מבני (4–16 שבועות) → מנגנון משוב (שוטף). לא עצות. ארכיטקטורה.</p>
              </div>

              <div className="bento-card p-4 mb-5">
                <p className="type-meta mb-3">מיפוי ישיר: פתולוגיה → פרוטוקול → KPI הצלחה</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {Object.entries(PATHOLOGY_PROTOCOL_MAP).map(([type, mapping]) => (
                    <div key={type} className="surface-strong rounded-xl p-3 border border-slate-700/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="status-badge status-info">{type}</span>
                        <a href={`#pathology-${type}`} className="text-[10px] text-indigo-300 hover:text-indigo-200">
                          פתח פתולוגיה →
                        </a>
                      </div>
                      <p className="text-xs text-slate-300 mb-1.5">
                        <span className="type-meta">Protocol:</span> {mapping.protocol}
                      </p>
                      <p className="text-xs text-slate-400">
                        <span className="type-meta">KPI:</span> {mapping.successKpi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intervention matrix */}
              <div className="bento-card p-4 mb-5 overflow-x-auto">
                <p className="type-meta mb-3">מטריצת התערבות לפי פתולוגיה</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700/60">
                      <th className="text-right px-2 py-1.5 type-meta">התערבות</th>
                      {(['NOD','ZSG','OLD','CLT','CS'] as const).map(t => (
                        <th key={t} className="px-2 py-1.5 type-meta text-center">{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DSM_INTERVENTION_PLAYBOOKS.map(p => (
                      <tr key={p.id} className="border-b border-slate-800/60 last:border-0">
                        <td className="px-2 py-1.5 text-slate-300 font-medium whitespace-nowrap">{p.id} {p.title}</td>
                        {(['NOD','ZSG','OLD','CLT','CS'] as const).map(t => {
                          const eff = p.effectiveness[t]
                          return (
                            <td key={t} className="px-2 py-1.5 text-center">
                              {eff === 'primary'   && <span className="text-red-400 font-black">●●●</span>}
                              {eff === 'secondary' && <span className="text-amber-400 font-black">●●</span>}
                              {eff === 'indirect'  && <span className="text-emerald-400">●</span>}
                              {!eff               && <span className="text-slate-700">–</span>}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-slate-500 mt-2">
                  <span className="text-red-400 font-black">●●●</span> התערבות ראשית &nbsp;|&nbsp;
                  <span className="text-amber-400 font-black">●●</span> התערבות משנית &nbsp;|&nbsp;
                  <span className="text-emerald-400">●</span> השפעה עקיפה
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DSM_INTERVENTION_PLAYBOOKS.map(p => (
                  <InterventionCard key={p.id} playbook={p} />
                ))}
              </div>
            </section>

            {/* Section VI: Assessment Instruments */}
            <section id="section-instruments" className="smooth-section">
              <div className="bento-card p-5 md:p-6 border-t-4 border-t-slate-500">
                <p className="type-meta mb-1">חלק VI</p>
                <h2 className="type-h1 text-white mb-4">כלי מדידה והערכה</h2>
                <div className="space-y-4">
                  {DSM_ASSESSMENT_INSTRUMENTS.map(inst => (
                    <div key={inst.id} className="surface-strong rounded-xl p-4">
                      <p className="font-bold text-slate-200 mb-1">{inst.name}</p>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">{inst.description}</p>
                      {inst.subscales && (
                        <div className="overflow-x-auto mb-2">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-slate-700/60">
                                <th className="text-right px-2 py-1 type-meta">תת-סקלה</th>
                                <th className="text-right px-2 py-1 type-meta">פריטים</th>
                                <th className="text-right px-2 py-1 type-meta">Cutoff קליני</th>
                                <th className="text-right px-2 py-1 type-meta">ציר T/A/M</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inst.subscales.map(s => (
                                <tr key={s.name} className="border-b border-slate-800/60 last:border-0">
                                  <td className="px-2 py-1 text-slate-300">{s.name}</td>
                                  <td className="px-2 py-1 type-kpi text-slate-400">{s.items}</td>
                                  <td className="px-2 py-1 type-kpi text-intent-danger">{s.clinicalCutoff}</td>
                                  <td className="px-2 py-1 type-kpi text-amber-300">{s.tamAxis}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <div className="rounded-lg panel-uc px-3 py-2 mb-1.5">
                        <p className="type-meta text-indigo-300 mb-0.5">שימוש ב-DSM-Org</p>
                        <p className="text-xs text-slate-300">{inst.usageInDsmOrg}</p>
                      </div>
                      {inst.israeliNote && (
                        <div className="rounded-lg panel-nd px-3 py-2">
                          <p className="type-meta text-amber-300 mb-0.5">הערה קלינית — הקשר ישראלי</p>
                          <p className="text-xs text-slate-300">{inst.israeliNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Confidence section */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <p className="type-meta mb-3">חלק VII — רמת ביטחון POC</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'ביטחון תאורטי', value: 'גבוה', desc: 'מבוסס על COR Theory, Vaughan, Argyris, Sweller, Edmondson, Thaler & Sunstein', color: 'text-intent-success' },
                      { label: 'מדידה ומיפוי', value: 'בינוני-גבוה', desc: 'כלי המדידה מאומתים. ספי T/A/M לא כויילו על ארגונים ישראליים בודדים.', color: 'text-intent-warning' },
                      { label: 'ביטחון POC כולל', value: '0.70–0.80', desc: 'גבוה מספיק כדי להצדיק פיילוט. לא גבוה מספיק כדי לפרוס ללא כיול.', color: 'text-intent-danger' },
                    ].map(c => (
                      <div key={c.label} className="surface-strong rounded-xl p-3">
                        <p className="type-meta mb-1">{c.label}</p>
                        <p className={`type-kpi text-lg font-black mb-1 ${c.color}`}>{c.value}</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{c.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl panel-nd px-4 py-3">
                    <p className="type-meta text-amber-300 mb-1">שקיפות מתודולוגית: למה זה כרגע 0.70–0.80</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      הרמה הנוכחית גבוהה תאורטית אבל עדיין לא מכוילת תפעולית על סדרות מקרים אמיתיות לאורך זמן.
                      כלומר: המודל מסביר טוב, אבל עוד לא הוכיח יציבות מספקת מול תוצאות התערבות בפועל.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="surface-strong rounded-lg p-3">
                        <p className="type-meta text-slate-300 mb-1">מה כבר יש (למה לא נמוך יותר)</p>
                        <ul className="text-xs text-slate-300 space-y-1 leading-relaxed list-disc pr-4">
                          <li>Taxonomy קלינית מלאה + קריטריונים דיפרנציאליים.</li>
                          <li>כלי מדידה מאומתים (MBI / Edmondson / RSQ).</li>
                          <li>מיפוי ישיר מפתולוגיה להתערבות ול-KPI הצלחה.</li>
                        </ul>
                      </div>
                      <div className="surface-strong rounded-lg p-3">
                        <p className="type-meta text-slate-300 mb-1">מה עוד חסר (למה לא 0.90+)</p>
                        <ul className="text-xs text-slate-300 space-y-1 leading-relaxed list-disc pr-4">
                          <li>כיול ספי חומרה על דאטה היסטורי מקומי (ולא רק ספרות).</li>
                          <li>מדידת precision/recall לכל פתולוגיה לאורך רבעונים.</li>
                          <li>מעקב שיטתי אחר false-positive / false-negative אחרי התערבות.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl panel-uc px-4 py-3">
                    <p className="type-meta text-indigo-300 mb-2">מה צריך לקרות כדי שהביטחון יעלה</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-700/60">
                            <th className="text-right px-2 py-1 type-meta">יעד ביטחון</th>
                            <th className="text-right px-2 py-1 type-meta">תנאי העלאה (Gate)</th>
                            <th className="text-right px-2 py-1 type-meta">מדד אימות</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-800/60">
                            <td className="px-2 py-1 text-slate-200 font-bold">0.80–0.85</td>
                            <td className="px-2 py-1 text-slate-300">לפחות 2–3 ספרינטים מדודים לכל פתולוגיה דומיננטית</td>
                            <td className="px-2 py-1 text-slate-400">שיפור עקבי ב-2 KPI לפחות מול baseline</td>
                          </tr>
                          <tr className="border-b border-slate-800/60">
                            <td className="px-2 py-1 text-slate-200 font-bold">0.85–0.90</td>
                            <td className="px-2 py-1 text-slate-300">כיול ספי severity/comorbidity על דאטה אמיתי</td>
                            <td className="px-2 py-1 text-slate-400">false-positive ו-false-negative בירידה רבעונית</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 text-slate-200 font-bold">0.90+</td>
                            <td className="px-2 py-1 text-slate-300">שחזור ביצועים על cohort נוסף (generalization)</td>
                            <td className="px-2 py-1 text-slate-400">יציבות תוצאות ב-2 cohorts שונים ללא drift מהותי</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section IV: Sequencing Rules */}
            <section id="section-sequencing" className="smooth-section">
              <div className="bento-card p-5 md:p-6 border-t-4 border-t-red-500">
                <p className="type-meta mb-1">חלק IV</p>
                <h2 className="type-h1 text-white mb-2">חוקי סיקוונסינג וקומורבידיות</h2>
                <p className="type-body text-slate-400 mb-5">חוקים דטרמיניסטיים המגדירים איזו פתולוגיה יש לטפל ראשונה. הפרה של חוקים אלו מובילה לנזק יאטרוגני (נזק מהטיפול עצמו).</p>

                <div className="space-y-3 mb-5">
                  {SEQUENCING_RULES.map(rule => (
                    <div key={rule.id} className={`rounded-xl p-4 border ${rule.severity === 'mandatory' ? 'border-red-500/60 panel-dr' : 'border-amber-500/40 panel-nd'}`}>
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className={`status-badge ${rule.severity === 'mandatory' ? 'status-danger' : 'status-warning'}`}>
                          {rule.severity === 'mandatory' ? 'חובה' : 'מומלץ'}
                        </span>
                        <code className="text-xs text-slate-400 font-mono">{rule.condition}</code>
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        <span className="status-badge status-info">{rule.prerequisite}</span>
                        <span className="text-slate-500">→ לפני →</span>
                        <span className="status-badge status-warning">{rule.blocked}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{rule.rationale}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl panel-nd px-4 py-3 mb-4">
                  <p className="type-meta text-amber-300 mb-1">חוקי תעדוף מודל ה-DSM-Org</p>
                  <div className="space-y-2">
                    {MANDATORY_COMORBIDITY_SEQUENCES.map(seq => (
                      <div key={seq.id} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="status-badge status-info">{seq.first}</span>
                        <span className="text-slate-500">→</span>
                        <span className="status-badge status-warning">{seq.then}</span>
                        <span className="text-slate-500">|</span>
                        <span>{seq.when}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl panel-dr px-4 py-3">
                  <p className="type-meta text-red-300 mb-1">אזהרה קלינית</p>
                  <p className="text-xs text-slate-300">כל ניסיון לפתור NOD בארגון ללא ביטחון פסיכולוגי (PSG) ייכשל — העובדים ימשיכו להסתיר סטיות. יש לבנות PSG קודם. באופן דומה, שינוי מבני (SC) נחסם כשעומס קוגניטיבי (CLT) גבוה.</p>
                </div>
              </div>
            </section>

            {/* Section VII: DSM 7×21 Overview */}
            <section id="section-dsm7x21" className="smooth-section">
              <div className="mb-4">
                <p className="type-meta mb-1">חלק VII</p>
                <h2 className="type-h1 text-white">DSM-Org 7×21 — מפת תוכן מלאה</h2>
                <p className="type-body text-slate-400 mt-1">שבעה חלקים, 21 תתי-נושאים — כל אחד מקושר לפתולוגיות, צירי אבחון, וחוברות התערבות.</p>
              </div>
              <div className="space-y-6">
                {DSM_ORG_PARTS.map(part => (
                  <div key={part.part} className="bento-card p-4 md:p-5 border-t-4 border-t-slate-500">
                    <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                      <div>
                        <p className="type-meta mb-0.5">Part {part.part}</p>
                        <h3 className="type-h2 text-white">{part.nameHe}</h3>
                        <p className="text-xs text-slate-400">{part.nameEn}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">{part.description}</p>
                    <div className="space-y-3">
                      {part.subTopics.map(sub => {
                        const link = DSM_CONTENT_INDEX.find(l => l.subtopicId === sub.id)
                        return (
                          <div key={sub.id} className="surface-strong rounded-xl p-3">
                            <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                              <div>
                                <p className="text-sm font-bold text-slate-200">{sub.nameHe}</p>
                                <p className="text-[10px] text-slate-500">{sub.nameEn}</p>
                              </div>
                              {link && (
                                <div className="flex gap-1 flex-wrap">
                                  {link.pathologyTypes.map(pt => (
                                    <a key={pt} href={`#pathology-${pt}`} className="status-badge status-info text-[9px]">{pt}</a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed mb-2">{sub.description}</p>
                            {link && link.tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {link.tags.slice(0, 4).map(tag => (
                                  <span key={tag} className="text-[9px] text-slate-500 bg-slate-800/50 rounded px-1.5 py-0.5">{tag}</span>
                                ))}
                              </div>
                            )}
                            {link && link.playbookIds.length > 0 && (
                              <p className="text-[10px] text-emerald-400 mt-1.5">התערבויות: {link.playbookIds.join(', ')}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  )
}
