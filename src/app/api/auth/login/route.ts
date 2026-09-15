import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'
import { checkLicense } from '@/lib/license'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await AuthService.verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil' },
        { status: 401 }
      )
    }

    // ── License check ──
    const license = await checkLicense()
    if (!license.valid) {
      const msg = license.suspended
        ? 'Lisansınız askıya alınmıştır. Lütfen yöneticinizle iletişime geçin.'
        : 'Lisans süreniz dolmuştur. Lütfen yenileme için iletişime geçin.'
      return NextResponse.json(
        { error: msg, licenseExpired: true },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    })

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      // License warning info (if near expiry)
      ...(license.warning && {
        licenseWarning: true,
        licenseDaysLeft: license.daysLeft,
      }),
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch {
    console.error('[Auth] Login request failed unexpectedly')
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
