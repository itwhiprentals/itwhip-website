/**
 * Authentication Middleware for ItWhip Platform
 * Validates JWT tokens and API keys for all protected routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, verifyApiKey, extractTokenFromHeader } from '@/app/lib/auth/jwt'
import { checkRateLimit } from '@/app/lib/security/rateLimit'
import { createAuditLog } from '@/app/lib/database/audit'
import type { UserRole, Permission } from '@/app/types/auth'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/v3/status',
  '/api/v3/ping',
  '/api/v3/version',
  '/api/v3/auth/login',
  '/api/v3/auth/register',
  '/api/v3/hotels/search', // Allow anonymous search
]

// Routes that require specific permissions
const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/api/v3/rides/create': ['rides.create'],
  '/api/v3/rides/cancel': ['rides.cancel'],
  '/api/v3/bookings/create': ['bookings.create'],
  '/api/v3/bookings/modify': ['bookings.modify'],
  '/api/v3/revenue/withdraw': ['revenue.withdraw'],
  '/api/v3/compliance/report': ['compliance.view'],
  '/api/v3/drivers/manage': ['drivers.manage'],
  '/api/v3/analytics/export': ['analytics.export'],
}

// Routes that require specific roles
const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/api/v3/admin': ['ADMIN'],
  '/api/v3/revenue': ['STARTER', 'BUSINESS', 'ENTERPRISE', 'ADMIN'],
  '/api/v3/compliance': ['BUSINESS', 'ENTERPRISE', 'ADMIN'],
  '/api/v3/drivers': ['STARTER', 'BUSINESS', 'ENTERPRISE', 'ADMIN'],
}

/**
 * Extract credentials from request
 */
function extractCredentials(request: NextRequest): {
  type: 'jwt' | 'apikey' | 'none'
  credential?: string
} {
  const authHeader = request.headers.get('authorization')
  const apiKeyHeader = request.headers.get('x-api-key')
  
  if (authHeader?.startsWith('Bearer ')) {
    return { type: 'jwt', credential: authHeader.substring(7) }
  }
  
  if (apiKeyHeader) {
    return { type: 'apikey', credential: apiKeyHeader }
  }
  
  // Check URL params (not recommended but supported)
  const apiKeyParam = request.nextUrl.searchParams.get('api_key')
  if (apiKeyParam) {
    return { type: 'apikey', credential: apiKeyParam }
  }
  
  return { type: 'none' }
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    return pathname === route
  })
}

/**
 * Check if user has required permissions for route
 */
function hasRoutePermissions(
  permissions: Permission[],
  pathname: string
): boolean {
  const requiredPermissions = ROUTE_PERMISSIONS[pathname]
  if (!requiredPermissions) return true
  
  return requiredPermissions.every(req => permissions.includes(req))
}

/**
 * Check if user has required role for route
 */
function hasRouteRole(role: UserRole, pathname: string): boolean {
  const requiredRoles = ROUTE_ROLES[pathname]
  if (!requiredRoles) return true
  
  return requiredRoles.includes(role)
}

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (real) return real.trim()
  
  return '127.0.0.1'
}

/**
 * Main authentication middleware
 */
export async function authMiddleware(
  request: NextRequest,
  options?: {
    requireAuth?: boolean
    requiredPermissions?: Permission[]
    requiredRoles?: UserRole[]
    skipRateLimit?: boolean
  }
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname
  const method = request.method
  const clientIp = getClientIp(request)
  
  try {
    // Check if route is public
    if (!options?.requireAuth && isPublicRoute(pathname)) {
      return null // Allow request to proceed
    }
    
    // Extract credentials
    const { type, credential } = extractCredentials(request)
    
    // No credentials provided
    if (type === 'none') {
      await createAuditLog({
        category: 'AUTHENTICATION',
        eventType: 'auth.failed',
        severity: 'MEDIUM',
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'deny',
        resource: pathname,
        details: { reason: 'No credentials provided' }
      })
      
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'Please provide valid credentials',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      )
    }
    
    // Validate credentials
    let user: any = null
    let rateLimit: any = null
    
    if (type === 'jwt' && credential) {
      const validation = await verifyAccessToken(credential)
      
      if (!validation.valid) {
        await createAuditLog({
          category: 'AUTHENTICATION',
          eventType: 'auth.failed',
          severity: 'HIGH',
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          action: 'deny',
          resource: pathname,
          details: { 
            reason: validation.error,
            expired: validation.expired 
          }
        })
        
        return NextResponse.json(
          {
            error: validation.expired ? 'Token expired' : 'Invalid token',
            message: validation.error,
            code: validation.expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
          },
          { status: 401 }
        )
      }
      
      user = validation.payload
      
    } else if (type === 'apikey' && credential) {
      const validation = await verifyApiKey(credential)
      
      if (!validation.valid) {
        await createAuditLog({
          category: 'AUTHENTICATION',
          eventType: 'auth.failed',
          severity: 'HIGH',
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          action: 'deny',
          resource: pathname,
          details: { 
            reason: validation.error,
            apiKey: credential.substring(0, 20) + '...'
          }
        })
        
        return NextResponse.json(
          {
            error: 'Invalid API key',
            message: validation.error,
            code: 'INVALID_API_KEY'
          },
          { status: 401 }
        )
      }
      
      user = validation.payload
    }
    
    // Check permissions
    if (user) {
      // Check route-specific permissions
      if (!hasRoutePermissions(user.permissions || [], pathname)) {
        await createAuditLog({
          category: 'AUTHORIZATION',
          eventType: 'auth.permission_denied',
          severity: 'MEDIUM',
          userId: user.sub || user.hotelId,
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          action: 'deny',
          resource: pathname,
          details: { 
            required: ROUTE_PERMISSIONS[pathname],
            had: user.permissions 
          }
        })
        
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            message: 'You do not have permission to access this resource',
            code: 'PERMISSION_DENIED'
          },
          { status: 403 }
        )
      }
      
      // Check role requirements
      if (!hasRouteRole(user.role, pathname)) {
        await createAuditLog({
          category: 'AUTHORIZATION',
          eventType: 'auth.role_denied',
          severity: 'MEDIUM',
          userId: user.sub || user.hotelId,
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          action: 'deny',
          resource: pathname,
          details: { 
            required: ROUTE_ROLES[pathname],
            had: user.role 
          }
        })
        
        return NextResponse.json(
          {
            error: 'Insufficient role',
            message: 'Your account tier does not have access to this feature',
            code: 'ROLE_DENIED'
          },
          { status: 403 }
        )
      }
      
      // Check additional permission requirements
      if (options?.requiredPermissions) {
        const hasAll = options.requiredPermissions.every(
          p => user.permissions?.includes(p)
        )
        
        if (!hasAll) {
          return NextResponse.json(
            {
              error: 'Missing required permissions',
              message: 'Additional permissions required for this action',
              code: 'PERMISSION_DENIED'
            },
            { status: 403 }
          )
        }
      }
      
      // Check additional role requirements
      if (options?.requiredRoles) {
        if (!options.requiredRoles.includes(user.role)) {
          return NextResponse.json(
            {
              error: 'Invalid role',
              message: 'This action requires a different account tier',
              code: 'ROLE_DENIED'
            },
            { status: 403 }
          )
        }
      }
    }
    
    // Check rate limits
    if (!options?.skipRateLimit) {
      const identifier = user?.sub || user?.hotelId || clientIp
      const role = user?.role || 'ANONYMOUS'
      
      rateLimit = await checkRateLimit(identifier, role, pathname, clientIp)
      
      if (rateLimit.status === 'exceeded' || rateLimit.status === 'banned') {
        await createAuditLog({
          category: 'SECURITY',
          eventType: 'rate_limit.exceeded',
          severity: 'HIGH',
          userId: user?.sub,
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          action: 'block',
          resource: pathname,
          details: { 
            limit: rateLimit.limit,
            status: rateLimit.status 
          }
        })
        
        const response = NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: rateLimit.message || 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((rateLimit.reset.getTime() - Date.now()) / 1000)
          },
          { status: 429 }
        )
        
        // Add rate limit headers
        if (rateLimit.headers) {
          Object.entries(rateLimit.headers).forEach(([key, value]) => {
            response.headers.set(key, value as string)
          })
        }
        
        return response
      }
    }
    
    // Success - Log access
    await createAuditLog({
      category: 'DATA_ACCESS',
      eventType: 'api.access',
      severity: 'LOW',
      userId: user?.sub || user?.hotelId,
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || 'unknown',
      action: 'allow',
      resource: pathname,
      details: { 
        method,
        role: user?.role,
        tier: user?.tier 
      }
    })
    
    // Add user context to request for downstream use
    if (user) {
      // Clone the request and add user context
      const headers = new Headers(request.headers)
      headers.set('x-user-id', user.sub || user.hotelId || '')
      headers.set('x-user-role', user.role || 'ANONYMOUS')
      headers.set('x-user-tier', user.tier || 'NONE')
      headers.set('x-hotel-id', user.hotelId || '')
      
      // Add rate limit info
      if (rateLimit?.headers) {
        Object.entries(rateLimit.headers).forEach(([key, value]) => {
          headers.set(key, value as string)
        })
      }
      
      return NextResponse.next({
        request: {
          headers
        }
      })
    }
    
    return null // Allow request to proceed
    
  } catch (error) {
    console.error('Auth middleware error:', error)
    
    await createAuditLog({
      category: 'SECURITY',
      eventType: 'auth.error',
      severity: 'CRITICAL',
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || 'unknown',
      action: 'error',
      resource: pathname,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    })
    
    return NextResponse.json(
      {
        error: 'Authentication error',
        message: 'An error occurred during authentication',
        code: 'AUTH_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * Simplified middleware for Next.js middleware.ts
 */
export function withAuth(
  handler: (request: NextRequest, user?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResponse = await authMiddleware(request)
    
    if (authResponse) {
      return authResponse // Return error response
    }
    
    // Extract user from headers (set by authMiddleware)
    const user = {
      id: request.headers.get('x-user-id'),
      role: request.headers.get('x-user-role'),
      tier: request.headers.get('x-user-tier'),
      hotelId: request.headers.get('x-hotel-id')
    }
    
    return handler(request, user)
  }
}

export default authMiddleware