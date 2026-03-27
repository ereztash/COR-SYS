'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { CommandLauncher } from '@/components/ui/CommandLauncher'
import { UserModeSwitcher } from '@/components/ui/UserModeSwitcher'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStandalone = pathname === '/login' || (pathname?.startsWith('/assess') ?? false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (isStandalone) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:block">
        <Sidebar />
      </aside>
      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="p-2 rounded-lg surface-strong text-white hover:bg-slate-700"
          aria-label="תפריט"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Mobile overlay menu */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="md:hidden fixed top-0 right-0 w-64 h-full bg-slate-900 border-l border-slate-800 z-50 p-6 overflow-y-auto">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </>
      )}
      <main className="flex-1 overflow-auto min-w-0 pt-14 md:pt-0">
        {children}
      </main>
      <UserModeSwitcher />
      <CommandLauncher />
    </div>
  )
}
