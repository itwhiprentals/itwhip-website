// app/api/rentals/bookings/[id]/cancel/route.ts
// Guest-facing cancellation endpoint

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendHostBookingCancelledEmail } from '@/app/lib/email/host-booking-cancelled-email'
import { calculateCancellationRefund, calculateRefundAmount } from '@/app/lib/booking/cancellation-policy'

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
        startDate: true,
        bookingCode: true,
        guestName: true,
        endDate: true,
        hostId: true,
        creditsApplied: true,
        bonusApplied: true,
        depositFromWallet: true,
        car: { select: { make: true, model: true } },
        host: { select: { name: true, email: true } }
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

    // Calculate refund based on cancellation policy (time-based tiers, MST)
    const cancellation = calculateCancellationRefund(booking.startDate!)
    const refundAmount = calculateRefundAmount(
      Number(cancelledBooking.totalAmount || 0),
      cancellation.refundPercentage
    )

    console.log(`[Cancel Booking] Policy: ${cancellation.label} (${cancellation.hoursUntilPickup.toFixed(1)}h before pickup). Refund: $${refundAmount}`)

    // Handle Stripe payment based on ACTUAL PI status (not just DB paymentStatus)
    if (cancelledBooking.paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(cancelledBooking.paymentIntentId)
        console.log(`[Cancel Booking] Stripe PI status: ${pi.status}, amount: ${pi.amount}c, captured: ${pi.latest_charge ? 'yes' : 'no'}`)

        if (pi.status === 'requires_capture') {
          // Auth hold only — void it (releases hold immediately, no charge)
          await stripe.paymentIntents.cancel(cancelledBooking.paymentIntentId, {
            cancellation_reason: 'requested_by_customer',
          })
          await prisma.rentalBooking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'REFUNDED' }
          })
          console.log('[Cancel Booking] Voided authorization hold')

        } else if (pi.status === 'succeeded') {
          // Payment was captured — issue a refund
          const refundCents = Math.round(refundAmount * 100)
          if (refundCents > 0) {
            const refund = await stripe.refunds.create({
              payment_intent: cancelledBooking.paymentIntentId,
              amount: Math.min(refundCents, pi.amount), // Don't refund more than captured
              reason: 'requested_by_customer',
              metadata: {
                bookingId: cancelledBooking.id,
                type: 'cancellation_refund',
                policy: cancellation.label,
              },
            })
            console.log(`[Cancel Booking] Refunded $${(refund.amount / 100).toFixed(2)} (${refund.id})`)
          } else {
            console.log('[Cancel Booking] No refund due per cancellation policy')
          }

          // Also create a RefundRequest record for tracking
          await prisma.refundRequest.create({
            data: {
              id: crypto.randomUUID(),
              bookingId: cancelledBooking.id,
              amount: refundAmount,
              reason: `Booking cancelled by guest (${cancellation.label}): ${reason}`,
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
            amount: refundAmount,
            reason: `Booking cancelled by guest (${cancellation.label}): ${reason}. Stripe auto-refund failed — manual processing needed.`,
            requestedBy: booking.guestEmail || 'guest',
            requestedByType: 'GUEST',
            status: 'PENDING',
            updatedAt: new Date()
          }
        }).catch(e => console.error('[Cancel Booking] Failed to create refund request:', e))
      }
    }

    // Restore credits, bonus, and deposit wallet balances
    const guestEmail = booking.guestEmail
    if (guestEmail) {
      try {
        const guestProfile = await prisma.reviewerProfile.findFirst({
          where: { email: guestEmail },
          select: { id: true, creditBalance: true, bonusBalance: true, depositWalletBalance: true }
        })

        if (guestProfile) {
          // Restore credits
          if (booking.creditsApplied > 0) {
            await prisma.reviewerProfile.update({
              where: { id: guestProfile.id },
              data: { creditBalance: { increment: booking.creditsApplied } }
            })
            await prisma.creditBonusTransaction.create({
              data: {
                id: crypto.randomUUID(),
                guestId: guestProfile.id,
                amount: booking.creditsApplied,
                type: 'CREDIT',
                action: 'ADD',
                balanceAfter: guestProfile.creditBalance + booking.creditsApplied,
                reason: `Restored from cancelled booking ${booking.bookingCode}`,
                bookingId: booking.id
              }
            })
            console.log(`[Cancel Booking] Restored $${booking.creditsApplied} credits`)
          }

          // Restore bonus
          if (booking.bonusApplied > 0) {
            await prisma.reviewerProfile.update({
              where: { id: guestProfile.id },
              data: { bonusBalance: { increment: booking.bonusApplied } }
            })
            await prisma.creditBonusTransaction.create({
              data: {
                id: crypto.randomUUID(),
                guestId: guestProfile.id,
                amount: booking.bonusApplied,
                type: 'BONUS',
                action: 'ADD',
                balanceAfter: guestProfile.bonusBalance + booking.bonusApplied,
                reason: `Restored from cancelled booking ${booking.bookingCode}`,
                bookingId: booking.id
              }
            })
            console.log(`[Cancel Booking] Restored $${booking.bonusApplied} bonus`)
          }

          // Restore deposit wallet
          if (booking.depositFromWallet > 0) {
            await prisma.reviewerProfile.update({
              where: { id: guestProfile.id },
              data: { depositWalletBalance: { increment: booking.depositFromWallet } }
            })
            await prisma.depositTransaction.create({
              data: {
                id: crypto.randomUUID(),
                guestId: guestProfile.id,
                amount: booking.depositFromWallet,
                type: 'RELEASE',
                balanceAfter: (guestProfile.depositWalletBalance || 0) + booking.depositFromWallet,
                bookingId: booking.id,
                description: `Deposit released from cancelled booking ${booking.bookingCode}`
              }
            })
            console.log(`[Cancel Booking] Restored $${booking.depositFromWallet} to deposit wallet`)
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

    return NextResponse.json({
      success: true,
      booking: {
        id: cancelledBooking.id,
        status: cancelledBooking.status,
        cancelledAt: cancelledBooking.cancelledAt
      },
      refund: {
        amount: refundAmount,
        percentage: cancellation.refundPercentage,
        tier: cancellation.tier,
        policy: cancellation.label
      },
      balancesRestored: {
        credits: booking.creditsApplied || 0,
        bonus: booking.bonusApplied || 0,
        depositWallet: booking.depositFromWallet || 0
      }
    })
  } catch (error) {
    console.error('[Cancel Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
