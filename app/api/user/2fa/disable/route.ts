// app/api/user/2fa/disable/route.ts
// Disable 2FA (requires password verification)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import * as argon2 from 'argon2'

// Helper to get user ID from JWT
async function getUserFromToken(req: NextRequest): Promise<string | null> {
  try {
    const userId = req.headers.get('x-user-id')
    if (userId) return userId

    const token = req.cookies.get('accessToken')?.value
    if (!token) return null

    const { jwtVerify } = await import('jose')
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')
    const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key')

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
    console.error('[2FA Disable] Token verification failed:', error)
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

    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to disable 2FA' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        twoFactorEnabled: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is not enabled' },
        { status: 400 }
      )
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Password not set. Please set a password first.' },
        { status: 400 }
      )
    }

    const isValidPassword = await argon2.verify(user.passwordHash, password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      )
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
        twoFactorVerifiedAt: null
      }
    })

    console.log(`[2FA Disable] 2FA disabled for user: ${userId}`)

    // Send notification email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      const htmlContent = `
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
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Security Alert</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <div style="text-align: center; margin-bottom: 24px;">
                          <span style="font-size: 48px;">⚠️</span>
                        </div>
                        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">
                          Two-Factor Authentication Disabled
                        </h2>
                        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                          Two-factor authentication has been disabled on your ItWhip account. Your account is now less secure.
                        </p>
                        <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                            <strong>We recommend re-enabling 2FA</strong> to keep your account secure.
                          </p>
                        </div>
                        <div style="padding: 16px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
                          <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 20px;">
                            <strong>Didn't disable 2FA?</strong> Someone may have access to your account. Contact us immediately at <a href="mailto:info@itwhip.com" style="color: #991b1b;">info@itwhip.com</a>
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
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

      await sendEmail(
        user.email!,
        'Two-Factor Authentication Disabled - ItWhip',
        htmlContent,
        `Two-Factor Authentication Disabled\n\nTwo-factor authentication has been disabled on your ItWhip account.\n\nIf you didn't do this, contact info@itwhip.com immediately.`
      )
    } catch (emailError) {
      console.error('[2FA Disable] Email send failed:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication has been disabled'
    })

  } catch (error) {
    console.error('[2FA Disable] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while disabling 2FA' },
      { status: 500 }
    )
  }
}
