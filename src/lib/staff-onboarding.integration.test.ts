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
  } finally {
    await prisma.notificationRecipient.deleteMany({ where: { user: { email: { startsWith: prefix } } } })
    await prisma.user.deleteMany({ where: { email: { startsWith: prefix } } })
    await prisma.group.deleteMany({ where: { name: { startsWith: prefix } } })
    await prisma.branch.deleteMany({ where: { id: { in: branches } } })
    await prisma.$disconnect()
  }
})
