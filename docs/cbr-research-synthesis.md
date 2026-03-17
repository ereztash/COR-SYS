# CBR Research Synthesis — Cross-Domain Intelligence Report
## מנוע DSM ארגוני: סינתזה מחקרית חוצת-דומיינים

> **תאריך:** 2026-03-17
> **מטרה:** תיעוד תהליך המחקר, המקורות, והתובנות חוצות-הדומיינים שהובילו לתוכנית הפעולה של שכבת ה-CBR
> **סטטוס:** תוכנית מאושרת, ממתינה לביצוע

---

## 1. מקורות המחקר שנסרקו

### 1.1 מחקר ראשי — PDF מנוע DSM ארגוני
- **קובץ:** `מנוע DSM ארגוני_ מחקר ופיתוח.pdf` (24 עמודים)
- **מבנה:** Double Diamond — Discover → Define → Develop → Deliver
- **תוכן מרכזי:**
  - ארכיטקטורת CBR (Case-Based Reasoning) למנוע המלצות ארגוני
  - סכימת DB: 3 טבלאות (`organizations_context`, `dsm_diagnostic_snapshots`, `interventions_and_feedback`)
  - מנגנון Similarity Search היברידי (Euclidean + Cosine + Pre-filtering)
  - מנוע המלצות עם Wilson Score confidence
  - לולאת Feedback בייסיאנית
  - קוד SQL מוכן (פונקציית `get_similar_cases_with_stats`)
  - קוד TypeScript מוכן (endpoint המלצתי)
- **59 מקורות אקדמיים** כולל: Vaughan (ND), Edmondson (Psychological Safety), Argyris (Double-Loop), Floridi (Semantic Drift), Borsboom (Network Psychopathology)

### 1.2 מחקרים לוקאליים שנסרקו (6 מאגרים)

| # | קובץ | דומיין | גודל | רלוונטיות |
|---|---|---|---|---|
| 1 | `Downloads/org-resilience-research.md` | מתמטיקה ארגונית | ~200+ שורות | **קריטי** — נוסחת חוסן |
| 2 | `Downloads/meta-research-engine.md` | נוירוביולוגיה / מטא-קוגניציה | ~200+ שורות | **גבוה** — PE loop |
| 3 | `Downloads/research-backed-kb-optimization.md` | RAG / AI Optimization | ~150+ שורות | **גבוה** — retrieval patterns |
| 4 | `Downloads/Peer_Reviewed_Research_Compendium.md` | כלכלה התנהגותית / נוירומרקטינג | ~150+ שורות | **בינוני-גבוה** — framing |
| 5 | `Downloads/research-deep-dive.md` | Game Theory / Signaling | ~200+ שורות | **בינוני** — positioning |
| 6 | `cor-sys/docs/product-roadmap.md` | Product Management | ~100 שורות | **גבוה** — תלויות P0-P3 |

---

## 2. תובנות חוצות-דומיינים (Cross-Domain Insights)

### ⚡ תובנה #1: נוסחת החוסן הארגוני = פונקציית success_label

**מקור:** `org-resilience-research.md`

**הנוסחה המתמטית:**
```
LG = 0.571 × (-ΔDR) + 0.429 × (ΔPSI)
R_org(t+1) = R_org(t) × (1 + κ × LG)
```

**פרמטרים:**
- `R_org(t)` — חוסן ארגוני בזמן t
- `κ` — מקדם ספיגת למידה (0 ≤ κ ≤ 1)
- `ΔDR` — שינוי ב-Dismissal Rate (שלילי = שיפור)
- `ΔPSI` — שינוי ב-Psychological Safety Index (Edmondson 7-item, 1-7)

**משקולות:**
- `0.571` ל-DR ← מבוסס Loss Aversion Ratio של Kahneman & Tversky (≈ 2.25:1)
- `0.429` ל-PSI ← innovation multiplication literature

**⚠️ סף קריטי:**
```
κ × LG = -0.15 → נקודת מעבר מ-adaptive ל-maladaptive
```

**Eigenvalue Analysis:**
```
λ = 1 + κ × LG

λ > 1  → מסלול צמיחה (unstable growth)
λ = 1  → שיווי משקל (marginally stable)
0 < λ < 1 → דעיכה (asymptotically stable decay)
λ < -1 → ביפורקציה כאוטית (route to chaos)
```

**חיבור ל-CBR:** הנוסחה מספקת `success_label` רציף ומוכח אקדמית במקום boolean פשוט. כל התערבות נמדדת לפי השפעתה על `LG` ועל `λ`.

**⚠️ דרישה:** שאלון ה-Assessment צריך להכיל 7 שאלות Edmondson PSI (כרגע חסר).

---

### ⚡ תובנה #2: Prediction Error = Bayesian Calibration Loop

**מקור:** `meta-research-engine.md`

**המנגנון הנוירולוגי:**
```
PFC lateralis → ניבוי (prediction)
Anterior Insula + ACC → השוואה: "מה שחזינו" vs. "מה שקרה"
PE (Prediction Error) → אות למידה → עדכון
```

**המיפוי ל-CBR:**
```
Prior (אמונה מוקדמת)     = ציפיית המערכת (סף דטרמיניסטי)
Observation (תצפית)       = תוצאת ההתערבות בשטח (Follow-up)
PE (שגיאת ניבוי)          = הפער: Prior - Observation
Posterior (אמונה מעודכנת) = סף מכויל (Bayesian Update)
```

**חיבור ל-CBR:** לולאת הפידבק הבייסיאנית (חלק ג'3 במחקר ה-DSM) היא אנלוגיה מדויקת ל-ACC-Insula PE loop. ה-Override של היועץ הוא ה-PE input.

---

### ⚡ תובנה #3: RAG Architecture = CBR Retrieval Architecture

**מקור:** `research-backed-kb-optimization.md`

**ממצאים קריטיים:**

| מחקר | ממצא | השפעה על CBR |
|---|---|---|
| Anthropic Contextual Retrieval (2024) | Contextual Embeddings + BM25 = **-49% retrieval failure** | כל snapshot צריך context header |
| arXiv:2510.05381 (2025) | Longer context = lower accuracy | Retrieve K=20 → filter to Top-5 |
| Chroma Context Rot (2025) | Performance degrades non-linearly | Hierarchical: scores first, narrative second |
| Kyoto University (2025) | Chain-of-thought + tagging = **+25%** | Tag each case with category/intent |

**פרקטיקה מומלצת:**
```
שלב 1: Pre-filter (industry + severity) → ~100 מקרים
שלב 2: Vector search (cosine similarity) → Top-20
שלב 3: Retrieve-then-Solve → סינון ל-Top-5 רלוונטיים
שלב 4: Aggregation + Wilson Score → המלצה סופית
```

**K=20 מאומת:** גם המחקר ה-DSM (K=15) וגם מחקר Anthropic (20 chunks optimal) מתכנסים לאותו sweet spot.

---

### ⚡ תובנה #4: Loss Framing על UI ההמלצות

**מקור:** `Peer_Reviewed_Research_Compendium.md`

**ממצאים:**
- Kahneman & Tversky (1991): Loss Aversion coefficient = **2.0-2.5x**
- Loss framing = **2x stronger** emotional impact than gain framing
- Framing + default choice architecture = **maximum impact** (additive effect)
- Dopamine fires in **anticipation**, not reward → open loops + urgency

**יישום בממשק ההמלצות:**

❌ **Gain Frame (חלש):**
> "NOD→BIA success rate: 78% (14 cases)"

✅ **Loss Frame (חזק x2):**
> "**הארגון מפסיד ₪12,500/יום** בקיבולת אבודה (J-Quotient ÷ 30).
> התערבות NOD→BIA צמצמה הפסד זה ב-78% בארגונים דומים (14 מקרים).
> **עלות אי-פעולה ל-30 יום: ₪375,000**"

---

### ⚡ תובנה #5: Signaling Theory על Credibility של ההמלצות

**מקור:** `research-deep-dive.md`

**Costly vs. Cheap Signals:**
- המלצה ללא נתונים = Cheap Talk ("אנחנו חושבים שכדאי...")
- המלצה עם N cases + confidence interval + trajectory prediction = **Costly Signal**

**יישום:** כל המלצה מציגה:
1. **N** — כמה מקרים תומכים (שקיפות)
2. **Confidence** — Wilson Score (אמינות)
3. **Trajectory** — λ eigenvalue prediction (מה יקרה אם לא תפעל)
4. **Loss/Day** — J-Quotient ÷ 30 (דחיפות)

---

## 3. מיפוי טכנולוגי: מה קיים vs. מה חסר

### קיים ב-COR-SYS (מוכן לשימוש):

| רכיב | קובץ | סטטוס |
|---|---|---|
| DSM Engine (DR/ND/UC scoring) | `src/lib/dsm-engine.ts` | ✅ פעיל |
| Policy Engine (deterministic rules) | `src/lib/dsm-policy-engine.ts` | ✅ פעיל |
| Assessment Flow | `src/app/assess/[token]/` | ✅ פעיל |
| Comorbidity Map | `src/components/diagnostic/ComorbidityMap.tsx` | ✅ פעיל |
| Client/Sprint/Task CRUD | Multiple files | ✅ פעיל |
| J-Quotient + DLI display | `src/app/page.tsx` | ✅ פעיל |
| Supabase + PostgreSQL | Infrastructure | ✅ פעיל |

### חסר (= עבודה נדרשת):

| רכיב | קובצים נדרשים | מקור |
|---|---|---|
| **3 CBR Tables** | `supabase-migration-cbr.sql` | PDF עמ' 5-8 |
| **pgvector extension** | Supabase Dashboard | PDF עמ' 10 |
| **Resilience Formula** | `src/lib/resilience-formula.ts` | org-resilience-research.md |
| **Embedding Service** | `src/lib/cbr/embedding.ts` | PDF עמ' 8 + RAG research |
| **Similarity Search** | `src/lib/cbr/similarity.ts` + SQL function | PDF עמ' 9, 14-15 |
| **Recommendation Engine** | `src/lib/cbr/recommend.ts` | PDF עמ' 10, 15-17 |
| **Loss-Framed UI** | `src/components/diagnostic/RecommendationPanel.tsx` | Peer_Reviewed |
| **Override Form** | `src/components/forms/InterventionForm.tsx` | PDF עמ' 7-8 |
| **Bayesian Calibration** | `src/lib/cbr/calibration.ts` | PDF חלק ג'3 + meta-research |
| **Trajectory Prediction** | `src/lib/cbr/trajectory.ts` | org-resilience-research.md |
| **Follow-up Page** | `src/app/clients/[clientId]/followup/page.tsx` | PDF עמ' 7-8 |
| **PSI Questions (Edmondson 7)** | Assessment form update | org-resilience-research.md |

---

## 4. רשימת מקורות אקדמיים מרכזיים (עיגון נוסחאות)

### נוסחת חוסן ארגוני
- **Kahneman, D. & Tversky, A. (1979, 1991)** — Prospect Theory, Loss Aversion coefficient 2.0-2.5
- **Edmondson, A.C. (1999, 2024)** — Psychological Safety, 7-item PSI scale
- **Argyris, C. (1977, 1996)** — Double-Loop Learning, Model I vs Model II behaviors
- **Hollands et al. (2024) + McKinsey (2024)** — Critical threshold κ×LG = -0.15

### מנוע CBR
- **Aamodt, A. & Plaza, E. (1994)** — The 4 R's: Retrieve, Reuse, Revise, Retain
- **Vaughan, D. (1996, 2016)** — Normalization of Deviance
- **Borsboom, D. et al. (2010, 2017)** — Network Models of Psychopathology
- **Floridi, L. (2004, 2016)** — Ontological Friction, Semantic Drift

### RAG / Retrieval Optimization
- **Anthropic (2024)** — Contextual Retrieval: -49% retrieval failure
- **arXiv:2510.05381 (2025)** — Context Length Hurts: Retrieve-then-Solve
- **Chroma Research (2025)** — Context Rot: non-linear performance degradation

### Behavioral Economics / Framing
- **Tversky & Kahneman (1991)** — Loss Aversion in Riskless Choice (2000+ citations)
- **Matz et al. (2024)** — Personalized persuasion: +40-50% effectiveness
- **Bromberg-Martin et al. (2010)** — Dopamine anticipation model

---

## 5. Decision Log

| תאריך | החלטה | נימוק |
|---|---|---|
| 2026-03-17 | pgvector over FAISS | B2B scale (אלפים, לא מיליארדים) + filtered search + ACID compliance |
| 2026-03-17 | success_label = FLOAT (not BOOLEAN) | נוסחת LG מספקת מדד רציף מוכח |
| 2026-03-17 | K=15-20 for Top-K retrieval | מאומת משני מקורות (PDF + Anthropic RAG research) |
| 2026-03-17 | Loss Frame for recommendation UI | 2-2.5x impact (Kahneman), additive with defaults |
| 2026-03-17 | Bayesian calibration = PE loop | אנלוגיה נוירולוגית מוכחת (ACC-Insula) |
| 2026-03-17 | Edmondson PSI 7-item required | נדרש לנוסחת LG, כרגע חסר בשאלון |
| 2026-03-17 | Contextual headers per snapshot | -49% retrieval failure (Anthropic study) |
