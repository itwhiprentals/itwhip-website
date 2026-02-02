// Guest JWT token verification
// Matches token generation in app/api/auth/phone-login/collect-email/route.ts

import { jwtVerify } from 'jose'

// JWT secrets (must match collect-email route)
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)

interface GuestTokenPayload {
  userId: string
  email: string
  name: string | null
  role: string
  userType: 'guest'
}

/**
 * Verify guest access token
 * Returns payload if valid, null if invalid/expired
 */
export async function verifyGuestToken(
  token: string
): Promise<GuestTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, GUEST_JWT_SECRET, {
      issuer: 'itwhip',
      audience: 'itwhip-guest'
    })

    return payload as unknown as GuestTokenPayload
  } catch (error) {
    console.error('[Guest JWT] Verification failed:', error)
    return null
  }
}
