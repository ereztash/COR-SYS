-- אימות אחרי מיגרציה: הרץ ב-Supabase SQL Editor על אותו פרויקט שב-.env.local / Vercel

-- 1) האם העמודה קיימת?
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clients'
  AND column_name = 'operating_context';
-- צפי: שורה אחת עם operating_context | text | YES

-- 2) דוגמה: 5 לקוחות אחרונים עם השדה (אם ריק — עדיין לא נשמר מהאפליקציה)
SELECT id, name, operating_context, updated_at
FROM public.clients
ORDER BY updated_at DESC
LIMIT 5;
