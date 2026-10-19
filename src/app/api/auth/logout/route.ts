import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/notification-policy'
import { notificationFailure, requireSameOrigin } from '@/lib/notification-access'

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const token = request.cookies.get('auth-token')?.value
    if (token) await prisma.pushDevice.updateMany({ where: { sessionHash: hashToken(token) }, data: { isActive: false } })
  } catch (error) { return notificationFailure(error) }
  const response = NextResponse.json({ message: 'Başarıyla çıkış yapıldı' })
  
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: false, // Set to true only when using HTTPS
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
