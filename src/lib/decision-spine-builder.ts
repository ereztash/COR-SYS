/**
 * decision-spine-builder.ts
 *
 * Builds DecisionSpineData for the DecisionSpine component from
 * a DSM snapshot + client economic params + optional golden_questions.
 *
 * Pure function — no side effects, no DB calls.
 * Designed for server components (no 'use client').
 */

import type { DecisionSpineData } from '@/components/ui/DecisionSpine'
import type { GoldenQuestionAnswers } from '@/lib/dsm-policy-engine'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SnapshotLike {
  score_dr: number
  score_nd: number
  score_uc: number
  severity_profile: string | null
  total_entropy?: number | null
}

export interface ClientEconomicParams {
  hourly_rate?: number | null
  decision_latency_hours?: number | null
  managers?: number | null
  hours_per_week?: number | null
  monthly_salary?: number | null
}

// ─── Severity helpers ──────────────────────────────────────────────────────────

const SEVERITY_LABEL: Record<string, string> = {
  'healthy':           'תקין',
  'at-risk':           'בסיכון',
  'critical':          'קריטי',
  'systemic-collapse': 'קריסה מערכתית',
}

const CTA_LABELS: Record<string, string> = {
  sprint:    'Sprint חוסם עורקים',
  retainer:  'Resilience Retainer',
  'live-demo': 'Live Demo אבחוני',
}

// ─── Primary pathology from scores ────────────────────────────────────────────

function primaryPathologyFromScores(dr: number, nd: number, uc: number): string {
  const max = Math.max(dr, nd, uc)
  if (max === dr) return 'DR'
  if (max === nd) return 'ND'
  return 'UC'
}

// ─── State narrative from scores (fallback when no golden_questions) ──────────

function stateNarrativeFromScores(
  severity: string,
  dr: number,
  nd: number,
  uc: number,
): string {
  const primary = primaryPathologyFromScores(dr, nd, uc)
  if (severity === 'systemic-collapse') {
    return `קריסה מערכתית: DR=${dr.toFixed(1)}, ND=${nd.toFixed(1)}, UC=${uc.toFixed(1)} — פתולוגיות מרובות פועלות במקביל.`
  }
  if (severity === 'critical') {
    return `מצב קריטי: ${primary}=${Math.max(dr, nd, uc).toFixed(1)} — פתולוגיה ראשית דומיננטית, חלון התערבות מצומצם.`
  }
  if (severity === 'at-risk') {
    return `בסיכון: ${primary} מתפתח — חלון ההתערבות פתוח לפני הסלמה.`
  }
  return 'מצב תקין: כל הפתולוגיות ברמת subclinical. מומלץ מעקב מניעתי.'
}

// ─── CTA from severity (fallback when no golden_questions) ───────────────────

function ctaFromSeverity(severity: string): { ctaType: string; timeToActMonths: number; rationale: string } {
  if (severity === 'systemic-collapse' || severity === 'critical') {
    return { ctaType: 'sprint', timeToActMonths: 0, rationale: 'חומרה גבוהה מחייבת התערבות מיידית' }
  }
  if (severity === 'at-risk') {
    return { ctaType: 'retainer', timeToActMonths: 1, rationale: 'מניעה עדיפה על טיפול — חלון ההתערבות פתוח' }
  }
  return { ctaType: 'live-demo', timeToActMonths: 3, rationale: 'מצב תקין — אבחון מניעתי מספיק' }
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildDecisionSpineData(
  clientId: string,
  snapshot: SnapshotLike | null,
  client: ClientEconomicParams,
  goldenQuestions?: GoldenQuestionAnswers | null,
): DecisionSpineData | null {
  if (!snapshot) return null

  const severity = snapshot.severity_profile ?? 'at-risk'
  const severityLabel = SEVERITY_LABEL[severity] ?? severity

  // ── Block 1: State ──────────────────────────────────────────────────────────
  const primaryPathology = goldenQuestions
    ? goldenQuestions.systemState.primaryPathology
    : primaryPathologyFromScores(snapshot.score_dr, snapshot.score_nd, snapshot.score_uc)

  const stateNarrative = goldenQuestions
    ? goldenQuestions.systemState.narrativeHe
    : stateNarrativeFromScores(severity, snapshot.score_dr, snapshot.score_nd, snapshot.score_uc)

  // ── Block 2: Economic impact ────────────────────────────────────────────────
  let dailyLossILS: number | null = null
  let weeklyLossILS: number | null = null
  let jQuotient: number | null = null
  let urgency: DecisionSpineData['urgency'] = null
  let jInterpretation: string | null = null

  if (goldenQuestions) {
    const ei = goldenQuestions.economicImpact
    weeklyLossILS = ei.weeklyWasteILS
    dailyLossILS  = ei.weeklyWasteILS / 7
    jQuotient     = ei.jQuotient
    urgency       = ei.urgencySignal
    jInterpretation = ei.jInterpretationHe
  } else if (client.hourly_rate && client.decision_latency_hours) {
    dailyLossILS  = Math.round((client.hourly_rate * client.decision_latency_hours) / 7)
    weeklyLossILS = dailyLossILS * 7
    if (client.hours_per_week) {
      jQuotient = Math.max((40 - client.hours_per_week) / 40, 0)
      urgency   = jQuotient < 0.35 ? 'critical' : jQuotient < 0.6 ? 'elevated' : 'moderate'
    }
  }

  // ── Block 3: Action ─────────────────────────────────────────────────────────
  let ctaType: string
  let ctaTimeMonths: number | null
  let ctaRationale: string | null

  if (goldenQuestions) {
    const ra = goldenQuestions.recommendedAction
    ctaType       = ra.ctaType
    ctaTimeMonths = ra.timeToActMonths
    ctaRationale  = ra.rationale
  } else {
    const fallback = ctaFromSeverity(severity)
    ctaType       = fallback.ctaType
    ctaTimeMonths = fallback.timeToActMonths
    ctaRationale  = fallback.rationale
  }

  const ctaLabel = CTA_LABELS[ctaType] ?? ctaType
  const ctaHref  = ctaType === 'sprint'
    ? `/clients/${clientId}/sprints/new`
    : ctaType === 'retainer'
      ? `/clients/${clientId}/diagnostic/new`
      : `/clients/${clientId}/diagnostic/new`

  return {
    severity,
    severityLabel,
    primaryPathology,
    stateNarrative,
    dailyLossILS,
    weeklyLossILS,
    jQuotient,
    urgency,
    jInterpretation,
    ctaLabel,
    ctaHref,
    ctaTimeMonths,
    ctaRationale,
  }
}
