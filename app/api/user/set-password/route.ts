// app/api/user/set-password/route.ts
// Set password for users who don't have one (e.g., converted prospects via invite link)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import * as argon2 from 'argon2'

// Helper to get user ID from JWT
async function getUserFromToken(req: NextRequest): Promise<string | null> {
  try {
    // Check for user ID in headers (set by middleware)
    const userId = req.headers.get('x-user-id')
    if (userId) return userId

    // Fallback: decode JWT from cookie
    const token = req.cookies.get('accessToken')?.value
    if (!token) return null

    const { jwtVerify } = await import('jose')
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
    const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET!)

    // Try both secrets
    for (const secret of [JWT_SECRET, GUEST_JWT_SECRET]) {
      try {
        const { payload } = await jwtVerify(token, secret)
        return payload.userId as string
      } catch {
        continue
      }
    }

    return null
  } catch (error) {
    console.error('[Set Password] Token verification failed:', error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const { newPassword } = await req.json()

    // Validation
    if (!newPassword) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Invalid password format' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Get user to check if they already have a password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has a password set
    if (user.passwordHash && user.passwordHash.length > 0) {
      return NextResponse.json(
        { error: 'Password is already set. Use change password instead.' },
        { status: 400 }
      )
    }

    // Hash the new password with Argon2
    let passwordHash: string
    try {
      passwordHash = await argon2.hash(newPassword, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4
      })
    } catch (error) {
      console.error('[Set Password] Password hashing error:', error)
      return NextResponse.json(
        { error: 'Failed to hash password' },
        { status: 500 }
      )
    }

    // Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        lastPasswordReset: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`[Set Password] Password set for user: ${userId}`)

    // Get user's IP and device info for email
    const ipAddress = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'Unknown'
    const userAgent = req.headers.get('user-agent') || 'Unknown device'

    // Parse user agent for device/browser info
    const deviceInfo = parseUserAgent(userAgent)

    // Send confirmation email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      const htmlContent = generatePasswordSetEmail(
        user.name || 'User',
        ipAddress,
        deviceInfo
      )

      const textContent = `
Your ItWhip Password Has Been Set

Hi ${user.name || 'User'},

Your password was successfully set on ${new Date().toLocaleString('en-US', {
  dateStyle: 'long',
  timeStyle: 'short'
})}.

Device: ${deviceInfo}
Location: ${ipAddress}

Your account is now secured and you can log in from any device using your email and password.

If you didn't make this change, please contact our security team immediately at info@itwhip.com

- ItWhip Security Team
      `.trim()

      await sendEmail(
        user.email as string,
        'Your ItWhip Password Has Been Set',
        htmlContent,
        textContent
      )

      console.log(`[Set Password] Confirmation email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('[Set Password] Email send failed:', emailError)
      // Don't fail the password set if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password set successfully',
      emailSent: true
    })

  } catch (error) {
    console.error('[Set Password] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while setting password' },
      { status: 500 }
    )
  }
}

// Helper to parse user agent
function parseUserAgent(userAgent: string): string {
  if (userAgent.includes('Chrome')) {
    if (userAgent.includes('Mac')) return 'Chrome on macOS'
    if (userAgent.includes('Windows')) return 'Chrome on Windows'
    if (userAgent.includes('Linux')) return 'Chrome on Linux'
    if (userAgent.includes('iPhone')) return 'Chrome on iPhone'
    if (userAgent.includes('Android')) return 'Chrome on Android'
    return 'Chrome Browser'
  }
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    if (userAgent.includes('iPhone')) return 'Safari on iPhone'
    if (userAgent.includes('iPad')) return 'Safari on iPad'
    if (userAgent.includes('Mac')) return 'Safari on Mac'
    return 'Safari Browser'
  }
  if (userAgent.includes('Firefox')) {
    if (userAgent.includes('Mac')) return 'Firefox on macOS'
    if (userAgent.includes('Windows')) return 'Firefox on Windows'
    return 'Firefox Browser'
  }
  if (userAgent.includes('Edge')) return 'Microsoft Edge'

  return 'Unknown device'
}

// Helper to generate password set email HTML
function generatePasswordSetEmail(
  name: string,
  ipAddress: string,
  deviceInfo: string
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
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Account Secured</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Your Password Has Been Set</h2>

                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${name},
                    </p>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Great news! Your ItWhip account password was successfully set on <strong>${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</strong>.
                    </p>

                    <div style="background: #d1fae5; padding: 16px; border-left: 4px solid #10b981; border-radius: 4px; margin-bottom: 24px;">
                      <strong style="color: #065f46;">Account Secured</strong><br>
                      <span style="color: #047857; font-size: 14px;">You can now log in to your account from any device using your email and password.</span>
                    </div>

                    <!-- Security Details Box -->
                    <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0 0 12px; color: #1f2937; font-size: 14px; font-weight: 600;">Setup Details:</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Device:</td>
                          <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${deviceInfo}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">IP Address:</td>
                          <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${ipAddress}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Time:</td>
                          <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${new Date().toLocaleString('en-US', { timeStyle: 'short' })}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Warning Box -->
                    <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">
                        Didn't set this password?
                      </p>
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                        If you didn't make this change, someone else may have access to your account. Contact our security team immediately.
                      </p>
                    </div>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      Your account is now fully secured. Remember to keep your password safe and never share it with anyone.
                    </p>

                    <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      Need help? Contact our security team at
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
                    <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                      This is an automated security notification.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      &copy; 2026 ItWhip. All rights reserved.
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
