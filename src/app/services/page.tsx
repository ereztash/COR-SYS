import Link from 'next/link'
import { SERVICE_CHANNELS, getOptionsByChannel } from '@/lib/service-catalog'
import { formatCurrency } from '@/lib/utils'
import { LiveAnalysisPanel } from './LiveAnalysisPanel'
import { UxKpiPanel } from '@/components/ui/UxKpiPanel'

const CALCULATOR_OPTION_ID = 'latency-calc'

export const revalidate = 300

export const metadata = {
  title: 'שירותים וערוצים | COR-SYS',
  description: 'ערוצי מתן שירות ואפשרויות תמחור',
}

export default function ServicesPage() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-6">
        <div>
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">← דשבורד</Link>
          <h1 className="type-display text-white mt-2">שירותים וערוצים</h1>
          <p className="type-body text-slate-400 mt-1">ערוצי מתן שירות ואפשרויות עסקיות — ניהול והצעות ללקוחות</p>
        </div>

        <div className="space-y-8">
          {SERVICE_CHANNELS.map((ch) => {
            const options = getOptionsByChannel(ch.id)
            return (
              <section id={`channel-${ch.id}`} key={ch.id} className="bento-card motion-card p-6 border-t-4 border-t-blue-500">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="type-h1 text-white">{ch.nameHe}</h2>
                  <span className="status-badge status-info">{options.length} אפשרויות</span>
                </div>
                <p className="type-body text-slate-400 mb-4">{ch.description}</p>
                <div className="space-y-3">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 motion-card"
                    >
                      <div>
                        <p className="font-bold text-slate-200 text-sm">{opt.nameHe}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                        {opt.id === 'webinar' && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <a
                              href="/lecture-script-resilience-architecture.md"
                              target="_blank"
                              rel="noreferrer"
                              className="status-badge status-success px-3 py-1.5"
                            >
                              תסריט הרצאה (גרסה סופית)
                            </a>
                            <a
                              href="https://org-fortify.lovable.app"
                              target="_blank"
                              rel="noreferrer"
                              className="status-badge status-info px-3 py-1.5"
                            >
                              מחשבון ROI חי
                            </a>
                            <a
                              href="https://stop-delay-gain.base44.app"
                              target="_blank"
                              rel="noreferrer"
                              className="status-badge status-warning px-3 py-1.5"
                            >
                              מחשבון דחיינות (Cost of Delay)
                            </a>
                            <Link
                              href="/knowledge/dsm-org"
                              className="status-badge status-info px-3 py-1.5"
                            >
                              DSM-Org — Clinical Reference
                            </Link>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-left sm:text-right flex items-center gap-3">
                        {opt.id === CALCULATOR_OPTION_ID && (
                          <Link
                            href="/services/calculator"
                            className="px-3 py-1.5 rounded-lg cta-primary text-xs font-bold"
                          >
                            פתח מחשבון ←
                          </Link>
                        )}
                        <div>
                          <span className="text-intent-success font-bold text-sm">{opt.priceLabel}</span>
                          {opt.priceRangeMin > 0 && opt.priceRangeMax > 0 && (
                            <p className="text-[10px] text-slate-500">
                              {formatCurrency(opt.priceRangeMin)} – {formatCurrency(opt.priceRangeMax)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-8">
          <LiveAnalysisPanel />
        </div>

        <div className="mt-4">
          <UxKpiPanel />
        </div>

        <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700 text-xs text-slate-400">
          <p className="font-bold text-slate-300 mb-1">תמחור Value-Based</p>
          <p>לא T&M. ΔP = (H × C × 52) × Pₛ (20%). המלצה ללקוח נגזרת משאלון COR-SYS בדף הלקוח → תוכנית עסקית.</p>
        </div>
        </div>

        {/* Sticky action rail for faster navigation */}
        <aside className="hidden xl:block">
          <div className="sticky top-5 bento-card motion-card p-4 border-t-4 border-t-indigo-500">
            <p className="type-meta mb-3">ניווט מהיר</p>
            <div className="space-y-2">
              {SERVICE_CHANNELS.map((ch) => (
                <a
                  key={ch.id}
                  href={`#channel-${ch.id}`}
                  className="block text-xs px-3 py-2 rounded-lg nav-chip"
                >
                  {ch.nameHe}
                </a>
              ))}
              <a
                href="#live-analysis"
                className="block text-xs px-3 py-2 rounded-lg nav-chip"
              >
                ניתוח לייב (10 שאלות)
              </a>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <a
                href="https://org-fortify.lovable.app"
                target="_blank"
                rel="noreferrer"
                className="block status-badge status-info px-3 py-1.5 text-center"
              >
                ROI Calculator
              </a>
              <a
                href="https://stop-delay-gain.base44.app"
                target="_blank"
                rel="noreferrer"
                className="block status-badge status-warning px-3 py-1.5 text-center"
              >
                Cost of Delay
              </a>
              <Link
                href="/knowledge/dsm-org"
                className="block status-badge status-info px-3 py-1.5 text-center"
              >
                DSM-Org Reference
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
