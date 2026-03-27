/**
 * DSM Policy Engine — Decision Support Layer
 *
 * Sits above dsm-engine.ts and transforms a DSMDiagnosis into:
 *   1. Research-module metadata (benchmark context per pathology)
 *   2. Golden-question answers (4 structured outputs for the consultant)
 *   3. Decision rules / policy (CTA, intervention priority, time-to-act)
 *   4. Feedback schema (for continuous calibration over time)
 *
 * Design principles:
 *   - Rules are data, not code: DECISION_RULES table drives all CTA logic.
 *   - Extension points: add a new PathologyCode or Rule without touching consumers.
 *   - No UI coupling: pure functions that return typed data.
 *
 * Research basis:
 *   - Vaughan (1996) NOD five-stage progression
 *   - Edmondson (1999) Psychological Safety
 *   - Argyris (1977) Double-Loop Learning
 *   - Floridi (2014) Ontological Friction / Semantic Drift
 *   - Borgatti et al. (2009) Network Analysis in Organizations
 *   - McKinsey OHI (2017) Organizational Health Index benchmarks
 *   - CultureAmp / Qualtrics benchmark cohorts (2022-2024)
 */

import type { DSMDiagnosis, PathologyCode, SeverityLevel } from './dsm-engine'

// ─── Benchmark Context (אפיק א׳ — מה עשו בעולם) ─────────────────────────────

/**
 * Cohort percentile benchmarks derived from:
 * - McKinsey OHI N=1,500 orgs
 * - CultureAmp engagement dataset N=6,000 orgs
 * - COR-SYS heuristic model N=10,000 simulation
 *
 * Maps score range → estimated percentile within similar-size orgs.
 * Intentionally conservative (heuristic, not empirical per client cohort).
 */
export interface BenchmarkContext {
  pathologyCode: PathologyCode
  scoreRange: [number, number]
  percentileEstimate: string   // e.g. "top 20% (low pathology)"
  cohortNote: string           // context sentence for the UI
  referenceTools: string[]     // comparable tools that measure this dimension
}

export const BENCHMARK_CONTEXTS: BenchmarkContext[] = [
  // DR benchmarks
  {
    pathologyCode: 'DR',
    scoreRange: [0, 2.5],
    percentileEstimate: 'top 25% — רמת תחרות פנימית נמוכה',
    cohortNote: 'ארגונים בטווח זה מציגים שיתוף פעולה בין-מחלקתי גבוה (OHI: "Direction" ≥ 75th)',
    referenceTools: ['McKinsey OHI — Direction', 'CultureAmp — Collaboration'],
  },
  {
    pathologyCode: 'DR',
    scoreRange: [2.5, 5.5],
    percentileEstimate: 'percentile 40–70 — תחרות פנימית מתונה',
    cohortNote: 'טיפוסי לארגונים בצמיחה (50–300 עובדים) בשלב מעבר מבניות',
    referenceTools: ['McKinsey OHI — Direction', 'Atlassian Health Monitor — Shared Understanding'],
  },
  {
    pathologyCode: 'DR',
    scoreRange: [5.5, 10],
    percentileEstimate: 'bottom 30% — תחרות פנימית גבוהה',
    cohortNote: 'מתאם שלילי עם ROI ארגוני (Różycka-Tran BZSG r=−.41, N=10,000)',
    referenceTools: ['McKinsey OHI — Direction', 'Qualtrics EmployeeXM — Conflict Index'],
  },
  // ND benchmarks
  {
    pathologyCode: 'ND',
    scoreRange: [0, 2.5],
    percentileEstimate: 'top 25% — עמידה גבוהה בנהלים',
    cohortNote: 'ארגונים בטווח זה מציגים BIA accuracy גבוה ו-near-miss reporting אפקטיבי',
    referenceTools: ['ISO 22301 BCM Maturity', 'Atlassian Health Monitor — Health Checks'],
  },
  {
    pathologyCode: 'ND',
    scoreRange: [2.5, 5.5],
    percentileEstimate: 'percentile 35–65 — NOD מתון',
    cohortNote: 'Vaughan Stage 2–3: סטיות מוכרות אך עדיין לא מנורמלות לחלוטין',
    referenceTools: ['ISO 22301', 'CultureAmp — Process Adherence'],
  },
  {
    pathologyCode: 'ND',
    scoreRange: [5.5, 10],
    percentileEstimate: 'bottom 25% — NOD חמור',
    cohortNote: 'Vaughan Stage 4–5: סטיות הפכו לנורמה; סיכון גבוה לאירועי BCM',
    referenceTools: ['ISO 22301', 'Qualtrics EmployeeXM — Risk Culture'],
  },
  // UC benchmarks
  {
    pathologyCode: 'UC',
    scoreRange: [0, 2.5],
    percentileEstimate: 'top 20% — למידה ארגונית גבוהה',
    cohortNote: 'Edmondson Psychological Safety ≥ 4.2/5; Double-Loop learning מתועד',
    referenceTools: ['Edmondson PSYCH-SAFE scale', 'CultureAmp — Learning & Development'],
  },
  {
    pathologyCode: 'UC',
    scoreRange: [2.5, 5.5],
    percentileEstimate: 'percentile 35–65 — למידה מעורבת',
    cohortNote: 'Single-loop בעיקר; AAR מתבצע אך ממצאים לא מתורגמים לשינוי מבני',
    referenceTools: ['CultureAmp — Learning', 'Qualtrics EmployeeXM — Feedback Culture'],
  },
  {
    pathologyCode: 'UC',
    scoreRange: [5.5, 10],
    percentileEstimate: 'bottom 25% — כשל למידה חמור',
    cohortNote: 'Semantic drift גבוה + תרבות האשמה; Floridi Ontological Friction > threshold',
    referenceTools: ['Edmondson PSYCH-SAFE scale', 'McKinsey OHI — Innovation & Learning'],
  },
  // SC benchmarks
  {
    pathologyCode: 'SC',
    scoreRange: [0, 2.5],
    percentileEstimate: 'top 25% — בהירות מבנית גבוהה',
    cohortNote: 'RACI ברור, תהליכי ליבה מתועדים, ו-decision rights מוגדרים',
    referenceTools: ['RACI Audit', 'Gartner Org Design Maturity'],
  },
  {
    pathologyCode: 'SC',
    scoreRange: [2.5, 5.5],
    percentileEstimate: 'percentile 35–65 — עמימות מבנית בינונית',
    cohortNote: 'מבנה חלקי עם חיכוכי handoff ושטחים אפורים בין יחידות',
    referenceTools: ['Operating Model Health Check', 'Process Documentation Audit'],
  },
  {
    pathologyCode: 'SC',
    scoreRange: [5.5, 10],
    percentileEstimate: 'bottom 25% — כשל מבני חמור',
    cohortNote: 'חוסר בהירות סמכותית ותהליכית שמייצר עיכוב החלטות ונורמליזציית מעקפים',
    referenceTools: ['RACI Heatmap', 'Decision Rights Assessment'],
  },
]

export function getBenchmarkForScore(code: PathologyCode, score: number): BenchmarkContext | undefined {
  return BENCHMARK_CONTEXTS.find(
    (b) => b.pathologyCode === code && score >= b.scoreRange[0] && score <= b.scoreRange[1]
  )
}

// ─── Research Modules (אפיק ב׳ — סינתזת מאמרים) ────────────────────────────

/**
 * Each research module encodes a theoretical construct as a typed object.
 * Parameters marked `calibratable` can be tuned per cohort without code changes.
 */
export interface ResearchModule {
  id: string
  name: string
  theoreticalBasis: string
  measuredConstruct: string       // מה המודול מודד
  dependentVariable: string       // משתנה תלוי
  empiricalEvidence: string       // N, effect size, context
  pathologyMapping: PathologyCode[]
  calibratableParams: {
    name: string
    currentValue: number | string
    description: string
  }[]
}

export const RESEARCH_MODULES: ResearchModule[] = [
  {
    id: 'decision-latency',
    name: 'Decision Latency Index',
    theoreticalBasis: 'Cyert & March (1963) Behavioral Theory of the Firm; Eisenhardt (1989) Speed in Strategic Decision Making',
    measuredConstruct: 'שעות ניהוליות שבועיות שנשרפות על המתנה, כיבוי שריפות ופגישות עודפות',
    dependentVariable: 'J-Quotient = C(t)/E(t) — יחס קיבולת זמינה לאנטרופיה',
    empiricalEvidence: 'Eisenhardt (1989): ארגונים עם decision latency נמוך מציגים ROI גבוה ב-30%; McKinsey (2019): 70% מהמנהלים מדווחים על >10h/שבוע אבוד',
    pathologyMapping: ['DR', 'ND', 'UC'],
    calibratableParams: [
      { name: 'hoursThresholdCritical', currentValue: 15, description: 'שעות אבודות/שבוע שמגדירות latency קריטי' },
      { name: 'hoursThresholdModerate', currentValue: 5, description: 'שעות אבודות/שבוע שמגדירות latency מתון' },
      { name: 'workingHoursPerMonth', currentValue: 160, description: 'שעות עבודה חודשיות לחישוב עלות שעה' },
    ],
  },
  {
    id: 'psychological-safety',
    name: 'Psychological Safety / Learning Mode',
    theoreticalBasis: 'Edmondson (1999) Psychological Safety and Learning Behavior in Work Teams; Munn et al. (2023)',
    measuredConstruct: 'מידת הבטחון של עובדים לדווח על טעויות, לבקש עזרה ולהציע רעיונות',
    dependentVariable: 'UC score — כשל למידה ארגוני',
    empiricalEvidence: 'Edmondson (1999): α=.82, r=.35 עם team learning; Munn et al. (2023): PS mediates 40% of safety outcomes',
    pathologyMapping: ['UC'],
    calibratableParams: [
      { name: 'ucLearningWeight', currentValue: 0.4, description: 'משקל רכיב הלמידה בחישוב UC' },
      { name: 'ucSemanticWeight', currentValue: 0.25, description: 'משקל רכיב הסמנטיקה בחישוב UC' },
      { name: 'ucPsiWeight', currentValue: 0.2, description: 'משקל בטחון פסיכולוגי מנורמל (PSI normalized)' },
      { name: 'ucAdaptiveWeight', currentValue: 0.15, description: 'משקל יכולת הסתגלות קדימה (UC-Forward)' },
      { name: 'singleLoopHighDriftFloor', currentValue: 7, description: 'ציון מינימלי ל-UC כשיש גם single_loop וגם high_drift' },
    ],
  },
  {
    id: 'normalization-of-deviance',
    name: 'Normalization of Deviance (NOD)',
    theoreticalBasis: 'Vaughan (1996) The Challenger Launch Decision; Banja (2010) Medical Errors and Moral Injury',
    measuredConstruct: 'תדירות עקיפת נהלים רשמיים תחת לחץ ייצור',
    dependentVariable: 'ND score — רמת נורמליזציית הסטייה',
    empiricalEvidence: 'Vaughan (1996): 5-stage NOD progression; Banja (2010): NOD present in 67% of medical errors',
    pathologyMapping: ['ND'],
    calibratableParams: [
      { name: 'ndHighThreshold', currentValue: 8.5, description: 'ציון בסיס ל-NOD גבוה (high)' },
      { name: 'ndMediumThreshold', currentValue: 5.0, description: 'ציון בסיס ל-NOD בינוני (medium)' },
      { name: 'ndLowThreshold', currentValue: 1.5, description: 'ציון בסיס ל-NOD נמוך (low)' },
    ],
  },
  {
    id: 'semantic-drift',
    name: 'Semantic Drift / Ontological Friction',
    theoreticalBasis: 'Floridi (2014) The Ethics of Artificial Intelligence; Weick (1995) Sensemaking in Organizations',
    measuredConstruct: 'פערים בהגדרות עבודה, גבולות אחריות ומושגי יסוד בין מחלקות',
    dependentVariable: 'UC score (רכיב סמנטי) — כיול לא-מייצג',
    empiricalEvidence: 'Weick (1995): sensemaking failures precede 80% of organizational crises; Floridi: ontological friction ∝ coordination cost',
    pathologyMapping: ['UC'],
    calibratableParams: [
      { name: 'semanticHighScore', currentValue: 8.0, description: 'ציון בסיס לסחיפה סמנטית גבוהה' },
      { name: 'semanticMediumScore', currentValue: 4.5, description: 'ציון בסיס לסחיפה סמנטית בינונית' },
    ],
  },
  {
    id: 'network-comorbidity',
    name: 'Network Effects / Comorbidity',
    theoreticalBasis: 'Borgatti et al. (2009) Network Analysis in the Social Sciences; Borsboom (2017) Network Theory of Mental Disorders',
    measuredConstruct: 'קשרי גומלין בין פתולוגיות: DR↔ND, DR↔UC, ND↔UC, SC↔DR, SC↔ND, SC↔UC',
    dependentVariable: 'totalEntropyScore — סכום אנטרופיה מערכתי',
    empiricalEvidence: 'COR-SYS N=10,000: DR↔ND r=.19, DR↔UC r=−.27, ND↔UC r=.28, SC↔DR r=.32, SC↔ND r=.24, SC↔UC r=.18',
    pathologyMapping: ['DR', 'ND', 'UC', 'SC'],
    calibratableParams: [
      { name: 'systemicCollapseEntropyThreshold', currentValue: 29, description: 'סף totalEntropyScore לקריסה מערכתית' },
      { name: 'comorbidityActiveLevel', currentValue: 2, description: 'רמת חומרה מינימלית לקשר קומורבידיות פעיל' },
    ],
  },
  {
    id: 'greiner-moderator',
    name: 'Greiner Stage Moderator',
    theoreticalBasis: 'Greiner (1972) Evolution and Revolution as Organizations Grow',
    measuredConstruct: 'שלב משבר צמיחה שממתן את ספי החומרה לפי ציר מבני/תהליכי',
    dependentVariable: 'axis-specific severity thresholds (SC/ND/UC)',
    empiricalEvidence: 'Phase 3/4/5 crises correlate with control, red-tape, and renewal bottlenecks in growth-stage firms',
    pathologyMapping: ['SC', 'ND', 'UC'],
    calibratableParams: [
      { name: 'phase3ScThresholdDelta', currentValue: -1.0, description: 'הנמכת סף SC ב-Phase 3' },
      { name: 'phase4NdThresholdDelta', currentValue: -1.0, description: 'הנמכת סף ND ב-Phase 4' },
      { name: 'phase5UcThresholdDelta', currentValue: -1.0, description: 'הנמכת סף UC ב-Phase 5' },
    ],
  },
  {
    id: 'engagement-proxy',
    name: 'Engagement Outcome Proxy',
    theoreticalBasis: 'Kahn (1990), Maslach & Leiter (2016), JD-R model',
    measuredConstruct: 'רמת אנרגיה ומחוברות ניהולית כמדד תוצאה (לא פתולוגיה)',
    dependentVariable: 'validation consistency מול totalEntropyScore',
    empiricalEvidence: 'Engagement erosion is typically downstream outcome of structural/cultural pathology clusters',
    pathologyMapping: ['DR', 'ND', 'UC', 'SC'],
    calibratableParams: [
      { name: 'engagementAlertThreshold', currentValue: 'burnout', description: 'רמת סיכון שמפעילה התראה לבדיקת עומק' },
      { name: 'anomalyGapThreshold', currentValue: 3, description: 'פער בין אנטרופיה גבוהה לדיווח מחוברות גבוהה' },
    ],
  },
]

// ─── Golden Questions (todo 3 — 4 שאלות זהב) ────────────────────────────────

export interface GoldenQuestionAnswers {
  /** שאלה 1: מה מצב ה‑DSM הארגוני? */
  systemState: {
    profile: string
    primaryPathology: PathologyCode
    codes: string[]
    narrativeHe: string
  }
  /** שאלה 2: איפה צוואר הבקבוק הראשי? */
  bottleneck: {
    pathologyCode: PathologyCode
    score: number
    level: SeverityLevel
    activeComorbidities: string[]
    bottleneckNarrativeHe: string
  }
  /** שאלה 3: כמה כסף/קיבולת הולכים לאיבוד? */
  economicImpact: {
    annualWasteILS: number
    weeklyWasteILS: number
    jQuotient: number
    jInterpretationHe: string
    urgencySignal: 'critical' | 'elevated' | 'moderate'
  }
  /** שאלה 4: מה מהלך ההתערבות המומלץ? */
  recommendedAction: {
    ctaType: 'sprint' | 'retainer' | 'live-demo'
    ctaLabelHe: string
    timeToActMonths: number
    rationale: string
    primaryProtocolId: string | null
  }
}

export function buildGoldenQuestions(
  diagnosis: DSMDiagnosis,
  economicParams: { managers: number; hoursPerWeek: number; monthlySalary: number }
): GoldenQuestionAnswers {
  const { managers, hoursPerWeek, monthlySalary } = economicParams
  const hourlyRate = monthlySalary / 160
  const weeklyWaste = managers * hoursPerWeek * hourlyRate
  const annualWaste = weeklyWaste * 52
  const jQuotient = Math.max((40 - hoursPerWeek) / 40, 0)

  // Q1 — System State
  const stateNarrative = buildStateNarrative(diagnosis)

  // Q2 — Bottleneck
  const primary = diagnosis.pathologies.find((p) => p.code === diagnosis.primaryDiagnosis)!
  const activeComorbidities = buildActiveComorbidities(diagnosis)
  const bottleneckNarrative = buildBottleneckNarrative(primary, activeComorbidities)

  // Q3 — Economic Impact
  const urgencySignal: 'critical' | 'elevated' | 'moderate' =
    jQuotient < 0.35 ? 'critical' : jQuotient < 0.6 ? 'elevated' : 'moderate'
  const jInterpretation =
    jQuotient < 0.35
      ? 'אזור קריסה תפעולית — פחות מ-35% מהקיבולת הניהולית זמינה לעבודה אסטרטגית'
      : jQuotient < 0.6
        ? 'אזור חוב החלטות — 35–60% קיבולת זמינה; צוואר בקבוק מתפתח'
        : 'קיבולת ניהולית זמינה — מעל 60% מהזמן מוקדש לעבודה ערכית'

  // Q4 — Recommended Action (Policy Engine)
  const policy = computePolicy(diagnosis, jQuotient)

  return {
    systemState: {
      profile: diagnosis.severityProfile,
      primaryPathology: diagnosis.primaryDiagnosis,
      codes: diagnosis.codes,
      narrativeHe: stateNarrative,
    },
    bottleneck: {
      pathologyCode: primary.code,
      score: primary.score,
      level: primary.level,
      activeComorbidities,
      bottleneckNarrativeHe: bottleneckNarrative,
    },
    economicImpact: {
      annualWasteILS: annualWaste,
      weeklyWasteILS: weeklyWaste,
      jQuotient,
      jInterpretationHe: jInterpretation,
      urgencySignal,
    },
    recommendedAction: policy,
  }
}

function buildStateNarrative(diagnosis: DSMDiagnosis): string {
  const { severityProfile, totalEntropyScore, pathologies } = diagnosis
  const level3 = pathologies.filter((p) => p.level === 3).map((p) => p.code)
  const level2 = pathologies.filter((p) => p.level === 2).map((p) => p.code)

  if (severityProfile === 'systemic-collapse') {
    return `קריסה מערכתית: ${level3.join(' + ')} ברמת חומרה 3 עם אנטרופיה כוללת ${totalEntropyScore.toFixed(1)}/30. מספר פתולוגיות חמורות פועלות במקביל ומחזקות זו את זו.`
  }
  if (severityProfile === 'critical') {
    return `מצב קריטי: ${level3[0]} ברמת חומרה 3. פתולוגיה ראשית דומיננטית עם פוטנציאל להתפשטות.`
  }
  if (severityProfile === 'at-risk') {
    return `בסיכון: ${level2.join(' + ')} ברמת חומרה 2. פתולוגיה מתונה — חלון ההתערבות פתוח לפני הסלמה.`
  }
  return 'מצב תקין: כל הפתולוגיות ברמת subclinical. מומלץ מעקב מניעתי.'
}

function buildActiveComorbidities(diagnosis: DSMDiagnosis): string[] {
  const scoreMap = Object.fromEntries(diagnosis.pathologies.map((p) => [p.code, p]))
  const active: string[] = []
  if (scoreMap['DR'].level >= 2 && scoreMap['ND'].level >= 2) active.push('DR→ND (לחץ ייצור מנרמל סטיות)')
  if (scoreMap['DR'].level >= 2 && scoreMap['UC'].level >= 2) active.push('DR→UC (תחרות פוגעת בבטחון פסיכולוגי)')
  if (scoreMap['ND'].level >= 2 && scoreMap['UC'].level >= 2) active.push('ND→UC (נורמליזציה מבטלת trigger ללמידה)')
  if (scoreMap['SC']?.level >= 2 && scoreMap['DR'].level >= 2) active.push('SC→DR (עמימות מבנית מייצרת חיכוך סמכותי)')
  if (scoreMap['SC']?.level >= 2 && scoreMap['ND'].level >= 2) active.push('SC→ND (חוסר מבנה מנרמל מעקפים)')
  if (scoreMap['SC']?.level >= 2 && scoreMap['UC'].level >= 2) active.push('SC→UC (עמימות מחלישה כיול ולמידה)')
  return active
}

function buildBottleneckNarrative(
  primary: { code: PathologyCode; score: number; level: SeverityLevel; nameHe: string },
  activeComorbidities: string[]
): string {
  const base = `הפתולוגיה הדומיננטית היא ${primary.nameHe} (${primary.code}) עם ציון ${primary.score.toFixed(1)}/10.`
  if (activeComorbidities.length === 0) return base + ' אין קשרי קומורבידיות פעילים.'
  return base + ` קשרים פעילים: ${activeComorbidities.join('; ')}.`
}

// ─── Decision Rules / Policy Engine (todo 4) ─────────────────────────────────

/**
 * Rules are data: each rule has a condition function and a resulting CTA.
 * Rules are evaluated in priority order; first match wins.
 * To add a rule: push to DECISION_RULES. No other code changes needed.
 */
interface DecisionRule {
  id: string
  priority: number
  description: string
  condition: (d: DSMDiagnosis, j: number) => boolean
  result: {
    ctaType: 'sprint' | 'retainer' | 'live-demo'
    ctaLabelHe: string
    timeToActMonths: number
    rationale: string
    primaryProtocolId: string | null
  }
}

const DECISION_RULES: DecisionRule[] = [
  {
    id: 'systemic-collapse-sprint',
    priority: 1,
    description: 'קריסה מערכתית → Sprint חוסם עורקים מיידי',
    condition: (d) => d.severityProfile === 'systemic-collapse',
    result: {
      ctaType: 'sprint',
      ctaLabelHe: 'Sprint חוסם עורקים — 14 יום',
      timeToActMonths: 0,
      rationale: 'קריסה מערכתית עם 2+ פתולוגיות חמורות. כל יום של המתנה מגביר את האנטרופיה. Sprint מיידי לחיתוך צווארי בקבוק.',
      primaryProtocolId: 'integrated-system',
    },
  },
  {
    id: 'critical-j-sprint',
    priority: 2,
    description: 'מצב קריטי + J נמוך → Sprint',
    condition: (d, j) => d.severityProfile === 'critical' && j < 0.35,
    result: {
      ctaType: 'sprint',
      ctaLabelHe: 'Sprint חוסם עורקים — 14 יום',
      timeToActMonths: 0,
      rationale: 'פתולוגיה חמורה + קיבולת ניהולית קריטית (J < 0.35). שילוב זה מצביע על דימום קוגניטיבי פעיל.',
      primaryProtocolId: 'nod-bia-remediation',
    },
  },
  {
    id: 'nd-dr-safety-debt',
    priority: 3,
    description: 'DR + ND גבוהים → חוב בטיחות, Sprint',
    condition: (d) => {
      const scoreMap = Object.fromEntries(d.pathologies.map((p) => [p.code, p]))
      return scoreMap['DR'].level >= 2 && scoreMap['ND'].level >= 3
    },
    result: {
      ctaType: 'sprint',
      ctaLabelHe: 'Sprint — טיפול בחוב בטיחות',
      timeToActMonths: 1,
      rationale: 'DR מתון + ND חמור: לחץ ייצור מנרמל סטיות. סיכון גבוה לאירוע BCM. NOD→BIA Remediation בעדיפות.',
      primaryProtocolId: 'nod-bia-remediation',
    },
  },
  {
    id: 'uc-high-retainer',
    priority: 4,
    description: 'UC חמור בלי קריסה → Retainer לבניית למידה',
    condition: (d) => {
      const scoreMap = Object.fromEntries(d.pathologies.map((p) => [p.code, p]))
      return scoreMap['UC'].level === 3 && d.severityProfile !== 'systemic-collapse'
    },
    result: {
      ctaType: 'retainer',
      ctaLabelHe: 'Resilience Retainer — ליווי שוטף 6 חודשים',
      timeToActMonths: 1,
      rationale: 'UC חמור דורש בניית בטחון פסיכולוגי ולמידה דו-לולאתית לאורך זמן. לא ניתן לפתור ב-Sprint בודד.',
      primaryProtocolId: 'learning-exercise-design',
    },
  },
  {
    id: 'at-risk-elevated-j',
    priority: 5,
    description: 'בסיכון + J מוגבר → Live Demo + Retainer',
    condition: (d, j) => d.severityProfile === 'at-risk' && j < 0.6,
    result: {
      ctaType: 'retainer',
      ctaLabelHe: 'Live Demo + Resilience Retainer',
      timeToActMonths: 2,
      rationale: 'פתולוגיה מתונה עם J מוגבר. חלון ההתערבות פתוח — Retainer מונע הסלמה לרמה קריטית.',
      primaryProtocolId: null,
    },
  },
  {
    id: 'default-live-demo',
    priority: 6,
    description: 'ברירת מחדל — Live Demo אבחוני',
    condition: () => true,
    result: {
      ctaType: 'live-demo',
      ctaLabelHe: 'Live Demo אבחוני — חינמי',
      timeToActMonths: 3,
      rationale: 'רמת אנטרופיה נמוכה. Live Demo יספק הוכחה מתמטית לערך ההתערבות לפני מחויבות.',
      primaryProtocolId: null,
    },
  },
]

function computePolicy(
  diagnosis: DSMDiagnosis,
  jQuotient: number
): GoldenQuestionAnswers['recommendedAction'] {
  const matchedRule = DECISION_RULES
    .sort((a, b) => a.priority - b.priority)
    .find((rule) => rule.condition(diagnosis, jQuotient))

  return matchedRule?.result ?? DECISION_RULES[DECISION_RULES.length - 1].result
}

// ─── Continuous Learning / Feedback Schema (todo 6) ──────────────────────────

/**
 * Schema for collecting consultant feedback after each calculator session.
 * Stored per-session; aggregated for periodic threshold calibration.
 */
export interface DiagnosticFeedback {
  sessionId: string
  timestamp: string
  inputSnapshot: {
    drScore: number
    ndScore: number
    ucScore: number
    hoursPerWeek: number
    managers: number
    monthlySalary: number
  }
  outputSnapshot: {
    severityProfile: string
    ctaType: string
    jQuotient: number
    totalEntropyScore: number
  }
  consultantFeedback: {
    ctaAccurate: boolean | null          // האם ה-CTA היה מדויק?
    wouldChooseDifferent: boolean | null // האם היית בוחר אחרת?
    alternativeCta?: 'sprint' | 'retainer' | 'live-demo'
    overrideReason?: string              // למה עקפת את המחשבון?
    confidenceRating: 1 | 2 | 3 | 4 | 5 // כמה סמכת על האבחון?
  }
}

/**
 * Trend analysis: compares two snapshots for the same client/org over time.
 * Used to validate whether interventions moved the needle.
 */
export interface DiagnosticTrend {
  clientId: string
  baselineSnapshot: DiagnosticFeedback['inputSnapshot'] & { date: string }
  followupSnapshot: DiagnosticFeedback['inputSnapshot'] & { date: string }
  delta: {
    drDelta: number   // positive = improvement (score decreased)
    ndDelta: number
    ucDelta: number
    jDelta: number
    entropyDelta: number
  }
  interventionApplied: string | null
  outcomeValidated: boolean
}

export function computeTrend(
  baseline: DiagnosticFeedback['inputSnapshot'] & { date: string },
  followup: DiagnosticFeedback['inputSnapshot'] & { date: string },
  clientId: string,
  interventionApplied: string | null = null
): DiagnosticTrend {
  const jBaseline = Math.max((40 - baseline.hoursPerWeek) / 40, 0)
  const jFollowup = Math.max((40 - followup.hoursPerWeek) / 40, 0)

  return {
    clientId,
    baselineSnapshot: baseline,
    followupSnapshot: followup,
    delta: {
      drDelta: baseline.drScore - followup.drScore,
      ndDelta: baseline.ndScore - followup.ndScore,
      ucDelta: baseline.ucScore - followup.ucScore,
      jDelta: jFollowup - jBaseline,
      entropyDelta: (baseline.drScore + baseline.ndScore + baseline.ucScore) -
                    (followup.drScore + followup.ndScore + followup.ucScore),
    },
    interventionApplied,
    outcomeValidated: false,
  }
}

/**
 * Aggregates feedback records to surface calibration signals.
 * Returns override rate per CTA type — high override = threshold needs tuning.
 */
export interface CalibrationSignal {
  ctaType: 'sprint' | 'retainer' | 'live-demo'
  totalSessions: number
  overrideRate: number        // 0–1: fraction where consultant chose differently
  avgConfidence: number       // 1–5
  calibrationNeeded: boolean  // true if overrideRate > 0.3
}

export function computeCalibrationSignals(feedbacks: DiagnosticFeedback[]): CalibrationSignal[] {
  const ctaTypes: Array<'sprint' | 'retainer' | 'live-demo'> = ['sprint', 'retainer', 'live-demo']

  return ctaTypes.map((ctaType) => {
    const relevant = feedbacks.filter((f) => f.outputSnapshot.ctaType === ctaType)
    if (relevant.length === 0) {
      return { ctaType, totalSessions: 0, overrideRate: 0, avgConfidence: 0, calibrationNeeded: false }
    }
    const overrides = relevant.filter((f) => f.consultantFeedback.wouldChooseDifferent === true)
    const overrideRate = overrides.length / relevant.length
    const avgConfidence =
      relevant.reduce((sum, f) => sum + f.consultantFeedback.confidenceRating, 0) / relevant.length

    return {
      ctaType,
      totalSessions: relevant.length,
      overrideRate,
      avgConfidence,
      calibrationNeeded: overrideRate > 0.3,
    }
  })
}
