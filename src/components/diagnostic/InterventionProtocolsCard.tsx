import Link from 'next/link'
import type { InterventionProtocol } from '@/lib/dsm-engine'
import { HORIZON_LABELS } from '@/lib/diagnostic/action-plan'
import type { UnifiedTreatmentPlanResult } from '@/lib/diagnostic/unified-pipeline'
import { ModeBlurb } from '@/components/ui/ModeBlurb'

function TamBar({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex items-center gap-2 text-[10px] text-slate-400">
      <span className="w-3 font-mono">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500/80"
          style={{ width: `${(v / 5) * 100}%` }}
        />
      </div>
      <span className="w-4 font-mono text-slate-500">{v}</span>
    </div>
  )
}

function UnifiedItemCard({ item, rank }: { item: UnifiedTreatmentPlanResult['items'][0]; rank: number }) {
  const tam = item.tam_impact
  const locked = item.sequencing_locked
  return (
    <div
      className={`rounded-xl p-4 border ${
        locked ? 'bg-slate-900/50 border-slate-600 opacity-75' : 'bg-slate-800/40 border-slate-700/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500">#{rank}</span>
          <h3 className="text-sm font-bold text-white">{item.title_he}</h3>
          {locked && <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">נעול</span>}
        </div>
        <span className="text-[10px] text-slate-500 font-mono shrink-0">
          {item.axis} · {HORIZON_LABELS[item.horizon]}
        </span>
      </div>
      {locked && item.sequencing_lock_reason_he && (
        <p className="text-[10px] text-amber-400/90 mb-2">{item.sequencing_lock_reason_he}</p>
      )}
      <p className="text-xs text-slate-300 leading-relaxed mb-2">{item.what_he}</p>
      <p className="text-[11px] text-slate-400 mb-3">{item.why_he}</p>
      <div className="space-y-1 mb-3">
        <p className="text-[9px] font-semibold text-slate-500 uppercase">חיסכון T/A/M צפוי</p>
        <TamBar label="T" v={tam.t} />
        <TamBar label="A" v={tam.a} />
        <TamBar label="M" v={tam.m} />
      </div>
      {item.display_tags && item.display_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.display_tags.map((t) => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300">
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="border-t border-slate-700 pt-2">
        <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">מדד מוביל</p>
        <p className="text-[11px] text-emerald-400/90">{item.metric_he}</p>
        {item._ius != null && (
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            IUS {item._ius.score}
            {item._ius.mvc_revised ? ' · MVC' : ''}
          </p>
        )}
      </div>
    </div>
  )
}

export function InterventionProtocolsCard({
  unifiedPlan,
  ctaSlot,
}: {
  unifiedPlan: UnifiedTreatmentPlanResult
  ctaSlot?: React.ReactNode
}) {
  const { items, longHorizonProtocols, sequencing_alerts_he, narrative_primary_he } = unifiedPlan
  if (items.length === 0 && longHorizonProtocols.length === 0) return null

  return (
    <div className="bento-card p-6 border-r-4 border-r-red-500">
      <p className="text-xs font-bold text-slate-500 uppercase mb-2">תוכנית טיפול מדורגת</p>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">{narrative_primary_he}</p>
      <ModeBlurb
        className="mb-4"
        beginner="שלוש פעולות ראשונות לפי אותו מנוע כמו באשף האבחון."
        advanced="Unified CDSS: IUS-ranked ActionPlanItem[] + sequencing locks + T/A/M."
        research="Single pipeline output; legacy protocol list deprecated."
      />
      {sequencing_alerts_he.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/20 px-3 py-2">
          {sequencing_alerts_he.map((a) => (
            <p key={a} className="text-xs text-red-200/95">
              {a}
            </p>
          ))}
        </div>
      )}
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase">אופק 14–90 יום (מובילים)</p>
        {items.map((item, i) => (
          <UnifiedItemCard key={item.interventionId ?? i} item={item} rank={i + 1} />
        ))}
      </div>
      {longHorizonProtocols.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase">שלב בנייה (פרוטוקולים ארוכי טווח)</p>
          {longHorizonProtocols.map((protocol) => (
            <div key={protocol.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">{protocol.nameHe}</h3>
                <span className="text-[10px] text-slate-500 font-mono">{protocol.phase}</span>
              </div>
              <ul className="space-y-1 mb-2">
                {protocol.components.slice(0, 3).map((c, i) => (
                  <li key={i} className="text-[11px] text-slate-400">
                    {c.step} — {c.detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {ctaSlot && <div className="flex gap-3 pt-4">{ctaSlot}</div>}
    </div>
  )
}

/** @deprecated Use unified plan path only; kept for transitional imports. */
export function LegacyInterventionProtocolsList({ protocols }: { protocols: InterventionProtocol[] }) {
  if (protocols.length === 0) return null
  return (
    <div className="space-y-5">
      {protocols.map((protocol) => (
        <div key={protocol.id} className="bg-slate-800/40 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white">{protocol.nameHe}</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1">{protocol.phase}</p>
        </div>
      ))}
    </div>
  )
}

export function PlanProtocolsCta() {
  return (
    <Link
      href="/services"
      className="flex-1 text-center px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors"
    >
      הזמן התערבות ←
    </Link>
  )
}
