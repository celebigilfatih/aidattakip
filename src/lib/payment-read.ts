import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { paymentBalance, paymentMonth, openPaymentStatuses } from './payment-balance'
import { istanbulDayStart } from './staff-summary-policy'

export function paymentStatusWhere(status: string, now = new Date()): Prisma.PaymentWhereInput {
  const open = { status: { in: [...openPaymentStatuses] } }
  const balance: Prisma.PaymentWhereInput = { OR: [
    { paidAmount: null, amount: { gt: 0 } },
    { paidAmount: { lt: prisma.payment.fields.amount } },
  ] }
  const active: Prisma.PaymentWhereInput = { AND: [open, balance] }
  const day = istanbulDayStart(now)
  switch (status) {
    case 'OVERDUE': return { AND: [active, { dueDate: { lt: day } }] }
    case 'PARTIAL': return { AND: [active, { dueDate: { gte: day } }, { paidAmount: { gt: 0 } }] }
    case 'PENDING': return { AND: [active, { dueDate: { gte: day } }, { OR: [{ paidAmount: null }, { paidAmount: { lte: 0 } }] }] }
    case 'PAID': return { OR: [{ status: 'PAID' }, { AND: [open, { OR: [{ amount: { lte: 0 }, paidAmount: null }, { paidAmount: { gte: prisma.payment.fields.amount } }] }] }] }
    case 'CANCELLED': return { status: 'CANCELLED' }
    default: return { status: { not: 'CANCELLED' } }
  }
}

type SummaryPayment = Parameters<typeof paymentBalance>[0] & { paidDate: Date | null }
export function summarizePayments(payments: SummaryPayment[], now = new Date()) {
  const month = paymentMonth(now)
  const summary = { totalAmount: 0, totalPaid: 0, totalRemaining: 0, totalCount: payments.length, overdueCount: 0, overdueAmount: 0, monthlyPaid: 0, monthlyPending: 0 }
  for (const p of payments) {
    if (p.status === 'CANCELLED') continue
    const state = paymentBalance(p, now), due = new Date(p.dueDate)
    summary.totalAmount += p.amount
    summary.totalPaid += p.paidAmount ?? 0
    summary.totalRemaining += state.remaining
    if (state.overdue) { summary.overdueCount++; summary.overdueAmount += state.remaining }
    if (p.paidDate && p.paidDate >= month.start && p.paidDate < month.end) summary.monthlyPaid += p.paidAmount ?? 0
    if (due >= month.start && due < month.end) summary.monthlyPending += state.remaining
  }
  return summary
}
