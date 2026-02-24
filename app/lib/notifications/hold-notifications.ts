// app/lib/notifications/hold-notifications.ts
// Notifications for ON_HOLD placed and ON_HOLD released booking events
// Sends SMS + Email + Bell notification for each event

import { sendSms, canSendToGuest, getGuestLocale } from '@/app/lib/twilio/sms'
import { sendEmail } from '@/app/lib/email/sender'
import { generateEmailReference, logEmail, emailConfig, getEmailFooterHtml, getEmailFooterText } from '@/app/lib/email/config'
import { createBookingNotification } from '@/app/lib/notifications/booking-bell'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'

// =============================================================================
// TYPES
// =============================================================================

interface BookingOnHoldData {
  bookingId: string
  bookingCode: string
  guestPhone: string | null
  guestEmail: string
  guestName: string
  guestId: string | null   // reviewerProfileId
  userId: string | null
  hostId: string
  hostName: string
  hostPhone: string | null
  car: { year: number; make: string; model: string }
  holdReason: string
  startDate: Date | string
  endDate: Date | string
}

interface BookingHoldReleasedData {
  bookingId: string
  bookingCode: string
  guestPhone: string | null
  guestEmail: string
  guestName: string
  guestId: string | null   // reviewerProfileId
  userId: string | null
  hostId: string
  hostName: string
  hostPhone: string | null
  car: { year: number; make: string; model: string }
  startDate: Date | string
  endDate: Date | string
}

type Locale = 'en' | 'es' | 'fr'

// =============================================================================
// HELPERS
// =============================================================================

function carLabel(car: { year: number; make: string; model: string }): string {
  return `${car.year} ${car.make} ${car.model}`
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
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
// SMS TEMPLATES
// =============================================================================

function onHoldSmsBody(code: string, car: string, locale: Locale): string {
  const templates: Record<Locale, string> = {
    en: `ItWhip: Your booking ${code} for the ${car} requires identity verification before your trip can begin. Please verify at itwhip.com/rentals/dashboard or call (855) 703-0806.`,
    es: `ItWhip: Tu reserva ${code} para el ${car} requiere verificación de identidad antes de que pueda comenzar tu viaje. Verifica en itwhip.com/rentals/dashboard o llama al (855) 703-0806.`,
    fr: `ItWhip: Votre réservation ${code} pour le ${car} nécessite une vérification d'identité avant le début de votre voyage. Veuillez vérifier sur itwhip.com/rentals/dashboard ou appeler le (855) 703-0806.`,
  }
  return templates[locale]
}

function holdReleasedSmsBody(code: string, car: string, locale: Locale): string {
  const templates: Record<Locale, string> = {
    en: `ItWhip: You're verified! Your booking ${code} for the ${car} is now active. View details at itwhip.com/rentals/dashboard`,
    es: `ItWhip: ¡Estás verificado! Tu reserva ${code} para el ${car} ya está activa. Ve los detalles en itwhip.com/rentals/dashboard`,
    fr: `ItWhip: Vous êtes vérifié(e) ! Votre réservation ${code} pour le ${car} est maintenant active. Voir les détails sur itwhip.com/rentals/dashboard`,
  }
  return templates[locale]
}

// =============================================================================
// 1. sendBookingOnHoldNotifications
// =============================================================================

export async function sendBookingOnHoldNotifications(data: BookingOnHoldData): Promise<void> {
  const car = carLabel(data.car)
  const firstName = data.guestName.split(' ')[0]
  const dashboardUrl = `${baseUrl}/rentals/dashboard`

  // ── SMS ──────────────────────────────────────────────────────────
  try {
    if (data.guestPhone) {
      const canSend = await canSendToGuest(data.guestId)
      if (canSend) {
        const locale = await getGuestLocale(data.guestId)
        const body = onHoldSmsBody(data.bookingCode, car, locale)
        await sendSms(data.guestPhone, body, {
          type: 'BOOKING_ON_HOLD',
          bookingId: data.bookingId,
          guestId: data.guestId || undefined,
          locale,
        })
      } else {
        console.log(`[Hold Notify] SMS blocked by preference: ON_HOLD for guest ${data.guestId}`)
      }
    } else {
      console.log(`[Hold Notify] No guest phone: ON_HOLD for ${data.bookingCode}`)
    }
  } catch (error) {
    console.error(`[Hold Notify] SMS failed for ON_HOLD ${data.bookingCode}:`, error)
  }

  // ── Email ────────────────────────────────────────────────────────
  try {
    const emailReferenceId = generateEmailReference('BH')
    const subject = `Action Required — Identity Verification for Booking #${data.bookingCode}`

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
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #d97706; text-transform: uppercase; letter-spacing: 0.5px;">Verification Required • #${data.bookingCode}</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #d97706;">Identity Verification Required</h1>
        </div>

        <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
          Hi ${firstName},
        </p>

        <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
          Your booking for the <strong>${car}</strong> has been placed on hold because identity verification is required before your trip can begin.
        </p>

        <!-- Hold Reason -->
        <div style="border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 20px 0; background-color: #fffbeb;">
          <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #92400e;">Reason for hold:</p>
          <p style="margin: 0; font-size: 14px; color: #1f2937;">${data.holdReason}</p>
        </div>

        <!-- Booking Details -->
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${car}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Pickup Date</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(data.startDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Return Date</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(data.endDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151;">Host</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${data.hostName}</td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #374151; margin: 20px 0 8px 0; font-weight: 600;">What to do next:</p>
        <table style="width: 100%; font-size: 14px; color: #374151;">
          <tr><td style="padding: 4px 0;">1. Visit your dashboard and complete identity verification</td></tr>
          <tr><td style="padding: 4px 0;">2. Once verified, your booking will be activated automatically</td></tr>
          <tr><td style="padding: 4px 0;">3. If you need help, call us at <strong>(855) 703-0806</strong></td></tr>
        </table>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #d97706; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Verify Your Identity
          </a>
        </div>

        <p style="font-size: 14px; color: #374151; margin: 20px 0;">
          Need help? Reply to this email or call us at <strong>(855) 703-0806</strong>.
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
      </body>
      </html>
    `

    const text = `
VERIFICATION REQUIRED • #${data.bookingCode}

Hi ${firstName},

Your booking for the ${car} has been placed on hold because identity verification is required before your trip can begin.

Reason: ${data.holdReason}

BOOKING DETAILS:
- Vehicle: ${car}
- Pickup: ${formatDate(data.startDate)}
- Return: ${formatDate(data.endDate)}
- Host: ${data.hostName}

WHAT TO DO NEXT:
1. Visit your dashboard and complete identity verification
2. Once verified, your booking will be activated automatically
3. If you need help, call us at (855) 703-0806

Verify your identity: ${dashboardUrl}

Need help? Call (855) 703-0806

${getEmailFooterText(emailReferenceId)}
    `.trim()

    const result = await sendEmail(data.guestEmail, subject, html, text, {
      requestId: `booking-hold-${data.bookingCode}`,
    })

    await logEmail({
      recipientEmail: data.guestEmail,
      recipientName: data.guestName,
      subject,
      emailType: 'IDENTITY_VERIFICATION',
      relatedType: 'booking',
      relatedId: data.bookingCode,
      messageId: result.messageId,
      referenceId: emailReferenceId,
      metadata: {
        bookingCode: data.bookingCode,
        carName: car,
        holdReason: data.holdReason,
        status: 'on_hold',
      },
    })

    console.log(`[Hold Notify] ON_HOLD email sent to ${data.guestEmail} for ${data.bookingCode}`)
  } catch (error) {
    console.error(`[Hold Notify] ON_HOLD email failed for ${data.bookingCode}:`, error)
  }

  // ── Bell Notification ────────────────────────────────────────────
  try {
    const bellPromises: Promise<void>[] = []

    // Guest bell — HIGH priority
    if (data.guestId) {
      bellPromises.push(createBookingNotification({
        bookingId: data.bookingId,
        recipientType: 'GUEST',
        recipientId: data.guestId,
        userId: data.userId,
        type: 'BOOKING_ON_HOLD',
        title: 'Action needed: Verify your identity',
        message: `Your booking #${data.bookingCode} for the ${car} is on hold pending identity verification. Please verify to activate your trip.`,
        actionUrl: `${baseUrl}/rentals/dashboard`,
        priority: 'HIGH',
      }))
    }

    // Host bell — MEDIUM priority
    bellPromises.push(createBookingNotification({
      bookingId: data.bookingId,
      recipientType: 'HOST',
      recipientId: data.hostId,
      type: 'BOOKING_ON_HOLD',
      title: 'Guest needs to verify identity',
      message: `Booking #${data.bookingCode} for your ${car} is on hold. ${data.guestName} needs to complete identity verification.`,
      actionUrl: `${baseUrl}/partner/bookings/${data.bookingId}`,
      priority: 'MEDIUM',
    }))

    await Promise.allSettled(bellPromises)
    console.log(`[Hold Notify] ON_HOLD bell created for ${data.bookingCode}`)
  } catch (error) {
    console.error(`[Hold Notify] ON_HOLD bell failed for ${data.bookingCode}:`, error)
  }
}

// =============================================================================
// 2. sendBookingHoldReleasedNotifications
// =============================================================================

export async function sendBookingHoldReleasedNotifications(data: BookingHoldReleasedData): Promise<void> {
  const car = carLabel(data.car)
  const firstName = data.guestName.split(' ')[0]
  const dashboardUrl = `${baseUrl}/rentals/dashboard`

  // ── SMS ──────────────────────────────────────────────────────────
  try {
    if (data.guestPhone) {
      const canSend = await canSendToGuest(data.guestId)
      if (canSend) {
        const locale = await getGuestLocale(data.guestId)
        const body = holdReleasedSmsBody(data.bookingCode, car, locale)
        await sendSms(data.guestPhone, body, {
          type: 'BOOKING_HOLD_RELEASED',
          bookingId: data.bookingId,
          guestId: data.guestId || undefined,
          locale,
        })
      } else {
        console.log(`[Hold Notify] SMS blocked by preference: HOLD_RELEASED for guest ${data.guestId}`)
      }
    } else {
      console.log(`[Hold Notify] No guest phone: HOLD_RELEASED for ${data.bookingCode}`)
    }
  } catch (error) {
    console.error(`[Hold Notify] SMS failed for HOLD_RELEASED ${data.bookingCode}:`, error)
  }

  // ── Email ────────────────────────────────────────────────────────
  try {
    const emailReferenceId = generateEmailReference('BV')
    const subject = `You're Verified! Booking #${data.bookingCode} is Active`

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
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">Verified • #${data.bookingCode}</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #16a34a;">You're Verified!</h1>
        </div>

        <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
          Hi ${firstName},
        </p>

        <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
          Great news! Your identity has been verified and your booking for the <strong>${car}</strong> is now active. You're all set for your trip.
        </p>

        <!-- Success Box -->
        <div style="border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0; background-color: #f0fdf4;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #166534; text-align: center;">
            Identity Verified — Booking Active
          </p>
        </div>

        <!-- Booking Details -->
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${car}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Pickup Date</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(data.startDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Return Date</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(data.endDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151;">Host</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${data.hostName}</td>
          </tr>
        </table>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
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
      </body>
      </html>
    `

    const text = `
YOU'RE VERIFIED! • #${data.bookingCode}

Hi ${firstName},

Great news! Your identity has been verified and your booking for the ${car} is now active. You're all set for your trip.

BOOKING DETAILS:
- Vehicle: ${car}
- Pickup: ${formatDate(data.startDate)}
- Return: ${formatDate(data.endDate)}
- Host: ${data.hostName}

View your booking: ${dashboardUrl}

Need to modify or cancel? Visit your booking dashboard or reply to this email.

${getEmailFooterText(emailReferenceId)}
    `.trim()

    const result = await sendEmail(data.guestEmail, subject, html, text, {
      requestId: `booking-hold-released-${data.bookingCode}`,
    })

    await logEmail({
      recipientEmail: data.guestEmail,
      recipientName: data.guestName,
      subject,
      emailType: 'IDENTITY_VERIFICATION',
      relatedType: 'booking',
      relatedId: data.bookingCode,
      messageId: result.messageId,
      referenceId: emailReferenceId,
      metadata: {
        bookingCode: data.bookingCode,
        carName: car,
        status: 'hold_released',
      },
    })

    console.log(`[Hold Notify] HOLD_RELEASED email sent to ${data.guestEmail} for ${data.bookingCode}`)
  } catch (error) {
    console.error(`[Hold Notify] HOLD_RELEASED email failed for ${data.bookingCode}:`, error)
  }

  // ── Bell Notification ────────────────────────────────────────────
  try {
    const bellPromises: Promise<void>[] = []

    // Guest bell — HIGH priority
    if (data.guestId) {
      bellPromises.push(createBookingNotification({
        bookingId: data.bookingId,
        recipientType: 'GUEST',
        recipientId: data.guestId,
        userId: data.userId,
        type: 'BOOKING_HOLD_RELEASED',
        title: "You're verified! Booking active",
        message: `Your identity has been verified. Booking #${data.bookingCode} for the ${car} is now active.`,
        actionUrl: `${baseUrl}/rentals/dashboard`,
        priority: 'HIGH',
      }))
    }

    // Host bell — MEDIUM priority
    bellPromises.push(createBookingNotification({
      bookingId: data.bookingId,
      recipientType: 'HOST',
      recipientId: data.hostId,
      type: 'BOOKING_HOLD_RELEASED',
      title: 'Guest verified — booking active',
      message: `${data.guestName} has been verified. Booking #${data.bookingCode} for your ${car} is now active.`,
      actionUrl: `${baseUrl}/partner/bookings/${data.bookingId}`,
      priority: 'MEDIUM',
    }))

    await Promise.allSettled(bellPromises)
    console.log(`[Hold Notify] HOLD_RELEASED bell created for ${data.bookingCode}`)
  } catch (error) {
    console.error(`[Hold Notify] HOLD_RELEASED bell failed for ${data.bookingCode}:`, error)
  }
}
