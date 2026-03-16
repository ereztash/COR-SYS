-- Self-Serve Assessment: טבלה ללינק הערכה ציבורי
-- הרץ ב-Supabase SQL Editor אחרי supabase-migration-rls-authenticated.sql (או אחרי schema + client_plans).

CREATE TABLE IF NOT EXISTS client_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token uuid DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  answers jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER client_assessments_updated_at
  BEFORE UPDATE ON client_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE client_assessments ENABLE ROW LEVEL SECURITY;

-- מאומתים: גישה מלאה
CREATE POLICY "authenticated_all_client_assessments" ON client_assessments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- אנונימי: רק SELECT ו-UPDATE (כדי שלקוח עם לינק יוכל למלא ולעדכן תשובות)
CREATE POLICY "anon_select_client_assessments" ON client_assessments FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_client_assessments" ON client_assessments FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- אנונימי לא יכול INSERT/DELETE (רק יועץ מאומת יוצר לינק)
-- INSERT נעשה על ידי authenticated בלבד.
