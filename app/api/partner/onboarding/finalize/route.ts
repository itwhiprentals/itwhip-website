// app/api/partner/onboarding/finalize/route.ts
// Finalize recruited host onboarding: mark complete, create booking, auto-create guest

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { randomBytes } from 'crypto'
import { logProspectActivity } from '@/app/lib/auth/host-tokens'
import { GuestTokenHandler } from '@/app/lib/auth/guest-tokens'
import { sendEmail } from '@/app/lib/email/sender'
import { emailConfig, logEmail, generateEmailReference, getEmailFooterHtml, getEmailFooterText } from '@/app/lib/email/config'

const JWT_SECRET = process.env.JWT_SECRET!

async function getCurrentHost() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string }
    const hostId = decoded.hostId
    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        convertedFromProspect: {
          include: {
            request: true
          }
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
            state: true
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
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json(
        { error: 'No linked prospect found' },
        { status: 404 }
      )
    }

    const fleetRequest = prospect.request
    if (!fleetRequest) {
      return NextResponse.json(
        { error: 'No linked request found' },
        { status: 404 }
      )
    }

    // Ensure host has at least one car
    const car = host.cars[0]
    if (!car) {
      return NextResponse.json(
        { error: 'No car found. Please add a car first.' },
        { status: 400 }
      )
    }

    // Check if already finalized
    if (host.onboardingCompletedAt) {
      return NextResponse.json(
        { error: 'Onboarding already completed', alreadyComplete: true },
        { status: 400 }
      )
    }

    // Determine payment preference
    const isCash = prospect.paymentPreference === 'CASH'

    // Calculate pricing
    const dailyRate = prospect.counterOfferStatus === 'APPROVED' && prospect.counterOfferAmount
      ? prospect.counterOfferAmount
      : fleetRequest.offeredRate || 0
    const durationDays = fleetRequest.durationDays || 14
    const subtotal = dailyRate * durationDays
    const serviceFee = isCash ? 0 : subtotal * 0.10
    const totalAmount = subtotal + serviceFee
    const hostEarnings = subtotal - (isCash ? 0 : serviceFee)

    // ═══════════════════════════════════════════════════
    // STEP 1: Find or create guest account
    // ═══════════════════════════════════════════════════
    let reviewerProfileId: string | null = null
    let guestUserId: string | null = null
    const guestEmail = fleetRequest.guestEmail?.toLowerCase().trim()
    const guestName = fleetRequest.guestName || 'Guest'
    const guestPhone = fleetRequest.guestPhone || null

    if (guestEmail) {
      // Check for existing ReviewerProfile
      const existingProfile = await prisma.reviewerProfile.findUnique({
        where: { email: guestEmail },
        select: { id: true, userId: true }
      })

      if (existingProfile) {
        reviewerProfileId = existingProfile.id
        guestUserId = existingProfile.userId

        // Profile exists but no linked User — create one so guest can log in
        if (!guestUserId) {
          const existingUser = await prisma.user.findUnique({ where: { email: guestEmail } })
          if (existingUser) {
            guestUserId = existingUser.id
            // Link profile to existing user
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
        // Create new ReviewerProfile for the guest
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

        // Create a User record for the guest (no password — they'll set one later)
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

        // Link ReviewerProfile to User
        await prisma.reviewerProfile.update({
          where: { id: profileId },
          data: { userId }
        })
      }
    }

    // ═══════════════════════════════════════════════════
    // STEP 2: Create the booking
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
        ...(guestUserId && { renterId: guestUserId }),
        ...(reviewerProfileId && { reviewerProfileId }),
        guestEmail: guestEmail || '',
        guestName: guestName,
        guestPhone: guestPhone,

        // Dates
        startDate: fleetRequest.startDate || new Date(),
        endDate: fleetRequest.endDate || new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        endTime: '10:00',

        // Location
        pickupLocation: fleetRequest.pickupCity
          ? `${fleetRequest.pickupCity}, ${fleetRequest.pickupState || 'AZ'}`
          : car.city || '',
        pickupType: 'pickup',

        // Pricing
        dailyRate,
        numberOfDays: durationDays,
        subtotal,
        serviceFee,
        taxes: 0,
        securityDeposit: 0,
        depositHeld: 0,
        totalAmount,

        // Status — all recruited bookings start PENDING (guest chooses payment, host confirms)
        status: 'PENDING',
        bookingType: 'MANUAL',
        paymentStatus: 'PENDING',
        paymentType: null, // Guest selects CARD or CASH after auto-login
        fleetStatus: 'APPROVED',

        // Mark as request-based booking
        notes: `[Request-Based Booking] Created from ReservationRequest ${fleetRequest.id}. Payment: ${isCash ? 'Cash/Offline' : 'Platform'}`,
        verificationSource: 'ONBOARDING'
      },
      select: {
        id: true,
        bookingCode: true,
        status: true
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 3: Mark onboarding complete
    // ═══════════════════════════════════════════════════
    const now = new Date()

    // Update host
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        onboardingCompletedAt: now,
        approvalStatus: 'APPROVED',
        active: true,
        hostType: 'EXTERNAL',
        dashboardAccess: true,
        canViewBookings: true,
        canSetPricing: true,
        canEditCalendar: true,
        canMessageGuests: true,
        // Recruited hosts get 10% commission on first booking (15% discount off standard 25%)
        currentCommissionRate: 0.10,
        commissionRate: 0.10,
        // Default to fleet-size commission tiers (most recruited hosts have their own insurance)
        revenuePath: 'tiers',
        // Acquisition tracking
        acquisitionChannel: 'prospect_outreach',
        acquisitionSource: prospect.source?.toLowerCase() || null,
        acquisitionDate: prospect.createdAt,
        firstBookingDate: now,
        firstBookingEarnings: hostEarnings,
      }
    })

    // Update prospect
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        status: 'CONVERTED',
        convertedAt: now,
        onboardingCompletedAt: now,
        convertedBookingId: bookingId,
        lastActivityAt: now
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 4: Fulfill the reservation request
    // ═══════════════════════════════════════════════════
    await prisma.reservationRequest.update({
      where: { id: fleetRequest.id },
      data: {
        status: 'FULFILLED',
        fulfilledBookingId: bookingId
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 5: Log activity
    // ═══════════════════════════════════════════════════
    await logProspectActivity(prospect.id, 'ONBOARDING_FINALIZED', {
      hostId: host.id,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      carId: car.id,
      guestEmail,
      paymentPreference: prospect.paymentPreference,
      isCash
    })

    // ═══════════════════════════════════════════════════
    // STEP 6: Send emails (non-blocking)
    // ═══════════════════════════════════════════════════
    const baseUrl = emailConfig.websiteUrl
    const vehicleDesc = `${car.year} ${car.make} ${car.model}`
    const startDateStr = fleetRequest.startDate
      ? new Date(fleetRequest.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' })
      : 'TBD'
    const endDateStr = fleetRequest.endDate
      ? new Date(fleetRequest.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' })
      : 'TBD'

    // Send guest email + SMS with auto-login link
    if (guestEmail) {
      // Create auto-login token (shared by email + SMS)
      let autoLoginUrl = ''
      try {
        const guestAccessToken = await GuestTokenHandler.createGuestToken(bookingId, guestEmail)
        autoLoginUrl = `${baseUrl}/api/auth/guest-auto-login?token=${guestAccessToken}`
      } catch (tokenErr) {
        console.error('[Finalize] Failed to create guest access token:', tokenErr)
      }

      const guestFirstName = guestName.split(' ')[0]

      // ── Guest Email ──
      try {
        const guestRefId = generateEmailReference('GI')

        const guestSubject = `Your Car Rental is ${isCash ? 'Confirmed' : 'Almost Ready'}! — ${vehicleDesc}`
        const guestEmailResult = await sendEmail(
          guestEmail,
          guestSubject,
          `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">

              <!-- Header -->
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: ${isCash ? '#16a34a' : '#ea580c'}; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${isCash ? 'Booking Confirmed' : 'Booking Created'} • ${booking.bookingCode}
                </p>
                <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">
                  Your ${vehicleDesc} Rental
                </h1>
              </div>

              <!-- Main content -->
              <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">Hi ${guestFirstName},</p>
              <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
                Great news! A <strong>${vehicleDesc}</strong> has been ${isCash ? 'booked' : 'reserved'} for you through ItWhip.
              </p>

              <!-- Booking Details -->
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
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${durationDays} days</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Daily Rate</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">$${dailyRate}/day</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #374151;">Total</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right;">$${totalAmount.toFixed(2)}</td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #111827; margin: 20px 0;">
                To view your booking details and secure your account, click the button below:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${autoLoginUrl}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  View My Booking
                </a>
              </div>

              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0 0 20px 0;">
                This link expires in 7 days. You'll be asked to set a password on your first visit.
              </p>

              ${getEmailFooterHtml(guestRefId)}
            </body>
          </html>
          `,
          `
YOUR CAR RENTAL IS ${isCash ? 'CONFIRMED' : 'ALMOST READY'} • ${booking.bookingCode}

Hi ${guestFirstName},

Great news! A ${vehicleDesc} has been ${isCash ? 'booked' : 'reserved'} for you through ItWhip.

BOOKING DETAILS:
- Vehicle: ${vehicleDesc}
- Rental Dates: ${startDateStr} — ${endDateStr}
- Duration: ${durationDays} days
- Daily Rate: $${dailyRate}/day
- Total: $${totalAmount.toFixed(2)}

View your booking: ${autoLoginUrl}

This link expires in 7 days. You'll be asked to set a password on your first visit.

${getEmailFooterText(guestRefId)}
          `.trim()
        )

        await logEmail({
          recipientEmail: guestEmail,
          recipientName: guestName,
          subject: guestSubject,
          emailType: 'BOOKING_CONFIRMATION',
          relatedType: 'RentalBooking',
          relatedId: bookingId,
          messageId: guestEmailResult.messageId,
          referenceId: guestRefId
        })

        console.log(`[Finalize] Guest email sent to ${guestEmail}`)
      } catch (emailErr) {
        console.error('[Finalize] Failed to send guest email:', emailErr)
      }

      // ── Guest SMS ──
      if (guestPhone && autoLoginUrl) {
        try {
          const { sendSms } = await import('@/app/lib/twilio/sms')
          const smsBody = `Hi ${guestFirstName}! Your ${vehicleDesc} rental (${booking.bookingCode}) is set up on ItWhip. View your booking and choose your payment method here: ${autoLoginUrl}`
          await sendSms(guestPhone, smsBody, {
            type: 'SYSTEM',
            bookingId,
            hostId: host.id,
            guestId: reviewerProfileId || undefined
          })
          console.log(`[Finalize] Guest SMS sent to ${guestPhone}`)
        } catch (smsErr) {
          console.error('[Finalize] Failed to send guest SMS:', smsErr)
        }
      }
    }

    // Send host welcome email (combined welcome + booking confirmation)
    try {
      const hostEmail = host.email
      const hostFirstName = host.name?.split(' ')[0] || 'Host'
      const hostRefId = generateEmailReference('HW')
      const bookingUrl = `${baseUrl}/partner/bookings/${bookingId}`
      const dashboardUrl = `${baseUrl}/partner/dashboard`
      const earningsFormatted = hostEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const dailyRateFormatted = dailyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

      if (hostEmail) {
        const hostSubject = `Welcome to ItWhip, ${hostFirstName}! Your first booking is ready`
        const hostEmailResult = await sendEmail(
          hostEmail,
          hostSubject,
          `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">

              <!-- Header -->
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 8px 8px 0 0; padding: 28px 20px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 1px;">Welcome to ItWhip</p>
                <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
                  You're officially a host, ${hostFirstName}!
                </h1>
              </div>

              <!-- Welcome message -->
              <div style="padding: 24px 0;">
                <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">Hi ${hostFirstName},</p>
                <p style="font-size: 15px; margin: 0 0 12px 0; color: #111827;">
                  Congratulations on completing your setup! Your <strong>${vehicleDesc}</strong> is now listed and your first booking is ready to go.
                </p>
                <p style="font-size: 15px; margin: 0 0 20px 0; color: #374151;">
                  Here's a quick summary of everything that's set up for you:
                </p>
              </div>

              <!-- Earnings highlight -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 0 0 20px 0; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">Your First Booking Earnings</p>
                <p style="margin: 0; font-size: 36px; font-weight: 700; color: #15803d;">$${earningsFormatted}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #166534;">${durationDays} days @ $${dailyRateFormatted}/day</p>
              </div>

              <!-- Booking details table -->
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 0 0 20px 0;">
                <div style="background: #f9fafb; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 13px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Booking ${booking.bookingCode}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 10px 16px; color: #374151; border-bottom: 1px solid #f3f4f6;">Guest</td>
                    <td style="padding: 10px 16px; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #f3f4f6;">${guestName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 16px; color: #374151; border-bottom: 1px solid #f3f4f6;">Vehicle</td>
                    <td style="padding: 10px 16px; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #f3f4f6;">${vehicleDesc}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 16px; color: #374151; border-bottom: 1px solid #f3f4f6;">Rental Dates</td>
                    <td style="padding: 10px 16px; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #f3f4f6;">${startDateStr} — ${endDateStr}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 16px; color: #374151;">Payment</td>
                    <td style="padding: 10px 16px; color: #1f2937; font-weight: 600; text-align: right;">${isCash ? 'Cash (collect from guest)' : 'Platform (direct deposit)'}</td>
                  </tr>
                </table>
              </div>

              <!-- What's Next -->
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
                <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #92400e;">What's Next?</p>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #92400e; vertical-align: top; width: 24px;">1.</td>
                    <td style="padding: 6px 0; color: #78350f;"><strong>Guest confirms payment</strong> — ${guestName} will choose their payment method</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #92400e; vertical-align: top;">2.</td>
                    <td style="padding: 6px 0; color: #78350f;"><strong>Verify your guest</strong> — Check their driver's license before pickup</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #92400e; vertical-align: top;">3.</td>
                    <td style="padding: 6px 0; color: #78350f;"><strong>Hand over the keys</strong> — Meet your guest and start the rental</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Buttons -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${bookingUrl}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  View Booking
                </a>
                <div style="margin-top: 12px;">
                  <a href="${dashboardUrl}" style="font-size: 14px; color: #ea580c; text-decoration: none; font-weight: 500;">
                    Go to Dashboard
                  </a>
                </div>
              </div>

              <p style="font-size: 13px; color: #6b7280; text-align: center; margin: 0 0 20px 0;">
                Questions? Reply to this email or reach us at info@itwhip.com
              </p>

              ${getEmailFooterHtml(hostRefId)}
            </body>
          </html>
          `,
          `
WELCOME TO ITWHIP, ${hostFirstName.toUpperCase()}!

Hi ${hostFirstName},

Congratulations on completing your setup! Your ${vehicleDesc} is now listed and your first booking is ready to go.

YOUR FIRST BOOKING EARNINGS: $${earningsFormatted}
${durationDays} days @ $${dailyRateFormatted}/day

BOOKING ${booking.bookingCode}:
- Guest: ${guestName}
- Vehicle: ${vehicleDesc}
- Rental Dates: ${startDateStr} — ${endDateStr}
- Payment: ${isCash ? 'Cash (collect from guest)' : 'Platform (direct deposit)'}

WHAT'S NEXT:
1. Guest confirms payment — ${guestName} will choose their payment method
2. Verify your guest — Check their driver's license before pickup
3. Hand over the keys — Meet your guest and start the rental

View Booking: ${bookingUrl}
Dashboard: ${dashboardUrl}

Questions? Reply to this email or reach us at info@itwhip.com

${getEmailFooterText(hostRefId)}
          `.trim()
        )

        await logEmail({
          recipientEmail: hostEmail,
          recipientName: host.name || 'Host',
          subject: hostSubject,
          emailType: 'HOST_WELCOME',
          relatedType: 'RentalBooking',
          relatedId: bookingId,
          messageId: hostEmailResult.messageId,
          referenceId: hostRefId
        })

        console.log(`[Finalize] Host welcome email sent to ${hostEmail}`)
      }
    } catch (emailErr) {
      console.error('[Finalize] Failed to send host welcome email:', emailErr)
    }

    console.log(`[Finalize] Booking ${booking.bookingCode} created for host ${host.id}, guest ${guestEmail}`)

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status
      }
    })

  } catch (error: any) {
    console.error('[Finalize API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to finalize onboarding' },
      { status: 500 }
    )
  }
}
