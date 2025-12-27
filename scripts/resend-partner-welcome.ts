#!/usr/bin/env npx tsx
// scripts/resend-partner-welcome.ts
// Resend the partner welcome email with a fresh password reset token
//
// Usage:
//   npx tsx scripts/resend-partner-welcome.ts <email>
//   npx tsx scripts/resend-partner-welcome.ts nickpattt86@gmail.com

// Load environment variables FIRST - must be before any other imports
import { config } from 'dotenv'
config({ path: '.env.local', override: true })
config({ path: '.env' })

import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { createTransport } from 'nodemailer'
import { getPartnerWelcomeTemplate } from '../app/lib/email/templates/partner-welcome'

const prisma = new PrismaClient()

// Create email sender directly to avoid module caching issues with env vars
async function sendEmailDirect(to: string, subject: string, html: string, text: string) {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpHost = process.env.SMTP_HOST || 'smtp.office365.com'
  const smtpPort = parseInt(process.env.SMTP_PORT || '587')

  console.log(`   SMTP Config: ${smtpHost}:${smtpPort}`)
  console.log(`   SMTP User: ${smtpUser ? smtpUser.substring(0, 3) + '***' : 'NOT SET'}`)
  console.log(`   SMTP Pass: ${smtpPass ? '***SET***' : 'NOT SET'}`)

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials not configured. Check SMTP_USER and SMTP_PASS in .env.local')
  }

  const transport = createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED !== 'false'
    }
  })

  const result = await transport.sendMail({
    from: process.env.EMAIL_FROM || 'ItWhip Rentals <info@itwhip.com>',
    to,
    subject,
    html,
    text,
    replyTo: process.env.EMAIL_REPLY_TO || 'info@itwhip.com'
  })

  return { success: true, messageId: result.messageId }
}

async function resendPartnerWelcome(email: string) {
  console.log(`\n🔍 Looking up partner with email: ${email}\n`)

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      resetToken: true,
      resetTokenExpiry: true
    }
  })

  if (!user) {
    console.error(`❌ No user found with email: ${email}`)
    process.exit(1)
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`)
  console.log(`   Has password: ${user.passwordHash ? 'Yes' : 'No'}`)
  console.log(`   Has reset token: ${user.resetToken ? 'Yes (expires: ' + user.resetTokenExpiry + ')' : 'No'}`)

  // Find the host record
  const host = await prisma.rentalHost.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      hostType: true,
      approvalStatus: true,
      active: true,
      partnerCompanyName: true,
      name: true,
      email: true,
      currentCommissionRate: true
    }
  })

  if (!host) {
    console.error(`❌ No host record found for user: ${email}`)
    process.exit(1)
  }

  console.log(`\n📋 Host Details:`)
  console.log(`   ID: ${host.id}`)
  console.log(`   Company: ${host.partnerCompanyName || 'N/A'}`)
  console.log(`   Type: ${host.hostType}`)
  console.log(`   Status: ${host.approvalStatus}`)
  console.log(`   Active: ${host.active}`)
  console.log(`   Commission Rate: ${host.currentCommissionRate ? (host.currentCommissionRate * 100) + '%' : 'N/A'}`)

  if (host.hostType !== 'FLEET_PARTNER') {
    console.error(`\n❌ This user is not a Fleet Partner (hostType: ${host.hostType})`)
    process.exit(1)
  }

  // Generate new password reset token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  console.log(`\n🔐 Generating new password reset token...`)
  console.log(`   Token expires: ${resetTokenExpiry.toISOString()}`)

  // Update user with new reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry,
      resetTokenUsed: false
    }
  })

  console.log(`✅ Reset token saved to database`)

  // Determine tier based on commission rate
  const rate = host.currentCommissionRate || 0.25
  let tier: 'Standard' | 'Gold' | 'Platinum' | 'Diamond' = 'Standard'
  if (rate <= 0.10) tier = 'Diamond'
  else if (rate <= 0.15) tier = 'Platinum'
  else if (rate <= 0.20) tier = 'Gold'

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'
  const resetPasswordUrl = `${baseUrl}/partner/reset-password?token=${resetToken}`

  console.log(`\n📧 Preparing welcome email...`)
  console.log(`   Reset URL: ${resetPasswordUrl}`)

  // Generate email template
  const emailTemplate = getPartnerWelcomeTemplate({
    companyName: host.partnerCompanyName || host.name || 'Partner',
    contactName: host.name || user.name || 'Partner',
    contactEmail: email,
    resetPasswordUrl,
    resetTokenExpiresIn: '24 hours',
    commissionRate: Math.round(rate * 100),
    tier,
    dashboardUrl: `${baseUrl}/partner/dashboard`,
    fleetSize: 'N/A',
    supportEmail: 'info@itwhip.com'
  })

  // Send email
  console.log(`\n📤 Sending welcome email to: ${email}`)

  try {
    const result = await sendEmailDirect(
      email,
      emailTemplate.subject,
      emailTemplate.html,
      emailTemplate.text
    )

    console.log(`\n✅ Welcome email sent successfully!`)
    console.log(`   Message ID: ${result.messageId}`)
    console.log(`\n📋 Next Steps for Partner:`)
    console.log(`   1. Check email inbox (and spam folder)`)
    console.log(`   2. Click "Create Password" button in email`)
    console.log(`   3. Set a new password`)
    console.log(`   4. Log in at ${baseUrl}/partner/login`)
  } catch (error: any) {
    console.error(`\n❌ Failed to send email: ${error.message}`)
    process.exit(1)
  }
}

// Main execution
const email = process.argv[2]

if (!email) {
  console.log(`
Usage: npx tsx scripts/resend-partner-welcome.ts <email>

Example:
  npx tsx scripts/resend-partner-welcome.ts nickpattt86@gmail.com

This script will:
  1. Look up the partner by email
  2. Generate a new password reset token (valid for 24 hours)
  3. Send the welcome email with the password reset link
`)
  process.exit(1)
}

resendPartnerWelcome(email)
  .then(() => {
    prisma.$disconnect()
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    prisma.$disconnect()
    process.exit(1)
  })
