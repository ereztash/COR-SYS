# CBR Execution Roadmap — תוכנית ביצוע מדורגת
## COR-SYS: ממערכת CRM למנוע CDSS ארגוני

> **תאריך:** 2026-03-17
> **גרסה:** 1.0
> **מקור תכנון:** `cbr-research-synthesis.md` + `product-roadmap.md`
> **עיקרון מנחה:** הדרך הכי מהירה, אפקטיבית ויעילה — שלב אחד בונה על הקודם

---

## ⚠️ כלל ברזל: סדר תלויות

```
P0 (Auth+RLS) ──→ Phase 1 (Data) ──→ Phase 2 (Retrieval) ──→ Phase 3 (Intelligence)
   כבר מתוכנן         2-3 שעות          3-4 שעות              4-5 שעות

   בלי P0 אין          בלי Data          בלי Retrieval       בלי Intelligence
   production           אין Cases         אין Similar         אין Value
```

**זמן ביצוע כולל:** ~12-15 שעות עבודה (לא כולל P0)
**תלות חיצונית:** pgvector activation ב-Supabase Dashboard (1 דקה ידנית)

---

## Phase 0: Prerequisites (מה-Product Roadmap הקיים)

> **סטטוס:** מתוכנן ב-`product-roadmap.md`, טרם בוצע
> **חייב להסתיים לפני Phase 1**

### P0-1: Authentication + Protected Routes
- `src/proxy.ts` (חדש; Next.js 16 — לשעבר `middleware.ts`)
- `src/app/login/page.tsx` (חדש)
- `src/lib/supabase/server.ts` (עדכון)
- **⏱ ~30 דקות**

### P0-2: RLS — Row Level Security
- מיגרציית SQL: `authenticated` policies על כל הטבלאות
- **⏱ ~10 דקות**

---

## Phase 1: Data Layer + Mathematical Foundation

> **Impact:** HIGH | **Effort:** LOW | **⏱ 2-3 שעות**
> **מטרה:** מסד נתונים מוכן + מודל מתמטי פעיל

### Step 1.1: הפעלת pgvector ב-Supabase
**פעולה:** ידנית ב-Supabase Dashboard
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
**⏱ 1 דקה**

### Step 1.2: Migration — 3 טבלאות CBR
**קובץ:** `supabase-migration-cbr.sql` (חדש)

```sql
-- Table 1: organizations_context
CREATE TABLE organizations_context (
  org_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  industry_sector VARCHAR NOT NULL,
  employee_size_band VARCHAR NOT NULL,
  culture_archetype VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table 2: dsm_diagnostic_snapshots
CREATE TABLE dsm_diagnostic_snapshots (
  snapshot_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations_context(org_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  score_dr FLOAT NOT NULL,          -- 0-10
  score_nd FLOAT NOT NULL,          -- 0-10
  score_uc FLOAT NOT NULL,          -- 0-10
  total_entropy FLOAT NOT NULL,     -- derived
  j_quotient FLOAT,
  decision_latency FLOAT,           -- days
  psi_score FLOAT,                  -- Edmondson PSI (1-7) ← חדש!
  severity_profile VARCHAR NOT NULL, -- Healthy/At-risk/Critical/Systemic-collapse
  bottleneck_text TEXT,
  feature_vector VECTOR(1536)       -- combined tabular+textual embedding
);

-- HNSW index for fast ANN search
CREATE INDEX ON dsm_diagnostic_snapshots
  USING hnsw (feature_vector vector_cosine_ops);

-- Table 3: interventions_and_feedback
CREATE TABLE interventions_and_feedback (
  intervention_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_id UUID REFERENCES dsm_diagnostic_snapshots(snapshot_id) ON DELETE CASCADE,
  recommended_cta VARCHAR NOT NULL,
  consultant_override BOOLEAN DEFAULT false,
  actual_cta VARCHAR NOT NULL,
  override_reason TEXT,
  followup_date TIMESTAMPTZ,
  delta_entropy FLOAT,               -- negative = improvement
  delta_j_quotient FLOAT,
  delta_psi FLOAT,                   -- ← חדש! שינוי ב-PSI
  delta_dr FLOAT,                    -- ← חדש! שינוי ב-DR score
  learning_gain FLOAT,               -- ← חדש! LG = 0.571(-ΔDR) + 0.429(ΔPSI)
  lambda_eigenvalue FLOAT,           -- ← חדש! λ = 1 + κ×LG
  success_label FLOAT,               -- FLOAT not BOOLEAN (continuous)
  created_at TIMESTAMPTZ DEFAULT now()
);
```
**⏱ 15 דקות**

### Step 1.3: TypeScript Types
**קובץ:** `src/types/database.ts` (עדכון)

הוספת interfaces:
- `OrganizationContext`
- `DsmDiagnosticSnapshot`
- `InterventionAndFeedback`
- `RecommendationResult`

**⏱ 15 דקות**

### Step 1.4: נוסחת החוסן הארגוני
**קובץ:** `src/lib/resilience-formula.ts` (חדש)

> ⚠️ **עיגון מדעי — חובה לשמור!**

```typescript
/**
 * Organizational Resilience Formula
 * Source: org-resilience-research.md
 * Academic basis: Kahneman & Tversky (1991), Edmondson (1999)
 *
 * LG = 0.571 × (-ΔDR) + 0.429 × (ΔPSI)
 * R_org(t+1) = R_org(t) × (1 + κ × LG)
 * λ = 1 + κ × LG
 *
 * Weight rationale:
 *   0.571 for DR ← Loss Aversion Ratio ≈ 2.25:1 (Kahneman)
 *   0.429 for PSI ← Innovation multiplication (Edmondson)
 *
 * Critical threshold: κ × LG = -0.15
 *   Above: adaptive capacity maintained
 *   Below: maladaptive regime, structural change required
 */

// Constants — academically grounded, do not change without research
export const WEIGHT_DR = 0.571;    // Loss aversion component
export const WEIGHT_PSI = 0.429;   // Innovation/safety component
export const CRITICAL_THRESHOLD = -0.15;
export const DEFAULT_KAPPA = 0.5;  // Learning absorption coefficient

export interface ResilienceInput {
  delta_dr: number;    // Change in DR score (negative = improvement)
  delta_psi: number;   // Change in PSI score (positive = improvement)
  kappa?: number;      // Learning capacity coefficient (0-1)
}

export interface ResilienceOutput {
  learning_gain: number;       // LG value
  lambda: number;              // Eigenvalue
  trajectory: 'growth' | 'stable' | 'decay' | 'bifurcation';
  is_critical: boolean;        // Below -0.15 threshold?
  daily_loss_estimate?: number; // J-Quotient / 30 for loss framing
}

export function calculateLearningGain(delta_dr: number, delta_psi: number): number {
  return WEIGHT_DR * (-delta_dr) + WEIGHT_PSI * delta_psi;
}

export function calculateEigenvalue(kappa: number, lg: number): number {
  return 1 + kappa * lg;
}

export function classifyTrajectory(lambda: number): ResilienceOutput['trajectory'] {
  if (lambda > 1) return 'growth';
  if (lambda === 1) return 'stable';
  if (lambda > 0) return 'decay';
  return 'bifurcation';
}

export function analyzeResilience(input: ResilienceInput): ResilienceOutput {
  const kappa = input.kappa ?? DEFAULT_KAPPA;
  const lg = calculateLearningGain(input.delta_dr, input.delta_psi);
  const lambda = calculateEigenvalue(kappa, lg);
  const kappaLG = kappa * lg;

  return {
    learning_gain: lg,
    lambda,
    trajectory: classifyTrajectory(lambda),
    is_critical: kappaLG <= CRITICAL_THRESHOLD,
  };
}
```
**⏱ 30 דקות**

### Step 1.5: SQL Function — Similarity Search
**קובץ:** `supabase-migration-cbr.sql` (עדכון)

> הקוד מגיע ישירות מה-PDF (עמ' 14-15)

```sql
CREATE OR REPLACE FUNCTION get_similar_cases_with_stats(
  query_embedding vector(1536),
  target_industry varchar,
  target_severity varchar,
  max_dli float,
  match_limit int DEFAULT 15
)
RETURNS TABLE (
  case_id uuid,
  org_industry varchar,
  severity varchar,
  intervention_type varchar,
  delta_total_entropy float,
  j_quotient_recovered float,
  learning_gain float,
  lambda_eigenvalue float,
  similarity_score float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.snapshot_id AS case_id,
    o.industry_sector AS org_industry,
    s.severity_profile AS severity,
    i.actual_cta AS intervention_type,
    i.delta_entropy AS delta_total_entropy,
    i.delta_j_quotient AS j_quotient_recovered,
    i.learning_gain,
    i.lambda_eigenvalue,
    1 - (s.feature_vector <=> query_embedding) AS similarity_score
  FROM dsm_diagnostic_snapshots s
  JOIN interventions_and_feedback i ON s.snapshot_id = i.snapshot_id
  JOIN organizations_context o ON s.org_id = o.org_id
  WHERE
    o.industry_sector = target_industry
    AND s.severity_profile = target_severity
    AND s.decision_latency <= max_dli
    AND i.followup_date IS NOT NULL
  ORDER BY s.feature_vector <=> query_embedding
  LIMIT match_limit;
END;
$$;
```
**⏱ 20 דקות**

### Step 1.6: עדכון שאלון Assessment — הוספת Edmondson PSI
**קובץ:** `src/app/assess/[token]/AssessmentForm.tsx` (עדכון)

הוספת 7 שאלות Edmondson (סולם 1-7):
1. "בצוות שלנו, אם עושים טעות, זה מוחזק כנגדך"
2. "חברי הצוות יכולים להעלות בעיות ונושאים קשים"
3. "אנשים בצוות לפעמים דוחים אחרים בגלל שהם שונים"
4. "זה בטוח לקחת סיכונים בצוות הזה"
5. "קשה לבקש עזרה מחברי צוות אחרים"
6. "אף אחד בצוות לא יפעל בכוונה בדרך שפוגעת במאמצים שלי"
7. "הכישורים והיכולות הייחודיים שלי מוערכים ומנוצלים בעבודה"

**⏱ 30 דקות**

---

## Phase 2: Retrieval Layer (CBR Search)

> **Impact:** CRITICAL | **Effort:** MEDIUM | **⏱ 3-4 שעות**
> **מטרה:** יכולת שליפת מקרים דומים עם precision ≥85%
> **תלות:** Phase 1 הושלם

### Step 2.1: Embedding Service
**קובץ:** `src/lib/cbr/embedding.ts` (חדש)

**ארכיטקטורה (מ-RAG research):**
```
Input: DSM Snapshot (scores + narrative)
  ↓
Step 1: Normalize tabular data (DR/ND/UC/DLI → 0-1 range)
  ↓
Step 2: Generate text embedding via Claude API (bottleneck_text)
  ↓
Step 3: Concatenate [normalized_tabular | text_embedding]
  ↓
Step 4: Add contextual header metadata (industry, severity, size)
  ↓
Output: VECTOR(1536) → save to dsm_diagnostic_snapshots.feature_vector
```

**Contextual Header Pattern (מ-Anthropic study, -49% failure):**
```typescript
function buildContextualInput(snapshot: DsmSnapshot, org: OrgContext): string {
  return `[CONTEXT: ${org.industry_sector} | ${org.employee_size_band} | ${snapshot.severity_profile}]
  [SCORES: DR=${snapshot.score_dr}/10, ND=${snapshot.score_nd}/10, UC=${snapshot.score_uc}/10]
  [METRICS: DLI=${snapshot.decision_latency}d, J=${snapshot.j_quotient}, Entropy=${snapshot.total_entropy}]
  [NARRATIVE: ${snapshot.bottleneck_text}]`;
}
```
**⏱ 60 דקות**

### Step 2.2: Similarity Search Module
**קובץ:** `src/lib/cbr/similarity.ts` (חדש)

**Pattern: Retrieve-then-Solve (מ-RAG research, +15-20%):**
```
Step 1: Pre-filter by industry + severity (SQL WHERE) → ~100 cases
Step 2: ANN search via HNSW (pgvector) → Top-20
Step 3: Re-rank by pathology distance (L2 on DR/ND/UC) → Top-5
Step 4: Return with context metadata
```
**⏱ 45 דקות**

### Step 2.3: Supabase RPC Integration
**קובץ:** `src/lib/cbr/index.ts` (חדש — barrel export)

```typescript
export { generateCaseEmbedding } from './embedding';
export { findSimilarCases } from './similarity';
export { getRecommendations } from './recommend';
export { analyzeResilience } from '../resilience-formula';
```
**⏱ 15 דקות**

### Step 2.4: API Endpoint — Similar Cases
**קובץ:** `src/app/api/cbr/similar/[snapshotId]/route.ts` (חדש)

GET endpoint שמחזיר Top-K similar cases לצורך debugging ו-UI.
**⏱ 30 דקות**

---

## Phase 3: Intelligence Layer (Recommendations + Feedback)

> **Impact:** **הגבוה ביותר** — זה מה שהלקוח רואה | **Effort:** MEDIUM-HIGH | **⏱ 4-5 שעות**
> **מטרה:** מערכת CDSS פעילה עם evidence-based recommendations
> **תלות:** Phase 2 הושלם

### Step 3.1: Recommendation Engine
**קובץ:** `src/lib/cbr/recommend.ts` (חדש)

**לוגיקה (מ-PDF עמ' 10 + TypeScript עמ' 15-17):**
```
Input: Current DSM Snapshot + Top-K similar cases
  ↓
For each intervention type in similar cases:
  - Calculate Success Rate (entropy_delta < -1.5 OR j_quotient_recovery > threshold)
  - Calculate Wilson Score confidence interval
  - Calculate average ROI (j_quotient saved)
  - Calculate daily loss if no action (j_quotient / 30) ← Loss Framing
  ↓
Sort by success_rate DESC
  ↓
Output: ranked recommendations with confidence + loss frame
```

**Wilson Score (מ-PDF, סעיף 2 שלב 1):**
```typescript
function wilsonScore(successes: number, total: number, z = 1.96): number {
  const p = successes / total;
  const denominator = 1 + (z * z) / total;
  const center = p + (z * z) / (2 * total);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);
  return (center - spread) / denominator; // lower bound = conservative estimate
}
```
**⏱ 60 דקות**

### Step 3.2: Recommendation Panel UI (Loss-Framed)
**קובץ:** `src/components/diagnostic/RecommendationPanel.tsx` (חדש)

**Design (מ-Behavioral Economics research):**
```
┌─────────────────────────────────────────────────┐
│ ⚠️ עלות אי-פעולה: ₪12,500/יום (₪375K/חודש)    │ ← Loss Frame
├─────────────────────────────────────────────────┤
│ המלצה #1: NOD→BIA                              │
│ ✅ הצלחה: 78% (14 מקרים דומים)                  │
│ 📊 Confidence: High (Wilson: 0.54)              │
│ 📈 תוצאה צפויה: DLI -3.5 ימים, J +12%         │
│ 🔮 Trajectory: λ=1.12 → Growth                 │ ← Eigenvalue
│                                     [בחר ▶]    │
├─────────────────────────────────────────────────┤
│ המלצה #2: Blame→Reporting                      │
│ ⚠️ הצלחה: 60% (5 מקרים) | Confidence: Low     │
│                                     [בחר ▶]    │
├─────────────────────────────────────────────────┤
│ 🔄 לא מסכים? [Override + נמק ←]               │ ← PE Input
└─────────────────────────────────────────────────┘
```
**⏱ 60 דקות**

### Step 3.3: Intervention Override Form
**קובץ:** `src/components/forms/InterventionForm.tsx` (חדש)

שדות:
- `recommended_cta` (readonly — מה המערכת המליצה)
- `actual_cta` (dropdown — מה היועץ בחר)
- `override_reason` (textarea — למה שינה? **קריטי ל-PE loop**)
- כפתור שמירה → insert to `interventions_and_feedback`

**⏱ 30 דקות**

### Step 3.4: Follow-up Page
**קובץ:** `src/app/clients/[clientId]/followup/page.tsx` (חדש)

**מטרה:** מדידה חוזרת 3-6 חודשים אחרי התערבות

**שדות:**
- DSM scores חדשים (DR/ND/UC) → חישוב delta
- PSI score חדש → חישוב ΔPSI
- Decision Latency חדש → חישוב ΔDLI
- **חישוב אוטומטי:**
  - `learning_gain = 0.571(-ΔDR) + 0.429(ΔPSI)`
  - `lambda = 1 + κ × LG`
  - `success_label = normalized LG`
  - `delta_entropy`, `delta_j_quotient`
- שמירה → update `interventions_and_feedback`

**⏱ 45 דקות**

### Step 3.5: Bayesian Calibration Module
**קובץ:** `src/lib/cbr/calibration.ts` (חדש)

> ⚠️ **עיגון מדעי:**
> Prior × Likelihood = Posterior (Bayesian update)
> Analogous to ACC-Insula Prediction Error loop (meta-research-engine.md)

**לוגיקה:**
```typescript
interface CalibrationInput {
  rule_id: string;           // e.g., "uc_above_8_recommend_learning"
  prior_success_rate: number; // current belief (0-1)
  new_observation: boolean;   // did it work this time?
  industry?: string;          // optional: industry-specific calibration
}

function bayesianUpdate(prior: number, likelihood: number): number {
  const posterior = (prior * likelihood) /
    (prior * likelihood + (1 - prior) * (1 - likelihood));
  return posterior;
}
```

**טריגר:** רץ אוטומטית כש-Follow-up נשמר עם `success_label`.

**⏱ 30 דקות**

### Step 3.6: Trajectory Prediction
**קובץ:** `src/lib/cbr/trajectory.ts` (חדש)

> ⚠️ **עיגון מדעי:**
> λ = 1 + κ×LG (Eigenvalue from resilience formula)
> Critical threshold: κ×LG = -0.15

**פונקציונליות:**
- קלט: snapshot history (2+ snapshots over time)
- חישוב: trend of λ values
- פלט: trajectory prediction + confidence
- **Visual:** sparkline / mini-chart ב-client page

**⏱ 30 דקות**

---

## סדר עדיפויות — מפת חום

```
                        LOW EFFORT          HIGH EFFORT
                    ┌──────────────────┬──────────────────┐
                    │                  │                  │
    HIGH IMPACT     │  ⭐ Phase 1      │  ⭐ Phase 3.1-2  │
                    │  (Data + Formula)│  (Recommend +    │
                    │  DO FIRST        │   Loss Frame UI) │
                    │                  │  DO THIRD        │
                    ├──────────────────┼──────────────────┤
                    │                  │                  │
    LOW IMPACT      │  Phase 2.3       │  Phase 3.5-6     │
                    │  (barrel export) │  (Calibration +  │
                    │  TRIVIAL         │   Trajectory)    │
                    │                  │  DO LAST         │
                    └──────────────────┴──────────────────┘
```

## Quick Wins — הפעולות בעלות ROI הגבוה ביותר ליחידת זמן

| # | פעולה | זמן | ROI | למה |
|---|---|---|---|---|
| 1 | `resilience-formula.ts` | 30 דק | **x100** | נוסחה מוכחת → success metric מדעי |
| 2 | Migration SQL (3 tables) | 15 דק | **x50** | בסיס לכל Phase 2+3 |
| 3 | PSI questions in Assessment | 30 דק | **x30** | בלעדיו הנוסחה לא עובדת |
| 4 | Loss-framed UI text | 15 דק | **x20** | 2-2.5x impact על אימוץ המלצות |
| 5 | SQL similarity function | 20 דק | **x40** | הקוד כבר כתוב ב-PDF |

---

## Execution Checklist

### Phase 1 ☐
- [ ] הפעלת pgvector ב-Supabase Dashboard
- [ ] הרצת `supabase-migration-cbr.sql`
- [ ] עדכון `src/types/database.ts`
- [ ] יצירת `src/lib/resilience-formula.ts`
- [ ] יצירת SQL function `get_similar_cases_with_stats`
- [ ] הוספת 7 שאלות Edmondson PSI ל-Assessment

### Phase 2 ☐
- [ ] יצירת `src/lib/cbr/embedding.ts`
- [ ] יצירת `src/lib/cbr/similarity.ts`
- [ ] יצירת `src/lib/cbr/index.ts`
- [ ] יצירת API endpoint `/api/cbr/similar/[snapshotId]`

### Phase 3 ☐
- [ ] יצירת `src/lib/cbr/recommend.ts`
- [ ] יצירת `RecommendationPanel.tsx` (Loss-Framed)
- [ ] יצירת `InterventionForm.tsx` (Override + PE)
- [ ] יצירת Follow-up page
- [ ] יצירת `src/lib/cbr/calibration.ts`
- [ ] יצירת `src/lib/cbr/trajectory.ts`
- [ ] עדכון client detail page עם recommendation panel

---

## Risk Mitigation

| סיכון | הסתברות | חומרה | פתרון |
|---|---|---|---|
| Cold Start (אין מקרים) | 100% בהתחלה | HIGH | Fallback ל-Policy Engine + confidence="insufficient data" |
| PSI חסר בנתונים ישנים | HIGH | MEDIUM | תיוג רטרואקטיבי + default PSI=3.5 (midpoint) |
| Embedding API costs | MEDIUM | LOW | Cache per snapshot_id, generate once |
| Popularity Bias | MEDIUM | MEDIUM | Wilson Score penalization + Bayesian correction |
| Privacy (מקרים מזהים) | LOW | HIGH | RLS + anonymized output (industry+size only) |
| Semantic Drift | MEDIUM | HIGH | DLI crosscheck: if scores low but DLI high → alert |
