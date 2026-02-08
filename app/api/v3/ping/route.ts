// app/api/v3/ping/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Track request counts for rate limiting (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'Too many requests from this IP, please try again later'
}

// Get client IP from various headers (works with proxies/load balancers)
async function getClientIp(): Promise<string> {
  const headersList = await headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const clientIp = headersList.get('x-client-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  if (realIp) {
    return realIp.trim()
  }
  if (clientIp) {
    return clientIp.trim()
  }
  
  return '127.0.0.1'
}

// Simple rate limiter
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const userLimit = requestCounts.get(ip)
  
  if (!userLimit || now > userLimit.resetTime) {
    // Create new window
    const resetTime = now + RATE_LIMIT.windowMs
    requestCounts.set(ip, { count: 1, resetTime })
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1, resetTime }
  }
  
  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: userLimit.resetTime }
  }
  
  userLimit.count++
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - userLimit.count, resetTime: userLimit.resetTime }
}

// Clean up old entries periodically (prevent memory leak)
setInterval(() => {
  const now = Date.now()
  for (const [ip, limit] of requestCounts.entries()) {
    if (now > limit.resetTime) {
      requestCounts.delete(ip)
    }
  }
}, 60000) // Clean every minute

export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    // Get client IP for rate limiting
    const clientIp = await getClientIp()
    
    // Check rate limit
    const { allowed, remaining, resetTime } = checkRateLimit(clientIp)
    
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: RATE_LIMIT.message,
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(resetTime),
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime
    
    // Build successful response
    const response = {
      pong: true,
      timestamp: new Date().toISOString(),
      service: 'itwhip-api-v3',
      region: process.env.VERCEL_REGION || 'us-west',
      responseTime: `${responseTime}ms`,
      clientIp: process.env.NODE_ENV === 'production' ? undefined : clientIp, // Only show in dev
      headers: {
        rateLimit: {
          limit: RATE_LIMIT.maxRequests,
          remaining: remaining,
          reset: new Date(resetTime).toISOString()
        }
      }
    }
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`,
        'X-RateLimit-Limit': String(RATE_LIMIT.maxRequests),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(resetTime),
        'X-Service-Name': 'itwhip-api-v3',
        'X-Service-Region': process.env.VERCEL_REGION || 'us-west',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      }
    })
    
  } catch (error) {
    console.error('Ping endpoint error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    }
  })
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'Only GET requests are supported' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'Only GET requests are supported' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method Not Allowed', message: 'Only GET requests are supported' },
    { status: 405 }
  )
}