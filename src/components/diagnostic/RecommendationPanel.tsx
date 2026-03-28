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

import { useEffect, useRef, useState } from 'react'
import type { RecommendationResult } from '@/types/database'
import type { GoldenQuestionAnswers } from '@/lib/dsm-policy-engine'
import { classifyTrajectory } from '@/lib/resilience-formula'
import { ModeBlurb } from '@/components/ui/ModeBlurb'
import { logUxEvent } from '@/lib/ux-metrics'
import { getStrongestCases } from '@/lib/calibration-cases'
import { OSINT_DISCLAIMER_SHORT } from '@/lib/osint-display-policy'

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
  similarity_method?: string
  recommendations: RecommendationResult[]
  golden_questions?: GoldenQuestionAnswers
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
  /** Called when top recommendation is available for direct execution UX */
  onPrimaryReady?: (interventionType: string) => void
}

// ─── Confidence Badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: RecommendationResult['confidence_level'] }) {
  const styles: Record<typeof level, string> = {
    high: 'status-success',
    medium: 'status-warning',
    low: 'status-danger',
    insufficient: 'status-info',
  }
  const labels: Record<typeof level, string> = {
    high: 'אמינות גבוהה',
    medium: 'אמינות בינונית',
    low: 'אמינות נמוכה',
    insufficient: 'נתונים לא מספיקים',
  }
  return (
    <span className={`status-badge ${styles[level]}`}>
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

function tomorrowActions(rec: RecommendationResult, isTopRanked: boolean): string[] {
  const actions: string[] = []
  if (isTopRanked) actions.push('לקבוע בעלים אחד להתערבות הזו כבר היום.')
  actions.push('להגדיר מדד הצלחה אחד לשבועיים הקרובים (לדוגמה: זמן החלטה או עומס אישורים).')
  if (rec.confidence_level === 'low' || rec.confidence_level === 'insufficient') {
    actions.push('לאסוף עוד נתון Follow-up אחד כדי לשפר את הדיוק לפני הסלמה.')
  } else {
    actions.push('להתחיל פיילוט קטן בצוות אחד ולבדוק תוצאה אחרי 14 יום.')
  }
  return actions
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

// ─── Insight Sentence ─────────────────────────────────────────────────────────
// Generates a 1-sentence "So What / Now What" summary from recommendation data.

function buildInsightSentence(rec: RecommendationResult, rank: number, dailyLoss: number | null): string {
  const successPct = Math.round(rec.success_rate * 100)
  const cta = CTA_LABELS[rec.intervention_type] ?? rec.intervention_type
  const trajectory = rec.avg_lambda != null ? classifyTrajectory(rec.avg_lambda) : null

  // Insufficient data → guide toward more data collection
  if (rec.confidence_level === 'insufficient' || rec.supporting_cases < 2) {
    return `רק ${rec.supporting_cases} מקרה דומה — הדיוק ישתפר לאחר מדידת follow-up נוספת. ממשיך עם כלל מדיניות.`
  }

  // Low confidence → caution
  if (rec.confidence_level === 'low') {
    return `${successPct}% הצלחה על ${rec.supporting_cases} מקרים — אמינות נמוכה. שקול לאסוף עוד נתוני follow-up לפני ביצוע.`
  }

  // Build trajectory phrase
  const trajectoryPhrase = trajectory === 'growth'
    ? 'ארגונים עם פרופיל דומה הראו שיפור מתמשך'
    : trajectory === 'decay'
      ? 'הנתיב הנוכחי מראה ירידה — פעולה דחופה'
      : trajectory === 'bifurcation'
        ? 'מצב אי-יציבות — ההתערבות קריטית לייצוב'
        : 'מסלול יציב עם פוטנציאל שיפור'

  // Build loss phrase
  const lossPhrase = dailyLoss != null && dailyLoss > 0 && rank === 0
    ? ` כל יום ללא פעולה = ₪${Math.round(dailyLoss).toLocaleString('he-IL')} אבוד.`
    : ''

  return `${cta}: ${successPct}% הצלחה על ${rec.supporting_cases} מקרים דומים — ${trajectoryPhrase}.${lossPhrase}`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div
      className="bento-card p-6 space-y-4 animate-pulse"
      role="status"
      aria-busy="true"
      aria-label="טוען המלצות"
    >
      <div className="h-4 bg-slate-700 rounded w-1/3" />
      <div className="h-20 bg-slate-700/50 rounded" />
      <div className="h-20 bg-slate-700/50 rounded" />
    </div>
  )
}

// ─── Cold Start Notice ────────────────────────────────────────────────────────

function ColdStartCard({ fallback }: { fallback?: PolicyFallback }) {
  const topCases = getStrongestCases().slice(0, 3)

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
        <div className="bg-slate-800/60 rounded-xl p-4 mb-4">
          <p className="text-base font-black text-white mb-1">
            {CTA_LABELS[fallback.ctaType] ?? fallback.ctaType}
          </p>
          <p className="text-xs text-slate-400 mb-2">{fallback.rationale}</p>
          {fallback.timeToActMonths === 0 ? (
            <span className="text-xs font-bold text-intent-danger">פעולה מיידית נדרשת</span>
          ) : (
            <span className="text-xs text-slate-500">טווח פעולה: {fallback.timeToActMonths} חודשים</span>
          )}
        </div>
      )}

      {topCases.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/35 px-4 py-3">
          <p className="type-meta mb-2">למה מדידה חוזרת חשובה — דוגמאות ציבוריות</p>
          <div className="space-y-2">
            {topCases.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="text-slate-500 shrink-0">{c.company}</span>
                <span className="text-slate-600">—</span>
                <span>{c.kpis[0]} שימש כנקודת בקרה חוזרת לאורך {c.period}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-2 italic">{OSINT_DISCLAIMER_SHORT}</p>
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
  similarityMethod,
  onOverride,
}: {
  rec: RecommendationResult
  rank: number
  dailyLoss: number | null
  similarityMethod?: string
  onOverride?: () => void
}) {
  const isTopRanked = rank === 0
  const insight = buildInsightSentence(rec, rank, dailyLoss)
  const actions = tomorrowActions(rec, isTopRanked)
  const boldnessTone =
    rec.recommendation_boldness === 'bold'
      ? 'text-intent-danger'
      : rec.recommendation_boldness === 'balanced'
        ? 'text-intent-warning'
        : 'text-intent-success'

  return (
    <div className={`bg-slate-800/60 rounded-xl p-4 ${isTopRanked ? 'ring-1 ring-slate-600' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-black text-white">
            {rank + 1}. {CTA_LABELS[rec.intervention_type] ?? rec.intervention_type}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {rec.supporting_cases} מקרים דומים
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ConfidenceBadge level={rec.confidence_level} />
          {rec.recommendation_boldness && (
            <span className={`text-[10px] font-bold ${boldnessTone}`}>
              {rec.recommendation_boldness.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Insight sentence */}
      <p className={`text-xs leading-relaxed mb-3 px-3 py-2 rounded-lg ${
        isTopRanked
          ? 'bg-slate-900/50 text-slate-100 border border-slate-600/40'
          : 'bg-slate-700/40 text-slate-300 border border-slate-700/30'
      }`}>
        {insight}
      </p>

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
          {rec.avg_eoc_score != null && (
            <p className="text-xs text-slate-500">
              EoC: {rec.avg_eoc_score.toFixed(2)} · {rec.recommendation_boldness ?? 'balanced'}
            </p>
          )}
          {rec.avg_j_quotient_recovered != null && (
            <p className="text-xs text-slate-600">
              J שוחזר: {(rec.avg_j_quotient_recovered * 100).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {/* Why this recommendation (trust + auditability) */}
      <div className="rounded-lg bg-slate-900/45 border border-slate-700/60 px-3 py-2 mb-2">
        <p className="type-meta mb-1">למה זו ההמלצה</p>
        <ul className="text-[11px] text-slate-300 space-y-0.5 leading-relaxed">
          <li>• {(rec.success_rate * 100).toFixed(0)}% הצלחה על {rec.supporting_cases} מקרים דומים.</li>
          <li>• אמינות סטטיסטית (Wilson): {rec.wilson_score.toFixed(2)}.</li>
          {similarityMethod ? <li>• שיטת דמיון: {similarityMethod}.</li> : null}
          <li>• מסלול תוצאה: {lambdaLabel(rec.avg_lambda)}.</li>
        </ul>
      </div>

      {isTopRanked && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2 mb-2">
          <p className="text-[11px] text-slate-300">
            חלון פעולה: {rec.avg_eoc_score != null && rec.avg_eoc_score >= 0.75 ? 'רגיש לשינוי — מומלץ מהלך נועז ומבוקר' : 'דרוש מהלך מדורג עם מדידת follow-up מהירה'}
          </p>
        </div>
      )}

      <div className="rounded-lg border border-slate-700/50 bg-slate-900/35 px-3 py-2 mb-2">
        <p className="type-meta mb-1">מה עושים מחר בבוקר</p>
        <ul className="text-[11px] text-slate-300 space-y-0.5 leading-relaxed">
          {actions.map((action) => (
            <li key={action}>• {action}</li>
          ))}
        </ul>
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

// ─── Golden Questions (structured decision insights) ─────────────────────

function GoldenQuestionsGrid({ golden }: { golden: GoldenQuestionAnswers }) {
  const urgency = golden.economicImpact.urgencySignal
  const urgencyMap: Record<typeof urgency, { border: string; text: string; bg: string }> = {
    critical: { border: 'border-slate-600/40', text: 'text-intent-danger', bg: 'bg-slate-900/40' },
    elevated: { border: 'border-slate-600/40', text: 'text-intent-warning', bg: 'bg-slate-900/40' },
    moderate: { border: 'border-slate-600/40', text: 'text-intent-success', bg: 'bg-slate-900/40' },
  }
  const u = urgencyMap[urgency]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div className="bento-card p-4 border-t-4 border-slate-600">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">מצב ה-DSM</p>
        <p className="text-sm text-white font-bold mb-2">
          {golden.systemState.profile}
          {' · '}
          {golden.systemState.primaryPathology}
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">{golden.systemState.narrativeHe}</p>
        <p className="mt-3 text-[10px] text-slate-600 font-mono">
          קודים: {golden.systemState.codes.join(', ')}
        </p>
      </div>

      <div className="bento-card p-4 border-t-4 border-slate-600">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">צוואר בקבוק</p>
        <p className="text-sm text-white font-bold mb-2">
          {golden.bottleneck.pathologyCode} · רמה {golden.bottleneck.level}
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">{golden.bottleneck.bottleneckNarrativeHe}</p>
        <p className="mt-3 text-[10px] text-slate-600">
          קשרים פעילים: {golden.bottleneck.activeComorbidities.length > 0 ? golden.bottleneck.activeComorbidities.join('; ') : '—'}
        </p>
      </div>

      <div className={`md:col-span-2 bento-card p-4 border-t-4 ${u.border} ${u.bg}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] text-slate-200 uppercase tracking-widest mb-2">השפעה כלכלית</p>
            <p className={`text-sm font-bold ${u.text}`}>
              דחיפות: {golden.economicImpact.urgencySignal}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${u.border} ${u.text}`}>
            J={golden.economicImpact.jQuotient.toFixed(2)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest">שבועית</p>
            <p className="text-sm font-black text-white">
              ₪{Math.round(golden.economicImpact.weeklyWasteILS).toLocaleString('he-IL')}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest">שנתית</p>
            <p className="text-sm font-black text-white">
              ₪{Math.round(golden.economicImpact.annualWasteILS).toLocaleString('he-IL')}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-200 leading-relaxed">{golden.economicImpact.jInterpretationHe}</p>
      </div>

      <div className="bento-card p-4 border-t-4 border-slate-600 md:col-span-2">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">מהלך התערבות מומלץ</p>
        <p className="text-sm text-white font-bold mb-2">
          {golden.recommendedAction.ctaLabelHe}
        </p>
        <p className="text-xs text-slate-300 mb-2">
          {golden.recommendedAction.timeToActMonths === 0
            ? 'פעולה מיידית נדרשת'
            : `טווח פעולה: ${golden.recommendedAction.timeToActMonths} חודשים`}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">{golden.recommendedAction.rationale}</p>
      </div>
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
  onPrimaryReady,
}: Props) {
  const [data, setData] = useState<RecommendApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const primaryNotifiedRef = useRef<string | null>(null)

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
        if (json.cold_start) {
          logUxEvent({ name: 'cbr_cold_start_shown', ts: Date.now(), data: { snapshotId } })
        }
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

  const topIntervention = data?.recommendations?.[0]?.intervention_type
  useEffect(() => {
    if (!topIntervention || !onPrimaryReady) return
    if (primaryNotifiedRef.current === topIntervention) return
    primaryNotifiedRef.current = topIntervention
    onPrimaryReady(topIntervention)
  }, [topIntervention, onPrimaryReady])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="bento-card p-6 border-t-4 border-slate-600">
        <p className="text-xs font-bold text-slate-500 uppercase mb-2">המלצת התערבות</p>
        <p className="text-sm text-intent-danger">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const topRec = data.recommendations[0]
  const dailyLoss =
    topRec?.daily_loss_estimate ??
    (data.golden_questions ? data.golden_questions.economicImpact.weeklyWasteILS / 7 : null)

  return (
    <div className="bento-card p-6 border-t-4 border-slate-600">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="type-meta">המלצת התערבות CBR</p>
        <div className="flex items-center gap-2">
          {/* Method badge — Trust UX */}
          {data.similarity_method && !data.cold_start && (
            <span className="status-badge status-info type-kpi normal-case">
              {data.similarity_method}
            </span>
          )}
          {data.cold_start ? (
            <span className="status-badge border border-slate-600 text-slate-300 bg-slate-800/70">
              מבוסס מדיניות
            </span>
          ) : (
            <span className="status-badge status-success">
              CBR · {data.recommendations.length} המלצות
            </span>
          )}
        </div>
      </div>
      <ModeBlurb
        className="mb-4"
        beginner="המערכת מציעה את הצעד הבא לפי מקרים דומים ומה הצליח בהם."
        advanced="Case-based intervention ranking with confidence and trajectory context."
        research="CBR output layer: conservative ranking, dynamics signal, and executable probes."
      />

      {/* Loss frame header */}
      {dailyLoss != null && dailyLoss > 0 && (
        <div className="panel-dr rounded-xl px-4 py-3 mb-4">
          <p className="type-meta text-intent-danger mb-0.5">עלות אי-פעולה</p>
          <p className="text-xl font-black text-intent-danger type-kpi">
            ₪{Math.round(dailyLoss).toLocaleString('he-IL')}/יום
          </p>
          <p className="text-xs text-intent-danger mt-0.5 type-kpi">
            ₪{Math.round(dailyLoss * 30).toLocaleString('he-IL')}/חודש
          </p>
        </div>
      )}

      {data.golden_questions && <GoldenQuestionsGrid golden={data.golden_questions} />}

      <div className="rounded-xl border border-slate-700/50 bg-slate-900/35 px-4 py-3 mb-4 mode-beginner-only">
        <p className="type-meta mb-2">מילון קצר (בלי ז'רגון)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
          <p><span className="text-slate-400">Wilson:</span> כמה אפשר לסמוך על ההמלצה לפי כמות ואיכות המקרים.</p>
          <p><span className="text-slate-400">EoC:</span> כמה הארגון "רגיש לשינוי" כרגע.</p>
          <p><span className="text-slate-400">Trajectory:</span> הכיוון הכללי של המערכת (משתפרת/נתקעת/נחלשת).</p>
          <p><span className="text-slate-400">Follow-up:</span> מדידה חוזרת אחרי ההתערבות כדי לאמת תוצאה.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-900/35 px-4 py-3 mb-4 mode-research">
        <p className="type-meta mb-2">Research Lens</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
          <p><span className="text-slate-400">Ranking:</span> Wilson lower bound + EoC bias modifier.</p>
          <p><span className="text-slate-400">Confidence:</span> Derived from conservative interval thresholds, not raw success rate.</p>
          <p><span className="text-slate-400">Trajectory:</span> λ class from resilience dynamics (growth/stable/decay/bifurcation).</p>
          <p><span className="text-slate-400">Actionability:</span> "Tomorrow" tasks convert recommendation into measurable 14-day probes.</p>
        </div>
      </div>

      {data.recommendations.length > 0 && (
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <RecommendationCard
              key={rec.intervention_type}
              rec={rec}
              rank={i}
              dailyLoss={dailyLoss}
              similarityMethod={data.similarity_method}
              onOverride={
                onOverride
                  ? () => onOverride(rec.intervention_type, data.recommendations[0]?.intervention_type ?? rec.intervention_type)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {data.cold_start && data.recommendations.length === 0 && (
        <ColdStartCard fallback={data.policy_fallback} />
      )}
    </div>
  )
}
