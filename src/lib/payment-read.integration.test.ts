import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { loadEnvConfig } from '@next/env'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { istanbulDayStart } from './staff-summary-policy'
import { paymentBalance } from './payment-balance'
import { paymentStatusWhere } from './payment-read'
import { familyTotals } from './family-service'

loadEnvConfig(process.cwd())
test('CR-032: read-only payments filters and summaries agree with family balances', async t => {
  const url = new URL(process.env.DATABASE_URL || '')
  assert(['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '5477' && url.pathname === '/aidat_takip', 'Local demo only')
  const { prisma: db } = await import('./prisma'), route = await import('../app/api/payments/route')
  const prefix = 'cr032-' + randomBytes(5).toString('hex'), day = istanbulDayStart(new Date()), yesterday = new Date(day.getTime() - 86400000), tomorrow = new Date(day.getTime() + 86400000)
  let branchId = '', userId = '', feeId = ''
  const before = { students: await db.student.count(), payments: await db.payment.count(), notifications: await db.notification.count() }
  try {
    const branch = await db.branch.create({ data: { name: prefix } }); branchId = branch.id
    const user = await db.user.create({ data: { name: prefix, email: prefix + '@example.invalid', password: 'fixture', role: 'ADMIN', branchId } }); userId = user.id
    const fee = await db.feeType.create({ data: { name: prefix, amount: 100, period: 'MONTHLY' } }); feeId = fee.id
    const student = await db.student.create({ data: { firstName: prefix, lastName: 'Inactive', branchId, isActive: false, createdById: user.id } })
    const fixtures = [
      { status: 'OVERDUE' as const, amount: 100, paidAmount: null, dueDate: yesterday },
      { status: 'PARTIAL' as const, amount: 100, paidAmount: 40, dueDate: yesterday },
      { status: 'PENDING' as const, amount: 80, paidAmount: null, dueDate: day },
      { status: 'OVERDUE' as const, amount: 90, paidAmount: null, dueDate: tomorrow },
      { status: 'PENDING' as const, amount: 50, paidAmount: 50, dueDate: yesterday },
      { status: 'OVERDUE' as const, amount: 40, paidAmount: 60, dueDate: yesterday },
      { status: 'PAID' as const, amount: 70, paidAmount: null, dueDate: yesterday },
      { status: 'CANCELLED' as const, amount: 999, paidAmount: 999, dueDate: yesterday },
      { status: 'OVERDUE' as const, amount: 100, paidAmount: 20, dueDate: tomorrow },
      { status: 'PARTIAL' as const, amount: 0, paidAmount: null, dueDate: yesterday },
    ]
    await db.payment.createMany({ data: fixtures.map(p => ({ ...p, studentId: student.id, feeTypeId: fee.id, createdById: user.id })) })
    const initial = await db.payment.findMany({ where: { studentId: student.id }, orderBy: { id: 'asc' } })
    const read = async (query: string) => {
      const response = await route.GET(new NextRequest('http://127.0.0.1:3077/api/payments?studentId=' + student.id + '&' + query, { headers: { cookie: 'auth-token=' + jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' }) } }))
      assert.equal(response.status, 200); assert.equal(response.headers.get('Cache-Control'), 'no-store'); return response.json()
    }
    await t.test('all periods/inactive athlete, partial, zero and overpaid amounts match family with pagination', async () => {
      const data = await read('limit=1'), family = familyTotals(initial)
      assert.equal(data.payments.length, 1); assert.equal(data.pagination.total, 9)
      assert.equal(data.summary.totalAmount, family.charged); assert.equal(data.summary.totalPaid, family.paid)
      assert.equal(data.summary.totalRemaining, 410); assert.equal(data.summary.totalRemaining, family.remaining)
      assert.equal(data.summary.overdueCount, 2); assert.equal(data.summary.overdueAmount, 160); assert.equal(data.summary.overdueAmount, family.overdue)
    })
    await t.test('checkbox and OVERDUE selection return the same positive debts, other status filters match displayed status', async () => {
      const overdue = await read('overdue=true'), selected = await read('status=OVERDUE')
      assert.equal(overdue.payments.length, 2)
      assert.deepEqual(overdue.payments.map((p: { id: string }) => p.id).sort(), selected.payments.map((p: { id: string }) => p.id).sort())
      assert(overdue.payments.every((p: { overdue: boolean; displayStatus: string }) => p.overdue && p.displayStatus === 'OVERDUE'))
      assert.equal((await read('status=PAID&overdue=true')).pagination.total, 0, 'overdue must not overwrite selected status')
      for (const status of ['PENDING', 'PARTIAL', 'PAID', 'CANCELLED']) {
        const data = await read('status=' + status)
        assert(data.payments.every((p: { displayStatus: string }) => p.displayStatus === status))
      }
    })
    await t.test('database predicates equal read-time state on either side of Istanbul midnight', async () => {
      for (const now of [new Date(day.getTime() + 86399999), tomorrow]) {
        for (const status of ['PENDING', 'PARTIAL', 'OVERDUE', 'PAID', 'CANCELLED']) {
          const found = await db.payment.findMany({ where: { AND: [{ studentId: student.id }, paymentStatusWhere(status, now)] } })
          assert.deepEqual(found.map(p => p.id).sort(), initial.filter(p => paymentBalance(p, now).displayStatus === status).map(p => p.id).sort())
        }
      }
    })
    await t.test('search/group/branch filters are intersected and GET never rewrites stored statuses', async () => {
      assert.equal((await read('branchId=unknown')).pagination.total, 0)
      assert.equal((await read('groupId=unknown')).pagination.total, 0)
      assert.equal((await read('search=not-matching')).pagination.total, 0)
      assert.equal((await read('search=' + prefix)).pagination.total, 9)
      assert.deepEqual(await db.payment.findMany({ where: { studentId: student.id }, orderBy: { id: 'asc' } }), initial)
    })
    await t.test('legacy bulk cancellation uses the same late-debt predicate on owned disposable fixtures', async () => {
      const response = await route.DELETE(new NextRequest('http://127.0.0.1:3077/api/payments?search=' + prefix + '&status=OVERDUE', {
        method: 'DELETE', headers: { cookie: 'auth-token=' + jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' }) },
      }))
      assert.equal(response.status, 200)
      assert.equal((await response.json()).count, 2)
      const changed = await db.payment.findMany({ where: { studentId: student.id, status: 'CANCELLED' } })
      assert.equal(changed.length, 3) // two newly cancelled fixture debts plus the original cancelled one
      assert(changed.filter(p => p.notes?.includes('(bulk)')).every(p => initial.find(i => i.id === p.id) && paymentBalance(initial.find(i => i.id === p.id)!).overdue))
    })
  } finally {
    if (branchId) await db.$transaction(async tx => {
      await tx.payment.deleteMany({ where: { student: { branchId } } })
      await tx.student.deleteMany({ where: { branchId } })
      await tx.user.deleteMany({ where: { id: userId } })
      await tx.branch.delete({ where: { id: branchId } })
      await tx.feeType.deleteMany({ where: { id: feeId } })
    })
    assert.deepEqual({ students: await db.student.count(), payments: await db.payment.count(), notifications: await db.notification.count() }, before)
    await db.$disconnect()
  }
})
