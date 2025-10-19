// app/lib/auth/verify-request.ts
// Direct JWT verification for API routes (no HTTP overhead)

import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// JWT secrets (same as your verify endpoint)
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

// User type returned from verification
export interface VerifiedUser {
  id: string
  userId: string
  email: string
  name: string
  role: string
  userType: 'guest' | 'platform'
  jti?: string
  iat?: number
  exp?: number
}

/**
 * Verify JWT token with multiple secrets (guest + platform)
 * Returns the decoded payload if valid, throws error if invalid
 */
async function verifyTokenWithSecrets(token: string) {
  const secrets = [
    { secret: GUEST_JWT_SECRET, type: 'guest' as const },
    { secret: JWT_SECRET, type: 'platform' as const }
  ]

  // Try each secret until one works
  for (const { secret, type } of secrets) {
    try {
      const { payload } = await jwtVerify(token, secret)
      return { payload, secretType: type, success: true }
    } catch (error) {
      // Continue to next secret
      continue
    }
  }

  // If we get here, token is invalid with all secrets
  throw new Error('Token verification failed with all secrets')
}

/**
 * Main function: Verify request authentication
 * 
 * Usage in API routes:
 * ```typescript
 * const user = await verifyRequest(request)
 * if (!user) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * }
 * ```
 */
export async function verifyRequest(
  request: NextRequest
): Promise<VerifiedUser | null> {
  try {
    // Get token from cookie
    const token = request.cookies.get('accessToken')?.value

    if (!token) {
      return null
    }

    // Verify the token (tries both guest and platform secrets)
    const { payload, secretType } = await verifyTokenWithSecrets(token)

    // Validate required fields
    if (!payload.userId || !payload.email) {
      console.warn('⚠️ Token missing required fields:', { 
        hasUserId: !!payload.userId, 
        hasEmail: !!payload.email 
      })
      return null
    }

    // Check token expiry
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      console.warn('⚠️ Token expired')
      return null
    }

    // Return verified user data
    return {
      id: payload.userId as string,
      userId: payload.userId as string,
      email: payload.email as string,
      name: (payload.name as string) || '',
      role: (payload.role as string) || 'CLAIMED',
      userType: (payload.userType as 'guest' | 'platform') || secretType,
      jti: payload.jti as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    }

  } catch (error) {
    // Log error but don't expose details to client
    console.error('❌ Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

/**
 * Alternative: Verify and throw error if invalid
 * Use this when you want to handle errors explicitly
 * 
 * Usage:
 * ```typescript
 * try {
 *   const user = await verifyRequestOrThrow(request)
 *   // user is guaranteed to be valid here
 * } catch (error) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * }
 * ```
 */
export async function verifyRequestOrThrow(
  request: NextRequest
): Promise<VerifiedUser> {
  const user = await verifyRequest(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

/**
 * Helper: Check if user has specific role
 * 
 * Usage:
 * ```typescript
 * const user = await verifyRequest(request)
 * if (!hasRole(user, ['ADMIN', 'SUPER_ADMIN'])) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
 * }
 * ```
 */
export function hasRole(user: VerifiedUser | null, allowedRoles: string[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

/**
 * Helper: Check if user is guest type
 */
export function isGuestUser(user: VerifiedUser | null): boolean {
  return user?.userType === 'guest'
}

/**
 * Helper: Check if user is platform type
 */
export function isPlatformUser(user: VerifiedUser | null): boolean {
  return user?.userType === 'platform'
}