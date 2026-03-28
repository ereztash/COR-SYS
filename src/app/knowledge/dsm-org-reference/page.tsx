'use client'

import { useState } from 'react'
import {
  DSM_ORG_PARTS,
  RED_FLAGS,
  SEQUENCING_RULES,
  ANTIFRAGILITY_PROTOCOLS,
  EXTENDED_INTERVENTIONS,
  TAM_SIGNATURES,
  EXTENDED_PATHOLOGY_NAMES,
  type DsmOrgPart,
  type RedFlagSeverity,
  type ExtendedPathologyCode,
} from '@/lib/dsm-org-taxonomy'

const SEVERITY_COLORS: Record<RedFlagSeverity, { bg: string; text: string; border: string; label: string }> = {
  low: { bg: 'bg-emerald-950/30', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'נמוכה' },
  medium: { bg: 'bg-yellow-950/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'בינונית' },
  critical: { bg: 'bg-red-950/30', text: 'text-red-400', border: 'border-red-500/30', label: 'קריטית' },
}

const PART_ICONS = ['📐', '🧠', '⚙️', '🔬', '🔋', '🔗', '💊']

export default function DsmOrgReferencePage() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      {/* Header */}
      <header className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/25">D</div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">DSM-Org Reference</h1>
            <p className="text-xs text-indigo-300 font-bold tracking-wide">מדריך אבחוני מלא — 7 חלקים · 21 תתי-נושאים</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-2">
          טקסונומיה אונטולוגית לאבחון, מדידה וטיפול בכשלים מערכתיים בארגונים. מבוסס על מתודולוגיית COR-SYS.
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DSM_ORG_PARTS.map((part, i) => (
          <button
            key={part.part}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
              activeTab === i
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
            }`}
          >
            <span>{PART_ICONS[i]}</span>
            <span className="hidden sm:inline">חלק {part.part}</span>
          </button>
        ))}
        <button
          onClick={() => setActiveTab(7)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
            activeTab === 7
              ? 'bg-red-600/20 border-red-500 text-red-300 shadow-lg shadow-red-500/10'
              : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          🚨 Red Flags
        </button>
        <button
          onClick={() => setActiveTab(8)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
            activeTab === 8
              ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/10'
              : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          ⚡ Anti-Fragility
        </button>
        <button
          onClick={() => setActiveTab(9)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
            activeTab === 9
              ? 'bg-amber-600/20 border-amber-500 text-amber-300'
              : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          📊 T/A/M
        </button>
      </div>

      {/* Content */}
      {activeTab < 7 && <PartView part={DSM_ORG_PARTS[activeTab]} />}
      {activeTab === 7 && <RedFlagsView />}
      {activeTab === 8 && <AntifragilityView />}
      {activeTab === 9 && <TAMView />}
    </div>
  )
}

function PartView({ part }: { part: DsmOrgPart }) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{PART_ICONS[part.part - 1]}</span>
          <div>
            <h2 className="text-xl font-black text-white">חלק {part.part}: {part.nameHe}</h2>
            <p className="text-xs text-indigo-400 font-mono">{part.nameEn}</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-2">{part.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {part.subTopics.map(sub => (
          <div key={sub.id} className="rounded-2xl border border-slate-700/30 bg-slate-800/20 p-5 hover:border-indigo-500/30 transition-all duration-200 group">
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{sub.nameHe}</h3>
            <p className="text-[10px] text-indigo-400 font-mono mb-3">{sub.nameEn}</p>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">{sub.description}</p>

            {/* Related Pathologies */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {sub.relatedPathologies.map(code => (
                <span key={code} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/50 text-indigo-300 border border-indigo-500/20">
                  {code}
                </span>
              ))}
            </div>

            {/* Diagnostic Questions */}
            <div className="mb-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">שאלות אבחון</p>
              <ul className="space-y-1.5">
                {sub.diagnosticQuestions.map((q, i) => (
                  <li key={i} className="text-[11px] text-slate-400 flex gap-2">
                    <span className="text-indigo-500 shrink-0">▸</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* KPIs */}
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">KPIs</p>
              <div className="flex flex-wrap gap-1">
                {sub.kpis.map((kpi, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700/50">
                    {kpi}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sequencing Rules for Part 6 */}
      {part.part === 6 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-6 mt-4">
          <h3 className="text-lg font-black text-amber-300 mb-4">⚠️ חוקי סיקוונסינג (IF-THEN)</h3>
          <div className="space-y-3">
            {SEQUENCING_RULES.map(rule => (
              <div key={rule.id} className={`rounded-xl p-4 border ${
                rule.severity === 'mandatory' ? 'border-red-500/30 bg-red-950/10' : 'border-yellow-500/20 bg-yellow-950/10'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rule.severity === 'mandatory' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {rule.severity === 'mandatory' ? 'חובה' : 'מומלץ'}
                  </span>
                  <code className="text-xs font-mono text-slate-300">{rule.condition}</code>
                </div>
                <p className="text-xs text-slate-400">{rule.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intervention Playbooks for Part 7 */}
      {part.part === 7 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-6 mt-4">
          <h3 className="text-lg font-black text-emerald-300 mb-4">📋 ספריית התערבויות מורחבת</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right p-2 text-slate-500">התערבות</th>
                  <th className="text-right p-2 text-slate-500">אופק</th>
                  <th className="text-right p-2 text-slate-500">טריגרים</th>
                  <th className="text-right p-2 text-slate-500">מדדים מובילים</th>
                  <th className="text-right p-2 text-slate-500">עייפות שינוי</th>
                </tr>
              </thead>
              <tbody>
                {EXTENDED_INTERVENTIONS.map(int => (
                  <tr key={int.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="p-2 text-white font-bold">{int.nameHe}</td>
                    <td className="p-2 text-slate-400">{int.horizon}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {int.triggerPathologies.slice(0, 3).map(code => (
                          <span key={code} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/50 text-indigo-300">{code}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2 text-emerald-400">{int.leadingMetrics.join(', ')}</td>
                    <td className="p-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        int.changeFatigueRisk === 'low' ? 'bg-emerald-950/30 text-emerald-400' :
                        int.changeFatigueRisk === 'medium' ? 'bg-yellow-950/30 text-yellow-400' :
                        'bg-red-950/30 text-red-400'
                      }`}>
                        {int.changeFatigueRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function RedFlagsView() {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="rounded-2xl border border-red-500/20 bg-red-950/5 p-6">
        <h2 className="text-xl font-black text-red-300 mb-2">🚨 10 נורות אזהרה סמויות</h2>
        <p className="text-xs text-slate-400">סימנים מקדימים למשבר ארגוני — מהעדינים ביותר שארגונים נוטים להדחיק</p>
      </div>

      {(['low', 'medium', 'critical'] as RedFlagSeverity[]).map(severity => {
        const flags = RED_FLAGS.filter(f => f.severity === severity)
        const colors = SEVERITY_COLORS[severity]
        return (
          <div key={severity} className="space-y-2">
            <h3 className={`text-sm font-bold ${colors.text} uppercase tracking-widest`}>
              {severity === 'low' ? '🟢' : severity === 'medium' ? '🟡' : '🔴'} חומרה {colors.label}
            </h3>
            {flags.map(flag => (
              <div key={flag.id} className={`rounded-xl border p-4 ${colors.border} ${colors.bg}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-1">{flag.id}. {flag.nameHe}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mb-2">{flag.nameEn}</p>
                    <p className="text-xs text-slate-400 mb-2">{flag.description}</p>
                    <p className="text-xs text-slate-500 italic">💡 דוגמה: {flag.symptomExample}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 shrink-0">
                    {flag.relatedPathologies.map(code => (
                      <span key={code} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">{code}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function AntifragilityView() {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="rounded-2xl border border-purple-500/20 bg-purple-950/5 p-6">
        <h2 className="text-xl font-black text-purple-300 mb-2">⚡ מנגנוני אנטי-שבירות</h2>
        <p className="text-xs text-slate-400">
          חוסן כמנוע לפריצת דרך — 3 מנגנונים לצמיחה ממשבר והשתלטות על חולשת מתחרים
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {ANTIFRAGILITY_PROTOCOLS.map((proto, i) => (
          <div key={proto.id} className="rounded-2xl border border-purple-500/20 bg-slate-800/20 p-6 hover:border-purple-500/40 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{['🏰', '👤', '🔄'][i]}</span>
              <h3 className="text-base font-bold text-white">{proto.nameHe}</h3>
            </div>
            <p className="text-[10px] text-purple-400 font-mono mb-4">{proto.nameEn}</p>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">מנגנון</p>
                <p className="text-xs text-slate-300">{proto.mechanism}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">איך למנף</p>
                <p className="text-xs text-emerald-400">{proto.howToExploit}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">יתרון תחרותי</p>
                <p className="text-xs text-purple-300 font-bold">{proto.competitiveAdvantage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TAMView() {
  const codes = Object.keys(TAM_SIGNATURES) as ExtendedPathologyCode[]
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="rounded-2xl border border-amber-500/20 bg-amber-950/5 p-6">
        <h2 className="text-xl font-black text-amber-300 mb-2">📊 חתימות T/A/M קנוניות</h2>
        <p className="text-xs text-slate-400">וקטור תלת-ממדי (זמן, קשב, כסף) לכל פתולוגיה — ציון 1-5</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {codes.map(code => {
          const sig = TAM_SIGNATURES[code]
          const meta = EXTENDED_PATHOLOGY_NAMES[code]
          return (
            <div key={code} className="rounded-2xl border border-slate-700/30 bg-slate-800/20 p-5 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono font-black text-lg text-amber-400">{code}</span>
                <span className="text-xs text-slate-400">{meta.he}</span>
              </div>

              {/* T/A/M Bars */}
              {[
                { label: 'T (זמן)', value: sig.T, color: 'bg-blue-500' },
                { label: 'A (קשב)', value: sig.A, color: 'bg-purple-500' },
                { label: 'M (כסף)', value: sig.M, color: 'bg-emerald-500' },
              ].map(bar => (
                <div key={bar.label} className="mb-2">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-slate-500">{bar.label}</span>
                    <span className="text-slate-400 font-mono">{bar.value}/5</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                      style={{ width: `${(bar.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
