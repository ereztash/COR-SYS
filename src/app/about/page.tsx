import Link from 'next/link'
import { AboutTabs } from './AboutTabs'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'זהות עסקית | COR-SYS',
  description: 'זהות, הבעיה, הפתרון ומסחור — מסגרת MECE',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      <header className="border-b border-slate-800 pb-4 mb-2">
        <div className="max-w-[1200px] mx-auto px-6 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">C</div>
                <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Heebo, sans-serif' }}>
                  COR-SYS
                </h1>
              </Link>
              <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                MECE v4
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">זהות עסקית — 4 לשוניות</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl text-xs font-mono text-emerald-400 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            J(t) = C(t) / E(t)
          </div>
        </div>
      </header>

      <AboutTabs />
    </div>
  )
}
