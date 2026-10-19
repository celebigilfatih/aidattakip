import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { ensureActorRecipient, notificationFailure, notificationResponse, pushActor, requireSameOrigin } from '@/lib/notification-access'
import { NotificationError, validateSubscription } from '@/lib/notification-policy'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const input = validateSubscription(await request.json())
    const actor = await ensureActorRecipient(request)
    const prior = await prisma.pushDevice.findUnique({ where: { endpoint: input.endpoint } })
    if (prior?.isActive && prior.recipientId !== actor.recipientId) throw new NotificationError(409, 'Bu cihaz başka alıcıya bağlı. Önce cihazdan çıkış yapıp izni kaldırın.')
    const expiry = actor.sessionId ? (await prisma.recipientSession.findUniqueOrThrow({ where: { id: actor.sessionId } })).expiresAt
      : new Date(((jwt.decode(request.cookies.get('auth-token')!.value) as jwt.JwtPayload).exp ?? 0) * 1000)
    if (expiry <= new Date()) throw new NotificationError(401, 'Oturum süresi dolmuş.')
    const data = { recipientId: actor.recipientId, sessionHash: actor.sessionHash, p256dh: input.keys.p256dh, auth: input.keys.auth, label: input.label, isActive: true, expiresAt: expiry }
    const device = await prisma.pushDevice.upsert({ where: { endpoint: input.endpoint }, create: { ...data, endpoint: input.endpoint }, update: data, select: { id: true, label: true } })
    return notificationResponse(device)
  } catch (error) { return notificationFailure(error) }
}
export async function DELETE(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const actor = await pushActor(request)
    const { deviceId } = z.object({ deviceId: z.string().max(100) }).parse(await request.json())
    await prisma.pushDevice.updateMany({ where: { id: deviceId, recipientId: actor.recipientId ?? '', sessionHash: actor.sessionHash }, data: { isActive: false } })
    return notificationResponse({ success: true })
  } catch (error) { return notificationFailure(error) }
}
