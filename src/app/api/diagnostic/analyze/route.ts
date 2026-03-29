/**
 * POST /api/diagnostic/analyze
 *
 * Body: { answers: Record<string, string>, clientId: string, scores?: {dr,nd,uc} }
 *
 * 1. Validates input
 * 2. Builds embedding text from answers
 * 3. Dual-pass match: severity (4 profiles) + type (5 pathologies)
 * 4. Detects CS amplifier from slider scores
 * 5. Returns topMatch (severity) + topType (DSM-Org type) + ranked arrays
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildEmbeddingText } from '@/lib/diagnostic/questions'
import type { OperatingContext } from '@/lib/corsys-questionnaire'
import { matchPathologyDual } from '@/lib/diagnostic/embedding-matcher'
import { inferScoresFromProfile } from '@/lib/diagnostic/pathology-kb'
import type { PathologyProfile, PathologyType } from '@/lib/diagnostic/pathology-kb'

export interface DiagnosticAnalysisResult {
  topMatch: {
    profile: PathologyProfile
    label_he: string
    similarity: number
    inferredScores: { dr: number; nd: number; uc: number }
  }
  topType: {
    type: PathologyType
    label_he: string
    label_en: string
    similarity: number
    tam: { t: number; a: number; m: number }
    is_amplifier: boolean
  }
  csAmplifier: boolean
  ranked: Array<{
    profile: PathologyProfile
    label_he: string
    similarity: number
    rank: number
  }>
  rankedTypes: Array<{
    type: PathologyType
    label_he: string
    similarity: number
    rank: number
  }>
  embeddingText: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { answers, clientId, scores, operatingContext: ocRaw } = body as {
    answers: Record<string, string>
    clientId: string
    scores?: { dr: number; nd: number; uc: number }
    operatingContext?: string
  }
  const operatingContext: OperatingContext =
    ocRaw === 'one_man_show' ? 'one_man_show' : 'team'

  if (!answers || typeof answers !== 'object' || !clientId) {
    return NextResponse.json({ error: 'Missing answers or clientId' }, { status: 400 })
  }

  const nonEmpty = Object.values(answers).filter(v => v?.trim().length > 10)
  if (nonEmpty.length < 3) {
    return NextResponse.json(
      { error: 'נדרשות לפחות 3 תשובות לאבחון' },
      { status: 422 }
    )
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY not configured' },
      { status: 500 }
    )
  }

  const embeddingText = buildEmbeddingText(answers, operatingContext)

  const { severityMatches, typeMatches, topType, csAmplifier } =
    await matchPathologyDual(embeddingText, scores)

  const top = severityMatches[0]
  const inferredScores = inferScoresFromProfile(top.entry, top.similarity)

  const result: DiagnosticAnalysisResult = {
    topMatch: {
      profile: top.entry.profile,
      label_he: top.entry.label_he,
      similarity: parseFloat(top.similarity.toFixed(4)),
      inferredScores,
    },
    topType: {
      type: topType.entry.type,
      label_he: topType.entry.label_he,
      label_en: topType.entry.label_en,
      similarity: parseFloat(topType.similarity.toFixed(4)),
      tam: topType.entry.tam,
      is_amplifier: topType.entry.is_amplifier,
    },
    csAmplifier,
    ranked: severityMatches.map(r => ({
      profile: r.entry.profile,
      label_he: r.entry.label_he,
      similarity: parseFloat(r.similarity.toFixed(4)),
      rank: r.rank,
    })),
    rankedTypes: typeMatches.map(r => ({
      type: r.entry.type,
      label_he: r.entry.label_he,
      similarity: parseFloat(r.similarity.toFixed(4)),
      rank: r.rank,
    })),
    embeddingText,
  }

  return NextResponse.json(result)
}
