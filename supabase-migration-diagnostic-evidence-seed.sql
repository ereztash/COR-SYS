-- Seed evidence profiles for diagnostic intervention tags.
-- Run after: supabase-migration-diagnostic-config.sql

INSERT INTO intervention_evidence_profiles (intervention_tag, evidence_level, citations, evidence_note)
VALUES
  ('Decision Latency', 'contextual', ARRAY['Decision frameworks', 'Cost-of-delay practice'], 'Strong operational evidence; calibrate thresholds per org.'),
  ('Decision Architecture', 'contextual', ARRAY['Decision rights models'], 'Effective with clear accountability and measured escalation flow.'),
  ('Structural Fix', 'contextual', ARRAY['Argyris Double-Loop'], 'Requires local baseline and governance commitment for durable change.'),
  ('Normalization of Deviance', 'high', ARRAY['Vaughan (1996)', 'Safety engineering literature'], 'High-confidence pattern with repeated empirical support across domains.'),
  ('Double-Loop Learning', 'contextual', ARRAY['Argyris & Schoen'], 'Strong mechanism; quality depends on facilitation discipline.'),
  ('Just Culture', 'high', ARRAY['ECRI Just Culture', 'Patient safety evidence'], 'Consistent uplift in reporting behavior and systemic learning outcomes.'),
  ('Knowledge Resilience', 'contextual', ARRAY['Knowledge management practice'], 'Useful for tacit knowledge risk; validate transfer effectiveness locally.'),
  ('Capacity Calibration', 'contextual', ARRAY['Delivery predictability research'], 'Improves planning realism when paired with throughput measures.'),
  ('Knowledge Transfer', 'contextual', ARRAY['Operational continuity practice'], 'Improves continuity; outcome sensitivity to execution quality.'),
  ('RACI Audit', 'contextual', ARRAY['RACI/DACI guidance'], 'Good for clarifying ownership; impact depends on enforcement cadence.'),
  ('Strategy Cascade', 'contextual', ARRAY['Execution management practice'], 'Bridges strategy-to-execution; requires recurring review loop.'),
  ('Decision Protocol', 'contextual', ARRAY['Decision governance patterns'], 'High leverage in high-latency orgs with multi-team dependencies.'),
  ('Psychological Safety', 'high', ARRAY['Edmondson (1999)', 'Team learning evidence'], 'Strong evidence for learning/adaptation outcomes.'),
  ('Incentive Architecture', 'contextual', ARRAY['Org design and incentives'], 'Can reduce zero-sum behaviors when tied to shared outcomes.'),
  ('Coordination Architecture', 'contextual', ARRAY['Team Topologies', 'Operating model design'], 'Useful for cross-functional flow and dependency reduction.'),
  ('Cognitive Load', 'contextual', ARRAY['Cognitive load in knowledge work'], 'Strong directional evidence; needs local measurement of interrupt load.'),
  ('Async Architecture', 'contextual', ARRAY['Async-first operating guidance'], 'Often improves focus and throughput if norms are enforced.'),
  ('Nudge Management', 'gap', ARRAY['Behavioral design'], 'Promising but should be validated with controlled local baselines.'),
  ('Tech Tourniquet', 'contextual', ARRAY['Incident stabilization practice'], 'Strong short-term mitigation pattern; not a substitute for root-cause work.'),
  ('TTX Protocol', 'high', ARRAY['Reliability engineering tabletop exercises'], 'High-confidence in preparedness and response quality improvements.'),
  ('Capacity Buffer', 'contextual', ARRAY['Flow efficiency and resilience practice'], 'Improves resilience under variability; calibrate buffer per context.')
ON CONFLICT (intervention_tag) DO UPDATE
SET
  evidence_level = EXCLUDED.evidence_level,
  citations = EXCLUDED.citations,
  evidence_note = EXCLUDED.evidence_note,
  updated_at = now();
