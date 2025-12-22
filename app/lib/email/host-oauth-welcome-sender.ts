// app/lib/email/host-oauth-welcome-sender.ts

import { sendEmail } from './sender'
import { getHostOAuthWelcomeTemplate } from './templates/host-oauth-welcome'
import type { EmailResponse, HostOAuthWelcomeData } from './types'

/**
 * Sends a welcome email to new OAuth host signups with verification checklist
 * @param to - Recipient email address
 * @param data - Host welcome email data including URLs and user info
 * @returns EmailResponse with success status
 */
export async function sendHostOAuthWelcomeEmail(
  to: string,
  data: HostOAuthWelcomeData
): Promise<EmailResponse> {
  try {
    const template = getHostOAuthWelcomeTemplate(data)
    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending host OAuth welcome email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send host OAuth welcome email'
    }
  }
}
