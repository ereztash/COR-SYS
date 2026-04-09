'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarLogout } from './SidebarLogout'
import {
  LayoutDashboard,
  Info,
  ClipboardList,
  Users,
  Zap,
  Wallet,
  Rocket,
  Wand2,
  FileText,
  Target,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

export function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  return (
    <aside className="w-56 shrink-0 bg-slate-900/80 border-l border-slate-800 flex flex-col py-6 px-4 sticky top-0 h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/25 glow-breathe">C</div>
          <span className="font-black text-white text-lg" style={{ fontFamily: 'Heebo, sans-serif' }}>COR-SYS</span>
        </div>
        <p className="text-[10px] text-indigo-300 font-bold mr-9">Name it. Face it. Fix it.</p>
        <p className="text-[10px] text-slate-500 mr-9">Deep-Grid v2.2</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1" aria-label="ניווט ראשי">
        <NavLink href="/" icon={LayoutDashboard} label="דשבורד" onNavigate={onNavigate} />
        <NavLink href="/about" icon={Info} label="אודות" onNavigate={onNavigate} />
        <NavLink href="/services" icon={ClipboardList} label="שירותים וערוצים" onNavigate={onNavigate} />
        <NavLink href="/clients" icon={Users} label="לקוחות" onNavigate={onNavigate} />
        <NavLink href="/sprints" icon={Zap} label="ספרינטים" onNavigate={onNavigate} />
        <NavLink href="/financials" icon={Wallet} label="כספים" onNavigate={onNavigate} />

        <div className="mt-4 mb-2 border-t border-slate-800 pt-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3">Growth</span>
        </div>
        <NavLink href="/growth/hub" icon={Rocket} label="Growth Hub" onNavigate={onNavigate} />
        <NavLink href="/growth/wizard" icon={Wand2} label="Strategy Wizard" onNavigate={onNavigate} />
        <NavLink href="/growth/plans" icon={FileText} label="Campaign Plans" onNavigate={onNavigate} />
        <NavLink href="/growth/differentiate" icon={Target} label="Differentiation" onNavigate={onNavigate} />
        <NavLink href="/growth/dashboard" icon={BarChart3} label="Dashboard" onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-slate-800 pt-4 mt-4 space-y-1">
        <SidebarLogout />
        <p className="text-[10px] text-slate-600 text-center mode-advanced" dir="ltr">J(t) = C(t) / E(t)</p>
        <p className="text-[10px] text-slate-600 text-center mode-beginner-only">מדד עומס המערכת</p>
        <p className="text-[10px] text-slate-600 text-center mode-research" dir="ltr">System load observable (capacity/entropy)</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <kbd className="text-[9px] text-slate-700 border border-slate-800 px-1.5 py-0.5 rounded bg-slate-900">⌘K</kbd>
          <span className="text-[9px] text-slate-700">פעולות מהירות</span>
        </div>
      </div>
    </aside>
  )
}

function NavLink({ href, icon: Icon, label, onNavigate }: { href: string; icon: LucideIcon; label: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium min-h-[44px] group ${
        isActive
          ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-[inset_3px_0_0_0_#6366f1]'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/40'
      }`}
      style={{ transition: 'all 180ms cubic-bezier(0.2, 0, 0, 1)' }}
    >
      <Icon className={`w-[18px] h-[18px] shrink-0 stroke-[1.8] transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
      {label}
    </Link>
  )
}
