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

// Legacy secret for backward compatibility with older partner tokens
const LEGACY_JWT_SECRET = new TextEncoder().encode('your-secret-key')

// User type returned from verification
export interface VerifiedUser {
  id: string
  userId: string
  email: string
  name: string
  role: string
  userType: 'guest' | 'platform'
  legacyDualId?: string | null // For dual-role account linking
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
    { secret: JWT_SECRET, type: 'platform' as const },
    { secret: LEGACY_JWT_SECRET, type: 'platform' as const } // Backward compatibility
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
    // Check Authorization header first (mobile app sends Bearer tokens)
    const authHeader = request.headers.get('authorization')
    let token: string | undefined

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    // Fall back to cookies (web browser sessions)
    if (!token) {
      token = request.cookies.get('accessToken')?.value ||
              request.cookies.get('hostAccessToken')?.value ||
              request.cookies.get('partner_token')?.value
    }

    if (!token) {
      return null
    }

    // Verify the token (tries both guest and platform secrets)
    const { payload, secretType } = await verifyTokenWithSecrets(token)

    // For partner tokens, use hostId as fallback for userId (backwards compatibility)
    const effectiveUserId = (payload.userId || payload.hostId) as string | undefined

    // Validate required fields
    if (!effectiveUserId || !payload.email) {
      console.warn('⚠️ Token missing required fields:', {
        hasUserId: !!payload.userId,
        hasHostId: !!payload.hostId,
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
      id: effectiveUserId,
      userId: effectiveUserId,
      email: payload.email as string,
      name: (payload.name as string) || '',
      role: (payload.role as string) || 'CLAIMED',
      userType: (payload.userType as 'guest' | 'platform') || secretType,
      legacyDualId: (payload.legacyDualId as string) || null,
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
 * Verify host/partner request — returns hostId from JWT
 * Accepts Authorization Bearer header (mobile) or cookies (web)
 *
 * Usage in partner API routes:
 * ```typescript
 * const hostId = await verifyHostRequest(request)
 * if (!hostId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * ```
 */
export async function verifyHostRequest(
  request: NextRequest
): Promise<string | null> {
  try {
    // Check Authorization header first (mobile app sends Bearer tokens)
    const authHeader = request.headers.get('authorization')
    let token: string | undefined

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    // Fall back to cookies (web browser sessions)
    if (!token) {
      token = request.cookies.get('partner_token')?.value ||
              request.cookies.get('hostAccessToken')?.value ||
              request.cookies.get('accessToken')?.value
    }

    if (!token) return null

    const { payload } = await verifyTokenWithSecrets(token)
    const hostId = payload.hostId as string
    if (!hostId) return null

    // Check expiry
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null

    return hostId
  } catch {
    return null
  }
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