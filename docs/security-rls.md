# אבטחה ו־RLS

## מצב נוכחי

- **Auth:** האפליקציה אינה משתמשת ב־Supabase Auth. כל הגישה ל־DB דרך **anon key**.
- **RLS:** קובץ `supabase-migration-rls.sql` מפעיל Row Level Security על כל הטבלאות ומגדיר policies שמאפשרות ל־anon לבצע כל פעולה (FOR ALL … USING (true)).

## סיכונים

- אם ה־**anon key** דולף או שהאפליקציה חשופה לרשת — צד שלישי יכול לקרוא/לשנות/למחוק נתונים.
- **המלצה:** להחזיק את האפליקציה ברשת פנימית או מאחורי VPN; לא לחשוף את ה־anon key ב־client אם אין צורך.

## כשמוסיפים Auth

1. להפעיל Supabase Auth (אימייל/סיסמה או SSO).
2. לעדכן את ה־policies ב־Supabase כך ש־SELECT/INSERT/UPDATE/DELETE יוגבלו לפי `auth.uid()` או role (למשל רק משתמשים מאומתים, או רק מנהלים לטבלאות רגישות).
3. להסיר או לצמצם הרשאות ל־anon לפי הצורך.

## הרצת מיגרציית RLS

ב־Supabase SQL Editor: להריץ את התוכן של `supabase-migration-rls.sql` (אחרי schema ו־client_plans).
