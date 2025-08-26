/**
 * JWT Token Management for ItWhip Platform
 * Handles access tokens, refresh tokens, and token rotation
 */

import jwt from 'jsonwebtoken'
import { randomBytes, createHash } from 'crypto'
import { PrismaClient } from '@prisma/client'
import type { 
  User,
  UserRole,
  CertificationTier,
  Permission,
  AccessTokenPayload,
  RefreshTokenPayload,
  PreviewTokenPayload,
  TokenValidation,
  AuthResponse
} from '@/app/types/auth'

// Initialize Prisma
const prisma = new PrismaClient()

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * JWT Configuration
 */
const JWT_CONFIG = {
  // Secrets (use env vars in production)
  ACCESS_SECRET: process.env.JWT_SECRET || generateSecret(),
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || generateSecret(),
  PREVIEW_SECRET: process.env.JWT_PREVIEW_SECRET || generateSecret(),
  
  // Expiry times
  EXPIRY: {
    PREVIEW: '24h',        // Anonymous viewing
    ACCESS: '15m',         // Short-lived access
    REFRESH: '7d',         // Refresh token
    CLAIMED: '1d',         // Claimed hotels
    CERTIFIED: '30d',      // Paid users
    API_KEY: '1y'          // API keys
  },
  
  // Token options
  ISSUER: 'itwhip.com',
  AUDIENCE: 'portal.itwhip.com',
  ALGORITHM: 'HS256' as jwt.Algorithm
}

/**
 * Generate a secure random secret
 */
function generateSecret(): string {
  return randomBytes(64).toString('hex')
}

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate access token for authenticated users
 */
export async function generateAccessToken(
  user: User,
  sessionId: string,
  deviceId?: string
): Promise<string> {
  // Determine expiry based on role
  const expiryTime = getExpiryByRole(user.role)
  
  // Build token payload
  const payload: AccessTokenPayload = {
    // Standard JWT claims
    sub: user.id || `anonymous_${sessionId}`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpiry(expiryTime),
    iss: JWT_CONFIG.ISSUER,
    aud: JWT_CONFIG.AUDIENCE,
    
    // Custom claims
    role: user.role,
    hotelId: user.hotelId,
    hotelName: user.hotelName,
    gdsCode: user.gdsCode,
    tier: getTierFromRole(user.role),
    permissions: user.permissions || [],
    sessionId,
    deviceId
  }
  
  // Sign and return token
  return jwt.sign(payload, JWT_CONFIG.ACCESS_SECRET, {
    algorithm: JWT_CONFIG.ALGORITHM
  })
}

/**
 * Generate refresh token with rotation support
 */
export async function generateRefreshToken(
  userId: string,
  sessionId: string
): Promise<{ token: string; family: string }> {
  // Generate token family for rotation tracking
  const tokenFamily = randomBytes(16).toString('hex')
  
  // Build payload
  const payload: RefreshTokenPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpiry(JWT_CONFIG.EXPIRY.REFRESH),
    tokenFamily,
    sessionId
  }
  
  // Sign token
  const token = jwt.sign(payload, JWT_CONFIG.REFRESH_SECRET, {
    algorithm: JWT_CONFIG.ALGORITHM
  })
  
  // Store in database for tracking
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      refreshToken: hashToken(token),
      tokenFamily
    }
  })
  
  return { token, family: tokenFamily }
}

/**
 * Generate preview token for anonymous users
 */
export function generatePreviewToken(
  gdsCode: string,
  hotelName: string,
  sessionId: string,
  ipAddress: string
): string {
  const payload: PreviewTokenPayload = {
    gdsCode,
    hotelName,
    sessionId,
    ipAddress,
    createdAt: Date.now(),
    expiresAt: Date.now() + parseExpiry(JWT_CONFIG.EXPIRY.PREVIEW) * 1000
  }
  
  return jwt.sign(payload, JWT_CONFIG.PREVIEW_SECRET, {
    algorithm: JWT_CONFIG.ALGORITHM,
    expiresIn: JWT_CONFIG.EXPIRY.PREVIEW
  })
}

/**
 * Generate API key token
 */
export async function generateApiKeyToken(
  hotelId: string,
  permissions: Permission[],
  tier: CertificationTier
): Promise<{ key: string; hashedKey: string }> {
  // Generate random API key
  const key = `itw_${tier}_${randomBytes(32).toString('hex')}`
  
  // Hash for storage
  const hashedKey = hashToken(key)
  
  // Create JWT for the API key
  const payload = {
    type: 'api_key',
    hotelId,
    permissions,
    tier,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpiry(JWT_CONFIG.EXPIRY.API_KEY)
  }
  
  // Sign the API key
  const signedKey = jwt.sign(payload, JWT_CONFIG.ACCESS_SECRET, {
    algorithm: JWT_CONFIG.ALGORITHM
  })
  
  return {
    key: signedKey,
    hashedKey
  }
}

// ============================================================================
// TOKEN VERIFICATION
// ============================================================================

/**
 * Verify and decode access token
 */
export async function verifyAccessToken(
  token: string
): Promise<TokenValidation> {
  try {
    // Check if token is blacklisted
    const isBlacklisted = await checkBlacklist(token)
    if (isBlacklisted) {
      return {
        valid: false,
        expired: false,
        error: 'Token has been revoked'
      }
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_CONFIG.ACCESS_SECRET, {
      algorithms: [JWT_CONFIG.ALGORITHM],
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE
    }) as AccessTokenPayload
    
    // Check if session is still valid
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId }
    })
    
    if (!session || session.revokedAt) {
      return {
        valid: false,
        expired: false,
        error: 'Session has been terminated'
      }
    }
    
    // Update last activity
    await prisma.session.update({
      where: { id: decoded.sessionId },
      data: { lastActivity: new Date() }
    })
    
    return {
      valid: true,
      expired: false,
      payload: decoded
    }
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        expired: true,
        error: 'Token has expired'
      }
    }
    
    return {
      valid: false,
      expired: false,
      error: error.message || 'Invalid token'
    }
  }
}

/**
 * Verify refresh token and rotate if valid
 */
export async function verifyAndRotateRefreshToken(
  token: string
): Promise<AuthResponse> {
  try {
    // Verify token signature
    const decoded = jwt.verify(token, JWT_CONFIG.REFRESH_SECRET, {
      algorithms: [JWT_CONFIG.ALGORITHM]
    }) as RefreshTokenPayload
    
    // Find session
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
      include: { user: true }
    })
    
    if (!session) {
      return {
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session does not exist'
        }
      }
    }
    
    // Check if token family matches (rotation detection)
    if (session.tokenFamily !== decoded.tokenFamily) {
      // Token reuse detected - revoke all tokens in family
      await revokeTokenFamily(decoded.tokenFamily)
      
      return {
        success: false,
        error: {
          code: 'TOKEN_REUSE',
          message: 'Refresh token reuse detected - all tokens revoked'
        }
      }
    }
    
    // Generate new token pair
    const newAccessToken = await generateAccessToken(
      session.user!,
      session.id,
      session.deviceId || undefined
    )
    
    const { token: newRefreshToken } = await generateRefreshToken(
      session.userId!,
      session.id
    )
    
    return {
      success: true,
      user: session.user!,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: parseExpiry(JWT_CONFIG.EXPIRY.ACCESS)
    }
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: error.message || 'Invalid refresh token'
      }
    }
  }
}

/**
 * Verify preview token for anonymous users
 */
export function verifyPreviewToken(token: string): TokenValidation {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.PREVIEW_SECRET, {
      algorithms: [JWT_CONFIG.ALGORITHM]
    }) as PreviewTokenPayload
    
    // Check custom expiry
    if (decoded.expiresAt < Date.now()) {
      return {
        valid: false,
        expired: true,
        error: 'Preview token has expired'
      }
    }
    
    return {
      valid: true,
      expired: false,
      payload: decoded
    }
  } catch (error: any) {
    return {
      valid: false,
      expired: error.name === 'TokenExpiredError',
      error: error.message || 'Invalid preview token'
    }
  }
}

/**
 * Verify API key
 */
export async function verifyApiKey(
  apiKey: string
): Promise<TokenValidation> {
  try {
    // Decode without verification first to get the key
    const decoded = jwt.decode(apiKey) as any
    
    if (!decoded || decoded.type !== 'api_key') {
      return {
        valid: false,
        expired: false,
        error: 'Invalid API key format'
      }
    }
    
    // Verify signature
    const verified = jwt.verify(apiKey, JWT_CONFIG.ACCESS_SECRET, {
      algorithms: [JWT_CONFIG.ALGORITHM]
    }) as any
    
    // Check if key exists and is active
    const hashedKey = hashToken(apiKey)
    const dbKey = await prisma.apiKey.findUnique({
      where: { key: hashedKey }
    })
    
    if (!dbKey || !dbKey.active) {
      return {
        valid: false,
        expired: false,
        error: 'API key is not active'
      }
    }
    
    // Check expiry
    if (dbKey.expiresAt && dbKey.expiresAt < new Date()) {
      return {
        valid: false,
        expired: true,
        error: 'API key has expired'
      }
    }
    
    // Update usage
    await prisma.apiKey.update({
      where: { id: dbKey.id },
      data: {
        lastUsed: new Date(),
        usageCount: { increment: 1 }
      }
    })
    
    return {
      valid: true,
      expired: false,
      payload: verified
    }
  } catch (error: any) {
    return {
      valid: false,
      expired: error.name === 'TokenExpiredError',
      error: error.message || 'Invalid API key'
    }
  }
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Revoke a token (add to blacklist)
 */
export async function revokeToken(
  token: string,
  type: 'access' | 'refresh' = 'access'
): Promise<void> {
  const hashedToken = hashToken(token)
  
  // Add to blacklist (in production, use Redis)
  await prisma.session.updateMany({
    where: {
      OR: [
        { token: hashedToken },
        { refreshToken: hashedToken }
      ]
    },
    data: { revokedAt: new Date() }
  })
}

/**
 * Revoke all tokens in a family (refresh token rotation)
 */
async function revokeTokenFamily(tokenFamily: string): Promise<void> {
  await prisma.session.updateMany({
    where: { tokenFamily },
    data: { revokedAt: new Date() }
  })
}

/**
 * Revoke all tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId },
    data: { revokedAt: new Date() }
  })
}

/**
 * Clean up expired tokens
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  })
  
  return result.count
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Hash a token for storage
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Check if token is blacklisted
 */
async function checkBlacklist(token: string): Promise<boolean> {
  const hashedToken = hashToken(token)
  
  const session = await prisma.session.findFirst({
    where: {
      OR: [
        { token: hashedToken },
        { refreshToken: hashedToken }
      ],
      revokedAt: { not: null }
    }
  })
  
  return !!session
}

/**
 * Parse expiry string to seconds
 */
function parseExpiry(expiry: string): number {
  const units: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
    y: 31536000
  }
  
  const match = expiry.match(/^(\d+)([smhdwy])$/)
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}`)
  }
  
  const [, value, unit] = match
  return parseInt(value) * units[unit]
}

/**
 * Get expiry time based on user role
 */
function getExpiryByRole(role: UserRole): string {
  switch (role) {
    case 'ANONYMOUS':
      return JWT_CONFIG.EXPIRY.PREVIEW
    case 'CLAIMED':
      return JWT_CONFIG.EXPIRY.CLAIMED
    case 'STARTER':
    case 'BUSINESS':
    case 'ENTERPRISE':
      return JWT_CONFIG.EXPIRY.CERTIFIED
    case 'ADMIN':
      return JWT_CONFIG.EXPIRY.ACCESS
    default:
      return JWT_CONFIG.EXPIRY.ACCESS
  }
}

/**
 * Get certification tier from role
 */
function getTierFromRole(role: UserRole): CertificationTier | undefined {
  switch (role) {
    case 'STARTER':
      return 'TU_3_C'
    case 'BUSINESS':
      return 'TU_2_B'
    case 'ENTERPRISE':
      return 'TU_1_A'
    default:
      return undefined
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  
  return parts[1]
}

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return `sess_${randomBytes(24).toString('hex')}`
}

/**
 * Generate device fingerprint
 */
export function generateDeviceFingerprint(
  userAgent: string,
  ip: string,
  acceptLanguage?: string
): string {
  const data = `${userAgent}|${ip}|${acceptLanguage || ''}`
  return createHash('sha256').update(data).digest('hex')
}

// ============================================================================
// TOKEN VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Validate token and return user data
 */
export async function validateTokenMiddleware(
  token: string,
  requiredPermissions?: Permission[]
): Promise<{ valid: boolean; user?: any; error?: string }> {
  // Try access token first
  const validation = await verifyAccessToken(token)
  
  if (!validation.valid) {
    // Try API key
    const apiValidation = await verifyApiKey(token)
    if (!apiValidation.valid) {
      return {
        valid: false,
        error: validation.error || apiValidation.error
      }
    }
    validation.payload = apiValidation.payload
  }
  
  // Check permissions if required
  if (requiredPermissions && validation.payload) {
    const hasPermissions = requiredPermissions.every(
      perm => (validation.payload as any).permissions?.includes(perm)
    )
    
    if (!hasPermissions) {
      return {
        valid: false,
        error: 'Insufficient permissions'
      }
    }
  }
  
  return {
    valid: true,
    user: validation.payload
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Token generation
  generateAccessToken,
  generateRefreshToken,
  generatePreviewToken,
  generateApiKeyToken,
  
  // Token verification
  verifyAccessToken,
  verifyAndRotateRefreshToken,
  verifyPreviewToken,
  verifyApiKey,
  
  // Token management
  revokeToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  
  // Utilities
  extractTokenFromHeader,
  generateSessionId,
  generateDeviceFingerprint,
  validateTokenMiddleware,
  
  // Configuration
  JWT_CONFIG
}