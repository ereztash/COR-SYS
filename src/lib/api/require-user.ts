import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export type RequireUserOk = {
  ok: true
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User
}

export type RequireUserFail = {
  ok: false
  response: NextResponse
}

export type RequireUserResult = RequireUserOk | RequireUserFail

/** Enforce Supabase session for App Router API routes (middleware exempts /api). */
export async function requireUser(): Promise<RequireUserResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { ok: true, supabase, user }
}
