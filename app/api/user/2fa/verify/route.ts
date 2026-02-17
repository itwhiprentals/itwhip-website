// app/api/user/2fa/verify/route.ts
// Verify TOTP code and enable 2FA
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import * as OTPAuth from 'otpauth'
import * as argon2 from 'argon2'
import { nanoid } from 'nanoid'

// Helper to get user ID from JWT
async function getUserFromToken(req: NextRequest): Promise<string | null> {
  try {
    const userId = req.headers.get('x-user-id')
    if (userId) return userId

    const token = req.cookies.get('accessToken')?.value
    if (!token) return null

    const { jwtVerify } = await import('jose')
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
    const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET!)

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
    console.error('[2FA Verify] Token verification failed:', error)
    return null
  }
}

// Generate backup codes
async function generateBackupCodes(): Promise<{ codes: string[]; hashedCodes: string[] }> {
  const codes: string[] = []
  const hashedCodes: string[] = []

  for (let i = 0; i < 10; i++) {
    // Generate 8-character alphanumeric code
    const code = nanoid(8).toUpperCase()
    codes.push(code)
    hashedCodes.push(await argon2.hash(code, { type: argon2.argon2id }))
  }

  return { codes, hashedCodes }
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

    const { code } = await req.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      )
    }

    // Get user with secret
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled' },
        { status: 400 }
      )
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Please set up 2FA first by generating a secret' },
        { status: 400 }
      )
    }

    // Verify the TOTP code
    const totp = new OTPAuth.TOTP({
      issuer: 'ItWhip',
      label: user.email || 'ItWhip User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: user.twoFactorSecret
    })

    const delta = totp.validate({ token: code.replace(/\s/g, ''), window: 1 })
    const isValid = delta !== null

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      )
    }

    // Generate backup codes
    const { codes, hashedCodes } = await generateBackupCodes()

    // Enable 2FA and store backup codes
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: hashedCodes,
        twoFactorVerifiedAt: new Date()
      }
    })

    console.log(`[2FA Verify] 2FA enabled for user: ${userId}`)

    // Send confirmation email
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
                      <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Security Update</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <div style="text-align: center; margin-bottom: 24px;">
                          <span style="font-size: 48px;">🔐</span>
                        </div>
                        <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">
                          Two-Factor Authentication Enabled
                        </h2>
                        <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                          Your ItWhip account now has an extra layer of security. You'll need to enter a code from your authenticator app when signing in.
                        </p>
                        <div style="padding: 16px; background-color: #d1fae5; border-left: 4px solid #10b981; border-radius: 4px; margin-bottom: 24px;">
                          <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 20px;">
                            <strong>Keep your backup codes safe!</strong> Store them somewhere secure. You'll need them if you lose access to your authenticator app.
                          </p>
                        </div>
                        <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                            <strong>Didn't enable 2FA?</strong> Contact us immediately at <a href="mailto:info@itwhip.com" style="color: #92400e;">info@itwhip.com</a>
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
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

      await sendEmail(
        user.email!,
        'Two-Factor Authentication Enabled - ItWhip',
        htmlContent,
        `Two-Factor Authentication Enabled\n\nYour ItWhip account now has 2FA enabled. Keep your backup codes safe!\n\nIf you didn't enable this, contact info@itwhip.com immediately.`
      )
    } catch (emailError) {
      console.error('[2FA Verify] Email send failed:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication has been enabled',
      backupCodes: codes // Show to user ONCE
    })

  } catch (error) {
    console.error('[2FA Verify] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while verifying 2FA' },
      { status: 500 }
    )
  }
}
