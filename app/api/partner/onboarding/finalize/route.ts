// app/api/partner/onboarding/finalize/route.ts
// Lightweight finalize: activates car + completes host onboarding
// Booking creation is deferred to POST /api/partner/bookings/create-from-request
// when the host clicks "Confirm & Send Agreement"

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { logProspectActivity } from '@/app/lib/auth/host-tokens'
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

    // ═══════════════════════════════════════════════════
    // STEP 1: Mark host onboarding complete
    // ═══════════════════════════════════════════════════
    const now = new Date()

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
        // Copy host preferences from prospect
        paymentPreference: prospect.paymentPreference || null,
        agreementPreference: prospect.agreementPreference || null,
        // Standard commission tier (25%) — welcome discount is per-booking
        currentCommissionRate: 0.25,
        commissionRate: 0.25,
        commissionTier: 'STANDARD',
        revenuePath: 'tiers',
        welcomeDiscountUsed: false,
        // Acquisition tracking
        acquisitionChannel: 'prospect_outreach',
        acquisitionSource: prospect.source?.toLowerCase() || null,
        acquisitionDate: prospect.createdAt,
        // NOTE: firstBookingDate and firstBookingEarnings set when booking is created
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 2: Activate the car
    // ═══════════════════════════════════════════════════
    await prisma.rentalCar.update({
      where: { id: car.id },
      data: {
        isActive: true,
        approvalStatus: 'APPROVED',
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 3: Update prospect (CONVERTED, not FULFILLED yet)
    // ═══════════════════════════════════════════════════
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        status: 'CONVERTED',
        convertedAt: now,
        onboardingCompletedAt: now,
        lastActivityAt: now,
        // NOTE: convertedBookingId set when booking is created
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 4: Update request status (CAR_ASSIGNED, not FULFILLED)
    // ═══════════════════════════════════════════════════
    await prisma.reservationRequest.update({
      where: { id: fleetRequest.id },
      data: {
        status: 'CAR_ASSIGNED',
        // NOTE: fulfilledBookingId set when booking is created
      }
    })

    // ═══════════════════════════════════════════════════
    // STEP 5: Log activity
    // ═══════════════════════════════════════════════════
    await logProspectActivity(prospect.id, 'ONBOARDING_COMPLETED', {
      hostId: host.id,
      carId: car.id,
      requestId: fleetRequest.id,
    })

    // ═══════════════════════════════════════════════════
    // STEP 6: Send host-only welcome email
    // ═══════════════════════════════════════════════════
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

    console.log(`[Finalize] Onboarding completed for host ${host.id}, car ${car.id} activated, request ${fleetRequest.id} → CAR_ASSIGNED`)

    return NextResponse.json({
      success: true,
      requestId: fleetRequest.id,
    })

  } catch (error: any) {
    console.error('[Finalize API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to finalize onboarding' },
      { status: 500 }
    )
  }
}
