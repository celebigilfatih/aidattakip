import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, notificationScope, requireManager, requireSameOrigin } from '@/lib/notification-access'
import { dispatchNotification } from '@/lib/notification-dispatch'
import { NotificationError } from '@/lib/notification-policy'
export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const user = await requireManager(request)
    const { notificationIds, action } = z.object({ notificationIds: z.array(z.string().min(1).max(100)).min(1).max(50), action: z.enum(['send', 'cancel', 'delete']) }).parse(await request.json())
    const ids = Array.from(new Set(notificationIds))
    const records = await prisma.notification.findMany({ where: { id: { in: ids }, ...notificationScope(user) }, select: { id: true } })
    if (records.length !== ids.length) throw new NotificationError(404, 'Seçili bildirimlerden biri yetkili kapsamda bulunamadı.')
    if (action === 'send') {
      const results = []
      for (const id of ids) {
        try { results.push({ id, success: true, result: await dispatchNotification(id) }) }
        catch (error) { results.push({ id, success: false, error: error instanceof NotificationError ? error.message : 'Gönderim tamamlanamadı.' }) }
      }
      return notificationResponse({ results, affectedRows: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length })
    }
    const where = { id: { in: ids }, ...notificationScope(user) }
    const result = action === 'cancel' ? await prisma.notification.updateMany({ where: { ...where, status: 'PENDING' }, data: { status: 'CANCELLED' } })
      : await prisma.notification.deleteMany({ where: { ...where, status: { in: ['CANCELLED', 'FAILED'] } } })
    return notificationResponse({ success: true, affectedRows: result.count })
  } catch (error) { return notificationFailure(error) }
}
