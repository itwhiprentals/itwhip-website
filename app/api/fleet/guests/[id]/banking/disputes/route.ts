// app/api/fleet/guests/[id]/banking/disputes/route.ts
// Guest Disputes API - List and resolve disputed charges

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'

// Fleet access key
const FLEET_KEY = 'phoenix-fleet-2847'

function verifyFleetAccess(request: NextRequest): boolean {
  const urlKey = request.nextUrl.searchParams.get('key')
  const headerKey = request.headers.get('x-fleet-key')
  return urlKey === FLEET_KEY || headerKey === FLEET_KEY
}

// GET - List disputed charges for guest
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
    const status = searchParams.get('status') // active, resolved, all

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

    // Fetch bookings with disputed charges
    const bookings = await prisma.rentalBooking.findMany({
      where: bookingFilter,
      include: {
        car: {
          select: { id: true, make: true, model: true, year: true }
        },
        tripCharges: {
          where: {
            OR: [
              { chargeStatus: 'DISPUTED' },
              { disputeResolvedAt: { not: null } }
            ]
          },
          orderBy: { disputedAt: 'desc' }
        }
      }
    })

    // Flatten disputes with booking info
    let allDisputes = bookings.flatMap((booking: any) =>
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
        // Charge info
        totalCharges: Number(charge.totalCharges || 0),
        chargeBreakdown: {
          mileage: Number(charge.mileageCharge || 0),
          fuel: Number(charge.fuelCharge || 0),
          late: Number(charge.lateCharge || 0),
          damage: Number(charge.damageCharge || 0),
          cleaning: Number(charge.cleaningCharge || 0),
          other: Number(charge.otherCharges || 0)
        },
        chargeDetails: charge.chargeDetails ? JSON.parse(charge.chargeDetails as string) : null,
        // Dispute info
        chargeStatus: charge.chargeStatus,
        disputeNotes: charge.disputeNotes,
        disputedAt: charge.disputedAt,
        disputeResolvedAt: charge.disputeResolvedAt,
        disputeResolution: charge.disputeResolution,
        // Resolution options available
        canChargeAnyway: charge.chargeStatus === 'DISPUTED',
        canWaive: charge.chargeStatus === 'DISPUTED',
        canEscalate: charge.chargeStatus === 'DISPUTED',
        // Timestamps
        createdAt: charge.createdAt,
        updatedAt: charge.updatedAt
      }))
    )

    // Filter by status
    if (status === 'active') {
      allDisputes = allDisputes.filter((d: any) => d.chargeStatus === 'DISPUTED')
    } else if (status === 'resolved') {
      allDisputes = allDisputes.filter((d: any) => d.disputeResolvedAt !== null)
    }

    // Calculate summary
    const summary = {
      total: allDisputes.length,
      active: allDisputes.filter((d: any) => d.chargeStatus === 'DISPUTED').length,
      resolved: allDisputes.filter((d: any) => d.disputeResolvedAt !== null).length,
      totalDisputedAmount: allDisputes
        .filter((d: any) => d.chargeStatus === 'DISPUTED')
        .reduce((sum: number, d: any) => sum + d.totalCharges, 0)
    }

    return NextResponse.json({
      success: true,
      guestId,
      guestName: guest.name,
      summary,
      disputes: allDisputes
    })

  } catch (error) {
    console.error('Fleet guest disputes GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch disputes' },
      { status: 500 }
    )
  }
}

// PATCH - Resolve a dispute
export async function PATCH(
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
      chargeId,
      resolution, // 'charge_anyway', 'waive', 'partial_waive', 'escalate'
      notes,
      waivePercentage, // For partial waive
      paymentMethodId // For charge_anyway
    } = body

    if (!chargeId || !resolution) {
      return NextResponse.json({
        error: 'chargeId and resolution are required'
      }, { status: 400 })
    }

    // Verify guest exists
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: { id: true, name: true, stripeCustomerId: true, userId: true }
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Fetch the disputed charge
    const tripCharge = await prisma.tripCharge.findUnique({
      where: { id: chargeId },
      include: {
        booking: true
      }
    })

    if (!tripCharge) {
      return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    }

    if (tripCharge.chargeStatus !== 'DISPUTED') {
      return NextResponse.json({
        error: `Charge is not disputed (current status: ${tripCharge.chargeStatus})`
      }, { status: 400 })
    }

    switch (resolution) {
      // ============================================================
      // CHARGE_ANYWAY - Force charge despite dispute
      // ============================================================
      case 'charge_anyway': {
        const pmId = paymentMethodId || tripCharge.booking.stripePaymentMethodId
        const customerId = guest.stripeCustomerId || tripCharge.booking.stripeCustomerId

        if (!customerId || !pmId) {
          return NextResponse.json({
            error: 'No payment method available'
          }, { status: 400 })
        }

        const amountCents = Math.round(Number(tripCharge.totalCharges) * 100)
        const result = await PaymentProcessor.chargeAdditionalFees(
          customerId,
          pmId,
          amountCents,
          `Disputed charge resolved - ${tripCharge.booking.bookingCode}`,
          {
            booking_id: tripCharge.bookingId,
            charge_id: tripCharge.id,
            dispute_resolution: 'charged_anyway'
          }
        )

        if (result.status === 'succeeded') {
          await prisma.tripCharge.update({
            where: { id: chargeId },
            data: {
              chargeStatus: 'CHARGED',
              stripeChargeId: result.chargeId,
              chargedAt: new Date(),
              chargedAmount: Number(tripCharge.totalCharges),
              disputeResolvedAt: new Date(),
              disputeResolution: `Charged despite dispute. ${notes || ''}`
            }
          })

          return NextResponse.json({
            success: true,
            resolution: 'charged',
            chargeId: result.chargeId,
            amount: result.amount
          })
        } else {
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 400 })
        }
      }

      // ============================================================
      // WAIVE - Accept dispute and waive charge
      // ============================================================
      case 'waive': {
        await prisma.tripCharge.update({
          where: { id: chargeId },
          data: {
            chargeStatus: 'WAIVED',
            waivedAt: new Date(),
            waivedBy: 'fleet-admin',
            waiveReason: notes || 'Dispute accepted - charge waived',
            waivePercentage: 100,
            disputeResolvedAt: new Date(),
            disputeResolution: 'Dispute accepted, charge waived'
          }
        })

        await prisma.rentalBooking.update({
          where: { id: tripCharge.bookingId },
          data: {
            paymentStatus: 'CHARGES_WAIVED',
            chargesWaivedAmount: Number(tripCharge.totalCharges),
            chargesWaivedReason: notes || 'Dispute accepted'
          }
        })

        return NextResponse.json({
          success: true,
          resolution: 'waived',
          waivedAmount: Number(tripCharge.totalCharges)
        })
      }

      // ============================================================
      // PARTIAL_WAIVE - Partial waive based on percentage
      // ============================================================
      case 'partial_waive': {
        if (!waivePercentage || waivePercentage <= 0 || waivePercentage >= 100) {
          return NextResponse.json({
            error: 'waivePercentage must be between 1 and 99'
          }, { status: 400 })
        }

        const waivedAmount = (Number(tripCharge.totalCharges) * waivePercentage) / 100
        const remainingAmount = Number(tripCharge.totalCharges) - waivedAmount

        await prisma.tripCharge.update({
          where: { id: chargeId },
          data: {
            chargeStatus: 'ADJUSTED',
            totalCharges: remainingAmount,
            waivedAt: new Date(),
            waivedBy: 'fleet-admin',
            waiveReason: notes || `Partial waive: ${waivePercentage}%`,
            waivePercentage,
            disputeResolvedAt: new Date(),
            disputeResolution: `Partial waive (${waivePercentage}%), remaining: $${remainingAmount.toFixed(2)}`
          }
        })

        return NextResponse.json({
          success: true,
          resolution: 'partial_waived',
          waivePercentage,
          waivedAmount,
          remainingAmount
        })
      }

      // ============================================================
      // ESCALATE - Escalate for further review
      // ============================================================
      case 'escalate': {
        await prisma.tripCharge.update({
          where: { id: chargeId },
          data: {
            requiresApproval: true,
            disputeNotes: `${tripCharge.disputeNotes || ''}\n\nEscalated by fleet admin: ${notes || 'No additional notes'}`
          }
        })

        return NextResponse.json({
          success: true,
          resolution: 'escalated',
          message: 'Dispute escalated for further review'
        })
      }

      default:
        return NextResponse.json({
          error: `Unknown resolution: ${resolution}. Valid: charge_anyway, waive, partial_waive, escalate`
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Fleet guest disputes PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve dispute' },
      { status: 500 }
    )
  }
}
