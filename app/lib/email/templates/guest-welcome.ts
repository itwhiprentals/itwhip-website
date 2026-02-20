// app/lib/email/templates/guest-welcome.ts
// Simple welcome email for converted guest prospects with link to set password

import { EmailTemplate } from '../types'
import { emailConfig, getEmailDisclaimer } from '../config'

export interface GuestWelcomeData {
  guestName: string
  guestEmail: string
  creditAmount?: number
  creditType?: 'credit' | 'bonus' | 'deposit'
  setPasswordUrl: string // Token-based link to /auth/set-password?token=xxx
  dashboardUrl: string
  supportEmail?: string
  referenceId?: string // Email reference ID for verification
}

export function getGuestWelcomeTemplate(data: GuestWelcomeData): EmailTemplate {
  const subject = `${data.guestName.split(' ')[0]}, secure your ItWhip account`

  const firstName = data.guestName.split(' ')[0]
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itwhip.com'

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
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Account Created</p>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">Secure Your Account</h1>
      </div>

      <!-- Main content -->
      <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
        Hi ${firstName},
      </p>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
        Thanks for creating your ItWhip account! To keep it secure and enable sign-in from any device, please set up a password.
      </p>

      <!-- Status indicator -->
      <p style="font-size: 14px; color: #111827; margin: 20px 0;">
        <strong>Your account is ready.</strong> This link is valid for 7 days.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${data.setPasswordUrl}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Set Up Password
        </a>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr><td style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
      </table>

      <!-- Benefits Section -->
      <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
        With your ItWhip account you can:
      </p>
      <table style="width: 100%; font-size: 13px; color: #1f2937;">
        <tr>
          <td style="padding: 5px 0; width: 50%;">✓ Sign in from any device</td>
          <td style="padding: 5px 0; width: 50%;">✓ View booking history</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">✓ Save payment methods</td>
          <td style="padding: 5px 0;">✓ Track your credits</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">✓ Manage your profile</td>
          <td style="padding: 5px 0;">✓ 24/7 Support access</td>
        </tr>
      </table>

      <!-- Closing Message -->
      <div style="margin: 28px 0 24px 0;">
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

      ${data.referenceId ? `
      <!-- Reference ID for verification -->
      <p style="color: #374151; font-size: 11px; margin-top: 16px; text-align: center;">
        <a href="${baseUrl}/verify-email?ref=${data.referenceId}" style="color: #374151; text-decoration: none;">
          Ref: <strong style="color: #ea580c;">${data.referenceId}</strong>
        </a>
      </p>
      ` : ''}

    </body>
    </html>
  `

  const text = `
ACCOUNT CREATED
Secure Your Account

Hi ${firstName},

Thanks for creating your ItWhip account! To keep it secure and enable sign-in from any device, please set up a password.

Your account is ready. This link is valid for 7 days.

Set Up Password:
${data.setPasswordUrl}

WITH YOUR ITWHIP ACCOUNT YOU CAN:
✓ Sign in from any device      ✓ View booking history
✓ Save payment methods         ✓ Track your credits
✓ Manage your profile          ✓ 24/7 Support access

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
${data.referenceId ? `
Ref: ${data.referenceId} - ${baseUrl}/verify-email?ref=${data.referenceId}` : ''}
  `

  return { subject, html, text }
}
