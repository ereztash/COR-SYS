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
import { diagnoseFromScores, type DSMDiagnosis } from '@/lib/dsm-engine'
import { buildGoldenQuestions, type GoldenQuestionAnswers } from '@/lib/dsm-policy-engine'

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

  // OPENAI_API_KEY is optional — embedding generation is attempted but if unavailable,
  // findSimilarCases automatically falls back to score-based Jensen-Shannon similarity.
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[CBR] OPENAI_API_KEY not set — KL score fallback will be used instead of HNSW')
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
          snapshot.score_uc,
          snapshot.score_sc,
          snapshot.decision_latency ?? 0,
          snapshot.psi_score ?? undefined
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

    // 5. Always attach Golden Questions for decision-quality UX (even when warm start).
    // We reconstruct a minimal diagnosis from scores-only, which is sufficient for buildGoldenQuestions.
    let golden_questions: GoldenQuestionAnswers | undefined = undefined
    let policy_fallback = undefined
    try {
      const diagnosisForGolden =
        coldStartDiagnosis ??
        reconstructDiagnosisFromScores(
          snapshot.score_dr,
          snapshot.score_nd,
          snapshot.score_uc,
          snapshot.score_sc,
          snapshot.decision_latency ?? 0,
          snapshot.psi_score ?? undefined
        )

      const golden = buildGoldenQuestions(diagnosisForGolden, { managers, hoursPerWeek, monthlySalary })
      golden_questions = golden
      policy_fallback = golden.recommendedAction
    } catch {
      // Not blocking: recommendations list still works.
    }

    // Observability: which similarity path was used (Iteration 2+10)
    const similarity_method = rankedCases[0]?.similarity_method ?? (cold_start ? 'none' : 'hnsw')

    // Telemetry: fire-and-forget (non-blocking)
    const baseUrl = request.nextUrl.origin
    fetch(`${baseUrl}/api/ux-metrics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'cbr_recommend',
        ts: Date.now(),
        data: {
          snapshot_id: snapshotId,
          cold_start,
          similarity_method,
          n_recommendations: recommendations.length,
          top_wilson: recommendations[0]?.wilson_score ?? 0,
        },
      }),
    }).catch(() => {})

    return NextResponse.json({
      snapshot_id: snapshotId,
      cold_start,
      similarity_method,
      recommendations,
      ...(golden_questions ? { golden_questions } : {}),
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
  ucScore: number,
  scScore: number = 5,
  latencyHours: number = 0,
  psiAverage?: number
): DSMDiagnosis {
  return diagnoseFromScores(drScore, ndScore, ucScore, latencyHours, scScore, { psiAverage })
}
