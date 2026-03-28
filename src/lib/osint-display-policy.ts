/**
 * OSINT Display Policy — governs how external signals are presented in-app.
 *
 * Three non-negotiable rules:
 * 1. Public data only — no private surveillance, no personal tracking.
 * 2. Confidence levels are explicit — every signal shows how trustworthy it is.
 * 3. False positives are acknowledged — users see caveats, not certainty.
 */

// ─── Confidence Levels ──────────────────────────────────────────────────────────

export interface ConfidenceLevelMeta {
  id: 'high' | 'medium' | 'low'
  labelHe: string
  labelEn: string
  description: string
  color: string
}

export const CONFIDENCE_LEVELS: ConfidenceLevelMeta[] = [
  {
    id: 'high',
    labelHe: 'גבוה',
    labelEn: 'High',
    description: 'מבוסס על מסמך רשמי, דוח כספי, או הודעה ציבורית ישירה מהגורם הרלוונטי.',
    color: 'status-success',
  },
  {
    id: 'medium',
    labelHe: 'בינוני',
    labelEn: 'Medium',
    description: 'מבוסס על דיווח תקשורתי אמין (Reuters, BBC, NPR) או ניתוח צד שלישי עם מקור מצוטט.',
    color: 'status-warning',
  },
  {
    id: 'low',
    labelHe: 'נמוך',
    labelEn: 'Low',
    description: 'מבוסס על פרשנות, sentiment ברשתות, או מקורות חלקיים. יש להתייחס בזהירות.',
    color: 'status-danger',
  },
]

// ─── Policy Text Blocks ─────────────────────────────────────────────────────────

export const OSINT_POLICY = {
  title: 'מדיניות הצגת איתותים חיצוניים',

  publicDataOnly: {
    titleHe: 'מידע פומבי בלבד',
    text: 'כל האיתותים מבוססים אך ורק על מידע פומבי: דוחות כספיים, הודעות לבורסה, כתבות בתקשורת, ופרסומים רשמיים. לא מבוצע מעקב אישי, scraping של מידע פרטי, או שימוש במקורות לא-פומביים.',
  },

  falsePositiveNote: {
    titleHe: 'אזהרת False Positive',
    text: 'כמעט כל אות פומבי יכול ליצור false positive — ארגונים רבים משנים הנהלה, מפטרים או משעים פרויקטים בלי להיכנס למשבר מערכתי. האיתותים שמוצגים כאן מתאימים לדפוס, אך אינם מוכיחים שמשבר יתרחש או שהמערכת חזתה אותו. יש לקרוא אותם כ"עדשת דפוסים" ולא ככלי חיזוי חד-משמעי.',
  },

  noAdvice: {
    titleHe: 'ללא ייעוץ',
    text: 'אין בתוכן זה ייעוץ השקעות, ייעוץ משפטי, או המלצה לפעולה כלפי חברה ספציפית. הניתוח מיועד לכיול מתודולוגי בלבד.',
  },

  modestLanguage: {
    titleHe: 'ניסוח צנוע',
    text: 'כל הממצאים מנוסחים כ"מתאים לדפוס" ולא כ"הוכח" או "חזינו". המסגרת נועדה לתמוך בשיח אסטרטגי, לא לנבא משברים.',
  },
} as const

export type OsintPolicyKey = keyof typeof OSINT_POLICY

// ─── Disclaimer Component Text ──────────────────────────────────────────────────

export const OSINT_DISCLAIMER_SHORT =
  'איתותים מבוססי מידע פומבי בלבד. אינם מהווים חיזוי, ייעוץ השקעות או ייעוץ משפטי. כל אות עלול ליצור false positive.'

export const OSINT_DISCLAIMER_LONG = `${OSINT_POLICY.publicDataOnly.text}\n\n${OSINT_POLICY.falsePositiveNote.text}\n\n${OSINT_POLICY.noAdvice.text}`
