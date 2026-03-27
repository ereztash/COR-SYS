-- Diagnostic Config Tables (trigger rules, evidence profiles, gate reviews)
-- Run after base schema migrations.

CREATE TABLE IF NOT EXISTS trigger_rules (
  id            TEXT PRIMARY KEY,
  if_condition  TEXT NOT NULL,
  then_action   TEXT NOT NULL,
  severity      TEXT NOT NULL CHECK (severity IN ('high', 'medium')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS intervention_evidence_profiles (
  intervention_tag TEXT PRIMARY KEY,
  evidence_level   TEXT NOT NULL CHECK (evidence_level IN ('high', 'contextual', 'gap')),
  citations        TEXT[] NOT NULL DEFAULT '{}',
  evidence_note    TEXT NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gate_reviews (
  id            TEXT PRIMARY KEY CHECK (id IN ('gate-1', 'gate-2', 'gate-3', 'gate-4')),
  week          INT NOT NULL CHECK (week IN (2, 4, 8, 12)),
  title_he      TEXT NOT NULL,
  pass_criteria TEXT[] NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gate_runs (
  run_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_id       TEXT NOT NULL REFERENCES gate_reviews(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status        TEXT NOT NULL CHECK (status IN ('pending', 'passed', 'failed')) DEFAULT 'pending',
  notes         TEXT NULL,
  evaluated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO trigger_rules (id, if_condition, then_action, severity)
VALUES
  ('tr-hotfix-spike',  'IF Hotfix Frequency עולה ב-25% מעל baseline חודשי', 'THEN הפעל NOD protocol: Near-miss triage + Just Culture + debt allocation', 'high'),
  ('tr-aim-low',       'IF AIM < 3.0 לפני rollout',                           'THEN הקפא rollout ובצע friction mapping לפני פריסה',                        'high'),
  ('tr-near-miss-zero','IF near-miss reporting = 0 לאורך רבעון',             'THEN הפעל ZSG reboot: no-blame reporting + safety activation',              'high'),
  ('tr-daci-latency',  'IF decision latency > 48h בפרויקטי ליבה',            'THEN הפעל DACI tightening עם Driver/Approver יחיד',                         'high'),
  ('tr-fim-low',       'IF FIM < 2.5 עקב מחסור תשתיתי',                      'THEN העבר קיבולת מיידית ל-Platform/Enablement לפני התערבות עומק',          'medium'),
  ('tr-cs-freeze',     'IF systemic stress (CS amplifier) מזוהה',            'THEN הפעל Systemic Friction Halt ו-stop new change initiatives',            'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO gate_reviews (id, week, title_he, pass_criteria)
VALUES
  ('gate-1', 2,  'Gate 1 — ייצוב עומס וקיצור שיהוי', ARRAY['Decision latency <= 48h בפרויקטי ליבה', '>=80% שמירה על guarded blocks']),
  ('gate-2', 4,  'Gate 2 — פתיחות ודיווח בטוח',      ARRAY['Near-miss עולה מאפס ל-flow פעיל', 'No-blame response נשמר ללא סנקציות דיווח']),
  ('gate-3', 8,  'Gate 3 — עקירת סטיות ולמידה כפולה', ARRAY['>=40% ירידה ב-hotfixes', 'AARs כוללים שינוי הנחות (double-loop)']),
  ('gate-4', 12, 'Gate 4 — קיבוע חוסן ומניעת ריבאונד', ARRAY['שיפור OHI/health יציב', 'Change fatigue נשארת בטווח נסבל'])
ON CONFLICT (id) DO NOTHING;

ALTER TABLE trigger_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_evidence_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read trigger_rules"
  ON trigger_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated write trigger_rules"
  ON trigger_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated read intervention_evidence_profiles"
  ON intervention_evidence_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated write intervention_evidence_profiles"
  ON intervention_evidence_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated read gate_reviews"
  ON gate_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated write gate_reviews"
  ON gate_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated read gate_runs"
  ON gate_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated write gate_runs"
  ON gate_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
