import { NextRequest } from 'next/server'
import { Prisma, type User } from '@prisma/client'
import { prisma } from './prisma'
import { staffUser, requireSameOrigin, notificationResponse } from './notification-access'
import { NotificationError } from './notification-policy'
import { ZodError } from 'zod'

export type ClubDB = Prisma.TransactionClient
export const finance = (u: Pick<User, 'role'>) => ['ADMIN', 'ACCOUNTING'].includes(u.role)
export const registrar = (u: Pick<User, 'role'>) => ['ADMIN', 'SECRETARY'].includes(u.role)
export function requireRole(u: User, roles: string[]) {
  if (!roles.includes(u.role)) throw new NotificationError(403, 'Bu işlem için yetkiniz yok.')
}
export async function clubActor(request: NextRequest, roles = ['ADMIN', 'ACCOUNTING', 'SECRETARY', 'TRAINER']) {
  const user = await staffUser(request)
  if (!user) throw new NotificationError(401, 'Personel girişi gerekli.')
  requireRole(user, roles)
  if (!user.branchId && user.role !== 'ADMIN') throw new NotificationError(403, 'Hesabınıza şube atanmalıdır.')
  if (request.method !== 'GET') requireSameOrigin(request)
  return user
}
export function branchScope(user: User) { return user.branchId ? { branchId: user.branchId } : {} }
export async function checkBranch(db: ClubDB, user: User, branchId: string | null) {
  if (!branchId) throw new NotificationError(400, 'Önce şube atayın.')
  if (user.branchId && branchId !== user.branchId) throw new NotificationError(403, 'Bu şubeye erişiminiz yok.')
  if (!await db.branch.findFirst({ where: { id: branchId, isActive: true } })) throw new NotificationError(400, 'Aktif şube seçin.')
  return branchId
}
export async function checkGroup(db: ClubDB, user: User, id: string, branchId: string) {
  const group = await db.group.findFirst({ where: { id, branchId, isActive: true } })
  if (!group) throw new NotificationError(400, 'Grup aktif ve aynı şubede olmalıdır.')
  if (user.role === 'TRAINER' && !await db.userGroupPermission.findUnique({ where: { userId_groupId: { userId: user.id, groupId: id } } })) throw new NotificationError(403, 'Bu gruba erişiminiz yok.')
  return group
}
export async function scopedStudents(user: User, db: ClubDB = prisma): Promise<Prisma.StudentWhereInput> {
  return { ...branchScope(user), ...(user.role === 'TRAINER' ? { groupId: { in: (await db.userGroupPermission.findMany({ where: { userId: user.id }, select: { groupId: true } })).map(g => g.groupId) } } : {}) }
}
// Re-read and lock the actor inside a mutation, so stale role/branch claims cannot authorize writes.
export async function liveActor(db: ClubDB, actor: User) {
  await db.$queryRaw`SELECT id FROM users WHERE id = ${actor.id} FOR SHARE`
  const current = await db.user.findUnique({ where: { id: actor.id } })
  if (!current?.isActive || current.role !== actor.role || current.branchId !== actor.branchId) throw new NotificationError(403, 'Yetkiniz değişti. Yeniden giriş yapın.')
}
export function clubFailure(error: unknown) {
  if (error instanceof NotificationError) return notificationResponse({ error: error.message }, error.status)
  if (error instanceof ZodError || error instanceof SyntaxError) return notificationResponse({ error: 'Alanları ve tarihleri kontrol edin.' }, 400)
  if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) return notificationResponse({ error: 'Kayıt eşzamanlı değişti. Listeyi yenileyin.' }, 409)
  console.error('Club operation failed', error instanceof Error ? error.name : 'Unknown')
  return notificationResponse({ error: 'İşlem tamamlanamadı. Yeniden deneyin.' }, 500)
}
export { notificationResponse as clubResponse }
