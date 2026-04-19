// app/lib/email/booking-modified-emails.ts
// Emails sent when a booking is modified (same-host replacement)

import { sendEmail } from './sender'
import { generateEmailReference, logEmail, getEmailFooterHtml, getEmailFooterText } from './config'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'

function formatCurrency(n: number | string | null | undefined) {
  const num = typeof n === 'string' ? parseFloat(n) : (n || 0)
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDateDisplay(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

// =============================================================================
// GUEST: booking modified email
// =============================================================================

interface GuestModifiedParams {
  guestEmail: string
  guestName: string
  oldBookingCode: string
  newBookingCode: string
  newBookingId: string
  car: { make: string; model: string; year: number; photos?: { url: string }[] }
  startDate: string | Date
  endDate: string | Date
  startTime?: string
  endTime?: string
  totalAmount: number | string
  bonusAmount?: number
}

export async function sendGuestModifiedEmail(params: GuestModifiedParams): Promise<void> {
  const { guestEmail, guestName, oldBookingCode, newBookingCode, newBookingId, car, startDate, endDate, startTime, endTime, totalAmount, bonusAmount = 100 } = params
  const firstName = guestName.split(' ')[0]
  const carName = `${car.year} ${car.make} ${car.model}`
  const carImage = car.photos?.[0]?.url || ''
  const viewUrl = `${baseUrl}/rentals/dashboard/bookings/${newBookingId}`
  const emailRef = generateEmailReference('BM')
  const subject = `Your Reservation Has Been Updated — ${carName}`

  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background-color:#ea580c;padding:28px 24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">Your Reservation Has Been Updated</h1>
          <p style="margin:6px 0 0 0;color:rgba(255,255,255,0.9);font-size:14px;">We've prepared a new reservation for you</p>
        </td></tr>

        <tr><td style="padding:28px 24px;">
          <p style="margin:0 0 16px 0;color:#111827;font-size:16px;">Hi ${firstName},</p>
          <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.5;">
            Your booking for <strong>${carName}</strong> has been updated by ItWhip. A new reservation has been created to match your original trip — same car, same dates, same rate.
          </p>

          ${carImage ? `<div style="text-align:center;margin:20px 0;"><img src="${carImage}" alt="${carName}" style="max-width:100%;height:auto;border-radius:8px;" /></div>` : ''}

          <div style="background:#f9fafb;padding:18px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 10px 0;color:#111827;font-size:16px;font-weight:600;">${carName}</p>
            <p style="margin:6px 0;color:#374151;font-size:14px;"><strong>New Confirmation:</strong> ${newBookingCode}</p>
            <p style="margin:6px 0;color:#6b7280;font-size:13px;"><strong>Previous:</strong> <span style="text-decoration:line-through;">${oldBookingCode}</span></p>
            <p style="margin:6px 0;color:#374151;font-size:14px;"><strong>Pickup:</strong> ${formatDateDisplay(startDate)}${startTime ? ` at ${startTime}` : ''}</p>
            <p style="margin:6px 0;color:#374151;font-size:14px;"><strong>Return:</strong> ${formatDateDisplay(endDate)}${endTime ? ` at ${endTime}` : ''}</p>
            <p style="margin:10px 0 0 0;color:#111827;font-size:15px;"><strong>Total:</strong> ${formatCurrency(totalAmount)}</p>
          </div>

          <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 6px 0;color:#166534;font-size:14px;font-weight:600;">Automatic Refund — No Charges Applied</p>
            <p style="margin:0;color:#166534;font-size:13px;line-height:1.5;">
              All holds and charges from your previous booking have been automatically reversed. Since we never captured the funds, they return to your account right away — in rare cases up to 1–3 business days depending on your bank.
            </p>
          </div>

          <div style="background:#fef3c7;border:1px solid #fcd34d;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 6px 0;color:#92400e;font-size:14px;font-weight:600;">${formatCurrency(bonusAmount)} Rebooking Bonus Added</p>
            <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
              As a thank-you for rebooking, we've added <strong>${formatCurrency(bonusAmount)}</strong> to your account. It will automatically apply at checkout (up to 25% of your booking total).
            </p>
          </div>

          <div style="text-align:center;margin:28px 0;">
            <a href="${viewUrl}" style="display:inline-block;background-color:#ea580c;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
              View New Reservation
            </a>
          </div>

          <p style="margin:16px 0 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
            Sign the new rental agreement and complete payment to confirm your reservation. If you have any questions, reply to this email.
          </p>

          ${getEmailFooterHtml(emailRef)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
  `

  const text = `Hi ${firstName},

Your booking for ${carName} has been updated by ItWhip. A new reservation has been created to match your original trip.

Previous: ${oldBookingCode}
New Confirmation: ${newBookingCode}
Pickup: ${formatDateDisplay(startDate)}${startTime ? ` at ${startTime}` : ''}
Return: ${formatDateDisplay(endDate)}${endTime ? ` at ${endTime}` : ''}
Total: ${formatCurrency(totalAmount)}

Automatic Refund: All holds and charges from your previous booking have been reversed. Funds return instantly; in rare cases up to 1-3 business days.

${formatCurrency(bonusAmount)} Rebooking Bonus: We've added ${formatCurrency(bonusAmount)} to your account as a thank-you. Applies automatically at checkout (up to 25% of booking total).

View your new reservation: ${viewUrl}

${getEmailFooterText(emailRef)}`

  try {
    const result = await sendEmail(guestEmail, subject, html, text, { requestId: emailRef })
    await logEmail({
      referenceId: emailRef,
      recipientEmail: guestEmail,
      recipientName: guestName,
      subject,
      emailType: 'SYSTEM',
      relatedType: 'booking',
      relatedId: newBookingId,
      messageId: result?.messageId,
      metadata: { type: 'booking_modified_guest', oldBookingCode, newBookingCode },
    })
    console.log(`[Booking Modified Email] Sent to guest ${guestEmail} — ${emailRef}`)
  } catch (err) {
    console.error('[Booking Modified Email] Guest send failed:', err)
  }
}

// =============================================================================
// HOST: booking modified email
// =============================================================================

interface HostModifiedParams {
  hostEmail: string
  hostName: string
  guestName: string
  oldBookingCode: string
  newBookingCode: string
  newBookingId: string
  car: { make: string; model: string; year: number }
  startDate: string | Date
  endDate: string | Date
  startTime?: string
  endTime?: string
  totalAmount: number | string
}

export async function sendHostModifiedEmail(params: HostModifiedParams): Promise<void> {
  const { hostEmail, hostName, guestName, oldBookingCode, newBookingCode, newBookingId, car, startDate, endDate, startTime, endTime, totalAmount } = params
  const firstName = hostName.split(' ')[0]
  const carName = `${car.year} ${car.make} ${car.model}`
  const viewUrl = `${baseUrl}/partner/bookings/${newBookingId}`
  const emailRef = generateEmailReference('BM')
  const subject = `Booking Updated — ${carName}`

  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background-color:#ea580c;padding:28px 24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">Booking Updated</h1>
          <p style="margin:6px 0 0 0;color:rgba(255,255,255,0.9);font-size:14px;">One of your bookings has been updated</p>
        </td></tr>

        <tr><td style="padding:28px 24px;">
          <p style="margin:0 0 16px 0;color:#111827;font-size:16px;">Hi ${firstName},</p>
          <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.5;">
            The booking for <strong>${guestName}</strong> on your <strong>${carName}</strong> has been updated. A new reservation has been created in its place — same guest, same car, same dates.
          </p>

          <div style="background:#f9fafb;padding:18px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 10px 0;color:#111827;font-size:16px;font-weight:600;">${carName}</p>
            <p style="margin:6px 0;color:#374151;font-size:14px;"><strong>Guest:</strong> ${guestName}</p>
            <p style="margin:6px 0;color:#374151;font-size:14px;"><strong>New Confirmation:</strong> ${newBookingCode}</p>
            <p style="margin:6px 0;color:#6b7280;font-size:13px;"><strong>Previous:</strong> <span style="text-decoration:line-through;">${oldBookingCode}</span></p>
            <p style="margin:6px 0;color:#374151;font-size:14px;"><strong>Pickup:</strong> ${formatDateDisplay(startDate)}${startTime ? ` at ${startTime}` : ''}</p>
            <p style="margin:6px 0;color:#374151;font-size:14px;"><strong>Return:</strong> ${formatDateDisplay(endDate)}${endTime ? ` at ${endTime}` : ''}</p>
            <p style="margin:10px 0 0 0;color:#111827;font-size:15px;"><strong>Total:</strong> ${formatCurrency(totalAmount)}</p>
          </div>

          <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 6px 0;color:#1e40af;font-size:14px;font-weight:600;">Next steps</p>
            <p style="margin:0;color:#1e40af;font-size:13px;line-height:1.5;">
              Send the rental agreement to the guest so they can sign and complete payment. The guest will pay again for the new reservation.
            </p>
          </div>

          <div style="text-align:center;margin:28px 0;">
            <a href="${viewUrl}" style="display:inline-block;background-color:#ea580c;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
              View Booking
            </a>
          </div>

          ${getEmailFooterHtml(emailRef)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
  `

  const text = `Hi ${firstName},

The booking for ${guestName} on your ${carName} has been updated. A new reservation has been created in its place.

Guest: ${guestName}
Previous: ${oldBookingCode}
New Confirmation: ${newBookingCode}
Pickup: ${formatDateDisplay(startDate)}${startTime ? ` at ${startTime}` : ''}
Return: ${formatDateDisplay(endDate)}${endTime ? ` at ${endTime}` : ''}
Total: ${formatCurrency(totalAmount)}

Next steps: Send the rental agreement to the guest so they can sign and complete payment.

View booking: ${viewUrl}

${getEmailFooterText(emailRef)}`

  try {
    const result = await sendEmail(hostEmail, subject, html, text, { requestId: emailRef })
    await logEmail({
      referenceId: emailRef,
      recipientEmail: hostEmail,
      recipientName: hostName,
      subject,
      emailType: 'SYSTEM',
      relatedType: 'booking',
      relatedId: newBookingId,
      messageId: result?.messageId,
      metadata: { type: 'booking_modified_host', oldBookingCode, newBookingCode },
    })
    console.log(`[Booking Modified Email] Sent to host ${hostEmail} — ${emailRef}`)
  } catch (err) {
    console.error('[Booking Modified Email] Host send failed:', err)
  }
}
