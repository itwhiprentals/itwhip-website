// app/api/rentals/bookings/[id]/payment-choice/route.ts
// Guest selects payment method (CARD or CASH) for a recruited booking

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { stripe } from '@/app/lib/stripe/client'
import { completeBookingConfirmation } from '@/app/lib/booking/complete-confirmation'
import { calculateAppliedBalances } from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const {
      choice,
      underAge,
      amount: cashappAmount,
      applyCredit = false,
      applyBonus = false,
      applyDeposit = false,
    } = await request.json()

    if (!choice || !['CARD', 'CASH', 'CASHAPP'].includes(choice)) {
      return NextResponse.json({ error: 'Invalid choice. Must be CARD, CASH, or CASHAPP.' }, { status: 400 })
    }

    // Step 1: Find booking by ID with all data needed
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        convertedFromProspect: { select: { id: true } },
        car: { select: { make: true, model: true, year: true } },
        renter: { select: { id: true, email: true } },
      }
    })

    if (!booking) {
      console.error(`[Payment Choice] Booking not found: ${bookingId}`)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Step 2: Verify the authenticated user owns this booking
    // Match by renterId, renter email, or guestEmail (case-insensitive)
    const isOwner =
      (booking.renterId && booking.renterId === user.id) ||
      (booking.renter?.email && booking.renter.email.toLowerCase() === user.email.toLowerCase()) ||
      (booking.guestEmail && booking.guestEmail.toLowerCase() === user.email.toLowerCase())

    if (!isOwner) {
      console.error('[Payment Choice] Ownership check failed:', {
        bookingId: booking.bookingCode,
        authUser: { id: user.id, email: user.email },
        booking: { renterId: booking.renterId, renterEmail: booking.renter?.email, guestEmail: booking.guestEmail },
      })
      return NextResponse.json({ error: 'You are not authorized to modify this booking' }, { status: 403 })
    }

    // Step 3: Check booking state
    if (booking.paymentType) {
      // CARD selected but payment not completed — return existing PI's clientSecret
      // so the guest can finish entering card details
      if (booking.paymentType === 'CARD' && booking.paymentStatus === 'PENDING' && booking.paymentIntentId && choice === 'CARD') {
        const existingPi = await stripe.paymentIntents.retrieve(booking.paymentIntentId)
        console.log(`[Payment Choice] Returning existing PI clientSecret for ${booking.bookingCode} (card form incomplete)`)
        return NextResponse.json({
          success: true,
          paymentType: 'CARD',
          clientSecret: existingPi.client_secret,
        })
      }

      return NextResponse.json(
        { error: 'Payment method already selected', paymentType: booking.paymentType },
        { status: 409 }
      )
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Booking is ${booking.status}, not PENDING` },
        { status: 400 }
      )
    }

    // Step 4: Agreement must be signed before payment selection (for bookings with agreement sent)
    if (booking.agreementStatus && booking.agreementStatus !== 'not_sent' && booking.agreementStatus !== 'signed') {
      return NextResponse.json(
        { error: 'Please sign the rental agreement before selecting a payment method' },
        { status: 400 }
      )
    }

    // Step 5: Must be a recruited or manual booking
    if (!booking.convertedFromProspect && booking.bookingType !== 'MANUAL') {
      return NextResponse.json(
        { error: 'Payment choice is only available for manual bookings' },
        { status: 400 }
      )
    }

    if (choice === 'CASH') {
      // For MANUAL bookings (created via create-from-request), auto-confirm
      // since the host already confirmed when they created the booking
      const isManualBooking = booking.bookingType === 'MANUAL'

      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: {
          paymentType: 'CASH',
          serviceFee: 0,
          totalAmount: booking.subtotal, // No service fee for cash
          notes: (booking.notes || '') + '\n[Guest selected Cash at Pickup]',
          // Auto-confirm for MANUAL bookings (host already confirmed at creation)
          ...(isManualBooking ? {
            status: 'CONFIRMED',
            hostStatus: 'APPROVED',
            hostReviewedAt: new Date(),
          } : {}),
        }
      })

      // Track the platform fee owed by the host
      const feeRate = Number(booking.platformFeeRate) || 0.10
      const platformFee = Number(booking.subtotal) * feeRate
      await prisma.platformFeeOwed.create({
        data: {
          hostId: booking.hostId,
          bookingId,
          amount: platformFee,
          reason: 'cash_booking_commission',
        }
      })

      console.log(`[Payment Choice] Guest ${user.email} selected CASH for booking ${booking.bookingCode}${isManualBooking ? ' (auto-confirmed)' : ''}`)

      // MANUAL bookings: run full confirmation side effects (availability, emails, SMS, notifications)
      if (isManualBooking) {
        completeBookingConfirmation(bookingId, { capturePayment: false })
          .then(result => {
            if (result.success) {
              console.log(`[Payment Choice] ✅ Full confirmation completed for ${booking.bookingCode}`)
            } else {
              console.error(`[Payment Choice] ❌ Confirmation side effects failed for ${booking.bookingCode}:`, result.error)
            }
          })
          .catch(e => console.error(`[Payment Choice] ❌ Confirmation error for ${booking.bookingCode}:`, e))
      }

      return NextResponse.json({
        success: true,
        paymentType: 'CASH',
        autoConfirmed: isManualBooking,
      })
    }

    // Handle under-25 surcharge if flagged (idempotent — only apply once)
    const surchargeAlreadyApplied = booking.notes?.includes('[Young driver under 25 — surcharge applied]')
    if (underAge && !surchargeAlreadyApplied) {
      const surcharge = 50 * (booking.numberOfDays || 1)
      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: {
          securityDeposit: 1500,
          depositAmount: 1500,
          totalAmount: Number(booking.totalAmount) + surcharge,
          notes: (booking.notes || '') + '\n[Young driver under 25 — surcharge applied]',
        }
      })
      console.log(`[Payment Choice] Under-25 surcharge applied: +$${surcharge}, deposit → $1500`)
    } else if (underAge && surchargeAlreadyApplied) {
      console.log(`[Payment Choice] Under-25 surcharge already applied — skipping`)
    }

    // CASHAPP path — guest pays via CashApp, awaits fleet verification
    if (choice === 'CASHAPP') {
      // Re-fetch booking to get up-to-date totalAmount / deposit after any surcharge
      const current = await prisma.rentalBooking.findUnique({
        where: { id: bookingId },
        select: { totalAmount: true, subtotal: true, securityDeposit: true, reviewerProfileId: true, bookingCode: true }
      })
      if (!current) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      // Load guest's wallet balances
      const profile = current.reviewerProfileId
        ? await prisma.reviewerProfile.findUnique({
            where: { id: current.reviewerProfileId },
            select: { id: true, creditBalance: true, bonusBalance: true, depositWalletBalance: true }
          })
        : null

      const effectiveBalances = {
        creditBalance: applyCredit && profile ? profile.creditBalance : 0,
        bonusBalance: applyBonus && profile ? profile.bonusBalance : 0,
        depositWalletBalance: applyDeposit && profile ? profile.depositWalletBalance : 0,
      }

      const applied = calculateAppliedBalances(
        { total: Number(current.totalAmount), basePrice: Number(current.subtotal) } as any,
        Number(current.securityDeposit || 0),
        effectiveBalances,
      )

      const remainingTotal = Math.round((applied.amountToPay + applied.depositFromCard) * 100) / 100
      const fullyCovered = remainingTotal < 1

      // Deduct balances + update booking in a transaction
      await prisma.$transaction(async (tx) => {
        if (profile && applied.creditsApplied > 0) {
          await tx.reviewerProfile.update({
            where: { id: profile.id },
            data: { creditBalance: { decrement: applied.creditsApplied } }
          })
          await tx.creditBonusTransaction.create({
            data: {
              id: crypto.randomUUID(),
              guestId: profile.id,
              amount: applied.creditsApplied,
              type: 'CREDIT',
              action: 'USE',
              balanceAfter: profile.creditBalance - applied.creditsApplied,
              reason: `Applied to booking ${current.bookingCode}`,
              bookingId,
            }
          })
        }

        if (profile && applied.bonusApplied > 0) {
          await tx.reviewerProfile.update({
            where: { id: profile.id },
            data: { bonusBalance: { decrement: applied.bonusApplied } }
          })
          await tx.creditBonusTransaction.create({
            data: {
              id: crypto.randomUUID(),
              guestId: profile.id,
              amount: applied.bonusApplied,
              type: 'BONUS',
              action: 'USE',
              balanceAfter: profile.bonusBalance - applied.bonusApplied,
              reason: `Applied to booking ${current.bookingCode} (25% max)`,
              bookingId,
            }
          })
        }

        if (profile && applied.depositFromWallet > 0) {
          await tx.reviewerProfile.update({
            where: { id: profile.id },
            data: { depositWalletBalance: { decrement: applied.depositFromWallet } }
          })
          await tx.depositTransaction.create({
            data: {
              id: crypto.randomUUID(),
              guestId: profile.id,
              amount: applied.depositFromWallet,
              type: 'HOLD',
              balanceAfter: profile.depositWalletBalance - applied.depositFromWallet,
              bookingId,
              description: `Security deposit hold for booking ${current.bookingCode}`
            }
          })
        }

        await tx.rentalBooking.update({
          where: { id: bookingId },
          data: {
            paymentType: 'CASHAPP',
            paymentStatus: fullyCovered ? 'PAID' : 'PENDING',
            creditsApplied: applied.creditsApplied,
            bonusApplied: applied.bonusApplied,
            depositFromWallet: applied.depositFromWallet,
            chargeAmount: remainingTotal,
            ...(fullyCovered ? {
              status: 'CONFIRMED',
              hostStatus: 'APPROVED',
              hostReviewedAt: new Date(),
              notes: (booking.notes || '') + `\n[Fully covered by wallet balances — credits: $${applied.creditsApplied}, bonus: $${applied.bonusApplied}, deposit: $${applied.depositFromWallet}]`,
            } : {
              notes: (booking.notes || '') + `\n[Guest paid via CashApp — amount: $${remainingTotal} — awaiting fleet verification. Balances applied: credits $${applied.creditsApplied}, bonus $${applied.bonusApplied}, deposit $${applied.depositFromWallet}]`,
            })
          }
        })
      })

      if (fullyCovered) {
        console.log(`[Payment Choice] Guest ${user.email} fully covered booking ${current.bookingCode} via wallet — auto-confirming`)
        completeBookingConfirmation(bookingId, { capturePayment: false })
          .then(r => r.success
            ? console.log(`[Payment Choice] ✅ Auto-confirmed ${current.bookingCode}`)
            : console.error(`[Payment Choice] ❌ Auto-confirm side effects failed:`, r.error))
          .catch(e => console.error(`[Payment Choice] ❌ Auto-confirm error:`, e))

        return NextResponse.json({
          success: true,
          paymentType: 'CASHAPP',
          fullyCovered: true,
          autoConfirmed: true,
        })
      }

      // Notify fleet for verification
      try {
        await prisma.pushNotification.create({
          data: {
            userId: 'FLEET_ADMIN',
            title: 'CashApp Payment Received',
            body: `${booking.guestName || 'Guest'} paid $${remainingTotal} via CashApp for ${booking.bookingCode}. Verify and confirm.`,
            type: 'cashapp_payment',
            data: { bookingId, bookingCode: booking.bookingCode, amount: remainingTotal },
          }
        }).catch(() => {})
      } catch {}

      console.log(`[Payment Choice] Guest ${user.email} paid $${remainingTotal} via CASHAPP for ${booking.bookingCode} — awaiting verification`)

      return NextResponse.json({
        success: true,
        paymentType: 'CASHAPP',
        status: 'AWAITING_VERIFICATION',
        remainingTotal,
        applied,
      })
    }

    // CARD path — create Stripe PaymentIntent with manual capture
    const amount = Math.round(Number(booking.totalAmount) * 100) // cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      capture_method: 'manual',
      payment_method_options: {
        card: {
          request_extended_authorization: 'if_available',
        },
      },
      metadata: {
        bookingId,
        bookingCode: booking.bookingCode,
        type: 'recruited_booking_payment',
        guestEmail: user.email,
      },
      receipt_email: user.email,
      description: `ItWhip Rental — ${booking.car?.year} ${booking.car?.make} ${booking.car?.model} (${booking.bookingCode})`,
      statement_descriptor_suffix: 'ITWHIP RENTAL',
    })

    // Update booking with PaymentIntent info
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        paymentType: 'CARD',
        paymentIntentId: paymentIntent.id,
      }
    })

    console.log(`[Payment Choice] Guest ${user.email} selected CARD for booking ${booking.bookingCode}, PI: ${paymentIntent.id}`)

    return NextResponse.json({
      success: true,
      paymentType: 'CARD',
      clientSecret: paymentIntent.client_secret,
    })

  } catch (error) {
    console.error('[Payment Choice] Error:', error)
    return NextResponse.json({ error: 'Failed to process payment choice' }, { status: 500 })
  }
}
