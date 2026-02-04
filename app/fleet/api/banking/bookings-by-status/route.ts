// app/fleet/api/banking/bookings-by-status/route.ts
// Returns detailed bookings filtered by status or payment status

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Calculate refund percentage based on cancellation policy and timing
function calculateRefundPercent(policy: string, hoursBeforeStart: number): number {
  switch (policy) {
    case 'flexible':
      // Full refund if cancelled 24h+ before
      return hoursBeforeStart >= 24 ? 100 : 0
    case 'moderate':
      // Full refund if cancelled 48h+ before
      return hoursBeforeStart >= 48 ? 100 : 0
    case 'strict':
      // Full refund if cancelled 7 days (168h) before
      return hoursBeforeStart >= 168 ? 100 : 0
    case 'super_strict':
      // No refund ever
      return 0
    default:
      // Default tiered refund policy
      if (hoursBeforeStart >= 72) return 100
      if (hoursBeforeStart >= 48) return 50
      return 0
  }
}

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
      if (booking.status === 'CANCELLED') {
        const policy = booking.car?.cancellationPolicy || 'moderate'
        const cancelledAt = booking.updatedAt || new Date()
        const startDate = booking.startDate || new Date()

        // Calculate hours before trip start when cancelled
        const hoursBeforeStart = Math.max(0, (startDate.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60))
        const refundPercent = calculateRefundPercent(policy, hoursBeforeStart)

        const subtotal = Number(booking.subtotal) || 0
        const serviceFee = Number(booking.serviceFee) || 0

        // Refund is only on subtotal (not service fee)
        const refundAmount = subtotal * (refundPercent / 100)

        // Platform retains: service fee + non-refunded portion of subtotal
        const platformRetained = serviceFee + (subtotal - refundAmount)

        result.cancellationPolicy = policy
        result.hoursBeforeStart = Math.round(hoursBeforeStart)
        result.refundPercent = refundPercent
        result.refundAmount = refundAmount
        result.platformRetained = platformRetained
        result.cancelledAt = cancelledAt.toISOString()
        result.cancellationReason = hoursBeforeStart < 24
          ? 'Late cancellation (less than 24h notice)'
          : hoursBeforeStart < 48
            ? 'Short notice cancellation (less than 48h)'
            : hoursBeforeStart < 168
              ? 'Standard cancellation'
              : 'Early cancellation (7+ days notice)'
      }

      return result
    })

    // Calculate summary for cancelled bookings
    let cancellationSummary = null
    if (status === 'CANCELLED') {
      const totalRefunds = formattedBookings.reduce((sum, b) => sum + (b.refundAmount || 0), 0)
      const totalPlatformRetained = formattedBookings.reduce((sum, b) => sum + (b.platformRetained || 0), 0)

      cancellationSummary = {
        totalBookings: formattedBookings.length,
        totalOriginalValue: formattedBookings.reduce((sum, b) => sum + b.total, 0),
        totalRefunds,
        totalPlatformRetained,
        byPolicy: {
          flexible: formattedBookings.filter(b => b.cancellationPolicy === 'flexible').length,
          moderate: formattedBookings.filter(b => b.cancellationPolicy === 'moderate').length,
          strict: formattedBookings.filter(b => b.cancellationPolicy === 'strict').length,
          super_strict: formattedBookings.filter(b => b.cancellationPolicy === 'super_strict').length
        }
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
