import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'
import { PaymentStatus } from '@/types'
import { getTrainerGroupIds } from '@/lib/trainer-permissions'
import { paymentBalance, paymentMonth } from '@/lib/payment-balance'
import { paymentStatusWhere, summarizePayments } from '@/lib/payment-read'

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  
  const payload = AuthService.verifyToken(token)
  if (!payload) return null
  
  return await prisma.user.findUnique({
    where: { id: payload.userId }
  })
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')
    const groupId = searchParams.get('groupId')
    const branchId = searchParams.get('branchId')
    const overdue = searchParams.get('overdue') === 'true'
    const search = searchParams.get('search') || ''
    const sortField = searchParams.get('sortField') || 'dueDate'
    const sortDirection = searchParams.get('sortDirection') || 'asc'
    const monthFilter = searchParams.get('month') || 'all' // current or all

    const skip = (page - 1) * limit
    const now = new Date()
    const where: any = { AND: [paymentStatusWhere(status || 'all', now)] }

    if (studentId) {
      where.studentId = studentId
    }

    if (groupId && groupId !== 'all') {
      where.student = {
        groupId: groupId
      }
    }

    if (branchId && branchId !== 'all') {
      where.student = {
        ...where.student,
        branchId: branchId
      }
    }

    // Search by student name
    if (search) {
      where.student = {
        ...where.student,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    // TRAINER rolü için: sadece izinli gruplardaki öğrencilerin ödemelerini filtrele
    if (user.role === 'TRAINER') {
      const allowedGroupIds = await getTrainerGroupIds(user.id)
      where.student = {
        ...where.student,
        groupId: { in: allowedGroupIds }
      }
    }

    if (overdue) where.AND.push(paymentStatusWhere('OVERDUE', now))

    if (monthFilter === 'current') {
      const month = paymentMonth(now)
      where.AND.push({ dueDate: { gte: month.start, lt: month.end } })
    }

    // Determine sorting
    let orderBy: any = { dueDate: 'asc' }
    if (sortField === 'amount') {
      orderBy = { amount: sortDirection }
    } else if (sortField === 'dueDate') {
      orderBy = { dueDate: sortDirection }
    } else if (sortField === 'student') {
      orderBy = {
        student: {
          lastName: sortDirection
        }
      }
    }

    const [payments, summaryRows] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            include: {
              group: true,
              branch: true,
              parents: {
                where: { isPrimary: true },
                take: 1
              }
            }
          },
          feeType: true,
          createdBy: {
            select: { name: true }
          }
        },
        orderBy
      }),
      prisma.payment.findMany({ where, select: { amount: true, paidAmount: true, dueDate: true, paidDate: true, status: true } })
    ], { isolationLevel: 'RepeatableRead' })

    const summary = summarizePayments(summaryRows, now)
    return NextResponse.json({
      payments: payments.map(payment => {
        const state = paymentBalance(payment, now)
        return { ...payment, displayStatus: state.displayStatus, remainingAmount: state.remaining, overdue: state.overdue }
      }),
      asOf: now.toISOString(),
      pagination: { page, limit, total: summary.totalCount, pages: Math.ceil(summary.totalCount / limit) },
      summary,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Failed to fetch payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!AuthService.canManagePayments(user.role as any)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { studentId, feeTypeId, amount, installmentCount = 1, startDate, notes } = data

    if (!studentId || !feeTypeId || !amount || !startDate) {
      return NextResponse.json(
        { error: 'Student, fee type, amount, and start date are required' },
        { status: 400 }
      )
    }

    // Verify student and fee type exist
    const [student, feeType] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.feeType.findUnique({ where: { id: feeTypeId } })
    ])

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    if (!feeType) {
      return NextResponse.json(
        { error: 'Fee type not found' },
        { status: 404 }
      )
    }

    const paymentAmount = parseFloat(amount)
    const numInstallments = parseInt(installmentCount) || 1
    const baseDate = new Date(startDate)

    // Generate a unique plan ID for grouping installments
    const planId = `PLAN_${Date.now()}_${studentId.substring(0, 8)}`

    // Calculate interval based on fee period
    let monthsInterval = 1
    switch (feeType.period) {
      case 'MONTHLY':
        monthsInterval = 1
        break
      case 'QUARTERLY':
        monthsInterval = 3
        break
      case 'YEARLY':
        monthsInterval = 12
        break
      case 'ONE_TIME':
        monthsInterval = 1
        break
      default:
        monthsInterval = 1
    }

    // Create multiple payment records
    const payments = []
    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(baseDate)
      dueDate.setMonth(dueDate.getMonth() + (i * monthsInterval))
      
      payments.push({
        studentId,
        feeTypeId,
        amount: paymentAmount,
        dueDate,
        notes: numInstallments > 1 
          ? `${notes ? notes + ' - ' : ''}${planId} - Vade ${i + 1}/${numInstallments}` 
          : notes,
        createdById: user.id,
        status: PaymentStatus.PENDING,
        referenceNumber: numInstallments > 1 ? planId : null
      })
    }

    // Create all payments in a transaction
    const createdPayments = await prisma.$transaction(
      payments.map(payment => 
        prisma.payment.create({
          data: payment,
          include: {
            student: {
              include: { group: true }
            },
            feeType: true,
            createdBy: {
              select: { name: true }
            }
          }
        })
      )
    )

    return NextResponse.json({
      message: `${createdPayments.length} ödeme kaydı oluşturuldu`,
      count: createdPayments.length,
      planId: numInstallments > 1 ? planId : null,
      payments: createdPayments
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!AuthService.canManagePayments(user.role as any)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const groupId = searchParams.get('groupId')
    const overdue = searchParams.get('overdue') === 'true'
    const search = searchParams.get('search') || ''

    const where: any = {}

    // Target only non-cancelled payments by default
    const now = new Date()
    where.AND = [paymentStatusWhere(status || 'all', now)]

    if (groupId && groupId !== 'all') {
      where.student = { groupId }
    }

    if (search) {
      where.student = {
        ...where.student,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    if (overdue) where.AND.push(paymentStatusWhere('OVERDUE', now))

    const result = await prisma.payment.updateMany({
      where,
      data: {
        status: PaymentStatus.CANCELLED,
        notes: `CANCELLED (bulk) by ${user.name}`
      }
    })

    return NextResponse.json({
      message: 'Payments cancelled successfully',
      count: result.count
    })
  } catch (error) {
    console.error('Failed to bulk cancel payments:', error)
    return NextResponse.json(
      { error: 'Failed to bulk cancel payments' },
      { status: 500 }
    )
  }
}
