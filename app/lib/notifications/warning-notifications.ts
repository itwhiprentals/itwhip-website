// app/lib/notifications/warning-notifications.ts
// Sends email + SMS when a warning is issued to a guest
// Pattern follows reminder-notifications.ts

import { sendSms, canSendToGuest, getGuestLocale } from '@/app/lib/twilio/sms'
import { sendEmail } from '@/app/lib/email/sender'
import { generateEmailReference, logEmail, emailConfig, getEmailFooterHtml, getEmailFooterText } from '@/app/lib/email/config'
import { warningIssuedGuest } from '@/app/lib/twilio/sms-templates'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'

// =============================================================================
// TYPES
// =============================================================================

interface WarningNotificationData {
  guestId: string
  guestName: string
  guestEmail: string
  guestPhone: string | null
  warningCategory: string | null
  reason: string
  warningCount: number
  expiresAt: Date
}

type Locale = 'en' | 'es' | 'fr'

// =============================================================================
// HELPERS
// =============================================================================

function formatCategory(category: string | null): string {
  if (!category) return 'Policy Violation'
  return category
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function socialIconsHtml(): string {
  return `
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
  `
}

// =============================================================================
// MAIN
// =============================================================================

export async function sendWarningNotifications(data: WarningNotificationData): Promise<void> {
  const category = formatCategory(data.warningCategory)
  const firstName = data.guestName.split(' ')[0]
  const dashboardUrl = `${baseUrl}/rentals/dashboard`
  const expiresStr = formatDate(data.expiresAt)

  // ── SMS ──────────────────────────────────────────────────────────
  try {
    if (data.guestPhone) {
      const canSend = await canSendToGuest(data.guestId)
      if (canSend) {
        const locale = await getGuestLocale(data.guestId)
        const body = warningIssuedGuest({ category }, locale)
        await sendSms(data.guestPhone, body, {
          type: 'SYSTEM',
          guestId: data.guestId,
          locale,
        })
        console.log(`[Warning] SMS sent to ${data.guestPhone} for guest ${data.guestId}`)
      } else {
        console.log(`[Warning] SMS blocked by preference: guest ${data.guestId}`)
      }
    } else {
      console.log(`[Warning] No phone number for guest ${data.guestId}`)
    }
  } catch (error) {
    console.error(`[Warning] SMS failed for guest ${data.guestId}:`, error)
  }

  // ── Email ────────────────────────────────────────────────────────
  try {
    if (!data.guestEmail) {
      console.log(`[Warning] No email for guest ${data.guestId}`)
      return
    }

    const emailReferenceId = generateEmailReference('WN')
    const subject = `Account Warning — ${category}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #d97706; text-transform: uppercase; letter-spacing: 0.5px;">Account Warning</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #d97706;">Your Account Has Received a Warning</h1>
        </div>

        <p style="font-size: 16px; margin: 0 0 16px 0;">Hi ${firstName},</p>
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Your account has received a warning. Please review the details below:
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Category</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Reason</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${data.reason}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Warning #</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${data.warningCount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151;">Expires</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${expiresStr}</td>
          </tr>
        </table>

        <div style="border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0; background-color: #fffbeb;">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #92400e;">What you can do:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
            <li>Review the warning details in your dashboard</li>
            <li>Read our Community Guidelines</li>
            <li>Appeal this warning if you believe it was issued in error</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #d97706; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
            View Account Details
          </a>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
          <tr><td style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
        </table>

        <div style="text-align: center; margin: 0 0 16px 0;">
          <img src="https://itwhip.com/logo.png" alt="ItWhip" width="36" style="max-width: 36px; height: auto; display: block; margin: 0 auto 2px auto;" />
          <span style="font-size: 9px; font-weight: 600; color: #374151; letter-spacing: 0.3px;">ITWHIP CAR RENTALS AND RIDESHARES</span>
        </div>

        <p style="color: #374151; font-size: 13px; margin-bottom: 0; text-align: center;">
          Questions? Reply to this email or visit <a href="https://itwhip.com/help" style="color: #ea580c; font-weight: 600;">itwhip.com/help</a>
        </p>

        ${socialIconsHtml()}
        ${getEmailFooterHtml(emailReferenceId)}
      </body>
      </html>
    `

    const text = `
ACCOUNT WARNING

Hi ${firstName},

Your account has received a warning.

DETAILS:
- Category: ${category}
- Reason: ${data.reason}
- Warning #: ${data.warningCount}
- Expires: ${expiresStr}

WHAT YOU CAN DO:
- Review the warning details in your dashboard
- Read our Community Guidelines
- Appeal this warning if you believe it was issued in error

View your account: ${dashboardUrl}

${getEmailFooterText(emailReferenceId)}
    `.trim()

    const result = await sendEmail(data.guestEmail, subject, html, text, {
      requestId: `warning-${data.guestId}`,
    })

    await logEmail({
      recipientEmail: data.guestEmail,
      recipientName: data.guestName,
      subject,
      emailType: 'SYSTEM',
      relatedType: 'moderation',
      relatedId: data.guestId,
      messageId: result.messageId,
      referenceId: emailReferenceId,
      metadata: { category, warningCount: data.warningCount },
    })

    console.log(`[Warning] Email sent to ${data.guestEmail} for guest ${data.guestId}`)
  } catch (error) {
    console.error(`[Warning] Email failed for guest ${data.guestId}:`, error)
  }
}
