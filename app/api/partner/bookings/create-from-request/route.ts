// app/api/partner/bookings/create-from-request/route.ts
// "Confirm & Send" — sends agreement to guest and transitions to FULFILLED.
// Finalize creates the PENDING booking and notifies the guest (email + SMS + auto-login).
// This endpoint enriches with scenario data, sends the agreement, and marks fulfilled.
// Fallback: if no booking exists (pre-migration), creates one from scratch.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { nanoid } from 'nanoid'
import { logProspectActivity } from '@/app/lib/auth/host-tokens'
import { sendEmail } from '@/app/lib/email/sender'
import { emailConfig } from '@/app/lib/email/config'
import { generateAgreementToken, getTokenExpiryDate, generateSigningUrl } from '@/app/lib/agreements/tokens'
import { sendVehicleChangeEmail } from '@/app/lib/email/booking-emails'
import {
  detectScenarioAndFetchContext,
  calculateBookingPricing,
  resolveGuestAccount,
  handleOldBooking,
} from '@/app/lib/booking/create-from-request'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string
    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        convertedFromProspect: {
          include: { request: true }
        },
        cars: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            city: true,
            state: true,
          }
        }
      }
    })
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const host = await getPartnerFromToken()
    if (!host) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Host must have completed onboarding
    if (!host.onboardingCompletedAt) {
      return NextResponse.json({ error: 'Onboarding not completed' }, { status: 400 })
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json({ error: 'No linked prospect found' }, { status: 404 })
    }

    const fleetRequest = prospect.request
    if (!fleetRequest) {
      return NextResponse.json({ error: 'No linked request found' }, { status: 404 })
    }

    // Guard: request must be CAR_ASSIGNED (not already fulfilled)
    if (fleetRequest.status === 'FULFILLED') {
      // Idempotency: return existing booking
      const existingBooking = await prisma.rentalBooking.findFirst({
        where: { id: prospect.convertedBookingId || undefined },
        select: { id: true, bookingCode: true, status: true }
      })
      if (existingBooking) {
        return NextResponse.json({ success: true, booking: existingBooking, alreadyCreated: true })
      }
    }

    if (fleetRequest.status !== 'CAR_ASSIGNED') {
      return NextResponse.json(
        { error: `Request status must be CAR_ASSIGNED, got ${fleetRequest.status}` },
        { status: 400 }
      )
    }

    // ═══════════════════════════════════════════════════
    // GUARD: Prevent confirming bookings 12h+ past pickup time
    // Late acceptance (0-12h past) is allowed with UI warning
    // ═══════════════════════════════════════════════════
    if (fleetRequest.startDate) {
      const now = new Date()
      const pickupDate = new Date(fleetRequest.startDate)
      const [h, m] = (fleetRequest.startTime || '10:00').split(':').map(Number)
      pickupDate.setHours(h, m, 0, 0)
      const hoursOverdue = (now.getTime() - pickupDate.getTime()) / (1000 * 60 * 60)

      if (hoursOverdue > 12) {
        return NextResponse.json({
          success: false,
          error: 'BOOKING_EXPIRED',
          message: 'The pickup date for this booking has passed. The booking can no longer be confirmed.'
        }, { status: 400 })
      }
    }

    const car = host.cars[0]
    if (!car) {
      return NextResponse.json({ error: 'No car found' }, { status: 400 })
    }

    // Parse request body for agreement selection
    const body = await request.json()
    const agreementType = body.agreementType || prospect.agreementPreference || 'ITWHIP'
    const hostAgreementUrl = body.hostAgreementUrl || prospect.hostAgreementUrl || null

    // ═══════════════════════════════════════════════════
    // STEP 1: Detect scenario and fetch context
    // ═══════════════════════════════════════════════════
    const scenarioResult = await detectScenarioAndFetchContext(prospect)
    if (!scenarioResult.success) {
      return NextResponse.json({ error: scenarioResult.error }, { status: scenarioResult.status })
    }
    const ctx = scenarioResult.context

    // ═══════════════════════════════════════════════════
    // STEP 2: Calculate pricing
    // ═══════════════════════════════════════════════════
    const pricing = calculateBookingPricing(prospect, fleetRequest, ctx)

    // ═══════════════════════════════════════════════════
    // STEP 3: Resolve guest account
    // ═══════════════════════════════════════════════════
    const guest = await resolveGuestAccount(ctx, fleetRequest)

    // ═══════════════════════════════════════════════════
    // STEP 4: Find existing booking (from finalize) or create new
    // ═══════════════════════════════════════════════════
    let booking: { id: string; bookingCode: string; status: string }
    let bookingId: string

    // Check for PENDING booking created at finalize
    const existingPendingBooking = prospect.convertedBookingId
      ? await prisma.rentalBooking.findFirst({
          where: { id: prospect.convertedBookingId },
          select: { id: true, bookingCode: true, status: true }
        })
      : null

    if (existingPendingBooking) {
      // Booking exists from finalize — enrich with scenario-specific data
      booking = existingPendingBooking
      bookingId = existingPendingBooking.id

      const updateData: any = {
        notes: ctx.hasBookingToReplace && ctx.existingBooking
          ? `[Existing Guest] Reassigned from booking ${ctx.existingBooking?.bookingCode || ctx.existingBooking?.id}. Original host unavailable.`
          : ctx.isExistingGuest
            ? `[Existing Guest] Fresh booking for existing guest ${guest.guestEmail}. No previous booking to replace.`
            : `[Request-Based Booking] Confirmed from ReservationRequest ${fleetRequest.id}. Payment: TBD by guest`,
      }

      // Scenario A: transfer Stripe hold from old booking
      if (ctx.hasBookingToReplace && ctx.hasValidHold && ctx.existingBooking) {
        Object.assign(updateData, {
          originalBookingId: ctx.existingBooking.id,
          originalCarId: ctx.existingBooking.carId,
          vehicleChangeReason: 'Original host unavailable — vehicle reassigned to new partner',
          paymentIntentId: ctx.existingBooking.paymentIntentId,
          stripeCustomerId: ctx.existingBooking.stripeCustomerId,
          stripePaymentMethodId: ctx.existingBooking.stripePaymentMethodId,
          paymentStatus: 'AUTHORIZED',
          paymentType: 'CARD',
          agreementType: 'ITWHIP',
          agreementStatus: 'not_sent',
        })
      }
      // Scenario B: link original booking (no payment transfer)
      else if (ctx.hasBookingToReplace && ctx.existingBooking) {
        Object.assign(updateData, {
          originalBookingId: ctx.existingBooking.id,
          originalCarId: ctx.existingBooking.carId,
          vehicleChangeReason: 'Original host unavailable — reassigned to new partner',
        })
      }

      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: updateData,
      })

      console.log(`[CreateFromRequest] Using existing booking ${booking.bookingCode} from finalize`)
    } else {
      // FALLBACK: Create new booking (pre-migration data or edge case)
      const newBookingCode = `BK-${nanoid(6).toUpperCase()}`
      bookingId = crypto.randomUUID()

      booking = await prisma.rentalBooking.create({
        data: {
          id: bookingId,
          bookingCode: newBookingCode,
          updatedAt: new Date(),

          // Car and host
          carId: car.id,
          hostId: host.id,

          // Guest
          ...(guest.guestUserId && { renterId: guest.guestUserId }),
          ...(guest.reviewerProfileId && { reviewerProfileId: guest.reviewerProfileId }),
          guestEmail: guest.guestEmail || '',
          guestName: guest.guestName,
          guestPhone: guest.guestPhone,

          // Dates
          startDate: fleetRequest.startDate || new Date(),
          endDate: fleetRequest.endDate || new Date(Date.now() + pricing.durationDays * 24 * 60 * 60 * 1000),
          startTime: fleetRequest.startTime || '10:00',
          endTime: fleetRequest.endTime || '10:00',

          // Location
          pickupLocation: fleetRequest.pickupCity
            ? `${fleetRequest.pickupCity}, ${fleetRequest.pickupState || 'AZ'}`
            : car.city || '',
          pickupType: 'pickup',

          // Pricing
          dailyRate: pricing.dailyRate,
          numberOfDays: pricing.durationDays,
          subtotal: pricing.subtotal,
          serviceFee: pricing.serviceFee,
          taxes: 0,
          securityDeposit: 0,
          depositHeld: 0,
          totalAmount: pricing.totalAmount,

          // Status
          status: 'PENDING',
          bookingType: 'MANUAL',
          paymentStatus: 'PENDING',
          paymentType: null,
          fleetStatus: 'APPROVED',

          // Welcome discount
          platformFeeRate: 0.10,
          isWelcomeDiscount: true,

          // Payment deadline (48 hours for guest to complete)
          paymentDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),

          // Notes
          notes: ctx.hasBookingToReplace && ctx.existingBooking
            ? `[Existing Guest] Reassigned from booking ${ctx.existingBooking?.bookingCode || ctx.existingBooking?.id}. Original host unavailable.`
            : ctx.isExistingGuest
              ? `[Existing Guest] Fresh booking for existing guest ${guest.guestEmail}. No previous booking to replace.`
              : `[Request-Based Booking] Created from ReservationRequest ${fleetRequest.id}. Payment: TBD by guest`,
          verificationSource: 'ONBOARDING',

          // Scenario A: transfer payment + link to original booking
          ...(ctx.hasBookingToReplace && ctx.hasValidHold && ctx.existingBooking && {
            originalBookingId: ctx.existingBooking.id,
            originalCarId: ctx.existingBooking.carId,
            vehicleChangeReason: 'Original host unavailable — vehicle reassigned to new partner',
            paymentIntentId: ctx.existingBooking.paymentIntentId,
            stripeCustomerId: ctx.existingBooking.stripeCustomerId,
            stripePaymentMethodId: ctx.existingBooking.stripePaymentMethodId,
            paymentStatus: 'AUTHORIZED',
            paymentType: 'CARD',
            agreementType: 'ITWHIP',
            agreementStatus: 'not_sent',
          }),

          // Scenario B: link to original booking but NO payment transfer
          ...(ctx.hasBookingToReplace && !ctx.hasValidHold && ctx.existingBooking && {
            originalBookingId: ctx.existingBooking.id,
            originalCarId: ctx.existingBooking.carId,
            vehicleChangeReason: 'Original host unavailable — reassigned to new partner',
          })
        },
        select: {
          id: true,
          bookingCode: true,
          status: true,
        }
      })

      console.log(`[CreateFromRequest] Created new booking ${booking.bookingCode} (fallback)`)
    }

    // ═══════════════════════════════════════════════════
    // STEP 5: Handle old booking (cancel + scenarios)
    // ═══════════════════════════════════════════════════
    const { vehicleChangeToken } = await handleOldBooking(
      ctx, bookingId, booking.bookingCode, guest.guestEmail, agreementType, hostAgreementUrl
    )

    // ═══════════════════════════════════════════════════
    // STEP 6: Generate and send agreement
    // ═══════════════════════════════════════════════════
    if (guest.guestEmail && ctx.scenario !== 'A') {
      try {
        const token = generateAgreementToken()
        const expiresAt = getTokenExpiryDate(7)

        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            agreementToken: token,
            agreementStatus: 'sent',
            agreementSentAt: new Date(),
            agreementExpiresAt: expiresAt,
            signerEmail: guest.guestEmail,
            agreementType,
            hostAgreementUrl,
          }
        })

        const signingUrl = generateSigningUrl(token)
        const partnerName = host.partnerCompanyName || host.name || 'Your Host'
        const vehicleDesc = `${car.year} ${car.make} ${car.model}`

        await sendEmail(
          guest.guestEmail,
          `Please Sign Your Rental Agreement - ${partnerName}`,
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Rental Agreement Ready</h1>
            </div>
            <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Hi ${guest.guestName.split(' ')[0]},</p>
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                <strong>${partnerName}</strong> has prepared your rental agreement:
              </p>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">${vehicleDesc}</p>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  ${fleetRequest.startDate ? new Date(String(fleetRequest.startDate).split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}
                  to ${fleetRequest.endDate ? new Date(String(fleetRequest.endDate).split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}
                </p>
                <p style="color: #374151; font-size: 16px; margin: 10px 0 0 0;">
                  Total: <strong>$${Number(pricing.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </p>
              </div>
              <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
                Please review and sign the agreement to complete your booking.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${signingUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Review & Sign Agreement
                </a>
              </div>
              <p style="color: #dc2626; font-size: 12px; margin-top: 20px;"><strong>This link expires in 7 days.</strong></p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                If you have questions, contact ${partnerName} at ${host.partnerSupportEmail || host.email}.
              </p>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Powered by <a href="https://itwhip.com" style="color: #f97316;">ItWhip</a></p>
            </div>
          </div>
          `,
          `Hi ${guest.guestName.split(' ')[0]},\n\n${partnerName} has prepared your rental agreement.\n\n${vehicleDesc}\nTotal: $${Number(pricing.totalAmount).toFixed(2)}\n\nReview and sign: ${signingUrl}\n\nThis link expires in 7 days.`
        )

        console.log(`[CreateFromRequest] Agreement sent to ${guest.guestEmail} for booking ${booking.bookingCode}`)
      } catch (agreementErr) {
        console.error('[CreateFromRequest] Agreement send failed:', agreementErr)
      }
    }

    // ═══════════════════════════════════════════════════
    // STEP 7: Send guest notification emails + SMS
    // ═══════════════════════════════════════════════════
    const baseUrl = emailConfig.websiteUrl
    const vehicleDesc = `${car.year} ${car.make} ${car.model}`
    const startDateStr = fleetRequest.startDate
      ? new Date(String(fleetRequest.startDate).split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', { dateStyle: 'medium' })
      : 'TBD'
    const endDateStr = fleetRequest.endDate
      ? new Date(String(fleetRequest.endDate).split('T')[0] + 'T12:00:00').toLocaleDateString('en-US', { dateStyle: 'medium' })
      : 'TBD'

    // Scenario A sends vehicle change email instead
    const isScenarioA = ctx.hasBookingToReplace && ctx.hasValidHold
    if (isScenarioA && ctx.existingBooking && guest.guestEmail && vehicleChangeToken) {
      const changeUrl = `${baseUrl}/bookings/${bookingId}/change?token=${vehicleChangeToken}`
      const originalCarName = ctx.existingBooking.car
        ? `${ctx.existingBooking.car.year} ${ctx.existingBooking.car.make} ${ctx.existingBooking.car.model}`
        : 'your previous vehicle'

      try {
        await sendVehicleChangeEmail({
          guestEmail: guest.guestEmail,
          guestName: guest.guestName,
          bookingCode: booking.bookingCode,
          originalCarName,
          originalCarImage: '',
          newCarName: vehicleDesc,
          newCarImage: '',
          newDailyRate: pricing.dailyRate,
          startDate: (fleetRequest.startDate || new Date()).toISOString(),
          endDate: (fleetRequest.endDate || new Date()).toISOString(),
          changeUrl,
          reason: 'Your original host is no longer available — we found a great new vehicle for your trip!',
        })
        console.log(`[CreateFromRequest] Vehicle change email sent to ${guest.guestEmail}`)
      } catch (emailErr) {
        console.error('[CreateFromRequest] Failed to send vehicle change email:', emailErr)
      }

      if (guest.guestPhone) {
        try {
          const { sendSms } = await import('@/app/lib/twilio/sms')
          const guestFirstName = guest.guestName.split(' ')[0]
          await sendSms(
            guest.guestPhone,
            `ItWhip: Great news, ${guestFirstName}! We found a new vehicle for your trip on ${startDateStr}–${endDateStr}. Check your email to review and confirm.`,
            { type: 'BOOKING_RECEIVED', bookingId, hostId: host.id, guestId: guest.reviewerProfileId || undefined }
          )
        } catch (smsErr) {
          console.error('[CreateFromRequest] Failed to send bridge SMS:', smsErr)
        }
      }
    }

    // Guest notification (email + SMS + auto-login) is handled by finalize.
    // This endpoint only sends the agreement and updates status.

    // ═══════════════════════════════════════════════════
    // STEP 8: Update prospect, request, host
    // ═══════════════════════════════════════════════════
    const now = new Date()

    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        convertedBookingId: bookingId,
        status: 'FULFILLED',
        lastActivityAt: now,
      }
    })

    await prisma.reservationRequest.update({
      where: { id: fleetRequest.id },
      data: {
        status: 'FULFILLED',
        fulfilledBookingId: bookingId,
      }
    })

    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        firstBookingDate: now,
        firstBookingEarnings: pricing.hostEarnings,
        // Update agreement preference if host changed it at confirm time
        agreementPreference: agreementType,
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 9: Log activity
    // ═══════════════════════════════════════════════════
    await logProspectActivity(prospect.id, 'BOOKING_CREATED_FROM_REQUEST', {
      hostId: host.id,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      carId: car.id,
      guestEmail: guest.guestEmail,
      scenario: ctx.scenario,
      agreementType,
      pricing: {
        dailyRate: pricing.dailyRate,
        durationDays: pricing.durationDays,
        totalAmount: pricing.totalAmount,
        hostEarnings: pricing.hostEarnings,
      }
    })

    console.log(`[CreateFromRequest] Booking ${booking.bookingCode} confirmed for host ${host.id}, guest ${guest.guestEmail}, scenario ${ctx.scenario}`)

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
      }
    })

  } catch (error: any) {
    console.error('[CreateFromRequest] Error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
