// app/api/auth/check-dual-role/route.ts
// API endpoint to check if authenticated user has both host and guest profiles

import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export async function GET(request: NextRequest) {
  try {
    // Get tokens from cookies - check both host and guest tokens
    const hostAccessToken = request.cookies.get('hostAccessToken')?.value
    const guestAccessToken = request.cookies.get('accessToken')?.value

    // Try to get userId from either token
    let userId: string | null = null
    let currentRole: 'host' | 'guest' | null = null

    // Try host token first
    if (hostAccessToken) {
      try {
        const decoded = verify(hostAccessToken, JWT_SECRET) as any
        userId = decoded.userId
        currentRole = 'host'
      } catch (err) {
        // Token invalid or expired, try guest token
      }
    }

    // Try guest token if no userId yet
    if (!userId && guestAccessToken) {
      try {
        const decoded = verify(guestAccessToken, JWT_SECRET) as any
        userId = decoded.userId
        currentRole = 'guest'
      } catch (err) {
        // Token invalid or expired
      }
    }

    // If no valid token, return unauthorized
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user email for fallback queries
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check for host profile - use OR to check both userId and email
    const hostProfile = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: userId },
          { email: user.email }
        ]
      },
      select: {
        id: true,
        approvalStatus: true,
        userId: true,
        email: true  // Need this to check for guest profile
      }
    })

    // Check for guest profile - use the HOST'S email (not User's email)
    // This handles cases where RentalHost has a contact email different from the User account email
    const emailsToCheck = [user.email]
    if (hostProfile?.email && hostProfile.email !== user.email) {
      emailsToCheck.push(hostProfile.email)
    }

    const guestProfile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          { userId: userId },
          { email: { in: emailsToCheck } }
        ]
      },
      select: {
        id: true,
        userId: true
      }
    })

    const hasHostProfile = !!hostProfile
    const hasGuestProfile = !!guestProfile
    const hasBothRoles = hasHostProfile && hasGuestProfile

    return NextResponse.json({
      hasBothRoles,
      hasHostProfile,
      hasGuestProfile,
      currentRole,
      hostApprovalStatus: hostProfile?.approvalStatus || null
    })

  } catch (error) {
    console.error('[Check Dual Role] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
