import test from 'node:test'
import assert from 'node:assert/strict'
import { paymentBalance, paymentMonth } from './payment-balance'
import { summarizePayments } from './payment-read'
import { familyTotals } from './family-service'

test('payment read state respects remaining balance, cancellation and stored overdue hints', () => {
  const now = new Date('2026-10-20T12:00:00Z'), old = new Date('2020-01-01'), future = new Date('2027-01-01')
  for (const status of ['PENDING', 'PARTIAL', 'OVERDUE']) {
    assert.deepEqual(paymentBalance({ status, amount: 100, paidAmount: 40, dueDate: old }, now), { remaining: 60, overdue: true, displayStatus: 'OVERDUE' })
    assert.deepEqual(paymentBalance({ status, amount: 100, paidAmount: 120, dueDate: old }, now), { remaining: 0, overdue: false, displayStatus: 'PAID' })
  }
  assert.equal(paymentBalance({ status: 'OVERDUE', amount: 100, dueDate: future }, now).displayStatus, 'PENDING')
  assert.equal(paymentBalance({ status: 'OVERDUE', amount: 100, paidAmount: 20, dueDate: future }, now).displayStatus, 'PARTIAL')
  for (const status of ['PAID', 'CANCELLED']) assert.equal(paymentBalance({ status, amount: 100, paidAmount: null, dueDate: old }, now).remaining, 0)
})

test('due day finishes at Istanbul midnight, independently of browser/server time zone', () => {
  const p = { status: 'PENDING', amount: 100, paidAmount: null, dueDate: '2026-10-20T00:00:00+03:00' }
  assert.equal(paymentBalance(p, new Date('2026-10-20T20:59:59.999Z')).overdue, false)
  assert.equal(paymentBalance(p, new Date('2026-10-20T21:00:00.000Z')).overdue, true)
  assert.deepEqual(paymentMonth(new Date('2026-12-31T21:00:00Z')), { start: new Date('2026-12-31T21:00:00Z'), end: new Date('2027-01-31T21:00:00Z') })
})

test('payment summary matches family totals per row and includes partial receipts in monthly paid', () => {
  const now = new Date('2026-10-20T12:00:00Z'), dueDate = new Date('2020-01-01'), paidDate = new Date('2026-10-01T00:00:00+03:00')
  const rows = [
    { status: 'OVERDUE', amount: 100, paidAmount: null, dueDate, paidDate: null },
    { status: 'PARTIAL', amount: 100, paidAmount: 40, dueDate, paidDate },
    { status: 'PAID', amount: 70, paidAmount: null, dueDate, paidDate: null },
    { status: 'PARTIAL', amount: 40, paidAmount: 60, dueDate, paidDate },
    { status: 'CANCELLED', amount: 999, paidAmount: 999, dueDate, paidDate },
  ]
  const summary = summarizePayments(rows, now), family = familyTotals(rows, now)
  assert.deepEqual([summary.totalAmount, summary.totalPaid, summary.totalRemaining, summary.overdueAmount], [family.charged, family.paid, family.remaining, family.overdue])
  assert.equal(summary.overdueCount, 2)
  assert.equal(summary.overdueAmount, 160)
  assert.equal(summary.monthlyPaid, 100)
})
