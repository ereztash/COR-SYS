# מבנה ארכיטקטורה — שכבת Data ו-Actions

מסמך זה מתאר את המבנה שיושם. שכבת ה-data וה-actions הוטמעו בפרויקט.

---

## 1. סיכום שינויים מוצעים

| אזור | כיום | מוצע |
|------|------|------|
| **Data (קריאות)** | כל דף קורא ל-Supabase ישירות | פונקציות ב־`src/lib/data/` |
| **Mutations** | טפסים קוראים ל-Supabase מהקליינט | Server Actions ב־`src/lib/actions/` |
| **קומפוננטות UI** | Accordion ב־about | העברה ל־`src/components/ui/` |

---

## 2. שכבת Data — `src/lib/data/`

**מטרה:** מקור אמת לכל קריאות ה-DB. דפים מייבאים מכאן, לא מ-Supabase ישירות.

### 2.1 קבצים מוצעים

| קובץ | תפקיד (בקצרה) |
|------|----------------|
| `src/lib/data/index.ts` | Re-exports של כל הפונקציות (אופציונלי — ל־import נוח) |
| `src/lib/data/clients.ts` | `getClients()`, `getClientById(id)`, `getClientWithPlan(clientId)` |
| `src/lib/data/sprints.ts` | `getSprints()`, `getSprintsByClient(clientId)`, `getSprintById(sprintId, clientId)` |
| `src/lib/data/tasks.ts` | `getTasksBySprint(sprintId)`, `getOpenTasks()` |
| `src/lib/data/financials.ts` | `getFinancials()`, `getFinancialsByClient(clientId)` |
| `src/lib/data/plans.ts` | `getPlanByClientId(clientId)` |
| `src/lib/data/dashboard.ts` | `getDashboardData()` — מה ש� today ב־`page.tsx` של הדשבורד |

### 2.2 חתימות לדוגמה (לא קוד מחייב)

```ts
// clients.ts
export async function getClients(): Promise<Client[]>
export async function getClientById(id: string): Promise<Client | null>
export async function getClientWithPlan(clientId: string): Promise<{ client: Client; plan: ClientBusinessPlan | null } | null>

// sprints.ts
export async function getSprints(): Promise<(Sprint & { clients: Pick<Client, 'name'|'company'> })[]>
export async function getSprintsByClient(clientId: string): Promise<Sprint[]>
export async function getSprintById(sprintId: string, clientId: string): Promise<Sprint | null>

// tasks.ts
export async function getTasksBySprint(sprintId: string): Promise<Task[]>
export async function getOpenTasks(): Promise<Task[]>

// financials.ts
export async function getFinancials(): Promise<(Financial & { clients: ... })[]>
export async function getFinancialsByClient(clientId: string): Promise<Financial[]>

// plans.ts
export async function getPlanByClientId(clientId: string): Promise<ClientBusinessPlan | null>

// dashboard.ts
export async function getDashboardData(): Promise<DashboardData>  // המבנה שכבר קיים ב־page.tsx
```

### 2.3 שימוש בדפים (אחרי ריפקטור)

- `src/app/page.tsx` — `import { getDashboardData } from '@/lib/data/dashboard'`
- `src/app/clients/page.tsx` — `import { getClients } from '@/lib/data/clients'`
- `src/app/clients/[clientId]/page.tsx` — `import { getClientWithPlan } from '@/lib/data/clients'`
- `src/app/clients/[clientId]/plan/page.tsx` — `import { getClientById } from '@/lib/data/clients'` + `getPlanByClientId` מ־`data/plans`

---

## 3. שכבת Actions — `src/lib/actions/`

**מטרה:** כל המוטציות (create/update/delete) דרך Server Actions; revalidatePath במקום אחד.

### 3.1 קבצים מוצעים

| קובץ | תפקיד (בקצרה) |
|------|----------------|
| `src/lib/actions/clients.ts` | `createClient(form)`, `updateClient(id, form)` |
| `src/lib/actions/sprints.ts` | `createSprint(form)`, `updateSprint(id, form)` |
| `src/lib/actions/tasks.ts` | `createTask(form)`, `updateTask(id, form)`, `deleteTask(id)` (או עדכון סטטוס/drag) |
| `src/lib/actions/financials.ts` | `createFinancial(form)` |
| `src/lib/actions/plans.ts` | `savePlanFromQuestionnaire(clientId, clientName, answers)` — העברה מכאן: `app/clients/[clientId]/plan/actions.ts` |

### 3.2 חתימות לדוגמה

```ts
// clients.ts — 'use server'
export async function createClient(form: ClientInsert): Promise<{ ok: boolean; error?: string; id?: string }>
export async function updateClient(id: string, form: ClientUpdate): Promise<{ ok: boolean; error?: string }>

// sprints.ts
export async function createSprint(form: SprintInsert): Promise<{ ok: boolean; error?: string; id?: string }>
export async function updateSprint(id: string, form: SprintUpdate): Promise<{ ok: boolean; error?: string }>

// tasks.ts
export async function createTask(form: TaskInsert): Promise<{ ok: boolean; error?: string; id?: string }>
export async function updateTask(id: string, form: TaskUpdate): Promise<{ ok: boolean; error?: string }>
export async function deleteTask(id: string): Promise<{ ok: boolean; error?: string }>

// financials.ts
export async function createFinancial(form: FinancialInsert): Promise<{ ok: boolean; error?: string; id?: string }>

// plans.ts
export async function savePlanFromQuestionnaire(clientId: string, clientName: string, answers: QuestionnaireAnswer): Promise<{ ok: boolean; error?: string }>
```

בכל action: אחרי הצלחה — `revalidatePath(...)` ל־routes רלוונטיים.

### 3.4 שימוש בטפסים (אחרי ריפקטור)

- `ClientForm` — `import { createClient, updateClient } from '@/lib/actions/clients'`
- `SprintForm` — `import { createSprint, updateSprint } from '@/lib/actions/sprints'`
- `TaskForm` — `import { createTask, updateTask } from '@/lib/actions/tasks'`
- `AddFinancialForm` — `import { createFinancial } from '@/lib/actions/financials'`
- `PlanQuestionnaireForm` — `import { savePlanFromQuestionnaire } from '@/lib/actions/plans'`

קומפוננטות יישארו client-side; הן רק קוראות ל־action ומטפלות ב־loading/error.

---

## 4. קומפוננטות — העברות מוצעות

| קובץ נוכחי | מיקום מוצע | סיבה |
|------------|------------|------|
| `src/app/about/Accordion.tsx` | `src/components/ui/Accordion.tsx` | קומפוננטת UI גנרית, שימושית גם ב־plan או elsewhere |
| `src/app/clients/[clientId]/plan/actions.ts` | `src/lib/actions/plans.ts` | איחוד כל ה-actions תחת `lib/actions` |

השאר (AboutTabs, PlanQuestionnaireForm) נשארים route-specific — הגיוני שיישארו תחת `app/...`.

---

## 5. עץ תיקיות מלא (לאחר יישום)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    ← import getDashboardData from @/lib/data/dashboard
│   ├── globals.css
│   ├── about/
│   │   ├── page.tsx
│   │   ├── AboutTabs.tsx
│   │   └── (Accordion הועבר ל־components/ui)
│   ├── services/
│   │   └── page.tsx
│   ├── clients/
│   │   ├── page.tsx                 ← getClients()
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [clientId]/
│   │       ├── page.tsx             ← getClientWithPlan()
│   │       ├── edit/
│   │       │   └── page.tsx         ← getClientById()
│   │       ├── plan/
│   │       │   ├── page.tsx         ← getClientById(), getPlanByClientId()
│   │       │   ├── PlanQuestionnaireForm.tsx  ← savePlanFromQuestionnaire from @/lib/actions/plans
│   │       │   └── (actions.ts הועבר ל־lib/actions/plans.ts)
│   │       └── sprints/
│   │           ├── new/
│   │           │   └── page.tsx
│   │           └── [sprintId]/
│   │               └── page.tsx     ← getSprintById(), getTasksBySprint()
│   ├── sprints/
│   │   └── page.tsx                 ← getSprints()
│   └── financials/
│       ├── page.tsx                 ← getFinancials(), getClients()
│       └── AddFinancialForm.tsx      ← createFinancial from @/lib/actions/financials
├── components/
│   ├── ui/
│   │   ├── Accordion.tsx            ← הועבר מ־app/about
│   │   └── Badge.tsx
│   ├── forms/
│   │   ├── ClientForm.tsx           ← actions from @/lib/actions/clients
│   │   ├── SprintForm.tsx           ← actions from @/lib/actions/sprints
│   │   └── TaskForm.tsx              ← actions from @/lib/actions/tasks
│   └── SprintBoard.tsx              ← actions from @/lib/actions/tasks
├── lib/
│   ├── supabase/
│   │   ├── server.ts
│   │   └── client.ts
│   ├── data/
│   │   ├── index.ts                 (אופציונלי)
│   │   ├── clients.ts
│   │   ├── sprints.ts
│   │   ├── tasks.ts
│   │   ├── financials.ts
│   │   ├── plans.ts
│   │   └── dashboard.ts
│   ├── actions/
│   │   ├── clients.ts
│   │   ├── sprints.ts
│   │   ├── tasks.ts
│   │   ├── financials.ts
│   │   └── plans.ts
│   ├── business-config.ts
│   ├── service-catalog.ts
│   ├── corsys-questionnaire.ts
│   └── utils.ts
└── types/
    └── database.ts
```

---

## 6. סיכום שומת קבצים (רק קבצים חדשים/מועברים)

| # | קובץ | פעולה |
|---|------|--------|
| 1 | `src/lib/data/index.ts` | חדש (אופציונלי) |
| 2 | `src/lib/data/clients.ts` | חדש |
| 3 | `src/lib/data/sprints.ts` | חדש |
| 4 | `src/lib/data/tasks.ts` | חדש |
| 5 | `src/lib/data/financials.ts` | חדש |
| 6 | `src/lib/data/plans.ts` | חדש |
| 7 | `src/lib/data/dashboard.ts` | חדש |
| 8 | `src/lib/actions/clients.ts` | חדש |
| 9 | `src/lib/actions/sprints.ts` | חדש |
| 10 | `src/lib/actions/tasks.ts` | חדש |
| 11 | `src/lib/actions/financials.ts` | חדש |
| 12 | `src/lib/actions/plans.ts` | העברת לוגיקה מ־app/.../plan/actions.ts |
| 13 | `src/components/ui/Accordion.tsx` | העברה מ־app/about/Accordion.tsx |
| 14 | `app/clients/[clientId]/plan/actions.ts` | מחיקה אחרי העברה ל־lib/actions/plans.ts |
| 15 | `app/about/Accordion.tsx` | מחיקה אחרי העברה ל־components/ui |

סה"כ: **7 קבצי data**, **5 קבצי actions** (1 מהם העברה), **1 קומפוננטה מועברת** — והתאמות import ב־דפים וטפסים קיימים.

---

## 7. סדר יישום מומלץ

1. **Data:** ליצור את `lib/data/*`, להעביר query logic מהדפים, לעדכן imports בדפים.
2. **Actions:** ליצור `lib/actions/*`, להעביר את `plan/actions.ts` ל־`plans.ts`, ואז להמיר טפסים אחד־אחד ל־Server Actions (clients → sprints → tasks → financials).
3. **UI:** להעביר `Accordion` ל־`components/ui`, לעדכן import ב־AboutTabs.
4. **ניקוי:** למחוק `app/clients/[clientId]/plan/actions.ts` ו־`app/about/Accordion.tsx` אחרי שהכל מצביע למיקומים החדשים.
