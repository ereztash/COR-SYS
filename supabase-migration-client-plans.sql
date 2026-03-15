-- תוכנית עסקית ללקוח + תשובות שאלון COR-SYS
-- הרץ ב-Supabase SQL Editor אחרי supabase-schema.sql

CREATE TABLE client_business_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  title text,
  questionnaire_response jsonb,
  recommended_channel_id text,
  recommended_option_id text,
  summary text,
  next_steps text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(client_id)
);

CREATE TRIGGER client_business_plans_updated_at
  BEFORE UPDATE ON client_business_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
