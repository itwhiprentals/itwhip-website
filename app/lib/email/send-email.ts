// app/lib/email/send-email.ts
// Wrapper for object-style sendEmail calls

import { sendEmail as sendEmailRaw } from './sender'
import { EmailResponse } from './types'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email using object-style parameters
 * This is a wrapper around the raw sendEmail function for convenience
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
  const { to, subject, html, text = '' } = options
  return sendEmailRaw(to, subject, html, text)
}

export default sendEmail
