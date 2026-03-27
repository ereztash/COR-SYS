'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[COR-SYS error boundary]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-sm space-y-4 animate-fade-up">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-white">משהו השתבש</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          אירעה שגיאה בלתי צפויה. אפשר לנסות שוב או לחזור לדף הראשי.
        </p>
        {error.digest && (
          <p className="text-[10px] text-slate-600 font-mono">
            ref: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            נסה שוב
          </button>
          <a
            href="/"
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-bold transition-colors"
          >
            דף ראשי
          </a>
        </div>
      </div>
    </div>
  )
}
