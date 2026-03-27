'use client'

/**
 * FollowupForm — post-intervention measurement form.
 *
 * PSI mode: "full" (7-item Edmondson scale) or "single" (averaged score).
 * Full mode is preferred — it enables accurate LG computation and closes the
 * SOTA data-completeness gap identified in cbr-research-synthesis.md.
 *
 * Edmondson (1999) PSI items (reverse-scored: 1, 3, 5):
 *   1. If you make a mistake on this team, it is often held against you. (R)
 *   2. Members of this team are able to bring up problems and tough issues.
 *   3. People on this team sometimes reject others for being different. (R)
 *   4. It is safe to take a risk on this team.
 *   5. It is difficult to ask other members of this team for help. (R)
 *   6. No one on this team would deliberately act in a way that undermines my efforts.
 *   7. Working with members of this team, my unique skills and talents are valued.
 */

import { useState, useTransition } from 'react'
import { saveFollowup } from '@/lib/actions/cbr'
import { computePsiScore } from '@/lib/resilience-formula'

// ─── Edmondson PSI items ──────────────────────────────────────────────────────

const PSI_ITEMS = [
  { idx: 1, he: 'אם אעשה טעות בצוות זה, לרוב יחזיקו בה נגדי.', reversed: true },
  { idx: 2, he: 'חברי הצוות יכולים להעלות בעיות ונושאים קשים.', reversed: false },
  { idx: 3, he: 'אנשים בצוות זה לפעמים דוחים אחרים על שהם שונים.', reversed: true },
  { idx: 4, he: 'בטוח לקחת סיכון בצוות זה.', reversed: false },
  { idx: 5, he: 'קשה לבקש עזרה מחברי הצוות.', reversed: true },
  { idx: 6, he: 'אף אחד בצוות לא יפעל במכוון בדרך שתחבל במאמצי.', reversed: false },
  { idx: 7, he: 'בעבודה עם חברי הצוות, הכישורים הייחודיים שלי מוערכים.', reversed: false },
] as const

interface Props {
  interventionId: string
  prevScoreDr: number
  prevPsiScore: number | null
  clientId: string
  actualCta?: string | null
}

type PsiMode = 'full' | 'single'

export function FollowupForm({ interventionId, prevScoreDr, prevPsiScore, clientId, actualCta }: Props) {
  const [newDr, setNewDr] = useState('')
  const [psiMode, setPsiMode] = useState<PsiMode>('full')
  const [psiItems, setPsiItems] = useState<string[]>(Array(7).fill(''))
  const [newPsiSingle, setNewPsiSingle] = useState('')
  const [deltaJ, setDeltaJ] = useState('')
  const [deltaEntropy, setDeltaEntropy] = useState('')
  const [result, setResult] = useState<{ learning_gain: number; lambda: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const inputCls =
    'w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500'

  function resolvePsiScore(): number | null {
    if (psiMode === 'full') {
      const raws = psiItems.map((v) => (v !== '' ? parseFloat(v) : null))
      return computePsiScore(raws)
    }
    return newPsiSingle !== '' ? parseFloat(newPsiSingle) : null
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const dr = parseFloat(newDr)
    if (isNaN(dr) || dr < 0 || dr > 10) {
      setError('ציון DR חייב להיות בין 0 ל-10')
      return
    }

    const psiScore = resolvePsiScore()
    if (psiMode === 'full' && psiScore === null) {
      setError('נא למלא את כל 7 פריטי ה-PSI (1–7 לכל פריט)')
      return
    }

    setError(null)

    startTransition(async () => {
      const res = await saveFollowup({
        intervention_id: interventionId,
        new_score_dr: dr,
        prev_score_dr: prevScoreDr,
        new_psi_score: psiScore,
        prev_psi_score: prevPsiScore,
        delta_j_quotient: deltaJ ? parseFloat(deltaJ) : null,
        delta_entropy: deltaEntropy ? parseFloat(deltaEntropy) : null,
        actual_cta: actualCta ?? null,
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
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* DR score */}
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

      {/* PSI section */}
      <div className="border border-slate-700 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase">
            PSI — Edmondson Psychological Safety
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPsiMode('full')}
              className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${psiMode === 'full' ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
            >
              7 פריטים (מומלץ)
            </button>
            <button
              type="button"
              onClick={() => setPsiMode('single')}
              className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${psiMode === 'single' ? 'bg-slate-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
            >
              ממוצע בלבד
            </button>
          </div>
        </div>

        {psiMode === 'full' ? (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-600">דרג כל פריט 1–7 (1=לא מסכים בכלל, 7=מסכים מאוד)</p>
            {PSI_ITEMS.map((item, i) => (
              <div key={item.idx} className="flex items-start gap-3">
                <span className="text-[10px] text-slate-600 w-4 shrink-0 mt-2">{item.idx}.</span>
                <p className="text-xs text-slate-300 flex-1 leading-relaxed">
                  {item.he}
                  {item.reversed && <span className="text-slate-600 ml-1">(R)</span>}
                </p>
                <input
                  type="number"
                  min="1"
                  max="7"
                  step="1"
                  value={psiItems[i]}
                  onChange={(e) => {
                    const updated = [...psiItems]
                    updated[i] = e.target.value
                    setPsiItems(updated)
                  }}
                  placeholder="1–7"
                  className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-slate-500"
                />
              </div>
            ))}
            <p className="text-[10px] text-slate-600 pt-1">
              baseline PSI: {prevPsiScore != null ? prevPsiScore.toFixed(1) : '—'}
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-slate-500 mb-1">PSI ממוצע חדש (1–7)</label>
            <input
              type="number"
              min="1"
              max="7"
              step="0.1"
              value={newPsiSingle}
              onChange={(e) => setNewPsiSingle(e.target.value)}
              placeholder="1.0–7.0"
              className={inputCls}
            />
            <p className="text-xs text-slate-600 mt-0.5">
              baseline: {prevPsiScore != null ? prevPsiScore.toFixed(1) : '—'}
            </p>
          </div>
        )}
      </div>

      {/* Optional delta fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ΔJ-Quotient</label>
          <input
            type="number"
            step="0.01"
            value={deltaJ}
            onChange={(e) => setDeltaJ(e.target.value)}
            placeholder="שינוי ב-J"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Δ Entropy</label>
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
