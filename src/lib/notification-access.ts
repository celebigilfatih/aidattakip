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
  // A recipient browser session never grants staff permissions, even when a staff cookie also exists.
  const token = request.cookies.get(recipientCookie)?.value
  if (token) {
    const session = await prisma.recipientSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { recipient: { include: { student: true, parent: { include: { students: { where: { isActive: true }, select: { id: true }, take: 1 } } } } } } })
    const identityActive = session?.recipient.kind === 'STUDENT' ? session.recipient.student?.isActive : !!session?.recipient.parent?.students.length
    if (session && session.expiresAt > new Date() && session.recipient.isActive && identityActive) {
      return { recipientId: session.recipientId, sessionHash: session.tokenHash, sessionId: session.id, staff: null }
    }
    throw new NotificationError(401, 'Alıcı oturumunuz sona erdi; yeni davet isteyin.')
  }
  const user = await staffUser(request)
  if (!user) throw new NotificationError(401, 'Alıcı veya personel girişi gerekli.')
  const recipient = await prisma.notificationRecipient.findUnique({ where: { userId: user.id } })
  if (recipient && !recipient.isActive) throw new NotificationError(403, 'Alıcı kaydınız pasif; kulüp yöneticisine başvurun.')
  return { recipientId: recipient?.id ?? null, sessionHash: hashToken(request.cookies.get('auth-token')!.value), sessionId: null, staff: user }
}
export async function ensureActorRecipient(request: NextRequest) {
  const actor = await pushActor(request)
  if (!actor.recipientId && actor.staff) {
    const recipient = await prisma.notificationRecipient.upsert({ where: { userId: actor.staff.id }, update: {}, create: { kind: 'STAFF', userId: actor.staff.id } })
    actor.recipientId = recipient.id
  }
  if (!actor.recipientId) throw new NotificationError(401, 'Alıcı bulunamadı.')
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
