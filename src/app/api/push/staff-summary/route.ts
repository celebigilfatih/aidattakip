import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, requireManager, requireSameOrigin } from '@/lib/notification-access'
import { NotificationError } from '@/lib/notification-policy'
import { financialRole, summaryRuleSchema } from '@/lib/staff-summary-policy'
import { summaryRuleScope, validateSummaryRecipients } from '@/lib/staff-summary-service'

export async function GET(request: NextRequest) {
  try {
    const manager = await requireManager(request)
    const rules = await prisma.staffSummaryRule.findMany({
      where: summaryRuleScope(manager),
      select: { id: true, name: true, enabled: true, branchId: true, weekdays: true, time: true, recipients: { select: { recipientId: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return notificationResponse({ rules: rules.map(({ recipients, ...rule }) => ({ ...rule, recipientIds: recipients.map(r => r.recipientId) })) })
  } catch (error) { return notificationFailure(error) }
}

export async function PATCH(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const manager = await requireManager(request)
    const input = z.union([
      z.object({ ruleId: z.string().min(1).max(100), enabled: z.boolean() }).strict(),
      z.object({ userId: z.string().min(1).max(100), ruleId: z.string().min(1).max(100), receive: z.boolean() }).strict(),
    ]).parse(await request.json())
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM staff_summary_rules WHERE id = ${input.ruleId} FOR UPDATE`
      const rule = await tx.staffSummaryRule.findFirst({
        where: { id: input.ruleId, ...summaryRuleScope(manager) },
        include: { createdBy: { select: { isActive: true, role: true, branchId: true } }, recipients: { select: { recipientId: true } } },
      })
      if (!rule) throw new NotificationError(409, 'Aidat özeti kuralı artık kullanılamıyor. Listeyi yenileyin.')
      if ('enabled' in input) {
        if (input.enabled) {
          const owner = rule.createdBy
          if (!owner.isActive || !financialRole(owner.role) || (owner.branchId && owner.branchId !== rule.branchId)) throw new NotificationError(409, 'Kural sahibinin yetkisi değişmiş. Kuralı kontrol edin.')
          await validateSummaryRecipients(rule.recipients.map(r => r.recipientId), rule.branchId, tx)
        }
        const changed = rule.enabled !== input.enabled
        const saved = await tx.staffSummaryRule.update({ where: { id: rule.id },
          data: changed ? { enabled: input.enabled, ...(input.enabled ? { lastEvaluatedAt: new Date(Date.now() - 1) } : {}) } : {},
          select: { id: true, name: true, enabled: true },
        })
        return { rule: saved }
      }
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

const scheduleSchema = summaryRuleSchema.pick({ weekdays: true, time: true }).extend({ ruleId: z.string().min(1).max(100) }).strict()
const ruleFields = summaryRuleSchema.omit({ enabled: true })
const editSchema = ruleFields.extend({ ruleId: z.string().min(1).max(100), expected: ruleFields.extend({ recipientIds: z.array(z.string().min(1).max(100)).max(500) }).strict() }).strict()

export async function PUT(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const manager = await requireManager(request)
    const input = z.union([scheduleSchema, editSchema]).parse(await request.json())
    const rule = await prisma.$transaction(async tx => {
      // Membership edits and worker evaluation use the same lock; preserve dispatch state.
      await tx.$queryRaw`SELECT id FROM staff_summary_rules WHERE id = ${input.ruleId} FOR UPDATE`
      const current = await tx.staffSummaryRule.findFirst({ where: { id: input.ruleId, ...summaryRuleScope(manager) }, include: { recipients: { select: { recipientId: true } }, createdBy: { select: { isActive: true, role: true, branchId: true } } } })
      if (!current) throw new NotificationError(409, 'Aidat özeti kuralı artık kullanılamıyor. Listeyi yenileyin.')
      const changed = current.time !== input.time || JSON.stringify(current.weekdays) !== JSON.stringify(input.weekdays)
      if ('recipientIds' in input) {
        const expected = input.expected
        const ids = (values: string[]) => JSON.stringify([...values].sort())
        if (current.name !== expected.name || current.time !== expected.time || JSON.stringify(current.weekdays) !== JSON.stringify(expected.weekdays)
          || ids(current.recipients.map(r => r.recipientId)) !== ids(expected.recipientIds)) throw new NotificationError(409, 'Kural bu form açıkken değişti. Formu kapatıp güncel değerlerle yeniden açın.')
        const owner = current.createdBy
        if (!owner.isActive || !financialRole(owner.role) || (owner.branchId && owner.branchId !== current.branchId)) throw new NotificationError(409, 'Kural sahibinin yetkisi değişmiş. Kuralı kontrol edin.')
        await validateSummaryRecipients(input.recipientIds, current.branchId, tx)
        await tx.staffSummaryRecipient.deleteMany({ where: { ruleId: current.id, recipientId: { notIn: input.recipientIds } } })
        const added = input.recipientIds.filter(id => !current.recipients.some(r => r.recipientId === id))
        if (added.length) await tx.staffSummaryRecipient.createMany({ data: added.map(recipientId => ({ ruleId: current.id, recipientId })) })
      }
      return tx.staffSummaryRule.update({
        where: { id: current.id },
        data: { ...('name' in input && current.name !== input.name ? { name: input.name } : {}), ...(changed ? { weekdays: input.weekdays, time: input.time, lastEvaluatedAt: new Date(Date.now() - 1) } : {}) },
        select: { id: true, name: true, weekdays: true, time: true, enabled: true },
      })
    })
    return notificationResponse({ rule })
  } catch (error) { return notificationFailure(error) }
}
