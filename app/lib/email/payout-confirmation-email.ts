// app/lib/email/payout-confirmation-email.ts
// Helper to send payout confirmation notification to hosts

import { sendEmail } from './sender'
import { getPayoutConfirmationTemplate } from './templates/payout-confirmation'
import { isEmailUnsubscribed } from './sanitize'

export async function sendPayoutConfirmationEmail(params: {
  hostName: string
  hostEmail: string
  payoutAmount: number
  grossEarnings: number
  platformFee: number
  processingFee: number
  bookingCount: number
  payoutMethod: string
  payoutId: string
  estimatedArrival: string
}): Promise<void> {
  try {
    const unsubscribed = await isEmailUnsubscribed(params.hostEmail)
    if (unsubscribed) {
      console.log(`[Payout Email] Skipping unsubscribed host: ${params.hostEmail}`)
      return
    }

    const template = getPayoutConfirmationTemplate({
      hostName: params.hostName,
      hostEmail: params.hostEmail,
      payoutAmount: params.payoutAmount.toFixed(2),
      grossEarnings: params.grossEarnings.toFixed(2),
      platformFee: params.platformFee.toFixed(2),
      processingFee: params.processingFee.toFixed(2),
      bookingCount: params.bookingCount,
      payoutMethod: params.payoutMethod,
      payoutId: params.payoutId,
      estimatedArrival: params.estimatedArrival,
    })

    await sendEmail(
      params.hostEmail,
      template.subject,
      template.text,
      template.html
    )

    console.log(`[Payout Email] Sent to ${params.hostEmail} for payout ${params.payoutId}`)
  } catch (error) {
    console.error(`[Payout Email] Failed for ${params.hostEmail}:`, error)
  }
}
