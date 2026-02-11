// app/lib/email/dispute-notification-email.ts
// Send dispute notification to admin when a guest files a dispute

import { sendEmail } from './sender'
import { getDisputeNotificationAdminTemplate } from './templates/dispute-notification-admin'

export async function sendDisputeNotificationEmail(params: {
  bookingCode: string
  guestName: string
  guestEmail: string
  hostName: string
  disputeType: string
  description: string
  disputeId: string
}): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'info@itwhip.com'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'

    const priority = params.disputeType === 'SAFETY' ? 'high'
      : params.disputeType === 'DAMAGE' ? 'high'
      : 'medium'

    const template = getDisputeNotificationAdminTemplate({
      bookingCode: params.bookingCode,
      guestName: params.guestName,
      guestEmail: params.guestEmail,
      hostName: params.hostName,
      disputeType: params.disputeType,
      description: params.description,
      priority,
      disputeId: params.disputeId,
      actionUrl: `${baseUrl}/admin/disputes/${params.disputeId}`,
    })

    await sendEmail(
      adminEmail,
      template.subject,
      template.html,
      template.text
    )

    console.log(`[Dispute Email] Sent admin notification for booking ${params.bookingCode}`)
  } catch (error) {
    console.error(`[Dispute Email] Failed to send:`, error)
  }
}
