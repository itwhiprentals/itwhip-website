// app/lib/email/deposit-release-email.ts
// Helper to send deposit release notification emails

import { sendEmail } from './sender'
import { getDepositReleasedTemplate } from './templates/deposit-released'
import { isEmailUnsubscribed } from './sanitize'

export async function sendDepositReleasedEmail(params: {
  guestEmail: string
  guestName: string
  bookingCode: string
  carMake: string
  carModel: string
  depositAmount: number
  cardRefundAmount: number
  walletReturnAmount: number
  tripEndDate: Date
}): Promise<void> {
  try {
    // Check unsubscribe status
    const unsubscribed = await isEmailUnsubscribed(params.guestEmail)
    if (unsubscribed) {
      console.log(`[Deposit Email] Skipping unsubscribed guest: ${params.guestEmail}`)
      return
    }

    const tripEndFormatted = params.tripEndDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    const template = getDepositReleasedTemplate({
      to: params.guestEmail,
      guestName: params.guestName,
      bookingCode: params.bookingCode,
      carMake: params.carMake,
      carModel: params.carModel,
      depositAmount: params.depositAmount.toFixed(2),
      cardRefundAmount: params.cardRefundAmount.toFixed(2),
      walletReturnAmount: params.walletReturnAmount.toFixed(2),
      tripEndDate: tripEndFormatted,
    })

    await sendEmail(
      params.guestEmail,
      template.subject,
      template.html,
      template.text,
      { requestId: `deposit-release-${params.bookingCode}` }
    )

    console.log(`[Deposit Email] Sent deposit release email to ${params.guestEmail} for ${params.bookingCode}`)
  } catch (error) {
    // Non-blocking: deposit release succeeded, email is secondary
    console.error(`[Deposit Email] Failed to send for ${params.bookingCode}:`, error)
  }
}
