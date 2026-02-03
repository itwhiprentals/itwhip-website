// app/api/fleet/guests/[id]/banking/charges/route.ts
// Guest Charges API - List and create manual charges

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'

// Fleet access key
const FLEET_KEY = 'phoenix-fleet-2847'

function verifyFleetAccess(request: NextRequest): boolean {
  const urlKey = request.nextUrl.searchParams.get('key')
  const headerKey = request.headers.get('x-fleet-key')
  return urlKey === FLEET_KEY || headerKey === FLEET_KEY
}

// GET - List all charges for guest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyFleetAccess(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: guestId } = await params
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') // pending, charged, disputed, waived, failed, all
    const bookingId = searchParams.get('bookingId')

    // Verify guest exists
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: { id: true, name: true, userId: true }
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Build filter for bookings
    const bookingFilter: any = {
      OR: [
        { reviewerId: guestId },
        ...(guest.userId ? [{ renterId: guest.userId }] : [])
      ]
    }

    if (bookingId) {
      bookingFilter.id = bookingId
    }

    // Fetch all bookings with charges
    const bookings = await prisma.rentalBooking.findMany({
      where: bookingFilter,
      include: {
        car: {
          select: { id: true, make: true, model: true, year: true }
        },
        tripCharges: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Flatten charges with booking info
    let allCharges = bookings.flatMap((booking: any) =>
      (booking.tripCharges || []).map((charge: any) => ({
        id: charge.id,
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        car: {
          id: booking.car?.id,
          name: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`
        },
        tripDates: {
          start: booking.startDate,
          end: booking.endDate
        },
        // Charge breakdown
        mileageCharge: Number(charge.mileageCharge || 0),
        fuelCharge: Number(charge.fuelCharge || 0),
        lateCharge: Number(charge.lateCharge || 0),
        damageCharge: Number(charge.damageCharge || 0),
        cleaningCharge: Number(charge.cleaningCharge || 0),
        otherCharges: Number(charge.otherCharges || 0),
        totalCharges: Number(charge.totalCharges || 0),
        chargeDetails: charge.chargeDetails ? JSON.parse(charge.chargeDetails as string) : null,
        // Status
        chargeStatus: charge.chargeStatus,
        chargeAttempts: charge.chargeAttempts,
        lastAttemptAt: charge.lastAttemptAt,
        nextRetryAt: charge.nextRetryAt,
        // Stripe
        stripeChargeId: charge.stripeChargeId,
        chargedAt: charge.chargedAt,
        chargedAmount: charge.chargedAmount ? Number(charge.chargedAmount) : null,
        // Failure
        failureReason: charge.failureReason,
        failureCode: charge.failureCode,
        // Waive
        waivedAt: charge.waivedAt,
        waivedBy: charge.waivedBy,
        waiveReason: charge.waiveReason,
        waivePercentage: charge.waivePercentage,
        // Dispute
        disputes: charge.disputes,
        disputeNotes: charge.disputeNotes,
        disputedAt: charge.disputedAt,
        disputeResolvedAt: charge.disputeResolvedAt,
        disputeResolution: charge.disputeResolution,
        // Refund
        refundAmount: charge.refundAmount ? Number(charge.refundAmount) : null,
        refundedAt: charge.refundedAt,
        refundReason: charge.refundReason,
        stripeRefundId: charge.stripeRefundId,
        // Admin
        requiresApproval: charge.requiresApproval,
        approvedBy: charge.approvedBy,
        approvedAt: charge.approvedAt,
        // Timestamps
        createdAt: charge.createdAt,
        updatedAt: charge.updatedAt
      }))
    )

    // Filter by status if provided
    if (status && status !== 'all') {
      const statusMap: Record<string, string[]> = {
        'pending': ['PENDING'],
        'charged': ['CHARGED'],
        'disputed': ['DISPUTED'],
        'waived': ['WAIVED'],
        'failed': ['FAILED'],
        'adjusted': ['ADJUSTED'],
        'refunded': ['REFUNDED']
      }
      const validStatuses = statusMap[status] || [status.toUpperCase()]
      allCharges = allCharges.filter((c: any) => validStatuses.includes(c.chargeStatus))
    }

    // Calculate summary
    const summary = {
      total: allCharges.length,
      pending: allCharges.filter((c: any) => c.chargeStatus === 'PENDING').length,
      charged: allCharges.filter((c: any) => c.chargeStatus === 'CHARGED').length,
      disputed: allCharges.filter((c: any) => c.chargeStatus === 'DISPUTED').length,
      waived: allCharges.filter((c: any) => c.chargeStatus === 'WAIVED').length,
      failed: allCharges.filter((c: any) => c.chargeStatus === 'FAILED').length,
      totalPendingAmount: allCharges
        .filter((c: any) => c.chargeStatus === 'PENDING')
        .reduce((sum: number, c: any) => sum + c.totalCharges, 0),
      totalChargedAmount: allCharges
        .filter((c: any) => c.chargeStatus === 'CHARGED')
        .reduce((sum: number, c: any) => sum + (c.chargedAmount || c.totalCharges), 0),
      totalDisputedAmount: allCharges
        .filter((c: any) => c.chargeStatus === 'DISPUTED')
        .reduce((sum: number, c: any) => sum + c.totalCharges, 0)
    }

    return NextResponse.json({
      success: true,
      guestId,
      guestName: guest.name,
      summary,
      charges: allCharges
    })

  } catch (error) {
    console.error('Fleet guest charges GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch charges' },
      { status: 500 }
    )
  }
}

// POST - Create manual charge
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyFleetAccess(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: guestId } = await params
    const body = await request.json()
    const {
      bookingId,
      chargeType, // 'mileage', 'fuel', 'late', 'damage', 'cleaning', 'other'
      amount,
      description,
      details
    } = body

    // Validate required fields
    if (!bookingId || !chargeType || !amount) {
      return NextResponse.json({
        error: 'bookingId, chargeType, and amount are required'
      }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Verify guest exists
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: { id: true, name: true, userId: true }
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Verify booking belongs to guest
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { reviewerId: guestId },
          ...(guest.userId ? [{ renterId: guest.userId }] : [])
        ]
      },
      include: {
        car: { select: { make: true, model: true, year: true } }
      }
    })

    if (!booking) {
      return NextResponse.json({
        error: 'Booking not found or does not belong to this guest'
      }, { status: 404 })
    }

    // Build charge data based on type
    const chargeData: any = {
      id: nanoid(),
      bookingId,
      mileageCharge: 0,
      fuelCharge: 0,
      lateCharge: 0,
      damageCharge: 0,
      cleaningCharge: 0,
      otherCharges: 0,
      totalCharges: amount,
      chargeStatus: 'PENDING',
      chargeDetails: JSON.stringify({
        type: chargeType,
        description: description || `Manual ${chargeType} charge`,
        details: details || null,
        addedBy: 'fleet-admin',
        addedAt: new Date().toISOString()
      }),
      requiresApproval: false
    }

    // Set the specific charge type amount
    switch (chargeType) {
      case 'mileage':
        chargeData.mileageCharge = amount
        break
      case 'fuel':
        chargeData.fuelCharge = amount
        break
      case 'late':
        chargeData.lateCharge = amount
        break
      case 'damage':
        chargeData.damageCharge = amount
        break
      case 'cleaning':
        chargeData.cleaningCharge = amount
        break
      case 'other':
      default:
        chargeData.otherCharges = amount
        break
    }

    // Create the charge
    const newCharge = await prisma.tripCharge.create({
      data: chargeData
    })

    // Update booking to indicate pending charges
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PENDING_CHARGES',
        pendingChargesAmount: {
          increment: amount
        },
        chargesNotes: `Manual ${chargeType} charge added: $${amount.toFixed(2)}`
      }
    })

    return NextResponse.json({
      success: true,
      charge: {
        id: newCharge.id,
        bookingId,
        bookingCode: booking.bookingCode,
        car: `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`,
        chargeType,
        amount,
        description: description || `Manual ${chargeType} charge`,
        status: 'PENDING',
        createdAt: newCharge.createdAt
      }
    })

  } catch (error) {
    console.error('Fleet guest charges POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create charge' },
      { status: 500 }
    )
  }
}
