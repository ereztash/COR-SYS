import Link from 'next/link'
import { SERVICE_CHANNELS, getOptionsByChannel } from '@/lib/service-catalog'
import { formatCurrency } from '@/lib/utils'

const CALCULATOR_OPTION_ID = 'latency-calc'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'שירותים וערוצים | COR-SYS',
  description: 'ערוצי מתן שירות ואפשרויות תמחור',
}

export default function ServicesPage() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">← דשבורד</Link>
          <h1 className="text-3xl font-black text-white mt-2">שירותים וערוצים</h1>
          <p className="text-slate-400 text-sm mt-1">ערוצי מתן שירות ואפשרויות עסקיות — ניהול והצעות ללקוחות</p>
        </div>

        <div className="space-y-8">
          {SERVICE_CHANNELS.map((ch) => {
            const options = getOptionsByChannel(ch.id)
            return (
              <section key={ch.id} className="bento-card p-6 border-t-4 border-t-blue-500">
                <h2 className="text-xl font-bold text-white mb-1">{ch.nameHe}</h2>
                <p className="text-xs text-slate-400 mb-4">{ch.description}</p>
                <div className="space-y-3">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50"
                    >
                      <div>
                        <p className="font-bold text-slate-200 text-sm">{opt.nameHe}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                      </div>
                      <div className="shrink-0 text-left sm:text-right flex items-center gap-3">
                        {opt.id === CALCULATOR_OPTION_ID && (
                          <Link
                            href="/services/calculator"
                            className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-colors"
                          >
                            פתח מחשבון ←
                          </Link>
                        )}
                        <div>
                          <span className="text-emerald-400 font-bold text-sm">{opt.priceLabel}</span>
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

        <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700 text-xs text-slate-400">
          <p className="font-bold text-slate-300 mb-1">תמחור Value-Based</p>
          <p>לא T&M. ΔP = (H × C × 52) × Pₛ (20%). המלצה ללקוח נגזרת משאלון COR-SYS בדף הלקוח → תוכנית עסקית.</p>
        </div>
      </div>
    </div>
  )
}
