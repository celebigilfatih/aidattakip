import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes, createECDH } from 'node:crypto'
import { loadEnvConfig } from '@next/env'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import webpush from 'web-push'
loadEnvConfig(process.cwd())

test('manual notifications: scope, one-use invites, device ownership, real dispatch adapter and idempotent claim', async () => {
  const url = new URL(process.env.DATABASE_URL || '')
  assert(['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '5477' && url.pathname === '/aidat_takip', 'Integration suite only runs on the local demo DB')
  const { prisma } = await import('./prisma')
  const { POST: enroll, DELETE: revoke } = await import('../app/api/push/recipients/route')
  const { POST: activate } = await import('../app/api/push/activate/route')
  const { POST: subscribe } = await import('../app/api/push/subscription/route')
  const { GET: me, DELETE: logout } = await import('../app/api/push/session/route')
  const { POST: create, GET: list } = await import('../app/api/notifications/route')
  const { PUT: edit } = await import('../app/api/notifications/[id]/route')
  const { POST: send } = await import('../app/api/notifications/[id]/send/route')
  const { POST: bulk } = await import('../app/api/notifications/bulk/route')
  const { GET: scheduled } = await import('../app/api/notifications/process-scheduled/route')
  const prefix = 'push-test-' + randomBytes(5).toString('hex')
  const origin = 'http://127.0.0.1:3077'
  process.env.APP_ORIGIN = origin
  const keys = webpush.generateVAPIDKeys()
  process.env.VAPID_PUBLIC_KEY = keys.publicKey; process.env.VAPID_PRIVATE_KEY = keys.privateKey; process.env.VAPID_SUBJECT = 'https://aidat.spormanage.com.tr'
  const originalSend = webpush.sendNotification
  let sent = 0
  webpush.sendNotification = async (_subscription, payload) => {
    sent++
    assert(!String(payload).includes('Özel borç ayrıntısı'), 'Lock-screen payload is generic')
    await new Promise(resolve => setTimeout(resolve, 30))
    return { statusCode: 201, body: '', headers: {} }
  }
  const ids: string[] = [], branches: string[] = [], students: string[] = [], parents: string[] = [], groups: string[] = [], trainers: string[] = []
  const req = (path: string, method: string, cookie = '', body?: unknown, customOrigin = origin) => new NextRequest(origin + path, { method, headers: { origin: customOrigin, cookie, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  const token = (id: string, role = 'ADMIN') => 'auth-token=' + jwt.sign({ userId: id, email: 'test@example.invalid', role, name: 'Test' }, process.env.JWT_SECRET!, { expiresIn: '1h' })
  const context = (id: string) => ({ params: Promise.resolve({ id }) })
  try {
    const a = await prisma.branch.create({ data: { name: prefix + '-a' } }), b = await prisma.branch.create({ data: { name: prefix + '-b' } }); branches.push(a.id, b.id)
    const admin = await prisma.user.create({ data: { email: prefix + '@example.invalid', name: 'Test', password: 'not-a-login-password', role: 'ADMIN', branchId: a.id } }); ids.push(admin.id)
    const trainer = await prisma.user.create({ data: { email: prefix + '-trainer@example.invalid', name: 'Test', password: 'not-a-login-password', role: 'TRAINER', branchId: a.id } }); ids.push(trainer.id)
    const trainerProfile = await prisma.trainer.create({ data: { name: prefix, position: 'Test antrenör', experience: 0 } }); trainers.push(trainerProfile.id)
    await prisma.user.update({ where: { id: trainer.id }, data: { trainerId: trainerProfile.id } })
    const p = await prisma.parent.create({ data: { firstName: prefix, lastName: 'Veli', phone: '+900000000000', relationship: 'Diğer' } }); parents.push(p.id)
    const group = await prisma.group.create({ data: { name: prefix, branchId: a.id } }); groups.push(group.id)
    for (const [branchId, suffix] of [[a.id, 'a'], [b.id, 'b']]) {
      const s = await prisma.student.create({ data: { firstName: prefix, lastName: suffix, createdById: admin.id, branchId, groupId: branchId === a.id ? group.id : null, parents: branchId === a.id ? { connect: { id: p.id } } : undefined } }); students.push(s.id)
    }
    const adminCookie = token(admin.id)
    assert.equal((await enroll(req('/api/push/recipients', 'POST', token(trainer.id, 'TRAINER'), { kind: 'PARENT', identityId: p.id, verified: true }))).status, 403)
    assert.equal((await enroll(req('/api/push/recipients', 'POST', adminCookie, { kind: 'STUDENT', identityId: students[1], verified: true }))).status, 404)
    assert.equal((await enroll(req('/api/push/recipients', 'POST', adminCookie, { kind: 'PARENT', identityId: p.id, verified: true }, 'https://evil.test'))).status, 403)
    const inviteResponse = await enroll(req('/api/push/recipients', 'POST', adminCookie, { kind: 'PARENT', identityId: p.id, verified: true }))
    assert.equal(inviteResponse.status, 201)
    const invite = await inviteResponse.json(), raw = new URL(invite.inviteUrl).hash.slice('#invite='.length)
    const storedInvite = await prisma.pushInvite.findFirstOrThrow({ where: { recipientId: invite.recipientId } })
    assert.notEqual(storedInvite.tokenHash, raw)
    const activations = await Promise.all([activate(req('/api/push/activate', 'POST', '', { token: raw })), activate(req('/api/push/activate', 'POST', '', { token: raw }))])
    assert.equal(activations.filter(r => r.status === 200).length, 1)
    const recipientCookie = activations.find(r => r.status === 200)!.headers.get('set-cookie')!.split(';')[0]
    const identity = await (await me(req('/api/push/session', 'GET', recipientCookie))).json()
    assert.equal(identity.kind, 'PARENT')
    assert.equal((await create(req('/api/notifications', 'POST', recipientCookie, {}))).status, 401)
    const subscription = { endpoint: 'https://web.push.apple.com/' + prefix, keys: { p256dh: createECDH('prime256v1').generateKeys().toString('base64url'), auth: randomBytes(16).toString('base64url') }, label: 'Test iPhone' }
    const deviceResponse = await subscribe(req('/api/push/subscription', 'POST', recipientCookie, subscription)); assert.equal(deviceResponse.status, 200)
    const device = await deviceResponse.json()
    assert.equal((await subscribe(req('/api/push/subscription', 'POST', recipientCookie, { ...subscription, endpoint: 'https://127.0.0.1/secret' }))).status, 400)
    const staffAttempt = await subscribe(req('/api/push/subscription', 'POST', adminCookie, subscription)); assert.equal(staffAttempt.status, 409)
    const base = { title: 'Test', message: 'Özel borç ayrıntısı', method: 'PUSH', type: 'GENERAL_ANNOUNCEMENT', recipientType: 'recipient', recipientId: invite.recipientId, targetDeviceId: device.id }
    const future = await (await create(req('/api/notifications', 'POST', adminCookie, { ...base, scheduledAt: '2099-01-01T10:00:00+03:00' }))).json()
    assert.equal((await send(req('/api/notifications/' + future.id + '/send', 'POST', adminCookie), context(future.id))).status, 409)
    assert.equal(sent, 0)
    const created = await create(req('/api/notifications', 'POST', adminCookie, base)); assert.equal(created.status, 201)
    const notification = await created.json()
    const outcomes = await Promise.all([send(req('/api/notifications/' + notification.id + '/send', 'POST', adminCookie), context(notification.id)), send(req('/api/notifications/' + notification.id + '/send', 'POST', adminCookie), context(notification.id))])
    assert.equal(outcomes.filter(r => r.status === 200).length, 1); assert.equal(sent, 1)
    assert.equal((await prisma.notification.findUniqueOrThrow({ where: { id: notification.id } })).status, 'ACCEPTED')
    const inbox = await (await me(req('/api/push/session', 'GET', recipientCookie))).json(); assert.equal(inbox.notifications[0].message, base.message)
    const email = await (await create(req('/api/notifications', 'POST', adminCookie, { ...base, method: 'EMAIL', recipientEmail: 'test@example.invalid' }))).json()
    const batchResponse = await bulk(req('/api/notifications/bulk', 'POST', adminCookie, { notificationIds: [email.id], action: 'send' })); const batch = await batchResponse.json()
    assert.equal(batch.failed, 1); assert.equal((await prisma.notification.findUniqueOrThrow({ where: { id: email.id } })).status, 'PENDING')
    const inapp = { title: 'Test', message: 'Test', method: 'IN_APP', type: 'GENERAL_ANNOUNCEMENT', recipientType: 'groups', groupId: group.id, studentId: 'all', scheduledAt: '2026-12-01T10:00:00+03:00' }
    const groupResult = await (await create(req('/api/notifications', 'POST', adminCookie, inapp))).json(); assert.equal(groupResult.count, 1)
    assert.equal((await edit(req('/api/notifications/' + groupResult.ids[0], 'PUT', adminCookie, { ...inapp, scheduledAt: null }), context(groupResult.ids[0]))).status, 200)
    assert.equal((await prisma.notification.findUniqueOrThrow({ where: { id: groupResult.ids[0] } })).scheduledAt, null)
    const listing = await (await list(req('/api/notifications', 'GET', adminCookie))).json(); assert('scheduledAt' in listing.notifications[0] && 'sentAt' in listing.notifications[0])
    const trainerResult = await (await create(req('/api/notifications', 'POST', adminCookie, { ...inapp, recipientType: 'trainers', trainerId: trainerProfile.id, scheduledAt: null }))).json()
    assert.equal(trainerResult.count, 1)
    const trainerMessage = await prisma.notification.findUniqueOrThrow({ where: { id: trainerResult.ids[0] }, include: { recipient: true } })
    assert.equal(trainerMessage.studentId, null); assert.equal(trainerMessage.recipient?.userId, trainer.id)
    assert.equal((await list(req('/api/notifications?status=invalid', 'GET', adminCookie))).status, 400)
    assert.equal((await scheduled()).status, 405)
    await logout(req('/api/push/session', 'DELETE', recipientCookie))
    assert.equal((await me(req('/api/push/session', 'GET', recipientCookie))).status, 401)
    assert.equal((await prisma.pushDevice.findUniqueOrThrow({ where: { id: device.id } })).isActive, false)
    await revoke(req('/api/push/recipients', 'DELETE', adminCookie, { id: invite.recipientId }))
  } finally {
    webpush.sendNotification = originalSend
    await prisma.notification.deleteMany({ where: { createdById: { in: ids } } })
    await prisma.notificationRecipient.deleteMany({ where: { OR: [{ userId: { in: ids } }, { parentId: { in: parents } }, { studentId: { in: students } }] } })
    await prisma.student.deleteMany({ where: { id: { in: students } } }); await prisma.parent.deleteMany({ where: { id: { in: parents } } })
    await prisma.group.deleteMany({ where: { id: { in: groups } } }); await prisma.user.deleteMany({ where: { id: { in: ids } } }); await prisma.trainer.deleteMany({ where: { id: { in: trainers } } }); await prisma.branch.deleteMany({ where: { id: { in: branches } } })
    await prisma.$disconnect()
  }
})
