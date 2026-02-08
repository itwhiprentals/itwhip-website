// app/lib/email/booking-emails.ts
// Booking confirmation, pending review, and fraud alert emails

import { sendEmail } from './sender'
import { generateEmailReference, logEmail, emailConfig, getEmailFooterHtml, getEmailFooterText } from './config'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'

// =============================================================================
// TYPES
// =============================================================================

interface BookingConfirmationParams {
  guestEmail: string
  guestName: string
  bookingCode: string
  startDate: string | Date
  endDate: string | Date
  startTime?: string
  endTime?: string
  pickupLocation: string
  pickupType?: string
  totalAmount: number | string
  depositAmount?: number | string
  subtotal?: number | string
  serviceFee?: number | string
  taxes?: number | string
  insuranceFee?: number | string
  deliveryFee?: number | string
  car: {
    make: string
    model: string
    year: number
    photos?: { url: string }[]
  }
  accessToken: string
  [key: string]: any
}

interface PendingReviewParams {
  guestEmail: string
  guestName: string
  bookingCode: string
  carMake: string
  carModel: string
  carImage: string
  startDate: string
  endDate: string
  pickupLocation: string
  totalAmount: string
  documentsSubmittedAt: string
  estimatedReviewTime: string
  trackingUrl: string
  accessToken: string
}

interface FraudAlertParams {
  bookingCode: string
  guestEmail: string
  guestName: string
  riskScore: number
  riskFlags: string[]
  carId: string
  carName: string
  totalAmount: number | string
  ipAddress: string
  [key: string]: any
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
        Verify this email: <strong style="color: #ea580c;">${emailReferenceId}</strong>
      </a>
    </p>
  `
}

function verificationBlockText(emailReferenceId: string): string {
  return `Verify this email: ${emailReferenceId}\n${baseUrl}/verify-email?ref=${emailReferenceId}`
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
// sendBookingConfirmation
// =============================================================================

export async function sendBookingConfirmation(params: BookingConfirmationParams): Promise<void> {
  const {
    guestEmail,
    guestName,
    bookingCode,
    startDate,
    endDate,
    pickupLocation,
    totalAmount,
    depositAmount,
    subtotal,
    serviceFee,
    taxes,
    insuranceFee,
    deliveryFee,
    car,
    accessToken
  } = params

  const firstName = guestName.split(' ')[0]
  const carName = `${car.year} ${car.make} ${car.model}`
  const carImage = car.photos?.[0]?.url || ''
  const dashboardUrl = `${baseUrl}/rentals/dashboard/guest/${accessToken}`
  const emailReferenceId = generateEmailReference('BC')

  const subject = `Booking Confirmed — ${carName}`

  // Build pricing breakdown rows
  const pricingRows: string[] = []
  if (subtotal) pricingRows.push(`<tr><td style="padding: 6px 0; color: #374151;">Rental</td><td style="padding: 6px 0; color: #1f2937; font-weight: 600; text-align: right;">${formatCurrency(subtotal)}</td></tr>`)
  if (serviceFee) pricingRows.push(`<tr><td style="padding: 6px 0; color: #374151;">Service Fee</td><td style="padding: 6px 0; color: #1f2937; text-align: right;">${formatCurrency(serviceFee)}</td></tr>`)
  if (insuranceFee) pricingRows.push(`<tr><td style="padding: 6px 0; color: #374151;">Insurance</td><td style="padding: 6px 0; color: #1f2937; text-align: right;">${formatCurrency(insuranceFee)}</td></tr>`)
  if (deliveryFee && Number(deliveryFee) > 0) pricingRows.push(`<tr><td style="padding: 6px 0; color: #374151;">Delivery</td><td style="padding: 6px 0; color: #1f2937; text-align: right;">${formatCurrency(deliveryFee)}</td></tr>`)
  if (taxes) pricingRows.push(`<tr><td style="padding: 6px 0; color: #374151;">Tax</td><td style="padding: 6px 0; color: #1f2937; text-align: right;">${formatCurrency(taxes)}</td></tr>`)
  if (depositAmount && Number(depositAmount) > 0) pricingRows.push(`<tr><td style="padding: 6px 0; color: #374151; border-top: 1px solid #e5e7eb;">Security Deposit (refundable)</td><td style="padding: 6px 0; color: #1f2937; text-align: right; border-top: 1px solid #e5e7eb;">${formatCurrency(depositAmount)}</td></tr>`)

  const pricingTable = pricingRows.length > 0 ? `
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
      ${pricingRows.join('\n')}
      <tr>
        <td style="padding: 10px 0; color: #1f2937; font-weight: 700; font-size: 16px; border-top: 2px solid #1f2937;">Total Charged</td>
        <td style="padding: 10px 0; color: #1f2937; font-weight: 700; font-size: 16px; text-align: right; border-top: 2px solid #1f2937;">${formatCurrency(totalAmount)}</td>
      </tr>
    </table>
  ` : `<p style="font-size: 16px; font-weight: 700; color: #1f2937;">Total: ${formatCurrency(totalAmount)}</p>`

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
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Booking Confirmed • #${bookingCode}</p>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">Your Booking is Confirmed</h1>
      </div>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
        Hi ${firstName},
      </p>

      <p style="font-size: 16px; margin: 0 0 20px 0; color: #111827;">
        Your rental for the <strong>${carName}</strong> has been confirmed. Here are your booking details:
      </p>

      ${carImage ? `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${carImage}" alt="${carName}" style="max-width: 100%; border-radius: 8px; max-height: 250px; object-fit: cover;" />
      </div>
      ` : ''}

      <!-- Booking Details -->
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
          <td style="padding: 8px 0; color: #374151;">Pickup Location</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${pickupLocation}</td>
        </tr>
      </table>

      ${pricingTable}

      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
          View Your Booking
        </a>
      </div>

      <p style="font-size: 14px; color: #374151; margin: 20px 0;">
        Need to modify or cancel? Visit your booking dashboard or reply to this email.
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

  const text = `
BOOKING CONFIRMED • #${bookingCode}

Hi ${firstName},

Your rental for the ${carName} has been confirmed.

BOOKING DETAILS:
- Vehicle: ${carName}
- Pickup: ${formatDate(startDate)}
- Return: ${formatDate(endDate)}
- Location: ${pickupLocation}
- Total: ${formatCurrency(totalAmount)}

View your booking: ${dashboardUrl}

Need to modify or cancel? Visit your booking dashboard or reply to this email.

${verificationBlockText(emailReferenceId)}

${getEmailFooterText(emailReferenceId)}
  `.trim()

  try {
    const result = await sendEmail(guestEmail, subject, html, text, {
      requestId: `booking-confirm-${bookingCode}`
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
        status: 'confirmed'
      }
    })

    console.log(`[Booking Email] Confirmation sent to ${guestEmail} for ${bookingCode}`)
  } catch (error) {
    console.error(`[Booking Email] Failed to send confirmation for ${bookingCode}:`, error)
  }
}

// =============================================================================
// sendPendingReviewEmail
// =============================================================================

export async function sendPendingReviewEmail(params: PendingReviewParams): Promise<void> {
  const {
    guestEmail,
    guestName,
    bookingCode,
    carMake,
    carModel,
    carImage,
    startDate,
    endDate,
    pickupLocation,
    totalAmount,
    estimatedReviewTime,
    trackingUrl
  } = params

  const firstName = guestName.split(' ')[0]
  const carName = `${carMake} ${carModel}`
  const emailReferenceId = generateEmailReference('BR')

  const subject = `Booking Received — Under Review`

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
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #d97706; text-transform: uppercase; letter-spacing: 0.5px;">Booking Received • #${bookingCode}</p>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #d97706;">Your Booking is Being Reviewed</h1>
      </div>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
        Hi ${firstName},
      </p>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
        We've received your booking request for the <strong>${carName}</strong>. Our team is reviewing it now.
      </p>

      ${carImage ? `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${carImage}" alt="${carName}" style="max-width: 100%; border-radius: 8px; max-height: 200px; object-fit: cover;" />
      </div>
      ` : ''}

      <!-- Status Box -->
      <div style="border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #fffbeb;">
        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #92400e;">Estimated Review Time</p>
        <p style="margin: 0; font-size: 20px; font-weight: 700; color: #92400e;">${estimatedReviewTime}</p>
      </div>

      <!-- Booking Details -->
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${carName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Pickup</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(startDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Return</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(endDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Location</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${pickupLocation}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;">Total</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right;">${formatCurrency(totalAmount)}</td>
        </tr>
      </table>

      <!-- What to expect -->
      <p style="font-size: 14px; color: #374151; margin: 20px 0 8px 0; font-weight: 600;">What happens next:</p>
      <table style="width: 100%; font-size: 14px; color: #374151;">
        <tr><td style="padding: 4px 0;">1. Our team verifies your booking details</td></tr>
        <tr><td style="padding: 4px 0;">2. You'll receive a confirmation email once approved</td></tr>
        <tr><td style="padding: 4px 0;">3. Your payment will only be processed after approval</td></tr>
      </table>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${trackingUrl}" style="display: inline-block; background: #d97706; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Track Your Booking
        </a>
      </div>

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

  const text = `
BOOKING RECEIVED • #${bookingCode}

Hi ${firstName},

We've received your booking request for the ${carName}. Our team is reviewing it now.

Estimated Review Time: ${estimatedReviewTime}

BOOKING DETAILS:
- Vehicle: ${carName}
- Pickup: ${formatDate(startDate)}
- Return: ${formatDate(endDate)}
- Location: ${pickupLocation}
- Total: ${formatCurrency(totalAmount)}

WHAT HAPPENS NEXT:
1. Our team verifies your booking details
2. You'll receive a confirmation email once approved
3. Your payment will only be processed after approval

Track your booking: ${trackingUrl}

${verificationBlockText(emailReferenceId)}

${getEmailFooterText(emailReferenceId)}
  `.trim()

  try {
    const result = await sendEmail(guestEmail, subject, html, text, {
      requestId: `booking-review-${bookingCode}`
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
        totalAmount,
        status: 'pending_review',
        estimatedReviewTime
      }
    })

    console.log(`[Booking Email] Pending review sent to ${guestEmail} for ${bookingCode}`)
  } catch (error) {
    console.error(`[Booking Email] Failed to send pending review for ${bookingCode}:`, error)
  }
}

// =============================================================================
// sendFraudAlertEmail (internal — sent to support team)
// =============================================================================

export async function sendFraudAlertEmail(params: FraudAlertParams): Promise<void> {
  const {
    bookingCode,
    guestEmail,
    guestName,
    riskScore,
    riskFlags,
    carId,
    carName,
    totalAmount,
    ipAddress
  } = params

  const alertEmail = emailConfig.supportEmail
  const emailReferenceId = generateEmailReference('FA')

  const subject = `[ALERT] High-Risk Booking — ${bookingCode}`

  const flagsList = riskFlags.map((f: string) => `<li style="padding: 2px 0; color: #991b1b;">${f}</li>`).join('\n')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">

      <!-- Header -->
      <div style="border-bottom: 2px solid #dc2626; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #dc2626;">Fraud Alert — Booking #${bookingCode}</h1>
      </div>

      <div style="border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #fef2f2;">
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #991b1b; text-transform: uppercase;">Risk Score</p>
        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #dc2626;">${riskScore}/100</p>
      </div>

      <p style="font-size: 14px; font-weight: 600; color: #991b1b; margin: 16px 0 8px 0;">Risk Flags:</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
        ${flagsList}
      </ul>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Guest</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${guestName} (${guestEmail})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${carName || carId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Amount</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(totalAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;">IP Address</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${ipAddress}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${baseUrl}/fleet/bookings" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Review in Fleet Dashboard
        </a>
      </div>

      ${getEmailFooterHtml(emailReferenceId)}

      ${verificationBlockHtml(emailReferenceId)}
    </body>
    </html>
  `

  const text = `
FRAUD ALERT — BOOKING #${bookingCode}

Risk Score: ${riskScore}/100

Risk Flags:
${riskFlags.map((f: string) => `- ${f}`).join('\n')}

Guest: ${guestName} (${guestEmail})
Vehicle: ${carName || carId}
Amount: ${formatCurrency(totalAmount)}
IP: ${ipAddress}

Review: ${baseUrl}/fleet/bookings

${verificationBlockText(emailReferenceId)}

${getEmailFooterText(emailReferenceId)}
  `.trim()

  try {
    const result = await sendEmail(alertEmail, subject, html, text, {
      requestId: `fraud-alert-${bookingCode}`
    })

    await logEmail({
      recipientEmail: alertEmail,
      subject,
      emailType: 'SYSTEM',
      relatedType: 'booking',
      relatedId: bookingCode,
      messageId: result.messageId,
      referenceId: emailReferenceId,
      metadata: {
        bookingCode,
        guestEmail,
        riskScore,
        riskFlags,
        ipAddress
      }
    })

    console.log(`[Booking Email] Fraud alert sent for ${bookingCode} (score: ${riskScore})`)
  } catch (error) {
    console.error(`[Booking Email] Failed to send fraud alert for ${bookingCode}:`, error)
  }
}
