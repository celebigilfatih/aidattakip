import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { branchScope, clubActor, clubFailure, clubResponse, finance, scopedStudents } from '@/lib/club-access'

export async function GET(request: NextRequest) {
  try {
    const u = await clubActor(request), scope = await scopedStudents(u)
    const groupScope = { ...branchScope(u), ...(u.role === 'TRAINER' ? { id: { in: (await prisma.userGroupPermission.findMany({ where: { userId: u.id } })).map(g => g.groupId) } } : {}) }
    const [branches, groups, students, fees, sessions] = await Promise.all([
      prisma.branch.findMany({ where: { isActive: true, ...(u.branchId ? { id: u.branchId } : {}) }, select: { id: true, name: true } }),
      prisma.group.findMany({ where: { ...groupScope, isActive: true }, select: { id: true, name: true, branchId: true } }),
      prisma.student.findMany({ where: scope, select: { id: true, firstName: true, lastName: true, branchId: true, groupId: true, familyId: true, isActive: true }, orderBy: [{ lastName: 'asc' }, { id: 'asc' }] }),
      finance(u) ? prisma.feeType.findMany({ where: { isActive: true, ...(u.branchId ? { OR: [{ groupId: null }, { group: { branchId: u.branchId } }] } : {}) }, select: { id: true, name: true, amount: true, period: true, groupId: true } }) : [],
      prisma.trainingSession.findMany({ where: { group: groupScope, status: { not: 'CANCELLED' }, date: { gte: new Date(Date.now() - 30 * 86400000), lte: new Date(Date.now() + 90 * 86400000) } }, select: { id: true, groupId: true, date: true, startTime: true, group: { select: { name: true } } }, orderBy: { date: 'asc' }, take: 300 }),
    ])
    return clubResponse({ branches, groups, students, fees, sessions, role: u.role, branchId: u.branchId })
  } catch (e) { return clubFailure(e) }
}
