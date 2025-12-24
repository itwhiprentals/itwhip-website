// app/api/host/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import crypto from 'crypto'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(email)

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(email, {
      count: 1,
      resetAt: now + 3600000 // 1 hour
    })
    return true
  }

  if (limit.count >= 3) {
    return false
  }

  limit.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (!checkRateLimit(normalizedEmail)) {
      return NextResponse.json(
        {
          success: true,
          message: 'If a host account exists with this email, you will receive reset instructions.'
        },
        { status: 200 }
      )
    }

    const host = await prisma.rentalHost.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    const publicResponse = {
      success: true,
      message: 'If a host account exists with this email, you will receive reset instructions.'
    }

    if (!host) {
      console.log(`[Host Password Reset] Attempted for non-existent email: ${normalizedEmail}`)
      return NextResponse.json(publicResponse, { status: 200 })
    }

    if (!host.user) {
      console.log(`[Host Password Reset] Host has no linked User account: ${normalizedEmail}`)
      return NextResponse.json(publicResponse, { status: 200 })
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour

    await prisma.user.update({
      where: { id: host.user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiresAt,
        lastPasswordReset: null,
        updatedAt: new Date()
      }
    })

    await prisma.activityLog.create({
      data: {
        userId: host.user.id,
        action: 'host_password_reset_requested',
        entityType: 'RentalHost',
        entityId: host.id,
        metadata: {
          email: host.email,
          hostId: host.id,
          requestedAt: new Date().toISOString()
        },
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      }
    })

    // Send reset email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'
    const resetUrl = `${baseUrl}/host/reset-password?token=${resetToken}`
    
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
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip Host Portal</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Reset Your Host Password</h2>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                        Hi ${host.name},
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                        We received a request to reset your host account password. Click the button below to create a new password:
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.2);">Reset Host Password</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 20px;">
                        Or copy and paste this link into your browser:
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #16a34a; font-size: 14px; word-break: break-all;">
                        ${resetUrl}
                      </p>
                      
                      <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                          <strong>⚠️ Security Notice:</strong><br>
                          This link expires in 1 hour and can only be used once.<br>
                          If you didn't request this, you can safely ignore this email.
                        </p>
                      </div>
                      
                      <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                        Need help? Contact our host support team at 
                        <a href="mailto:info@itwhip.com" style="color: #16a34a; text-decoration: none;">info@itwhip.com</a>
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                        ItWhip Technologies, Inc. - Host Portal
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

    // ✅ FIXED: Plain text version
    const textContent = `
Reset Your ItWhip Host Password

Hi ${host.name},

We received a request to reset your host account password.

Click this link to create a new password:
${resetUrl}

This link expires in 1 hour and can only be used once.
If you didn't request this, you can safely ignore this email.

Need help? Contact our host support team at info@itwhip.com

ItWhip Technologies, Inc. - Host Portal
© 2025 ItWhip. All rights reserved.
    `.trim()

    try {
      // ✅ FIXED: Call with 4 parameters (to, subject, html, text)
      await sendEmail(
        host.email,
        'Reset Your ItWhip Host Password',
        htmlContent,
        textContent
      )

      console.log(`[Host Password Reset] Email sent to: ${host.email}`)
    } catch (emailError) {
      console.error('[Host Password Reset] Email send failed:', emailError)
    }

    return NextResponse.json(publicResponse, { status: 200 })

  } catch (error) {
    console.error('[Host Password Reset] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}