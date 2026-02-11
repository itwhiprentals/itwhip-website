// app/lib/email/host-booking-cancelled-email.ts
// Helper to send host notification when a booking is cancelled

import { sendEmail } from './sender'
import { getHostBookingCancelledTemplate } from './templates/host-booking-cancelled'
import { isEmailUnsubscribed } from './sanitize'

export async function sendHostBookingCancelledEmail(params: {
  hostName: string
  hostEmail: string
  guestName: string
  bookingCode: string
  carMake: string
  carModel: string
  startDate: string
  endDate: string
  totalAmount: string
  cancellationReason?: string
  cancelledBy: 'guest' | 'fleet' | 'system'
}): Promise<void> {
  try {
    const unsubscribed = await isEmailUnsubscribed(params.hostEmail)
    if (unsubscribed) {
      console.log(`[Host Cancel Email] Skipping unsubscribed host: ${params.hostEmail}`)
      return
    }

    const template = getHostBookingCancelledTemplate({
      hostName: params.hostName,
      hostEmail: params.hostEmail,
      guestName: params.guestName,
      bookingCode: params.bookingCode,
      carMake: params.carMake,
      carModel: params.carModel,
      startDate: params.startDate,
      endDate: params.endDate,
      totalAmount: params.totalAmount,
      cancellationReason: params.cancellationReason,
      cancelledBy: params.cancelledBy,
    })

    await sendEmail(
      params.hostEmail,
      template.subject,
      template.text,
      template.html
    )

    console.log(`[Host Cancel Email] Sent to ${params.hostEmail} for booking ${params.bookingCode}`)
  } catch (error) {
    console.error(`[Host Cancel Email] Failed for ${params.hostEmail}:`, error)
  }
}
