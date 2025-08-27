/**
 * Request Signing for ItWhip Platform
 * Implements HMAC-SHA256 signatures, replay prevention, and request integrity
 */

import { createHmac, randomBytes, createHash } from 'crypto'
import { PrismaClient } from '@/app/lib/dal/types'
import type { RequestSignature } from '@/app/types/security'

// Initialize Prisma
const prisma = new PrismaClient()

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Signing Configuration
 */
const SIGNING_CONFIG = {
  // Signature algorithm
  ALGORITHM: 'sha256' as const,
  
  // Time windows
  TIMESTAMP_WINDOW: 5 * 60 * 1000, // 5 minutes in milliseconds
  CLOCK_SKEW: 30 * 1000, // 30 seconds clock skew tolerance
  
  // Nonce settings
  NONCE_LENGTH: 32, // bytes
  NONCE_EXPIRY: 10 * 60 * 1000, // 10 minutes
  
  // Headers to include in signature
  SIGNED_HEADERS: [
    'host',
    'x-request-id',
    'x-timestamp',
    'x-nonce',
    'content-type',
    'content-length'
  ],
  
  // Signature header names
  HEADERS: {
    SIGNATURE: 'x-signature',
    TIMESTAMP: 'x-timestamp',
    NONCE: 'x-nonce',
    KEY_ID: 'x-api-key-id',
    ALGORITHM: 'x-signature-algorithm',
    SIGNED_HEADERS: 'x-signed-headers'
  },
  
  // Secret keys (in production, use KMS)
  SIGNING_SECRET: process.env.SIGNING_SECRET || generateSigningSecret(),
  
  // Webhook signing
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || generateSigningSecret()
}

/**
 * Nonce storage (use Redis in production)
 */
const nonceStore = new Map<string, number>()

// ============================================================================
// REQUEST SIGNING
// ============================================================================

/**
 * Sign an HTTP request
 */
export function signRequest(
  method: string,
  path: string,
  headers: Record<string, string>,
  body?: string | Buffer,
  secret?: string
): RequestSignature {
  // Generate timestamp and nonce
  const timestamp = Date.now()
  const nonce = generateNonce()
  
  // Prepare headers for signing
  const signedHeaders = prepareHeaders(headers)
  
  // Create canonical request
  const canonicalRequest = createCanonicalRequest(
    method,
    path,
    signedHeaders,
    body
  )
  
  // Create string to sign
  const stringToSign = createStringToSign(
    canonicalRequest,
    timestamp,
    nonce
  )
  
  // Generate signature
  const signature = generateSignature(
    stringToSign,
    secret || SIGNING_CONFIG.SIGNING_SECRET
  )
  
  return {
    method: 'HMAC-SHA256',
    signature,
    timestamp,
    nonce,
    keyId: 'default', // Would be actual key ID in production
    payload: {
      method,
      path,
      query: extractQuery(path),
      body: body ? hashBody(body) : undefined,
      headers: Object.keys(signedHeaders)
    }
  }
}

/**
 * Verify request signature
 */
export async function verifyRequestSignature(
  signature: string,
  method: string,
  path: string,
  headers: Record<string, string>,
  body?: string | Buffer,
  secret?: string
): Promise<{
  valid: boolean
  error?: string
}> {
  try {
    // Extract signature components from headers
    const timestamp = parseInt(headers[SIGNING_CONFIG.HEADERS.TIMESTAMP] || '0')
    const nonce = headers[SIGNING_CONFIG.HEADERS.NONCE]
    const algorithm = headers[SIGNING_CONFIG.HEADERS.ALGORITHM]
    
    // Validate algorithm
    if (algorithm && algorithm !== 'HMAC-SHA256') {
      return {
        valid: false,
        error: 'Unsupported signature algorithm'
      }
    }
    
    // Check timestamp window
    const timestampValid = await verifyTimestamp(timestamp)
    if (!timestampValid.valid) {
      return {
        valid: false,
        error: timestampValid.error
      }
    }
    
    // Check nonce for replay prevention
    const nonceValid = await verifyNonce(nonce, timestamp)
    if (!nonceValid.valid) {
      return {
        valid: false,
        error: nonceValid.error
      }
    }
    
    // Prepare headers for verification
    const signedHeaders = prepareHeaders(headers)
    
    // Recreate canonical request
    const canonicalRequest = createCanonicalRequest(
      method,
      path,
      signedHeaders,
      body
    )
    
    // Recreate string to sign
    const stringToSign = createStringToSign(
      canonicalRequest,
      timestamp,
      nonce
    )
    
    // Generate expected signature
    const expectedSignature = generateSignature(
      stringToSign,
      secret || SIGNING_CONFIG.SIGNING_SECRET
    )
    
    // Constant-time comparison
    const valid = timingSafeEqual(signature, expectedSignature)
    
    if (!valid) {
      return {
        valid: false,
        error: 'Invalid signature'
      }
    }
    
    // Store nonce to prevent replay
    await storeNonce(nonce, timestamp)
    
    return { valid: true }
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Signature verification failed'
    }
  }
}

// ============================================================================
// WEBHOOK SIGNING
// ============================================================================

/**
 * Sign webhook payload
 */
export function signWebhook(
  payload: any,
  secret?: string
): {
  signature: string
  timestamp: number
  headers: Record<string, string>
} {
  const timestamp = Date.now()
  const payloadString = typeof payload === 'string' 
    ? payload 
    : JSON.stringify(payload)
  
  // Create signature base
  const signatureBase = `${timestamp}.${payloadString}`
  
  // Generate signature
  const signature = createHmac(
    SIGNING_CONFIG.ALGORITHM,
    secret || SIGNING_CONFIG.WEBHOOK_SECRET
  )
    .update(signatureBase)
    .digest('hex')
  
  return {
    signature: `v1=${signature}`,
    timestamp,
    headers: {
      'x-itwhip-signature': `v1=${signature}`,
      'x-itwhip-timestamp': timestamp.toString(),
      'x-itwhip-webhook-id': generateWebhookId()
    }
  }
}

/**
 * Verify webhook signature
 */
export async function verifyWebhookSignature(
  signature: string,
  timestamp: string | number,
  payload: string | Buffer,
  secret?: string
): Promise<{
  valid: boolean
  error?: string
}> {
  try {
    // Parse timestamp
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
    
    // Check timestamp window (prevent replay attacks)
    const timestampValid = await verifyTimestamp(ts)
    if (!timestampValid.valid) {
      return {
        valid: false,
        error: timestampValid.error
      }
    }
    
    // Extract version and signature
    const [version, sig] = signature.split('=')
    if (version !== 'v1') {
      return {
        valid: false,
        error: 'Unsupported signature version'
      }
    }
    
    // Create expected signature
    const signatureBase = `${ts}.${payload}`
    const expectedSignature = createHmac(
      SIGNING_CONFIG.ALGORITHM,
      secret || SIGNING_CONFIG.WEBHOOK_SECRET
    )
      .update(signatureBase)
      .digest('hex')
    
    // Constant-time comparison
    const valid = timingSafeEqual(sig, expectedSignature)
    
    return {
      valid,
      error: valid ? undefined : 'Invalid webhook signature'
    }
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Webhook verification failed'
    }
  }
}

// ============================================================================
// API RESPONSE SIGNING
// ============================================================================

/**
 * Sign API response
 */
export function signResponse(
  statusCode: number,
  body: any,
  requestId: string
): {
  signature: string
  headers: Record<string, string>
} {
  const timestamp = Date.now()
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body)
  
  // Create response hash
  const responseHash = createHash('sha256')
    .update(`${statusCode}.${requestId}.${bodyString}`)
    .digest('hex')
  
  // Sign the hash
  const signature = createHmac(
    SIGNING_CONFIG.ALGORITHM,
    SIGNING_CONFIG.SIGNING_SECRET
  )
    .update(`${timestamp}.${responseHash}`)
    .digest('hex')
  
  return {
    signature,
    headers: {
      'x-response-signature': signature,
      'x-response-timestamp': timestamp.toString(),
      'x-request-id': requestId
    }
  }
}

/**
 * Verify API response signature
 */
export async function verifyResponseSignature(
  signature: string,
  statusCode: number,
  body: any,
  requestId: string,
  timestamp: string | number
): Promise<boolean> {
  try {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body)
    
    // Check timestamp
    const timestampValid = await verifyTimestamp(ts)
    if (!timestampValid.valid) {
      return false
    }
    
    // Recreate response hash
    const responseHash = createHash('sha256')
      .update(`${statusCode}.${requestId}.${bodyString}`)
      .digest('hex')
    
    // Generate expected signature
    const expectedSignature = createHmac(
      SIGNING_CONFIG.ALGORITHM,
      SIGNING_CONFIG.SIGNING_SECRET
    )
      .update(`${ts}.${responseHash}`)
      .digest('hex')
    
    return timingSafeEqual(signature, expectedSignature)
  } catch {
    return false
  }
}

// ============================================================================
// CANONICAL REQUEST CREATION
// ============================================================================

/**
 * Create canonical request for signing
 */
function createCanonicalRequest(
  method: string,
  path: string,
  headers: Record<string, string>,
  body?: string | Buffer
): string {
  // Extract path and query
  const [canonicalPath, canonicalQuery] = path.split('?')
  
  // Sort query parameters
  const sortedQuery = canonicalQuery
    ? canonicalQuery
        .split('&')
        .sort()
        .join('&')
    : ''
  
  // Create canonical headers
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
    .join('\n')
  
  // Hash body
  const hashedBody = body ? hashBody(body) : 'UNSIGNED-PAYLOAD'
  
  // Combine all parts
  return [
    method.toUpperCase(),
    canonicalPath,
    sortedQuery,
    canonicalHeaders,
    '',
    Object.keys(headers).sort().join(';'),
    hashedBody
  ].join('\n')
}

/**
 * Create string to sign
 */
function createStringToSign(
  canonicalRequest: string,
  timestamp: number,
  nonce: string
): string {
  const requestHash = createHash('sha256')
    .update(canonicalRequest)
    .digest('hex')
  
  return [
    'ITWHIP-HMAC-SHA256',
    timestamp.toString(),
    nonce,
    requestHash
  ].join('\n')
}

/**
 * Generate HMAC signature
 */
function generateSignature(
  stringToSign: string,
  secret: string
): string {
  return createHmac(SIGNING_CONFIG.ALGORITHM, secret)
    .update(stringToSign)
    .digest('hex')
}

// ============================================================================
// TIMESTAMP VERIFICATION
// ============================================================================

/**
 * Verify timestamp is within acceptable window
 */
async function verifyTimestamp(
  timestamp: number
): Promise<{
  valid: boolean
  error?: string
}> {
  const now = Date.now()
  const diff = Math.abs(now - timestamp)
  
  // Check if timestamp is within window + clock skew
  if (diff > SIGNING_CONFIG.TIMESTAMP_WINDOW + SIGNING_CONFIG.CLOCK_SKEW) {
    const minutesOff = Math.floor(diff / 60000)
    return {
      valid: false,
      error: `Timestamp outside acceptable window (${minutesOff} minutes off)`
    }
  }
  
  // Check if timestamp is not in the future (with skew tolerance)
  if (timestamp > now + SIGNING_CONFIG.CLOCK_SKEW) {
    return {
      valid: false,
      error: 'Timestamp is in the future'
    }
  }
  
  return { valid: true }
}

// ============================================================================
// NONCE MANAGEMENT (REPLAY PREVENTION)
// ============================================================================

/**
 * Generate a nonce
 */
function generateNonce(): string {
  return randomBytes(SIGNING_CONFIG.NONCE_LENGTH).toString('hex')
}

/**
 * Verify nonce hasn't been used
 */
async function verifyNonce(
  nonce: string,
  timestamp: number
): Promise<{
  valid: boolean
  error?: string
}> {
  if (!nonce) {
    return {
      valid: false,
      error: 'Nonce is required'
    }
  }
  
  // Check if nonce exists
  const existingTimestamp = nonceStore.get(nonce)
  if (existingTimestamp) {
    return {
      valid: false,
      error: 'Nonce has already been used (replay attack prevented)'
    }
  }
  
  // Clean expired nonces
  cleanExpiredNonces()
  
  return { valid: true }
}

/**
 * Store nonce to prevent replay
 */
async function storeNonce(nonce: string, timestamp: number): Promise<void> {
  nonceStore.set(nonce, timestamp)
  
  // In production, store in Redis with TTL
  // await redis.setex(`nonce:${nonce}`, SIGNING_CONFIG.NONCE_EXPIRY / 1000, timestamp)
}

/**
 * Clean expired nonces
 */
function cleanExpiredNonces(): void {
  const now = Date.now()
  const expiry = SIGNING_CONFIG.NONCE_EXPIRY
  
  for (const [nonce, timestamp] of nonceStore.entries()) {
    if (now - timestamp > expiry) {
      nonceStore.delete(nonce)
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Prepare headers for signing
 */
function prepareHeaders(headers: Record<string, string>): Record<string, string> {
  const prepared: Record<string, string> = {}
  
  for (const header of SIGNING_CONFIG.SIGNED_HEADERS) {
    const value = headers[header] || headers[header.toLowerCase()]
    if (value) {
      prepared[header.toLowerCase()] = value.trim()
    }
  }
  
  return prepared
}

/**
 * Hash request body
 */
function hashBody(body: string | Buffer): string {
  const data = typeof body === 'string' ? Buffer.from(body) : body
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Extract query string from path
 */
function extractQuery(path: string): string | undefined {
  const queryIndex = path.indexOf('?')
  return queryIndex > -1 ? path.substring(queryIndex + 1) : undefined
}

/**
 * Generate signing secret
 */
function generateSigningSecret(): string {
  return randomBytes(64).toString('hex')
}

/**
 * Generate webhook ID
 */
function generateWebhookId(): string {
  return `whk_${randomBytes(16).toString('hex')}`
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  
  let result = 0
  for (let i = 0; i < bufferA.length; i++) {
    result |= bufferA[i] ^ bufferB[i]
  }
  
  return result === 0
}

// ============================================================================
// SIGNATURE VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Create signature validation middleware
 */
export function createSignatureMiddleware(options?: {
  secret?: string
  required?: boolean
  skip?: (path: string) => boolean
}) {
  return async (req: any, res: any, next: any) => {
    // Check if should skip
    if (options?.skip && options.skip(req.path)) {
      return next()
    }
    
    // Check if signature exists
    const signature = req.headers[SIGNING_CONFIG.HEADERS.SIGNATURE]
    if (!signature && !options?.required) {
      return next()
    }
    
    if (!signature) {
      return res.status(401).json({
        error: 'Missing signature'
      })
    }
    
    // Verify signature
    const result = await verifyRequestSignature(
      signature,
      req.method,
      req.originalUrl || req.url,
      req.headers,
      req.body,
      options?.secret
    )
    
    if (!result.valid) {
      return res.status(401).json({
        error: result.error || 'Invalid signature'
      })
    }
    
    // Add signature info to request
    req.signature = {
      verified: true,
      timestamp: req.headers[SIGNING_CONFIG.HEADERS.TIMESTAMP],
      nonce: req.headers[SIGNING_CONFIG.HEADERS.NONCE]
    }
    
    next()
  }
}

// ============================================================================
// SDK SIGNATURE HELPERS
// ============================================================================

/**
 * Create SDK request signature
 */
export function createSDKSignature(
  apiKey: string,
  secret: string,
  method: string,
  path: string,
  body?: any
): Record<string, string> {
  const timestamp = Date.now()
  const nonce = generateNonce()
  
  // Create signature payload
  const payload = {
    method: method.toUpperCase(),
    path,
    timestamp,
    nonce,
    body: body ? JSON.stringify(body) : ''
  }
  
  // Generate signature
  const signature = createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  return {
    [SIGNING_CONFIG.HEADERS.SIGNATURE]: signature,
    [SIGNING_CONFIG.HEADERS.TIMESTAMP]: timestamp.toString(),
    [SIGNING_CONFIG.HEADERS.NONCE]: nonce,
    [SIGNING_CONFIG.HEADERS.KEY_ID]: apiKey,
    [SIGNING_CONFIG.HEADERS.ALGORITHM]: 'HMAC-SHA256'
  }
}

/**
 * Verify SDK request signature
 */
export async function verifySDKSignature(
  headers: Record<string, string>,
  secret: string,
  method: string,
  path: string,
  body?: any
): Promise<boolean> {
  try {
    const signature = headers[SIGNING_CONFIG.HEADERS.SIGNATURE]
    const timestamp = headers[SIGNING_CONFIG.HEADERS.TIMESTAMP]
    const nonce = headers[SIGNING_CONFIG.HEADERS.NONCE]
    
    if (!signature || !timestamp || !nonce) {
      return false
    }
    
    // Recreate payload
    const payload = {
      method: method.toUpperCase(),
      path,
      timestamp: parseInt(timestamp),
      nonce,
      body: body ? JSON.stringify(body) : ''
    }
    
    // Generate expected signature
    const expectedSignature = createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')
    
    return timingSafeEqual(signature, expectedSignature)
  } catch {
    return false
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Request signing
  signRequest,
  verifyRequestSignature,
  
  // Webhook signing
  signWebhook,
  verifyWebhookSignature,
  
  // Response signing
  signResponse,
  verifyResponseSignature,
  
  // Middleware
  createSignatureMiddleware,
  
  // SDK helpers
  createSDKSignature,
  verifySDKSignature,
  
  // Configuration
  SIGNING_CONFIG
}