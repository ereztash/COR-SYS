import Link from 'next/link'
import type { InterventionProtocol } from '@/lib/dsm-engine'

export function InterventionProtocolsCard({
  protocols,
  ctaSlot,
}: {
  protocols: InterventionProtocol[]
  ctaSlot?: React.ReactNode
}) {
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
                  {' — '}
                  {c.detail}
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-700 pt-2">
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">מדדי הצלחה</p>
              <ul className="space-y-0.5">
                {protocol.successMetrics.map((m, i) => (
                  <li key={i} className="text-[11px] text-emerald-400/80">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[10px] text-slate-600 mt-2">{protocol.researchBasis}</p>
          </div>
        ))}
      </div>
      {ctaSlot && <div className="flex gap-3 pt-4">{ctaSlot}</div>}
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
