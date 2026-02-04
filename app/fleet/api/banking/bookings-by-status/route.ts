// app/fleet/api/banking/bookings-by-status/route.ts
// Returns detailed bookings filtered by status or payment status

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import {
  calculateCancellationRevenue,
  calculateCancellationRevenueSummary
} from '@/app/lib/services/financialCalculator'

export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = request.nextUrl.searchParams.get('status')
    const paymentStatus = request.nextUrl.searchParams.get('paymentStatus')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }

    // Fetch bookings with related data
    const bookings = await prisma.rentalBooking.findMany({
      where,
      take: Math.min(limit, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        car: {
          select: {
            make: true,
            model: true,
            year: true,
            cancellationPolicy: true
          }
        },
        renter: {
          select: {
            name: true
          }
        }
      }
    })

    // Format response
    const formattedBookings = bookings.map(booking => {
      // Base booking data
      const result: any = {
        id: booking.id,
        bookingCode: booking.bookingCode || `BK-${booking.id.slice(0, 8)}`,
        carName: booking.car
          ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
          : 'Unknown Vehicle',
        guestName: booking.renter?.name || 'Guest',
        startDate: booking.startDate?.toISOString() || '',
        endDate: booking.endDate?.toISOString() || '',
        total: Number(booking.totalAmount) || 0,
        subtotal: Number(booking.subtotal) || 0,
        serviceFee: Number(booking.serviceFee) || 0,
        paymentStatus: booking.paymentStatus
      }

      // Calculate cancellation details for CANCELLED bookings
      // Using centralized financial calculator for bank-grade accuracy
      if (booking.status === 'CANCELLED') {
        const cancellation = calculateCancellationRevenue(booking)

        result.cancellationPolicy = cancellation.policy
        result.hoursBeforeStart = cancellation.hoursBeforeStart
        result.refundPercent = cancellation.refundPercent
        result.refundAmount = cancellation.refundAmount
        result.platformRetained = cancellation.platformRetained
        result.cancelledAt = (booking.updatedAt || new Date()).toISOString()
        result.cancellationReason = cancellation.reason
      }

      return result
    })

    // Calculate summary for cancelled bookings using centralized calculator
    let cancellationSummary = null
    if (status === 'CANCELLED') {
      const summary = calculateCancellationRevenueSummary(bookings)

      cancellationSummary = {
        totalBookings: summary.cancelledCount,
        totalOriginalValue: summary.totalCancelled,
        totalRefunds: summary.totalRefunded,
        totalPlatformRetained: summary.totalRetained,
        serviceFeeRetained: summary.serviceFeeRetained,
        nonRefundedSubtotal: summary.nonRefundedSubtotal,
        byPolicy: summary.byPolicy
      }
    }

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      total: formattedBookings.length,
      cancellationSummary
    })

  } catch (error: any) {
    console.error('Error fetching bookings by status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
