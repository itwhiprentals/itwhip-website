// app/api/v3/auth/validate/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

// Types for authentication
interface TokenPayload {
  sub: string // Subject (user/hotel/driver ID)
  type: 'user' | 'hotel' | 'driver' | 'admin'
  email?: string
  permissions: string[]
  iat: number // Issued at
  exp: number // Expiration
  jti?: string // JWT ID for tracking
}

interface ApiKeyData {
  id: string
  name: string
  type: 'hotel' | 'developer' | 'partner'
  permissions: string[]
  rateLimit: number
  validFrom: string
  validUntil?: string
  lastUsed?: string
  usage: number
}

// Mock JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET!

// Mock database of valid API keys (in production, use real database)
const VALID_API_KEYS: Record<string, ApiKeyData> = {
  'sk_live_hotel_hilton_phx_2024': {
    id: 'key_001',
    name: 'Hilton Phoenix Airport',
    type: 'hotel',
    permissions: ['rides.create', 'rides.read', 'analytics.read', 'drivers.read'],
    rateLimit: 5000,
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    usage: 0
  },
  'sk_live_hotel_marriott_phx_2024': {
    id: 'key_002',
    name: 'Marriott Phoenix Downtown',
    type: 'hotel',
    permissions: ['rides.create', 'rides.read', 'analytics.read'],
    rateLimit: 5000,
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    usage: 0
  },
  'sk_test_developer_demo_2024': {
    id: 'key_test_001',
    name: 'Developer Test Key',
    type: 'developer',
    permissions: ['rides.read', 'hotels.read', 'analytics.read'],
    rateLimit: 100,
    validFrom: '2024-01-01',
    validUntil: '2025-01-31',
    usage: 0
  },
  'sk_partner_booking_platform_2024': {
    id: 'key_partner_001',
    name: 'Booking Platform Integration',
    type: 'partner',
    permissions: ['hotels.read', 'availability.read', 'rates.read'],
    rateLimit: 10000,
    validFrom: '2024-01-01',
    usage: 0
  }
}

// Mock user sessions (in production, use Redis or database)
const ACTIVE_SESSIONS = new Map<string, {
  userId: string
  type: string
  createdAt: number
  lastActivity: number
  ip: string
}>()

// Simple JWT verification (in production, use proper JWT library like jsonwebtoken)
function verifyJWT(token: string): { valid: boolean; payload?: TokenPayload; error?: string } {
  try {
    // Split the JWT
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' }
    }
    
    const [headerB64, payloadB64, signature] = parts
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as TokenPayload
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return { valid: false, error: 'Token expired' }
    }
    
    // Verify signature
    const message = `${headerB64}.${payloadB64}`
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(message)
      .digest('base64url')
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' }
    }
    
    return { valid: true, payload }
  } catch (error) {
    return { valid: false, error: 'Token verification failed' }
  }
}

// Generate a sample JWT for testing
function generateSampleJWT(type: 'user' | 'hotel' | 'driver' | 'admin' = 'user'): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const payload: TokenPayload = {
    sub: `${type}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    email: type === 'user' ? 'user@example.com' : undefined,
    permissions: type === 'admin' 
      ? ['*'] 
      : type === 'hotel'
      ? ['rides.create', 'rides.read', 'analytics.read']
      : ['rides.create', 'rides.read'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    jti: crypto.randomUUID()
  }
  
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url')
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url')
  
  return `${headerB64}.${payloadB64}.${signature}`
}

// Validate API key
function validateApiKey(apiKey: string): { valid: boolean; data?: ApiKeyData; error?: string } {
  const keyData = VALID_API_KEYS[apiKey]
  
  if (!keyData) {
    return { valid: false, error: 'Invalid API key' }
  }
  
  // Check validity dates
  const now = new Date()
  const validFrom = new Date(keyData.validFrom)
  const validUntil = keyData.validUntil ? new Date(keyData.validUntil) : null
  
  if (now < validFrom) {
    return { valid: false, error: 'API key not yet valid' }
  }
  
  if (validUntil && now > validUntil) {
    return { valid: false, error: 'API key expired' }
  }
  
  // Update usage stats (in production, update in database)
  keyData.lastUsed = now.toISOString()
  keyData.usage++
  
  return { valid: true, data: keyData }
}

// Extract auth credentials from request
async function extractCredentials(request: Request): Promise<{
  type: 'jwt' | 'apikey' | 'none'
  credential?: string
}> {
  const headersList = await headers()
  
  // Check for Bearer token (JWT)
  const authHeader = headersList.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return { type: 'jwt', credential: authHeader.substring(7) }
  }
  
  // Check for API key in header
  const apiKeyHeader = headersList.get('x-api-key')
  if (apiKeyHeader) {
    return { type: 'apikey', credential: apiKeyHeader }
  }
  
  // Check for API key in query params (not recommended but supported)
  const url = new URL(request.url)
  const apiKeyParam = url.searchParams.get('api_key')
  if (apiKeyParam) {
    return { type: 'apikey', credential: apiKeyParam }
  }
  
  return { type: 'none' }
}

// Track authentication attempt for security monitoring
function trackAuthAttempt(
  success: boolean, 
  type: string, 
  identifier: string, 
  ip: string,
  reason?: string
) {
  // In production, log to security monitoring system
  console.log({
    timestamp: new Date().toISOString(),
    event: 'auth_validation',
    success,
    type,
    identifier,
    ip,
    reason
  })
}

export async function POST(request: Request) {
  try {
    const startTime = Date.now()
    const clientIp = (await headers()).get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    
    // Extract credentials
    const { type, credential } = await extractCredentials(request)
    
    // No credentials provided
    if (type === 'none') {
      trackAuthAttempt(false, 'none', 'none', clientIp, 'No credentials provided')
      
      return NextResponse.json(
        {
          valid: false,
          error: 'No authentication credentials provided',
          message: 'Please provide either a Bearer token or X-API-Key header',
          examples: {
            jwt: 'Authorization: Bearer <your-jwt-token>',
            apiKey: 'X-API-Key: <your-api-key>'
          },
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      )
    }
    
    // Validate based on credential type
    let validationResult
    let responseData: any = {}
    
    if (type === 'jwt' && credential) {
      const jwtResult = verifyJWT(credential)
      validationResult = jwtResult.valid
      
      if (jwtResult.valid && jwtResult.payload) {
        // Create or update session
        const sessionId = crypto.randomUUID()
        ACTIVE_SESSIONS.set(sessionId, {
          userId: jwtResult.payload.sub,
          type: jwtResult.payload.type,
          createdAt: Date.now(),
          lastActivity: Date.now(),
          ip: clientIp
        })
        
        responseData = {
          valid: true,
          type: 'jwt',
          subject: jwtResult.payload.sub,
          userType: jwtResult.payload.type,
          email: jwtResult.payload.email,
          permissions: jwtResult.payload.permissions,
          sessionId,
          expiresAt: new Date(jwtResult.payload.exp * 1000).toISOString(),
          remainingTime: jwtResult.payload.exp - Math.floor(Date.now() / 1000)
        }
        
        trackAuthAttempt(true, 'jwt', jwtResult.payload.sub, clientIp)
      } else {
        responseData = {
          valid: false,
          type: 'jwt',
          error: jwtResult.error || 'Invalid token',
          message: 'Token validation failed. Please login again.'
        }
        
        trackAuthAttempt(false, 'jwt', 'unknown', clientIp, jwtResult.error)
      }
      
    } else if (type === 'apikey' && credential) {
      const apiKeyResult = validateApiKey(credential)
      validationResult = apiKeyResult.valid
      
      if (apiKeyResult.valid && apiKeyResult.data) {
        responseData = {
          valid: true,
          type: 'apikey',
          keyId: apiKeyResult.data.id,
          name: apiKeyResult.data.name,
          accountType: apiKeyResult.data.type,
          permissions: apiKeyResult.data.permissions,
          rateLimit: apiKeyResult.data.rateLimit,
          usage: apiKeyResult.data.usage,
          validUntil: apiKeyResult.data.validUntil
        }
        
        trackAuthAttempt(true, 'apikey', apiKeyResult.data.name, clientIp)
      } else {
        responseData = {
          valid: false,
          type: 'apikey',
          error: apiKeyResult.error || 'Invalid API key',
          message: 'API key validation failed. Please check your credentials.'
        }
        
        trackAuthAttempt(false, 'apikey', credential.substring(0, 20), clientIp, apiKeyResult.error)
      }
    }
    
    // Add response metadata
    responseData.timestamp = new Date().toISOString()
    responseData.processingTime = `${Date.now() - startTime}ms`
    responseData.ip = clientIp
    
    // Return appropriate status code
    const statusCode = responseData.valid ? 200 : 401
    
    return NextResponse.json(responseData, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Auth-Type': type,
        'X-Processing-Time': `${Date.now() - startTime}ms`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      }
    })
    
  } catch (error) {
    console.error('Auth validation error:', error)
    
    return NextResponse.json(
      {
        valid: false,
        error: 'Internal Server Error',
        message: 'Authentication validation failed due to a server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GET endpoint to generate sample tokens for testing
export async function GET(request: Request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type') as 'user' | 'hotel' | 'driver' | 'admin' | null
  
  // Generate sample credentials for testing
  const sampleJWT = generateSampleJWT(type || 'user')
  const sampleApiKeys = Object.keys(VALID_API_KEYS).slice(0, 3)
  
  return NextResponse.json({
    message: 'Auth validation endpoint - use POST to validate credentials',
    testing: {
      sampleJWT: {
        token: sampleJWT,
        usage: 'curl -X POST -H "Authorization: Bearer ' + sampleJWT + '" http://localhost:3000/api/v3/auth/validate'
      },
      sampleApiKeys: sampleApiKeys.map(key => ({
        key: key,
        usage: `curl -X POST -H "X-API-Key: ${key}" http://localhost:3000/api/v3/auth/validate`
      })),
      activeSessions: ACTIVE_SESSIONS.size,
      types: ['user', 'hotel', 'driver', 'admin'],
      generateNewToken: '/api/v3/auth/validate?type=hotel'
    },
    documentation: 'https://docs.itwhip.com/api/v3/authentication',
    timestamp: new Date().toISOString()
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  })
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400'
    }
  })
}