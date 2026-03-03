// app/lib/booking/create-from-request.ts
// Shared utilities for creating bookings from reservation requests
// Extracted from the finalize API to prevent duplication with create-from-request endpoint

import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import { randomBytes } from 'crypto'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil' as Stripe.LatestApiVersion,
})

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export type Scenario = 'A' | 'B' | 'C' | 'NEW'

export interface GuestAccount {
  guestUserId: string | null
  reviewerProfileId: string | null
  guestEmail: string | undefined
  guestName: string
  guestPhone: string | null
}

export interface BookingPricing {
  dailyRate: number
  durationDays: number
  subtotal: number
  serviceFee: number
  totalAmount: number
  hostEarnings: number
  isCash: boolean
}

export interface ScenarioContext {
  scenario: Scenario
  isExistingGuest: boolean
  hasBookingToReplace: boolean
  existingBooking: any | null
  existingUser: any | null
  existingReviewer: any | null
  hasValidHold: boolean
}

// ═══════════════════════════════════════════════════
// Detect scenario and fetch context
// ═══════════════════════════════════════════════════

export async function detectScenarioAndFetchContext(prospect: any): Promise<
  { success: true; context: ScenarioContext } | { success: false; error: string; status: number }
> {
  const isExistingGuest = prospect.guestSelectionType === 'EXISTING'
    && !!prospect.existingGuestId
  const hasBookingToReplace = isExistingGuest && !!prospect.existingBookingId

  let existingBooking: any = null
  let existingUser: any = null
  let existingReviewer: any = null
  let hasValidHold = false

  if (hasBookingToReplace) {
    existingBooking = await prisma.rentalBooking.findUnique({
      where: { id: prospect.existingBookingId! },
      include: {
        renter: { select: { id: true, email: true, name: true, phone: true } },
        reviewerProfile: { select: { id: true } },
        car: { select: { make: true, model: true, year: true } },
      }
    })

    if (!existingBooking || !existingBooking.renter) {
      return { success: false, error: 'Existing booking or guest not found', status: 404 }
    }

    if (existingBooking.replacedByBookingId) {
      return { success: false, error: 'This booking has already been reassigned', status: 400 }
    }

    // Check payment hold status
    if (existingBooking.paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(existingBooking.paymentIntentId)
        hasValidHold = pi.status === 'requires_capture'
      } catch (stripeErr) {
        console.error('[CreateFromRequest] Stripe hold check failed:', stripeErr)
        hasValidHold = false
      }
    }
    console.log(`[CreateFromRequest] Existing booking ${existingBooking.bookingCode}: hasValidHold=${hasValidHold}`)
  } else if (isExistingGuest) {
    existingUser = await prisma.user.findUnique({
      where: { id: prospect.existingGuestId! },
      select: { id: true, email: true, name: true, phone: true }
    })
    existingReviewer = await prisma.reviewerProfile.findFirst({
      where: { userId: prospect.existingGuestId! },
      select: { id: true }
    })

    if (!existingUser) {
      return { success: false, error: 'Existing guest user not found', status: 404 }
    }
  }

  const scenario: Scenario =
    (hasBookingToReplace && hasValidHold) ? 'A' :
    hasBookingToReplace ? 'B' :
    isExistingGuest ? 'C' : 'NEW'

  return {
    success: true,
    context: {
      scenario,
      isExistingGuest,
      hasBookingToReplace,
      existingBooking,
      existingUser,
      existingReviewer,
      hasValidHold,
    }
  }
}

// ═══════════════════════════════════════════════════
// Calculate pricing
// ═══════════════════════════════════════════════════

export function calculateBookingPricing(
  prospect: any,
  fleetRequest: any,
  ctx: ScenarioContext
): BookingPricing {
  const isCash = ctx.isExistingGuest ? false : prospect.paymentPreference === 'CASH'

  let dailyRate: number
  let durationDays: number
  let subtotal: number
  let serviceFee: number
  let totalAmount: number

  if (ctx.hasBookingToReplace && ctx.hasValidHold && ctx.existingBooking) {
    // Scenario A: use pricing from existing booking
    dailyRate = ctx.existingBooking.dailyRate || 0
    durationDays = ctx.existingBooking.numberOfDays || 14
    subtotal = ctx.existingBooking.subtotal || dailyRate * durationDays
    serviceFee = ctx.existingBooking.serviceFee || 0
    totalAmount = ctx.existingBooking.totalAmount || subtotal + serviceFee
  } else {
    // Scenarios B, C, and NEW: use request pricing
    dailyRate = prospect.counterOfferStatus === 'APPROVED' && prospect.counterOfferAmount
      ? prospect.counterOfferAmount
      : fleetRequest.offeredRate || 0
    durationDays = fleetRequest.durationDays || 14
    subtotal = dailyRate * durationDays
    serviceFee = isCash ? 0 : subtotal * 0.10
    totalAmount = subtotal + serviceFee
  }
  const hostEarnings = subtotal - (isCash ? 0 : serviceFee)

  return { dailyRate, durationDays, subtotal, serviceFee, totalAmount, hostEarnings, isCash }
}

// ═══════════════════════════════════════════════════
// Resolve guest account (find or create)
// ═══════════════════════════════════════════════════

export async function resolveGuestAccount(
  ctx: ScenarioContext,
  fleetRequest: any
): Promise<GuestAccount> {
  let reviewerProfileId: string | null = null
  let guestUserId: string | null = null
  let guestEmail: string | undefined
  let guestName: string
  let guestPhone: string | null

  if (ctx.isExistingGuest && ctx.hasBookingToReplace && ctx.existingBooking) {
    // Scenario A/B: use guest from existing booking
    guestUserId = ctx.existingBooking.renter.id
    reviewerProfileId = ctx.existingBooking.reviewerProfile?.id || null
    guestEmail = ctx.existingBooking.renter.email?.toLowerCase() || undefined
    guestName = ctx.existingBooking.renter.name || ctx.existingBooking.guestName || 'Guest'
    guestPhone = ctx.existingBooking.renter.phone || ctx.existingBooking.guestPhone || null
    console.log(`[CreateFromRequest] Existing guest (has booking): ${guestEmail} (userId: ${guestUserId})`)
  } else if (ctx.isExistingGuest && ctx.existingUser) {
    // Scenario C: use guest from user record
    guestUserId = ctx.existingUser.id
    reviewerProfileId = ctx.existingReviewer?.id || null
    guestEmail = ctx.existingUser.email?.toLowerCase() || undefined
    guestName = ctx.existingUser.name || 'Guest'
    guestPhone = ctx.existingUser.phone || null
    console.log(`[CreateFromRequest] Existing guest (no booking): ${guestEmail} (userId: ${guestUserId})`)
  } else {
    // NEW GUEST: find or create guest account
    guestEmail = fleetRequest.guestEmail?.toLowerCase().trim() || undefined
    guestName = fleetRequest.guestName || 'Guest'
    guestPhone = fleetRequest.guestPhone || null

    if (guestEmail) {
      const existingProfile = await prisma.reviewerProfile.findUnique({
        where: { email: guestEmail },
        select: { id: true, userId: true }
      })

      if (existingProfile) {
        reviewerProfileId = existingProfile.id
        guestUserId = existingProfile.userId

        if (!guestUserId) {
          const existingUser = await prisma.user.findUnique({ where: { email: guestEmail } })
          if (existingUser) {
            guestUserId = existingUser.id
            await prisma.reviewerProfile.update({
              where: { id: existingProfile.id },
              data: { userId: existingUser.id }
            })
          } else {
            const newUserId = nanoid()
            await prisma.user.create({
              data: {
                id: newUserId,
                email: guestEmail,
                name: guestName,
                phone: guestPhone,
                role: 'CLAIMED',
                emailVerified: false,
                updatedAt: new Date()
              }
            })
            guestUserId = newUserId
            await prisma.reviewerProfile.update({
              where: { id: existingProfile.id },
              data: { userId: newUserId }
            })
          }
        }
      } else {
        // Create new ReviewerProfile + User
        const profileId = randomBytes(16).toString('hex')
        const newProfile = await prisma.reviewerProfile.create({
          data: {
            id: profileId,
            email: guestEmail,
            phoneNumber: guestPhone,
            name: guestName,
            city: fleetRequest.pickupCity || 'Unknown',
            state: fleetRequest.pickupState || 'AZ',
            emailVerified: false,
            phoneVerified: false,
            updatedAt: new Date()
          }
        })
        reviewerProfileId = newProfile.id

        const userId = nanoid()
        await prisma.user.create({
          data: {
            id: userId,
            email: guestEmail,
            name: guestName,
            phone: guestPhone,
            role: 'CLAIMED',
            emailVerified: false,
            updatedAt: new Date()
          }
        })
        guestUserId = userId

        await prisma.reviewerProfile.update({
          where: { id: profileId },
          data: { userId }
        })
      }
    }
  }

  return { guestUserId, reviewerProfileId, guestEmail, guestName, guestPhone }
}

// ═══════════════════════════════════════════════════
// Handle old booking (cancel + optionally transfer payment)
// ═══════════════════════════════════════════════════

export async function handleOldBooking(
  ctx: ScenarioContext,
  newBookingId: string,
  bookingCode: string,
  guestEmail: string | undefined,
  agreementType: string,
  hostAgreementUrl: string | null,
): Promise<{ vehicleChangeToken: string | null }> {
  let vehicleChangeToken: string | null = null

  if (ctx.hasBookingToReplace && ctx.hasValidHold && ctx.existingBooking) {
    // Scenario A: Cancel old booking, transfer payment, vehicle change token
    await prisma.rentalBooking.update({
      where: { id: ctx.existingBooking.id },
      data: {
        status: 'CANCELLED',
        cancellationReason: 'REASSIGNED',
        cancelledAt: new Date(),
        replacedByBookingId: newBookingId,
        paymentIntentId: null,
        paymentStatus: 'CANCELLED' as any,
      }
    })
    console.log(`[CreateFromRequest] Scenario A: Old booking ${ctx.existingBooking.bookingCode} cancelled (payment transferred → ${bookingCode})`)

    vehicleChangeToken = crypto.randomUUID()
    const vehicleChangeExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    await prisma.rentalBooking.update({
      where: { id: newBookingId },
      data: { vehicleChangeToken, vehicleChangeExpiresAt }
    })
    console.log(`[CreateFromRequest] Vehicle change token generated for booking ${bookingCode}`)

  } else if (ctx.hasBookingToReplace && !ctx.hasValidHold && ctx.existingBooking) {
    // Scenario B: Cancel old booking (no payment to transfer)
    await prisma.rentalBooking.update({
      where: { id: ctx.existingBooking.id },
      data: {
        status: 'CANCELLED',
        cancellationReason: 'REASSIGNED',
        cancelledAt: new Date(),
        replacedByBookingId: newBookingId,
      }
    })
    console.log(`[CreateFromRequest] Scenario B: Old booking ${ctx.existingBooking.bookingCode} cancelled (no hold → ${bookingCode})`)

    // Set agreement metadata
    if (guestEmail) {
      await prisma.rentalBooking.update({
        where: { id: newBookingId },
        data: { signerEmail: guestEmail, agreementType, hostAgreementUrl }
      })
    }
  } else if (guestEmail) {
    // Scenario C / NEW: Set agreement metadata
    await prisma.rentalBooking.update({
      where: { id: newBookingId },
      data: { signerEmail: guestEmail, agreementType, hostAgreementUrl }
    })
  }

  return { vehicleChangeToken }
}
