import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'


function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // ── 1. Protected routes — require authentication ──────────
  const protectedRoutes = ['/dashboard', '/admin', '/api/admin']
  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // ── 2. Admin routes — require admin email allowlist ───────
  if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && user) {
    const adminEmails = getAdminEmails()
    const userEmail = (user.email || '').toLowerCase()

    if (adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('error', 'admin_required')
      return NextResponse.redirect(url)
    }
  }

  // ── 3. Subscription gate for /dashboard routes ────────────
  // Only enforce if STRIPE_SECRET_KEY is configured (skip in dev without Stripe)
  // Skip API routes under /dashboard (if any)
  const shouldCheckSubscription =
    user &&
    pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/api') &&
    process.env.STRIPE_SECRET_KEY // only enforce when Stripe is configured

  if (shouldCheckSubscription) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_status')
        .eq('id', user!.id)
        .single()

      const status = userData?.subscription_status
      const isActive = status === 'active'

      if (!isActive && userData) {
        // User exists but subscription not active → redirect to pricing
        const url = request.nextUrl.clone()
        url.pathname = '/pricing'
        url.searchParams.set('reason', 'subscription_required')
        return NextResponse.redirect(url)
      }
      // If userData is null, user row doesn't exist yet (just signed up) — let them through
    } catch {
      // DB error — don't block the user, let them through
    }
  }

  // ── 4. Auth pages — redirect to dashboard if logged in ────
  const authRoutes = ['/login', '/signup']
  if (authRoutes.includes(pathname) && user) {
    const adminEmails = getAdminEmails()
    const userEmail = (user.email || '').toLowerCase()
    const isAdmin = adminEmails.length > 0 && adminEmails.includes(userEmail)

    const url = request.nextUrl.clone()
    url.pathname = isAdmin ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
