// app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import db from '@/app/lib/db'
import * as argon2 from 'argon2'

// Rate limiting - 5 attempts per hour per user
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now()
  const limit = rateLimitMap.get(userId)

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + 3600000 // 1 hour
    })
    return { allowed: true, remainingAttempts: 4 }
  }

  if (limit.count >= 5) {
    const minutesRemaining = Math.ceil((limit.resetAt - now) / 60000)
    return { allowed: false, remainingAttempts: 0 }
  }

  limit.count++
  return { allowed: true, remainingAttempts: 5 - limit.count }
}

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
    console.error('[Change Password] Token verification failed:', error)
    return null
  }
}

// SECURITY FIX: Unconditionally invalidate all sessions AND refresh tokens on password change
// Previously was conditional (opt-in) and only deleted Session rows — attacker's refresh token survived
async function invalidateAllSessions(userId: string) {
  try {
    const sessionResult = await prisma.session.deleteMany({
      where: { userId }
    })
    await db.deleteUserRefreshTokens(userId)
    console.log(`[Change Password] Invalidated ${sessionResult.count} sessions + all refresh tokens for user: ${userId}`)
  } catch (error) {
    console.error('[Change Password] Session invalidation failed:', error)
    // Don't throw - password change should still succeed
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

    // Rate limiting check
    const rateLimit = checkRateLimit(userId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many password change attempts. Please try again in 1 hour.',
          remainingAttempts: 0
        },
        { status: 429 }
      )
    }

    const { currentPassword, newPassword, logoutOtherDevices } = await req.json()

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Invalid password format' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        lastPasswordReset: true
      }
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'User not found or password not set' },
        { status: 404 }
      )
    }

    // Verify current password
    let currentPasswordValid = false
    try {
      currentPasswordValid = await argon2.verify(user.passwordHash, currentPassword)
    } catch (error) {
      console.error('[Change Password] Password verification error:', error)
      return NextResponse.json(
        { error: 'Password verification failed' },
        { status: 500 }
      )
    }

    if (!currentPasswordValid) {
      return NextResponse.json(
        { 
          error: 'Current password is incorrect',
          remainingAttempts: rateLimit.remainingAttempts - 1
        },
        { status: 401 }
      )
    }

    // Hash new password with Argon2
    let newPasswordHash: string
    try {
      newPasswordHash = await argon2.hash(newPassword, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4
      })
    } catch (error) {
      console.error('[Change Password] Password hashing error:', error)
      return NextResponse.json(
        { error: 'Failed to hash new password' },
        { status: 500 }
      )
    }

    // Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordReset: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`[Change Password] Password updated for user: ${userId}`)

    // SECURITY: Always invalidate all sessions + refresh tokens on password change
    await invalidateAllSessions(userId)

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
      
      const htmlContent = generatePasswordChangedEmail(
        user.name || 'User',
        ipAddress,
        deviceInfo,
        true
      )

      const textContent = `
Your ItWhip Password Was Changed

Hi ${user.name || 'User'},

Your password was successfully changed on ${new Date().toLocaleString('en-US', { 
  dateStyle: 'long', 
  timeStyle: 'short' 
})}.

Device: ${deviceInfo}
Location: ${ipAddress}

All other devices have been signed out for security.

If you didn't make this change, please reset your password immediately:
${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'}/auth/forgot-password

- ItWhip Security Team
      `.trim()

      await sendEmail(
        user.email as string,
        'Your ItWhip Password Was Changed',
        htmlContent,
        textContent
      )

      console.log(`[Change Password] Confirmation email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('[Change Password] Email send failed:', emailError)
      // Don't fail the password change if email fails
    }

    // Clear rate limit on success
    rateLimitMap.delete(userId)

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      emailSent: true,
      sessionsInvalidated: true
    })

  } catch (error) {
    console.error('[Change Password] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while changing password' },
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

// Helper to generate password changed email HTML
function generatePasswordChangedEmail(
  name: string,
  ipAddress: string,
  deviceInfo: string,
  otherDevicesLoggedOut: boolean
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
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Security Alert</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Your Password Was Changed</h2>
                    
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${name},
                    </p>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      We're confirming that your ItWhip account password was successfully changed on <strong>${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</strong>.
                    </p>

                    <div style="background: #dbeafe; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 24px;">
                      <strong style="color: #1e40af;">🔒 Important:</strong><br>
                      <span style="color: #1e3a8a; font-size: 14px;">This change affects both your host and guest account access. Use your new password when logging into either role.</span>
                    </div>

                    <!-- Security Details Box -->
                    <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0 0 12px; color: #1f2937; font-size: 14px; font-weight: 600;">Change Details:</p>
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

                    ${otherDevicesLoggedOut ? `
                    <div style="padding: 16px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px;">
                        <strong>🔒 Security Action:</strong> All other devices have been signed out as requested.
                      </p>
                    </div>
                    ` : ''}
                    
                    <!-- Warning Box -->
                    <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">
                        ⚠️ Didn't change your password?
                      </p>
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                        If you didn't make this change, someone else may have access to your account. Reset your password immediately and contact our security team.
                      </p>
                    </div>

                    <!-- Reset Password Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'}/auth/forgot-password" style="display: inline-block; padding: 14px 28px; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);">Reset Password Now</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      If you made this change, you can safely ignore this email. Your account is secure.
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