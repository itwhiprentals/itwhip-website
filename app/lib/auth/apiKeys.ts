import { randomBytes, createHash, createHmac } from 'crypto'
import { prisma } from '@/app/lib/database/prisma'
import { getRolePermissions, UserRole, CertificationTier } from './rbac'

const API_KEY_CONFIG = {
  PREFIXES: {
    [CertificationTier.TU_3_C]: 'itw_starter_',
    [CertificationTier.TU_2_B]: 'itw_business_',
    [CertificationTier.TU_1_A]: 'itw_enterprise_',
    [CertificationTier.NONE]: 'itw_preview_'
  },

  KEY_LENGTH: 32,
  SECRET_LENGTH: 24,

  RATE_LIMITS: {
    [CertificationTier.NONE]: 100,
    [CertificationTier.TU_3_C]: 1000,
    [CertificationTier.TU_2_B]: 5000,
    [CertificationTier.TU_1_A]: 10000
  },

  EXPIRY: {
    [CertificationTier.NONE]: 7,
    [CertificationTier.TU_3_C]: 90,
    [CertificationTier.TU_2_B]: 180,
    [CertificationTier.TU_1_A]: 365
  },

  MAX_KEYS: {
    [CertificationTier.NONE]: 1,
    [CertificationTier.TU_3_C]: 3,
    [CertificationTier.TU_2_B]: 10,
    [CertificationTier.TU_1_A]: 50
  }
}

const API_KEY_REGEX = /^itw_(starter|business|enterprise|preview)_[a-f0-9]{64}$/

function getRoleTier(role: UserRole): CertificationTier {
  switch (role) {
    case UserRole.ENTERPRISE:
      return CertificationTier.TU_1_A
    case UserRole.BUSINESS:
      return CertificationTier.TU_2_B
    case UserRole.STARTER:
      return CertificationTier.TU_3_C
    default:
      return CertificationTier.NONE
  }
}

export async function generateApiKey(
  user: { id?: string; role: UserRole; hotelId?: string | null },
  name: string,
  permissions?: string[]
): Promise<{
  key: any
  plainKey: string
  secret: string
}> {
  if (user.role === UserRole.ANONYMOUS) {
    throw new Error('Anonymous users cannot have API keys')
  }

  const tier = getRoleTier(user.role)
  await checkKeyLimit(user.id!, tier)

  const keyId = randomBytes(API_KEY_CONFIG.KEY_LENGTH).toString('hex')
  const secret = randomBytes(API_KEY_CONFIG.SECRET_LENGTH).toString('hex')
  const prefix = API_KEY_CONFIG.PREFIXES[tier]
  const plainKey = `${prefix}${keyId}`

  const hashedKey = hashApiKey(plainKey)

  const keyPermissions = permissions || getRolePermissions(user.role)

  const expiryDays = API_KEY_CONFIG.EXPIRY[tier]
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiryDays)

  const apiKey = await prisma.apiKey.create({
    data: {
      id: crypto.randomUUID(),
      key: hashedKey,
      name,
      userId: user.id!,
      hotelId: user.hotelId ?? null,
      permissions: JSON.stringify(keyPermissions),
      tier,
      rateLimit: API_KEY_CONFIG.RATE_LIMITS[tier],
      rateWindow: 'hour',
      active: true,
      expiresAt
    }
  })

  await logApiKeyEvent('created', apiKey.id, user.id!)

  return {
    key: {
      ...apiKey,
      key: plainKey
    },
    plainKey,
    secret
  }
}

export async function generatePreviewApiKey(
  gdsCode: string,
  hotelName: string
): Promise<{
  key: string
  expiresIn: number
}> {
  const keyId = randomBytes(API_KEY_CONFIG.KEY_LENGTH).toString('hex')
  const plainKey = `${API_KEY_CONFIG.PREFIXES[CertificationTier.NONE]}${keyId}`

  await storePreviewKey(plainKey, {
    gdsCode,
    hotelName,
    permissions: [
      'view_dashboard',
      'view_metrics',
      'calculate_roi'
    ],
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
  })

  return {
    key: plainKey,
    expiresIn: 7 * 24 * 60 * 60
  }
}

export async function validateApiKey(
  apiKey: string
): Promise<{
  valid: boolean
  key?: any
  user?: any
  error?: string
}> {
  try {
    if (!API_KEY_REGEX.test(apiKey)) {
      return {
        valid: false,
        error: 'Invalid API key format'
      }
    }

    if (apiKey.startsWith(API_KEY_CONFIG.PREFIXES[CertificationTier.NONE])) {
      return validatePreviewKey(apiKey)
    }

    const hashedKey = hashApiKey(apiKey)

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

    if (!dbKey.active) {
      return {
        valid: false,
        error: 'API key is inactive'
      }
    }

    if (dbKey.expiresAt && dbKey.expiresAt < new Date()) {
      await deactivateApiKey(dbKey.id)
      return {
        valid: false,
        error: 'API key has expired'
      }
    }

    await updateKeyUsage(dbKey.id)

    return {
      valid: true,
      key: dbKey,
      user: dbKey.user
    }
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'API key validation failed'
    }
  }
}

async function validatePreviewKey(
  apiKey: string
): Promise<{
  valid: boolean
  key?: any
  error?: string
}> {
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

export async function listUserApiKeys(
  userId: string
): Promise<any[]> {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  return keys.map(key => ({
    ...key,
    key: `${key.key.substring(0, 10)}...`
  }))
}

export async function rotateApiKey(
  keyId: string,
  userId: string
): Promise<{
  oldKey: any
  newKey: any
  plainKey: string
  secret: string
}> {
  const oldKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
    include: { user: true }
  })

  if (!oldKey) {
    throw new Error('API key not found')
  }

  await deactivateApiKey(keyId)

  const parsedPermissions: string[] = (() => {
    try {
      const parsed = JSON.parse(oldKey.permissions)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })()

  const result = await generateApiKey(
    oldKey.user as any,
    `${oldKey.name} (Rotated)`,
    parsedPermissions
  )

  await logApiKeyEvent('rotated', keyId, userId)

  return {
    oldKey,
    newKey: result.key,
    plainKey: result.plainKey,
    secret: result.secret
  }
}

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

export async function updateApiKeyPermissions(
  keyId: string,
  userId: string,
  permissions: string[]
): Promise<any> {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId }
  })

  if (!key) {
    throw new Error('API key not found')
  }

  const updated = await prisma.apiKey.update({
    where: { id: keyId },
    data: { permissions: JSON.stringify(permissions) }
  })

  await logApiKeyEvent('permissions_updated', keyId, userId)

  return updated
}

export async function checkRateLimit(
  apiKey: string
): Promise<{
  limit: number
  remaining: number
  reset: Date
  tier: CertificationTier | 'anonymous'
}> {
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

  const rateLimit = await prisma.rateLimit.findUnique({
    where: { identifier: key.id }
  })

  if (!rateLimit || rateLimit.windowStart < hourAgo) {
    await prisma.rateLimit.upsert({
      where: { identifier: key.id },
      create: {
        id: crypto.randomUUID(),
        identifier: key.id,
        tier: key.tier || CertificationTier.NONE,
        requests: key.rateLimit,
        window: 3600,
        currentRequests: 1,
        windowStart: now,
        exceeded: false,
        banned: false,
        updatedAt: new Date()
      },
      update: {
        currentRequests: 1,
        windowStart: now,
        exceeded: false,
        updatedAt: new Date()
      }
    })

    return {
      limit: key.rateLimit,
      remaining: key.rateLimit - 1,
      reset: new Date(now.getTime() + 60 * 60 * 1000),
      tier: key.tier || CertificationTier.NONE
    }
  }

  const updated = await prisma.rateLimit.update({
    where: { identifier: key.id },
    data: {
      currentRequests: { increment: 1 },
      exceeded: rateLimit.currentRequests + 1 > key.rateLimit,
      updatedAt: new Date()
    }
  })

  return {
    limit: key.rateLimit,
    remaining: Math.max(0, key.rateLimit - updated.currentRequests),
    reset: new Date(rateLimit.windowStart.getTime() + 60 * 60 * 1000),
    tier: key.tier || CertificationTier.NONE
  }
}

export function getRateLimitHeaders(status: {
  limit: number
  remaining: number
  reset: Date
  tier: string
}): Record<string, string> {
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

async function updateKeyUsage(keyId: string): Promise<void> {
  await prisma.apiKey.update({
    where: { id: keyId },
    data: {
      lastUsed: new Date(),
      usageCount: { increment: 1 }
    }
  })
}

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

  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  const dailyLogs = await prisma.auditLog.count({
    where: {
      userId,
      timestamp: { gte: dayAgo },
      resourceId: keyId
    }
  })

  const hourlyLogs = await prisma.auditLog.count({
    where: {
      userId,
      timestamp: { gte: hourAgo },
      resourceId: keyId
    }
  })

  return {
    totalRequests: key.usageCount,
    dailyRequests: dailyLogs,
    hourlyRequests: hourlyLogs,
    lastUsed: key.lastUsed,
    endpoints: {}
  }
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

async function checkKeyLimit(userId: string, tier: CertificationTier): Promise<void> {
  const count = await prisma.apiKey.count({
    where: { userId, active: true }
  })

  const limit = API_KEY_CONFIG.MAX_KEYS[tier]
  if (count >= limit) {
    throw new Error(`API key limit reached (${limit} keys for ${tier} tier)`)
  }
}

async function deactivateApiKey(keyId: string): Promise<void> {
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { active: false }
  })
}

async function logApiKeyEvent(
  event: string,
  keyId: string,
  userId: string,
  details?: string
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      id: crypto.randomUUID(),
      category: 'SECURITY',
      eventType: `api_key_${event}`,
      severity: 'INFO',
      userId,
      ipAddress: '0.0.0.0',
      userAgent: 'system',
      action: event,
      resource: 'api_key',
      resourceId: keyId,
      details: details ? { message: details } : { keyId, event },
      hash: randomBytes(32).toString('hex'),
      previousHash: null
    }
  })
}

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

export function extractApiKey(
  authHeader?: string,
  apiKeyHeader?: string,
  queryParam?: string
): string | null {
  if (authHeader) {
    if (authHeader.startsWith('Bearer itw_')) {
      return authHeader.substring(7)
    }
  }

  if (apiKeyHeader && apiKeyHeader.startsWith('itw_')) {
    return apiKeyHeader
  }

  if (queryParam && queryParam.startsWith('itw_')) {
    return queryParam
  }

  return null
}

export async function validateApiKeyRequest(
  apiKey: string,
  requiredPermissions?: string[]
): Promise<{
  valid: boolean
  user?: any
  error?: string
}> {
  const validation = await validateApiKey(apiKey)

  if (!validation.valid) {
    return validation
  }

  if (requiredPermissions && validation.key) {
    const keyPermissions: string[] = (() => {
      try {
        const parsed = JSON.parse(validation.key.permissions)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return typeof validation.key.permissions === 'string'
          ? [validation.key.permissions]
          : []
      }
    })()

    const hasPermissions = requiredPermissions.every(
      perm => keyPermissions.includes(perm)
    )

    if (!hasPermissions) {
      return {
        valid: false,
        error: 'Insufficient permissions'
      }
    }
  }

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

export default {
  generateApiKey,
  generatePreviewApiKey,

  validateApiKey,
  validateApiKeySignature,
  validateApiKeyRequest,

  listUserApiKeys,
  rotateApiKey,
  revokeApiKey,
  updateApiKeyPermissions,

  checkRateLimit,
  getRateLimitHeaders,

  getApiKeyStats,

  extractApiKey,

  API_KEY_CONFIG
}
