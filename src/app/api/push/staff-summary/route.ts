import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, requireManager, requireSameOrigin } from '@/lib/notification-access'
import { NotificationError } from '@/lib/notification-policy'
import { financialRole } from '@/lib/staff-summary-policy'
import { summaryRuleScope } from '@/lib/staff-summary-service'

export async function GET(request: NextRequest) {
  try {
    const manager = await requireManager(request)
    const rules = await prisma.staffSummaryRule.findMany({
      where: { ...summaryRuleScope(manager), weekdays: { equals: [1] }, time: '09:00' },
      select: { id: true, name: true, enabled: true, branchId: true, recipients: { select: { recipientId: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return notificationResponse({ rules: rules.map(({ recipients, ...rule }) => ({ ...rule, recipientIds: recipients.map(r => r.recipientId) })) })
  } catch (error) { return notificationFailure(error) }
}

export async function PATCH(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const manager = await requireManager(request)
    const input = z.object({ userId: z.string().min(1).max(100), ruleId: z.string().min(1).max(100), receive: z.boolean() }).parse(await request.json())
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM staff_summary_rules WHERE id = ${input.ruleId} FOR UPDATE`
      const rule = await tx.staffSummaryRule.findFirst({
        where: { id: input.ruleId, ...summaryRuleScope(manager), weekdays: { equals: [1] }, time: '09:00' },
        include: { createdBy: { select: { isActive: true, role: true, branchId: true } } },
      })
      if (!rule) throw new NotificationError(409, 'Pazartesi 09.00 kuralı artık kullanılamıyor. Listeyi yenileyin.')
      const person = await tx.user.findFirst({
        where: { id: input.userId, ...(manager.branchId ? { branchId: manager.branchId } : {}) },
        include: { notificationRecipient: { select: { id: true, kind: true, isActive: true, staffPushEnabled: true } } },
      })
      if (!person) throw new NotificationError(404, 'Yetkili kapsamda personel bulunamadı.')
      const recipient = person.notificationRecipient
      if (!recipient || recipient.kind !== 'STAFF') throw new NotificationError(400, 'Personel önce bildirim alıcısı olarak seçilmelidir.')
      if (input.receive) {
        if (!person.isActive || !financialRole(person.role) || !recipient.isActive || !recipient.staffPushEnabled) throw new NotificationError(400, 'Özet için aktif yönetici/muhasebe ve açık bildirim alıcısı seçimi gerekir.')
        if (rule.branchId && person.branchId !== rule.branchId) throw new NotificationError(400, 'Personel ve aidat özeti kuralının şubesi eşleşmelidir.')
        const owner = rule.createdBy
        if (!owner.isActive || !financialRole(owner.role) || (owner.branchId && owner.branchId !== rule.branchId)) throw new NotificationError(409, 'Kural sahibinin yetkisi değişmiş. Listeyi yenileyin.')
        await tx.staffSummaryRecipient.upsert({ where: { ruleId_recipientId: { ruleId: rule.id, recipientId: recipient.id } }, create: { ruleId: rule.id, recipientId: recipient.id }, update: {} })
      } else {
        // Invalidated memberships may still be removed after a role, branch or recipient change.
        await tx.staffSummaryRecipient.deleteMany({ where: { ruleId: rule.id, recipientId: recipient.id } })
      }
      return { userId: person.id, ruleId: rule.id, receive: input.receive, ruleEnabled: rule.enabled }
    })
    return notificationResponse(result)
  } catch (error) { return notificationFailure(error) }
}
