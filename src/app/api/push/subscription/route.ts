import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ensureActorRecipient, notificationFailure, notificationResponse, pushActor, requireSameOrigin } from '@/lib/notification-access'
import { NotificationError, validateSubscription } from '@/lib/notification-policy'
import { staffDeviceLifetime } from '@/lib/staff-summary-policy'
import { prisma } from '@/lib/prisma'
export async function POST(request: NextRequest) {
 try {
  requireSameOrigin(request)
  const raw = await request.json(), input = validateSubscription(raw), actor = await ensureActorRecipient(request)
  const device = await prisma.$transaction(async tx => {
   await tx.$queryRawUnsafe('SELECT id FROM notification_recipients WHERE id = $1 FOR UPDATE', actor.recipientId)
   const recipient = await tx.notificationRecipient.findUniqueOrThrow({ where: { id: actor.recipientId } })
   if (!recipient.isActive || !recipient.staffPushEnabled) throw new NotificationError(403, 'Alıcı kaydı pasif.')
   const prior = await tx.pushDevice.findUnique({ where: { endpoint: input.endpoint } })
   if (prior && prior.recipientId !== actor.recipientId) throw new NotificationError(409, 'Bu abonelik başka alıcıya ait. Bu cihazda bildirimleri sıfırlayıp yeniden açın.')
   if (raw.renewOnly === true && (!prior || !prior.isActive || prior.expiresAt <= new Date())) throw new NotificationError(409, 'Yeniden cihaz onayı gerekli.')
   const data = { recipientId: actor.recipientId, sessionHash: actor.sessionHash, p256dh: input.keys.p256dh, auth: input.keys.auth, label: input.label, isActive: true, expiresAt: new Date(Date.now() + staffDeviceLifetime) }
   const d = await tx.pushDevice.upsert({ where: { endpoint: input.endpoint }, create: { ...data, endpoint: input.endpoint }, update: data, select: { id: true, label: true, expiresAt: true } })
   if (!recipient.primaryDeviceId) await tx.notificationRecipient.update({ where: { id: recipient.id }, data: { primaryDeviceId: d.id } })
   return d
  })
  return notificationResponse(device)
 } catch (error) { return notificationFailure(error) }
}
export async function DELETE(request: NextRequest) {
 try {
  requireSameOrigin(request)
  const actor = await pushActor(request)
  const { deviceId } = z.object({ deviceId: z.string().min(1).max(100) }).parse(await request.json())
  await prisma.$transaction(async tx => {
    if (actor.recipientId) await tx.$queryRawUnsafe('SELECT id FROM notification_recipients WHERE id = $1 FOR UPDATE', actor.recipientId)
    await tx.pushDevice.updateMany({ where: { id: deviceId, recipientId: actor.recipientId ?? '', sessionHash: actor.sessionHash }, data: { isActive: false } })
  })
  return notificationResponse({ success: true })
 } catch (error) { return notificationFailure(error) }
}
export async function PATCH(request: NextRequest) {
 try {
  requireSameOrigin(request)
  const actor = await ensureActorRecipient(request)
  const { deviceId } = z.object({ deviceId: z.string().min(1).max(100) }).parse(await request.json())
  if (!await prisma.pushDevice.findFirst({ where: { id: deviceId, recipientId: actor.recipientId, isActive: true, expiresAt: { gt: new Date() } } })) throw new NotificationError(404, 'Geçerli cihaz bulunamadı.')
  await prisma.notificationRecipient.update({ where: { id: actor.recipientId }, data: { primaryDeviceId: deviceId } })
  return notificationResponse({ success: true })
 } catch (error) { return notificationFailure(error) }
}
