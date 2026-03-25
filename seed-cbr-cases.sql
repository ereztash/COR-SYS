-- CBR Seed Data — 10 historical intervention cases
-- Covers: Cybersecurity / Fintech / Healthtech / B2B-SaaS
-- Severities: at-risk / critical / systemic-collapse
-- Includes 2 consultant override cases (override=true, poor outcome)
-- feature_vector is NULL — embeddings generated lazily by embedding service

-- ─────────────────────────────────────────
-- ORGANIZATIONS CONTEXT (anonymous — no client_id)
-- ─────────────────────────────────────────

INSERT INTO organizations_context (org_id, client_id, industry_sector, employee_size_band, culture_archetype) VALUES
  ('a1000000-0000-0000-0000-000000000001', NULL, 'Cybersecurity', '80-150',  'Competitive'),
  ('a1000000-0000-0000-0000-000000000002', NULL, 'Fintech',        '80-150',  'Results-Driven'),
  ('a1000000-0000-0000-0000-000000000003', NULL, 'Healthtech',     '150-500', 'Hierarchical'),
  ('a1000000-0000-0000-0000-000000000004', NULL, 'Cybersecurity',  '80-150',  'Competitive'),
  ('a1000000-0000-0000-0000-000000000005', NULL, 'Fintech',        '50-80',   'Results-Driven'),
  ('a1000000-0000-0000-0000-000000000006', NULL, 'Healthtech',     '150-500', 'Hierarchical'),
  ('a1000000-0000-0000-0000-000000000007', NULL, 'Cybersecurity',  '80-150',  'Collaborative'),
  ('a1000000-0000-0000-0000-000000000008', NULL, 'B2B-SaaS',       '80-150',  'Results-Driven'),
  ('a1000000-0000-0000-0000-000000000009', NULL, 'Fintech',        '150-500', 'Hierarchical'),
  ('a1000000-0000-0000-0000-000000000010', NULL, 'Healthtech',     '50-80',   'Collaborative');

-- ─────────────────────────────────────────
-- DSM DIAGNOSTIC SNAPSHOTS
-- total_entropy = avg(DR, ND, UC, SC) — Phase 4: 4D MECE
-- SC (Structural Clarity Deficit): high=8.5, medium=5.0, low=1.5
-- ─────────────────────────────────────────

INSERT INTO dsm_diagnostic_snapshots
  (snapshot_id, org_id, score_dr, score_nd, score_uc, score_sc, total_entropy, j_quotient, decision_latency, psi_score, severity_profile, bottleneck_text, feature_vector)
VALUES
  -- Case 1: Cybersecurity / at-risk — NOD pattern, siloed teams | SC=4.5 (medium, growing startup)
  ('b1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   6.5, 5.0, 4.5, 4.5, 5.13, 42, 8.0, 4.2, 'at-risk',
   'Cross-team escalations blocked at VP level. Repeated near-miss incidents normalized over 3 quarters.',
   NULL),

  -- Case 2: Fintech / critical — DR+UC comorbidity, trust collapse | SC=6.5 (processes eroded by competition)
  ('b1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000002',
   7.8, 6.5, 7.2, 6.5, 7.00, 31, 14.0, 2.9, 'critical',
   'Product and Risk departments operate as competing entities. Budget decisions require 3+ committee rounds.',
   NULL),

  -- Case 3: Healthtech / critical — ND dominant | SC=4.5 (regulatory pressure preserves some structure)
  ('b1000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000003',
   7.0, 7.5, 5.5, 4.5, 6.13, 38, 12.0, 3.1, 'critical',
   'Clinical protocol deviations treated as individual errors. Systemic root causes unaddressed for 2 years.',
   NULL),

  -- Case 4: Cybersecurity / systemic-collapse — all pathologies severe | SC=7.5 (structural breakdown)
  ('b1000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000004',
   8.9, 8.2, 8.5, 7.5, 8.28, 18, 21.0, 1.8, 'systemic-collapse',
   'Organization unable to respond to incidents without executive intervention. Decision latency at 3 weeks.',
   NULL),

  -- Case 5: Fintech / at-risk — UC dominant | SC=4.0 (fintech clearer processes)
  ('b1000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000005',
   5.5, 4.8, 6.0, 4.0, 5.08, 48, 7.0, 4.8, 'at-risk',
   'Middle management overconfident in model accuracy. Field data systematically discounted in planning.',
   NULL),

  -- Case 6: Healthtech / critical — override case, poor outcome | SC=6.5 (high SC amplified failure)
  ('b1000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000006',
   6.8, 7.0, 8.1, 6.5, 7.10, 29, 15.0, 2.5, 'critical',
   'Leadership narrative disconnected from ground truth. Reporting systems create false safety signals.',
   NULL),

  -- Case 7: Cybersecurity / at-risk — collaborative culture | SC=3.5 (better defined roles)
  ('b1000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000007',
   5.8, 6.2, 5.0, 3.5, 5.13, 44, 9.0, 3.8, 'at-risk',
   'Security incidents logged but pattern analysis absent. Teams aware of drift but lack escalation channel.',
   NULL),

  -- Case 8: B2B-SaaS / critical — DR+UC, structural bypass | SC=7.0 (Sales bypassing product = SC deficit)
  ('b1000000-0000-0000-0000-000000000008',
   'a1000000-0000-0000-0000-000000000008',
   7.2, 5.5, 7.8, 7.0, 6.88, 35, 11.0, 3.0, 'critical',
   'Sales and Engineering in structural conflict. Feature requests bypassed product process for 18 months.',
   NULL),

  -- Case 9: Fintech / systemic-collapse — override, failed | SC=8.0 (board distrust = structural collapse)
  ('b1000000-0000-0000-0000-000000000009',
   'a1000000-0000-0000-0000-000000000009',
   9.1, 7.8, 8.8, 8.0, 8.43, 12, 25.0, 1.5, 'systemic-collapse',
   'Board-level distrust in management metrics. Regulatory reporting disconnected from operational reality.',
   NULL),

  -- Case 10: Healthtech / at-risk — smaller collaborative org | SC=4.0 (small org, clear enough)
  ('b1000000-0000-0000-0000-000000000010',
   'a1000000-0000-0000-0000-000000000010',
   5.2, 4.5, 5.8, 4.0, 4.88, 52, 6.0, 5.1, 'at-risk',
   'Clinical staff feedback loops absent. Manager confidence scores diverge from team safety perception.',
   NULL);

-- ─────────────────────────────────────────
-- INTERVENTIONS AND FEEDBACK
-- LG = 0.571×(-ΔDR) + 0.429×(ΔPSI)
-- λ  = 1 + 0.5 × LG
-- ─────────────────────────────────────────

INSERT INTO interventions_and_feedback
  (intervention_id, snapshot_id, recommended_cta, consultant_override, actual_cta, override_reason,
   followup_date, delta_entropy, delta_j_quotient, delta_psi, delta_dr,
   learning_gain, lambda_eigenvalue, success_label)
VALUES
  -- Case 1: NOD→BIA, succeeded
  -- LG = 0.571×2.1 + 0.429×0.8 = 1.199+0.343 = 1.542 | λ=1.771
  ('c1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001',
   'NOD→BlameInvestigationAudit', false, 'NOD→BlameInvestigationAudit', NULL,
   '2025-09-15 00:00:00+00', -1.8, 14.0, 0.8, -2.1,
   1.542, 1.771, 0.85),

  -- Case 2: DR→WorkshopIntervention, succeeded
  -- LG = 0.571×2.8 + 0.429×1.2 = 1.599+0.515 = 2.114 | λ=2.057
  ('c1000000-0000-0000-0000-000000000002',
   'b1000000-0000-0000-0000-000000000002',
   'DR→WorkshopIntervention', false, 'DR→WorkshopIntervention', NULL,
   '2025-07-20 00:00:00+00', -2.9, 17.0, 1.2, -2.8,
   2.114, 2.057, 0.90),

  -- Case 3: ND→ProtocolAudit, succeeded
  -- LG = 0.571×1.5 + 0.429×0.6 = 0.857+0.257 = 1.114 | λ=1.557
  ('c1000000-0000-0000-0000-000000000003',
   'b1000000-0000-0000-0000-000000000003',
   'ND→ProtocolAudit', false, 'ND→ProtocolAudit', NULL,
   '2025-08-10 00:00:00+00', -2.1, 12.0, 0.6, -1.5,
   1.114, 1.557, 0.72),

  -- Case 4: L3→StructuralReorganization, full rebuild, succeeded
  -- LG = 0.571×3.2 + 0.429×1.5 = 1.827+0.644 = 2.471 | λ=2.236
  ('c1000000-0000-0000-0000-000000000004',
   'b1000000-0000-0000-0000-000000000004',
   'L3→StructuralReorganization', false, 'L3→StructuralReorganization', NULL,
   '2025-06-01 00:00:00+00', -4.1, 22.0, 1.5, -3.2,
   2.471, 2.236, 0.95),

  -- Case 5: UC→CalibrationSession, at-risk, succeeded
  -- LG = 0.571×1.2 + 0.429×0.4 = 0.685+0.172 = 0.857 | λ=1.429
  ('c1000000-0000-0000-0000-000000000005',
   'b1000000-0000-0000-0000-000000000005',
   'UC→CalibrationSession', false, 'UC→CalibrationSession', NULL,
   '2025-10-05 00:00:00+00', -1.2, 10.0, 0.4, -1.2,
   0.857, 1.429, 0.68),

  -- Case 6: OVERRIDE — consultant chose wrong CTA, partial outcome
  -- Recommended: UC→OntologicalWorkshop | Actual: DR→WorkshopIntervention
  -- LG = 0.571×0.8 + 0.429×0.2 = 0.457+0.086 = 0.543 | λ=1.271
  ('c1000000-0000-0000-0000-000000000006',
   'b1000000-0000-0000-0000-000000000006',
   'UC→OntologicalWorkshop', true, 'DR→WorkshopIntervention',
   'Client CEO preferred team workshop over ontological re-framing. Systemic UC issue likely to recur.',
   '2025-11-01 00:00:00+00', -0.9, 5.0, 0.2, -0.8,
   0.543, 1.271, 0.35),

  -- Case 7: NOD→BIA, at-risk, strong outcome (validates Case 1 pattern)
  -- LG = 0.571×2.5 + 0.429×1.1 = 1.428+0.472 = 1.900 | λ=1.950
  ('c1000000-0000-0000-0000-000000000007',
   'b1000000-0000-0000-0000-000000000007',
   'NOD→BlameInvestigationAudit', false, 'NOD→BlameInvestigationAudit', NULL,
   '2025-09-28 00:00:00+00', -2.3, 16.0, 1.1, -2.5,
   1.900, 1.950, 0.88),

  -- Case 8: DR→WorkshopIntervention, B2B-SaaS, succeeded
  -- LG = 0.571×2.0 + 0.429×0.9 = 1.142+0.386 = 1.528 | λ=1.764
  ('c1000000-0000-0000-0000-000000000008',
   'b1000000-0000-0000-0000-000000000008',
   'DR→WorkshopIntervention', false, 'DR→WorkshopIntervention', NULL,
   '2025-08-25 00:00:00+00', -2.4, 13.0, 0.9, -2.0,
   1.528, 1.764, 0.80),

  -- Case 9: OVERRIDE — systemic-collapse, wrong intervention chosen
  -- Recommended: L3→StructuralReorganization | Actual: ND→ProtocolAudit (insufficient)
  -- LG = 0.571×1.0 + 0.429×0.3 = 0.571+0.129 = 0.700 | λ=1.350
  ('c1000000-0000-0000-0000-000000000009',
   'b1000000-0000-0000-0000-000000000009',
   'L3→StructuralReorganization', true, 'ND→ProtocolAudit',
   'Board refused structural reorganization. Protocol audit implemented as compromise — insufficient for collapse severity.',
   '2025-07-10 00:00:00+00', -1.1, 4.0, 0.3, -1.0,
   0.700, 1.350, 0.25),

  -- Case 10: UC→CalibrationSession, at-risk, Healthtech, succeeded
  -- LG = 0.571×1.8 + 0.429×1.3 = 1.028+0.558 = 1.586 | λ=1.793
  ('c1000000-0000-0000-0000-000000000010',
   'b1000000-0000-0000-0000-000000000010',
   'UC→CalibrationSession', false, 'UC→CalibrationSession', NULL,
   '2025-10-20 00:00:00+00', -1.7, 18.0, 1.3, -1.8,
   1.586, 1.793, 0.82);
