// app/api/fleet/refund-requests/route.ts
// GET - List all refund requests for Fleet dashboard (filterable by status, partner, date)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

function verifyFleetAccess(request: NextRequest): boolean {
  const urlKey = request.nextUrl.searchParams.get('key')
  const headerKey = request.headers.get('x-fleet-key')
  const fleetSession = request.cookies.get('fleet_session')?.value

  return urlKey === FLEET_KEY || headerKey === FLEET_KEY || !!fleetSession
}

export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    if (!verifyFleetAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // PENDING, APPROVED, REJECTED, PROCESSED
    const partnerId = searchParams.get('partnerId')
    const hostId = searchParams.get('hostId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (partnerId || hostId) {
      where.booking = {
        hostId: partnerId || hostId
      }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Fetch refund requests with booking details
    const [refundRequests, totalCount] = await Promise.all([
      prisma.refundRequest.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              guestName: true,
              guestEmail: true,
              totalAmount: true,
              startDate: true,
              endDate: true,
              status: true,
              paymentIntentId: true,
              host: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  partnerCompanyName: true,
                  hostType: true
                }
              },
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                  licensePlate: true
                }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.refundRequest.count({ where })
    ])

    // Get summary statistics
    const stats = await prisma.refundRequest.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true }
    })

    const summary = {
      pending: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      processed: { count: 0, amount: 0 }
    }

    stats.forEach(stat => {
      const key = stat.status.toLowerCase() as keyof typeof summary
      if (summary[key]) {
        summary[key] = {
          count: stat._count.id,
          amount: stat._sum.amount || 0
        }
      }
    })

    // Format response
    const formattedRequests = refundRequests.map(r => ({
      id: r.id,
      amount: r.amount,
      reason: r.reason,
      status: r.status,
      requestedBy: r.requestedBy,
      requestedByType: r.requestedByType,
      reviewedBy: r.reviewedBy,
      reviewedAt: r.reviewedAt,
      reviewNotes: r.reviewNotes,
      processedAt: r.processedAt,
      stripeRefundId: r.stripeRefundId,
      stripeTransferId: r.stripeTransferId,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      booking: {
        id: r.booking.id,
        bookingCode: r.booking.bookingCode,
        guestName: r.booking.guestName,
        guestEmail: r.booking.guestEmail,
        totalAmount: Number(r.booking.totalAmount || 0),
        tripDates: {
          start: r.booking.startDate,
          end: r.booking.endDate
        },
        status: r.booking.status,
        hasPaymentIntent: !!r.booking.paymentIntentId,
        host: {
          id: r.booking.host?.id,
          name: r.booking.host?.partnerCompanyName || r.booking.host?.name,
          email: r.booking.host?.email,
          type: r.booking.host?.hostType
        },
        vehicle: r.booking.car ? {
          id: r.booking.car.id,
          display: `${r.booking.car.year} ${r.booking.car.make} ${r.booking.car.model}`,
          licensePlate: r.booking.car.licensePlate
        } : null
      }
    }))

    return NextResponse.json({
      success: true,
      data: formattedRequests,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      summary: {
        total: {
          count: totalCount,
          amount: Object.values(summary).reduce((sum, s) => sum + s.amount, 0)
        },
        ...summary
      }
    })

  } catch (error: any) {
    console.error('Error fetching refund requests:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch refund requests' },
      { status: 500 }
    )
  }
}
