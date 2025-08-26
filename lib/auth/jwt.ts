// /lib/auth/jwt.ts
// Adapter to provide verifyJWT function that rental booking expects

import { verifyAccessToken } from '@/app/lib/auth/jwt'

export async function verifyJWT(token: string): Promise<{
  userId?: string;
  email?: string;
  role?: string;
  [key: string]: any;
} | null> {
  try {
    const result = await verifyAccessToken(token)
    
    if (!result.valid || !result.payload) {
      return null
    }
    
    const payload = result.payload as any
    
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      hotelId: payload.hotelId,
      permissions: payload.permissions,
      sessionId: payload.sessionId,
      ...payload
    }
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

export { 
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  revokeToken,
  extractTokenFromHeader
} from '@/app/lib/auth/jwt'
