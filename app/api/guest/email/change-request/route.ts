// app/api/guest/email/change-request/route.ts
// Request to change email - sends verification to the NEW email address
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT } from 'jose'

// Helper to get user ID from JWT
async function getUserFromToken(req: NextRequest): Promise<{ userId: string; email: string } | null> {
  try {
    // Check for user ID in headers (set by middleware)
    const userId = req.headers.get('x-user-id')
    const email = req.headers.get('x-user-email')
    if (userId && email) return { userId, email }

    // Fallback: decode JWT from cookie
    const token = req.cookies.get('accessToken')?.value
    if (!token) return null

    const { jwtVerify } = await import('jose')
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')
    const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key')

    // Try both secrets
    for (const secret of [JWT_SECRET, GUEST_JWT_SECRET]) {
      try {
        const { payload } = await jwtVerify(token, secret)
        return {
          userId: payload.userId as string,
          email: payload.email as string
        }
      } catch {
        continue
      }
    }

    return null
  } catch (error) {
    console.error('[Email Change Request] Token verification failed:', error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getUserFromToken(req)

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const { newEmail } = await req.json()

    // Validation
    if (!newEmail) {
      return NextResponse.json(
        { error: 'New email is required' },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = newEmail.toLowerCase().trim()

    // Check if it's the same as current email
    if (normalizedEmail === auth.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email is the same as your current email' },
        { status: 400 }
      )
    }

    // Check if email is already in use by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser && existingUser.id !== auth.userId) {
      return NextResponse.json(
        { error: 'This email is already associated with another account' },
        { status: 400 }
      )
    }

    // Get current user info
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate verification token (JWT with email change data)
    const EMAIL_CHANGE_SECRET = new TextEncoder().encode(
      process.env.EMAIL_CHANGE_SECRET || process.env.JWT_SECRET || 'email-change-secret'
    )

    const verificationToken = await new SignJWT({
      userId: auth.userId,
      oldEmail: auth.email,
      newEmail: normalizedEmail,
      type: 'email_change'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Token valid for 24 hours
      .sign(EMAIL_CHANGE_SECRET)

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'
    const verificationUrl = `${baseUrl}/api/guest/email/verify?token=${verificationToken}`

    // Send verification email to the NEW email address
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      const htmlContent = generateEmailChangeVerificationEmail(
        user.name || 'User',
        user.email!,
        normalizedEmail,
        verificationUrl
      )

      const textContent = `
Verify Your New Email Address

Hi ${user.name || 'User'},

You've requested to change your ItWhip account email from ${user.email} to ${normalizedEmail}.

Click the link below to verify your new email address:
${verificationUrl}

This link expires in 24 hours.

If you didn't request this change, you can safely ignore this email. Your current email will remain unchanged.

- ItWhip Security Team
      `.trim()

      await sendEmail(
        normalizedEmail, // Send to NEW email address
        'Verify Your New Email Address - ItWhip',
        htmlContent,
        textContent
      )

      console.log(`[Email Change Request] Verification email sent to: ${normalizedEmail}`)
    } catch (emailError) {
      console.error('[Email Change Request] Email send failed:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    // Also notify the OLD email address about the pending change
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      const notifyHtml = generateEmailChangeNotificationEmail(
        user.name || 'User',
        normalizedEmail
      )

      const notifyText = `
Email Change Request Received

Hi ${user.name || 'User'},

We received a request to change your ItWhip account email to ${normalizedEmail}.

If you made this request, please check your new email inbox for a verification link.

If you didn't request this change, no action is needed. Your email will not be changed until the new address is verified.

For security concerns, contact us at info@itwhip.com

- ItWhip Security Team
      `.trim()

      await sendEmail(
        user.email!, // Send to OLD email address
        'Email Change Request - ItWhip',
        notifyHtml,
        notifyText
      )
    } catch (notifyError) {
      console.error('[Email Change Request] Notification email failed:', notifyError)
      // Don't fail - the verification email was sent successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      emailSentTo: normalizedEmail
    })

  } catch (error) {
    console.error('[Email Change Request] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}

// Helper to generate verification email HTML
function generateEmailChangeVerificationEmail(
  name: string,
  oldEmail: string,
  newEmail: string,
  verificationUrl: string
): string {
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
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Verify Your Email</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Verify Your New Email Address</h2>

                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${name},
                    </p>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      You've requested to change your ItWhip account email address:
                    </p>

                    <!-- Email Change Details -->
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">From:</td>
                          <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${oldEmail}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">To:</td>
                          <td style="padding: 4px 0; color: #10b981; font-size: 14px; font-weight: 600;">${newEmail}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Click the button below to verify this email address and complete the change:
                    </p>

                    <!-- Verify Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">Verify Email Address</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; text-align: center;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0 0 24px; color: #6b7280; font-size: 12px; text-align: center; word-break: break-all;">
                      ${verificationUrl}
                    </p>

                    <!-- Warning Box -->
                    <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                        <strong>Note:</strong> This link expires in 24 hours. If you didn't request this change, you can safely ignore this email.
                      </p>
                    </div>

                    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      Need help? Contact us at
                      <a href="mailto:info@itwhip.com" style="color: #10b981; text-decoration: none;">info@itwhip.com</a>
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
                      &copy; 2025 ItWhip. All rights reserved.
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

// Helper to generate notification email to OLD email
function generateEmailChangeNotificationEmail(
  name: string,
  newEmail: string
): string {
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
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Security Notice</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Email Change Request</h2>

                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${name},
                    </p>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      We received a request to change your ItWhip account email address to:
                    </p>

                    <div style="background-color: #eff6ff; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 600;">${newEmail}</p>
                    </div>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      <strong>If you made this request:</strong> Please check your new email inbox for a verification link to complete the change.
                    </p>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      <strong>If you didn't request this:</strong> No action is needed. Your email address will not be changed until the new address is verified.
                    </p>

                    <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                        <strong>Security concern?</strong> If you didn't request this change and are worried about your account security, please contact us immediately.
                      </p>
                    </div>

                    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      Contact us at
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
                      &copy; 2025 ItWhip. All rights reserved.
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
