import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, notificationScope, requireManager, requireSameOrigin } from '@/lib/notification-access'
import { NotificationError } from '@/lib/notification-policy'
import { dispatchNotification } from '@/lib/notification-dispatch'
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request)
    const user = await requireManager(request), { id } = await params
    if (!await prisma.notification.findFirst({ where: { id, ...notificationScope(user) } })) throw new NotificationError(404, 'Bildirim bulunamadı.')
    return notificationResponse(await dispatchNotification(id))
  } catch (error) { return notificationFailure(error) }
}
