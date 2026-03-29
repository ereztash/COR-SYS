/**
 * שאלון COR-SYS — מבנה תוכנית עסקית לפי פתולוגיות, ICP ויעדים.
 * מבוסס על תשתית מחקרית: Dunbar, Greiner, Vaughan (NOD), Argyris (Double-Loop),
 * Floridi (Ontological Friction), Decision Latency Index.
 */

import { getOptionById } from './service-catalog'
import { computeIgnitionProfile } from '@/lib/business-ignition'
import type {
  IgnitionCommercialAsk,
  IgnitionDominantTrap,
  IgnitionLifecycleStage,
  IgnitionPrimaryVector,
  IgnitionProfile,
} from '@/lib/ignition-types'

// ─── Block 1: ICP ────────────────────────────────────────────────────────────

/** team = ארגון עם צוות; one_man_show = עצמאי/יזם יחיד ללא צוות פנימי קבוע */
export type OperatingContext = 'team' | 'one_man_show'

export type ChampionRole = 'ceo' | 'coo' | 'cfo' | 'other'
export type CompanySize =
  | 'under_50'
  | '50_150'
  | '150_300'
  | 'over_300'
  | 'oms_solo'
  | 'oms_micro'
  | 'oms_network'
export type IndustrySector = 'cyber_fintech' | 'ai_healthtech' | 'complex_b2b' | 'other'

// ─── Block 2: Pathologies ────────────────────────────────────────────────────

/** NOD — Normalization of Deviance (Vaughan) */
export type PathologyNod = 'high' | 'medium' | 'low'

/** Zero-Sum / Contradiction Loss */
export type PathologyZeroSum = 'frequent' | 'occasional' | 'rare'

/** Learning Deficit — Single-Loop vs Double-Loop (Argyris) */
export type PathologyLearning = 'single_loop' | 'mixed' | 'double_loop'

/** Semantic Drift / Ontological Friction (Floridi) */
export type PathologySemantic = 'high_drift' | 'medium_drift' | 'low_drift'

/** Structural Clarity — undefined roles, undocumented processes, missing first principles.
 *  Reductionist-Logical dimension (MECE 4th category, Phase 4 addition). */
export type PathologySc = 'high' | 'medium' | 'low' // high = high dysfunction

// ─── Block 3: Metrics ────────────────────────────────────────────────────────

/** Edmondson PSI — 7-point Likert scale (1=Strongly Disagree, 7=Strongly Agree)
 *  Academic source: Edmondson, A.C. (1999) — Administrative Science Quarterly
 *  Items 1, 3, 5 are reverse-scored: score = 8 - raw_value
 *  PSI average used in LG formula: LG = 0.571×(-ΔDR) + 0.429×(ΔPSI) */
export type PsiRating = '1' | '2' | '3' | '4' | '5' | '6' | '7'

export type DecisionLatency = 'over_15' | '5_to_15' | 'under_5'
export type InterventionGoal = 'reduce_latency' | 'reduce_entropy' | 'both' | 'audit_only'
export type UrgencyLevel = 'high' | 'medium' | 'low'
export type GreinerStage = 'phase_1_2' | 'phase_3' | 'phase_4' | 'phase_5'
export type AdaptiveCapacity = 'rigid' | 'slow_adapt' | 'agile'
export type VoiceInfrastructure = 'no_channel' | 'unused_channel' | 'effective_channel'
export type LeadershipCascade = 'micromanage' | 'partial_delegation' | 'full_delegation'
export type StrategyExecution = 'no_cascade' | 'partial_cascade' | 'full_cascade'
export type EngagementProxy = 'burnout' | 'mixed' | 'high'

// ─── Main interface ───────────────────────────────────────────────────────────

export interface QuestionnaireAnswer {
  // Block 1 — ICP
  operatingContext?: OperatingContext
  championRole?: ChampionRole
  companySize?: CompanySize
  industrySector?: IndustrySector

  // Block 2 — Pathologies
  pathologyNod?: PathologyNod
  pathologyZeroSum?: PathologyZeroSum
  pathologyLearning?: PathologyLearning
  pathologySemantic?: PathologySemantic
  pathologySc?: PathologySc

  // Block 3 — Metrics
  decisionLatency?: DecisionLatency
  interventionGoal?: InterventionGoal
  urgencyLevel?: UrgencyLevel
  greinerStage?: GreinerStage
  adaptiveCapacity?: AdaptiveCapacity
  voiceInfrastructure?: VoiceInfrastructure
  leadershipCascade?: LeadershipCascade
  strategyExecution?: StrategyExecution
  engagementProxy?: EngagementProxy

  // Block 3b — התנעה עסקית (רלוונטי ל־one_man_show; נשמר ב־JSON)
  ignitionLifecycleStage?: IgnitionLifecycleStage
  ignitionPrimaryVector?: IgnitionPrimaryVector
  ignitionDominantTrap?: IgnitionDominantTrap
  ignitionLastCommercialAsk?: IgnitionCommercialAsk

  // Block 4 — Edmondson PSI (7-item Psychological Safety Index)
  // Scale: 1=Strongly Disagree, 7=Strongly Agree
  // Items 1, 3, 5 are REVERSED (negatively worded)
  psi1?: PsiRating  // "אם עושים טעות, זה מוחזק כנגדך" ← REVERSED
  psi2?: PsiRating  // "חברי הצוות יכולים להעלות בעיות קשות"
  psi3?: PsiRating  // "אנשים לפעמים דוחים אחרים שהם שונים" ← REVERSED
  psi4?: PsiRating  // "זה בטוח לקחת סיכונים בצוות"
  psi5?: PsiRating  // "קשה לבקש עזרה מחברי הצוות" ← REVERSED
  psi6?: PsiRating  // "אף אחד לא יפגע במאמצים שלי בכוונה"
  psi7?: PsiRating  // "הכישורים שלי מוערכים ומנוצלים"
}

// ─── Questionnaire Steps ──────────────────────────────────────────────────────

/** שדה אחרי מיזוג טקסטים לפי operatingContext (לטפסים) */
export type ResolvedQuestionnaireField = {
  key: string
  label: string
  type: 'select' | 'scale'
  required?: boolean
  options?: { value: string; label: string }[]
  scaleMin?: number
  scaleMax?: number
  scaleLabels?: { min: string; max: string }
  reversed?: boolean
}

export type ResolvedQuestionnaireStep = {
  id: string
  title: string
  fields: ResolvedQuestionnaireField[]
}

type OmsFieldOverlay = {
  label?: string
  options?: { value: string; label: string }[]
  scaleLabels?: { min: string; max: string }
}

type QuestionnaireFieldDef = ResolvedQuestionnaireField & { oms?: OmsFieldOverlay }

type QuestionnaireStepDef = {
  id: string
  title: string
  omsTitle?: string
  /** כשמוגדר — השלב מוצג רק ב־one_man_show */
  omsOnly?: boolean
  fields: QuestionnaireFieldDef[]
}

const QUESTIONNAIRE_STEPS_RAW: QuestionnaireStepDef[] = [
  {
    id: 'icp',
    title: 'אפיון הלקוח והקשר ארגוני',
    omsTitle: 'אפיון העצמאי/ת והקשר העסקי',
    fields: [
      {
        key: 'operatingContext',
        label: 'איך הכי נכון לתאר את דפוס העבודה שלך?',
        type: 'select',
        required: true,
        options: [
          { value: 'team', label: 'ארגון / חברה עם צוות ושכבות תפקיד (לא One man show)' },
          { value: 'one_man_show', label: 'One man show — אני העסק (עצמאי, יזם יחיד, בלי צוות פנימי קבוע)' },
        ],
      },
      {
        key: 'championRole',
        label: 'מהו תפקידך המרכזי והאחריות שלך בארגון?',
        type: 'select',
        required: true,
        options: [
          { value: 'ceo', label: 'מנכ"ל או יזם (מוכוון אסטרטגיה וצמיחה)' },
          { value: 'coo', label: 'סמנכ"ל תפעול / משאבי אנוש (מוכוון ביצוע)' },
          { value: 'cfo', label: 'סמנכ"ל כספים (מוכוון ROI ועלויות)' },
          { value: 'other', label: 'מנהל אחר' },
        ],
        oms: {
          label: 'מה התפקיד המרכזי שלך ביחס לעסק?',
          options: [
            { value: 'ceo', label: 'יזם / בעלים / עצמאי — אני מחליט ומבצע את רוב הליבה לבד' },
            { value: 'coo', label: 'מנהל תפעול / רכז פרויקטים (אם יש תפקיד כזה אצלי)' },
            { value: 'cfo', label: 'אחראי/ת כספים — פנימי חלקי או יועץ חיצוני קרוב' },
            { value: 'other', label: 'תפקיד אחר רלוונטי' },
          ],
        },
      },
      {
        key: 'companySize',
        label: 'מהו גודל הארגון שלך (מספר עובדים)?',
        type: 'select',
        required: true,
        options: [
          { value: 'under_50', label: 'עד 50 עובדים (תקשורת ישירה)' },
          { value: '50_150', label: '50 עד 150 עובדים (שלב צמיחה ומעבר)' },
          { value: '150_300', label: '150 עד 300 עובדים (משבר מורכבות)' },
          { value: 'over_300', label: 'מעל 300 עובדים' },
        ],
        oms: {
          label: 'איך נראה מודל ההרחבה שלך מעבר ל"אני"?',
          options: [
            { value: 'oms_solo', label: 'רק אני מפעיל/ה את העסק (ללא שכירים קבועים)' },
            { value: 'oms_micro', label: 'אני + עד 3 אנשים קבועים (שכירים או שותפים פעילים)' },
            { value: 'oms_network', label: 'בעיקר אני + רשת ספקים / קבלני משנה לפי פרויקט' },
          ],
        },
      },
      {
        key: 'industrySector',
        label: 'באיזה ענף או סקטור פועל הארגון?',
        type: 'select',
        required: true,
        options: [
          { value: 'cyber_fintech', label: 'סייבר או פינטק' },
          { value: 'ai_healthtech', label: 'בינה מלאכותית, מדעי החיים' },
          { value: 'complex_b2b', label: 'תוכנה ו-B2B מורכב' },
          { value: 'other', label: 'אחר' },
        ],
        oms: {
          label: 'באיזה תחום או שוק את/ה פועל/ת?',
        },
      },
    ],
  },
  {
    id: 'pathologies',
    title: 'אבחון פתולוגיות ודימום קוגניטיבי',
    omsTitle: 'אבחון עומס קוגניטיבי ודפוסי עבודה (עצמאי)',
    fields: [
      {
        key: 'pathologyNod',
        label: 'בסביבת העבודה היומיומית, באיזו תדירות צוותים עוקפים נהלים רשמיים, יוצרים "אקסלים צדדיים" או משתמשים בקיצורי דרך כדי לעמוד ביעדים תחת לחץ?',
        type: 'select',
        required: true,
        options: [
          { value: 'high', label: 'כמעט תמיד — זו הדרך המעשית היחידה לגרום לדברים לקרות מהר' },
          { value: 'medium', label: 'לעיתים, בעיקר בתקופות עומס ולחץ לספק תוצאות' },
          { value: 'low', label: 'נדיר מאוד — נהלי העבודה ומערכות הליבה תומכים היטב בעבודה' },
        ],
        oms: {
          label:
            'בעבודה השוטפת שלך, באיזו תדירות את/ה (או מי שעובד איתך) עוקפים נהלים, כלים או "איך שכתוב" — ונשענים על דרך מהירה/אקסל צדדי כדי לספק ללקוח או לעמוד בדדליין?',
          options: [
            { value: 'high', label: 'כמעט תמיד — בלי זה הפיצ\'רים והמשלוחים לא יוצאים לדרך בזמן' },
            { value: 'medium', label: 'לעיתים, בעיקר כשהלחץ עולה או כשהלקוח דוחף' },
            { value: 'low', label: 'נדיר — התהליכים והכלים שלי תומכים בעבודה בלי לברוח מהם כל הזמן' },
          ],
        },
      },
      {
        key: 'pathologyZeroSum',
        label: 'האם קיימת בארגון תחושה שהצלחה של מחלקה אחת (למשל, מכירות) באה לעיתים קרובות על חשבון עומס או פגיעה ביעדים של מחלקה אחרת (למשל, תפעול)?',
        type: 'select',
        required: true,
        options: [
          { value: 'frequent', label: 'כן, קיים חיכוך מתמיד הנובע מיעדים ואינטרסים מנוגדים' },
          { value: 'occasional', label: 'לפעמים, תלוי בסיטואציה ולרוב סביב סופי רבעון' },
          { value: 'rare', label: 'לא, קיימת סינרגיה וסנכרון ברור של מדדים ואחריות' },
        ],
        oms: {
          label:
            'האם יש אצלך מתח מתמשך בין "כובעים" או זרמים (למשל מכירות מול איכות מסירה, לקוחות מול קיבולת, מוצר מול תפעול) — כך שהצלחה באחד באה לעיתים על חשבון השני?',
          options: [
            { value: 'frequent', label: 'כן — אני תקוע/ה בין אינטרסים מנוגדים כמעט כל הזמן' },
            { value: 'occasional', label: 'לפעמים, בעיקר בסוף רבעון או כשהכל נהיה צפוף' },
            { value: 'rare', label: 'לא — יש לי סדר עדיפויות וגבולות ברורים בין מה שחשוב עכשיו' },
          ],
        },
      },
      {
        key: 'pathologyLearning',
        label: 'כאשר מתרחשת תקלה משמעותית או עיכוב מרכזי, מה מאפיין לרוב את התגובה הארגונית לאחר מכן?',
        type: 'select',
        required: true,
        options: [
          { value: 'single_loop', label: '"כיבוי שריפות" — ממהרים לתקן את התקלה הנקודתית וממשיכים הלאה' },
          { value: 'mixed', label: 'מבצעים תחקיר, אך לרוב התובנות לא מתורגמות לשינוי תהליכי עומק' },
          { value: 'double_loop', label: 'למידה עמוקה — בוחנים ומשנים את ההנחות ונהלי העבודה שאפשרו לתקלה לקרות' },
        ],
        oms: {
          label: 'כשיש כשל במסירה, בלקוח, או בעיכוב משמעותי — מה לרוב קורה אצלך אחרי זה?',
          options: [
            { value: 'single_loop', label: 'מתקן/ת מה שנשבר ורצים הלאה — אין זמן לעצור' },
            { value: 'mixed', label: 'יש סיבוב ראש אבל לרוב לא משנים את השגרה שייצרה את הבעיה' },
            { value: 'double_loop', label: 'בודקים מה להנחות/תהליך לשנות כדי שלא יחזור' },
          ],
        },
      },
      {
        key: 'pathologySemantic',
        label: 'עד כמה הגדרות העבודה, גבולות האחריות בין תפקידים ומושגי יסוד (כמו "פרויקט הושלם") ברורים ומוסכמים באותה צורה על פני כלל המחלקות?',
        type: 'select',
        required: true,
        options: [
          { value: 'high_drift', label: 'קיימים פערים משמעותיים בהבנה וויכוחים תכופים על תחומי אחריות והגדרות' },
          { value: 'medium_drift', label: 'ישנה הבנה כללית, אך נוצרים שטחים אפורים ובלבול מפעם לפעם' },
          { value: 'low_drift', label: 'בהירות גבוהה והסכמה מלאה על מילון המונחים הארגוני ותחומי האחריות' },
        ],
        oms: {
          label:
            'עד כמה מוסכם בינך לבין לקוחות, ספקים או שותפים מה נכלל ב"גמור", מה האחריות של מי, ומה מילון המונחים — בלי ויכוחים חוזרים?',
          options: [
            { value: 'high_drift', label: 'פערים גדולים — הרבה תרגום וניחושים בין מה שאמרו למה שקורה' },
            { value: 'medium_drift', label: 'בגדול ברור, אבל יש שטחים אפורים שגורמים לחיכוך' },
            { value: 'low_drift', label: 'ברור ומוסכם — נדיר שמתווכחים על הגדרות' },
          ],
        },
      },
      {
        key: 'pathologySc',
        label: 'עד כמה המבנה הארגוני מוגדר בצורה ברורה — תפקידים, תהליכים, אחריות והיררכיית סמכות?',
        type: 'select',
        required: false,
        options: [
          { value: 'high', label: 'גבוהה — תפקידים לא מוגדרים, תהליכים לא מתועדים, אחריות מטושטשת לעיתים קרובות' },
          { value: 'medium', label: 'בינונית — קיים מבנה חלקי אך יש אי-בהירויות משמעותיות בשדות אפורים' },
          { value: 'low', label: 'נמוכה — מבנה ברור, תפקידים מוגדרים ותהליכים מתועדים בצורה שיטתית' },
        ],
        oms: {
          label: 'עד כמה אצלך ברור איך העסק רץ — תהליכים, צ\'ק-ליסטים, איפה נשמר ידע, ומה את/ה באמת אחראי/ת עליו?',
          options: [
            { value: 'high', label: 'הרבה בראש — חסר תיעוד, תפקידים מטושטשים, קשה להעביר למישהו אחר' },
            { value: 'medium', label: 'חלק מתועד וחלק חי בעל פה' },
            { value: 'low', label: 'מסודר — יש תהליכים ותיעוד שאפשר לעקוב אחריהם' },
          ],
        },
      },
    ],
  },
  {
    id: 'metrics',
    title: 'מדדי ביצוע והערכת דחיפות',
    omsTitle: 'מדדי זמן, עומס והערכת דחיפות (עצמאי)',
    fields: [
      {
        key: 'decisionLatency',
        label: 'כמה שעות בשבוע להערכתך שורף צוות הניהול על פגישות עודפות, כיבוי שריפות והמתנה להחלטות ואישורים (זמן שיכול היה להיות מוקדש לעבודה אסטרטגית)?',
        type: 'select',
        required: true,
        options: [
          { value: 'over_15', label: 'למעלה מ-15 שעות בשבוע (פגיעה קשה בניצול המשאבים)' },
          { value: '5_to_15', label: 'בין 5 ל-15 שעות בשבוע' },
          { value: 'under_5', label: 'פחות מ-5 שעות בשבוע (קצב החלטות מהיר)' },
        ],
        oms: {
          label:
            'כמה שעות בשבוע להערכתך נשרפות על בירוקרטיה, המתנה ללקוחות/ספקים, פגישות מיותרות, הקשרים והחלטות — במקום על עבודה שמייצרת הכנסה או מסירה?',
          options: [
            { value: 'over_15', label: 'מעל 15 שעות — רוב הזמן "מנהל את העסק" ולא בונה אותו' },
            { value: '5_to_15', label: 'בין 5 ל-15 שעות' },
            { value: 'under_5', label: 'פחות מ-5 שעות — זרימה יחסית מהירה' },
          ],
        },
      },
      {
        key: 'interventionGoal',
        label: 'מהו היעד הדחוף ביותר שעמו תרצה שארגונך יתמודד בטווח המיידי?',
        type: 'select',
        required: true,
        options: [
          { value: 'reduce_latency', label: 'האצת קצב קבלת ההחלטות והסרת צווארי בקבוק' },
          { value: 'reduce_entropy', label: 'עשיית סדר, יישור תהליכים וצמצום כאוס תפעולי' },
          { value: 'both', label: 'התמודדות משולבת עם אובדן הזמן והכאוס הארגוני' },
          { value: 'audit_only', label: 'רק לקבל אבחון מקצועי והערכת מצב אובייקטיבית' },
        ],
        oms: {
          label: 'מה הדבר הדחוף ביותר שאת/ה רוצה לשפר בעסק בטווח המיידי?',
          options: [
            { value: 'reduce_latency', label: 'להאיץ החלטות ולצמצם המתנות (לקוחות, ספקים, אישורים)' },
            { value: 'reduce_entropy', label: 'לעשות סדר — תהליכים, תיעוד, פחות כאוס בין כובעים' },
            { value: 'both', label: 'גם זמן וגם סדר — שניהם חונקים אותי' },
            { value: 'audit_only', label: 'רק אבחון והבנה אובייקטיבית של המצב' },
          ],
        },
      },
      {
        key: 'urgencyLevel',
        label: 'כיצד היית מגדיר את רמת הדחיפות לפתרון חסמים אלו ביחס ליעדי החברה הנוכחיים?',
        type: 'select',
        required: false,
        options: [
          { value: 'high', label: 'קריטי ומיידי (החסמים פוגעים בצמיחה או ברווחיות כעת)' },
          { value: 'medium', label: 'חשוב מאוד לביצוע ברבעונים הקרובים' },
          { value: 'low', label: 'משימה אסטרטגית עתידית, ללא דחיפות מיידית' },
        ],
        oms: {
          label: 'כמה דחוף לטפל בחסמים האלה ביחס ליעדים שלך לרווח ולצמיחה?',
        },
      },
    ],
  },
  {
    id: 'ignition',
    title: 'התנעה עסקית',
    omsTitle: 'התנעה עסקית — מ"תנועה" ל"פעולה"',
    omsOnly: true,
    fields: [
      {
        key: 'ignitionLifecycleStage',
        label: 'איפה העסק בזמן? (אופציונלי — בלי גיל)',
        type: 'select',
        required: false,
        options: [
          { value: 'early_under_1y', label: 'פחות משנה בתפעול עצמאי מלא' },
          { value: 'one_to_three', label: 'בין שנה לשלוש' },
          { value: 'three_plus', label: 'מעל שלוש שנים' },
          { value: 'prefer_not', label: 'מעדיף/ה לא לציין' },
        ],
      },
      {
        key: 'ignitionPrimaryVector',
        label: 'איזה וקטור התנעה הכי מתאר אותך עכשיו?',
        type: 'select',
        required: true,
        options: [
          {
            value: 'internal_push',
            label: 'מה שיש לי עכשיו — קשרים, מיומנות, לקוח 0 (Effectuation / בריקולאז׳)',
          },
          {
            value: 'market_pull',
            label: 'כאב שוק חד — אימות ביקוש לפני בנייה כבדה (Lean / JTBD)',
          },
          {
            value: 'capital_blitz',
            label: 'הון או מסה — פריצה מהירה עם משאבים גדולים',
          },
          {
            value: 'momentum_transfer',
            label: 'תנע מועבר — זיכיון, רכישה, או רכיבה על גל חיצוני',
          },
        ],
      },
      {
        key: 'ignitionDominantTrap',
        label: 'איזה דפוס הכי בולט אצלך היום?',
        type: 'select',
        required: true,
        options: [
          { value: 'prep_trap', label: 'מלכודת הכנה — ליטוש חומרים בלי הצעה מסחרית חוזרת' },
          { value: 'over_learn', label: 'אגירת לימוד — קורסים ותוכן בלי סגירה' },
          { value: 'free_value', label: 'ערך בחינם — קהילות ותשובות בלי מסלול לתשלום' },
          { value: 'busy_motion', label: 'תנועה חברתית — פגישות ותוכן בלי בקשה מסחרית חדה' },
          { value: 'none_clear', label: 'לא בטוח/ה — רוצה מיקוד' },
        ],
      },
      {
        key: 'ignitionLastCommercialAsk',
        label: 'מתי בפעם האחרונה ביצעת פעולה מסחרית מול לקוח (הצעת מחיר, בקשת תשלום, הצעת שירות ממוקדת)?',
        type: 'select',
        required: true,
        options: [
          { value: 'within_7d', label: 'בשבוע האחרון' },
          { value: 'within_30d', label: 'בחודש האחרון' },
          { value: 'within_90d', label: 'בשלושת החודשים האחרונים' },
          { value: 'over_90d', label: 'לפני יותר מ־90 יום' },
          { value: 'never_recent', label: 'לא בזמן האחרון / כמעט לא' },
        ],
      },
    ],
  },
  {
    id: 'psi',
    title: 'בטיחות פסיכולוגית בצוות (Edmondson PSI)',
    omsTitle: 'בטיחות פסיכולוגית מול המעגל המקצועי (PSI מותאם לעצמאי)',
    fields: [
      {
        key: 'psi1',
        label: '⚠️ [1] בצוות שלנו, אם עושים טעות — זה מוחזק כנגדך',
        type: 'scale',
        required: true,
        scaleMin: 1,
        scaleMax: 7,
        scaleLabels: { min: 'לא מסכים כלל (1)', max: 'מסכים מאוד (7)' },
        reversed: true,
        options: [
          { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
          { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' },
          { value: '7', label: '7' },
        ],
        oms: {
          label:
            '⚠️ [1] במעגל המקצועי הקרוב (לקוחות / שותפים / ספקים), כשטועים — זה "נזכר" נגדי או יוצר עימות',
          scaleLabels: { min: 'לא מסכים (1)', max: 'מסכים מאוד (7)' },
        },
      },
      {
        key: 'psi2',
        label: '[2] חברי הצוות יכולים להעלות בעיות ונושאים קשים',
        type: 'scale',
        required: true,
        scaleMin: 1,
        scaleMax: 7,
        scaleLabels: { min: 'לא מסכים כלל (1)', max: 'מסכים מאוד (7)' },
        reversed: false,
        options: [
          { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
          { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' },
          { value: '7', label: '7' },
        ],
        oms: {
          label: '[2] אפשר להעלות נושאים קשים (מחיר, גבולות, איכות) מול מי שאני עובד איתו בלי לפחד מנקמה',
        },
      },
      {
        key: 'psi3',
        label: '⚠️ [3] אנשים בצוות לפעמים דוחים אחרים בגלל שהם שונים',
        type: 'scale',
        required: true,
        scaleMin: 1,
        scaleMax: 7,
        scaleLabels: { min: 'לא מסכים כלל (1)', max: 'מסכים מאוד (7)' },
        reversed: true,
        options: [
          { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
          { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' },
          { value: '7', label: '7' },
        ],
        oms: {
          label: '⚠️ [3] במעגל הזה יש דחייה או ביקורת על אנשים כי הם "לא כמו כולם" או שונים בסגנון',
        },
      },
      {
        key: 'psi4',
        label: '[4] זה בטוח לקחת סיכונים בצוות הזה',
        type: 'scale',
        required: true,
        scaleMin: 1,
        scaleMax: 7,
        scaleLabels: { min: 'לא מסכים כלל (1)', max: 'מסכים מאוד (7)' },
        reversed: false,
        options: [
          { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
          { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' },
          { value: '7', label: '7' },
        ],
        oms: {
          label: '[4] בטוח לי לנסות גישה חדשה או לקחת סיכון מקצועי (הצעה, ניסוי, גבול) בלי שזה יהפוך ל"אסון"',
        },
      },
      {
        key: 'psi5',
        label: '⚠️ [5] קשה לבקש עזרה מחברי צוות אחרים',
        type: 'scale',
        required: true,
        scaleMin: 1,
        scaleMax: 7,
        scaleLabels: { min: 'לא מסכים כלל (1)', max: 'מסכים מאוד (7)' },
        reversed: true,
        options: [
          { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
          { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' },
          { value: '7', label: '7' },
        ],
        oms: {
          label: '⚠️ [5] קשה לבקש עזרה מספק, שותף או לקוח כשאני תקוע/ה — אני מעדיף/ה לסחוט לבד',
        },
      },
      {
        key: 'psi6',
        label: '[6] אף אחד בצוות לא יפעל בכוונה בדרך שפוגעת במאמצים שלי',
        type: 'scale',
        required: true,
        scaleMin: 1,
        scaleMax: 7,
        scaleLabels: { min: 'לא מסכים כלל (1)', max: 'מסכים מאוד (7)' },
        reversed: false,
        options: [
          { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
          { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' },
          { value: '7', label: '7' },
        ],
        oms: {
          label: '[6] במעגל המקצועי הקרוב, אף אחד לא יפגע במכוון במאמצים שלי או ינסה לסבך לי בכוונה',
        },
      },
      {
        key: 'psi7',
        label: '[7] הכישורים והיכולות הייחודיים שלי מוערכים ומנוצלים בעבודה',
        type: 'scale',
        required: true,
        scaleMin: 1,
        scaleMax: 7,
        scaleLabels: { min: 'לא מסכים כלל (1)', max: 'מסכים מאוד (7)' },
        reversed: false,
        options: [
          { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
          { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' },
          { value: '7', label: '7' },
        ],
        oms: {
          label: '[7] הכישורים שלי מוערכים ומנוצלים היטב ביחסים המקצועיים שיש לי (לקוחות / שותפים)',
        },
      },
    ],
  },
  {
    id: 'moderators',
    title: 'Moderators והערכת הסתגלות',
    omsTitle: 'הסתגלות, סמכות וביצוע (מותאם לעצמאי)',
    fields: [
      {
        key: 'greinerStage',
        label: 'מהו אתגר הצמיחה הניהולי הדומיננטי כרגע בארגון?',
        type: 'select',
        required: false,
        options: [
          { value: 'phase_1_2', label: 'מייסדים עדיין מנהלים ישירות — חסר delegation מבני (Greiner 1-2)' },
          { value: 'phase_3', label: 'חוסר שליטה בין יחידות — כל מחלקה מושכת לכיוון אחר (Greiner 3)' },
          { value: 'phase_4', label: 'עודף ביורוקרטיה — שינוי דורש יותר מדי אישורים (Greiner 4)' },
          { value: 'phase_5', label: 'הצמיחה נבלמת — נדרשת הסתגלות וחדשנות ארגונית (Greiner 5)' },
        ],
        oms: {
          label: 'מהו אתגר הצמיחה או הסקייל הדומיננטי אצלך כרגע כעצמאי?',
          options: [
            { value: 'phase_1_2', label: 'הכל עובר דרכי — אין באמת מי לפרוש אליו עבודה' },
            { value: 'phase_3', label: 'יותר מדי כיוונים במקביל — לקוחות, מוצרים, שיווק, מסירה — בלי סדר עדיפויות' },
            { value: 'phase_4', label: 'הרבה "פרוצדורות" שיצרתי לעצמי — קשה לזוז מהר' },
            { value: 'phase_5', label: 'הצמיחה נתקעת — צריך מודל חדש או שוק חדש וקשה להסתגל' },
          ],
        },
      },
      {
        key: 'adaptiveCapacity',
        label: 'כאשר מתרחש שינוי משמעותי בשוק, מה מאפיין את תגובת הארגון?',
        type: 'select',
        required: false,
        options: [
          { value: 'rigid', label: 'ממשיכים כרגיל; שינוי נתפס כהפרעה ולא כהזדמנות' },
          { value: 'slow_adapt', label: 'מגיבים, אך באיחור משמעותי ובמאמץ חריג' },
          { value: 'agile', label: 'מסתגלים מהר; יש מנגנון קבוע לסריקה ותגובה' },
        ],
        oms: {
          label: 'כשהשוק זז או שהלקוחות משתנים — איך את/ה מגיב/ה בפועל?',
        },
      },
      {
        key: 'voiceInfrastructure',
        label: 'כאשר עובד מזהה בעיה, עד כמה קיימת תשתית דיווח אפקטיבית?',
        type: 'select',
        required: false,
        options: [
          { value: 'no_channel', label: 'אין ערוץ ברור או שדיווחים נבלעים ללא תגובה' },
          { value: 'unused_channel', label: 'יש ערוצים אך כמעט לא משתמשים בהם בפועל' },
          { value: 'effective_channel', label: 'יש ערוץ חי, הדיווחים נקלטים ומטופלים בזמן סביר' },
        ],
        oms: {
          label: 'כשאת/ה או מישהו מהמעגל המקצועי מזהה בעיה — האם יש דרך ברורה לדווח ולטפל?',
          options: [
            { value: 'no_channel', label: 'אין דרך ברורה — הבעיה נבלעת או נשארת אצלי בראש' },
            { value: 'unused_channel', label: 'יש SLA או מייל אבל בפועל לא משתמשים או לא מגיבים' },
            { value: 'effective_channel', label: 'יש ערוץ שעובד — מישהו מגיב וסוגר לולאה' },
          ],
        },
      },
      {
        key: 'leadershipCascade',
        label: 'כיצד היית מתאר את הדינמיקה בין הנהלה בכירה למנהלי ביניים?',
        type: 'select',
        required: false,
        options: [
          { value: 'micromanage', label: 'מיקרו-ניהול או היעדר הובלה; סמכות לא יורדת לשטח' },
          { value: 'partial_delegation', label: 'יש delegation חלקי, אך החלטות חוזרות ל-C-level' },
          { value: 'full_delegation', label: 'סמכות ברורה ושרשרת החלטה יציבה לכל דרג' },
        ],
        oms: {
          label: 'כמה את/ה מצליח/ה לפרוש החוצה (ספקים, עוזרים, שותפים) בלי להישאר צוואר בקבוק?',
          options: [
            { value: 'micromanage', label: 'הכל דרכי — קשה לשחרר שליטה' },
            { value: 'partial_delegation', label: 'יש עזרה חלקית אבל כל החלטה חוזרת אליי' },
            { value: 'full_delegation', label: 'יש אנשים שאני סומך עליהם עם אחריות אמיתית' },
          ],
        },
      },
      {
        key: 'strategyExecution',
        label: 'מה קורה אחרי החלטה אסטרטגית חדשה?',
        type: 'select',
        required: false,
        options: [
          { value: 'no_cascade', label: 'אין תרגום לביצוע; רוב הארגון לא מבין מה השתנה' },
          { value: 'partial_cascade', label: 'יש תרגום חלקי אך ללא אחריות ודדליינים ברורים' },
          { value: 'full_cascade', label: 'תהליך סדור: יעד → אחריות → KPI → מעקב ביצוע' },
        ],
        oms: {
          label: 'אחרי שאת/ה מחליט/ה על כיוון (מוצר, שוק, מחיר) — מה קורה בפועל בשבועיים הקרובים?',
          options: [
            { value: 'no_cascade', label: 'נשאר על הנייר — השגרה בולעת והכיוון לא יורד לביצוע' },
            { value: 'partial_cascade', label: 'חלק מתורגם למשימות אבל בלי דדליינים או בעלות ברורה' },
            { value: 'full_cascade', label: 'יש רשימת משימות, בעלים ומעקב — אני רואה התקדמות' },
          ],
        },
      },
      {
        key: 'engagementProxy',
        label: 'איך היית מתאר את רמת האנרגיה והמוטיבציה של צוות ההנהלה בחודש האחרון?',
        type: 'select',
        required: false,
        options: [
          { value: 'burnout', label: 'שחיקה ניכרת — הישרדות במקום הובלה' },
          { value: 'mixed', label: 'תנודתיות גבוהה — ימים טובים לצד דעיכה ניכרת' },
          { value: 'high', label: 'אנרגיה גבוהה — יוזמה, מחויבות וביצוע עקבי' },
        ],
        oms: {
          label: 'איך היית מתאר את האנרגיה והמוטיבציה שלך לעבודה בחודש האחרון?',
        },
      },
    ],
  },
]

function resolveQuestionnaireField(
  f: QuestionnaireFieldDef,
  ctx: OperatingContext
): ResolvedQuestionnaireField {
  const useOms = ctx === 'one_man_show' && f.oms
  const label = useOms && f.oms?.label != null ? f.oms.label : f.label
  const options = useOms && f.oms?.options != null ? f.oms.options : f.options
  const scaleLabels =
    useOms && f.oms?.scaleLabels != null ? f.oms.scaleLabels : f.scaleLabels
  return {
    key: f.key,
    type: f.type,
    required: f.required,
    scaleMin: f.scaleMin,
    scaleMax: f.scaleMax,
    reversed: f.reversed,
    label,
    options,
    scaleLabels,
  }
}

/** טקסטי שאלות לפי בחירת המשתמש (team / one_man_show). */
export function resolveQuestionnaireSteps(ctx: OperatingContext): ResolvedQuestionnaireStep[] {
  return QUESTIONNAIRE_STEPS_RAW.filter((step) => !step.omsOnly || ctx === 'one_man_show').map(
    (step) => ({
      id: step.id,
      title: ctx === 'one_man_show' && step.omsTitle ? step.omsTitle : step.title,
      fields: step.fields.map((f) => resolveQuestionnaireField(f, ctx)),
    })
  )
}

/** מסלול צוות — תאימות לאחור לקוד שמצפה למערך סטטי */
export const QUESTIONNAIRE_STEPS: ResolvedQuestionnaireStep[] = resolveQuestionnaireSteps('team')

/**
 * הקשר אפקטיבי לתצוגה וללוגיקה.
 * סדר עדיפות: שדה בשאלון → שדה בפרופיל לקוח → ברירת מחדל team.
 */
export function effectiveOperatingContext(
  answers: QuestionnaireAnswer,
  clientOperatingContext?: OperatingContext | null
): OperatingContext {
  if (answers.operatingContext === 'one_man_show') return 'one_man_show'
  if (answers.operatingContext === 'team') return 'team'
  if (clientOperatingContext === 'one_man_show') return 'one_man_show'
  return 'team'
}

/** מיזוג לפני חישובי DSM / תוכנית — כשחסר בשאלון, נוטל מפרופיל הלקוח */
export function mergeOperatingContextFromClient(
  answers: QuestionnaireAnswer,
  client: { operating_context?: string | null } | null | undefined
): QuestionnaireAnswer {
  if (answers.operatingContext === 'one_man_show' || answers.operatingContext === 'team') {
    return answers
  }
  const c = client?.operating_context
  if (c === 'one_man_show' || c === 'team') {
    return { ...answers, operatingContext: c }
  }
  return answers
}

// ─── Entropy Score ────────────────────────────────────────────────────────────

/**
 * entropy_score = number of pathologies at their highest severity level (0–4).
 * Based on: NOD high + ZeroSum frequent + Learning single_loop + Semantic high_drift.
 */
export function computeEntropyScore(answers: QuestionnaireAnswer): number {
  let score = 0
  if (answers.pathologyNod === 'high') score++
  if (answers.pathologyZeroSum === 'frequent') score++
  if (answers.pathologyLearning === 'single_loop') score++
  if (answers.pathologySemantic === 'high_drift') score++
  return score
}

// ─── PSI Score ────────────────────────────────────────────────────────────────

/**
 * Compute Edmondson PSI average from questionnaire answers.
 * Items 1, 3, 5 are reverse-scored (8 - raw).
 * Returns null if any of the 7 items is missing.
 * Range: 1-7 (higher = more psychological safety).
 */
export function computePsiFromAnswers(answers: QuestionnaireAnswer): number | null {
  const raws = [answers.psi1, answers.psi2, answers.psi3, answers.psi4, answers.psi5, answers.psi6, answers.psi7]
  if (raws.some((r) => r == null)) return null
  const REVERSED = [0, 2, 4] // 0-indexed: items 1, 3, 5
  const scores = raws.map((r, i) => {
    const v = parseInt(r as string, 10)
    return REVERSED.includes(i) ? 8 - v : v
  })
  return scores.reduce((a, b) => a + b, 0) / 7
}

// ─── Dynamic Summary ──────────────────────────────────────────────────────────

export interface DynamicSummary {
  roleParagraph: string
  diagnosisParagraph: string
  ctaParagraph: string
  /** סעיף התנעה לעצמאים — כשמולא שאלון ההתנעה */
  ignitionParagraph?: string
}

export function buildDynamicSummary(
  answers: QuestionnaireAnswer,
  recommendation: { channelId: string; optionId: string },
  ignitionProfile?: IgnitionProfile | null
): DynamicSummary {
  const ctx = effectiveOperatingContext(answers)

  // Role paragraph
  let roleParagraph = ''
  const { championRole, companySize } = answers
  if (ctx === 'one_man_show') {
    roleParagraph =
      'במסלול One man show ריכוז האחריות על מסירה, שיווק ותפעול אצלך מגביר את השפעה של דימום החלטות ושחיקה קוגניטיבית על ההכנסה והקיימות. הממצאים משקפים עומס שבארגון גדול היה מתפזר בין תפקידים ומחלקות.'
    if (championRole === 'cfo') {
      roleParagraph +=
        ' כאחראי/ת כספים או רווחיות, חשוב במיוחד לכמת את "חוב ההחלטות" בזמן שאינך מייצר/ת הכנסה ישירה.'
    }
  } else if (championRole === 'coo' && (companySize === '150_300' || companySize === 'over_300')) {
    roleParagraph =
      'בתפקידך כ-COO של ארגון שחוצה את רף דאנבר הקריטי, אתה מתמודד עם אתגר טבעי אך מסוכן שבו תהליכים בלתי פורמליים אינם משרתים עוד את המערכת. העומס התפעולי הופך לצוואר בקבוק המעכב ביצועים.'
  } else if (championRole === 'coo') {
    roleParagraph =
      'בתפקידך כ-COO, אתה הראשון שחווה את הקונפליקטים הבין-מחלקתיים ואת חוסר היעילות של התהליכים. זיהוי מוקדם של פתולוגיות מאפשר לך לפעול לפני שהן הופכות לצווארי בקבוק קריטיים.'
  } else if (championRole === 'cfo') {
    roleParagraph =
      'בתפקידך האסטרטגי כ-CFO, הבטחת יעילות כלכלית היא העיקר. הממצאים מעידים על "חוב החלטות" משמעותי הפוגע בשולי הרווח השוטפים של החברה.'
  } else if (championRole === 'ceo') {
    roleParagraph =
      'בתפקידך כמנכ"ל, האחריות לחזון האסטרטגי ולצמיחה מחייבת שהאסטרטגיה תיושם במהירות בשטח. הממצאים מצביעים על פערים בין הכוונה לביצוע שמאטים את קצב הצמיחה.'
  } else {
    roleParagraph =
      'הממצאים מצביעים על מספר אינדיקטורים לאנטרופיה ארגונית הפוגעת ביכולת הביצוע של הארגון.'
  }

  // Diagnosis paragraph
  const diagnosisParts: string[] = []
  if (answers.pathologyNod === 'high' && answers.pathologyLearning === 'single_loop') {
    diagnosisParts.push(
      ctx === 'one_man_show'
        ? 'זיהינו אינדיקטורים מובהקים לעומס ואנטרופיה תפעולית: ניכר שילוב של "כיבוי שריפות" ומעקפים (Workarounds) במקום למידה דו-לולאתית — מה שפוגע ישירות בקיבולת שלך לייצר תפוקה ורווח.'
        : 'זיהינו אינדיקטורים מובהקים להצטברות אנטרופיה ארגונית. ניכר שהמערכת עוסקת ב"כיבוי שריפות" ומתבססת על תרבות של מעקפים (Workarounds) במקום לבצע "למידה דו-לולאתית". התנהלות זו צורכת משאבים קוגניטיביים יקרים במקום לייצר תפוקה.'
    )
  } else if (answers.pathologyNod === 'high') {
    diagnosisParts.push(
      ctx === 'one_man_show'
        ? 'זוהתה נורמליזציית סטייה (NOD) גבוהה: קיצורי דרך ועקיפת נהלים הופכים לדרך הקבועה תחת לחץ מסירה — עם סיכון לטעויות, לשחיקה ולחוסר יכולת לסקייל.'
        : 'זוהתה נורמליזציית סטייה (NOD) ברמה גבוהה: עקיפת נהלים ותרבות של קיצורי דרך מקבלת הכשר שקט מההנהלה. תופעה זו מגדילה את האנטרופיה המבנית ומסכנת את שלמות התהליכים לאורך זמן.'
    )
  }
  if (answers.pathologyZeroSum === 'frequent') {
    diagnosisParts.push(
      ctx === 'one_man_show'
        ? 'זוהה מתח מתמשך בין "כובעים" או זרמי עבודה (למשל מכירות מול מסירה, לקוחות מול קיבולת) — כך שמשאבים נשרפים על מתח פנימי במקום על צמיחה בשוק.'
        : 'זוהה חיכוך בין-מחלקתי מתמיד המעיד על סתירות מובנות בין יעדים ומדדים. הארגון מוציא משאבים על פתרון סכסוכים פנימיים במקום על התמודדות עם מתחרים בשוק.'
    )
  }
  if (answers.pathologySemantic === 'high_drift') {
    diagnosisParts.push(
      ctx === 'one_man_show'
        ? 'זוהתה סחיפה סמנטית בינך לבין לקוחות/ספקים: הגדרות לא מיושרות יוצרות תרגום חוזר, ויכוחים על scope ואחריות — ודורשות מאמץ קוגניטיבי יקר.'
        : 'זוהתה סחיפה סמנטית (Semantic Drift) וחיכוך אונטולוגי: פערים משמעותיים בהגדרות עבודה ותחומי אחריות בין מחלקות. כל פעולה דורשת מאמץ תרגום וגישור הצורך משאבים קוגניטיביים יקרים.'
    )
  }
  const diagnosisParagraph =
    diagnosisParts.length > 0
      ? diagnosisParts.join(' ')
      : 'הניתוח מצביע על רמת אנטרופיה ארגונית הדורשת תשומת לב ומעקב.'

  // CTA paragraph
  let ctaParagraph = ''
  if (recommendation.optionId === 'sprint') {
    const latencyNote =
      answers.decisionLatency === 'over_15'
        ? 'הערכתך כי למעלה מ-15 שעות שבועיות אובדות עקב שהיית החלטות מצביעה על דימום קוגניטיבי חמור. '
        : ''
    ctaParagraph =
      latencyNote +
      (ctx === 'one_man_show'
        ? 'מצב זה דורש מעבר מיד משלב אבחון תיאורטי. אנו ממליצים על ספרינט חוסם עורקים (14 ימים) לחיתוך זמני המתנה, ליישור ציפיות מול לקוחות וספקים, ולשחרור קיבולת זמן ליצירת הכנסה.'
        : 'מצב זה דורש מעבר לאבחון פאסיבי. אנו ממליצים על הפעלת ספרינט חוסם עורקים (14 ימים) שנועד לחתוך את זמני ההמתנה, לנטרל את הסתירות הפנימיות, ולהחזיר לארגון קיבולת זמינה ליצירת רווחים.')
  } else if (recommendation.optionId === 'retainer') {
    ctaParagraph =
      'הממצאים מצביעים על צורך בבניית תהליכים הדרגתית ארוכת טווח. אנו ממליצים על Resilience Retainer — ליווי אסטרטגי שוטף שיבנה יכולת למידה ארגונית ויצמצם את האנטרופיה באופן מובנה ומדיד.'
  } else {
    ctaParagraph =
      ctx === 'one_man_show'
        ? 'הצעד הראשון המומלץ הוא Live Demo אבחוני — הזנת חומרים מהעסק (חוזים, תהליכים, תקשורת לקוחות), מפת פער דלתא, ומדידת זמן החלטה. ההדגמה חינמית ומדגימה ערך ממשי למסלול עצמאי.'
        : 'הצעד הראשון המומלץ הוא Live Demo אבחוני — הזנת מסמכי הארגון, הפקת מפת פער דלתא, ומדידת Decision Latency בסיסי. ההדגמה חינמית ומספקת הוכחה מתמטית לערך ההתערבות.'
  }

  let ignitionParagraph: string | undefined
  if (ignitionProfile) {
    ignitionParagraph = `${ignitionProfile.narrativeHe} צעד ראשון מומלץ: ${ignitionProfile.firstMoveHe}`
  }

  return { roleParagraph, diagnosisParagraph, ctaParagraph, ignitionParagraph }
}

// ─── Plan Builder ─────────────────────────────────────────────────────────────

export interface PlanResult {
  title: string
  summary: string
  nextSteps: string
  recommendedChannelId: string
  recommendedOptionId: string
  entropyScore: number
  dynamicSummary: DynamicSummary
}

export function buildPlanFromQuestionnaire(
  clientName: string,
  answers: QuestionnaireAnswer
): PlanResult {
  const entropyScore = computeEntropyScore(answers)
  const ctx = effectiveOperatingContext(answers)
  const isOms = ctx === 'one_man_show'
  const isLargeOrg =
    !isOms &&
    (answers.companySize === '150_300' || answers.companySize === 'over_300')
  const isIcpFit = isOms
    ? true
    : answers.companySize === '50_150' ||
      answers.companySize === '150_300' ||
      answers.companySize === 'over_300'

  let channelId = 'l1'
  let optionId = 'live-demo'

  // Rule 1: L2 Sprint (emergency)
  if (
    answers.decisionLatency === 'over_15' ||
    (isLargeOrg && entropyScore >= 2) ||
    (answers.interventionGoal === 'both' && answers.urgencyLevel === 'high')
  ) {
    channelId = 'l2'
    optionId = 'sprint'
  }
  // Rule 2: L2 Retainer
  else if (
    (answers.championRole === 'ceo' || answers.championRole === 'cfo') &&
    (answers.pathologySemantic === 'high_drift' || answers.pathologyLearning === 'single_loop')
  ) {
    channelId = 'l2'
    optionId = 'retainer'
  }
  // Rule 3: L1 Live Demo (explicit)
  else if (
    answers.interventionGoal === 'audit_only' ||
    (answers.decisionLatency === 'under_5' && answers.urgencyLevel === 'low') ||
    (!isOms && answers.companySize === 'under_50' && entropyScore < 2) ||
    (isOms && entropyScore < 2)
  ) {
    channelId = 'l1'
    optionId = 'live-demo'
  }
  // Default: L1 Live Demo
  else {
    channelId = 'l1'
    optionId = 'live-demo'
  }

  const ignitionProfile = computeIgnitionProfile(answers, ctx)
  if (
    isOms &&
    ignitionProfile?.suggestsSprintNudge &&
    optionId === 'live-demo' &&
    answers.interventionGoal !== 'audit_only'
  ) {
    channelId = 'l2'
    optionId = 'sprint'
  }

  const recommendation = { channelId, optionId }
  const dynamicSummary = buildDynamicSummary(answers, recommendation, ignitionProfile)
  const opt = getOptionById(optionId)

  const title = `תוכנית עסקית — ${clientName}`

  const summaryParts = [
    isOms
      ? 'מסלול One man show — שאלון וסיכום מותאמים להקשר עצמאי.'
      : isIcpFit
        ? 'התאמה ל-ICP (50–300+ עובדים).'
        : 'חורג מ-ICP — לשקול Live Demo לאבחון.',
    entropyScore > 0 ? `ציון אנטרופיה: ${entropyScore}/4 פתולוגיות בחומרה גבוהה.` : '',
    answers.decisionLatency === 'over_15'
      ? 'Decision Latency קריטי (מעל 15 שעות/שבוע) — עדיפות לספרינט חוסם עורקים.'
      : '',
    opt ? `המלצה: ${opt.nameHe} (${opt.priceLabel}).` : '',
    ignitionProfile
      ? `התנעה עסקית: דחיפות ${ignitionProfile.urgency === 'high' ? 'גבוהה' : ignitionProfile.urgency === 'low' ? 'נמוכה' : 'בינונית'}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const baseNext =
    optionId === 'sprint'
      ? 'הפעלת ספרינט חוסם עורקים (14 יום): BIA, מפת פער דלתא, DDD, Tech Tourniquet, Handover.'
      : optionId === 'retainer'
        ? 'הצעת Resilience Retainer לאחר Live Demo ראשוני — ליווי אסטרטגי שוטף.'
        : 'קיום Live Demo אבחוני (הזנת מסמכים, הוכחה מתמטית). לאחר מכן — הצעת מסלול לפי ממצאים.'
  const nextSteps = ignitionProfile
    ? `${baseNext} התנעה: ${ignitionProfile.firstMoveHe}`
    : baseNext

  return {
    title,
    summary: summaryParts,
    nextSteps,
    recommendedChannelId: channelId,
    recommendedOptionId: optionId,
    entropyScore,
    dynamicSummary,
  }
}
