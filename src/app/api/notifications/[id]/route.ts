import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, notificationScope, requireManager, requireSameOrigin } from '@/lib/notification-access'
import { messageSchema, NotificationError, parseSchedule } from '@/lib/notification-policy'
type Context = { params: Promise<{ id: string }> }
async function find(request: NextRequest, context: Context) {
  const user = await requireManager(request), { id } = await context.params
  const record = await prisma.notification.findFirst({ where: { id, ...notificationScope(user) } })
  if (!record) throw new NotificationError(404, 'Bildirim bulunamadı.')
  return record
}
export async function GET(request: NextRequest, context: Context) {
  try { return notificationResponse(await find(request, context)) } catch (error) { return notificationFailure(error) }
}
export async function PUT(request: NextRequest, context: Context) {
  try {
    requireSameOrigin(request)
    const record = await find(request, context)
    if (!['PENDING', 'FAILED'].includes(record.status)) throw new NotificationError(409, 'İşlenmiş bildirim düzenlenemez.')
    const input = messageSchema.parse(await request.json())
    if (input.method !== record.method) throw new NotificationError(400, 'Kanalı değiştirmek için yeni bildirim oluşturun.')
    const result = await prisma.notification.updateMany({ where: { id: record.id, status: { in: ['PENDING', 'FAILED'] } }, data: {
      title: input.title, message: input.message, type: input.type, scheduledAt: parseSchedule(input.scheduledAt), recipientEmail: input.recipientEmail || null, recipientPhone: input.recipientPhone || null,
    } })
    if (!result.count) throw new NotificationError(409, 'Bildirim başka bir işlemde değişti.')
    return notificationResponse({ success: true })
  } catch (error) { return notificationFailure(error) }
}
export async function DELETE(request: NextRequest, context: Context) {
  try {
    requireSameOrigin(request)
    const record = await find(request, context)
    const result = await prisma.notification.deleteMany({ where: { id: record.id, status: { in: ['PENDING', 'FAILED', 'CANCELLED'] } } })
    if (!result.count) throw new NotificationError(409, 'İşlenmiş bildirim silinemez.')
    return notificationResponse({ success: true })
  } catch (error) { return notificationFailure(error) }
}
