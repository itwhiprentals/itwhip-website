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

    // Send guest email with auto-login link
    if (guestEmail) {
      try {
        // Create a GuestAccessToken for auto-login
        const guestAccessToken = await GuestTokenHandler.createGuestToken(bookingId, guestEmail)
        const autoLoginUrl = `${baseUrl}/api/auth/guest-auto-login?token=${guestAccessToken}`
        const guestFirstName = guestName.split(' ')[0]
        const guestRefId = generateEmailReference('GI')

        await sendEmail(
          guestEmail,
          `Your Car Rental is ${isCash ? 'Confirmed' : 'Almost Ready'}! — ${vehicleDesc}`,
          `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
                <img src="${emailConfig.logos.default}" alt="ItWhip" style="height: 28px; margin-bottom: 8px;" />
                <p style="margin: 0 0 4px 0; font-size: 12px; color: ${isCash ? '#16a34a' : '#ea580c'}; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${isCash ? 'Booking Confirmed' : 'Booking Created'}
                </p>
                <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #111827;">
                  Your ${vehicleDesc} Rental
                </h1>
              </div>

              <p style="font-size: 16px; margin: 0 0 16px 0;">Hi ${guestFirstName},</p>
              <p style="font-size: 15px; margin: 0 0 16px 0; color: #374151;">
                Great news! A ${vehicleDesc} has been ${isCash ? 'booked' : 'reserved'} for you through ItWhip.
              </p>

              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <table style="width: 100%; font-size: 14px; color: #374151;">
                  <tr><td style="padding: 4px 0; font-weight: 600;">Vehicle</td><td style="padding: 4px 0; text-align: right;">${vehicleDesc}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Dates</td><td style="padding: 4px 0; text-align: right;">${startDateStr} — ${endDateStr}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Duration</td><td style="padding: 4px 0; text-align: right;">${durationDays} days</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Rate</td><td style="padding: 4px 0; text-align: right;">$${dailyRate}/day</td></tr>
                  <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 8px 0 4px; font-weight: 700;">Total</td><td style="padding: 8px 0 4px; text-align: right; font-weight: 700;">$${totalAmount.toFixed(2)}</td></tr>
                </table>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">Booking Code: ${booking.bookingCode}</p>
              </div>

              <p style="font-size: 14px; color: #374151; margin: 0 0 8px 0;">
                To view your booking details and secure your account, click the button below:
              </p>

              <div style="text-align: center; margin: 24px 0;">
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
YOUR CAR RENTAL IS ${isCash ? 'CONFIRMED' : 'ALMOST READY'}

Hi ${guestFirstName},

A ${vehicleDesc} has been ${isCash ? 'booked' : 'reserved'} for you through ItWhip.

BOOKING DETAILS:
Vehicle: ${vehicleDesc}
Dates: ${startDateStr} — ${endDateStr}
Duration: ${durationDays} days
Rate: $${dailyRate}/day
Total: $${totalAmount.toFixed(2)}
Booking Code: ${booking.bookingCode}

View your booking: ${autoLoginUrl}

This link expires in 7 days. You'll be asked to set a password on your first visit.

${getEmailFooterText(guestRefId)}
          `.trim()
        )

        await logEmail({
          recipientEmail: guestEmail,
          recipientName: guestName,
          subject: `Your Car Rental is ${isCash ? 'Confirmed' : 'Almost Ready'}!`,
          emailType: 'BOOKING_CONFIRMATION',
          relatedType: 'RentalBooking',
          relatedId: bookingId,
          referenceId: guestRefId
        })

        console.log(`[Finalize] Guest email sent to ${guestEmail}`)
      } catch (emailErr) {
        console.error('[Finalize] Failed to send guest email:', emailErr)
      }
    }

    // Send host confirmation email
    try {
      const hostEmail = host.email
      const hostFirstName = host.name?.split(' ')[0] || 'Host'
      const hostRefId = generateEmailReference('BC')

      if (hostEmail) {
        await sendEmail(
          hostEmail,
          `Booking Confirmed — ${vehicleDesc} for ${guestName}`,
          `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
                <img src="${emailConfig.logos.default}" alt="ItWhip" style="height: 28px; margin-bottom: 8px;" />
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">Booking Confirmed</p>
                <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #111827;">You're All Set, ${hostFirstName}!</h1>
              </div>

              <p style="font-size: 15px; margin: 0 0 16px 0; color: #374151;">
                Your onboarding is complete and the booking has been created. Here are the details:
              </p>

              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <table style="width: 100%; font-size: 14px; color: #374151;">
                  <tr><td style="padding: 4px 0; font-weight: 600;">Guest</td><td style="padding: 4px 0; text-align: right;">${guestName}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Vehicle</td><td style="padding: 4px 0; text-align: right;">${vehicleDesc}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Dates</td><td style="padding: 4px 0; text-align: right;">${startDateStr} — ${endDateStr}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Your Earnings</td><td style="padding: 4px 0; text-align: right; font-weight: 700; color: #16a34a;">$${hostEarnings.toFixed(2)}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 600;">Payment</td><td style="padding: 4px 0; text-align: right;">${isCash ? 'Cash (collect from guest)' : 'Platform (direct deposit)'}</td></tr>
                </table>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">Booking Code: ${booking.bookingCode}</p>
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${baseUrl}/partner/dashboard" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  Go to Dashboard
                </a>
              </div>

              ${getEmailFooterHtml(hostRefId)}
            </body>
          </html>
          `,
          `
BOOKING CONFIRMED — YOU'RE ALL SET, ${hostFirstName.toUpperCase()}!

Your onboarding is complete and the booking has been created.

BOOKING DETAILS:
Guest: ${guestName}
Vehicle: ${vehicleDesc}
Dates: ${startDateStr} — ${endDateStr}
Your Earnings: $${hostEarnings.toFixed(2)}
Payment: ${isCash ? 'Cash (collect from guest)' : 'Platform (direct deposit)'}
Booking Code: ${booking.bookingCode}

Go to Dashboard: ${baseUrl}/partner/dashboard

${getEmailFooterText(hostRefId)}
          `.trim()
        )

        await logEmail({
          recipientEmail: hostEmail,
          recipientName: host.name || 'Host',
          subject: `Booking Confirmed — ${vehicleDesc} for ${guestName}`,
          emailType: 'BOOKING_CONFIRMATION',
          relatedType: 'RentalBooking',
          relatedId: bookingId,
          referenceId: hostRefId
        })

        console.log(`[Finalize] Host email sent to ${hostEmail}`)
      }
    } catch (emailErr) {
      console.error('[Finalize] Failed to send host email:', emailErr)
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
