// app/lib/email/refund-confirmation-email.ts
// Helper to send refund confirmation notification emails

import { sendEmail } from './sender'
import { getRefundConfirmationTemplate } from './templates/refund-confirmation'
import { isEmailUnsubscribed } from './sanitize'

export async function sendRefundConfirmationEmail(params: {
  guestEmail: string
  guestName: string
  bookingCode: string
  carMake: string
  carModel: string
  refundAmount: number
  originalTotal: number
  refundReason: string
  refundType: 'full' | 'partial'
  tripDates: string // e.g. "Jan 5 - Jan 10, 2026"
}): Promise<void> {
  try {
    const unsubscribed = await isEmailUnsubscribed(params.guestEmail)
    if (unsubscribed) {
      console.log(`[Refund Email] Skipping unsubscribed guest: ${params.guestEmail}`)
      return
    }

    const template = getRefundConfirmationTemplate({
      to: params.guestEmail,
      guestName: params.guestName,
      bookingCode: params.bookingCode,
      carMake: params.carMake,
      carModel: params.carModel,
      refundAmount: params.refundAmount.toFixed(2),
      originalTotal: params.originalTotal.toFixed(2),
      refundReason: params.refundReason,
      refundType: params.refundType,
      tripDates: params.tripDates,
    })

    await sendEmail(
      params.guestEmail,
      template.subject,
      template.html,
      template.text,
      { requestId: `refund-${params.bookingCode}` }
    )

    console.log(`[Refund Email] Sent refund confirmation to ${params.guestEmail} for ${params.bookingCode}`)
  } catch (error) {
    console.error(`[Refund Email] Failed to send for ${params.bookingCode}:`, error)
  }
}
