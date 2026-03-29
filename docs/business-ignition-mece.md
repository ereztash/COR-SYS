# התנעה עסקית (Ignition) — מיפוי MECE לשדות במערכת

מסמך זה מקשר בין המתודולוגיה (תנועה מול פעולה, MECE להנעה) לבין יישום COR-SYS. **מנוע DSM הארגוני לא משתמש בשדות אלה** בגרסה הנוכחית; הם משפיעים על נרטיב, צעדים ראשונים, והמלצת שירות (ספרינט) בתנאים מוגדרים לעצמאים.

## וקטור התנעה דומיננטי (`ignitionPrimaryVector`)

| ערך | משמעות | שדה |
|-----|---------|-----|
| `internal_push` | Effectuation / בריקולאז׳ — מה שיש עכשיו | `ignitionPrimaryVector` |
| `market_pull` | Lean / JTBD — כאב שוק ואימות ביקוש | `ignitionPrimaryVector` |
| `capital_blitz` | הון / מסה לפריצה מהירה | `ignitionPrimaryVector` |
| `momentum_transfer` | תנע מועבר (זיכיון, רכישה, גל חיצוני) | `ignitionPrimaryVector` |

## מלכודות OMS (`ignitionDominantTrap`)

| ערך | תיאור קצר |
|-----|------------|
| `prep_trap` | הכנה ממושכת בלי הצעה מסחרית חוזרת |
| `over_learn` | לימוד והכשרה בלי סגירה |
| `free_value` | ערך בחינם בלי מסלול לתשלום |
| `busy_motion` | פעילות חברתית בלי בקשה מסחרית חדה |
| `none_clear` | לא בטוח / רוצה מיקוד |

## פעולה מסחרית אחרונה (`ignitionLastCommercialAsk`)

מדד פרוקסי ל"פעולה" מול "תנועה": מתי נשלחה הצעת מחיר / בקשת תשלום / הצעת שירות ממוקדת.

ערכים: `within_7d`, `within_30d`, `within_90d`, `over_90d`, `never_recent`.

## שלב חיים (אופציונלי)

`ignitionLifecycleStage`: `early_under_1y`, `one_to_three`, `three_plus`, `prefer_not` — תחליף לגיל מדויק.

## איפה זה מופיע במוצר

- שלב שאלון `ignition` ב־`QUESTIONNAIRE_STEPS_RAW` — מוצג רק ב־`one_man_show` (`omsOnly`).
- חישוב: `computeIgnitionProfile` ב־[`src/lib/business-ignition.ts`](../src/lib/business-ignition.ts).
- תוצאות: `DiagnosticResult.ignition`, `DynamicSummary.ignitionParagraph`, PDF, דף תוכנית, תוצאות הערכה.

## כלל ספרינט (התנעה)

לעצמאי: אם פרופיל ההתנעה מצביע על דחיפות גבוהה (למשל בקשה מסחרית רחוקה + מלכודת עמוסה) **ו**ההמלצה הבסיסית הייתה Live Demo — המערכת עלולה לעדכן לספרינט, **אלא** אם `interventionGoal === 'audit_only'`.
