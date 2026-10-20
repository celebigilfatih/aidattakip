import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { branchScope, clubActor, clubFailure, clubResponse, liveActor } from '@/lib/club-access'
import { familySchema, listFamilies, saveFamily } from '@/lib/family-service'
import { NotificationError } from '@/lib/notification-policy'

export async function GET(request: NextRequest) {
  try { const u = await clubActor(request, ['ADMIN', 'ACCOUNTING', 'SECRETARY']); return clubResponse({ families: await listFamilies(u, request.nextUrl.searchParams.get('archived') === 'true') }) }
  catch (e) { return clubFailure(e) }
}
export async function POST(request: NextRequest) {
  try { const u = await clubActor(request, ['ADMIN', 'SECRETARY']); return clubResponse(await saveFamily(u, familySchema.parse(await request.json())), 201) }
  catch (e) { return clubFailure(e) }
}
export async function PATCH(request: NextRequest) {
  try {
    const u = await clubActor(request, ['ADMIN', 'SECRETARY'])
    const input = z.object({ id: z.string(), action: z.enum(['archive', 'restore']), expected: z.string() }).strict().parse(await request.json())
    const saved = await prisma.$transaction(async tx => {
      await liveActor(tx, u)
      await tx.$queryRaw`SELECT id FROM families WHERE id = ${input.id} FOR UPDATE`
      const f = await tx.family.findFirst({ where: { id: input.id, ...branchScope(u) } })
      if (!f) throw new NotificationError(404, 'Aile bulunamadı.')
      if (f.updatedAt.toISOString() !== input.expected) throw new NotificationError(409, 'Aile değişti. Listeyi yenileyin.')
      return tx.family.update({ where: { id: f.id }, data: { archivedAt: input.action === 'archive' ? new Date() : null } })
    })
    return clubResponse(saved)
  } catch (e) { return clubFailure(e) }
}
