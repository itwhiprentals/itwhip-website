// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import * as argon2 from 'argon2'
import crypto from 'crypto'
import db from '@/app/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    // Validation
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenUsed: false,
        resetTokenExpiry: {
          gt: new Date() // Token not expired
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        resetTokenExpiry: true
      }
    })

    // Token validation
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash the new password with Argon2 (matching login/signup config)
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
      hashLength: 32,
    })

    // Update user password and invalidate token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        resetTokenUsed: true,
        lastPasswordReset: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`[Password Reset] Successfully reset password for: ${user.email}`)

    // Invalidate ALL existing sessions — forces re-login on every device
    try {
      await db.deleteUserRefreshTokens(user.id)
      console.log(`[Password Reset] Invalidated all sessions for user: ${user.email}`)
    } catch (sessionErr) {
      console.error('[Password Reset] Failed to invalidate sessions:', sessionErr)
      // Don't fail the reset if session cleanup fails
    }

    // Send confirmation email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')
      
      await sendEmail(
        user.email!,
        'Your ItWhip Password Was Changed',
        `
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
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Password Changed</h2>
                          
                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            Hi${user.name ? ` ${user.name}` : ''},
                          </p>
                          
                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            This is a confirmation that your ItWhip password was successfully changed.
                          </p>
                          
                          <div style="padding: 20px; background-color: #dcfce7; border-left: 4px solid #16a34a; border-radius: 4px; margin: 20px 0;">
                            <p style="margin: 0; color: #166534; font-size: 14px; line-height: 20px;">
                              <strong>✓ Password Updated</strong><br>
                              Changed on: ${new Date().toLocaleString('en-US', { 
                                dateStyle: 'long', 
                                timeStyle: 'short' 
                              })}
                            </p>
                          </div>
                          
                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            You can now sign in with your new password.
                          </p>
                          
                          <!-- Security Warning -->
                          <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-top: 30px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                              <strong>⚠️ Didn't change your password?</strong><br>
                              If you didn't make this change, please contact our support team immediately at info@itwhip.com
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
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
        `,
        `
Password Changed

Hi${user.name ? ` ${user.name}` : ''},

This is a confirmation that your ItWhip password was successfully changed.

✓ Password Updated
Changed on: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}

You can now sign in with your new password.

⚠️ Didn't change your password?
If you didn't make this change, please contact our support team immediately at info@itwhip.com

ItWhip Technologies, Inc.
© 2026 ItWhip. All rights reserved.
        `
      )
      
      console.log(`[Password Reset] Confirmation email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('[Password Reset] Confirmation email failed:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successful'
    })

  } catch (error) {
    console.error('[Password Reset API] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    )
  }
}