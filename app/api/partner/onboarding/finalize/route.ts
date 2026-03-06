// app/api/partner/onboarding/finalize/route.ts
// Finalize: activates car + completes host onboarding + creates PENDING booking
// All DB operations wrapped in prisma.$transaction() for atomicity.
// Booking creation gives us a bookingId for messaging at CAR_ASSIGNED.
// Agreement sending + guest notification deferred to create-from-request (Confirm & Send).

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { logProspectActivity } from '@/app/lib/auth/host-tokens'
import { sendEmail } from '@/app/lib/email/sender'
import { emailConfig, logEmail, generateEmailReference, getEmailFooterHtml, getEmailFooterText } from '@/app/lib/email/config'
import {
  detectScenarioAndFetchContext,
  calculateBookingPricing,
  resolveGuestAccount,
} from '@/app/lib/booking/create-from-request'

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

    // ═══════════════════════════════════════════════════
    // PRE-TRANSACTION: Resolve scenario, pricing, guest account
    // These involve reads + external calls (Stripe) — kept outside tx
    // ═══════════════════════════════════════════════════
    const scenarioResult = await detectScenarioAndFetchContext(prospect)
    if (!scenarioResult.success) {
      console.error('[Finalize] Scenario detection failed:', scenarioResult.error)
      // Non-fatal: proceed without booking creation
    }

    let pricing: ReturnType<typeof calculateBookingPricing> | null = null
    let guest: Awaited<ReturnType<typeof resolveGuestAccount>> | null = null
    let bookingId: string | null = null

    if (scenarioResult.success) {
      const ctx = scenarioResult.context
      pricing = calculateBookingPricing(prospect, fleetRequest, ctx)
      guest = await resolveGuestAccount(ctx, fleetRequest)
    }

    // ═══════════════════════════════════════════════════
    // ATOMIC TRANSACTION: All DB writes
    // ═══════════════════════════════════════════════════
    const now = new Date()
    const bookingCode = `BK-${nanoid(6).toUpperCase()}`
    const newBookingId = crypto.randomUUID()

    await prisma.$transaction(async (tx) => {
      // STEP 1: Mark host onboarding complete
      await tx.rentalHost.update({
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
          paymentPreference: prospect.paymentPreference || null,
          agreementPreference: prospect.agreementPreference || null,
          currentCommissionRate: 0.25,
          commissionRate: 0.25,
          commissionTier: 'STANDARD',
          revenuePath: 'tiers',
          welcomeDiscountUsed: false,
          acquisitionChannel: 'prospect_outreach',
          acquisitionSource: prospect.source?.toLowerCase() || null,
          acquisitionDate: prospect.createdAt,
        }
      })

      // STEP 2: Activate the car
      await tx.rentalCar.update({
        where: { id: car.id },
        data: { isActive: true }
      })

      // STEP 3: Create booking (PENDING) if guest was resolved
      if (pricing && guest) {
        await tx.rentalBooking.create({
          data: {
            id: newBookingId,
            bookingCode,
            updatedAt: now,

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

            // Status — PENDING until host clicks Confirm & Send
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
            notes: `[Request-Based Booking] Created at finalize from ReservationRequest ${fleetRequest.id}. Awaiting host confirmation.`,
            verificationSource: 'ONBOARDING',
          } as any
        })
        bookingId = newBookingId
      }

      // STEP 4: Update prospect
      await tx.hostProspect.update({
        where: { id: prospect.id },
        data: {
          status: 'CONVERTED',
          convertedAt: now,
          onboardingCompletedAt: now,
          lastActivityAt: now,
          ...(bookingId && { convertedBookingId: bookingId }),
        }
      })

      // STEP 5: Update request status (CAR_ASSIGNED, not FULFILLED)
      await tx.reservationRequest.update({
        where: { id: fleetRequest.id },
        data: {
          status: 'CAR_ASSIGNED',
          ...(bookingId && { fulfilledBookingId: bookingId }),
        }
      })
    })

    // ═══════════════════════════════════════════════════
    // POST-TRANSACTION: Non-critical operations (logs, emails)
    // These are outside the transaction — can't rollback, don't block DB
    // ═══════════════════════════════════════════════════

    // Log activity
    await logProspectActivity(prospect.id, 'ONBOARDING_COMPLETED', {
      hostId: host.id,
      carId: car.id,
      requestId: fleetRequest.id,
      bookingId,
    })

    // Send host welcome email
    const baseUrl = emailConfig.websiteUrl
    const vehicleDesc = `${car.year} ${car.make} ${car.model}`
    const guestName = fleetRequest.guestName || 'your guest'
    const requestUrl = `${baseUrl}/partner/requests/${fleetRequest.id}`

    try {
      const hostEmail = host.email
      const hostFirstName = host.name?.split(' ')[0] || 'Host'
      const hostRefId = generateEmailReference('HW')

      if (hostEmail) {
        const hostSubject = `Welcome to ItWhip, ${hostFirstName}! Your car is approved`
        const hostEmailResult = await sendEmail(
          hostEmail,
          hostSubject,
          `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 8px 8px 0 0; padding: 28px 20px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 1px;">Welcome to ItWhip</p>
                <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
                  Your ${vehicleDesc} is approved!
                </h1>
              </div>
              <div style="padding: 24px 0;">
                <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">Hi ${hostFirstName},</p>
                <p style="font-size: 15px; margin: 0 0 12px 0; color: #111827;">
                  Congratulations on completing your setup! Your <strong>${vehicleDesc}</strong> is now listed on ItWhip.
                </p>
                <p style="font-size: 15px; margin: 0 0 20px 0; color: #374151;">
                  You have a booking request from <strong>${guestName}</strong> waiting for your confirmation. Review the details and send the rental agreement when you're ready.
                </p>
              </div>
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
                <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #92400e;">What's Next?</p>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #92400e; vertical-align: top; width: 24px;">1.</td>
                    <td style="padding: 6px 0; color: #78350f;"><strong>Confirm the booking</strong> — Review the details and send the agreement to ${guestName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #92400e; vertical-align: top;">2.</td>
                    <td style="padding: 6px 0; color: #78350f;"><strong>Guest signs & selects payment</strong> — Card (auto-confirms) or Cash (you collect)</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #92400e; vertical-align: top;">3.</td>
                    <td style="padding: 6px 0; color: #78350f;"><strong>Hand over the keys</strong> — Meet your guest and start the rental</td>
                  </tr>
                </table>
              </div>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${requestUrl}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  Confirm Booking
                </a>
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

Congratulations! Your ${vehicleDesc} is approved and listed on ItWhip.

You have a booking request from ${guestName} waiting for your confirmation.

WHAT'S NEXT:
1. Confirm the booking — Review details and send the agreement to ${guestName}
2. Guest signs & selects payment — Card (auto-confirms) or Cash (you collect)
3. Hand over the keys — Meet your guest and start the rental

Confirm Booking: ${requestUrl}

Questions? Reply to this email or reach us at info@itwhip.com

${getEmailFooterText(hostRefId)}
          `.trim()
        )

        await logEmail({
          recipientEmail: hostEmail,
          recipientName: host.name || 'Host',
          subject: hostSubject,
          emailType: 'HOST_WELCOME',
          relatedType: 'ReservationRequest',
          relatedId: fleetRequest.id,
          messageId: hostEmailResult.messageId,
          referenceId: hostRefId
        })

        console.log(`[Finalize] Host welcome email sent to ${hostEmail}`)
      }
    } catch (emailErr) {
      console.error('[Finalize] Failed to send host welcome email:', emailErr)
    }

    // Send lightweight guest heads-up SMS (if phone available)
    if (guest?.guestPhone && bookingId) {
      try {
        const { sendSms } = await import('@/app/lib/twilio/sms')
        const guestFirstName = (guest.guestName || 'Guest').split(' ')[0]
        await sendSms(
          guest.guestPhone,
          `Hi ${guestFirstName}! Great news — a host on ItWhip has matched your request for a ${vehicleDesc}. You'll receive the rental agreement shortly.`,
          { type: 'SYSTEM', bookingId, hostId: host.id, guestId: guest.reviewerProfileId || undefined }
        )
        console.log(`[Finalize] Guest heads-up SMS sent to ${guest.guestPhone}`)
      } catch (smsErr) {
        console.error('[Finalize] Failed to send guest heads-up SMS:', smsErr)
      }
    }

    console.log(`[Finalize] Onboarding completed for host ${host.id}, car ${car.id} activated, booking ${bookingId || 'N/A'}, request ${fleetRequest.id} → CAR_ASSIGNED`)

    return NextResponse.json({
      success: true,
      requestId: fleetRequest.id,
      bookingId,
    })

  } catch (error: any) {
    console.error('[Finalize API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to finalize onboarding' },
      { status: 500 }
    )
  }
}
