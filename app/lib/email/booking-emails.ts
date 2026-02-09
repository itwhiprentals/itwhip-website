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
// sendHostReviewEmail — sent to host after fleet approval
// =============================================================================

interface HostReviewParams {
  hostEmail: string
  hostName: string
  bookingCode: string
  guestName: string
  carMake: string
  carModel: string
  carYear: number
  carImage: string
  startDate: string
  endDate: string
  pickupLocation: string
  totalAmount: string
  numberOfDays: number
  reviewUrl: string
}

export async function sendHostReviewEmail(params: HostReviewParams): Promise<void> {
  const {
    hostEmail,
    hostName,
    bookingCode,
    guestName,
    carMake,
    carModel,
    carYear,
    carImage,
    startDate,
    endDate,
    pickupLocation,
    totalAmount,
    numberOfDays,
    reviewUrl
  } = params

  const firstName = hostName.split(' ')[0]
  const carName = `${carYear} ${carMake} ${carModel}`
  const emailReferenceId = generateEmailReference('HR')

  const subject = `Booking Request — ${carName} needs your approval`

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
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px;">Host Approval Required • #${bookingCode}</p>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #7c3aed;">A Booking Needs Your Approval</h1>
      </div>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
        Hi ${firstName},
      </p>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
        <strong>${guestName}</strong> would like to rent your <strong>${carName}</strong>. Our fleet team has reviewed and approved this booking — it now needs your confirmation.
      </p>

      ${carImage ? `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${carImage}" alt="${carName}" style="max-width: 100%; border-radius: 8px; max-height: 200px; object-fit: cover;" />
      </div>
      ` : ''}

      <!-- Booking Details -->
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${carName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Guest</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${guestName}</td>
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
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Duration</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${numberOfDays} day${numberOfDays > 1 ? 's' : ''}</td>
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

      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${reviewUrl}" style="display: inline-block; background: #7c3aed; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Review & Respond
        </a>
      </div>

      <p style="font-size: 14px; color: #374151; margin: 20px 0;">
        Please respond as soon as possible. The guest's payment is being held and they're waiting for your confirmation.
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
HOST APPROVAL REQUIRED • #${bookingCode}

Hi ${firstName},

${guestName} would like to rent your ${carName}. Our fleet team has reviewed and approved this booking — it now needs your confirmation.

BOOKING DETAILS:
- Vehicle: ${carName}
- Guest: ${guestName}
- Pickup: ${formatDate(startDate)}
- Return: ${formatDate(endDate)}
- Duration: ${numberOfDays} day${numberOfDays > 1 ? 's' : ''}
- Location: ${pickupLocation}
- Total: ${formatCurrency(totalAmount)}

Review & Respond: ${reviewUrl}

Please respond as soon as possible. The guest's payment is being held and they're waiting for your confirmation.

${verificationBlockText(emailReferenceId)}

${getEmailFooterText(emailReferenceId)}
  `.trim()

  try {
    const result = await sendEmail(hostEmail, subject, html, text, {
      requestId: `host-review-${bookingCode}`
    })

    await logEmail({
      recipientEmail: hostEmail,
      recipientName: hostName,
      subject,
      emailType: 'BOOKING_CONFIRMATION',
      relatedType: 'booking',
      relatedId: bookingCode,
      messageId: result.messageId,
      referenceId: emailReferenceId,
      metadata: {
        bookingCode,
        carName,
        guestName,
        totalAmount,
        status: 'host_review_pending'
      }
    })

    console.log(`[Booking Email] Host review email sent to ${hostEmail} for ${bookingCode}`)
  } catch (error) {
    console.error(`[Booking Email] Failed to send host review for ${bookingCode}:`, error)
  }
}

// =============================================================================
// sendHostRejectedEmail — sent to fleet when host rejects
// =============================================================================

interface HostRejectedParams {
  bookingCode: string
  bookingId: string
  hostName: string
  hostNotes: string
  guestName: string
  carName: string
  startDate: string
  endDate: string
  totalAmount: string
}

export async function sendHostRejectedEmail(params: HostRejectedParams): Promise<void> {
  const {
    bookingCode,
    bookingId,
    hostName,
    hostNotes,
    guestName,
    carName,
    startDate,
    endDate,
    totalAmount
  } = params

  const fleetEmail = emailConfig.supportEmail
  const emailReferenceId = generateEmailReference('HJ')
  const reassignUrl = `${baseUrl}/partner/bookings/${bookingId}`

  const subject = `Host Rejected Booking #${bookingCode} — Action Required`

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
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px;">Host Rejection • #${bookingCode}</p>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #dc2626;">Host Rejected This Booking</h1>
      </div>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
        <strong>${hostName}</strong> has rejected booking <strong>#${bookingCode}</strong>. The guest has <strong>not</strong> been notified yet — you need to decide next steps.
      </p>

      <!-- Rejection reason -->
      <div style="border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 20px 0; background-color: #fef2f2;">
        <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #991b1b;">Reason for rejection:</p>
        <p style="margin: 0; font-size: 14px; color: #1f2937;">${hostNotes || 'No reason provided'}</p>
      </div>

      <!-- Booking Details -->
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${carName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Guest</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${guestName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Dates</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(startDate)} — ${formatDate(endDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;">Total</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 700; text-align: right;">${formatCurrency(totalAmount)}</td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #374151; margin: 20px 0 8px 0; font-weight: 600;">Your options:</p>
      <table style="width: 100%; font-size: 14px; color: #374151;">
        <tr><td style="padding: 4px 0;">1. <strong>Reassign</strong> — find an alternative vehicle for the guest</td></tr>
        <tr><td style="padding: 4px 0;">2. <strong>Cancel</strong> — release the payment hold and notify the guest</td></tr>
      </table>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${reassignUrl}" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Take Action Now
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

      ${getEmailFooterHtml(emailReferenceId)}

      ${verificationBlockHtml(emailReferenceId)}
    </body>
    </html>
  `

  const text = `
HOST REJECTED BOOKING #${bookingCode}

${hostName} has rejected this booking. The guest has NOT been notified.

Reason: ${hostNotes || 'No reason provided'}

BOOKING DETAILS:
- Vehicle: ${carName}
- Guest: ${guestName}
- Dates: ${formatDate(startDate)} — ${formatDate(endDate)}
- Total: ${formatCurrency(totalAmount)}

OPTIONS:
1. Reassign — find an alternative vehicle
2. Cancel — release payment hold and notify guest

Take action: ${reassignUrl}

${verificationBlockText(emailReferenceId)}

${getEmailFooterText(emailReferenceId)}
  `.trim()

  try {
    const result = await sendEmail(fleetEmail, subject, html, text, {
      requestId: `host-rejected-${bookingCode}`
    })

    await logEmail({
      recipientEmail: fleetEmail,
      subject,
      emailType: 'SYSTEM',
      relatedType: 'booking',
      relatedId: bookingCode,
      messageId: result.messageId,
      referenceId: emailReferenceId,
      metadata: {
        bookingCode,
        hostName,
        hostNotes,
        guestName,
        carName,
        status: 'host_rejected'
      }
    })

    console.log(`[Booking Email] Host rejection alert sent for ${bookingCode}`)
  } catch (error) {
    console.error(`[Booking Email] Failed to send host rejection alert for ${bookingCode}:`, error)
  }
}

// =============================================================================
// sendVehicleChangeEmail — sent to guest when fleet offers alternative vehicle
// =============================================================================

interface VehicleChangeParams {
  guestEmail: string
  guestName: string
  bookingCode: string
  originalCarName: string
  originalCarImage: string
  newCarName: string
  newCarImage: string
  newDailyRate: number
  startDate: string
  endDate: string
  changeUrl: string
  reason: string
}

export async function sendVehicleChangeEmail(params: VehicleChangeParams): Promise<void> {
  const {
    guestEmail,
    guestName,
    bookingCode,
    originalCarName,
    newCarName,
    newCarImage,
    newDailyRate,
    startDate,
    endDate,
    changeUrl,
    reason
  } = params

  const firstName = guestName.split(' ')[0]
  const emailReferenceId = generateEmailReference('VC')

  const subject = `Vehicle Update — Booking #${bookingCode}`

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
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px;">Vehicle Update • #${bookingCode}</p>
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #2563eb;">We Have an Alternative Vehicle for You</h1>
      </div>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
        Hi ${firstName},
      </p>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
        ${reason}
      </p>

      <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
        We&apos;ve found a great alternative: the <strong>${newCarName}</strong> at <strong>$${newDailyRate}/day</strong>.
      </p>

      ${newCarImage ? `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${newCarImage}" alt="${newCarName}" style="max-width: 100%; border-radius: 8px; max-height: 200px; object-fit: cover;" />
      </div>
      ` : ''}

      <!-- Comparison -->
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Original Vehicle</td>
          <td style="padding: 8px 0; color: #9ca3af; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb; text-decoration: line-through;">${originalCarName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">New Vehicle</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${newCarName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Dates</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(startDate)} — ${formatDate(endDate)}</td>
        </tr>
      </table>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${changeUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Review Your Options
        </a>
      </div>

      <p style="font-size: 14px; color: #374151; margin: 20px 0;">
        You can accept the new vehicle or decline for a full refund. This link expires in 48 hours.
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
VEHICLE UPDATE • #${bookingCode}

Hi ${firstName},

${reason}

We've found a great alternative: the ${newCarName} at $${newDailyRate}/day.

Original Vehicle: ${originalCarName}
New Vehicle: ${newCarName}
Dates: ${formatDate(startDate)} — ${formatDate(endDate)}

Review your options: ${changeUrl}

You can accept the new vehicle or decline for a full refund. This link expires in 48 hours.

${verificationBlockText(emailReferenceId)}

${getEmailFooterText(emailReferenceId)}
  `.trim()

  try {
    const result = await sendEmail(guestEmail, subject, html, text, {
      requestId: `vehicle-change-${bookingCode}`
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
        originalCarName,
        newCarName,
        status: 'vehicle_change_offered'
      }
    })

    console.log(`[Booking Email] Vehicle change email sent to ${guestEmail} for ${bookingCode}`)
  } catch (error) {
    console.error(`[Booking Email] Failed to send vehicle change for ${bookingCode}:`, error)
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
