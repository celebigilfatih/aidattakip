import { z } from 'zod'
import type { User } from '@prisma/client'
import { prisma } from './prisma'
import { branchScope, checkBranch, finance, liveActor, type ClubDB } from './club-access'
import { NotificationError } from './notification-policy'
import { paymentBalance } from './payment-balance'

export const familySchema = z.object({ id: z.string().optional(), name: z.string().trim().min(1).max(100), branchId: z.string().min(1), studentIds: z.array(z.string().min(1)).max(500).transform(ids => Array.from(new Set(ids))), expected: z.string().optional() }).strict()
export function familyTotals(payments: { status: string; amount: number; paidAmount: number | null; dueDate: Date }[], now = new Date()) {
  return payments.filter(p => p.status !== 'CANCELLED').reduce((sum, p) => {
    const paid = p.paidAmount ?? 0, { remaining, overdue } = paymentBalance(p, now)
    return { charged: sum.charged + p.amount, paid: sum.paid + paid, remaining: sum.remaining + remaining, overdue: sum.overdue + (overdue ? remaining : 0) }
  }, { charged: 0, paid: 0, remaining: 0, overdue: 0 })
}
export async function listFamilies(user: User, archived = false) {
  const families = await prisma.family.findMany({ where: { ...branchScope(user), archivedAt: archived ? { not: null } : null }, include: { students: { where: branchScope(user), select: { id: true, firstName: true, lastName: true, isActive: true, group: { select: { name: true } }, parents: true,
    ...(finance(user) ? { payments: { select: { amount: true, paidAmount: true, dueDate: true, status: true } } } : {}) } } }, orderBy: [{ name: 'asc' }, { id: 'asc' }] })
  return families.map(({ students, ...family }) => ({ ...family, students: students.map(s => { const { payments, ...safe } = s as typeof s & { payments?: Parameters<typeof familyTotals>[0] }; return { ...safe, ...(finance(user) ? { totals: familyTotals(payments ?? []) } : {}) } }), ...(finance(user) ? { totals: familyTotals(students.flatMap(s => (s as typeof s & { payments?: Parameters<typeof familyTotals>[0] }).payments ?? [])) } : {}) }))
}
export async function saveFamily(user: User, input: z.infer<typeof familySchema>, db?: ClubDB) {
  const work = async (tx: ClubDB) => {
    await liveActor(tx, user)
    await checkBranch(tx, user, input.branchId)
    let existing = null
    if (input.id) {
      await tx.$queryRaw`SELECT id FROM families WHERE id = ${input.id} FOR UPDATE`
      existing = await tx.family.findFirst({ where: { id: input.id, ...branchScope(user) } })
      if (!existing || existing.archivedAt) throw new NotificationError(404, 'Kullanılabilir aile bulunamadı.')
      if (existing.branchId !== input.branchId) throw new NotificationError(400, 'Ailenin şubesi değiştirilemez.')
      if (existing.updatedAt.toISOString() !== input.expected) throw new NotificationError(409, 'Aile değişti. Yeniden açın.')
    }
    // Deterministic student locks prevent two families claiming the same child concurrently.
    for (const id of [...input.studentIds].sort()) await tx.$queryRaw`SELECT id FROM students WHERE id = ${id} FOR UPDATE`
    const students = await tx.student.findMany({ where: { id: { in: input.studentIds }, branchId: input.branchId } })
    if (students.length !== input.studentIds.length || students.some(s => s.familyId && s.familyId !== input.id)) throw new NotificationError(409, 'Sporcu farklı şubede veya başka bir aileye bağlı. Listeyi yenileyin.')
    const family = input.id ? await tx.family.update({ where: { id: input.id }, data: { name: input.name } }) : await tx.family.create({ data: { name: input.name, branchId: input.branchId } })
    await tx.student.updateMany({ where: { familyId: family.id, id: { notIn: input.studentIds } }, data: { familyId: null } })
    await tx.student.updateMany({ where: { id: { in: input.studentIds } }, data: { familyId: family.id } })
    return family
  }
  return db ? work(db) : prisma.$transaction(work)
}
