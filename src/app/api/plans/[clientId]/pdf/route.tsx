import React from 'react'
import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api/require-user'
import { getClientById, getPlanByClientId } from '@/lib/data'
import type { QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { computeDiagnostic } from '@/lib/diagnostic'
import { HORIZON_LABELS, PATHOLOGY_TYPE_LABELS } from '@/lib/diagnostic/action-plan'
import { renderToBuffer } from '@react-pdf/renderer'
import { PlanReport } from '@/components/pdf/PlanReport'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ clientId: string }> }
) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response

  const { clientId } = await context.params
  const [client, plan] = await Promise.all([
    getClientById(clientId),
    getPlanByClientId(clientId),
  ])
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }
  const answers = (plan?.questionnaire_response ?? {}) as QuestionnaireAnswer
  const { planResult, dsmDiagnosis, orgPathology, interventionProtocols, unifiedTreatmentPlan, ignition } =
    computeDiagnostic(client.name, answers, client)

  const ignitionParagraph =
    planResult.dynamicSummary.ignitionParagraph ??
    (ignition ? `${ignition.narrativeHe}\n\nצעד ראשון: ${ignition.firstMoveHe}` : null)

  const doc = (
    <PlanReport
      clientName={client.name}
      summary={planResult.summary}
      entropyScore={planResult.entropyScore}
      diagnosisParagraph={planResult.dynamicSummary.diagnosisParagraph}
      ctaParagraph={planResult.dynamicSummary.ctaParagraph}
      ignitionParagraph={ignitionParagraph}
      codes={dsmDiagnosis.codes}
      pathologies={dsmDiagnosis.pathologies.map((p) => ({
        code: p.code,
        nameHe: p.nameHe,
        score: p.score,
      }))}
      protocols={interventionProtocols.map((p) => ({
        nameHe: p.nameHe,
        phase: p.phase,
        components: p.components,
      }))}
      dsmOrgTypeLabelHe={PATHOLOGY_TYPE_LABELS[orgPathology.primaryType]}
      unifiedPlan={{
        narrative_primary_he: unifiedTreatmentPlan.narrative_primary_he,
        items: unifiedTreatmentPlan.items.map((it) => ({
          title_he: it.title_he,
          horizon: HORIZON_LABELS[it.horizon],
          what_he: it.what_he,
          metric_he: it.metric_he,
          sequencing_locked: it.sequencing_locked,
          sequencing_lock_reason_he: it.sequencing_lock_reason_he,
        })),
      }}
    />
  )

  try {
    const buffer = await renderToBuffer(doc)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="corsys-plan-${clientId.slice(0, 8)}.pdf"`,
      },
    })
  } catch (e) {
    console.error('[api/plans/pdf]', e)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
