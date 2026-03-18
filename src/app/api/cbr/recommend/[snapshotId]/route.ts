/**
 * GET /api/cbr/recommend/[snapshotId]
 *
 * Full CBR intelligence pipeline for a given snapshot:
 *   1. Load snapshot + org from Supabase
 *   2. Find similar cases (Phase 2 retrieval)
 *   3. Get ranked recommendations with Wilson-score confidence
 *   4. On cold-start: attach policy-engine fallback
 *
 * Response:
 *   {
 *     snapshot_id: string
 *     cold_start: boolean
 *     recommendations: RecommendationResult[]
 *     policy_fallback?: GoldenQuestionAnswers['recommendedAction']
 *   }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DsmDiagnosticSnapshot, OrganizationContext } from '@/types/database'
import { findSimilarCases, getRecommendations } from '@/lib/cbr'
import { diagnose } from '@/lib/dsm-engine'
import { buildGoldenQuestions } from '@/lib/dsm-policy-engine'

const DEFAULT_MANAGERS = 5
const DEFAULT_HOURS_PER_WEEK = 10
const DEFAULT_MONTHLY_SALARY = 25000

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ snapshotId: string }> }
) {
  const { snapshotId } = await params
  const topK = parseInt(request.nextUrl.searchParams.get('top_k') ?? '5', 10)

  // Optional economic params from query string (for accurate loss framing)
  const managers = parseInt(request.nextUrl.searchParams.get('managers') ?? String(DEFAULT_MANAGERS), 10)
  const hoursPerWeek = parseFloat(request.nextUrl.searchParams.get('hours_per_week') ?? String(DEFAULT_HOURS_PER_WEEK))
  const monthlySalary = parseFloat(request.nextUrl.searchParams.get('monthly_salary') ?? String(DEFAULT_MONTHLY_SALARY))

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: 'OPENAI_API_KEY not configured',
        hint: 'Add OPENAI_API_KEY to .env.local to enable CBR recommendations',
      },
      { status: 503 }
    )
  }

  const supabase = await createClient()

  // 1. Load snapshot
  const { data: snapshotRaw, error: snapErr } = await supabase
    .from('dsm_diagnostic_snapshots')
    .select('*')
    .eq('snapshot_id', snapshotId)
    .single()

  if (snapErr || !snapshotRaw) {
    return NextResponse.json(
      { error: 'Snapshot not found', detail: snapErr?.message },
      { status: 404 }
    )
  }
  const snapshot = snapshotRaw as unknown as DsmDiagnosticSnapshot

  // 2. Load org context
  const { data: orgRaw, error: orgErr } = await supabase
    .from('organizations_context')
    .select('*')
    .eq('org_id', snapshot.org_id)
    .single()

  if (orgErr || !orgRaw) {
    return NextResponse.json(
      { error: 'Organization context not found', detail: orgErr?.message },
      { status: 404 }
    )
  }
  const org = orgRaw as unknown as OrganizationContext

  try {
    // 3. Retrieve similar cases
    const rankedCases = await findSimilarCases({ snapshot, org, top_k: topK })

    // 4. Build recommendations
    // On cold start, reconstruct DSMDiagnosis from snapshot scores for policy fallback
    let coldStartDiagnosis = undefined
    if (rankedCases.length === 0) {
      try {
        // diagnose() needs questionnaire answers; use scores-only path via a minimal proxy
        // We reconstruct a minimal diagnosis from the snapshot's numeric fields
        coldStartDiagnosis = reconstructDiagnosisFromScores(
          snapshot.score_dr,
          snapshot.score_nd,
          snapshot.score_uc
        )
      } catch {
        // If reconstruction fails, cold start returns empty — not a blocking error
      }
    }

    const { recommendations, cold_start } = getRecommendations({
      rankedCases,
      snapshot,
      coldStartDiagnosis,
      coldStartEconomicParams: { managers, hoursPerWeek, monthlySalary },
    })

    // 5. On cold start, also attach policy engine CTA for richer UI
    let policy_fallback = undefined
    if (cold_start && coldStartDiagnosis) {
      const golden = buildGoldenQuestions(coldStartDiagnosis, { managers, hoursPerWeek, monthlySalary })
      policy_fallback = golden.recommendedAction
    }

    return NextResponse.json({
      snapshot_id: snapshotId,
      cold_start,
      recommendations,
      ...(policy_fallback ? { policy_fallback } : {}),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'CBR recommendation failed', detail: message }, { status: 500 })
  }
}

// ─── Score-only diagnosis reconstruction ─────────────────────────────────────

/**
 * Reconstruct a minimal DSMDiagnosis from numeric scores alone.
 * Used for cold-start policy fallback when no questionnaire answers are available.
 * Does not produce comorbidity edges or intervention protocols — only the data
 * needed by buildGoldenQuestions (pathologies + severityProfile + totalEntropyScore).
 */
function reconstructDiagnosisFromScores(
  drScore: number,
  ndScore: number,
  ucScore: number
): ReturnType<typeof diagnose> {
  // Map scores to severity levels (mirrors dsm-engine.ts thresholds)
  function toLevel(score: number): 1 | 2 | 3 {
    if (score >= 7) return 3
    if (score >= 4) return 2
    return 1
  }

  const totalEntropyScore = drScore + ndScore + ucScore

  let severityProfile: 'healthy' | 'at-risk' | 'critical' | 'systemic-collapse'
  const levels = [toLevel(drScore), toLevel(ndScore), toLevel(ucScore)]
  const level3Count = levels.filter((l) => l === 3).length
  const level2Count = levels.filter((l) => l === 2).length

  if (level3Count >= 2 || totalEntropyScore >= 22) severityProfile = 'systemic-collapse'
  else if (level3Count === 1) severityProfile = 'critical'
  else if (level2Count >= 1) severityProfile = 'at-risk'
  else severityProfile = 'healthy'

  const pathologies = [
    { code: 'DR' as const, score: drScore, level: toLevel(drScore), nameHe: 'הדדיות מעוותת', nameEn: 'Distorted Reciprocity', levelLabel: '', contributors: [] },
    { code: 'ND' as const, score: ndScore, level: toLevel(ndScore), nameHe: 'נורמליזציית סטייה', nameEn: 'Normalization of Deviance', levelLabel: '', contributors: [] },
    { code: 'UC' as const, score: ucScore, level: toLevel(ucScore), nameHe: 'כיול לא-מייצג', nameEn: 'Unrepresentative Calibration', levelLabel: '', contributors: [] },
  ]

  const primaryDiagnosis = pathologies.reduce((a, b) => (a.score >= b.score ? a : b)).code

  return {
    codes: pathologies.map((p) => `${p.code}-${p.level}`),
    primaryDiagnosis,
    severityProfile,
    pathologies,
    totalEntropyScore,
    comorbidities: [],
    protocols: [],
    severityProfileLabel: severityProfile,
  } as unknown as ReturnType<typeof diagnose>
}
