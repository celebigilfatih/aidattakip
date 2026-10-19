import type { PrismaClient, Prisma } from '@prisma/client'
import { istanbulDayStart } from './staff-summary-policy'

export async function getStaffOverdue(db: PrismaClient | Prisma.TransactionClient, branchId: string | null, now = new Date()) {
  const payments = await db.payment.findMany({ where: {
    status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] }, dueDate: { lt: istanbulDayStart(now) },
    ...(branchId ? { student: { branchId } } : {}),
  }, select: { id: true, amount: true, paidAmount: true, dueDate: true, studentId: true,
    student: { select: { firstName: true, lastName: true, isActive: true, branchId: true, group: { select: { name: true } } } },
  }, orderBy: [{ dueDate: 'asc' }, { id: 'asc' }] })
  const rows = payments.map(p => ({ id: p.id, studentId: p.studentId, studentName: `${p.student.firstName} ${p.student.lastName}`, active: p.student.isActive,
    group: p.student.group?.name ?? 'Grupsuz', branchId: p.student.branchId, dueDate: p.dueDate, outstanding: Math.max(p.amount - (p.paidAmount ?? 0), 0) })).filter(p => p.outstanding > 0)
  return { studentCount: new Set(rows.map(p => p.studentId)).size, paymentCount: rows.length, outstanding: rows.reduce((sum, p) => sum + p.outstanding, 0), rows }
}
