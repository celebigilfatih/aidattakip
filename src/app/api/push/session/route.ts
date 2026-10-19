import { NextRequest } from 'next/server'
import { notificationFailure, notificationResponse, pushActor, requireSameOrigin } from '@/lib/notification-access'
import { prisma } from '@/lib/prisma'
import { recipientCookie } from '@/lib/notification-policy'

export async function GET(request: NextRequest) {
  try {
    const actor = await pushActor(request)
    const recipient = actor.recipientId ? await prisma.notificationRecipient.findUnique({ where: { id: actor.recipientId }, include: { parent: { include: { students: { select: { id: true, isActive: true } } } }, student: true, user: true } }) : null
    const name = recipient?.parent ? `${recipient.parent.firstName} ${recipient.parent.lastName}`
      : recipient?.student ? `${recipient.student.firstName} ${recipient.student.lastName}` : actor.staff?.name ?? recipient?.user?.name
    const devices = actor.recipientId ? await prisma.pushDevice.findMany({ where: { recipientId: actor.recipientId, sessionHash: actor.sessionHash, isActive: true }, select: { id: true, label: true, expiresAt: true } }) : []
    const studentIds = recipient?.kind === 'PARENT' ? recipient.parent?.students.filter(s => s.isActive).map(s => s.id) ?? [] : recipient?.kind === 'STUDENT' && recipient.student?.isActive ? [recipient.student.id] : []
    const notifications = actor.recipientId ? await prisma.notification.findMany({ where: { status: { in: ['SENT', 'ACCEPTED'] }, OR: [
      { recipientId: actor.recipientId },
      ...(studentIds.length ? [{ recipientId: null, method: 'IN_APP' as const, studentId: { in: studentIds } }] : []),
    ] }, select: { id: true, title: true, message: true, sentAt: true }, orderBy: { createdAt: 'desc' }, take: 30 }) : []
    return notificationResponse({ name, kind: recipient?.kind ?? 'STAFF', devices, notifications })
  } catch (error) { return notificationFailure(error) }
}
export async function DELETE(request: NextRequest) {
  try {
    requireSameOrigin(request)
    const actor = await pushActor(request)
    await prisma.$transaction(async tx => {
      await tx.pushDevice.updateMany({ where: { sessionHash: actor.sessionHash }, data: { isActive: false } })
      if (actor.sessionId) await tx.recipientSession.delete({ where: { id: actor.sessionId } })
    })
    const response = notificationResponse({ success: true })
    response.cookies.set(recipientCookie, '', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 })
    return response
  } catch (error) { return notificationFailure(error) }
}
