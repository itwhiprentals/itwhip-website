// app/api/auth/switch-role/route.ts
// API endpoint to switch between host and guest modes for dual-role users

import { NextRequest, NextResponse } from 'next/server'
import { verify, sign } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'

// Helper to generate HOST JWT tokens (same as oauth-redirect)
function generateHostTokens(host: {
  id: string
  userId: string
  email: string
  name: string
  approvalStatus: string
}) {
  const accessToken = sign(
    {
      userId: host.userId,
      hostId: host.id,
      email: host.email,
      name: host.name,
      role: 'BUSINESS',
      isRentalHost: true,
      approvalStatus: host.approvalStatus
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = sign(
    {
      userId: host.userId,
      hostId: host.id,
      email: host.email,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// Helper to generate GUEST JWT tokens (same as oauth-redirect)
function generateGuestTokens(user: {
  id: string
  email: string
  name: string | null
  role: string
}) {
  const tokenId = nanoid()
  const refreshTokenId = nanoid()

  const accessToken = sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      jti: tokenId
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = sign(
    {
      userId: user.id,
      jti: refreshTokenId
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetRole } = body

    // Validate targetRole
    if (!targetRole || (targetRole !== 'host' && targetRole !== 'guest')) {
      return NextResponse.json(
        { error: 'Invalid target role. Must be "host" or "guest".' },
        { status: 400 }
      )
    }

    // Get current user ID from either token
    const hostAccessToken = request.cookies.get('hostAccessToken')?.value
    const guestAccessToken = request.cookies.get('accessToken')?.value

    let userId: string | null = null

    // Try to decode either token to get userId
    if (hostAccessToken) {
      try {
        const decoded = verify(hostAccessToken, JWT_SECRET) as any
        userId = decoded.userId
      } catch (err) {
        // Token invalid or expired
      }
    }

    if (!userId && guestAccessToken) {
      try {
        const decoded = verify(guestAccessToken, JWT_SECRET) as any
        userId = decoded.userId
      } catch (err) {
        // Token invalid or expired
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has the target profile
    if (targetRole === 'host') {
      // Use flexible query with OR to check both userId and email
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
          email: true,
          name: true
        }
      })

      if (!hostProfile) {
        return NextResponse.json(
          { error: 'You do not have a host profile' },
          { status: 403 }
        )
      }

      // Generate host tokens (use hostProfile.name if available, fallback to user.name)
      const tokens = generateHostTokens({
        id: hostProfile.id,
        userId: hostProfile.userId || user.id,
        email: hostProfile.email,
        name: hostProfile.name || user.name || '',
        approvalStatus: hostProfile.approvalStatus
      })

      // Create response with redirect
      const response = NextResponse.json({
        success: true,
        redirectUrl: '/host/dashboard'
      })

      // Set host cookies
      response.cookies.set('hostAccessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/'
      })

      response.cookies.set('hostRefreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      // Also set standard cookies (backward compatibility)
      response.cookies.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/'
      })

      response.cookies.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      })

      console.log('[Role Switch] Switched to host mode for user:', userId)
      return response

    } else if (targetRole === 'guest') {
      // Get host profile to check for alternate email (same logic as check-dual-role)
      const hostProfile = await prisma.rentalHost.findFirst({
        where: {
          OR: [
            { userId: userId },
            { email: user.email }
          ]
        },
        select: { email: true }
      })

      // Build email list to check (include host email if different)
      const emailsToCheck = [user.email]
      if (hostProfile?.email && hostProfile.email !== user.email) {
        emailsToCheck.push(hostProfile.email)
      }

      // Use flexible query with OR to check both userId and email
      const guestProfile = await prisma.reviewerProfile.findFirst({
        where: {
          OR: [
            { userId: userId },
            { email: { in: emailsToCheck } }
          ]
        },
        select: {
          id: true,
          userId: true,
          email: true
        }
      })

      if (!guestProfile) {
        return NextResponse.json(
          { error: 'You do not have a guest profile' },
          { status: 403 }
        )
      }

      // Generate guest tokens
      const tokens = generateGuestTokens({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'CLAIMED'
      })

      // Create response with redirect
      const response = NextResponse.json({
        success: true,
        redirectUrl: '/dashboard'
      })

      // Set guest cookies
      response.cookies.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/'
      })

      response.cookies.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      // Clear host cookies
      response.cookies.delete('hostAccessToken')
      response.cookies.delete('hostRefreshToken')

      console.log('[Role Switch] Switched to guest mode for user:', userId)
      return response
    }

  } catch (error) {
    console.error('[Role Switch] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
