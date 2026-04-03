/**
 * DSM Engine — Organizational DSM Diagnostic Engine
 *
 * Maps COR-SYS questionnaire answers to research-backed diagnostic codes,
 * comorbidity analysis, and intervention protocols.
 *
 * Based on: integrated-model.md (N=10,000 simulation)
 * Pathologies: DR (Distorted Reciprocity), ND (Normalization of Deviance), UC (Unrepresentative Calibration), SC (structural clarity)
 * Extended (v2) DSM-Org types: ZSG_SAFETY / ZSG_CULTURE, CLT, OLD — see dsm-org-taxonomy / pathology-kb
 * Correlations: DR↔ND r=.19, DR↔UC r=-.27, ND↔UC r=.28
 * Psychometrics: α DR=.872, ND=.881, UC=.893
 */

import { computePsiFromAnswers, type QuestionnaireAnswer } from './corsys-questionnaire'
import { TAM_SIGNATURES, type TAMSignature, type ExtendedPathologyCode, SEQUENCING_RULES } from './dsm-org-taxonomy'

// ─── Types ───────────────────────────────────────────────────────────────────

export type PathologyCode = 'DR' | 'ND' | 'UC' | 'SC'
export type SeverityLevel = 1 | 2 | 3
export type SeverityProfile = 'healthy' | 'at-risk' | 'critical' | 'systemic-collapse'

export interface PathologySeverity {
  code: PathologyCode
  nameHe: string
  nameEn: string
  score: number            // 0–10
  level: SeverityLevel     // 1 = subclinical, 2 = moderate, 3 = severe
  levelLabel: string       // \u05EA\u05D9\u05D0\u05D5\u05E8 \u05D1\u05E2\u05D1\u05E8\u05D9\u05EA
  contributors: string[]   // \u05E9\u05D0\u05DC\u05D5\u05EA \u05E9\u05EA\u05E8\u05DE\u05D5 \u05DC\u05E6\u05D9\u05D5\u05DF
}

export interface DSMDiagnosis {
  codes: string[]                     // ["DR-2", "ND-3", "UC-1", "SC-2"]
  primaryDiagnosis: PathologyCode     // \u05D4\u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05D4\u05D7\u05DE\u05D5\u05E8\u05D4 \u05D1\u05D9\u05D5\u05EA\u05E8
  severityProfile: SeverityProfile
  pathologies: PathologySeverity[]
  totalEntropyScore: number           // 0–40 (\u05E1\u05DB\u05D5\u05DD \u05E6\u05D9\u05D5\u05E0\u05D9 \u05D7\u05D5\u05DE\u05E8\u05D4 — 4 \u05DE\u05DE\u05D3\u05D9\u05DD)
  tamSignature?: TAMSignature         // T/A/M cost vector for this diagnosis
  cascadeState?: CascadeStateInfo     // Cascade State detection (v2)
  sequencingViolations?: SequencingViolation[] // Active sequencing rule violations
}

export interface CascadeStateInfo {
  isActive: boolean
  concurrentSevereCount: number       // Number of pathologies at level 3
  triggerDescription: string
  haltRequired: boolean
}

export interface SequencingViolation {
  ruleId: string
  condition: string
  prerequisite: string
  blocked: string
  rationale: string
  severity: 'mandatory' | 'recommended'
}

export interface ComorbidityEdge {
  from: PathologyCode
  to: PathologyCode
  correlation: number
  direction: 'positive' | 'negative'
  strength: 'weak' | 'moderate' | 'strong'
  active: boolean
  mechanism: string
}

export interface InterventionProtocol {
  id: string
  triggerCode: string
  nameHe: string
  nameEn: string
  phase: string
  components: { step: string; detail: string }[]
  successMetrics: string[]
  researchBasis: string
  timelineMonths: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PATHOLOGY_NAMES: Record<PathologyCode, { he: string; en: string }> = {
  DR: { he: '\u05D4\u05D3\u05D3\u05D9\u05D5\u05EA \u05DE\u05E2\u05D5\u05D5\u05EA\u05EA', en: 'Distorted Reciprocity' },
  ND: { he: '\u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D9\u05EA \u05E1\u05D8\u05D9\u05D9\u05D4', en: 'Normalization of Deviance' },
  UC: { he: '\u05DB\u05D9\u05D5\u05DC \u05DC\u05D0-\u05DE\u05D9\u05D9\u05E6\u05D2', en: 'Unrepresentative Calibration' },
  SC: { he: '\u05E2\u05DE\u05D9\u05DE\u05D5\u05EA \u05DE\u05D1\u05E0\u05D9\u05EA', en: 'Structural Clarity Deficit' },
}

const LEVEL_LABELS: Record<SeverityLevel, string> = {
  1: '\u05EA\u05E4\u05E7\u05D5\u05D3 \u05EA\u05E7\u05D9\u05DF / subclinical',
  2: '\u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05DE\u05EA\u05D5\u05E0\u05D4 / \u05D1\u05D9\u05E0\u05D5\u05E0\u05D9\u05EA',
  3: '\u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05D7\u05DE\u05D5\u05E8\u05D4 / \u05D2\u05D1\u05D5\u05D4\u05D4',
}

/** Research-based correlations from N=10,000 simulation */
const CORRELATIONS: { from: PathologyCode; to: PathologyCode; r: number; mechanism: string }[] = [
  {
    from: 'DR', to: 'ND', r: 0.19,
    mechanism: '\u05EA\u05D7\u05E8\u05D5\u05EA \u05E4\u05E0\u05D9\u05DE\u05D9\u05EA \u05DE\u05D9\u05D9\u05E6\u05E8\u05EA \u05DC\u05D7\u05E5 \u05D9\u05D9\u05E6\u05D5\u05E8 \u05E9\u05DE\u05E0\u05E8\u05DE\u05DC \u05E1\u05D8\u05D9\u05D5\u05EA \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD — \u05D4\u05E6\u05DC\u05D7\u05D4 \u05D1\u05DE\u05D3\u05D3\u05D9\u05DD \u05D3\u05D5\u05E8\u05E9\u05EA \u05E2\u05E7\u05D9\u05E4\u05EA \u05E0\u05D4\u05DC\u05D9\u05DD',
  },
  {
    from: 'DR', to: 'UC', r: -0.27,
    mechanism: '\u05EA\u05D7\u05E8\u05D5\u05EA \u05DE\u05E2\u05DB\u05D1\u05EA \u05DC\u05DE\u05D9\u05D3\u05D4 \u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05EA — \u05D1\u05E1\u05D1\u05D9\u05D1\u05D4 \u05EA\u05D7\u05E8\u05D5\u05EA\u05D9\u05EA, \u05D4\u05D5\u05D3\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D5\u05EA = \u05D7\u05D5\u05DC\u05E9\u05D4; \u05D1\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9 \u05E0\u05E4\u05D2\u05E2',
  },
  {
    from: 'ND', to: 'UC', r: 0.28,
    mechanism: '\u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D9\u05EA \u05E1\u05D8\u05D9\u05D5\u05EA \u05E4\u05D5\u05D2\u05E2\u05EA \u05D1\u05D9\u05DB\u05D5\u05DC\u05EA \u05D4\u05DC\u05DE\u05D9\u05D3\u05D4 \u05DE\u05D8\u05E2\u05D5\u05D9\u05D5\u05EA — \u05DB\u05E9\u05E1\u05D8\u05D9\u05D5\u05EA \u05E0\u05EA\u05E4\u05E1\u05D5\u05EA \u05DB\u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D5\u05EA, \u05D0\u05D9\u05DF trigger \u05DC\u05DC\u05DE\u05D9\u05D3\u05D4',
  },
  {
    from: 'SC', to: 'DR', r: 0.32,
    mechanism: '\u05E2\u05DE\u05D9\u05DE\u05D5\u05EA \u05DE\u05D1\u05E0\u05D9\u05EA \u05DE\u05D9\u05D9\u05E6\u05E8\u05EA \u05D5\u05D0\u05E7\u05D5\u05DD \u05E1\u05DE\u05DB\u05D5\u05EA\u05D9 \u05E9\u05DE\u05D2\u05D1\u05D9\u05E8 \u05DE\u05D0\u05D1\u05E7\u05D9 \u05D1\u05E2\u05DC\u05D5\u05EA \u05D5\u05EA\u05D7\u05E8\u05D5\u05EA \u05E4\u05E0\u05D9\u05DE\u05D9\u05EA',
  },
  {
    from: 'SC', to: 'ND', r: 0.24,
    mechanism: '\u05DB\u05D0\u05E9\u05E8 \u05DE\u05D1\u05E0\u05D4 \u05D5\u05EA\u05D4\u05DC\u05D9\u05DB\u05D9\u05DD \u05D0\u05D9\u05E0\u05DD \u05D1\u05E8\u05D5\u05E8\u05D9\u05DD, \u05DE\u05E2\u05E7\u05E4\u05D9\u05DD \u05D4\u05D5\u05E4\u05DB\u05D9\u05DD \u05DC\u05D1\u05E8\u05D9\u05E8\u05EA \u05DE\u05D7\u05D3\u05DC \u05EA\u05E4\u05E2\u05D5\u05DC\u05D9\u05EA',
  },
  {
    from: 'SC', to: 'UC', r: 0.18,
    mechanism: '\u05D7\u05D5\u05E1\u05E8 \u05D1\u05D4\u05D9\u05E8\u05D5\u05EA \u05DE\u05D1\u05E0\u05D9\u05EA \u05DE\u05D7\u05DC\u05D9\u05E9 sensemaking \u05D5\u05E4\u05D5\u05D2\u05E2 \u05D1\u05D9\u05DB\u05D5\u05DC\u05EA \u05DB\u05D9\u05D5\u05DC \u05D5\u05DC\u05DE\u05D9\u05D3\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA',
  },
]

// ─── Scoring Logic ───────────────────────────────────────────────────────────

const DR_SCORES: Record<string, number> = {
  frequent: 8.5,
  occasional: 5.0,
  rare: 1.5,
}

const ND_SCORES: Record<string, number> = {
  high: 8.5,
  medium: 5.0,
  low: 1.5,
}

const UC_LEARNING_SCORES: Record<string, number> = {
  single_loop: 8.0,
  mixed: 4.5,
  double_loop: 1.0,
}

const UC_SEMANTIC_SCORES: Record<string, number> = {
  high_drift: 8.0,
  medium_drift: 4.5,
  low_drift: 1.0,
}

const ADAPTIVE_SCORES: Record<string, number> = {
  rigid: 8.0,
  slow_adapt: 4.5,
  agile: 1.0,
}

const VOICE_SCORES: Record<string, number> = {
  no_channel: 8.0,
  unused_channel: 4.5,
  effective_channel: 1.0,
}

const LEADERSHIP_SCORES: Record<string, number> = {
  micromanage: 8.0,
  partial_delegation: 4.5,
  full_delegation: 1.5,
}

const STRATEGY_EXEC_SCORES: Record<string, number> = {
  no_cascade: 8.0,
  partial_cascade: 4.5,
  full_cascade: 1.5,
}

/** SC — Structural Clarity Deficit (Reductionist-Logical dimension, Phase 4) */
const SC_SCORES: Record<string, number> = {
  high: 8.5,   // severe structural dysfunction
  medium: 5.0,
  low: 1.5,    // well-defined structure
}

const LATENCY_MODIFIER: Record<string, number> = {
  over_15: 1.5,
  '5_to_15': 0.5,
  under_5: 0,
}

function computeLatencyFactorFromModifier(latencyMod: number): number {
  if (latencyMod >= 1.5) return 1.15
  if (latencyMod >= 0.5) return 1.05
  return 1
}

function scoreToLevel(score: number): SeverityLevel {
  // \u05E1\u05E4\u05D9\u05DD \u05DE\u05D5\u05EA\u05D0\u05DE\u05D9\u05DD \u05DC\u05E1\u05E7\u05D0\u05DC\u05D4 \u05D4\u05D9\u05D5\u05E8\u05D9\u05E1\u05D8\u05D9\u05EA:
  // 0–2.5 ≈ subclinical, 2.5–5.5 ≈ moderate, 5.5–10 ≈ severe
  if (score <= 2.5) return 1
  if (score <= 5.5) return 2
  return 3
}

function scoreToLevelWithThreshold(score: number, level2Threshold: number): SeverityLevel {
  if (score <= level2Threshold) return 1
  if (score <= 5.5) return 2
  return 3
}

function getGreinerLevel2Threshold(axis: PathologyCode, greinerStage?: QuestionnaireAnswer['greinerStage']): number {
  if (greinerStage === 'phase_3' && axis === 'SC') return 1.5
  if (greinerStage === 'phase_4' && axis === 'ND') return 1.5
  if (greinerStage === 'phase_5' && axis === 'UC') return 1.5
  return 2.5
}

function computePsiNormalized(answers: QuestionnaireAnswer): number {
  const psiAverage = computePsiFromAnswers(answers) ?? 3.5
  return ((8 - psiAverage) / 6) * 10
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(10, score))
}

// ─── Core Diagnostic Functions ───────────────────────────────────────────────

/**
 * Diagnose organizational pathologies from questionnaire answers.
 * Maps answers → severity scores → DSM codes → severity profile.
 */
export function diagnose(answers: QuestionnaireAnswer): DSMDiagnosis {
  const latencyMod = LATENCY_MODIFIER[answers.decisionLatency ?? 'under_5'] ?? 0
  const latencyFactor = computeLatencyFactorFromModifier(latencyMod)

  // DR score
  const drBase = DR_SCORES[answers.pathologyZeroSum ?? 'rare'] ?? 1.5
  const drScore = clampScore((drBase + (drBase > 3.0 ? latencyMod : 0)) * latencyFactor)
  const drContributors = ['pathologyZeroSum']
  if (latencyMod > 0 && drBase > 3.0) drContributors.push('decisionLatency')

  // ND score
  const ndBase = ND_SCORES[answers.pathologyNod ?? 'low'] ?? 1.5
  const ndScore = clampScore((ndBase + (ndBase > 3.0 ? latencyMod : 0)) * latencyFactor)
  const ndContributors = ['pathologyNod']
  if (latencyMod > 0 && ndBase > 3.0) ndContributors.push('decisionLatency')

  // UC score (weighted combination of learning + semantic + PSI + adaptive)
  const ucLearning = UC_LEARNING_SCORES[answers.pathologyLearning ?? 'double_loop'] ?? 1.0
  const ucSemantic = UC_SEMANTIC_SCORES[answers.pathologySemantic ?? 'low_drift'] ?? 1.0
  const psiNorm = computePsiNormalized(answers)
  const adaptive = ADAPTIVE_SCORES[answers.adaptiveCapacity ?? 'slow_adapt'] ?? 4.5
  const voice = VOICE_SCORES[answers.voiceInfrastructure ?? 'unused_channel'] ?? 4.5
  const ucBase = 0.4 * ucLearning + 0.25 * ucSemantic + 0.2 * psiNorm + 0.15 * adaptive
  let ucScore = clampScore((ucBase + (ucBase > 3.0 ? latencyMod : 0)) * latencyFactor)

  // \u05D0\u05DD \u05D2\u05DD \u05DC\u05DE\u05D9\u05D3\u05D4 single_loop \u05D5\u05D2\u05DD \u05E1\u05D7\u05D9\u05E4\u05D4 \u05E1\u05DE\u05E0\u05D8\u05D9\u05EA \u05D2\u05D1\u05D5\u05D4\u05D4 — UC \u05EA\u05DE\u05D9\u05D3 \u05D1\u05E8\u05DE\u05EA 3
  if (answers.pathologyLearning === 'single_loop' && answers.pathologySemantic === 'high_drift') {
    ucScore = Math.max(ucScore, 7)
  }
  const ucContributors = ['pathologyLearning', 'pathologySemantic', 'psi', 'adaptiveCapacity']
  if (voice >= 7) ucContributors.push('voiceInfrastructure')
  if (latencyMod > 0 && ucBase > 3.0) ucContributors.push('decisionLatency')

  // SC score — Structural Clarity Deficit (Reductionist-Logical dimension)
  const scCore = SC_SCORES[answers.pathologySc ?? 'medium'] ?? 5.0
  const scStrategy = STRATEGY_EXEC_SCORES[answers.strategyExecution ?? 'partial_cascade'] ?? 4.5
  const scBase = 0.75 * scCore + 0.25 * scStrategy
  const scScore = clampScore(scBase)
  const scContributors = ['pathologySc', 'strategyExecution']

  // DR-8 leadership cascade as a DR sub-dimension (lightly weighted).
  const leadership = LEADERSHIP_SCORES[answers.leadershipCascade ?? 'partial_delegation'] ?? 4.5
  const drAdjustedScore = clampScore(0.85 * drScore + 0.15 * leadership)
  if (answers.leadershipCascade) drContributors.push('leadershipCascade')

  const greinerStage = answers.greinerStage
  const drLevel = scoreToLevelWithThreshold(drAdjustedScore, getGreinerLevel2Threshold('DR', greinerStage))
  const ndLevel = scoreToLevelWithThreshold(ndScore, getGreinerLevel2Threshold('ND', greinerStage))
  const ucLevel = scoreToLevelWithThreshold(ucScore, getGreinerLevel2Threshold('UC', greinerStage))
  const scLevel = scoreToLevelWithThreshold(scScore, getGreinerLevel2Threshold('SC', greinerStage))

  const pathologies: PathologySeverity[] = [
    {
      code: 'DR',
      nameHe: PATHOLOGY_NAMES.DR.he,
      nameEn: PATHOLOGY_NAMES.DR.en,
      score: drAdjustedScore,
      level: drLevel,
      levelLabel: LEVEL_LABELS[drLevel],
      contributors: drContributors,
    },
    {
      code: 'ND',
      nameHe: PATHOLOGY_NAMES.ND.he,
      nameEn: PATHOLOGY_NAMES.ND.en,
      score: ndScore,
      level: ndLevel,
      levelLabel: LEVEL_LABELS[ndLevel],
      contributors: ndContributors,
    },
    {
      code: 'UC',
      nameHe: PATHOLOGY_NAMES.UC.he,
      nameEn: PATHOLOGY_NAMES.UC.en,
      score: ucScore,
      level: ucLevel,
      levelLabel: LEVEL_LABELS[ucLevel],
      contributors: ucContributors,
    },
    {
      code: 'SC',
      nameHe: PATHOLOGY_NAMES.SC.he,
      nameEn: PATHOLOGY_NAMES.SC.en,
      score: scScore,
      level: scLevel,
      levelLabel: LEVEL_LABELS[scLevel],
      contributors: scContributors,
    },
  ]

  const codes = pathologies.map((p) => `${p.code}-${p.level}`)
  const primary = pathologies.reduce((max, p) => (p.score > max.score ? p : max)).code
  const severityProfile = computeSeverityProfile(pathologies)
  const totalEntropyScore = drAdjustedScore + ndScore + ucScore + scScore

  return { codes, primaryDiagnosis: primary, severityProfile, pathologies, totalEntropyScore }
}

/**
 * Diagnose from raw numeric scores (for quick calculator).
 * Accepts 0-10 scores directly instead of questionnaire answers.
 */
export function diagnoseFromScores(
  drScore: number,
  ndScore: number,
  ucScore: number,
  latencyHours: number = 0,
  scScore: number = 5.0,
  options?: {
    psiAverage?: number
    adaptiveCapacity?: QuestionnaireAnswer['adaptiveCapacity']
    greinerStage?: QuestionnaireAnswer['greinerStage']
  }
): DSMDiagnosis {
  const latencyMod = latencyHours > 15 ? 1.5 : latencyHours >= 5 ? 0.5 : 0
  const latencyFactor = computeLatencyFactorFromModifier(latencyMod)

  const drBase = clampScore((drScore + (drScore > 3.0 ? latencyMod : 0)) * latencyFactor)
  const nd = clampScore((ndScore + (ndScore > 3.0 ? latencyMod : 0)) * latencyFactor)
  const adaptive = ADAPTIVE_SCORES[options?.adaptiveCapacity ?? 'slow_adapt'] ?? 4.5
  const psiNorm = options?.psiAverage != null ? ((8 - options.psiAverage) / 6) * 10 : 7.5
  const uc = clampScore((0.65 * ucScore + 0.2 * psiNorm + 0.15 * adaptive + (ucScore > 3.0 ? latencyMod : 0)) * latencyFactor)
  const sc = clampScore(scScore) // SC not affected by latency — structural, not behavioral
  const dr = clampScore(0.85 * drBase + 0.15 * 4.5)

  const drLevel = scoreToLevelWithThreshold(dr, getGreinerLevel2Threshold('DR', options?.greinerStage))
  const ndLevel = scoreToLevelWithThreshold(nd, getGreinerLevel2Threshold('ND', options?.greinerStage))
  const ucLevel = scoreToLevelWithThreshold(uc, getGreinerLevel2Threshold('UC', options?.greinerStage))
  const scLevel = scoreToLevelWithThreshold(sc, getGreinerLevel2Threshold('SC', options?.greinerStage))

  const pathologies: PathologySeverity[] = [
    {
      code: 'DR', nameHe: PATHOLOGY_NAMES.DR.he, nameEn: PATHOLOGY_NAMES.DR.en,
      score: dr, level: drLevel, levelLabel: LEVEL_LABELS[drLevel],
      contributors: ['direct-input'],
    },
    {
      code: 'ND', nameHe: PATHOLOGY_NAMES.ND.he, nameEn: PATHOLOGY_NAMES.ND.en,
      score: nd, level: ndLevel, levelLabel: LEVEL_LABELS[ndLevel],
      contributors: ['direct-input'],
    },
    {
      code: 'UC', nameHe: PATHOLOGY_NAMES.UC.he, nameEn: PATHOLOGY_NAMES.UC.en,
      score: uc, level: ucLevel, levelLabel: LEVEL_LABELS[ucLevel],
      contributors: ['direct-input'],
    },
    {
      code: 'SC', nameHe: PATHOLOGY_NAMES.SC.he, nameEn: PATHOLOGY_NAMES.SC.en,
      score: sc, level: scLevel, levelLabel: LEVEL_LABELS[scLevel],
      contributors: ['direct-input'],
    },
  ]

  const codes = pathologies.map((p) => `${p.code}-${p.level}`)
  const primary = pathologies.reduce((max, p) => (p.score > max.score ? p : max)).code
  const severityProfile = computeSeverityProfile(pathologies)
  const totalEntropyScore = dr + nd + uc + sc

  return { codes, primaryDiagnosis: primary, severityProfile, pathologies, totalEntropyScore }
}

function computeSeverityProfile(pathologies: PathologySeverity[]): SeverityProfile {
  const level3Count = pathologies.filter((p) => p.level === 3).length
  const level2Count = pathologies.filter((p) => p.level === 2).length
  const totalScore = pathologies.reduce((sum, p) => sum + p.score, 0)

  // \u05E7\u05E8\u05D9\u05E1\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA \u05D3\u05D5\u05E8\u05E9\u05EA \u05D2\u05DD \u05E2\u05D5\u05DE\u05E1 \u05D0\u05E0\u05D8\u05E8\u05D5\u05E4\u05D9\u05D4 \u05D2\u05D1\u05D5\u05D4, \u05DC\u05D0 \u05E8\u05E7 \u05E9\u05EA\u05D9 \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA \u05D7\u05DE\u05D5\u05E8\u05D5\u05EA
  // Threshold scaled from 22/30 (3D) → 29/40 (4D) proportionally
  if (level3Count >= 2 && totalScore >= 29) return 'systemic-collapse'
  if (level3Count === 1) return 'critical'
  if (level2Count >= 1) return 'at-risk'
  return 'healthy'
}

// ─── Comorbidity Map ─────────────────────────────────────────────────────────

export function getComorbidityMap(diagnosis: DSMDiagnosis): ComorbidityEdge[] {
  const scoreMap = Object.fromEntries(diagnosis.pathologies.map((p) => [p.code, p])) as Record<
    PathologyCode,
    PathologySeverity
  >

  return CORRELATIONS.map(({ from, to, r, mechanism }) => {
    const absR = Math.abs(r)
    return {
      from,
      to,
      correlation: r,
      direction: r >= 0 ? 'positive' as const : 'negative' as const,
      strength: absR >= 0.25 ? 'moderate' : 'weak',
      active: scoreMap[from].level >= 2 && scoreMap[to].level >= 2,
      mechanism,
    }
  })
}

// ─── Intervention Protocols ──────────────────────────────────────────────────

const PROTOCOLS: InterventionProtocol[] = [
  {
    id: 'nod-bia-remediation',
    triggerCode: 'ND',
    nameHe: '\u05E8\u05DE\u05D3\u05D9\u05E6\u05D9\u05D9\u05EA NOD→BIA',
    nameEn: 'NOD → BIA Remediation',
    phase: '\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD 1-3',
    components: [
      { step: '\u05D1\u05D9\u05E7\u05D5\u05E8\u05EA BIA \u05D7\u05D9\u05E6\u05D5\u05E0\u05D9\u05EA', detail: '\u05D9\u05D5\u05E2\u05E6\u05D9\u05DD \u05D7\u05D9\u05E6\u05D5\u05E0\u05D9\u05D9\u05DD \u05DE\u05D1\u05E6\u05E2\u05D9\u05DD Business Impact Analysis \u05E2\u05E6\u05DE\u05D0\u05D9 \u05DB\u05D3\u05D9 \u05DC\u05D4\u05EA\u05D2\u05D1\u05E8 \u05E2\u05DC \u05E2\u05D9\u05D5\u05D5\u05E8\u05D5\u05DF \u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D4 \u05E4\u05E0\u05D9\u05DE\u05D9' },
      { step: '\u05E0\u05D9\u05EA\u05D5\u05D7 \u05DC\u05D7\u05E6\u05D9 \u05D9\u05D9\u05E6\u05D5\u05E8', detail: '\u05D6\u05D9\u05D4\u05D5\u05D9 \u05DE\u05E7\u05D5\u05E8\u05D5\u05EA \u05DC\u05D7\u05E5 \u05D3\u05D3\u05DC\u05D9\u05D9\u05E0\u05D9\u05DD \u05D5\u05E2\u05DC\u05D5\u05D9\u05D5\u05EA \u05E9\u05DE\u05E0\u05D9\u05E2\u05D9\u05DD \u05E7\u05D9\u05E6\u05D5\u05E8\u05D9 \u05D3\u05E8\u05DA; \u05D4\u05D4\u05E0\u05D4\u05DC\u05D4 \u05DE\u05D8\u05E4\u05DC\u05EA \u05D1\u05E9\u05D5\u05E8\u05E9\u05D9 \u05D4\u05D1\u05E2\u05D9\u05D4' },
      { step: '\u05DE\u05E2\u05E8\u05DB\u05EA \u05D3\u05D9\u05D5\u05D5\u05D7 near-miss', detail: '\u05D4\u05E7\u05DE\u05EA \u05D3\u05D9\u05D5\u05D5\u05D7 \u05DE\u05D5\u05D1\u05E0\u05D4 \u05DC\u05E1\u05D8\u05D9\u05D5\u05EA \u05E9\u05DC\u05D0 \u05D2\u05E8\u05DE\u05D5 \u05E0\u05D6\u05E7, \u05DE\u05E2\u05E7\u05D1 \u05D0\u05D7\u05E8 \u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D4 \u05DC\u05E4\u05E0\u05D9 \u05D0\u05E1\u05D5\u05DF' },
      { step: '\u05EA\u05D9\u05E2\u05D5\u05D3 \u05E1\u05E3 \u05E1\u05D9\u05DB\u05D5\u05DF', detail: '\u05E7\u05D1\u05D9\u05E2\u05EA \u05E1\u05D8\u05E0\u05D3\u05E8\u05D8\u05D9\u05DD \u05DB\u05EA\u05D5\u05D1\u05D9\u05DD \u05DC\u05E1\u05D9\u05DB\u05D5\u05DF \u05DE\u05E7\u05D5\u05D1\u05DC, \u05DE\u05E2\u05E7\u05D1 \u05E8\u05D1\u05E2\u05D5\u05E0\u05D9 \u05D0\u05D7\u05E8 \u05E1\u05D7\u05D9\u05E4\u05D4' },
    ],
    successMetrics: [
      '\u05D9\u05E8\u05D9\u05D3\u05D4 \u05E9\u05DC ≥1.5 \u05E0\u05E7\u05D5\u05D3\u05D5\u05EA \u05D1\u05E6\u05D9\u05D5\u05DF ND \u05EA\u05D5\u05DA 6 \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD',
      'BIA \u05DE\u05D6\u05D4\u05D4 ≥20% \u05D9\u05D5\u05EA\u05E8 \u05EA\u05DC\u05D5\u05D9\u05D5\u05EA \u05E7\u05E8\u05D9\u05D8\u05D9\u05D5\u05EA \u05DE\u05D4\u05D4\u05E2\u05E8\u05DB\u05D4 \u05D4\u05E7\u05D5\u05D3\u05DE\u05EA',
      '\u05E2\u05DC\u05D9\u05D9\u05D4 \u05D1\u05D3\u05D9\u05D5\u05D5\u05D7\u05D9 near-miss (\u05E9\u05D9\u05E4\u05D5\u05E8 \u05D6\u05D9\u05D4\u05D5\u05D9, \u05DC\u05D0 \u05D4\u05D7\u05DE\u05E8\u05EA \u05DE\u05E6\u05D1)',
    ],
    researchBasis: 'Vaughan (1996) — NOD five-stage progression; Section 4.1 integrated-model.md',
    timelineMonths: 6,
  },
  {
    id: 'learning-exercise-design',
    triggerCode: 'UC',
    nameHe: '\u05DC\u05DE\u05D9\u05D3\u05D4 → \u05E2\u05D9\u05E6\u05D5\u05D1 \u05EA\u05E8\u05D2\u05D5\u05DC\u05D9\u05DD',
    nameEn: 'Learning Deficits → Exercise Design',
    phase: '\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD 1-6',
    components: [
      { step: '\u05D1\u05E0\u05D9\u05D9\u05EA \u05D1\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9', detail: '\u05DE\u05D5\u05D3\u05DC\u05D9\u05E0\u05D2 \u05E4\u05D2\u05D9\u05E2\u05D5\u05EA \u05DE\u05E0\u05D4\u05D9\u05D2\u05D5\u05EA\u05D9, \u05E1\u05E7\u05D9\u05E8\u05D5\u05EA \u05EA\u05E7\u05E8\u05D9\u05D5\u05EA \u05DC\u05DC\u05D0 \u05D4\u05D0\u05E9\u05DE\u05D4, \u05D4\u05DB\u05E9\u05E8\u05EA Just Culture' },
      { step: '\u05E2\u05D9\u05E6\u05D5\u05D1 \u05EA\u05E8\u05D2\u05D9\u05DC\u05D9\u05DD \u05D0\u05D3\u05E4\u05D8\u05D9\u05D1\u05D9', detail: '\u05D4\u05EA\u05D0\u05DE\u05EA \u05EA\u05E8\u05D7\u05D9\u05E9\u05D9 tabletop \u05DC\u05DC\u05D9\u05E7\u05D5\u05D9 \u05DC\u05DE\u05D9\u05D3\u05D4 \u05E1\u05E4\u05E6\u05D9\u05E4\u05D9 — \u05D0\u05DD "\u05D0\u05E0\u05E9\u05D9\u05DD \u05DE\u05E2\u05DE\u05D9\u05D3\u05D9\u05DD \u05E4\u05E0\u05D9\u05DD \u05E9\u05D4\u05DD \u05D9\u05D5\u05D3\u05E2\u05D9\u05DD", \u05DB\u05DC\u05D5\u05DC \u05D0\u05D5\u05E4\u05E6\u05D9\u05D5\u05EA "\u05D0\u05E0\u05D9 \u05DC\u05D0 \u05D9\u05D5\u05D3\u05E2" \u05DE\u05E4\u05D5\u05E8\u05E9\u05D5\u05EA' },
      { step: 'AAR \u05DE\u05D5\u05D1\u05E0\u05D4', detail: '\u05DE\u05E1\u05D2\u05E8\u05EA 4 \u05E9\u05D0\u05DC\u05D5\u05EA: \u05DE\u05D4 \u05D4\u05D9\u05D4 \u05D0\u05DE\u05D5\u05E8 \u05DC\u05E7\u05E8\u05D5\u05EA? \u05DE\u05D4 \u05E7\u05E8\u05D4? \u05DE\u05D4 \u05E2\u05D1\u05D3? \u05DE\u05D4 \u05DC\u05E9\u05E4\u05E8? \u05E2\u05DD \u05EA\u05D9\u05E2\u05D5\u05D3 \u05D5\u05DE\u05E2\u05E7\u05D1' },
      { step: '\u05E0\u05D9\u05D4\u05D5\u05DC \u05D9\u05D3\u05E2', detail: '\u05E9\u05D1\u05D9\u05E8\u05EA \u05E1\u05D9\u05DC\u05D5\u05D0\u05D9\u05DD \u05D3\u05E8\u05DA \u05D4\u05E9\u05EA\u05EA\u05E4\u05D5\u05EA \u05D7\u05D5\u05E6\u05EA-\u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D5\u05EA \u05D1\u05EA\u05E8\u05D2\u05D9\u05DC\u05D9\u05DD \u05D5\u05DE\u05D0\u05D2\u05E8\u05D9 \u05DC\u05DE\u05D9\u05D3\u05D4 \u05DE\u05E9\u05D5\u05EA\u05E4\u05D9\u05DD' },
    ],
    successMetrics: [
      '\u05D9\u05E8\u05D9\u05D3\u05D4 \u05E9\u05DC ≥1.5 \u05E0\u05E7\u05D5\u05D3\u05D5\u05EA \u05D1\u05E6\u05D9\u05D5\u05DF UC \u05EA\u05D5\u05DA 6 \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD',
      '\u05E2\u05DC\u05D9\u05D9\u05D4 \u05E9\u05DC ≥15% \u05D1\u05D4\u05E9\u05EA\u05EA\u05E4\u05D5\u05EA \u05D1\u05EA\u05E8\u05D2\u05D9\u05DC\u05D9\u05DD',
      'AAR \u05DE\u05E4\u05D9\u05E7 ≥5 \u05E9\u05D9\u05E4\u05D5\u05E8\u05D9\u05DD \u05D9\u05E9\u05D9\u05DE\u05D9\u05DD \u05E2\u05DD \u05DE\u05E2\u05E7\u05D1 \u05DE\u05EA\u05D5\u05E2\u05D3',
      '\u05D9\u05E8\u05D9\u05D3\u05D4 \u05D1\u05D8\u05E2\u05D5\u05D9\u05D5\u05EA \u05D7\u05D5\u05D6\u05E8\u05D5\u05EA (\u05DE\u05D3\u05D9\u05D3\u05D4 \u05D3\u05E8\u05DA \u05E0\u05D9\u05EA\u05D5\u05D7 \u05D3\u05E4\u05D5\u05E1\u05D9 \u05EA\u05E7\u05E8\u05D9\u05D5\u05EA)',
    ],
    researchBasis: 'Edmondson (1999) Psychological Safety; Argyris Double-Loop Learning; Section 4.2 integrated-model.md',
    timelineMonths: 6,
  },
  {
    id: 'blame-reporting',
    triggerCode: 'UC',
    nameHe: '\u05EA\u05E8\u05D1\u05D5\u05EA \u05D4\u05D0\u05E9\u05DE\u05D4 → \u05D3\u05D9\u05D5\u05D5\u05D7 \u05DE\u05E9\u05D1\u05E8',
    nameEn: 'Blame Culture → Crisis Reporting',
    phase: '\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD 1-6',
    components: [
      { step: '\u05D4\u05D8\u05DE\u05E2\u05EA Just Culture', detail: '\u05D4\u05DB\u05E9\u05E8\u05EA \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD \u05DC\u05D4\u05D1\u05D7\u05D9\u05DF \u05D1\u05D9\u05DF \u05D8\u05E2\u05D5\u05D9\u05D5\u05EA (\u05D1\u05E2\u05D9\u05D5\u05EA \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05D5\u05EA), \u05D4\u05EA\u05E0\u05D4\u05D2\u05D5\u05EA \u05DE\u05E1\u05D5\u05DB\u05E0\u05EA (\u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D6\u05E6\u05D9\u05D4), \u05D5\u05E4\u05D6\u05D9\u05D6\u05D5\u05EA (\u05D0\u05D7\u05E8\u05D9\u05D5\u05EA \u05D0\u05DE\u05D9\u05EA\u05D9\u05EA)' },
      { step: '\u05E2\u05E8\u05D5\u05E6\u05D9 \u05D3\u05D9\u05D5\u05D5\u05D7 \u05D0\u05E0\u05D5\u05E0\u05D9\u05DE\u05D9\u05D9\u05DD', detail: '\u05D4\u05E7\u05DE\u05EA \u05D3\u05D9\u05D5\u05D5\u05D7 \u05EA\u05E7\u05E8\u05D9\u05D5\u05EA \u05D7\u05E1\u05D5\u05D9 \u05E2\u05DD \u05DE\u05D3\u05D9\u05E0\u05D9\u05D5\u05EA \u05D0\u05D9-\u05EA\u05D2\u05DE\u05D5\u05DC' },
      { step: '\u05DE\u05D5\u05D3\u05DC\u05D9\u05E0\u05D2 \u05E4\u05D2\u05D9\u05E2\u05D5\u05EA \u05DE\u05E0\u05D4\u05D9\u05D2\u05D5\u05EA\u05D9', detail: '\u05DE\u05E0\u05D4\u05DC\u05D9\u05DD \u05D1\u05DB\u05D9\u05E8\u05D9\u05DD \u05DE\u05D5\u05D3\u05D9\u05DD \u05E4\u05D5\u05DE\u05D1\u05D9\u05EA \u05D1\u05D0\u05D9-\u05D5\u05D3\u05D0\u05D5\u05EA, \u05DE\u05D5\u05D3\u05D9\u05DD \u05D1\u05D8\u05E2\u05D5\u05D9\u05D5\u05EA, \u05DE\u05D1\u05E7\u05E9\u05D9\u05DD \u05E7\u05DC\u05D8 \u05E2\u05DC \u05D1\u05E2\u05D9\u05D5\u05EA' },
      { step: '\u05E4\u05E8\u05D5\u05D8\u05D5\u05E7\u05D5\u05DC\u05D9 \u05EA\u05E7\u05E9\u05D5\u05E8\u05EA \u05DE\u05E9\u05D1\u05E8', detail: '\u05E0\u05D4\u05DC\u05D9\u05DD \u05DE\u05E4\u05D5\u05E8\u05E9\u05D9\u05DD \u05DC\u05D3\u05D9\u05D5\u05D5\u05D7 \u05D1\u05D6\u05DE\u05DF \u05D0\u05DE\u05EA \u05D1\u05DE\u05D4\u05DC\u05DA \u05D0\u05D9\u05E8\u05D5\u05E2\u05D9\u05DD \u05E2\u05DD \u05D4\u05D2\u05E0\u05D5\u05EA \u05D1\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9' },
    ],
    successMetrics: [
      '\u05D9\u05E8\u05D9\u05D3\u05D4 \u05E9\u05DC ≥2.0 \u05E0\u05E7\u05D5\u05D3\u05D5\u05EA \u05D1\u05E4\u05E8\u05D9\u05D8\u05D9 UC-crisis \u05EA\u05D5\u05DA 6 \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD',
      '\u05E2\u05DC\u05D9\u05D9\u05D4 \u05E9\u05DC ≥25% \u05D1\u05D3\u05D9\u05D5\u05D5\u05D7\u05D9 \u05EA\u05E7\u05E8\u05D9\u05D5\u05EA (\u05E9\u05D9\u05E4\u05D5\u05E8 \u05D6\u05D9\u05D4\u05D5\u05D9)',
      '≥70% \u05DE\u05D4\u05E2\u05D5\u05D1\u05D3\u05D9\u05DD \u05DE\u05E8\u05D2\u05D9\u05E9\u05D9\u05DD \u05D1\u05D8\u05D5\u05D7\u05D9\u05DD \u05DC\u05D3\u05D5\u05D5\u05D7 \u05E2\u05DC \u05D1\u05E2\u05D9\u05D5\u05EA (\u05E1\u05E7\u05E8 \u05D0\u05E0\u05D5\u05E0\u05D9\u05DE\u05D9)',
      '\u05E6\u05D5\u05E4\u05D9 \u05EA\u05E8\u05D2\u05D9\u05DC\u05D9 \u05DE\u05E9\u05D1\u05E8 \u05DE\u05EA\u05E2\u05D3\u05D9\u05DD \u05D9\u05E8\u05D9\u05D3\u05D4 \u05D1\u05EA\u05E7\u05E9\u05D5\u05E8\u05EA \u05DE\u05D1\u05D5\u05E1\u05E1\u05EA-\u05E4\u05D7\u05D3',
    ],
    researchBasis: 'Munn et al. (2023) — psychological safety mediation; Edmondson (1999); Section 4.3 integrated-model.md',
    timelineMonths: 6,
  },
  {
    id: 'structural-clarity-remediation',
    triggerCode: 'SC',
    nameHe: '\u05EA\u05D9\u05E7\u05D5\u05DF \u05E2\u05DE\u05D9\u05DE\u05D5\u05EA \u05DE\u05D1\u05E0\u05D9\u05EA',
    nameEn: 'Structural Clarity Remediation',
    phase: '\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD 1-4',
    components: [
      { step: '\u05DE\u05D9\u05E4\u05D5\u05D9 \u05EA\u05E4\u05E7\u05D9\u05D3\u05D9\u05DD \u05D5\u05D0\u05D7\u05E8\u05D9\u05D5\u05EA (RACI)', detail: '\u05D4\u05D2\u05D3\u05E8\u05EA \u05DE\u05D8\u05E8\u05D9\u05E6\u05EA RACI \u05DC\u05DB\u05DC \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8 \u05D5\u05EA\u05D4\u05DC\u05D9\u05DA \u05DC\u05D9\u05D1\u05D4 — Responsible, Accountable, Consulted, Informed' },
      { step: '\u05EA\u05D9\u05E2\u05D5\u05D3 \u05EA\u05D4\u05DC\u05D9\u05DB\u05D9\u05DD \u05E7\u05E8\u05D9\u05D8\u05D9\u05D9\u05DD', detail: '\u05DE\u05D9\u05E4\u05D5\u05D9 \u05D5\u05EA\u05D9\u05E2\u05D5\u05D3 5-10 \u05EA\u05D4\u05DC\u05D9\u05DB\u05D9\u05DD \u05E7\u05E8\u05D9\u05D8\u05D9\u05D9\u05DD; \u05E9\u05DE\u05D9\u05E8\u05D4 \u05D1-Wiki \u05E0\u05D2\u05D9\u05E9 \u05DC\u05DB\u05D5\u05DC\u05DD' },
      { step: '\u05E4\u05E8\u05D5\u05D8\u05D5\u05E7\u05D5\u05DC \u05E7\u05D1\u05DC\u05EA \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA', detail: '\u05E7\u05D1\u05D9\u05E2\u05EA \u05DE\u05D9 \u05DE\u05D7\u05DC\u05D9\u05D8 \u05D1\u05DB\u05DC \u05E1\u05D5\u05D2 \u05D4\u05D7\u05DC\u05D8\u05D4 (\u05DE\u05DE\u05E9\u05DC \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA) + SLA \u05DC\u05EA\u05D2\u05D5\u05D1\u05D4' },
      { step: '\u05EA\u05D5\u05DB\u05E0\u05D9\u05EA \u05D4\u05E2\u05D1\u05E8\u05EA \u05D9\u05D3\u05E2', detail: '\u05DE\u05E0\u05D2\u05E0\u05D5\u05E0\u05D9\u05DD \u05DC\u05DE\u05E0\u05D9\u05E2\u05EA Single Point of Failure: \u05EA\u05D9\u05E2\u05D5\u05D3, \u05E4\u05D9\u05E6\u05D5\u05DC \u05D9\u05D3\u05E2, Buddy System' },
    ],
    successMetrics: [
      '\u05D9\u05E8\u05D9\u05D3\u05D4 \u05E9\u05DC ≥1.5 \u05E0\u05E7\u05D5\u05D3\u05D5\u05EA \u05D1\u05E6\u05D9\u05D5\u05DF SC \u05EA\u05D5\u05DA 4 \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD',
      '≥80% \u05DE\u05D4\u05EA\u05D4\u05DC\u05D9\u05DB\u05D9\u05DD \u05D4\u05E7\u05E8\u05D9\u05D8\u05D9\u05D9\u05DD \u05DE\u05EA\u05D5\u05E2\u05D3\u05D9\u05DD \u05D5\u05E0\u05D2\u05D9\u05E9\u05D9\u05DD',
      '≥70% \u05DE\u05D4\u05E2\u05D5\u05D1\u05D3\u05D9\u05DD \u05D9\u05D5\u05D3\u05E2\u05D9\u05DD \u05DE\u05D9 \u05DE\u05D7\u05DC\u05D9\u05D8 \u05D1\u05DB\u05DC \u05E0\u05D5\u05E9\u05D0 \u05E2\u05D9\u05E7\u05E8\u05D9 (\u05E1\u05E7\u05E8)',
    ],
    researchBasis: 'Simon (1947) — Bounded Rationality; Weick (1979) — Organizing; Phase 4 MECE fourth dimension',
    timelineMonths: 4,
  },
  {
    id: 'integrated-system',
    triggerCode: 'MULTI',
    nameHe: '\u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA \u05DE\u05E9\u05D5\u05DC\u05D1\u05EA',
    nameEn: 'Integrated System Intervention',
    phase: '\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD 1-9',
    components: [
      { step: 'Phase 1 — \u05D4\u05E4\u05D7\u05EA\u05EA DR (\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD 1-3)', detail: '\u05D0\u05E8\u05D2\u05D5\u05DF \u05DE\u05D7\u05D3\u05E9 \u05E9\u05DC \u05EA\u05D2\u05DE\u05D5\u05DC\u05D9\u05DD \u05DC\u05E9\u05D9\u05EA\u05D5\u05E3 \u05E4\u05E2\u05D5\u05DC\u05D4, \u05EA\u05DE\u05E8\u05D9\u05E6\u05D9 \u05E9\u05D9\u05EA\u05D5\u05E3 \u05DE\u05D9\u05D3\u05E2, \u05DE\u05D9\u05E1\u05D2\u05D5\u05E8 \u05DE\u05D7\u05D3\u05E9 \u05E9\u05DC \u05DE\u05D3\u05D3\u05D9 \u05D4\u05E6\u05DC\u05D7\u05D4 \u05DC-"win-win"' },
      { step: 'Phase 2 — \u05D8\u05D9\u05E4\u05D5\u05DC \u05D1-ND (\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD 4-6)', detail: '\u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA \u05D7\u05D9\u05E6\u05D5\u05E0\u05D9\u05D5\u05EA, \u05D4\u05E4\u05D7\u05EA\u05EA \u05DC\u05D7\u05E6\u05D9 \u05D9\u05D9\u05E6\u05D5\u05E8, \u05DE\u05E2\u05E8\u05DB\u05D5\u05EA near-miss' },
      { step: 'Phase 3 — \u05D1\u05E0\u05D9\u05D9\u05EA UC (\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD 7-9)', detail: '\u05D1\u05D8\u05D7\u05D5\u05DF \u05E4\u05E1\u05D9\u05DB\u05D5\u05DC\u05D5\u05D2\u05D9, \u05E2\u05D9\u05E6\u05D5\u05D1 \u05DE\u05D7\u05D3\u05E9 \u05E9\u05DC \u05EA\u05E8\u05D2\u05D9\u05DC\u05D9\u05DD, \u05E0\u05D9\u05D4\u05D5\u05DC \u05D9\u05D3\u05E2' },
    ],
    successMetrics: [
      '\u05DB\u05DC \u05D4\u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA \u05DE\u05EA\u05D7\u05EA \u05DC\u05E1\u05E3 \u05D4\u05EA\u05E2\u05E8\u05D1\u05D5\u05EA (DR < 6.0, ND < 6.0, UC < 5.0) \u05EA\u05D5\u05DA 12 \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD',
      '\u05E9\u05D9\u05E4\u05D5\u05E8 \u05D1\u05DE\u05D3\u05D3\u05D9 \u05D0\u05E4\u05E7\u05D8\u05D9\u05D1\u05D9\u05D5\u05EA BCM (\u05D0\u05D9\u05DB\u05D5\u05EA BIA, \u05D1\u05D9\u05E6\u05D5\u05E2\u05D9 \u05EA\u05E8\u05D2\u05D9\u05DC\u05D9\u05DD, \u05D3\u05D9\u05D5\u05D5\u05D7 \u05EA\u05E7\u05E8\u05D9\u05D5\u05EA)',
      '\u05E2\u05DC\u05D9\u05D9\u05D4 \u05D1\u05DE\u05D7\u05D5\u05D1\u05E8\u05D5\u05EA \u05E2\u05D5\u05D1\u05D3\u05D9\u05DD',
      '\u05D9\u05D9\u05E6\u05D5\u05D1 \u05D0\u05D5 \u05E9\u05D9\u05E4\u05D5\u05E8 \u05D1\u05D9\u05E6\u05D5\u05E2\u05D9\u05DD \u05D0\u05E8\u05D2\u05D5\u05E0\u05D9\u05D9\u05DD (\u05EA\u05D7\u05DC\u05D5\u05E4\u05D4, \u05D0\u05D9\u05DB\u05D5\u05EA, \u05DE\u05D3\u05D3\u05D9 \u05D1\u05D8\u05D9\u05D7\u05D5\u05EA)',
    ],
    researchBasis: 'DR → ND → UC cascade evidence; Network model best AIC; Section 4.4 integrated-model.md',
    timelineMonths: 12,
  },
]

/**
 * Returns applicable intervention protocols based on diagnosis.
 * Protocol 4.3 (Blame→Reporting) triggers only when UC is elevated AND semantic drift is high.
 */
export function getInterventionProtocols(
  diagnosis: DSMDiagnosis,
  answers?: QuestionnaireAnswer
): InterventionProtocol[] {
  const scoreMap = Object.fromEntries(diagnosis.pathologies.map((p) => [p.code, p])) as Record<
    PathologyCode,
    PathologySeverity
  >

  const result: InterventionProtocol[] = []
  const level2Plus = diagnosis.pathologies.filter((p) => p.level >= 2)

  // Protocol 4.1: NOD → BIA Remediation
  if (scoreMap.ND.level >= 2) {
    result.push(PROTOCOLS[0])
  }

  // Protocol 4.2: Learning → Exercise Design
  if (scoreMap.UC.level >= 2) {
    result.push(PROTOCOLS[1])
  }

  // Protocol 4.3: Blame → Reporting (UC elevated + high semantic drift)
  if (scoreMap.UC.level >= 2 && answers?.pathologySemantic === 'high_drift') {
    result.push(PROTOCOLS[2])
  }

  // Protocol SC: Structural Clarity Remediation
  if (scoreMap.SC && scoreMap.SC.level >= 2) {
    result.push(PROTOCOLS[3]) // structural-clarity-remediation
  }

  // Protocol 4.4: Integrated System (2+ pathologies at Level 2+)
  if (level2Plus.length >= 2) {
    result.push(PROTOCOLS[4])
  }

  return result
}

// ─── Severity Profile Metadata ───────────────────────────────────────────────

export const SEVERITY_PROFILES: Record<SeverityProfile, { labelHe: string; color: string; bgColor: string; borderColor: string }> = {
  'healthy': { labelHe: '\u05EA\u05E7\u05D9\u05DF — \u05D0\u05D9\u05DF \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA \u05DE\u05D6\u05D5\u05D4\u05D5\u05EA', color: 'text-emerald-400', bgColor: 'bg-emerald-950/30', borderColor: 'border-emerald-500' },
  'at-risk': { labelHe: '\u05D1\u05E1\u05D9\u05DB\u05D5\u05DF — \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05DE\u05EA\u05D5\u05E0\u05D4 \u05DE\u05D6\u05D5\u05D4\u05D4', color: 'text-yellow-400', bgColor: 'bg-yellow-950/20', borderColor: 'border-yellow-500' },
  'critical': { labelHe: '\u05E7\u05E8\u05D9\u05D8\u05D9 — \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05D7\u05DE\u05D5\u05E8\u05D4 \u05DE\u05D6\u05D5\u05D4\u05D4', color: 'text-red-400', bgColor: 'bg-red-950/30', borderColor: 'border-red-500' },
  'systemic-collapse': { labelHe: '\u05E7\u05E8\u05D9\u05E1\u05D4 \u05DE\u05E2\u05E8\u05DB\u05EA\u05D9\u05EA — \u05DE\u05E1\u05E4\u05E8 \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA \u05D7\u05DE\u05D5\u05E8\u05D5\u05EA', color: 'text-red-300', bgColor: 'bg-red-950/40', borderColor: 'border-red-400' },
}

export const LEVEL_COLORS: Record<SeverityLevel, { text: string; bg: string; bar: string }> = {
  1: { text: 'text-emerald-400', bg: 'bg-emerald-500', bar: 'bg-emerald-500' },
  2: { text: 'text-yellow-400', bg: 'bg-yellow-400', bar: 'bg-yellow-400' },
  3: { text: 'text-red-400', bg: 'bg-red-500', bar: 'bg-red-500' },
}

// ─── T/A/M Signature Computation ─────────────────────────────────────────────

/**
 * Compute the T/A/M cost vector for a diagnosis.
 * Weighted average of canonical pathology signatures by severity score.
 */
export function computeTAMSignature(diagnosis: DSMDiagnosis): TAMSignature {
  let totalWeight = 0
  let wT = 0, wA = 0, wM = 0

  for (const p of diagnosis.pathologies) {
    if (p.level < 2) continue // only count moderate+ pathologies
    const sig = TAM_SIGNATURES[p.code as ExtendedPathologyCode]
    if (!sig) continue
    const weight = p.score
    wT += sig.T * weight
    wA += sig.A * weight
    wM += sig.M * weight
    totalWeight += weight
  }

  if (totalWeight === 0) return { T: 1, A: 1, M: 1 }
  return {
    T: Math.min(5, Math.round((wT / totalWeight) * 10) / 10),
    A: Math.min(5, Math.round((wA / totalWeight) * 10) / 10),
    M: Math.min(5, Math.round((wM / totalWeight) * 10) / 10),
  }
}

// ─── Cascade State Detection ─────────────────────────────────────────────────

/**
 * Detect Cascade State (CS) — systemic cross-pathology failure.
 * Triggers when 3+ pathologies at severity 3 with high entropy.
 */
export function detectCascadeState(diagnosis: DSMDiagnosis): CascadeStateInfo {
  const severeCount = diagnosis.pathologies.filter(p => p.level === 3).length
  const isActive = severeCount >= 3 || (severeCount >= 2 && diagnosis.totalEntropyScore >= 32)

  return {
    isActive,
    concurrentSevereCount: severeCount,
    triggerDescription: isActive
      ? `\u05DE\u05E6\u05D1 \u05E7\u05E1\u05E7\u05D3\u05D4: ${severeCount} \u05E4\u05EA\u05D5\u05DC\u05D5\u05D2\u05D9\u05D5\u05EA \u05D1\u05E8\u05DE\u05EA \u05D7\u05D5\u05DE\u05E8\u05D4 3 \u05E2\u05DD \u05D0\u05E0\u05D8\u05E8\u05D5\u05E4\u05D9\u05D4 ${diagnosis.totalEntropyScore.toFixed(1)}. \u05E0\u05D3\u05E8\u05E9\u05EA \u05E2\u05E6\u05D9\u05E8\u05EA \u05DB\u05DC \u05D4\u05D9\u05D5\u05D6\u05DE\u05D5\u05EA (Halt).`
      : '\u05DC\u05D0 \u05D6\u05D5\u05D4\u05D4 \u05DE\u05E6\u05D1 \u05E7\u05E1\u05E7\u05D3\u05D4.',
    haltRequired: isActive,
  }
}

// ─── Sequencing Violation Detection ──────────────────────────────────────────

/**
 * Check if any comorbidity sequencing rules are being violated.
 * Returns list of violations where prerequisite pathology is not resolved.
 */
export function detectSequencingViolations(diagnosis: DSMDiagnosis): SequencingViolation[] {
  const scoreMap = Object.fromEntries(
    diagnosis.pathologies.map(p => [p.code, p])
  ) as Record<PathologyCode, PathologySeverity>

  const violations: SequencingViolation[] = []

  for (const rule of SEQUENCING_RULES) {
    const prereqPath = scoreMap[rule.prerequisite as PathologyCode]
    const blockedPath = scoreMap[rule.blocked as PathologyCode]
    if (!prereqPath || !blockedPath) continue

    // Violation: both are elevated but prerequisite is not addressed first
    if (prereqPath.level >= 2 && blockedPath.level >= 2) {
      violations.push({
        ruleId: rule.id,
        condition: rule.condition,
        prerequisite: rule.prerequisite,
        blocked: rule.blocked,
        rationale: rule.rationale,
        severity: rule.severity,
      })
    }
  }

  return violations
}

/**
 * Enhanced diagnosis with T/A/M, Cascade State and Sequencing.
 * Wraps the base diagnose() function with v2 extensions.
 */
export function diagnoseEnhanced(answers: QuestionnaireAnswer): DSMDiagnosis {
  const baseDiagnosis = diagnose(answers)
  return {
    ...baseDiagnosis,
    tamSignature: computeTAMSignature(baseDiagnosis),
    cascadeState: detectCascadeState(baseDiagnosis),
    sequencingViolations: detectSequencingViolations(baseDiagnosis),
  }
}
