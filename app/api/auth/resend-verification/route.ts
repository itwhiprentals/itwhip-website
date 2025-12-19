// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Rate limiting - 3 attempts per hour per email
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(email: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now()
  const limit = rateLimitMap.get(email)

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(email, {
      count: 1,
      resetAt: now + 3600000 // 1 hour
    })
    return { allowed: true, remainingAttempts: 2 }
  }

  if (limit.count >= 3) {
    return { allowed: false, remainingAttempts: 0 }
  }

  limit.count++
  return { allowed: true, remainingAttempts: 3 - limit.count }
}

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Rate limiting check
    const rateLimit = checkRateLimit(normalizedEmail)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many verification requests. Please try again in 1 hour.',
          remainingAttempts: 0
        },
        { status: 429 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true
      }
    })

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification code has been sent.'
      })
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode()
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Update user with new code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpiry: expiryTime
      }
    })

    console.log(`[Resend Verification] New code generated for: ${user.email}`)

    // Send verification email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      const htmlContent = generateVerificationEmail(user.name || 'User', verificationCode)
      const textContent = `
Your ItWhip Verification Code

Hi ${user.name || 'User'},

Your verification code is: ${verificationCode}

This code will expire in 15 minutes.

If you didn't request this code, please ignore this email.

- ItWhip Team
      `.trim()

      await sendEmail(
        user.email,
        'Your ItWhip Verification Code',
        htmlContent,
        textContent
      )

      console.log(`[Resend Verification] Email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('[Resend Verification] Email send failed:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      remainingAttempts: rateLimit.remainingAttempts
    })

  } catch (error) {
    console.error('[Resend Verification] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while sending verification code' },
      { status: 500 }
    )
  }
}

function generateVerificationEmail(name: string, code: string): string {
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
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Email Verification</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Verify Your Email</h2>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px; text-align: center;">
                      Hi ${name}, use the code below to verify your email address:
                    </p>

                    <!-- Verification Code Box -->
                    <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Your verification code:</p>
                      <p style="margin: 0; color: #1f2937; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: monospace;">${code}</p>
                    </div>

                    <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                      This code will expire in <strong>15 minutes</strong>.
                    </p>

                    <!-- Warning -->
                    <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        If you didn't request this code, please ignore this email. Your account is secure.
                      </p>
                    </div>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                      Need help? Contact us at
                      <a href="mailto:support@itwhip.com" style="color: #10b981; text-decoration: none;">support@itwhip.com</a>
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
