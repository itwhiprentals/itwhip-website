// app/lib/notifications/completion-notifications.ts
// Gap 3: Trip completed guest email + bell notification

import { sendEmail } from '@/app/lib/email/sender'
import { generateEmailReference, logEmail, emailConfig, getEmailFooterHtml, getEmailFooterText } from '@/app/lib/email/config'
import { createBookingNotificationPair } from '@/app/lib/notifications/booking-bell'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'

// =============================================================================
// TYPES
// =============================================================================

interface TripCompletedData {
  bookingId: string
  bookingCode: string
  guestEmail: string
  guestName: string
  guestId?: string | null
  userId?: string | null
  hostId: string
  car: {
    year: number
    make: string
    model: string
  }
  totalAmount: number | string
  startDate: string | Date
  endDate: string | Date
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `$${num.toFixed(2)}`
}

function verificationBlockHtml(emailReferenceId: string): string {
  return `
    <!-- Reference ID for verification -->
    <p style="color: #374151; font-size: 11px; margin-top: 16px; text-align: center;">
      <a href="${baseUrl}/verify-email?ref=${emailReferenceId}" style="color: #374151; text-decoration: none;">
        Ref: <strong style="color: #ea580c;">${emailReferenceId}</strong>
      </a>
    </p>
  `
}

function verificationBlockText(emailReferenceId: string): string {
  return `Ref: ${emailReferenceId}\n${baseUrl}/verify-email?ref=${emailReferenceId}`
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
// sendTripCompletedNotifications
// =============================================================================

export async function sendTripCompletedNotifications(data: TripCompletedData): Promise<void> {
  const {
    bookingId,
    bookingCode,
    guestEmail,
    guestName,
    guestId,
    userId,
    hostId,
    car,
    totalAmount,
    startDate,
    endDate
  } = data

  const firstName = guestName.split(' ')[0]
  const carName = `${car.year} ${car.make} ${car.model}`
  const dashboardUrl = `${baseUrl}/rentals/dashboard/bookings/${bookingId}`
  const emailReferenceId = generateEmailReference('TC')

  const subject = `Trip Complete — ${carName}`

  // ─── HTML Email ───────────────────────────────────────────────────

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
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">Trip Complete &bull; #${bookingCode}</p>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #16a34a;">Your Trip is Complete</h1>
      </div>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
        Hi ${firstName},
      </p>

      <p style="font-size: 16px; margin: 0 0 20px 0; color: #111827;">
        Your rental of the <strong>${carName}</strong> is complete. Total charged: <strong>${formatCurrency(totalAmount)}</strong>.
      </p>

      <!-- Trip Summary -->
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${carName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Pickup Date</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(startDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Return Date</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(endDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;">Total Charged</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right;">${formatCurrency(totalAmount)}</td>
        </tr>
      </table>

      <p style="font-size: 16px; margin: 20px 0; color: #111827;">
        We hope you had a great experience! Your feedback helps other renters and our hosts improve their service.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Leave a Review
        </a>
      </div>

      <p style="font-size: 14px; color: #374151; margin: 20px 0;">
        Questions about your trip or charges? Reply to this email or visit our help center.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr><td style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
      </table>

      <!-- Footer -->
      <div style="text-align: center; margin: 0 0 16px 0;">
        <img src="https://itwhip.com/logo.png" alt="ItWhip" width="36" style="max-width: 36px; height: auto; display: block; margin: 0 auto 2px auto;" />
        <span style="font-size: 9px; font-weight: 600; color: #374151; letter-spacing: 0.3px;">ITWHIP CAR RENTALS AND RIDESHARES</span>
      </div>

      <p style="color: #374151; font-size: 13px; margin-bottom: 0; text-align: center;">
        Questions? Reply to this email or visit <a href="https://itwhip.com/help" style="color: #ea580c; font-weight: 600;">itwhip.com/help</a>
      </p>

      ${socialIconsHtml()}

      ${getEmailFooterHtml(emailReferenceId)}

      ${verificationBlockHtml(emailReferenceId)}
    </body>
    </html>
  `

  // ─── Plain Text ───────────────────────────────────────────────────

  const text = `
TRIP COMPLETE • #${bookingCode}

Hi ${firstName},

Your rental of the ${carName} is complete. Total charged: ${formatCurrency(totalAmount)}.

TRIP SUMMARY:
- Vehicle: ${carName}
- Pickup: ${formatDate(startDate)}
- Return: ${formatDate(endDate)}
- Total Charged: ${formatCurrency(totalAmount)}

We hope you had a great experience! Your feedback helps other renters and our hosts improve their service.

Leave a review: ${dashboardUrl}

Questions about your trip or charges? Reply to this email or visit our help center.

${verificationBlockText(emailReferenceId)}

${getEmailFooterText(emailReferenceId)}
  `.trim()

  // ─── Send Email ───────────────────────────────────────────────────

  try {
    const result = await sendEmail(guestEmail, subject, html, text, {
      requestId: `trip-complete-${bookingCode}`
    })

    await logEmail({
      recipientEmail: guestEmail,
      recipientName: guestName,
      subject,
      emailType: 'BOOKING_CONFIRMATION',
      relatedType: 'booking',
      relatedId: bookingCode,
      messageId: result.messageId,
      referenceId: emailReferenceId,
      metadata: {
        bookingCode,
        carName,
        totalAmount: totalAmount.toString(),
        status: 'trip_completed'
      }
    })

    console.log(`[Trip Complete] Email sent to ${guestEmail} for ${bookingCode}`)
  } catch (error) {
    console.error(`[Trip Complete] Failed to send email for ${bookingCode}:`, error)
  }

  // ─── Bell Notifications ───────────────────────────────────────────

  try {
    await createBookingNotificationPair({
      bookingId,
      guestId: guestId || null,
      userId: userId || null,
      hostId,
      type: 'TRIP_ENDED',
      guestTitle: 'Trip complete',
      guestMessage: `Trip complete — leave a review for your ${carName} rental.`,
      hostTitle: 'Trip ended',
      hostMessage: `Trip ended: ${carName} returned.`,
      guestActionUrl: `/rentals/dashboard/bookings/${bookingId}`,
      hostActionUrl: `/partner/bookings/${bookingId}`,
      priority: 'MEDIUM',
    })
  } catch (error) {
    console.error(`[Trip Complete] Failed to create bell notifications for ${bookingCode}:`, error)
  }
}
