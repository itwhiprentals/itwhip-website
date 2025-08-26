/**
 * Security Middleware for ItWhip Platform
 * Implements security headers, CORS, CSRF protection, and input sanitization
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { detectAnomaly } from '@/app/lib/security/anomaly'
import { createSecurityEvent } from '@/app/lib/database/audit'
import type { ThreatSeverity, AttackType } from '@/app/types/security'

// Security configuration
const SECURITY_CONFIG = {
  // CORS settings
  cors: {
    allowedOrigins: [
      'https://itwhip.com',
      'https://www.itwhip.com',
      'https://portal.itwhip.com',
      'http://localhost:3000', // Development
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-CSRF-Token',
      'X-Request-ID',
      'X-SDK-Version'
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Request-ID',
      'X-Response-Time'
    ],
    credentials: true,
    maxAge: 86400 // 24 hours
  },
  
  // CSP Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': ["'self'", 'https://api.mapbox.com', 'https://test.api.amadeus.com'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': []
  },
  
  // Security headers
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'X-DNS-Prefetch-Control': 'on',
    'X-Permitted-Cross-Domain-Policies': 'none'
  },
  
  // Request size limits
  limits: {
    maxBodySize: 10 * 1024 * 1024, // 10MB
    maxUrlLength: 2048,
    maxHeaderSize: 8192,
    maxParameterCount: 100
  },
  
  // Dangerous patterns
  dangerousPatterns: {
    sql: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi,
      /(--|\||;|\/\*|\*\/)/g,
      /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
      /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
      /(['"])\s*OR\s*\1\s*=\s*\1/gi
    ],
    xss: [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<embed[^>]*>/gi,
      /<object[^>]*>/gi
    ],
    pathTraversal: [
      /\.\.\//g,
      /\.\.%2f/gi,
      /%2e%2e\//gi,
      /\.\.\\/g
    ],
    cmdInjection: [
      /[;&|`$]/g,
      /\$\(.*\)/g,
      /`.*`/g
    ]
  }
}

/**
 * Generate Content Security Policy header
 */
function generateCSP(): string {
  return Object.entries(SECURITY_CONFIG.csp)
    .map(([directive, values]) => {
      if (values.length === 0) return directive
      return `${directive} ${values.join(' ')}`
    })
    .join('; ')
}

/**
 * Check if origin is allowed for CORS
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  
  // Check exact match
  if (SECURITY_CONFIG.cors.allowedOrigins.includes(origin)) {
    return true
  }
  
  // Check for subdomain wildcards in production
  if (process.env.NODE_ENV === 'production') {
    const url = new URL(origin)
    if (url.hostname.endsWith('.itwhip.com')) {
      return true
    }
  }
  
  return false
}

/**
 * Generate CSRF token
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Verify CSRF token
 */
function verifyCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(sessionToken)
  )
}

/**
 * Sanitize input to prevent injection attacks
 */
function sanitizeInput(input: string, type: 'sql' | 'xss' | 'path' | 'cmd' = 'xss'): string {
  let sanitized = input
  
  // Remove dangerous patterns based on type
  const patterns = SECURITY_CONFIG.dangerousPatterns[type] || SECURITY_CONFIG.dangerousPatterns.xss
  
  patterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })
  
  // Additional sanitization
  switch (type) {
    case 'sql':
      // Escape single quotes
      sanitized = sanitized.replace(/'/g, "''")
      break
    case 'xss':
      // HTML entity encoding
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
      break
    case 'path':
      // Remove path traversal attempts
      sanitized = sanitized.replace(/[^a-zA-Z0-9\-_.]/g, '')
      break
    case 'cmd':
      // Remove command injection characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.]/g, '')
      break
  }
  
  return sanitized
}

/**
 * Check for attack patterns in request
 */
async function detectAttackPatterns(
  request: NextRequest
): Promise<{ detected: boolean; type?: AttackType; confidence: number }> {
  const url = request.nextUrl.toString()
  const body = await request.text()
  const headers = Object.fromEntries(request.headers.entries())
  
  // Check URL
  if (url.length > SECURITY_CONFIG.limits.maxUrlLength) {
    return { detected: true, type: 'BOT', confidence: 90 }
  }
  
  // Check for SQL injection
  for (const pattern of SECURITY_CONFIG.dangerousPatterns.sql) {
    if (pattern.test(url) || pattern.test(body)) {
      return { detected: true, type: 'SQL_INJECTION', confidence: 95 }
    }
  }
  
  // Check for XSS
  for (const pattern of SECURITY_CONFIG.dangerousPatterns.xss) {
    if (pattern.test(body) || pattern.test(url)) {
      return { detected: true, type: 'XSS', confidence: 95 }
    }
  }
  
  // Check for path traversal
  for (const pattern of SECURITY_CONFIG.dangerousPatterns.pathTraversal) {
    if (pattern.test(url)) {
      return { detected: true, type: 'BOT', confidence: 85 }
    }
  }
  
  // Check headers for suspicious patterns
  const suspiciousHeaders = ['X-Forwarded-Host', 'X-Original-URL', 'X-Rewrite-URL']
  for (const header of suspiciousHeaders) {
    if (headers[header.toLowerCase()]) {
      return { detected: true, type: 'BOT', confidence: 70 }
    }
  }
  
  return { detected: false, confidence: 0 }
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
 * Main security middleware
 */
export async function securityMiddleware(
  request: NextRequest,
  options?: {
    skipCSRF?: boolean
    skipAttackDetection?: boolean
    requireHTTPS?: boolean
    customHeaders?: Record<string, string>
  }
): Promise<NextResponse | null> {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  const clientIp = getClientIp(request)
  const origin = request.headers.get('origin')
  const method = request.method
  const pathname = request.nextUrl.pathname
  
  try {
    // Check HTTPS requirement
    if (options?.requireHTTPS && process.env.NODE_ENV === 'production') {
      if (request.headers.get('x-forwarded-proto') !== 'https') {
        return NextResponse.json(
          {
            error: 'HTTPS required',
            message: 'This API endpoint requires a secure connection',
            code: 'HTTPS_REQUIRED'
          },
          { status: 403 }
        )
      }
    }
    
    // Detect attack patterns
    if (!options?.skipAttackDetection) {
      const attack = await detectAttackPatterns(request)
      
      if (attack.detected) {
        // Log security event
        await createSecurityEvent({
          type: 'attack_detected',
          severity: 'HIGH' as ThreatSeverity,
          sourceIp: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          message: `${attack.type} attack detected`,
          targetResource: pathname,
          action: 'block',
          blocked: true,
          details: {
            attackType: attack.type,
            confidence: attack.confidence,
            method,
            url: request.nextUrl.toString()
          }
        })
        
        // Also check with anomaly detection
        await detectAnomaly({
          type: 'attack',
          identifier: clientIp,
          details: {
            attackType: attack.type,
            url: request.nextUrl.toString(),
            confidence: attack.confidence
          }
        })
        
        return NextResponse.json(
          {
            error: 'Security violation',
            message: 'Request blocked due to security policy',
            code: 'SECURITY_VIOLATION'
          },
          { status: 403 }
        )
      }
    }
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      
      // Add CORS headers
      if (origin && isAllowedOrigin(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      } else if (!origin) {
        // Allow requests without origin (server-to-server)
        response.headers.set('Access-Control-Allow-Origin', '*')
      }
      
      response.headers.set('Access-Control-Allow-Methods', SECURITY_CONFIG.cors.allowedMethods.join(', '))
      response.headers.set('Access-Control-Allow-Headers', SECURITY_CONFIG.cors.allowedHeaders.join(', '))
      response.headers.set('Access-Control-Max-Age', SECURITY_CONFIG.cors.maxAge.toString())
      
      return response
    }
    
    // CSRF protection for state-changing methods
    if (!options?.skipCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfToken = request.headers.get('x-csrf-token')
      
      // Skip CSRF for API key authentication
      const hasApiKey = request.headers.get('x-api-key')
      
      if (!hasApiKey && !csrfToken) {
        // Public endpoints don't need CSRF
        const publicEndpoints = ['/api/v3/auth/login', '/api/v3/auth/register']
        if (!publicEndpoints.includes(pathname)) {
          return NextResponse.json(
            {
              error: 'CSRF token required',
              message: 'Missing CSRF token for state-changing request',
              code: 'CSRF_REQUIRED'
            },
            { status: 403 }
          )
        }
      }
    }
    
    // Check request size limits
    const contentLength = parseInt(request.headers.get('content-length') || '0')
    if (contentLength > SECURITY_CONFIG.limits.maxBodySize) {
      return NextResponse.json(
        {
          error: 'Request too large',
          message: `Request body exceeds maximum size of ${SECURITY_CONFIG.limits.maxBodySize} bytes`,
          code: 'PAYLOAD_TOO_LARGE'
        },
        { status: 413 }
      )
    }
    
    // Create response with security headers
    const headers = new Headers()
    
    // Add security headers
    Object.entries(SECURITY_CONFIG.headers).forEach(([key, value]) => {
      headers.set(key, value)
    })
    
    // Add CSP header
    headers.set('Content-Security-Policy', generateCSP())
    
    // Add CORS headers
    if (origin && isAllowedOrigin(origin)) {
      headers.set('Access-Control-Allow-Origin', origin)
      headers.set('Access-Control-Allow-Credentials', 'true')
    } else if (!origin) {
      // Allow server-to-server requests
      headers.set('Access-Control-Allow-Origin', '*')
    }
    
    headers.set('Access-Control-Expose-Headers', SECURITY_CONFIG.cors.exposedHeaders.join(', '))
    
    // Add request tracking headers
    headers.set('X-Request-ID', requestId)
    headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
    
    // Add custom headers if provided
    if (options?.customHeaders) {
      Object.entries(options.customHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
    }
    
    // Remove sensitive headers from response
    headers.delete('X-Powered-By')
    headers.delete('Server')
    
    // Continue with the request
    return NextResponse.next({
      request: {
        headers: request.headers
      },
      headers
    })
    
  } catch (error) {
    console.error('Security middleware error:', error)
    
    // Log error
    await createSecurityEvent({
      type: 'middleware_error',
      severity: 'CRITICAL' as ThreatSeverity,
      sourceIp: clientIp,
      userAgent: request.headers.get('user-agent') || 'unknown',
      message: 'Security middleware error',
      targetResource: pathname,
      action: 'error',
      blocked: false,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
    
    return NextResponse.json(
      {
        error: 'Security error',
        message: 'An error occurred during security validation',
        code: 'SECURITY_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * Input sanitization helper
 */
export function sanitizeRequest(body: any): any {
  if (typeof body === 'string') {
    return sanitizeInput(body)
  }
  
  if (Array.isArray(body)) {
    return body.map(item => sanitizeRequest(item))
  }
  
  if (typeof body === 'object' && body !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(body)) {
      // Sanitize key
      const sanitizedKey = sanitizeInput(key, 'xss')
      // Recursively sanitize value
      sanitized[sanitizedKey] = sanitizeRequest(value)
    }
    return sanitized
  }
  
  return body
}

/**
 * Generate and attach CSRF token
 */
export function attachCSRFToken(response: NextResponse): NextResponse {
  const token = generateCSRFToken()
  
  // Set as cookie (httpOnly for security)
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400 // 24 hours
  })
  
  // Also add to header for SPA usage
  response.headers.set('X-CSRF-Token', token)
  
  return response
}

export default securityMiddleware