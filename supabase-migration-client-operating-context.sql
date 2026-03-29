-- הקשר תפעולי ללקוח: מקור אמת לשאלונים ולניסוח תוצאות (team / one_man_show)
-- הרץ ב-Supabase SQL Editor (פרויקט שבו כבר קיימת טבלת public.clients).
-- אידמפוטנטי: אפשר להריץ שוב בלי לאבד נתונים.

-- עמודה (בנפרד מה־CHECK — תאימות טובה יותר ל-Postgres)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS operating_context text;

-- אילוץ ערכים (שם קבוע כדי שאפשר יהיה לעדכן/להסיר)
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_operating_context_check;
ALTER TABLE public.clients
  ADD CONSTRAINT clients_operating_context_check
  CHECK (operating_context IS NULL OR operating_context IN ('team', 'one_man_show'));

COMMENT ON COLUMN public.clients.operating_context IS 'COR-SYS: team vs one_man_show — drives questionnaire wording and merged diagnostics';

-- רענון קאש סכמה ל-PostgREST (אם אין הרשאה — מתעלמים; אפשר גם Project Settings → API → Reload schema)
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
