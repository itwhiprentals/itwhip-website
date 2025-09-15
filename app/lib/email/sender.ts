// app/lib/email/sender.ts

import { EmailResponse } from './types'
import { createTransport } from 'nodemailer'
import type { Transporter } from 'nodemailer'

/**
 * SMTP Configuration and Email Sending
 */

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.EMAIL_FROM || 'ItWhip Rentals <info@itwhip.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'info@itwhip.com'
}

let transporter: Transporter | null = null

/**
 * Get or create transporter
 */
function getTransporter(): Transporter {
  if (!transporter) {
    transporter = createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: false,
      auth: {
        user: SMTP_CONFIG.user,
        pass: SMTP_CONFIG.pass
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    })
  }
  return transporter
}

/**
 * Send an email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<EmailResponse> {
  
  if (!SMTP_CONFIG.user || !SMTP_CONFIG.pass) {
    console.error('Email service not configured. Set SMTP_USER and SMTP_PASS')
    return { 
      success: false, 
      error: 'Email service not configured' 
    }
  }

  try {
    const transport = getTransporter()
    
    const result = await transport.sendMail({
      from: SMTP_CONFIG.from,
      to: to,
      subject: subject,
      replyTo: SMTP_CONFIG.replyTo,
      html: html,
      text: text
    })
    
    console.log(`Email sent to ${to}: ${result.messageId}`)
    
    return { 
      success: true, 
      messageId: result.messageId 
    }
    
  } catch (error) {
    console.error('Error sending email:', error)
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email'
    }
  }
}

/**
 * Test SMTP connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const transport = getTransporter()
    await transport.verify()
    console.log('SMTP connection verified')
    return true
  } catch (error) {
    console.error('SMTP connection failed:', error)
    return false
  }
}