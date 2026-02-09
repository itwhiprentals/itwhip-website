// app/api/guest-onboard/booking/route.ts
// Validates a GuestAccessToken (from booking email), creates/finds guest account,
// marks email as verified, and returns a session token for cookie-based login.
// Pattern mirrors /api/guest-onboard/validate (prospect invite flow).

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
)

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find the GuestAccessToken
    const guestToken = await prisma.guestAccessToken.findUnique({
      where: { token },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            guestName: true,
            guestEmail: true,
            guestPhone: true,
            status: true,
          }
        }
      }
    })

    if (!guestToken) {
      return NextResponse.json(
        { error: 'Invalid or unknown link' },
        { status: 404 }
      )
    }

    // No expiry check — booking guest links do not expire
    // Mark token as used (for tracking, not blocking)
    if (!guestToken.usedAt) {
      await prisma.guestAccessToken.update({
        where: { id: guestToken.id },
        data: { usedAt: new Date() }
      })
    }

    const booking = guestToken.booking
    const email = guestToken.email.toLowerCase()
    const guestName = booking.guestName || 'Guest'

    // Find or create User + ReviewerProfile (same pattern as prospect invite)
    let guestProfile = await prisma.reviewerProfile.findUnique({
      where: { email },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    let user = guestProfile?.user

    if (!guestProfile) {
      // Find or create User
      user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: nanoid(),
            email,
            name: guestName,
            role: 'CLAIMED',
            passwordHash: '',
            isActive: true,
            emailVerified: true, // Verified by clicking email link
            updatedAt: new Date()
          }
        })
      }

      // Create guest profile
      guestProfile = await prisma.reviewerProfile.create({
        data: {
          id: nanoid(),
          userId: user.id,
          email,
          name: guestName,
          phoneNumber: booking.guestPhone || '',
          city: 'Phoenix',
          state: 'AZ',
          recruitedVia: 'booking',
          recruitedAt: new Date(),
          creditBalance: 0,
          bonusBalance: 0,
          depositWalletBalance: 0,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      })

      user = guestProfile.user
    }

    // Mark email as verified (they clicked the link sent to their email)
    await prisma.user.update({
      where: { id: user!.id },
      data: { emailVerified: true }
    })

    // Link booking to the user via renterId (so dashboard query finds it by user ID too)
    await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: { renterId: user!.id }
    })

    // Generate JWT tokens
    const tokens = await generateGuestTokens(user!)

    // Create short-lived session for callback flow (60 seconds)
    const sessionToken = nanoid(32)
    await prisma.guestSession.create({
      data: {
        token: sessionToken,
        userId: user!.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 60 * 1000)
      }
    })

    return NextResponse.json({
      success: true,
      sessionToken,
      guestName: guestName.split(' ')[0],
      bookingCode: booking.bookingCode,
      bookingStatus: booking.status,
    })

  } catch (error: any) {
    console.error('[Guest Booking Onboard] Error:', error)
    return NextResponse.json(
      { error: 'Failed to validate link' },
      { status: 500 }
    )
  }
}

async function generateGuestTokens(
  user: { id: string; email: string | null; name: string | null; role: string }
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenId = nanoid()
  const refreshFamily = nanoid()

  const accessToken = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    jti: tokenId
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({
    userId: user.id,
    family: refreshFamily,
    jti: nanoid()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET)

  try {
    if ('refreshToken' in prisma) {
      await (prisma as any).refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          family: refreshFamily,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    }
  } catch {
    console.log('[Guest Booking Onboard] Refresh token not saved (model may not exist)')
  }

  return { accessToken, refreshToken }
}
