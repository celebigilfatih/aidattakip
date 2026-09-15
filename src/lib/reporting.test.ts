import test from 'node:test'
import assert from 'node:assert/strict'
import * as XLSX from 'xlsx'
import { buildReportWorkbook } from './report-export'
import { calculateAttendanceMetrics, calculatePaymentMetrics, parseReportFilters, ReportData, ReportFilterError } from './reporting'

test('report filters accept canonical and legacy date parameters', () => {
  assert.deepEqual(parseReportFilters(new URLSearchParams('dateRange=90&groupId=group-1&reportType=financial')), { dateRange: 90, groupId: 'group-1', reportType: 'financial' })
  assert.equal(parseReportFilters(new URLSearchParams('timeRange=7')).dateRange, 7)
  assert.throws(() => parseReportFilters(new URLSearchParams('dateRange=31')), ReportFilterError)
  assert.throws(() => parseReportFilters(new URLSearchParams('reportType=unknown')), ReportFilterError)
})

test('payment metrics use paid amounts and overdue remaining balances', () => {
  const now = new Date('2026-09-15T12:00:00Z')
  const start = new Date('2026-08-16T12:00:00Z')
  const metrics = calculatePaymentMetrics([
    { amount: 1500, paidAmount: 1500, paidDate: new Date('2026-09-10T12:00:00Z'), dueDate: new Date('2026-09-05T12:00:00Z'), status: 'PAID' },
    { amount: 1500, paidAmount: 500, paidDate: new Date('2026-09-11T12:00:00Z'), dueDate: new Date('2026-09-05T12:00:00Z'), status: 'PARTIAL' },
    { amount: 1500, paidAmount: 0, paidDate: null, dueDate: new Date('2026-09-04T12:00:00Z'), status: 'OVERDUE' },
    { amount: 750, paidAmount: 0, paidDate: null, dueDate: new Date('2026-09-03T12:00:00Z'), status: 'CANCELLED' },
    { amount: 1000, paidAmount: 1000, paidDate: new Date('2026-07-01T12:00:00Z'), dueDate: new Date('2026-07-01T12:00:00Z'), status: 'PAID' },
  ], start, now)
  assert.equal(metrics.totalRevenue, 2000)
  assert.equal(metrics.monthlyRevenue, 2000)
  assert.equal(metrics.paidThisMonth, 2000)
  assert.equal(metrics.overdue, 2500)
  assert.deepEqual(metrics.byMonth, [{ month: '2026-09', amount: 2000 }])
})

test('attendance treats present and excused records as attended', () => {
  const metrics = calculateAttendanceMetrics([
    { group: { name: 'Merkez U10' }, attendances: [{ status: 'PRESENT' }, { status: 'EXCUSED' }, { status: 'ABSENT' }, { status: 'LATE' }] },
    { group: { name: 'Merkez U10' }, attendances: [{ status: 'PRESENT' }, { status: 'PRESENT' }] },
  ])
  assert.equal(metrics.totalSessions, 2)
  assert.equal(metrics.averageRate, 4 / 6 * 100)
  assert.equal(metrics.attendanceByGroup[0].rate, 4 / 6 * 100)
})

const reportData: ReportData = {
  students: { total: 60, active: 54, newThisMonth: 60, byGroup: [{ groupName: 'Merkez U10', count: 10 }] },
  payments: { totalRevenue: 2000, monthlyRevenue: 2000, overdue: 2500, paidThisMonth: 2000, byMonth: [{ month: '2026-09', amount: 2000 }] },
  attendance: { averageRate: 75, totalSessions: 10, attendanceByGroup: [{ groupName: 'Merkez U10', rate: 75 }] },
  notifications: { totalSent: 6, failureRate: 0, byType: [{ type: 'GENERAL_ANNOUNCEMENT', count: 6 }] },
}

test('Excel export creates a real XLSX with report-specific sheets', () => {
  const overview = buildReportWorkbook(reportData, { dateRange: 30, groupId: null, reportType: 'overview' }, new Date('2026-09-15T12:00:00Z'))
  assert.deepEqual(Array.from(overview.slice(0, 2)), [0x50, 0x4b])
  assert.deepEqual(XLSX.read(overview).SheetNames, ['Özet', 'Gruplar', 'Tahsilat', 'Devam', 'Bildirimler'])
  const financial = XLSX.read(buildReportWorkbook(reportData, { dateRange: 30, groupId: null, reportType: 'financial' }))
  assert.deepEqual(financial.SheetNames, ['Özet', 'Tahsilat'])
  const summary = XLSX.utils.sheet_to_json(financial.Sheets['Özet'], { header: 1 }) as unknown[][]
  assert.ok(summary.some(row => row[0] === 'Geciken bakiye' && row[1] === 2500))
})
