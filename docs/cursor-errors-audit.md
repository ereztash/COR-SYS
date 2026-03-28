# ביקורת שגיאות נפוצות בכתיבת קוד (Cursor/AI)

תאריך: מרץ 2025

## 1. ממצאים — אין בעיה

| שגיאה נפוצה | סטטוס |
|-------------|--------|
| **TODO/FIXME/HACK** left in code | לא נמצאו |
| **`any` / `as any`** | לא נמצאו |
| **Placeholder text** (lorem, example.com, dummy) | רק `placeholder` ב־HTML (תווית שדה) — תקין |
| **Empty catch** blocks | כל ה־catch כותבים ל־console.error או מחזירים תגובת שגיאה |
| **Unused imports** | לא נבדק אוטומטית; מומלץ להריץ `npm run lint` |
| **Secrets in code** | משתני סביבה דרך `process.env`; אין מפתחות בקוד |

## 2. ממצאים — מקובל אך מתועד

| נושא | פרט |
|------|------|
| **console.error / console.warn** | בשימוש עקבי ללוג שגיאות (עם prefix כמו `[data/dashboard]`). מתאים ל־production. אין `console.log` דיבאג שנותר. |
| **@ts-expect-error** | בשימוש רק עבור Supabase/Postgrest (infer `never` ל־jsonb). כל שורה מלווה בהסבר. |

## 3. פעולות מומלצות (אופציונלי)

| # | פעולה | עדיפות |
|---|--------|--------|
| 1 | **השלמת `.env.example`** — להוסיף `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO` כדי שכל מפתח ידוע למפתחים חדשים. | נמוכה |
| 2 | **התראת Build** — Next.js מתריע על `outputFileTracingRoot` (מנעול/ lockfiles). אם יש lockfile גם בתיקיית האב — להגדיר `outputFileTracingRoot` ב־`next.config.ts` או להסיר lockfile מיותר. | נמוכה |
| 3 | **Proxy (לשעבר middleware)** — Next 16: הפרויקט משתמש ב־`src/proxy.ts` + `export function proxy`; אין `middleware.ts`. | נמוכה — טופל |

## 4. סיכום

הפרויקט נקי משגיאות נפוצות של קוד שנוצר ב־Cursor: אין TODO שנותרו, אין `any`, אין placeholder טקסט, ואין catch ריקים. השימוש ב־console.error ו־@ts-expect-error ממוקד ומתועד.
