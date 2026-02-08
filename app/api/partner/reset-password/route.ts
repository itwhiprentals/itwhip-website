// app/api/partner/reset-password/route.ts
// POST /api/partner/reset-password - Reset password for Fleet Partners
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { hash } from 'argon2'
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
        resetTokenExpiry: true,
        rentalHost: {
          select: {
            id: true,
            email: true,
            name: true,
            hostType: true,
            partnerCompanyName: true
          }
        }
      }
    })

    // Token validation
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash the new password with argon2
    const hashedPassword = await hash(password)

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

    // Use partner info for logging
    const partner = user.rentalHost
    const companyName = partner?.partnerCompanyName || partner?.name || user.name

    console.log(`[Partner Password Reset] Successfully reset password for: ${user.email} (${companyName})`)

    // Send confirmation email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      await sendEmail(
        user.email as string,
        'Your ItWhip Partner Password Was Set',
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
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 8px 8px 0 0;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip Partner Portal</h1>
                        </td>
                      </tr>

                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Password Set Successfully!</h2>

                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            Hi ${companyName},
                          </p>

                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            Your ItWhip Fleet Partner account password has been set. You can now log in to your Partner Dashboard.
                          </p>

                          <div style="padding: 20px; background-color: #dcfce7; border-left: 4px solid #16a34a; border-radius: 4px; margin: 20px 0;">
                            <p style="margin: 0; color: #166534; font-size: 14px; line-height: 20px;">
                              <strong>Account Ready</strong><br>
                              You can now access your Partner Dashboard and start managing your fleet!
                            </p>
                          </div>

                          <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/partner/login"
                               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 16px;">
                              Go to Partner Login
                            </a>
                          </div>

                          <!-- Security Warning -->
                          <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-top: 30px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                              <strong>Didn't set this password?</strong><br>
                              If you didn't make this change, please contact our partner support team immediately at
                              <a href="mailto:info@itwhip.com" style="color: #92400e; text-decoration: underline;">info@itwhip.com</a>
                            </p>
                          </div>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                            ItWhip Technologies, Inc. - Partner Portal
                          </p>
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            2025 ItWhip. All rights reserved.
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
Partner Password Set Successfully!

Hi ${companyName},

Your ItWhip Fleet Partner account password has been set. You can now log in to your Partner Dashboard.

Account Ready
You can now access your Partner Dashboard and start managing your fleet!

Login here: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/partner/login

Didn't set this password?
If you didn't make this change, please contact our partner support team immediately at info@itwhip.com

ItWhip Technologies, Inc. - Partner Portal
2025 ItWhip. All rights reserved.
        `
      )

      console.log(`[Partner Password Reset] Confirmation email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('[Partner Password Reset] Confirmation email failed:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password set successfully'
    })

  } catch (error) {
    console.error('[Partner Password Reset API] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while setting your password' },
      { status: 500 }
    )
  }
}
