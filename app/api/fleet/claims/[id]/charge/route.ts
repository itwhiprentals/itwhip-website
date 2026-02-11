// app/api/fleet/claims/[id]/charge/route.ts
// Endpoint to charge a guest for an approved claim and transfer funds to host

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'
import { formatAmountForStripe } from '@/app/lib/stripe/client'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as any
})

// Platform fee: 3.5% + $1.50 for claim recovery processing
const PLATFORM_FEE_PERCENT = 0.035
const PLATFORM_FEE_FIXED = 1.50

interface ChargeClaimBody {
  amount: number
  chargeType: 'deductible' | 'damage' | 'full' | 'partial'
  notes?: string
  adminEmail: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ChargeClaimBody = await request.json()
    const { amount, chargeType, notes, adminEmail } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid charge amount is required' },
        { status: 400 }
      )
    }

    if (!chargeType) {
      return NextResponse.json(
        { error: 'Charge type is required (deductible, damage, full, or partial)' },
        { status: 400 }
      )
    }

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email is required for audit trail' },
        { status: 400 }
      )
    }

    // Fetch claim with all related data
    const claim = await prisma.claim.findUnique({
      where: { id: id },
      include: {
        booking: {
          include: {
            reviewerProfile: {
              select: {
                id: true,
                name: true,
                email: true,
                stripeCustomerId: true
              }
            },
            car: {
              select: {
                year: true,
                make: true,
                model: true
              }
            }
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeConnectAccountId: true,
            currentBalance: true
          }
        }
      }
    }) as any

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Validate claim status
    if (claim.status !== 'APPROVED' && claim.status !== 'GUEST_RESPONDED') {
      return NextResponse.json(
        { error: `Cannot charge guest. Claim status is ${claim.status}, must be APPROVED or GUEST_RESPONDED` },
        { status: 400 }
      )
    }

    // Validate guest has Stripe customer
    const guestProfile = claim.booking.reviewerProfile
    if (!guestProfile?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Guest does not have a Stripe customer ID. Cannot process charge.' },
        { status: 400 }
      )
    }

    // Get guest's default payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: guestProfile.stripeCustomerId,
      type: 'card'
    })

    if (!paymentMethods.data.length) {
      return NextResponse.json(
        { error: 'Guest has no payment methods on file. Cannot process charge.' },
        { status: 400 }
      )
    }

    const defaultPaymentMethod = paymentMethods.data[0]

    // Calculate fees
    const platformFee = (amount * PLATFORM_FEE_PERCENT) + PLATFORM_FEE_FIXED
    const hostPayout = amount - platformFee

    // Format description
    const carDetails = `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`
    const chargeDescription = `Claim recovery (${chargeType}): ${carDetails} - Booking ${claim.booking.bookingCode || 'N/A'}`

    // ==========================================================================
    // STEP 1: Charge the guest
    // ==========================================================================

    const chargeResult = await PaymentProcessor.chargeAdditionalFees(
      guestProfile.stripeCustomerId,
      defaultPaymentMethod.id,
      formatAmountForStripe(amount),
      chargeDescription,
      {
        claim_id: claim.id,
        booking_id: claim.bookingId,
        host_id: claim.hostId,
        charge_type: chargeType,
        platform_fee: platformFee.toFixed(2),
        host_payout: hostPayout.toFixed(2)
      }
    )

    if (chargeResult.status !== 'succeeded') {
      // Log failed charge attempt
      await (prisma.auditLog.create as any)({
        data: {
          category: 'FINANCIAL',
          eventType: 'CLAIM_CHARGE_FAILED',
          severity: 'WARNING',
          adminEmail,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          action: 'charge_guest_for_claim',
          resource: 'Claim',
          resourceId: id,
          amount,
          details: {
            claimId: id,
            guestId: guestProfile.id,
            chargeType,
            error: chargeResult.error,
            stripeChargeId: chargeResult.chargeId
          },
          hash: ''
        }
      })

      return NextResponse.json(
        {
          success: false,
          error: chargeResult.error || 'Failed to charge guest',
          chargeId: chargeResult.chargeId
        },
        { status: 400 }
      )
    }

    // ==========================================================================
    // STEP 2: Transfer funds to host's Connect account (minus platform fee)
    // ==========================================================================

    let transferId: string | null = null

    if (claim.host.stripeConnectAccountId && hostPayout > 0) {
      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(hostPayout * 100), // Convert to cents
          currency: 'usd',
          destination: claim.host.stripeConnectAccountId,
          description: `Claim recovery payout - ${claim.id}`,
          metadata: {
            claim_id: claim.id,
            booking_id: claim.bookingId,
            host_id: claim.hostId,
            original_charge: amount.toString(),
            platform_fee: platformFee.toFixed(2),
            charge_type: chargeType
          }
        })

        transferId = transfer.id
        console.log('✅ Transfer to host successful:', transferId)

        // Update host balance
        await prisma.rentalHost.update({
          where: { id: claim.hostId },
          data: {
            currentBalance: { increment: hostPayout },
            totalPayoutsAmount: { increment: hostPayout },
            totalPayoutsCount: { increment: 1 }
          }
        })
      } catch (transferError: any) {
        console.error('❌ Transfer to host failed:', transferError.message)
        // Continue - the charge succeeded, transfer failure is not critical
        // Funds will need to be manually transferred
      }
    } else if (!claim.host.stripeConnectAccountId) {
      console.warn('⚠️ Host has no Stripe Connect account. Funds held in platform balance.')
    }

    // ==========================================================================
    // STEP 3: Update claim recovery status
    // ==========================================================================

    const previousRecovered = Number(claim.recoveredFromGuest) || 0
    const newRecoveredTotal = previousRecovered + amount
    const approvedAmount = Number(claim.approvedAmount) || 0

    // Determine recovery status
    let recoveryStatus: string
    if (newRecoveredTotal >= approvedAmount) {
      recoveryStatus = 'FULL'
    } else if (newRecoveredTotal > 0) {
      recoveryStatus = 'PARTIAL'
    } else {
      recoveryStatus = 'PENDING'
    }

    const updatedClaim = await (prisma.claim.update as any)({
      where: { id: id },
      data: {
        recoveredFromGuest: newRecoveredTotal,
        recoveryStatus,
        lastChargedAt: new Date(),
        lastChargeAmount: amount,
        stripeChargeId: chargeResult.chargeId,
        // Remove account hold if fully recovered
        ...(recoveryStatus === 'FULL' && { accountHoldApplied: false })
      }
    })

    // If fully recovered, release guest account hold
    if (recoveryStatus === 'FULL' && guestProfile) {
      await prisma.reviewerProfile.update({
        where: { id: guestProfile.id },
        data: {
          accountOnHold: false,
          accountHoldReason: null,
          accountHoldClaimId: null,
          accountHoldAppliedAt: null
        }
      })
    }

    // ==========================================================================
    // STEP 4: Create audit log
    // ==========================================================================

    await (prisma.auditLog.create as any)({
      data: {
        category: 'FINANCIAL',
        eventType: 'CLAIM_GUEST_CHARGED',
        severity: 'INFO',
        adminEmail,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'charge_guest_for_claim',
        resource: 'Claim',
        resourceId: id,
        amount,
        currency: 'USD',
        details: {
          claimId: id,
          bookingId: claim.bookingId,
          guestId: guestProfile.id,
          guestEmail: guestProfile.email,
          hostId: claim.hostId,
          hostName: claim.host.name,
          chargeType,
          chargeAmount: amount,
          platformFee,
          hostPayout,
          stripeChargeId: chargeResult.chargeId,
          stripeTransferId: transferId,
          recoveryStatus,
          totalRecovered: newRecoveredTotal,
          approvedAmount,
          notes
        },
        hash: ''
      }
    })

    // ==========================================================================
    // STEP 5: Send receipt email to guest (non-blocking)
    // ==========================================================================

    // TODO: Implement guest receipt email
    // This would call a function like sendClaimChargeReceiptEmail()
    console.log('📧 Guest charge receipt email would be sent to:', guestProfile.email)

    // ==========================================================================
    // Return success response
    // ==========================================================================

    return NextResponse.json({
      success: true,
      data: {
        chargeId: chargeResult.chargeId,
        transferId,
        chargedAmount: amount,
        platformFee,
        hostPayout,
        recoveryStatus,
        totalRecovered: newRecoveredTotal,
        approvedAmount,
        fullyRecovered: recoveryStatus === 'FULL',
        guestAccountHoldReleased: recoveryStatus === 'FULL'
      },
      message: `Successfully charged guest $${amount.toFixed(2)}. Host receives $${hostPayout.toFixed(2)} after platform fee.`
    })

  } catch (error: any) {
    console.error('Error charging guest for claim:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process claim charge' },
      { status: 500 }
    )
  }
}
