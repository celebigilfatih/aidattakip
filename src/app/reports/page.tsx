'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, Download, FileText, PieChart, TrendingUp, Users } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useToast } from '@/hooks/use-toast'
import type { ReportData, ReportType } from '@/lib/reporting'

type GroupOption = { id: string; name: string }

const reportLabels: Record<ReportType, string> = {
  overview: 'Genel Bakış', financial: 'Mali Durum', attendance: 'Devam Durumu', student: 'Sporcu Analizi',
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [groups, setGroups] = useState<GroupOption[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState<{ dateRange: string; groupId: string; reportType: ReportType }>({ dateRange: '30', groupId: 'all', reportType: 'overview' })
  const { user } = useAuth()
  const { settings } = useSettings()
  const { toast } = useToast()
  const canExport = user?.role === 'ADMIN' || user?.role === 'ACCOUNTING'
  const showStudents = filters.reportType === 'overview' || filters.reportType === 'student'
  const showPayments = filters.reportType === 'overview' || filters.reportType === 'financial'
  const showAttendance = filters.reportType === 'overview' || filters.reportType === 'attendance'
  const selectedGroup = useMemo(() => groups.find(group => group.id === filters.groupId)?.name ?? 'Tüm gruplar', [groups, filters.groupId])

  useEffect(() => {
    fetch('/api/groups?isActive=true').then(async response => {
      if (!response.ok) throw new Error('Gruplar yüklenemedi')
      setGroups(await response.json())
    }).catch(() => toast({ title: 'Hata', description: 'Grup filtresi yüklenemedi', variant: 'destructive' }))
  }, [toast])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ dateRange: filters.dateRange, reportType: filters.reportType })
        if (filters.groupId !== 'all') params.set('groupId', filters.groupId)
        const response = await fetch(`/api/reports/overview?${params}`)
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || 'Rapor verileri yüklenemedi')
        setReportData(body)
      } catch (error) {
        toast({ title: 'Hata', description: error instanceof Error ? error.message : 'Rapor verileri yüklenemedi', variant: 'destructive' })
      } finally { setLoading(false) }
    }
    load()
  }, [filters, toast])

  const exportExcel = async () => {
    try {
      setExporting(true)
      const params = new URLSearchParams({ format: 'excel', dateRange: filters.dateRange, reportType: filters.reportType })
      if (filters.groupId !== 'all') params.set('groupId', filters.groupId)
      const response = await fetch(`/api/reports/export?${params}`)
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Excel raporu oluşturulamadı')
      }
      const url = URL.createObjectURL(await response.blob())
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `spormanage-${filters.reportType}-${new Date().toISOString().slice(0, 10)}.xlsx`
      anchor.click()
      URL.revokeObjectURL(url)
      toast({ title: 'Başarılı', description: 'Excel raporu indirildi' })
    } catch (error) {
      toast({ title: 'Hata', description: error instanceof Error ? error.message : 'Rapor indirilemedi', variant: 'destructive' })
    } finally { setExporting(false) }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
  const formatPercentage = (rate: number) => `${Math.round(rate)}%`

  return (
    <AppLayout>
      <div className="print-report w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="print-only">
          <h1>{settings.schoolName} — {reportLabels[filters.reportType]}</h1>
          <p>Son {filters.dateRange} gün · {selectedGroup} · {new Date().toLocaleString('tr-TR')}</p>
        </div>

        <div className="print-hidden flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div><h1 className="text-3xl font-bold">Raporlar ve Analitik</h1><p className="text-muted-foreground">SporManage performansı ve istatistikleri</p></div>
          {canExport && <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportExcel} disabled={exporting}><Download className="h-4 w-4 mr-2" />{exporting ? 'Hazırlanıyor...' : 'Excel İndir'}</Button>
            <Button variant="outline" onClick={() => window.print()}><FileText className="h-4 w-4 mr-2" />Yazdır / PDF Kaydet</Button>
          </div>}
        </div>

        <Card className="print-hidden"><CardHeader><CardTitle>Filtreler</CardTitle></CardHeader><CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Zaman Aralığı</Label><Select value={filters.dateRange} onValueChange={dateRange => setFilters(current => ({ ...current, dateRange }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[['7','Son 7 Gün'],['30','Son 30 Gün'],['90','Son 3 Ay'],['365','Son 1 Yıl']].map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Grup</Label><Select value={filters.groupId} onValueChange={groupId => setFilters(current => ({ ...current, groupId }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tüm Gruplar</SelectItem>{groups.map(group => <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Rapor Türü</Label><Select value={filters.reportType} onValueChange={reportType => setFilters(current => ({ ...current, reportType: reportType as ReportType }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(reportLabels).map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          </div>
        </CardContent></Card>

        {loading && <div className="flex items-center justify-center h-64 text-lg">Raporlar yükleniyor...</div>}
        {!loading && reportData && <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {showStudents && <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Toplam Sporcu</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.students.total}</div><p className="text-xs text-muted-foreground">{reportData.students.active} aktif</p></CardContent></Card>}
            {showPayments && <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Dönem Tahsilatı</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(reportData.payments.totalRevenue)}</div><p className="text-xs text-muted-foreground">Bu ay: {formatCurrency(reportData.payments.monthlyRevenue)}</p></CardContent></Card>}
            {showAttendance && <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Devam Oranı</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatPercentage(reportData.attendance.averageRate)}</div><p className="text-xs text-muted-foreground">{reportData.attendance.totalSessions} tamamlanan antrenman</p></CardContent></Card>}
            {showPayments && <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Geciken Bakiye</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(reportData.payments.overdue)}</div><p className="text-xs text-muted-foreground">Seçili dönemde takip gerekli</p></CardContent></Card>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {showStudents && <Card><CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Gruplara Göre Sporcular</CardTitle></CardHeader><CardContent className="space-y-3">{reportData.students.byGroup.map(group => <div key={group.groupName} className="flex justify-between"><span>{group.groupName}</span><span>{group.count} sporcu</span></div>)}</CardContent></Card>}
            {showPayments && <Card><CardHeader><CardTitle>Aylık Tahsilat</CardTitle></CardHeader><CardContent className="space-y-3">{reportData.payments.byMonth.length ? reportData.payments.byMonth.map(month => <div key={month.month} className="flex justify-between"><span>{month.month}</span><span>{formatCurrency(month.amount)}</span></div>) : <p className="text-muted-foreground">Seçili dönemde tahsilat yok.</p>}</CardContent></Card>}
            {showAttendance && <Card><CardHeader><CardTitle>Gruplara Göre Devam</CardTitle></CardHeader><CardContent className="space-y-4">{reportData.attendance.attendanceByGroup.map(group => <div key={group.groupName}><div className="flex justify-between text-sm"><span>{group.groupName}</span><span>{formatPercentage(group.rate)}</span></div><div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(group.rate, 100)}%` }} /></div></div>)}</CardContent></Card>}
            {filters.reportType === 'overview' && <Card><CardHeader><CardTitle>Bildirim İstatistikleri</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex justify-between"><span>Gönderilen</span><span>{reportData.notifications.totalSent}</span></div><div className="flex justify-between"><span>Başarısızlık oranı</span><span>{formatPercentage(reportData.notifications.failureRate)}</span></div>{reportData.notifications.byType.map(type => <div key={type.type} className="flex justify-between text-sm"><span>{type.type}</span><span>{type.count}</span></div>)}</CardContent></Card>}
          </div>

          {filters.reportType === 'overview' && <Card><CardHeader><CardTitle>Özet Bilgiler</CardTitle><CardDescription>Son {filters.dateRange} günlük aktivite özeti</CardDescription></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm"><div><strong>Bu ay yeni kayıt</strong><p>{reportData.students.newThisMonth} sporcu</p></div><div><strong>Bu ay tahsilat</strong><p>{formatCurrency(reportData.payments.paidThisMonth)}</p></div><div><strong>Geciken bakiye</strong><p>{formatCurrency(reportData.payments.overdue)}</p></div></div></CardContent></Card>}
        </>}
      </div>
    </AppLayout>
  )
}
