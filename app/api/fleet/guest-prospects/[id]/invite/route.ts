// app/api/fleet/guest-prospects/[id]/invite/route.ts
// Send or resend invite email to a guest prospect with credit incentive

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'
import { logEmail, emailConfig, getEmailDisclaimer, generateEmailReference } from '@/app/lib/email/config'

// POST /api/fleet/guest-prospects/[id]/invite - Send invite email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prospect = await prisma.guestProspect.findUnique({
      where: { id }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Guest prospect not found' },
        { status: 404 }
      )
    }

    // Check if already converted
    if (prospect.convertedProfileId) {
      return NextResponse.json(
        { error: 'This prospect has already created an account' },
        { status: 400 }
      )
    }

    // Generate new invite token (72 hours for guests)
    const inviteToken = nanoid(32)
    const inviteTokenExp = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours

    // Update prospect with new token
    const updatedProspect = await prisma.guestProspect.update({
      where: { id },
      data: {
        inviteToken,
        inviteTokenExp,
        inviteSentAt: new Date(),
        inviteResendCount: { increment: 1 },
        lastResendAt: new Date(),
        status: 'INVITED'
      }
    })

    // Log activity
    await prisma.guestProspectActivity.create({
      data: {
        prospectId: id,
        activityType: 'EMAIL_SENT',
        metadata: {
          resendCount: updatedProspect.inviteResendCount,
          tokenExpiry: inviteTokenExp.toISOString()
        }
      }
    })

    // Build the invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/guest-invite?token=${inviteToken}`

    // Generate email reference ID upfront so it can be included in the email
    const emailReferenceId = generateEmailReference('GU')

    // Get first name only
    const firstName = prospect.name.split(' ')[0]

    // Build email subject - personal, not promotional (avoid "credit", "waiting", dollar amounts)
    const creditDisplay = prospect.creditAmount > 0 ? `$${prospect.creditAmount.toFixed(2)}` : ''
    const subject = `${firstName}, your ItWhip account is ready`

    // Format credit type for display
    const creditTypeDisplay = prospect.creditType === 'bonus'
      ? 'Bonus Credit'
      : prospect.creditType === 'deposit'
        ? 'Deposit Credit'
        : 'Rental Credit'

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
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Your Account Is Ready</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">Welcome to ItWhip</h1>
        </div>

        <!-- Main content -->
        <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
          Hi ${firstName},
        </p>

        <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
          ${prospect.creditAmount > 0
            ? `Your account includes <strong>$${prospect.creditAmount.toFixed(2)} in ${creditTypeDisplay.toLowerCase()}</strong> toward your first rental with ItWhip.`
            : 'You\'ve been invited to rent a car through ItWhip. Your account is ready to browse our selection of vehicles from trusted local hosts.'}
        </p>

        <p style="font-size: 16px; color: #111827; margin: 0;">
          Click below to activate your account and start browsing cars.
        </p>

        ${prospect.creditAmount > 0 ? `
        <!-- Credit Display -->
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Your ${creditTypeDisplay}</p>
          <p style="margin: 0; font-size: 36px; font-weight: 700; color: #1f2937;">$${prospect.creditAmount.toFixed(2)}</p>
          ${prospect.creditNote ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #374151;">"${prospect.creditNote}"</p>` : ''}
          ${prospect.creditExpirationDays ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #4b5563;">Valid for ${prospect.creditExpirationDays} days after claim</p>` : ''}
        </div>
        ` : ''}

        <!-- Status indicator -->
        <p style="font-size: 14px; color: #111827; margin: 20px 0;">
          <strong>Your account is reserved.</strong> This link is valid for 72 hours.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Activate Your Account
          </a>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
          <tr><td style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
        </table>

        <!-- Benefits Section -->
        <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
          What you get with ItWhip:
        </p>
        <table style="width: 100%; font-size: 13px; color: #1f2937;">
          <tr>
            <td style="padding: 5px 0; width: 50%;">✓ Verified Hosts & Vehicles</td>
            <td style="padding: 5px 0; width: 50%;">✓ Flexible Pickup Locations</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Digital Rental Agreements</td>
            <td style="padding: 5px 0;">✓ 24/7 Support</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Competitive Daily Rates</td>
            <td style="padding: 5px 0;">✓ No Hidden Fees</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Unique Vehicle Selection</td>
            <td style="padding: 5px 0;">✓ Easy Booking Process</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Secure Payments via Stripe</td>
            <td style="padding: 5px 0;">✓ ID Verification for Safety</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Direct Host Communication</td>
            <td style="padding: 5px 0;">✓ Rental History & Receipts</td>
          </tr>
        </table>

        <!-- Closing Message -->
        <div style="margin: 28px 0 24px 0;">
          <p style="font-size: 15px; color: #111827; margin: 0 0 16px 0;">
            We're excited to have you join the ItWhip community. Happy travels!
          </p>
          <p style="font-size: 14px; color: #1f2937; margin: 0;">
            Best regards,<br/>
            <strong>The ItWhip Team</strong>
          </p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0 12px 0;">
          <tr><td style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
        </table>

        <!-- Footer Header with Logo -->
        <div style="text-align: center; margin: 0 0 16px 0;">
          <img src="https://itwhip.com/logo.png" alt="ItWhip" width="36" style="max-width: 36px; height: auto; display: block; margin: 0 auto 2px auto;" />
          <span style="font-size: 9px; font-weight: 600; color: #374151; letter-spacing: 0.3px;">ITWHIP CAR RENTALS AND RIDESHARES</span>
        </div>

        <p style="color: #374151; font-size: 13px; margin-bottom: 0; text-align: center;">
          Questions? Reply to this email or visit <a href="${emailConfig.helpUrl}" style="color: #ea580c; font-weight: 600;">itwhip.com/help</a>
        </p>

        <!-- About Us -->
        <p style="color: #4b5563; font-size: 10px; margin-top: 16px; text-align: center; line-height: 1.4;">
          ItWhip is a peer-to-peer vehicle rental marketplace connecting verified renters with trusted vehicle owners.
          Find unique cars from local hosts at competitive rates.
          <a href="${emailConfig.howItWorksUrl}" style="color: #ea580c;">How It Works</a> |
          <a href="${emailConfig.browseCarsUrl}" style="color: #ea580c;">Browse Cars</a>
        </p>

        <!-- Credit Disclaimer - above social links -->
        <p style="color: #4b5563; font-size: 9px; margin-top: 16px; text-align: center; line-height: 1.4;">
          ${getEmailDisclaimer()}
        </p>

        <p style="color: #4b5563; font-size: 11px; margin-top: 12px; text-align: center;">
          ${emailConfig.companyName} | ${emailConfig.companyAddress} | <a href="${emailConfig.websiteUrl}" style="color: #ea580c;">itwhip.com</a>
          <br/>
          <a href="${emailConfig.aboutUrl}" style="color: #4b5563;">About</a> |
          <a href="${emailConfig.termsUrl}" style="color: #4b5563;">Terms</a> |
          <a href="${emailConfig.privacyUrl}" style="color: #4b5563;">Privacy</a>
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

        <!-- Reference ID for verification -->
        <p style="color: #374151; font-size: 11px; margin-top: 16px; text-align: center;">
          <a href="${baseUrl}/verify-email?ref=${emailReferenceId}" style="color: #374151; text-decoration: none;">
            Verify this email: <strong style="color: #ea580c;">${emailReferenceId}</strong>
          </a>
        </p>

        <!-- Tracking pixel for email open tracking -->
        <img src="${baseUrl}/api/tracking/guest-pixel/${id}" width="1" height="1" style="display:none;width:1px;height:1px;border:0;" alt="" />
      </body>
      </html>
    `

    const text = `
YOUR ACCOUNT IS READY
Welcome to ItWhip

Hi ${firstName},

${prospect.creditAmount > 0
  ? `Your account includes $${prospect.creditAmount.toFixed(2)} in ${creditTypeDisplay.toLowerCase()} toward your first rental with ItWhip.`
  : 'You\'ve been invited to rent a car through ItWhip. Your account is ready to browse our selection of vehicles from trusted local hosts.'}

Click below to activate your account and start browsing cars.

${prospect.creditAmount > 0 ? `YOUR ${creditTypeDisplay.toUpperCase()}: $${prospect.creditAmount.toFixed(2)}
${prospect.creditNote ? `"${prospect.creditNote}"` : ''}
${prospect.creditExpirationDays ? `Valid for ${prospect.creditExpirationDays} days after activation` : ''}` : ''}

Your account is reserved. This link is valid for 72 hours.

Activate Your Account:
${inviteLink}

WHAT YOU GET WITH ITWHIP:
✓ Verified Hosts & Vehicles    ✓ Flexible Pickup Locations
✓ Digital Rental Agreements    ✓ 24/7 Support
✓ Competitive Daily Rates      ✓ No Hidden Fees
✓ Unique Vehicle Selection     ✓ Easy Booking Process
✓ Secure Payments via Stripe   ✓ ID Verification for Safety
✓ Direct Host Communication    ✓ Rental History & Receipts

We're excited to have you join the ItWhip community. Happy travels!

Best regards,
The ItWhip Team

---

Questions? Reply to this email or visit itwhip.com/help

ItWhip is a peer-to-peer vehicle rental marketplace connecting verified renters with trusted vehicle owners. Find unique cars from local hosts at competitive rates.
How It Works: ${emailConfig.howItWorksUrl} | Browse Cars: ${emailConfig.browseCarsUrl}

Credits are distributed after account verification via Stripe Identity (${emailConfig.stripeIdentityUrl}). Terms and conditions are subject to change at any time.

${emailConfig.companyName} | ${emailConfig.companyAddress} | itwhip.com
About: ${emailConfig.aboutUrl} | Terms: ${emailConfig.termsUrl} | Privacy: ${emailConfig.privacyUrl}

Follow us: Instagram @itwhipofficial | Facebook | X @itwhipofficial | LinkedIn

Verify this email: ${baseUrl}/verify-email?ref=${emailReferenceId}
    `

    // Send the email
    console.log('[Guest Prospect Invite] Sending email to:', prospect.email)
    console.log('[Guest Prospect Invite] Invite link:', inviteLink)

    const emailResult = await sendEmail(
      prospect.email,
      subject,
      html,
      text,
      {
        requestId: `guest-prospect-invite-${id}`
      }
    )

    if (!emailResult.success) {
      console.error('[Guest Prospect Invite] Email failed:', emailResult.error)
      return NextResponse.json({
        success: true,
        emailSent: false,
        emailError: emailResult.error,
        prospect: updatedProspect,
        inviteLink,
        expiresAt: inviteTokenExp
      })
    }

    console.log('[Guest Prospect Invite] Email sent successfully:', emailResult.messageId)

    // Log the email for audit trail (using pre-generated reference ID)
    const emailLog = await logEmail({
      recipientEmail: prospect.email,
      recipientName: prospect.name,
      subject,
      emailType: 'GUEST_INVITE',
      relatedType: 'guest_prospect',
      relatedId: id,
      messageId: emailResult.messageId,
      referenceId: emailReferenceId,
      metadata: {
        creditAmount: prospect.creditAmount,
        creditType: prospect.creditType,
        inviteResendCount: updatedProspect.inviteResendCount,
        tokenExpiry: inviteTokenExp.toISOString()
      }
    })

    console.log('[Guest Prospect Invite] Email logged with reference:', emailLog.referenceId)

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
    console.error('[Fleet Guest Prospect Invite] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    )
  }
}
