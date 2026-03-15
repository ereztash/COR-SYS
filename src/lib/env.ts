/**
 * משתני סביבה — בדיקה ברורה במקום non-null assertion.
 */

function getEnv(key: string): string {
  const value = process.env[key]
  if (value == null || value === '') {
    throw new Error(`Missing required env: ${key}. Add it to .env.local (see .env.example).`)
  }
  return value
}

export function getSupabaseEnv() {
  return {
    url: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  }
}
