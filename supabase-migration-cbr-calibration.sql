-- CBR Calibration Priors — Tier 2 Bayesian Persistence
-- Run after supabase-migration-cbr.sql
--
-- Stores per-CTA Bayesian success priors that are updated after each follow-up.
-- Enables the calibration loop to improve Wilson score accuracy over time.
--
-- Research basis:
--   Bayes (1763): Posterior ∝ Prior × Likelihood
--   ACC-Insula PE loop analogy (meta-research-engine.md)
--   SOTA target: calibration drift < 0.15 per update

CREATE TABLE IF NOT EXISTS calibration_priors (
  cta_type          TEXT PRIMARY KEY,
  prior             FLOAT NOT NULL DEFAULT 0.5,
  observation_count INT   NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Seed with uninformative priors for the 3 known CTA types
INSERT INTO calibration_priors (cta_type, prior, observation_count)
VALUES
  ('sprint',    0.5, 0),
  ('retainer',  0.5, 0),
  ('live-demo', 0.5, 0)
ON CONFLICT (cta_type) DO NOTHING;

-- RLS: authenticated users can read and update (consultant-only system)
ALTER TABLE calibration_priors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read calibration_priors"
  ON calibration_priors FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "authenticated update calibration_priors"
  ON calibration_priors FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "authenticated insert calibration_priors"
  ON calibration_priors FOR INSERT
  TO authenticated WITH CHECK (true);
