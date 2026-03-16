import React from 'react'
import { NextResponse } from 'next/server'
import { getClientById, getPlanByClientId } from '@/lib/data'
import type { QuestionnaireAnswer } from '@/lib/corsys-questionnaire'
import { computeDiagnostic } from '@/lib/diagnostic'
import { renderToBuffer } from '@react-pdf/renderer'
import { PlanReport } from '@/components/pdf/PlanReport'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await context.params
  const [client, plan] = await Promise.all([
    getClientById(clientId),
    getPlanByClientId(clientId),
  ])
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }
  const answers = (plan?.questionnaire_response ?? {}) as QuestionnaireAnswer
  const { planResult, dsmDiagnosis, interventionProtocols } = computeDiagnostic(client.name, answers)

  const doc = (
    <PlanReport
      clientName={client.name}
      summary={planResult.summary}
      entropyScore={planResult.entropyScore}
      diagnosisParagraph={planResult.dynamicSummary.diagnosisParagraph}
      ctaParagraph={planResult.dynamicSummary.ctaParagraph}
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
    />
  )

  try {
    const buffer = await renderToBuffer(doc)
    return new NextResponse(buffer, {
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
