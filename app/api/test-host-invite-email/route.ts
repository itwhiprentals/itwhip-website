// app/api/test-host-invite-email/route.ts
// Test endpoint to preview/send the host invite email template

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/app/lib/email/sender'
import { generateEmailReference, emailConfig } from '@/app/lib/email/config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email') || 'test@example.com'

    // Mock prospect data for testing
    const firstName = 'Test'
    const vehicleDesc = '2024 Toyota Camry'
    const potentialEarnings = 1250
    const durationDays = 5
    const offeredRate = 250
    const requestCode = 'TEST-001'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/onboard/test-token-12345`

    // Generate email reference ID for testing
    const emailReferenceId = generateEmailReference('HO')

    const subject = `Your ${vehicleDesc} Booking is Ready 🚗`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <style>
          /* Dark mode styles */
          @media (prefers-color-scheme: dark) {
            .email-body { background-color: #1a1a1a !important; }
            .email-card { background-color: #262626 !important; border-color: #404040 !important; }
            .email-text { color: #e5e5e5 !important; }
            .email-text-muted { color: #a3a3a3 !important; }
            .email-text-heading { color: #ea580c !important; }
            .email-divider { border-color: #404040 !important; background-color: #404040 !important; }
            .logo-light { display: none !important; }
            .logo-dark { display: block !important; }
          }
          /* Outlook dark mode */
          [data-ogsc] .email-body { background-color: #1a1a1a !important; }
          [data-ogsc] .email-card { background-color: #262626 !important; border-color: #404040 !important; }
          [data-ogsc] .email-text { color: #e5e5e5 !important; }
          [data-ogsc] .logo-light { display: none !important; }
          [data-ogsc] .logo-dark { display: block !important; }
        </style>
      </head>
      <body class="email-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">

        <!-- Header -->
        <div class="email-divider" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
          <p class="email-text-heading" style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Your Booking Is Ready • #${requestCode}</p>
          <h1 class="email-text-heading" style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">Here's the Booking We Discussed</h1>
        </div>

        <!-- Main content -->
        <p class="email-text" style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
          Hi ${firstName},
        </p>

        <p class="email-text" style="font-size: 16px; margin: 0 0 16px 0; color: #374151;">
          Great news! As promised, we're passing along a booking for your <strong>${vehicleDesc}</strong>.
        </p>

        <p class="email-text" style="font-size: 16px; color: #374151; margin: 0;">
          A verified guest is ready to book. Click below to view your dashboard and accept.
        </p>

        <!-- Earnings Section -->
        <div class="email-card" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; background-color: #ffffff;">
          <p class="email-text-muted" style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Your Potential Payout</p>
          <p class="email-text" style="margin: 0; font-size: 36px; font-weight: 700; color: #1f2937;">$${potentialEarnings.toFixed(2)}</p>
          <p class="email-text-muted" style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">${durationDays} days @ $${offeredRate.toFixed(2)}/day</p>
        </div>

        <!-- Booking Details -->
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Vehicle Requested</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${vehicleDesc}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Rental Dates</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">Jan 25 - Jan 30, 2026</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Duration</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${durationDays} days</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Daily Rate</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">$${offeredRate.toFixed(2)}/day</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Pickup Location</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">Phoenix, AZ</td>
          </tr>
        </table>

        <!-- Status indicator -->
        <p class="email-text" style="font-size: 14px; color: #374151; margin: 20px 0;">
          <strong>This booking is reserved for you.</strong> We're holding it for 48 hours so you have time to review.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #ea580c; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
            View Your Dashboard & Accept
          </a>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
          <tr><td class="email-divider" style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
        </table>

        <!-- Benefits Section -->
        <p class="email-text" style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
          What you get with your Partner Dashboard:
        </p>
        <table style="width: 100%; font-size: 13px; color: #4b5563;" class="email-text-muted">
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
          <p class="email-text" style="font-size: 15px; color: #374151; margin: 0 0 16px 0;">
            We look forward to helping you complete this booking.
          </p>
          <p class="email-text" style="font-size: 14px; color: #1f2937; margin: 0;">
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
          <span class="email-text-muted" style="font-size: 9px; font-weight: 600; color: #6b7280; letter-spacing: 0.3px;">ITWHIP CAR RENTALS AND RIDESHARES</span>
        </div>

        <p style="color: #6b7280; font-size: 13px; margin-bottom: 0; text-align: center;">
          Questions? Reply to this email or visit <a href="https://itwhip.com/help" style="color: #ea580c; font-weight: 600;">itwhip.com/help</a>
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

        <!-- Social Links - Hosted PNG icons for better email client compatibility -->
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

        <p style="color: #9ca3af; font-size: 11px; margin-top: 8px; text-align: center;">
          ItWhip Rentals | Phoenix, AZ | <a href="https://itwhip.com" style="color: #ea580c;">itwhip.com</a>
          <br/>
          <a href="https://itwhip.com/about" style="color: #9ca3af;">About</a> |
          <a href="https://itwhip.com/terms" style="color: #9ca3af;">Terms</a> |
          <a href="https://itwhip.com/privacy" style="color: #9ca3af;">Privacy</a>
        </p>

        <!-- Reference ID for verification -->
        <p style="color: #6b7280; font-size: 11px; margin-top: 16px; text-align: center;">
          <a href="${baseUrl}/verify-email?ref=${emailReferenceId}" style="color: #6b7280; text-decoration: none;">
            Verify this email: <strong style="color: #ea580c;">${emailReferenceId}</strong>
          </a>
        </p>

      </body>
      </html>
    `

    const text = `
YOUR BOOKING IS READY • #${requestCode}

Hi ${firstName},

Great news! As promised, we're passing along a booking for your ${vehicleDesc}.

A verified guest is ready to book. Click below to view your dashboard and accept.

YOUR POTENTIAL PAYOUT: $${potentialEarnings.toFixed(2)}
${durationDays} days @ $${offeredRate.toFixed(2)}/day

BOOKING DETAILS:
- Vehicle Requested: ${vehicleDesc}
- Rental Dates: Jan 25 - Jan 30, 2026
- Duration: ${durationDays} days
- Daily Rate: $${offeredRate.toFixed(2)}/day
- Pickup Location: Phoenix, AZ

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

ItWhip Rentals | Phoenix, AZ | itwhip.com

Verify this email: ${baseUrl}/verify-email?ref=${emailReferenceId}
    `

    // Send the test email
    console.log('[Test Host Invite] Sending to:', email)

    const emailResult = await sendEmail(
      email,
      subject,
      html,
      text,
      { requestId: 'test-host-invite' }
    )

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: emailResult.error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Test host invite email sent to ${email}`,
      messageId: emailResult.messageId
    })

  } catch (error: any) {
    console.error('[Test Host Invite Email] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
