/**
 * API Key Management for ItWhip Platform
 * Handles API key generation, validation, rotation, and usage tracking
 */

import { randomBytes, createHash, createHmac } from 'crypto'
import { PrismaClient } from '@prisma/client'
import type {
  User,
  UserRole,
  Permission,
  CertificationTier,
  APIKey,
  RateLimitStatus
} from '@/app/types/auth'
import { getRolePermissions, getRoleTier } from './rbac'

// Initialize Prisma
const prisma = new PrismaClient()

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * API Key Configuration
 */
const API_KEY_CONFIG = {
  // Prefixes for different tiers
  PREFIXES: {
    [CertificationTier.TU_3_C]: 'itw_starter_',
    [CertificationTier.TU_2_B]: 'itw_business_',
    [CertificationTier.TU_1_A]: 'itw_enterprise_',
    [CertificationTier.NONE]: 'itw_preview_'
  },
  
  // Key lengths
  KEY_LENGTH: 32, // bytes (64 hex chars)
  SECRET_LENGTH: 24, // bytes (48 hex chars)
  
  // Rate limits per tier (requests per hour)
  RATE_LIMITS: {
    [CertificationTier.NONE]: 100,
    [CertificationTier.TU_3_C]: 1000,
    [CertificationTier.TU_2_B]: 5000,
    [CertificationTier.TU_1_A]: 10000
  },
  
  // Expiry times
  EXPIRY: {
    [CertificationTier.NONE]: 7, // 7 days for preview
    [CertificationTier.TU_3_C]: 90, // 90 days
    [CertificationTier.TU_2_B]: 180, // 180 days
    [CertificationTier.TU_1_A]: 365 // 1 year
  },
  
  // Maximum keys per tier
  MAX_KEYS: {
    [CertificationTier.NONE]: 1,
    [CertificationTier.TU_3_C]: 3,
    [CertificationTier.TU_2_B]: 10,
    [CertificationTier.TU_1_A]: 50
  }
}

/**
 * API Key validation regex
 */
const API_KEY_REGEX = /^itw_(starter|business|enterprise|preview)_[a-f0-9]{64}$/

// ============================================================================
// API KEY GENERATION
// ============================================================================

/**
 * Generate a new API key for a user/hotel
 */
export async function generateApiKey(
  user: User,
  name: string,
  permissions?: Permission[]
): Promise<{
  key: APIKey
  plainKey: string
  secret: string
}> {
  // Check if user can have API keys
  if (user.role === UserRole.ANONYMOUS) {
    throw new Error('Anonymous users cannot have API keys')
  }
  
  // Get tier and check limits
  const tier = getRoleTier(user.role)
  await checkKeyLimit(user.id!, tier)
  
  // Generate key components
  const keyId = randomBytes(API_KEY_CONFIG.KEY_LENGTH).toString('hex')
  const secret = randomBytes(API_KEY_CONFIG.SECRET_LENGTH).toString('hex')
  const prefix = API_KEY_CONFIG.PREFIXES[tier]
  const plainKey = `${prefix}${keyId}`
  
  // Hash key for storage
  const hashedKey = hashApiKey(plainKey)
  const hashedSecret = hashApiKey(secret)
  
  // Determine permissions (use provided or default to role permissions)
  const keyPermissions = permissions || getRolePermissions(user.role)
  
  // Calculate expiry
  const expiryDays = API_KEY_CONFIG.EXPIRY[tier]
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiryDays)
  
  // Create API key in database
  const apiKey = await prisma.apiKey.create({
    data: {
      key: hashedKey,
      name,
      userId: user.id!,
      hotelId: user.hotelId,
      permissions: keyPermissions,
      tier,
      rateLimit: API_KEY_CONFIG.RATE_LIMITS[tier],
      rateWindow: 'hour',
      active: true,
      expiresAt
    }
  })
  
  // Log key creation
  await logApiKeyEvent('created', apiKey.id, user.id!)
  
  return {
    key: {
      ...apiKey,
      key: plainKey // Return plain key only on creation
    } as APIKey,
    plainKey,
    secret
  }
}

/**
 * Generate a preview API key for testing
 */
export async function generatePreviewApiKey(
  gdsCode: string,
  hotelName: string
): Promise<{
  key: string
  expiresIn: number
}> {
  const keyId = randomBytes(API_KEY_CONFIG.KEY_LENGTH).toString('hex')
  const plainKey = `${API_KEY_CONFIG.PREFIXES[CertificationTier.NONE]}${keyId}`
  
  // Preview keys are temporary, stored in memory/cache
  // In production, use Redis
  await storePreviewKey(plainKey, {
    gdsCode,
    hotelName,
    permissions: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_METRICS,
      Permission.CALCULATE_ROI
    ],
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  })
  
  return {
    key: plainKey,
    expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
  }
}

// ============================================================================
// API KEY VALIDATION
// ============================================================================

/**
 * Validate an API key
 */
export async function validateApiKey(
  apiKey: string
): Promise<{
  valid: boolean
  key?: APIKey
  user?: User
  error?: string
}> {
  try {
    // Validate format
    if (!API_KEY_REGEX.test(apiKey)) {
      return {
        valid: false,
        error: 'Invalid API key format'
      }
    }
    
    // Check if preview key
    if (apiKey.startsWith(API_KEY_CONFIG.PREFIXES[CertificationTier.NONE])) {
      return validatePreviewKey(apiKey)
    }
    
    // Hash key for lookup
    const hashedKey = hashApiKey(apiKey)
    
    // Find key in database
    const dbKey = await prisma.apiKey.findUnique({
      where: { key: hashedKey },
      include: { user: true }
    })
    
    if (!dbKey) {
      return {
        valid: false,
        error: 'API key not found'
      }
    }
    
    // Check if active
    if (!dbKey.active) {
      return {
        valid: false,
        error: 'API key is inactive'
      }
    }
    
    // Check expiry
    if (dbKey.expiresAt && dbKey.expiresAt < new Date()) {
      await deactivateApiKey(dbKey.id)
      return {
        valid: false,
        error: 'API key has expired'
      }
    }
    
    // Update usage
    await updateKeyUsage(dbKey.id)
    
    return {
      valid: true,
      key: dbKey as APIKey,
      user: dbKey.user
    }
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'API key validation failed'
    }
  }
}

/**
 * Validate a preview API key
 */
async function validatePreviewKey(
  apiKey: string
): Promise<{
  valid: boolean
  key?: any
  error?: string
}> {
  // In production, check Redis
  const previewData = await getPreviewKey(apiKey)
  
  if (!previewData) {
    return {
      valid: false,
      error: 'Preview key not found or expired'
    }
  }
  
  if (previewData.expiresAt < Date.now()) {
    await removePreviewKey(apiKey)
    return {
      valid: false,
      error: 'Preview key has expired'
    }
  }
  
  return {
    valid: true,
    key: {
      id: apiKey,
      permissions: previewData.permissions,
      tier: CertificationTier.NONE,
      rateLimit: API_KEY_CONFIG.RATE_LIMITS[CertificationTier.NONE]
    }
  }
}

/**
 * Validate API key with HMAC signature
 */
export function validateApiKeySignature(
  apiKey: string,
  signature: string,
  payload: string,
  secret: string
): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return signature === expectedSignature
}

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

/**
 * List all API keys for a user
 */
export async function listUserApiKeys(
  userId: string
): Promise<APIKey[]> {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
  
  // Don't return actual keys, only metadata
  return keys.map(key => ({
    ...key,
    key: `${key.key.substring(0, 10)}...` // Show only prefix
  })) as APIKey[]
}

/**
 * Rotate an API key
 */
export async function rotateApiKey(
  keyId: string,
  userId: string
): Promise<{
  oldKey: APIKey
  newKey: APIKey
  plainKey: string
  secret: string
}> {
  // Find existing key
  const oldKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
    include: { user: true }
  })
  
  if (!oldKey) {
    throw new Error('API key not found')
  }
  
  // Deactivate old key
  await deactivateApiKey(keyId)
  
  // Generate new key with same permissions
  const result = await generateApiKey(
    oldKey.user,
    `${oldKey.name} (Rotated)`,
    oldKey.permissions
  )
  
  // Log rotation
  await logApiKeyEvent('rotated', keyId, userId)
  
  return {
    oldKey: oldKey as APIKey,
    newKey: result.key,
    plainKey: result.plainKey,
    secret: result.secret
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(
  keyId: string,
  userId: string,
  reason?: string
): Promise<void> {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId }
  })
  
  if (!key) {
    throw new Error('API key not found')
  }
  
  await deactivateApiKey(keyId)
  await logApiKeyEvent('revoked', keyId, userId, reason)
}

/**
 * Update API key permissions
 */
export async function updateApiKeyPermissions(
  keyId: string,
  userId: string,
  permissions: Permission[]
): Promise<APIKey> {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId }
  })
  
  if (!key) {
    throw new Error('API key not found')
  }
  
  const updated = await prisma.apiKey.update({
    where: { id: keyId },
    data: { permissions }
  })
  
  await logApiKeyEvent('permissions_updated', keyId, userId)
  
  return updated as APIKey
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Check API key rate limit
 */
export async function checkRateLimit(
  apiKey: string
): Promise<RateLimitStatus> {
  const validation = await validateApiKey(apiKey)
  
  if (!validation.valid || !validation.key) {
    return {
      limit: 0,
      remaining: 0,
      reset: new Date(),
      tier: CertificationTier.NONE
    }
  }
  
  const key = validation.key
  const now = new Date()
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  
  // In production, use Redis for rate limiting
  // For now, check database
  const rateLimit = await prisma.rateLimit.findUnique({
    where: { identifier: key.id }
  })
  
  if (!rateLimit || rateLimit.windowStart < hourAgo) {
    // Reset window
    await prisma.rateLimit.upsert({
      where: { identifier: key.id },
      create: {
        identifier: key.id,
        tier: key.tier || CertificationTier.NONE,
        requests: key.rateLimit,
        window: 3600, // 1 hour in seconds
        currentRequests: 1,
        windowStart: now,
        exceeded: false,
        banned: false
      },
      update: {
        currentRequests: 1,
        windowStart: now,
        exceeded: false
      }
    })
    
    return {
      limit: key.rateLimit,
      remaining: key.rateLimit - 1,
      reset: new Date(now.getTime() + 60 * 60 * 1000),
      tier: key.tier || CertificationTier.NONE
    }
  }
  
  // Increment counter
  const updated = await prisma.rateLimit.update({
    where: { identifier: key.id },
    data: {
      currentRequests: { increment: 1 },
      exceeded: rateLimit.currentRequests + 1 > key.rateLimit
    }
  })
  
  return {
    limit: key.rateLimit,
    remaining: Math.max(0, key.rateLimit - updated.currentRequests),
    reset: new Date(rateLimit.windowStart.getTime() + 60 * 60 * 1000),
    tier: key.tier || CertificationTier.NONE
  }
}

/**
 * Get rate limit headers
 */
export function getRateLimitHeaders(status: RateLimitStatus): Record<string, string> {
  return {
    'X-RateLimit-Limit': status.limit.toString(),
    'X-RateLimit-Remaining': status.remaining.toString(),
    'X-RateLimit-Reset': status.reset.toISOString(),
    'X-RateLimit-Tier': status.tier,
    ...(status.remaining === 0 && {
      'Retry-After': Math.ceil((status.reset.getTime() - Date.now()) / 1000).toString()
    })
  }
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Track API key usage
 */
async function updateKeyUsage(keyId: string): Promise<void> {
  await prisma.apiKey.update({
    where: { id: keyId },
    data: {
      lastUsed: new Date(),
      usageCount: { increment: 1 }
    }
  })
}

/**
 * Get API key usage statistics
 */
export async function getApiKeyStats(
  keyId: string,
  userId: string
): Promise<{
  totalRequests: number
  dailyRequests: number
  hourlyRequests: number
  lastUsed: Date | null
  endpoints: Record<string, number>
}> {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId }
  })
  
  if (!key) {
    throw new Error('API key not found')
  }
  
  // Get usage from audit logs
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  
  const dailyLogs = await prisma.auditLog.count({
    where: {
      userId,
      timestamp: { gte: dayAgo },
      details: { contains: keyId }
    }
  })
  
  const hourlyLogs = await prisma.auditLog.count({
    where: {
      userId,
      timestamp: { gte: hourAgo },
      details: { contains: keyId }
    }
  })
  
  return {
    totalRequests: key.usageCount,
    dailyRequests: dailyLogs,
    hourlyRequests: hourlyLogs,
    lastUsed: key.lastUsed,
    endpoints: {} // Would need endpoint tracking
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Hash an API key for storage
 */
function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Check if user has reached key limit
 */
async function checkKeyLimit(userId: string, tier: CertificationTier): Promise<void> {
  const count = await prisma.apiKey.count({
    where: { userId, active: true }
  })
  
  const limit = API_KEY_CONFIG.MAX_KEYS[tier]
  if (count >= limit) {
    throw new Error(`API key limit reached (${limit} keys for ${tier} tier)`)
  }
}

/**
 * Deactivate an API key
 */
async function deactivateApiKey(keyId: string): Promise<void> {
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { active: false }
  })
}

/**
 * Log API key event
 */
async function logApiKeyEvent(
  event: string,
  keyId: string,
  userId: string,
  details?: string
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      category: 'SECURITY',
      eventType: `api_key_${event}`,
      severity: 'LOW',
      userId,
      ipAddress: '0.0.0.0', // Should be from request
      userAgent: 'system',
      action: event,
      resource: 'api_key',
      resourceId: keyId,
      details: details || JSON.stringify({ keyId, event }),
      hash: randomBytes(32).toString('hex'),
      previousHash: null // Would chain in production
    }
  })
}

// ============================================================================
// PREVIEW KEY STORAGE (In-Memory/Cache)
// ============================================================================

// In production, use Redis
const previewKeyStore = new Map<string, any>()

async function storePreviewKey(key: string, data: any): Promise<void> {
  previewKeyStore.set(key, data)
}

async function getPreviewKey(key: string): Promise<any> {
  return previewKeyStore.get(key)
}

async function removePreviewKey(key: string): Promise<void> {
  previewKeyStore.delete(key)
}

// ============================================================================
// API KEY AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Extract API key from request
 */
export function extractApiKey(
  authHeader?: string,
  apiKeyHeader?: string,
  queryParam?: string
): string | null {
  // Check Authorization header
  if (authHeader) {
    if (authHeader.startsWith('Bearer itw_')) {
      return authHeader.substring(7)
    }
  }
  
  // Check X-API-Key header
  if (apiKeyHeader && apiKeyHeader.startsWith('itw_')) {
    return apiKeyHeader
  }
  
  // Check query parameter (less secure)
  if (queryParam && queryParam.startsWith('itw_')) {
    return queryParam
  }
  
  return null
}

/**
 * Validate request with API key
 */
export async function validateApiKeyRequest(
  apiKey: string,
  requiredPermissions?: Permission[]
): Promise<{
  valid: boolean
  user?: User
  error?: string
}> {
  const validation = await validateApiKey(apiKey)
  
  if (!validation.valid) {
    return validation
  }
  
  // Check permissions if required
  if (requiredPermissions && validation.key) {
    const hasPermissions = requiredPermissions.every(
      perm => validation.key!.permissions.includes(perm)
    )
    
    if (!hasPermissions) {
      return {
        valid: false,
        error: 'Insufficient permissions'
      }
    }
  }
  
  // Check rate limit
  const rateLimit = await checkRateLimit(apiKey)
  if (rateLimit.remaining === 0) {
    return {
      valid: false,
      error: 'Rate limit exceeded'
    }
  }
  
  return {
    valid: true,
    user: validation.user
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Generation
  generateApiKey,
  generatePreviewApiKey,
  
  // Validation
  validateApiKey,
  validateApiKeySignature,
  validateApiKeyRequest,
  
  // Management
  listUserApiKeys,
  rotateApiKey,
  revokeApiKey,
  updateApiKeyPermissions,
  
  // Rate limiting
  checkRateLimit,
  getRateLimitHeaders,
  
  // Usage tracking
  getApiKeyStats,
  
  // Utilities
  extractApiKey,
  
  // Configuration
  API_KEY_CONFIG
}