// app/api/partner/email/verify/route.ts
// Handle email verification link click — sets emailVerified on RentalHost
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/partner/settings?tab=account&emailError=missing_token', request.url))
    }

    // Verify JWT token
    const EMAIL_SECRET = new TextEncoder().encode(
      process.env.EMAIL_CHANGE_SECRET || process.env.JWT_SECRET!
    )

    let payload
    try {
      const result = await jwtVerify(token, EMAIL_SECRET)
      payload = result.payload
    } catch {
      return NextResponse.redirect(new URL('/partner/settings?tab=account&emailError=invalid_token', request.url))
    }

    // Validate token payload
    if (payload.type !== 'host_email_verify' || !payload.hostId || !payload.email) {
      return NextResponse.redirect(new URL('/partner/settings?tab=account&emailError=invalid_token', request.url))
    }

    const hostId = payload.hostId as string
    const email = payload.email as string

    // Find the host and verify the email matches
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: { id: true, email: true, emailVerified: true }
    })

    if (!host) {
      return NextResponse.redirect(new URL('/partner/settings?tab=account&emailError=not_found', request.url))
    }

    if (host.email !== email) {
      return NextResponse.redirect(new URL('/partner/settings?tab=account&emailError=email_mismatch', request.url))
    }

    if (host.emailVerified) {
      // Already verified — just redirect with success
      return NextResponse.redirect(new URL('/partner/settings?tab=account&emailVerified=true', request.url))
    }

    // Set emailVerified = true
    await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    })

    console.log(`[Partner Email Verify] Email verified for host ${hostId}: ${email}`)

    return NextResponse.redirect(new URL('/partner/settings?tab=account&emailVerified=true', request.url))
  } catch (error) {
    console.error('[Partner Email Verify] Error:', error)
    return NextResponse.redirect(new URL('/partner/settings?tab=account&emailError=server_error', request.url))
  }
}
