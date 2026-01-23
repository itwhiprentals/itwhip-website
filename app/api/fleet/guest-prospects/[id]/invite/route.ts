// app/api/fleet/guest-prospects/[id]/invite/route.ts
// Send or resend invite email to a guest prospect with credit incentive

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'

// POST /api/fleet/guest-prospects/[id]/invite - Send invite email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prospect = await prisma.guestProspect.findUnique({
      where: { id }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Guest prospect not found' },
        { status: 404 }
      )
    }

    // Check if already converted
    if (prospect.convertedProfileId) {
      return NextResponse.json(
        { error: 'This prospect has already created an account' },
        { status: 400 }
      )
    }

    // Generate new invite token (72 hours for guests)
    const inviteToken = nanoid(32)
    const inviteTokenExp = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours

    // Update prospect with new token
    const updatedProspect = await prisma.guestProspect.update({
      where: { id },
      data: {
        inviteToken,
        inviteTokenExp,
        inviteSentAt: new Date(),
        inviteResendCount: { increment: 1 },
        lastResendAt: new Date(),
        status: 'INVITED'
      }
    })

    // Log activity
    await prisma.guestProspectActivity.create({
      data: {
        prospectId: id,
        activityType: 'EMAIL_SENT',
        metadata: {
          resendCount: updatedProspect.inviteResendCount,
          tokenExpiry: inviteTokenExp.toISOString()
        }
      }
    })

    // Build the invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/guest-invite?token=${inviteToken}`

    // Get first name only
    const firstName = prospect.name.split(' ')[0]

    // Build email subject
    const creditDisplay = prospect.creditAmount > 0 ? `$${prospect.creditAmount.toFixed(0)}` : ''
    const subject = creditDisplay
      ? `${firstName}, You've Got ${creditDisplay} in Rental Credit!`
      : `${firstName}, You're Invited to ItWhip!`

    // Format credit type for display
    const creditTypeDisplay = prospect.creditType === 'bonus'
      ? 'Bonus Credit'
      : prospect.creditType === 'deposit'
        ? 'Deposit Credit'
        : 'Rental Credit'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">

        <!-- Header -->
        <div style="text-align: center; padding-bottom: 20px; margin-bottom: 24px; border-bottom: 1px solid #e5e7eb;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ea580c;">ItWhip</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">Car Rentals Made Simple</p>
        </div>

        <!-- Greeting -->
        <p style="font-size: 18px; margin: 0 0 16px 0; color: #1f2937;">
          Hi ${firstName}!
        </p>

        <p style="font-size: 16px; margin: 0 0 20px 0; color: #374151;">
          You've been invited to rent a car through ItWhip! ${prospect.creditAmount > 0 ? `As a welcome gift, we're giving you <strong>$${prospect.creditAmount.toFixed(0)} in ${creditTypeDisplay.toLowerCase()}</strong> toward your first rental.` : 'Create your account to browse our selection of vehicles.'}
        </p>

        ${prospect.creditAmount > 0 ? `
        <!-- Credit Card -->
        <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; color: white;">
          <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Your ${creditTypeDisplay}</p>
          <p style="margin: 0; font-size: 48px; font-weight: 700;">$${prospect.creditAmount.toFixed(0)}</p>
          ${prospect.creditNote ? `<p style="margin: 12px 0 0 0; font-size: 14px; opacity: 0.9;">"${prospect.creditNote}"</p>` : ''}
          ${prospect.creditExpirationDays ? `<p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">Expires ${prospect.creditExpirationDays} days after claim</p>` : ''}
        </div>
        ` : ''}

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #ea580c; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            ${prospect.creditAmount > 0 ? 'Claim Your Credit' : 'Get Started'}
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0 0 24px 0;">
          This link expires in 72 hours.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <!-- What Happens Next -->
        <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 15px; font-weight: 600;">
          What happens next:
        </p>
        <table style="width: 100%; font-size: 14px; color: #4b5563;">
          <tr>
            <td style="padding: 8px 0; vertical-align: top; width: 30px;">1.</td>
            <td style="padding: 8px 0;">Click the button above to create your account</td>
          </tr>
          ${prospect.creditAmount > 0 ? `
          <tr>
            <td style="padding: 8px 0; vertical-align: top;">2.</td>
            <td style="padding: 8px 0;">Complete a quick identity verification (takes 2 minutes)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; vertical-align: top;">3.</td>
            <td style="padding: 8px 0;">Your $${prospect.creditAmount.toFixed(0)} credit is unlocked and ready to use!</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; vertical-align: top;">4.</td>
            <td style="padding: 8px 0;">Browse cars and book your first rental</td>
          </tr>
          ` : `
          <tr>
            <td style="padding: 8px 0; vertical-align: top;">2.</td>
            <td style="padding: 8px 0;">Browse our selection of vehicles</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; vertical-align: top;">3.</td>
            <td style="padding: 8px 0;">Book your perfect car!</td>
          </tr>
          `}
        </table>

        ${prospect.creditAmount > 0 ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #92400e;">
            <strong>Note:</strong> Your credit will be locked until you complete identity verification. This keeps our community safe and usually takes just 2 minutes!
          </p>
        </div>
        ` : ''}

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <!-- Benefits -->
        <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
          Why rent with ItWhip?
        </p>
        <table style="width: 100%; font-size: 13px; color: #4b5563;">
          <tr>
            <td style="padding: 5px 0; width: 50%;">✓ Verified hosts & vehicles</td>
            <td style="padding: 5px 0; width: 50%;">✓ Flexible pickup locations</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Digital rental agreements</td>
            <td style="padding: 5px 0;">✓ 24/7 support</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Competitive daily rates</td>
            <td style="padding: 5px 0;">✓ No hidden fees</td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <p style="color: #6b7280; font-size: 13px; margin-bottom: 0; text-align: center;">
          Questions? Reply to this email or call <a href="tel:+13053999069" style="color: #ea580c; font-weight: 600;">(305) 399-9069</a>
        </p>

        <!-- Footer -->
        <p style="color: #9ca3af; font-size: 11px; margin-top: 16px; text-align: center;">
          ItWhip Rentals | Phoenix, AZ | <a href="https://itwhip.com" style="color: #ea580c;">itwhip.com</a>
        </p>

        <!-- Tracking pixel -->
        <img src="${baseUrl}/api/tracking/guest-pixel/${id}" width="1" height="1" style="display:none;width:1px;height:1px;border:0;" alt="" />
      </body>
      </html>
    `

    const text = `
Hi ${firstName}!

You've been invited to rent a car through ItWhip!${prospect.creditAmount > 0 ? ` As a welcome gift, we're giving you $${prospect.creditAmount.toFixed(0)} in ${creditTypeDisplay.toLowerCase()} toward your first rental.` : ''}

${prospect.creditAmount > 0 ? `YOUR ${creditTypeDisplay.toUpperCase()}: $${prospect.creditAmount.toFixed(0)}
${prospect.creditNote ? `"${prospect.creditNote}"` : ''}
${prospect.creditExpirationDays ? `Expires ${prospect.creditExpirationDays} days after claim` : ''}` : ''}

${prospect.creditAmount > 0 ? 'Claim Your Credit' : 'Get Started'}:
${inviteLink}

This link expires in 72 hours.

WHAT HAPPENS NEXT:
1. Click the link above to create your account
${prospect.creditAmount > 0 ? `2. Complete a quick identity verification (takes 2 minutes)
3. Your $${prospect.creditAmount.toFixed(0)} credit is unlocked and ready to use!
4. Browse cars and book your first rental` : `2. Browse our selection of vehicles
3. Book your perfect car!`}

${prospect.creditAmount > 0 ? `NOTE: Your credit will be locked until you complete identity verification. This keeps our community safe and usually takes just 2 minutes!` : ''}

WHY RENT WITH ITWHIP?
✓ Verified hosts & vehicles
✓ Flexible pickup locations
✓ Digital rental agreements
✓ 24/7 support
✓ Competitive daily rates
✓ No hidden fees

Questions? Reply to this email or call (305) 399-9069

ItWhip Rentals | Phoenix, AZ | itwhip.com
    `

    // Send the email
    console.log('[Guest Prospect Invite] Sending email to:', prospect.email)
    console.log('[Guest Prospect Invite] Invite link:', inviteLink)

    const emailResult = await sendEmail(
      prospect.email,
      subject,
      html,
      text,
      { requestId: `guest-prospect-invite-${id}` }
    )

    if (!emailResult.success) {
      console.error('[Guest Prospect Invite] Email failed:', emailResult.error)
      return NextResponse.json({
        success: true,
        emailSent: false,
        emailError: emailResult.error,
        prospect: updatedProspect,
        inviteLink,
        expiresAt: inviteTokenExp
      })
    }

    console.log('[Guest Prospect Invite] Email sent successfully:', emailResult.messageId)

    return NextResponse.json({
      success: true,
      emailSent: true,
      messageId: emailResult.messageId,
      prospect: updatedProspect,
      inviteLink,
      expiresAt: inviteTokenExp
    })

  } catch (error: any) {
    console.error('[Fleet Guest Prospect Invite] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    )
  }
}
