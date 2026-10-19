import test from 'node:test'
import assert from 'node:assert/strict'
import { createECDH, randomBytes } from 'node:crypto'
import { hashToken, messageSchema, parseSchedule, validatePushEndpoint, validateSubscription } from './notification-policy'

test('push rejects private/arbitrary hosts, deceptive subdomains, credentials, ports and malformed keys', () => {
  for (const endpoint of ['http://web.push.apple.com/a', 'https://127.0.0.1/a', 'https://fcm.googleapis.com.evil.test/a', 'https://evil.test/a', 'https://u:p@web.push.apple.com/a', 'https://web.push.apple.com:8443/a', 'https://web.push.apple.com/a#secret']) {
    assert.throws(() => validatePushEndpoint(endpoint))
  }
  for (const endpoint of ['https://web.push.apple.com/a', 'https://fcm.googleapis.com/fcm/send/a', 'https://updates.push.services.mozilla.com/wpush/v2/a']) assert.equal(validatePushEndpoint(endpoint), endpoint)
  const p256dh = createECDH('prime256v1').generateKeys().toString('base64url'), auth = randomBytes(16).toString('base64url')
  assert.equal(validateSubscription({ endpoint: 'https://web.push.apple.com/test', keys: { p256dh, auth } }).label, 'Cihazım')
  assert.throws(() => validateSubscription({ endpoint: 'https://web.push.apple.com/test', keys: { p256dh: Buffer.alloc(65).toString('base64url'), auth } }))
})
test('schedule preserves offset, permits clearing, rejects naive/invalid dates; tokens are hashed', () => {
  assert.equal(parseSchedule('2026-10-19T10:00:00+03:00')?.toISOString(), '2026-10-19T07:00:00.000Z')
  assert.equal(parseSchedule(''), null)
  assert.equal(parseSchedule(null), null)
  for (const raw of ['2026-10-19T10:00', 'garbage', '2026-02-30T10:00:00Z']) assert.throws(() => parseSchedule(raw))
  assert.equal(hashToken('test').length, 64)
  assert.notEqual(hashToken('test'), 'test')
})
test('message limits and explicit recipient types prevent malformed bulk input', () => {
  const base = { title: 'Test', message: 'İçerik', method: 'IN_APP', type: 'GENERAL_ANNOUNCEMENT' }
  assert.equal(messageSchema.parse(base).recipientType, 'students')
  assert.throws(() => messageSchema.parse({ ...base, title: ' ' }))
  assert.throws(() => messageSchema.parse({ ...base, message: 'x'.repeat(2001) }))
  assert.throws(() => messageSchema.parse({ ...base, recipientType: 'everyone-on-internet' }))
})
