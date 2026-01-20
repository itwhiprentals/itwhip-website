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

    // Check if already converted
    if (prospect.convertedHostId) {
      return NextResponse.json(
        { error: 'This prospect has already converted to a host' },
        { status: 400 }
      )
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

    // Build email subject - action-oriented with urgency
    const vehicleDesc = prospect.vehicleMake || prospect.vehicleType || 'vehicle'
    const subject = `ACTION REQUIRED: Pending Reservation for Your ${vehicleDesc}`

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
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Pending Reservation${prospect.request?.requestCode ? ` #${prospect.request.requestCode}` : ''}</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">Action Required Within 48 Hours</h1>
        </div>

        <!-- Main content -->
        <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
          Hi ${firstName},
        </p>

        <p style="font-size: 16px; margin: 0 0 16px 0; color: #374151;">
          Following up on our conversation about your <strong>${vehicleDesc}</strong>.
        </p>

        <p style="font-size: 16px; color: #374151; margin: 0;">
          A client has accepted your vehicle for their upcoming rental. To accept this booking, your vehicle must be listed on ItWhip.
        </p>

        ${earningsSection}

        ${requestDetails}

        <!-- Status indicator -->
        <p style="font-size: 14px; color: #374151; margin: 20px 0;">
          <strong>This slot is reserved for you.</strong> If we don't hear back within 48 hours, we'll need to offer it to another vehicle owner.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #ea580c; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
            View My Earnings & Accept Booking
          </a>
        </div>

        <p style="text-align: center; color: #6b7280; font-size: 13px; margin: 0;">
          Takes less than 3 minutes. No fees.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <!-- Why list on ItWhip -->
        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.7;">
          Your vehicle must be listed on ItWhip to accept this booking from our client, send contracts via E-Sign, track your revenue, set up future bookings, activate your professional host page, monitor your vehicles, invite other hosts, and more.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <p style="color: #6b7280; font-size: 13px; margin-bottom: 0; text-align: center;">
          Questions? Reply to this email or call <a href="tel:+13053999069" style="color: #ea580c; font-weight: 600;">(305) 399-9069</a>
        </p>

        <p style="color: #9ca3af; font-size: 11px; margin-top: 24px; text-align: center;">
          ItWhip Rentals | Phoenix, AZ | <a href="https://itwhip.com" style="color: #ea580c;">itwhip.com</a>
        </p>
      </body>
      </html>
    `

    const text = `
PENDING RESERVATION${prospect.request?.requestCode ? ` #${prospect.request.requestCode}` : ''} - ACTION REQUIRED

Hi ${firstName},

Following up on our conversation about your ${vehicleDesc}.

A client has accepted your vehicle for their upcoming rental. To accept this booking, your vehicle must be listed on ItWhip.

${potentialEarnings ? `YOUR POTENTIAL PAYOUT: $${potentialEarnings.toLocaleString()}` : ''}

${prospect.request ? `BOOKING DETAILS:
- Vehicle Requested: ${prospect.request.vehicleType || prospect.request.vehicleMake || 'Similar to yours'}
- Rental Dates: ${datesDisplay}
- Duration: ${prospect.request.durationDays ? `${prospect.request.durationDays} days` : 'Flexible'}
- Daily Rate: ${prospect.request.offeredRate ? `$${prospect.request.offeredRate}/day` : 'Negotiable'}
- Pickup Location: ${prospect.request.pickupCity || 'Phoenix'}, ${prospect.request.pickupState || 'AZ'}` : ''}

This slot is reserved for you. If we don't hear back within 48 hours, we'll need to offer it to another vehicle owner.

View My Earnings & Accept Booking:
${inviteLink}

Takes less than 3 minutes. No fees.

Your vehicle must be listed on ItWhip to accept this booking from our client, send contracts via E-Sign, track your revenue, set up future bookings, activate your professional host page, monitor your vehicles, invite other hosts, and more.

Questions? Reply to this email or call (305) 399-9069

- ItWhip Team
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
