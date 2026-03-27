/**
 * COR-SYS Diagnostic Questionnaire
 *
 * 9 open-ended questions covering DR / ND / UC axes.
 * Designed for practitioner use during intake session.
 * Language: Hebrew (Hebrish where needed for professional terms).
 *
 * Each question has:
 *   — axis: which DR/ND/UC dimension it primarily targets
 *   — probe: optional follow-up hint shown to the practitioner
 */

export type DiagnosticAxis = 'DR' | 'ND' | 'UC'

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
]

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
  answers: Record<string, string>
): string {
  return DIAGNOSTIC_QUESTIONS
    .filter(q => answers[q.id]?.trim())
    .map(q => `[${q.axis}] ${q.question_he}\n${answers[q.id].trim()}`)
    .join('\n\n')
}
