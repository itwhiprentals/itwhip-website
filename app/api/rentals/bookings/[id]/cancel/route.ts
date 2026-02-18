// app/api/rentals/bookings/[id]/cancel/route.ts
// Guest-facing cancellation endpoint
// Uses Turo-style day-based penalties with proportional credit/bonus handling

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendHostBookingCancelledEmail } from '@/app/lib/email/host-booking-cancelled-email'
import { calculateCancellationRefund, calculatePenaltyDistribution } from '@/app/lib/booking/cancellation-policy'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        renterId: true,
        guestEmail: true,
        paymentStatus: true,
        paymentIntentId: true,
        totalAmount: true,
        subtotal: true,
        numberOfDays: true,
        dailyRate: true,
        startDate: true,
        endDate: true,
        bookingCode: true,
        guestName: true,
        guestPhone: true,
        reviewerProfileId: true,
        hostId: true,
        creditsApplied: true,
        bonusApplied: true,
        chargeAmount: true,
        depositFromWallet: true,
        depositFromCard: true,
        securityDeposit: true,
        car: { select: { year: true, make: true, model: true } },
        host: { select: { name: true, email: true, phone: true } }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify ownership via JWT identity only (no spoofable headers)
    const isOwner = (user.id && booking.renterId === user.id) ||
                    (user.email && booking.guestEmail === user.email)

    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only allow cancellation of PENDING or CONFIRMED bookings
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: `Cannot cancel a booking with status: ${booking.status}` },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const reason = body.reason || 'Guest requested cancellation'

    // Cancel the booking
    const cancelledBooking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: 'GUEST',
        cancellationReason: reason
      },
      select: {
        id: true,
        status: true,
        cancelledAt: true,
        paymentStatus: true,
        paymentIntentId: true,
        totalAmount: true
      }
    })

    // Calculate day-based penalty — only the base rental (subtotal) is refundable
    // Service fee, insurance, and delivery fee are always non-refundable
    const tripCost = Number(booking.totalAmount || 0)
    const subtotal = Number(booking.subtotal || tripCost)
    const days = booking.numberOfDays || Math.max(1, Math.ceil(
      ((booking.endDate?.getTime() || 0) - (booking.startDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)
    ))
    const cancellation = calculateCancellationRefund(booking.startDate!, subtotal, days)

    // Calculate proportional penalty distribution across payment sources
    const creditsApplied = Number(booking.creditsApplied || 0)
    const bonusApplied = Number(booking.bonusApplied || 0)
    const chargeAmount = Number(booking.chargeAmount || 0)
    const depositFromCard = Number(booking.depositFromCard || 0)
    const depositFromWallet = Number(booking.depositFromWallet || 0)
    const securityDeposit = Number(booking.securityDeposit || 0)

    // Cap each source at the refundable base (subtotal) for distribution
    const refundableCredits = Math.min(creditsApplied, subtotal)
    const refundableBonus = Math.min(bonusApplied, Math.max(0, subtotal - refundableCredits))
    const refundableCard = Math.max(0, subtotal - refundableCredits - refundableBonus)

    const distribution = calculatePenaltyDistribution(
      cancellation.penaltyAmount,
      subtotal,
      refundableCredits,
      refundableBonus,
      refundableCard
    )

    // The $1 minimum Stripe validation charge (when credits cover 100%) is always refunded
    const isValidationOnly = chargeAmount <= 1 && (creditsApplied + bonusApplied) >= tripCost
    const cardValidationRefund = isValidationOnly ? chargeAmount : 0

    console.log(`[Cancel Booking] Policy: ${cancellation.label} (${cancellation.hoursUntilPickup.toFixed(1)}h before pickup)`)
    console.log(`[Cancel Booking] Trip total: $${tripCost}, refundable base (subtotal): $${subtotal} over ${days} days`)
    console.log(`[Cancel Booking] Penalty: $${cancellation.penaltyAmount} (${cancellation.penaltyDays} days, avg daily: $${cancellation.averageDailyCost.toFixed(2)})`)
    console.log(`[Cancel Booking] Penalty split → card: $${distribution.penaltyFromCard}, credits: $${distribution.penaltyFromCredits}, bonus: $${distribution.penaltyFromBonus}`)
    console.log(`[Cancel Booking] Restoring → credits: $${distribution.creditsRestored}, bonus: $${distribution.bonusRestored}, card refund: $${distribution.cardRefund}${cardValidationRefund > 0 ? ` + $${cardValidationRefund} validation` : ''}`)
    console.log(`[Cancel Booking] Deposit: $${securityDeposit} (wallet: $${depositFromWallet}, card: $${depositFromCard}) — ALWAYS released`)

    // Handle Stripe payment based on ACTUAL PI status (not just DB paymentStatus)
    // Card refund = trip refund portion + validation refund + deposit from card (deposit always released)
    const totalCardRefund = distribution.cardRefund + cardValidationRefund + depositFromCard
    if (cancelledBooking.paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(cancelledBooking.paymentIntentId)
        console.log(`[Cancel Booking] Stripe PI status: ${pi.status}, amount: ${pi.amount}c`)

        if (pi.status === 'requires_capture') {
          // Auth hold only
          if (cancellation.tier === 'free') {
            // Free cancellation — void the entire hold
            await stripe.paymentIntents.cancel(cancelledBooking.paymentIntentId, {
              cancellation_reason: 'requested_by_customer',
            })
            console.log('[Cancel Booking] Voided entire authorization hold (free cancellation)')
          } else {
            // Late cancellation with penalty — capture only the penalty amount, release the rest
            const penaltyFromCardCents = Math.round(distribution.penaltyFromCard * 100)
            if (penaltyFromCardCents > 0 && penaltyFromCardCents < pi.amount) {
              // Capture just the penalty portion
              await stripe.paymentIntents.capture(cancelledBooking.paymentIntentId, {
                amount_to_capture: penaltyFromCardCents,
              })
              console.log(`[Cancel Booking] Captured $${distribution.penaltyFromCard.toFixed(2)} penalty (released remainder of $${((pi.amount - penaltyFromCardCents) / 100).toFixed(2)})`)
            } else if (penaltyFromCardCents <= 0) {
              // No card penalty (all penalty absorbed by credits/bonus) — void entirely
              await stripe.paymentIntents.cancel(cancelledBooking.paymentIntentId, {
                cancellation_reason: 'requested_by_customer',
              })
              console.log('[Cancel Booking] Voided authorization hold (penalty absorbed by credits/bonus)')
            } else {
              // Edge case: penalty >= card hold — capture full amount
              await stripe.paymentIntents.capture(cancelledBooking.paymentIntentId)
              console.log('[Cancel Booking] Captured full authorization (penalty >= card amount)')
            }
          }
          await prisma.rentalBooking.update({
            where: { id: bookingId },
            data: { paymentStatus: cancellation.tier === 'free' ? 'REFUNDED' : 'PAID' }
          })

        } else if (pi.status === 'succeeded') {
          // Payment was already captured — issue a refund for (card refund + deposit)
          const refundCents = Math.round(totalCardRefund * 100)
          if (refundCents > 0) {
            const refund = await stripe.refunds.create({
              payment_intent: cancelledBooking.paymentIntentId,
              amount: Math.min(refundCents, pi.amount),
              reason: 'requested_by_customer',
              metadata: {
                bookingId: cancelledBooking.id,
                type: 'cancellation_refund',
                policy: cancellation.label,
                tripRefund: distribution.cardRefund.toFixed(2),
                depositRefund: depositFromCard.toFixed(2),
                penalty: distribution.penaltyFromCard.toFixed(2),
              },
            })
            console.log(`[Cancel Booking] Refunded $${(refund.amount / 100).toFixed(2)} (trip: $${distribution.cardRefund.toFixed(2)} + deposit: $${depositFromCard.toFixed(2)})`)
          } else {
            console.log('[Cancel Booking] No card refund due (penalty absorbed entire card charge)')
          }

          // Create RefundRequest record for tracking
          await prisma.refundRequest.create({
            data: {
              id: crypto.randomUUID(),
              bookingId: cancelledBooking.id,
              amount: totalCardRefund,
              reason: `Booking cancelled by guest (${cancellation.label}): ${reason}. Penalty: $${cancellation.penaltyAmount.toFixed(2)}`,
              requestedBy: booking.guestEmail || 'guest',
              requestedByType: 'GUEST',
              status: refundCents > 0 ? 'COMPLETED' : 'PENDING',
              updatedAt: new Date()
            }
          }).catch(e => console.error('[Cancel Booking] Failed to create refund record:', e))

          await prisma.rentalBooking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'REFUNDED' }
          })

        } else if (pi.status === 'requires_payment_method' || pi.status === 'requires_confirmation' || pi.status === 'requires_action') {
          // PI not yet confirmed — safe to cancel
          await stripe.paymentIntents.cancel(cancelledBooking.paymentIntentId, {
            cancellation_reason: 'requested_by_customer',
          })
          await prisma.rentalBooking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'CANCELLED' as any }
          })
          console.log(`[Cancel Booking] Cancelled PI in ${pi.status} state`)

        } else if (pi.status === 'canceled') {
          console.log('[Cancel Booking] PI already cancelled, no Stripe action needed')
          await prisma.rentalBooking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'REFUNDED' }
          })

        } else {
          console.warn(`[Cancel Booking] Unexpected PI status: ${pi.status}`)
        }
      } catch (stripeError) {
        console.error('[Cancel Booking] Stripe error:', stripeError)
        // Still create a refund request so admin can process manually
        await prisma.refundRequest.create({
          data: {
            id: crypto.randomUUID(),
            bookingId: cancelledBooking.id,
            amount: totalCardRefund,
            reason: `Booking cancelled by guest (${cancellation.label}): ${reason}. Stripe auto-refund failed — manual processing needed. Penalty: $${cancellation.penaltyAmount.toFixed(2)}`,
            requestedBy: booking.guestEmail || 'guest',
            requestedByType: 'GUEST',
            status: 'PENDING',
            updatedAt: new Date()
          }
        }).catch(e => console.error('[Cancel Booking] Failed to create refund request:', e))
      }
    }

    // Restore credits, bonus, and deposit wallet balances (minus proportional penalty)
    const guestEmail = booking.guestEmail
    if (guestEmail) {
      try {
        const guestProfile = await prisma.reviewerProfile.findFirst({
          where: { email: guestEmail },
          select: { id: true, creditBalance: true, bonusBalance: true, depositWalletBalance: true }
        })

        if (guestProfile) {
          // Restore credits (minus penalty portion)
          if (distribution.creditsRestored > 0) {
            await prisma.reviewerProfile.update({
              where: { id: guestProfile.id },
              data: { creditBalance: { increment: distribution.creditsRestored } }
            })
            await prisma.creditBonusTransaction.create({
              data: {
                id: crypto.randomUUID(),
                guestId: guestProfile.id,
                amount: distribution.creditsRestored,
                type: 'CREDIT',
                action: 'ADD',
                balanceAfter: guestProfile.creditBalance + distribution.creditsRestored,
                reason: distribution.penaltyFromCredits > 0
                  ? `Restored from cancelled booking ${booking.bookingCode} (minus $${distribution.penaltyFromCredits.toFixed(2)} cancellation penalty)`
                  : `Restored from cancelled booking ${booking.bookingCode}`,
                bookingId: booking.id
              }
            })
            console.log(`[Cancel Booking] Restored $${distribution.creditsRestored.toFixed(2)} credits (penalty absorbed: $${distribution.penaltyFromCredits.toFixed(2)})`)
          } else if (creditsApplied > 0) {
            console.log(`[Cancel Booking] Credits not restored — full $${creditsApplied.toFixed(2)} absorbed by cancellation penalty`)
          }

          // Restore bonus (minus penalty portion)
          if (distribution.bonusRestored > 0) {
            await prisma.reviewerProfile.update({
              where: { id: guestProfile.id },
              data: { bonusBalance: { increment: distribution.bonusRestored } }
            })
            await prisma.creditBonusTransaction.create({
              data: {
                id: crypto.randomUUID(),
                guestId: guestProfile.id,
                amount: distribution.bonusRestored,
                type: 'BONUS',
                action: 'ADD',
                balanceAfter: guestProfile.bonusBalance + distribution.bonusRestored,
                reason: distribution.penaltyFromBonus > 0
                  ? `Restored from cancelled booking ${booking.bookingCode} (minus $${distribution.penaltyFromBonus.toFixed(2)} cancellation penalty)`
                  : `Restored from cancelled booking ${booking.bookingCode}`,
                bookingId: booking.id
              }
            })
            console.log(`[Cancel Booking] Restored $${distribution.bonusRestored.toFixed(2)} bonus (penalty absorbed: $${distribution.penaltyFromBonus.toFixed(2)})`)
          } else if (bonusApplied > 0) {
            console.log(`[Cancel Booking] Bonus not restored — full $${bonusApplied.toFixed(2)} absorbed by cancellation penalty`)
          }

          // Deposit wallet: ALWAYS fully restored (deposit is separate from trip cost)
          if (depositFromWallet > 0) {
            await prisma.reviewerProfile.update({
              where: { id: guestProfile.id },
              data: { depositWalletBalance: { increment: depositFromWallet } }
            })
            await prisma.depositTransaction.create({
              data: {
                id: crypto.randomUUID(),
                guestId: guestProfile.id,
                amount: depositFromWallet,
                type: 'RELEASE',
                balanceAfter: (guestProfile.depositWalletBalance || 0) + depositFromWallet,
                bookingId: booking.id,
                description: `Deposit released from cancelled booking ${booking.bookingCode}`
              }
            })
            console.log(`[Cancel Booking] Restored $${depositFromWallet} to deposit wallet (always released)`)
          }
        }
      } catch (balanceError) {
        console.error('[Cancel Booking] Failed to restore balances (non-blocking):', balanceError)
      }
    }

    // Notify host about the cancellation (fire-and-forget)
    if (booking.host?.email) {
      const formatDate = (d: Date | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
      sendHostBookingCancelledEmail({
        hostName: booking.host.name || 'Host',
        hostEmail: booking.host.email,
        guestName: booking.guestName || 'Guest',
        bookingCode: booking.bookingCode,
        carMake: booking.car?.make || 'Vehicle',
        carModel: booking.car?.model || '',
        startDate: formatDate(booking.startDate),
        endDate: formatDate(booking.endDate),
        totalAmount: Number(booking.totalAmount || 0).toFixed(2),
        cancellationReason: reason,
        cancelledBy: 'guest',
      }).catch(() => {})
    }

    // SMS notifications (fire-and-forget)
    import('@/app/lib/twilio/sms-triggers').then(({ sendBookingCancelledSms }) => {
      sendBookingCancelledSms({
        bookingCode: booking.bookingCode,
        guestPhone: booking.guestPhone,
        guestName: booking.guestName,
        guestId: booking.reviewerProfileId,
        hostPhone: booking.host?.phone,
        car: booking.car,
        bookingId: booking.id,
        hostId: booking.hostId,
      }).catch(e => console.error('[Cancel] SMS failed:', e))
    }).catch(() => {})

    console.log(`[Cancel ${booking.bookingCode}] SUMMARY: ${cancellation.label} | refund=$${distribution.cardRefund} | penalty=$${cancellation.penaltyAmount} | credits=$${distribution.creditsRestored} | deposit=$${depositFromWallet} | PI=${cancelledBooking.paymentIntentId || 'none'}`)

    return NextResponse.json({
      success: true,
      booking: {
        id: cancelledBooking.id,
        status: cancelledBooking.status,
        cancelledAt: cancelledBooking.cancelledAt
      },
      cancellation: {
        tier: cancellation.tier,
        policy: cancellation.label,
        penaltyAmount: cancellation.penaltyAmount,
        penaltyDays: cancellation.penaltyDays,
        averageDailyCost: cancellation.averageDailyCost,
        tripRefund: cancellation.refundAmount,
        depositRefunded: true,
      },
      refund: {
        cardRefund: distribution.cardRefund,
        depositFromCardRefund: depositFromCard,
        totalCardRefund,
        penalty: {
          total: cancellation.penaltyAmount,
          fromCard: distribution.penaltyFromCard,
          fromCredits: distribution.penaltyFromCredits,
          fromBonus: distribution.penaltyFromBonus,
        }
      },
      balancesRestored: {
        credits: distribution.creditsRestored,
        bonus: distribution.bonusRestored,
        depositWallet: depositFromWallet
      }
    })
  } catch (error) {
    console.error('[Cancel Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
