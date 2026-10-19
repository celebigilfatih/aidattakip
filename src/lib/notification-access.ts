import { NextRequest, NextResponse } from 'next/server'
import { Prisma, User } from '@prisma/client'
import { ZodError } from 'zod'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { hashToken, NotificationError, recipientCookie } from './notification-policy'

export function requireSameOrigin(request: NextRequest) {
  const expected = process.env.APP_ORIGIN || request.nextUrl.origin
  if (request.headers.get('origin') !== expected) throw new NotificationError(403, 'İstek kaynağı doğrulanamadı.')
}
export async function staffUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token || !process.env.JWT_SECRET) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (typeof payload === 'string' || typeof payload.userId !== 'string') return null
    return prisma.user.findFirst({ where: { id: payload.userId, isActive: true } })
  } catch { return null }
}
export async function requireManager(request: NextRequest, adminOnly = false) {
  const user = await staffUser(request)
  if (!user) throw new NotificationError(401, 'Giriş yapmalısınız.')
  if (user.role !== 'ADMIN' && (adminOnly || user.role !== 'ACCOUNTING')) throw new NotificationError(403, 'Bildirim yönetimi yetkiniz yok.')
  return user
}
export function studentScope(user: User): Prisma.StudentWhereInput {
  return user.branchId ? { branchId: user.branchId } : {}
}
export function recipientScope(user: User): Prisma.NotificationRecipientWhereInput {
  if (!user.branchId) return {}
  return { OR: [{ user: { branchId: user.branchId } }, { student: { branchId: user.branchId } }, { parent: { students: { some: { branchId: user.branchId } } } }] }
}
export function notificationScope(user: User): Prisma.NotificationWhereInput {
  if (!user.branchId) return {}
  return { OR: [{ student: { branchId: user.branchId } }, { recipient: recipientScope(user) }] }
}
export async function pushActor(request: NextRequest) {
  const user = await staffUser(request)
  if (!user) throw new NotificationError(401, 'Personel girişi gerekli.')
  const recipient = await prisma.notificationRecipient.findUnique({ where: { userId: user.id } })
  return { recipientId: recipient?.id ?? null, sessionHash: hashToken(request.cookies.get('auth-token')!.value), sessionId: null, staff: user }
}
export async function ensureActorRecipient(request: NextRequest) {
  const actor = await pushActor(request)
  const recipient = actor.recipientId ? await prisma.notificationRecipient.findUnique({ where: { id: actor.recipientId } }) : null
  if (!recipient?.isActive || !recipient.staffPushEnabled || recipient.kind !== 'STAFF') throw new NotificationError(403, 'Bildirim alıcısı olarak yöneticiniz tarafından seçilmelisiniz.')
  return actor as typeof actor & { recipientId: string }
}
export function notificationResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } })
}
export function notificationFailure(error: unknown) {
  if (error instanceof NotificationError) return notificationResponse({ error: error.message }, error.status)
  if (error instanceof ZodError || error instanceof SyntaxError) return notificationResponse({ error: 'Alanları ve seçimleri kontrol edin.' }, 400)
  // Never log notification payloads, tokens, endpoints or provider response bodies.
  return notificationResponse({ error: 'Bildirim işlemi tamamlanamadı.' }, 500)
}
