// app/api/auth/set-password/route.ts
// Allows converted guests (who have no password) to set their initial password via token
// Similar to reset-password but with different messaging and for first-time setup

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

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

    // Find user with this reset token (we reuse resetToken for set-password)
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
        passwordHash: true,
        resetTokenExpiry: true
      }
    })

    // Token validation
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired setup link' },
        { status: 400 }
      )
    }

    // Extra check: this endpoint is for users WITHOUT a password
    // If they already have one, redirect them to use change-password instead
    if (user.passwordHash && user.passwordHash.length > 0) {
      return NextResponse.json(
        { error: 'You already have a password. Use the login page to sign in.' },
        { status: 400 }
      )
    }

    // Hash the new password with bcrypt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Update user password and invalidate token
    // Also mark email as verified (they received the token via email)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        resetTokenUsed: true,
        emailVerified: true,
        lastPasswordReset: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`[Set Password] Successfully set password for: ${user.email}`)

    // Send confirmation email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')
      const { emailConfig } = await import('@/app/lib/email/config')

      const firstName = user.name?.split(' ')[0] || ''

      await sendEmail(
        user.email!,
        'Your ItWhip Account is Now Secured',
        `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">

              <!-- Header -->
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">Account Secured</p>
                <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #16a34a;">You're All Set!</h1>
              </div>

              <!-- Main content -->
              <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
                Hi${firstName ? ` ${firstName}` : ''},
              </p>

              <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
                Great news! Your ItWhip account is now secured with a password. You can now sign in from any device.
              </p>

              <!-- Success Box -->
              <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #166534;">
                  <strong>Password Set Successfully</strong><br>
                  ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>

              <!-- What's Next -->
              <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                What's next:
              </p>
              <table style="width: 100%; font-size: 13px; color: #1f2937;">
                <tr>
                  <td style="padding: 5px 0;">&#10003; Sign in from any device with your email and password</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;">&#10003; Enable two-factor authentication for extra security</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;">&#10003; Start browsing and booking vehicles</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${emailConfig.websiteUrl}/dashboard" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  Go to Dashboard
                </a>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr><td style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
              </table>

              <!-- Security Warning -->
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Didn't set this password?</strong> If you didn't make this change, please contact our support team immediately at info@itwhip.com
                </p>
              </div>

              <!-- Footer -->
              <p style="color: #4b5563; font-size: 11px; margin-top: 24px; text-align: center;">
                ${emailConfig.companyName} | ${emailConfig.companyAddress} | <a href="${emailConfig.websiteUrl}" style="color: #ea580c;">itwhip.com</a>
              </p>
            </body>
          </html>
        `,
        `
ACCOUNT SECURED
You're All Set!

Hi${firstName ? ` ${firstName}` : ''},

Great news! Your ItWhip account is now secured with a password. You can now sign in from any device.

PASSWORD SET SUCCESSFULLY
${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}

WHAT'S NEXT:
✓ Sign in from any device with your email and password
✓ Enable two-factor authentication for extra security
✓ Start browsing and booking vehicles

Go to Dashboard: ${emailConfig.websiteUrl}/dashboard

---

Didn't set this password?
If you didn't make this change, please contact our support team immediately at info@itwhip.com

${emailConfig.companyName} | ${emailConfig.companyAddress} | itwhip.com
        `
      )

      console.log(`[Set Password] Confirmation email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('[Set Password] Confirmation email failed:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password set successfully'
    })

  } catch (error) {
    console.error('[Set Password API] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while setting your password' },
      { status: 500 }
    )
  }
}
