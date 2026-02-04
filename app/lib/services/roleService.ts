// app/lib/services/roleService.ts
// Centralized role management service for dual-role authentication
// Handles all role switching, detection, and cookie management

import { NextRequest, NextResponse } from 'next/server'
import { verify, TokenExpiredError } from 'jsonwebtoken'

// JWT secrets
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const GUEST_JWT_SECRET = process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'

// ============================================
// TYPES
// ============================================

export type RoleMode = 'host' | 'guest'

export interface DecodedToken {
  userId: string
  email?: string
  hostId?: string
  role?: string
  isRentalHost?: boolean
  [key: string]: unknown
}

export interface TokenDecodeResult {
  userId: string | null
  valid: boolean
  expired: boolean
  isRentalHost: boolean
}

export interface RoleDetectionResult {
  currentRole: RoleMode | null
  primaryUserId: string | null
  hasValidHostToken: boolean
  hasValidGuestToken: boolean
  tokensFromDifferentUsers: boolean
}

// ============================================
// COOKIE NAMES (centralized)
// ============================================

export const COOKIE_NAMES = {
  // Mode indicator (authoritative source for current role)
  CURRENT_MODE: 'current_mode',

  // Host cookies
  HOST_ACCESS_TOKEN: 'hostAccessToken',
  HOST_REFRESH_TOKEN: 'hostRefreshToken',
  PARTNER_TOKEN: 'partner_token',

  // Guest cookies
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken'
} as const

// ============================================
// TOKEN UTILITIES
// ============================================

/**
 * Safely decode a JWT token, trying both platform and guest secrets
 * Returns information about the token including whether it's a host token
 */
export function decodeToken(token: string | undefined, tokenName: string): TokenDecodeResult {
  if (!token || token.length < 10) {
    return { userId: null, valid: false, expired: false, isRentalHost: false }
  }

  const secrets = [JWT_SECRET, GUEST_JWT_SECRET]

  for (const secret of secrets) {
    try {
      const decoded = verify(token, secret) as DecodedToken
      const userId = decoded.userId || decoded.hostId || null
      // Detect if this is a host token (has isRentalHost flag or BUSINESS role)
      const isRentalHost = decoded.isRentalHost === true || decoded.role === 'BUSINESS'
      return { userId, valid: true, expired: false, isRentalHost }
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return { userId: null, valid: false, expired: true, isRentalHost: false }
      }
      continue
    }
  }

  console.log(`[RoleService] ${tokenName} JWT invalid with all secrets`)
  return { userId: null, valid: false, expired: false, isRentalHost: false }
}

// ============================================
// COOKIE UTILITIES
// ============================================

/**
 * Get the current mode from the authoritative cookie
 */
export function getCurrentModeFromCookie(request: NextRequest): RoleMode | null {
  const modeCookie = request.cookies.get(COOKIE_NAMES.CURRENT_MODE)?.value
  if (modeCookie === 'host' || modeCookie === 'guest') {
    return modeCookie
  }
  return null
}

/**
 * Read all auth-related cookies from request
 */
export function readAuthCookies(request: NextRequest) {
  return {
    currentMode: request.cookies.get(COOKIE_NAMES.CURRENT_MODE)?.value as RoleMode | undefined,
    hostAccessToken: request.cookies.get(COOKIE_NAMES.HOST_ACCESS_TOKEN)?.value,
    hostRefreshToken: request.cookies.get(COOKIE_NAMES.HOST_REFRESH_TOKEN)?.value,
    partnerToken: request.cookies.get(COOKIE_NAMES.PARTNER_TOKEN)?.value,
    accessToken: request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value,
    refreshToken: request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value
  }
}

/**
 * Clear a cookie by setting maxAge to 0
 */
export function clearCookie(response: NextResponse, cookieName: string): void {
  response.cookies.set(cookieName, '', {
    httpOnly: cookieName !== COOKIE_NAMES.CURRENT_MODE, // current_mode is readable by client
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
}

/**
 * Set the current mode cookie
 */
export function setCurrentModeCookie(response: NextResponse, mode: RoleMode): void {
  response.cookies.set(COOKIE_NAMES.CURRENT_MODE, mode, {
    httpOnly: false, // Allow client-side JS to read for instant UI updates
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })
  console.log(`[RoleService] Set ${COOKIE_NAMES.CURRENT_MODE}=${mode}`)
}

/**
 * Clear all host-related cookies
 */
export function clearHostCookies(response: NextResponse): void {
  clearCookie(response, COOKIE_NAMES.HOST_ACCESS_TOKEN)
  clearCookie(response, COOKIE_NAMES.HOST_REFRESH_TOKEN)
  clearCookie(response, COOKIE_NAMES.PARTNER_TOKEN)
  console.log('[RoleService] Cleared host cookies')
}

/**
 * Clear all guest-related cookies
 */
export function clearGuestCookies(response: NextResponse): void {
  clearCookie(response, COOKIE_NAMES.ACCESS_TOKEN)
  clearCookie(response, COOKIE_NAMES.REFRESH_TOKEN)
  console.log('[RoleService] Cleared guest cookies')
}

/**
 * Clear all auth cookies (for logout or security issues)
 */
export function clearAllAuthCookies(response: NextResponse): void {
  clearHostCookies(response)
  clearGuestCookies(response)
  clearCookie(response, COOKIE_NAMES.CURRENT_MODE)
  console.log('[RoleService] Cleared all auth cookies')
}

// ============================================
// ROLE DETECTION
// ============================================

/**
 * Detect the current role based on cookies
 * Priority:
 * 1. current_mode cookie (explicit user choice)
 * 2. Token content analysis (fallback for initial login)
 */
export function detectCurrentRole(request: NextRequest): RoleDetectionResult {
  const cookies = readAuthCookies(request)

  // Decode all tokens
  const hostToken = decodeToken(cookies.hostAccessToken, 'hostAccessToken')
  const partnerToken = decodeToken(cookies.partnerToken, 'partner_token')
  const accessToken = decodeToken(cookies.accessToken, 'accessToken')

  // Collect valid user IDs
  const validTokens: { source: string; userId: string }[] = []
  if (hostToken.valid && hostToken.userId) {
    validTokens.push({ source: 'host', userId: hostToken.userId })
  }
  if (partnerToken.valid && partnerToken.userId) {
    validTokens.push({ source: 'partner', userId: partnerToken.userId })
  }
  if (accessToken.valid && accessToken.userId) {
    validTokens.push({ source: 'access', userId: accessToken.userId })
  }

  // Check if tokens are from different users (security issue)
  const uniqueUserIds = [...new Set(validTokens.map(t => t.userId))]
  const tokensFromDifferentUsers = uniqueUserIds.length > 1

  if (tokensFromDifferentUsers) {
    console.warn('[RoleService] Security: Multiple user IDs in cookies!', validTokens)
  }

  // Determine primary user ID
  const primaryUserId = accessToken.userId || hostToken.userId || partnerToken.userId || null

  // PRIORITY 1: Use current_mode cookie if set (explicit user choice)
  if (cookies.currentMode === 'host' || cookies.currentMode === 'guest') {
    console.log(`[RoleService] Using current_mode cookie: ${cookies.currentMode}`)
    return {
      currentRole: cookies.currentMode,
      primaryUserId,
      hasValidHostToken: hostToken.valid || partnerToken.valid,
      hasValidGuestToken: accessToken.valid && !accessToken.isRentalHost,
      tokensFromDifferentUsers
    }
  }

  // PRIORITY 2: Fallback to token-based detection (for initial login before role switch)
  let currentRole: RoleMode | null = null

  // Check if hostAccessToken or partner_token is valid
  if (hostToken.valid || partnerToken.valid) {
    currentRole = 'host'
  }
  // Check if accessToken is valid and is a host token (backward compat from switch-role)
  else if (accessToken.valid && accessToken.isRentalHost) {
    currentRole = 'host'
    console.log('[RoleService] accessToken contains host token (isRentalHost=true)')
  }
  // Check if accessToken is valid and is NOT a host token (genuine guest token)
  else if (accessToken.valid && !accessToken.isRentalHost) {
    currentRole = 'guest'
  }

  console.log(`[RoleService] Token-based detection: currentRole=${currentRole}`)

  return {
    currentRole,
    primaryUserId,
    hasValidHostToken: hostToken.valid || partnerToken.valid || (accessToken.valid && accessToken.isRentalHost),
    hasValidGuestToken: accessToken.valid && !accessToken.isRentalHost,
    tokensFromDifferentUsers
  }
}

// ============================================
// COOKIE CONFIGURATION
// ============================================

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/'
}

export const ACCESS_TOKEN_MAX_AGE = 15 * 60 // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 days
