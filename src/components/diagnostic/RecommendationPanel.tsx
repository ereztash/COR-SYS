'use client'

/**
 * RecommendationPanel — CBR Recommendation UI (Phase 3)
 *
 * Fetches /api/cbr/recommend/[snapshotId] and renders ranked interventions
 * with Wilson-score confidence badges, loss framing, and λ eigenvalue.
 *
 * Three render states:
 *   loading   — skeleton
 *   cold_start — policy-engine fallback with notice
 *   results   — ranked CBR recommendation cards
 *
 * Loss framing: Kahneman & Tversky (1991) — "עלות אי-פעולה" in header
 */

import { useEffect, useState } from 'react'
import type { RecommendationResult } from '@/types/database'
import { classifyTrajectory } from '@/lib/resilience-formula'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PolicyFallback {
  ctaType: string
  ctaLabelHe: string
  timeToActMonths: number
  rationale: string
}

interface RecommendApiResponse {
  snapshot_id: string
  cold_start: boolean
  recommendations: RecommendationResult[]
  policy_fallback?: PolicyFallback
}

interface Props {
  snapshotId: string
  /** For optional loss framing in query string */
  managers?: number
  hoursPerWeek?: number
  monthlySalary?: number
  /** Called when the consultant clicks "Override" on a recommendation */
  onOverride?: (interventionType: string, recommendedCta: string) => void
}

// ─── Confidence Badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: RecommendationResult['confidence_level'] }) {
  const styles: Record<typeof level, string> = {
    high: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700',
    medium: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
    low: 'bg-red-900/50 text-red-300 border border-red-700',
    insufficient: 'bg-slate-700/50 text-slate-400 border border-slate-600',
  }
  const labels: Record<typeof level, string> = {
    high: 'אמינות גבוהה',
    medium: 'אמינות בינונית',
    low: 'אמינות נמוכה',
    insufficient: 'נתונים לא מספיקים',
  }
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[level]}`}>
      {labels[level]}
    </span>
  )
}

// ─── CTA Label ────────────────────────────────────────────────────────────────

const CTA_LABELS: Record<string, string> = {
  sprint: 'Sprint חוסם עורקים',
  retainer: 'Resilience Retainer',
  'live-demo': 'Live Demo אבחוני',
}

// ─── Trajectory Label ─────────────────────────────────────────────────────────

function lambdaLabel(lambda: number | null): string {
  if (lambda == null) return '—'
  const trajectory = classifyTrajectory(lambda)
  const labels = {
    growth: 'צמיחה',
    stable: 'יציב',
    decay: 'ירידה',
    bifurcation: 'אי-יציבות',
  }
  return `λ=${lambda.toFixed(2)} → ${labels[trajectory]}`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bento-card p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-1/3" />
      <div className="h-20 bg-slate-700/50 rounded" />
      <div className="h-20 bg-slate-700/50 rounded" />
    </div>
  )
}

// ─── Cold Start Notice ────────────────────────────────────────────────────────

function ColdStartCard({ fallback }: { fallback?: PolicyFallback }) {
  return (
    <div className="bento-card p-6 border-t-4 border-slate-600">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase">המלצת התערבות</p>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600">
          מבוסס מדיניות
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4 italic">
        אין מספיק מקרים היסטוריים — ההמלצה מבוססת על כללי מדיניות בלבד.
        הדיוק ישתפר ככל שתצטברו מקרים עם follow-up.
      </p>
      {fallback && (
        <div className="bg-slate-800/60 rounded-xl p-4">
          <p className="text-base font-black text-white mb-1">
            {CTA_LABELS[fallback.ctaType] ?? fallback.ctaType}
          </p>
          <p className="text-xs text-slate-400 mb-2">{fallback.rationale}</p>
          {fallback.timeToActMonths === 0 ? (
            <span className="text-xs font-bold text-red-400">פעולה מיידית נדרשת</span>
          ) : (
            <span className="text-xs text-slate-500">טווח פעולה: {fallback.timeToActMonths} חודשים</span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Recommendation Card ──────────────────────────────────────────────────────

function RecommendationCard({
  rec,
  rank,
  dailyLoss,
  onOverride,
}: {
  rec: RecommendationResult
  rank: number
  dailyLoss: number | null
  onOverride?: () => void
}) {
  const isTopRanked = rank === 0
  return (
    <div className={`bg-slate-800/60 rounded-xl p-4 ${isTopRanked ? 'ring-1 ring-emerald-700' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-black text-white">
            {rank + 1}. {CTA_LABELS[rec.intervention_type] ?? rec.intervention_type}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {rec.supporting_cases} מקרים דומים
          </p>
        </div>
        <ConfidenceBadge level={rec.confidence_level} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-slate-500">אחוז הצלחה</p>
          <p className="text-lg font-black text-white">
            {(rec.success_rate * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-slate-600">Wilson: {rec.wilson_score.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Trajectory</p>
          <p className="text-sm font-bold text-slate-300">{lambdaLabel(rec.avg_lambda)}</p>
          {rec.avg_j_quotient_recovered != null && (
            <p className="text-xs text-slate-600">
              J שוחזר: {(rec.avg_j_quotient_recovered * 100).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {onOverride && (
        <button
          onClick={onOverride}
          className="text-xs text-slate-400 hover:text-white transition-colors mt-1"
        >
          לא מסכים? Override ←
        </button>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RecommendationPanel({
  snapshotId,
  managers,
  hoursPerWeek,
  monthlySalary,
  onOverride,
}: Props) {
  const [data, setData] = useState<RecommendApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetch_() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (managers) params.set('managers', String(managers))
        if (hoursPerWeek) params.set('hours_per_week', String(hoursPerWeek))
        if (monthlySalary) params.set('monthly_salary', String(monthlySalary))

        const res = await fetch(
          `/api/cbr/recommend/${snapshotId}?${params.toString()}`,
          { signal: controller.signal }
        )
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json.error ?? `HTTP ${res.status}`)
        }
        const json: RecommendApiResponse = await res.json()
        setData(json)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError(e instanceof Error ? e.message : 'שגיאה בטעינת המלצות')
        }
      } finally {
        setLoading(false)
      }
    }

    fetch_()
    return () => controller.abort()
  }, [snapshotId, managers, hoursPerWeek, monthlySalary])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="bento-card p-6 border-t-4 border-red-700">
        <p className="text-xs font-bold text-slate-500 uppercase mb-2">המלצת התערבות</p>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const topRec = data.recommendations[0]
  const dailyLoss = topRec?.daily_loss_estimate ?? null

  return (
    <div className="bento-card p-6 border-t-4 border-emerald-700">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase">המלצת התערבות CBR</p>
        {data.cold_start && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600">
            מבוסס מדיניות
          </span>
        )}
      </div>

      {/* Loss frame header */}
      {dailyLoss != null && dailyLoss > 0 && (
        <div className="bg-red-950/40 border border-red-900/60 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs font-bold text-red-400 uppercase mb-0.5">עלות אי-פעולה</p>
          <p className="text-xl font-black text-red-300">
            ₪{Math.round(dailyLoss).toLocaleString('he-IL')}/יום
          </p>
          <p className="text-xs text-red-500 mt-0.5">
            ₪{Math.round(dailyLoss * 30).toLocaleString('he-IL')}/חודש
          </p>
        </div>
      )}

      {data.cold_start ? (
        <ColdStartCard fallback={data.policy_fallback} />
      ) : (
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <RecommendationCard
              key={rec.intervention_type}
              rec={rec}
              rank={i}
              dailyLoss={dailyLoss}
              onOverride={
                onOverride
                  ? () => onOverride(rec.intervention_type, data.recommendations[0]?.intervention_type ?? rec.intervention_type)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
