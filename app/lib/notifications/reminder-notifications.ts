// app/lib/notifications/reminder-notifications.ts
// Pickup reminder (24h before start) + Return reminder (24h + 3h before end)
// Sends SMS + email + bell notification for each

import { sendSms, canSendToGuest, getGuestLocale } from '@/app/lib/twilio/sms'
import { sendEmail } from '@/app/lib/email/sender'
import { generateEmailReference, logEmail, emailConfig, getEmailFooterHtml, getEmailFooterText } from '@/app/lib/email/config'
import { createBookingNotificationPair } from '@/app/lib/notifications/booking-bell'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'

// =============================================================================
// TYPES
// =============================================================================

interface ReminderData {
  bookingId: string
  bookingCode: string
  guestPhone: string | null
  guestEmail: string
  guestName: string
  guestId: string | null
  userId: string | null
  hostId: string
  hostName: string
  car: { year: number; make: string; model: string }
  startDate: Date | string
  startTime: string | null
  endDate: Date | string
  endTime: string | null
  pickupLocation: string | null
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

function pickupReminderSms(code: string, car: string, date: string, time: string | null, locale: Locale): string {
  const timeStr = time ? ` at ${time}` : ''
  const templates: Record<Locale, string> = {
    en: `ItWhip: Reminder — your ${car} pickup is tomorrow (${date}${timeStr}). Booking ${code}. Have your driver's license ready. View details at itwhip.com/rentals/dashboard`,
    es: `ItWhip: Recordatorio — tu recogida del ${car} es mañana (${date}${timeStr}). Reserva ${code}. Ten tu licencia de conducir lista. Detalles en itwhip.com/rentals/dashboard`,
    fr: `ItWhip: Rappel — votre prise en charge du ${car} est demain (${date}${timeStr}). Réservation ${code}. Ayez votre permis prêt. Détails sur itwhip.com/rentals/dashboard`,
  }
  return templates[locale]
}

function returnReminderSms(code: string, car: string, date: string, time: string | null, hours: number, locale: Locale): string {
  const timeStr = time ? ` at ${time}` : ''
  const whenStr = hours <= 6 ? 'soon' : 'tomorrow'
  const templates: Record<Locale, string> = {
    en: `ItWhip: Reminder — your ${car} is due back ${whenStr} (${date}${timeStr}). Booking ${code}. Please refuel and return on time. View details at itwhip.com/rentals/dashboard`,
    es: `ItWhip: Recordatorio — tu ${car} debe devolverse ${whenStr === 'soon' ? 'pronto' : 'mañana'} (${date}${timeStr}). Reserva ${code}. Reabastece y devuelve a tiempo. Detalles en itwhip.com/rentals/dashboard`,
    fr: `ItWhip: Rappel — votre ${car} doit être rendu ${whenStr === 'soon' ? 'bientôt' : 'demain'} (${date}${timeStr}). Réservation ${code}. Veuillez refaire le plein et rendre à l'heure. Détails sur itwhip.com/rentals/dashboard`,
  }
  return templates[locale]
}

// =============================================================================
// 1. sendPickupReminderNotifications — 24h before trip start
// =============================================================================

export async function sendPickupReminderNotifications(data: ReminderData): Promise<void> {
  const car = carLabel(data.car)
  const firstName = data.guestName.split(' ')[0]
  const dashboardUrl = `${baseUrl}/rentals/dashboard/bookings/${data.bookingId}`
  const dateStr = formatDate(data.startDate)

  // ── SMS ──────────────────────────────────────────────────────────
  try {
    if (data.guestPhone) {
      const canSend = await canSendToGuest(data.guestId)
      if (canSend) {
        const locale = await getGuestLocale(data.guestId)
        const body = pickupReminderSms(data.bookingCode, car, dateStr, data.startTime, locale)
        await sendSms(data.guestPhone, body, {
          type: 'PICKUP_REMINDER',
          bookingId: data.bookingId,
          guestId: data.guestId || undefined,
          locale,
        })
      } else {
        console.log(`[Pickup Reminder] SMS blocked by preference: guest ${data.guestId}`)
      }
    } else {
      console.log(`[Pickup Reminder] No guest phone for ${data.bookingCode}`)
    }
  } catch (error) {
    console.error(`[Pickup Reminder] SMS failed for ${data.bookingCode}:`, error)
  }

  // ── Email ────────────────────────────────────────────────────────
  try {
    const emailReferenceId = generateEmailReference('PR')
    const subject = `Pickup Tomorrow — ${car}`
    const locationLine = data.pickupLocation
      ? `<tr><td style="padding: 8px 0; color: #374151;">Pickup Location</td><td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${data.pickupLocation}</td></tr>`
      : ''
    const locationText = data.pickupLocation ? `- Pickup Location: ${data.pickupLocation}\n` : ''

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px;">Pickup Reminder &bull; #${data.bookingCode}</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #2563eb;">Your Pickup is Tomorrow</h1>
        </div>

        <p style="font-size: 16px; margin: 0 0 16px 0;">Hi ${firstName},</p>
        <p style="font-size: 16px; margin: 0 0 20px 0;">Your <strong>${car}</strong> pickup is tomorrow. Here are the details:</p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${car}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Pickup Date</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${dateStr}${data.startTime ? ` at ${data.startTime}` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Return Date</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDate(data.endDate)}${data.endTime ? ` at ${data.endTime}` : ''}</td>
          </tr>
          ${locationLine}
          <tr>
            <td style="padding: 8px 0; color: #374151;">Host</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${data.hostName}</td>
          </tr>
        </table>

        <div style="border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0; background-color: #eff6ff;">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e40af;">Before your pickup:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
            <li>Have your valid driver's license ready</li>
            <li>Check your booking details and pickup time</li>
            <li>Contact your host if you have any questions</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
            View Booking Details
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
PICKUP REMINDER • #${data.bookingCode}

Hi ${firstName},

Your ${car} pickup is tomorrow.

BOOKING DETAILS:
- Vehicle: ${car}
- Pickup: ${dateStr}${data.startTime ? ` at ${data.startTime}` : ''}
- Return: ${formatDate(data.endDate)}${data.endTime ? ` at ${data.endTime}` : ''}
${locationText}- Host: ${data.hostName}

BEFORE YOUR PICKUP:
- Have your valid driver's license ready
- Check your booking details and pickup time
- Contact your host if you have any questions

View booking: ${dashboardUrl}

${getEmailFooterText(emailReferenceId)}
    `.trim()

    const result = await sendEmail(data.guestEmail, subject, html, text, {
      requestId: `pickup-reminder-${data.bookingCode}`,
    })

    await logEmail({
      recipientEmail: data.guestEmail,
      recipientName: data.guestName,
      subject,
      emailType: 'BOOKING_CONFIRMATION',
      relatedType: 'booking',
      relatedId: data.bookingCode,
      messageId: result.messageId,
      referenceId: emailReferenceId,
      metadata: { bookingCode: data.bookingCode, carName: car, status: 'pickup_reminder' },
    })

    console.log(`[Pickup Reminder] Email sent to ${data.guestEmail} for ${data.bookingCode}`)
  } catch (error) {
    console.error(`[Pickup Reminder] Email failed for ${data.bookingCode}:`, error)
  }

  // ── Bell ──────────────────────────────────────────────────────────
  try {
    await createBookingNotificationPair({
      bookingId: data.bookingId,
      guestId: data.guestId,
      userId: data.userId,
      hostId: data.hostId,
      type: 'PICKUP_REMINDER',
      guestTitle: 'Pickup tomorrow',
      guestMessage: `Your ${car} pickup is tomorrow${data.startTime ? ` at ${data.startTime}` : ''}.`,
      hostTitle: 'Guest pickup tomorrow',
      hostMessage: `${data.guestName}'s pickup for your ${car} is tomorrow.`,
      guestActionUrl: `/rentals/dashboard/bookings/${data.bookingId}`,
      hostActionUrl: `/partner/bookings/${data.bookingId}`,
      priority: 'MEDIUM',
    })
  } catch (error) {
    console.error(`[Pickup Reminder] Bell failed for ${data.bookingCode}:`, error)
  }
}

// =============================================================================
// 2. sendReturnReminderNotifications — 24h or 3h before trip end
// =============================================================================

export async function sendReturnReminderNotifications(data: ReminderData & { hoursUntilReturn: number }): Promise<void> {
  const car = carLabel(data.car)
  const firstName = data.guestName.split(' ')[0]
  const dashboardUrl = `${baseUrl}/rentals/dashboard/bookings/${data.bookingId}`
  const dateStr = formatDate(data.endDate)
  const isSoon = data.hoursUntilReturn <= 6

  // ── SMS ──────────────────────────────────────────────────────────
  try {
    if (data.guestPhone) {
      const canSend = await canSendToGuest(data.guestId)
      if (canSend) {
        const locale = await getGuestLocale(data.guestId)
        const body = returnReminderSms(data.bookingCode, car, dateStr, data.endTime, data.hoursUntilReturn, locale)
        await sendSms(data.guestPhone, body, {
          type: 'RETURN_REMINDER',
          bookingId: data.bookingId,
          guestId: data.guestId || undefined,
          locale,
        })
      } else {
        console.log(`[Return Reminder] SMS blocked by preference: guest ${data.guestId}`)
      }
    } else {
      console.log(`[Return Reminder] No guest phone for ${data.bookingCode}`)
    }
  } catch (error) {
    console.error(`[Return Reminder] SMS failed for ${data.bookingCode}:`, error)
  }

  // ── Email ────────────────────────────────────────────────────────
  try {
    const emailReferenceId = generateEmailReference('RR')
    const urgency = isSoon ? 'Return Due Soon' : 'Return Tomorrow'
    const subject = `${urgency} — ${car}`
    const accentColor = isSoon ? '#dc2626' : '#d97706'

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.5px;">Return Reminder &bull; #${data.bookingCode}</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: ${accentColor};">${urgency}</h1>
        </div>

        <p style="font-size: 16px; margin: 0 0 16px 0;">Hi ${firstName},</p>
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Your <strong>${car}</strong> is due back ${isSoon ? 'soon' : 'tomorrow'}${data.endTime ? ` at ${data.endTime}` : ''}.
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Vehicle</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${car}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; border-bottom: 1px solid #e5e7eb;">Return Date</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${dateStr}${data.endTime ? ` at ${data.endTime}` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151;">Host</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${data.hostName}</td>
          </tr>
        </table>

        <div style="border: 1px solid ${isSoon ? '#fecaca' : '#fde68a'}; border-radius: 8px; padding: 16px; margin: 20px 0; background-color: ${isSoon ? '#fef2f2' : '#fffbeb'};">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: ${isSoon ? '#991b1b' : '#92400e'};">Before returning:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
            <li>Refuel to the same level as pickup</li>
            <li>Remove all personal belongings</li>
            <li>Return on time to avoid late fees</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background: ${accentColor}; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
            View Booking Details
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
${urgency.toUpperCase()} • #${data.bookingCode}

Hi ${firstName},

Your ${car} is due back ${isSoon ? 'soon' : 'tomorrow'}${data.endTime ? ` at ${data.endTime}` : ''}.

BOOKING DETAILS:
- Vehicle: ${car}
- Return: ${dateStr}${data.endTime ? ` at ${data.endTime}` : ''}
- Host: ${data.hostName}

BEFORE RETURNING:
- Refuel to the same level as pickup
- Remove all personal belongings
- Return on time to avoid late fees

View booking: ${dashboardUrl}

${getEmailFooterText(emailReferenceId)}
    `.trim()

    const result = await sendEmail(data.guestEmail, subject, html, text, {
      requestId: `return-reminder-${data.bookingCode}-${isSoon ? '3h' : '24h'}`,
    })

    await logEmail({
      recipientEmail: data.guestEmail,
      recipientName: data.guestName,
      subject,
      emailType: 'BOOKING_CONFIRMATION',
      relatedType: 'booking',
      relatedId: data.bookingCode,
      messageId: result.messageId,
      referenceId: emailReferenceId,
      metadata: { bookingCode: data.bookingCode, carName: car, status: isSoon ? 'return_reminder_3h' : 'return_reminder_24h' },
    })

    console.log(`[Return Reminder] Email sent to ${data.guestEmail} for ${data.bookingCode} (${isSoon ? '3h' : '24h'})`)
  } catch (error) {
    console.error(`[Return Reminder] Email failed for ${data.bookingCode}:`, error)
  }

  // ── Bell ──────────────────────────────────────────────────────────
  try {
    await createBookingNotificationPair({
      bookingId: data.bookingId,
      guestId: data.guestId,
      userId: data.userId,
      hostId: data.hostId,
      type: 'RETURN_REMINDER',
      guestTitle: isSoon ? 'Return due soon' : 'Return tomorrow',
      guestMessage: `Your ${car} is due back ${isSoon ? 'soon' : 'tomorrow'}${data.endTime ? ` at ${data.endTime}` : ''}.`,
      hostTitle: isSoon ? 'Vehicle return soon' : 'Vehicle return tomorrow',
      hostMessage: `${data.guestName}'s ${car} is due back ${isSoon ? 'soon' : 'tomorrow'}.`,
      guestActionUrl: `/rentals/dashboard/bookings/${data.bookingId}`,
      hostActionUrl: `/partner/bookings/${data.bookingId}`,
      priority: isSoon ? 'HIGH' : 'MEDIUM',
    })
  } catch (error) {
    console.error(`[Return Reminder] Bell failed for ${data.bookingCode}:`, error)
  }
}
