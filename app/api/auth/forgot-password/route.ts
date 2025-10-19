// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import crypto from 'crypto'

// Simple in-memory rate limiting (upgrade to Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(email)

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    rateLimitMap.set(email, {
      count: 1,
      resetAt: now + 3600000 // 1 hour
    })
    return true
  }

  if (limit.count >= 3) {
    return false // Rate limit exceeded
  }

  limit.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Rate limiting check
    if (!checkRateLimit(normalizedEmail)) {
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, you will receive reset instructions.'
        },
        { status: 200 }
      )
    }

    // Find user (but don't reveal if they exist)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    // ALWAYS return success (prevent email enumeration)
    const publicResponse = {
      success: true,
      message: 'If an account exists with this email, you will receive reset instructions.'
    }

    // If user doesn't exist, still return success but don't send email
    if (!user) {
      console.log(`[Password Reset] Attempted for non-existent email: ${normalizedEmail}`)
      return NextResponse.json(publicResponse, { status: 200 })
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour

    // Store hashed token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiresAt,
        resetTokenUsed: false,
        passwordResetAttempts: {
          increment: 1
        },
        passwordResetLastAttempt: new Date()
      }
    })

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`
    
    try {
      // Import sendEmail from sender directly
      const { sendEmail } = await import('@/app/lib/email/sender')
      
      await sendEmail(
        user.email!,
        'Reset Your ItWhip Password',
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
                          <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                          
                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            Hi${user.name ? ` ${user.name}` : ''},
                          </p>
                          
                          <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                            We received a request to reset your password. Click the button below to create a new password:
                          </p>
                          
                          <!-- Button -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                            <tr>
                              <td align="center">
                                <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">Reset Password</a>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 20px;">
                            Or copy and paste this link into your browser:
                          </p>
                          
                          <p style="margin: 0 0 30px; color: #16a34a; font-size: 14px; word-break: break-all;">
                            ${resetUrl}
                          </p>
                          
                          <!-- Security Info -->
                          <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                              <strong>⚠️ Security Notice:</strong><br>
                              This link expires in 1 hour and can only be used once.<br>
                              If you didn't request this, you can safely ignore this email.
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
        `,
        `
Reset Your ItWhip Password

Hi${user.name ? ` ${user.name}` : ''},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

⚠️ Security Notice:
This link expires in 1 hour and can only be used once.
If you didn't request this, you can safely ignore this email.

ItWhip Technologies, Inc.
© 2025 ItWhip. All rights reserved.
        `
      )

      console.log(`[Password Reset] Email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('[Password Reset] Email send failed:', emailError)
      // Don't reveal email failure to user
    }

    return NextResponse.json(publicResponse, { status: 200 })

  } catch (error) {
    console.error('[Password Reset] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}