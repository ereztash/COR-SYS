# COR-SYS — מפת דרך למוצר
## משימות לפי סדר דחיפות + גישת מימוש + זמן Claude Code

---

## שיטת הערכה

| סמל | משמעות |
|-----|---------|
| 🔴 **P0** | חוסם — האפליקציה לא ניתנת לשימוש בלעדיו |
| 🟠 **P1** | קריטי — פגיעה חמורה ביכולת למכור/לספק |
| 🟡 **P2** | חשוב — שיפור משמעותי לחוויה |
| 🟢 **P3** | ניס-טו-האב — ערך עסקי עתידי |

**זמן Claude Code** = כולל קריאת קוד + כתיבה + טסטים. לא כולל הגדרות חיצוניות (Supabase dashboard, Stripe account וכו׳).

---

## 🔴 P0 — חוסמים (בלי אלה אי אפשר לתת גישה לאף אחד)

---

### P0-1 · Authentication + Protected Routes

**מה:** Login/logout + proxy (`src/proxy.ts`) שמגן על כל הנתיבים. כרגע כל אחד עם ה-URL יכול לראות ולשנות כל נתון.

**גישת מימוש:**
1. **Supabase Email Auth** — הכי מהיר למימוש, מובנה ב-`@supabase/ssr` שכבר מותקן
2. `src/app/login/page.tsx` — טופס email + password, server action שקורא `supabase.auth.signInWithPassword()`
3. `src/proxy.ts` — `createServerClient` בודק session, מפנה ל-`/login` אם אין. מגן על כל נתיבים פרט ל-`/login` (Next.js 16: convention של proxy במקום middleware)
4. Logout כפתור ב-sidebar → `supabase.auth.signOut()`
5. אין צורך ב-multi-tenant עדיין — user אחד (אתה), RLS כרגע מותרת לכולם

**קבצים שייגעו:** `src/proxy.ts` (חדש), `src/app/login/page.tsx` (חדש), `src/lib/supabase/server.ts` (עדכון), `src/app/layout.tsx` (הוסף logout)

**⏱ זמן Claude Code: 25–35 דקות**

---

### P0-2 · תיקון RLS — אין גישה ציבורית לנתונים

**מה:** כרגע `anon` role יכול לקרוא/לכתוב/למחוק הכל. חייב להחליף ל-`authenticated` בלבד.

**גישת מימוש:**
1. מיגרציית SQL חדשה: מחיקת פוליסות `anon` על כל 5 הטבלאות
2. הוספת פוליסות `authenticated` ל-SELECT/INSERT/UPDATE/DELETE על כל טבלה
3. לאחר P0-1 — הסשן מועבר אוטומטית דרך `@supabase/ssr`, שאילתות יעבדו
4. **לא דורש שינוי קוד** — רק SQL ב-Supabase dashboard

**קבצים שייגעו:** מיגרציית SQL בלבד (תמסור ל-Supabase)

**⏱ זמן Claude Code: 10 דקות** (כתיבת SQL בלבד, הרצה ידנית)

---

## 🟠 P1 — קריטיים (נחוצים לפני הצגה ללקוח ראשון)

---

### P1-1 · Self-Serve Assessment Link ללקוח

**מה:** היכולת לשלוח לינק לארגון ושהם ימלאו את שאלון COR-SYS בעצמם, בלעדיך. זהו **ה-lead magnet** ו-**ה-delivery mechanism** בו-זמנית.

**גישת מימוש:**
1. נתיב ציבורי (אין auth) `/assess/[token]` — טוקן ייחודי לכל לקוח (UUID)
2. `client_assessments` טבלה חדשה: `token`, `client_id` (nullable), `status`, `completed_at`, `answers` (jsonb)
3. אחרי שליחה: שמור תשובות, הפנה ל-`/assess/[token]/results` שמציג DSM codes + קריאה לפעולה ל-calendly/email
4. ב-dashboard שלך: כפתור "שלח לינק הערכה" בכרטיס לקוח → מייצר token → מציג URL להעתקה
5. Page `/assess/[token]/results` = גרסה read-only של plan page (DSM cards, comorbidity map, intervention protocols) — **ללא sidebar, ללא ניהול**

**קבצים שייגעו:** `src/app/assess/[token]/page.tsx` (חדש), `src/app/assess/[token]/results/page.tsx` (חדש), `src/lib/actions/assessments.ts` (חדש), מיגרציית SQL

**⏱ זמן Claude Code: 60–80 דקות**

---

### P1-2 · PDF Export לדו"ח DSM

**מה:** לאחר שלקוח ממלא שאלון — הוא רוצה לקחת משהו הביתה. דו"ח PDF מ-branded עם DSM codes, comorbidity map, intervention protocols.

**גישת מימוש:**
- **ספריה:** `@react-pdf/renderer` — מאפשרת לכתוב components ב-React ולייצא PDF ישירות ב-server
- API Route: `src/app/api/plans/[clientId]/pdf/route.ts` → GET → מייצר PDF
- Layout: COR-SYS branding + header + 3 sections (Diagnosis, Comorbidity, Protocols)
- SVG comorbidity map לא יעבור ל-react-pdf — להחליף ב-visual table

**קבצים שייגעו:** `src/app/api/plans/[clientId]/pdf/route.ts` (חדש), `src/components/pdf/PlanReport.tsx` (חדש)

**⏱ זמן Claude Code: 45–60 דקות**

---

### P1-3 · Landing Page ציבורית + Pricing

**מה:** כרגע אין שום דף ציבורי. `/` מציג dashboard פנימי. צריך `/` ציבורי לפני login.

**גישת מימוש:**
1. Middleware: אם אין session → redirect לדף ציבורי חדש `/home` (לא `/`)
2. `/home` — landing page: hero ("DSM ארגוני"), value props (3), DSM codes preview, pricing table, CTA
3. Pricing: 3 tiers (L1 Free Assessment → L2 Sprint 40-80K → L2 Retainer 5-15K/mo)
4. CTA ראשי: "קבל אבחון ← " → `/assess/demo` (demo token עם placeholder answers לראות כיצד נראית תוצאה)

**קבצים שייגעו:** `src/app/home/page.tsx` (חדש), `src/proxy.ts` (עדכון routing), `src/app/layout.tsx` (conditional sidebar)

**⏱ זמן Claude Code: 50–70 דקות**

---

### P1-4 · Email Notification בשליחת שאלון

**מה:** לקוח מילא שאלון → אתה מקבל email עם שם הלקוח, DSM codes, וקישור לדף התוכנית.

**גישת מימוש:**
- **ספריה:** Resend (10,000 emails/חודש חינם, API פשוטה) — `npm install resend`
- Server action `savePlanFromQuestionnaire` → אחרי upsert מוצלח → `resend.emails.send()`
- תבנית HTML פשוטה: שם לקוח + DSM codes + link ל-`/clients/[id]/plan`
- Environment variable: `RESEND_API_KEY`

**קבצים שייגעו:** `src/lib/actions/plans.ts` (הוסף שליחה), `src/lib/email.ts` (חדש)

**⏱ זמן Claude Code: 20–25 דקות**

---

## 🟡 P2 — חשובים (שיפור חוויה ועומק)

---

### P2-1 · Longitudinal Tracking — השוואת אבחון לאורך זמן

**מה:** הלקוח מלא שאלון לפני 3 חודשים. עכשיו ממלא שוב. האפליקציה מראה: "ND ירד מ-8.5 ל-5.0 — שיפור של 41%."

**גישת מימוש:**
1. שינוי `client_business_plans`: מ-UNIQUE constraint על `client_id` ← טבלה `assessment_history` חדשה (גרסאות)
2. כל שמירת שאלון → `INSERT` חדש (לא upsert), שמירת `version_number`
3. Timeline component בדף `/clients/[id]/plan`: רשימת אבחונים + diff של scores
4. Chart פשוט (CSS-only bars) — DR/ND/UC over time

**קבצים שייגעו:** מיגרציית SQL, `src/lib/data/plans.ts`, `src/app/clients/[clientId]/plan/page.tsx`

**⏱ זמן Claude Code: 55–70 דקות**

---

### P2-2 · Dashboard Analytics — מפת בריאות הפורטפוליו

**מה:** ב-dashboard הראשי — כמה לקוחות ב-"critical"? מה ה-pathology הנפוץ ביותר? מה ה-average DSM score?

**גישת מימוש:**
1. `getDashboardData()` קיים ב-`src/lib/data/dashboard.ts` — להוסיף aggregation של `questionnaire_response`
2. Map על כל הלקוחות עם `questionnaire_response` → הרץ `diagnose()` → aggregate
3. 3 כרטיסים חדשים ב-dashboard: severity distribution (pie), top pathology, avg entropy
4. אין צורך בשינוי DB — computed in-memory בזמן טעינה

**קבצים שייגעו:** `src/lib/data/dashboard.ts`, `src/app/page.tsx`

**⏱ זמן Claude Code: 30–40 דקות**

---

### P2-3 · Tier 2 + Tier 3 שאלון (48 שאלות מלאות)

**מה:** המחקר מגדיר 48 שאלות (12 Macro + 15 Meso + 21 Micro). כרגע יש רק 10 שאלות Macro. Tier 2 מופעל ב-≥7.0, Tier 3 ב-≥6.0.

**גישת מימוש:**
1. הרחבת `QUESTIONNAIRE_STEPS` ב-`corsys-questionnaire.ts` ל-48 שאלות
2. Tier triggering logic: אחרי Tier 1 → חשב average → אם ≥7.0 → הצג Tier 2 questions
3. `PlanQuestionnaireForm.tsx` — multi-phase UI עם progress indicator (Tier 1 → 2 → 3)
4. DSM engine כבר תומך ב-score ישיר — mapping מ-48 שאלות → DR/ND/UC scores
5. טסטים חדשים ל-boundary logic

**קבצים שייגעו:** `src/lib/corsys-questionnaire.ts` (גדול), `src/app/clients/[clientId]/plan/PlanQuestionnaireForm.tsx`, `src/lib/dsm-engine.test.ts`

**⏱ זמן Claude Code: 90–120 דקות**

---

### P2-4 · Mobile Responsiveness

**מה:** Sidebar וכרטיסים לא עובדים טוב במסך <768px. Self-serve assessment חייב לעבוד על פלאפון.

**גישת מימוש:**
1. Sidebar → hamburger menu במובייל (CSS `md:hidden`, `hidden md:flex`)
2. Bento grid → single column עד `md:` breakpoint
3. Calculator sliders → touch-friendly (גדול יותר, `touch-action: manipulation`)
4. SVG comorbidity map → `max-w-full`, viewBox responsive
5. Plan page cards → full-width stack על מובייל

**קבצים שייגעו:** `src/app/layout.tsx`, `src/app/globals.css`, עמודים ספציפיים

**⏱ זמן Claude Code: 40–50 דקות**

---

### P2-5 · Calendly / Booking Integration בתוצאות אבחון

**מה:** אחרי DSM results — CTA "קבע שיחת אבחון" → iframe של Calendly. כרגע ה-CTA מוביל לדף שירותים.

**גישת מימוש:**
- Calendly embed widget (JavaScript snippet) בתוצאות assessment
- Conditional: severity `critical` / `systemic-collapse` → "קבע ספרינט חוסם עורקים (14 יום) ←"
- severity `at-risk` → "קבע שיחת ייעוץ ראשונית ←"
- Environment variable: `NEXT_PUBLIC_CALENDLY_URL`

**קבצים שייגעו:** `src/app/assess/[token]/results/page.tsx`, `src/app/clients/[clientId]/plan/page.tsx`

**⏱ זמן Claude Code: 15–20 דקות**

---

## 🟢 P3 — ניס-טו-האב (ערך עתידי)

---

### P3-1 · Payment Flow (Stripe)

**מה:** לקוח בוחר ספרינט → משלם מקדמה → מוקלט ב-DB.

**גישת מימוש:** Stripe Checkout + Webhook → עדכון `sprints.status`. דורש Stripe account + webhook endpoint.

**⏱ זמן Claude Code: 90–120 דקות** (+ הגדרת Stripe)

---

### P3-2 · Real-time Sprint Board (WebSockets)

**מה:** שני אנשים רואים את הלוח — כשאחד מזיז task, השני רואה בזמן אמת.

**גישת מימוש:** `supabase.channel().on('postgres_changes', ...)` ב-`SprintBoard.tsx`. Supabase Realtime כבר מופעל.

**⏱ זמן Claude Code: 25–35 דקות**

---

### P3-3 · CSV Export לפיננסים

**מה:** כפתור "ייצא לExcel" בדף financials.

**גישת מימוש:** Client-side CSV generation עם `Blob` + `URL.createObjectURL`. אין dependency חדשה.

**⏱ זמן Claude Code: 15 דקות**

---

### P3-4 · Benchmark נורמטיבי

**מה:** "ה-DR שלך גבוה מ-72% מהארגונים בתעשיית ה-SaaS" — השוואה לנתוני עיוור.

**גישת מימוש:** JSON נסתר של percentile distributions לפי סקטור (מה-simulation N=10,000). Computed client-side.

**⏱ זמן Claude Code: 30–40 דקות**

---

### P3-5 · Tier 3 TTX (Tabletop Exercise) Interactive Module

**מה:** סימולציה אינטראקטיבית — המחקר מתאר תרגיל בטחון ארגוני שמבוסס על pathology profile.

**גישת מימוש:** Multi-step scenario simulator. כל פתולוגיה מולידה תרחיש שונה. State machine ב-client component.

**⏱ זמן Claude Code: 120–180 דקות**

---

## סיכום — לוח זמנים מומלץ

| Sprint | משימות | מטרה | זמן Claude |
|--------|--------|-------|------------|
| **Sprint 1** (עכשיו) | P0-1 + P0-2 | אפשר לתת גישה בלי לחשוף נתונים | ~45 דקות |
| **Sprint 2** | P1-1 + P1-4 | שלח לינק ללקוח הראשון, קבל התראה | ~100 דקות |
| **Sprint 3** | P1-2 + P1-3 | מוצר שניתן להציג — PDF + landing page | ~130 דקות |
| **Sprint 4** | P2-1 + P2-2 + P2-4 | עומק + analytics + mobile | ~120 דקות |
| **Sprint 5** | P2-3 + P2-5 | 48 שאלות מלאות + booking | ~115 דקות |
| **Sprint 6** | P3-1 → P3-5 | Scale | ~5 שעות |

**סה"כ לגרסה 1.0 (Sprints 1–4): ~6 שעות Claude Code.**
