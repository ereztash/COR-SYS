'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import Link from 'next/link'

export default function ClientDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[COR-SYS client detail error]', error)
  }, [error])

  return (
    <div className="p-6 lg:p-8 min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-sm space-y-4 animate-fade-up">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-white">שגיאה בטעינת דף לקוח</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          לא הצלחנו לטעון את פרטי הלקוח. ייתכן שהלקוח לא קיים או שיש בעיית תקשורת.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            נסה שוב
          </button>
          <Link
            href="/clients"
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-bold transition-colors"
          >
            חזרה לרשימה
          </Link>
        </div>
      </div>
    </div>
  )
}
