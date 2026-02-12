// app/api/partner/email/send-verification/route.ts
// Send email verification link to host's current email
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyHostRequest } from '@/app/lib/auth/verify-request'
import { SignJWT } from 'jose'

export async function POST(request: NextRequest) {
  try {
    const hostId = await verifyHostRequest(request)
    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: { id: true, email: true, name: true, emailVerified: true }
    })

    if (!host) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    }

    if (host.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 })
    }

    // Generate verification token
    const EMAIL_SECRET = new TextEncoder().encode(
      process.env.EMAIL_CHANGE_SECRET || process.env.JWT_SECRET!
    )

    const verificationToken = await new SignJWT({
      hostId: host.id,
      email: host.email,
      type: 'host_email_verify'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(EMAIL_SECRET)

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'
    const verificationUrl = `${baseUrl}/api/partner/email/verify?token=${verificationToken}`

    // Send verification email
    const { sendEmail } = await import('@/app/lib/email/sender')

    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; background: #f9fafb; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Verify Your Email</h2>
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      Hi ${host.name || 'Partner'},
    </p>
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      Click the button below to verify your email address for your ItWhip partner account.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 32px; background: #ea580c; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Verify Email
      </a>
    </div>
    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
      This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`

    const textContent = `Verify Your Email\n\nHi ${host.name || 'Partner'},\n\nClick the link below to verify your email:\n${verificationUrl}\n\nThis link expires in 24 hours.`

    await sendEmail(
      host.email,
      'Verify Your Email - ItWhip Partner',
      htmlContent,
      textContent
    )

    return NextResponse.json({ success: true, message: 'Verification email sent' })
  } catch (error) {
    console.error('[Partner Email Verify] Error:', error)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}
