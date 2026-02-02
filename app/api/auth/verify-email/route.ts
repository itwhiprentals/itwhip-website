// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT } from 'jose'

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        emailVerificationCode: true,
        emailVerificationExpiry: true,
        role: true,
        phone: true,
        phoneVerified: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Check if code exists
    if (!user.emailVerificationCode) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if code has expired
    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if code matches
    if (user.emailVerificationCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiry: null
      }
    })

    // Also sync emailVerified to ReviewerProfile
    let reviewerProfile = null
    try {
      // First find the profile to get its ID for the notification
      reviewerProfile = await prisma.reviewerProfile.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email }
          ]
        },
        select: { id: true }
      })

      if (reviewerProfile) {
        await prisma.reviewerProfile.update({
          where: { id: reviewerProfile.id },
          data: { emailVerified: true }
        })
      }
    } catch (syncError) {
      console.error('[Verify Email] Failed to sync emailVerified to ReviewerProfile:', syncError)
    }

    console.log(`[Verify Email] Email verified for user: ${user.id}`)

    // Create AdminNotification for Fleet/Admin visibility
    if (reviewerProfile) {
      try {
        await prisma.adminNotification.create({
          data: {
            id: nanoid(),
            type: 'GUEST_EMAIL_VERIFIED',
            title: 'Guest Email Verified',
            message: `${user.name || user.email} verified their email`,
            priority: 'LOW',
            status: 'UNREAD',
            actionRequired: false,
            actionUrl: `/fleet/guests/${reviewerProfile.id}`,
            relatedId: reviewerProfile.id,
            relatedType: 'REVIEWER_PROFILE',
            metadata: {
              guestEmail: user.email,
              guestName: user.name || null,
              verifiedAt: new Date().toISOString()
            },
            updatedAt: new Date()
          }
        })
        console.log(`[Verify Email] AdminNotification created for verified guest: ${reviewerProfile.id}`)
      } catch (notifError) {
        console.error('[Verify Email] Failed to create AdminNotification:', notifError)
        // Don't block verification if notification fails
      }
    }

    // Send welcome email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      const htmlContent = generateWelcomeEmail(user.name || 'User')
      const textContent = `
Welcome to ItWhip!

Hi ${user.name || 'User'},

Your email has been verified! You're all set to start exploring our fleet of premium vehicles.

What you can do now:
- Browse our collection of cars
- Book your first trip
- Complete your profile for faster bookings
- Add a payment method

Start exploring: ${process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'}/rentals

Welcome aboard!
The ItWhip Team
      `.trim()

      await sendEmail(
        user.email,
        'Welcome to ItWhip - Your Email is Verified!',
        htmlContent,
        textContent
      )

      console.log(`[Verify Email] Welcome email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('[Verify Email] Welcome email failed:', emailError)
    }

    // Create JWT tokens for automatic login
    const GUEST_JWT_SECRET = new TextEncoder().encode(
      process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
    )

    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(GUEST_JWT_SECRET)

    const refreshToken = await new SignJWT({
      userId: user.id,
      type: 'refresh'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(GUEST_JWT_SECRET)

    // Check if phone verification is required
    const PHONE_CUTOFF = new Date(process.env.PHONE_VERIFICATION_CUTOFF || '2025-01-01')
    const isNewUser = user.createdAt > PHONE_CUTOFF
    const requiresPhoneVerification = isNewUser && !user.phoneVerified && !!user.phone

    console.log(`[Verify Email] Phone verification check:`, {
      isNewUser,
      hasPhone: !!user.phone,
      phoneVerified: user.phoneVerified,
      requiresPhoneVerification
    })

    // Set cookies
    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      requiresPhoneVerification,
      phone: user.phone // Pass phone for redirect
    })

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 minutes
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('[Verify Email] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    )
  }
}

function generateWelcomeEmail(name: string): string {
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
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Welcome Aboard!</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="width: 64px; height: 64px; background-color: #ecfdf5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="font-size: 32px;">🎉</span>
                      </div>
                    </div>

                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Welcome to ItWhip, ${name}!</h2>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px; text-align: center;">
                      Your email has been verified. You're all set to start exploring our fleet of premium vehicles!
                    </p>

                    <!-- What you can do -->
                    <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px; font-weight: 600;">What you can do now:</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                            <span style="color: #4b5563; font-size: 14px;">Browse our collection of cars</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                            <span style="color: #4b5563; font-size: 14px;">Book your first trip</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                            <span style="color: #4b5563; font-size: 14px;">Complete your profile for faster bookings</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                            <span style="color: #4b5563; font-size: 14px;">Add a payment method</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'}/rentals" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">Start Exploring</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                      Questions? Contact us at
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
