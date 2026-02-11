// app/lib/email/sender.ts

import { EmailResponse } from './types'
import { createTransport } from 'nodemailer'
import type { Transporter } from 'nodemailer'

/**
 * SMTP Configuration and Email Sending
 * 
 * Environment Variables Required:
 * - SMTP_HOST: SMTP server hostname (default: smtp.office365.com)
 * - SMTP_PORT: SMTP port (default: 587)
 * - SMTP_USER: SMTP username
 * - SMTP_PASS: SMTP password
 * - EMAIL_FROM: From address (default: ItWhip Rentals <info@itwhip.com>)
 * - EMAIL_REPLY_TO: Reply-to address (default: info@itwhip.com)
 * 
 * Optional:
 * - SMTP_INSECURE_TLS: Set to 'true' to disable TLS certificate validation (not recommended)
 * - SMTP_REQUIRE_TLS: Set to 'true' to require TLS (some providers need this)
 */

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.EMAIL_FROM || 'ItWhip Rentals <info@itwhip.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'info@itwhip.com',
  insecureTls: process.env.EMAIL_REJECT_UNAUTHORIZED === 'false',
  requireTls: process.env.EMAIL_REQUIRE_TLS === 'true',
  secure: process.env.EMAIL_SECURE === 'true'
}

let transporter: Transporter | null = null

/**
 * Log SMTP configuration (safe - no secrets, only booleans and host/port)
 */
function logSmtpConfig(requestId?: string): void {
  const prefix = requestId ? `[${requestId}]` : '[SMTP]'
  console.log(`${prefix} SMTP Config Check:`, {
    hasHost: !!SMTP_CONFIG.host,
    hasPort: !!SMTP_CONFIG.port,
    hasUser: !!SMTP_CONFIG.user,
    hasPass: !!SMTP_CONFIG.pass,
    hasFrom: !!SMTP_CONFIG.from,
    hasReplyTo: !!SMTP_CONFIG.replyTo,
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    insecureTls: SMTP_CONFIG.insecureTls,
    requireTls: SMTP_CONFIG.requireTls
  })
}

/**
 * Get or create transporter with secure TLS settings
 */
function getTransporter(): Transporter {
  if (!transporter) {
    const port = SMTP_CONFIG.port
    const isSecurePort = port === 465
    
    // Build TLS config
    const tlsConfig: any = {
      rejectUnauthorized: !SMTP_CONFIG.insecureTls
    }
    
    // Only add requireTLS if explicitly requested or for known providers
    if (SMTP_CONFIG.requireTls) {
      tlsConfig.requireTLS = true
    }
    
    // Office365 often works with STARTTLS negotiation, but allow override
    const transportConfig: any = {
      host: SMTP_CONFIG.host,
      port: port,
      secure: isSecurePort, // true for 465, false for 587/25
      auth: {
        user: SMTP_CONFIG.user,
        pass: SMTP_CONFIG.pass
      },
      tls: tlsConfig
    }
    
    transporter = createTransport(transportConfig)
    
    console.log('[SMTP] Transport created:', {
      host: SMTP_CONFIG.host,
      port: port,
      secure: isSecurePort,
      rejectUnauthorized: tlsConfig.rejectUnauthorized,
      requireTLS: tlsConfig.requireTLS || false
    })
  }
  return transporter
}

/**
 * Send an email
 *
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML email body
 * @param text - Plain text email body
 * @param opts - Optional parameters including requestId for logging, custom headers
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
  const requestId = opts?.requestId || 'no-request-id'
  
  // Log configuration check (safe - no secrets)
  logSmtpConfig(requestId)
  
  // Validate configuration (inside function, not at module load)
  if (!SMTP_CONFIG.user || !SMTP_CONFIG.pass) {
    console.error(`[${requestId}] Email service not configured. Missing SMTP_USER or SMTP_PASS`)
    return { 
      success: false, 
      error: 'Email service not configured' 
    }
  }
  
  if (!SMTP_CONFIG.host) {
    console.error(`[${requestId}] Email service not configured. Missing SMTP_HOST`)
    return { 
      success: false, 
      error: 'Email service not configured' 
    }
  }

  const transport = getTransporter()

  const mailOptions: any = {
    from: SMTP_CONFIG.from,
    to: to,
    subject: subject,
    replyTo: SMTP_CONFIG.replyTo,
    html: html,
    text: text
  }

  // Only add headers if explicitly provided
  if (opts?.headers && Object.keys(opts.headers).length > 0) {
    mailOptions.headers = opts.headers
  }

  // Retry with exponential backoff (3 attempts: 0ms, 1s, 4s)
  const MAX_RETRIES = 3
  let lastError: any = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[${requestId}] Sending email to ${to} (attempt ${attempt}/${MAX_RETRIES})`)

      const result = await transport.sendMail(mailOptions)

      console.log(`[${requestId}] Email sent successfully:`, {
        to: to,
        messageId: result.messageId,
        response: result.response || 'no response',
        accepted: result.accepted,
        rejected: result.rejected,
        attempt
      })

      return {
        success: true,
        messageId: result.messageId
      }

    } catch (error: any) {
      lastError = error

      const errorDetails: any = {
        to: to,
        attempt,
        errorMessage: error.message || 'Unknown error',
        code: error.code || 'no-code',
        command: error.command || 'no-command',
        responseCode: error.responseCode || 'no-response-code'
      }

      if (error.response) {
        errorDetails.response = error.response.substring(0, 200)
      }

      // Don't retry on permanent failures (invalid recipient, auth errors)
      const permanentCodes = ['EENVELOPE', 'EAUTH', 'EMESSAGE']
      const permanentResponseCodes = [550, 551, 552, 553, 554]
      if (permanentCodes.includes(error.code) || permanentResponseCodes.includes(error.responseCode)) {
        console.error(`[${requestId}] Email send permanently failed (no retry):`, errorDetails)
        break
      }

      if (attempt < MAX_RETRIES) {
        const delayMs = Math.pow(2, attempt - 1) * 1000 // 1s, 2s
        console.warn(`[${requestId}] Email send failed (retrying in ${delayMs}ms):`, errorDetails)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        // Reset transporter on connection errors to get fresh connection
        if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
          transporter = null
        }
      } else {
        console.error(`[${requestId}] Email send failed after ${MAX_RETRIES} attempts:`, errorDetails)
      }
    }
  }

  return {
    success: false,
    error: lastError instanceof Error ? lastError.message : 'Failed to send email after retries'
  }
}

/**
 * Test SMTP connection
 * 
 * @param requestId - Optional request ID for logging
 */
export async function testConnection(requestId?: string): Promise<boolean> {
  const reqId = requestId || 'test-connection'
  
  try {
    logSmtpConfig(reqId)
    
    if (!SMTP_CONFIG.user || !SMTP_CONFIG.pass) {
      console.error(`[${reqId}] Cannot test connection: SMTP credentials not configured`)
      return false
    }
    
    const transport = getTransporter()
    await transport.verify()
    console.log(`[${reqId}] SMTP connection verified successfully`)
    return true
  } catch (error: any) {
    const errorDetails: any = {
      errorMessage: error.message || 'Unknown error',
      code: error.code || 'no-code',
      command: error.command || 'no-command',
      responseCode: error.responseCode || 'no-response-code'
    }
    
    if (error.response) {
      errorDetails.response = error.response.substring(0, 200)
    }
    
    console.error(`[${reqId}] SMTP connection verification failed:`, errorDetails)
    return false
  }
}