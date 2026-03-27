'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { CommandLauncher } from '@/components/ui/CommandLauncher'
import { UserModeSwitcher } from '@/components/ui/UserModeSwitcher'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStandalone = pathname === '/login' || (pathname?.startsWith('/assess') ?? false)
  const [menuOpen, setMenuOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    hamburgerRef.current?.focus()
  }, [])

  // Focus trap inside the mobile drawer when open
  useEffect(() => {
    if (!menuOpen) return
    const drawer = drawerRef.current
    if (!drawer) return
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length > 0) focusable[0].focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeMenu(); return }
      if (e.key !== 'Tab' || !drawer) return
      const els = drawer.querySelectorAll<HTMLElement>(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
      )
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, closeMenu])

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
          ref={hamburgerRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="p-2 rounded-lg surface-strong text-white hover:bg-slate-700 transition-colors"
          aria-label={menuOpen ? 'סגור תפריט' : 'פתח תפריט'}
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      {/* Mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      {/* Mobile sidebar drawer */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal={menuOpen || undefined}
        aria-label="תפריט ניווט"
        className={`md:hidden fixed top-0 right-0 w-64 h-full bg-slate-900 border-l border-slate-800 z-50 overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <Sidebar onNavigate={closeMenu} />
        </div>
      </div>
      <main className="flex-1 overflow-auto min-w-0 pt-14 md:pt-0">
        <div className="animate-fade-up" key={pathname}>
          {children}
        </div>
      </main>
      <UserModeSwitcher />
      <CommandLauncher />
    </div>
  )
}
