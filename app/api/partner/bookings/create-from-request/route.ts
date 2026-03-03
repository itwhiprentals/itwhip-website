// app/api/partner/bookings/create-from-request/route.ts
// Creates booking + guest account when host clicks "Confirm & Send Agreement"
// This is the heavy-lifting phase that was split out of the finalize API.
// Finalize only activates the car + host. This endpoint does everything else.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { nanoid } from 'nanoid'
import { logProspectActivity } from '@/app/lib/auth/host-tokens'
import { GuestTokenHandler } from '@/app/lib/auth/guest-tokens'
import { sendEmail } from '@/app/lib/email/sender'
import { emailConfig, logEmail, generateEmailReference, getEmailFooterHtml, getEmailFooterText } from '@/app/lib/email/config'
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
    // STEP 4: Create the booking
    // ═══════════════════════════════════════════════════
    const bookingCode = `BK-${nanoid(6).toUpperCase()}`
    const bookingId = crypto.randomUUID()

    const booking = await prisma.rentalBooking.create({
      data: {
        id: bookingId,
        bookingCode,
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

    // ═══════════════════════════════════════════════════
    // STEP 5: Handle old booking (cancel + scenarios)
    // ═══════════════════════════════════════════════════
    const { vehicleChangeToken } = await handleOldBooking(
      ctx, bookingId, bookingCode, guest.guestEmail, agreementType, hostAgreementUrl
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

        console.log(`[CreateFromRequest] Agreement sent to ${guest.guestEmail} for booking ${bookingCode}`)
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

    // Scenarios B, C, NEW: send booking confirmation + auto-login
    if (!isScenarioA && guest.guestEmail) {
      let autoLoginUrl = ''
      try {
        const guestAccessToken = await GuestTokenHandler.createGuestToken(bookingId, guest.guestEmail)
        autoLoginUrl = `${baseUrl}/api/auth/guest-auto-login?token=${guestAccessToken}`
      } catch (tokenErr) {
        console.error('[CreateFromRequest] Failed to create guest access token:', tokenErr)
      }

      const guestFirstName = guest.guestName.split(' ')[0]

      try {
        const guestRefId = generateEmailReference('GI')
        const guestSubject = `Your Car Rental is Almost Ready! — ${vehicleDesc}`
        const guestEmailResult = await sendEmail(
          guest.guestEmail,
          guestSubject,
          `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">
                  Booking Created • ${booking.bookingCode}
                </p>
                <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">
                  Your ${vehicleDesc} Rental
                </h1>
              </div>
              <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">Hi ${guestFirstName},</p>
              <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
                Great news! A <strong>${vehicleDesc}</strong> has been reserved for you through ItWhip.
              </p>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
                <tr>
                  <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${vehicleDesc}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Rental Dates</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${startDateStr} — ${endDateStr}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Duration</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${pricing.durationDays} days</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Daily Rate</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">$${pricing.dailyRate}/day</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #374151;">Total</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right;">$${pricing.totalAmount.toFixed(2)}</td>
                </tr>
              </table>
              <p style="font-size: 14px; color: #111827; margin: 20px 0;">
                Please <strong>sign the rental agreement</strong> we sent you, then choose your payment method to finalize the booking.
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${autoLoginUrl}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  View My Booking
                </a>
              </div>
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0 0 20px 0;">
                These links expire in 7 days. You'll be asked to set a password on your first visit.
              </p>
              ${getEmailFooterHtml(guestRefId)}
            </body>
          </html>
          `,
          `
YOUR CAR RENTAL IS ALMOST READY • ${booking.bookingCode}

Hi ${guestFirstName},

Great news! A ${vehicleDesc} has been reserved for you through ItWhip.

BOOKING DETAILS:
- Vehicle: ${vehicleDesc}
- Rental Dates: ${startDateStr} — ${endDateStr}
- Duration: ${pricing.durationDays} days
- Daily Rate: $${pricing.dailyRate}/day
- Total: $${pricing.totalAmount.toFixed(2)}

Please sign the rental agreement, then choose your payment method.

View your booking: ${autoLoginUrl}

${getEmailFooterText(guestRefId)}
          `.trim()
        )

        await logEmail({
          recipientEmail: guest.guestEmail,
          recipientName: guest.guestName,
          subject: guestSubject,
          emailType: 'BOOKING_CONFIRMATION',
          relatedType: 'RentalBooking',
          relatedId: bookingId,
          messageId: guestEmailResult.messageId,
          referenceId: guestRefId
        })

        console.log(`[CreateFromRequest] Guest email sent to ${guest.guestEmail}`)
      } catch (emailErr) {
        console.error('[CreateFromRequest] Failed to send guest email:', emailErr)
      }

      // Guest SMS
      if (guest.guestPhone && autoLoginUrl) {
        try {
          const { sendSms } = await import('@/app/lib/twilio/sms')
          const smsBody = `Hi ${guestFirstName}! Your ${vehicleDesc} rental (${booking.bookingCode}) is set up on ItWhip. Sign your agreement and choose payment here: ${autoLoginUrl}`
          await sendSms(guest.guestPhone, smsBody, {
            type: 'SYSTEM',
            bookingId,
            hostId: host.id,
            guestId: guest.reviewerProfileId || undefined
          })
          console.log(`[CreateFromRequest] Guest SMS sent to ${guest.guestPhone}`)
        } catch (smsErr) {
          console.error('[CreateFromRequest] Failed to send guest SMS:', smsErr)
        }
      }
    }

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

    console.log(`[CreateFromRequest] Booking ${booking.bookingCode} created for host ${host.id}, guest ${guest.guestEmail}`)

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
