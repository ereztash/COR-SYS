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
import { logUxEvent } from '@/lib/ux-metrics'

interface Props {
  snapshotId: string
  clientId: string
  hourlyRate: number | null
  decisionLatencyHours: number | null
}

export function CBRSection({ snapshotId, clientId, hourlyRate, decisionLatencyHours }: Props) {
  const [overrideCtx, setOverrideCtx] = useState<{ actual: string; recommended: string } | null>(null)
  const [savedInterventionId, setSavedInterventionId] = useState<string | null>(null)
  const [primaryCta, setPrimaryCta] = useState<string | null>(null)

  // Rough economic params from client KPIs for loss framing
  const monthlySalary = hourlyRate ? hourlyRate * 160 : 25000
  const hoursPerWeek = decisionLatencyHours ?? 10

  if (savedInterventionId) {
    return (
      <div className="bento-card p-5 border-t-4 border-emerald-700">
        <p className="type-meta text-emerald-400 mb-2">התערבות נשמרה</p>
        <p className="type-body text-slate-300 mb-4">
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
        onPrimaryReady={(cta) => setPrimaryCta(cta)}
        onOverride={(actual, recommended) => setOverrideCtx({ actual, recommended })}
      />

      {primaryCta && !overrideCtx && (
        <div className="bento-card p-4 border-t-4 border-emerald-700">
          <p className="type-meta text-emerald-400 mb-2">ביצוע מיידי</p>
          <p className="type-body text-slate-300 mb-3">
            רוצה להפוך את ההמלצה המובילה לפעולה עכשיו? נפתח טופס התערבות עם ברירת מחדל של ההמלצה.
          </p>
          <button
            type="button"
            onClick={() => setOverrideCtx({ actual: primaryCta, recommended: primaryCta })}
            className="text-sm bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
          >
            בצע המלצה מובילה עכשיו →
          </button>
        </div>
      )}

      {overrideCtx && (
        <div className="bento-card p-5 border-t-4 border-yellow-600">
          <p className="type-meta text-yellow-400 mb-4">רשום התערבות</p>
          <InterventionForm
            snapshotId={snapshotId}
            recommendedCta={overrideCtx.recommended}
            initialActualCta={overrideCtx.actual}
            clientId={clientId}
            onSuccess={(id) => { setSavedInterventionId(id); logUxEvent({ name: 'intervention_saved', ts: Date.now(), data: { clientId, interventionId: id } }) }}
            onCancel={() => setOverrideCtx(null)}
          />
        </div>
      )}
    </div>
  )
}
