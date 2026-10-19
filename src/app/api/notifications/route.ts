import { NextRequest } from 'next/server'
import { Prisma, NotificationMethod, NotificationStatus, NotificationType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, notificationScope, recipientScope, requireManager, requireSameOrigin, staffUser, studentScope } from '@/lib/notification-access'
import { messageSchema, NotificationError, parseSchedule } from '@/lib/notification-policy'

export async function GET(request: NextRequest) {
  try {
    const user = await staffUser(request)
    if (!user) throw new NotificationError(401, 'Giriş yapmalısınız.')
    const params = request.nextUrl.searchParams
    const number = (key: string, fallback: number, max: number) => {
      const raw = params.get(key), value = raw ? Number(raw) : fallback
      if (!Number.isInteger(value) || value < 1 || value > max) throw new NotificationError(400, 'Geçersiz sayfalama.')
      return value
    }
    const page = number('page', 1, 100000), limit = number('limit', 10, 50)
    const where: Prisma.NotificationWhereInput = notificationScope(user)
    if (!['ADMIN', 'ACCOUNTING'].includes(user.role)) { where.recipient = { userId: user.id }; where.isFeeSummary = false; where.type = 'GENERAL_ANNOUNCEMENT' }
    for (const key of ['type', 'status', 'method', 'studentId'] as const) {
      const value = params.get(key)
      const choices = key === 'method' ? Object.values(NotificationMethod) : key === 'status' ? Object.values(NotificationStatus) : key === 'type' ? Object.values(NotificationType) : null
      if (value && value !== 'all' && choices && !(choices as string[]).includes(value)) throw new NotificationError(400, 'Geçersiz bildirim filtresi.')
      if (value && value !== 'all') {
        if (key === 'type' && !['ADMIN', 'ACCOUNTING'].includes(user.role) && value !== 'GENERAL_ANNOUNCEMENT') throw new NotificationError(403, 'Yalnız genel duyurulara erişebilirsiniz.')
        Object.assign(where, { [key]: value })
      }
    }
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where, include: { student: { select: { id: true, firstName: true, lastName: true } }, createdBy: { select: { id: true, name: true } }, recipient: { select: { kind: true } }, deliveries: { select: { status: true, statusCode: true, finishedAt: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * limit, take: limit }),
      prisma.notification.count({ where }),
    ])
    return notificationResponse({ notifications, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) { return notificationFailure(error) }
}
export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const user = await requireManager(request)
    const input = messageSchema.parse(await request.json())
    const scheduledAt = parseSchedule(input.scheduledAt)
    const base = { title: input.title, message: input.message, type: input.type, method: input.method, scheduledAt, recipientEmail: input.recipientEmail || null, recipientPhone: input.recipientPhone || null, createdById: user.id }
    if (input.recipientType === 'recipient') {
      const recipient = await prisma.notificationRecipient.findFirst({ where: { id: input.recipientId || '', isActive: true, ...recipientScope(user) } })
      if (!recipient) throw new NotificationError(404, 'Kayıtlı alıcı bulunamadı.')
      if (input.method === 'PUSH') {
        if (recipient.kind !== 'STAFF' || !recipient.staffPushEnabled) throw new NotificationError(400, 'Push yalnız seçili personele gönderilebilir.')
        const target = recipient.userId ? await prisma.user.findUnique({ where: { id: recipient.userId } }) : null
        if (!target?.isActive || (!['ADMIN', 'ACCOUNTING'].includes(target.role) && input.type !== 'GENERAL_ANNOUNCEMENT')) throw new NotificationError(403, 'Bu personel yalnız genel duyuru alabilir.')
        const device = await prisma.pushDevice.findFirst({ where: { id: input.targetDeviceId || '', recipientId: recipient.id, isActive: true, expiresAt: { gt: new Date() } } })
        if (!device) throw new NotificationError(400, 'Bu alıcıya ait tek bir aktif cihaz seçin.')
      }
      return notificationResponse(await prisma.notification.create({ data: { ...base, recipientId: recipient.id, targetDeviceId: input.method === 'PUSH' ? input.targetDeviceId : null } }), 201)
    }
    if (input.method === 'PUSH') throw new NotificationError(400, 'Push için kayıtlı alıcı ve cihaz seçin.')
    if (input.recipientType === 'trainers') {
      const staff = await prisma.user.findMany({ where: { role: 'TRAINER', isActive: true, trainerId: input.trainerId && input.trainerId !== 'all' ? input.trainerId : { not: null }, ...(user.branchId ? { branchId: user.branchId } : {}) }, take: 501 })
      if (!staff.length) throw new NotificationError(404, 'Seçilen kapsamda aktif antrenör hesabı bulunamadı.')
      if (staff.length > 500) throw new NotificationError(400, 'Daha dar bir alıcı kapsamı seçin.')
      const notifications = await prisma.$transaction(async tx => {
        const records = []
        for (const person of staff) {
          const recipient = await tx.notificationRecipient.upsert({ where: { userId: person.id }, create: { kind: 'STAFF', userId: person.id }, update: {} })
          if (!recipient.isActive) continue
          records.push(await tx.notification.create({ data: { ...base, recipientId: recipient.id, recipientEmail: input.recipientEmail || person.email, recipientPhone: input.recipientPhone || person.phone } }))
        }
        return records
      })
      return notificationResponse({ count: notifications.length, ids: notifications.map(n => n.id) }, 201)
    }
    const where: Prisma.StudentWhereInput = { ...studentScope(user), isActive: true }
    if (input.recipientType === 'students' && input.studentId && input.studentId !== 'all') where.id = input.studentId
    if (input.recipientType === 'groups' && input.groupId && input.groupId !== 'all') where.groupId = input.groupId
    const students = await prisma.student.findMany({ where, select: { id: true, parents: { where: { isPrimary: true }, select: { email: true, phone: true }, take: 1 } }, take: 501 })
    if (!students.length) throw new NotificationError(404, 'Seçilen kapsamda aktif sporcu bulunamadı.')
    if (students.length > 500) throw new NotificationError(400, 'En fazla 500 sporcu seçebilirsiniz; grup filtresi kullanın.')
    const notifications = await prisma.$transaction(students.map(s => prisma.notification.create({ data: { ...base, studentId: s.id, recipientEmail: input.recipientEmail || s.parents[0]?.email || null, recipientPhone: input.recipientPhone || s.parents[0]?.phone || null } })))
    return notificationResponse({ count: notifications.length, ids: notifications.map(n => n.id) }, 201)
  } catch (error) { return notificationFailure(error) }
}
