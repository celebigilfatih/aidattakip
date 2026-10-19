import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, requireManager, requireSameOrigin } from '@/lib/notification-access'
import { NotificationError } from '@/lib/notification-policy'

const inputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(6).max(72),
  phone: z.string().trim().max(30).optional(),
  role: z.enum(['ADMIN', 'ACCOUNTING', 'SECRETARY', 'TRAINER']),
  branchId: z.string().min(1).max(100).nullable(),
  groupIds: z.array(z.string().min(1).max(100)).max(200).default([]),
  selectForNotifications: z.boolean(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireManager(request, true)
    const branches = await prisma.branch.findMany({
      where: { isActive: true, ...(user.branchId ? { id: user.branchId } : {}) },
      select: { id: true, name: true, groups: { where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    })
    return notificationResponse({ branches, fixedBranchId: user.branchId })
  } catch (error) { return notificationFailure(error) }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const manager = await requireManager(request, true)
    const input = inputSchema.parse(await request.json())
    if (manager.branchId && input.branchId !== manager.branchId) throw new NotificationError(403, 'Yalnız kendi şubenize personel ekleyebilirsiniz.')
    if (input.role === 'TRAINER' && !input.branchId) throw new NotificationError(400, 'Antrenör için şube seçin.')
    if (input.role !== 'TRAINER' && input.groupIds.length) throw new NotificationError(400, 'Grup seçimi yalnız antrenör içindir.')
    const password = await bcrypt.hash(input.password, 10)
    const staff = await prisma.$transaction(async tx => {
      if (input.branchId && !await tx.branch.findFirst({ where: { id: input.branchId, isActive: true } })) throw new NotificationError(400, 'Aktif bir şube seçin.')
      const groupIds = Array.from(new Set(input.groupIds))
      if (groupIds.length && await tx.group.count({ where: { id: { in: groupIds }, branchId: input.branchId!, isActive: true } }) !== groupIds.length) throw new NotificationError(400, 'Gruplar seçilen aktif şubeye ait olmalıdır.')
      if (await tx.user.findFirst({ where: { email: { equals: input.email, mode: 'insensitive' } } })) throw new NotificationError(409, 'Bu e-posta ile bir kullanıcı var. Listeden mevcut personeli alıcı olarak seçin.')
      return tx.user.create({
        data: {
          name: input.name, email: input.email, password, phone: input.phone || null,
          role: input.role, branchId: input.branchId,
          ...(groupIds.length ? { groupPermissions: { create: groupIds.map(groupId => ({ groupId })) } } : {}),
          ...(input.selectForNotifications ? { notificationRecipient: { create: { kind: 'STAFF', staffPushEnabled: true } } } : {}),
        },
        select: { id: true, name: true, notificationRecipient: { select: { id: true } } },
      })
    })
    return notificationResponse({ staff, staffUrl: '/recipient' }, 201)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return notificationResponse({ error: 'Bu e-posta ile bir kullanıcı zaten var. Mevcut personeli seçin.' }, 409)
    return notificationFailure(error)
  }
}
