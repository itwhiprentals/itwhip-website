// app/api/user/delete-account/route.ts
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
    console.error('[Delete Account] Token verification failed:', error)
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

    const { password, reason } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        status: true
      }
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already pending deletion
    if (user.status === 'PENDING_DELETION') {
      return NextResponse.json(
        { error: 'Account deletion is already scheduled' },
        { status: 400 }
      )
    }

    // Verify password
    let passwordValid = false
    try {
      passwordValid = await argon2.verify(user.passwordHash, password)
    } catch (error) {
      console.error('[Delete Account] Password verification error:', error)
      return NextResponse.json(
        { error: 'Password verification failed' },
        { status: 500 }
      )
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    // Schedule deletion for 30 days from now
    const now = new Date()
    const deletionDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Update user status
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'PENDING_DELETION',
        deletionRequestedAt: now,
        deletionScheduledFor: deletionDate,
        deletionReason: reason || null
      }
    })

    console.log(`[Delete Account] Deletion scheduled for user: ${userId}, date: ${deletionDate.toISOString()}`)

    // Invalidate all sessions
    try {
      await prisma.session.deleteMany({
        where: { userId }
      })
      console.log(`[Delete Account] Sessions invalidated for user: ${userId}`)
    } catch (sessionError) {
      console.error('[Delete Account] Session invalidation failed:', sessionError)
    }

    // Send confirmation email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      const htmlContent = generateDeletionConfirmationEmail(
        user.name || 'User',
        deletionDate
      )

      const textContent = `
Account Deletion Scheduled

Hi ${user.name || 'User'},

Your ItWhip account has been scheduled for deletion.

Deletion Date: ${deletionDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}

Changed your mind? Simply log back in to your account anytime before the deletion date to cancel this request.

What happens next:
- Your account will remain accessible until the deletion date
- 30 days from now, your account and all associated data will be permanently deleted
- This action cannot be undone after the deletion date

If you didn't request this, please contact our support team immediately.

- ItWhip Team
      `.trim()

      await sendEmail(
        user.email as string,
        'Your ItWhip Account Deletion is Scheduled',
        htmlContent,
        textContent
      )

      console.log(`[Delete Account] Confirmation email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('[Delete Account] Email send failed:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Account deletion scheduled',
      deletionScheduledFor: deletionDate.toISOString()
    })

  } catch (error) {
    console.error('[Delete Account] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}

function generateDeletionConfirmationEmail(name: string, deletionDate: Date): string {
  const formattedDate = deletionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

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
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Account Deletion Request</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Account Deletion Scheduled</h2>

                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${name},
                    </p>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      We've received your request to delete your ItWhip account. Your account is now scheduled for permanent deletion.
                    </p>

                    <!-- Deletion Date Box -->
                    <div style="background-color: #fef2f2; border: 2px solid #fecaca; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; font-weight: 500;">Your account will be deleted on:</p>
                      <p style="margin: 0; color: #dc2626; font-size: 20px; font-weight: 700;">${formattedDate}</p>
                    </div>

                    <!-- What Happens Next -->
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="margin: 0 0 12px; color: #1f2937; font-size: 14px; font-weight: 600;">What happens next:</p>
                      <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 24px;">
                        <li>Your account will remain accessible until the deletion date</li>
                        <li>30 days from now, your account and all data will be permanently deleted</li>
                        <li>This includes your profile, bookings, reviews, and payment methods</li>
                        <li>This action cannot be undone after the deletion date</li>
                      </ul>
                    </div>

                    <!-- Changed Your Mind Box -->
                    <div style="padding: 20px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0 0 8px; color: #065f46; font-size: 14px; font-weight: 600;">
                        Changed your mind?
                      </p>
                      <p style="margin: 0; color: #047857; font-size: 14px; line-height: 20px;">
                        Simply log back in to your account anytime before ${formattedDate} to cancel the deletion request. Your account will be fully restored.
                      </p>
                    </div>

                    <!-- Cancel Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'}/auth/login" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">Log In to Cancel Deletion</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                      If you didn't request this deletion, please contact our support team immediately at
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
