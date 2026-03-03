// app/lib/bookings/stripe-enrichment.ts
// Fetches card brand, last4, charge amount from Stripe for booking detail views

import { stripe } from '@/app/lib/stripe/client'
import { prisma } from '@/app/lib/database/prisma'

export interface StripeEnrichment {
  cardBrand: string | null
  cardLast4: string | null
  stripeChargeAmount: number | null
  piMetaCredits: number
  piMetaBonus: number
  piMetaDepositWallet: number
  piMetaPromo: number
  txCreditsUsed: number
  txBonusUsed: number
  txDepositFromWallet: number
}

const EMPTY_ENRICHMENT: StripeEnrichment = {
  cardBrand: null,
  cardLast4: null,
  stripeChargeAmount: null,
  piMetaCredits: 0,
  piMetaBonus: 0,
  piMetaDepositWallet: 0,
  piMetaPromo: 0,
  txCreditsUsed: 0,
  txBonusUsed: 0,
  txDepositFromWallet: 0,
}

/**
 * Fetch Stripe card info and transaction records for a single booking.
 * Returns enrichment data for the booking detail view.
 * Non-blocking — returns empty data on any Stripe error.
 */
export async function enrichBookingWithStripe(booking: {
  id: string
  stripePaymentMethodId?: string | null
  paymentIntentId?: string | null
  creditsApplied?: string | null
  bonusApplied?: string | null
  depositFromWallet?: string | null
  depositAmount?: string | null
  totalAmount: string
}): Promise<StripeEnrichment> {
  const result = { ...EMPTY_ENRICHMENT }

  try {
    // Card info from payment method
    if (booking.stripePaymentMethodId) {
      const pm = await stripe.paymentMethods.retrieve(booking.stripePaymentMethodId)
      result.cardBrand = (pm as any).card?.brand || null
      result.cardLast4 = (pm as any).card?.last4 || null
    }

    // Payment Intent — charge amount + metadata
    if (booking.paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(booking.paymentIntentId, {
        expand: ['payment_method']
      })

      if (!result.cardBrand) {
        const pm = pi.payment_method as any
        if (pm && typeof pm === 'object') {
          result.cardBrand = pm.card?.brand || null
          result.cardLast4 = pm.card?.last4 || null
        }
      }

      const piAmount = (pi as any).amount_received || (pi as any).amount
      if (piAmount && piAmount > 0) {
        result.stripeChargeAmount = piAmount / 100
      }

      const meta = pi.metadata
      if (meta) {
        result.piMetaCredits = parseFloat(meta.appliedCredits || '0')
        result.piMetaBonus = parseFloat(meta.appliedBonus || '0')
        result.piMetaDepositWallet = parseFloat(meta.appliedDepositWallet || '0')
        result.piMetaPromo = parseFloat(meta.promoDiscount || '0')
      }
    }
  } catch {
    // Non-blocking — card info is cosmetic
  }

  // Transaction record lookups for credit/bonus/deposit
  const dbCredits = parseFloat(booking.creditsApplied || '0')
  const dbBonus = parseFloat(booking.bonusApplied || '0')
  const dbDepositWallet = parseFloat(booking.depositFromWallet || '0')
  const total = parseFloat(booking.totalAmount)

  if (dbCredits === 0 && dbBonus === 0 && result.stripeChargeAmount !== null && result.stripeChargeAmount < total) {
    try {
      const txns = await prisma.creditBonusTransaction.findMany({
        where: { bookingId: booking.id, action: 'USE' },
        select: { type: true, amount: true }
      })
      for (const tx of txns) {
        if (tx.type === 'CREDIT') result.txCreditsUsed += Math.abs(tx.amount)
        else if (tx.type === 'BONUS') result.txBonusUsed += Math.abs(tx.amount)
      }
    } catch { /* Non-blocking */ }
  }

  if (dbDepositWallet === 0 && parseFloat(booking.depositAmount || '0') > 0) {
    try {
      const depTxns = await prisma.depositTransaction.findMany({
        where: { bookingId: booking.id, type: 'HOLD' },
        select: { amount: true }
      })
      for (const tx of depTxns) {
        result.txDepositFromWallet += Math.abs(tx.amount)
      }
    } catch { /* Non-blocking */ }
  }

  return result
}
