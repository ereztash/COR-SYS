/**
 * DSM-Org v1.0 — Full Content Model
 *
 * Typed representation of the DSM-Org clinical reference document.
 * Source: dsm-org-full.html (COR-SYS Clinical Reference, 2026)
 *
 * Sections:
 *   I.   Macro Paradox & T/A/M Foundations
 *   II.  7-Stage Diagnostic Process
 *   III. Clinical Taxonomy: 5 Pathologies
 *   IV.  AI Architecture Drift
 *   V.   Intervention Playbooks
 *   VI.  Assessment Instruments
 *   VII. Confidence & Next Steps
 */

import type { PathologyType } from './pathology-kb'
import type { InterventionHorizon } from './action-plan'

// ─── T/A/M ───────────────────────────────────────────────────────────────────

export interface TamScore {
  t: number  // Time 1–5
  a: number  // Attention 1–5
  m: number  // Money 1–5
  total: number
}

export const TAM_SCORING_SCALE: Record<'t' | 'a' | 'm', Record<1 | 2 | 3 | 4 | 5, string>> = {
  t: {
    1: 'Decision Latency בנורמה',
    2: 'עיכובים מזדמנים',
    3: 'Decision Latency עלה 25–50%',
    4: 'Decision Latency עלה 50%+',
    5: 'שיתוק החלטות',
  },
  a: {
    1: 'Focus Time > 4 שעות/יום',
    2: 'Focus Time 3–4 שעות/יום',
    3: 'Focus Time 2–3 שעות/יום',
    4: 'Focus Time 1–2 שעות/יום',
    5: 'Focus Time < 1 שעה, MBI > 27',
  },
  m: {
    1: 'Rework < 10%',
    2: 'Rework 10–20%',
    3: 'Rework 20–30%, תחלופה עולה',
    4: 'Rework 30%+, Tech Debt > 40%',
    5: 'Attrition > 20%, Revenue/Employee יורד',
  },
}

// ─── Diagnostic Criteria ─────────────────────────────────────────────────────

export interface DiagnosticCriterion {
  letter: string   // A1, A2, B1, B2 …
  text: string
}

export interface SeveritySpecifier {
  level: 'mild' | 'moderate' | 'severe'
  label: string
  description: string
  tamRange: string  // e.g. "8–9"
}

export interface DifferentialEntry {
  versus: string
  howToDistinguish: string
}

export interface ClinicalVignette {
  id: string
  title: string
  tags: PathologyType[]
  body: string
}

export interface ComorbidityEntry {
  from: PathologyType
  to: PathologyType
  mechanism: string
  prevalence: 'high' | 'medium-high' | 'medium'
}

// ─── Pathology Full Entry ─────────────────────────────────────────────────────

export interface DsmPathologyEntry {
  code: string          // e.g. "DSM-Org 1.1"
  type: PathologyType
  label_he: string
  label_en: string
  tam: TamScore
  criteriaA: DiagnosticCriterion[]   // Core (required)
  criteriaB: DiagnosticCriterion[]   // Supporting (≥2 of 4)
  criteriaC: DiagnosticCriterion[]   // Exclusion
  severitySpecifiers: SeveritySpecifier[]
  theoreticalMechanism: string
  israeliContext: string
  vignettes: ClinicalVignette[]
  prognosis: string
  differential: DifferentialEntry[]
  leadingInterventions: string[]     // intervention IDs (5.1–5.7)
}

// ─── Intervention Playbook ────────────────────────────────────────────────────

export type InterventionEffectiveness = 'primary' | 'secondary' | 'indirect'

export interface InterventionPlaybook {
  id: string            // e.g. "5.1"
  title: string
  target: PathologyType[]
  axes: string[]
  timeline: InterventionHorizon | 'ongoing' | 'one-time'
  protocol: string
  successMetric: string
  effectiveness: Partial<Record<PathologyType, InterventionEffectiveness>>
}

// ─── Assessment Instruments ───────────────────────────────────────────────────

export interface AssessmentInstrument {
  id: string
  name: string
  subscales?: { name: string; items: number; clinicalCutoff: string; tamAxis: string }[]
  description: string
  usageInDsmOrg: string
  israeliNote?: string
}

// ─── Diagnostic Process Step ──────────────────────────────────────────────────

export interface DiagnosticStep {
  number: string
  title: string
  description: string
  output: string
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

export const DSM_COMORBIDITY_MATRIX: ComorbidityEntry[] = [
  { from: 'CS',  to: 'NOD', mechanism: 'לחץ כרוני מוריד את הסף לנורמליזציה. סטיות שהיו נתפסות כבעיה מתקבלות כ"מה לעשות, מלחמה".', prevalence: 'high' },
  { from: 'NOD', to: 'OLD', mechanism: 'כשסטיות הופכות לנורמה, אין מה ללמוד. ה-Retro מודד לפי הנורמה החדשה (הסוטה), לא לפי הסטנדרט המקורי.', prevalence: 'high' },
  { from: 'ZSG_CULTURE', to: 'CS',  mechanism: 'תחרות פנימית מייצרת לחץ כרוני. "מי שלא נלחם מפסיד" הופך למקור לחץ מתמיד.', prevalence: 'high' },
  { from: 'ZSG_SAFETY', to: 'CS',  mechanism: 'חסם דיווח ולחץ רגשי מצטבר — תורם לספירלת שחיקה כרונית.', prevalence: 'medium-high' },
  { from: 'CLT', to: 'NOD', mechanism: 'עומס קוגניטיבי מוביל לדילוג על תהליכים. "אין לי קשב לזה עכשיו" הופך ל"אנחנו לא עושים את זה".', prevalence: 'medium-high' },
  { from: 'CS',  to: 'CLT', mechanism: 'לחץ כרוני מצמצם קיבולת קוגניטיבית. אותו עומס גירויים שהיה ניתן לניהול הופך לבלתי-נסבל.', prevalence: 'high' },
  { from: 'ZSG_CULTURE', to: 'OLD', mechanism: 'תרבות האשמה וסכום-אפס מונעים למידה — דיווח על כשל מרגיש אישי.', prevalence: 'medium-high' },
  { from: 'ZSG_SAFETY', to: 'OLD', mechanism: 'בלי בטחון פסיכולוגי — למידה דו-לולאתית לא יכולה להתחיל.', prevalence: 'high' },
]

export const DSM_PATHOLOGIES: DsmPathologyEntry[] = [
  // ─── NOD ────────────────────────────────────────────────────────────────────
  {
    code: 'DSM-Org 1.1',
    type: 'NOD',
    label_he: 'נורמליזציה של סטייה',
    label_en: 'Normalization of Deviance',
    tam: { t: 4, a: 3, m: 5, total: 12 },
    criteriaA: [
      { letter: 'A1', text: 'קיום דפוס חוזר שבו נהלים מתועדים (QA, Code Review, Security Protocols, Approval Gates) אינם מיושמים בפועל, ללא החלטה מתועדת לבטלם.' },
      { letter: 'A2', text: 'הסטייה מהנוהל אינה מדווחת כחריגה, אלא מתקבלת כ"ככה עובדים פה" (הנורמה הבלתי-כתובה עוקפת את הנורמה הכתובה).' },
    ],
    criteriaB: [
      { letter: 'B1', text: 'Hotfix Rate עלה ב-100% או יותר מעל קו הבסיס במהלך 6 חודשים, ללא שינוי מכוון בתהליכי פיתוח.' },
      { letter: 'B2', text: 'Copy-Paste Code חוצה 15% מסך השורות (בהתאם לממצאי GitClear של 18% בסקטור).' },
      { letter: 'B3', text: 'ירידה של 40% או יותר בפעילות Refactoring בהשוואה לתקופה מקבילה.' },
      { letter: 'B4', text: 'תיעוד של לפחות שלוש תקריות בשנה שבהן כשל ייוחס לאדם, אך חקירה חשפה שהנוהל עצמו לא היה ישים בתנאי השטח.' },
    ],
    criteriaC: [
      { letter: 'C1', text: 'הסטייה אינה תוצאה של החלטה ניהולית מתועדת לשנות נוהל (שינוי מכוון אינו NOD).' },
      { letter: 'C2', text: 'הסטייה אינה מוגבלת לאירוע חד-פעמי בתנאים חריגים (NOD דורש דפוס חוזר).' },
    ],
    severitySpecifiers: [
      { level: 'mild',     label: 'קל',    description: 'סטייה מנוהל אחד מתוך שלוש שכבות הגנה (QA, Review, Security). תוצאות: עלייה ב-Hotfixes, אך לא קטסטרופלית.', tamRange: '8–9' },
      { level: 'moderate', label: 'בינוני', description: 'סטייה משתי שכבות הגנה. "סמוך" הפך לנורמת ברירת מחדל ברוב הצוותים. Copy-Paste > 15%.', tamRange: '10–11' },
      { level: 'severe',   label: 'חמור',  description: 'סטייה משלוש שכבות הגנה. Hotfix Rate > x3 baseline. Refactoring ירד > 60%. סיכון לכשל קטסטרופלי.', tamRange: '12–15' },
    ],
    theoreticalMechanism: 'Diane Vaughan תיארה את הפנומנון בחקירת אסון ה-Challenger (1996): חריגה שחוזרת על עצמה ללא תוצאות שליליות מיידיות הופכת לנורמה הבלתי-כתובה. המנגנון מתחזק את עצמו: כל מופע של סטייה ללא תוצאה שלילית מאמת את הסטייה כבטוחה.',
    israeliContext: 'תרבות ה"סמוך" היא NOD מובנה. "יהיה בסדר" אינו אמירה של אופטימיות — זו התנהגות מערכתית של הסרת בקרות. ב-Flat Hierarchy ישראלי, שבו ג\'וניור פונה ישירות ל-CTO, אין שומרי סף שיעצרו סטיות.',
    vignettes: [
      { id: 'nod-1', title: 'Replit AI: מחיקת בסיס נתונים', tags: ['NOD', 'OLD'], body: 'AI שמחק בסיס נתונים. לא כשל טכנולוגי — כשל NOD: הנורמליזציה של שימוש ב-AI ללא guardrails הפכה סיכון לנוהל. שכבות הגנה לא הופעלו כי "עד עכשיו עבד". NOD Severe.' },
      { id: 'nod-2', title: 'Humane AI Pin: $116M Firesale', tags: ['NOD'], body: 'מוצר שעבר gate אחרי gate ללא עצירה. הסטנדרד של "מוכן לשוק" הלך וירד. כל גרסה קצת פחות מספקת מהקודמת, ואף אחד לא הגדיר מחדש את קו הבסיס.' },
      { id: 'nod-3', title: 'VW Cariad', tags: ['NOD'], body: 'מיליארדי יורו על פלטפורמת תוכנה. ארכיטקטורה שסטתה מהתכנון, שלב אחרי שלב. כל סטייה "הגיונית" ברמה המקומית. מצטברת, הן יצרו מערכת שלא דומה לתכנון המקורי. NOD ברמת Enterprise.' },
    ],
    prognosis: 'NOD מתפתח בהדרגה. שלב מוקדם (3–6 חודשים): סטיות מזדמנות. שלב ביניים (6–18 חודשים): הסטייה הופכת לנורמה. שלב מתקדם (18+ חודשים): הארגון אינו מודע לכך שהוא סוטה. ללא התערבות: כשל קטסטרופלי הוא עניין של זמן. עם התערבות: Just Culture + Nudge Management מצמצמים NOD תוך 8–16 שבועות.',
    differential: [
      { versus: 'OLD', howToDistinguish: 'OLD = כשלים חוזרים למרות נסיון ללמוד. NOD = כשלים חוזרים כי אף אחד לא שם לב שיש כשל. ב-OLD יש Retros שלא עובדים. ב-NOD אין צורך ב-Retros כי "הכל בסדר".' },
      { versus: 'CLT', howToDistinguish: 'CLT = עומס שמונע ביצוע נכון. NOD = ביצוע לא-נכון שלא נתפס כבעיה. ב-CLT אנשים יודעים שהם מדלגים. ב-NOD הם לא יודעים.' },
      { versus: 'שינוי מכוון בנוהל', howToDistinguish: 'שינוי מכוון מתועד, מאושר, ומנומק. NOD לא מתועד, לא מאושר, ולא מנומק. קריטריון C1 שולל NOD אם קיים תיעוד.' },
    ],
    leadingInterventions: ['5.1', '5.3', '5.4'],
  },

  // ─── ZSG_SAFETY ─────────────────────────────────────────────────────────────
  {
    code: 'DSM-Org 2.0',
    type: 'ZSG_SAFETY',
    label_he: 'גירעון בביטחון פסיכולוגי',
    label_en: 'Psychological Safety Deficit',
    tam: { t: 2, a: 4, m: 3, total: 9 },
    criteriaA: [
      { letter: 'A1', text: 'Edmondson Psychological Safety ממוצע < 3.5 (מתוך 7), או ירידה של 20%+ מול קו בסיס.' },
      { letter: 'A2', text: 'ערוץ קול יעיל לא קיים או לא בשימוש (דיווח רשמי/בטוח על בעיות כמעט ולא מתרחש).' },
    ],
    criteriaB: [
      { letter: 'B1', text: 'Near-miss / דיווחי סטייה קרובים לאפס למרות NOD או לחץ משלוח.' },
      { letter: 'B2', text: 'במבחני MBI — דה-פרסונליזציה עולה ביחס לתשישות רגשית (אינדיקטור ל"שקט מזויף").' },
    ],
    criteriaC: [
      { letter: 'C1', text: 'הממצא אינו מוסבר אך ורק על ידי עומס קוגניטיבי גולמי (CLT) ללא רכיב פחד מדיווח.' },
    ],
    severitySpecifiers: [
      { level: 'mild',     label: 'קל',    description: 'Edmondson 3.0–3.5. דיווח חלקי אך קיים.', tamRange: '6–7' },
      { level: 'moderate', label: 'בינוני', description: 'Edmondson < 3.0. דיווח רק ב"מסדרונות".', tamRange: '8–9' },
      { level: 'severe',   label: 'חמור',  description: 'Edmondson < 2.5 או שתיקה מוחלטת על כשלים.', tamRange: '10–12' },
    ],
    theoreticalMechanism: 'ללא בטחון פסיכולוגי (Edmondson) למידה מטעויות ודיווח מוקדם נחתכים. זה קדם-תנאי קליני ל-OLD ול-NOD מתקדם.',
    israeliContext: 'ערוצי דוגרי וישירות יכולים להסוות חוסר בטיחות — חשוב להצליב סקר מובנה ולא רק "אווירה".',
    vignettes: [
      { id: 'zsgs-1', title: 'דיווח אפס למרות תקלות חוזרות', tags: ['ZSG_SAFETY', 'NOD'], body: 'צוותים מדווחים על הצלחות בלבד; כשלים חוזרים בפרודקשן ללא near-miss.' },
    ],
    prognosis: 'מדידת Edmondson חוזרת + Just Culture + חיזוק ערוץ קול — 8–12 שבועות לשיפור ראשוני.',
    differential: [
      { versus: 'ZSG_CULTURE', howToDistinguish: 'SAFETY = פחד מדיווח ושקט. CULTURE = תחרות פנימית וסכום-אפס מבני גלויים.' },
      { versus: 'NOD', howToDistinguish: 'NOD = "ככה עובדים פה". SAFETY = אנשים יודעים שיש בעיה אבל לא מדברים.' },
    ],
    leadingInterventions: ['5.1'],
  },

  // ─── ZSG_CULTURE (zero-sum) ────────────────────────────────────────────────
  {
    code: 'DSM-Org 2.1',
    type: 'ZSG_CULTURE',
    label_he: 'תרבות ניכור פנים-ארגונית (סכום-אפס)',
    label_en: 'Zero-Sum Game Culture',
    tam: { t: 3, a: 3, m: 5, total: 11 },
    criteriaA: [
      { letter: 'A1', text: 'דפוס מתועד של תחרות פנימית בין צוותים, מחלקות, או יחידים שגורמת להפסדי סתירה (Contradiction Loss): שכפול מאמצים, מידע שלא זורם, או החלטות שנפתחות מחדש בגלל מאבקי בעלות.' },
      { letter: 'A2', text: 'Edmondson Psychological Safety Score ממוצע < 3.5 (מתוך 7), OR ירידה של 20%+ בציון Edmondson בהשוואה לקו בסיס.' },
    ],
    criteriaB: [
      { letter: 'B1', text: 'זיהוי של לפחות שני צוותים שבונים פונקציונליות חופפת ללא תיאום (Duplication of Effort).' },
      { letter: 'B2', text: 'עלייה של 30%+ בכמות Escalations ל-C-Level בהשוואה לתקופה מקבילה.' },
      { letter: 'B3', text: 'תחלופת עובדים בצוותים שזוהו כ"מפסידים" ב-ZSG גבוהה פי 2+ מממוצע הארגון.' },
      { letter: 'B4', text: 'קיום שיח פנימי שבו "הצלחה של צוות אחר" מתוארת בטרמינולוגיה שלילית ("הם לקחו לנו", "הגנו על שלנו").' },
    ],
    criteriaC: [
      { letter: 'C1', text: 'התחרות אינה תוצאה של מבנה תמריצים מכוון (בונוסים תחרותיים מובנים אינם סכום-אפס תרבותי. כאן התחרות צמחה מתוך מבנה, לא תוכננה).' },
    ],
    severitySpecifiers: [
      { level: 'mild',     label: 'קל',    description: 'תחרות מוגבלת ל-2–3 צוותים. Edmondson 3.0–3.5. שכפול מאמצים מזוהה אך ניתן לתיקון.', tamRange: '8–9' },
      { level: 'moderate', label: 'בינוני', description: 'סיילואים מוצקים בין מחלקות. "דוגרי" הפך לתרבות האשמה. Edmondson < 3.0. Escalations עלו 50%+.', tamRange: '10–11' },
      { level: 'severe',   label: 'חמור',  description: 'חוזה פסיכולוגי שבור: פיטורים המוניים, סגירת R&D, קריסת אמון. תחלופה > 30% ביחידות מפסידות. Edmondson < 2.5.', tamRange: '12–15' },
    ],
    theoreticalMechanism: 'ZSG מבוסס על תאוריית משחק סכום-אפס: הרווח שלי שווה להפסד שלך. בארגון, המנגנון פועל כשמשאבים נתפסים כקבועים (headcount, budget, C-Level attention). כל צוות שמקבל יותר = צוות אחר שמקבל פחות. התפיסה הזו מייצרת Contradiction Loss.',
    israeliContext: 'תרבות ה"דוגרי" היא חרב פיפיות. בצד החיובי: ישירות, ללא פוליטיקה. בצד השלילי: "דוגרי" שמתדרדר לתרבות האשמה. כשהישירות הופכת לטוקסית, אנשים מפסיקים להעלות בעיות.',
    vignettes: [
      { id: 'zsg-1', title: 'Playtika: 15% קיצוץ, 500 משרות', tags: ['ZSG_CULTURE', 'CS'], body: 'כשארגון חותך 500 משרות, המסר הסמוי לנשארים: "אתם הבאים". סכום-אפס מתעצם: כולם מגנים על הטריטוריה, שיתוף פעולה יורד, אנשים שומרים מידע כ-leverage. Severe + CS Comorbid.' },
      { id: 'zsg-2', title: 'Vimeo: סגירת R&D בישראל', tags: ['ZSG_CULTURE'], body: 'ההחלטה נלקחה מרחוק, בלי שהצוות המקומי היה חלק מהשיח. HQ מול Branch, עם ישראל כצד המפסיד. ידע מוסדי של שנים הלך לפח.' },
    ],
    prognosis: 'ZSG מתפתח לרוב סביב אירוע מפעיל: reorg, קיצוצים, שינוי אסטרטגיה. ללא התערבות: ספירלת תחלופה הולכת וגדלה. עם התערבות: Just Culture + RevOps/CoS משנים את מבנה התמריצים תוך 8–16 שבועות.',
    differential: [
      { versus: 'NOD', howToDistinguish: 'ב-NOD הבעיה שקופה (אף אחד לא שם לב). ב-ZSG הבעיה גלויה (כולם יודעים על התחרות, אף אחד לא פותר).' },
      { versus: 'CS',  howToDistinguish: 'CS = שחיקה מלחץ. ZSG = שחיקה מקונפליקט. ב-CS אנשים עייפים. ב-ZSG אנשים כועסים. MBI מבדיל: ב-CS, תשישות רגשית דומיננטית. ב-ZSG, דה-פרסונליזציה דומיננטית.' },
      { versus: 'תחרות בריאה', howToDistinguish: 'תחרות בריאה = סכום חיובי. ZSG = סכום אפס. הבדיקה: האם "הפסד" של צוות גורם לאובדן משאבים ממשי?' },
    ],
    leadingInterventions: ['5.1', '5.5'],
  },

  // ─── OLD ────────────────────────────────────────────────────────────────────
  {
    code: 'DSM-Org 3.1',
    type: 'OLD',
    label_he: 'מוגבלויות למידה ארגונית',
    label_en: 'Organizational Learning Disabilities',
    tam: { t: 3, a: 4, m: 4, total: 11 },
    criteriaA: [
      { letter: 'A1', text: 'הארגון חווה את אותם כשלים מהסוג זהה 3 פעמים או יותר ב-12 חודשים, למרות שבוצעו Retrospectives או Post-Mortems.' },
      { letter: 'A2', text: 'Action Items מ-Retros חוזרים: לפחות 40% מה-Action Items מופיעים ביותר מ-Retro אחד ללא סגירה.' },
    ],
    criteriaB: [
      { letter: 'B1', text: 'Conceptia Fixation: הגדרת הבעיה לא שונתה ב-12+ חודשים, למרות שהפתרון המוצע כשל מספר פעמים. ההנחה הבסיסית לא נבדקה.' },
      { letter: 'B2', text: 'תיעוד הפוך: יש תיעוד של מה קרה (Incident Reports), אבל אין תיעוד של מה למדנו (Lesson Learned Repository). או שהמאגר קיים אבל לא נגיש / לא מעודכן / לא נקרא.' },
      { letter: 'B3', text: 'עובדים חדשים חוזרים על טעויות ידועות בשלושת החודשים הראשונים, בשיעור של 50%+ מה-Onboarding Cohort.' },
      { letter: 'B4', text: 'Single-Loop Learning בלבד: Retros מייצרים "מה לתקן" אבל לא "איזו הנחה לעדכן". אין Assumption Updates.' },
    ],
    criteriaC: [
      { letter: 'C1', text: 'הכשלים החוזרים אינם תוצאה של מחסור במשאבים שמונע יישום (אם הצוות יודע מה לעשות אך אין לו resources, זה לא OLD. זה Resource Constraint).' },
    ],
    severitySpecifiers: [
      { level: 'mild',     label: 'קל',    description: 'כשלים חוזרים ב-1–2 תחומים. Retros קיימים אך לא יעילים.', tamRange: '8–9' },
      { level: 'moderate', label: 'בינוני', description: 'Conceptia Fixation מאובחנת. אותן בעיות חוזרות cross-team. תיעוד קיים אך לא פעיל.', tamRange: '10–11' },
      { level: 'severe',   label: 'חמור',  description: 'הארגון אינו מסוגל לזהות שהוא חוזר על אותן טעויות. Retros הפכו לטקס ללא משמעות. Zero Assumption Updates.', tamRange: '12–15' },
    ],
    theoreticalMechanism: 'Peter Senge (The Fifth Discipline, 1990) הגדיר מוגבלויות למידה ארגונית. Chris Argyris הבדיל בין Single-Loop Learning (תיקון סימפטום) ל-Double-Loop Learning (בדיקת ההנחה שיצרה את הסימפטום). OLD = תקיעות ב-Single-Loop.',
    israeliContext: 'ה-Flat Hierarchy שמאפשר חדשנות מהירה מונע תיעוד מובנה. "אנחנו לא חברה ביורוקרטית" הפך ל"אנחנו לא חברה שלומדת". ידע נשמר בראשים, לא במערכות.',
    vignettes: [
      { id: 'old-1', title: 'Plenty Unlimited: Chapter 11', tags: ['OLD'], body: 'טכנולוגיה שלא עבדה בקנה מידה. ההנחה ש"הטכנולוגיה תעבוד ב-scale" מעולם לא נבדקה מחדש. Conceptia Fixation קלאסית: הבעיה הוגדרה כ"engineering challenge" ולא כ"fundamental physics limitation".' },
    ],
    prognosis: 'ללא התערבות: אותם כשלים חוזרים, עלות הפסד מצטברת. עם התערבות: Double-Loop Learning + Just Culture מצמצמים OLD תוך 8–16 שבועות. מדד הצלחה: ירידה ב-Recurring Action Items מ-40%+ ל-<20%.',
    differential: [
      { versus: 'NOD', howToDistinguish: 'ב-NOD הארגון לא יודע שיש בעיה. ב-OLD הארגון יודע שיש בעיה, מנסה לפתור, ונכשל שוב ושוב. הסימפטום המבדיל: ב-OLD יש Retros. ב-NOD אין צורך ב-Retros.' },
      { versus: 'Resource Constraint', howToDistinguish: 'אם הצוות יודע מה לעשות ואין לו resources, זה לא OLD. קריטריון C1 שולל.' },
    ],
    leadingInterventions: ['5.2', '5.1', '5.7'],
  },

  // ─── CLT ────────────────────────────────────────────────────────────────────
  {
    code: 'DSM-Org 4.1',
    type: 'CLT',
    label_he: 'עומס קוגניטיבי כרוני',
    label_en: 'Chronic Cognitive Load / Stimulus Overload',
    tam: { t: 2, a: 5, m: 4, total: 11 },
    criteriaA: [
      { letter: 'A1', text: 'מפתחים / עובדי ידע מדווחים על פחות מ-2 שעות Focus Time רצוף ביום עבודה ממוצע, OR Context Switches > 15 פעמים ביום.' },
      { letter: 'A2', text: 'מעל 42% מזמן מפתחים מוקדש ל-Tech Debt ו-Rework (בהתאם לנתוני סקטור).' },
    ],
    criteriaB: [
      { letter: 'B1', text: 'Notification Load: עובדים מקבלים > 50 התראות ביום ממקורות עבודה (Slack, Email, Jira, PagerDuty).' },
      { letter: 'B2', text: 'ממוצע ישיבות > 4 ישיבות ביום, OR > 15 שעות ישיבות בשבוע.' },
      { letter: 'B3', text: 'עלייה ב-Bug Rate שלא מוסברת על ידי שינויי code volume (יותר באגים לאותה כמות קוד = סימן לפיזור קשב).' },
      { letter: 'B4', text: 'ציפייה מובנית ל-availability 24/7: עובדים מגיבים להודעות עבודה מחוץ לשעות העבודה בשיעור > 70%.' },
    ],
    criteriaC: [
      { letter: 'C1', text: 'העומס אינו תוצאה של מחסור כוח אדם זמני (launch period, incident response). CLT דורש דפוס כרוני (> 3 חודשים).' },
    ],
    severitySpecifiers: [
      { level: 'mild',     label: 'קל',    description: 'Focus Time 2–3 שעות/יום. Notifications 50–80/day. Bug Rate עלה 10–20%.', tamRange: '8–9' },
      { level: 'moderate', label: 'בינוני', description: 'Focus Time < 2 שעות/יום. Context Switches > 15/day. 42%+ זמן על Tech Debt.', tamRange: '10–11' },
      { level: 'severe',   label: 'חמור',  description: 'Focus Time < 1 שעה/יום. Availability 24/7. 83% שחיקה (כסף הסקטור). MBI Emotional Exhaustion > 27.', tamRange: '12–15' },
    ],
    theoreticalMechanism: 'Cognitive Load Theory (Sweller, 1988) מתאר שלושה סוגי עומס: Intrinsic (מורכבות המשימה), Extraneous (רעש סביבתי), ו-Germane (למידה). CLT ארגוני מתרחש כשעומס Extraneous גודש את הקיבולת. Gloria Mark (UC Irvine): החלפת הקשר עולה 23 דקות להתאוששות. ב-15 החלפות הקשר ביום, נשרפות 5.75 שעות רק על "לחזור למקום".',
    israeliContext: 'ציפייה ל-availability היא 24/7. WhatsApp groups של עבודה פעילים בלילות, בשבתות, בחגים. מכפיל המילואים מחמיר: צוותים מצומצמים סופגים את אותו עומס התראות עם פחות אנשים.',
    vignettes: [],
    prognosis: 'CLT ניתן לטיפול מהיר יחסית — שינוי ארכיטקטורת עבודה מראה תוצאות תוך 2–4 שבועות. Nudge Management + DDD Workflow הם ההתערבויות הראשיות.',
    differential: [
      { versus: 'CS',  howToDistinguish: 'ב-CS המקור רגשי/קיומי. ב-CLT המקור ארכיטקטוני. ב-CS, Focus Time לא יעזור אם המקור הוא חרדה. ב-CLT, Focus Time ישחרר קיבולת מיידית.' },
      { versus: 'NOD', howToDistinguish: 'ב-NOD אנשים מדלגים כי "זו הנורמה". ב-CLT אנשים מדלגים כי אין להם קיבולת. ההבדל: ב-CLT, אם תיתן זמן, אנשים ירצו לעשות QA. ב-NOD, לא ירצו.' },
    ],
    leadingInterventions: ['5.3', '5.4', '5.6'],
  },

  // ─── CS ─────────────────────────────────────────────────────────────────────
  {
    code: 'DSM-Org 5.1',
    type: 'CS',
    label_he: 'ספירלות הפסד ולחץ כרוני',
    label_en: 'Chronic Stress & Loss Spirals',
    tam: { t: 4, a: 5, m: 5, total: 14 },
    criteriaA: [
      { letter: 'A1', text: 'MBI Emotional Exhaustion subscale > 27, OR ציון MBI כולל מעל Cutoff קליני ב-2 מתוך 3 תת-סקלות.' },
      { letter: 'A2', text: 'RSQ (Resilience Scale) מראה ירידה של 20%+ בהשוואה לקו בסיס, OR ציון RSQ מתחת ל-Cutoff קליני.' },
    ],
    criteriaB: [
      { letter: 'B1', text: 'עלייה של 30%+ בימי מחלה בהשוואה לתקופה מקבילה (Pre-War baseline, אם קיים).' },
      { letter: 'B2', text: '15–20% מכוח העבודה במילואים / יוצאי מילואים, עם 33%+ בדרגות ניהול-ביניים ובכירים.' },
      { letter: 'B3', text: 'Decision Latency עלה 50%+ (זמן ממוצע מקבלת מידע עד קבלת החלטה) ללא שינוי בנפח ההחלטות.' },
      { letter: 'B4', text: 'Presenteeism: עובדים נוכחים פיזית/דיגיטלית אך ביצועים ירדו 20%+ (נמדד ב-Velocity, Throughput, או Output Quality).' },
      { letter: 'B5', text: 'Rebound Effect: ביצועים לא חזרו לקו בסיס גם אחרי הסרת מקור לחץ ספציפי (חזרה ממילואים, סיום פרויקט דחוף).' },
    ],
    criteriaC: [
      { letter: 'C1', text: 'הלחץ אינו אקוטי וזמני (launch week, incident response < 2 שבועות). CS דורש מינימום 3 חודשים של דפוס כרוני.' },
    ],
    severitySpecifiers: [
      { level: 'mild',     label: 'קל',    description: 'MBI Emotional Exhaustion 22–27. ירידת ביצועים 10–15%. Decision Latency עלה 25–50%.', tamRange: '10–11' },
      { level: 'moderate', label: 'בינוני', description: 'MBI > 27. Rebound Effect מתועד. Presenteeism ברור. 15%+ במילואים. ימי מחלה עלו 30%+.', tamRange: '12–13' },
      { level: 'severe',   label: 'חמור',  description: 'MBI קריטי ב-3/3 תת-סקלות. 83% שחיקה (נתון סקטור). תחלופה > 20% שנתי. ספירלת הפסד פעילה: כל חודש גרוע מקודמו.', tamRange: '14–15' },
    ],
    theoreticalMechanism: 'COR Theory (Hobfoll, 1989): אנשים וארגונים פועלים מתוך דחף לשמור על משאבים. הפסד כואב יותר מרווח מקביל (Loss Primacy). הפסדים יוצרים ספירלה (Loss Spiral). Rebound Effect: ארגון שנכנס לספירלת הפסד לא חוזר לקו הבסיס גם אחרי שהלחץ מוסר — נדרשת התערבות מבנית.',
    israeliContext: 'ישראל 2024–2026: מלחמה, מילואים, אי-ודאות קיומית. הלחץ הכרוני אינו ארגוני בלבד — הוא קיומי. CS הוא המגביר המערכתי הקטלני ביותר: T/A/M כולל 14/15.',
    vignettes: [
      { id: 'cs-1', title: 'Playtika: ספירלת תחלופה', tags: ['CS', 'ZSG_CULTURE'], body: 'כל סבב פיטורים הגביר סכום-אפס ו-CS בו-זמנית. Survivor Guilt + ספירלת הפסד פעילה. הצוותים שנשארו חוו עלייה בתחלופה ב-quarter שלאחר הפיטורים.' },
    ],
    prognosis: 'CS היא הפתולוגיה הקטלנית ביותר (T/A/M 14/15) וגם המגביר: CS מזינה NOD, ZSG_SAFETY/ZSG_CULTURE, OLD ו-CLT בו-זמנית. CS תמיד ראשון אם קיים — כי הוא amplifier שמחמיר הכל.',
    differential: [
      { versus: 'CLT', howToDistinguish: 'CLT = עומס ארכיטקטוני. CS = עומס רגשי/קיומי. אם שינוי ארכיטקטורת עבודה פותר, זה CLT. אם לא, זה CS.' },
      { versus: 'ZSG_CULTURE', howToDistinguish: 'סכום-אפס = שחיקה מקונפליקט. CS = שחיקה מהפסד. בסכום-אפס אנשים כועסים. ב-CS אנשים תשושים.' },
      { versus: 'לחץ אקוטי רגיל', howToDistinguish: 'Launch week, Incident Response < 2 שבועות = לחץ אקוטי נורמלי. CS דורש 3+ חודשים של דפוס כרוני + Rebound Effect.' },
    ],
    leadingInterventions: ['5.4', '5.7', '5.1'],
  },
]

export const DSM_INTERVENTION_PLAYBOOKS: InterventionPlaybook[] = [
  {
    id: '5.1',
    title: 'Just Culture Algorithm',
    target: ['NOD', 'ZSG_SAFETY', 'ZSG_CULTURE'],
    axes: ['A', 'M'],
    timeline: '30d',
    protocol: 'שלוש שאלות שיטתיות לכל תקרית:\n1. האם היה נוהל ברור?\n2. האם הנוהל היה ישים בתנאי השטח?\n3. האם האדם סטה ביודעין ובכוונה?\nרק אם כן-כן-כן → אחריות אישית. בכל מקרה אחר → כשל מערכתי.',
    successMetric: 'עלייה ב-Incident Reports ללא עלייה בתקריות. Edmondson Score עולה מעל 3.5.',
    effectiveness: {
      NOD: 'primary',
      ZSG_SAFETY: 'primary',
      ZSG_CULTURE: 'primary',
      OLD: 'secondary',
      CLT: 'indirect',
      CS: 'secondary',
    },
  },
  {
    id: '5.2',
    title: 'Double-Loop Learning',
    target: ['OLD'],
    axes: ['A', 'T'],
    timeline: 'ongoing',
    protocol: 'כל Retrospective / Post-Mortem חייב לייצר שני תוצרים:\n1. Action Item (לולאה ראשונה): מה מתקנים.\n2. Assumption Update (לולאה שנייה): איזו הנחה מעדכנים.\nשאלת המפתח: "מה חשבנו שנכון ש-incident זה הוכיח שלא?"',
    successMetric: 'ירידה ב-Recurring Action Items. יעד: < 20% חזרה (מול 40%+ baseline ב-OLD).',
    effectiveness: {
      OLD: 'primary',
      NOD: 'secondary',
      ZSG_SAFETY: 'indirect',
      ZSG_CULTURE: 'indirect',
      CLT: 'indirect',
      CS: 'secondary',
    },
  },
  {
    id: '5.3',
    title: 'Nudge Management',
    target: ['CLT', 'NOD'],
    axes: ['A', 'T'],
    timeline: '14d',
    protocol: 'Default Settings: Code Review אוטומטית (opt-out, לא opt-in).\nContextual Reminders: Bot שמזהה PR בלי tests ושואל "בכוונה?"\nTransparent Metrics: דשבורד צוותי עם Tech Debt Score בזמן אמת.\nArchitecture Guardrails: Linting rules שמונעים Copy-Paste מעל סף.',
    successMetric: 'ירידה ב-Copy-Paste Code מתחת ל-12%. עלייה ב-Refactoring Activity. ירידה ב-Hotfix Rate.',
    effectiveness: {
      NOD: 'primary',
      CLT: 'primary',
      OLD: 'secondary',
      ZSG_SAFETY: 'indirect',
      ZSG_CULTURE: 'indirect',
      CS: 'indirect',
    },
  },
  {
    id: '5.4',
    title: 'Tech Tourniquet — חוסם עורקים טכנולוגי',
    target: ['NOD', 'ZSG_SAFETY', 'ZSG_CULTURE', 'OLD', 'CLT', 'CS'],
    axes: ['T', 'M'],
    timeline: '14d',
    protocol: 'כלל 1: חייב להיבנות תוך 1–3 ימים. אם לוקח יותר = פרויקט, לא Tourniquet.\nכלל 2: פותר בעיה אחת. לא שתיים.\nכלל 3: מדד הצלחה חד: Decision Latency ירד? Handoffs ירדו? Context Switches ירדו?\nדוגמאות: דשבורד שמרכז מידע מ-7 מערכות (CLT). בוט שמנתב שאלות לאדם הנכון (Decision Latency).',
    successMetric: 'קיצור Decision Latency ו/או צמצום Handoffs תוך שבוע מיישום.',
    effectiveness: {
      NOD: 'secondary',
      ZSG_SAFETY: 'secondary',
      ZSG_CULTURE: 'secondary',
      OLD: 'secondary',
      CLT: 'primary',
      CS: 'secondary',
    },
  },
  {
    id: '5.5',
    title: 'ארכיטקטורת RevOps / CoS',
    target: ['ZSG_CULTURE', 'CLT'],
    axes: ['T', 'A', 'M'],
    timeline: '90d',
    protocol: 'RevOps מאחד Sales, Marketing ו-CS תחת מדדים משותפים. CoS יוצר שכבת תיאום שמונעת Handoff Overload. בחברת 50–300 עובדים, הסיילואים עדיין לא בטון.',
    successMetric: 'ירידה בכמות Handoffs/process. ירידה בכמות ישיבות להחלטה. עלייה ב-Response Time ללקוח.',
    effectiveness: {
      ZSG_CULTURE: 'primary',
      ZSG_SAFETY: 'indirect',
      CLT: 'primary',
      OLD: 'secondary',
      NOD: 'indirect',
      CS: 'indirect',
    },
  },
  {
    id: '5.6',
    title: 'DDD Workflow Redesign',
    target: ['CLT', 'NOD'],
    axes: ['T', 'A'],
    timeline: '30d',
    protocol: 'Value Stream Mapping של תהליך קריטי אחד. זיהוי כל Handoff. חיסול מה שניתן. אוטומציה של מה שנשאר. Domain-Driven Design: מבנה העבודה צריך לשקף את מבנה הדומיין.',
    successMetric: 'ירידה ב-Handoff Count בתהליך שמופה. ירידה ב-Cycle Time.',
    effectiveness: {
      CLT: 'primary',
      NOD: 'secondary',
      ZSG_SAFETY: 'secondary',
      ZSG_CULTURE: 'secondary',
      OLD: 'indirect',
      CS: 'indirect',
    },
  },
  {
    id: '5.7',
    title: 'TTX — תרגילי שיהוי החלטות',
    target: ['OLD', 'CS'],
    axes: ['T', 'A'],
    timeline: 'one-time',
    protocol: 'Tabletop Exercise: סימולציה שמודדת Decision Latency תחת לחץ.\nמדד 1: זמן עד החלטה ראשונה (target: < 15 דקות).\nמדד 2: כמות מידע שנדרש לפני החלטה (target: < 3 שאלות).\nמדד 3: מי מחליט ומי מחכה (target: בעל סמכות מחליט, לא ועדה).\nמדד 4: הנחות סמויות שנחשפו (target: > 2 הנחות שהוזמו).',
    successMetric: 'קיצור Decision Latency בתרחיש. חשיפת הנחות סמויות.',
    effectiveness: {
      OLD: 'primary',
      CS: 'primary',
      ZSG_SAFETY: 'secondary',
      ZSG_CULTURE: 'secondary',
      NOD: 'indirect',
      CLT: 'indirect',
    },
  },
]

export const DSM_ASSESSMENT_INSTRUMENTS: AssessmentInstrument[] = [
  {
    id: 'mbi',
    name: 'MBI — Maslach Burnout Inventory',
    subscales: [
      { name: 'Emotional Exhaustion', items: 9,  clinicalCutoff: '> 27',  tamAxis: 'A' },
      { name: 'Depersonalization',    items: 5,  clinicalCutoff: '> 13',  tamAxis: 'A, M' },
      { name: 'Personal Accomplishment', items: 8, clinicalCutoff: '< 21', tamAxis: 'M' },
    ],
    description: 'כלי מאומת למדידת שחיקה על שלושה ממדים. שלוש תת-סקלות. ציון תשישות רגשית מעל 27 = שחיקה חמורה.',
    usageInDsmOrg: 'כלי אבחוני ראשי ל-CS. ירידה של 20%+ מ-baseline = אינדיקטור לספירלת הפסד פעילה.',
    israeliNote: 'בהקשר ישראלי יש לשים לב לסטואיקיות תרבותית שעלולה להוריד ציוני Emotional Exhaustion באופן מלאכותי. המלצה: להצליב MBI עם נתונים התנהגותיים (ימי מחלה, Velocity ירידה).',
  },
  {
    id: 'edmondson',
    name: 'Edmondson 7-Item Psychological Safety Survey',
    description: 'Amy Edmondson (1999). שבעה פריטים בסולם 1–7. ציון ממוצע. Cutoff: < 3.5 = ביטחון פסיכולוגי נמוך. < 2.5 = קריטי.',
    usageInDsmOrg: 'כלי אבחוני ראשי ל-ZSG_SAFETY / NOD. ירידה של 20%+ מ-baseline = אינדיקטור לשינוי מערכתי.',
  },
  {
    id: 'rsq',
    name: 'RSQ — Resilience Scale Questionnaire',
    description: 'מודד חוסן ארגוני על שלושה ממדים: יכולת התאוששות, גמישות אדפטיבית, ושמירה על תפקוד תחת לחץ.',
    usageInDsmOrg: 'כלי אבחוני ראשי ל-CS. ירידה של 20%+ מ-baseline = אינדיקטור לספירלת הפסד פעילה.',
  },
]

export const DSM_DIAGNOSTIC_PROCESS: DiagnosticStep[] = [
  {
    number: '01',
    title: 'מיסגור ותיחום (Framing & Scoping)',
    description: 'זיהוי מחזיק העניינים (COO / CFO / VP People). הגדרת הבעיה כפי שמנוסחת על ידו. תיחום יחידת האנליזה: צוות, מחלקה, או ארגון שלם. הגדרת ה-KPI הארגוני שאמור לזוז.',
    output: 'מסמך תיחום (Scope Document): בעיה + יחידה + KPI + timeline',
  },
  {
    number: '02',
    title: 'קו בסיס ומיון T/A/M (Baseline Data & Triage)',
    description: 'איסוף שלוש שכבות נתונים: שכבת HR (תחלופה, ימי מחלה, ימי מילואים, eNPS), שכבת מערכת (DORA metrics, Cycle Time, Deployment Frequency, Hotfix Rate), ושכבת שיח (סקרים קיימים, תלונות, Sentiment Analysis).',
    output: 'T/A/M Triage Card: ציוני T/A/M ראשוניים + זיהוי ציר מוביל',
  },
  {
    number: '03',
    title: 'מודול שאלונים מאומתים (Validated Questionnaires Module)',
    description: 'שלושה כלים מופעלים בהתאם לתוצאות המיון: MBI (כאשר ציר A גבוה), Edmondson 7-Item (כאשר מזוהה חשד ל-ZSG או NOD), RSQ (כאשר מזוהים סממנים של ספירלת הפסד).',
    output: 'Validated Scores: MBI subscales + Edmondson mean + RSQ index',
  },
  {
    number: '04',
    title: 'מיפוי לקטגוריות DSM-Org (Diagnostic Mapping)',
    description: 'הנתונים המשולבים ממופים לחמש קטגוריות הפתולוגיה. הבדיקה עוברת את הקריטריונים האבחוניים באופן שיטתי. עבור כל פתולוגיה נבדק: האם הקריטריונים מתקיימים, מהי רמת החומרה, האם קיימת comorbidity.',
    output: 'Diagnostic Profile: Primary Dx + Comorbid Dx + Severity Specifiers',
  },
  {
    number: '05',
    title: 'סינתזה ודוח (Synthesis & Report)',
    description: 'הדוח הקליני כולל: תמונת מצב T/A/M מספרית, מיפוי פתולוגיות עם specifiers, ניתוח שרשראות סיבתיות, זיהוי צוואר הבקבוק המרכזי, וחלונית התערבות מומלצת.',
    output: 'DSM-Org Clinical Report (8–12 עמודים)',
  },
  {
    number: '06',
    title: 'חוברות התערבות (Intervention Playbooks)',
    description: 'כל אבחנה נקשרת לחוברת התערבות ספציפית. סדר הפעולות: (1) Tech Tourniquet, חוסם עורקים ב-1–3 ימים. (2) שינוי מבני, 4–16 שבועות. (3) מנגנון משוב, שוטף.',
    output: 'Intervention Plan: Tourniquet + Structural Change + Feedback Loop',
  },
  {
    number: '07',
    title: 'ניטור, משוב ולמידה (Monitoring, Feedback & Learning)',
    description: 'מעקב רבעוני על מדדי T/A/M. השוואה לקו בסיס. שלב זה מפעיל Double-Loop Learning על תהליך האבחון עצמו: בדיקה האם ההתערבות עובדת (לולאה ראשונה), ובדיקה האם המודל האבחוני מדויק (לולאה שנייה).',
    output: 'Quarterly Review: Updated T/A/M + Assumption Audit + Model Calibration',
  },
]

// ─── Comorbidity ordering rule ────────────────────────────────────────────────

/**
 * Returns pathologies sorted by intervention priority.
 * CS always first (systemic amplifier), then by T/A/M total descending.
 */
export function sortByInterventionPriority(types: PathologyType[]): PathologyType[] {
  const order: Record<PathologyType, number> = {
    CS: 0,
    NOD: 1,
    ZSG_SAFETY: 2,
    ZSG_CULTURE: 2,
    OLD: 3,
    CLT: 4,
  }
  return [...types].sort((a, b) => order[a] - order[b])
}

/**
 * Returns the leading intervention playbooks for a given pathology.
 */
export function getLeadingPlaybooks(type: PathologyType): InterventionPlaybook[] {
  const entry = DSM_PATHOLOGIES.find(p => p.type === type)
  if (!entry) return []
  return entry.leadingInterventions
    .map(id => DSM_INTERVENTION_PLAYBOOKS.find(p => p.id === id))
    .filter((p): p is InterventionPlaybook => p !== undefined)
}

/**
 * Returns comorbid pathologies for a given type (upstream → downstream).
 */
export function getComorbidities(type: PathologyType): ComorbidityEntry[] {
  return DSM_COMORBIDITY_MATRIX.filter(e => e.from === type || e.to === type)
}
