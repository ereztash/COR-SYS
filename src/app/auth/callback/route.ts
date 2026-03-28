import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * OAuth / magic-link callback.
 * Session cookies MUST be attached to the same NextResponse we return (redirect).
 * Using the shared createClient() + cookieStore.set often fails silently here, so users
 * bounce back to /login or hit server errors after Google sign-in.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextParam = url.searchParams.get('next') ?? '/'
  const nextPath = nextParam.startsWith('/') ? nextParam : '/'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/login?error=config', url.origin))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', url.origin))
  }

  const redirectTarget = new URL(nextPath, url.origin)
  if (redirectTarget.origin !== url.origin) {
    return NextResponse.redirect(new URL('/', url.origin))
  }

  const response = NextResponse.redirect(redirectTarget)

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', url.origin))
  }

  return response
}
