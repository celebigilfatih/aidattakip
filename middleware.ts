import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // Each push API authenticates its own staff/recipient context; these paths do not grant staff access.
  const pushPublicResources = ['/recipient', '/sw.js', '/manifest.webmanifest', '/push-icon.png', '/push-icon-512.png']
  if (pushPublicResources.includes(pathname) || pathname.startsWith('/api/push/')) return NextResponse.next()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout']
  
  // API routes that don't require authentication
  const publicApiRoutes = ['/api/auth/login', '/api/auth/logout']

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // If accessing API route
  if (pathname.startsWith('/api/')) {
    if (publicApiRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Kimlik doğrulama gerekli' },
        { status: 401 }
      )
    }

    const payload = AuthService.verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      )
    }

    return NextResponse.next()
  }

  // For pages, redirect to login if not authenticated
  if (!token) {
    const login = new URL('/login', request.url)
    if (pathname === '/notifications/overdue') login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }

  const payload = AuthService.verifyToken(token)
  if (!payload) {
    const login = new URL('/login', request.url)
    if (pathname === '/notifications/overdue') login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
