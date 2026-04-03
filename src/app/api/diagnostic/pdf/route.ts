/**
 * POST /api/diagnostic/pdf
 *
 * Accepts diagnostic result JSON, returns a PDF binary.
 * Invokes scripts/generate_diagnostic_pdf.py via execSync.
 *
 * Body shape: DiagnosticPdfInput
 */

import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import path from 'path'
import { createClient } from '@/lib/supabase/server'

export interface DiagnosticPdfInput {
  clientName: string
  profile: string
  pathologyType: string
  pathologyTypeLabel: string
  scores: { dr: number; nd: number; uc: number }
  confidence?: number
  tam?: { t: number; a: number; m: number }
  teamSize: number
  hourlyRate: number
  roi: number
  protocol?: { protocol: string; successKpi: string }
  plan: Array<{
    axis: string
    horizon: string
    title_he: string
    what_he: string
    metric_he: string
  }>
  comorbidities: Array<{ downstream: string; risk_he: string }>
}

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: DiagnosticPdfInput = await req.json()

  const scriptPath = path.join(process.cwd(), 'scripts', 'generate_diagnostic_pdf.py')
  const jsonInput  = JSON.stringify(body)

  let pdfBuffer: Buffer
  try {
    pdfBuffer = execSync(`python3 "${scriptPath}"`, {
      input: jsonInput,
      maxBuffer: 10 * 1024 * 1024, // 10 MB
      timeout: 15_000,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `PDF generation failed: ${msg}` }, { status: 500 })
  }

  const safeClient = body.clientName.replace(/[^\u05D0-\u05EAa-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_')
  const filename   = `COR-SYS_${safeClient}_diagnostic.pdf`

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      String(pdfBuffer.length),
    },
  })
}
