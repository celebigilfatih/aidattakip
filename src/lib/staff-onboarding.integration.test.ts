import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { loadEnvConfig } from '@next/env'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

loadEnvConfig(process.cwd())
test('notification staff onboarding uses existing staff roles and atomic recipient selection', async t => {
  const url = new URL(process.env.DATABASE_URL || '')
  assert(['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '5477' && url.pathname === '/aidat_takip', 'Local demo DB only')
  const { prisma } = await import('./prisma')
  const { GET, POST } = await import('../app/api/push/staff/route')
  const { GET: memberships, PATCH: changeMembership } = await import('../app/api/push/staff-summary/route')
  const prefix = 'onboarding-' + randomBytes(6).toString('hex')
  const origin = 'http://127.0.0.1:3077'
  process.env.APP_ORIGIN = origin
  const password = randomBytes(16).toString('hex')
  const request = (method: string, id?: string, body?: unknown, requestOrigin = origin) => new NextRequest(origin + '/api/push/staff', {
    method, headers: { origin: requestOrigin, cookie: id ? 'auth-token=' + jwt.sign({ userId: id }, process.env.JWT_SECRET!, { expiresIn: '1h' }) : 'push-recipient-session=old-parent', 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const branches: string[] = []
  try {
    const a = await prisma.branch.create({ data: { name: prefix + '-a' } }); branches.push(a.id)
    const b = await prisma.branch.create({ data: { name: prefix + '-b' } }); branches.push(b.id)
    const admin = await prisma.user.create({ data: { name: prefix, email: prefix + '-admin@example.invalid', password: 'fixture', role: 'ADMIN', branchId: a.id } })
    const accountant = await prisma.user.create({ data: { name: prefix, email: prefix + '-accountant@example.invalid', password: 'fixture', role: 'ACCOUNTING', branchId: a.id } })
    const inactive = await prisma.user.create({ data: { name: prefix, email: prefix + '-inactive@example.invalid', password: 'fixture', role: 'ADMIN', branchId: a.id, isActive: false } })
    const body = { name: prefix + ' Personel', email: prefix + '-person@example.invalid', password, role: 'SECRETARY', branchId: a.id, groupIds: [], selectForNotifications: true }
    await t.test('parent, non-admin, inactive and foreign origin are denied', async () => {
      assert.equal((await POST(request('POST', undefined, body))).status, 401)
      assert.equal((await POST(request('POST', accountant.id, body))).status, 403)
      assert.equal((await GET(request('GET', accountant.id))).status, 403)
      assert.equal((await POST(request('POST', inactive.id, body))).status, 401)
      assert.equal((await POST(request('POST', admin.id, body, 'https://other.invalid'))).status, 403)
    })
    await t.test('options and writes respect branch scope, invalid data creates nothing', async () => {
      const options = await (await GET(request('GET', admin.id))).json()
      assert.equal(options.fixedBranchId, a.id)
      assert.deepEqual(options.branches.map((v: { id: string }) => v.id), [a.id])
      assert.equal((await POST(request('POST', admin.id, { ...body, branchId: b.id }))).status, 403)
      assert.equal((await POST(request('POST', admin.id, { ...body, branchId: null }))).status, 403)
      assert.equal((await POST(request('POST', admin.id, { ...body, role: 'PARENT' }))).status, 400)
      assert.equal((await POST(request('POST', admin.id, { ...body, role: 'TRAINER', groupIds: ['missing'] }))).status, 400)
      assert.equal(await prisma.user.count({ where: { email: body.email } }), 0)
    })
    await t.test('one save creates login and selected recipient without a device or summary membership', async () => {
      const response = await POST(request('POST', admin.id, body)); assert.equal(response.status, 201)
      const result = await response.json(); assert(result.staff.notificationRecipient.id)
      assert(!JSON.stringify(result).includes(password)); assert(!('password' in result.staff))
      const user = await prisma.user.findUniqueOrThrow({ where: { id: result.staff.id }, include: { notificationRecipient: { include: { devices: true } } } })
      assert.equal(user.branchId, a.id); assert.equal(user.role, 'SECRETARY'); assert(await bcrypt.compare(password, user.password))
      assert.equal(user.notificationRecipient!.staffPushEnabled, true); assert.equal(user.notificationRecipient!.devices.length, 0)
      assert.equal(await prisma.staffSummaryRecipient.count({ where: { recipientId: user.notificationRecipient!.id } }), 0)
      const duplicate = await POST(request('POST', admin.id, { ...body, email: body.email.toUpperCase() }))
      assert.equal(duplicate.status, 409); assert.equal(await prisma.user.count({ where: { email: body.email } }), 1)
    })
    await t.test('recipient checkbox is optional and parallel duplicate creation cannot leave an orphan', async () => {
      const plain = await POST(request('POST', admin.id, { ...body, email: prefix + '-plain@example.invalid', selectForNotifications: false }))
      assert.equal(plain.status, 201); assert.equal((await plain.json()).staff.notificationRecipient, null)
      const concurrent = { ...body, email: prefix + '-race@example.invalid' }
      const responses = await Promise.all([POST(request('POST', admin.id, concurrent)), POST(request('POST', admin.id, concurrent))])
      assert.deepEqual(responses.map(r => r.status).sort(), [201, 409])
      assert.equal(await prisma.user.count({ where: { email: concurrent.email } }), 1)
      assert.equal(await prisma.notificationRecipient.count({ where: { user: { email: concurrent.email } } }), 1)
    })
    await t.test('trainer group permissions are created only for active groups in the selected branch', async () => {
      const group = await prisma.group.create({ data: { name: prefix + '-group-a', branchId: a.id } })
      const foreign = await prisma.group.create({ data: { name: prefix + '-group-b', branchId: b.id } })
      const trainer = { ...body, role: 'TRAINER', email: prefix + '-trainer@example.invalid', groupIds: [group.id, group.id] }
      assert.equal((await POST(request('POST', admin.id, { ...trainer, groupIds: [foreign.id] }))).status, 400)
      const response = await POST(request('POST', admin.id, trainer)); assert.equal(response.status, 201)
      const result = await response.json()
      assert.deepEqual((await prisma.userGroupPermission.findMany({ where: { userId: result.staff.id } })).map(p => p.groupId), [group.id])
    })
    const globalAdmin = await prisma.user.create({ data: { name: prefix, email: prefix + '-global@example.invalid', password: 'fixture', role: 'ADMIN' } })
    const seedRecipient = await prisma.notificationRecipient.create({ data: { kind: 'STAFF', userId: accountant.id, staffPushEnabled: true } })
    const cursor = new Date('2026-10-19T06:01:00Z')
    const rule = await prisma.staffSummaryRule.create({ data: { name: prefix + '-monday', weekdays: [1], time: '09:00', enabled: true, branchId: a.id, createdById: admin.id, lastEvaluatedAt: cursor, recipients: { create: { recipientId: seedRecipient.id } } } })
    const foreignRule = await prisma.staffSummaryRule.create({ data: { name: prefix + '-foreign', weekdays: [1], time: '09:00', branchId: b.id, createdById: globalAdmin.id } })
    const otherDay = await prisma.staffSummaryRule.create({ data: { name: prefix + '-tuesday', weekdays: [2], time: '09:00', branchId: a.id, createdById: admin.id } })
    const summaryBody = { ...body, role: 'ACCOUNTING', email: prefix + '-summary@example.invalid', summaryRuleId: rule.id }
    await t.test('form offers Monday 09.00 rules only within manager scope', async () => {
      const options = await (await GET(request('GET', admin.id))).json()
      assert.deepEqual(options.summaryRules.map((r: { id: string }) => r.id), [rule.id])
    })
    await t.test('one save adds a financial recipient while preserving schedule, cursor and existing recipients', async () => {
      const response = await POST(request('POST', admin.id, summaryBody)); assert.equal(response.status, 201)
      const result = await response.json(); assert.equal(result.staff.summaryRule.id, rule.id)
      const saved = await prisma.staffSummaryRule.findUniqueOrThrow({ where: { id: rule.id }, include: { recipients: true } })
      assert.equal(saved.enabled, true); assert.equal(saved.time, '09:00'); assert.deepEqual(saved.weekdays, [1]); assert.equal(saved.lastEvaluatedAt.getTime(), cursor.getTime())
      assert.deepEqual(saved.recipients.map(r => r.recipientId).sort(), [seedRecipient.id, result.staff.notificationRecipient.id].sort())
      assert.equal(await prisma.pushDevice.count({ where: { recipientId: result.staff.notificationRecipient.id } }), 0)
      assert.equal(await prisma.staffSummaryRun.count({ where: { ruleId: rule.id } }), 0)
    })
    await t.test('invalid roles, disabled push, foreign or stale rules roll back the entire account', async () => {
      const invalid = { ...summaryBody, email: prefix + '-invalid-summary@example.invalid' }
      for (const role of ['SECRETARY', 'TRAINER']) assert.equal((await POST(request('POST', admin.id, { ...invalid, role }))).status, 400)
      assert.equal((await POST(request('POST', admin.id, { ...invalid, selectForNotifications: false }))).status, 400)
      for (const summaryRuleId of [foreignRule.id, otherDay.id, 'missing-rule']) assert.equal((await POST(request('POST', admin.id, { ...invalid, summaryRuleId }))).status, 409)
      assert.equal((await POST(request('POST', globalAdmin.id, { ...invalid, branchId: b.id }))).status, 400)
      await prisma.staffSummaryRule.update({ where: { id: otherDay.id }, data: { weekdays: [1], time: '09:01' } })
      assert.equal((await POST(request('POST', admin.id, { ...invalid, summaryRuleId: otherDay.id }))).status, 409)
      assert.equal(await prisma.user.count({ where: { email: invalid.email } }), 0)
    })
    await t.test('closed rule stays closed and parallel joins append without losing existing recipients', async () => {
      await prisma.staffSummaryRule.update({ where: { id: rule.id }, data: { enabled: false } })
      const results = await Promise.all([0, 1].map(i => POST(request('POST', admin.id, { ...summaryBody, email: prefix + '-join-' + i + '@example.invalid' }))))
      assert(results.every(r => r.status === 201))
      for (const r of results) assert.equal((await r.json()).staff.summaryRule.enabled, false)
      const saved = await prisma.staffSummaryRule.findUniqueOrThrow({ where: { id: rule.id }, include: { recipients: true } })
      assert.equal(saved.enabled, false); assert.equal(saved.recipients.length, 4); assert.equal(saved.lastEvaluatedAt.getTime(), cursor.getTime())
    })
    const change = (userId: string, receive: boolean, ruleId = rule.id, actor = admin.id) => changeMembership(request('PATCH', actor, { userId, ruleId, receive }))
    const secretary = await prisma.user.findUniqueOrThrow({ where: { email: body.email } })
    await t.test('inline membership reads and writes enforce financial manager, origin and scope', async () => {
      assert.equal((await memberships(request('GET'))).status, 401)
      assert.equal((await changeMembership(request('PATCH', secretary.id, { userId: accountant.id, ruleId: rule.id, receive: false }))).status, 403)
      assert.equal((await changeMembership(request('PATCH', undefined, { userId: accountant.id, ruleId: rule.id, receive: false }))).status, 401)
      assert.equal((await changeMembership(request('PATCH', admin.id, { userId: accountant.id, ruleId: rule.id, receive: false }, 'https://other.invalid'))).status, 403)
      const options = await (await memberships(request('GET', accountant.id))).json()
      assert.deepEqual(options.rules.map((r: { id: string }) => r.id), [rule.id])
      assert(options.rules[0].recipientIds.includes(seedRecipient.id))
      assert.equal((await change(accountant.id, true, foreignRule.id)).status, 409)
      assert.equal((await change(globalAdmin.id, true)).status, 404)
      assert.equal((await change(accountant.id, true, otherDay.id)).status, 409)
    })
    await t.test('accounting can toggle one existing recipient idempotently without altering rule or other members', async () => {
      const prior = await prisma.staffSummaryRecipient.findMany({ where: { ruleId: rule.id } })
      assert.equal((await change(accountant.id, false, rule.id, accountant.id)).status, 200)
      assert.equal((await change(accountant.id, false)).status, 200)
      assert.equal(await prisma.staffSummaryRecipient.count({ where: { ruleId: rule.id } }), prior.length - 1)
      const recipient = await prisma.notificationRecipient.findUniqueOrThrow({ where: { id: seedRecipient.id } })
      assert(recipient.staffPushEnabled && recipient.isActive)
      assert.equal((await change(accountant.id, true, rule.id, accountant.id)).status, 200)
      assert.equal((await change(accountant.id, true)).status, 200)
      const saved = await prisma.staffSummaryRule.findUniqueOrThrow({ where: { id: rule.id }, include: { recipients: true } })
      assert.deepEqual(saved.recipients.map(r => r.recipientId).sort(), prior.map(r => r.recipientId).sort())
      assert.equal(saved.enabled, false); assert.equal(saved.time, '09:00'); assert.deepEqual(saved.weekdays, [1]); assert.equal(saved.lastEvaluatedAt.getTime(), cursor.getTime())
    })
    await t.test('invalid targets cannot join but stale inactive selections can be removed', async () => {
      assert.equal((await change(secretary.id, true)).status, 400)
      assert.equal((await change(accountant.id, true, foreignRule.id, globalAdmin.id)).status, 400)
      await prisma.user.update({ where: { id: accountant.id }, data: { isActive: false } })
      assert.equal((await change(accountant.id, true)).status, 400)
      assert.equal((await change(accountant.id, false)).status, 200)
      await prisma.user.update({ where: { id: accountant.id }, data: { isActive: true } })
      await prisma.notificationRecipient.update({ where: { id: seedRecipient.id }, data: { staffPushEnabled: false } })
      assert.equal((await change(accountant.id, true)).status, 400)
      assert.equal((await change(accountant.id, false)).status, 200)
      await prisma.notificationRecipient.update({ where: { id: seedRecipient.id }, data: { staffPushEnabled: true } })
      assert.equal((await change(accountant.id, true)).status, 200)
    })
    await t.test('parallel single-member edits preserve others and removing last member does not disable the rule', async () => {
      const target = await prisma.user.findUniqueOrThrow({ where: { email: summaryBody.email }, include: { notificationRecipient: true } })
      const before = await prisma.staffSummaryRecipient.count({ where: { ruleId: rule.id } })
      assert((await Promise.all([change(target.id, false), change(accountant.id, true)])).every(r => r.status === 200))
      assert.equal(await prisma.staffSummaryRecipient.count({ where: { ruleId: rule.id } }), before - 1)
      assert((await Promise.all([change(target.id, true), change(target.id, true)])).every(r => r.status === 200))
      assert.equal(await prisma.staffSummaryRecipient.count({ where: { ruleId: rule.id } }), before)
      const single = await prisma.staffSummaryRule.create({ data: { name: prefix + '-single', weekdays: [1], time: '09:00', enabled: true, branchId: a.id, createdById: admin.id, lastEvaluatedAt: cursor, recipients: { create: { recipientId: seedRecipient.id } } } })
      assert.equal((await change(accountant.id, false, single.id)).status, 200)
      const saved = await prisma.staffSummaryRule.findUniqueOrThrow({ where: { id: single.id }, include: { recipients: true } })
      assert.equal(saved.recipients.length, 0); assert.equal(saved.enabled, true); assert.equal(saved.lastEvaluatedAt.getTime(), cursor.getTime())
      assert.equal(await prisma.staffSummaryRun.count({ where: { ruleId: single.id } }), 0)
    })
  } finally {
    await prisma.staffSummaryRule.deleteMany({ where: { createdBy: { email: { startsWith: prefix } } } })
    await prisma.notificationRecipient.deleteMany({ where: { user: { email: { startsWith: prefix } } } })
    await prisma.user.deleteMany({ where: { email: { startsWith: prefix } } })
    await prisma.group.deleteMany({ where: { name: { startsWith: prefix } } })
    await prisma.branch.deleteMany({ where: { id: { in: branches } } })
    await prisma.$disconnect()
  }
})
