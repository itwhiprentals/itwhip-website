// app/lib/bookings/no-show.ts
// Core no-show processing logic — shared by manual triggers (host/admin) and auto-complete

import { prisma } from '@/app/lib/database/prisma'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'

const CASH_NO_SHOW_FEE = 50 // $50 flat fee for cash booking no-shows

interface NoShowResult {
  success: boolean
  error?: string
  feeCharged?: number
  feeStatus?: string
}

/**
 * Process a no-show for a booking.
 * - Card bookings: capture full authorized amount
 * - Cash bookings: charge $50 fee (or add to platformFeeOwed if no card)
 * - Increments guest noShowCount
 * - Applies restrictions at 2nd and 3rd no-show
 */
export async function processNoShow(
  bookingId: string,
  markedBy: 'SYSTEM' | 'HOST' | 'ADMIN'
): Promise<NoShowResult> {
  try {
    // 1. Load booking with relations
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        car: { select: { id: true, make: true, model: true, year: true } },
        host: { select: { id: true, name: true, email: true } },
        renter: { select: { id: true, email: true } },
        reviewerProfile: { select: { id: true, noShowCount: true, canInstantBook: true } },
      }
    })

    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    if (booking.status !== 'CONFIRMED') {
      return { success: false, error: `Cannot mark no-show — booking status is ${booking.status}` }
    }

    if (booking.tripStartedAt) {
      return { success: false, error: 'Cannot mark no-show — trip has already started' }
    }

    const now = new Date()
    const isCash = booking.paymentType === 'CASH'
    let feeCharged = 0
    let feeStatus = 'PENDING'

    // 2. Handle payment based on type
    if (!isCash && booking.stripePaymentIntentId) {
      // CARD: Capture full authorized amount
      try {
        await PaymentProcessor.capturePayment(booking.stripePaymentIntentId)
        feeCharged = Number(booking.totalAmount) || 0
        feeStatus = 'CHARGED'
        console.log(`[No-Show] Captured $${feeCharged} for card booking ${bookingId}`)
      } catch (captureErr) {
        console.error(`[No-Show] Failed to capture payment for ${bookingId}:`, captureErr)
        feeStatus = 'FAILED'
      }
    } else if (isCash) {
      // CASH: Charge $50 no-show fee
      const noShowFee = CASH_NO_SHOW_FEE
      feeCharged = noShowFee

      // Try to charge card on file if guest has one
      if (booking.stripeCustomerId && booking.stripePaymentMethodId) {
        try {
          await PaymentProcessor.chargeAdditionalFees(
            booking.stripeCustomerId,
            booking.stripePaymentMethodId,
            Math.round(noShowFee * 100), // cents
            `No-show fee for booking ${booking.bookingCode || bookingId}`,
            { booking_id: bookingId, charge_type: 'no_show_fee' }
          )
          feeStatus = 'CHARGED'
          console.log(`[No-Show] Charged $${noShowFee} no-show fee to card for cash booking ${bookingId}`)
        } catch {
          feeStatus = 'PENDING'
          console.log(`[No-Show] Failed to charge card — adding to platformFeeOwed for ${bookingId}`)
        }
      }

      // If no card or charge failed, track as owed
      if (feeStatus === 'PENDING') {
        try {
          await prisma.platformFeeOwed.create({
            data: {
              hostId: booking.hostId,
              bookingId: booking.id,
              amount: noShowFee,
              reason: 'NO_SHOW_FEE',
              status: 'PENDING',
            }
          })
          console.log(`[No-Show] Created platformFeeOwed of $${noShowFee} for ${bookingId}`)
        } catch (feeErr) {
          console.error(`[No-Show] Failed to create platformFeeOwed:`, feeErr)
        }
      }
    }

    // 3. Update booking status
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: 'NO_SHOW',
        noShowMarkedBy: markedBy,
        noShowMarkedAt: now,
        noShowFeeCharged: feeCharged,
        noShowFeeStatus: feeStatus,
      }
    })

    // 4. Increment guest noShowCount and apply restrictions
    if (booking.reviewerProfile?.id) {
      const newCount = (booking.reviewerProfile.noShowCount || 0) + 1
      const updateData: any = { noShowCount: newCount }

      // 2nd no-show: disable instant booking
      if (newCount >= 2) {
        updateData.canInstantBook = false
      }

      // 3rd no-show: flag for suspension (admin reviews manually)
      // We don't auto-suspend — just increment the count. Admin dashboard shows flagged guests.

      await prisma.reviewerProfile.update({
        where: { id: booking.reviewerProfile.id },
        data: updateData,
      })

      console.log(`[No-Show] Guest noShowCount now ${newCount} for profile ${booking.reviewerProfile.id}`)
      if (newCount >= 2) {
        console.log(`[No-Show] Instant booking disabled for guest (2+ no-shows)`)
      }

      // 5. Record the no-show fee as a negative credit adjustment on the guest's account
      if (feeCharged > 0) {
        try {
          const currentBalance = await prisma.reviewerProfile.findUnique({
            where: { id: booking.reviewerProfile.id },
            select: { creditBalance: true }
          })
          const balBefore = currentBalance?.creditBalance ?? 0
          const balAfter = balBefore - feeCharged

          await prisma.creditBonusTransaction.create({
            data: {
              id: crypto.randomUUID(),
              guestId: booking.reviewerProfile.id,
              type: 'CREDIT',
              action: 'ADJUST',
              amount: -feeCharged,
              balanceAfter: balAfter,
              reason: 'NO_SHOW_FEE',
              bookingId: booking.id,
            }
          })

          // Deduct from credit balance (can go negative = outstanding balance)
          await prisma.reviewerProfile.update({
            where: { id: booking.reviewerProfile.id },
            data: { creditBalance: balAfter }
          })

          console.log(`[No-Show] Recorded -$${feeCharged} credit adjustment. Balance: $${balBefore} → $${balAfter}`)
        } catch (txErr) {
          console.error(`[No-Show] Failed to record credit transaction:`, txErr)
        }
      }
    }

    console.log(`[No-Show] Booking ${bookingId} marked as NO_SHOW by ${markedBy}. Fee: $${feeCharged} (${feeStatus})`)

    return {
      success: true,
      feeCharged,
      feeStatus,
    }
  } catch (error) {
    console.error(`[No-Show] Error processing no-show for ${bookingId}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
