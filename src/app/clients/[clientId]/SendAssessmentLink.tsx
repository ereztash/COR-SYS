'use client'

import { useState } from 'react'
import { createAssessment } from '@/lib/actions/assessments'

export function SendAssessmentLink({ clientId }: { clientId: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setLoading(true)
    setError(null)
    setUrl(null)
    const res = await createAssessment(clientId)
    setLoading(false)
    if (res.ok && res.url) {
      setUrl(res.url)
    } else {
      setError(res.error ?? 'שגיאה ביצירת לינק')
    }
  }

  function copyUrl() {
    if (!url) return
    const full = url.startsWith('http') ? url : (typeof window !== 'undefined' ? window.location.origin + url : url)
    navigator.clipboard.writeText(full)
  }

  const displayUrl = url?.startsWith('http') ? url : (typeof window !== 'undefined' ? window.location.origin + (url ?? '') : url ?? '')

  return (
    <div className="bento-card p-5 border-r-4 border-r-cyan-500">
      <h3 className="text-sm font-bold text-slate-300 mb-2">לינק הערכה Self-Serve</h3>
      <p className="text-xs text-slate-500 mb-3">שלח לינק לארגון למלא שאלון אבחון בעצמם</p>
      {!url ? (
        <>
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-sm transition-colors"
          >
            {loading ? 'יוצר...' : 'שלח לינק הערכה'}
          </button>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 uppercase">העתק את הלינק:</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={displayUrl}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 text-xs font-mono"
            />
            <button
              type="button"
              onClick={copyUrl}
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold"
            >
              העתק
            </button>
          </div>
          <button
            type="button"
            onClick={() => setUrl(null)}
            className="text-[10px] text-slate-500 hover:text-slate-400"
          >
            צור לינק חדש
          </button>
        </div>
      )}
    </div>
  )
}
