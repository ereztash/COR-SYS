'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarLogout } from './SidebarLogout'

export function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  return (
    <aside className="w-56 shrink-0 bg-slate-900/80 border-l border-slate-800 flex flex-col py-6 px-4 sticky top-0 h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">C</div>
          <span className="font-black text-white text-lg" style={{ fontFamily: 'Heebo, sans-serif' }}>COR-SYS</span>
        </div>
        <p className="text-[10px] text-slate-500 mr-9">Deep-Grid v2.2</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <NavLink href="/" icon="⊞" label="דשבורד" onNavigate={onNavigate} />
        <NavLink href="/about" icon="🟣" label="זהות עסקית" onNavigate={onNavigate} />
        <NavLink href="/services" icon="📋" label="שירותים וערוצים" onNavigate={onNavigate} />
        <NavLink href="/clients" icon="👥" label="לקוחות" onNavigate={onNavigate} />
        <NavLink href="/sprints" icon="⚡" label="ספרינטים" onNavigate={onNavigate} />
        <NavLink href="/financials" icon="₪" label="כספים" onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-slate-800 pt-4 mt-4 space-y-1">
        <SidebarLogout />
        <p className="text-[10px] text-slate-600 text-center">J(t) = C(t) / E(t)</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <kbd className="text-[9px] text-slate-700 border border-slate-800 px-1.5 py-0.5 rounded bg-slate-900">⌘K</kbd>
          <span className="text-[9px] text-slate-700">פעולות מהירות</span>
        </div>
      </div>
    </aside>
  )
}

function NavLink({ href, icon, label, onNavigate }: { href: string; icon: string; label: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium min-h-[44px] ${
        isActive
          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  )
}
