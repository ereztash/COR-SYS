'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') ?? 'http'
  const redirectTo = `${protocol}://${host}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }
  if (data?.url) {
    redirect(data.url)
  }
  redirect('/login?error=unknown')
}
