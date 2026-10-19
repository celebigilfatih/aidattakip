import { NextRequest } from 'next/server'
import { requireManager, notificationFailure, notificationResponse } from '@/lib/notification-access'
import { prisma } from '@/lib/prisma'
import { getStaffOverdue } from '@/lib/staff-overdue'
import { NotificationError } from '@/lib/notification-policy'

export async function GET(request: NextRequest) {
  try {
    const user = await requireManager(request)
    const requested = request.nextUrl.searchParams.get('branchId')
    if (user.branchId && requested && requested !== user.branchId) throw new NotificationError(403, 'Şube erişimi yok.')
    return notificationResponse(await getStaffOverdue(prisma, user.branchId ?? requested))
  } catch (error) { return notificationFailure(error) }
}
