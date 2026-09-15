import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { buildReportWorkbook } from '@/lib/report-export'
import { prisma } from '@/lib/prisma'
import { getReportData, parseReportFilters, ReportFilterError } from '@/lib/reporting'

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const payload = AuthService.verifyToken(token || '')
  if (!payload) return null
  return prisma.user.findFirst({ where: { id: payload.userId, isActive: true }, select: { role: true } })
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 })
    if (user.role !== 'ADMIN' && user.role !== 'ACCOUNTING') return NextResponse.json({ error: 'Rapor dışa aktarma yetkiniz yok' }, { status: 403 })

    const searchParams = new URL(request.url).searchParams
    const format = searchParams.get('format') ?? 'pdf'
    if (format === 'pdf') return NextResponse.json({ error: 'PDF çıktısı rapor ekranındaki Yazdır / PDF Kaydet işlemiyle oluşturulur.' }, { status: 410 })
    if (format !== 'excel') return NextResponse.json({ error: 'Geçersiz rapor biçimi.' }, { status: 400 })

    const filters = parseReportFilters(searchParams)
    const workbook = buildReportWorkbook(await getReportData(prisma, filters), filters)
    const body = new ArrayBuffer(workbook.byteLength)
    new Uint8Array(body).set(workbook)
    const date = new Date().toISOString().slice(0, 10)
    return new Response(body, { headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="spormanage-${filters.reportType}-${date}.xlsx"`,
      'Cache-Control': 'no-store',
    } })
  } catch (error) {
    if (error instanceof ReportFilterError) return NextResponse.json({ error: error.message }, { status: 400 })
    console.error('Error exporting report:', error)
    return NextResponse.json({ error: 'Failed to export report' }, { status: 500 })
  }
}
