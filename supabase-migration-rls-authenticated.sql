-- RLS: גישה רק למשתמשים מאומתים (authenticated)
-- הרץ אחרי P0-1 (Auth) מופעל. מסיר גישת anon ומוסיף policies ל-authenticated.
-- הרצה: Supabase SQL Editor.

-- הסרת מדיניות anon
DROP POLICY IF EXISTS "anon_all_clients" ON clients;
DROP POLICY IF EXISTS "anon_all_sprints" ON sprints;
DROP POLICY IF EXISTS "anon_all_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_all_financials" ON financials;
DROP POLICY IF EXISTS "anon_all_client_business_plans" ON client_business_plans;

-- מדיניות: authenticated יכול SELECT, INSERT, UPDATE, DELETE על כל השורות
CREATE POLICY "authenticated_all_clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_sprints" ON sprints FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_tasks" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_financials" ON financials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_client_business_plans" ON client_business_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
