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
  'healthy':           '\u05EA\u05E7\u05D9\u05DF',
  'at-risk':           '\u05D1\u05E1\u05D9\u05DB\u05D5\u05DF',
  'critical':          '\u05E7\u05E8\u05D9\u05D8\u05D9',
  'systemic-collapse': '\u05E7\u05E8\u05D9\u05E1\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA',
}

const CTA_LABELS: Record<string, string> = {
  sprint:    'Sprint \u05D7\u05D5\u05E1\u05DD \u05E2\u05D5\u05E8\u05E7\u05D9\u05DD',
  retainer:  'Resilience Retainer',
  'live-demo': 'Live Demo \u05D0\u05D1\u05D7\u05D5\u05E0\u05D9',
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
    return `\u05E7\u05E8\u05D9\u05E1\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA: DR=${dr.toFixed(1)}, ND=${nd.toFixed(1)}, UC=${uc.toFixed(1)} — \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA \u05DE\u05E8\u05D5\u05D1\u05D5\u05EA \u05E4\u05D5\u05E2\u05DC\u05D5\u05EA \u05D1\u05DE\u05E7\u05D1\u05D9\u05DC.`
  }
  if (severity === 'critical') {
    return `\u05DE\u05E6\u05D1 \u05E7\u05E8\u05D9\u05D8\u05D9: ${primary}=${Math.max(dr, nd, uc).toFixed(1)} — \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05E8\u05D0\u05E9\u05D9\u05EA \u05D3\u05D5\u05DE\u05D9\u05E0\u05E0\u05D8\u05D9\u05EA, \u05D7\u05DC\u05D5\u05DF \u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05DE\u05E6\u05D5\u05DE\u05E6\u05DD.`
  }
  if (severity === 'at-risk') {
    return `\u05D1\u05E1\u05D9\u05DB\u05D5\u05DF: ${primary} \u05DE\u05EA\u05E4\u05EA\u05D7 — \u05D7\u05DC\u05D5\u05DF \u05D4\u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05E4\u05EA\u05D5\u05D7 \u05DC\u05E4\u05E0\u05D9 \u05D4\u05E1\u05DC\u05DE\u05D4.`
  }
  return '\u05DE\u05E6\u05D1 \u05EA\u05E7\u05D9\u05DF: \u05DB\u05DC \u05D4\u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA \u05D1\u05E8\u05DE\u05EA subclinical. \u05DE\u05D5\u05DE\u05DC\u05E5 \u05DE\u05E2\u05E7\u05D1 \u05DE\u05E0\u05D9\u05E2\u05EA\u05D9.'
}

// ─── CTA from severity (fallback when no golden_questions) ───────────────────

function ctaFromSeverity(severity: string): { ctaType: string; timeToActMonths: number; rationale: string } {
  if (severity === 'systemic-collapse' || severity === 'critical') {
    return { ctaType: 'sprint', timeToActMonths: 0, rationale: '\u05D7\u05D5\u05DE\u05E8\u05D4 \u05D2\u05D1\u05D5\u05D4\u05D4 \u05DE\u05D7\u05D9\u05D9\u05D1\u05EA \u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05DE\u05D9\u05D9\u05D3\u05D9\u05EA' }
  }
  if (severity === 'at-risk') {
    return { ctaType: 'retainer', timeToActMonths: 1, rationale: '\u05DE\u05E0\u05D9\u05E2\u05D4 \u05E2\u05D3\u05D9\u05E4\u05D4 \u05E2\u05DC \u05D8\u05D9\u05E4\u05D5\u05DC — \u05D7\u05DC\u05D5\u05DF \u05D4\u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05E4\u05EA\u05D5\u05D7' }
  }
  return { ctaType: 'live-demo', timeToActMonths: 3, rationale: '\u05DE\u05E6\u05D1 \u05EA\u05E7\u05D9\u05DF — \u05D0\u05D1\u05D7\u05D5\u05DF \u05DE\u05E0\u05D9\u05E2\u05EA\u05D9 \u05DE\u05E1\u05E4\u05D9\u05E7' }
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
