import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes, createECDH } from 'node:crypto'
import { loadEnvConfig } from '@next/env'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import webpush from 'web-push'
import { hashToken } from './notification-policy'
import { istanbulDayStart, istanbulParts, localDateTime } from './staff-summary-policy'
loadEnvConfig(process.cwd())

test('staff push and weekly summary integration', async t => {
  const url = new URL(process.env.DATABASE_URL || '')
  assert(['127.0.0.1', 'localhost'].includes(url.hostname) && url.port === '5477' && url.pathname === '/aidat_takip', 'Local demo DB only')
  const { prisma } = await import('./prisma')
  const { POST: enroll, DELETE: revoke } = await import('../app/api/push/recipients/route')
  const { POST: activate } = await import('../app/api/push/activate/route')
  const { POST: subscribe, DELETE: disable, PATCH: primary } = await import('../app/api/push/subscription/route')
  const { GET: me } = await import('../app/api/push/session/route')
  const { POST: logout } = await import('../app/api/auth/logout/route')
  const { POST: create } = await import('../app/api/notifications/route')
  const { POST: send } = await import('../app/api/notifications/[id]/send/route')
  const { GET: overdue } = await import('../app/api/notifications/overdue-summary/route')
  const { POST: addRule, PUT: editRule, PATCH: ruleAction } = await import('../app/api/notifications/summary-rules/route')
  const { runStaffSummaryWorker } = await import('./staff-summary-service')
  const { getStaffOverdue } = await import('./staff-overdue')
  const prefix = 'staff-test-' + randomBytes(5).toString('hex'), origin = 'http://127.0.0.1:3077'
  process.env.APP_ORIGIN = origin
  const keys = webpush.generateVAPIDKeys()
  process.env.VAPID_PUBLIC_KEY = keys.publicKey; process.env.VAPID_PRIVATE_KEY = keys.privateKey; process.env.VAPID_SUBJECT = 'https://aidat.spormanage.com.tr'
  const originalSend = webpush.sendNotification
  let sent = 0, providerCode = 201
  webpush.sendNotification = async (_subscription, payload, options) => {
    sent++
    const parsed = JSON.parse(String(payload))
    assert.equal(parsed.title, 'SporManage'); assert(!String(payload).includes('Özel borç'))
    assert.match(options!.topic!, /^[A-Za-z0-9_-]{32}$/)
    assert.equal(Buffer.from(options!.topic!, 'base64url').length, 24)
    if (providerCode !== 201) throw { statusCode: providerCode }
    return { statusCode: 201, headers: {}, body: '' }
  }
  const users: string[] = [], branches: string[] = [], fees: string[] = []
  const cookie = (id: string) => 'auth-token=' + jwt.sign({ userId: id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
  const req = (path: string, method: string, auth = '', body?: unknown, customOrigin = origin) => new NextRequest(origin + path, { method, headers: { cookie: auth, origin: customOrigin, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  const context = (id: string) => ({ params: Promise.resolve({ id }) })
  try {
    const a = await prisma.branch.create({ data: { name: prefix + '-a' } }); branches.push(a.id)
    const b = await prisma.branch.create({ data: { name: prefix + '-b' } }); branches.push(b.id)
    const admin = await prisma.user.create({ data: { name: prefix, email: prefix + '-admin@example.invalid', password: 'not-a-password', role: 'ADMIN', branchId: a.id } }); users.push(admin.id)
    const accountant = await prisma.user.create({ data: { name: prefix, email: prefix + '-acct@example.invalid', password: 'not-a-password', role: 'ACCOUNTING', branchId: a.id } }); users.push(accountant.id)
    const other = await prisma.user.create({ data: { name: prefix, email: prefix + '-other@example.invalid', password: 'not-a-password', role: 'ADMIN', branchId: b.id } }); users.push(other.id)
    const staff = await prisma.user.create({ data: { name: prefix, email: prefix + '-staff@example.invalid', password: 'not-a-password', role: 'SECRETARY', branchId: a.id } }); users.push(staff.id)
    const adminCookie = cookie(admin.id), acctCookie = cookie(accountant.id), staffCookie = cookie(staff.id)
    const enrollBody = (identityId: string) => ({ kind: 'STAFF', identityId, verified: true })
    const sub = { endpoint: 'https://web.push.apple.com/' + prefix, keys: { p256dh: createECDH('prime256v1').generateKeys().toString('base64url'), auth: randomBytes(16).toString('base64url') }, label: 'Test iPhone' }
    let recipientId = '', deviceId = '', staffRecipientId = '', ruleId = ''
    await t.test('only admin selects; parent invitation, wrong origin and cross branch fail', async () => {
      assert.equal((await activate(req('/api/push/activate', 'POST'))).status, 410)
      assert.equal((await subscribe(req('/api/push/subscription', 'POST', 'push-recipient-session=old-parent', sub))).status, 401)
      assert.equal((await subscribe(req('/api/push/subscription', 'POST', acctCookie, sub))).status, 403)
      assert.equal((await enroll(req('/api/push/recipients', 'POST', acctCookie, enrollBody(accountant.id)))).status, 403)
      assert.equal((await enroll(req('/api/push/recipients', 'POST', adminCookie, { kind: 'PARENT', identityId: 'x', verified: true }))).status, 400)
      assert.equal((await enroll(req('/api/push/recipients', 'POST', adminCookie, enrollBody(other.id)))).status, 404)
      assert.equal((await enroll(req('/api/push/recipients', 'POST', adminCookie, enrollBody(accountant.id), 'https://evil.test'))).status, 403)
      recipientId = (await (await enroll(req('/api/push/recipients', 'POST', adminCookie, enrollBody(accountant.id)))).json()).recipientId
      staffRecipientId = (await (await enroll(req('/api/push/recipients', 'POST', adminCookie, enrollBody(staff.id)))).json()).recipientId
    })
    await t.test('30 day enrollment, ownership, primary and silent renewal', async () => {
      const r = await subscribe(req('/api/push/subscription', 'POST', acctCookie, sub)); assert.equal(r.status, 200); deviceId = (await r.json()).id
      const d = await prisma.pushDevice.findUniqueOrThrow({ where: { id: deviceId } })
      assert(Math.abs(d.expiresAt.getTime() - Date.now() - 30 * 86400000) < 5000)
      assert.equal((await prisma.notificationRecipient.findUniqueOrThrow({ where: { id: recipientId } })).primaryDeviceId, deviceId)
      assert.equal((await subscribe(req('/api/push/subscription', 'POST', staffCookie, sub))).status, 409)
      assert.equal((await primary(req('/api/push/subscription', 'PATCH', staffCookie, { deviceId }))).status, 404)
      await prisma.pushDevice.update({ where: { id: deviceId }, data: { expiresAt: new Date(Date.now() + 86400000) } })
      assert.equal((await subscribe(req('/api/push/subscription', 'POST', acctCookie, { ...sub, renewOnly: true }))).status, 200)
      assert((await prisma.pushDevice.findUniqueOrThrow({ where: { id: deviceId } })).expiresAt.getTime() > Date.now() + 29 * 86400000)
    })
    const base = { title: 'Test', message: 'Özel borç ayrıntısı', method: 'PUSH', type: 'GENERAL_ANNOUNCEMENT', recipientType: 'recipient', recipientId, targetDeviceId: deviceId }
    await t.test('atomic dispatch and expired target login still receives generic push', async () => {
      const old = jwt.sign({ userId: accountant.id, iat: 1, exp: 2 }, process.env.JWT_SECRET!)
      await prisma.pushDevice.update({ where: { id: deviceId }, data: { sessionHash: hashToken(old) } })
      assert.equal((await me(req('/api/push/session', 'GET', 'auth-token=' + old))).status, 401)
      const n = await (await create(req('/api/notifications', 'POST', adminCookie, base))).json(); assert(n.id)
      const before = sent
      const results = await Promise.all([send(req('/api/notifications/' + n.id + '/send', 'POST', adminCookie), context(n.id)), send(req('/api/notifications/' + n.id + '/send', 'POST', adminCookie), context(n.id))])
      assert.equal(results.filter(r => r.status === 200).length, 1); assert.equal(sent - before, 1)
      assert.equal((await create(req('/api/notifications', 'POST', adminCookie, { ...base, type: 'PAYMENT_OVERDUE', recipientId: staffRecipientId }))).status, 403)
    })
    const fee = await prisma.feeType.create({ data: { name: prefix, amount: 100 } }); fees.push(fee.id)
    const due = new Date(istanbulDayStart(new Date()).getTime() - 86400000)
    await prisma.student.createMany({ data: Array.from({ length: 200 }, (_, i) => ({ id: prefix + '-' + i, firstName: prefix, lastName: String(i), createdById: admin.id, branchId: a.id, isActive: i % 2 === 0 })) })
    await prisma.payment.createMany({ data: Array.from({ length: 200 }, (_, i) => ({ studentId: prefix + '-' + i, feeTypeId: fee.id, amount: 100, paidAmount: i === 0 ? 25 : 0, dueDate: due, status: i === 0 ? 'PARTIAL' as const : 'PENDING' as const, createdById: admin.id })) })
    await t.test('200 students aggregate; partial, inactive, settled and today boundary', async () => {
      const data = await getStaffOverdue(prisma, a.id)
      assert.equal(data.studentCount, 200); assert.equal(data.outstanding, 19975); assert.equal(data.rows.filter(r => !r.active).length, 100)
      const extra = await prisma.payment.create({ data: { studentId: prefix + '-0', feeTypeId: fee.id, amount: 900, paidAmount: 0, dueDate: new Date(), createdById: admin.id } })
      assert.equal((await getStaffOverdue(prisma, a.id)).paymentCount, 200)
      for (const status of ['CANCELLED', 'PAID'] as const) {
        await prisma.payment.update({ where: { id: extra.id }, data: { dueDate: due, status } })
        assert.equal((await getStaffOverdue(prisma, a.id)).paymentCount, 200)
      }
      assert.equal((await overdue(req('/api/notifications/overdue-summary', 'GET', staffCookie))).status, 403)
      assert.equal((await overdue(req('/api/notifications/overdue-summary?branchId=' + b.id, 'GET', acctCookie))).status, 403)
    })
    await subscribe(req('/api/push/subscription', 'POST', acctCookie, sub))
    const now = new Date(), parts = istanbulParts(now), day = parts.year + '-' + parts.month + '-' + parts.day, time = parts.hour + ':' + parts.minute, slot = localDateTime(day, time), weekday = new Date(day + 'T12:00Z').getUTCDay() || 7
    const ruleData = { name: prefix, weekdays: [weekday], time, enabled: true, recipientIds: [recipientId] }
    await t.test('new rule disabled; nonfinancial and cross branch recipients denied', async () => {
      assert.equal((await addRule(req('/api/notifications/summary-rules', 'POST', adminCookie, { ...ruleData, recipientIds: [staffRecipientId] }))).status, 400)
      const r = await addRule(req('/api/notifications/summary-rules', 'POST', adminCookie, ruleData)); assert.equal(r.status, 201)
      const rule = await r.json(); ruleId = rule.id; assert.equal(rule.enabled, false)
      assert.equal((await editRule(req('/api/notifications/summary-rules', 'PUT', cookie(other.id), { ...ruleData, id: ruleId }))).status, 404)
      const update = await editRule(req('/api/notifications/summary-rules', 'PUT', adminCookie, { ...ruleData, id: ruleId }))
      assert.equal(update.status, 200); assert.equal((await update.json()).enabled, true)
      await ruleAction(req('/api/notifications/summary-rules', 'PATCH', adminCookie, { id: ruleId, action: 'disable' }))
    })
    await t.test('disabled, parallel workers and restart produce one summary, not 200', async () => {
      const before = sent; await runStaffSummaryWorker(now, [ruleId]); assert.equal(sent, before)
      await prisma.staffSummaryRule.update({ where: { id: ruleId }, data: { enabled: true, lastEvaluatedAt: new Date(slot.getTime() - 1) } })
      const records = await prisma.notification.count({ where: { createdById: admin.id } })
      await Promise.all([runStaffSummaryWorker(now, [ruleId]), runStaffSummaryWorker(now, [ruleId])])
      assert.equal(sent - before, 1); assert.equal(await prisma.notification.count({ where: { createdById: admin.id } }), records + 1)
      await runStaffSummaryWorker(now, [ruleId]); assert.equal(sent - before, 1)
    })
    await t.test('one hour catch-up allowed; older slot MISSED without send', async () => {
      for (const [lag, expected] of [[3600000, 'ACCEPTED'], [3600001, 'MISSED']] as const) {
        const r = await prisma.staffSummaryRule.create({ data: { name: prefix, weekdays: [weekday], time, enabled: true, branchId: a.id, createdById: admin.id, lastEvaluatedAt: new Date(slot.getTime() - 1), recipients: { create: { recipientId } } } })
        const before = sent; await runStaffSummaryWorker(new Date(slot.getTime() + lag), [r.id])
        const run = await prisma.staffSummaryRun.findFirstOrThrow({ where: { ruleId: r.id } })
        assert.equal(run.status, expected); assert.equal(sent - before, expected === 'ACCEPTED' ? 1 : 0)
        await prisma.staffSummaryRule.update({ where: { id: r.id }, data: { enabled: false } })
      }
    })
    await t.test('settled balance skips summary; stopping prevents next weekly slot', async () => {
      await prisma.payment.updateMany({ where: { createdById: admin.id }, data: { status: 'PAID', paidAmount: 100 } })
      const before = sent
      const r = await ruleAction(req('/api/notifications/summary-rules', 'PATCH', acctCookie, { id: ruleId, action: 'send' }))
      assert.equal(r.status, 200); assert.equal((await r.json()).status, 'SKIPPED'); assert.equal(sent, before)
      await ruleAction(req('/api/notifications/summary-rules', 'PATCH', acctCookie, { id: ruleId, action: 'disable' }))
      await runStaffSummaryWorker(new Date(now.getTime() + 7 * 86400000), [ruleId]); assert.equal(sent, before)
    })
    await t.test('410, logout, device disable and revoke cannot be silently renewed', async () => {
      providerCode = 410
      const n = await (await create(req('/api/notifications', 'POST', adminCookie, base))).json()
      assert.equal((await send(req('/api/notifications/' + n.id + '/send', 'POST', adminCookie), context(n.id))).status, 502)
      assert.equal((await prisma.pushDevice.findUniqueOrThrow({ where: { id: deviceId } })).isActive, false)
      providerCode = 201
      assert.equal((await subscribe(req('/api/push/subscription', 'POST', acctCookie, { ...sub, renewOnly: true }))).status, 409)
      await subscribe(req('/api/push/subscription', 'POST', acctCookie, sub))
      assert.equal((await logout(req('/api/auth/logout', 'POST', acctCookie))).status, 200)
      assert.equal((await prisma.pushDevice.findUniqueOrThrow({ where: { id: deviceId } })).isActive, false)
      assert.equal((await subscribe(req('/api/push/subscription', 'POST', acctCookie, { ...sub, renewOnly: true }))).status, 409)
      await subscribe(req('/api/push/subscription', 'POST', acctCookie, sub))
      await disable(req('/api/push/subscription', 'DELETE', acctCookie, { deviceId }))
      assert.equal((await prisma.pushDevice.findUniqueOrThrow({ where: { id: deviceId } })).isActive, false)
      await revoke(req('/api/push/recipients', 'DELETE', adminCookie, { id: recipientId }))
      assert.equal((await subscribe(req('/api/push/subscription', 'POST', acctCookie, sub))).status, 403)
    })
  } finally {
    webpush.sendNotification = originalSend
    await prisma.notification.deleteMany({ where: { createdById: { in: users } } })
    await prisma.staffSummaryRun.deleteMany({ where: { rule: { createdById: { in: users } } } })
    await prisma.staffSummaryRule.deleteMany({ where: { createdById: { in: users } } })
    await prisma.notificationRecipient.updateMany({ where: { userId: { in: users } }, data: { primaryDeviceId: null } })
    await prisma.notificationRecipient.deleteMany({ where: { userId: { in: users } } })
    await prisma.payment.deleteMany({ where: { createdById: { in: users } } })
    await prisma.student.deleteMany({ where: { createdById: { in: users } } })
    await prisma.feeType.deleteMany({ where: { id: { in: fees } } })
    await prisma.user.deleteMany({ where: { id: { in: users } } })
    await prisma.branch.deleteMany({ where: { id: { in: branches } } })
    await prisma.$disconnect()
  }
})
