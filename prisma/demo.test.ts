import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDemo, calendarDate, MODELS } from './demo-data'
import { validateTarget } from './demo-store'

test('demo target rejects other hosts, ports, DBs and connection overrides', () => {
  for (const host of ['localhost', '127.0.0.1', '[::1]']) assert.ok(validateTarget(`postgresql://test:test@${host}:5477/aidat_takip?schema=public`))
  for (const url of [undefined, '', 'invalid', 'postgresql://remote:5477/aidat_takip', 'postgresql://localhost:5432/aidat_takip', 'postgresql://localhost:5477/production', 'postgresql://localhost:5477/aidat_takip?host=remote', 'postgresql://localhost:5477/aidat_takip?schema=private', 'postgresql://localhost:5477/aidat_takip?options=-csearch_path=private']) assert.throws(() => validateTarget(url))
})
for (const date of ['2026-09-14T08:00:00Z', '2026-01-01T00:00:00Z', '2028-02-29T20:00:00Z', '2026-09-30T22:30:00Z']) {
  test(`fixture relationships, money, dates and attendance: ${date}`, () => {
    const anchor = new Date(date), d = buildDemo(anchor, 'admin-test'), today = calendarDate(anchor)
    assert.deepEqual(d, buildDemo(anchor, 'admin-test'))
    assert.equal(d.student.length, 60); assert.equal(d.payment.length, 300); assert.equal(d.user.length, 8)
    assert.equal(d.feeType.length, 8); assert.equal(d.note.length, 18); assert.equal(d.notification.length, 12)
    assert.equal(new Set(d.student.map(student => `${student.firstName} ${student.lastName}`)).size, 60)
    assert.ok(d.student.every(student => !/demo/i.test(`${student.firstName} ${student.lastName}`)))
    assert.ok(d.parent.every(parent => !/demo/i.test(`${parent.firstName} ${parent.lastName}`)))
    assert.equal(new Set(d.trainer.map(trainer => trainer.name)).size, 6)
    assert.ok(d.trainer.every(trainer => !/demo/i.test(trainer.name)))
    for (const model of MODELS) {
      for (const row of d[model]) {
        for (const [field, value] of Object.entries(row)) {
          if (field === 'id' || (typeof value === 'string' && value.startsWith('demo-v1-'))) continue
          if (typeof value === 'string') assert.doesNotMatch(value, /demo|futbol okulu|futbolokulu/i, `${model}.${field}`)
        }
      }
    }
    for (const model of MODELS) assert.equal(new Set(d[model].map(r => r.id)).size, d[model].length)
    for (const group of d.group) {
      const students = d.student.filter(s => s.groupId === group.id)
      assert.equal(students.length, 10); assert.equal(students.filter(s => s.isActive).length, 9)
      assert.ok(students.every(s => s.branchId === group.branchId))
      assert.equal(d.userGroupPermission.filter(p => p.groupId === group.id).length, 1)
      assert.ok(d.trainingSession.some(s => s.groupId === group.id && +(s.date as Date) === +today && s.status === 'PLANNED'))
    }
    assert.equal(d.parent.filter(p => p.relationship === 'Diğer').length, 20)
    assert.deepEqual(new Set(d.payment.map(p => p.status)), new Set(['PAID', 'PARTIAL', 'OVERDUE', 'PENDING', 'CANCELLED']))
    for (const payment of d.payment) {
      assert.ok(d.student.some(s => s.id === payment.studentId))
      assert.ok(d.feeType.some(f => f.id === payment.feeTypeId && f.amount === payment.amount))
      assert.ok((payment.paidAmount ?? 0) >= 0 && (payment.paidAmount ?? 0) <= payment.amount)
      if (payment.status === 'PAID') assert.equal(payment.paidAmount, payment.amount)
      if (payment.status === 'PARTIAL') assert.ok(payment.paidAmount! > 0 && payment.paidAmount! < payment.amount)
      if (payment.status === 'OVERDUE') assert.ok(+(payment.dueDate as Date) < +today)
      if (payment.status === 'PENDING') assert.ok(+(payment.dueDate as Date) >= +today)
      if (payment.paidDate) assert.ok(+(payment.paidDate as Date) <= +anchor)
    }
    assert.deepEqual(new Set(d.attendance.map(a => a.status)), new Set(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']))
    for (const session of d.trainingSession) {
      const attendance = d.attendance.filter(a => a.sessionId === session.id)
      assert.equal(attendance.length, session.status === 'COMPLETED' ? 9 : 0)
      if (session.status === 'COMPLETED') assert.ok(+(session.date as Date) < +today)
    }
    for (const stats of d.attendanceAnalytics) {
      assert.equal(stats.totalSessions, stats.presentCount! + stats.absentCount! + stats.lateCount! + stats.excusedCount!)
      assert.ok(stats.attendancePercentage! >= 0 && stats.attendancePercentage! <= 100)
    }
    assert.ok(d.notification.every(n => n.method === 'IN_APP' && !n.recipientEmail && !n.recipientPhone))
  })
}

test('rerun completes only missing rows and preserves customized values/passwords', async () => {
  const { installDemo } = await import('./demo-install')
  const anchor = new Date('2026-09-15T08:00:00Z')
  const d = buildDemo(anchor, 'admin-test')
  const rows: Record<string, Record<string, unknown>[]> = Object.fromEntries(MODELS.map(m => [m, structuredClone(d[m])]))
  rows.user.unshift({ id: 'admin-test', createdAt: anchor, role: 'ADMIN', isActive: true, password: 'existing-admin-hash' })
  for (const user of rows.user) user.password = 'existing-unchanged-hash'
  rows.note[0].content = 'User edited demo note'
  const missingNote = rows.note.pop()!
  const calls: string[] = []
  const settings = [{ id: 'settings', schoolName: 'Custom Club' }]
  const tx: Record<string, unknown> = { $queryRaw: async () => [{ name: 'aidat_takip' }], systemSetting: { findMany: async () => settings, update: async () => { throw new Error('custom settings must not be updated') } } }
  for (const model of MODELS) tx[model] = { findMany: async () => rows[model], create: async ({ data }: { data: Record<string, unknown> }) => { calls.push(model); rows[model].push(data); return data } }
  const beforePasswords = rows.user.map(u => u.password)
  const result = await installDemo(tx as unknown as import('@prisma/client').Prisma.TransactionClient)
  assert.deepEqual(calls, ['note'])
  assert.equal(result.credentials.length, 0)
  assert.equal(rows.note[0].content, 'User edited demo note')
  assert.deepEqual(rows.user.map(u => u.password), beforePasswords)
  assert.ok(rows.note.some(n => n.id === missingNote.id))
})
