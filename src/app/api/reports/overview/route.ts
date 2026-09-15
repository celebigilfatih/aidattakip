import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getReportData, parseReportFilters, ReportFilterError } from '@/lib/reporting'

export async function GET(request: NextRequest) {
  try {
    const filters = parseReportFilters(new URL(request.url).searchParams)
    return NextResponse.json(await getReportData(prisma, filters))
  } catch (error) {
    if (error instanceof ReportFilterError) return NextResponse.json({ error: error.message }, { status: 400 })
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
