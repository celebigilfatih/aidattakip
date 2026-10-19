import { NextRequest } from 'next/server'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { notificationFailure, notificationResponse, recipientScope, requireSameOrigin } from '@/lib/notification-access'
import { hashToken, NotificationError, recipientCookie, recipientLifetime } from '@/lib/notification-policy'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const { token } = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }).parse(await request.json())
    const sessionToken = randomBytes(32).toString('base64url')
    await prisma.$transaction(async tx => {
      const invite = await tx.pushInvite.findUnique({ where: { tokenHash: hashToken(token) }, include: { recipient: true, createdBy: true } })
      if (!invite || invite.usedAt || invite.expiresAt <= new Date() || !invite.recipient.isActive || !invite.createdBy.isActive || invite.createdBy.role !== 'ADMIN') {
        throw new NotificationError(400, 'Davet geçersiz veya süresi dolmuş. Kulüpten yeni davet isteyin.')
      }
      if (!await tx.notificationRecipient.findFirst({ where: { id: invite.recipientId, ...recipientScope(invite.createdBy) } })) throw new NotificationError(400, 'Davetin yetki kapsamı artık geçerli değil.')
      const consumed = await tx.pushInvite.updateMany({ where: { id: invite.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } })
      if (!consumed.count) throw new NotificationError(409, 'Davet daha önce kullanıldı.')
      await tx.recipientSession.create({ data: { recipientId: invite.recipientId, tokenHash: hashToken(sessionToken), expiresAt: new Date(Date.now() + recipientLifetime) } })
    })
    const response = notificationResponse({ success: true })
    response.cookies.set(recipientCookie, sessionToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: recipientLifetime / 1000 })
    return response
  } catch (error) { return notificationFailure(error) }
}
