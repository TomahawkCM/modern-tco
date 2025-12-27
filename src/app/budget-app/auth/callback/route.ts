import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/budget-app'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    const errorParam = encodeURIComponent(errorDescription || error)
    return NextResponse.redirect(`${origin}/budget-app/auth/login?error=${errorParam}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Successful auth - redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Code exchange error:', exchangeError.message)
  }

  // Fallback: redirect to login with error
  return NextResponse.redirect(`${origin}/budget-app/auth/login?error=auth_callback_error`)
}
