// app/api/fleet/prospects/[id]/invite/route.ts
// Send or resend invite email to a host prospect

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'

// POST /api/fleet/prospects/[id]/invite - Send invite email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prospect = await prisma.hostProspect.findUnique({
      where: { id },
      include: {
        request: {
          select: {
            id: true,
            requestCode: true,
            guestName: true,
            vehicleType: true,
            vehicleMake: true,
            startDate: true,
            endDate: true,
            durationDays: true,
            offeredRate: true,
            pickupCity: true,
            pickupState: true
          }
        }
      }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      )
    }

    // Check if already fully converted (has completed onboarding)
    // Allow resending if host exists but hasn't completed onboarding
    if (prospect.convertedHostId) {
      const convertedHost = await prisma.rentalHost.findUnique({
        where: { id: prospect.convertedHostId },
        select: {
          id: true,
          hasPassword: true,
          cars: { select: { id: true }, take: 1 }
        }
      })

      // Only block if host has added a car (real onboarding completion)
      const hasCar = convertedHost?.cars && convertedHost.cars.length > 0

      if (hasCar) {
        return NextResponse.json(
          { error: 'This prospect has already completed host onboarding' },
          { status: 400 }
        )
      }

      // Fix hasPassword if incorrectly set to true (legacy data issue)
      if (convertedHost && convertedHost.hasPassword === true) {
        await prisma.rentalHost.update({
          where: { id: convertedHost.id },
          data: { hasPassword: false }
        })
      }
      // Allow resending - they clicked but didn't finish setup
    }

    // Generate new invite token
    const inviteToken = nanoid(32)
    const inviteTokenExp = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours

    // Update prospect with new token
    const updatedProspect = await prisma.hostProspect.update({
      where: { id },
      data: {
        inviteToken,
        inviteTokenExp,
        inviteSentAt: new Date(),
        inviteResendCount: { increment: 1 },
        lastResendAt: new Date(),
        status: 'EMAIL_SENT'
      }
    })

    // Build the invite link (use /onboard/ not /invite/)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/onboard/${inviteToken}`

    // Get first name only
    const firstName = prospect.name.split(' ')[0]

    // Build email subject - friendly handover tone
    const vehicleDesc = prospect.vehicleMake || prospect.vehicleType || 'vehicle'
    const subject = `Your ${vehicleDesc} Booking is Ready 🚗`

    // Calculate potential earnings if we have rate and duration
    const hasBookingDetails = prospect.request && prospect.request.offeredRate && prospect.request.durationDays
    const potentialEarnings = hasBookingDetails
      ? Number(prospect.request!.offeredRate) * Number(prospect.request!.durationDays)
      : null

    // Build the earnings highlight if available
    const earningsSection = potentialEarnings ? `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Your Potential Payout</p>
        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #1f2937;">$${potentialEarnings.toLocaleString()}</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">${prospect.request!.durationDays} days @ $${prospect.request!.offeredRate}/day</p>
      </div>
    ` : ''

    // Format dates helper
    const formatDate = (date: Date | null) => {
      if (!date) return null
      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    // Build booking details section
    const startDateStr = prospect.request?.startDate ? formatDate(prospect.request.startDate) : null
    const endDateStr = prospect.request?.endDate ? formatDate(prospect.request.endDate) : null
    const datesDisplay = startDateStr && endDateStr ? `${startDateStr} - ${endDateStr}` : (startDateStr || 'Flexible')

    const requestDetails = prospect.request ? `
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Vehicle Requested</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${prospect.request.vehicleType || prospect.request.vehicleMake || 'Similar to yours'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Rental Dates</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${datesDisplay}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Duration</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${prospect.request.durationDays ? `${prospect.request.durationDays} days` : 'Flexible'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Daily Rate</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${prospect.request.offeredRate ? `$${prospect.request.offeredRate}/day` : 'Negotiable'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Pickup Location</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${prospect.request.pickupCity || 'Phoenix'}, ${prospect.request.pickupState || 'AZ'}</td>
        </tr>
      </table>
    ` : ''

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">

        <!-- Header -->
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Your Booking Is Ready${prospect.request?.requestCode ? ` • #${prospect.request.requestCode}` : ''}</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">Here's the Booking We Discussed</h1>
        </div>

        <!-- Main content -->
        <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
          Hi ${firstName},
        </p>

        <p style="font-size: 16px; margin: 0 0 16px 0; color: #374151;">
          Great news! As promised, we're passing along a booking for your <strong>${vehicleDesc}</strong>.
        </p>

        <p style="font-size: 16px; color: #374151; margin: 0;">
          A verified guest is ready to book. Click below to view your dashboard and accept.
        </p>

        ${earningsSection}

        ${requestDetails}

        <!-- Status indicator -->
        <p style="font-size: 14px; color: #374151; margin: 20px 0;">
          <strong>This booking is reserved for you.</strong> We're holding it for 48 hours so you have time to review.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #ea580c; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
            View Your Dashboard & Accept
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <!-- Benefits Section -->
        <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
          What you get with your Partner Dashboard:
        </p>
        <table style="width: 100%; font-size: 13px; color: #4b5563;">
          <tr>
            <td style="padding: 5px 0; width: 50%;">✓ Guest Verification via Stripe</td>
            <td style="padding: 5px 0; width: 50%;">✓ Counter-Offer on Rates</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Instant Payouts</td>
            <td style="padding: 5px 0;">✓ E-Sign Contracts</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Guest Communication Hub</td>
            <td style="padding: 5px 0;">✓ Claims Management</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Full Fleet Management</td>
            <td style="padding: 5px 0;">✓ Revenue & Analytics</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ GPS Vehicle Tracking</td>
            <td style="padding: 5px 0;">✓ Booking Calendar</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Your Own Host Landing Page</td>
            <td style="padding: 5px 0;">✓ Future Booking Requests</td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <p style="color: #6b7280; font-size: 13px; margin-bottom: 0; text-align: center;">
          Questions? Reply to this email or call <a href="tel:+13053999069" style="color: #ea580c; font-weight: 600;">(305) 399-9069</a>
        </p>

        <!-- About Us -->
        <p style="color: #9ca3af; font-size: 10px; margin-top: 16px; text-align: center; line-height: 1.4;">
          ItWhip is a peer-to-peer vehicle rental marketplace connecting vehicle owners with verified renters.
          We help hosts monetize their vehicles while providing guests with unique rental options.
          <a href="https://itwhip.com/host-benefits" style="color: #ea580c;">Host Benefits</a> |
          <a href="https://itwhip.com/list-your-car" style="color: #ea580c;">Calculate Your Earnings</a>
        </p>

        <!-- Communication Footer -->
        <p style="color: #9ca3af; font-size: 11px; margin-top: 12px; text-align: center; line-height: 1.5;">
          All hosts are welcome to finalize bookings directly with guests outside the platform.
          We just ask that you communicate clearly with the guest to ensure a smooth experience.
          <a href="https://itwhip.com/corporate" style="color: #ea580c;">Learn more about corporate rentals</a>
        </p>

        <!-- Insurance Disclaimer -->
        <p style="color: #9ca3af; font-size: 10px; margin-top: 8px; text-align: center; line-height: 1.4;">
          <strong>Insurance:</strong> Hosts are responsible for maintaining valid insurance coverage on their vehicles.
          ItWhip does not provide primary insurance. Please ensure your policy covers peer-to-peer rentals.
          <a href="https://itwhip.com/support/insurance" style="color: #ea580c;">Insurance Support</a> |
          <a href="https://itwhip.com/insurance-guide" style="color: #ea580c;">Insurance Guide</a> |
          <a href="https://itwhip.com/host/insurance-options" style="color: #ea580c;">Insurance Options</a>
        </p>

        <!-- Social Links with real SVG logos (10% smaller) -->
        <table cellpadding="0" cellspacing="0" style="margin: 16px auto;">
          <tr>
            <!-- Instagram -->
            <td style="padding: 0 3px;">
              <a href="https://www.instagram.com/itwhipofficial" target="_blank" style="display: block; text-decoration: none;">
                <table cellpadding="0" cellspacing="0" width="25" height="25" style="background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); border-radius: 5px;">
                  <tr>
                    <td align="center" valign="middle" style="width: 25px; height: 25px;">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/%3E%3C/svg%3E" alt="Instagram" width="14" height="14" style="display: block; border: 0;" />
                    </td>
                  </tr>
                </table>
              </a>
            </td>
            <!-- Facebook -->
            <td style="padding: 0 3px;">
              <a href="https://www.facebook.com/people/Itwhipcom/61573990760395/" target="_blank" style="display: block; text-decoration: none;">
                <table cellpadding="0" cellspacing="0" width="25" height="25" style="background: #1877f2; border-radius: 5px;">
                  <tr>
                    <td align="center" valign="middle" style="width: 25px; height: 25px;">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/%3E%3C/svg%3E" alt="Facebook" width="14" height="14" style="display: block; border: 0;" />
                    </td>
                  </tr>
                </table>
              </a>
            </td>
            <!-- X (Twitter) -->
            <td style="padding: 0 3px;">
              <a href="https://x.com/itwhipofficial" target="_blank" style="display: block; text-decoration: none;">
                <table cellpadding="0" cellspacing="0" width="25" height="25" style="background: #000000; border-radius: 5px;">
                  <tr>
                    <td align="center" valign="middle" style="width: 25px; height: 25px;">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E" alt="X" width="12" height="12" style="display: block; border: 0;" />
                    </td>
                  </tr>
                </table>
              </a>
            </td>
            <!-- LinkedIn -->
            <td style="padding: 0 3px;">
              <a href="https://www.linkedin.com/company/itwhip/" target="_blank" style="display: block; text-decoration: none;">
                <table cellpadding="0" cellspacing="0" width="25" height="25" style="background: #0a66c2; border-radius: 5px;">
                  <tr>
                    <td align="center" valign="middle" style="width: 25px; height: 25px;">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/%3E%3C/svg%3E" alt="LinkedIn" width="14" height="14" style="display: block; border: 0;" />
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
        </table>

        <p style="color: #9ca3af; font-size: 11px; margin-top: 8px; text-align: center;">
          ItWhip Rentals | Phoenix, AZ | <a href="https://itwhip.com" style="color: #ea580c;">itwhip.com</a>
          <br/>
          <a href="https://itwhip.com/about" style="color: #9ca3af;">About</a> |
          <a href="https://itwhip.com/terms" style="color: #9ca3af;">Terms</a> |
          <a href="https://itwhip.com/privacy" style="color: #9ca3af;">Privacy</a>
        </p>

        <!-- Tracking pixel for email open tracking -->
        <img src="${baseUrl}/api/tracking/pixel/${id}" width="1" height="1" style="display:none;width:1px;height:1px;border:0;" alt="" />
      </body>
      </html>
    `

    const text = `
YOUR BOOKING IS READY${prospect.request?.requestCode ? ` • #${prospect.request.requestCode}` : ''}

Hi ${firstName},

Great news! As promised, we're passing along a booking for your ${vehicleDesc}.

A verified guest is ready to book. Click below to view your dashboard and accept.

${potentialEarnings ? `YOUR POTENTIAL PAYOUT: $${potentialEarnings.toLocaleString()}` : ''}

${prospect.request ? `BOOKING DETAILS:
- Vehicle Requested: ${prospect.request.vehicleType || prospect.request.vehicleMake || 'Similar to yours'}
- Rental Dates: ${datesDisplay}
- Duration: ${prospect.request.durationDays ? `${prospect.request.durationDays} days` : 'Flexible'}
- Daily Rate: ${prospect.request.offeredRate ? `$${prospect.request.offeredRate}/day` : 'Negotiable'}
- Pickup Location: ${prospect.request.pickupCity || 'Phoenix'}, ${prospect.request.pickupState || 'AZ'}` : ''}

This booking is reserved for you. We're holding it for 48 hours so you have time to review.

View Your Dashboard & Accept:
${inviteLink}

WHAT YOU GET WITH YOUR PARTNER DASHBOARD:
✓ Guest Verification via Stripe    ✓ Counter-Offer on Rates
✓ Instant Payouts                  ✓ E-Sign Contracts
✓ Guest Communication Hub          ✓ Claims Management
✓ Full Fleet Management            ✓ Revenue & Analytics
✓ GPS Vehicle Tracking             ✓ Booking Calendar
✓ Your Own Host Landing Page       ✓ Future Booking Requests

Questions? Reply to this email or call (305) 399-9069

ItWhip is a peer-to-peer vehicle rental marketplace connecting vehicle owners with verified renters. We help hosts monetize their vehicles while providing guests with unique rental options.
Host Benefits: https://itwhip.com/host-benefits | Calculate Your Earnings: https://itwhip.com/list-your-car

All hosts are welcome to finalize bookings directly with guests outside the platform. We just ask that you communicate clearly with the guest to ensure a smooth experience.
Learn more about corporate rentals: https://itwhip.com/corporate

INSURANCE: Hosts are responsible for maintaining valid insurance coverage on their vehicles. ItWhip does not provide primary insurance. Please ensure your policy covers peer-to-peer rentals.
Insurance Support: https://itwhip.com/support/insurance | Insurance Guide: https://itwhip.com/insurance-guide | Insurance Options: https://itwhip.com/host/insurance-options

Follow us: Instagram @itwhipofficial | Facebook | X @itwhipofficial | LinkedIn

ItWhip Rentals | Phoenix, AZ | itwhip.com
About: https://itwhip.com/about | Terms: https://itwhip.com/terms | Privacy: https://itwhip.com/privacy
    `

    // Send the email
    console.log('[Prospect Invite] Sending email to:', prospect.email)
    console.log('[Prospect Invite] Invite link:', inviteLink)

    const emailResult = await sendEmail(
      prospect.email,
      subject,
      html,
      text,
      { requestId: `prospect-invite-${id}` }
    )

    if (!emailResult.success) {
      console.error('[Prospect Invite] Email failed:', emailResult.error)
      // Still return success for the invite creation, but note email failed
      return NextResponse.json({
        success: true,
        emailSent: false,
        emailError: emailResult.error,
        prospect: updatedProspect,
        inviteLink,
        expiresAt: inviteTokenExp
      })
    }

    console.log('[Prospect Invite] Email sent successfully:', emailResult.messageId)

    return NextResponse.json({
      success: true,
      emailSent: true,
      messageId: emailResult.messageId,
      prospect: updatedProspect,
      inviteLink,
      expiresAt: inviteTokenExp
    })

  } catch (error: any) {
    console.error('[Fleet Prospect Invite] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    )
  }
}
