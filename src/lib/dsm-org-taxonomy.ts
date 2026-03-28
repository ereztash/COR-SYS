/**
 * DSM-Org Full Taxonomy — 7 Parts, 21 Sub-topics
 *
 * Data source: NotebookLM organizational resilience library
 * Covers: T/A/M signatures, Red Flags, Sequencing Rules, Anti-Fragility
 */

import type { PathologyCode } from './dsm-engine'

// ─── Extended Pathology Codes ────────────────────────────────────────────────

export type ExtendedPathologyCode = PathologyCode | 'ZSG' | 'CLT' | 'OLD'

export const EXTENDED_PATHOLOGY_NAMES: Record<ExtendedPathologyCode, { he: string; en: string }> = {
  DR: { he: 'הדדיות מעוותת', en: 'Distorted Reciprocity' },
  ND: { he: 'נורמליזציית סטייה', en: 'Normalization of Deviance' },
  UC: { he: 'כיול לא-מייצג', en: 'Unrepresentative Calibration' },
  SC: { he: 'עמימות מבנית', en: 'Structural Clarity Deficit' },
  ZSG: { he: 'ריצפת בטיחות אפסית', en: 'Zero Safety Ground' },
  CLT: { he: 'מלכודת עומס קוגניטיבי', en: 'Cognitive Load Trap' },
  OLD: { he: 'גירעון למידה ארגוני', en: 'Organizational Learning Deficit' },
}

// ─── T/A/M Canonical Signatures ──────────────────────────────────────────────

export interface TAMSignature {
  T: number  // Time cost (1-5)
  A: number  // Attention cost (1-5)
  M: number  // Money cost (1-5)
}

export const TAM_SIGNATURES: Record<ExtendedPathologyCode, TAMSignature> = {
  DR: { T: 3, A: 3, M: 4 },
  ND: { T: 4, A: 3, M: 5 },
  UC: { T: 3, A: 4, M: 3 },
  SC: { T: 5, A: 3, M: 4 },
  ZSG: { T: 2, A: 5, M: 3 },
  CLT: { T: 2, A: 5, M: 4 },
  OLD: { T: 3, A: 4, M: 3 },
}

// ─── DSM-Org 7 Parts ─────────────────────────────────────────────────────────

export interface DsmOrgSubTopic {
  id: string
  nameHe: string
  nameEn: string
  description: string
  relatedPathologies: ExtendedPathologyCode[]
  diagnosticQuestions: string[]
  kpis: string[]
}

export interface DsmOrgPart {
  part: number
  nameHe: string
  nameEn: string
  description: string
  subTopics: DsmOrgSubTopic[]
}

export const DSM_ORG_PARTS: DsmOrgPart[] = [
  {
    part: 1,
    nameHe: 'תשתית המדידה והטריאז\'',
    nameEn: 'Measurement & Triage Framework',
    description: 'כיצד הארגון ממיר "כאבים" לתצורה מתמטית של עלויות ומדדי בשלות',
    subTopics: [
      {
        id: 'tam-signature',
        nameHe: 'חתימת T/A/M',
        nameEn: 'T/A/M Signature (Time, Attention, Money)',
        description: 'כימות הפתולוגיה למשאבים קריטיים — זמן, קשב, כסף',
        relatedPathologies: ['DR', 'ND', 'UC', 'SC'],
        diagnosticQuestions: [
          'כמה שעות ניהוליות שבועיות אובדות על פגישות עודפות וכיבוי שריפות?',
          'מהי רמת העומס הקוגניטיבי — כמה החלפות הקשר (Context Switches) מתרחשות ביום?',
          'מהו הדלף הפיננסי הנובע מהקטע "כסף שנשאר על הרצפה"?',
        ],
        kpis: ['Decision Latency Hours/week', 'Context Switches/day', 'Revenue leakage ₪/month'],
      },
      {
        id: 'change-readiness',
        nameHe: 'מודל בשלות לשינוי',
        nameEn: 'Change Readiness (AIM, IAM, FIM)',
        description: 'מדדי מקובלות, הלימות והיתכנות של התערבויות (Weiner)',
        relatedPathologies: ['UC', 'OLD'],
        diagnosticQuestions: [
          'האם ההתערבות המוצעת נתפסת כמתאימה (Appropriate) ע"י ההנהלה?',
          'האם העובדים מקבלים את השינוי (Acceptable) או דוחים אותו?',
          'האם הפתרון ישים תפעולית ותקציבית (Feasible)?',
        ],
        kpis: ['AIM Score (1-5)', 'IAM Score (1-5)', 'FIM Score (1-5)'],
      },
      {
        id: 'ius-score',
        nameHe: 'מנוע דירוג ואילוצים',
        nameEn: 'IUS Score & Constraint Envelope',
        description: 'נוסחת חישוב תועלת ההתערבות מול חסמי תקציב ופניות קוגניטיבית',
        relatedPathologies: ['DR', 'ND', 'UC', 'SC'],
        diagnosticQuestions: [
          'מהו ציון התועלת הצפוי מול עלות ההתערבות?',
          'האם קיימת חריגה מסף עייפות השינוי של העובדים?',
          'מהו Constraint Penalty — קנס האילוצים הצפוי?',
        ],
        kpis: ['IUS Score (0-100)', 'Constraint Penalty (%)', 'Change Fatigue Index'],
      },
    ],
  },
  {
    part: 2,
    nameHe: 'פתולוגיות תקשורת ומרחב פסיכולוגי',
    nameEn: 'Communication & Psychological Space Pathologies',
    description: 'כשלים ביכולת הארגון לנהל זרימת מידע חופשית ולהציף טעויות ללא פחד',
    subTopics: [
      {
        id: 'zsg',
        nameHe: 'ריצפת בטיחות אפסית (ZSG)',
        nameEn: 'Zero Safety Ground',
        description: 'קריסת "אזור הלמידה" ומעבר ל"אזור החרדה" עקב ניהול מבוסס-ענישה',
        relatedPathologies: ['ZSG', 'UC'],
        diagnosticQuestions: [
          'האם עובדים מדווחים על כמעט-תקלות (Near-Miss) ללא פחד מסנקציות?',
          'מה הפער בין הצהרות ההנהלה לנכונות בפועל להציף טעויות?',
          'האם קיימת מגננה פסיכולוגית — חיפוש אשמים במקום חקירת שורשי בעיה?',
        ],
        kpis: ['Near-Miss Reports/month', 'PSI Score (Edmondson)', 'Blame-to-System Ratio'],
      },
      {
        id: 'dugri-toxicity',
        nameHe: 'רעילות הדוגרי',
        nameEn: 'Dugri Toxicity',
        description: 'שימוש בישירות כמסווה לאלימות מילולית ותרבות של האשמה',
        relatedPathologies: ['ZSG', 'DR'],
        diagnosticQuestions: [
          'האם "ישירות" בפגישות הנהלה ירדה לפסים אישיים?',
          'מה שיעור האינטראקציות המילוליות הבלתי-מקצועיות בצוותים?',
          'האם הנמקות מקצועיות נדחקות ע"י ביקורת אישית?',
        ],
        kpis: ['Constructive vs Destructive Feedback Ratio', 'Exit Interview Mentions (%)'],
      },
      {
        id: 'boundary-ambiguity',
        nameHe: 'עמימות גבולות',
        nameEn: 'Boundary Ambiguity Syndrome',
        description: 'סכנות ההיררכיה השטוחה — בלבול תפקודי, כפילויות, שחיקת מנהלים',
        relatedPathologies: ['SC', 'DR'],
        diagnosticQuestions: [
          'האם קיימת "אשליית חוסר גבולות" — כולם מחליטים על הכל?',
          'מהו שיעור ההחלטות שחוזרות למנכ"ל בגלל היעדר סמכות ברורה?',
          'כמה פגישות שבועיות נגרמות מכפילות אחריות?',
        ],
        kpis: ['Decision Escalation Rate (%)', 'Duplicate Meeting Hours/week'],
      },
    ],
  },
  {
    part: 3,
    nameHe: 'פתולוגיות סטייה תהליכית ומבנית',
    nameEn: 'Process & Structural Deviation Pathologies',
    description: 'הסתגלות לתקינות שגויה ואובדן משמעת תהליכית',
    subTopics: [
      {
        id: 'nod',
        nameHe: 'נרמול של סטייה (NOD)',
        nameEn: 'Normalization of Deviance',
        description: 'הפיכת מעקפים וקיצורי דרך מסוכנים לנורמה בגלל לחצי ייצור (Vaughan)',
        relatedPathologies: ['ND'],
        diagnosticQuestions: [
          'באיזו תדירות נעקפים נהלי QA תחת לחץ דדליינים?',
          'האם "עקיפה חד-פעמית" הפכה לנוהל סטנדרטי?',
          'מהו שיעור ה-Near-Miss שלא דווח בגלל נורמליזציה?',
        ],
        kpis: ['QA Bypass Rate (%)', 'Vaughan Stage (1-5)', 'Technical Debt Growth Rate'],
      },
      {
        id: 'semantic-drift',
        nameHe: 'סחיפה סמנטית דגרדטיבית',
        nameEn: 'Degradative Semantic Drift',
        description: 'שחיקת המשמעות של נהלים וערכי ליבה — "סיסמאות ריקות"',
        relatedPathologies: ['UC', 'OLD'],
        diagnosticQuestions: [
          'האם הצהרות החזון (Espoused) עומדות בסתירה למה שמבוצע (In-Use)?',
          'מהו שיעור "הסיסמאות הריקות" — ערכים שאף אחד לא מקיים בפועל?',
          'האם אובדן ה"חיכוך האונטולוגי" מייצר ציניות בקרב העובדים?',
        ],
        kpis: ['Espoused vs In-Use Gap Score', 'Cynicism Index (survey)', 'Value Alignment (%)'],
      },
      {
        id: 'sc-deficit',
        nameHe: 'גירעון בהירות מבנית',
        nameEn: 'Structural Clarity Deficit',
        description: 'ממגורות עוינות (Silos) ושיהוי חמור בקבלת החלטות',
        relatedPathologies: ['SC'],
        diagnosticQuestions: [
          'מהו שיהוי קבלת ההחלטות הממוצע (Decision Latency) בימים?',
          'כמה תהליכי ליבה מתועדים ונגישים?',
          'מהי העלות הכספית של חוסר הגדרת סמכויות?',
        ],
        kpis: ['Decision Latency (days)', 'Documented Processes (%)', 'Silo Friction Cost (₪/month)'],
      },
    ],
  },
  {
    part: 4,
    nameHe: 'פתולוגיות קוגניטיביות וקיבעון למידה',
    nameEn: 'Cognitive & Learning Fixation Pathologies',
    description: 'חוסר יכולת הארגון לעכל מידע חדש ולהסיק מסקנות עמוקות',
    subTopics: [
      {
        id: 'old',
        nameHe: 'גירעון למידה ארגוני (OLD)',
        nameEn: 'Organizational Learning Deficit',
        description: 'כשל במעבר ללמידה דו-לולאתית — טיפול בסימפטומים במקום באמונות יסוד (Argyris)',
        relatedPathologies: ['OLD', 'UC'],
        diagnosticQuestions: [
          'האם הארגון תקוע בלמידה חד-לולאתית — אותן תקלות חוזרות?',
          'מהו שיעור התחקירים שהובילו לשינוי מבני אמיתי?',
          'האם הנהלה מסוגלת לאתגר את הנחות היסוד שלה?',
        ],
        kpis: ['Recurring Incident Rate (%)', 'AAR-to-Change Ratio', 'Assumption Challenge Index'],
      },
      {
        id: 'conceptia-fixation',
        nameHe: 'קיבעון קונספציה וכשל תחקור',
        nameEn: 'Conceptia Fixation & AAR Malfunction',
        description: 'תחקירים כזירת אשמים, דחיית עובדות הסותרות את אמונת ההנהלה',
        relatedPathologies: ['OLD', 'ZSG'],
        diagnosticQuestions: [
          'האם תהליכי AAR מתנהלים כמגננה פסיכולוגית?',
          'מהו שיעור ההחלטות שנדחו למרות עדויות סותרות?',
          'האם ישנה "עיוורון קונספטואלי" — דבקות בתוכנית המקורית?',
        ],
        kpis: ['Defensive Routine Frequency', 'Evidence Rejection Rate (%)', 'Post-Mortem Quality Score'],
      },
      {
        id: 'clt',
        nameHe: 'מלכודת עומס קוגניטיבי (CLT)',
        nameEn: 'Cognitive Load Trap',
        description: 'שחיקת קשב עקב Context Switching ופסולת קוד AI — "סחיפה ארכיטקטונית"',
        relatedPathologies: ['CLT', 'SC'],
        diagnosticQuestions: [
          'כמה Context Switches ביום חווה מהנדס בכיר?',
          'מהו שיעור הקוד שנכתב ע"י AI ללא Review אנושי?',
          'כמה אחוז מזמן המפתחים מושקע בתיקון חוב טכני?',
        ],
        kpis: ['Context Switches/day', 'AI Code Without Review (%)', 'Tech Debt Time Tax (%)'],
      },
    ],
  },
  {
    part: 5,
    nameHe: 'פתולוגיות חוסן ושחיקה',
    nameEn: 'Resilience & Burnout Pathologies',
    description: 'דלדול אנרגיה מערכתית, שבירת נאמנות וקיפאון כוח אדם',
    subTopics: [
      {
        id: 'distorted-reciprocity',
        nameHe: 'הדדיות מעוותת (DR)',
        nameEn: 'Distorted Reciprocity',
        description: 'קריסת החוזה הפסיכולוגי — פיטורים למען התייעלות הונית',
        relatedPathologies: ['DR'],
        diagnosticQuestions: [
          'האם הארגון ביצע פיטורים אגרסיביים ב-12 חודשים האחרונים?',
          'מהו מדד הנאמנות למוצר לאחר גלי קיצוצים?',
          'האם עובדים בכירים מרגישים ש"ההשקעה שלהם לא נראית"?',
        ],
        kpis: ['Psychological Contract Breach Index', 'Voluntary Turnover (%)', 'Product Loyalty Score'],
      },
      {
        id: 'systemic-burnout',
        nameHe: 'שחיקה מערכתית ואפקט ריבאונד',
        nameEn: 'Systemic Burnout & Rebound Effect',
        description: 'החזרה כפויה ליעדים בלתי-אפשריים מיד אחרי משבר',
        relatedPathologies: ['DR', 'CLT'],
        diagnosticQuestions: [
          'האם ההנהלה הגדילה KPIs מיד לאחר משבר (Rebound)?',
          'מהו שיעור MBI — Maslach Burnout Inventory — בקרב מנהלים?',
          'האם ישנה מנהיגות רגשית או רק מנהיגות מונחית-תוצאות?',
        ],
        kpis: ['MBI Score (team avg)', 'KPI Ramp-up Post-Crisis (%)', 'Emotional Leadership Index'],
      },
      {
        id: 'miluim-multiplier',
        nameHe: 'מכפיל המילואים וסטגנציה שקטה',
        nameEn: 'The Miluim Multiplier & Silent Stagnation',
        description: 'דעיכת ידע סמוי בעקבות היעדרויות — הסתגרות במצב הישרדות',
        relatedPathologies: ['DR', 'OLD', 'CLT'],
        diagnosticQuestions: [
          'כמה בכירים נעדרים כרגע בשל מילואים ומה אורך ההיעדרות?',
          'מהו זמן מחצית החיים של הזיכרון ההקשרי לאחר עזיבת מפתח בכיר?',
          'האם העובדים הנותרים עברו ל"מצב הישרדות" מקצועי?',
        ],
        kpis: ['Tacit Knowledge Half-Life (days)', 'Absentee Senior Ratio (%)', 'Silent Stagnation Index'],
      },
    ],
  },
  {
    part: 6,
    nameHe: 'תחלואה כפולה וחוקי רצף',
    nameEn: 'Comorbidity & Sequencing Rules',
    description: 'סדר פעולות דטרמיניסטי בעת הופעת מספר פתולוגיות יחד',
    subTopics: [
      {
        id: 'cascade-state',
        nameHe: 'מצב קסקדה (CS)',
        nameEn: 'Cascade State',
        description: 'כשל מערכתי רוחבי המעצים את כל הפתולוגיות במקביל',
        relatedPathologies: ['DR', 'ND', 'UC', 'SC', 'ZSG', 'CLT', 'OLD'],
        diagnosticQuestions: [
          'האם יש קריסת אמון + זינוק בעומס קוגניטיבי + שיהוי החלטות בו-זמנית?',
          'האם 3 פתולוגיות שונות ברמה חמורה פעילות במקביל?',
          'האם הארגון מצוי ב"שיתוק החלטות" מוחלט?',
        ],
        kpis: ['Concurrent Severe Pathologies Count', 'System Paralysis Index', 'Total Entropy Score'],
      },
      {
        id: 'burke-litwin',
        nameHe: 'היררכיה סיבתית',
        nameEn: 'Burke-Litwin Causal Model',
        description: 'הבחנה בין מחוללי שינוי טרנספורמטיביים לטרנזקציוניים',
        relatedPathologies: ['DR', 'SC', 'ZSG'],
        diagnosticQuestions: [
          'האם הכשל הוא ברמת התרבות/חזון (טרנספורמטיבי) או ברמת התהליכים (טרנזקציוני)?',
          'האם שינוי במנהיגות יפתור את הבעיה, או שדרוש שינוי מבני?',
          'מהי שכבת הגורם הסיבתי הראשית?',
        ],
        kpis: ['Transformational vs Transactional Score', 'Leadership Impact Factor'],
      },
      {
        id: 'sequencing-logic',
        nameHe: 'כללי סיקוונסינג',
        nameEn: 'Comorbidity Sequencing Logic',
        description: 'חוקים: ZSG לפני OLD, CLT לפני SC, ביטחון פסיכולוגי קודם ללמידה',
        relatedPathologies: ['ZSG', 'OLD', 'CLT', 'SC'],
        diagnosticQuestions: [
          'האם ניסיון לדרוש למידה (OLD) נכשל כי אין ביטחון פסיכולוגי (ZSG)?',
          'האם שינוי מבני (SC) נחסם בגלל עומס קוגניטיבי (CLT)?',
          'מהו סדר הפעולות הנכון על פי היררכיית הסיבתיות?',
        ],
        kpis: ['Sequencing Compliance (%)', 'Iatrogenic Damage Incidents'],
      },
    ],
  },
  {
    part: 7,
    nameHe: 'פרוטוקולי התערבות קלינית',
    nameEn: 'Intervention Playbooks',
    description: 'ספריית כלים ופרקטיקות לריפוי מבוססי רפואת מערכות',
    subTopics: [
      {
        id: 'just-culture',
        nameHe: 'תרבות צודקת ותחקיר מוקיר',
        nameEn: 'Just Culture & Appreciative Inquiry',
        description: 'רשת מוגנת להודאה בטעויות — ECRI + למידה מהצלחות',
        relatedPathologies: ['ZSG', 'OLD'],
        diagnosticQuestions: [
          'האם קיים מנגנון הבחנה בין טעות אנוש, התנהגות מסוכנת, ופזיזות?',
          'האם ישנו פורום Triage לדיווחי Near-Miss?',
          'האם הארגון חוקר הצלחות, לא רק כשלים?',
        ],
        kpis: ['Just Culture Adoption (%)', 'Near-Miss Forum Activity', 'AI Success Investigation Rate'],
      },
      {
        id: 'nudge-mvc',
        nameHe: 'מינון שינוי מינימלי',
        nameEn: 'Minimum Viable Change & Nudge Management',
        description: 'התערבויות 15 דקות מקסימום — כלכלה התנהגותית נגד עייפות שינוי',
        relatedPathologies: ['CLT', 'UC'],
        diagnosticQuestions: [
          'מהו ה-MED הנוכחי — מינון אפקטיבי מינימלי של התערבות?',
          'האם נעשה שימוש ב-Focus Blocks והשהיית תקשורת אסינכרונית?',
          'מהי רמת עייפות השינוי הנוכחית?',
        ],
        kpis: ['MVC Compliance (%)', 'Focus Block Hours/week', 'Change Fatigue Score (1-10)'],
      },
      {
        id: 'structural-engineering',
        nameHe: 'הנדסה ארגונית (DACI, RevOps, CoS)',
        nameEn: 'Organizational Engineering',
        description: 'פתרונות מבניים — DACI, RevOps, Chief of Staff כבולמי זעזועים',
        relatedPathologies: ['SC', 'DR'],
        diagnosticQuestions: [
          'האם קיים מודל DACI לקבלת החלטות?',
          'האם קיימת פונקציית RevOps לגישור בין מכירות, שיווק ותפעול?',
          'האם קיים Chief of Staff שפועל כבולם זעזועים מול הנהלה?',
        ],
        kpis: ['DACI Coverage (%)', 'Cross-Functional Friction Score', 'CoS Effectiveness Rating'],
      },
    ],
  },
]

// ─── Red Flags ───────────────────────────────────────────────────────────────

export type RedFlagSeverity = 'low' | 'medium' | 'critical'

export interface RedFlag {
  id: number
  nameHe: string
  nameEn: string
  severity: RedFlagSeverity
  description: string
  symptomExample: string
  relatedPathologies: ExtendedPathologyCode[]
}

export const RED_FLAGS: RedFlag[] = [
  {
    id: 1, severity: 'low',
    nameHe: 'סחיפה סמנטית וסיסמאות ריקות',
    nameEn: 'Semantic Drift & Empty Slogans',
    description: 'ערכי ליבה ונהלים מאבדים משמעות — הופכים לכלי שיווקי ציני',
    symptomExample: 'הצהרות כמו "חדשנות משבשת" או "קיימות" ללא כיסוי תפעולי',
    relatedPathologies: ['UC', 'OLD'],
  },
  {
    id: 2, severity: 'low',
    nameHe: 'ביטול תשתיות תומכות מתוך "תודעת מחסור"',
    nameEn: 'Support Infrastructure Cuts',
    description: 'קיצוץ הדרכות ורווחה כ"חיסכון" — חניקת חמצן המערכת',
    symptomExample: 'ביטול תקציבי הכשרה ורווחה למרות סימני שחיקה ברורים',
    relatedPathologies: ['DR', 'CLT'],
  },
  {
    id: 3, severity: 'low',
    nameHe: 'אשליית היררכיה שטוחה',
    nameEn: 'Flat Hierarchy Illusion',
    description: 'הימנעות משרשרת פיקוד — דיונים אינסופיים ומיקרו-ניהול',
    symptomExample: 'כל החלטה פתוחה לדיון מחודש; שיהוי החלטות כרוני',
    relatedPathologies: ['SC', 'DR'],
  },
  {
    id: 4, severity: 'medium',
    nameHe: 'תוצאות חיוביות כוזבות בסקרי eNPS',
    nameEn: 'False Positive eNPS Scores',
    description: 'סקרים מראים "הכל בסדר" אך פלטפורמות אנונימיות חושפות סטגנציה שקטה',
    symptomExample: 'eNPS גבוה בעוד ב-Blind/Reddit שיח על "מצב הישרדות"',
    relatedPathologies: ['DR', 'ZSG'],
  },
  {
    id: 5, severity: 'medium',
    nameHe: 'היעדר דיווחי Near-Miss',
    nameEn: 'Zero Near-Miss Reports',
    description: 'צוותים "נטולי בעיות" — סימן לביטחון פסיכולוגי אפסי (ZSG)',
    symptomExample: 'אפס דיווחי כמעט-תקלה — העובדים מפחדים מענישה',
    relatedPathologies: ['ZSG', 'ND'],
  },
  {
    id: 6, severity: 'medium',
    nameHe: 'למידה חד-לולאתית ותחקירים מבוססי אשמה',
    nameEn: 'Single-Loop & Blame-Based AAR',
    description: 'פוסט-מורטם = "מי פישל?" במקום שאלות יסוד',
    symptomExample: 'AAR מסתיים בהאשמות הדדיות ותיקוני טלאי',
    relatedPathologies: ['OLD', 'ZSG'],
  },
  {
    id: 7, severity: 'medium',
    nameHe: 'היפוך יחס קידוד: שכפול AI מנצח Refactoring',
    nameEn: 'AI Duplication Over Refactoring',
    description: 'צניחה בשיפור קוד לעומת עלייה בקוד מועתק — אובדן הקשר ארכיטקטוני',
    symptomExample: 'ירידה של 60% ב-Refactoring, עלייה דרמטית בקוד Copy/Paste',
    relatedPathologies: ['CLT', 'OLD'],
  },
  {
    id: 8, severity: 'critical',
    nameHe: 'נרמול סטייה כסטנדרט עבודה (NOD)',
    nameEn: 'NOD as Standard Practice',
    description: 'עקיפה שיטתית של QA — מנורמלת ומקובלת בארגון',
    symptomExample: 'התעלמות שיטתית מנורות אזהרה כדי לעמוד בדדליינים',
    relatedPathologies: ['ND'],
  },
  {
    id: 9, severity: 'critical',
    nameHe: 'זינוק בתיקוני חירום (Hotfixes)',
    nameEn: 'Exponential Hotfix Spike',
    description: 'קפיצה מ-14 ל-51 Hotfixes/1000 commits — סחיפה ארכיטקטונית',
    symptomExample: 'פריסת קוד AI ללא פיקוח → חוב טכני → תיקוני חירום יומיים',
    relatedPathologies: ['CLT', 'ND'],
  },
  {
    id: 10, severity: 'critical',
    nameHe: 'אקזיט נתפס כ"מנגנון מילוט"',
    nameEn: 'M&A as Escape Mechanism',
    description: 'עסקאות ענק נתפסות כבריחה, לא כהישג — ארגון מדמם',
    symptomExample: 'גיוס הון ענק אך העובדים מתארים זאת כ"בריחה מלחץ"',
    relatedPathologies: ['DR'],
  },
]

// ─── Sequencing Rules ────────────────────────────────────────────────────────

export interface SequencingRule {
  id: string
  condition: string
  prerequisite: ExtendedPathologyCode
  blocked: ExtendedPathologyCode
  rationale: string
  severity: 'mandatory' | 'recommended'
}

export const SEQUENCING_RULES: SequencingRule[] = [
  {
    id: 'zsg-before-old',
    condition: 'IF ZSG ≥ 2 AND OLD ≥ 2',
    prerequisite: 'ZSG',
    blocked: 'OLD',
    rationale: 'אי אפשר לדרוש למידה מטעויות (OLD) כשהעובדים מפחדים להודות בטעויות (ZSG). יש לבנות ביטחון פסיכולוגי קודם.',
    severity: 'mandatory',
  },
  {
    id: 'clt-before-sc',
    condition: 'IF CLT ≥ 2 AND SC ≥ 2',
    prerequisite: 'CLT',
    blocked: 'SC',
    rationale: 'שינוי מבני (SC) דורש קיבולת קוגניטיבית. אם CLT גבוה, הצוותים לא יצליחו לעכל שינוי מבני. יש להפחית עומס קוגניטיבי קודם.',
    severity: 'mandatory',
  },
  {
    id: 'zsg-before-nd',
    condition: 'IF ZSG ≥ 2 AND ND ≥ 2',
    prerequisite: 'ZSG',
    blocked: 'ND',
    rationale: 'פתרון נרמול סטיות (ND) דורש דיווח כנה. ללא ZSG — העובדים ימשיכו להסתיר מעקפים.',
    severity: 'mandatory',
  },
  {
    id: 'dr-before-old',
    condition: 'IF DR ≥ 3 AND OLD ≥ 2',
    prerequisite: 'DR',
    blocked: 'OLD',
    rationale: 'כשיש הדדיות מעוותת חמורה, הודאה בטעות = חולשה. יש לתקן את החוזה הפסיכולוגי לפני דרישה ללמידה.',
    severity: 'recommended',
  },
]

// ─── Anti-Fragility Protocols ────────────────────────────────────────────────

export interface AntifragilityProtocol {
  id: string
  nameHe: string
  nameEn: string
  mechanism: string
  howToExploit: string
  competitiveAdvantage: string
}

export const ANTIFRAGILITY_PROTOCOLS: AntifragilityProtocol[] = [
  {
    id: 'first-schema-advantage',
    nameHe: 'יתרון הסכמה הראשונית וקופת אגרה',
    nameEn: 'First Schema Advantage & Algorithmic Tollbooth',
    mechanism: 'הפעלת "ביקורות הפסד-מנהיג" (Loss-Leader Audits) בזמן משבר שוק לשאיבת נתונים',
    howToExploit: 'מתג את מדד החוסן כ"מגן משפטי" (Fiduciary Shield) עבור דירקטוריונים — כל עסקת M&A תדרוש אותו',
    competitiveAdvantage: 'נעילת אקולוגיה שלמה סביב סטנדרט האבחון שלך — "קופת אגרה אלגוריתמית"',
  },
  {
    id: 'shadow-absorption',
    nameHe: 'ספיגת צללים — שאיבת ידע ממתחרים קורסים',
    nameEn: 'Shadow Absorption Strategy',
    mechanism: 'ניצול Horizontal Migration — שאיבת טאלנטים מחברות קורסות ע"י הצעת בהירות מבנית ומשמעות',
    howToExploit: 'בזמן שמתחרים טובעים בעומס קוגניטיבי וקוד AI לקוי, הצע סביבה נטולת רעילות',
    competitiveAdvantage: 'גזירת "פשיטת רגל טכנולוגית" על מתחרים ע"י שאיבת הידע הסמוי שלהם',
  },
  {
    id: 'double-loop-leverage',
    nameHe: 'למידה דו-לולאתית כנשק אגרסיבי',
    nameEn: 'Double-Loop Learning as Offensive Weapon',
    mechanism: 'ניפוץ הנחות יסוד של השוק בזמן משבר + Appreciative Inquiry לשכפול הצלחות',
    howToExploit: 'במקום "מי פישל" — חקור איפה המערכת הצליחה תחת כאוס ושכפל למחלקות אחרות',
    competitiveAdvantage: 'העלאת פריון מעבר לרמה שלפני המשבר — הפיכת לחץ למנוף',
  },
]

// ─── Intervention Playbook Extensions ────────────────────────────────────────

export interface ExtendedIntervention {
  id: string
  nameHe: string
  nameEn: string
  triggerPathologies: ExtendedPathologyCode[]
  horizon: string
  steps: string[]
  leadingMetrics: string[]
  changeFatigueRisk: 'low' | 'medium' | 'high'
}

export const EXTENDED_INTERVENTIONS: ExtendedIntervention[] = [
  {
    id: 'just-culture-protocol',
    nameHe: 'פרוטוקול תרבות צודקת (ECRI)',
    nameEn: 'Just Culture Protocol',
    triggerPathologies: ['ZSG', 'OLD'],
    horizon: 'חודשים 1-3',
    steps: [
      'הכשרת מנהלים להבחנה: טעות אנוש / התנהגות מסוכנת / פזיזות',
      'הקמת פורום Triage שבועי לדיווחי Near-Miss',
      'מודלינג פגיעות מנהיגותי — הנהלה מודה בטעויות פומבית',
      'מעבר מ"מי אשם?" ל"מה נשבר במערכת?"',
    ],
    leadingMetrics: ['Near-Miss Reports ↑', 'PSI Score ↑', 'Blame Incidents ↓'],
    changeFatigueRisk: 'medium',
  },
  {
    id: 'nudge-mvc',
    nameHe: 'Nudge Management + מינון מינימלי (MVC)',
    nameEn: 'Nudge Management & Minimum Viable Change',
    triggerPathologies: ['CLT', 'UC'],
    horizon: 'חודשים 1-2',
    steps: [
      'הגדרת Focus Blocks — 90 דקות ללא הפרעות',
      'השהיית תקשורת א-סינכרונית (Async-First Policy)',
      'התערבויות מקסימום 15 דקות — MED ארגוני',
      'Nudge דיגיטלי: דחיפות עדינות בממשקי עבודה',
    ],
    leadingMetrics: ['Context Switches ↓', 'Deep Work Hours ↑', 'Change Fatigue Score ↓'],
    changeFatigueRisk: 'low',
  },
  {
    id: 'daci-revops',
    nameHe: 'הנדסת ארגון — DACI + RevOps + Chief of Staff',
    nameEn: 'Organizational Engineering (DACI/RevOps/CoS)',
    triggerPathologies: ['SC', 'DR'],
    horizon: 'חודשים 2-6',
    steps: [
      'מיפוי והטמעת מודל DACI — Driver, Approver, Contributor, Informed',
      'הקמת RevOps לגישור בין מכירות-שיווק-תפעול',
      'מינוי Chief of Staff כ"בולם זעזועים" מול יזמים',
      'הגדרת Decision Rights + SLA לכל סוג החלטה',
    ],
    leadingMetrics: ['Decision Latency ↓', 'Cross-Dept Friction ↓', 'Escalation Rate ↓'],
    changeFatigueRisk: 'high',
  },
  {
    id: 'cascade-halt',
    nameHe: 'פרוטוקול עצירת קסקדה',
    nameEn: 'Cascade State Halt Protocol',
    triggerPathologies: ['DR', 'ND', 'UC', 'SC', 'ZSG', 'CLT', 'OLD'],
    horizon: 'מיידי (0-7 ימים)',
    steps: [
      'עצירת כל היוזמות הארגוניות (Organizational Halt)',
      'טריאז\' חירום — זיהוי הפתולוגיה הדומיננטית',
      'הפעלת Sprint חוסם עורקים על הציר הקריטי ביותר',
      'בניית תוכנית Sequencing לפי חוקי הקומורבידיות',
    ],
    leadingMetrics: ['System Paralysis Index ↓', 'Halt Duration (days)', 'Recovery Trajectory'],
    changeFatigueRisk: 'high',
  },
]
