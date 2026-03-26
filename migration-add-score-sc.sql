-- Migration: Add score_sc (Structural Clarity Deficit) to dsm_diagnostic_snapshots
-- Run manually in Supabase SQL Editor (MCP is read-only for DDL/DML).
-- Phase 4 — 4th MECE dimension (Reductionist-Logical).

ALTER TABLE dsm_diagnostic_snapshots
  ADD COLUMN IF NOT EXISTS score_sc NUMERIC(4,2) NOT NULL DEFAULT 5.0;

-- Update total_entropy to include SC:
-- Old: total_entropy = avg(DR, ND, UC)     [max = 10]
-- New: total_entropy = avg(DR, ND, UC, SC) [max = 10]
-- Existing rows get SC = 5.0 (neutral default), so total_entropy shifts slightly.

UPDATE dsm_diagnostic_snapshots
SET total_entropy = ROUND((score_dr + score_nd + score_uc + score_sc) / 4.0, 2)
WHERE total_entropy IS NOT NULL;

-- Verify
SELECT snapshot_id, score_dr, score_nd, score_uc, score_sc, total_entropy
FROM dsm_diagnostic_snapshots
LIMIT 5;
