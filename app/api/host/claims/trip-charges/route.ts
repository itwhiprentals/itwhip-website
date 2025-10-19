// app/api/host/claims/trip-charges/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// GET /api/host/claims/trip-charges - Fetch trip charges for a booking
export async function GET(request: NextRequest) {
  try {
    // Get host ID from middleware (x-host-id header)
    const hostId = request.headers.get('x-host-id')

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized - Host ID not found' },
        { status: 401 }
      )
    }

    // Get bookingId from query params
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Verify booking belongs to this host
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        hostId: true,
        bookingCode: true,
        startDate: true,
        endDate: true,
        tripEndedAt: true,
        tripStatus: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.hostId !== hostId) {
      return NextResponse.json(
        { error: 'You do not own this booking' },
        { status: 403 }
      )
    }

    // Verify trip has ended
    if (!booking.tripEndedAt) {
      return NextResponse.json(
        { error: 'Trip has not ended yet. Charges can only be filed for completed trips.' },
        { status: 400 }
      )
    }

    // Fetch trip charges for this booking
    const tripCharges = await prisma.tripCharge.findMany({
      where: {
        bookingId: bookingId
      },
      include: {
        adjustments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format charges for frontend
    const formattedCharges = tripCharges.map(charge => ({
      id: charge.id,
      bookingId: charge.bookingId,
      
      // Charge breakdown
      mileageCharge: charge.mileageCharge,
      fuelCharge: charge.fuelCharge,
      lateCharge: charge.lateCharge,
      damageCharge: charge.damageCharge,
      cleaningCharge: charge.cleaningCharge,
      otherCharges: charge.otherCharges,
      totalCharges: charge.totalCharges,
      
      // Status
      chargeStatus: charge.chargeStatus,
      chargeAttempts: charge.chargeAttempts,
      lastAttemptAt: charge.lastAttemptAt?.toISOString() || null,
      
      // Disputes
      disputes: charge.disputes,
      disputeNotes: charge.disputeNotes,
      disputedAt: charge.disputedAt?.toISOString() || null,
      disputeResolvedAt: charge.disputeResolvedAt?.toISOString() || null,
      
      // Payment
      stripeChargeId: charge.stripeChargeId,
      chargedAt: charge.chargedAt?.toISOString() || null,
      chargedAmount: charge.chargedAmount,
      
      // Adjustments
      originalAmount: charge.originalAmount,
      adjustedAmount: charge.adjustedAmount,
      waivedAt: charge.waivedAt?.toISOString() || null,
      waivedBy: charge.waivedBy,
      waiveReason: charge.waiveReason,
      
      // Admin review
      reviewedBy: charge.reviewedBy,
      reviewedAt: charge.reviewedAt?.toISOString() || null,
      adminNotes: charge.adminNotes,
      
      // Hold
      holdUntil: charge.holdUntil?.toISOString() || null,
      guestNotifiedAt: charge.guestNotifiedAt?.toISOString() || null,
      
      // Adjustments history
      adjustments: charge.adjustments.map(adj => ({
        id: adj.id,
        adjustmentType: adj.adjustmentType,
        reason: adj.reason,
        originalAmount: adj.originalAmount,
        adjustedAmount: adj.adjustedAmount,
        reductionAmount: adj.reductionAmount,
        adminEmail: adj.adminEmail,
        adminNotes: adj.adminNotes,
        processedAt: adj.processedAt?.toISOString() || null,
        createdAt: adj.createdAt.toISOString()
      })),
      
      createdAt: charge.createdAt.toISOString(),
      updatedAt: charge.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      charges: formattedCharges,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        tripEndedAt: booking.tripEndedAt.toISOString(),
        tripStatus: booking.tripStatus
      }
    })

  } catch (error) {
    console.error('Error fetching trip charges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trip charges' },
      { status: 500 }
    )
  }
}