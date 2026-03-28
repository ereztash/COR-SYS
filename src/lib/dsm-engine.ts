/**
 * DSM Engine — Organizational DSM Diagnostic Engine
 *
 * Maps COR-SYS questionnaire answers to research-backed diagnostic codes,
 * comorbidity analysis, and intervention protocols.
 *
 * Based on: integrated-model.md (N=10,000 simulation)
 * Pathologies: DR (Distorted Reciprocity), ND (Normalization of Deviance), UC (Unrepresentative Calibration)
 * Extended (v2): ZSG (Zero Safety Ground), CLT (Cognitive Load Trap), OLD (Organizational Learning Deficit)
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
  levelLabel: string       // תיאור בעברית
  contributors: string[]   // שאלות שתרמו לציון
}

export interface DSMDiagnosis {
  codes: string[]                     // ["DR-2", "ND-3", "UC-1", "SC-2"]
  primaryDiagnosis: PathologyCode     // הפתולוגיה החמורה ביותר
  severityProfile: SeverityProfile
  pathologies: PathologySeverity[]
  totalEntropyScore: number           // 0–40 (סכום ציוני חומרה — 4 ממדים)
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
  DR: { he: 'הדדיות מעוותת', en: 'Distorted Reciprocity' },
  ND: { he: 'נורמליזציית סטייה', en: 'Normalization of Deviance' },
  UC: { he: 'כיול לא-מייצג', en: 'Unrepresentative Calibration' },
  SC: { he: 'עמימות מבנית', en: 'Structural Clarity Deficit' },
}

const LEVEL_LABELS: Record<SeverityLevel, string> = {
  1: 'תפקוד תקין / subclinical',
  2: 'פתולוגיה מתונה / בינונית',
  3: 'פתולוגיה חמורה / גבוהה',
}

/** Research-based correlations from N=10,000 simulation */
const CORRELATIONS: { from: PathologyCode; to: PathologyCode; r: number; mechanism: string }[] = [
  {
    from: 'DR', to: 'ND', r: 0.19,
    mechanism: 'תחרות פנימית מייצרת לחץ ייצור שמנרמל סטיות מנהלים — הצלחה במדדים דורשת עקיפת נהלים',
  },
  {
    from: 'DR', to: 'UC', r: -0.27,
    mechanism: 'תחרות מעכבת למידה ארגונית — בסביבה תחרותית, הודאה בטעות = חולשה; בטחון פסיכולוגי נפגע',
  },
  {
    from: 'ND', to: 'UC', r: 0.28,
    mechanism: 'נורמליזציית סטיות פוגעת ביכולת הלמידה מטעויות — כשסטיות נתפסות כנורמליות, אין trigger ללמידה',
  },
  {
    from: 'SC', to: 'DR', r: 0.32,
    mechanism: 'עמימות מבנית מייצרת ואקום סמכותי שמגביר מאבקי בעלות ותחרות פנימית',
  },
  {
    from: 'SC', to: 'ND', r: 0.24,
    mechanism: 'כאשר מבנה ותהליכים אינם ברורים, מעקפים הופכים לברירת מחדל תפעולית',
  },
  {
    from: 'SC', to: 'UC', r: 0.18,
    mechanism: 'חוסר בהירות מבנית מחליש sensemaking ופוגע ביכולת כיול ולמידה מערכתית',
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
  // ספים מותאמים לסקאלה היוריסטית:
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

  // אם גם למידה single_loop וגם סחיפה סמנטית גבוהה — UC תמיד ברמת 3
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

  // קריסה מערכתית דורשת גם עומס אנטרופיה גבוה, לא רק שתי פתולוגיות חמורות
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
    nameHe: 'רמדיציית NOD→BIA',
    nameEn: 'NOD → BIA Remediation',
    phase: 'חודשים 1-3',
    components: [
      { step: 'ביקורת BIA חיצונית', detail: 'יועצים חיצוניים מבצעים Business Impact Analysis עצמאי כדי להתגבר על עיוורון נורמליזציה פנימי' },
      { step: 'ניתוח לחצי ייצור', detail: 'זיהוי מקורות לחץ דדליינים ועלויות שמניעים קיצורי דרך; ההנהלה מטפלת בשורשי הבעיה' },
      { step: 'מערכת דיווח near-miss', detail: 'הקמת דיווח מובנה לסטיות שלא גרמו נזק, מעקב אחר נורמליזציה לפני אסון' },
      { step: 'תיעוד סף סיכון', detail: 'קביעת סטנדרטים כתובים לסיכון מקובל, מעקב רבעוני אחר סחיפה' },
    ],
    successMetrics: [
      'ירידה של ≥1.5 נקודות בציון ND תוך 6 חודשים',
      'BIA מזהה ≥20% יותר תלויות קריטיות מההערכה הקודמת',
      'עלייה בדיווחי near-miss (שיפור זיהוי, לא החמרת מצב)',
    ],
    researchBasis: 'Vaughan (1996) — NOD five-stage progression; Section 4.1 integrated-model.md',
    timelineMonths: 6,
  },
  {
    id: 'learning-exercise-design',
    triggerCode: 'UC',
    nameHe: 'למידה → עיצוב תרגולים',
    nameEn: 'Learning Deficits → Exercise Design',
    phase: 'חודשים 1-6',
    components: [
      { step: 'בניית בטחון פסיכולוגי', detail: 'מודלינג פגיעות מנהיגותי, סקירות תקריות ללא האשמה, הכשרת Just Culture' },
      { step: 'עיצוב תרגילים אדפטיבי', detail: 'התאמת תרחישי tabletop לליקוי למידה ספציפי — אם "אנשים מעמידים פנים שהם יודעים", כלול אופציות "אני לא יודע" מפורשות' },
      { step: 'AAR מובנה', detail: 'מסגרת 4 שאלות: מה היה אמור לקרות? מה קרה? מה עבד? מה לשפר? עם תיעוד ומעקב' },
      { step: 'ניהול ידע', detail: 'שבירת סילואים דרך השתתפות חוצת-פונקציות בתרגילים ומאגרי למידה משותפים' },
    ],
    successMetrics: [
      'ירידה של ≥1.5 נקודות בציון UC תוך 6 חודשים',
      'עלייה של ≥15% בהשתתפות בתרגילים',
      'AAR מפיק ≥5 שיפורים ישימים עם מעקב מתועד',
      'ירידה בטעויות חוזרות (מדידה דרך ניתוח דפוסי תקריות)',
    ],
    researchBasis: 'Edmondson (1999) Psychological Safety; Argyris Double-Loop Learning; Section 4.2 integrated-model.md',
    timelineMonths: 6,
  },
  {
    id: 'blame-reporting',
    triggerCode: 'UC',
    nameHe: 'תרבות האשמה → דיווח משבר',
    nameEn: 'Blame Culture → Crisis Reporting',
    phase: 'חודשים 1-6',
    components: [
      { step: 'הטמעת Just Culture', detail: 'הכשרת מנהלים להבחין בין טעויות (בעיות מערכתיות), התנהגות מסוכנת (נורמליזציה), ופזיזות (אחריות אמיתית)' },
      { step: 'ערוצי דיווח אנונימיים', detail: 'הקמת דיווח תקריות חסוי עם מדיניות אי-תגמול' },
      { step: 'מודלינג פגיעות מנהיגותי', detail: 'מנהלים בכירים מודים פומבית באי-ודאות, מודים בטעויות, מבקשים קלט על בעיות' },
      { step: 'פרוטוקולי תקשורת משבר', detail: 'נהלים מפורשים לדיווח בזמן אמת במהלך אירועים עם הגנות בטחון פסיכולוגי' },
    ],
    successMetrics: [
      'ירידה של ≥2.0 נקודות בפריטי UC-crisis תוך 6 חודשים',
      'עלייה של ≥25% בדיווחי תקריות (שיפור זיהוי)',
      '≥70% מהעובדים מרגישים בטוחים לדווח על בעיות (סקר אנונימי)',
      'צופי תרגילי משבר מתעדים ירידה בתקשורת מבוססת-פחד',
    ],
    researchBasis: 'Munn et al. (2023) — psychological safety mediation; Edmondson (1999); Section 4.3 integrated-model.md',
    timelineMonths: 6,
  },
  {
    id: 'structural-clarity-remediation',
    triggerCode: 'SC',
    nameHe: 'תיקון עמימות מבנית',
    nameEn: 'Structural Clarity Remediation',
    phase: 'חודשים 1-4',
    components: [
      { step: 'מיפוי תפקידים ואחריות (RACI)', detail: 'הגדרת מטריצת RACI לכל פרויקט ותהליך ליבה — Responsible, Accountable, Consulted, Informed' },
      { step: 'תיעוד תהליכים קריטיים', detail: 'מיפוי ותיעוד 5-10 תהליכים קריטיים; שמירה ב-Wiki נגיש לכולם' },
      { step: 'פרוטוקול קבלת החלטות', detail: 'קביעת מי מחליט בכל סוג החלטה (ממשל החלטות) + SLA לתגובה' },
      { step: 'תוכנית העברת ידע', detail: 'מנגנונים למניעת Single Point of Failure: תיעוד, פיצול ידע, Buddy System' },
    ],
    successMetrics: [
      'ירידה של ≥1.5 נקודות בציון SC תוך 4 חודשים',
      '≥80% מהתהליכים הקריטיים מתועדים ונגישים',
      '≥70% מהעובדים יודעים מי מחליט בכל נושא עיקרי (סקר)',
    ],
    researchBasis: 'Simon (1947) — Bounded Rationality; Weick (1979) — Organizing; Phase 4 MECE fourth dimension',
    timelineMonths: 4,
  },
  {
    id: 'integrated-system',
    triggerCode: 'MULTI',
    nameHe: 'התערבות מערכתית משולבת',
    nameEn: 'Integrated System Intervention',
    phase: 'חודשים 1-9',
    components: [
      { step: 'Phase 1 — הפחתת DR (חודשים 1-3)', detail: 'ארגון מחדש של תגמולים לשיתוף פעולה, תמריצי שיתוף מידע, מיסגור מחדש של מדדי הצלחה ל-"win-win"' },
      { step: 'Phase 2 — טיפול ב-ND (חודשים 4-6)', detail: 'ביקורות חיצוניות, הפחתת לחצי ייצור, מערכות near-miss' },
      { step: 'Phase 3 — בניית UC (חודשים 7-9)', detail: 'בטחון פסיכולוגי, עיצוב מחדש של תרגילים, ניהול ידע' },
    ],
    successMetrics: [
      'כל הפתולוגיות מתחת לסף התערבות (DR < 6.0, ND < 6.0, UC < 5.0) תוך 12 חודשים',
      'שיפור במדדי אפקטיביות BCM (איכות BIA, ביצועי תרגילים, דיווח תקריות)',
      'עלייה במחוברות עובדים',
      'ייצוב או שיפור ביצועים ארגוניים (תחלופה, איכות, מדדי בטיחות)',
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
  'healthy': { labelHe: 'תקין — אין פתולוגיות מזוהות', color: 'text-emerald-400', bgColor: 'bg-emerald-950/30', borderColor: 'border-emerald-500' },
  'at-risk': { labelHe: 'בסיכון — פתולוגיה מתונה מזוהה', color: 'text-yellow-400', bgColor: 'bg-yellow-950/20', borderColor: 'border-yellow-500' },
  'critical': { labelHe: 'קריטי — פתולוגיה חמורה מזוהה', color: 'text-red-400', bgColor: 'bg-red-950/30', borderColor: 'border-red-500' },
  'systemic-collapse': { labelHe: 'קריסה מערכתית — מספר פתולוגיות חמורות', color: 'text-red-300', bgColor: 'bg-red-950/40', borderColor: 'border-red-400' },
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
      ? `מצב קסקדה: ${severeCount} פתולוגיות ברמת חומרה 3 עם אנטרופיה ${diagnosis.totalEntropyScore.toFixed(1)}. נדרשת עצירת כל היוזמות (Halt).`
      : 'לא זוהה מצב קסקדה.',
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
