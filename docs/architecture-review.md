# ביקורת ארכיטקטורה — COR-SYS

סקירה ישירה: איפה הקוד לא מיטבי ואיפה חיפפתי (חתכתי פינות).

---

## 1. כפילות קריטית: קומפוננטות DSM בשני דפים

**מצב:** ארבע קומפוננטות מוגדרות **פעמיים** — פעם ב־`plan/page.tsx` ופעם ב־`assess/[token]/results/page.tsx`:

| קומפוננטה | plan/page.tsx | assess/.../results/page.tsx |
|-----------|----------------|-----------------------------|
| `EntropyDots` | ✓ ~25 שורות | ✓ ~25 שורות (עותק) |
| `DSMDiagnosisCard` | ✓ ~35 שורות | ✓ ~35 שורות (עותק) |
| `ComorbidityMap` | ✓ ~80 שורות | ✓ ~80 שורות (עותק) |
| `InterventionProtocolsCard` | ✓ ~45 שורות | ✓ ~45 שורות (עותק) |

**השלכה:** כל שינוי (טקסט, סטייל, לוגיקה) חייב להיעשות בשני מקומות. סיכון לבאגים וסטייה בין "תוכנית" ל"תוצאות ציבוריות".

**המלצה:** למשוך את ארבע הקומפוננטות לקובץ משותף, למשל:
`src/components/diagnostic/EntropyDots.tsx`, `DSMDiagnosisCard.tsx`, `ComorbidityMap.tsx`, `InterventionProtocolsCard.tsx`  
או כולם תחת `src/components/diagnostic/index.tsx` (barrel).  
שני הדפים ייבאו מאותו מקור.

---

## 2. לוגיקת "חישוב אבחון" מפוזרת ומוכפלת

**מצב:** אותו בלוק לוגי מופיע בשני דפים:

- **plan/page.tsx:** שלוף client + plan → חילוץ `questionnaire_response` → `buildPlanFromQuestionnaire(client.name, qa)` → `diagnose(qa)` → `getComorbidityMap(dsmDiagnosis)` → `getInterventionProtocols(dsmDiagnosis, qa)`.
- **assess/.../results/page.tsx:** שלוף assessment by token → client name מ־client_id → **אותו חישוב**: buildPlan, diagnose, getComorbidityMap, getInterventionProtocols.

בנוסף: **PDF route** (`api/plans/[clientId]/pdf/route.ts`) עושה שוב את אותו דבר (buildPlan, diagnose, getInterventionProtocols) בלי שימוש חוזר.

**השלכה:** שינוי בכלל מיפוי (למשל הוספת שדה ל־dynamicSummary או ל־diagnose) דורש עדכון בשלושה מקומות. קשה להבטיח עקביות.

**המלצה:** פונקציה אחת שמקבלת `(clientName, answers: QuestionnaireAnswer)` ומחזירה אובייקט מוכן לתצוגה, למשל:

```ts
// src/lib/diagnostic.ts (או בתוך corsys-questionnaire / dsm-engine)
export function computeDiagnostic(clientName: string, answers: QuestionnaireAnswer) {
  const planResult = buildPlanFromQuestionnaire(clientName, answers)
  const dsmDiagnosis = diagnose(answers)
  const comorbidityEdges = getComorbidityMap(dsmDiagnosis)
  const interventionProtocols = getInterventionProtocols(dsmDiagnosis, answers)
  return { planResult, dsmDiagnosis, comorbidityEdges, interventionProtocols }
}
```

- `plan/page.tsx` ו־`results/page.tsx` קוראים ל־`computeDiagnostic` עם (clientName, answers) ומשתמשים בתוצאה.
- ה־PDF route קורא לאותה פונקציה ומעביר את התוצאה ל־`PlanReport` (בלי לחשב פעמיים).

---

## 3. טפסי שאלון — שני קומפוננטים דומים

**מצב:**  
- `PlanQuestionnaireForm` (plan) — steps, answers, **תצוגה מקדימה** (buildPlanFromQuestionnaire + dynamicSummary), שמירה ל־`savePlanFromQuestionnaire` ו־reload.  
- `AssessmentForm` (assess) — אותם steps, אותו state, **בלי** תצוגה מקדימה, שמירה ל־`saveAssessmentAnswers` והפניה ל־`/assess/{token}/results`.

רוב הקוד (שלב נוכחי, רינדור שדות, כפתורי קדימה/אחורה, submit) זהה.

**השלכה:** DRY מופר; שינוי ב־UI של השאלון (למשל progress bar, חובה על שדה) דורש עדכון בשני טפסים.

**המלצה:** קומפוננטה גנרית אחת, למשל `QuestionnaireForm`, שמקבלת:
- `steps` (או שימוש ב־QUESTIONNAIRE_STEPS),
- `onSubmit: (answers) => Promise<{ ok, error? }>`,
- אופציונלי: `onPreview?: (answers) => void` ו־`previewSummary?: DynamicSummary | null` (רק ב־plan).
- אופציונלי: `successRedirect?: string` (ב־assess: `/assess/${token}/results`; ב־plan: undefined → reload).

`PlanQuestionnaireForm` ו־`AssessmentForm` הופכים ל־thin wrappers שקוראים ל־QuestionnaireForm עם ה־callbacks וההפניה המתאימים.

---

## 4. Data layer — חוסר עקביות בטיפול בשגיאות

**מצב (כבר תועד ב־code-quality-audit.md):**  
- רוב פונקציות ה־data מחזירות `[]` או `null` בלי לבדוק `error`; רק חלקן (למשל `getPlanByClientId`, `getClientWithPlan`) בודקות error ומתנהגות בהתאם.
- assessments: `getAssessmentByToken` מחזיר `{ ok, data?, error? }` (תבנית action-like), בעוד `getClientById` מחזיר `Client | null` (תבנית data-like). ערבוב בין שני סגנונות.

**השלכה:** כשל Supabase (רשת, RLS) מתבטא ב־"אין נתונים" בלי לוג או הודעה ברורה; אבחון קשה.

**המלצה:**  
- להחליט על תבנית אחת ל־data: למשל תמיד `{ data, error? }` או תמיד להחזיר ערך + לזרוק/ללוג ב־error.  
- בכל פונקציית data: לבדוק `error`, ללוג, ולהחזיר תוצאה מוגדרת (או לזרוק) במקום "ריק בשקט".

---

## 5. Assessments: data vs actions

**מצב:**  
- `getAssessmentByToken` נמצא ב־`lib/actions/assessments.ts` (קובץ server actions) ומשמש גם ב־**דפי קריאה** (results/page, assess/page) — כלומר גם כ־"data fetcher".  
- שאר ה־data נמצא ב־`lib/data/` (clients, plans, sprints...).

**השלכה:** ערבוב אחריות: actions = מוטציות + revalidate; data = קריאות. שליפת assessment לפי token היא קריאה, לא מוטציה.

**המלצה:** להעביר `getAssessmentByToken` ל־`lib/data/assessments.ts` (או ל־`lib/data/index.ts`) ולהשאיר ב־actions רק: `createAssessment`, `saveAssessmentAnswers`. דפים ייבאו את השליפה מ־`@/lib/data`.

---

## 6. PDF route — קובץ .ts עם JSX

**מצב:** `src/app/api/plans/[clientId]/pdf/route.ts` — קובץ עם סיומת `.ts` שמכיל JSX (`<PlanReport ... />`). ב־Next.js זה עובד כי tsconfig מאפשר JSX ב־.ts, אבל המוסכמה היא `.tsx` לקבצים עם JSX.

**המלצה:** לשנות את שם הקובץ ל־`route.tsx` לשמירה על עקביות וקריאות.

---

## 7. סיכום: איפה חיפפתי

| נושא | מה נעשה | מה היה עדיף |
|------|---------|-------------|
| כרטיסי DSM | הועתקו ל־plan ו־results | קומפוננטות משותפות ב־components/diagnostic |
| חישוב אבחון | buildPlan + diagnose + comorbidity + protocols בשני דפים + ב־PDF | פונקציה אחת `computeDiagnostic(clientName, answers)` |
| טפסי שאלון | שני טפסים נפרדים עם לוגיקה דומה | קומפוננטה גנרית + wrappers דקים |
| getAssessmentByToken | הושאר ב־actions | העברה ל־data layer |
| PDF route | route.ts + JSX | route.tsx |
| Data layer errors | לא טופל במסגרת הסבב האחרון | יישום המלצות מ־code-quality-audit (error handling, types) |

---

## 8. סדר עדיפויות לתיקון

1. **גבוה:** משיכת EntropyDots, DSMDiagnosisCard, ComorbidityMap, InterventionProtocolsCard לקומפוננטות משותפות — מפחית באגים וסטייה.
2. **גבוה:** הוספת `computeDiagnostic(clientName, answers)` ושימוש בה ב־plan, results ו־PDF.
3. **בינוני:** איחוד טפסי השאלון ל־QuestionnaireForm גנרי.
4. **בינוני:** העברת `getAssessmentByToken` ל־data; route PDF ל־.tsx.
5. **נמוך (לא טופל):** טיפול בשגיאות ב־data layer וצמצום הדחקות טיפוס (לפי code-quality-audit).

אם תרצה, אפשר להתחיל מפריטים 1 ו־2 (קומפוננטות משותפות + computeDiagnostic) ורק אחר כך לגעת בטפסים ו־data.
