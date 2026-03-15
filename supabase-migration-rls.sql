-- Row Level Security (RLS) — הרץ אחרי supabase-schema.sql ו־supabase-migration-client-plans.sql
-- מפעיל RLS על כל הטבלאות. המדיניות הנוכחית: אנאון יכול הכל (מתאים לאפליקציה פנימית ללא auth).
-- כשתוסיף Auth (למשל Supabase Auth), עדכן את ה-policies לפי role/user.

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_business_plans ENABLE ROW LEVEL SECURITY;

-- מדיניות: אנאון יכול SELECT, INSERT, UPDATE, DELETE (שימוש פנימי, key לא לחשיפה).
CREATE POLICY "anon_all_clients" ON clients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_sprints" ON sprints FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_tasks" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_financials" ON financials FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_client_business_plans" ON client_business_plans FOR ALL TO anon USING (true) WITH CHECK (true);
