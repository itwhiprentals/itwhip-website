// app/lib/email/oauth-welcome-sender.ts
// Direct export - bypasses webpack barrel caching issue with index.ts

import { sendEmail } from './sender'
import { getOAuthWelcomeTemplate } from './templates/oauth-welcome'
import type { EmailResponse, OAuthWelcomeData } from './types'

export type { OAuthWelcomeData }

/**
 * Send OAuth welcome email after user completes profile with phone number
 * Used when a new guest signs up via Google/Apple OAuth
 */
export async function sendOAuthWelcomeEmail(
  to: string,
  data: OAuthWelcomeData
): Promise<EmailResponse> {
  try {
    const template = getOAuthWelcomeTemplate(data)
    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending OAuth welcome email:', error)
    return { success: false, error: 'Failed to send OAuth welcome email' }
  }
}
