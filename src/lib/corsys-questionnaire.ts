/**
 * שאלון COR-SYS — מבנה תוכנית עסקית לפי פתולוגיות, ICP ויעדים.
 * מבוסס על תשתית מחקרית: Dunbar, Greiner, Vaughan (NOD), Argyris (Double-Loop),
 * Floridi (Ontological Friction), Decision Latency Index.
 */

import { getOptionById } from './service-catalog'

// ─── Block 1: ICP ────────────────────────────────────────────────────────────

export type ChampionRole = 'ceo' | 'coo' | 'cfo' | 'other'
export type CompanySize = 'under_50' | '50_150' | '150_300' | 'over_300'
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

// ─── Main interface ───────────────────────────────────────────────────────────

export interface QuestionnaireAnswer {
  // Block 1 — ICP
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

export const QUESTIONNAIRE_STEPS = [
  {
    id: 'icp',
    title: 'אפיון הלקוח והקשר ארגוני',
    fields: [
      {
        key: 'championRole',
        label: 'מהו תפקידך המרכזי והאחריות שלך בארגון?',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'ceo', label: 'מנכ"ל או יזם (מוכוון אסטרטגיה וצמיחה)' },
          { value: 'coo', label: 'סמנכ"ל תפעול / משאבי אנוש (מוכוון ביצוע)' },
          { value: 'cfo', label: 'סמנכ"ל כספים (מוכוון ROI ועלויות)' },
          { value: 'other', label: 'מנהל אחר' },
        ],
      },
      {
        key: 'companySize',
        label: 'מהו גודל הארגון שלך (מספר עובדים)?',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'under_50', label: 'עד 50 עובדים (תקשורת ישירה)' },
          { value: '50_150', label: '50 עד 150 עובדים (שלב צמיחה ומעבר)' },
          { value: '150_300', label: '150 עד 300 עובדים (משבר מורכבות)' },
          { value: 'over_300', label: 'מעל 300 עובדים' },
        ],
      },
      {
        key: 'industrySector',
        label: 'באיזה ענף או סקטור פועל הארגון?',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'cyber_fintech', label: 'סייבר או פינטק' },
          { value: 'ai_healthtech', label: 'בינה מלאכותית, מדעי החיים' },
          { value: 'complex_b2b', label: 'תוכנה ו-B2B מורכב' },
          { value: 'other', label: 'אחר' },
        ],
      },
    ],
  },
  {
    id: 'pathologies',
    title: 'אבחון פתולוגיות ודימום קוגניטיבי',
    fields: [
      {
        key: 'pathologyNod',
        label: 'בסביבת העבודה היומיומית, באיזו תדירות צוותים עוקפים נהלים רשמיים, יוצרים "אקסלים צדדיים" או משתמשים בקיצורי דרך כדי לעמוד ביעדים תחת לחץ?',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'high', label: 'כמעט תמיד — זו הדרך המעשית היחידה לגרום לדברים לקרות מהר' },
          { value: 'medium', label: 'לעיתים, בעיקר בתקופות עומס ולחץ לספק תוצאות' },
          { value: 'low', label: 'נדיר מאוד — נהלי העבודה ומערכות הליבה תומכים היטב בעבודה' },
        ],
      },
      {
        key: 'pathologyZeroSum',
        label: 'האם קיימת בארגון תחושה שהצלחה של מחלקה אחת (למשל, מכירות) באה לעיתים קרובות על חשבון עומס או פגיעה ביעדים של מחלקה אחרת (למשל, תפעול)?',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'frequent', label: 'כן, קיים חיכוך מתמיד הנובע מיעדים ואינטרסים מנוגדים' },
          { value: 'occasional', label: 'לפעמים, תלוי בסיטואציה ולרוב סביב סופי רבעון' },
          { value: 'rare', label: 'לא, קיימת סינרגיה וסנכרון ברור של מדדים ואחריות' },
        ],
      },
      {
        key: 'pathologyLearning',
        label: 'כאשר מתרחשת תקלה משמעותית או עיכוב מרכזי, מה מאפיין לרוב את התגובה הארגונית לאחר מכן?',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'single_loop', label: '"כיבוי שריפות" — ממהרים לתקן את התקלה הנקודתית וממשיכים הלאה' },
          { value: 'mixed', label: 'מבצעים תחקיר, אך לרוב התובנות לא מתורגמות לשינוי תהליכי עומק' },
          { value: 'double_loop', label: 'למידה עמוקה — בוחנים ומשנים את ההנחות ונהלי העבודה שאפשרו לתקלה לקרות' },
        ],
      },
      {
        key: 'pathologySemantic',
        label: 'עד כמה הגדרות העבודה, גבולות האחריות בין תפקידים ומושגי יסוד (כמו "פרויקט הושלם") ברורים ומוסכמים באותה צורה על פני כלל המחלקות?',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'high_drift', label: 'קיימים פערים משמעותיים בהבנה וויכוחים תכופים על תחומי אחריות והגדרות' },
          { value: 'medium_drift', label: 'ישנה הבנה כללית, אך נוצרים שטחים אפורים ובלבול מפעם לפעם' },
          { value: 'low_drift', label: 'בהירות גבוהה והסכמה מלאה על מילון המונחים הארגוני ותחומי האחריות' },
        ],
      },
      {
        key: 'pathologySc',
        label: 'עד כמה המבנה הארגוני מוגדר בצורה ברורה — תפקידים, תהליכים, אחריות והיררכיית סמכות?',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'high', label: 'גבוהה — תפקידים לא מוגדרים, תהליכים לא מתועדים, אחריות מטושטשת לעיתים קרובות' },
          { value: 'medium', label: 'בינונית — קיים מבנה חלקי אך יש אי-בהירויות משמעותיות בשדות אפורים' },
          { value: 'low', label: 'נמוכה — מבנה ברור, תפקידים מוגדרים ותהליכים מתועדים בצורה שיטתית' },
        ],
      },
    ],
  },
  {
    id: 'metrics',
    title: 'מדדי ביצוע והערכת דחיפות',
    fields: [
      {
        key: 'decisionLatency',
        label: 'כמה שעות בשבוע להערכתך שורף צוות הניהול על פגישות עודפות, כיבוי שריפות והמתנה להחלטות ואישורים (זמן שיכול היה להיות מוקדש לעבודה אסטרטגית)?',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'over_15', label: 'למעלה מ-15 שעות בשבוע (פגיעה קשה בניצול המשאבים)' },
          { value: '5_to_15', label: 'בין 5 ל-15 שעות בשבוע' },
          { value: 'under_5', label: 'פחות מ-5 שעות בשבוע (קצב החלטות מהיר)' },
        ],
      },
      {
        key: 'interventionGoal',
        label: 'מהו היעד הדחוף ביותר שעמו תרצה שארגונך יתמודד בטווח המיידי?',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'reduce_latency', label: 'האצת קצב קבלת ההחלטות והסרת צווארי בקבוק' },
          { value: 'reduce_entropy', label: 'עשיית סדר, יישור תהליכים וצמצום כאוס תפעולי' },
          { value: 'both', label: 'התמודדות משולבת עם אובדן הזמן והכאוס הארגוני' },
          { value: 'audit_only', label: 'רק לקבל אבחון מקצועי והערכת מצב אובייקטיבית' },
        ],
      },
      {
        key: 'urgencyLevel',
        label: 'כיצד היית מגדיר את רמת הדחיפות לפתרון חסמים אלו ביחס ליעדי החברה הנוכחיים?',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'high', label: 'קריטי ומיידי (החסמים פוגעים בצמיחה או ברווחיות כעת)' },
          { value: 'medium', label: 'חשוב מאוד לביצוע ברבעונים הקרובים' },
          { value: 'low', label: 'משימה אסטרטגית עתידית, ללא דחיפות מיידית' },
        ],
      },
    ],
  },
  {
    id: 'psi',
    title: 'בטיחות פסיכולוגית בצוות (Edmondson PSI)',
    fields: [
      {
        key: 'psi1',
        label: '⚠️ [1] בצוות שלנו, אם עושים טעות — זה מוחזק כנגדך',
        type: 'scale' as const,
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
      },
      {
        key: 'psi2',
        label: '[2] חברי הצוות יכולים להעלות בעיות ונושאים קשים',
        type: 'scale' as const,
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
      },
      {
        key: 'psi3',
        label: '⚠️ [3] אנשים בצוות לפעמים דוחים אחרים בגלל שהם שונים',
        type: 'scale' as const,
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
      },
      {
        key: 'psi4',
        label: '[4] זה בטוח לקחת סיכונים בצוות הזה',
        type: 'scale' as const,
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
      },
      {
        key: 'psi5',
        label: '⚠️ [5] קשה לבקש עזרה מחברי צוות אחרים',
        type: 'scale' as const,
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
      },
      {
        key: 'psi6',
        label: '[6] אף אחד בצוות לא יפעל בכוונה בדרך שפוגעת במאמצים שלי',
        type: 'scale' as const,
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
      },
      {
        key: 'psi7',
        label: '[7] הכישורים והיכולות הייחודיים שלי מוערכים ומנוצלים בעבודה',
        type: 'scale' as const,
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
      },
    ],
  },
] as const

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
}

export function buildDynamicSummary(
  answers: QuestionnaireAnswer,
  recommendation: { channelId: string; optionId: string }
): DynamicSummary {
  // Role paragraph
  let roleParagraph = ''
  const { championRole, companySize } = answers
  if (championRole === 'coo' && (companySize === '150_300' || companySize === 'over_300')) {
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
      'זיהינו אינדיקטורים מובהקים להצטברות אנטרופיה ארגונית. ניכר שהמערכת עוסקת ב"כיבוי שריפות" ומתבססת על תרבות של מעקפים (Workarounds) במקום לבצע "למידה דו-לולאתית". התנהלות זו צורכת משאבים קוגניטיביים יקרים במקום לייצר תפוקה.'
    )
  } else if (answers.pathologyNod === 'high') {
    diagnosisParts.push(
      'זוהתה נורמליזציית סטייה (NOD) ברמה גבוהה: עקיפת נהלים ותרבות של קיצורי דרך מקבלת הכשר שקט מההנהלה. תופעה זו מגדילה את האנטרופיה המבנית ומסכנת את שלמות התהליכים לאורך זמן.'
    )
  }
  if (answers.pathologyZeroSum === 'frequent') {
    diagnosisParts.push(
      'זוהה חיכוך בין-מחלקתי מתמיד המעיד על סתירות מובנות בין יעדים ומדדים. הארגון מוציא משאבים על פתרון סכסוכים פנימיים במקום על התמודדות עם מתחרים בשוק.'
    )
  }
  if (answers.pathologySemantic === 'high_drift') {
    diagnosisParts.push(
      'זוהתה סחיפה סמנטית (Semantic Drift) וחיכוך אונטולוגי: פערים משמעותיים בהגדרות עבודה ותחומי אחריות בין מחלקות. כל פעולה דורשת מאמץ תרגום וגישור הצורך משאבים קוגניטיביים יקרים.'
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
      'מצב זה דורש מעבר לאבחון פאסיבי. אנו ממליצים על הפעלת ספרינט חוסם עורקים (14 ימים) שנועד לחתוך את זמני ההמתנה, לנטרל את הסתירות הפנימיות, ולהחזיר לארגון קיבולת זמינה ליצירת רווחים.'
  } else if (recommendation.optionId === 'retainer') {
    ctaParagraph =
      'הממצאים מצביעים על צורך בבניית תהליכים הדרגתית ארוכת טווח. אנו ממליצים על Resilience Retainer — ליווי אסטרטגי שוטף שיבנה יכולת למידה ארגונית ויצמצם את האנטרופיה באופן מובנה ומדיד.'
  } else {
    ctaParagraph =
      'הצעד הראשון המומלץ הוא Live Demo אבחוני — הזנת מסמכי הארגון, הפקת מפת פער דלתא, ומדידת Decision Latency בסיסי. ההדגמה חינמית ומספקת הוכחה מתמטית לערך ההתערבות.'
  }

  return { roleParagraph, diagnosisParagraph, ctaParagraph }
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
  const isLargeOrg =
    answers.companySize === '150_300' || answers.companySize === 'over_300'
  const isIcpFit =
    answers.companySize === '50_150' ||
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
    (answers.companySize === 'under_50' && entropyScore < 2)
  ) {
    channelId = 'l1'
    optionId = 'live-demo'
  }
  // Default: L1 Live Demo
  else {
    channelId = 'l1'
    optionId = 'live-demo'
  }

  const recommendation = { channelId, optionId }
  const dynamicSummary = buildDynamicSummary(answers, recommendation)
  const opt = getOptionById(optionId)

  const title = `תוכנית עסקית — ${clientName}`

  const summaryParts = [
    isIcpFit ? 'התאמה ל-ICP (50–300+ עובדים).' : 'חורג מ-ICP — לשקול Live Demo לאבחון.',
    entropyScore > 0 ? `ציון אנטרופיה: ${entropyScore}/4 פתולוגיות בחומרה גבוהה.` : '',
    answers.decisionLatency === 'over_15'
      ? 'Decision Latency קריטי (מעל 15 שעות/שבוע) — עדיפות לספרינט חוסם עורקים.'
      : '',
    opt ? `המלצה: ${opt.nameHe} (${opt.priceLabel}).` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const nextSteps = [
    optionId === 'sprint'
      ? 'הפעלת ספרינט חוסם עורקים (14 יום): BIA, מפת פער דלתא, DDD, Tech Tourniquet, Handover.'
      : optionId === 'retainer'
        ? 'הצעת Resilience Retainer לאחר Live Demo ראשוני — ליווי אסטרטגי שוטף.'
        : 'קיום Live Demo אבחוני (הזנת מסמכים, הוכחה מתמטית). לאחר מכן — הצעת מסלול לפי ממצאים.',
  ].join(' ')

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
