// app/api/rentals/bookings/[id]/modify/route.ts
// Guest-facing booking modification endpoint (PENDING bookings only)
// Supports: dates, insurance tier, and add-on enhancements
// Re-authorizes via card on file (stripePaymentMethodId) when total changes

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { calculateBookingPricing } from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
import { stripe, toStripeCents } from '@/app/lib/stripe'

type RouteParams = { params: Promise<{ id: string }> }

// Add-on pricing constants (must match ModifyBookingSheet)
const ADDON_PRICES = {
  refuelService: 75,       // flat
  additionalDriver: 50,    // per day
  extraMiles: 295,          // flat
  vipConcierge: 150,        // per day
}

// Delivery fee defaults — keys match DB pickupType values
const DELIVERY_FEES: Record<string, number> = {
  host: 0,
  delivery: 35,
  airport: 50,
  hotel: 35,
}

// Shared: validate ownership + fetch booking
async function getBookingWithAuth(request: NextRequest, bookingId: string) {
  const user = await verifyRequest(request)
  if (!user) {
    return { error: 'Authentication required', status: 401 }
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
      stripeCustomerId: true,
      stripePaymentMethodId: true,
      totalAmount: true,
      subtotal: true,
      serviceFee: true,
      taxes: true,
      insuranceFee: true,
      insuranceSelection: true,
      deliveryFee: true,
      dailyRate: true,
      numberOfDays: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      bookingCode: true,
      carId: true,
      refuelService: true,
      additionalDriver: true,
      extraMilesPackage: true,
      vipConcierge: true,
      enhancementsTotal: true,
      pickupType: true,
      deliveryAddress: true,
      creditsApplied: true,
      bonusApplied: true,
      chargeAmount: true,
      depositFromCard: true,
      depositFromWallet: true,
      car: {
        select: {
          id: true,
          make: true,
          model: true,
          dailyRate: true,
          weeklyDiscount: true,
          monthlyDiscount: true,
          city: true,
          estimatedValue: true,
          deliveryFee: true,
          airportFee: true,
          hotelFee: true,
          homeFee: true
        }
      }
    }
  })

  if (!booking) {
    return { error: 'Booking not found', status: 404 }
  }

  // Verify ownership via JWT identity only (no spoofable headers)
  const isOwner = (user.id && booking.renterId === user.id) ||
                  (user.email && booking.guestEmail === user.email)

  if (!isOwner) {
    return { error: 'Unauthorized', status: 403 }
  }

  if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
    return { error: `Can only modify PENDING or CONFIRMED bookings. Current status: ${booking.status}`, status: 400 }
  }

  return { booking }
}

// Check car availability for new dates, excluding current booking
async function checkAvailability(carId: string, startDate: Date, endDate: Date, excludeBookingId: string) {
  const overlapping = await prisma.rentalBooking.findFirst({
    where: {
      carId,
      id: { not: excludeBookingId },
      status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
      AND: [
        { startDate: { lt: endDate } },
        { endDate: { gt: startDate } }
      ]
    },
    select: { id: true }
  })
  return !overlapping
}

// Fetch insurance quote from insurance provider
async function getInsuranceQuote(carId: string, vehicleValue: number, startDate: string, endDate: string, tier: string) {
  const provider = await prisma.insuranceProvider.findFirst({
    where: { isPrimary: true, isActive: true }
  })
  if (!provider) return null

  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 1) return null

  const pricingRules = provider.pricingRules as any
  let bracket: any
  if (vehicleValue < 25000) bracket = pricingRules.under25k
  else if (vehicleValue < 50000) bracket = pricingRules['25to50k']
  else if (vehicleValue < 100000) bracket = pricingRules['50to100k']
  else bracket = pricingRules.over100k

  const dailyPremium = bracket?.[tier] ?? 0
  return { dailyPremium, totalPremium: dailyPremium * days, days }
}

// GET — Preview: check availability for new dates
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: bookingId } = await params
    const result = await getBookingWithAuth(request, bookingId)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { booking } = result

    const url = new URL(request.url)
    const startDateStr = url.searchParams.get('startDate')
    const endDateStr = url.searchParams.get('endDate')

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'startDate and endDate query params required' }, { status: 400 })
    }

    const startDate = new Date(startDateStr + 'T12:00:00')
    const endDate = new Date(endDateStr + 'T12:00:00')

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (startDate < today) {
      return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 })
    }

    const available = await checkAvailability(booking.carId, startDate, endDate, booking.id)

    return NextResponse.json({ available })
  } catch (error) {
    console.error('[Modify Booking Preview] Error:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}

// POST — Commit the full modification (dates + insurance + add-ons)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: bookingId } = await params
    const result = await getBookingWithAuth(request, bookingId)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    const { booking } = result

    const body = await request.json()
    const {
      startDate: startDateStr,
      endDate: endDateStr,
      insuranceTier,
      deliveryType: newDeliveryType,
      deliveryAddress: newDeliveryAddress,
      addOns
    } = body

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 })
    }

    const startDate = new Date(startDateStr + 'T12:00:00')
    const endDate = new Date(endDateStr + 'T12:00:00')

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (startDate < today) {
      return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 })
    }

    // Check if dates changed
    const oldStart = new Date(booking.startDate).toISOString().split('T')[0]
    const oldEnd = new Date(booking.endDate).toISOString().split('T')[0]
    const datesChanged = startDateStr !== oldStart || endDateStr !== oldEnd

    // Check availability if dates changed
    if (datesChanged) {
      const available = await checkAvailability(booking.carId, startDate, endDate, booking.id)
      if (!available) {
        return NextResponse.json({ error: 'Selected dates are not available for this vehicle' }, { status: 409 })
      }
    }

    // Calculate days
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

    // Determine insurance price
    let insurancePrice = booking.insuranceFee
    const selectedTier = insuranceTier || booking.insuranceSelection || 'BASIC'

    // If insurance tier changed, fetch new quote
    const bookingCar = (booking as any).car
    if (insuranceTier && insuranceTier !== (booking.insuranceSelection || 'BASIC')) {
      const vehicleValue = Number(bookingCar?.estimatedValue) || 30000
      const quote = await getInsuranceQuote(
        booking.carId,
        vehicleValue,
        startDateStr,
        endDateStr,
        insuranceTier
      )
      if (quote) {
        insurancePrice = quote.totalPremium
      }
    } else if (datesChanged && booking.insuranceFee > 0 && booking.numberOfDays && booking.numberOfDays > 0) {
      // Dates changed but tier same — recalculate with same daily rate
      const dailyInsurance = booking.insuranceFee / booking.numberOfDays
      insurancePrice = dailyInsurance * days
    }

    // Infer actual original delivery type (DB pickupType can be 'host' even when fee was charged)
    const originalDeliveryType = (booking.pickupType === 'host' && booking.deliveryFee > 0)
      ? 'delivery'
      : (booking.pickupType || 'host')
    const resolvedDeliveryType = newDeliveryType || originalDeliveryType
    const deliveryTypeChanged = newDeliveryType && newDeliveryType !== originalDeliveryType
    let deliveryFee: number
    if (!deliveryTypeChanged) {
      // Preserve original booking fee when delivery type unchanged
      deliveryFee = booking.deliveryFee ?? 0
    } else {
      // Use car's actual fees, fallback to defaults
      const car = bookingCar
      switch (resolvedDeliveryType) {
        case 'host': deliveryFee = 0; break
        case 'delivery': deliveryFee = Number(car?.deliveryFee) || Number(car?.homeFee) || DELIVERY_FEES.delivery; break
        case 'airport': deliveryFee = Number(car?.airportFee) || DELIVERY_FEES.airport; break
        case 'hotel': deliveryFee = Number(car?.hotelFee) || DELIVERY_FEES.hotel; break
        default: deliveryFee = DELIVERY_FEES[resolvedDeliveryType] ?? 0
      }
    }

    // Calculate add-on amounts
    const resolvedAddOns = {
      refuelService: addOns?.refuelService ?? booking.refuelService ?? false,
      additionalDriver: addOns?.additionalDriver ?? booking.additionalDriver ?? false,
      extraMiles: addOns?.extraMiles ?? booking.extraMilesPackage ?? false,
      vipConcierge: addOns?.vipConcierge ?? booking.vipConcierge ?? false,
    }

    const enhancementAmounts = {
      refuelService: resolvedAddOns.refuelService ? ADDON_PRICES.refuelService : 0,
      additionalDriver: resolvedAddOns.additionalDriver ? ADDON_PRICES.additionalDriver * days : 0,
      extraMiles: resolvedAddOns.extraMiles ? ADDON_PRICES.extraMiles : 0,
      vipConcierge: resolvedAddOns.vipConcierge ? ADDON_PRICES.vipConcierge * days : 0,
    }

    // Calculate full pricing using centralized function
    const newPricing = calculateBookingPricing({
      dailyRate: booking.dailyRate,
      days,
      insurancePrice: Math.round(insurancePrice * 100) / 100,
      deliveryFee,
      enhancements: enhancementAmounts,
      city: bookingCar?.city || 'phoenix'
    })

    const newTotal = Math.round(newPricing.total * 100) / 100
    const previousTotal = booking.totalAmount

    // ====== RECALCULATE CREDITS / BONUS ======
    const originalCreditsApplied = Number(booking.creditsApplied) || 0
    const originalBonusApplied = Number(booking.bonusApplied) || 0
    const depositFromCard = Number(booking.depositFromCard) || 0

    let newCreditsApplied = 0
    let newBonusApplied = 0

    if (originalCreditsApplied > 0) {
      // Credits take priority: cap at new total (if total dropped, reduce credits used)
      newCreditsApplied = Math.round(Math.min(originalCreditsApplied, newTotal) * 100) / 100
      newBonusApplied = 0
    } else if (originalBonusApplied > 0) {
      // Bonus: max 25% of base rental price, capped at what was originally used
      const maxBonusAllowed = Math.round(newPricing.basePrice * 0.25 * 100) / 100
      newBonusApplied = Math.round(Math.min(originalBonusApplied, maxBonusAllowed, newTotal) * 100) / 100
      newCreditsApplied = 0
    }

    // Calculate card charge amount (rental portion)
    let newChargeAmount = Math.round((newTotal - newCreditsApplied - newBonusApplied) * 100) / 100

    // Enforce $1.00 minimum Stripe charge
    if (newChargeAmount + depositFromCard < 1.00) {
      newChargeAmount = Math.round((1.00 - depositFromCard) * 100) / 100
      if (newChargeAmount < 0) newChargeAmount = 1.00
    }

    // Stripe PI amount = card charge for rental + deposit from card
    const stripeAmount = Math.round((newChargeAmount + depositFromCard) * 100) / 100

    // Calculate excess credits/bonus to restore to guest wallet
    const creditsToRestore = Math.max(0, Math.round((originalCreditsApplied - newCreditsApplied) * 100) / 100)
    const bonusToRestore = Math.max(0, Math.round((originalBonusApplied - newBonusApplied) * 100) / 100)

    // ====== STRIPE RE-AUTHORIZATION ======
    let newPaymentIntentId = booking.paymentIntentId
    const previousChargeAmount = Number(booking.chargeAmount) || previousTotal
    const previousStripeAmount = previousChargeAmount + depositFromCard
    const stripeAmountChanged = Math.abs(stripeAmount - previousStripeAmount) > 0.01

    if (stripeAmountChanged && booking.paymentIntentId) {
      try {
        // Cancel old authorization hold
        await stripe.paymentIntents.cancel(booking.paymentIntentId)

        // Create new authorization with saved card on file
        if (booking.stripeCustomerId && booking.stripePaymentMethodId) {
          const newIntent = await stripe.paymentIntents.create({
            amount: toStripeCents(stripeAmount),
            currency: 'usd',
            customer: booking.stripeCustomerId,
            payment_method: booking.stripePaymentMethodId,
            capture_method: 'manual',
            confirm: true,
            off_session: true,
            metadata: {
              bookingId: booking.id,
              bookingCode: booking.bookingCode,
              modified: 'true',
              previousTotal: String(previousTotal),
              newTotal: String(newTotal),
              creditsApplied: String(newCreditsApplied),
              bonusApplied: String(newBonusApplied),
              chargeAmount: String(newChargeAmount),
              depositFromCard: String(depositFromCard)
            }
          })
          newPaymentIntentId = newIntent.id
        } else {
          // No saved payment method — clear the intent
          newPaymentIntentId = null
        }
      } catch (stripeError: any) {
        console.error('[Modify Booking] Stripe re-authorization error:', stripeError)
        return NextResponse.json({
          error: 'Failed to re-authorize payment. Your card may have been declined.',
          stripeError: stripeError.message
        }, { status: 402 })
      }
    }

    // Update booking with all modified fields
    const updated = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        startDate,
        endDate,
        numberOfDays: days,
        subtotal: Math.round(newPricing.basePrice * 100) / 100,
        serviceFee: Math.round(newPricing.serviceFee * 100) / 100,
        insuranceFee: Math.round(insurancePrice * 100) / 100,
        insuranceSelection: selectedTier,
        deliveryFee,
        pickupType: resolvedDeliveryType,
        ...(newDeliveryAddress !== undefined ? { deliveryAddress: newDeliveryAddress } : {}),
        taxes: Math.round(newPricing.taxes * 100) / 100,
        totalAmount: newTotal,
        paymentIntentId: newPaymentIntentId,
        // Financial fields
        creditsApplied: newCreditsApplied,
        bonusApplied: newBonusApplied,
        chargeAmount: newChargeAmount,
        // Add-on fields
        refuelService: resolvedAddOns.refuelService,
        additionalDriver: resolvedAddOns.additionalDriver,
        extraMilesPackage: resolvedAddOns.extraMiles,
        vipConcierge: resolvedAddOns.vipConcierge,
        enhancementsTotal: Math.round(newPricing.enhancementsTotal * 100) / 100,
        updatedAt: new Date()
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        numberOfDays: true,
        subtotal: true,
        serviceFee: true,
        insuranceFee: true,
        insuranceSelection: true,
        taxes: true,
        totalAmount: true,
        dailyRate: true,
        paymentIntentId: true,
        creditsApplied: true,
        bonusApplied: true,
        chargeAmount: true,
        depositFromCard: true,
        depositFromWallet: true,
        refuelService: true,
        additionalDriver: true,
        extraMilesPackage: true,
        vipConcierge: true,
        enhancementsTotal: true,
        deliveryFee: true,
        pickupType: true,
        deliveryAddress: true
      }
    })

    // ====== RESTORE EXCESS CREDITS / BONUS TO GUEST WALLET ======
    if (creditsToRestore > 0 || bonusToRestore > 0) {
      const guestEmail = booking.guestEmail
      if (guestEmail) {
        try {
          const guestProfile = await prisma.reviewerProfile.findFirst({
            where: { email: guestEmail },
            select: { id: true, creditBalance: true, bonusBalance: true }
          })

          if (guestProfile) {
            if (creditsToRestore > 0) {
              await prisma.reviewerProfile.update({
                where: { id: guestProfile.id },
                data: { creditBalance: { increment: creditsToRestore } }
              })
              await prisma.creditBonusTransaction.create({
                data: {
                  id: crypto.randomUUID(),
                  guestId: guestProfile.id,
                  amount: creditsToRestore,
                  type: 'CREDIT',
                  action: 'ADD',
                  balanceAfter: guestProfile.creditBalance + creditsToRestore,
                  reason: `Restored from modified booking ${booking.bookingCode} (total decreased)`,
                  bookingId: booking.id
                }
              })
              console.log(`[Modify Booking] Restored $${creditsToRestore.toFixed(2)} credits to guest wallet`)
            }

            if (bonusToRestore > 0) {
              await prisma.reviewerProfile.update({
                where: { id: guestProfile.id },
                data: { bonusBalance: { increment: bonusToRestore } }
              })
              await prisma.creditBonusTransaction.create({
                data: {
                  id: crypto.randomUUID(),
                  guestId: guestProfile.id,
                  amount: bonusToRestore,
                  type: 'BONUS',
                  action: 'ADD',
                  balanceAfter: guestProfile.bonusBalance + bonusToRestore,
                  reason: `Restored from modified booking ${booking.bookingCode} (total decreased)`,
                  bookingId: booking.id
                }
              })
              console.log(`[Modify Booking] Restored $${bonusToRestore.toFixed(2)} bonus to guest wallet`)
            }
          }
        } catch (balanceError) {
          console.error('[Modify Booking] Failed to restore balances (non-blocking):', balanceError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      booking: updated,
      previousPricing: {
        totalAmount: previousTotal,
        numberOfDays: booking.numberOfDays,
        creditsApplied: originalCreditsApplied,
        bonusApplied: originalBonusApplied,
      },
      priceDifference: Math.round((newTotal - previousTotal) * 100) / 100,
      financialSummary: {
        creditsApplied: newCreditsApplied,
        bonusApplied: newBonusApplied,
        chargeAmount: newChargeAmount,
        stripeAmount,
        creditsRestored: creditsToRestore,
        bonusRestored: bonusToRestore,
      }
    })
  } catch (error) {
    console.error('[Modify Booking] Error:', error)
    return NextResponse.json({ error: 'Failed to modify booking' }, { status: 500 })
  }
}
