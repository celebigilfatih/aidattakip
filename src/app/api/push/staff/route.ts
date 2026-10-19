import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, requireManager, requireSameOrigin } from '@/lib/notification-access'
import { NotificationError } from '@/lib/notification-policy'
import { financialRole } from '@/lib/staff-summary-policy'
import { summaryRuleScope } from '@/lib/staff-summary-service'

const inputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(6).max(72),
  phone: z.string().trim().max(30).optional(),
  role: z.enum(['ADMIN', 'ACCOUNTING', 'SECRETARY', 'TRAINER']),
  branchId: z.string().min(1).max(100).nullable(),
  groupIds: z.array(z.string().min(1).max(100)).max(200).default([]),
  selectForNotifications: z.boolean(),
  summaryRuleId: z.string().min(1).max(100).nullable().default(null),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireManager(request, true)
    const branches = await prisma.branch.findMany({
      where: { isActive: true, ...(user.branchId ? { id: user.branchId } : {}) },
      select: { id: true, name: true, groups: { where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    })
    const summaryRules = await prisma.staffSummaryRule.findMany({
      where: summaryRuleScope(user),
      select: { id: true, name: true, enabled: true, branchId: true, weekdays: true, time: true },
      orderBy: { createdAt: 'asc' },
    })
    return notificationResponse({ branches, fixedBranchId: user.branchId, summaryRules })
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
    if (input.summaryRuleId && (!input.selectForNotifications || !financialRole(input.role))) throw new NotificationError(400, 'Aidat özeti için bildirim alıcısı seçilmeli ve rol yönetici veya muhasebe olmalıdır.')
    const password = await bcrypt.hash(input.password, 10)
    const staff = await prisma.$transaction(async tx => {
      if (input.branchId && !await tx.branch.findFirst({ where: { id: input.branchId, isActive: true } })) throw new NotificationError(400, 'Aktif bir şube seçin.')
      const groupIds = Array.from(new Set(input.groupIds))
      if (groupIds.length && await tx.group.count({ where: { id: { in: groupIds }, branchId: input.branchId!, isActive: true } }) !== groupIds.length) throw new NotificationError(400, 'Gruplar seçilen aktif şubeye ait olmalıdır.')
      if (await tx.user.findFirst({ where: { email: { equals: input.email, mode: 'insensitive' } } })) throw new NotificationError(409, 'Bu e-posta ile bir kullanıcı var. Listeden mevcut personeli alıcı olarak seçin.')
      let summaryRule = null
      if (input.summaryRuleId) {
        await tx.$queryRaw`SELECT id FROM staff_summary_rules WHERE id = ${input.summaryRuleId} FOR UPDATE`
        summaryRule = await tx.staffSummaryRule.findFirst({
          where: { id: input.summaryRuleId, ...summaryRuleScope(manager) },
          include: { createdBy: { select: { isActive: true, role: true, branchId: true } } },
        })
        if (!summaryRule) throw new NotificationError(409, 'Seçilen aidat özeti kuralı artık kullanılamıyor. Formu kapatıp yeniden açın.')
        if (summaryRule.branchId && summaryRule.branchId !== input.branchId) throw new NotificationError(400, 'Aidat özeti kuralı personelin şubesiyle eşleşmelidir.')
        const owner = summaryRule.createdBy
        if (!owner.isActive || !financialRole(owner.role) || (owner.branchId && owner.branchId !== summaryRule.branchId)) throw new NotificationError(409, 'Kural sahibinin yetkisi değişmiş. Başka bir kural seçin.')
      }
      const created = await tx.user.create({
        data: {
          name: input.name, email: input.email, password, phone: input.phone || null,
          role: input.role, branchId: input.branchId,
          ...(groupIds.length ? { groupPermissions: { create: groupIds.map(groupId => ({ groupId })) } } : {}),
          ...(input.selectForNotifications ? { notificationRecipient: { create: { kind: 'STAFF', staffPushEnabled: true } } } : {}),
        },
        select: { id: true, name: true, notificationRecipient: { select: { id: true } } },
      })
      if (summaryRule && created.notificationRecipient) await tx.staffSummaryRecipient.create({ data: { ruleId: summaryRule.id, recipientId: created.notificationRecipient.id } })
      return { ...created, summaryRule: summaryRule ? { id: summaryRule.id, name: summaryRule.name, enabled: summaryRule.enabled } : null }
    })
    return notificationResponse({ staff, staffUrl: '/recipient' }, 201)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return notificationResponse({ error: 'Bu e-posta ile bir kullanıcı zaten var. Mevcut personeli seçin.' }, 409)
    return notificationFailure(error)
  }
}
