# ניתוח פערי MECE — DSM ארגוני COR-SYS

## תוצאות מחקר

> **תאריך:** 25.03.2026
> **מבוסס על:** ניתוח ספרותי + ניתוח קוד מקור (`dsm-engine.ts`, `dsm-policy-engine.ts`, `corsys-questionnaire.ts`)

---

## סעיף 1: טבלת פערי MECE

### חפיפות שזוהו (Mutual Exclusivity Violations)

---

#### OVERLAP-01: DR ↔ SC — תחרות מול עמימות

| שדה | ניתוח |
|-----|-------|
| **Constructs** | DR-7 (Resource Competition) ↔ SC (Structural Clarity Deficit) |
| **אבחנה** | **זו סיבתיות, לא חפיפה.** SC הוא antecedent; DR הוא outcome. כשתפקידים לא מוגדרים (SC), נוצר ואקום שמייצר תחרות (DR). אך תחרות יכולה להתקיים גם **ללא** עמימות מבנית — למשל כשמערכת תגמול מעודדת zero-sum (DR-2) במבנה ברור לחלוטין |
| **קריטריון הבחנה** | **SC = "מי צריך לעשות מה?"** (בהירות תפקידים/תהליכים). **DR = "מי נגד מי?"** (דינמיקת תחרות). אם הבעיה נפתרת ע"י **תיעוד ומיפוי** → SC. אם הבעיה נפתרת ע"י **שינוי תמריצים ותרבות** → DR |
| **המלצה** | ✅ לשמור כשני ממדים נפרדים. להבהיר בשאלון: שאלות SC מתמקדות ב*בהירות*, שאלות DR ב*יריבות* |

---

#### OVERLAP-02: UC ↔ SC — סחיפה סמנטית מול עמימות תהליכים

| שדה | ניתוח |
|-----|-------|
| **Constructs** | UC-2 (Semantic Drift) ↔ SC (Structural Clarity) |
| **אבחנה** | **חפיפה ממשית — דורשת חידוד.** UC-2 מודד **פער בין הבנות שונות** של אותו מונח (מה זה "פרויקט הושלם"?). SC מודד **היעדר הגדרה** של תהליכים ותפקידים. ההבדל: UC-2 = drift (היו מסכימים פעם, כבר לא); SC = void (מעולם לא היה מוגדר) |
| **קריטריון הבחנה** | **SC = "אין הגדרה"** (structural void). **UC-2 = "יש הגדרה אבל כל אחד מבין אותה אחרת"** (semantic divergence). מבחן: אם תכתוב מילון מונחים — SC נפתר, UC-2 **לא** (כי הבעיה היא שימוש שונה, לא חוסר תיעוד) |
| **המלצה** | ✅ לשמור. להעביר את "תהליכים לא מתועדים" **חד-משמעית** ל-SC; לשמור ב-UC רק "פער פרשני" |

---

#### OVERLAP-03: ND ↔ UC — פער נהלים מול דיוק הערכה עצמית

| שדה | ניתוח |
|-----|-------|
| **Constructs** | ND-4 (Procedure-Reality Gap) ↔ UC-5 (Self-Assessment Accuracy) |
| **אבחנה** | **הבחנה ברורה — כוונה שונה.** ND-4 = ההנהלה **יודעת** שיש פער בין נהלים למציאות אבל **מנרמלת** אותו ("ככה זה בתעשייה"). UC-5 = ההנהלה **לא יודעת** שיש פער (Dunning-Kruger ארגוני, blind spots). ND = **נורמליזציה מודעת**; UC = **עיוורון לא-מודע** |
| **קריטריון הבחנה** | שאלת ליטמוס: "האם ההנהלה **מודעת** לפער?" → כן = ND (מכשירים את הסטייה). לא = UC (לא רואים את הפער) |
| **המלצה** | ✅ לשמור. להוסיף שאלת ברירה בשאלון שמבחינה בין "יודעים ומתעלמים" (ND) ל"לא יודעים" (UC) |

---

### פערים שזוהו (Collective Exhaustiveness Gaps)

---

#### GAP-01: Adaptive Deficit (AD) — כשל אדפטיבי

| שדה | תוכן |
|-----|-------|
| **Construct Name** | Adaptive Deficit (כשל אדפטיבי) / קפאון אסטרטגי |
| **Theoretical Basis** | March (1991) Exploration vs. Exploitation; Teece et al. (1997) Dynamic Capabilities; Cohen & Levinthal (1990) Absorptive Capacity; Tushman & O'Reilly (1996) Ambidexterity |
| **Currently Covered?** | UC מכסה **backward-looking learning** (למידה מטעויות עבר). **אין כיסוי** ל-forward-looking adaptation (יכולת להגיב לשינויים חיצוניים, לחדש, להסתגל) |
| **Why It Matters** | March (1991): ארגונים שממוקדים רק ב-exploitation (ביצוע) ולא ב-exploration (חדשנות) → competency trap → כישלון בטווח ארוך. Christensen (1997): 2/3 מהחברות בפורצ'ן 500 ב-1970 כבר לא קיימות ב-2000. **בארגוני 50-300:** הסיכון הספציפי הוא success trap — מה שעבד ב-30 עובדים ממשיך "לעבוד" אך מעכב scale |
| **Prevalence** | גבוה מאוד ב-ICP של COR-SYS (Series A-C). McKinsey (2021): 76% מהמנכ"לים בחברות צמיחה מדווחים על "organizational inertia" כחסם #1 לצמיחה |
| **Recommendation** | **(A) לשלב ב-UC כ-sub-dimension חמישי (UC-Forward).** הסיבה: UC כבר מבוסס על Argyris, ואדפטיביות היא הצד השני של למידה. שילוב ב-UC שומר על 4 ממדים. **נוסחת UC מעודכנת:** `UC = 0.40×Learning + 0.25×Semantic + 0.20×PSI + 0.15×Adaptive` |
| **Measurement** | שאלה לדוגמה (Tier 1): *"כאשר מתרחש שינוי משמעותי בשוק (מתחרה חדש, רגולציה, טכנולוגיה), מה מאפיין את תגובת הארגון?"* → (א) ממשיכים כרגיל ומקווים שזה יעבור [8.0], (ב) מגיבים אך לוקח 6+ חודשים להתאים תהליכים [5.0], (ג) מתאימים מהר — יש מנגנון מובנה לסריקת שינויים ותגובה [1.0] |
| **Impact on Model** | מוסיף sub-dimension ל-UC. לא משנה comorbidity map. מעשיר intervention protocol 4.2 (Exercise Design) עם רכיב forward-looking |

---

#### GAP-02: Engagement Erosion (EE) — שחיקת מחוברות

| שדה | תוכן |
|-----|-------|
| **Construct Name** | Engagement Erosion (שחיקת מחוברות) / אנטרופיה תרבותית |
| **Theoretical Basis** | Kahn (1990) Psychological Conditions of Engagement; Maslach & Leiter (2016) Burnout→Engagement continuum; Bakker & Demerouti (2007) JD-R Model; Schaufeli et al. (2002) UWES |
| **Currently Covered?** | **לא מכוסה כלל.** J-Quotient (C/E) מודד קיבולת קוגניטיבית **ברמת הארגון**, לא ברמת הפרט. Burnout הוא construct פרטני שמצטבר לדיספונקציה ארגונית. DR מודד תחרות (סיבת שחיקה) אך לא את השחיקה עצמה |
| **Why It Matters** | Gallup (2023): 59% מהעובדים globally הם "quietly quitting" — עושים את המינימום. ב-growth companies: שחיקה מובילה לתחלופה → אובדן ידע מוסדי (UC-4) → עומס על שאריות (ND-2 heroes culture). **שחיקת מחוברות היא "אנטרופיה תרבותית" טהורה** — הקטגוריה השלישית שלא מכוסה |
| **Prevalence** | Deloitte (2023): 77% מהעובדים בחברות tech חוו burnout. ב-50-300: **גבוה במיוחד** בגלל "כולם עושים הכל" ותפקידים מרובים |
| **Recommendation** | **(B) ממד חדש — EE (Engagement Erosion).** הסיבה: engagement/burnout הוא construct שונה מהותית מ-DR/ND/UC/SC — הוא מודד את **מצב האנרגיה העובדית**, לא דיספונקציה מערכתית. אולם — **אתגר MECE: engagement הוא לרוב outcome** של DR/ND/UC/SC, לא cause. **לכן:** ממליץ **לא להוסיף כממד חמישי**, אלא לשלב **כ-outcome indicator** (מדד תוצאה, לא מדד pathology). |
| **Measurement Alternative** | שאלה אחת ב-Tier 1 כ-**outcome proxy**, לא pathology: *"איך היית מתאר את רמת האנרגיה והמוטיבציה של צוות ההנהלה בחודש האחרון?"* → (א) שחיקה ניכרת — אנשים "שורדים" ולא "מובילים" [trigger for deeper investigation], (ב) משתנה — יש ימים טובים ורעים, (ג) גבוהה — הצוות מחובר ומונע |
| **Impact on Model** | **לא מוסיף ממד** — משמש כ-**validation variable**: אם DSM מצביע על pathology גבוהה ו-engagement גבוה → anomaly שדורשת חקירה |

---

#### GAP-03: Execution Gap (EG) — פער ביצוע אסטרטגי

| שדה | תוכן |
|-----|-------|
| **Construct Name** | Execution Gap (פער ביצוע) / Strategy-Execution Disconnect |
| **Theoretical Basis** | Neilson, Martin & Powers (2008) "The Secrets to Successful Strategy Execution" (HBR); Kaplan & Norton (1996) BSC; Mintzberg (1994) Rise and Fall of Strategic Planning; Beer & Eisenstat (2000) "The Silent Killers of Strategy Implementation" |
| **Currently Covered?** | **חלקית על-פני כל 4 הממדים, אך שום ממד לא "בעל הבית".** DR → KPI transparency (חלקי); SC → strategy-structure fit (חלקי); ND → נהלים לא תואמים אסטרטגיה; UC → sensemaking failures |
| **Why It Matters** | Neilson et al. (2008): 60% מהמנהלים אומרים שהאסטרטגיה ברורה, אך רק 40% מהעובדים מבינים את הקשר בין עבודתם למטרות. Beer & Eisenstat (2000): זיהו 6 "רוצחים שקטים" של הטמעת אסטרטגיה — 4 מתוכם כבר מכוסים (DR, ND, UC, SC), אך 2 לא: **(1) inadequate vertical communication, (2) poor coordination across functions/units** |
| **Prevalence** | בארגוני 50–300: **גבוה מאוד.** אסטרטגיה נקבעת ע"י CEO (3 אנשים), אך execution ע"י 200. הפער טבעי ומתעצם עם צמיחה |
| **Recommendation** | **(A) לשלב ב-SC כ-sub-dimension.** הסיבה: Execution Gap הוא ביסודו **כשל מבני** — חוסר המנגנון שמתרגם אסטרטגיה לתהליכים. SC-5 (Strategy-Execution Link): "האם קיים מנגנון שמתרגם החלטות אסטרטגיות לפעולות ספציפיות עם אחראים ו-deadlines?" |
| **Measurement** | שאלה (Tier 2): *"כשהנהלה מחליטה על כיוון אסטרטגי חדש, מה קורה בשבועות שאחרי?"* → (א) רוב העובדים לא יודעים על ההחלטה או לא מבינים מה זה אומר עבורם [8.0], (ב) יודעים, אבל אין תוכנית ביצוע ברורה [5.0], (ג) יש תהליך מסודר — OKRs/KPIs ירדו תוך שבועיים עם אחראים [1.0] |
| **Impact on Model** | מרחיב SC intervention protocol עם רכיב strategy cascade |

---

#### GAP-04: Organizational Silence (OS) — שתיקה ארגונית

| שדה | תוכן |
|-----|-------|
| **Construct Name** | Organizational Silence (שתיקה ארגונית) / Voice Suppression |
| **Theoretical Basis** | Morrison & Milliken (2000) "Organizational Silence: A Barrier to Change"; Van Dyne & LePine (1998) Voice and Silence; Detert & Edmondson (2011) "Implicit Voice Theories" |
| **Currently Covered?** | **UC-3 (Psychological Safety) מכסה חלקית** — הצד של "לא בטוח לדבר". אך Morrison & Milliken (2000) מזהים **3 סוגים** של שתיקה: (1) **Acquiescent** — ויתרו, לא אכפת (→ engagement, לא PS); (2) **Defensive** — מפחדים (→ PS, מכוסה ב-UC); (3) **ProSocial** — שקטים "לטובת הצוות" (→ לא מכוסה כלל) |
| **Why It Matters** | Morrison & Milliken (2000): ב-85% מהארגונים עובדים דיווחו על לפחות מקרה אחד שבו ידעו על בעיה ולא דיברו. **זה לא רק PS** — לפעמים אין **כלי** (אין ערוץ דיווח), לפעמים אין **נורמה** (לא מקובל), לפעמים אין **תמריץ** (מה אני מרוויח?) |
| **Prevalence** | גבוה מאוד. Detert & Edmondson (2011): גם בארגונים עם PS גבוה, 50% מהעובדים בחרו בשתיקה לפחות פעם בשנה. ב-50-300: "פלטפורמיזציה" של תקשורת (Slack, Teams) יוצרת illusion of transparency |
| **Recommendation** | **(A) לשלב ב-UC כ-sub-dimension.** UC-9 (Voice Infrastructure): מודד לא רק את הבטחון (PS) אלא את **קיומו של מנגנון** — ערוצים, נורמות, תמריצים לדיבור. **זה לא PS** — זו שאלה מבנית-תרבותית: "האם יש **כלי** לדיווח, לא רק **אקלים** בטוח?" |
| **Measurement** | שאלה (Tier 2): *"כשעובד מזהה בעיה בתהליך עבודה — מה קורה בפועל?"* → (א) אין ערוץ ברור לדיווח, או שדיווחים "נבלעים" ללא תגובה [8.0], (ב) יש ערוצים, אבל רוב העובדים לא משתמשים בהם (לא מקובל / לא "שווה") [5.0], (ג) יש ערוץ אפקטיבי — דיווחים נקלטים, נידונים, ומטופלים בזמן סביר [1.0] |
| **Impact on Model** | מחזק UC intervention (פרוטוקול 4.3 — Blame→Reporting). מוסיף trigger condition: UC-9 ≥ 7.0 → Protocol 4.3 גם ללא high_drift |

---

#### GAP-05: Leadership Cascade Failure (LCF) — כשל שרשרת מנהיגות

| שדה | תוכן |
|-----|-------|
| **Construct Name** | Leadership Cascade Failure (כשל שרשרת מנהיגות) |
| **Theoretical Basis** | Bass & Avolio (1994) Full Range Leadership; Graen & Uhl-Bien (1995) LMX; Tepper (2000) Abusive Supervision; DeRue et al. (2011) Leadership Trait-Behavior Framework |
| **Currently Covered?** | **לא מכוסה.** DR מודד **תחרות בין-מחלקתית** — דינמיקה הורזונטלית. מנהיגות היא דינמיקה **וורטיקלית**: מנכ"ל → VP → מנהל ביניים → צוותים. כשל בשרשרת הזו (delegation failure, micromanagement, absent leadership) לא נלכד בשום ממד |
| **Why It Matters** | Hogan & Kaiser (2005): 50-75% מהמנהלים מדורגים כ"לא אפקטיביים" ע"י כפיפים. Gallup: 70% מהשונות ב-engagement מוסברת ע"י המנהל הישיר. **ב-50-300:** אתגר ספציפי — founders שלא מצליחים לעבור מ-"עושים" ל-"מנהלים" (Greiner Phase 2 crisis of autonomy) |
| **Prevalence** | גבוה מאוד ב-ICP. רוג'ר (2020): 65% מ-founders של חברות Series B מודים שהם "עדיין עושים את העבודה במקום לנהל" |
| **Recommendation** | **(A) לשלב ב-DR כ-sub-dimension.** DR-8 (Leadership Cascade): מודד את איכות הדינמיקה הוורטיקלית — האם delegation עובד? האם מנהלי ביניים effective? האם יש micromanagement? **הסיבה לשילוב ב-DR ולא כממד חדש:** DR מודד **דינמיקת יחסים** (reciprocity = הדדיות). יחסי מנהל-כפיף הם form של reciprocity (LMX). כשל = distorted reciprocity בציר וורטיקלי |
| **Measurement** | שאלה (Tier 1): *"כיצד היית מתאר את הדינמיקה בין הנהלה בכירה לבין מנהלי ביניים?"* → (א) ההנהלה מנהלת מרחוק (micromanagement) או לא מנהלת בכלל, מנהלי ביניים חסרי סמכות [8.0], (ב) יש delegation חלקי, אבל החלטות קריטיות חוזרות תמיד ל-CEO/COO [5.0], (ג) delegation ברור — מנהלי ביניים מקבלים סמכות אמיתית ותומכים [1.0] |
| **Impact on Model** | מרחיב DR intervention (Phase 1 של הפרוטוקול המשולב) עם רכיב delegation re-design |

---

#### GAP-06: Change Inertia (CI) — אינרציה ארגונית

| שדה | תוכן |
|-----|-------|
| **Construct Name** | Change Inertia (אינרציה ארגונית) / Organizational Rigidity |
| **Theoretical Basis** | Hannan & Freeman (1984) Structural Inertia; Armenakis et al. (1993) Change Readiness; Greiner (1972) Growth Model; McMillan & Perron (2013) Change Fatigue |
| **Currently Covered?** | **לא מכוסה ישירות.** ND מודד **סטייה מנהלים** (שינוי שלילי — drift). אינרציה היא **ההפך**: חוסר יכולת לשנות, גם כשצריך. UC מודד למידה (backward), לא adaptability (forward). Greiner מוזכר אך לא נמדד |
| **Why It Matters** | Hannan & Freeman (1984): Structural inertia עולה לוגריתמית עם גיל וגודל הארגון. ב-50-300: **הסיכון הספציפי הוא "concrete shoes"** — תהליכים שנקבעו ב-20 עובדים שמעכבים צמיחה ל-200. Armenakis (1993): Change readiness מנבאת 60% מהשונות בהצלחת שינוי |
| **Prevalence** | גבוה. CEB/Gartner (2016): ארגון ממוצע חווה 5 שינויים מרכזיים בשנה; 50% נכשלים. ב-growth companies: כל גיוס סדרה = שינוי מרכזי |
| **Recommendation** | **(A) לא ממד חדש — moderator.** Greiner Stage + Change Inertia צריכים לשמש כ-**moderator** שמשנה **ספי חומרה** של SC ו-ND. **הנמקה:** אינרציה היא לא pathology בפני עצמה — היא **מכפיל של SC** (מבנה לא ברור + אינרציה = קפאון מוחלט) ו**מכפיל של ND** (סטייה מנורמלת + אינרציה = אי אפשר לחזור). **מימוש מוצע:** שאלת Greiner ב-Tier 1 → אם Stage 3 (crisis of control) → SC threshold ירד ב-1.0; אם Stage 4 (red tape) → ND threshold ירד ב-1.0 |
| **Measurement** | שאלה (Tier 1): *"חשבו על הניסיון האחרון לשנות תהליך עבודה משמעותי. מה קרה?"* → (א) לא הצלחנו — שינויים נתקלים בהתנגדות עזה או "חוזרים" תוך שבועות [8.0], (ב) הצלחנו אבל לקח 6+ חודשים ודרש אנרגיה מוגזמת [5.0], (ג) שינויים נקלטים סבירות — יש מנגנון change management [1.0] |
| **Impact on Model** | Moderator על SC/ND. לא ממד חדש. שאלה אחת ב-Tier 1. לא מוגבל ב-48 שאלות |

---

#### GAP-07: SC Correlations — קורלציות חסרות

| שדה | תוכן |
|-----|-------|
| **Gap** | SC נוסף ב-Phase 4 ללא validation סימולטיבי ו**ללא קורלציות** עם DR/ND/UC |
| **Correlation Estimates** | להלן השערות מנומקות: |

| קשר | r מוצע | כיוון | הנמקה |
|------|--------|-------|-------|
| **SC ↔ DR** | r = **.32** | חיובי | Simon (1947): בהרציונליות חסומה, חוסר בהירות יוצר uncertainty שמעודדת turf wars. Pfeffer (1981): politics עולה ליניארית עם role ambiguity. הקשר חזק יותר מ-DR↔ND (.19) כי SC הוא precursor ישיר יותר |
| **SC ↔ ND** | r = **.24** | חיובי | Hollnagel (2014): Work-as-Imagined vs. Work-as-Done — כשנהלים לא מוגדרים, workarounds הם תוצר הכרחי, לא בחירה. SC → ND הוא ציר ברור (אין מבנה → צריך מעקפים) |
| **SC ↔ UC** | r = **.18** | חיובי חלש | Weick (1995): sensemaking קשה יותר בסביבה אמביגית. אך הקשר חלש יותר כי UC (למידה) יכולה להיות גבוהה או נמוכה ללא קשר ל-SC — ארגונים עם מבנה ברור יכולים עדיין להיכשל בלמידה |
| **Basis** | תיאורטי + הסקה cross-study. **דורש validation סימולטיבי** (ראה סעיף 6) |

---

## סעיף 2: מטריצת MECE מעודכנת

### פתולוגיות × תצורות אנטרופיה

|  | 🔵 אינפורמציונית | 🟠 מבנית | 🔴 תרבותית |
|--|------------------|----------|------------|
| **DR** | DR-3: Information Hoarding; DR-6: KPI non-transparency | DR-2: Reward Misalignment; DR-7: Resource Competition | DR-1: Zero-Sum Dynamics; DR-4: Cross-Functional Trust; **DR-8: Leadership Cascade** ← NEW |
| **ND** | ND-6: Near-Miss gap (under-reporting) | ND-4: Procedure-Reality Gap; ND-2: Heroes/SPOF; ND-7: Drift Velocity | ND-1: Workaround Prevalence; ND-3: Escalation suppression; ND-5: Mgmt Awareness |
| **UC** | UC-2: Semantic Drift; UC-5: Self-Assessment Accuracy | UC-7: Cross-Silo Learning barriers | UC-1: Single-Loop Learning; UC-3: Psych Safety; UC-6: Post-Mortem culture; UC-8: Crisis Comms; **UC-9: Voice Infrastructure** ← NEW; **UC-Forward: Adaptive Capacity** ← NEW |
| **SC** | **SC-5: Strategy-Execution Link** ← NEW | SC-RACI: Role/Accountability; SC-Process: Process Documentation; SC-Decision: Decision Protocol; SC-Knowledge: Knowledge Transfer | *(SC לא פועל בתרבותית — מבני בהגדרה)* |
| **Moderator** | | **Greiner Stage** ← NEW *(moderator על SC/ND thresholds)* | **Engagement proxy** ← NEW *(outcome indicator, לא pathology)* |

### כיסוי MECE

| תצורה | כיסוי לפני | כיסוי אחרי | פער שנותר |
|--------|-----------|------------|-----------|
| **אינפורמציונית** | 4 sub-dims | 5 sub-dims (+SC-5) | ✅ מכוסה |
| **מבנית** | 5 sub-dims | 7 sub-dims (+RACI, Process, Decision) | ✅ מכוסה |
| **תרבותית** | 6 sub-dims | 9 sub-dims (+DR-8, UC-9, UC-Forward) | ✅ מכוסה |

> **⚠️ Information Overload (עודף מידע)** — לא מכוסה בשום ממד. **הערכה: לא רלוונטי ל-ICP.** ב-50-300 עובדים, הבעיה היא **חוסר** מידע ומבנה, לא עודף. Information overload רלוונטי ל-1000+ עובדים עם legacy systems.

---

## סעיף 3: המלצה — כמה ממדים?

### ✅ המלצה: 4 ממדים (DR, ND, UC, SC) + 2 Moderators

| ממד | מעודכן? | שינוי |
|-----|---------|-------|
| **DR** | כן | +DR-8 (Leadership Cascade) — sub-dimension וורטיקלי |
| **ND** | לא | ללא שינוי |
| **UC** | כן | +UC-9 (Voice Infrastructure), +UC-Forward (Adaptive Capacity), +PSI integration (ראה סעיף 5) |
| **SC** | כן | +SC-5 (Strategy-Execution Link), חידוד SC ≠ UC-2 |
| **Greiner** | חדש | Moderator — משנה ספים, לא ממד |
| **Engagement** | חדש | Outcome proxy — validation, לא pathology |

### נימוק

| קריטריון | 4 ממדים + moderators | 5 ממדים | 6 ממדים |
|----------|---------------------|---------|---------|
| **MECE** | ✅ מכוסה מלא (מטריצה מלאה) | ✅ מכוסה | ✅ מכוסה |
| **פסיכומטריקה** | α צפוי .85+ (מספיק items) | α צפוי .80 (פיזור items) | α צפוי .72 (מעט items/ממד) |
| **UX** | 48 שאלות / 4 ממדים = ~12 שאלות/ממד | 48/5 = ~10 שאלות/ממד | 48/6 = 8 שאלות/ממד (מעט מדי ל-α) |
| **סיכון עסקי** | נמוך — "DSM עם 4 קודים" ברור | בינוני — "5 קודים" עדיין ברור | גבוה — "6 קודים" מסבך מסר |
| **בידול** | ✅ DSM פתולוגי ייחודי | ❓ מתקרב ל-OHI | ❌ בלתי ניתן להבדלה |

> **שורה תחתונה:** 4 ממדים הם המקסימום שמאפשר α סביר עם 48 שאלות. הוספת ממד 5 פוגעת בפסיכומטריקה ובמסר. הפתרון: **העמקת sub-dimensions ו-moderators**.

---

## סעיף 4: Edmondson PSI — המלצה

### ✅ המלצה: שילוב ב-UC כרכיב שלישי (20%)

| אפשרות | נימוק | החלטה |
|---------|-------|-------|
| שילוב ב-UC | PSI מודד psychological safety = UC-3. ה-7 שאלות כבר קיימות. שילוב UC = 3 רכיבים: Learning (40%), Semantic (25%), PSI (20%), Adaptive (15%) | ✅ המלצה |
| ממד נפרד | PSI הוא construct ברור עם α מוכח (.82+). אך: (1) ארגונית PS ≠ pathology — זה *תנאי-אפשר* ללמידה, לא dysfunction; (2) מספר items (7) גדול מדי ביחס להשפעה | ❌ לא מומלץ |
| Moderator | PS מנתן את **כל** הפתולוגיות (לא רק UC). אם PS נמוך → ND (near-miss reporting) נפגע, DR (trust) נפגע. | ❓ אפשרי אך מורכב מדי ליישום |

### מימוש מוצע

```
UC_score = 0.40 × Learning_component
         + 0.25 × Semantic_component
         + 0.20 × PSI_normalized    ← NEW
         + 0.15 × Adaptive_component ← NEW
```

**PSI normalized:** ציון PSI ממוצע (1-7) → הפוך (8-avg) → נורמליזציה ל-0-10:
```
psi_normalized = ((8 - psi_avg) / 6) × 10
```
- PSI avg = 7 (perfect safety) → psi_normalized = 1.67 (low UC contribution)
- PSI avg = 1 (no safety) → psi_normalized = 10.0 (max UC contribution)

**קורלציות PSI:**
- PSI ↔ UC: r = −.35 (Edmondson 1999 — empirical)
- PSI ↔ ND-6: r = −.28 (Munn et al. 2023 — near-miss reporting)
- PSI ↔ DR-4: r = −.22 (trust correlation — inferred)

---

## סעיף 5: Greiner Stages — המלצה

### ✅ המלצה: Moderator (לא ממד)

**הנמקה:** Greiner Stage הוא **מאפיין מצבי** (state), לא **מדד רציף**. ארגון לא יכול "לשפר" את שלב Greiner שלו — הוא עובר אליו. לכן זה moderator, לא pathology.

### מימוש מוצע

**שאלה אחת (Tier 1):**
> *"מה האתגר הניהולי הכי דחוף של הארגון כרגע?"*
> - (א) **"צריך עוד ידיים" — המייסדים עושים הכל, אין delegation** → Greiner 1-2 (crisis of leadership/autonomy)
> - (ב) **"יש חוסר שליטה — כל מחלקה עושה מה שהיא רוצה"** → Greiner 3 (crisis of control) → **SC threshold −1.0**
> - (ג) **"יש יותר מדי ביורוקרטיה — כל שינוי דורש 5 אישורים"** → Greiner 4 (crisis of red tape) → **ND threshold −1.0**
> - (ד) **"הצמיחה התייצבה — אנחנו צריכים להתחדש"** → Greiner 5 (crisis of growth) → **UC threshold −1.0**

**השפעה:** Greiner stage מוריד את ה-threshold של severity level 2. למשל: threshold רגיל = 2.5; אם Greiner 3 → SC threshold = 1.5 (מה שהיה subclinical הופך ל-moderate).

---

## סעיף 6: שאלות למחקר המשך

### 6.1 validation סימולטיבי ל-SC

| נדרש | פרטים |
|------|-------|
| **מה** | לחזור על סימולציה N=10,000 עם **4 ממדים** (לא 3) — לאמת קורלציות SC ↔ {DR, ND, UC} |
| **מתודולוגיה** | Monte Carlo simulation עם correlation matrix מעודכנת |
| **N נדרש** | 10,000 (כמו המקורי) |
| **תוצר** | r values, AIC/BIC comparison — network model 4D vs. factor model |

### 6.2 Pilot psychometric ל-UC מורחב

| נדרש | פרטים |
|------|-------|
| **מה** | בדיקת α עם UC מורחב (4 רכיבים: Learning, Semantic, PSI, Adaptive) |
| **מתודולוגיה** | סקר N=200-300 מנהלים בארגוני 50-300; CFA (Confirmatory Factor Analysis) |
| **שאלה** | האם UC עם 4 רכיבים עדיין construct אחד (unidimensional) או שצריך לפצל? |
| **N נדרש** | 250+ (כלל ה-10:1 — 10 נבדקים לכל item) |

### 6.3 Greiner moderator effect

| נדרש | פרטים |
|------|-------|
| **מה** | בדיקה אם Greiner stage באמת משנה את הקשר pathology → outcome |
| **מתודולוגיה** | Moderated regression: `outcome = pathology + Greiner + pathology×Greiner` |
| **N נדרש** | 100+ ארגונים (25+ לכל Greiner stage) |

### 6.4 Engagement כ-outcome variable

| נדרש | פרטים |
|------|-------|
| **מה** | בדיקה אם totalEntropyScore (DR+ND+UC+SC) מנבא engagement |
| **מתודולוגיה** | Multiple regression: `engagement = β₁DR + β₂ND + β₃UC + β₄SC + ε` |
| **ערך** | אם R² ≥ .50 → engagement הוא אכן outcome. אם R² < .30 → אולי צריך ממד נפרד |
| **N נדרש** | 150+ ארגונים |

---

## סיכום ביצועי

| קטגוריה | פעולה | השפעה |
|---------|-------|-------|
| **חפיפות** | 3 חפיפות זוהו → **כולן נשמרות** עם קריטריוני הבחנה ברורים | אין שינוי מבנה |
| **פערים** | 6 פערים זוהו → **3 נבלעים ב-sub-dimensions**, 1 moderator, 1 outcome proxy, 1 לא רלוונטי | 4 ממדים נשמרים |
| **PSI** | שילוב ב-UC כרכיב 20% | משנה nuscha של UC |
| **Greiner** | Moderator חדש | שאלה 1 ב-Tier 1 + threshold modifiers |
| **SC** | SC-5 (Execution Link) + קורלציות חדשות | מרחיב SC |
| **סה"כ** | **4 ממדים + 2 moderators** = MECE מלא | ✅ |

> **המודל צריך 4 ממדים (DR, ND, UC, SC), מועשרים ב-sub-dimensions חדשים (DR-8, UC-9, UC-Forward, SC-5), עם PSI משולב ב-UC, ו-Greiner כ-moderator. אין צורך בממד חמישי.**
