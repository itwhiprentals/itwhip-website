// app/api/fleet/guests/[id]/banking/route.ts
// Guest Banking API - Overview and Actions

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe/client'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'
import { sendRefundConfirmationEmail } from '@/app/lib/email/refund-confirmation-email'
import { nanoid } from 'nanoid'

// Fleet access key
const FLEET_KEY = 'phoenix-fleet-2847'

function verifyFleetAccess(request: NextRequest): boolean {
  const urlKey = request.nextUrl.searchParams.get('key')
  const headerKey = request.headers.get('x-fleet-key')
  return urlKey === FLEET_KEY || headerKey === FLEET_KEY
}

// GET - Fetch guest banking overview
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyFleetAccess(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: guestId } = await params

    // Fetch guest profile with related data
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      include: {
        user: {
          include: {
            paymentMethods: true
          }
        },
        RentalBooking: {
          where: {
            OR: [
              { status: 'ACTIVE' },
              { status: 'COMPLETED' },
              { paymentStatus: { in: ['PENDING_CHARGES', 'PARTIAL_PAID'] } }
            ]
          },
          include: {
            car: {
              select: { id: true, make: true, model: true, year: true }
            },
            tripCharges: true,
            RefundRequest: true
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Fetch payment methods from Stripe if customer exists
    let stripePaymentMethods: any[] = []
    if (guest.stripeCustomerId) {
      try {
        const methods = await stripe.paymentMethods.list({
          customer: guest.stripeCustomerId,
          type: 'card'
        })
        stripePaymentMethods = methods.data.map(pm => ({
          id: pm.id,
          brand: pm.card?.brand || 'unknown',
          last4: pm.card?.last4 || '****',
          expiryMonth: pm.card?.exp_month,
          expiryYear: pm.card?.exp_year,
          isDefault: false // Will check against bookings
        }))
      } catch (stripeError) {
        console.error('Error fetching Stripe payment methods:', stripeError)
      }
    }

    // Determine locked payment methods (used in active bookings)
    const guestData = guest as any
    const activeBookings = (guestData.RentalBooking || []).filter((b: any) => b.status === 'ACTIVE')
    const lockedPaymentMethodIds = activeBookings
      .map((b: any) => b.stripePaymentMethodId)
      .filter(Boolean)

    // Mark locked payment methods (locked for active bookings)
    // Note: Claim-based locking is determined after claims are fetched
    stripePaymentMethods = stripePaymentMethods.map(pm => ({
      ...pm,
      isLocked: lockedPaymentMethodIds.includes(pm.id),
      lockedForBooking: activeBookings.find((b: any) => b.stripePaymentMethodId === pm.id)?.bookingCode,
      isLockedForClaim: false // Will be updated after claims fetch
    }))

    // Aggregate charges
    const bookings = guestData.RentalBooking || []
    const allCharges = bookings.flatMap((b: any) =>
      (b.tripCharges || []).map((tc: any) => ({
        ...tc,
        bookingCode: b.bookingCode,
        bookingId: b.id,
        carName: `${b.car?.year} ${b.car?.make} ${b.car?.model}`
      }))
    )

    const pendingCharges = allCharges.filter((c: any) => c.chargeStatus === 'PENDING')
    const disputedCharges = allCharges.filter((c: any) => c.chargeStatus === 'DISPUTED')
    const completedCharges = allCharges.filter((c: any) => c.chargeStatus === 'CHARGED')

    // Calculate totals
    const totalPendingAmount = pendingCharges.reduce((sum: number, c: any) =>
      sum + Number(c.totalCharges || 0), 0
    )
    const totalDisputedAmount = disputedCharges.reduce((sum: number, c: any) =>
      sum + Number(c.totalCharges || 0), 0
    )

    // Aggregate refunds
    const allRefunds = bookings.flatMap((b: any) =>
      (b.RefundRequest || []).map((r: any) => ({
        ...r,
        bookingCode: b.bookingCode,
        carName: `${b.car?.year} ${b.car?.make} ${b.car?.model}`
      }))
    )
    const pendingRefunds = allRefunds.filter((r: any) => r.status === 'PENDING')

    // Calculate total spent (completed bookings)
    const totalSpent = bookings
      .filter((b: any) => b.status === 'COMPLETED' && b.paymentStatus === 'PAID')
      .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)

    // Fetch recent transactions (credits/bonus)
    const recentTransactions = await prisma.creditBonusTransaction.findMany({
      where: { guestId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Fetch claims against this guest
    const claimsAgainstGuest = await prisma.claim.findMany({
      where: {
        booking: { reviewedBy: guestId },
        status: { in: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'GUEST_RESPONDED'] }
      },
      include: {
        booking: {
          include: {
            car: { select: { year: true, make: true, model: true } },
            host: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Map claims to response format
    const activeClaims = claimsAgainstGuest.map((claim: any) => ({
      id: claim.id,
      type: claim.type,
      status: claim.status,
      estimatedCost: Number(claim.estimatedCost || 0),
      approvedAmount: claim.approvedAmount ? Number(claim.approvedAmount) : null,
      deductible: Number(claim.deductible || 500),
      guestResponseDeadline: claim.guestResponseDeadline?.toISOString() || null,
      bookingCode: claim.booking?.bookingCode || '',
      carDetails: claim.booking?.car
        ? `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`
        : 'Unknown Vehicle',
      hostName: claim.booking?.host?.name || 'Unknown Host'
    }))

    const totalClaimAmount = activeClaims.reduce(
      (sum: number, c: any) => sum + (c.approvedAmount || c.estimatedCost), 0
    )

    // Mark payment methods as locked if there are active claims
    if (activeClaims.length > 0) {
      stripePaymentMethods = stripePaymentMethods.map(pm => ({
        ...pm,
        isLockedForClaim: true // Lock all payment methods when there's an active claim
      }))
    }

    // Fetch Stripe payment intents for audit trail
    let stripePaymentIntents: any[] = []
    if (guest.stripeCustomerId) {
      try {
        const paymentIntents = await stripe.paymentIntents.list({
          customer: guest.stripeCustomerId,
          limit: 25,
          expand: ['data.latest_charge']
        })

        stripePaymentIntents = paymentIntents.data.map(pi => {
          const charge = pi.latest_charge && typeof pi.latest_charge === 'object' ? pi.latest_charge : null
          const riskScore = (charge as any)?.outcome?.risk_score || null
          const riskLevel = (charge as any)?.outcome?.risk_level || null
          const radarRule = (charge as any)?.outcome?.rule || null

          return {
            id: pi.id,
            amount: pi.amount / 100,
            currency: pi.currency,
            status: pi.status,
            captureMethod: pi.capture_method,
            created: new Date(pi.created * 1000).toISOString(),
            canceledAt: pi.canceled_at ? new Date(pi.canceled_at * 1000).toISOString() : null,
            cancellationReason: pi.cancellation_reason,
            description: pi.description,
            // Card info from the payment method
            paymentMethod: pi.payment_method && typeof pi.payment_method === 'object' ? {
              id: pi.payment_method.id,
              brand: (pi.payment_method as any).card?.brand || null,
              last4: (pi.payment_method as any).card?.last4 || null
            } : pi.payment_method ? { id: pi.payment_method } : null,
            // Risk / Radar evaluation
            risk: riskScore !== null ? {
              score: riskScore,
              level: riskLevel,
              rule: radarRule?.id || null,
              action: radarRule?.action || null
            } : null,
            // Booking metadata from the payment intent
            metadata: pi.metadata || {},
            // Status display helpers
            statusLabel: pi.status === 'requires_capture' ? 'Authorized (Uncaptured)'
              : pi.status === 'requires_action' ? 'Requires 3DS'
              : pi.status === 'requires_payment_method' ? 'Payment Failed'
              : pi.status === 'canceled' ? 'Canceled'
              : pi.status === 'succeeded' ? 'Captured'
              : pi.status === 'processing' ? 'Processing'
              : pi.status,
            isActionable: pi.status === 'requires_capture' // Can be captured or canceled
          }
        })
      } catch (stripeError) {
        console.error('Error fetching Stripe payment intents:', stripeError)
      }
    }

    // Build response
    const response = {
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        profilePhotoUrl: guest.profilePhotoUrl,
        stripeCustomerId: guest.stripeCustomerId
      },
      wallet: {
        creditBalance: guest.creditBalance || 0,
        bonusBalance: guest.bonusBalance || 0,
        depositWalletBalance: guest.depositWalletBalance || 0,
        totalBalance: (guest.creditBalance || 0) + (guest.bonusBalance || 0) + (guest.depositWalletBalance || 0)
      },
      paymentMethods: stripePaymentMethods,
      summary: {
        totalSpent,
        pendingChargesCount: pendingCharges.length,
        pendingChargesAmount: totalPendingAmount,
        disputedChargesCount: disputedCharges.length,
        disputedChargesAmount: totalDisputedAmount,
        pendingRefundsCount: pendingRefunds.length,
        activeBookingsCount: activeBookings.length
      },
      alerts: {
        hasPendingCharges: pendingCharges.length > 0,
        hasDisputedCharges: disputedCharges.length > 0,
        hasPendingRefunds: pendingRefunds.length > 0,
        hasLockedPaymentMethod: lockedPaymentMethodIds.length > 0,
        hasActiveClaim: activeClaims.length > 0
      },
      activeClaims,
      totalClaimAmount,
      recentActivity: [
        ...pendingCharges.slice(0, 5).map((c: any) => ({
          type: 'charge_pending',
          amount: Number(c.totalCharges),
          description: `Pending charges - ${c.carName}`,
          bookingCode: c.bookingCode,
          date: c.createdAt,
          chargeId: c.id
        })),
        ...completedCharges.slice(0, 5).map((c: any) => ({
          type: 'charge_completed',
          amount: Number(c.chargedAmount || c.totalCharges),
          description: `Charged - ${c.carName}`,
          bookingCode: c.bookingCode,
          date: c.chargedAt || c.updatedAt,
          chargeId: c.id
        })),
        ...recentTransactions.slice(0, 5).map((t: any) => ({
          type: t.type === 'BONUS' ? 'bonus_added' : 'credit_change',
          amount: t.amount,
          description: t.reason || `${t.action} ${t.type.toLowerCase()}`,
          date: t.createdAt
        })),
        ...stripePaymentIntents.slice(0, 10).map((pi: any) => ({
          type: `payment_${pi.status}`,
          amount: pi.amount,
          description: `${pi.statusLabel} — $${pi.amount.toFixed(2)}${pi.metadata?.carId ? ` (${pi.metadata.insurance || 'rental'})` : ''}`,
          date: pi.created,
          paymentIntentId: pi.id,
          risk: pi.risk
        }))
      ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15),
      charges: {
        pending: pendingCharges,
        disputed: disputedCharges,
        completed: completedCharges.slice(0, 10)
      },
      refunds: {
        pending: pendingRefunds,
        completed: allRefunds.filter((r: any) => r.status === 'APPROVED' || r.status === 'PROCESSED').slice(0, 10)
      },
      activeBookings: activeBookings.map((b: any) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        carName: `${b.car?.year} ${b.car?.make} ${b.car?.model}`,
        startDate: b.startDate,
        endDate: b.endDate,
        paymentMethodId: b.stripePaymentMethodId
      })),
      // Stripe Payment Intents audit trail
      audit: {
        paymentIntents: stripePaymentIntents,
        summary: {
          total: stripePaymentIntents.length,
          authorized: stripePaymentIntents.filter(pi => pi.status === 'requires_capture').length,
          captured: stripePaymentIntents.filter(pi => pi.status === 'succeeded').length,
          canceled: stripePaymentIntents.filter(pi => pi.status === 'canceled').length,
          failed: stripePaymentIntents.filter(pi => ['requires_action', 'requires_payment_method'].includes(pi.status)).length,
          totalAuthorized: stripePaymentIntents
            .filter(pi => pi.status === 'requires_capture')
            .reduce((sum: number, pi: any) => sum + pi.amount, 0),
          totalCaptured: stripePaymentIntents
            .filter(pi => pi.status === 'succeeded')
            .reduce((sum: number, pi: any) => sum + pi.amount, 0),
          totalCanceled: stripePaymentIntents
            .filter(pi => pi.status === 'canceled')
            .reduce((sum: number, pi: any) => sum + pi.amount, 0)
        }
      }
    }

    return NextResponse.json({ success: true, ...response })

  } catch (error) {
    console.error('Fleet guest banking GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banking data' },
      { status: 500 }
    )
  }
}

// POST - Perform banking actions
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
    const { action, ...actionData } = body

    // Fetch guest
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      include: {
        user: true
      }
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    switch (action) {
      // ============================================================
      // CHARGE - Charge a pending TripCharge to guest's card
      // ============================================================
      case 'charge': {
        const { chargeId, paymentMethodId } = actionData

        if (!chargeId) {
          return NextResponse.json({ error: 'chargeId is required' }, { status: 400 })
        }

        // Fetch the charge
        const tripCharge = await prisma.tripCharge.findUnique({
          where: { id: chargeId },
          include: {
            booking: true
          }
        })

        if (!tripCharge) {
          return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
        }

        if (tripCharge.chargeStatus !== 'PENDING' && tripCharge.chargeStatus !== 'FAILED') {
          return NextResponse.json({
            error: `Charge is not in a chargeable state (current: ${tripCharge.chargeStatus})`
          }, { status: 400 })
        }

        // Get payment method (use provided or booking's default)
        const pmId = paymentMethodId || tripCharge.booking.stripePaymentMethodId
        const customerId = guest.stripeCustomerId || tripCharge.booking.stripeCustomerId

        if (!customerId || !pmId) {
          return NextResponse.json({
            error: 'No payment method available for this guest'
          }, { status: 400 })
        }

        // Attempt to charge
        const amountCents = Math.round(Number(tripCharge.totalCharges) * 100)
        const result = await PaymentProcessor.chargeAdditionalFees(
          customerId,
          pmId,
          amountCents,
          `Trip charges for booking ${tripCharge.booking.bookingCode}`,
          {
            booking_id: tripCharge.bookingId,
            charge_id: tripCharge.id,
            guest_id: guestId
          }
        )

        // Update charge record
        if (result.status === 'succeeded') {
          await prisma.tripCharge.update({
            where: { id: chargeId },
            data: {
              chargeStatus: 'CHARGED',
              stripeChargeId: result.chargeId,
              chargedAt: new Date(),
              chargedAmount: Number(tripCharge.totalCharges),
              chargeAttempts: { increment: 1 }
            }
          })

          // Update booking payment status
          await prisma.rentalBooking.update({
            where: { id: tripCharge.bookingId },
            data: { paymentStatus: 'CHARGES_PAID' }
          })

          return NextResponse.json({
            success: true,
            action: 'charged',
            chargeId: result.chargeId,
            amount: result.amount
          })
        } else {
          // Update with failure
          await prisma.tripCharge.update({
            where: { id: chargeId },
            data: {
              chargeStatus: 'FAILED',
              failureReason: result.error,
              lastAttemptAt: new Date(),
              chargeAttempts: { increment: 1 },
              nextRetryAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Retry in 24h
            }
          })

          return NextResponse.json({
            success: false,
            action: 'charge_failed',
            error: result.error
          }, { status: 400 })
        }
      }

      // ============================================================
      // WAIVE - Waive a charge with reason
      // ============================================================
      case 'waive': {
        const { chargeId, reason, waivePercentage = 100 } = actionData

        if (!chargeId || !reason) {
          return NextResponse.json({ error: 'chargeId and reason are required' }, { status: 400 })
        }

        const tripCharge = await prisma.tripCharge.findUnique({
          where: { id: chargeId }
        })

        if (!tripCharge) {
          return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
        }

        const waivedAmount = (Number(tripCharge.totalCharges) * waivePercentage) / 100

        await prisma.tripCharge.update({
          where: { id: chargeId },
          data: {
            chargeStatus: waivePercentage === 100 ? 'WAIVED' : 'ADJUSTED',
            waivedAt: new Date(),
            waivedBy: 'fleet-admin',
            waiveReason: reason,
            waivePercentage
          }
        })

        // Update booking if full waive
        if (waivePercentage === 100) {
          await prisma.rentalBooking.update({
            where: { id: tripCharge.bookingId },
            data: {
              paymentStatus: 'CHARGES_WAIVED',
              chargesWaivedAmount: waivedAmount,
              chargesWaivedReason: reason
            }
          })
        }

        return NextResponse.json({
          success: true,
          action: 'waived',
          waivedAmount,
          waivePercentage
        })
      }

      // ============================================================
      // REFUND - Process a refund for a booking
      // ============================================================
      case 'refund': {
        const { bookingId, amount, reason } = actionData

        if (!bookingId || !amount || !reason) {
          return NextResponse.json({
            error: 'bookingId, amount, and reason are required'
          }, { status: 400 })
        }

        // Fetch booking
        const booking = await prisma.rentalBooking.findUnique({
          where: { id: bookingId }
        })

        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        if (!booking.stripeChargeId && !booking.paymentIntentId) {
          return NextResponse.json({
            error: 'No payment found to refund'
          }, { status: 400 })
        }

        // Process refund via Stripe
        try {
          const refund = await PaymentProcessor.refundPayment(
            booking.paymentIntentId!,
            amount,
            'requested_by_customer'
          )

          // Create refund request record
          await prisma.refundRequest.create({
            data: {
              id: nanoid(),
              bookingId,
              requestedBy: 'fleet-admin',
              requestedByType: 'FLEET',
              amount,
              reason,
              status: 'PROCESSED',
              processedAt: new Date(),
              stripeRefundId: refund.id,
              autoApproved: true
            } as any
          })

          // Update booking
          const newRefundTotal = (booking.depositRefunded || 0) + amount
          await prisma.rentalBooking.update({
            where: { id: bookingId },
            data: {
              paymentStatus: amount >= booking.totalAmount ? 'REFUNDED' : 'PARTIAL_REFUND',
              depositRefunded: newRefundTotal,
              depositRefundedAt: new Date()
            }
          })

          // Send refund confirmation email (fire-and-forget)
          if (booking.guestEmail) {
            const car = booking.carId ? await prisma.car.findUnique({
              where: { id: booking.carId },
              select: { make: true, model: true }
            }) : null
            const fmtDate = (d: Date | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
            const tripDates = `${fmtDate(booking.startDate)} - ${fmtDate(booking.endDate)}`

            sendRefundConfirmationEmail({
              guestEmail: booking.guestEmail,
              guestName: booking.guestName,
              bookingCode: booking.bookingCode,
              carMake: car?.make || 'Vehicle',
              carModel: car?.model || '',
              refundAmount: amount,
              originalTotal: Number(booking.totalAmount || 0),
              refundReason: reason,
              refundType: amount >= booking.totalAmount ? 'full' : 'partial',
              tripDates,
            }).catch(() => {})
          }

          return NextResponse.json({
            success: true,
            action: 'refunded',
            refundId: refund.id,
            amount: refund.amount / 100
          })
        } catch (refundError: any) {
          return NextResponse.json({
            success: false,
            error: refundError.message || 'Refund failed'
          }, { status: 400 })
        }
      }

      // ============================================================
      // ADD_BONUS - Add promotional bonus credits
      // ============================================================
      case 'add_bonus': {
        const { amount, reason } = actionData

        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
        }

        if (!reason) {
          return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
        }

        const currentBalance = guest.bonusBalance || 0
        const newBalance = currentBalance + amount

        // Update guest balance
        await prisma.reviewerProfile.update({
          where: { id: guestId },
          data: { bonusBalance: newBalance }
        })

        // Create transaction record
        await prisma.creditBonusTransaction.create({
          data: {
            id: nanoid(),
            guestId,
            type: 'BONUS',
            action: 'ADD',
            amount,
            balanceAfter: newBalance,
            reason,
            adjustedBy: 'fleet-admin'
          }
        })

        return NextResponse.json({
          success: true,
          action: 'bonus_added',
          amount,
          newBalance
        })
      }

      // ============================================================
      // ESCALATE_DISPUTE - Escalate a disputed charge to manual review
      // ============================================================
      case 'escalate_dispute': {
        const { chargeId, notes } = actionData

        if (!chargeId) {
          return NextResponse.json({ error: 'chargeId is required' }, { status: 400 })
        }

        const tripCharge = await prisma.tripCharge.findUnique({
          where: { id: chargeId }
        })

        if (!tripCharge) {
          return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
        }

        // Update charge to escalated status
        await prisma.tripCharge.update({
          where: { id: chargeId },
          data: {
            chargeStatus: 'DISPUTED',
            disputeNotes: notes || 'Escalated by fleet admin for manual review',
            disputedAt: new Date(),
            requiresApproval: true
          }
        })

        return NextResponse.json({
          success: true,
          action: 'escalated',
          chargeId
        })
      }

      default:
        return NextResponse.json({
          error: `Unknown action: ${action}. Valid actions: charge, waive, refund, add_bonus, escalate_dispute`
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Fleet guest banking POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process banking action' },
      { status: 500 }
    )
  }
}
