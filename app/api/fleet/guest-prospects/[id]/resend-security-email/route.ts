// app/api/fleet/guest-prospects/[id]/resend-security-email/route.ts
// Resend the welcome/security email to a converted guest prospect

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import { getGuestWelcomeTemplate } from '@/app/lib/email/templates/guest-welcome'
import { logEmail, generateEmailReference } from '@/app/lib/email/config'
import crypto from 'crypto'

// POST /api/fleet/guest-prospects/[id]/resend-security-email
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the prospect
    const prospect = await prisma.guestProspect.findUnique({
      where: { id }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Guest prospect not found' },
        { status: 404 }
      )
    }

    // Must be converted to send security email
    if (!prospect.convertedProfileId) {
      return NextResponse.json(
        { error: 'This prospect has not converted yet. Send an invite instead.' },
        { status: 400 }
      )
    }

    // Get the converted profile and user
    const profile = await prisma.reviewerProfile.findUnique({
      where: { id: prospect.convertedProfileId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true
          }
        }
      }
    })

    if (!profile || !profile.user) {
      return NextResponse.json(
        { error: 'Converted profile not found' },
        { status: 404 }
      )
    }

    // Check if user already has a password set
    const hasPassword = profile.user.passwordHash && profile.user.passwordHash.length > 0
    if (hasPassword) {
      return NextResponse.json(
        { error: 'This guest has already set up their password' },
        { status: 400 }
      )
    }

    // Build the email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itwhip.com'

    // Generate a set-password token (similar to forgot-password flow)
    const setPasswordToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(setPasswordToken).digest('hex')

    // Save token to user (expires in 7 days)
    await prisma.user.update({
      where: { id: profile.user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        resetTokenUsed: false
      }
    })

    // Generate reference ID upfront so it can be included in the email
    const emailReferenceId = generateEmailReference('GS')

    const emailData = {
      guestName: profile.name || prospect.name,
      guestEmail: profile.user.email!,
      creditAmount: prospect.creditAmount > 0 ? prospect.creditAmount : undefined,
      creditType: prospect.creditType as 'credit' | 'bonus' | 'deposit' | undefined,
      setPasswordUrl: `${baseUrl}/auth/set-password?token=${setPasswordToken}`,
      dashboardUrl: `${baseUrl}/dashboard`,
      supportEmail: 'info@itwhip.com',
      referenceId: emailReferenceId
    }

    const { subject, html, text } = getGuestWelcomeTemplate(emailData)

    // Send the email
    console.log('[Resend Security Email] Sending to:', profile.user.email)

    const emailResult = await sendEmail(
      profile.user.email!,
      subject,
      html,
      text,
      {
        requestId: `guest-security-resend-${id}`
      }
    )

    if (!emailResult.success) {
      console.error('[Resend Security Email] Failed:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      )
    }

    // Log the email (using WELCOME type since GUEST_SECURITY_SETUP doesn't exist in schema)
    await logEmail({
      recipientEmail: profile.user.email!,
      recipientName: profile.name || prospect.name,
      subject,
      emailType: 'WELCOME',
      relatedType: 'guest_prospect',
      relatedId: id,
      messageId: emailResult.messageId,
      referenceId: emailReferenceId,
      metadata: {
        purpose: 'security_setup_resend',
        resend: true,
        prospectId: prospect.id,
        profileId: profile.id,
        userId: profile.user.id
      }
    })

    // Log activity on the prospect
    await prisma.guestProspectActivity.create({
      data: {
        prospectId: id,
        activityType: 'SECURITY_EMAIL_SENT',
        metadata: {
          email: profile.user.email,
          referenceId: emailReferenceId
        }
      }
    })

    console.log('[Resend Security Email] Sent successfully:', emailReferenceId)

    return NextResponse.json({
      success: true,
      message: 'Security setup email sent successfully',
      messageId: emailResult.messageId,
      referenceId: emailReferenceId
    })

  } catch (error: any) {
    console.error('[Resend Security Email] Error:', error)
    return NextResponse.json(
      { error: 'Failed to resend security email' },
      { status: 500 }
    )
  }
}
