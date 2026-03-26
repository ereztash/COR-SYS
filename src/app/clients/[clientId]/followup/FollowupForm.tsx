'use client'

/**
 * FollowupForm — client component for entering post-intervention scores.
 * Embedded in the followup server page.
 * On submit → calls saveFollowup server action.
 */

import { useState, useTransition } from 'react'
import { saveFollowup } from '@/lib/actions/cbr'

interface Props {
  interventionId: string
  prevScoreDr: number
  prevPsiScore: number | null
  clientId: string
}

export function FollowupForm({ interventionId, prevScoreDr, prevPsiScore, clientId }: Props) {
  const [newDr, setNewDr] = useState('')
  const [newPsi, setNewPsi] = useState('')
  const [deltaJ, setDeltaJ] = useState('')
  const [deltaEntropy, setDeltaEntropy] = useState('')
  const [result, setResult] = useState<{ learning_gain: number; lambda: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const inputCls =
    'w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const dr = parseFloat(newDr)
    if (isNaN(dr) || dr < 0 || dr > 10) {
      setError('ציון DR חייב להיות בין 0 ל-10')
      return
    }
    setError(null)

    startTransition(async () => {
      const res = await saveFollowup({
        intervention_id: interventionId,
        new_score_dr: dr,
        prev_score_dr: prevScoreDr,
        new_psi_score: newPsi ? parseFloat(newPsi) : null,
        prev_psi_score: prevPsiScore,
        delta_j_quotient: deltaJ ? parseFloat(deltaJ) : null,
        delta_entropy: deltaEntropy ? parseFloat(deltaEntropy) : null,
        clientId,
      })
      if (!res.ok) {
        setError(res.error ?? 'שגיאה בשמירה')
        return
      }
      setResult({ learning_gain: res.learning_gain!, lambda: res.lambda! })
    })
  }

  if (result) {
    const lambdaLabel = result.lambda > 1 ? 'צמיחה' : result.lambda > 0 ? 'יציב/ירידה' : 'אי-יציבות'
    const lgColor = result.learning_gain > 0 ? 'text-emerald-400' : 'text-red-400'
    return (
      <div className="space-y-4">
        <p className="text-sm font-bold text-emerald-400">המדידה נשמרה בהצלחה</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">Learning Gain (LG)</p>
            <p className={`text-2xl font-black ${lgColor}`}>{result.learning_gain.toFixed(3)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Eigenvalue (λ)</p>
            <p className="text-2xl font-black text-white">{result.lambda.toFixed(3)}</p>
            <p className="text-xs text-slate-500">{lambdaLabel}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* New DR score */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            ציון DR חדש (0–10) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={newDr}
            onChange={(e) => setNewDr(e.target.value)}
            placeholder="0.0"
            className={inputCls}
            required
          />
          <p className="text-xs text-slate-600 mt-0.5">baseline: {prevScoreDr.toFixed(1)}</p>
        </div>

        {/* New PSI score */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            PSI חדש (1–7)
          </label>
          <input
            type="number"
            min="1"
            max="7"
            step="0.1"
            value={newPsi}
            onChange={(e) => setNewPsi(e.target.value)}
            placeholder="1.0–7.0"
            className={inputCls}
          />
          <p className="text-xs text-slate-600 mt-0.5">
            baseline: {prevPsiScore != null ? prevPsiScore.toFixed(1) : '—'}
          </p>
        </div>

        {/* Delta J-Quotient */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            ΔJ-Quotient
          </label>
          <input
            type="number"
            step="0.01"
            value={deltaJ}
            onChange={(e) => setDeltaJ(e.target.value)}
            placeholder="שינוי ב-J"
            className={inputCls}
          />
        </div>

        {/* Delta Entropy */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Δ Entropy
          </label>
          <input
            type="number"
            step="0.1"
            value={deltaEntropy}
            onChange={(e) => setDeltaEntropy(e.target.value)}
            placeholder="שינוי באנטרופיה"
            className={inputCls}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending || !newDr}
        className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors"
      >
        {isPending ? 'מחשב...' : 'שמור מדידה וחשב LG + λ'}
      </button>
    </form>
  )
}
