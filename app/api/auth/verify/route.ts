// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

// Get both guest and platform JWT secrets
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET!
)

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// Helper function to verify token with multiple secrets
async function verifyTokenWithSecrets(token: string) {
  const secrets = [
    { secret: GUEST_JWT_SECRET, type: 'guest' },
    { secret: JWT_SECRET, type: 'platform' }
  ]

  for (const { secret, type } of secrets) {
    try {
      const { payload } = await jwtVerify(token, secret)
      return { payload, secretType: type, success: true }
    } catch (error) {
      // Continue to next secret if verification fails
      continue
    }
  }

  // If we get here, token is invalid with all secrets
  throw new Error('Token verification failed with all secrets')
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('accessToken')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify the token with appropriate secret
    const { payload, secretType } = await verifyTokenWithSecrets(token)

    // Validate token structure
    if (!payload.userId || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid token structure' },
        { status: 401 }
      )
    }

    // Check token expiry (jose handles this, but double-check)
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      )
    }

    // Validate user type matches secret type
    const userType = payload.userType as string
    if (userType && secretType) {
      // Guest tokens should be verified with guest secrets
      if (userType === 'guest' && secretType !== 'guest') {
        console.warn(`Guest token verified with ${secretType} secret - potential security issue`)
      }
      // Platform tokens should be verified with platform secrets
      if (userType === 'platform' && secretType !== 'platform') {
        console.warn(`Platform token verified with ${secretType} secret - potential security issue`)
      }
    }

    // ========== FETCH PROFILE PHOTO FROM DATABASE ==========
    // JWT tokens don't store profile photos, so we need to fetch from DB
    // Check multiple sources:
    // 1. ReviewerProfile.profilePhotoUrl (guest profile photo)
    // 2. User.avatar (manual upload on user profile)
    // 3. User.image (OAuth profile photo from Google/Apple)
    // 4. RentalHost.profilePhoto (for dual-role users who have host profile)
    let profilePhoto: string | null = null
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: {
          avatar: true,
          image: true,
          reviewerProfile: {
            select: { profilePhotoUrl: true }
          },
          rentalHost: {
            select: { profilePhoto: true }
          }
        }
      })
      // Priority: guest profile > avatar > OAuth image > host profile
      profilePhoto = user?.reviewerProfile?.profilePhotoUrl ||
                     user?.avatar ||
                     user?.image ||
                     user?.rentalHost?.profilePhoto ||
                     null
      console.log('[Auth Verify] Profile photo sources:', {
        reviewerProfile: user?.reviewerProfile?.profilePhotoUrl || 'none',
        avatar: user?.avatar || 'none',
        image: user?.image || 'none',
        hostProfile: user?.rentalHost?.profilePhoto || 'none',
        selected: profilePhoto || 'none'
      })
    } catch (dbError) {
      console.warn('Failed to fetch profile photo from DB:', dbError)
      // Continue without profile photo
    }

    // Return user data with profile photo
    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role || 'CLAIMED',
        userType: payload.userType || 'guest',
        profilePhoto // Include profile photo from database
      },
      tokenInfo: {
        secretType,
        jti: payload.jti,
        issuedAt: payload.iat,
        expiresAt: payload.exp
      }
    })
  } catch (error) {
    console.error('Token verification failed:', error)
    
    // Determine if token format is valid but secret is wrong
    if (error instanceof Error && error.message.includes('signature')) {
      return NextResponse.json(
        { error: 'Invalid token signature' },
        { status: 401 }
      )
    }
    
    // General verification failure
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}