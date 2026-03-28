/**
 * COR-SYS Action Plan Knowledge Graph
 *
 * Intervention taxonomy (per COR-SYS sprint methodology):
 *   P1 — "חוסם עורקים"      (14d)  minimal effort / maximum bleeding-stop
 *   P2 — "הזרקת לוגיקה"     (30d)  structural change to the pattern
 *   P3 — "ארכיטקטורת חוסן"  (90d)  prevents recurrence at system level
 *
 * Each intervention carries:
 *   tam_impact         — which cost axis (T/A/M) it targets
 *   applicable_profiles — which severity levels it is calibrated for
 *   target_pathologies  — which DSM-Org types it directly addresses
 *
 * buildActionPlan() now uses BOTH axis (DR/ND/UC) AND pathology type (NOD/ZSG/OLD/CLT/CS)
 * to select the most contextually precise interventions.
 *
 * Theoretical grounding:
 *   DR → Hobfoll COR resource-loss spiral, decision-latency tax
 *   ND → Vaughan Normalization of Deviance, Argyris Double-Loop Learning
 *   UC → Cognitive Load Theory (Sweller), key-person dependency, Miluim Multiplier
 *   ZSG → Edmondson Psychological Safety, Rousseau Psychological Contract
 *   CS → Hobfoll Loss Spiral, MBI Emotional Exhaustion
 */

import type { DiagnosticAxis } from './questions'
import type { PathologyProfile, PathologyType } from './pathology-kb'

export type InterventionHorizon = '14d' | '30d' | '90d'
export type InterventionPriority = 1 | 2 | 3
export type EvidenceLevel = 'high' | 'contextual' | 'gap'

export interface TamImpact {
  t: 1 | 2 | 3   // how strongly this intervention reduces Time cost (1=low, 3=high)
  a: 1 | 2 | 3   // Attention
  m: 1 | 2 | 3   // Money
}

/**
 * ConstraintEnvelope — binary gate applied BEFORE IUS scoring.
 *   t_max: maximum horizon in days the org can commit to
 *   r_max: change-fatigue level (1=ready for change, 5=exhausted)
 */
export interface ConstraintEnvelope {
  t_max: 30 | 60 | 90
  r_max: 1 | 2 | 3 | 4 | 5
  /** Max intervention budget index (optional; reserved for future IUS / cost gating). */
  b_max?: number
}

/**
 * IUSScore — result of computeIUS() per intervention.
 *   raw:              weighted sum of IAM+AIM+FIM+Impact (1.0–5.0 scale)
 *   score:            normalised 0–100, with MVC penalty applied
 *   constraint_penalty: points deducted for MVC revision
 *   mvc_revised:      true if intervention was revised to fit constraints
 *   mvc_description:  Hebrew description of the MVC revision
 */
export interface IUSScore {
  raw: number
  score: number
  constraint_penalty: number
  mvc_revised: boolean
  mvc_description?: string
}

export interface ActionPlanItem {
  /** Stable id for snapshots and UI keys (set by unified pipeline). */
  interventionId?: string
  priority: InterventionPriority
  horizon: InterventionHorizon
  axis: DiagnosticAxis
  title_he: string
  what_he: string
  why_he: string
  metric_he: string
  tag: string
  tam_impact: TamImpact
  // IUS components — Proctor/Weiner implementation science
  iam: 1 | 2 | 3 | 4 | 5   // Intervention Appropriateness Measure
  aim: 1 | 2 | 3 | 4 | 5   // Acceptability of Intervention Measure
  fim: 1 | 2 | 3 | 4 | 5   // Feasibility of Intervention Measure
  impact: 1 | 2 | 3 | 4 | 5 // Expected effect size (CBR/research grounded)
  _ius?: IUSScore            // populated by computeIUS(); absent on raw items
  applicable_profiles: PathologyProfile[]
  target_pathologies: PathologyType[]
  evidence?: InterventionEvidence
  kpi_stack?: InterventionKpiStack
  /** Short rationale for PDF / UI (Hebrew). */
  narrative_rationale_he?: string
  /** Links to 7×21 content ids when populated. */
  related_content_ids?: string[]
  /** UX tags e.g. Miluim_Multiplier, MVC */
  display_tags?: string[]
  /** Sequencing: item is deferred until prerequisite wave (set by pipeline). */
  sequencing_locked?: boolean
  sequencing_lock_reason_he?: string
}

export interface InterventionEvidence {
  level: EvidenceLevel
  citations: string[]
  evidence_note: string
}

export interface KpiMetric {
  name: string
  horizon: '1-2w' | '4-12w'
}

export interface InterventionKpiStack {
  leading: KpiMetric[]
  lagging: KpiMetric[]
  baseline: string
  cadence: string
  target_range: string
}

export interface TriggerRule {
  id: string
  if_condition: string
  then_action: string
  severity: 'high' | 'medium'
}

export interface GateReview {
  id: 'gate-1' | 'gate-2' | 'gate-3' | 'gate-4'
  week: 2 | 4 | 8 | 12
  title_he: string
  pass_criteria: string[]
}

export interface TriggerEvaluationInput {
  profile: PathologyProfile
  dominantAxis: DiagnosticAxis
  scores: { dr: number; nd: number; uc: number; sc?: number }
  pathologyType?: PathologyType
}

export interface EvidenceProfileRow {
  intervention_tag: string
  evidence_level: EvidenceLevel
  citations: string[]
  evidence_note: string
}

export interface DiagnosticRuntimeConfig {
  triggerRules?: TriggerRule[]
  evidenceProfiles?: EvidenceProfileRow[]
  gateReviews?: GateReview[]
}

// ─── DR Interventions (Decision Latency) ─────────────────────────────────────

const DR_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'DR',
    title_he: 'מינוי Owner יחיד לכל החלטה',
    what_he: 'לרשום את 5 ההחלטות שנתקעות הכי הרבה. לכל אחת — owner אחד בלבד + SLA של 48 שעות. לפרסם ברשימה שכולם רואים.',
    why_he: 'לולאות אישור נוצרות כשאין בהירות על מי מחליט. owner מוגדר מחייב אחריות ומבטל "המתנה לאחר".',
    metric_he: 'זמן מחזור החלטה תפעולית ≤ 48 שעות תוך שבוע',
    tag: 'Decision Latency',
    tam_impact: { t: 3, a: 2, m: 2 },
    iam: 5, aim: 4, fim: 5, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['NOD', 'CS'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'DR',
    title_he: 'טקסונומיית החלטות לפי דרג',
    what_he: 'לסווג כל סוג החלטה: תפעולית / טקטית / אסטרטגית. לקבוע מי מוסמך להחליט בכל רמה, ולפרסם ולהכשיר.',
    why_he: '80% מהסלמציות ל-C-suite הן החלטות תפעוליות בתחפושת אסטרטגית. סיווג מונע חיכוך מיותר.',
    metric_he: 'ירידה ≥ 40% בהסלמות לדרג הבכיר תוך 30 יום',
    tag: 'Decision Architecture',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 4, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['NOD', 'ZSG_SAFETY', 'ZSG_CULTURE'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'DR',
    title_he: 'פירוק צוואר הבקבוק המבני',
    what_he: 'לזהות את החוליה החוזרת שעוצרת זרימת החלטות. לבדוק: האם זו בעיה של מבנה, של אינפורמציה, או של אמון? לשנות את ה-reporting line הרלוונטי.',
    why_he: 'תיקון טקטי (owner/SLA) מפחית כאב. תיקון מבני מונע חזרתו — Argyris Double-Loop Learning.',
    metric_he: 'אפס חזרות על אותו סוג תקיעה במשך רבעון',
    tag: 'Structural Fix',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 5, aim: 2, fim: 3, impact: 5,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['NOD', 'OLD'],
  },
]

// ─── ND Interventions (Normalization of Deviance) ────────────────────────────

const ND_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'ND',
    title_he: 'ביקורת Vaughan — רשימת הסטיות השקטות',
    what_he: 'לשבת עם הצוות ולרשום 5 דברים ש"כולם יודעים שלא בסדר אבל לא עוצרים". לכל אחד — owner + deadline. לפרסם ב-public tracker.',
    why_he: 'מתן שם לסטייה שוברת את לולאת הנרמול. וון: "תקופת הדגירה" נגמרת כשמישהו קורא לסטייה בשמה.',
    metric_he: '3/5 סטיות סגורות תוך 30 יום',
    tag: 'Normalization of Deviance',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 5, aim: 4, fim: 5, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['NOD'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'ND',
    title_he: 'פרוטוקול Post-Mortem דו-לולאתי',
    what_he: 'להתקין review קבוע אחרי כל אירוע: לא רק "מה קרה" אלא "איזו הנחה מוסדית אפשרה לזה לקרות". לתעד ולעקוב אחרי שינוי ההנחה.',
    why_he: 'למידה חד-לולאתית מתקנת תסמינים. למידה דו-לולאתית (Argyris) מתקנת הנחות — מונעת הישנות.',
    metric_he: 'שיעור post-mortem ≥ 80% מהאירועים, עם action items עם owners',
    tag: 'Double-Loop Learning',
    tam_impact: { t: 2, a: 3, m: 3 },
    iam: 4, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['NOD', 'OLD'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'ND',
    title_he: 'הטמעת Just Culture Algorithm',
    what_he: 'לאמץ פרוטוקול המבדיל: טעות אנוש (→ תמיכה + שיפור תהליך) / התנהגות מסוכנת (→ חניכה) / רשלנות (→ סנקציה). להכשיר מנהלים.',
    why_he: 'תרבות האשמה הורסת ביטחון פסיכולוגי — אנשים מסתירים תקלות. Just Culture (Edmondson) שומרת אחריות מבלי להרוג דיווח מוקדם.',
    metric_he: 'שיעור דיווח near-miss עולה ≥ פי 3 תוך רבעון',
    tag: 'Just Culture',
    tam_impact: { t: 2, a: 3, m: 3 },
    iam: 5, aim: 2, fim: 3, impact: 5,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['NOD', 'ZSG_SAFETY', 'ZSG_CULTURE'],
  },
]

// ─── UC Interventions (Uncertainty / Calibration) ────────────────────────────

const UC_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'UC',
    title_he: 'מיפוי נקודות כשל יחידות (Key-Person Risk)',
    what_he: 'לזהות 3 מערכות / תהליכים קריטיים שרק אדם אחד מבין אותם לעומק. להתחיל תיעוד שיחת "העברת ידע" של 2 שעות עם כל אחד.',
    why_he: 'ידע סמוי (tacit knowledge) עוזב עם האדם. "מכפיל המילואים" הישראלי הוכיח: היעדרות של key-person אחד משתקת מחלקה שלמה.',
    metric_he: 'אפס מצבי "רק X יודע" בשלושת המערכות הקריטיות',
    tag: 'Knowledge Resilience',
    tam_impact: { t: 2, a: 2, m: 3 },
    iam: 4, aim: 4, fim: 5, impact: 3,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['CLT', 'OLD'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'UC',
    title_he: 'כיול Roadmap עם אילוצי קיבולת אמיתיים',
    what_he: 'לקחת את ה-roadmap הנוכחי ולהעמיד אותו מול קיבולת הנדסית בפועל (לא תיאורטית). לסדר עדיפויות מחדש. לתקשר שינויים מפורשות.',
    why_he: '62% מחברות ההייטק בישראל 2024-2026 לא עמדו ב-roadmap — הסיבה: תכנון על קיבולת אופטימיסטית (Uncalibrated capacity, Hyperbolic Discounting).',
    metric_he: 'אחוז השלמת ספרינט ≥ 80% בשלושת הספרינטים הבאים',
    tag: 'Capacity Calibration',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 4, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['CLT', 'CS'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'UC',
    title_he: 'פרוטוקול העברת ידע לפני כל יציאה',
    what_he: 'לבנות off-boarding מבני: כל עובד שעוזב ממלא "מפת ידע" + שיחת העברה + בדיקה שהמחליף יודע לפעול עצמאית. לאמץ גם לתחילת מילואים ממושכים.',
    why_he: 'ידע מוסדי עוזב מהר ממה שאפשר לגייס. תיעוד מבני הוא הפוליסה הארגונית הזולה ביותר.',
    metric_he: 'קיצור זמן productivity של עובד/ממלא-מקום חדש ≥ 30%',
    tag: 'Knowledge Transfer',
    tam_impact: { t: 2, a: 2, m: 3 },
    iam: 3, aim: 3, fim: 4, impact: 3,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['OLD', 'CS'],
  },
]

// ─── SC Interventions (Structural Clarity) ───────────────────────────────────

const SC_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'SC',
    title_he: 'ביקורת RACI מהירה ל-5 תהליכי ליבה',
    what_he: 'למפות Responsible/Accountable/Consulted/Informed עבור 5 תהליכים קריטיים ולסגור כפילויות או חורים בבעלות.',
    why_he: 'חוסר בהירות בבעלות יוצר צווארי בקבוק, הסלמות, ועבודת-כפילות.',
    metric_he: '100% מ-5 התהליכים עם Responsible ו-Accountable ברורים תוך 14 יום',
    tag: 'RACI Audit',
    tam_impact: { t: 3, a: 2, m: 2 },
    iam: 5, aim: 4, fim: 5, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['OLD', 'CLT'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'SC',
    title_he: 'מנגנון Strategy Cascade דו-שבועי',
    what_he: 'לתרגם כל החלטה אסטרטגית ליעדים תפעוליים, בעלי תפקידים, ודד-ליינים, ולבדוק סטטוס כל שבועיים.',
    why_he: 'ללא Cascade, אסטרטגיה נשארת מצגת ולא הופכת לביצוע.',
    metric_he: '≥80% מההחלטות האסטרטגיות מקבלות owner + deadline + KPI תוך 30 יום',
    tag: 'Strategy Cascade',
    tam_impact: { t: 2, a: 2, m: 3 },
    iam: 4, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['OLD', 'ZSG_CULTURE'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'SC',
    title_he: 'ארכיטקטורת החלטות ארגונית',
    what_he: 'לבנות Decision Rights Catalog: מי מחליט מה, לפי איזה מידע, ובאיזה SLA, כולל מנגנון חריגות.',
    why_he: 'פרוטוקול החלטות קבוע מפחית תלות בדמויות בודדות ומונע bottleneck מערכתי.',
    metric_he: 'ירידה ≥35% בזמני הסלמה + ירידה ≥30% בהחלטות שחוזרות לפתיחה',
    tag: 'Decision Protocol',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 4, aim: 2, fim: 3, impact: 5,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['OLD', 'CS'],
  },
]

// ─── ZSG_SAFETY (Edmondson / reporting) ─────────────────────────────────────

const ZSG_SAFETY_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'ND',
    title_he: 'מדד ביטחון פסיכולוגי — Edmondson Baseline',
    what_he: 'להריץ 7 שאלות ה-Psychological Safety Survey של Edmondson בכל צוות. לפרסם תוצאות (ברמת צוות, לא פרט). להכריז שהמדד יחזור כל 90 יום.',
    why_he: 'חסם דיווח ושחיקת אמון מערכתית מסתתרים: מדד explicit שובר שתיקה — ירידה של 20%+ מ-baseline היא אינדיקטור מערכתי.',
    metric_he: 'Edmondson score ≥ 6.5/7 בכל הצוותים תוך 90 יום',
    tag: 'Psychological Safety',
    tam_impact: { t: 1, a: 3, m: 3 },
    iam: 5, aim: 3, fim: 5, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['ZSG_SAFETY'],
  },
]

// ─── ZSG_CULTURE (zero-sum / incentives) ────────────────────────────────────

const ZSG_CULTURE_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 2,
    horizon: '30d',
    axis: 'ND',
    title_he: 'מדדים משותפים חוצי-צוות (Shared OKRs)',
    what_he: 'לזהות נקודת החיכוך בין שני צוותים עם חיכוך פנים-ארגוני גבוה. לבנות OKR משותף אחד שמדיד לשניהם. לתמחר את ה-upside של שיתוף פעולה במפורש.',
    why_he: 'תרבות סכום-אפס מונעת על ידי מבנה תמריצים. כשאנשים מנצחים יחד, הם מפסיקים לספור ניצחונות נפרדים.',
    metric_he: 'ירידה ≥ 50% ב-escalations בין הצוותים תוך 30 יום',
    tag: 'Incentive Architecture',
    tam_impact: { t: 2, a: 3, m: 3 },
    iam: 4, aim: 3, fim: 4, impact: 3,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['ZSG_CULTURE', 'OLD'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'ND',
    title_he: 'ארכיטקטורת RevOps / Chief of Staff',
    what_he: 'לבנות תפקיד תיאום ארכיטקטוני (RevOps לארגון GTM, CoS לארגון מוצר/R&D). תפקיד זה יוצר שכבת ממשק ניטרלית שמונעת Handoff Overload.',
    why_he: 'RevOps מאחד Sales, Marketing ו-CS תחת מדדים משותפים — מבטל zero-sum מבני. CoS מטפל בקונפליקטים ברמת ה-C-suite.',
    metric_he: 'ירידה ≥ 30% ב-duplicate initiatives ו-build overlap בין מחלקות',
    tag: 'Coordination Architecture',
    tam_impact: { t: 2, a: 2, m: 3 },
    iam: 4, aim: 2, fim: 2, impact: 5,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['ZSG_CULTURE', 'CLT'],
  },
]

// ─── CLT Interventions (Chronic Cognitive Load) ───────────────────────────────

const CLT_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'UC',
    title_he: 'ביקורת ישיבות — פרוטוקול Gloria Mark',
    what_he: 'לרשום את כל הישיבות השבועיות. לסווג כל ישיבה: החלטה / מידע / סנכרון. לבטל כל ישיבת "מידע" שניתן להחליפה ב-async update. לשמור 2 בלוקי Deep Work ביום (90 דקות כל אחד, ללא פגיעות).',
    why_he: 'גלוריה מארק (UC Irvine): החלפת הקשר עולה 23 דקות להתאוששות. 15 החלפות ביום = 5.75 שעות אבודות. ביטול ישיבה אחת שווה יותר מכל productivity tip אחר.',
    metric_he: 'ירידה ≥ 30% בשעות ישיבה שבועיות + 2 בלוקי Focus Time מוגנים ביום',
    tag: 'Cognitive Load',
    tam_impact: { t: 2, a: 3, m: 2 },
    iam: 5, aim: 4, fim: 5, impact: 5,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['CLT'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'UC',
    title_he: 'Notification Hygiene — פרוטוקול Async-First',
    what_he: 'להגדיר: Slack/Teams = async (תגובה תוך 4 שעות). Call = דחוף בלבד. Email = לא-דחוף. לסגור כל notification push בשעות ה-Deep Work. להכשיר מנהלים לא לצפות לתגובה מיידית.',
    why_he: 'כל notification שמגיעה במהלך Deep Work שוברת Focus Session. פרוטוקול async-first מעביר את עלות ההחלטה "דחוף כמה?" מהמקבל לשולח — שם השיפוט טוב יותר.',
    metric_he: 'ירידה ≥ 60% בהודעות שמסומנות "דחוף" שאינן דחופות',
    tag: 'Async Architecture',
    tam_impact: { t: 1, a: 3, m: 2 },
    iam: 4, aim: 3, fim: 5, impact: 4,
    applicable_profiles: ['at-risk', 'critical'],
    target_pathologies: ['CLT', 'NOD'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'UC',
    title_he: 'ארכיטקטורת Nudge — עיצוב סביבת ברירת המחדל',
    what_he: 'לזהות את 3 הנתיבים שבהם אנשים "מדלגים" (בגלל CLT, לא עצלות). לעצב מחדש את ברירת המחדל כך שהנתיב הנכון קל יותר. דוגמה: dashboard שמרכז מידע מ-7 מערכות — לא צריך לבדוק 7 מקומות.',
    why_he: 'CLT מתחיל כשהנתיב של "לדלג" קל יותר מהנתיב של "לעשות נכון". Nudge הופך את הנתיב הנכון לנתיב הקל — מבלי להוסיף אחריות.',
    metric_he: 'ירידה ≥ 40% ב-manual context-switching בין כלים',
    tag: 'Nudge Management',
    tam_impact: { t: 2, a: 3, m: 2 },
    iam: 4, aim: 3, fim: 3, impact: 4,
    applicable_profiles: ['at-risk', 'critical', 'systemic-collapse'],
    target_pathologies: ['CLT', 'NOD'],
  },
]

// ─── CS Interventions (Chronic Stress amplifier) ──────────────────────────────

const CS_INTERVENTIONS: ActionPlanItem[] = [
  {
    priority: 1,
    horizon: '14d',
    axis: 'DR',
    title_he: 'Tech Tourniquet — עצירת הדימום המיידית',
    what_he: 'לזהות את צוואר הבקבוק הקריטי ביותר שמוסיף עומס לצוות עכשיו. לבנות ממשק מינימלי שעוצר את הדימום. לא לפתור הכל — לפתור את הדבר שמכביד הכי הרבה.',
    why_he: 'CS מגביר את כל שאר הפתולוגיות. כאשר CS פעיל, כל התערבות אחרת תהיה פחות יעילה. Tourniquet קודם — Diagnosis אחר כך.',
    metric_he: 'ירידה מדודה בשעות Firefighting שבועיות של הצוות ≥ 20% תוך שבועיים',
    tag: 'Tech Tourniquet',
    tam_impact: { t: 3, a: 3, m: 3 },
    iam: 5, aim: 4, fim: 4, impact: 4,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['CS', 'CLT'],
  },
  {
    priority: 2,
    horizon: '30d',
    axis: 'UC',
    title_he: 'TTX — תרגיל לחץ מבוקר (Tabletop Exercise)',
    what_he: 'לתכנן תרחיש כשל שעלול לקרות (לא היפותטי — מה שהכי מפחיד את הצוות). לנהל session של 2-4 שעות שבו מדמים את הכשל. לתעד את ההנחות שנחשפו. לסגור action items.',
    why_he: 'TTX מטפל ב-CS דרך חשיפה מבוקרת ללחץ — מוריד את עוצמת ה-unknown threat. מטפל ב-OLD דרך חשיפת הנחות סמויות שאי אפשר לגלות בשגרה.',
    metric_he: 'ירידה ≥ 40% בזמן תגובה לאירועים דומים לאחר ה-TTX',
    tag: 'TTX Protocol',
    tam_impact: { t: 2, a: 3, m: 2 },
    iam: 4, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['CS', 'OLD'],
  },
  {
    priority: 3,
    horizon: '90d',
    axis: 'DR',
    title_he: 'הפחתת עומס מבנית — Slack Capacity Buffer',
    what_he: 'להגדיר מדיניות: 20% מקיבולת כל צוות שמורה לאי-תכנון (לא יועדו ל-sprint). עומס פורמלי מקסימלי: 80% מהקיבולת. לדווח על ניצול בפועל כל שבועיים.',
    why_he: 'ארגונים תחת CS מתכננים על 100% קיבולת ואז נכשלים. 20% Slack מאפשר ספיגת הפתעות ומפחית Loss Spiral (Hobfoll). זה לא בזבוז — זו פוליסת ביטוח.',
    metric_he: 'Firefighting time < 15% מזמן הצוות השבועי + sprint completion rate ≥ 80%',
    tag: 'Capacity Buffer',
    tam_impact: { t: 3, a: 2, m: 3 },
    iam: 3, aim: 3, fim: 4, impact: 4,
    applicable_profiles: ['critical', 'systemic-collapse'],
    target_pathologies: ['CS', 'CLT'],
  },
]

// ─── Pathology-type banks ─────────────────────────────────────────────────────

const PATHOLOGY_BANKS: Record<PathologyType, ActionPlanItem[]> = {
  NOD: ND_INTERVENTIONS,
  ZSG_SAFETY: ZSG_SAFETY_INTERVENTIONS,
  ZSG_CULTURE: ZSG_CULTURE_INTERVENTIONS,
  OLD: [
    // OLD uses ND P2 (double-loop) as its primary, then adds UC P3 (knowledge transfer)
    ND_INTERVENTIONS[1],   // Post-Mortem double-loop
    UC_INTERVENTIONS[2],   // Knowledge transfer protocol
    DR_INTERVENTIONS[2],   // Structural bottleneck fix
  ],
  CLT: CLT_INTERVENTIONS,
  CS:  CS_INTERVENTIONS,
}

export const OPERATIONAL_TRIGGER_RULES: TriggerRule[] = [
  {
    id: 'tr-hotfix-spike',
    if_condition: 'IF Hotfix Frequency עולה ב-25% מעל baseline חודשי',
    then_action: 'THEN הפעל NOD protocol: Near-miss triage + Just Culture + debt allocation',
    severity: 'high',
  },
  {
    id: 'tr-aim-low',
    if_condition: 'IF AIM < 3.0 לפני rollout',
    then_action: 'THEN הקפא rollout ובצע friction mapping לפני פריסה',
    severity: 'high',
  },
  {
    id: 'tr-near-miss-zero',
    if_condition: 'IF near-miss reporting = 0 לאורך רבעון',
    then_action: 'THEN הפעל ZSG reboot: no-blame reporting + safety activation',
    severity: 'high',
  },
  {
    id: 'tr-daci-latency',
    if_condition: 'IF decision latency > 48h בפרויקטי ליבה',
    then_action: 'THEN הפעל DACI tightening עם Driver/Approver יחיד',
    severity: 'high',
  },
  {
    id: 'tr-fim-low',
    if_condition: 'IF FIM < 2.5 עקב מחסור תשתיתי',
    then_action: 'THEN העבר קיבולת מיידית ל-Platform/Enablement לפני התערבות עומק',
    severity: 'medium',
  },
  {
    id: 'tr-cs-freeze',
    if_condition: 'IF systemic stress (CS amplifier) מזוהה',
    then_action: 'THEN הפעל Systemic Friction Halt ו-stop new change initiatives',
    severity: 'high',
  },
]

export const MANDATORY_COMORBIDITY_SEQUENCES: Array<{
  id:
    | 'clt-before-cs'
    | 'zsg-before-old'
    | 'zsg-safety-before-old'
    | 'zsg-culture-before-old'
    | 'sc-before-nod'
  when: string
  first: PathologyType | 'SC'
  then: PathologyType
}> = [
  { id: 'clt-before-cs', when: 'CS amplifier + high UC', first: 'CLT', then: 'CS' },
  { id: 'zsg-safety-before-old', when: 'OLD with low psychological safety', first: 'ZSG_SAFETY', then: 'OLD' },
  { id: 'zsg-culture-before-old', when: 'OLD with zero-sum culture', first: 'ZSG_CULTURE', then: 'OLD' },
  { id: 'sc-before-nod', when: 'NOD with high structural ambiguity', first: 'SC', then: 'NOD' },
]

export const DEFAULT_GATE_REVIEWS: GateReview[] = [
  {
    id: 'gate-1',
    week: 2,
    title_he: 'Gate 1 — ייצוב עומס וקיצור שיהוי',
    pass_criteria: ['Decision latency <= 48h בפרויקטי ליבה', '>=80% שמירה על guarded blocks'],
  },
  {
    id: 'gate-2',
    week: 4,
    title_he: 'Gate 2 — פתיחות ודיווח בטוח',
    pass_criteria: ['Near-miss עולה מאפס ל-flow פעיל', 'No-blame response נשמר ללא סנקציות דיווח'],
  },
  {
    id: 'gate-3',
    week: 8,
    title_he: 'Gate 3 — עקירת סטיות ולמידה כפולה',
    pass_criteria: ['>=40% ירידה ב-hotfixes', 'AARs כוללים שינוי הנחות (double-loop)'],
  },
  {
    id: 'gate-4',
    week: 12,
    title_he: 'Gate 4 — קיבוע חוסן ומניעת ריבאונד',
    pass_criteria: ['שיפור OHI/health יציב', 'Change fatigue נשארת בטווח נסבל'],
  },
]

// ─── IUS Engine ───────────────────────────────────────────────────────────────

const HORIZON_DAYS: Record<InterventionHorizon, number> = {
  '14d': 14,
  '30d': 30,
  '90d': 90,
}

// IUS weights: α=IAM β=AIM γ=FIM δ=Impact (must sum to 1.0)
const W = { iam: 0.25, aim: 0.20, fim: 0.20, impact: 0.35 }

/**
 * computeIUS — Scores a single intervention against a ConstraintEnvelope.
 *
 * Constraint logic (binary gate BEFORE scoring):
 *   T-constraint: horizon_days > t_max → T-violation → try MVC
 *   R-constraint: item.aim < r_max → R-violation → try MVC
 *
 * MVC revision: if either constraint violated but IAM >= 4,
 *   the intervention is revised to minimal footprint and flagged mvc_revised.
 *   Penalty = 10 points off normalised score.
 *
 * Returns null if intervention cannot be fit even as MVC.
 */
export function computeIUS(
  item: ActionPlanItem,
  envelope: ConstraintEnvelope
): IUSScore | null {
  const horizonDays = HORIZON_DAYS[item.horizon]
  const tViolation = horizonDays > envelope.t_max
  const rViolation = item.aim < envelope.r_max

  let mvc_revised = false
  let mvc_description: string | undefined
  let constraint_penalty = 0

  if (tViolation || rViolation) {
    // Attempt MVC: item needs IAM >= 4 to be worth revising
    if (item.iam < 4) return null

    mvc_revised = true
    constraint_penalty = 10

    if (tViolation && rViolation) {
      mvc_description = `גרסת MVC: מיושמת עם צוות-פיילוט אחד בלבד תוך ${envelope.t_max} יום — ללא שינוי מלא עד לאישור תוצאות`
    } else if (tViolation) {
      mvc_description = `גרסת MVC: מצומצמת ל-${envelope.t_max} יום — מיישמים רק את רכיב ה-Tourniquet הישיר`
    } else {
      mvc_description = `גרסת MVC: מיושמת כ-pilot עם קבוצה מוכנה אחת (לא org-wide) — מפחיתה את רמת ההפרעה`
    }
  }

  // Raw IUS score: weighted sum on 1–5 scale
  const raw =
    W.iam * item.iam +
    W.aim * item.aim +
    W.fim * item.fim +
    W.impact * item.impact

  // Normalise to 0–100, apply penalty
  const normalised = ((raw - 1) / 4) * 100
  const score = Math.max(0, Math.round(normalised - constraint_penalty))

  return { raw, score, constraint_penalty, mvc_revised, mvc_description }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns 3 prioritised interventions for a given diagnosis.
 *
 * Selection strategy:
 *   1. Candidate pool assembled from pathology-type bank or axis bank
 *   2. Filter by applicable_profiles
 *   3. Apply ConstraintEnvelope (binary gate) via computeIUS — exclude if null
 *   4. Rank by IUS score descending
 *   5. Return top 3 with _ius attached
 */
export function buildActionPlan(
  dominantAxis: DiagnosticAxis,
  profile: PathologyProfile,
  scores: { dr: number; nd: number; uc: number; sc?: number },
  pathologyType?: PathologyType,
  csAmplifier?: boolean,
  envelope?: ConstraintEnvelope,
  runtimeConfig?: Pick<DiagnosticRuntimeConfig, 'evidenceProfiles'>
): ActionPlanItem[] {
  const byAxis: Record<DiagnosticAxis, ActionPlanItem[]> = {
    DR: DR_INTERVENTIONS,
    ND: ND_INTERVENTIONS,
    UC: UC_INTERVENTIONS,
    SC: SC_INTERVENTIONS,
  }

  // ── Step 1: Assemble candidate pool ──────────────────────────────────────
  let candidates: ActionPlanItem[]

  if (csAmplifier) {
    const cltFirst = (scores.uc >= 6 || scores.dr >= 6) ? CLT_INTERVENTIONS : []
    candidates = [...cltFirst, ...CS_INTERVENTIONS]
  } else if (pathologyType && pathologyType !== 'CS') {
    const bank = PATHOLOGY_BANKS[pathologyType]
    // augment with secondary-axis items for diversity
    const axisScores: [DiagnosticAxis, number][] = [
      ['DR', scores.dr],
      ['ND', scores.nd],
      ['UC', scores.uc],
      ['SC', scores.sc ?? 0],
    ]
    axisScores.sort((a, b) => b[1] - a[1])
    const secondAxis = axisScores.find(([a]) => a !== dominantAxis)?.[0] ?? dominantAxis
    const scBeforeNod = pathologyType === 'NOD' && (scores.sc ?? 0) >= 6
    const primary = scBeforeNod ? byAxis.SC : bank
    candidates = [...primary, ...bank, ...byAxis[secondAxis]]
    if (pathologyType === 'OLD' && scores.nd >= 5) {
      candidates = [
        ...ZSG_SAFETY_INTERVENTIONS,
        ...ZSG_CULTURE_INTERVENTIONS,
        ...candidates,
      ]
    }
  } else {
    const axisScores: [DiagnosticAxis, number][] = [
      ['DR', scores.dr],
      ['ND', scores.nd],
      ['UC', scores.uc],
      ['SC', scores.sc ?? 0],
    ]
    axisScores.sort((a, b) => b[1] - a[1])
    const secondAxis = axisScores.find(([a]) => a !== dominantAxis)?.[0] ?? dominantAxis
    candidates = [...byAxis[dominantAxis], ...byAxis[secondAxis]]
  }

  // ── Step 2: Filter by profile ─────────────────────────────────────────────
  const profileFiltered = candidates.filter(i => i.applicable_profiles.includes(profile))

  // ── Step 3: Apply ConstraintEnvelope (binary gate) + score ───────────────
  if (envelope) {
    const scored: Array<ActionPlanItem & { _ius: IUSScore }> = []
    const seen = new Set<string>()

    for (const item of profileFiltered) {
      // deduplicate by title (pool may contain duplicates from augmentation)
      if (seen.has(item.title_he)) continue
      seen.add(item.title_he)

      const ius = computeIUS(item, envelope)
      if (ius === null) continue  // fails constraint and cannot be MVC-revised

      scored.push({
        ...item,
        _ius: ius,
        evidence: inferEvidence(item, runtimeConfig?.evidenceProfiles),
        kpi_stack: buildKpiStack(item),
      })
    }

    // ── Step 4: Rank by IUS score descending ─────────────────────────────
    scored.sort((a, b) => b._ius.score - a._ius.score)

    // ── Step 5: Return top 3 ──────────────────────────────────────────────
    return scored.slice(0, 3)
  }

  // ── No envelope: legacy behaviour (deduplicated, first 3) ─────────────────
  const seen = new Set<string>()
  const result: ActionPlanItem[] = []
  for (const item of profileFiltered) {
    if (seen.has(item.title_he)) continue
    seen.add(item.title_he)
    result.push({
      ...item,
      evidence: inferEvidence(item, runtimeConfig?.evidenceProfiles),
      kpi_stack: buildKpiStack(item),
    })
    if (result.length === 3) break
  }
  return result
}

function inferEvidence(item: ActionPlanItem, profiles?: EvidenceProfileRow[]): InterventionEvidence {
  const override = profiles?.find((p) => p.intervention_tag === item.tag)
  if (override) {
    return {
      level: override.evidence_level,
      citations: override.citations,
      evidence_note: override.evidence_note,
    }
  }
  if (item.tag.includes('Just Culture') || item.tag.includes('Psychological Safety')) {
    return {
      level: 'high',
      citations: ['Edmondson (1999)', 'ECRI Just Culture'],
      evidence_note: 'Validated implementation outcomes and safety effects in high-risk settings.',
    }
  }
  if (item.tag.includes('Double-Loop') || item.tag.includes('Cognitive Load') || item.tag.includes('DACI')) {
    return {
      level: 'contextual',
      citations: ['Argyris Double-Loop', 'Team Topologies', 'Decision frameworks'],
      evidence_note: 'Strong contextual evidence; requires local baseline calibration.',
    }
  }
  return {
    level: 'gap',
    citations: ['Local baseline required'],
    evidence_note: 'Needs controlled local validation before broad rollout.',
  }
}

function buildKpiStack(item: ActionPlanItem): InterventionKpiStack {
  return {
    leading: [
      { name: item.metric_he, horizon: '1-2w' },
      { name: 'AIM/IAM pulse', horizon: '1-2w' },
      { name: 'Decision/Execution friction signal', horizon: '1-2w' },
    ],
    lagging: [
      { name: 'Defect/Hotfix trend', horizon: '4-12w' },
      { name: 'Throughput and cycle stability', horizon: '4-12w' },
      { name: 'Retention / burnout markers', horizon: '4-12w' },
    ],
    baseline: '30-day historical baseline before intervention',
    cadence: item.horizon === '14d' ? 'Weekly' : item.horizon === '30d' ? 'Bi-weekly' : 'Every 14 days + monthly board review',
    target_range: item.horizon === '14d' ? 'Early stabilization within 2 weeks' : item.horizon === '30d' ? '>=20-40% trend improvement by week 4-6' : 'Sustained improvement without rebound by week 12',
  }
}

export function evaluateTriggerRules(input: TriggerEvaluationInput): TriggerRule[] {
  return evaluateTriggerRulesWithConfig(input, OPERATIONAL_TRIGGER_RULES)
}

export function evaluateTriggerRulesWithConfig(
  input: TriggerEvaluationInput,
  rules: TriggerRule[]
): TriggerRule[] {
  const out: TriggerRule[] = []
  const byId = new Map(rules.map((r) => [r.id, r]))
  if (input.scores.dr >= 6 || input.dominantAxis === 'DR') {
    const r = byId.get('tr-daci-latency')
    if (r) out.push(r)
  }
  if (input.scores.nd >= 6 || input.pathologyType === 'NOD') {
    const r = byId.get('tr-hotfix-spike')
    if (r) out.push(r)
  }
  if (
    input.pathologyType === 'ZSG_SAFETY' ||
    input.pathologyType === 'ZSG_CULTURE' ||
    input.profile === 'critical' ||
    input.profile === 'systemic-collapse'
  ) {
    const r = byId.get('tr-near-miss-zero')
    if (r) out.push(r)
  }
  if (input.pathologyType === 'CS' || (input.scores.dr >= 6 && input.scores.nd >= 6 && input.scores.uc >= 6)) {
    const r = byId.get('tr-cs-freeze')
    if (r) out.push(r)
  }
  if (input.profile === 'at-risk') {
    const r = byId.get('tr-aim-low')
    if (r) out.push(r)
  }
  return Array.from(new Map(out.map((r) => [r.id, r])).values())
}

export function build90DayGateReviews(): GateReview[] {
  return DEFAULT_GATE_REVIEWS
}

export function build90DayGateReviewsWithConfig(gates?: GateReview[]): GateReview[] {
  return gates && gates.length > 0 ? gates : DEFAULT_GATE_REVIEWS
}

/**
 * Derives dominant axis from DR/ND/UC/SC scores.
 */
export function getDominantAxis(scores: { dr: number; nd: number; uc: number; sc?: number }): DiagnosticAxis {
  const axisScores: Array<[DiagnosticAxis, number]> = [
    ['DR', scores.dr],
    ['ND', scores.nd],
    ['UC', scores.uc],
    ['SC', scores.sc ?? 0],
  ]
  axisScores.sort((a, b) => b[1] - a[1])
  return axisScores[0][0]
}

/**
 * Derives severity profile from slider scores (fast-path triage, no embedding).
 */
export function profileFromScores(scores: { dr: number; nd: number; uc: number; sc?: number }): PathologyProfile {
  const max = Math.max(scores.dr, scores.nd, scores.uc, scores.sc ?? 0)
  if (max < 2.5) return 'healthy'
  if (max < 5)   return 'at-risk'
  if (max < 7.5) return 'critical'
  return 'systemic-collapse'
}

export const PROFILE_LABELS: Record<PathologyProfile, string> = {
  'healthy':           'תקין',
  'at-risk':           'בסיכון',
  'critical':          'קריטי',
  'systemic-collapse': 'קריסה מערכתית',
}

export const HORIZON_LABELS: Record<InterventionHorizon, string> = {
  '14d': '14 יום',
  '30d': '30 יום',
  '90d': '90 יום',
}

export const PATHOLOGY_TYPE_LABELS: Record<PathologyType, string> = {
  NOD: 'נורמליזציה של סטייה',
  ZSG_SAFETY: 'גירעון בביטחון פסיכולוגי',
  ZSG_CULTURE: 'תרבות ניכור פנים-ארגונית (סכום-אפס)',
  OLD: 'מוגבלות למידה ארגונית',
  CLT: 'עומס קוגניטיבי כרוני',
  CS:  'לחץ כרוני — מגביר מערכתי',
}

export const PATHOLOGY_PROTOCOL_MAP: Record<PathologyType, { protocol: string; successKpi: string }> = {
  NOD: { protocol: 'Vaughan Audit + Just Culture', successKpi: 'Hotfix Rate יורד, near-miss reporting עולה' },
  ZSG_SAFETY: { protocol: 'Edmondson PSI + Just Culture', successKpi: 'מדד בטחון פסיכולוגי עולה, דיווח מוקדם עולה' },
  ZSG_CULTURE: { protocol: 'Shared OKRs + RevOps/CoS', successKpi: 'Escalations בין צוותים יורדות, כפילויות יורדות' },
  OLD: { protocol: 'Double-Loop Learning + TTX', successKpi: 'Recurring Action Items יורדים מתחת 20%' },
  CLT: { protocol: 'Nudge Management + Async-First', successKpi: 'Context Switches יורדים, Focus Time עולה' },
  CS: { protocol: 'Tech Tourniquet + Capacity Buffer', successKpi: 'Decision Latency מתקצר, MBI Exhaustion יורד' },
}
