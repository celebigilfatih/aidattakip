import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/notification-policy'
import { notificationFailure, requireSameOrigin } from '@/lib/notification-access'

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const token = request.cookies.get('auth-token')?.value
    if (token) await prisma.$transaction(async tx => {
      const hash = hashToken(token)
      await tx.$queryRawUnsafe('SELECT r.id FROM notification_recipients r WHERE r.id IN (SELECT d."recipientId" FROM push_devices d WHERE d."sessionHash" = $1) ORDER BY r.id FOR UPDATE', hash)
      await tx.pushDevice.updateMany({ where: { sessionHash: hash }, data: { isActive: false } })
    })
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
