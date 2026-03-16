'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '../layout'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStandalone = pathname === '/login' || pathname?.startsWith('/assess') ?? false

  if (isStandalone) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
