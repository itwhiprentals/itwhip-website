// app/api/account/link/request/route.ts
// POST /api/account/link/request - Initiate account linking by sending verification code

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'

export async function POST(request: NextRequest) {
  const user = await verifyRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { targetEmail } = await request.json()

  // Validate targetEmail
  if (!targetEmail || typeof targetEmail !== 'string') {
    return NextResponse.json(
      { error: 'Target email is required' },
      { status: 400 }
    )
  }

  // Cannot link to yourself
  if (targetEmail === user.email) {
    return NextResponse.json(
      { error: 'Cannot link account to itself' },
      { status: 400 }
    )
  }

  // Find target user by email
  const targetUser = await prisma.user.findUnique({
    where: { email: targetEmail },
    select: { id: true, email: true, legacyDualId: true }
  })

  if (!targetUser) {
    return NextResponse.json(
      { error: 'No account found with that email' },
      { status: 404 }
    )
  }

  // Check if already linked
  if (user.legacyDualId && targetUser.legacyDualId === user.legacyDualId) {
    return NextResponse.json(
      { error: 'Accounts are already linked' },
      { status: 400 }
    )
  }

  // Check if either user already has a different link
  if (user.legacyDualId) {
    return NextResponse.json(
      { error: 'Your account is already linked to another account. Unlink first to link to a different account.' },
      { status: 400 }
    )
  }

  if (targetUser.legacyDualId) {
    return NextResponse.json(
      { error: 'Target account is already linked to another account.' },
      { status: 400 }
    )
  }

  // Check for existing pending request
  const existingRequest = await prisma.accountLinkRequest.findFirst({
    where: {
      initiatingUserId: user.id,
      targetEmail: targetEmail,
      status: 'PENDING'
    }
  })

  if (existingRequest) {
    // Check if code is still valid
    if (new Date() < existingRequest.codeExpiresAt) {
      return NextResponse.json(
        {
          error: 'A pending link request already exists. Please wait for it to expire or complete it.',
          requestId: existingRequest.id
        },
        { status: 400 }
      )
    } else {
      // Expire the old request
      await prisma.accountLinkRequest.update({
        where: { id: existingRequest.id },
        data: { status: 'EXPIRED' }
      })
    }
  }

  // Generate verification code (8 characters, uppercase) and link token (32 chars)
  const verificationCode = nanoid(8).toUpperCase()
  const guestLinkToken = nanoid(32)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  // Create link request with guest link token
  const linkRequest = await prisma.accountLinkRequest.create({
    data: {
      id: crypto.randomUUID(),
      initiatingUserId: user.id,
      targetEmail: targetEmail,
      verificationCode: verificationCode,
      guestLinkToken: guestLinkToken,
      codeExpiresAt: expiresAt,
      status: 'PENDING'
    }
  })

  // Build confirmation link for email
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const confirmLink = `${baseUrl}/auth/confirm-link?token=${guestLinkToken}&type=guest`

  // Send verification code via email
  try {
    const htmlContent = generateAccountLinkEmail(targetEmail, verificationCode, confirmLink, user.email || 'Host Account')
    const textContent = `
Account Linking Request

A host account (${user.email}) is requesting to link with your guest account.

OPTION 1 - Click this link to confirm:
${confirmLink}

OPTION 2 - Share this code with the host account owner:
${verificationCode}

This request will expire in 5 minutes.

If you don't recognize this request, please ignore this email. Your account is secure.
Only share the code if you trust the person requesting the link.

- ItWhip Team
    `.trim()

    const emailResult = await sendEmail(
      targetEmail,
      'ItWhip Account Linking - Verification Code',
      htmlContent,
      textContent,
      { requestId: linkRequest.id }
    )

    if (!emailResult.success) {
      console.error('[Account Link] Email send failed:', emailResult.error)
      // Mark request as expired since email failed
      await prisma.accountLinkRequest.update({
        where: { id: linkRequest.id },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    console.log(`[Account Link] Verification email sent to: ${targetEmail}`)
  } catch (emailError) {
    console.error('[Account Link] Email error:', emailError)
    // Mark request as expired since email failed
    await prisma.accountLinkRequest.update({
      where: { id: linkRequest.id },
      data: { status: 'EXPIRED' }
    })
    return NextResponse.json(
      { error: 'Failed to send verification email. Please try again.' },
      { status: 500 }
    )
  }

  // Return success response
  const responseData: any = {
    success: true,
    requestId: linkRequest.id,
    message: 'Verification code sent to target email'
  }

  // In development, also return the code for testing
  if (process.env.NODE_ENV === 'development') {
    responseData.devCode = verificationCode
  }

  return NextResponse.json(responseData)
}

// Email template for account linking verification
function generateAccountLinkEmail(targetEmail: string, code: string, confirmLink: string, hostEmail: string): string {
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
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Account Linking Request</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Link Your Accounts</h2>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px; text-align: center;">
                      The host account <strong>${hostEmail}</strong> is requesting to link with your guest account.
                    </p>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 20px; text-align: center;">
                      Choose one of the options below to complete the linking:
                    </p>

                    <!-- Option 1: Click Link -->
                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
                      <p style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 600;">Option 1: Click to Confirm</p>
                      <p style="margin: 0 0 16px; color: #3b82f6; font-size: 13px;">If this is your account, click the button below to confirm the link:</p>
                      <div style="text-align: center;">
                        <a href="${confirmLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Confirm Account Link</a>
                      </div>
                    </div>

                    <!-- Option 2: Share Code -->
                    <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="margin: 0 0 12px; color: #374151; font-size: 14px; font-weight: 600;">Option 2: Share Code with Host</p>
                      <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px;">If you're on a different device, share this code with the host account owner:</p>
                      <p style="margin: 0; color: #1f2937; font-size: 32px; font-weight: 700; letter-spacing: 6px; font-family: monospace; text-align: center;">${code}</p>
                    </div>

                    <p style="margin: 0 0 24px; color: #dc2626; font-size: 13px; line-height: 20px; text-align: center; font-weight: 500;">
                      ⏰ This request expires in <strong>5 minutes</strong>
                    </p>

                    <!-- Warning -->
                    <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">⚠️ Security Notice</p>
                      <p style="margin: 0; color: #92400e; font-size: 13px;">
                        Only confirm or share the code if you trust the person requesting the link. If you didn't expect this request, ignore this email.
                      </p>
                    </div>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                      Need help? Contact us at
                      <a href="mailto:info@itwhip.com" style="color: #3b82f6; text-decoration: none;">info@itwhip.com</a>
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
                      © 2025 ItWhip. All rights reserved.
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
