# שלב 1.3–1.4: Supabase Production + Google OAuth

פעולות אלה מתבצעות בממשקי Supabase ו־Google Cloud (לא אוטומטיות מהקוד).

---

## 1.3 Supabase Production

### יצירת פרויקט (אם עדיין אין)

1. היכנס ל־[Supabase Dashboard](https://supabase.com/dashboard).
2. **New Project** — בחר ארגון, שם פרויקט, סיסמת DB (שמור אותה).
3. בחר Region (למשל Frankfurt או קרוב למשתמשים).
4. לאחר יצירה — העתק מ־**Settings → API**:  
   `Project URL` ו־`anon public` key.  
   הזן אותם ב־`.env.local` כ־`NEXT_PUBLIC_SUPABASE_URL` ו־`NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### הרצת מיגרציות בסדר הנכון

הרץ ב־**SQL Editor** של הפרויקט, **בסדר הזה** (כל קובץ בנפרד):

| # | קובץ | תיאור |
|---|------|--------|
| 1 | `supabase-schema.sql` | טבלאות בסיס: clients, sprints, tasks, financials, triggers |
| 2 | `supabase-migration-client-plans.sql` | טבלת client_business_plans |
| 3 | `supabase-migration-rls.sql` | RLS על כל הטבלאות (anon) |
| 4 | `supabase-migration-rls-authenticated.sql` | החלפת anon ב־authenticated (לאחר הפעלת Auth) |
| 5 | `supabase-migration-client-assessments.sql` | טבלת client_assessments (לינק הערכה) |
| 6 | `supabase-migration-client-diagnostics.sql` | טבלת client_diagnostics (היסטוריית אבחונים) |

**נתיב לקבצים:** שורש הפרויקט (אותה תיקייה כמו `package.json`).

- אם הפרויקט חדש לגמרי — הרץ 1→2→3, אחר כך הפעל **Authentication** (למשל Email או Google), ואז 4→5→6.
- אם כבר הפעלת Auth — הרץ 4 אם עדיין לא הרצת, ואז 5→6.

---

## 1.4 Google OAuth

### ב־Google Cloud Console

1. היכנס ל־[Google Cloud Console](https://console.cloud.google.com/).
2. בחר/צור פרויקט.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. אם מתבקש — הגדר **OAuth consent screen** (External, מילוי שם אפליקציה ו־support email).
5. סוג: **Web application**.
6. **Authorized JavaScript origins:**
   - מקומי: `http://localhost:3000`
   - Production: `https://your-domain.com` (להחליף בכתובת האמיתית).
7. **Authorized redirect URIs:**
   - העתק את ה־URL Supabase נותן (ראה למטה).
8. צור — העתק **Client ID** ו־**Client Secret**.

### ב־Supabase Dashboard

1. **Authentication → Providers → Google**.
2. הפעל **Enable Sign in with Google**.
3. הדבק **Client ID** ו־**Client Secret** מ־Google.
4. שמור.  
   ב־**URL Configuration** יופיע redirect כמו:  
   `https://<project-ref>.supabase.co/auth/v1/callback`  
   — את ה־URL הזה יש להוסיף ב־Google כ־**Authorized redirect URI**.

### ב־האפליקציה

- אין צורך במשתני סביבה נוספים ל־Google; Supabase משתמש ב־Client ID/Secret שהוזנו בדשבורד.
- וודא ש־`NEXT_PUBLIC_SUPABASE_URL` ו־`NEXT_PUBLIC_SUPABASE_ANON_KEY` מצביעים על אותו פרויקט Supabase.

---

## סיכום

| משימה | איפה | סטטוס |
|--------|------|--------|
| יצירת פרויקט Supabase | Dashboard | ידני |
| הרצת 6 מיגרציות לפי הסדר | SQL Editor | ידני |
| הפעלת Auth (Email/Google) | Authentication → Providers | ידני |
| יצירת OAuth client ב־Google | Google Cloud Console | ידני |
| הזנת Client ID/Secret ב־Supabase | Authentication → Google | ידני |

לאחר סיום — `.env.local` עם Supabase URL + anon key, והאפליקציה מוכנה להתחברות עם Google.
