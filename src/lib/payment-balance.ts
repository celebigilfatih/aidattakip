import { istanbulDayStart, istanbulParts, localDateTime } from './staff-summary-policy'

export type BalancePayment = { amount: number; paidAmount?: number | null; status: string; dueDate: Date | string }
export const openPaymentStatuses = ['PENDING', 'PARTIAL', 'OVERDUE'] as const

// Read-time state only. Stored status and payment history remain unchanged.
export function paymentBalance(payment: BalancePayment, now = new Date()) {
  const cancelled = payment.status === 'CANCELLED'
  const remaining = cancelled || payment.status === 'PAID' ? 0 : Math.max(payment.amount - (payment.paidAmount ?? 0), 0)
  const overdue = openPaymentStatuses.some(status => status === payment.status) && remaining > 0 && new Date(payment.dueDate) < istanbulDayStart(now)
  const displayStatus = cancelled ? 'CANCELLED' : remaining === 0 ? 'PAID' : overdue ? 'OVERDUE' : (payment.paidAmount ?? 0) > 0 ? 'PARTIAL' : 'PENDING'
  return { remaining, overdue, displayStatus }
}

export function paymentMonth(now = new Date()) {
  const p = istanbulParts(now), year = +p.year, month = +p.month
  return {
    start: localDateTime(`${p.year}-${p.month}-01`, '00:00'),
    end: localDateTime(`${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}-01`, '00:00'),
  }
}
