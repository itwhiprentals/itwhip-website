// app/api/test-guest-invite-email/route.ts
// Test endpoint to preview/send the guest invite email template

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/app/lib/email/sender'
import { generateEmailReference, emailConfig, logEmail, getEmailDisclaimer } from '@/app/lib/email/config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email') || 'test@example.com'

    // Mock prospect data for testing
    const firstName = 'Test'
    const creditAmount = 25.00
    const creditType = 'bonus'
    const creditTypeDisplay = 'Bonus Credit'
    const creditNote = 'Welcome to ItWhip!'
    const creditExpirationDays = 30
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/guest-invite?token=test-token-12345`

    // Generate email reference ID for testing
    const emailReferenceId = generateEmailReference('GU')

    // Build email subject - personal, not promotional
    const creditDisplay = `$${creditAmount.toFixed(2)}`
    const subject = `${firstName}, your ItWhip account is ready`

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
          Your account includes <strong>${creditDisplay} in ${creditTypeDisplay.toLowerCase()}</strong> toward your first rental with ItWhip.
        </p>

        <p style="font-size: 16px; color: #111827; margin: 0;">
          Click below to activate your account and start browsing cars.
        </p>

        <!-- Credit Display -->
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Your ${creditTypeDisplay}</p>
          <p style="margin: 0; font-size: 36px; font-weight: 700; color: #1f2937;">${creditDisplay}</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #374151;">"${creditNote}"</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #4b5563;">Valid for ${creditExpirationDays} days after claim</p>
        </div>

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

        <!-- Credit Disclaimer -->
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

        <!-- Social Links -->
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

      </body>
      </html>
    `

    const text = `
YOUR ACCOUNT IS READY
Welcome to ItWhip

Hi ${firstName},

Your account includes ${creditDisplay} in ${creditTypeDisplay.toLowerCase()} toward your first rental with ItWhip.

Click below to activate your account and start browsing cars.

YOUR ${creditTypeDisplay.toUpperCase()}: ${creditDisplay}
"${creditNote}"
Valid for ${creditExpirationDays} days after activation

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

    // Send the test email - NO custom headers
    console.log('[Test Guest Invite] Sending to:', email)

    const emailResult = await sendEmail(
      email,
      subject,
      html,
      text,
      {
        requestId: 'test-guest-invite'
      }
    )

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: emailResult.error
      }, { status: 500 })
    }

    // Log the email for audit trail
    const emailLog = await logEmail({
      recipientEmail: email,
      recipientName: firstName,
      subject,
      emailType: 'GUEST_INVITE',
      relatedType: 'test_guest_invite',
      relatedId: 'test-001',
      messageId: emailResult.messageId,
      referenceId: emailReferenceId,
      metadata: {
        creditAmount,
        creditType,
        creditNote
      }
    })

    console.log('[Test Guest Invite] Email logged with reference:', emailLog.referenceId)

    return NextResponse.json({
      success: true,
      message: `Test guest invite email sent to ${email}`,
      messageId: emailResult.messageId,
      referenceId: emailLog.referenceId
    })

  } catch (error: any) {
    console.error('[Test Guest Invite Email] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
