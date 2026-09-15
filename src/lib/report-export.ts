import * as XLSX from 'xlsx'
import type { ReportData, ReportFilters } from './reporting'

const currency = (value: number) => Number(value.toFixed(2))

export function buildReportWorkbook(data: ReportData, filters: ReportFilters, generatedAt = new Date()): Uint8Array {
  const workbook = XLSX.utils.book_new()
  const showStudents = filters.reportType === 'overview' || filters.reportType === 'student'
  const showPayments = filters.reportType === 'overview' || filters.reportType === 'financial'
  const showAttendance = filters.reportType === 'overview' || filters.reportType === 'attendance'
  const summary: Array<Array<string | number>> = [['SporManage Raporu'], ['Oluşturulma', generatedAt.toLocaleString('tr-TR')], ['Dönem', `Son ${filters.dateRange} gün`], ['Grup', filters.groupId ?? 'Tüm gruplar']]
  if (showStudents) summary.push(['Toplam sporcu', data.students.total], ['Aktif sporcu', data.students.active], ['Bu ay yeni kayıt', data.students.newThisMonth])
  if (showPayments) summary.push(['Dönem tahsilatı', currency(data.payments.totalRevenue)], ['Bu ay tahsilat', currency(data.payments.monthlyRevenue)], ['Geciken bakiye', currency(data.payments.overdue)])
  if (showAttendance) summary.push(['Devam oranı (%)', currency(data.attendance.averageRate)], ['Tamamlanan antrenman', data.attendance.totalSessions])
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), 'Özet')
  if (showStudents) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.students.byGroup.map(item => ({ Grup: item.groupName, 'Sporcu Sayısı': item.count }))), 'Gruplar')
  if (showPayments) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.payments.byMonth.map(item => ({ Ay: item.month, 'Tahsilat (TRY)': currency(item.amount) }))), 'Tahsilat')
  if (showAttendance) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.attendance.attendanceByGroup.map(item => ({ Grup: item.groupName, 'Devam Oranı (%)': currency(item.rate) }))), 'Devam')
  if (filters.reportType === 'overview') XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.notifications.byType.map(item => ({ Tür: item.type, Adet: item.count }))), 'Bildirimler')
  const output = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  return new Uint8Array(output)
}
