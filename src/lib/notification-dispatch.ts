import webpush from 'web-push'
import { prisma } from './prisma'
import { financialRole } from './staff-summary-policy'
import { getStaffOverdue } from './staff-overdue'
import { hashToken, NotificationError, validatePushEndpoint } from './notification-policy'

export function pushConfiguration() {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT
  return publicKey && privateKey && subject ? { publicKey, privateKey, subject } : null
}

export async function dispatchNotification(id: string) {
  const notification = await prisma.notification.findUnique({ where: { id }, include: { recipient: { include: { user: true, student: true, parent: { include: { students: true } } } }, targetDevice: true, createdBy: true } })
  if (!notification) throw new NotificationError(404, 'Bildirim bulunamadı.')
  if (notification.status !== 'PENDING') throw new NotificationError(409, 'Yalnız bekleyen bildirim gönderilebilir; tekrar gönderim için yeni kayıt oluşturun.')
  if (notification.scheduledAt && notification.scheduledAt > new Date()) throw new NotificationError(409, 'Bildirim ileri tarihe planlı; önce zamanı kaldırın veya bekleyin.')
  if (notification.method === 'EMAIL' || notification.method === 'SMS') throw new NotificationError(409, 'Bu kanalın gerçek gönderim sağlayıcısı henüz yapılandırılmadı. Gönderildi olarak işaretlenmedi.')
  const config = pushConfiguration()
  const device = notification.targetDevice
  if (notification.method === 'PUSH') {
    if (!config) throw new NotificationError(503, 'Web Push runtime anahtarları eksik.')
    const recipient = notification.recipient
    const sender = notification.createdBy
    if (!sender.isActive || !financialRole(sender.role) || recipient?.kind !== 'STAFF' || !recipient.staffPushEnabled || !recipient.isActive || !recipient.user?.isActive
      || (sender.branchId && recipient.user.branchId !== sender.branchId)
      || !device?.isActive || device.recipientId !== recipient.id || device.expiresAt <= new Date()) {
      throw new NotificationError(409, 'Seçili aktif personel ve geçerli cihaz gerekli.')
    }
    if (!financialRole(recipient.user.role) && notification.type !== 'GENERAL_ANNOUNCEMENT') throw new NotificationError(403, 'Bu personel yalnız genel duyuru alabilir.')
    if (notification.isFeeSummary) {
      if (!financialRole(recipient.user.role)) throw new NotificationError(403, 'Mali özet yetkisi gerekli.')
      if (notification.summaryRunId) {
        const run = await prisma.staffSummaryRun.findUnique({ where: { id: notification.summaryRunId }, include: { rule: { include: { recipients: true } } } })
        if (!run || run.rule.archivedAt || (run.kind === 'AUTOMATIC' && !run.rule.enabled) || !run.rule.recipients.some(r => r.recipientId === recipient.id)) throw new NotificationError(409, 'Kural kapalı veya alıcı kaldırıldı.')
      }
      const branchId = notification.summaryBranchId
      if ((sender.branchId && sender.branchId !== branchId) || (recipient.user.branchId && recipient.user.branchId !== branchId)) throw new NotificationError(403, 'Özet şube kapsamı değişti.')
      if (!(await getStaffOverdue(prisma, branchId)).paymentCount) {
        await prisma.notification.updateMany({ where: { id, status: 'PENDING' }, data: { status: 'CANCELLED' } })
        return { id, status: 'SKIPPED', message: 'Gecikmiş açık borç kalmadı.' }
      }
    }
    validatePushEndpoint(device.endpoint)
  }
  const claimed = await prisma.notification.updateMany({ where: { id, status: 'PENDING' }, data: { status: 'PROCESSING' } })
  if (!claimed.count) throw new NotificationError(409, 'Bildirim başka bir işlem tarafından alındı.')
  if (notification.method === 'IN_APP') {
    return prisma.notification.update({ where: { id }, data: { status: 'SENT', sentAt: new Date() } })
  }
  // A unique delivery and the atomic claim prevent parallel/repeated dispatch of one record.
  const delivery = await prisma.pushDelivery.create({ data: { notificationId: id, deviceId: device!.id } })
  let statusCode: number | null = null
  let accepted = false
  try {
    const result = await webpush.sendNotification({ endpoint: device!.endpoint, keys: { p256dh: device!.p256dh, auth: device!.auth } }, JSON.stringify({
      title: 'SporManage', body: 'Yeni bir bildiriminiz var. Ayrıntıları güvenli alıcı ekranından görüntüleyin.',
      notificationId: id, destination: notification.isFeeSummary ? '/notifications/overdue' : '/recipient',
    }), { vapidDetails: config!, TTL: 60, timeout: 10000, urgency: 'normal', topic: hashToken(id).slice(0, 32) })
    statusCode = result.statusCode
    accepted = statusCode >= 200 && statusCode < 300
  } catch (error) {
    if (typeof error === 'object' && error && 'statusCode' in error && typeof error.statusCode === 'number') statusCode = error.statusCode
  }
  await prisma.$transaction([
    prisma.pushDelivery.update({ where: { id: delivery.id }, data: { status: accepted ? 'ACCEPTED' : 'FAILED', statusCode, finishedAt: new Date() } }),
    prisma.notification.update({ where: { id }, data: { status: accepted ? 'ACCEPTED' : 'FAILED', sentAt: accepted ? new Date() : null } }),
    ...([404, 410].includes(statusCode ?? 0) ? [prisma.pushDevice.update({ where: { id: device!.id }, data: { isActive: false } })] : []),
  ])
  if (!accepted) throw new NotificationError(502, 'Push servisi gönderimi doğrulamadı. Sonuç geçmişe kaydedildi; otomatik tekrar yapılmadı.')
  return { id, status: 'ACCEPTED', message: 'Push servisi kabul etti; cihazda görüntülenme veya okunma garantisi değildir.' }
}
