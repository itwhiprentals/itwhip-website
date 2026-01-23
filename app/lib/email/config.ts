// app/lib/email/config.ts
// Central email configuration and utilities

import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'

// Use string literals for email types and statuses to avoid Prisma client caching issues
type EmailTypeString = 'GUEST_INVITE' | 'HOST_INVITE' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' |
  'BOOKING_CONFIRMATION' | 'BOOKING_REMINDER' | 'PAYMENT_RECEIPT' | 'REFUND_NOTIFICATION' |
  'IDENTITY_VERIFICATION' | 'WELCOME' | 'NEWSLETTER' | 'SUPPORT' | 'SYSTEM'

type EmailStatusString = 'QUEUED' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'FAILED'

/**
 * Central email configuration
 * All email templates should use these values for consistency
 */
export const emailConfig = {
  // Company info
  companyName: 'ItWhip Rentals',
  companyAddress: 'Phoenix, AZ',
  websiteUrl: 'https://itwhip.com',

  // Support
  supportEmail: 'support@itwhip.com',
  helpUrl: 'https://itwhip.com/help',

  // Verification & identity
  verificationHelpUrl: 'https://itwhip.com/help/verification',
  stripeIdentityUrl: 'https://itwhip.com/help/identity-verification',

  // Legal
  termsUrl: 'https://itwhip.com/terms',
  privacyUrl: 'https://itwhip.com/privacy',
  aboutUrl: 'https://itwhip.com/about',

  // Social media
  social: {
    instagram: 'https://www.instagram.com/itwhipofficial',
    facebook: 'https://www.facebook.com/people/Itwhipcom/61573990760395/',
    twitter: 'https://x.com/itwhipofficial',
    linkedin: 'https://www.linkedin.com/company/itwhip/'
  },

  // Browse
  howItWorksUrl: 'https://itwhip.com/how-it-works',
  browseCarsUrl: 'https://itwhip.com/cars'
}

/**
 * Generate a unique email reference ID
 * Format: REF-IW-XXXXXX (6 chars, uppercase alphanumeric)
 *
 * @param type - Optional type prefix for categorization
 * @returns Reference ID string
 */
export function generateEmailReference(type?: string): string {
  const randomPart = nanoid(6).toUpperCase()
  if (type) {
    return `REF-${type.toUpperCase().slice(0, 2)}-${randomPart}`
  }
  return `REF-IW-${randomPart}`
}

/**
 * Generate a verification token for magic link emails
 *
 * @returns Secure 32-character token
 */
export function generateVerificationToken(): string {
  return nanoid(32)
}

/**
 * Log an email to the EmailLog table
 * Call this after sending an email for audit trail
 */
export async function logEmail(params: {
  recipientEmail: string
  recipientName?: string
  subject: string
  emailType: EmailTypeString
  relatedType?: string
  relatedId?: string
  verificationToken?: string
  verificationExpHours?: number
  messageId?: string
  metadata?: Record<string, any>
  referenceId?: string // Optional pre-generated reference ID (for including in email body)
}): Promise<{ referenceId: string; emailLogId: string }> {
  const referenceId = params.referenceId || generateEmailReference(params.emailType.slice(0, 2))

  const emailLog = await prisma.emailLog.create({
    data: {
      referenceId,
      recipientEmail: params.recipientEmail.toLowerCase(),
      recipientName: params.recipientName,
      subject: params.subject,
      emailType: params.emailType,
      relatedType: params.relatedType,
      relatedId: params.relatedId,
      verificationToken: params.verificationToken,
      verificationExp: params.verificationExpHours
        ? new Date(Date.now() + params.verificationExpHours * 60 * 60 * 1000)
        : null,
      messageId: params.messageId,
      status: params.messageId ? 'SENT' : 'QUEUED',
      sentAt: params.messageId ? new Date() : null,
      metadata: params.metadata
    }
  })

  console.log(`[Email Log] Created: ${referenceId} | Type: ${params.emailType} | To: ${params.recipientEmail}`)

  return {
    referenceId,
    emailLogId: emailLog.id
  }
}

/**
 * Update email log status (for tracking opens, clicks, bounces)
 */
export async function updateEmailStatus(
  referenceId: string,
  status: EmailStatusString,
  additionalData?: {
    openedAt?: Date
    clickedAt?: Date
    bouncedAt?: Date
    bounceReason?: string
    deliveredAt?: Date
  }
): Promise<void> {
  await prisma.emailLog.update({
    where: { referenceId },
    data: {
      status,
      ...additionalData
    }
  })

  console.log(`[Email Log] Updated: ${referenceId} → ${status}`)
}

/**
 * Mark email as verified (for magic link verification)
 */
export async function markEmailVerified(verificationToken: string): Promise<{
  success: boolean
  emailLog?: {
    id: string
    recipientEmail: string
    relatedType: string | null
    relatedId: string | null
  }
  error?: string
}> {
  const emailLog = await prisma.emailLog.findUnique({
    where: { verificationToken },
    select: {
      id: true,
      recipientEmail: true,
      relatedType: true,
      relatedId: true,
      verificationExp: true,
      verifiedAt: true
    }
  })

  if (!emailLog) {
    return { success: false, error: 'Invalid verification link' }
  }

  if (emailLog.verifiedAt) {
    return { success: false, error: 'Email already verified' }
  }

  if (emailLog.verificationExp && emailLog.verificationExp < new Date()) {
    return { success: false, error: 'Verification link has expired' }
  }

  await prisma.emailLog.update({
    where: { verificationToken },
    data: {
      verifiedAt: new Date(),
      status: 'CLICKED'
    }
  })

  return {
    success: true,
    emailLog: {
      id: emailLog.id,
      recipientEmail: emailLog.recipientEmail,
      relatedType: emailLog.relatedType,
      relatedId: emailLog.relatedId
    }
  }
}

/**
 * Get email log by reference ID (for support lookups)
 */
export async function getEmailByReference(referenceId: string) {
  return prisma.emailLog.findUnique({
    where: { referenceId }
  })
}

/**
 * Search email logs (for fleet dashboard)
 */
export async function searchEmailLogs(params: {
  search?: string
  emailType?: EmailTypeString
  status?: EmailStatusString
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}) {
  const { search, emailType, status, startDate, endDate, page = 1, limit = 20 } = params
  const skip = (page - 1) * limit

  const where: any = {}

  if (search) {
    where.OR = [
      { recipientEmail: { contains: search, mode: 'insensitive' } },
      { referenceId: { contains: search, mode: 'insensitive' } },
      { recipientName: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (emailType) where.emailType = emailType
  if (status) where.status = status

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const [emails, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.emailLog.count({ where })
  ])

  return {
    emails,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/**
 * Standard email footer disclaimer
 */
export function getEmailDisclaimer(): string {
  return `Credits are distributed after account verification via <a href="${emailConfig.stripeIdentityUrl}" style="color: #ea580c;">Stripe Identity</a>. Terms and conditions are subject to change at any time.`
}

/**
 * Standard email footer (HTML)
 */
export function getEmailFooterHtml(referenceId: string): string {
  return `
    <p style="color: #9ca3af; font-size: 11px; margin-top: 8px; text-align: center;">
      ${emailConfig.companyName} | ${emailConfig.companyAddress} | <a href="${emailConfig.websiteUrl}" style="color: #ea580c;">itwhip.com</a>
      <br/>
      <a href="${emailConfig.aboutUrl}" style="color: #9ca3af;">About</a> |
      <a href="${emailConfig.termsUrl}" style="color: #9ca3af;">Terms</a> |
      <a href="${emailConfig.privacyUrl}" style="color: #9ca3af;">Privacy</a> |
      <a href="${emailConfig.helpUrl}" style="color: #9ca3af;">Help</a>
    </p>

    <p style="color: #9ca3af; font-size: 9px; margin-top: 12px; text-align: center; line-height: 1.4;">
      ${getEmailDisclaimer()}
    </p>

    <p style="color: #d1d5db; font-size: 8px; margin-top: 8px; text-align: center;">
      Reference: ${referenceId}
    </p>
  `
}

/**
 * Standard email footer (plain text)
 */
export function getEmailFooterText(referenceId: string): string {
  return `
${emailConfig.companyName} | ${emailConfig.companyAddress} | itwhip.com
About: ${emailConfig.aboutUrl} | Terms: ${emailConfig.termsUrl} | Privacy: ${emailConfig.privacyUrl}

Credits are distributed after account verification via Stripe Identity. Terms and conditions are subject to change at any time.

Reference: ${referenceId}
  `.trim()
}
