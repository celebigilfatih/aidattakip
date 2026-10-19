import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, recipientScope, requireManager, requireSameOrigin } from '@/lib/notification-access'
import { NotificationError } from '@/lib/notification-policy'
export async function GET(request: NextRequest) {
 try {
  const user = await requireManager(request)
  const staff = await prisma.user.findMany({ where: user.branchId ? { branchId: user.branchId } : {}, select: { id: true, name: true, role: true, isActive: true, branchId: true, notificationRecipient: { select: {
   id: true, staffPushEnabled: true, isActive: true, primaryDeviceId: true,
   devices: { select: { id: true, label: true, isActive: true, expiresAt: true, updatedAt: true, deliveries: { orderBy: { createdAt: 'desc' }, take: 1, select: { status: true, statusCode: true, finishedAt: true } } } },
  } } }, orderBy: { name: 'asc' } })
  const recipients = staff.flatMap(s => s.notificationRecipient ? [{ ...s.notificationRecipient, kind: 'STAFF', name: s.name, role: s.role, userId: s.id, userActive: s.isActive }] : [])
  return notificationResponse({ canInvite: false, canManageStaff: user.role === 'ADMIN', recipients, staff: staff.map(({ notificationRecipient, ...s }) => s), students: [], parents: [] })
 } catch (error) { return notificationFailure(error) }
}
export async function POST(request: NextRequest) {
 try {
  requireSameOrigin(request)
  const user = await requireManager(request, true)
  const input = z.object({ kind: z.literal('STAFF'), identityId: z.string().min(1).max(100), verified: z.literal(true) }).parse(await request.json())
  if (!await prisma.user.findFirst({ where: { id: input.identityId, isActive: true, ...(user.branchId ? { branchId: user.branchId } : {}) } })) throw new NotificationError(404, 'Yetkili kapsamda aktif personel bulunamadı.')
  const recipient = await prisma.notificationRecipient.upsert({ where: { userId: input.identityId }, create: { kind: 'STAFF', userId: input.identityId, staffPushEnabled: true }, update: { isActive: true, staffPushEnabled: true } })
  return notificationResponse({ recipientId: recipient.id, staffUrl: '/recipient' }, 201)
 } catch (error) { return notificationFailure(error) }
}
export async function DELETE(request: NextRequest) {
 try {
  requireSameOrigin(request)
  const user = await requireManager(request, true)
  const { id } = z.object({ id: z.string().min(1).max(100) }).parse(await request.json())
  if (!await prisma.notificationRecipient.findFirst({ where: { id, kind: 'STAFF', ...recipientScope(user) } })) throw new NotificationError(404, 'Alıcı bulunamadı.')
  await prisma.$transaction([
   prisma.notificationRecipient.update({ where: { id }, data: { isActive: false, staffPushEnabled: false, primaryDeviceId: null } }),
   prisma.pushDevice.updateMany({ where: { recipientId: id }, data: { isActive: false } }),
  ])
  return notificationResponse({ success: true })
 } catch (error) { return notificationFailure(error) }
}
