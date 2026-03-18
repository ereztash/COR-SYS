'use client'

/**
 * InterventionForm — Consultant decision capture (Phase 3)
 *
 * Records which CTA the consultant actually applied, with an optional
 * override reason when it differs from the system recommendation.
 *
 * On submit → calls saveIntervention server action
 * → inserts into interventions_and_feedback table
 */

import { useState, useTransition } from 'react'
import { saveIntervention } from '@/lib/actions/cbr'

const CTA_OPTIONS = [
  { value: 'sprint', label: 'Sprint חוסם עורקים — 14 יום' },
  { value: 'retainer', label: 'Resilience Retainer — ליווי שוטף' },
  { value: 'live-demo', label: 'Live Demo אבחוני — חינמי' },
]

interface Props {
  snapshotId: string
  recommendedCta: string
  clientId: string
  onSuccess?: (interventionId: string) => void
  onCancel?: () => void
}

export function InterventionForm({
  snapshotId,
  recommendedCta,
  clientId,
  onSuccess,
  onCancel,
}: Props) {
  const [actualCta, setActualCta] = useState(recommendedCta)
  const [overrideReason, setOverrideReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isOverride = actualCta !== recommendedCta
  const canSubmit = !isOverride || overrideReason.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)

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
  }

  const inputCls =
    'w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Recommended (readonly) */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          המלצת המערכת
        </label>
        <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-400">
          {CTA_OPTIONS.find((o) => o.value === recommendedCta)?.label ?? recommendedCta}
        </div>
      </div>

      {/* Actual CTA */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
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
          <label className="block text-xs font-bold text-yellow-500 uppercase mb-1">
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
          <p className="text-xs text-slate-600 mt-1">
            המידע הזה משמש לכיול Bayesian של המנוע — תודה על הפירוט.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!canSubmit || isPending}
          className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm py-2 px-4 rounded-xl transition-colors"
        >
          {isPending ? 'שומר...' : 'שמור התערבות'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm"
          >
            ביטול
          </button>
        )}
      </div>
    </form>
  )
}
