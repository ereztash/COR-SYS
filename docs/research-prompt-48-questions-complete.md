# פרומפט מחקר: עיצוב 48 שאלות לשאלון COR-SYS — מפרט מלא

## הוראה למודל/חוקר

אתה מומחה בשילוב של פסיכולוגיה ארגונית, ניהול סיכונים (BCM/BIA), ופסיכומטריקה. המשימה שלך: לספק את **48 השאלות המדויקות** עבור שאלון אבחון ארגוני של מערכת COR-SYS, כולל ניסוח מלא, אפשרויות תשובה, מיפוי לציונים, ולוגיקת Tier.

**תוצר נדרש:** מסמך מובנה שניתן ליישם ישירות בקוד TypeScript — שאלות, ערכי תשובה, scoring weights, ולוגיקת הפעלת Tier.

---

## חלק א׳: ההקשר — מה COR-SYS מודד ולמה

### המודל התיאורטי

COR-SYS מודד **אנטרופיה ארגונית** — הפער בין הקיבולת הקוגניטיבית של ארגון (C) לבין האנטרופיה שצורכת אותה (E).

**נוסחה:** J(t) = C(t) / E(t)
**סף קריסה:** כאשר E > 65% מ-C → הסתברות קריסה תפקודית עולה ב-+300% (לא ליניארי).

### שלוש הפתולוגיות (DSM ארגוני)

המנוע מאבחן **שלוש פתולוגיות ארגוניות** — כל אחת עם ציון 0–10 ורמת חומרה (1=subclinical, 2=moderate, 3=severe):

| קוד | שם | שם עברי | מקור תיאורטי | מה זה |
|------|----|---------|---------------|--------|
| **DR** | Distorted Reciprocity | הדדיות מעוותת | Hobfoll (COR), Game Theory | תחרות פנימית zero-sum, אינטרסים מנוגדים בין מחלקות, תגמול שמעודד "win-lose" |
| **ND** | Normalization of Deviance | נורמליזציית סטייה | Vaughan (1996), NASA Challenger | עקיפת נהלים שנתפסת כנורמלית, workarounds, heroes culture, סחיפה מסטנדרטים |
| **UC** | Unrepresentative Calibration | כיול לא-מייצג | Argyris (Double-Loop), Edmondson (Psychological Safety), Floridi (Ontological Friction) | הארגון לא לומד מטעויות, single-loop בלבד, פער בין מה שחושבים לבין מה שקורה, drift סמנטי |

### קורלציות מוכחות (סימולציה N=10,000)

- DR ↔ ND: r = 0.19 (חיובית חלשה) — תחרות פנימית מייצרת לחץ שמנרמל סטיות
- DR ↔ UC: r = -0.27 (שלילית מתונה) — תחרות מעכבת למידה ארגונית
- ND ↔ UC: r = 0.28 (חיובית מתונה) — נורמליזציית סטיות פוגעת ביכולת למידה
- Cronbach's α: DR=.872, ND=.881, UC=.893

---

## חלק ב׳: מצב נוכחי — 10 השאלות הקיימות

כרגע בשאלון **10 שאלות** בשלושה בלוקים. כולן select עם 3-4 אפשרויות:

### בלוק ICP (3 שאלות — לא מודדות pathology)

```
Q1: championRole → "מהו תפקידך?" (ceo/coo/cfo/other)
Q2: companySize → "מספר עובדים?" (under_50/50_150/150_300/over_300)
Q3: industrySector → "ענף?" (cyber_fintech/ai_healthtech/complex_b2b/other)
```

**שימוש:** פרופיל לקוח, מיפוי ל-ICP (50-300 עובדים), השפעה על המלצת שירות (L1/L2/L3).

### בלוק Pathologies (4 שאלות — ממפות ישירות לציונים)

```
Q4: pathologyNod → "עקיפת נהלים / workarounds" (high=8.5, medium=5.0, low=1.5) → ND
Q5: pathologyZeroSum → "חיכוך בין-מחלקתי" (frequent=8.5, occasional=5.0, rare=1.5) → DR
Q6: pathologyLearning → "תגובה לתקלות" (single_loop=8.0, mixed=4.5, double_loop=1.0) → UC (50%)
Q7: pathologySemantic → "בהירות הגדרות" (high_drift=8.0, medium_drift=4.5, low_drift=1.0) → UC (50%)
```

**מיפוי ציונים נוכחי:**
- DR = pathologyZeroSum_score + latency_modifier (אם score > 3.0)
- ND = pathologyNod_score + latency_modifier (אם score > 3.0)
- UC = avg(pathologyLearning_score, pathologySemantic_score) + latency_modifier (אם score > 3.0)
- latency_modifier: over_15 → +1.5, 5_to_15 → +0.5, under_5 → 0

### בלוק Metrics (3 שאלות — משפיעות על המלצת שירות)

```
Q8: decisionLatency → "שעות/שבוע על כיבוי שריפות" (over_15/5_to_15/under_5)
Q9: interventionGoal → "יעד" (reduce_latency/reduce_entropy/both/audit_only)
Q10: urgencyLevel → "דחיפות" (high/medium/low)
```

**שימוש:** לוגיקת המלצה — L1 Live Demo / L2 Sprint / L2 Retainer.

---

## חלק ג׳: מה נדרש — 48 שאלות ב-3 Tiers

### מבנה Tiers

| Tier | רמה | כמות שאלות | מתי מופעל | מטרה |
|------|------|------------|-----------|------|
| **Tier 1 — Macro** | סריקה ראשונית | **12** שאלות | תמיד | הערכה גסה של DR/ND/UC + פרופיל ICP. מספיק כדי לקבוע severity profile ראשוני ולהמליץ על שירות |
| **Tier 2 — Meso** | העמקה | **15** שאלות | ממוצע Tier 1 ≥ 7.0 | מדידת sub-dimensions בתוך כל pathology. מדייק את הציון ומזהה את מוקד הבעיה |
| **Tier 3 — Micro** | מיקרו-אבחון | **21** שאלות | ממוצע Tier 2 ≥ 6.0 | עדויות התנהגויות ספציפיות, תדירויות, מקרי קצה. מאפשר פרוטוקול התערבות מדויק + PDF מפורט |

### חלוקה לפי pathology (מטרה)

| Pathology | Tier 1 (Macro) | Tier 2 (Meso) | Tier 3 (Micro) | סה"כ |
|-----------|---------------|---------------|----------------|------|
| ICP/Context | 3 | 0 | 0 | 3 |
| DR | 2 | 5 | 7 | 14 |
| ND | 2 | 5 | 7 | 14 |
| UC | 3 | 5 | 7 | 15 |
| Metrics | 2 | 0 | 0 | 2 |
| **סה"כ** | **12** | **15** | **21** | **48** |

---

## חלק ד׳: דרישות מפורטות — מה לספק לכל שאלה

### פורמט לכל שאלה

לכל אחת מ-48 השאלות, ספק:

```typescript
{
  key: string                  // מזהה ייחודי באנגלית (camelCase)
  tier: 1 | 2 | 3             // Macro / Meso / Micro
  pathology: 'DR' | 'ND' | 'UC' | 'ICP' | 'METRICS'
  subDimension: string         // תת-ממד (למשל "reward_structure", "near_miss_reporting")
  questionHe: string           // ניסוח מלא בעברית — ברור, לא אקדמי, מתאים למנהלים
  type: 'select'               // כל השאלות select (עקביות)
  required: boolean
  options: Array<{
    value: string              // מזהה (באנגלית)
    label: string              // תווית בעברית
    score: number              // ציון מספרי 0-10 לחישוב pathology
  }>
  researchBasis: string        // מקור תיאורטי (Vaughan, Argyris, Edmondson, וכו')
  rationale: string            // למה דווקא שאלה זו — מה היא מודדת שאחרות לא
}
```

### כללי ניסוח

1. **שפה:** עברית ברורה, לא אקדמית, מותאמת ל-CEO/COO/CFO (לא עובד זוטר)
2. **אורך:** עד 2 משפטים לשאלה. אפשר הקדמה קצרה + שאלה
3. **אפשרויות:** 3 אפשרויות לכל שאלה (עקביות). כל אפשרות = תיאור מצב, לא "מסכים/לא מסכים"
4. **ציון:** כל אפשרות מקבלת ציון מספרי (0-10) שמשתתף בחישוב ה-pathology score
5. **אין כפילות:** כל שאלה חייבת למדוד construct אחר — אין שתי שאלות שמודדות את אותו דבר
6. **Tier 1 = גס, Tier 3 = ספציפי:** שאלות Macro שואלות "באיזו תדירות..." בעוד שאלות Micro שואלות "ספר מקרה אחרון..."

---

## חלק ה׳: לוגיקת Scoring — מה בדיוק לחשב

### ציון pathology לכל Tier

**Tier 1 (Macro) — ציון ראשוני:**

```
DR_score_t1 = weighted_avg(שאלות DR ב-Tier 1)
ND_score_t1 = weighted_avg(שאלות ND ב-Tier 1)
UC_score_t1 = weighted_avg(שאלות UC ב-Tier 1)
```

ספק: האם ממוצע פשוט או ממוצע משוקלל? אם משוקלל — מה המשקלות ולמה?

**Tier 2 (Meso) — ציון מעודכן:**

```
DR_score_t2 = weighted_avg(שאלות DR ב-Tier 1 + Tier 2)
```

או:

```
DR_score_t2 = α * DR_score_t1 + (1-α) * avg(שאלות DR ב-Tier 2 בלבד)
```

ספק: איזה מודל — ממוצע כולל, או שקלול עם עדיפות ל-Tier 2? מה α?

**Tier 3 (Micro) — ציון סופי:** אותה שאלה.

### לוגיקת הפעלת Tier

```
trigger_tier2 = avg(DR_score_t1, ND_score_t1, UC_score_t1) >= 7.0
```

**שאלות שצריכות תשובה:**
1. האם הממוצע הוא על כל 3 ה-pathologies, או מספיק ש-**אחת** מהן ≥ 7.0?
2. אם ND = 9.0 אבל DR = 2.0 ו-UC = 2.0, ממוצע = 4.3 — האם לא להפעיל Tier 2?
3. האם Tier 2 מופעל **רק לפתולוגיה הגבוהה** או לכולן?

**המלצת המערכת הנוכחית (לפי product-roadmap):** "ממוצע ≥ 7.0" — אך זה לא מוגדר מספיק. **ספק הגדרה חד-משמעית.**

### latency modifier

כרגע `decisionLatency` מוסיף +1.5 / +0.5 / 0 לכל pathology score.
**שאלה:** האם הלוגיקה הזו נשארת, או ש-Tier 2/3 מכילות שאלות שמחליפות את ה-modifier?

---

## חלק ו׳: תת-ממדים (Sub-Dimensions) — מה לכסות

להלן ה-sub-dimensions שכל pathology צריכה למדוד. **ספק שאלה אחת לפחות לכל sub-dimension.**

### DR — Distorted Reciprocity (הדדיות מעוותת)

| Sub-Dimension | מה מודד | מקור |
|---------------|---------|------|
| **DR-1: Zero-Sum Dynamics** | תפיסה שהצלחת מחלקה = כישלון אחרת | Game Theory, COR |
| **DR-2: Reward Misalignment** | מערכת תגמול שמעודדת תחרות פנימית במקום שיתוף פעולה | Incentive Theory |
| **DR-3: Information Hoarding** | מחלקות עוצרות מידע כי "ידע = כוח" | Knowledge Management |
| **DR-4: Cross-Functional Trust** | רמת אמון בין מחלקות (האם נציגים מדברים בכנות?) | Organizational Trust |
| **DR-5: Conflict Resolution** | איך נפתרים קונפליקטים — בהסלמה, בהימנעות, או בשיתוף? | Conflict Management |
| **DR-6: KPI Transparency** | האם מדדים ויעדים חשופים לכלל הארגון? | OKR / Transparency |
| **DR-7: Resource Competition** | תחרות על תקציבים, כוח אדם, תשומת לב מנהלים | Resource Dependence Theory |

### ND — Normalization of Deviance (נורמליזציית סטייה)

| Sub-Dimension | מה מודד | מקור |
|---------------|---------|------|
| **ND-1: Workaround Prevalence** | תדירות עקיפת נהלים ו"מעקפים" | Vaughan 1996 |
| **ND-2: Heroes Culture** | תלות באנשים ספציפיים שמריצים הכל | Single Point of Failure |
| **ND-3: Escalation Patterns** | האם חריגים מדווחים או נבלעים? | Safety Culture |
| **ND-4: Procedure-Reality Gap** | פער בין ספר נהלים למציאות בשטח | Hollnagel (Work-as-Imagined vs Work-as-Done) |
| **ND-5: Management Awareness** | האם ההנהלה מודעת לסטיות, או שמתעלמת? | Blind Spot |
| **ND-6: Near-Miss Reporting** | האם מדווחים על כמעט-תקלות? | High Reliability Organizations |
| **ND-7: Drift Velocity** | מהירות הסחיפה מסטנדרטים — הדרגתית או פתאומית | Rasmussen's Drift |

### UC — Unrepresentative Calibration (כיול לא-מייצג)

| Sub-Dimension | מה מודד | מקור |
|---------------|---------|------|
| **UC-1: Single vs Double Loop** | תגובה לכישלון — תיקון נקודתי או שינוי הנחות | Argyris & Schön |
| **UC-2: Semantic Drift** | פער הגדרות מונחים בין מחלקות | Floridi (Ontological Friction) |
| **UC-3: Psychological Safety** | האם בטוח לומר "אני לא יודע" או "טעיתי"? | Edmondson 1999 |
| **UC-4: Knowledge Retention** | מה קורה לידע כשמישהו עוזב? | Knowledge Management |
| **UC-5: Self-Assessment Accuracy** | פער בין מה שהארגון חושב שקורה לבין מה שקורה (Ontological Friction) | Floridi, Dunning-Kruger Org |
| **UC-6: Post-Mortem Culture** | האם יש post-mortems? האם מתקיימים? האם פועלים על הממצאים? | Incident Management |
| **UC-7: Cross-Silo Learning** | האם תובנות ממחלקה אחת מגיעות לאחרות? | Organizational Learning |
| **UC-8: Crisis Communication** | יכולת הארגון לתקשר בצורה ברורה ומדויקת בזמן משבר | Crisis Communication Theory |

---

## חלק ז׳: המלצת שירות — לוגיקה שלמה

### חוקי ההמלצה הנוכחיים (נשמרים)

```
Rule 1 → L2 Sprint (חירום):
  IF decisionLatency == "over_15"
  OR (isLargeOrg AND entropyScore >= 2)
  OR (interventionGoal == "both" AND urgencyLevel == "high")

Rule 2 → L2 Retainer:
  IF (championRole in ["ceo","cfo"])
  AND (pathologySemantic == "high_drift" OR pathologyLearning == "single_loop")

Rule 3 → L1 Live Demo:
  IF interventionGoal == "audit_only"
  OR (decisionLatency == "under_5" AND urgencyLevel == "low")
  OR (companySize == "under_50" AND entropyScore < 2)

Default → L1 Live Demo
```

**שאלה:** כאשר יש 48 שאלות וציונים גרנולריים (לא binary), האם הכללים צריכים להתעדכן?
**ספק:** כללי המלצה מעודכנים שמתבססים על ציוני ה-pathology הסופיים (0-10) במקום על ערכים בודדים.

---

## חלק ח׳: פרוטוקולי התערבות — מיפוי לשאלות

המערכת כוללת 4 פרוטוקולי התערבות:

| Protocol | Trigger | שם |
|----------|---------|-----|
| 4.1 | ND ≥ Level 2 | NOD → BIA Remediation |
| 4.2 | UC ≥ Level 2 | Learning → Exercise Design |
| 4.3 | UC ≥ Level 2 AND semantic == high_drift | Blame → Crisis Reporting |
| 4.4 | 2+ pathologies ≥ Level 2 | Integrated System Intervention |

**שאלה:** עם 48 שאלות, האם כל פרוטוקול צריך triggering מדויק יותר (ברמת sub-dimension)?
למשל: Protocol 4.1 מופעל רק אם ND-1 (workarounds) ≥ 7 AND ND-3 (escalation) ≤ 3?

**ספק:** כללי triggering מעודכנים לפי sub-dimensions אם רלוונטי.

---

## חלק ט׳: שאלות פתוחות — הכרעות נדרשות

### שאלה 1: Tier 2 הפעלה סלקטיבית או גלובלית?

כאשר Tier 1 מראה DR=9.0, ND=2.0, UC=3.0 (ממוצע 4.7):
- **אפשרות A (סלקטיבית):** Tier 2 מופעל רק עבור DR (כי רק היא ≥ 7.0) → 5 שאלות נוספות
- **אפשרות B (גלובלית):** Tier 2 מופעל לכולן אם לפחות אחת ≥ 7.0 → 15 שאלות נוספות
- **אפשרות C (ממוצע):** Tier 2 מופעל רק אם ממוצע כולל ≥ 7.0

**ספק:** בחירה מנומקת + השלכות על UX (כמה שאלות הלקוח רואה).

### שאלה 2: ציון Tier 3 — לאבחון או להמלצה?

21 שאלות Micro — האם התוצאה שלהן:
- **אפשרות A:** משפיעה על ציון ה-pathology הסופי (0-10) ועל המלצת שירות
- **אפשרות B:** משמשת רק לדו"ח PDF מפורט + פרוטוקול התערבות ספציפי, בלי לשנות את ציון ה-pathology
- **אפשרות C:** משלב — מעדנת ציון ב-±1.0 מקסימום, שאר הערך בדו"ח

**ספק:** בחירה מנומקת.

### שאלה 3: 10 השאלות הקיימות — שינוי או שימור?

10 השאלות הנוכחיות נכתבו לפני ה-DSM engine. חלקן ממפות ל-pathology בצורה גסה (שאלה אחת = ציון שלם).

**ספק:** לכל שאלה קיימת — האם:
- (א) נשארת כפי שהיא (כחלק מ-Tier 1)
- (ב) משתנה (ניסוח/אפשרויות/ציון) — ציין מה בדיוק
- (ג) מוחלפת בשאלה אחרת — ציין מה ולמה

### שאלה 4: Greiner Stage

כרגע אין שאלה שמזהה את **שלב Greiner** (משבר מנהיגות, אוטונומיה, שליטה, ביורוקרטיה).
**ספק:** האם להוסיף שאלה שמזהה שלב Greiner? אם כן — באיזה Tier ואיך זה משפיע על הציון?

### שאלה 5: Dunbar Threshold

המחקר מבוסס על Dunbar's Number (150 עובדים כסף שבירת רשתות לא-פורמליות).
כרגע `companySize` מכסה את זה ברמה גסה.
**ספק:** האם צריך שאלה ישירה על "האם יש מחלקות שלא מכירות אחת את השנייה?" כ-proxy ל-Dunbar, או ש-`companySize` מספיק?

---

## חלק י׳: אילוצי UX

1. **Self-serve:** הלקוח ממלא לבד (אין מנחה). השאלות חייבות להיות ברורות ללא הסבר
2. **Mobile:** חייב לעבוד על פלאפון (select בלבד, לא sliders)
3. **זמן:** Tier 1 = עד 3 דקות, Tier 2 = 5 דקות נוספות, Tier 3 = 7 דקות נוספות. 15 דקות מקסימום לכל 48
4. **שפה:** עברית. אין ז'רגון אקדמי. מנהלים (CEO/COO/CFO) צריכים להבין מיד
5. **No Likert:** לא "1-5 מסכים/לא מסכים". כל אפשרות = תיאור מצב ("כמעט תמיד..." / "לעיתים..." / "נדיר...")
6. **Progressive disclosure:** Tier 2 ו-3 מופיעים רק אם הם רלוונטיים. הלקוח לא רואה 48 שאלות מראש

---

## חלק יא׳: פורמט התוצר הנדרש

ספק את התוצר בפורמט הבא. **חובה** לכלול את כל הסעיפים:

### סעיף 1: טבלת 48 השאלות

לכל שאלה:
- `key` (camelCase)
- `tier` (1/2/3)
- `pathology` (DR/ND/UC/ICP/METRICS)
- `subDimension` (מהרשימה בחלק ו׳, או חדש אם מנומק)
- ניסוח מלא בעברית
- 3 אפשרויות (value + label + score)
- `researchBasis` — מקור (Vaughan 1996, Edmondson 1999, וכו')
- `rationale` — למה דווקא שאלה זו

### סעיף 2: מיפוי Scoring

- נוסחת חישוב ציון pathology לכל Tier (ממוצע פשוט / משוקלל / אחר)
- משקלות (weights) לכל שאלה אם רלוונטי
- latency modifier — האם נשמר, משתנה, או מוחלף
- severity thresholds: ≤3.0 = Level 1, 3.1-6.5 = Level 2, ≥6.6 = Level 3 (או שינוי מנומק)

### סעיף 3: לוגיקת Tier

- הגדרה חד-משמעית: מתי Tier 2 מופעל? לכל ה-pathologies או רק לגבוהות?
- הגדרה: מתי Tier 3 מופעל?
- מה קורה אם לקוח לא עובר Tier 2 (ציון < 7.0)? האם ציון Tier 1 הוא הסופי?

### סעיף 4: כללי המלצת שירות מעודכנים

- Rule table: IF (conditions on final scores) → THEN (L1/L2/L3 + service option)
- שימוש בציונים 0-10 הסופיים, לא בערכים בודדים

### סעיף 5: Protocol Triggering מעודכן

- לכל פרוטוקול (4.1-4.4): תנאי הפעלה מעודכנים לפי sub-dimensions (אם רלוונטי)

### סעיף 6: שאלות שהשתנו

- מהן 10 השאלות הקיימות שנשארו / שהשתנו / שהוחלפו — ולמה

### סעיף 7: תשובות לשאלות הפתוחות

- תשובות מנומקות לשאלות 1-5 מחלק ט׳

---

## חלק יב׳: קריטריוני הצלחה — איך לדעת שהתוצר טוב

תוצר מוצלח אם:

1. **כיסוי מלא:** כל sub-dimension מחלק ו׳ מכוסה בשאלה אחת לפחות
2. **אין כפילות:** אין שתי שאלות שמודדות construct זהה
3. **Cronbach's α תיאורטי:** קבוצת השאלות לכל pathology צפויה להניב α ≥ 0.80
4. **ישימות:** מנהל יכול לענות על Tier 1 ב-3 דקות ועל הכל ב-15 דקות
5. **חד-משמעיות:** לוגיקת Scoring ו-Tier מתורגמת ישירות לקוד TypeScript בלי שאלות פתוחות
6. **תיאום עם קיים:** 10 השאלות הקיימות מטופלות מפורשות (שימור / שינוי / החלפה)
7. **מקרי קצה:** מוגדר מה קורה כשלקוח עונה "הכי טוב" על הכל (floor), "הכי גרוע" על הכל (ceiling), ותערובות קיצוניות
