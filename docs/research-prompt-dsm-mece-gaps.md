# פרומפט מחקר: זיהוי חלקי MECE חסרים ב-DSM הארגוני של COR-SYS

## הוראה למודל/חוקר

אתה חוקר ארגוני בעל מומחיות בפסיכולוגיה ארגונית, תורת המערכות, BCM, ופסיכומטריקה. 

**המשימה:** לנתח את מודל ה-DSM הארגוני של COR-SYS, לזהות **חלקים חסרים לפי עקרון MECE** (Mutually Exclusive, Collectively Exhaustive), ולהציע ממדים/פתולוגיות/מנגנונים שהמודל הנוכחי לא מכסה.

**תוצר נדרש:** מסמך מובנה שמזהה כל פער MECE, מנמק את החשיבות שלו מבחינה תיאורטית ומעשית, ומציע כיצד לשלב אותו במודל.

---

## חלק א׳: מצב נוכחי — מה המודל כולל

### א.1 ארבע פתולוגיות (ממדים)

המודל הנוכחי מודד **4 ממדים של דיספונקציה ארגונית**, כל אחד בסקאלה 0–10:

| קוד | שם | בסיס תיאורטי | מה מודד |
|-----|-----|--------------|---------|
| **DR** | Distorted Reciprocity (הדדיות מעוותת) | Hobfoll COR, Game Theory, Zero-Sum | תחרות פנימית הרסנית, אינטרסים מנוגדים, תגמול win-lose |
| **ND** | Normalization of Deviance (נורמליזציית סטייה) | Vaughan (1996), NASA Challenger | עקיפת נהלים שהפכה לנורמה, workarounds, heroes culture |
| **UC** | Unrepresentative Calibration (כיול לא-מייצג) | Argyris Double-Loop, Edmondson PS, Floridi Ontological Friction | כשל למידה, חוסר בטחון פסיכולוגי, סחיפה סמנטית |
| **SC** | Structural Clarity Deficit (עמימות מבנית) | Simon Bounded Rationality, Weick Organizing | תפקידים לא מוגדרים, תהליכים לא מתועדים, אחריות מטושטשת |

### א.2 נוסחת הליבה

```
J(t) = C(t) / E(t)
```
- **C(t)** = קיבולת קוגניטיבית ארגונית
- **E(t)** = אנטרופיה צורכת קיבולת
- **סף קריסה:** E > 65% מ-C → הסתברות קריסה +300%

### א.3 שלוש תצורות אנטרופיה (מוצהרות אך לא ממומשות)

המסגרת העסקית מציינת שאנטרופיה מתקיימת ב-3 תצורות:
1. **אינפורמציונית** — מידע שגוי, חסר, או מתנגש
2. **מבנית** — מבנים ותהליכים שאינם תואמים את המציאות
3. **תרבותית** — נורמות, ערכים, והתנהגויות שמייצרות חיכוך

> ⚠️ **שאלה קריטית:** האם 4 הפתולוגיות (DR, ND, UC, SC) מכסות MECE את 3 תצורות האנטרופיה? או שיש חפיפות ופערים?

### א.4 קורלציות (N=10,000)

| קשר | r | כיוון |
|------|---|-------|
| DR ↔ ND | .19 | חיובי |
| DR ↔ UC | −.27 | שלילי |
| ND ↔ UC | .28 | חיובי |
| SC ↔ ? | לא נמדד | חסר |

> ⚠️ **פער:** SC נוסף בשלב 4 (Phase 4). אין קורלציות שלו עם DR/ND/UC. אין לו validation סימולטיבי.

### א.5 כלים ממופים

| כלי ייחוס | ממד | מה כלי הייחוס מודד שה-DSM לא |
|-----------|-----|-------------------------------|
| McKinsey OHI | DR | Direction, Accountability, Innovation ← *רק Direction ממופה* |
| Edmondson PSI | UC | 7 פריטים → *ממומש כבלוק נפרד, לא משולב ב-UC score* |
| ISO 22301 BCM | ND | BIA Maturity, Exercise Quality → *לא מודד exercise quality* |
| CultureAmp | DR, UC | Engagement, Manager Effectiveness → *לא מודד engagement* |
| Qualtrics EXM | All | Risk Culture, Feedback Culture → *לא מודד feedback culture כממד עצמאי* |

---

## חלק ב׳: ניתוח MECE — מה חסר?

### השאלה המרכזית

ניתוח MECE דורש שהממדים יהיו:
1. **Mutually Exclusive** — כל ממד מודד construct שונה, בלי חפיפה
2. **Collectively Exhaustive** — ביחד הם מכסים את כל מרחב הדיספונקציה הארגונית הרלוונטי

**נא לבחון את הממדים הנוכחיים לפי שני הקריטריונים ולזהות:**

### ב.1 בעיות Mutual Exclusivity (חפיפות)

נא לנתח:
1. **חפיפה DR ↔ SC:** האם "תחרות על משאבים" (DR-7) ו"תפקידים לא מוגדרים" (SC) מודדים construct דומה? כשאין בהירות מבנית → נוצרת תחרות. האם זו סיבתיות ולא חפיפה?
2. **חפיפה UC ↔ SC:** "סחיפה סמנטית" (UC-2) ו"תהליכים לא מתועדים" (SC) — שניהם עוסקים בבהירות. מה ההבדל? האם צריך לחלק אחרת?
3. **חפיפה ND ↔ UC:** ND-4 (Procedure-Reality Gap) קרוב ל-UC-5 (Self-Assessment Accuracy) — שניהם מודדים פער בין "מה שחושבים" ל"מה שקורה". מתי זה ND ומתי UC?

### ב.2 בעיות Collective Exhaustiveness (ממדים חסרים)

**סרוק את הספרות הארגונית הבאה ובדוק — האם יש ממדים של דיספונקציה ארגונית שה-DSM לא מכסה כלל:**

#### 1. מנהיגות ואמון (Leadership & Trust)

| construct | מקור | האם מכוסה? |
|-----------|------|------------|
| Transformational vs. Transactional Leadership | Bass & Avolio (1994) | ❓ לא ברור |
| Leader-Member Exchange (LMX) | Graen & Uhl-Bien (1995) | ❌ לא מכוסה |
| Organizational Trust | Mayer, Davis & Schoorman (1995) | DR-4 מכסה חלקית |
| Ethical Leadership | Brown, Treviño & Harrison (2005) | ❌ לא מכוסה |
| Toxic Leadership / Abusive Supervision | Tepper (2000) | ❌ לא מכוסה |

**שאלה:** האם המודל צריך ממד של **כשל מנהיגותי** (Leadership Dysfunction — LD)? או שזה מתבטא דרך DR/ND/UC/SC?

#### 2. מחוברות ושחיקה (Engagement & Burnout)

| construct | מקור | האם מכוסה? |
|-----------|------|------------|
| Employee Engagement | Kahn (1990), Schaufeli (2002) | ❌ לא מכוסה |
| Job Demands-Resources (JD-R) | Bakker & Demerouti (2007) | ❌ לא מכוסה |
| Burnout (3 dimensions) | Maslach & Jackson (1981) | ❌ לא מכוסה |
| Quiet Quitting / Cognitive Withdrawal | Harter et al. (2002) | ❌ לא מכוסה |

**שאלה:** האם J-Quotient (קיבולת קוגניטיבית) מכסה את engagement/burnout, או שאלה constructs שונים?

#### 3. תקשורת ארגונית (Communication Pathology)

| construct | מקור | האם מכוסה? |
|-----------|------|------------|
| Communication Climate | Gibb (1961), Redding (1972) | ❌ לא מכוסה |
| Information Asymmetry | Akerlof (1970) | DR-3 (hoarding) חלקי |
| Upward Communication Barriers | Morrison & Milliken (2000) | UC-3 (PS) חלקי |
| Organizational Silence | Morrison & Milliken (2000) | ❌ ממד עצמאי חסר |

**שאלה:** UC-3 (Psychological Safety) מודד "בטוח לומר", אבל האם זה מכסה **organizational silence** — כשאנשים יודעים שמשהו רקוב אבל לא מדברים כי אין מנגנון, לא כי לא בטוח?

#### 4. חדשנות ואדפטיביות (Innovation & Adaptability)

| construct | מקור | האם מכוסה? |
|-----------|------|------------|
| Organizational Ambidexterity | March (1991), O'Reilly & Tushman (2004) | ❌ לא מכוסה |
| Absorptive Capacity | Cohen & Levinthal (1990) | UC חלקי (למידה) |
| Dynamic Capabilities | Teece, Pisano & Shuen (1997) | ❌ לא מכוסה |
| Innovation Climate | Amabile (1996) | ❌ לא מכוסה |

**שאלה:** UC מודד "למידה מטעויות" (backward-looking). מי מודד "יכולת הסתגלות לשינויים חיצוניים" (forward-looking)? האם חסר ממד **Adaptive Deficit (AD)**?

#### 5. יישור אסטרטגי (Strategic Alignment)

| construct | מקור | האם מכוסה? |
|-----------|------|------------|
| Strategy-Structure Fit | Chandler (1962) | SC חלקי |
| Goal Alignment Across Levels | Kaplan & Norton (1996) BSC | DR חלקי (KPI transparency) |
| Execution Gap | Neilson, Martin & Powers (2008) | ❌ לא מכוסה |
| Sensemaking Failures | Weick (1995) | UC (semantic) חלקי |

**שאלה:** מי מודד את הפער בין אסטרטגיה לביצוע (Execution Gap)? זה לא DR (תחרות), לא ND (סטייה מנהלים), לא UC (למידה), ולא SC (מבנה). האם זה construct נפרד?

#### 6. דינמיקת כוח ופוליטיקה (Power & Politics)

| construct | מקור | האם מכוסה? |
|-----------|------|------------|
| Organizational Politics | Ferris & Kacmar (1992) | ❌ לא מכוסה |
| Power Distance Orientation | Hofstede (1980) | ❌ לא מכוסה |
| Turf Wars / Empire Building | Pfeffer (1981) | DR חלקי |
| Centralization vs. Decentralization | Mintzberg (1983) | ❌ לא מכוסה |

**שאלה:** DR מודד "תחרות", אבל לא "פוליטיקה ארגונית". האם פוליטיקה = DR, או שזו דינמיקה אחרת (כוח, השפעה, קואליציות) שדורשת ממד נפרד?

#### 7. ניהול שינוי (Change Management)

| construct | מקור | האם מכוסה? |
|-----------|------|------------|
| Change Readiness | Armenakis et al. (1993) | ❌ לא מכוסה |
| Change Fatigue | McMillan & Perron (2013) | ❌ לא מכוסה |
| Organizational Inertia | Hannan & Freeman (1984) | ❌ לא מכוסה |
| Greiner Growth Stages | Greiner (1972) | 🟡 מוזכר בדוקומנטציה, לא מיושם |

**שאלה:** COR-SYS מזכיר את Greiner (משברי צמיחה) אבל לא מודד אותו. האם "שלב Greiner" הוא moderator (משפיע על ספים) או ממד חמישי?

#### 8. עמידות ארגונית (Organizational Resilience)

| construct | מקור | האם מכוסה? |
|-----------|------|------------|
| Organizational Resilience | Lengnick-Hall et al. (2011) | ❌ — זה המטרה, לא מדד |
| Redundancy & Slack Resources | Bourgeois (1981) | ❌ לא מכוסה |
| Crisis Preparedness | Mitroff (2004) | ND חלקי (near-miss) |
| Antifragility | Taleb (2012) | ❌ לא מכוסה |

**שאלה:** COR-SYS מכוון לבנות עמידות — אבל האם הוא מודד את הרמה הנוכחית של עמידות? או רק את הפתולוגיות שפוגעות בה?

---

## חלק ג׳: ניתוח ה-3 תצורות אנטרופיה

המסגרת מגדירה **3 תצורות אנטרופיה**: אינפורמציונית, מבנית, תרבותית.

**נא למפות — כיצד 4 הפתולוגיות מכסות (או לא מכסות) כל תצורה:**

| תצורת אנטרופיה | פתולוגיה שמכסה | מה מכוסה | פער — מה לא מכוסה |
|----------------|----------------|----------|-------------------|
| **אינפורמציונית** | UC (semantic drift), DR (info hoarding) | סחיפה סמנטית, הסתרת מידע | ❓ מידע שגוי (misinformation)? עודף מידע (information overload)? ניהול ידע כשלוני? |
| **מבנית** | SC (structural clarity), ND (procedure-reality gap) | תפקידים לא מוגדרים, נהלים לא תואמים | ❓ מבנים שלא מותאמים ל-strategy? ביורוקרטיה עודפת? centralization פגומה? |
| **תרבותית** | DR (zero-sum culture), ND (normalization), UC (blame culture) | תחרות פנימית, נורמליזציית סטייה, תרבות האשמה | ❓ חוסר מחוברות? שחיקה? cynicism ארגוני? |

**שאלות:**
1. האם כל תצורה מכוסה ב-**לפחות 2 sub-dimensions** ייעודיים?
2. האם יש תצורה שמכוסה רק דרך "חפיפה" (overflow) מפתולוגיה אחרת?
3. האם צריך ממד חמישי שמכסה "אנטרופיה תרבותית" ישירות (engagement, values, belonging)?

---

## חלק ד׳: בחינת Edmondson PSI כממד

### מצב נוכחי

בשאלון COR-SYS יש **7 שאלות Edmondson PSI** (בלוק 4), אבל הן:
- **לא משולבות ב-UC score** (חלק נפרד לחלוטין)
- **לא משפיעות על DSM diagnosis** (לא עוברות ל-`dsm-engine.ts`)
- **לא ממופות ל-comorbidity** (לא נכנסות למפת הקורלציות)

**שאלות:**
1. האם PSI צריך להשתלב ב-UC (כשני ברכיבים — 60% learning, 40% semantic — מתווסף 30% PSI)?
2. האם PSI צריך להיות **ממד חמישי נפרד** (Psychological Safety Index)?
3. מה הקשר בין PSI לבין ND-6 (near-miss reporting) ו-UC-8 (crisis communication)?

---

## חלק ה׳: Greiner Stages כ-Moderator או ממד

### מצב נוכחי

`companySize` (under_50, 50-150, 150-300, 300+) משמש כ-proxy ל-Dunbar ול-Greiner:
- **Dunbar's Number (150):** רף שבו רשתות לא-פורמליות מתפרקות
- **Greiner Growth Model:** 5 שלבי צמיחה ומשברים (מנהיגות → אוטונומיה → שליטה → ביורוקרטיה → שיתוף פעולה)

**שאלות:**
1. האם Greiner Stage הוא **moderator** (משנה ספי חומרה) או **ממד** (פתולוגיה בפני עצמה)?
2. האם "משבר השליטה" (Greiner 3) הוא בעצם SC? האם "משבר הביורוקרטיה" (Greiner 4) הוא ND?
3. האם צריך שאלה ישירה שמזהה שלב Greiner? אם כן — איזה scoring זה מקבל?

---

## חלק ו׳: תוצר נדרש

### סעיף 1: טבלת פערי MECE

לכל פער שזוהה, ספק:

| שדה | תיאור |
|-----|-------|
| **Gap ID** | מזהה ייחודי (GAP-01, GAP-02...) |
| **Construct Name** | שם ה-construct החסר (אנגלית + עברית) |
| **Theoretical Basis** | מקורות אקדמיים (author, year, core argument) |
| **Currently Covered?** | האם ממד קיים מכסה חלקית? אם כן — איפה נגמר הכיסוי |
| **Why It Matters** | למה ארגון עם פתולוגיה זו ייסבול — עדות אמפירית |
| **Prevalence** | באיזו תדירות פתולוגיה זו מופיעה בארגוני 50-300 עובדים |
| **Recommendation** | (A) לשלב בממד קיים — באיזה ואיך, (B) ממד חדש — קוד מוצע ושם, (C) לא רלוונטי — למה |
| **Measurement** | כיצד מודדים בשאלון self-report (שאלה לדוגמה) |
| **Impact on Model** | מה ההשפעה על comorbidity map, severity profiles, intervention protocols |

### סעיף 2: מטריצת MECE מעודכנת

הצג מטריצה מלאה:
- **שורות:** כל ממדי MECE (קיימים + מוצעים)
- **עמודות:** 3 תצורות אנטרופיה (אינפורמציונית, מבנית, תרבותית)
- **תאים:** sub-dimensions ספציפיים

הציג שהמטריצה **ריקה מפערים** — כל תא מכוסה בלפחות sub-dimension אחד.

### סעיף 3: קורלציות מוצעות ל-SC

SC נוסף בלי קורלציות:
- מה ה-r המשוער בין SC ↔ DR, SC ↔ ND, SC ↔ UC?
- על מה מבוססת ההשערה (תיאוריה, מחקר אמפירי, או הסקה)?

### סעיף 4: המלצה — 4, 5, או 6 ממדים?

ספק המלצה מנומקת:
- **אפשרות A: 4 ממדים מספיקים** — כל הפערים נבלעים ב-sub-dimensions תחת DR/ND/UC/SC
- **אפשרות B: 5 ממדים** — הוספת ממד אחד (איזה? למה?)
- **אפשרות C: 6 ממדים** — הוספת 2 ממדים (אילו? למה?)
- **אפשרות D: פחות מ-4** — 4 זה יותר מדי, יש חפיפה שצריך לפתור → 3 ממדים מחודשים

**לכל אפשרות ספק:**
- נימוק תיאורטי (MECE)
- היתכנות פסיכומטרית (α צפוי)
- השפעה על UX (עוד ממדים = יותר שאלות)
- סיכון עסקי (האם זה מסבך את המסר לשוק?)

### סעיף 5: Edmondson PSI — המלצה

- לשלב ב-UC? ממד נפרד? משתנה ממתן (moderator)?
- השפעה על scoring logic
- השפעה על comorbidity map

### סעיף 6: שאלות למחקר המשך

אם זיהית נושאים שדורשים **מחקר אמפירי** (לא ניתן להכריע על בסיס ספרות בלבד):
- מה צריך לחקור?
- באיזו מתודולוגיה (סקר, ראיונות, ניתוח case)?
- כמה N נדרש?

---

## חלק ז׳: אילוצים

1. **ICP:** ארגוני 50–300 עובדים, Growth stage (Series A–C), Cyber/Fintech/AI/B2B
2. **Self-report:** כל המדידות הן שאלוני self-report (לא 360°, לא observer-report)
3. **שפה:** עברית, מנהלים (CEO/COO/CFO)
4. **כמות:** מקסימום 48 שאלות (12 Macro + 15 Meso + 21 Micro)
5. **זמן:** 15 דקות מקסימום לשאלון מלא
6. **פרקטיות:** ממד שצריך 15 שאלות למדידה = לא מעשי. ממד שניתן למדידה ב-2-3 שאלות Macro = מעשי
7. **בידול:** COR-SYS צריך להיות **שונה** מ-McKinsey OHI, CultureAmp, Qualtrics. לא עוד סקר engagement. ה-USP הוא **אבחון פתולוגי** (כמו DSM פסיכיאטרי)

---

## חלק ח׳: קריטריוני הצלחה

תוצר מוצלח אם:

1. **MECE מוכח:** מטריצה שמראה כיסוי מלא ללא חפיפות
2. **בסיס מחקרי:** כל פער נתמך ב-2+ מקורות אקדמיים
3. **פרקטיות:** כל ממד מוצע ניתן למדידה ב-2-3 שאלות Macro
4. **השפעה מוגדרת:** לכל שינוי — השפעה ברורה על scoring, comorbidity, intervention
5. **המלצה חד-משמעית:** בסוף — "המודל צריך N ממדים, ואלה הם: ..."
6. **חפיפות מטופלות:** חפיפות שזוהו (DR↔SC, UC↔SC, ND↔UC) — מוצעים קריטריונים להבחנה

---

## חלק ט׳: כיצד להשתמש בפרומפט

- **לחוקר אנושי:** העבר מסמך זה כמשימת ניתוח. בקש תוצר מובנה לפי סעיפים 1-6
- **לכלי AI (מחקר עמוק):** העבר כפרומפט. הפעל עם deep research/knowledge mode
- **לאחר קבלת תוצאות:** עדכן `dsm-engine.ts`, `dsm-policy-engine.ts` ו-`corsys-questionnaire.ts`

---

## נספח: קבצי מקור לעיון

| קובץ | כולל |
|-------|------|
| `src/lib/dsm-engine.ts` | 4 פתולוגיות, scoring, comorbidity, interventions |
| `src/lib/dsm-policy-engine.ts` | benchmarks, golden questions, decision rules, feedback |
| `src/lib/corsys-questionnaire.ts` | 11 שאלות + 7 PSI + scoring logic |
| `docs/business-framework.md` | מסגרת J-Quotient, 3 תצורות אנטרופיה, PRISM |
| `docs/research-prompt-48-questions-complete.md` | פרומפט מחקרי קודם — 48 שאלות ו-sub-dimensions |
