// app/lib/admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Admin JWT secret
const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET!
)

// Admin routes configuration
export const ADMIN_ROUTES = {
  // Auth routes (public)
  LOGIN: '/admin/auth/login',
  LOGOUT: '/admin/auth/logout',
  
  // Protected admin routes
  DASHBOARD: '/admin/dashboard',
  RENTALS: '/admin/rentals',
  TRIPS: '/admin/rentals/trips',
  VERIFICATIONS: '/admin/rentals/verifications',
  SYSTEM: '/admin/system',
  ANALYTICS: '/admin/analytics',
  
  // API routes
  API_PREFIX: '/api/admin/',
  API_AUTH_PREFIX: '/api/admin/auth/',
}

// Route protection levels
export const PROTECTION_LEVELS = {
  PUBLIC: ['admin/auth/login'], // No auth required
  ADMIN_ONLY: ['admin/dashboard', 'admin/rentals', 'admin/system', 'admin/analytics'],
  SUPER_ADMIN: ['admin/system/config', 'admin/system/users'], // Future: super admin routes
}

/**
 * Check if a route requires admin authentication
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin/') && !pathname.startsWith('/admin/auth/login')
}

/**
 * Check if a route is an admin API route
 */
export function isAdminApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/auth/login')
}

/**
 * Verify admin token from request
 */
export async function verifyAdminRequest(request: NextRequest): Promise<{
  isValid: boolean
  payload?: any
  error?: string
}> {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('adminAccessToken')
    
    if (!adminToken) {
      return {
        isValid: false,
        error: 'No admin token found'
      }
    }
    
    // Verify the token
    const { payload } = await jwtVerify(adminToken.value, ADMIN_JWT_SECRET)
    
    // Check token type
    if (payload.type !== 'admin') {
      return {
        isValid: false,
        error: 'Invalid token type'
      }
    }
    
    // Check role
    if (payload.role !== 'ADMIN') {
      return {
        isValid: false,
        error: 'Insufficient permissions'
      }
    }
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return {
        isValid: false,
        error: 'Token expired'
      }
    }
    
    return {
      isValid: true,
      payload
    }
    
  } catch (error) {
    console.error('Admin token verification error:', error)
    return {
      isValid: false,
      error: 'Token verification failed'
    }
  }
}

/**
 * Create admin auth redirect response
 */
export function createAdminAuthRedirect(
  request: NextRequest,
  reason?: string
): NextResponse {
  const url = new URL(ADMIN_ROUTES.LOGIN, request.url)
  
  // Add return URL as query parameter
  const returnUrl = request.nextUrl.pathname + request.nextUrl.search
  if (returnUrl && returnUrl !== ADMIN_ROUTES.LOGIN) {
    url.searchParams.set('returnUrl', returnUrl)
  }
  
  // Add reason if provided
  if (reason) {
    url.searchParams.set('reason', reason)
  }
  
  // Create redirect response
  const response = NextResponse.redirect(url)
  
  // Clear invalid cookies
  response.cookies.set('adminAccessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
  
  response.cookies.set('adminRefreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
  
  return response
}

/**
 * Check if admin session needs refresh
 */
export async function checkAdminSessionRefresh(
  request: NextRequest
): Promise<boolean> {
  try {
    const adminToken = request.cookies.get('adminAccessToken')
    
    if (!adminToken) {
      return false
    }
    
    const { payload } = await jwtVerify(adminToken.value, ADMIN_JWT_SECRET)
    
    // Check if token expires in less than 30 minutes
    const now = Math.floor(Date.now() / 1000)
    const exp = payload.exp as number
    const minutesUntilExpiry = Math.floor((exp - now) / 60)
    
    return minutesUntilExpiry < 30 && minutesUntilExpiry > 0
    
  } catch (error) {
    return false
  }
}

/**
 * Apply admin security headers
 */
export function applyAdminSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers for admin routes
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Cache control for admin routes (no caching)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  // Admin area indicator
  response.headers.set('X-Admin-Area', 'true')
  
  return response
}

/**
 * Log admin access attempt
 */
export async function logAdminAccess(
  pathname: string,
  userId?: string,
  allowed: boolean = true
): Promise<void> {
  try {
    // In production, you'd log to your database
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      pathname,
      userId: userId || 'anonymous',
      allowed,
      type: 'admin_access'
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Admin Access]', logEntry)
    }
    
    // TODO: In production, save to database
    // await prisma.auditLog.create({ data: ... })
    
  } catch (error) {
    console.error('Failed to log admin access:', error)
  }
}

/**
 * Rate limiting for admin routes
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkAdminRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || record.resetTime < now) {
    // Create new record or reset expired one
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (record.count >= limit) {
    // Rate limit exceeded
    console.warn(`Admin rate limit exceeded for: ${identifier}`)
    return false
  }
  
  // Increment count
  record.count++
  return true
}

/**
 * Clean expired rate limit records (call periodically)
 */
export function cleanRateLimitRecords(): void {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (record.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
}