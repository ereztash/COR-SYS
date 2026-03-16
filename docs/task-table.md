# טבלת משימות — COR-SYS

משימות לפי עדיפות, מעודכנות לפי החלטות מוצר (`product-decisions.md`).

---

## מקרא

| סמל | משמעות |
|-----|---------|
| 🔴 **P0** | חוסם — בלי זה אי אפשר לתת גישה |
| 🟠 **P1** | קריטי — נחוץ לפני הצגה ללקוח ראשון |
| 🟡 **P2** | חשוב — שיפור משמעותי |
| 🟢 **P3** | ניס-טו-האב — ערך עתידי |
| 📋 **מחקר** | החלטות / תוכן / מחקר — לא תכנות |

---

## טבלת משימות

| # | עדיפות | משימה | מה לעשות | הערות |
|---|---------|--------|----------|--------|
| 1 | 🔴 P0-1 | **Auth + הגנת נתיבים** | Login עם **הזדהות גוגל** (Google Sign-In). Middleware מגן על כל הנתיבים; בלי session → הפניה ל־login. Logout ב־sidebar. | מקור: product-decisions — כניסה via לינק + גוגל. Supabase OAuth עם Google. |
| 2 | 🔴 P0-2 | **תיקון RLS** | ביטול גישת `anon`; רק `authenticated` — מיגרציית SQL על כל הטבלאות. | אחרי P0-1 הסשן עובר דרך SSR. |
| 3 | 🟠 P1-1 | **Self-Serve Assessment Link** | נתיב ציבורי `/assess/[token]` למילוי שאלון; טבלה `client_assessments`; תוצאות ב־`/assess/[token]/results` (DSM, קומורבידיות, פרוטוקולים). כפתור "שלח לינק הערכה" ב־dashboard. | Lead magnet + מנגנון delivery. |
| 4 | 🟠 P1-2 | **PDF Export לדו"ח DSM** | יצוא PDF עם DSM codes, מפת קומורבידיות (טבלה ויזואלית), פרוטוקולי התערבות. API route + `@react-pdf/renderer`. | לקוח לוקח דו"ח הביתה. |
| 5 | 🟠 P1-3 | **Landing Page** | **דחוי** — יהיה כשנצליח למקם את המוצר כמוצר עובד. כרגע לא לממש. | החלטה: product-decisions. |
| 6 | 🟠 P1-4 | **התראת Email** | אחרי מילוי שאלון → שליחת מייל (Resend) עם שם לקוח, DSM codes, לינק לתוכנית. | יועץ מקבל התראה. |
| 7 | 🟡 P2-1 | **Longitudinal Tracking** | היסטוריית אבחונים (לא upsert יחיד); השוואת ציונים לאורך זמן; טיימליין + גרף DR/ND/UC. | "ND ירד מ־8.5 ל־5.0". |
| 8 | 🟡 P2-2 | **Dashboard Analytics** | אגרגציה: כמה critical/healthy, pathology נפוץ, ממוצע DSM. כרטיסים ב־dashboard. | מפת בריאות פורטפוליו. |
| 9 | 🟡 P2-3 | **שאלון 48 שאלות** | הרחבת שאלון ל־12 Macro + 15 Meso + 21 Micro. Tier 2 ב־≥7.0, Tier 3 ב־≥6.0. Multi-phase UI + progress. | מאושר בהחלטות; מקור: מחקר + product-roadmap. |
| 10 | 🟡 P2-4 | **Mobile Responsiveness** | Sidebar → hamburger; bento → עמודה אחת; sliders ו־SVG מותאמים למובייל. | Self-serve חייב לעבוד במובייל. |
| 11 | 🟡 P2-5 | **Calendly / Booking** | CTA בתוצאות אבחון → iframe Calendly. לפי חומרה: ספרינט vs שיחת ייעוץ. | `NEXT_PUBLIC_CALENDLY_URL`. |
| 12 | 🟢 P3-1 | **תשלום (Payment)** | **Placeholder באפליקציה** — CTA/מקום לתשלום; מימוש מלא (Stripe) רק בהחלטה עתידית. | החלטה: placeholder כרגע. |
| 13 | 🟢 P3-2 | **Real-time Sprint Board** | WebSockets — עדכון לוח בזמן אמת (Supabase Realtime). | שני משתמשים רואים אותו לוח. |
| 14 | 🟢 P3-3 | **CSV Export לפיננסים** | כפתור "ייצא ל־Excel" בדף financials. | Client-side CSV. |
| 15 | 🟢 P3-4 | **Benchmark נורמטיבי** | "גבוה מ־X% מהארגונים בתעשייה" — percentile לפי סקטור. מקור נתונים: RAG / integrated-model (N=10,000). | לחפש מקור ב־RAG; JSON distributions. |
| 16 | 🟢 P3-5 | **Tier 3 TTX (Tabletop Exercise)** | סימולציה אינטראקטיבית לפי פרופיל פתולוגיות. | עתידי. |
| 17 | 📋 מחקר | **מקרי עבר (Case studies)** | הוספת 3–5 מקרים למחקר: פרופיל DR/ND/UC, התערבות, תוצאה — כולל ארגונים שהצליחו לצאת מבעיות. שימוש במוצר: "מקרה דומה" בדו"ח/פרוטוקול. | תמיכה בפרוטוקולים + לגיטימציה. |

---

## סיכום לפי סטטוס

| סטטוס | משימות |
|--------|--------|
| **לבצע עכשיו (P0)** | P0-1 Auth (גוגל), P0-2 RLS |
| **לפני לקוח ראשון (P1)** | P1-1 Self-serve, P1-2 PDF, P1-4 Email. P1-3 Landing — דחוי. |
| **שיפור (P2)** | P2-1 Longitudinal, P2-2 Analytics, P2-3 48 שאלות, P2-4 Mobile, P2-5 Calendly |
| **עתידי (P3)** | P3-1 Payment placeholder, P3-2 Realtime, P3-3 CSV, P3-4 Benchmark, P3-5 TTX |
| **מחקר/תוכן** | מקרי עבר; איתור מקור Benchmark ב־RAG |

---

## לוח זמנים מומלץ (מעודכן)

| Sprint | משימות | מטרה |
|--------|--------|------|
| **Sprint 1** | P0-1 + P0-2 | Auth (גוגל) + RLS — גישה מאובטחת |
| **Sprint 2** | P1-1 + P1-4 | Self-serve לינק + התראת מייל |
| **Sprint 3** | P1-2 | PDF Export — דו"ח ללקוח |
| **Sprint 4** | P2-1 + P2-2 + P2-4 | Longitudinal + Analytics + Mobile |
| **Sprint 5** | P2-3 + P2-5 | 48 שאלות + Calendly |
| **מחקר** | מקרי עבר + Benchmark | במקביל או לפני P2-3 / P3-4 |

*Landing (P1-3) — כשהמוצר ממוקם כמוצר עובד. Payment (P3-1) — placeholder עד להחלטה.*
