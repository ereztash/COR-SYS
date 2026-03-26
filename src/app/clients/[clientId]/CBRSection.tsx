'use client'

/**
 * CBRSection — wires RecommendationPanel + InterventionForm for client detail page.
 *
 * States:
 *   panel   — shows RecommendationPanel; "Override" button reveals form inline
 *   form    — shows InterventionForm below the panel
 *   saved   — shows success + link to follow-up page
 */

import { useState } from 'react'
import { RecommendationPanel } from '@/components/diagnostic/RecommendationPanel'
import { InterventionForm } from '@/components/forms/InterventionForm'

interface Props {
  snapshotId: string
  clientId: string
  hourlyRate: number | null
  decisionLatencyHours: number | null
}

export function CBRSection({ snapshotId, clientId, hourlyRate, decisionLatencyHours }: Props) {
  const [overrideCtx, setOverrideCtx] = useState<{ actual: string; recommended: string } | null>(null)
  const [savedInterventionId, setSavedInterventionId] = useState<string | null>(null)

  // Rough economic params from client KPIs for loss framing
  const monthlySalary = hourlyRate ? hourlyRate * 160 : 25000
  const hoursPerWeek = decisionLatencyHours ?? 10

  if (savedInterventionId) {
    return (
      <div className="bento-card p-5 border-t-4 border-emerald-700">
        <p className="text-xs font-bold text-emerald-500 uppercase mb-2">התערבות נשמרה</p>
        <p className="text-sm text-slate-300 mb-4">
          ההתערבות נרשמה בהצלחה. צור follow-up לאחר 3–6 חודשים למדידת ΔDR ו-ΔPSI.
        </p>
        <a
          href={`/clients/${clientId}/followup`}
          className="inline-block text-sm bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
        >
          Follow-up (מדידה חוזרת) →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <RecommendationPanel
        snapshotId={snapshotId}
        managers={5}
        hoursPerWeek={hoursPerWeek}
        monthlySalary={monthlySalary}
        onOverride={(actual, recommended) => setOverrideCtx({ actual, recommended })}
      />

      {overrideCtx && (
        <div className="bento-card p-5 border-t-4 border-yellow-600">
          <p className="text-xs font-bold text-yellow-500 uppercase mb-4">רשום התערבות</p>
          <InterventionForm
            snapshotId={snapshotId}
            recommendedCta={overrideCtx.recommended}
            clientId={clientId}
            onSuccess={(id) => setSavedInterventionId(id)}
            onCancel={() => setOverrideCtx(null)}
          />
        </div>
      )}
    </div>
  )
}
