// app/api/fleet/bookings/[id]/refund-request/route.ts
// POST - Partner/Host submits refund request for Fleet approval
// GET - Get refund request status for a booking

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet/partner access
    const key = request.nextUrl.searchParams.get('key')
    const partnerId = request.headers.get('x-partner-id')
    const hostId = request.headers.get('x-host-id')

    if (key !== 'phoenix-fleet-2847' && !partnerId && !hostId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: bookingId } = await params
    const body = await request.json()

    const { amount, reason, notes, requestedByType = 'PARTNER' } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid refund amount is required' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Refund reason is required' },
        { status: 400 }
      )
    }

    // Validate requestedByType
    const validTypes = ['PARTNER', 'HOST', 'FLEET']
    if (!validTypes.includes(requestedByType)) {
      return NextResponse.json(
        { error: `Invalid requestedByType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch booking with payment details
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
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
            year: true
          }
        },
        refundRequests: {
          where: {
            status: { in: ['PENDING', 'APPROVED'] }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check for existing pending/approved refund request
    if (booking.refundRequests.length > 0) {
      const existingRequest = booking.refundRequests[0]
      return NextResponse.json(
        {
          error: 'A refund request already exists for this booking',
          existingRequest: {
            id: existingRequest.id,
            status: existingRequest.status,
            amount: existingRequest.amount,
            createdAt: existingRequest.createdAt
          }
        },
        { status: 409 }
      )
    }

    // Calculate maximum refundable amount
    const totalPaid = Number(booking.totalPrice || 0)
    const previousRefunds = await prisma.refundRequest.aggregate({
      where: {
        bookingId,
        status: 'PROCESSED'
      },
      _sum: {
        amount: true
      }
    })
    const alreadyRefunded = previousRefunds._sum.amount || 0
    const maxRefundable = totalPaid - alreadyRefunded

    if (amount > maxRefundable) {
      return NextResponse.json(
        {
          error: `Cannot request $${amount.toFixed(2)}. Maximum refundable amount is $${maxRefundable.toFixed(2)}`,
          maxRefundable,
          totalPaid,
          alreadyRefunded
        },
        { status: 400 }
      )
    }

    // Determine who is requesting
    const requesterId = key === 'phoenix-fleet-2847'
      ? 'FLEET_ADMIN'
      : (partnerId || hostId || booking.hostId)

    // Create refund request
    const refundRequest = await prisma.refundRequest.create({
      data: {
        bookingId,
        requestedBy: requesterId,
        requestedByType,
        amount,
        reason,
        notes,
        status: 'PENDING'
      }
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        entityType: 'BOOKING',
        entityId: bookingId,
        hostId: booking.hostId,
        action: 'REFUND_REQUESTED',
        metadata: {
          refundRequestId: refundRequest.id,
          amount,
          reason,
          requestedBy: requesterId,
          requestedByType,
          bookingCode: booking.bookingCode,
          guestName: booking.guestName,
          hostName: booking.host?.partnerCompanyName || booking.host?.name,
          vehicle: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Refund request submitted for Fleet approval',
      data: {
        id: refundRequest.id,
        bookingId,
        bookingCode: booking.bookingCode,
        amount,
        status: 'PENDING',
        reason,
        requestedBy: requesterId,
        requestedByType,
        createdAt: refundRequest.createdAt,
        maxRefundable,
        booking: {
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          totalPaid,
          vehicle: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`
        }
      }
    })

  } catch (error: any) {
    console.error('Error creating refund request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create refund request' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: bookingId } = await params

    // Fetch all refund requests for this booking
    const refundRequests = await prisma.refundRequest.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' }
    })

    // Get booking details for context
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingCode: true,
        guestName: true,
        guestEmail: true,
        totalPrice: true,
        stripePaymentIntentId: true,
        host: {
          select: {
            id: true,
            name: true,
            partnerCompanyName: true
          }
        },
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Calculate refund totals
    const processedTotal = refundRequests
      .filter(r => r.status === 'PROCESSED')
      .reduce((sum, r) => sum + r.amount, 0)
    const pendingTotal = refundRequests
      .filter(r => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0)
    const totalPaid = Number(booking.totalPrice || 0)
    const remainingRefundable = totalPaid - processedTotal

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        totalPaid,
        hostName: booking.host?.partnerCompanyName || booking.host?.name,
        vehicle: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`,
        hasPaymentIntent: !!booking.stripePaymentIntentId
      },
      summary: {
        totalPaid,
        processedRefunds: processedTotal,
        pendingRefunds: pendingTotal,
        remainingRefundable,
        requestCount: refundRequests.length
      },
      refundRequests: refundRequests.map(r => ({
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
        notes: r.notes,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }))
    })

  } catch (error: any) {
    console.error('Error fetching refund requests:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch refund requests' },
      { status: 500 }
    )
  }
}
