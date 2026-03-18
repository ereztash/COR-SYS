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
          <h1 className="text-2xl font-black text-white mt-2">מדידה חוזרת</h1>
          <p className="text-slate-400 text-sm mt-1">
            הזן ציוני DSM עדכניים למדידת השפעת ההתערבות
          </p>
        </div>

        {/* Intervention Summary */}
        <div className="bento-card p-5 mb-6 border-t-4 border-slate-600">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">פרטי ההתערבות</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs">המלצת מערכת</p>
              <p className="text-white font-medium">
                {CTA_LABELS[intervention.recommended_cta] ?? intervention.recommended_cta}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">התערבות שבוצעה</p>
              <p className={`font-medium ${intervention.consultant_override ? 'text-yellow-400' : 'text-white'}`}>
                {CTA_LABELS[intervention.actual_cta] ?? intervention.actual_cta}
                {intervention.consultant_override && (
                  <span className="text-xs text-yellow-600 ml-1">(override)</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">תאריך התערבות</p>
              <p className="text-white">{formatDate(intervention.created_at)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Snapshot מקורי</p>
              <p className="text-slate-300 text-xs font-mono">{snapshot.snapshot_id.slice(0, 8)}…</p>
            </div>
          </div>

          {/* Original scores */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">ציונים מקוריים (Baseline)</p>
            <div className="flex gap-6 text-sm">
              <span className="text-slate-300">DR: <strong className="text-white">{snapshot.score_dr.toFixed(1)}</strong></span>
              <span className="text-slate-300">ND: <strong className="text-white">{snapshot.score_nd.toFixed(1)}</strong></span>
              <span className="text-slate-300">UC: <strong className="text-white">{snapshot.score_uc.toFixed(1)}</strong></span>
              {snapshot.psi_score != null && (
                <span className="text-slate-300">PSI: <strong className="text-white">{snapshot.psi_score.toFixed(1)}</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Follow-up already exists */}
        {hasFollowup ? (
          <div className="bento-card p-5 border-t-4 border-emerald-700">
            <p className="text-xs font-bold text-emerald-500 uppercase mb-3">תוצאות מדידה קיימות</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Learning Gain (LG)</p>
                <p className="text-white font-black text-lg">
                  {intervention.learning_gain?.toFixed(3) ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Eigenvalue (λ)</p>
                <p className="text-white font-black text-lg">
                  {intervention.lambda_eigenvalue?.toFixed(3) ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">ΔDR</p>
                <p className={`font-bold ${(intervention.delta_dr ?? 0) < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {intervention.delta_dr != null ? (intervention.delta_dr > 0 ? '+' : '') + intervention.delta_dr.toFixed(2) : '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">ΔPSI</p>
                <p className={`font-bold ${(intervention.delta_psi ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {intervention.delta_psi != null ? (intervention.delta_psi > 0 ? '+' : '') + intervention.delta_psi.toFixed(2) : '—'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              מדידה בוצעה: {formatDate(intervention.followup_date!)}
            </p>
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
            />
          </div>
        )}
      </div>
    </div>
  )
}
