import { NextRequest } from 'next/server'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, recipientScope, requireManager, requireSameOrigin, studentScope } from '@/lib/notification-access'
import { hashToken, inviteLifetime, NotificationError } from '@/lib/notification-policy'

export async function GET(request: NextRequest) {
  try {
    const user = await requireManager(request)
    const scope = studentScope(user)
    const [recipients, students, parents, staff] = await Promise.all([
      prisma.notificationRecipient.findMany({ where: recipientScope(user), include: {
        user: { select: { name: true } }, parent: { select: { firstName: true, lastName: true } }, student: { select: { firstName: true, lastName: true } },
        devices: { where: { isActive: true, expiresAt: { gt: new Date() } }, select: { id: true, label: true } },
      }, orderBy: { createdAt: 'desc' }, take: 500 }),
      prisma.student.findMany({ where: { ...scope, isActive: true }, select: { id: true, firstName: true, lastName: true }, orderBy: { lastName: 'asc' }, take: 500 }),
      prisma.parent.findMany({ where: { students: { some: { ...scope, isActive: true } } }, select: { id: true, firstName: true, lastName: true }, orderBy: { lastName: 'asc' }, take: 500 }),
      prisma.user.findMany({ where: { isActive: true, ...(user.branchId ? { branchId: user.branchId } : {}) }, select: { id: true, name: true }, take: 500 }),
    ])
    return notificationResponse({ canInvite: user.role === 'ADMIN', recipients: recipients.map(r => ({ id: r.id, kind: r.kind, isActive: r.isActive,
      name: r.user?.name ?? (r.parent ? `${r.parent.firstName} ${r.parent.lastName}` : r.student ? `${r.student.firstName} ${r.student.lastName}` : 'Silinmiş alıcı'), devices: r.devices,
    })), students, parents, staff })
  } catch (error) { return notificationFailure(error) }
}
export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const user = await requireManager(request, true)
    const input = z.object({ kind: z.enum(['PARENT', 'STUDENT', 'STAFF']), identityId: z.string().min(1).max(100), verified: z.literal(true) }).parse(await request.json())
    const scope = studentScope(user)
    let recipient
    if (input.kind === 'PARENT') {
      if (!await prisma.parent.findFirst({ where: { id: input.identityId, students: { some: { ...scope, isActive: true } } } })) throw new NotificationError(404, 'Yetkili kapsamda veli bulunamadı.')
      recipient = await prisma.notificationRecipient.upsert({ where: { parentId: input.identityId }, create: { kind: 'PARENT', parentId: input.identityId }, update: { isActive: true } })
    } else if (input.kind === 'STUDENT') {
      if (!await prisma.student.findFirst({ where: { id: input.identityId, ...scope, isActive: true } })) throw new NotificationError(404, 'Yetkili kapsamda sporcu bulunamadı.')
      recipient = await prisma.notificationRecipient.upsert({ where: { studentId: input.identityId }, create: { kind: 'STUDENT', studentId: input.identityId }, update: { isActive: true } })
    } else {
      if (!await prisma.user.findFirst({ where: { id: input.identityId, isActive: true, ...(user.branchId ? { branchId: user.branchId } : {}) } })) throw new NotificationError(404, 'Yetkili kapsamda personel bulunamadı.')
      recipient = await prisma.notificationRecipient.upsert({ where: { userId: input.identityId }, create: { kind: 'STAFF', userId: input.identityId }, update: { isActive: true } })
      return notificationResponse({ recipientId: recipient.id, staffUrl: `${process.env.APP_ORIGIN || request.nextUrl.origin}/recipient` }, 201)
    }
    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + inviteLifetime)
    await prisma.$transaction([
      prisma.pushInvite.updateMany({ where: { recipientId: recipient.id, usedAt: null }, data: { usedAt: new Date() } }),
      prisma.pushInvite.create({ data: { tokenHash: hashToken(token), recipientId: recipient.id, createdById: user.id, expiresAt } }),
    ])
    return notificationResponse({ recipientId: recipient.id, inviteUrl: `${process.env.APP_ORIGIN || request.nextUrl.origin}/recipient#invite=${token}`, expiresAt }, 201)
  } catch (error) { return notificationFailure(error) }
}
export async function DELETE(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const user = await requireManager(request, true)
    const { id } = z.object({ id: z.string().min(1).max(100) }).parse(await request.json())
    const recipient = await prisma.notificationRecipient.findFirst({ where: { id, ...recipientScope(user) } })
    if (!recipient) throw new NotificationError(404, 'Alıcı bulunamadı.')
    await prisma.$transaction([
      prisma.notificationRecipient.update({ where: { id }, data: { isActive: false } }),
      prisma.recipientSession.deleteMany({ where: { recipientId: id } }),
      prisma.pushDevice.updateMany({ where: { recipientId: id }, data: { isActive: false } }),
      prisma.pushInvite.updateMany({ where: { recipientId: id, usedAt: null }, data: { usedAt: new Date() } }),
    ])
    return notificationResponse({ success: true })
  } catch (error) { return notificationFailure(error) }
}
