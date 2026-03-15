# ביקורת איכות קוד — COR-SYS

סקירה כמהנדס ותיק: דגש על דיוק, עקביות וסיכונים. ללא שינוי קוד — ממצאים בלבד.

---

## 1. ציון כללי

| היבט | ציון (1–5) | הערה קצרה |
|------|------------|------------|
| מבנה וארכיטקטורה | 4 | Data + Actions מופרדים; שמות קבצים הגיוניים |
| בטיחות טיפוסים (TypeScript) | 2.5 | הרבה הדחקות טיפוס ו־@ts-expect-error |
| טיפול בשגיאות | 2 | שכבת Data כמעט לא בודקת .error |
| עקביות ו־DRY | 3 | כפילות במפות סטטוס; utils קיימים אך לא מנוצלים בכל מקום |
| ולידציה ואבטחה | 2 | אין ולידציה בצד שרת; אין RLS בסכמה |
| בדיקות | 0 | אין unit/integration tests |
| נגישות | 2 | אין aria/roles בבדיקה |

**סיכום:** הפרויקט **עובד ומסודר** למטרתו (דשבורד פנימי), אך **לא ברמת "איכות ומדויקות גבוהה"** — יש חריגות ברורות בטיפוסים, שגיאות, ולידציה ואבטחה.

---

## 2. ממצאים קריטיים

### 2.1 שכבת Data — התעלמות משגיאות Supabase

ברוב פונקציות ה־data **לא נבדק** `res.error`:

- `getClients()`, `getClientById()`, `getSprints()`, `getSprintsByClient()`, `getSprintById()`, `getSprintCountByClient()`, `getTasksBySprint()`, `getOpenTasks()`, `getFinancials()`, `getFinancialsByClient()`, `getClientsForSelect()`, `getDashboardData()` — כולן מחזירות `data ?? []` או `data` בלי לבדוק `error`.

**השלכה:** כשלון רשת/הרשאות/באג ב־Supabase מתבטא ב-**רשימה ריקה או null** בלי לוג או הודעה למשתמש. אבחון בעיות קשה.

**יוצאים:** `getClientWithPlan` (בודק `!clientData`), `getPlanByClientId` (try/catch + בדיקת error).

**המלצה:** בכל פונקציית data: אם `error` קיים — להחזיר תוצאה מוגדרת (למשל `{ data: null, error }`) או לזרוק/ללוג, ולא להחזיר "ריק" בשקט.

---

### 2.2 הדחקות טיפוס (TypeScript)

- **Actions:** 8 שימושים ב־`@ts-expect-error` ב־`lib/actions/*` — כי Supabase מחזיר טיפוסים "strict" (למשל `never`) שלא תואמים ל־Database.
- **Data:** `getClientWithPlan` — `(clientRes as { data: Client | null }).data` ו־cast דומה ל־planRes.
- **UI:** `sprint.clients as any`, `f.clients as any` (בדף ספרינטים, כספים, דשבורד); `form.status as any` ב־ClientForm ו־SprintForm.

**השלכה:** טעויות ריצה (ערך לא צפוי, שדה חסר) לא יתפסו בזמן קומפילציה. התנהגות "מתפוגגת" מטיפוסים.

**המלצה:**  
1) לייצר טיפוסים מ־Supabase (codegen) או להגדיר היטב את `Database` כך ש־Insert/Update יזרמו ל־client.  
2) להסיר הדחקות: טיפוסים מפורשים ל־select עם joins (למשל `SprintWithClient`) ו־payload של actions כ־`Insert`/`Update`.  
3) בטפסים: `status` כ־`ClientStatus` / `SprintStatus` (מ־`@/types/database`) במקום `as any`.

---

### 2.3 משתני סביבה

ב־`lib/supabase/server.ts` ו־`client.ts`:

```ts
process.env.NEXT_PUBLIC_SUPABASE_URL!
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
```

**השלכה:** אם משתנה חסר — קריסה ב־runtime בלי הודעה ברורה.

**המלצה:** בדיקה באתחול (או ב־layout/root): אם חסר — להחזיר הודעת שגיאה ברורה או לזרוק עם טקסט מוגדר, בלי non-null assertion.

---

### 2.4 ולידציה בצד שרת

- **Actions:** אין בדיקת פורמט ל־`id` (UUID), אין בדיקה ש־`status` שייך ל־enum של ה־DB, אין טווחים למספרים (למשל `hourly_rate`, `revenue`).
- **טפסים:** `parseFloat(form.revenue)` — אם הקלט לא מספר, מתקבל `NaN`; נשלח ל־DB. `parseFloat('')` מחזיר `NaN` — ב־ClientForm יש `? parseFloat(...) : null` אז שדות ריקים בסדר, אבל קלט כמו `"abc"` ייתן `NaN`.

**השלכה:** נתונים לא חוקיים יכולים להגיע ל־DB או לגרום לשגיאות לא צפויות.

**המלצה:** ב־actions — ולידציה מפורשת (למשל zod/yup): enum ל־status, UUID ל־id, טווחים למספרים; להחזיר `{ ok: false, error: '...' }` במקום להמשיך.

---

### 2.5 אבטחה — RLS ו־Auth

- **סכמה (supabase-schema.sql):** אין `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` ואין policies.
- **קוד:** אין בדיקת משתמש מחובר; כל קריאה/כתיבה דרך anon key.

**השלכה:** אם הפרויקט חשוף לרשת ו־anon key דלוף — גישה מלאה ל־DB (כתיבה/מחיקה) לפי יכולות ה־key.

**המלצה:** אם זה כלי פנימי סגור — לתעד במפורש ש־RLS לא מופעל ושה־key לא לחשיפה. אם יש/יהיה משתמשים — להפעיל RLS ו־auth ולוודא שה־policies תואמות את מודל ההרשאות.

---

## 3. ממצאים משניים

### 3.1 כפילות — מפות סטטוס

- `lib/utils.ts`: `STATUS_LABELS`, `STATUS_COLORS` — מנוצלים ב־`components/ui/Badge.tsx`.
- `app/clients/page.tsx`: `StatusPill` עם מפה מקומית `{ label, cls }` ל־client status.
- `app/clients/[clientId]/page.tsx`: `statusMap` באותו פורמט.
- `app/page.tsx`: מפת סטטוס ל־sprints (ושוב `(sprint.clients as any)`).

**השלכה:** שינוי תרגום או צבע דורש עדכון בכמה מקומות; סיכון לחוסר עקביות.

**המלצה:** שימוש אחיד ב־`STATUS_LABELS` + `STATUS_COLORS` (או מפה אחת משולבת) ו־`Badge` (או קומפוננטה דומה) בכל הרשימות והדשבורד.

---

### 3.2 בליעת שגיאות

- `lib/supabase/server.ts`: ב־`setAll`, `catch {}` — כל שגיאה בהגדרת cookies נבלעת.

**המלצה:** לפחות לוג (למשל `console.error`) או להעלות הלאה אם זה קריטי ל־session.

---

### 3.3 בדיקות

- אין קבצי test (אין Jest/Vitest/Playwright בפרויקט; רק תלויות ב־lockfile של חבילות אחרות).

**המלצה:** גם מינימום — בדיקות ל־buildPlanFromQuestionnaire, ל־formatCurrency/formatDate, ול־action אחד־שניים (mock ל־Supabase) — מגדילות ביטחון בשינויים עתידיים.

---

## 4. מה במצב טוב

- **הפרדה:** Data ב־`lib/data`, Actions ב־`lib/actions` — ברור ונוח לתחזוקה.
- **שמות:** פונקציות וקבצים עם שמות עקביים ומתארים (getClients, createClientAction, וכו').
- **revalidatePath:** Actions מרעננות את ה־paths הרלוונטיים — cache של Next מתעדכן.
- **טיפוסי DB:** `types/database.ts` מגדיר Row/Insert/Update — בסיס נכון; הבעיה בזרימה ל־Supabase client ולא בהגדרה עצמה.
- **סכמה:** CHECK constraints על status ב־DB — שכבת הגנה נוספת אם ה־app שולח ערך לא חוקי.

---

## 5. סדר עדיפויות לתיקון

| עדיפות | פעולה |
|--------|--------|
| 1 | לבדוק `error` בכל פונקציית data ולהחזיר/ללוג שגיאה במקום "ריק שקט". |
| 2 | להפעיל RLS ב־Supabase (או לתעד במפורש שאין RLS ומה משמעות האנונימיות). |
| 3 | ולידציה ב־actions (enum, UUID, טווחים); טיפול ב־NaN בטפסים. |
| 4 | איחוד מפות סטטוס ושימוש ב־Badge/utils בכל הדפים. |
| 5 | תיקון טיפוסים (הסרת @ts-expect-error ו־as any) דרך טיפוסים מפורשים/ Supabase codegen. |
| 6 | בדיקת env באתחול; הימנעות מ־! על env. |
| 7 | הוספת בדיקות בסיסיות (לוגיקה, utils, action אחד לפחות). |

---

## 6. מסקנה

הפרויקט **לא** כתוב ברמת איכות ומדויקות גבוהה: יש חוסרים עקביים בטיפול בשגיאות, בטיחות טיפוסים, ולידציה ואבטחה, וחסר בדיקות.  
מבחינת מבנה וארגון קוד — הרמה סבירה; השיפור העיקרי הוא **הקשחת** שכבת ה־data, ה־actions והטיפוסים, ורק אחר כך הרחבת פיצ'רים.
