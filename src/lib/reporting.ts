import type { PrismaClient } from '@prisma/client'

export const REPORT_DATE_RANGES = [7, 30, 90, 365] as const
export const REPORT_TYPES = ['overview', 'financial', 'attendance', 'student'] as const
export type ReportType = typeof REPORT_TYPES[number]

export interface ReportFilters { dateRange: number; groupId: string | null; reportType: ReportType }
export interface ReportData {
  students: { total: number; active: number; byGroup: Array<{ groupName: string; count: number }>; newThisMonth: number }
  payments: { totalRevenue: number; monthlyRevenue: number; overdue: number; paidThisMonth: number; byMonth: Array<{ month: string; amount: number }> }
  attendance: { averageRate: number; totalSessions: number; attendanceByGroup: Array<{ groupName: string; rate: number }> }
  notifications: { totalSent: number; failureRate: number; byType: Array<{ type: string; count: number }> }
}

export class ReportFilterError extends Error {}

export function parseReportFilters(searchParams: URLSearchParams): ReportFilters {
  const rawDateRange = searchParams.get('dateRange') ?? searchParams.get('timeRange') ?? '30'
  const dateRange = Number(rawDateRange)
  if (!REPORT_DATE_RANGES.includes(dateRange as typeof REPORT_DATE_RANGES[number])) throw new ReportFilterError('dateRange 7, 30, 90 veya 365 olmalıdır.')
  const rawReportType = searchParams.get('reportType') ?? 'overview'
  if (!REPORT_TYPES.includes(rawReportType as ReportType)) throw new ReportFilterError('Geçersiz rapor türü.')
  const rawGroupId = searchParams.get('groupId')
  return { dateRange, groupId: rawGroupId && rawGroupId !== 'all' ? rawGroupId : null, reportType: rawReportType as ReportType }
}

type PaymentRow = { amount: number; paidAmount: number | null; paidDate: Date | null; dueDate: Date; status: string }

export function calculatePaymentMetrics(payments: PaymentRow[], startDate: Date, now: Date) {
  const inRange = (date: Date | null) => Boolean(date && date >= startDate && date <= now)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const paid = (payment: PaymentRow) => payment.paidAmount ?? 0
  const totalRevenue = payments.filter(payment => inRange(payment.paidDate)).reduce((sum, payment) => sum + paid(payment), 0)
  const monthlyRevenue = payments.filter(payment => payment.paidDate && payment.paidDate >= monthStart && payment.paidDate <= now).reduce((sum, payment) => sum + paid(payment), 0)
  const overdueStatuses = new Set(['PENDING', 'PARTIAL', 'OVERDUE'])
  const overdue = payments.filter(payment => payment.dueDate >= startDate && payment.dueDate < now && overdueStatuses.has(payment.status)).reduce((sum, payment) => sum + Math.max(payment.amount - paid(payment), 0), 0)
  const monthly = new Map<string, number>()
  for (const payment of payments.filter(item => inRange(item.paidDate))) {
    const key = payment.paidDate!.toISOString().slice(0, 7)
    monthly.set(key, (monthly.get(key) ?? 0) + paid(payment))
  }
  return { totalRevenue, monthlyRevenue, overdue, paidThisMonth: monthlyRevenue, byMonth: Array.from(monthly, ([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month)) }
}

type SessionRow = { group: { name: string }; attendances: Array<{ status: string }> }

export function calculateAttendanceMetrics(sessions: SessionRow[]) {
  const totals = new Map<string, { attended: number; records: number }>()
  for (const session of sessions) {
    const current = totals.get(session.group.name) ?? { attended: 0, records: 0 }
    current.records += session.attendances.length
    current.attended += session.attendances.filter(record => record.status === 'PRESENT' || record.status === 'EXCUSED').length
    totals.set(session.group.name, current)
  }
  const attended = Array.from(totals.values()).reduce((sum, item) => sum + item.attended, 0)
  const records = Array.from(totals.values()).reduce((sum, item) => sum + item.records, 0)
  return {
    averageRate: records ? attended / records * 100 : 0,
    totalSessions: sessions.length,
    attendanceByGroup: Array.from(totals, ([groupName, value]) => ({ groupName, rate: value.records ? value.attended / value.records * 100 : 0 })).sort((a, b) => a.groupName.localeCompare(b.groupName, 'tr')),
  }
}

export async function getReportData(db: PrismaClient, filters: ReportFilters, now = new Date()): Promise<ReportData> {
  const startDate = new Date(now); startDate.setDate(startDate.getDate() - filters.dateRange)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  if (filters.groupId) {
    const group = await db.group.findFirst({ where: { id: filters.groupId, isActive: true }, select: { id: true } })
    if (!group) throw new ReportFilterError('Aktif grup bulunamadı.')
  }
  const studentWhere = filters.groupId ? { groupId: filters.groupId } : {}
  const relationWhere = filters.groupId ? { student: { groupId: filters.groupId } } : {}
  const [totalStudents, activeStudents, newStudents, groups, payments, sessions, notifications] = await Promise.all([
    db.student.count({ where: studentWhere }),
    db.student.count({ where: { ...studentWhere, isActive: true } }),
    db.student.count({ where: { ...studentWhere, createdAt: { gte: monthStart, lte: now } } }),
    db.group.findMany({ where: { isActive: true, ...(filters.groupId ? { id: filters.groupId } : {}) }, orderBy: { name: 'asc' }, select: { name: true, _count: { select: { students: true } } } }),
    db.payment.findMany({ where: relationWhere, select: { amount: true, paidAmount: true, paidDate: true, dueDate: true, status: true } }),
    db.trainingSession.findMany({ where: { date: { gte: startDate, lte: now }, status: 'COMPLETED', ...(filters.groupId ? { groupId: filters.groupId } : {}) }, include: { attendances: { select: { status: true } }, group: { select: { name: true } } }, orderBy: { date: 'asc' } }),
    db.notification.findMany({ where: { createdAt: { gte: startDate, lte: now }, ...(filters.groupId ? { student: { groupId: filters.groupId } } : {}) }, select: { status: true, type: true } }),
  ])
  const notificationTypes = new Map<string, number>()
  for (const notification of notifications) notificationTypes.set(notification.type, (notificationTypes.get(notification.type) ?? 0) + 1)
  const deliveredNotifications = notifications.filter(notification => notification.status === 'SENT' || notification.status === 'FAILED')
  const failedNotifications = deliveredNotifications.filter(notification => notification.status === 'FAILED').length
  return {
    students: { total: totalStudents, active: activeStudents, byGroup: groups.map(group => ({ groupName: group.name, count: group._count.students })), newThisMonth: newStudents },
    payments: calculatePaymentMetrics(payments, startDate, now),
    attendance: calculateAttendanceMetrics(sessions),
    notifications: { totalSent: notifications.filter(notification => notification.status === 'SENT').length, failureRate: deliveredNotifications.length ? failedNotifications / deliveredNotifications.length * 100 : 0, byType: Array.from(notificationTypes, ([type, count]) => ({ type, count })).sort((a, b) => a.type.localeCompare(b.type)) },
  }
}
