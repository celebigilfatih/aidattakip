import { Prisma, type User } from '@prisma/client'
import { prisma } from './prisma'
import { dispatchNotification } from './notification-dispatch'
import { financialRole, summaryGraceMs, summarySlots } from './staff-summary-policy'
import { getStaffOverdue } from './staff-overdue'
import { NotificationError } from './notification-policy'

export function summaryRuleScope(user: User) { return user.branchId ? { branchId: user.branchId } : {} }
export async function validateSummaryRecipients(ids: string[], branchId: string | null) {
  const count = await prisma.notificationRecipient.count({ where: { id: { in: ids }, kind: 'STAFF', staffPushEnabled: true, isActive: true,
    user: { isActive: true, role: { in: ['ADMIN', 'ACCOUNTING'] }, ...(branchId ? { branchId } : {}) } } })
  if (count !== ids.length) throw new NotificationError(400, 'Özet alıcıları seçili, aktif ve aynı yetkili kapsamda yönetici/muhasebe olmalıdır.')
}

export async function executeSummaryRun(runId: string) {
  const run = await prisma.staffSummaryRun.findUniqueOrThrow({ where: { id: runId }, include: { rule: { include: { createdBy: true, recipients: { include: { recipient: { include: { user: true, primaryDevice: true } } } } } } } })
  let accepted = 0, failed = 0, skipped = 0
  const source = run.rule.createdBy
  if (!source.isActive || !financialRole(source.role) || (source.branchId && source.branchId !== run.rule.branchId)) {
    await prisma.staffSummaryRun.update({ where: { id: runId }, data: { status: 'SKIPPED', skipped: run.rule.recipients.length, finishedAt: new Date() } })
    return
  }
  for (const { recipient } of run.rule.recipients) {
    const device = recipient.primaryDevice, user = recipient.user
    if (!recipient.isActive || !recipient.staffPushEnabled || recipient.kind !== 'STAFF' || !user?.isActive || !financialRole(user.role)
      || (run.rule.branchId && user.branchId !== run.rule.branchId) || !device?.isActive || device.recipientId !== recipient.id || device.expiresAt <= new Date()) { skipped++; continue }
    const branchId = run.rule.branchId ?? user.branchId
    if (!(await getStaffOverdue(prisma, branchId)).paymentCount) { skipped++; continue }
    try {
      const notification = await prisma.notification.create({ data: { title: 'Geciken aidat özeti hazır', message: 'Güncel geciken aidat listesini görüntüleyin.',
        type: 'PAYMENT_OVERDUE', method: 'PUSH', recipientId: recipient.id, targetDeviceId: device.id, createdById: source.id,
        isFeeSummary: true, summaryBranchId: branchId, summaryRunId: run.id } })
      const result = await dispatchNotification(notification.id)
      if (result.status === 'ACCEPTED') accepted++; else skipped++
    } catch { failed++ }
  }
  await prisma.staffSummaryRun.update({ where: { id: runId }, data: { accepted, failed, skipped, status: failed ? (accepted ? 'PARTIAL' : 'FAILED') : accepted ? 'ACCEPTED' : 'SKIPPED', finishedAt: new Date() } })
}

export async function runStaffSummaryWorker(now = new Date(), onlyRuleIds?: string[]) {
  const rules = await prisma.staffSummaryRule.findMany({ where: { enabled: true, ...(onlyRuleIds ? { id: { in: onlyRuleIds } } : {}) }, select: { id: true } })
  const ids: string[] = []
  for (const rule of rules) {
    const created = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM staff_summary_rules WHERE id = ${rule.id} FOR UPDATE`
      const current = await tx.staffSummaryRule.findUniqueOrThrow({ where: { id: rule.id } })
      if (!current.enabled || current.lastEvaluatedAt >= now) return []
      const slots = summarySlots(current.weekdays, current.time, current.lastEvaluatedAt, now), work: string[] = []
      for (const scheduledAt of slots) {
        const missed = now.getTime() - scheduledAt.getTime() > summaryGraceMs
        const run = await tx.staffSummaryRun.create({ data: { ruleId: rule.id, scheduledAt, status: missed ? 'MISSED' : 'PROCESSING', finishedAt: missed ? now : null } })
        if (!missed) work.push(run.id)
      }
      await tx.staffSummaryRule.update({ where: { id: rule.id }, data: { lastEvaluatedAt: now } })
      return work
    }, { timeout: 20000 })
    ids.push(...created)
  }
  // Only runs claimed by this invocation are executed. Ambiguous PROCESSING runs are never retried.
  for (const id of ids) await executeSummaryRun(id)
  return { evaluatedRules: rules.length, claimedRuns: ids.length }
}

export async function manualSummaryRun(ruleId: string, user: User) {
  const rule = await prisma.staffSummaryRule.findFirst({ where: { id: ruleId, ...summaryRuleScope(user) } })
  if (!rule) throw new NotificationError(404, 'Kural bulunamadı.')
  // A branch-bound manager may not execute a rule under somebody else's wider identity.
  const owner = await prisma.user.findUnique({ where: { id: rule.createdById } })
  if (!owner?.isActive || !financialRole(owner.role) || (owner.branchId && owner.branchId !== rule.branchId)) throw new NotificationError(409, 'Kural sahibinin yetkisi değişti.')
  const run = await prisma.staffSummaryRun.create({ data: { ruleId, scheduledAt: new Date(), kind: 'MANUAL' } })
  await executeSummaryRun(run.id)
  return prisma.staffSummaryRun.findUniqueOrThrow({ where: { id: run.id } })
}
