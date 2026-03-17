-- =============================================================================
-- COR-SYS CBR Migration
-- Phase 1: Data Layer — 3 CBR Tables + HNSW Index + Similarity Function
--
-- Prerequisites:
--   1. Run in Supabase Dashboard SQL Editor FIRST:
--      CREATE EXTENSION IF NOT EXISTS vector;
--
--   2. Then run this file.
--
-- Academic sources:
--   - Aamodt & Plaza (1994) — CBR 4 R's: Retrieve, Reuse, Revise, Retain
--   - Edmondson (1999) — Psychological Safety Index (psi_score)
--   - Kahneman & Tversky (1991) — LG weights (0.571/0.429)
--   - Anthropic Contextual Retrieval (2024) — HNSW + contextual embeddings
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Table 1: organizations_context
-- Stores stable organizational metadata (ICP identifiers for pre-filtering)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations_context (
  org_id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id        UUID REFERENCES clients(id) ON DELETE CASCADE,
  industry_sector  VARCHAR NOT NULL,
  employee_size_band VARCHAR NOT NULL,  -- 'under_50' | '50_150' | '150_300' | 'over_300'
  culture_archetype VARCHAR,            -- optional: psychographic classifier
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Table 2: dsm_diagnostic_snapshots
-- Each row = one diagnostic event with DSM scores + embedding
-- feature_vector: hybrid embedding (tabular normalized + text)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dsm_diagnostic_snapshots (
  snapshot_id      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id           UUID REFERENCES organizations_context(org_id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ DEFAULT now(),

  -- DSM Scores (0-10 each)
  score_dr         FLOAT NOT NULL CHECK (score_dr BETWEEN 0 AND 10),   -- Distorted Reciprocity
  score_nd         FLOAT NOT NULL CHECK (score_nd BETWEEN 0 AND 10),   -- Normalization of Deviance
  score_uc         FLOAT NOT NULL CHECK (score_uc BETWEEN 0 AND 10),   -- Unrepresentative Calibration
  total_entropy    FLOAT NOT NULL,       -- derived (0-4 pathology count or weighted)

  -- Operational metrics
  j_quotient       FLOAT,               -- organizational capacity loss (₪/day)
  decision_latency FLOAT,               -- DLI in days
  psi_score        FLOAT,               -- Edmondson PSI average (1-7) — REQUIRED for LG formula

  -- Qualitative
  severity_profile VARCHAR NOT NULL,    -- 'Healthy' | 'At-risk' | 'Critical' | 'Systemic-collapse'
  bottleneck_text  TEXT,                -- free-text narrative for text embedding

  -- Vector embedding: [normalized_tabular | text_embedding] concatenated, dim=1536
  -- Contextual header pattern (Anthropic 2024, -49% retrieval failure):
  -- "[CONTEXT: industry | size | severity] [SCORES: DR=x ND=x UC=x] [METRICS: ...] [NARRATIVE: ...]"
  feature_vector   VECTOR(1536)
);

-- HNSW index for fast Approximate Nearest Neighbor search (cosine similarity)
-- ef_construction=128, m=16 are defaults suitable for B2B scale (thousands of cases)
CREATE INDEX IF NOT EXISTS idx_dsm_snapshots_hnsw
  ON dsm_diagnostic_snapshots
  USING hnsw (feature_vector vector_cosine_ops);

-- ---------------------------------------------------------------------------
-- Table 3: interventions_and_feedback
-- Each row = one intervention + its outcome (after follow-up)
-- success_label FLOAT (not BOOLEAN): continuous metric from LG formula
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interventions_and_feedback (
  intervention_id    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_id        UUID REFERENCES dsm_diagnostic_snapshots(snapshot_id) ON DELETE CASCADE,

  -- Intervention record
  recommended_cta    VARCHAR NOT NULL,   -- what the system recommended
  consultant_override BOOLEAN DEFAULT false,
  actual_cta         VARCHAR NOT NULL,   -- what the consultant actually chose
  override_reason    TEXT,              -- WHY consultant overrode — PE loop input

  -- Follow-up outcomes (filled in at follow-up, 3-6 months later)
  followup_date      TIMESTAMPTZ,
  delta_entropy      FLOAT,             -- negative = improvement
  delta_j_quotient   FLOAT,             -- positive = ₪ recovered
  delta_psi          FLOAT,             -- change in PSI score (positive = improvement)
  delta_dr           FLOAT,             -- change in DR score (negative = improvement)

  -- Mathematical model outputs (computed from resilience formula)
  -- LG = 0.571×(-ΔDR) + 0.429×(ΔPSI)  [Kahneman weights]
  -- λ  = 1 + κ × LG                    [eigenvalue]
  learning_gain      FLOAT,             -- LG value
  lambda_eigenvalue  FLOAT,             -- λ: >1 growth, 0-1 decay, <0 bifurcation

  -- Continuous success metric (FLOAT, not BOOLEAN — normalized LG)
  -- Rationale: boolean success/fail loses calibration signal
  success_label      FLOAT,

  created_at         TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- SQL Similarity Function
-- Source: PDF research doc "מנוע DSM ארגוני" pp. 14-15
-- Pattern: Pre-filter (industry + severity) → ANN (HNSW cosine) → Top-K
-- K=15 default (validated: PDF K=15, Anthropic RAG K=20, sweet spot overlap)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_similar_cases_with_stats(
  query_embedding    vector(1536),
  target_industry    varchar,
  target_severity    varchar,
  max_dli            float,
  match_limit        int DEFAULT 15
)
RETURNS TABLE (
  case_id              uuid,
  org_industry         varchar,
  severity             varchar,
  intervention_type    varchar,
  delta_total_entropy  float,
  j_quotient_recovered float,
  learning_gain        float,
  lambda_eigenvalue    float,
  similarity_score     float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.snapshot_id                                    AS case_id,
    o.industry_sector                                AS org_industry,
    s.severity_profile                               AS severity,
    i.actual_cta                                     AS intervention_type,
    i.delta_entropy                                  AS delta_total_entropy,
    i.delta_j_quotient                               AS j_quotient_recovered,
    i.learning_gain,
    i.lambda_eigenvalue,
    1 - (s.feature_vector <=> query_embedding)       AS similarity_score
  FROM dsm_diagnostic_snapshots s
  JOIN interventions_and_feedback i ON s.snapshot_id = i.snapshot_id
  JOIN organizations_context o      ON s.org_id       = o.org_id
  WHERE
    o.industry_sector   = target_industry
    AND s.severity_profile = target_severity
    AND s.decision_latency <= max_dli
    AND i.followup_date IS NOT NULL          -- only cases with known outcomes
  ORDER BY s.feature_vector <=> query_embedding   -- cosine distance ASC
  LIMIT match_limit;
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS Policies (enable after P0-2 Auth is live)
-- Uncomment when authenticated users are in place:
-- ---------------------------------------------------------------------------
-- ALTER TABLE organizations_context        ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dsm_diagnostic_snapshots     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interventions_and_feedback   ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "authenticated_read_org_context"
--   ON organizations_context FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "authenticated_write_org_context"
--   ON organizations_context FOR INSERT TO authenticated WITH CHECK (true);
-- (repeat pattern for other tables)
