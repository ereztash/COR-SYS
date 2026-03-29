-- הקשר תפעולי ללקוח: מקור אמת לשאלונים ולניסוח תוצאות (team / one_man_show)
-- הרץ ב-Supabase SQL Editor

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS operating_context text
  CHECK (operating_context IS NULL OR operating_context IN ('team', 'one_man_show'));

COMMENT ON COLUMN public.clients.operating_context IS 'COR-SYS: team vs one_man_show — drives questionnaire wording and merged diagnostics';
