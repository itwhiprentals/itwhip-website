// app/api/user/cancel-deletion/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

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
    console.error('[Cancel Deletion] Token verification failed:', error)
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        deletionScheduledFor: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if actually pending deletion
    if (user.status !== 'PENDING_DELETION') {
      return NextResponse.json(
        { error: 'Account is not scheduled for deletion' },
        { status: 400 }
      )
    }

    // Cancel deletion
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        deletionRequestedAt: null,
        deletionScheduledFor: null,
        deletionReason: null
      }
    })

    console.log(`[Cancel Deletion] Deletion cancelled for user: ${userId}`)

    // Send confirmation email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      const htmlContent = generateCancellationEmail(user.name || 'User')

      const textContent = `
Account Deletion Cancelled

Hi ${user.name || 'User'},

Great news! Your ItWhip account deletion has been cancelled.

Your account is now fully restored and active. You can continue using all ItWhip services as normal.

If you didn't cancel this deletion, please contact our support team immediately.

- ItWhip Team
      `.trim()

      await sendEmail(
        user.email as string,
        'Your ItWhip Account Deletion Has Been Cancelled',
        htmlContent,
        textContent
      )

      console.log(`[Cancel Deletion] Confirmation email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('[Cancel Deletion] Email send failed:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Account deletion cancelled successfully'
    })

  } catch (error) {
    console.error('[Cancel Deletion] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while cancelling deletion' },
      { status: 500 }
    )
  }
}

function generateCancellationEmail(name: string): string {
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
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Welcome Back!</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="width: 64px; height: 64px; background-color: #ecfdf5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="font-size: 32px;">✓</span>
                      </div>
                    </div>

                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Account Deletion Cancelled</h2>

                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${name},
                    </p>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Great news! Your ItWhip account deletion has been successfully cancelled. Your account is now fully restored and active.
                    </p>

                    <!-- Success Box -->
                    <div style="background-color: #ecfdf5; border: 2px solid #a7f3d0; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #065f46; font-size: 14px; font-weight: 500;">Account Status</p>
                      <p style="margin: 0; color: #059669; font-size: 20px; font-weight: 700;">Active</p>
                    </div>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      You can continue using all ItWhip services as normal, including:
                    </p>

                    <ul style="margin: 0 0 24px; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 24px;">
                      <li>Browsing and booking cars</li>
                      <li>Managing your trips</li>
                      <li>Accessing your booking history</li>
                      <li>Using saved payment methods</li>
                    </ul>

                    <!-- Browse Cars Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'}/rentals" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">Browse Cars</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      If you didn't cancel this deletion, please contact our support team immediately at
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
  `
}
