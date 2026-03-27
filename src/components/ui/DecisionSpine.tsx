'use client'

/**
 * DecisionSpine — Persistent "So What / Now What" bar
 *
 * Renders 3 decision-quality blocks at the top of any core screen:
 *   1. מצב (DSM state + severity)
 *   2. השפעה כלכלית (₪/day + J-Quotient + urgency)
 *   3. פעולה (single CTA + deadline)
 *
 * Works with golden_questions from the CBR API, or falls back to
 * raw snapshot data when golden_questions is unavailable.
 *
 * Loss framing: Kahneman & Tversky (1991)
 */

import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DecisionSpineData {
  /** DSM state block */
  severity: string           // e.g. 'critical', 'at-risk', 'healthy', 'systemic-collapse'
  severityLabel: string      // Hebrew label
  primaryPathology: string   // e.g. 'DR'
  stateNarrative: string     // 1-sentence summary

  /** Economic impact block */
  dailyLossILS: number | null
  weeklyLossILS: number | null
  jQuotient: number | null
  urgency: 'critical' | 'elevated' | 'moderate' | null
  jInterpretation: string | null

  /** Action block */
  ctaLabel: string
  ctaHref: string
  ctaTimeMonths: number | null   // null = immediate
  ctaRationale: string | null
}

interface Props {
  data: DecisionSpineData
  className?: string
}

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { accentClass: string; dotClass: string; bg: string; border: string }> = {
  'healthy':           { accentClass: 'text-intent-success', dotClass: 'status-success', bg: 'bg-slate-900/30', border: 'border-slate-700/40' },
  'at-risk':           { accentClass: 'text-intent-warning', dotClass: 'status-warning', bg: 'bg-slate-900/30', border: 'border-slate-700/40' },
  'critical':          { accentClass: 'text-intent-danger', dotClass: 'status-danger', bg: 'bg-slate-900/30', border: 'border-slate-700/40' },
  'systemic-collapse': { accentClass: 'text-intent-danger', dotClass: 'status-danger', bg: 'bg-slate-900/40', border: 'border-slate-700/50' },
}

const URGENCY_CONFIG: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: 'text-intent-danger', bg: 'bg-slate-900/40', border: 'border-slate-700/50' },
  elevated: { text: 'text-intent-warning', bg: 'bg-slate-900/40', border: 'border-slate-700/40' },
  moderate: { text: 'text-intent-success', bg: 'bg-slate-900/40', border: 'border-slate-700/40' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DecisionSpine({ data, className = '' }: Props) {
  const sev = SEVERITY_CONFIG[data.severity] ?? SEVERITY_CONFIG['at-risk']
  const urg = data.urgency ? (URGENCY_CONFIG[data.urgency] ?? URGENCY_CONFIG.moderate) : null

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${sev.bg} ${sev.border} ${className}`}
      style={{ borderTopWidth: '3px' }}
    >
      <p className={`type-meta mb-3 ${sev.accentClass}`}>
        מצב · השפעה · פעולה
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Block 1 — מצב */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-block w-2 h-2 rounded-full ${sev.dotClass} animate-pulse`} />
            <span className="type-meta text-slate-400">מצב</span>
          </div>
          <p className={`type-h2 ${sev.accentClass}`}>
            {data.severityLabel}
            {data.primaryPathology ? ` · ${data.primaryPathology} ↑` : ''}
          </p>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
            {data.stateNarrative}
          </p>
        </div>

        {/* Block 2 — השפעה */}
        <div className={`space-y-1 rounded-xl p-3 ${urg ? `${urg.bg} border ${urg.border}` : 'bg-slate-800/40 border border-slate-700/30'}`}>
          <p className="type-meta text-slate-400 mb-1">השפעה כלכלית</p>
          {data.dailyLossILS != null && data.dailyLossILS > 0 ? (
            <>
              <p className={`text-lg font-black type-kpi ${urg?.text ?? 'text-white'}`}>
                ₪{Math.round(data.dailyLossILS).toLocaleString('he-IL')}/יום
              </p>
              {data.weeklyLossILS != null && (
                <p className="text-xs text-slate-400">
                  ₪{Math.round(data.weeklyLossILS).toLocaleString('he-IL')}/שבוע
                </p>
              )}
              {data.jQuotient != null && (
                <p className="type-meta text-slate-500 mt-1 type-kpi normal-case">
                  J={data.jQuotient.toFixed(2)}
                  {data.urgency === 'critical' ? ' · קריסה תפעולית' : data.urgency === 'elevated' ? ' · חוב החלטות' : ' · קיבולת זמינה'}
                </p>
              )}
              {data.jInterpretation && (
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1 line-clamp-2">
                  {data.jInterpretation}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-500">הזן תעריף שעתי ועיכוב החלטה לחישוב</p>
          )}
        </div>

        {/* Block 3 — פעולה */}
        <div className="space-y-2">
          <p className="type-meta text-slate-400">פעולה מומלצת</p>
          <p className="type-h2 text-white">{data.ctaLabel}</p>
          {data.ctaTimeMonths === 0 || data.ctaTimeMonths === null ? (
            <span className="inline-block status-badge status-danger">
              פעולה מיידית
            </span>
          ) : (
            <span className="inline-block status-badge border border-slate-600 text-slate-300">
              טווח: {data.ctaTimeMonths} חודשים
            </span>
          )}
          {data.ctaRationale && (
            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{data.ctaRationale}</p>
          )}
          <Link
            href={data.ctaHref}
            className="inline-block mt-1 text-xs font-bold px-4 py-1.5 rounded-xl cta-primary transition-all"
          >
            בצע עכשיו →
          </Link>
        </div>

      </div>
    </div>
  )
}
