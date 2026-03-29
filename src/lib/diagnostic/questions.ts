/**
 * COR-SYS Diagnostic Questionnaire
 *
 * 15 open-ended questions covering DR / ND / UC / SC axes.
 * Designed for practitioner use during intake session.
 * Language: Hebrew (Hebrish where needed for professional terms).
 *
 * Each question has:
 *   — axis: which DR/ND/UC/SC dimension it primarily targets
 *   — probe: optional follow-up hint shown to the practitioner
 */

import type { OperatingContext } from '../corsys-questionnaire'

export type DiagnosticAxis = 'DR' | 'ND' | 'UC' | 'SC'

export interface DiagnosticQuestion {
  id: string
  axis: DiagnosticAxis
  question_he: string
  probe_he?: string  // practitioner hint, shown in smaller text
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // ── DR: Decision Drain / Latency ──────────────────────────────────────────
  {
    id: 'dr_1',
    axis: 'DR',
    question_he: 'תאר לי מה קורה כשצריך לקבל החלטה שאינה שגרתית — מי מעורב, כמה זמן לוקח, ואיך זה נגמר בדרך כלל?',
    probe_he: 'שים לב: מספר שלבי אישור, מי יכול לחסום, ומה קורה כשאין תשובה.',
  },
  {
    id: 'dr_2',
    axis: 'DR',
    question_he: 'ה-1:1 האחרון שלך עם צוות הניהול — מה עלה שם שלא נכנס לשום פרוטוקול רשמי?',
    probe_he: 'מידע שנאמר בפגישות אבל לא מתורגם להחלטה מצביע על Decision Latency.',
  },
  {
    id: 'dr_3',
    axis: 'DR',
    question_he: 'איזו בעיה ידועה קיימת בארגון יותר מ-3 חודשים מבלי שהוכרעה? מה עצר את ההכרעה?',
    probe_he: 'הבעיות שכולם יודעים עליהן אבל אף אחד לא פותר הן ה-signature של DR גבוה.',
  },
  {
    id: 'dr_4',
    axis: 'DR',
    question_he: 'כאשר מנהלי ביניים רוצים לקבל החלטה משמעותית, האם הם באמת יכולים להחליט או שהכל חוזר תמיד ל-CEO/COO?',
    probe_he: 'זהו DR-8 (Leadership Cascade): בדוק אם delegation אמיתי קיים או רק על הנייר.',
  },

  // ── ND: Normalization of Deviance ─────────────────────────────────────────
  {
    id: 'nd_1',
    axis: 'ND',
    question_he: 'ספר לי על תהליך רשמי שקיים על הנייר אבל בפועל אף אחד לא עוקב אחריו — ואיך זה התחיל?',
    probe_he: 'ND מתחיל בחריגה חד-פעמית שמוצדקת, ואז הופכת לנורמה. שאל: "מתי החל הפשרון?"',
  },
  {
    id: 'nd_2',
    axis: 'ND',
    question_he: 'כשמשהו משתבש — QA, אבטחה, timeline — מה התגובה הרגילה של הצוות? האם יש ניתוח שורש, או שמתקדמים הלאה?',
    probe_he: 'תרבות "נמשיך הלאה" ללא post-mortem מעידה על ND מוסדי.',
  },
  {
    id: 'nd_3',
    axis: 'ND',
    question_he: 'האם יש דברים שמפתחים עושים ש"כולם יודעים שהם לא בסדר" אבל אף אחד לא עוצר? תן דוגמה.',
    probe_he: 'הדוגמה הספציפית חשובה — היא מגדירה את עומק הסטייה.',
  },

  // ── UC: Uncertainty / Calibration ────────────────────────────────────────
  {
    id: 'uc_1',
    axis: 'UC',
    question_he: 'כמה שינויים גדולים עברו על הארגון בשנה האחרונה — מבנה, מוצר, שוק? איך הצוות הגיב לכל אחד?',
    probe_he: 'כיול לא מייצג: כשיש יותר שינויים ממה שהצוות יכול לעכל — רואים cognitive overload ותגובות רגשיות חזקות.',
  },
  {
    id: 'uc_2',
    axis: 'UC',
    question_he: 'מה ה-roadmap לרבעון הבא? עד כמה אתה בטוח שהוא ריאלי — ולמה?',
    probe_he: 'UC גבוה = roadmap שנכתב מלמעלה למטה ללא ולידציה עם המבצעים. ביטחון מנופח = סימן אדום.',
  },
  {
    id: 'uc_3',
    axis: 'UC',
    question_he: 'מי יודע איך הארגון עובד מקצה לקצה — מוצר, קוד, לקוחות? מה קורה כשאותו אדם נעדר?',
    probe_he: 'תלות באדם מפתח אחד עם ידע לא מתועד = UC קריטי. "מכפיל מילואים" ישראלי.',
  },
  {
    id: 'uc_4',
    axis: 'UC',
    question_he: 'כשעובד מזהה בעיה מהותית, האם יש ערוץ דיווח שעובד בפועל ומוביל לטיפול, או שהדיווח נבלע?',
    probe_he: 'UC-9: Voice Infrastructure. הבדל בין "יש טופס" לבין "נוצר תיקון אמיתי".',
  },
  {
    id: 'uc_5',
    axis: 'UC',
    question_he: 'בשינוי שוק משמעותי אחרון, תוך כמה זמן הארגון עדכן תוכניות, תעדוף ומשאבים?',
    probe_he: 'UC-Forward: הסתגלות קדימה. איטיות כרונית מעידה על כשל אדפטיבי.',
  },
  // ── SC: Structural Clarity ────────────────────────────────────────────────
  {
    id: 'sc_1',
    axis: 'SC',
    question_he: 'אחרי החלטה אסטרטגית חדשה, איך היא מתורגמת בפועל למשימות עם בעלים ודד-ליינים?',
    probe_he: 'SC-5: Strategy-Execution Link. בדוק אם קיימת cascade שיטתית עד רמת הצוות.',
  },
  {
    id: 'sc_2',
    axis: 'SC',
    question_he: 'איפה גבולות האחריות (RACI) הכי מטושטשים כיום, ומה המחיר של זה ביום-יום?',
    probe_he: 'SC-RACI: אם יש "שני אחראים", בפועל אין אחראי אחד.',
  },
  {
    id: 'sc_3',
    axis: 'SC',
    question_he: 'איזה תהליך קריטי עדיין חי "בעל פה" ולא מתועד כך שמחליף יכול להפעיל אותו עצמאית?',
    probe_he: 'SC-Process/Knowledge: בדוק תלות ידע סמוי וחד-נקודתי.',
  },
]

/** גרסאות מנוסחות ל-One man show (אותם מזהי שאלות, אותן צירים) */
const DIAGNOSTIC_QUESTION_OMS: Partial<
  Record<string, Pick<DiagnosticQuestion, 'question_he' | 'probe_he'>>
> = {
  dr_1: {
    question_he:
      'תאר מה קורה כשאת/ה צריך/ה החלטה שאינה שגרתית — מי מעורב (לקוח, ספק, שותף), כמה זמן לוקח, ואיך זה נגמר בדרך כלל?',
    probe_he: 'במסלול עצמאי: המתנות חיצוניות ומעבר בין כובעים הן לעיתים כבדות כמו "תור הניהול" בחברה.',
  },
  dr_2: {
    question_he:
      'השיחה המקצועית האחרונה המשמעותית (עם לקוח, ספק או שותף) — מה עלה שם שלא נכנס לשום מסמך או החלטה רשמית?',
    probe_he: 'מידע שנשאר בווטסאפ/שיחה אבל לא הופך ל-commitment מצביע על Decision Latency אישי.',
  },
  dr_3: {
    question_he:
      'איזו בעיה ידועה בועטת אצלך יותר מ-3 חודשים בלי שמוכרעת? מה עצר את ההכרעה?',
    probe_he: 'בלי צוות — בדרך כלל זה פחד, זמן, או תלות בלקוח/ספק.',
  },
  dr_4: {
    question_he:
      'כשאת/ה רוצה להחליט על כיוון משמעותי, האם את/ה באמת מחליט/ה או שההחלטה נדחית בגלל לקוחות, ספקים או "עוד יום"?',
    probe_he: 'One man show: אין מנהלי ביניים — בדוק אם יש delegation לספקים/כלים או שהכל נתקע עליך.',
  },
  nd_1: {
    question_he:
      'ספר על תהליך או סטנדרט ש"כתוב" אצלך אבל בפועל את/ה עוקף/ת כדי לספק בזמן — ואיך זה התחיל?',
    probe_he: 'ND בעצמאות מתחיל בחריגה מוצדקת שנהיית הרגל אישי.',
  },
  nd_2: {
    question_he:
      'כשמשהו משתבש במסירה או באיכות — מה התגובה הרגילה? יש ניתוח שורש או "נרוץ הלאה"?',
    probe_he: 'בלי צוות פורמלי — חשוב אם את/ה מתעד/ת ולומד/ת או רק מתקן/ת.',
  },
  nd_3: {
    question_he:
      'האם יש דברים שאת/ה או הספקים שלך עושים ש"כולם יודעים שזה לא אידיאלי" אבל אף אחד לא עוצר? דוגמה.',
    probe_he: 'דוגמה קונקרטית — scope creep, בדיקות חלקיות, תשלומים באיחור.',
  },
  uc_1: {
    question_he:
      'כמה שינויים גדולים עברת בשנה האחרונה — מוצר, לקוחות, מחיר, שוק? איך הגוף שלך (וזמן שלך) הגיב?',
    probe_he: 'במסלול עצמאי overload הוא אישי, לא "תרבות ארגונית".',
  },
  uc_2: {
    question_he:
      'מה ה-roadmap שלך לרבעון הקרוב? עד כמה הוא ריאלי — ולמי בדקת אותו מעבר לראש שלך?',
    probe_he: 'תוכנית שלא נבחנה מול לקוח אמיתי או קיבולת = UC גבוה.',
  },
  uc_3: {
    question_he:
      'מי חוץ ממך יודע איך העסק באמת רץ — חשבונות, מסירה, קוד, לקוחות? מה קורה כשאת/ה לא זמין/ה?',
    probe_he: 'תלות בידע בראש אחד = UC קריטי לעצמאי.',
  },
  uc_4: {
    question_he:
      'כשאת/ה מזהה בעיה עם לקוח או ספק — האם יש מסלול שמוביל לתיקון, או שהנושא נבלע?',
    probe_he: 'Voice = היכולת להעלות אמת בלי לאבד את העסקה.',
  },
  uc_5: {
    question_he:
      'בשינוי שוק אחרון, תוך כמה זמן עדכנת מחירים, הצעות או תעדוף?',
    probe_he: 'איטיות אישית תחת שינוי שוק = כשל אדפטיבי.',
  },
  sc_1: {
    question_he:
      'אחרי החלטה אסטרטגית (למשל מוצר או שוק חדש), איך היא הופכת למשימות עם תאריכים בפועל?',
    probe_he: 'בלי צוות — בדוק אם יש לך רשימת משימות או רק כוונה.',
  },
  sc_2: {
    question_he:
      'איפה גבולות האחריות הכי מטושטשים — בינך לבין לקוח, ספק, או שותף — ומה המחיר?',
    probe_he: 'שני אחראים בפועל = אף אחד לא אחראי.',
  },
  sc_3: {
    question_he:
      'איזה תהליך קריטי עדיין חי בראש או בווטסאפ ולא מתועד כך שמחליף יכול להרים אותו?',
    probe_he: 'תיעוד חסר = סיכון קיימא לעצמאי.',
  },
}

/**
 * שאלות לפי הקשר תפעולי (צוות מול One man show).
 */
export function getDiagnosticQuestions(ctx: OperatingContext): DiagnosticQuestion[] {
  if (ctx === 'team') return DIAGNOSTIC_QUESTIONS
  return DIAGNOSTIC_QUESTIONS.map((q) => {
    const o = DIAGNOSTIC_QUESTION_OMS[q.id]
    if (!o) return q
    return {
      ...q,
      question_he: o.question_he ?? q.question_he,
      probe_he: o.probe_he !== undefined ? o.probe_he : q.probe_he,
    }
  })
}

/**
 * Returns questions filtered by axis.
 */
export function getQuestionsByAxis(axis: DiagnosticAxis): DiagnosticQuestion[] {
  return DIAGNOSTIC_QUESTIONS.filter(q => q.axis === axis)
}

/**
 * Builds a single rich text block from all answers, used as embedding input.
 * Format: "AXIS — Question\nAnswer\n\n"
 */
export function buildEmbeddingText(
  answers: Record<string, string>,
  ctx: OperatingContext = 'team'
): string {
  const qs = getDiagnosticQuestions(ctx)
  return qs
    .filter(q => answers[q.id]?.trim())
    .map(q => `[${q.axis}] ${q.question_he}\n${answers[q.id].trim()}`)
    .join('\n\n')
}
