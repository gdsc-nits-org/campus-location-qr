import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow access to admin login, signup, and public auth API endpoints
  if (pathname === '/admin/login' || pathname === '/admin/signup' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith('/admin')) {
    const allCookies = req.cookies.getAll()
    const hasSessionCookie = allCookies.some(
      c => c.name.includes('next-auth.session-token') || c.name.includes('session-token')
    )

    if (!hasSessionCookie) {
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
