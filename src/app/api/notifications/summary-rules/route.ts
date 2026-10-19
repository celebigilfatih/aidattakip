import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { notificationFailure, notificationResponse, requireManager, requireSameOrigin } from '@/lib/notification-access'
import { summaryRuleSchema } from '@/lib/staff-summary-policy'
import { manualSummaryRun, summaryRuleScope, validateSummaryRecipients } from '@/lib/staff-summary-service'
import { NotificationError } from '@/lib/notification-policy'

export async function GET(request: NextRequest) {
  try {
    const user = await requireManager(request)
    const rules = await prisma.staffSummaryRule.findMany({ where: summaryRuleScope(user), include: { recipients: { select: { recipientId: true } }, runs: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, scheduledAt: true, kind: true, status: true, accepted: true, failed: true, skipped: true, finishedAt: true } } }, orderBy: { createdAt: 'desc' } })
    return notificationResponse({ rules })
  } catch (error) { return notificationFailure(error) }
}
export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const user = await requireManager(request), input = summaryRuleSchema.parse(await request.json())
    await validateSummaryRecipients(input.recipientIds, user.branchId)
    const { recipientIds, ...data } = input
    return notificationResponse(await prisma.staffSummaryRule.create({ data: { ...data, enabled: false, branchId: user.branchId, createdById: user.id, recipients: { create: recipientIds.map(recipientId => ({ recipientId })) } } }), 201)
  } catch (error) { return notificationFailure(error) }
}
export async function PUT(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const user = await requireManager(request), input = summaryRuleSchema.extend({ id: z.string().min(1).max(100) }).parse(await request.json())
    const existing = await prisma.staffSummaryRule.findFirst({ where: { id: input.id, ...summaryRuleScope(user) } })
    if (!existing) throw new NotificationError(404, 'Kural bulunamadı.')
    await validateSummaryRecipients(input.recipientIds, existing.branchId)
    const { id, recipientIds, ...data } = input
    return notificationResponse(await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM staff_summary_rules WHERE id = ${id} FOR UPDATE`
      await tx.staffSummaryRecipient.deleteMany({ where: { ruleId: id } })
      return tx.staffSummaryRule.update({ where: { id }, data: { ...data, branchId: existing.branchId, createdById: user.id, lastEvaluatedAt: new Date(Date.now() - 1), recipients: { create: recipientIds.map(recipientId => ({ recipientId })) } } })
    }))
  } catch (error) { return notificationFailure(error) }
}
export async function PATCH(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const user = await requireManager(request)
    const input = z.object({ id: z.string().min(1).max(100), action: z.enum(['disable', 'send']) }).parse(await request.json())
    if (input.action === 'send') return notificationResponse(await manualSummaryRun(input.id, user))
    await prisma.staffSummaryRule.updateMany({ where: { id: input.id, ...summaryRuleScope(user) }, data: { enabled: false } })
    return notificationResponse({ success: true })
  } catch (error) { return notificationFailure(error) }
}
