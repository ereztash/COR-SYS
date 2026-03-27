/**
 * Follow-up Measurement Page — /clients/[clientId]/followup
 *
 * Allows the consultant to enter post-intervention DSM scores and PSI
 * to measure whether the intervention moved the needle.
 *
 * On submit: auto-computes LG = 0.571(-ΔDR) + 0.429(ΔPSI) and λ = 1 + κ×LG
 * and updates the interventions_and_feedback row.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLatestInterventionForClient } from '@/lib/data'
import { FollowupForm } from './FollowupForm'
import { formatDate } from '@/lib/utils'
import { DecisionSpine } from '@/components/ui/DecisionSpine'
import { buildDecisionSpineData } from '@/lib/decision-spine-builder'
import { ModeBlurb } from '@/components/ui/ModeBlurb'

export const dynamic = 'force-dynamic'

export default async function FollowupPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const data = await getLatestInterventionForClient(clientId)

  if (!data) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Link href={`/clients/${clientId}`} className="text-slate-400 hover:text-white text-sm">
          ← חזרה ללקוח
        </Link>
        <div className="bento-card p-8 mt-6 text-center">
          <p className="text-slate-400 text-sm">
            אין נתוני CBR עבור לקוח זה עדיין.
          </p>
          <p className="text-slate-600 text-xs mt-2">
            צור snapshot אבחוני דרך לוח הלקוח כדי להתחיל את מעקב ההתערבויות.
          </p>
        </div>
      </div>
    )
  }

  const { snapshot, intervention } = data

  // Build Decision Spine from snapshot (no golden_questions on this page — use raw scores)
  const spineData = buildDecisionSpineData(clientId, snapshot, {})

  const CTA_LABELS: Record<string, string> = {
    sprint: 'Sprint חוסם עורקים',
    retainer: 'Resilience Retainer',
    'live-demo': 'Live Demo אבחוני',
  }

  const hasFollowup = intervention.followup_date != null

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href={`/clients/${clientId}`} className="text-slate-400 hover:text-white text-sm transition-colors">
            ← חזרה ללקוח
          </Link>
          <h1 className="type-h1 text-white mt-2">מדידה חוזרת</h1>
          <p className="type-body text-slate-400 mt-1">
            הזן ציוני DSM עדכניים למדידת השפעת ההתערבות
          </p>
          <ModeBlurb
            className="mt-2"
            beginner="כאן בודקים אם הפעולה שעשיתם באמת שיפרה את המצב."
            advanced="Post-intervention measurement screen for effect validation and learning."
            research="Follow-up observation layer for outcome attribution and loop classification."
          />
        </div>

        {/* Decision Spine */}
        {spineData && (
          <DecisionSpine data={spineData} className="mb-6" />
        )}

        {/* Intervention Summary */}
        <div className="bento-card p-5 mb-6 border-t-4 border-slate-600">
          <p className="type-meta mb-3">פרטי ההתערבות</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="type-meta normal-case">המלצת מערכת</p>
              <p className="text-white font-medium">
                {CTA_LABELS[intervention.recommended_cta] ?? intervention.recommended_cta}
              </p>
            </div>
            <div>
              <p className="type-meta normal-case">התערבות שבוצעה</p>
              <p className={`font-medium ${intervention.consultant_override ? 'text-yellow-400' : 'text-white'}`}>
                {CTA_LABELS[intervention.actual_cta] ?? intervention.actual_cta}
                {intervention.consultant_override && (
                  <span className="text-xs text-yellow-600 ml-1">(override)</span>
                )}
              </p>
            </div>
            <div>
              <p className="type-meta normal-case">תאריך התערבות</p>
              <p className="text-white">{formatDate(intervention.created_at)}</p>
            </div>
            <div>
              <p className="type-meta normal-case">Snapshot מקורי</p>
              <p className="text-slate-300 text-xs type-kpi">{snapshot.snapshot_id.slice(0, 8)}…</p>
            </div>
          </div>

          {/* Original scores */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="type-meta mb-2">ציונים מקוריים (Baseline)</p>
            <div className="flex gap-6 text-sm">
              <span className="text-slate-300 type-kpi">DR: <strong className="text-white">{snapshot.score_dr.toFixed(1)}</strong></span>
              <span className="text-slate-300 type-kpi">ND: <strong className="text-white">{snapshot.score_nd.toFixed(1)}</strong></span>
              <span className="text-slate-300 type-kpi">UC: <strong className="text-white">{snapshot.score_uc.toFixed(1)}</strong></span>
              {snapshot.psi_score != null && (
                <span className="text-slate-300 type-kpi">PSI: <strong className="text-white">{snapshot.psi_score.toFixed(1)}</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Follow-up already exists */}
        {hasFollowup ? (
          <div className="bento-card p-5 border-t-4 border-emerald-700">
            <p className="type-meta text-emerald-400 mb-3">תוצאות מדידה קיימות</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="type-meta normal-case">Learning Gain (LG)</p>
                <p className="text-white font-black text-lg type-kpi">
                  {intervention.learning_gain?.toFixed(3) ?? '—'}
                </p>
              </div>
              <div>
                <p className="type-meta normal-case">Eigenvalue (λ)</p>
                <p className="text-white font-black text-lg type-kpi">
                  {intervention.lambda_eigenvalue?.toFixed(3) ?? '—'}
                </p>
              </div>
              <div>
                <p className="type-meta normal-case">ΔDR</p>
                <p className={`font-bold type-kpi ${(intervention.delta_dr ?? 0) < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {intervention.delta_dr != null ? (intervention.delta_dr > 0 ? '+' : '') + intervention.delta_dr.toFixed(2) : '—'}
                </p>
              </div>
              <div>
                <p className="type-meta normal-case">ΔPSI</p>
                <p className={`font-bold type-kpi ${(intervention.delta_psi ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {intervention.delta_psi != null ? (intervention.delta_psi > 0 ? '+' : '') + intervention.delta_psi.toFixed(2) : '—'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              מדידה בוצעה: {formatDate(intervention.followup_date!)}
            </p>

            {/* Learning loop insight */}
            {intervention.learning_gain != null && (
              <div className={`mt-4 pt-4 border-t border-slate-700 rounded-xl p-3 ${
                intervention.learning_gain > 0.1
                  ? 'bg-emerald-950/30 border border-emerald-700/20'
                  : intervention.learning_gain < -0.05
                    ? 'bg-red-950/30 border border-red-700/20'
                    : 'bg-slate-800/40 border border-slate-700/20'
              }`}>
                <p className="type-meta mb-1">תובנת לולאת למידה</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {intervention.learning_gain > 0.1
                    ? `LG=${intervention.learning_gain.toFixed(3)} — ההתערבות הניבה שיפור משמעותי. λ=${intervention.lambda_eigenvalue?.toFixed(3) ?? '—'} מצביע על ${(intervention.lambda_eigenvalue ?? 1) > 1 ? 'מסלול צמיחה' : 'יציבות'}. המלצה: המשך עם אותה גישה.`
                    : intervention.learning_gain < -0.05
                      ? `LG=${intervention.learning_gain.toFixed(3)} — ההתערבות לא הניבה שיפור. שקול לבחון מחדש את הגישה ולאסוף אבחון עדכני.`
                      : `LG=${intervention.learning_gain.toFixed(3)} — שיפור מינורי. ממשיך לאסוף נתונים לכיול מדויק יותר.`}
                </p>
                {intervention.consultant_override && (
                  <p className="text-[10px] text-yellow-600 mt-1">
                    ⚠ ההתערבות הייתה override — תוצאה זו מכיילת את המנוע לפרופיל דומה.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bento-card p-6">
            <p className="text-xs font-bold text-slate-500 uppercase mb-4">
              ציוני DSM עדכניים (Post-Intervention)
            </p>
            <FollowupForm
              interventionId={intervention.intervention_id}
              prevScoreDr={snapshot.score_dr}
              prevPsiScore={snapshot.psi_score}
              clientId={clientId}
              actualCta={intervention.actual_cta}
            />
          </div>
        )}
      </div>
    </div>
  )
}
