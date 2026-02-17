// app/api/account/link/confirm-guest/route.ts
// POST /api/account/link/confirm-guest - Guest clicks email link to confirm linking

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'

export async function POST(request: NextRequest) {
  // Get token from request body
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  // Find link request by guest token
  const linkRequest = await prisma.accountLinkRequest.findUnique({
    where: { guestLinkToken: token }
  })

  if (!linkRequest) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
  }

  // Check status - must be PENDING
  if (linkRequest.status !== 'PENDING') {
    if (linkRequest.status === 'COMPLETED') {
      return NextResponse.json({
        error: 'Accounts are already linked',
        alreadyLinked: true
      }, { status: 400 })
    }
    if (linkRequest.status === 'GUEST_CONFIRMED') {
      return NextResponse.json({
        error: 'You have already confirmed. Waiting for host to confirm.',
        waitingForHost: true
      }, { status: 400 })
    }
    return NextResponse.json({
      error: `This link request is ${linkRequest.status.toLowerCase()}`
    }, { status: 400 })
  }

  // Check expiration
  if (new Date() > linkRequest.codeExpiresAt) {
    await prisma.accountLinkRequest.update({
      where: { id: linkRequest.id },
      data: { status: 'EXPIRED' }
    })
    return NextResponse.json({ error: 'This link has expired. Please request a new link.' }, { status: 400 })
  }

  // Verify the logged-in user is the target (guest)
  const user = await verifyRequest(request)
  if (!user) {
    return NextResponse.json({
      error: 'Please log in to your guest account first',
      requiresAuth: true
    }, { status: 401 })
  }

  // Check if logged-in user's email matches target email
  if (user.email?.toLowerCase() !== linkRequest.targetEmail.toLowerCase()) {
    return NextResponse.json({
      error: 'This link is for a different account. Please log in with the correct account.',
      wrongAccount: true,
      expectedEmail: linkRequest.targetEmail
    }, { status: 403 })
  }

  // Check if user is already linked
  if (user.legacyDualId) {
    return NextResponse.json({
      error: 'Your account is already linked to another account',
      alreadyLinked: true
    }, { status: 400 })
  }

  // Get initiating user (host) info
  const initiatingUser = await prisma.user.findUnique({
    where: { id: linkRequest.initiatingUserId },
    select: { id: true, email: true, name: true, legacyDualId: true }
  })

  if (!initiatingUser) {
    return NextResponse.json({ error: 'Host account not found' }, { status: 404 })
  }

  if (initiatingUser.legacyDualId) {
    return NextResponse.json({
      error: 'The host account has already been linked to another account',
      alreadyLinked: true
    }, { status: 400 })
  }

  // Generate host link token and reset expiry
  const hostLinkToken = nanoid(32)
  const newExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 more minutes

  // Update request to GUEST_CONFIRMED
  await prisma.accountLinkRequest.update({
    where: { id: linkRequest.id },
    data: {
      status: 'GUEST_CONFIRMED',
      hostLinkToken: hostLinkToken,
      codeExpiresAt: newExpiry,
      guestConfirmedAt: new Date()
    }
  })

  console.log(`[Account Link] Guest confirmed: ${user.email}`)
  console.log(`   Waiting for host: ${initiatingUser.email}`)

  // Send email to host with their confirmation link
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const hostConfirmLink = `${baseUrl}/auth/confirm-link?token=${hostLinkToken}&type=host`

    const htmlContent = generateHostConfirmEmail(
      initiatingUser.email || 'Host',
      user.email || 'Guest',
      hostConfirmLink
    )
    const textContent = `
Account Linking - Host Confirmation Required

The guest account (${user.email}) has confirmed the linking request.

To complete the account linking, click this link or enter the code on your host settings page:

${hostConfirmLink}

Or enter this code: ${linkRequest.verificationCode}

This link expires in 5 minutes.

If you didn't request this, please ignore this email.

- ItWhip Team
    `.trim()

    await sendEmail(
      initiatingUser.email!,
      'ItWhip - Complete Your Account Linking',
      htmlContent,
      textContent
    )
    console.log(`[Account Link] Host confirmation email sent to: ${initiatingUser.email}`)
  } catch (emailError) {
    console.error('[Account Link] Failed to send host email:', emailError)
    // Don't fail - guest confirmation was successful
  }

  return NextResponse.json({
    success: true,
    message: 'Your confirmation has been recorded. The host account has been notified to complete the linking.',
    hostEmail: initiatingUser.email,
    waitingForHost: true
  })
}

// Generate host confirmation email template
function generateHostConfirmEmail(hostEmail: string, guestEmail: string, confirmLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Complete Account Linking</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Guest Has Confirmed!</h2>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px; text-align: center;">
                      The guest account <strong>${guestEmail}</strong> has confirmed the account linking request.
                    </p>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 20px; text-align: center;">
                      Click the button below to complete the linking:
                    </p>

                    <div style="text-align: center; margin-bottom: 24px;">
                      <a href="${confirmLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete Account Link</a>
                    </div>

                    <p style="margin: 0 0 24px; color: #dc2626; font-size: 13px; line-height: 20px; text-align: center; font-weight: 500;">
                      ⏰ This link expires in <strong>5 minutes</strong>
                    </p>

                    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #374151; font-size: 14px; text-align: center;">
                        <strong>Alternative:</strong> You can also enter the code on your account linking page to complete the process.
                      </p>
                    </div>

                    <!-- Warning -->
                    <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        If you didn't request this account linking, please ignore this email.
                      </p>
                    </div>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                      Need help? Contact us at
                      <a href="mailto:info@itwhip.com" style="color: #8b5cf6; text-decoration: none;">info@itwhip.com</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      ItWhip Technologies, Inc.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © 2026 ItWhip. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}
