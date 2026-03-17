-- Longitudinal diagnostics: היסטוריית אבחונים לפי לקוח
-- הרץ ב-Supabase SQL Editor אחרי supabase-migration-client-assessments.sql

CREATE TABLE IF NOT EXISTS client_diagnostics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  answers jsonb NOT NULL,
  dsm_summary jsonb NOT NULL
);

CREATE INDEX idx_client_diagnostics_client_created ON client_diagnostics (client_id, created_at DESC);

-- RLS
ALTER TABLE client_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_client_diagnostics" ON client_diagnostics FOR ALL TO authenticated USING (true) WITH CHECK (true);
