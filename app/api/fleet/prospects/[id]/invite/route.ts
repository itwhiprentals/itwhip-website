// app/api/fleet/prospects/[id]/invite/route.ts
// Send or resend invite email to a host prospect

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'
import { logEmail, generateEmailReference, emailConfig } from '@/app/lib/email/config'

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

    // Generate email reference ID upfront so it can be included in the email
    const emailReferenceId = generateEmailReference('HO')

    // Get first name only
    const firstName = prospect.name.split(' ')[0]

    // Build email subject - friendly handover tone (avoid spam triggers: no emojis, no excessive punctuation)
    const vehicleDesc = prospect.vehicleMake || (prospect as any).vehicleType || 'vehicle'
    const subject = `${firstName}, your ${vehicleDesc} booking is ready`

    // Calculate potential earnings if we have rate and duration
    const hasBookingDetails = prospect.request && prospect.request.offeredRate && prospect.request.durationDays
    const potentialEarnings = hasBookingDetails
      ? Number(prospect.request!.offeredRate) * Number(prospect.request!.durationDays)
      : null

    // Build the earnings highlight if available
    const earningsSection = potentialEarnings ? `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Your Potential Payout</p>
        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #1f2937;">$${potentialEarnings.toFixed(2)}</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #374151;">${prospect.request!.durationDays} days @ $${Number(prospect.request!.offeredRate).toFixed(2)}/day</p>
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
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle Requested</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${prospect.request.vehicleType || prospect.request.vehicleMake || 'Similar to yours'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Rental Dates</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${datesDisplay}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Duration</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${prospect.request.durationDays ? `${prospect.request.durationDays} days` : 'Flexible'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Daily Rate</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${prospect.request.offeredRate ? `$${Number(prospect.request.offeredRate).toFixed(2)}/day` : 'Negotiable'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;">Pickup Location</td>
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">

        <!-- Header -->
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Your Booking Is Ready${prospect.request?.requestCode ? ` • #${prospect.request.requestCode}` : ''}</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">Here's the Booking We Discussed</h1>
        </div>

        <!-- Main content -->
        <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
          Hi ${firstName},
        </p>

        <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
          Great news! As promised, we're passing along a booking for your <strong>${vehicleDesc}</strong>.
        </p>

        <p style="font-size: 16px; color: #111827; margin: 0;">
          A verified guest is ready to book. Click below to view your dashboard and accept.
        </p>

        ${earningsSection}

        ${requestDetails}

        <!-- Status indicator -->
        <p style="font-size: 14px; color: #111827; margin: 20px 0;">
          <strong>This booking is reserved for you.</strong> We're holding it for 48 hours so you have time to review.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
            View Your Dashboard & Accept
          </a>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
          <tr><td style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
        </table>

        <!-- Benefits Section -->
        <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
          What you get with your Partner Dashboard:
        </p>
        <table style="width: 100%; font-size: 13px; color: #1f2937;">
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

        <!-- Closing Message -->
        <div style="margin: 28px 0 24px 0;">
          <p style="font-size: 15px; color: #111827; margin: 0 0 16px 0;">
            We look forward to helping you complete this booking.
          </p>
          <p style="font-size: 14px; color: #1f2937; margin: 0;">
            Best regards,<br/>
            <strong>The ItWhip Team</strong>
          </p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0 12px 0;">
          <tr><td class="email-divider" style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
        </table>

        <!-- Footer Header with Logo - Dark/Light mode support -->
        <div style="text-align: center; margin: 0 0 16px 0;">
          <img class="logo-light" src="https://itwhip.com/logo.png" alt="ItWhip" width="36" style="max-width: 36px; height: auto; display: block; margin: 0 auto 2px auto;" />
          <img class="logo-dark" src="https://itwhip.com/logo-white.png" alt="ItWhip" width="36" style="max-width: 36px; height: auto; display: none; margin: 0 auto 2px auto;" />
          <span class="email-text-muted" style="font-size: 9px; font-weight: 600; color: #374151; letter-spacing: 0.3px;">ITWHIP CAR RENTALS AND RIDESHARES</span>
        </div>

        <p style="color: #374151; font-size: 13px; margin-bottom: 0; text-align: center;">
          Questions? Reply to this email or visit <a href="https://itwhip.com/help" style="color: #ea580c; font-weight: 600;">itwhip.com/help</a>
        </p>

        <!-- About Us -->
        <p style="color: #4b5563; font-size: 10px; margin-top: 16px; text-align: center; line-height: 1.4;">
          ItWhip is a peer-to-peer vehicle rental marketplace connecting vehicle owners with verified renters.
          We help hosts monetize their vehicles while providing guests with unique rental options.
          <a href="https://itwhip.com/host-benefits" style="color: #ea580c;">Host Benefits</a> |
          <a href="https://itwhip.com/list-your-car" style="color: #ea580c;">Calculate Your Earnings</a>
        </p>

        <!-- Communication Footer -->
        <p style="color: #4b5563; font-size: 11px; margin-top: 12px; text-align: center; line-height: 1.5;">
          All hosts are welcome to finalize bookings directly with guests outside the platform.
          We just ask that you communicate clearly with the guest to ensure a smooth experience.
          <a href="https://itwhip.com/corporate" style="color: #ea580c;">Learn more about corporate rentals</a>
        </p>

        <!-- Insurance Disclaimer -->
        <p style="color: #4b5563; font-size: 10px; margin-top: 8px; text-align: center; line-height: 1.4;">
          <strong>Insurance:</strong> Hosts are responsible for maintaining valid insurance coverage on their vehicles.
          ItWhip does not provide primary insurance. Please ensure your policy covers peer-to-peer rentals.
          <a href="https://itwhip.com/support/insurance" style="color: #ea580c;">Insurance Support</a> |
          <a href="https://itwhip.com/insurance-guide" style="color: #ea580c;">Insurance Guide</a> |
          <a href="https://itwhip.com/host/insurance-options" style="color: #ea580c;">Insurance Options</a>
        </p>

        <!-- Social Links with hosted PNG icons -->
        <table cellpadding="0" cellspacing="0" style="margin: 16px auto;">
          <tr>
            <td style="padding: 0 10px;">
              <a href="${emailConfig.social.instagram}" target="_blank" style="text-decoration: none;">
                <img src="${emailConfig.socialIcons.instagram}" alt="Instagram" width="20" height="20" style="display: block; border: 0;" />
              </a>
            </td>
            <td style="padding: 0 10px;">
              <a href="${emailConfig.social.facebook}" target="_blank" style="text-decoration: none;">
                <img src="${emailConfig.socialIcons.facebook}" alt="Facebook" width="20" height="20" style="display: block; border: 0;" />
              </a>
            </td>
            <td style="padding: 0 10px;">
              <a href="${emailConfig.social.twitter}" target="_blank" style="text-decoration: none;">
                <img src="${emailConfig.socialIcons.twitter}" alt="X" width="20" height="20" style="display: block; border: 0;" />
              </a>
            </td>
            <td style="padding: 0 10px;">
              <a href="${emailConfig.social.linkedin}" target="_blank" style="text-decoration: none;">
                <img src="${emailConfig.socialIcons.linkedin}" alt="LinkedIn" width="20" height="20" style="display: block; border: 0;" />
              </a>
            </td>
          </tr>
        </table>

        <p style="color: #4b5563; font-size: 11px; margin-top: 8px; text-align: center;">
          ItWhip Rentals | Phoenix, AZ | <a href="https://itwhip.com" style="color: #ea580c;">itwhip.com</a>
          <br/>
          <a href="https://itwhip.com/about" style="color: #4b5563;">About</a> |
          <a href="https://itwhip.com/terms" style="color: #4b5563;">Terms</a> |
          <a href="https://itwhip.com/privacy" style="color: #4b5563;">Privacy</a>
        </p>

        <!-- Reference ID for verification -->
        <p style="color: #374151; font-size: 11px; margin-top: 16px; text-align: center;">
          <a href="${baseUrl}/verify-email?ref=${emailReferenceId}" style="color: #374151; text-decoration: none;">
            Ref: <strong style="color: #ea580c;">${emailReferenceId}</strong>
          </a>
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

${potentialEarnings ? `YOUR POTENTIAL PAYOUT: $${potentialEarnings.toFixed(2)}` : ''}

${prospect.request ? `BOOKING DETAILS:
- Vehicle Requested: ${prospect.request.vehicleType || prospect.request.vehicleMake || 'Similar to yours'}
- Rental Dates: ${datesDisplay}
- Duration: ${prospect.request.durationDays ? `${prospect.request.durationDays} days` : 'Flexible'}
- Daily Rate: ${prospect.request.offeredRate ? `$${Number(prospect.request.offeredRate).toFixed(2)}/day` : 'Negotiable'}
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

We look forward to helping you complete this booking.

Best regards,
The ItWhip Team

---

Questions? Reply to this email or visit itwhip.com/help

ItWhip is a peer-to-peer vehicle rental marketplace connecting vehicle owners with verified renters. We help hosts monetize their vehicles while providing guests with unique rental options.
Host Benefits: https://itwhip.com/host-benefits | Calculate Your Earnings: https://itwhip.com/list-your-car

All hosts are welcome to finalize bookings directly with guests outside the platform. We just ask that you communicate clearly with the guest to ensure a smooth experience.
Learn more about corporate rentals: https://itwhip.com/corporate

INSURANCE: Hosts are responsible for maintaining valid insurance coverage on their vehicles. ItWhip does not provide primary insurance. Please ensure your policy covers peer-to-peer rentals.
Insurance Support: https://itwhip.com/support/insurance | Insurance Guide: https://itwhip.com/insurance-guide | Insurance Options: https://itwhip.com/host/insurance-options

Follow us: Instagram @itwhipofficial | Facebook | X @itwhipofficial | LinkedIn

ItWhip Rentals | Phoenix, AZ | itwhip.com
About: https://itwhip.com/about | Terms: https://itwhip.com/terms | Privacy: https://itwhip.com/privacy

Ref: ${emailReferenceId} - ${baseUrl}/verify-email?ref=${emailReferenceId}
    `

    // Send the email
    console.log('[Prospect Invite] Sending email to:', prospect.email)
    console.log('[Prospect Invite] Invite link:', inviteLink)

    const emailResult = await sendEmail(
      prospect.email,
      subject,
      html,
      text,
      {
        requestId: `prospect-invite-${id}`
      }
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

    // Log the email for audit trail (using pre-generated reference ID)
    const emailLog = await logEmail({
      recipientEmail: prospect.email,
      recipientName: prospect.name,
      subject,
      emailType: 'HOST_INVITE',
      relatedType: 'host_prospect',
      relatedId: id,
      messageId: emailResult.messageId,
      referenceId: emailReferenceId,
      metadata: {
        vehicleMake: prospect.vehicleMake,
        vehicleType: (prospect as any).vehicleType,
        requestId: prospect.requestId,
        requestCode: prospect.request?.requestCode,
        potentialEarnings: potentialEarnings,
        inviteResendCount: updatedProspect.inviteResendCount,
        tokenExpiry: inviteTokenExp.toISOString()
      }
    })

    console.log('[Prospect Invite] Email logged with reference:', emailLog.referenceId)

    return NextResponse.json({
      success: true,
      emailSent: true,
      messageId: emailResult.messageId,
      referenceId: emailLog.referenceId,
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
