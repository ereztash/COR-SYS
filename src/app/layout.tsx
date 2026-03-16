import type { Metadata } from 'next'
import './globals.css'
import { SidebarLogout } from './components/SidebarLogout'
import { LayoutShell } from './components/LayoutShell'

export const metadata: Metadata = {
  title: 'COR-SYS | Executive Dashboard',
  description: 'מערכת ניהול ייעוץ אישית',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;600;700;800&family=Heebo:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#0f172a] text-slate-200 font-[Assistant,sans-serif]">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}

export function Sidebar() {
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
        <NavLink href="/" icon="⊞" label="דשבורד" />
        <NavLink href="/about" icon="🟣" label="זהות עסקית" />
        <NavLink href="/services" icon="📋" label="שירותים וערוצים" />
        <NavLink href="/clients" icon="👥" label="לקוחות" />
        <NavLink href="/sprints" icon="⚡" label="ספרינטים" />
        <NavLink href="/financials" icon="₪" label="כספים" />
      </nav>

      <div className="border-t border-slate-800 pt-4 mt-4 space-y-1">
        <SidebarLogout />
        <p className="text-[10px] text-slate-600 text-center">J(t) = C(t) / E(t)</p>
      </div>
    </aside>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium"
    >
      <span className="text-base">{icon}</span>
      {label}
    </a>
  )
}
