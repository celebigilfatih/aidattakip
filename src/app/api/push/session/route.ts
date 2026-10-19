import { NextRequest } from 'next/server'
import { notificationFailure, notificationResponse, pushActor, requireSameOrigin } from '@/lib/notification-access'
import { prisma } from '@/lib/prisma'
import { financialRole } from '@/lib/staff-summary-policy'
export async function GET(request: NextRequest) {
 try {
  const actor = await pushActor(request)
  const recipient = actor.recipientId ? await prisma.notificationRecipient.findUnique({ where: { id: actor.recipientId } }) : null
  const devices = actor.recipientId ? await prisma.pushDevice.findMany({ where: { recipientId: actor.recipientId }, select: { id: true, label: true, expiresAt: true, isActive: true, sessionHash: true } }) : []
  const notifications = actor.recipientId ? await prisma.notification.findMany({ where: { recipientId: actor.recipientId, status: { in: ['SENT', 'ACCEPTED'] }, ...(!financialRole(actor.staff.role) ? { isFeeSummary: false, type: 'GENERAL_ANNOUNCEMENT' } : {}) }, select: { id: true, title: true, message: true, sentAt: true, isFeeSummary: true }, orderBy: { createdAt: 'desc' }, take: 30 }) : []
  return notificationResponse({ name: actor.staff.name, kind: 'STAFF', selected: !!recipient?.isActive && !!recipient.staffPushEnabled, financial: financialRole(actor.staff.role), primaryDeviceId: recipient?.primaryDeviceId,
   devices: devices.map(({ sessionHash, ...d }) => ({ ...d, thisSession: sessionHash === actor.sessionHash })), notifications })
 } catch (error) { return notificationFailure(error) }
}
export async function DELETE(request: NextRequest) {
 try {
  requireSameOrigin(request)
  const actor = await pushActor(request)
  await prisma.$transaction(async tx => {
    if (actor.recipientId) await tx.$queryRawUnsafe('SELECT id FROM notification_recipients WHERE id = $1 FOR UPDATE', actor.recipientId)
    await tx.pushDevice.updateMany({ where: { recipientId: actor.recipientId ?? '', sessionHash: actor.sessionHash }, data: { isActive: false } })
  })
  return notificationResponse({ success: true })
 } catch (error) { return notificationFailure(error) }
}
