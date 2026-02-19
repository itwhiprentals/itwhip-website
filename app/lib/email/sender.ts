// app/lib/email/sender.ts

import { EmailResponse } from './types'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = process.env.EMAIL_FROM || 'ItWhip Rentals <info@itwhip.com>'
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'info@itwhip.com'

/**
 * Send an email via Resend
 *
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML email body
 * @param text - Plain text email body
 * @param opts - Optional parameters including requestId for logging
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
  opts?: {
    requestId?: string
    headers?: Record<string, string>
  }
): Promise<EmailResponse> {
  const requestId = opts?.requestId || `email-${crypto.randomUUID()}`

  if (!process.env.RESEND_API_KEY) {
    console.error(`[${requestId}] Email service not configured. Missing RESEND_API_KEY`)
    return {
      success: false,
      error: 'Email service not configured'
    }
  }

  try {
    console.log(`[${requestId}] Sending email via Resend to ${to}`)

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
      replyTo: EMAIL_REPLY_TO,
      headers: opts?.headers,
    })

    if (result.error) {
      console.error(`[${requestId}] Resend error:`, result.error)
      return {
        success: false,
        error: result.error.message || 'Failed to send email'
      }
    }

    console.log(`[${requestId}] Email sent successfully:`, { to, messageId: result.data?.id })

    return {
      success: true,
      messageId: result.data?.id
    }

  } catch (error: any) {
    console.error(`[${requestId}] Email send failed:`, {
      to,
      errorMessage: error.message || 'Unknown error',
    })

    return {
      success: false,
      error: error.message || 'Failed to send email'
    }
  }
}

/**
 * Test Resend connection by verifying the API key is set
 */
export async function testConnection(requestId?: string): Promise<boolean> {
  const reqId = requestId || 'test-connection'

  if (!process.env.RESEND_API_KEY) {
    console.error(`[${reqId}] Cannot test connection: RESEND_API_KEY not configured`)
    return false
  }

  try {
    const result = await resend.domains.list()
    if (result.error) {
      console.error(`[${reqId}] Resend connection test failed:`, result.error)
      return false
    }
    console.log(`[${reqId}] Resend connection verified successfully`)
    return true
  } catch (error: any) {
    console.error(`[${reqId}] Resend connection test failed:`, error.message)
    return false
  }
}
