/**
 * \u05DE\u05E9\u05EA\u05E0\u05D9 \u05E1\u05D1\u05D9\u05D1\u05D4 — \u05D1\u05D3\u05D9\u05E7\u05D4 \u05D1\u05E8\u05D5\u05E8\u05D4 \u05D1\u05DE\u05E7\u05D5\u05DD non-null assertion.
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
