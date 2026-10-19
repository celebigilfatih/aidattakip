import { z } from 'zod'
import { createHash } from 'node:crypto'

export class NotificationError extends Error {
  constructor(public status: number, message: string) { super(message) }
}
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
export const inviteLifetime = 24 * 60 * 60 * 1000
export const recipientLifetime = 7 * 24 * 60 * 60 * 1000
export const recipientCookie = 'push-recipient-session'

export const messageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(2000),
  type: z.enum(['PAYMENT_REMINDER', 'PAYMENT_OVERDUE', 'ATTENDANCE_REMINDER', 'GENERAL_ANNOUNCEMENT', 'TRAINING_CANCELLED']),
  method: z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH']),
  recipientType: z.enum(['students', 'groups', 'trainers', 'recipient']).default('students'),
  studentId: z.string().max(100).optional(), groupId: z.string().max(100).optional(), trainerId: z.string().max(100).optional(),
  recipientId: z.string().max(100).optional(), targetDeviceId: z.string().max(100).optional(),
  scheduledAt: z.string().max(50).nullable().optional(),
  recipientEmail: z.union([z.email(), z.literal('')]).optional(), recipientPhone: z.string().max(30).optional(),
})
export function parseSchedule(value?: string | null) {
  if (!value) return null
  if (!z.iso.datetime({ offset: true }).safeParse(value).success) {
    throw new NotificationError(400, 'Zamanlama saat dilimi içeren geçerli bir tarih olmalıdır.')
  }
  return new Date(value)
}
// Only fixed browser push-service hosts are accepted; arbitrary HTTPS targets are not push subscriptions.
export function validatePushEndpoint(raw: string) {
  let url: URL
  try { url = new URL(raw) } catch { throw new NotificationError(400, 'Geçersiz push adresi.') }
  const host = url.hostname.toLowerCase()
  const allowed = host === 'fcm.googleapis.com' || host === 'updates.push.services.mozilla.com'
    || host === 'web.push.apple.com' || /^[a-z0-9-]+\.push\.apple\.com$/.test(host)
    || host === 'wns2-par02p.notify.windows.com' || /^[a-z0-9-]+\.notify\.windows\.com$/.test(host)
  if (url.protocol !== 'https:' || url.port || url.username || url.password || url.hash || !allowed || raw.length > 2048) {
    throw new NotificationError(400, 'Desteklenmeyen push servisi adresi.')
  }
  return url.toString()
}
export const subscriptionSchema = z.object({
  endpoint: z.string().max(2048),
  keys: z.object({ p256dh: z.string().regex(/^[A-Za-z0-9_-]{87}={0,2}$/), auth: z.string().regex(/^[A-Za-z0-9_-]{22}={0,2}$/) }),
  label: z.string().trim().min(1).max(80).default('Cihazım'),
})
export function validateSubscription(input: unknown) {
  const data = subscriptionSchema.parse(input)
  const p256dh = Buffer.from(data.keys.p256dh, 'base64url')
  if (p256dh.length !== 65 || p256dh[0] !== 4 || Buffer.from(data.keys.auth, 'base64url').length !== 16) {
    throw new NotificationError(400, 'Geçersiz cihaz anahtarı.')
  }
  return { ...data, endpoint: validatePushEndpoint(data.endpoint) }
}

