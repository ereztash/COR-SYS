'use client'

/**
 * InterventionForm — Consultant decision capture (Phase 3)
 *
 * Records which CTA the consultant actually applied, with an optional
 * override reason when it differs from the system recommendation.
 *
 * On submit → 5-second undo window → calls saveIntervention server action
 * → inserts into interventions_and_feedback table
 */

import { useEffect, useRef, useState, useTransition } from 'react'
import { saveIntervention } from '@/lib/actions/cbr'

const UNDO_DELAY_MS = 5000

const CTA_OPTIONS = [
  { value: 'sprint', label: 'Sprint חוסם עורקים — 14 יום' },
  { value: 'retainer', label: 'Resilience Retainer — ליווי שוטף' },
  { value: 'live-demo', label: 'Live Demo אבחוני — חינמי' },
]

interface Props {
  snapshotId: string
  recommendedCta: string
  /**
   * UX convenience: pre-select the CTA the consultant clicked on.
   * The `recommendedCta` remains the system recommendation.
   */
  initialActualCta?: string
  clientId: string
  onSuccess?: (interventionId: string) => void
  onCancel?: () => void
}

export function InterventionForm({
  snapshotId,
  recommendedCta,
  initialActualCta,
  clientId,
  onSuccess,
  onCancel,
}: Props) {
  const [actualCta, setActualCta] = useState(initialActualCta ?? recommendedCta)
  const [overrideReason, setOverrideReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Undo state: countdown after submit, before actual DB write
  const [undoCountdown, setUndoCountdown] = useState<number | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const undoCancelled = useRef(false)

  // When user selects a different "actual" from RecommendationPanel,
  // reset form state so it starts from the intended choice.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setActualCta(initialActualCta ?? recommendedCta)
    setOverrideReason('')
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [recommendedCta, initialActualCta])

  // Cleanup undo timer on unmount
  useEffect(() => () => { if (undoTimer.current) clearTimeout(undoTimer.current) }, [])

  const isOverride = actualCta !== recommendedCta
  const canSubmit = !isOverride || overrideReason.trim().length > 0

  function handleUndo() {
    undoCancelled.current = true
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndoCountdown(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    undoCancelled.current = false

    // Start countdown
    setUndoCountdown(UNDO_DELAY_MS / 1000)
    const interval = setInterval(() => {
      setUndoCountdown(prev => {
        if (prev == null || prev <= 1) { clearInterval(interval); return null }
        return prev - 1
      })
    }, 1000)

    undoTimer.current = setTimeout(() => {
      clearInterval(interval)
      setUndoCountdown(null)
      if (undoCancelled.current) return

      startTransition(async () => {
        const result = await saveIntervention({
          snapshot_id: snapshotId,
          recommended_cta: recommendedCta,
          actual_cta: actualCta,
          override_reason: isOverride ? overrideReason.trim() : null,
          clientId,
        })

        if (!result.ok) {
          setError(result.error ?? 'שגיאה בשמירה')
          return
        }
        if (onSuccess && result.intervention_id) {
          onSuccess(result.intervention_id)
        }
      })
    }, UNDO_DELAY_MS)
  }

  const inputCls =
    'w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Recommended (readonly) */}
      <div>
        <label className="block type-meta mb-1">
          המלצת המערכת
        </label>
        <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-400">
          {CTA_OPTIONS.find((o) => o.value === recommendedCta)?.label ?? recommendedCta}
        </div>
      </div>

      {/* Actual CTA */}
      <div>
        <label className="block type-meta mb-1">
          התערבות שנבחרה
        </label>
        <select
          value={actualCta}
          onChange={(e) => {
            setActualCta(e.target.value)
            setOverrideReason('')
          }}
          className={inputCls}
        >
          {CTA_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Override reason — required when overriding */}
      {isOverride && (
        <div>
          <label className="block type-meta text-yellow-400 mb-1">
            סיבת Override <span className="text-red-400">*</span>
          </label>
          <textarea
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="למה בחרת התערבות שונה מההמלצה? (חשוב לכיול המערכת)"
            rows={3}
            className={`${inputCls} resize-none`}
            required
          />
          <p className="type-meta normal-case text-slate-500 mt-1">
            המידע הזה משמש לכיול Bayesian של המנוע — תודה על הפירוט.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Undo countdown banner */}
      {undoCountdown !== null && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-yellow-950/50 border border-yellow-600/30">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-base">⏳</span>
            <p className="text-xs text-yellow-300 type-kpi">
              שומר בעוד <strong>{undoCountdown}</strong> שניות...
            </p>
          </div>
          <button
            type="button"
            onClick={handleUndo}
            className="text-xs font-bold text-yellow-400 hover:text-yellow-200 border border-yellow-600/40 px-3 py-1 rounded-lg transition-colors"
          >
            בטל (Undo)
          </button>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!canSubmit || isPending || undoCountdown !== null}
          className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm py-2 px-4 rounded-xl transition-colors"
        >
          {isPending ? 'שומר...' : undoCountdown !== null ? `שומר... (${undoCountdown})` : 'שמור התערבות'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={undoCountdown !== null}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-40 transition-colors text-sm"
          >
            ביטול
          </button>
        )}
      </div>
    </form>
  )
}
