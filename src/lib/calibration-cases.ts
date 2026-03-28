/**
 * Calibration Case Library — public crisis-recovery cases mapped to COR-SYS framework axes.
 *
 * Every claim links to a verifiable public source (Reuters, BBC, NPR, Wikipedia, SEC filings, etc.).
 * Cases are used as illustrative pattern matches, NOT causal proof that the system predicted anything.
 *
 * Source PDFs: two LLM-generated research reports reviewed & edited for factual grounding.
 */

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface CaseSource {
  label: string
  url: string
  type: 'reuters' | 'sec' | 'wikipedia' | 'news' | 'academic' | 'unverified'
  accessDate?: string
}

export type FrameworkAxis =
  | 'decision_load'
  | 'cross_functional_friction'
  | 'semantic_drift'
  | 'systemic_resilience'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface OsintSignal {
  window: 'T-90' | 'T-60' | 'T-30'
  signal: string
  confidence: ConfidenceLevel
  caveat: string
  source?: CaseSource
}

export interface CalibrationCase {
  id: string
  company: string
  period: string
  industry: string
  country: string
  crisis: string
  steps: string[]
  frameworkFit: {
    before: Record<FrameworkAxis, string>
    after: Record<FrameworkAxis, string>
  }
  kpis: string[]
  osint: OsintSignal[]
  falsePositiveNote: string
  sources: CaseSource[]
}

// ─── PDF 1 Cases (Peloton / Netflix 2022 / WeWork / Southwest) ──────────────

const peloton: CalibrationCase = {
  id: 'peloton-2022',
  company: 'Peloton Interactive',
  period: '2022–2024',
  industry: 'צריכה / כושר',
  country: 'US',
  crisis: 'ירידה חדה בביקוש לאחר פאנדמיה, עודפי מלאי, עלויות עולות ולחץ על המאזן.',
  steps: [
    'מינוי מנכ"ל חדש ותוכנית Restructuring',
    'יעד חיסכון שנתי של כ-800 מיליון דולר',
    'יציאה מלאה מייצור עצמי, מעבר לשותפים חיצוניים, קיצוץ ~570 משרות',
    'העלאת מחירים, הרחבת הפצה דרך Amazon',
  ],
  frameworkFit: {
    before: {
      decision_load: 'עומס החלטות סביב חיזוי ביקוש, קצב ייצור, ואספקה',
      cross_functional_friction: 'חיכוך בין תפעול, שרשרת אספקה ומסחור',
      semantic_drift: '',
      systemic_resilience: 'פגיעות בחוסן התזרימי',
    },
    after: {
      decision_load: 'מעבר ל-outsourcing הפחית מורכבות תפעולית',
      cross_functional_friction: 'קיצוץ שכבות עלות והנהגה חדשה',
      semantic_drift: '',
      systemic_resilience: 'שליטה מחודשת על תזרים, הפחתת burn',
    },
  },
  kpis: ['Free Cash Flow', 'Cash Burn Rate', 'היקף חיסכון שנתי', 'הפסד רבעוני'],
  osint: [
    {
      window: 'T-90',
      signal: 'לא אותר מקור פומבי ספציפי בחלון זה',
      confidence: 'low',
      caveat: 'פומבי מקור חסר',
    },
    {
      window: 'T-60',
      signal: 'הודעה על יציאה מייצור עצמי, מעבר לשותפים, קיצוץ ~570 משרות',
      confidence: 'high',
      caveat: 'שינוי מבני עמוק, קשר ישיר לעלות ולגמישות תפעולית',
      source: {
        label: 'Reuters — Peloton exits in-house manufacturing',
        url: 'https://www.reuters.com/technology/peloton-exits-in-house-manufacturing-operations-2022-07-12/',
        type: 'reuters',
        accessDate: '2022-07-12',
      },
    },
    {
      window: 'T-30',
      signal: 'תחזית קודרת, ~415 מיליון דולר charges, הפסד נקי של 1.24 מיליארד דולר',
      confidence: 'high',
      caveat: 'אות חזק — משלב עלות שינוי וגודל הפסד, מסמן turnaround עמוק',
      source: {
        label: 'Reuters — Peloton bleak forecast',
        url: 'https://www.reuters.com/article/technology/peloton-slides-as-bleak-forecast-douses-hopes-of-quick-turnaround-idUSNIKBN2PV0UV/',
        type: 'reuters',
        accessDate: '2022-08-24',
      },
    },
  ],
  falsePositiveNote:
    'יציאה מייצור עצמי ו-charges חד-פעמיים יכולים להיות גם מהלך יזום של רה-ארגון ולא בהכרח כשל בלתי הפיך.',
  sources: [
    { label: 'Reuters — Peloton pause production', url: 'https://www.reuters.com/business/retail-consumer/peloton-pause-production-bikes-treadmills-demand-wanes-cnbc-2022-01-20/', type: 'reuters' },
    { label: 'Reuters — Peloton exits in-house manufacturing', url: 'https://www.reuters.com/technology/peloton-exits-in-house-manufacturing-operations-2022-07-12/', type: 'reuters' },
    { label: 'Reuters — Peloton bleak forecast', url: 'https://www.reuters.com/article/technology/peloton-slides-as-bleak-forecast-douses-hopes-of-quick-turnaround-idUSNIKBN2PV0UV/', type: 'reuters' },
    { label: 'Reuters — Peloton co-founders leave', url: 'https://jp.reuters.com/article/business/two-peloton-co-founders-leave-amid-massive-restructuring-idUSKBN2QD1S4/', type: 'reuters' },
  ],
}

const netflix2022: CalibrationCase = {
  id: 'netflix-2022',
  company: 'Netflix',
  period: '2022–2023',
  industry: 'מדיה / סטרימינג',
  country: 'US',
  crisis: 'ירידה של 200 אלף מנויים ברבעון הראשון (לעומת תחזית של +2.5 מיליון), נפילת מניה של 26%.',
  steps: [
    'אותתה על שכבה זולה נתמכת-פרסום (Ad Tier)',
    'ניתחה את ההאטה — תחרות, שיתוף סיסמאות, כלכלה חלשה',
    'השיקה Paid Sharing והעברת פרופיל',
    'פריסת Ad Tier ו-Paid Sharing בשווקים מרובים',
  ],
  frameworkFit: {
    before: {
      decision_load: '',
      cross_functional_friction: 'חיכוך בין מוצר, תמחור, פרסום וצמיחה',
      semantic_drift: 'סחיפה סמנטית סביב ההגדרה "מהו household" — שימוש משותף לעומת משלם',
      systemic_resilience: '',
    },
    after: {
      decision_load: '',
      cross_functional_friction: 'Ad Tier + Paid Sharing + Profile Transfer יישרו שפה עסקית',
      semantic_drift: 'מדידה מחודשת של ערך משתמש, יישור שפה עסקית',
      systemic_resilience: '',
    },
  },
  kpis: ['מנויים-נטו לרבעון', 'תחזית לרבעון הבא', 'הכנסות'],
  osint: [
    {
      window: 'T-90',
      signal: 'אובדן 200 אלף מנויים ברבעון הראשון — שבירת KPI מרכזי',
      confidence: 'high',
      caveat: 'אות ישיר מהחברה, שבירה של KPI צמיחה מרכזי',
      source: {
        label: 'Reuters — Netflix subscribers fall',
        url: 'https://www.reuters.com/technology/netflix-subscribers-fall-first-time-decade-forecasts-more-losses-2022-04-19/',
        type: 'reuters',
        accessDate: '2022-04-20',
      },
    },
    {
      window: 'T-60',
      signal: 'תביעת בעלי מניות על disclosure סביב ירידת מנויים',
      confidence: 'medium',
      caveat: 'תביעה ציבורית מגדילה תשומת לב אך אינה הוכחה להחמרה תפעולית',
      source: {
        label: 'Reuters — Netflix shareholders sue',
        url: 'https://www.reuters.com/legal/government/netflix-shareholders-sue-over-subscription-slump-disclosures-2022-05-04/',
        type: 'reuters',
        accessDate: '2022-05-04',
      },
    },
    {
      window: 'T-30',
      signal: 'דיווח פומבי על כוונה ל-Ad Tier וגביית Password Sharing עוד ב-2022',
      confidence: 'medium',
      caveat: 'מבוסס על דיווח תקשורתי על מסר פנימי, לא filing רשמי',
      source: {
        label: 'Engadget — Netflix ad-supported plan',
        url: 'https://www.engadget.com/netflix-ad-supported-plan-password-sharing-charge-2022-160931971.html',
        type: 'news',
      },
    },
  ],
  falsePositiveNote:
    'צעדי תמחור ואריזה (Ad Tier, Paid Sharing) יכולים להיות שדרוג מודל עסקי רגיל, לא רק תגובת מצוקה. רק בשילוב שבירת KPI מנויים הם הופכים לאות משברי חזק יותר.',
  sources: [
    { label: 'Reuters — Netflix subscribers fall', url: 'https://www.reuters.com/technology/netflix-subscribers-fall-first-time-decade-forecasts-more-losses-2022-04-19/', type: 'reuters' },
    { label: 'Reuters — Netflix loses nearly 1M subscribers', url: 'https://www.reuters.com/business/media-telecom/netflix-loses-nearly-1-million-subscribers-forecast-misses-street-estimates-2022-07-19/', type: 'reuters' },
    { label: 'Reuters — Netflix shareholders sue', url: 'https://www.reuters.com/legal/government/netflix-shareholders-sue-over-subscription-slump-disclosures-2022-05-04/', type: 'reuters' },
    { label: 'Engadget — Netflix ad-supported plan', url: 'https://www.engadget.com/netflix-ad-supported-plan-password-sharing-charge-2022-160931971.html', type: 'news' },
    { label: 'Time — Netflix password sharing crackdown', url: 'https://time.com/6223415/netflix-password-sharing-crackdown/', type: 'news' },
    { label: 'StreamTV Insider — password sharing catalyzes ad tier', url: 'https://www.streamtvinsider.com/video/netflix-us-password-sharing-crackdown-catalyzes-ad-tier-growth-could-net-11b-2024', type: 'news' },
  ],
}

const wework: CalibrationCase = {
  id: 'wework-2023',
  company: 'WeWork',
  period: '2023–2024',
  industry: 'נדל"ן / חללי עבודה',
  country: 'US',
  crisis: 'פשיטת רגל (Chapter 11) לאחר שנים של הפסדים, עלויות שכירות גבוהות ופגיעה בביקוש בעידן העבודה מרחוק.',
  steps: [
    '92% מהמלווים הסכימו להמיר חוב מובטח להון — מחיקת כ-3 מיליארד דולר חוב',
    'משא ומתן להפחתת שכירות: הפחתה של מעל 40% מהתחייבויות',
    'ביטול חוזים בכשליש מהאתרים, הפחתת התחייבויות שכירות עתידיות מעל 12 מיליארד דולר',
    'העברת בעלות ללווים, פרישת המנכ"ל לאחר היציאה מההליך',
  ],
  frameworkFit: {
    before: {
      decision_load: '',
      cross_functional_friction: 'חיכוך חריף בין תפוסה/מכירות לבין התחייבויות נדל"ן קשיחות',
      semantic_drift: '',
      systemic_resilience: 'חולשה בחוסן המערכתי — מבנה עלויות קבוע נוכח ביקוש משתנה',
    },
    after: {
      decision_load: '',
      cross_functional_friction: 'קיטום פורטפוליו הפחית חיכוך בין התחייבויות להכנסות',
      semantic_drift: '',
      systemic_resilience: 'המרת חוב להון וצמצום שכירות הרחיבו runway',
    },
  },
  kpis: ['יחס הוצאות שכירות / הכנסות (74% ב-Q2 2023)', 'היקף מחיקת חוב', 'היקף הפחתת שכירות'],
  osint: [
    {
      window: 'T-90',
      signal: 'דוחות האחרונים הראו שהוצאות שכירות עמדו על 74% מההכנסות',
      confidence: 'high',
      caveat: 'אות פיננסי ישיר, קשה ומבני — מצביע על לחץ קבוע בעסק',
    },
    {
      window: 'T-60',
      signal: 'לא אותר מקור פומבי ספציפי בחלון זה',
      confidence: 'low',
      caveat: 'פומבי מקור חסר',
    },
    {
      window: 'T-30',
      signal: 'לא אותר מקור פומבי ספציפי בחלון זה',
      confidence: 'low',
      caveat: 'פומבי מקור חסר',
    },
  ],
  falsePositiveNote:
    'גם יחס הכנסות/שכירות קיצוני וירידת מניה אינם מאפשרים לנבא בדיוק את תאריך ההליך המשפטי. הם כן מתאימים לדפוס של פגיעות מבנית וחוסר גמישות.',
  sources: [
    { label: 'Reuters — WeWork files for bankruptcy', url: 'https://www.reuters.com/business/softbanks-wework-once-most-valuable-us-startup-succumbs-bankruptcy-2023-11-07/', type: 'reuters' },
    { label: 'Reuters — WeWork landlord objections resolved', url: 'https://www.reuters.com/business/wework-resolves-landlord-objections-bankruptcy-financing-2023-12-11/', type: 'reuters' },
    { label: 'Reuters — WeWork targets Chapter 11 exit', url: 'https://www.reuters.com/business/wework-targets-chapter-11-exit-us-canada-by-may-31-2024-04-02/', type: 'reuters' },
    { label: 'Reuters — WeWork cleared to exit bankruptcy', url: 'https://www.reuters.com/legal/wework-cleared-exit-bankruptcy-slash-4-billion-debt-court-says-2024-05-30/', type: 'reuters' },
    { label: 'Reuters — WeWork CEO steps down', url: 'https://www.reuters.com/business/wework-ceo-tolley-step-down-company-exits-bankruptcy-2024-06-11/', type: 'reuters' },
  ],
}

const southwest: CalibrationCase = {
  id: 'southwest-2022',
  company: 'Southwest Airlines',
  period: '2022–2025',
  industry: 'תעופה',
  country: 'US',
  crisis: 'קריסה תפעולית בסוף 2022 — ביטול כמעט 16 אלף טיסות. האיגוד והסנאטורים ייחסו חלק מרכזי מהבעיה להכנה לא מספקת ומערכות crew scheduling מיושנות.',
  steps: [
    'החברה הודיעה על בדיקה מקיפה של הכשל',
    'המנכ"ל לקח אחריות פומבית והתחייב למנוע הישנות',
    'הסדר רגולטורי: קנס 35 מיליון דולר + הקצאת 90 מיליון דולר ב-vouchers',
    'שינויי מוצר/מסחור (מושבים מסומנים, כבודה בתשלום) ויעד חיסכון מעל מיליארד דולר עד 2027',
  ],
  frameworkFit: {
    before: {
      decision_load: '',
      cross_functional_friction: 'חיכוך בין תכנון, crew ops ושירות ללקוח תחת עומס',
      semantic_drift: '',
      systemic_resilience: 'חוסן מערכתי חלש — מערכות תזמון מיושנות',
    },
    after: {
      decision_load: '',
      cross_functional_friction: 'review, פיצוי ושינויי מודל עלות/מסחרי כניסיון לצמצם שבירה',
      semantic_drift: '',
      systemic_resilience: 'ניסיון למימון מחדש של חוסן ולצמצום נקודות שבירה',
    },
  },
  kpis: ['היקף ביטולים', 'גובה ההסדר הרגולטורי', 'יעדי Cost Reduction / EBIT'],
  osint: [
    {
      window: 'T-90',
      signal: 'לא אותר מקור פומבי ספציפי בחלון זה',
      confidence: 'low',
      caveat: 'פומבי מקור חסר',
    },
    {
      window: 'T-60',
      signal: 'לא אותר מקור פומבי ספציפי בחלון זה',
      confidence: 'low',
      caveat: 'פומבי מקור חסר',
    },
    {
      window: 'T-30',
      signal: 'מזכר פומבי מדנבר על "state of operational emergency" בשל מספר חריג של היעדרויות',
      confidence: 'medium',
      caveat: 'אות קרוב לאירוע, אך נקודתי-תחנתי. לא מוכיח לבדו קריסה מערכתית ארצית.',
    },
  ],
  falsePositiveNote:
    'מזכר תפעולי יחיד או even warning של איגוד אינם בהכרח מוכיחים meltdown מערכתי. בלי הקשר רחב, הם עלולים ליצור false positive, במיוחד בענף רגיש למזג אוויר ולעונתיות.',
  sources: [
    { label: 'Reuters — Southwest review after crisis', url: 'https://www.reuters.com/business/aerospace-defense/southwest-has-no-solutions-recent-debacle-faces-up-1-bln-revenue-hit-union-2023-01-05/', type: 'reuters' },
    { label: 'Reuters — Southwest pilot union vs causes', url: 'https://www.reuters.com/business/aerospace-defense/southwest-pilot-union-differ-over-causes-holiday-meltdown-2023-02-09/', type: 'reuters' },
    { label: 'Wikipedia — 2022 Southwest scheduling crisis', url: 'https://en.wikipedia.org/wiki/2022_Southwest_Airlines_scheduling_crisis', type: 'wikipedia' },
    { label: 'Reuters — Southwest paid baggage shift', url: 'https://www.reuters.com/business/aerospace-defense/southwest-airlines-shifts-paid-baggage-policy-lift-earnings-2025-03-11/', type: 'reuters' },
    { label: 'Reuters — Southwest profit pressure revamp', url: 'https://www.reuters.com/business/aerospace-defense/southwest-airs-lackluster-profit-fuels-pressure-revamp-business-model-2024-09-25/', type: 'reuters' },
  ],
}

// ─── PDF 2 Cases (Boeing / Netflix-Qwikster / Teva / Nokia) ─────────────────

const boeing: CalibrationCase = {
  id: 'boeing-737max',
  company: 'Boeing',
  period: '2018–2024',
  industry: 'תעופה / ייצור',
  country: 'US',
  crisis: 'שתי תאונות קטלניות של 737 MAX (Lion Air 10/2018, Ethiopian 3/2019) הביאו להקרקעה גלובלית ומשבר אמון חריף.',
  steps: [
    'עצירת ייצור 737 MAX (ינואר 2020)',
    'הקמת ועדת בטיחות קבועה בדירקטוריון (2019)',
    'שינויי הנהלה בכירה — הדחת ראש חטיבה ומנכ"ל (2019)',
    'התחייבות להשקעות מוגברות בציות ובטיחות בפיקוח מוניטור חיצוני',
    'רכישת Spirit AeroSystems לשליטה באיכות אספקה (2024–2025)',
  ],
  frameworkFit: {
    before: {
      decision_load: 'עומס החלטות סביב תכנון MCAS — אישור והטמעה בלי הכרה מלאה במשמעות הבטיחותית',
      cross_functional_friction: 'חיכוך נמוך מדי: מהנדסים, רגולטורים ויחידות מסחריות לא יצרו התנגדות מספקת ל-time-to-market',
      semantic_drift: 'הצגת 737 MAX כ"בטוח כמו שאר משפחת 737" — סחיפה סמנטית סביב המשמעות של "בטיחות"',
      systemic_resilience: 'הסתמכות גבוהה על מוצר יחיד (737 MAX) ולחצים להימנע מעיכובים',
    },
    after: {
      decision_load: 'עצירת ייצור + ועדת בטיחות יצרו "צוואר בקבוק" שקוף סביב החלטות בטיחות קריטיות',
      cross_functional_friction: 'שינויי הנהלה ומוניטור חיצוני הגבירו חיכוך בין-פונקציונלי בנקודות הכרעה',
      semantic_drift: 'ניסוח מחודש של מחויבות לבטיחות בהסדרים ובתקשורת',
      systemic_resilience: 'איחוד שרשרת אספקה (Spirit AeroSystems) לצמצום נקודות כשל יחיד',
    },
  },
  kpis: ['היקף הפסדים כספיים', 'חזרת 737 MAX לטיסות מסחריות', 'עמידה בתנאי הסכמים רגולטוריים'],
  osint: [
    {
      window: 'T-90',
      signal: 'המשך חקירות עומק לתאונת Lion Air, כתבות ודיונים רגולטוריים על MCAS',
      confidence: 'medium',
      caveat: 'כתבות קיימות אך ללא הודעה חד-משמעית על משבר מערכתי',
    },
    {
      window: 'T-60',
      signal: 'דיונים רגולטוריים והנחיות זמניות לחברות תעופה',
      confidence: 'medium',
      caveat: 'אותות בטיחות שנמשכות — עדיין ברמת "אירוע ספציפי"',
    },
    {
      window: 'T-30',
      signal: 'סיקור גובר של דאגות טייסים וארגוני עובדים ביחס ל-MAX',
      confidence: 'low',
      caveat: 'חלק מהפרסומים הסתמכו על מקורות אנונימיים, לא הכרה פומבית',
    },
  ],
  falsePositiveNote:
    'אותות בטיחות בתעשיית התעופה מופיעים לא מעט, ורובם אינם מתפתחים למשבר עסקי/תדמיתי רב-שנתי. הסקה כזו הייתה גבוהה מדי ברמת הביטחון וקרובה ל-false positive.',
  sources: [
    { label: 'Wikipedia — Boeing 737 MAX groundings', url: 'https://en.wikipedia.org/wiki/Boeing_737_MAX_groundings', type: 'wikipedia' },
    { label: 'Yahoo Finance — Timeline of Boeing 737 MAX', url: 'https://finance.yahoo.com/news/timeline-boeings-ongoing-737-max-215206237.html', type: 'news' },
    { label: 'BBC — Boeing safety', url: 'https://www.bbc.com/news/articles/c4gxvkq109ko', type: 'news' },
    { label: 'Harvard Law — Boeing 737 MAX', url: 'https://corpgov.law.harvard.edu/2024/06/06/boeing-737-max/', type: 'academic' },
  ],
}

const netflixQwikster: CalibrationCase = {
  id: 'netflix-qwikster-2011',
  company: 'Netflix',
  period: '2011',
  industry: 'מדיה / סטרימינג',
  country: 'US',
  crisis: 'העלאת מחירים של עד 60% ללקוחות DVD+Streaming, הפרדת שירות ה-DVD למותג Qwikster — בלבול, כעס, ואובדן כ-800 אלף מנויים.',
  steps: [
    'ביטול תוכנית Qwikster לאחר תגובה קשה',
    'התנצלות פומבית של המנכ"ל (ריד הייסטינגס)',
    'מיקוד מחודש ב-Streaming עם השקעה כבדה בתוכן מקורי',
    'שיקום מותג — שיפור מדדי מוניטין (Harris Poll)',
  ],
  frameworkFit: {
    before: {
      decision_load: 'מהלך חד של שינוי מחירים והפרדת שירותים ללא בדיקה הדרגתית של תגובת השוק',
      cross_functional_friction: 'חוסר יישור בין שיווק, מוצר, שירות לקוחות ופיננסים — בלבול במסר ובתמחור',
      semantic_drift: 'שינוי מהיר במשמעות המותג "Netflix" — מבית לכל השירותים למותג חלקי',
      systemic_resilience: 'תלות גוברת ב-Streaming עם תמחור שנתפס ככפוי',
    },
    after: {
      decision_load: 'ביטול Qwikster — חזרה למבנה מוצר ברור יותר, הפחתת עומס החלטות',
      cross_functional_friction: 'הפחתת חיכוך בין ערוצי שירות ותמחור',
      semantic_drift: 'התנצלות פומבית ותיקון כיוון — יישור מחדש של "לקוח במרכז"',
      systemic_resilience: 'מיקוד ב-Streaming והרחבת ספריית התוכן לבניית אקו-סיסטם',
    },
  },
  kpis: ['מספר מנויים (אובדן 800K ב-Q3 2011, חזרה לצמיחה)', 'מדדי מוניטין (Harris Poll)', 'מחיר מניה'],
  osint: [
    {
      window: 'T-90',
      signal: 'רמיזות בראיונות הנהלה על שינוי מודל תמחור לטובת Streaming',
      confidence: 'low',
      caveat: 'ראיונות הנהלה על דגש ב-Streaming אינם סימן למשבר כשלעצמם',
    },
    {
      window: 'T-60',
      signal: 'הודעת העלאת מחירים משמעותית (עד 60%) לצרכנים',
      confidence: 'high',
      caveat: 'מסר חד וציבורי — מעיד על סיכון גבוה לשחיקה במוניטין ובמנויים',
    },
    {
      window: 'T-30',
      signal: 'תגובות שליליות ברשתות, כתבות ביקורת בתקשורת',
      confidence: 'medium',
      caveat: 'ניתן למדוד sentiment, אך קשה לאמוד את עוצמת הפגיעה העתידית',
    },
  ],
  falsePositiveNote:
    'מחאות צרכנים סביב שינויי תמחור מתרחשות בתדירות גבוהה ורבות מהן מתפוגגות. הסקה חד-משמעית לפגיעה ארוכת טווח הייתה הטיה רטרוספקטיבית.',
  sources: [
    { label: 'NPR — Netflix kills Qwikster', url: 'https://www.npr.org/sections/thetwo-way/2011/10/10/141209082/netflix-kills-qwikster-price-hike-lives-on', type: 'news' },
    { label: 'Motley Fool — How Netflix recovered from Qwikster', url: 'https://www.fool.com/investing/general/2014/03/27/how-netflix-recovered-from-the-qwikster-debacle-an.aspx', type: 'news' },
  ],
}

const teva: CalibrationCase = {
  id: 'teva-2017',
  company: 'Teva Pharmaceutical Industries',
  period: '2017–2019',
  industry: 'פרמצבטיקה',
  country: 'IL',
  crisis: 'משבר חוב חריף לאחר רכישת חטיבת הגנריקה של Allergan ב-40+ מיליארד דולר, ירידת דירוג אשראי, תביעות אופיאטים.',
  steps: [
    'תוכנית התייעלות דו-שנתית: קיצוץ 3 מיליארד דולר בהוצאות עד סוף 2019',
    'קיצוץ ~25% מכוח-האדם (14,000 עובדים), סגירת מפעלים ומרכזי מו"פ',
    'מינוי מנכ"ל חדש (Kåre Schultz) ושינוי מבנה ארגוני',
    'השעיית דיבידנד, מכירת נכסים לא-ליבתיים, המשך הפחתת חוב',
  ],
  frameworkFit: {
    before: {
      decision_load: 'עומס החלטות סביב אינטגרציית Allergan, ניהול פורטפוליו רחב מאוד, איזון בין גנריקה לייחודיות',
      cross_functional_friction: 'חיכוך בין מו"פ, תפעול, שיווק ופיננסים — הצורך לקצץ וגם לשמר פיתוחים',
      semantic_drift: 'סחיפה סביב תפיסת "ענק גלובלית בלתי ניתנת לערעור" מול מציאות של חוב גבוה ותביעות',
      systemic_resilience: 'חוסן נמוך — מינוף גבוה, תלות בשווקים רגישים למחירים, לחץ רגולטורי',
    },
    after: {
      decision_load: 'קיצוץ 25% והתמקדות בנכסי ליבה הורידו עומס החלטות ותעדפו צירי פעילות',
      cross_functional_friction: 'מבנה ארגוני חדש תחת מנכ"ל אחר אפשר יישור יותר טוב בין יחידות',
      semantic_drift: 'השעיית דיבידנד ומשמעת הון שידרו "חברה בשיקום" במקום "חברת צמיחה אינסופית"',
      systemic_resilience: 'חיזוק חוסן מערכתי דרך פירעון חוב וחיזוק תזרים',
    },
  },
  kpis: ['יעד חיסכון שנתי: 3 מיליארד דולר', 'היקף צמצום כוח-אדם (14,000)', 'ירידה מצטברת בחוב (26.9 מיליארד ברבעון מסוים)'],
  osint: [
    {
      window: 'T-90',
      signal: 'דיווחים על החוב המנופח מרכישת Allergan generics, לחץ על תזרים, ירידת דירוגים',
      confidence: 'high',
      caveat: 'נתונים בדוחות ובכתבות על חוב גבוה וירידת דירוגים — אות מבני',
    },
    {
      window: 'T-60',
      signal: 'ירידה חדה בשווי המניה, דיבורים על שינוי הנהלה אפשרי',
      confidence: 'medium',
      caveat: 'ירידת מניה שכיחה בענף, אך בשילוב עומס החוב יצרה אות חזק יותר',
    },
    {
      window: 'T-30',
      signal: 'מינוי מנכ"ל חדש (Kåre Schultz) והודעות על "בחינה אסטרטגית"',
      confidence: 'high',
      caveat: 'שינוי הנהלה בי-זמני עם חוב כבד — מעיד על מהלך עומק קרב',
    },
  ],
  falsePositiveNote:
    'אותות חוב והנהלה היו ברורים, אך OSINT לא יכול היה להכריז בדיוק על סדר גודל של 25% קיצוץ או 3 מיליארד חיסכון. הצביע על "לחץ גבוה" אך לא על צורת הפתרון הקונקרטית.',
  sources: [
    { label: 'Business Standard — Teva cuts workforce, suspends dividend', url: 'https://www.business-standard.com/article/international/teva-pharma-to-cut-quarter-of-workforce-suspends-dividend-to-pay-off-debts-117121401179_1.html', type: 'news' },
    { label: 'DCAT — Teva 25% workforce reduction', url: 'https://www.dcatvci.org/top-industry-news/teva-announces-25-reduction-in-global-workforce-further-restructuring/', type: 'news' },
    { label: 'Yahoo Finance — Teva earnings', url: 'https://finance.yahoo.com/news/1-teva-pharm-nudges-earnings-131206275.html', type: 'news' },
    { label: 'European Pharmaceutical Review — Teva cost reduction', url: 'https://www.europeanpharmaceuticalreview.com/news/22041/teva-accelerates-cost-reduction-program/', type: 'news' },
  ],
}

const nokia: CalibrationCase = {
  id: 'nokia-2007',
  company: 'Nokia',
  period: '2007–2013',
  industry: 'טלקום / מובייל',
  country: 'FI',
  crisis: 'איבוד ההובלה בשוק הסמארטפונים עם עליית iPhone ו-Android — ירידה מ-49% נתח שוק ל-25%. אסטרטגיות ההפעלה (Symbian, MeeGo) לא הצליחו להתחרות.',
  steps: [
    'מעבר מאסיבי ל-Windows Phone, נטישת MeeGo (2011)',
    'קיצוצים נרחבים — פיטורי אלפי עובדים (10,000 ב-2012)',
    'סגירת מפעלים, העברת ייצור לסין/הודו',
    'מכירת חטיבת המובייל למיקרוסופט (2013)',
  ],
  frameworkFit: {
    before: {
      decision_load: 'עומס החלטות טכנולוגי גבוה (Symbian / MeeGo / Android / Windows Phone), הכרעה לא בזמן',
      cross_functional_friction: 'פערים בין הנהלה, פיתוח והנדסה — קשיים לשלב אסטרטגיית עלות עם בידול',
      semantic_drift: 'פער בין נרטיב "מובילת שוק" לבין מציאות תחרותית שבה מערכות הפעלה של מתחרים מכתיבות כללי משחק',
      systemic_resilience: 'תלות גבוהה בעסקי המובייל — שקיעתם הובילה לנסיגה כלכלית רחבה',
    },
    after: {
      decision_load: 'בחירה חד-משמעית ב-Windows Phone הפחיתה עומס, אם כי מאוחר ובאופציה לא אטרקטיבית',
      cross_functional_friction: 'קיצוצים שיפרו את הגמישות הפיננסית אך פגעו בקיבולת ובמורל',
      semantic_drift: '',
      systemic_resilience: 'מכירת החטיבה למיקרוסופט = שחזור חוסן חברת האם על חשבון ויתור על הליבה',
    },
  },
  kpis: ['נתח שוק סמארטפונים (49% → 25% ומטה)', 'הכנסות ורווחיות חטיבת המובייל', 'מספר מועסקים'],
  osint: [
    {
      window: 'T-90',
      signal: 'דוחות שוק מראים שחיקה בנתח שוק מול iPhone/Android',
      confidence: 'high',
      caveat: 'נתוני נתח שוק ורווחיות בחטיבה מצביעים על ירידה מואצת',
    },
    {
      window: 'T-60',
      signal: 'כתבות פרשנות על הצורך לשנות כיוון, שמועות על Android/Windows',
      confidence: 'medium',
      caveat: 'ניתוחי אנליסטים — ללא החלטה רשמית',
    },
    {
      window: 'T-30',
      signal: 'הדלפות ודיונים על "burning platform" ותזוזה למערכת הפעלה אחרת',
      confidence: 'medium',
      caveat: 'נאום "Burning Platform" המפורסם של אלופ צוטט רבות, אך חלקו הופץ בדיעבד',
      source: {
        label: 'INSEAD — Strategic decisions that caused Nokia\'s failure',
        url: 'https://knowledge.insead.edu/strategy/strategic-decisions-caused-nokias-failure',
        type: 'academic',
      },
    },
  ],
  falsePositiveNote:
    'עם ירידת נתח שוק וביקורת על Symbian, היה קשה להכריז מראש שהחברה תבחר דווקא ב-Windows Phone (ולא Android) ושזה יוביל למכירת החטיבה. OSINT מאפשר לזהות "ארגון על פלטפורמה בוערת" — לא את הבחירה הטקטית.',
  sources: [
    { label: 'INSEAD — Strategic decisions & Nokia\'s failure', url: 'https://knowledge.insead.edu/strategy/strategic-decisions-caused-nokias-failure', type: 'academic' },
    { label: 'SCIRP — Rise and Fall of Nokia', url: 'https://www.scirp.org/journal/paperinformation?paperid=60597', type: 'academic' },
  ],
}

// ─── Exports ────────────────────────────────────────────────────────────────────

export const CALIBRATION_CASES: CalibrationCase[] = [
  peloton,
  netflix2022,
  wework,
  southwest,
  boeing,
  netflixQwikster,
  teva,
  nokia,
]

/**
 * Return only cases with at least one Reuters/SEC/Wikipedia primary source.
 * These are the safest for customer-facing use.
 */
export function getStrongestCases(): CalibrationCase[] {
  return CALIBRATION_CASES.filter((c) =>
    c.sources.some((s) => s.type === 'reuters' || s.type === 'sec' || s.type === 'wikipedia'),
  )
}

export function getCaseById(id: string): CalibrationCase | undefined {
  return CALIBRATION_CASES.find((c) => c.id === id)
}
