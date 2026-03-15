/**
 * DSM Engine — Organizational DSM Diagnostic Engine
 *
 * Maps COR-SYS questionnaire answers to research-backed diagnostic codes,
 * comorbidity analysis, and intervention protocols.
 *
 * Based on: integrated-model.md (N=10,000 simulation)
 * Pathologies: DR (Distorted Reciprocity), ND (Normalization of Deviance), UC (Unrepresentative Calibration)
 * Correlations: DR↔ND r=.19, DR↔UC r=-.27, ND↔UC r=.28
 * Psychometrics: α DR=.872, ND=.881, UC=.893
 */

import type { QuestionnaireAnswer } from './corsys-questionnaire'

// ─── Types ───────────────────────────────────────────────────────────────────

export type PathologyCode = 'DR' | 'ND' | 'UC'
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
  codes: string[]                     // ["DR-2", "ND-3", "UC-1"]
  primaryDiagnosis: PathologyCode     // הפתולוגיה החמורה ביותר
  severityProfile: SeverityProfile
  pathologies: PathologySeverity[]
  totalEntropyScore: number           // 0–30 (סכום ציוני חומרה)
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
}

const LEVEL_LABELS: Record<SeverityLevel, string> = {
  1: 'תפקוד תקין (subclinical)',
  2: 'פתולוגיה מתונה (moderate)',
  3: 'פתולוגיה חמורה (severe)',
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

const LATENCY_MODIFIER: Record<string, number> = {
  over_15: 1.5,
  '5_to_15': 0.5,
  under_5: 0,
}

function scoreToLevel(score: number): SeverityLevel {
  if (score <= 3.0) return 1
  if (score <= 6.5) return 2
  return 3
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

  // DR score
  const drBase = DR_SCORES[answers.pathologyZeroSum ?? 'rare'] ?? 1.5
  const drScore = clampScore(drBase + (drBase > 3.0 ? latencyMod : 0))
  const drContributors = ['pathologyZeroSum']
  if (latencyMod > 0 && drBase > 3.0) drContributors.push('decisionLatency')

  // ND score
  const ndBase = ND_SCORES[answers.pathologyNod ?? 'low'] ?? 1.5
  const ndScore = clampScore(ndBase + (ndBase > 3.0 ? latencyMod : 0))
  const ndContributors = ['pathologyNod']
  if (latencyMod > 0 && ndBase > 3.0) ndContributors.push('decisionLatency')

  // UC score (average of learning + semantic)
  const ucLearning = UC_LEARNING_SCORES[answers.pathologyLearning ?? 'double_loop'] ?? 1.0
  const ucSemantic = UC_SEMANTIC_SCORES[answers.pathologySemantic ?? 'low_drift'] ?? 1.0
  const ucBase = (ucLearning + ucSemantic) / 2
  const ucScore = clampScore(ucBase + (ucBase > 3.0 ? latencyMod : 0))
  const ucContributors = ['pathologyLearning', 'pathologySemantic']
  if (latencyMod > 0 && ucBase > 3.0) ucContributors.push('decisionLatency')

  const pathologies: PathologySeverity[] = [
    {
      code: 'DR',
      nameHe: PATHOLOGY_NAMES.DR.he,
      nameEn: PATHOLOGY_NAMES.DR.en,
      score: drScore,
      level: scoreToLevel(drScore),
      levelLabel: LEVEL_LABELS[scoreToLevel(drScore)],
      contributors: drContributors,
    },
    {
      code: 'ND',
      nameHe: PATHOLOGY_NAMES.ND.he,
      nameEn: PATHOLOGY_NAMES.ND.en,
      score: ndScore,
      level: scoreToLevel(ndScore),
      levelLabel: LEVEL_LABELS[scoreToLevel(ndScore)],
      contributors: ndContributors,
    },
    {
      code: 'UC',
      nameHe: PATHOLOGY_NAMES.UC.he,
      nameEn: PATHOLOGY_NAMES.UC.en,
      score: ucScore,
      level: scoreToLevel(ucScore),
      levelLabel: LEVEL_LABELS[scoreToLevel(ucScore)],
      contributors: ucContributors,
    },
  ]

  const codes = pathologies.map((p) => `${p.code}-${p.level}`)
  const primary = pathologies.reduce((max, p) => (p.score > max.score ? p : max)).code
  const severityProfile = computeSeverityProfile(pathologies)
  const totalEntropyScore = drScore + ndScore + ucScore

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
  latencyHours: number = 0
): DSMDiagnosis {
  const latencyMod = latencyHours > 15 ? 1.5 : latencyHours >= 5 ? 0.5 : 0

  const dr = clampScore(drScore + (drScore > 3.0 ? latencyMod : 0))
  const nd = clampScore(ndScore + (ndScore > 3.0 ? latencyMod : 0))
  const uc = clampScore(ucScore + (ucScore > 3.0 ? latencyMod : 0))

  const pathologies: PathologySeverity[] = [
    {
      code: 'DR', nameHe: PATHOLOGY_NAMES.DR.he, nameEn: PATHOLOGY_NAMES.DR.en,
      score: dr, level: scoreToLevel(dr), levelLabel: LEVEL_LABELS[scoreToLevel(dr)],
      contributors: ['direct-input'],
    },
    {
      code: 'ND', nameHe: PATHOLOGY_NAMES.ND.he, nameEn: PATHOLOGY_NAMES.ND.en,
      score: nd, level: scoreToLevel(nd), levelLabel: LEVEL_LABELS[scoreToLevel(nd)],
      contributors: ['direct-input'],
    },
    {
      code: 'UC', nameHe: PATHOLOGY_NAMES.UC.he, nameEn: PATHOLOGY_NAMES.UC.en,
      score: uc, level: scoreToLevel(uc), levelLabel: LEVEL_LABELS[scoreToLevel(uc)],
      contributors: ['direct-input'],
    },
  ]

  const codes = pathologies.map((p) => `${p.code}-${p.level}`)
  const primary = pathologies.reduce((max, p) => (p.score > max.score ? p : max)).code
  const severityProfile = computeSeverityProfile(pathologies)
  const totalEntropyScore = dr + nd + uc

  return { codes, primaryDiagnosis: primary, severityProfile, pathologies, totalEntropyScore }
}

function computeSeverityProfile(pathologies: PathologySeverity[]): SeverityProfile {
  const level3Count = pathologies.filter((p) => p.level === 3).length
  const level2Count = pathologies.filter((p) => p.level === 2).length

  if (level3Count >= 2) return 'systemic-collapse'
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

  // Protocol 4.4: Integrated System (2+ pathologies at Level 2+)
  if (level2Plus.length >= 2) {
    result.push(PROTOCOLS[3])
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
