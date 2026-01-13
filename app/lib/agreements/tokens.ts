// app/lib/agreements/tokens.ts
// Secure token generation and validation for e-signature signing links

import { randomBytes } from 'crypto'

const TOKEN_LENGTH = 32 // 256 bits of entropy
const TOKEN_EXPIRY_DAYS = 7

/**
 * Generate a cryptographically secure random token for agreement signing
 * Format: Base64 URL-safe string (no +, /, or = characters)
 */
export function generateAgreementToken(): string {
  const buffer = randomBytes(TOKEN_LENGTH)
  // Convert to base64url format (URL-safe)
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Calculate the expiry date for a new token
 */
export function getTokenExpiryDate(days: number = TOKEN_EXPIRY_DAYS): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + days)
  return expiry
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true
  return new Date() > new Date(expiryDate)
}

/**
 * Generate the full signing URL for a booking
 */
export function generateSigningUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
  return `${baseUrl}/sign/${token}`
}

/**
 * Validate token format (basic validation)
 * Returns true if the token appears to be a valid format
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  // Should be URL-safe base64 with specific length
  // 32 bytes = 43 characters in base64url (without padding)
  const base64UrlRegex = /^[A-Za-z0-9_-]{40,50}$/
  return base64UrlRegex.test(token)
}

/**
 * Extract client info from request for audit trail
 */
export function extractClientInfo(request: Request): {
  ipAddress: string
  userAgent: string
} {
  // Try various headers for IP address (handles proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

  let ipAddress = 'unknown'
  if (cfConnectingIp) {
    ipAddress = cfConnectingIp
  } else if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first (client)
    ipAddress = forwardedFor.split(',')[0].trim()
  } else if (realIp) {
    ipAddress = realIp
  }

  const userAgent = request.headers.get('user-agent') || 'unknown'

  return { ipAddress, userAgent }
}

export const AGREEMENT_TOKEN_CONFIG = {
  tokenLength: TOKEN_LENGTH,
  expiryDays: TOKEN_EXPIRY_DAYS
}
