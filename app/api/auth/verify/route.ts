// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Get both guest and platform JWT secrets
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
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

    // Return user data
    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role || 'CLAIMED',
        userType: payload.userType || 'guest' // Include user type for client
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