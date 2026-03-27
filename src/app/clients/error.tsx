'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[COR-SYS clients error]', error)
  }, [error])

  return (
    <div className="p-6 lg:p-8 min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-sm space-y-4 animate-fade-up">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-white">שגיאה בטעינת לקוחות</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          לא הצלחנו לטעון את רשימת הלקוחות. ייתכן שיש בעיית תקשורת עם שרת הנתונים.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          נסה שוב
        </button>
      </div>
    </div>
  )
}
