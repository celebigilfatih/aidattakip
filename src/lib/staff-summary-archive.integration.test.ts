import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes, createECDH } from 'node:crypto'
import { loadEnvConfig } from '@next/env'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import webpush from 'web-push'

loadEnvConfig(process.cwd())
test('summary archival preserves history and closes every sending and membership path', async t => {
  const url = new URL(process.env.DATABASE_URL || '')
  assert(['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '5477' && url.pathname === '/aidat_takip', 'Local demo only')
  const { prisma } = await import('./prisma')
  const { GET, PATCH, PUT } = await import('../app/api/push/staff-summary/route')
  const { GET: history, PUT: legacyEdit, PATCH: legacyAction } = await import('../app/api/notifications/summary-rules/route')
  const { GET: staffOptions, POST: createStaff } = await import('../app/api/push/staff/route')
  const { runStaffSummaryWorker, executeSummaryRun } = await import('./staff-summary-service')
  const { dispatchNotification } = await import('./notification-dispatch')
  const prefix = 'archive-' + randomBytes(6).toString('hex'), origin = 'http://127.0.0.1:3077'
  const previous = { origin: process.env.APP_ORIGIN, public: process.env.VAPID_PUBLIC_KEY, private: process.env.VAPID_PRIVATE_KEY, subject: process.env.VAPID_SUBJECT }
  const keys = webpush.generateVAPIDKeys()
  process.env.APP_ORIGIN = origin; process.env.VAPID_PUBLIC_KEY = keys.publicKey; process.env.VAPID_PRIVATE_KEY = keys.privateKey; process.env.VAPID_SUBJECT = 'mailto:test@example.invalid'
  const original = webpush.sendNotification; let sent = 0
  webpush.sendNotification = (async () => { sent++; return { statusCode: 201, body: '', headers: {} } }) as typeof original
  const req = (method: string, userId?: string, body?: unknown, path = '/api/push/staff-summary', requestOrigin = origin) => new NextRequest(origin + path, { method, headers: { origin: requestOrigin, cookie: userId ? 'auth-token=' + jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' }) : 'push-recipient-session=old-parent', 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
  const branches: string[] = [], users: string[] = []
  try {
    for (const key of ['a', 'b']) branches.push((await prisma.branch.create({ data: { name: prefix + key } })).id)
    const person = async (key: string, role: 'ADMIN' | 'ACCOUNTING' | 'SECRETARY', branchId = branches[0], isActive = true) => {
      const user = await prisma.user.create({ data: { name: prefix + key, email: prefix + key + '@example.invalid', password: 'fixture', role, branchId, isActive } }); users.push(user.id); return user
    }
    const admin = await person('admin', 'ADMIN'), accountant = await person('accountant', 'ACCOUNTING'), other = await person('other', 'ADMIN', branches[1]), secretary = await person('secretary', 'SECRETARY'), inactive = await person('inactive', 'ADMIN', branches[0], false)
    const recipient = await prisma.notificationRecipient.create({ data: { kind: 'STAFF', userId: accountant.id, staffPushEnabled: true } })
    const device = await prisma.pushDevice.create({ data: { recipientId: recipient.id, sessionHash: prefix, expiresAt: new Date(Date.now() + 86400000), endpoint: 'https://web.push.apple.com/' + prefix, p256dh: createECDH('prime256v1').generateKeys().toString('base64url'), auth: randomBytes(16).toString('base64url'), label: 'Fixture iPhone' } })
    await prisma.notificationRecipient.update({ where: { id: recipient.id }, data: { primaryDeviceId: device.id } })
    const rule = await prisma.staffSummaryRule.create({ data: { name: prefix, weekdays: [1], time: '09:00', branchId: branches[0], createdById: admin.id, lastEvaluatedAt: new Date('2026-10-01T00:00:00Z'), recipients: { create: { recipientId: recipient.id } } } })
    const run = await prisma.staffSummaryRun.create({ data: { ruleId: rule.id, scheduledAt: new Date('2026-10-01T06:00:00Z'), status: 'ACCEPTED', accepted: 1, finishedAt: new Date('2026-10-01T06:00:01Z') } })
    const notification = await prisma.notification.create({ data: { title: 'Historical summary', message: 'Fixture', method: 'PUSH', type: 'PAYMENT_OVERDUE', status: 'ACCEPTED', sentAt: run.finishedAt, recipientId: recipient.id, targetDeviceId: device.id, createdById: admin.id, isFeeSummary: true, summaryRunId: run.id, summaryBranchId: branches[0] } })
    await prisma.pushDelivery.create({ data: { notificationId: notification.id, deviceId: device.id, status: 'ACCEPTED', statusCode: 201, finishedAt: run.finishedAt } })
    const state = () => prisma.staffSummaryRule.findUniqueOrThrow({ where: { id: rule.id }, include: { recipients: true, runs: { include: { notifications: { include: { deliveries: true } } } } } })
    const before = await state(), expected = { name: rule.name, weekdays: rule.weekdays, time: rule.time, recipientIds: [recipient.id] }
    const change = (action: 'archive' | 'restore', actor = accountant.id) => PATCH(req('PATCH', actor, { ruleId: rule.id, action }))
    await t.test('authority, origin, branch and strict payload/filter checks leave the rule intact', async () => {
      for (const [actor, code] of [[undefined, 401], [secretary.id, 403], [inactive.id, 401], [other.id, 409]] as const) assert.equal((await PATCH(req('PATCH', actor, { ruleId: rule.id, action: 'archive' }))).status, code)
      assert.equal((await PATCH(req('PATCH', admin.id, { ruleId: rule.id, action: 'archive' }, undefined, 'https://other.invalid'))).status, 403)
      for (const body of [{ action: 'delete' }, { action: 'archive', enabled: false }, { action: 'restore', receive: true }]) assert.equal((await PATCH(req('PATCH', admin.id, { ruleId: rule.id, ...body }))).status, 400)
      assert.equal((await GET(req('GET', admin.id, undefined, '/api/push/staff-summary?archived=invalid'))).status, 400)
      assert.deepEqual(await state(), before)
    })
    await t.test('active rules must stop first; migration enforces the archived-disabled invariant', async () => {
      await PATCH(req('PATCH', admin.id, { ruleId: rule.id, enabled: true }))
      assert.equal((await change('archive')).status, 409)
      assert.equal((await change('restore')).status, 409)
      assert.equal((await state()).enabled, true)
      assert.equal((await state()).archivedAt, null)
      await PATCH(req('PATCH', admin.id, { ruleId: rule.id, enabled: false }))
      await assert.rejects(prisma.staffSummaryRule.update({ where: { id: rule.id }, data: { enabled: true, archivedAt: new Date() } }))
      assert.equal((await state()).enabled, false)
    })
    await t.test('archive is idempotent and keeps rule fields, recipients and all sending history', async () => {
      assert.equal((await change('archive')).status, 200)
      const first = await state(); assert(first.archivedAt)
      assert.equal((await change('archive', admin.id)).status, 200)
      const after = await state()
      assert.equal(after.archivedAt!.getTime(), first.archivedAt!.getTime())
      for (const key of ['id', 'name', 'weekdays', 'time', 'branchId', 'createdById', 'recipients', 'runs'] as const) assert.deepEqual(after[key], before[key])
      assert.equal(after.enabled, false)
      const list = await (await GET(req('GET', admin.id))).json(); assert(!list.rules.some((r: { id: string }) => r.id === rule.id))
      const archive = await (await GET(req('GET', accountant.id, undefined, '/api/push/staff-summary?archived=true'))).json(); assert(archive.rules.some((r: { id: string }) => r.id === rule.id))
      assert.equal((await (await GET(req('GET', other.id, undefined, '/api/push/staff-summary?archived=true'))).json()).rules.length, 0)
      assert(!(await (await staffOptions(req('GET', admin.id))).json()).summaryRules.some((r: { id: string }) => r.id === rule.id))
      const retained = (await (await history(req('GET', admin.id))).json()).rules.find((r: { id: string }) => r.id === rule.id)
      assert(retained.archivedAt); assert.equal(retained.runs[0].id, run.id); assert.equal(retained.runs[0].accepted, 1)
    })
    await t.test('stale forms, legacy APIs and staff onboarding cannot revive or join an archived rule', async () => {
      for (const body of [{ ruleId: rule.id, enabled: true }, { ruleId: rule.id, enabled: false }, { ruleId: rule.id, userId: accountant.id, receive: true }, { ruleId: rule.id, userId: accountant.id, receive: false }]) assert.equal((await PATCH(req('PATCH', admin.id, body))).status, 409)
      for (const body of [{ ruleId: rule.id, weekdays: [2], time: '10:00' }, { ruleId: rule.id, ...expected, expected }]) assert.equal((await PUT(req('PUT', admin.id, body))).status, 409)
      assert.equal((await legacyEdit(req('PUT', admin.id, { id: rule.id, ...expected, enabled: true }))).status, 409)
      for (const action of ['disable', 'send']) assert.equal((await legacyAction(req('PATCH', accountant.id, { id: rule.id, action }))).status, 409)
      const email = prefix + '-stale@example.invalid'
      assert.equal((await createStaff(req('POST', admin.id, { name: 'Stale form', email, password: randomBytes(12).toString('hex'), role: 'ACCOUNTING', branchId: branches[0], groupIds: [], selectForNotifications: true, summaryRuleId: rule.id }))).status, 409)
      assert.equal(await prisma.user.count({ where: { email } }), 0)
      assert.equal((await state()).runs.length, 1)
    })
    await t.test('worker and both manual/automatic dispatch refuse archived work without external push', async () => {
      assert.equal((await runStaffSummaryWorker(new Date(Date.now() + 7 * 86400000), [rule.id])).evaluatedRules, 0)
      for (const [index, kind] of ['MANUAL', 'AUTOMATIC'].map((kind, index) => [index, kind] as const)) {
        const pending = await prisma.staffSummaryRun.create({ data: { ruleId: rule.id, kind, scheduledAt: new Date('2026-10-02T06:00:0' + index + 'Z') } })
        const n = await prisma.notification.create({ data: { title: 'Pending fixture', message: 'Fixture', method: 'PUSH', type: 'PAYMENT_OVERDUE', recipientId: recipient.id, targetDeviceId: device.id, createdById: admin.id, isFeeSummary: true, summaryRunId: pending.id, summaryBranchId: branches[0] } })
        await assert.rejects(dispatchNotification(n.id), (e: unknown) => e instanceof Error && e.message.includes('Kural'))
        await executeSummaryRun(pending.id)
        assert.equal((await prisma.staffSummaryRun.findUniqueOrThrow({ where: { id: pending.id } })).status, 'SKIPPED')
        assert.equal(await prisma.pushDelivery.count({ where: { notificationId: n.id } }), 0)
      }
      assert.equal(sent, 0)
      assert.deepEqual(await prisma.staffSummaryRun.findUniqueOrThrow({ where: { id: run.id } }), run)
    })
    await t.test('restore stays disabled, retains recipients and cursor; no catch-up is sent', async () => {
      const archived = await state()
      assert.equal((await change('restore')).status, 200)
      const restored = await state(); assert.equal(restored.archivedAt, null); assert.equal(restored.enabled, false)
      assert.deepEqual(restored.recipients, archived.recipients); assert.deepEqual(restored.runs, archived.runs)
      assert.equal(restored.lastEvaluatedAt.getTime(), archived.lastEvaluatedAt.getTime())
      assert.equal((await change('restore')).status, 200)
      assert.equal((await state()).lastEvaluatedAt.getTime(), archived.lastEvaluatedAt.getTime())
      assert((await (await GET(req('GET', admin.id))).json()).rules.some((r: { id: string }) => r.id === rule.id))
      assert.equal((await runStaffSummaryWorker(new Date(Date.now() + 7 * 86400000), [rule.id])).claimedRuns, 0)
      await prisma.user.update({ where: { id: accountant.id }, data: { isActive: false } })
      assert.equal((await PATCH(req('PATCH', admin.id, { ruleId: rule.id, enabled: true }))).status, 400)
      await prisma.user.update({ where: { id: accountant.id }, data: { isActive: true } })
    })
    await t.test('parallel archive and enable or legacy update cannot lose archival state', async () => {
      for (const legacy of [false, true]) {
        const responses = await Promise.all([change('archive'), legacy ? legacyEdit(req('PUT', admin.id, { id: rule.id, ...expected, enabled: true })) : PATCH(req('PATCH', admin.id, { ruleId: rule.id, enabled: true }))])
        assert.deepEqual(responses.map(r => r.status).sort(), [200, 409])
        const current = await state(); assert(!current.archivedAt || !current.enabled)
        if (current.archivedAt) await change('restore')
        else await PATCH(req('PATCH', admin.id, { ruleId: rule.id, enabled: false }))
      }
      const join = await Promise.all([change('archive'), PATCH(req('PATCH', admin.id, { ruleId: rule.id, userId: accountant.id, receive: true }))])
      assert.equal(join[0].status, 200); assert([200, 409].includes(join[1].status)); assert((await state()).archivedAt)
      assert.deepEqual((await state()).recipients, before.recipients); assert.equal(sent, 0)
    })
  } finally {
    webpush.sendNotification = original
    for (const [key, value] of Object.entries({ APP_ORIGIN: previous.origin, VAPID_PUBLIC_KEY: previous.public, VAPID_PRIVATE_KEY: previous.private, VAPID_SUBJECT: previous.subject })) { if (value === undefined) delete process.env[key]; else process.env[key] = value }
    await prisma.notification.deleteMany({ where: { createdById: { in: users } } })
    await prisma.staffSummaryRun.deleteMany({ where: { rule: { createdById: { in: users } } } })
    await prisma.staffSummaryRule.deleteMany({ where: { createdById: { in: users } } })
    await prisma.notificationRecipient.updateMany({ where: { userId: { in: users } }, data: { primaryDeviceId: null } })
    await prisma.notificationRecipient.deleteMany({ where: { userId: { in: users } } })
    await prisma.user.deleteMany({ where: { id: { in: users } } })
    await prisma.branch.deleteMany({ where: { id: { in: branches } } })
    await prisma.$disconnect()
  }
})
