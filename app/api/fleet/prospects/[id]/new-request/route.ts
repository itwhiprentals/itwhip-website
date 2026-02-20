// app/api/fleet/prospects/[id]/new-request/route.ts
// Replace a prospect's linked request with a new one.
// Generates a new invite token (3-day expiry), withdraws old claim,
// creates new claim, sends new invite email. Keeps existing host account.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'
import { logEmail, generateEmailReference, emailConfig } from '@/app/lib/email/config'

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { requestId: newRequestId } = await request.json()

    if (!newRequestId) {
      return NextResponse.json({ error: 'requestId is required' }, { status: 400 })
    }

    // 1. Fetch prospect with current state
    const prospect = await prisma.hostProspect.findUnique({
      where: { id },
      include: {
        request: {
          select: { id: true, requestCode: true, guestName: true, vehicleType: true, vehicleMake: true }
        }
      }
    })

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    // 2. Fetch the new request
    const newRequest = await prisma.reservationRequest.findUnique({
      where: { id: newRequestId },
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
        pickupState: true,
        status: true
      }
    })

    if (!newRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const oldRequestId = prospect.requestId

    // 3. Withdraw old claims for this host on the old request
    if (prospect.convertedHostId && oldRequestId) {
      const withdrawn = await prisma.requestClaim.updateMany({
        where: {
          hostId: prospect.convertedHostId,
          requestId: oldRequestId,
          status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
        },
        data: {
          status: 'WITHDRAWN',
          withdrawnAt: new Date()
        }
      })

      if (withdrawn.count > 0) {
        console.log(`[New Request] Withdrew ${withdrawn.count} old claims for host ${prospect.convertedHostId} on request ${oldRequestId}`)

        // If no other active claims remain on old request, reopen it
        const remainingClaims = await prisma.requestClaim.count({
          where: {
            requestId: oldRequestId,
            status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
          }
        })
        if (remainingClaims === 0) {
          await prisma.reservationRequest.update({
            where: { id: oldRequestId },
            data: { status: 'OPEN' }
          })
        }
      }
    }

    // 4. Generate new invite token
    const inviteToken = nanoid(32)
    const inviteTokenExp = new Date(Date.now() + THREE_DAYS_MS)

    // 5. Update prospect — new request, new token, reset status
    const updatedProspect = await prisma.hostProspect.update({
      where: { id },
      data: {
        requestId: newRequestId,
        inviteToken,
        inviteTokenExp,
        inviteSentAt: new Date(),
        inviteResendCount: { increment: 1 },
        lastResendAt: new Date(),
        status: 'EMAIL_SENT'
        // Keep convertedHostId, convertedAt intact
      },
      include: {
        request: {
          select: {
            id: true, requestCode: true, guestName: true, vehicleType: true,
            vehicleMake: true, startDate: true, endDate: true, durationDays: true,
            offeredRate: true, pickupCity: true, pickupState: true
          }
        },
        convertedHost: { select: { id: true, name: true } }
      }
    })

    // 6. If host account exists, create new claim + reactivate if expired
    if (prospect.convertedHostId) {
      // Reactivate host if previously expired
      const host = await prisma.rentalHost.findUnique({
        where: { id: prospect.convertedHostId },
        select: { active: true, suspendedReason: true }
      })
      if (host && !host.active && host.suspendedReason?.includes('Expired prospect')) {
        await prisma.rentalHost.update({
          where: { id: prospect.convertedHostId },
          data: {
            active: true,
            dashboardAccess: true,
            suspendedAt: null,
            suspendedReason: null
          }
        })
        console.log(`[New Request] Reactivated expired host ${prospect.convertedHostId}`)
      }

      // Create new claim (upsert to handle @@unique([requestId, hostId]))
      try {
        await prisma.requestClaim.upsert({
          where: {
            requestId_hostId: {
              requestId: newRequestId,
              hostId: prospect.convertedHostId
            }
          },
          create: {
            id: nanoid(),
            requestId: newRequestId,
            hostId: prospect.convertedHostId,
            status: 'PENDING_CAR',
            offeredRate: newRequest.offeredRate,
            claimExpiresAt: new Date(Date.now() + THREE_DAYS_MS)
          },
          update: {
            status: 'PENDING_CAR',
            offeredRate: newRequest.offeredRate,
            claimExpiresAt: new Date(Date.now() + THREE_DAYS_MS),
            withdrawnAt: null,
            expiredAt: null
          }
        })
      } catch (claimErr) {
        console.error('[New Request] Claim creation failed:', claimErr)
      }
    }

    // 7. Send invite email (reuse pattern from invite/route.ts)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/onboard/${inviteToken}`
    const emailReferenceId = generateEmailReference('HO')
    const firstName = prospect.name.split(' ')[0]
    const vehicleDesc = newRequest.vehicleMake || newRequest.vehicleType || 'vehicle'
    const subject = `${firstName}, we have a new booking for your ${vehicleDesc}`

    const potentialEarnings = newRequest.offeredRate && newRequest.durationDays
      ? Number(newRequest.offeredRate) * Number(newRequest.durationDays)
      : null

    const earningsSection = potentialEarnings ? `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Your Potential Payout</p>
        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #1f2937;">$${potentialEarnings.toFixed(2)}</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #374151;">${newRequest.durationDays} days @ $${Number(newRequest.offeredRate).toFixed(2)}/day</p>
      </div>
    ` : ''

    const formatDate = (date: Date | null) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
    const startDateStr = newRequest.startDate ? formatDate(newRequest.startDate) : null
    const endDateStr = newRequest.endDate ? formatDate(newRequest.endDate) : null
    const datesDisplay = startDateStr && endDateStr ? `${startDateStr} - ${endDateStr}` : (startDateStr || 'Flexible')

    const requestDetails = `
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle Requested</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${newRequest.vehicleType || newRequest.vehicleMake || 'Similar to yours'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Rental Dates</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${datesDisplay}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Duration</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${newRequest.durationDays ? `${newRequest.durationDays} days` : 'Flexible'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Daily Rate</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${newRequest.offeredRate ? `$${Number(newRequest.offeredRate).toFixed(2)}/day` : 'Negotiable'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;">Pickup Location</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${newRequest.pickupCity || 'Phoenix'}, ${newRequest.pickupState || 'AZ'}</td>
        </tr>
      </table>
    `

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Updated Booking • #${newRequest.requestCode}</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">We Have a New Booking for You</h1>
        </div>
        <p style="font-size: 16px; margin: 0 0 16px 0;">Hi ${firstName},</p>
        <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
          We have an updated booking opportunity for your <strong>${vehicleDesc}</strong>.
          ${oldRequestId && oldRequestId !== newRequestId ? 'This replaces the previous request.' : ''}
        </p>
        <p style="font-size: 16px; color: #111827; margin: 0;">Click below to view your dashboard and get started. You have <strong>3 days</strong> to respond.</p>
        ${earningsSection}
        ${requestDetails}
        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">View Your Dashboard & Accept</a>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;"><tr><td style="height: 1px; background-color: #e5e7eb;">&nbsp;</td></tr></table>
        <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">What you get with your Partner Dashboard:</p>
        <table style="width: 100%; font-size: 13px; color: #1f2937;">
          <tr><td style="padding: 5px 0; width: 50%;">&#10003; Guest Verification via Stripe</td><td style="padding: 5px 0;">&#10003; Counter-Offer on Rates</td></tr>
          <tr><td style="padding: 5px 0;">&#10003; Instant Payouts</td><td style="padding: 5px 0;">&#10003; E-Sign Contracts</td></tr>
          <tr><td style="padding: 5px 0;">&#10003; Full Fleet Management</td><td style="padding: 5px 0;">&#10003; Revenue & Analytics</td></tr>
        </table>
        <div style="margin: 28px 0 24px 0;">
          <p style="font-size: 14px; color: #1f2937; margin: 0;">Best regards,<br/><strong>The ItWhip Team</strong></p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0 12px 0;"><tr><td style="height: 1px; background-color: #e5e7eb;">&nbsp;</td></tr></table>
        <div style="text-align: center; margin: 0 0 16px 0;">
          <img src="https://itwhip.com/logo.png" alt="ItWhip" width="36" style="max-width: 36px; height: auto; display: block; margin: 0 auto 2px auto;" />
          <span style="font-size: 9px; font-weight: 600; color: #374151; letter-spacing: 0.3px;">ITWHIP CAR RENTALS AND RIDESHARES</span>
        </div>
        <p style="color: #374151; font-size: 13px; margin-bottom: 0; text-align: center;">Questions? Reply to this email or visit <a href="https://itwhip.com/help" style="color: #ea580c;">itwhip.com/help</a></p>
        <p style="color: #4b5563; font-size: 11px; margin-top: 8px; text-align: center;">
          ItWhip Rentals | Phoenix, AZ | <a href="https://itwhip.com" style="color: #ea580c;">itwhip.com</a><br/>
          <a href="https://itwhip.com/terms" style="color: #4b5563;">Terms</a> | <a href="https://itwhip.com/privacy" style="color: #4b5563;">Privacy</a>
        </p>
        <p style="color: #374151; font-size: 11px; margin-top: 16px; text-align: center;">
          <a href="${baseUrl}/verify-email?ref=${emailReferenceId}" style="color: #374151; text-decoration: none;">Ref: <strong style="color: #ea580c;">${emailReferenceId}</strong></a>
        </p>
        <img src="${baseUrl}/api/tracking/pixel/${id}" width="1" height="1" style="display:none;" alt="" />
      </body>
      </html>
    `

    const text = `UPDATED BOOKING • #${newRequest.requestCode}

Hi ${firstName},

We have an updated booking opportunity for your ${vehicleDesc}.${oldRequestId && oldRequestId !== newRequestId ? ' This replaces the previous request.' : ''}

You have 3 days to respond.

${potentialEarnings ? `YOUR POTENTIAL PAYOUT: $${potentialEarnings.toFixed(2)}` : ''}

BOOKING DETAILS:
- Vehicle: ${newRequest.vehicleType || newRequest.vehicleMake || 'Similar to yours'}
- Dates: ${datesDisplay}
- Duration: ${newRequest.durationDays ? `${newRequest.durationDays} days` : 'Flexible'}
- Rate: ${newRequest.offeredRate ? `$${Number(newRequest.offeredRate).toFixed(2)}/day` : 'Negotiable'}
- Location: ${newRequest.pickupCity || 'Phoenix'}, ${newRequest.pickupState || 'AZ'}

View Your Dashboard: ${inviteLink}

Best regards,
The ItWhip Team

Ref: ${emailReferenceId} - ${baseUrl}/verify-email?ref=${emailReferenceId}
    `

    let emailSent = false
    try {
      const emailResult = await sendEmail(prospect.email, subject, html, text, {
        requestId: `prospect-new-request-${id}`
      })
      emailSent = emailResult.success

      if (emailResult.success) {
        await logEmail({
          recipientEmail: prospect.email,
          recipientName: prospect.name,
          subject,
          emailType: 'HOST_INVITE',
          relatedType: 'host_prospect',
          relatedId: id,
          messageId: emailResult.messageId,
          referenceId: emailReferenceId,
          metadata: {
            type: 'new_request',
            oldRequestId,
            newRequestId,
            potentialEarnings,
            tokenExpiry: inviteTokenExp.toISOString()
          }
        })
      }
      console.log(`[New Request] Email ${emailSent ? 'sent' : 'failed'} to ${prospect.email}`)
    } catch (emailErr) {
      console.error('[New Request] Email error:', emailErr)
    }

    return NextResponse.json({
      success: true,
      prospect: updatedProspect,
      inviteLink,
      emailSent,
      oldRequestId,
      newRequestId,
      expiresAt: inviteTokenExp
    })

  } catch (error: any) {
    console.error('[New Request] Error:', error)
    return NextResponse.json(
      { error: 'Failed to assign new request' },
      { status: 500 }
    )
  }
}
