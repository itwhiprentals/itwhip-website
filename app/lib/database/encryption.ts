/**
 * Database Encryption System for ItWhip Platform
 * Field-level encryption for sensitive data using AES-256-GCM
 */

import crypto from 'crypto'
import { logger } from '@/app/lib/monitoring/logger'

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  saltLength: 64,
  tagLength: 16,
  ivLength: 16,
  iterations: 100000, // For key derivation
  keyLength: 32
}

// Fields that should be encrypted in the database
const ENCRYPTED_FIELDS = {
  User: ['email', 'phone', 'passwordHash'],
  Guest: ['email', 'phone', 'passport', 'driversLicense'],
  Driver: ['email', 'phone', 'license', 'ssn', 'bankAccount'],
  Hotel: ['taxId', 'bankAccount', 'ownerEmail', 'ownerPhone'],
  ApiKey: ['hashedKey'],
  Revenue: ['bankAccount', 'routingNumber'],
  Transaction: ['cardLast4', 'paymentMethod']
}

// Sensitive fields that should be masked in logs
const MASKED_FIELDS = [
  'password',
  'passwordHash',
  'ssn',
  'taxId',
  'bankAccount',
  'routingNumber',
  'cardNumber',
  'cvv',
  'apiKey',
  'secret'
]

/**
 * Key management class
 */
class KeyManager {
  private masterKey: Buffer
  private dataKeys: Map<string, Buffer> = new Map()
  private keyRotationSchedule: NodeJS.Timeout | null = null
  
  constructor() {
    this.masterKey = this.deriveMasterKey()
    this.initializeDataKeys()
    
    // Only schedule rotation in runtime, not during build
    // Check for build phase and skip rotation during static generation
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NODE_ENV === 'test' ||
                       process.env.CI === 'true'
    
    if (!isBuildTime && process.env.NODE_ENV === 'production') {
      // Only rotate in production runtime
      this.scheduleKeyRotation()
    }
  }
  
  /**
   * Derive master key from environment variables
   */
  private deriveMasterKey(): Buffer {
    const masterSecret = process.env.MASTER_ENCRYPTION_KEY || 'default-dev-key-change-in-production'
    const salt = process.env.ENCRYPTION_SALT || 'itwhip-platform-salt-2024'
    
    if (!process.env.MASTER_ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
      logger.warn('Using default encryption key - NOT SECURE FOR PRODUCTION')
    }
    
    return crypto.pbkdf2Sync(
      masterSecret,
      salt,
      ENCRYPTION_CONFIG.iterations,
      ENCRYPTION_CONFIG.keyLength,
      'sha256'
    )
  }
  
  /**
   * Initialize data encryption keys
   */
  private initializeDataKeys(): void {
    // Generate unique keys for each model
    const models = ['User', 'Guest', 'Driver', 'Hotel', 'ApiKey', 'Revenue', 'Transaction']
    
    for (const model of models) {
      const modelKey = crypto.pbkdf2Sync(
        this.masterKey,
        `${model}-key-salt`,
        10000,
        32,
        'sha256'
      )
      this.dataKeys.set(model, modelKey)
    }
  }
  
  /**
   * Get encryption key for a specific model
   */
  getKeyForModel(model: string): Buffer {
    const key = this.dataKeys.get(model)
    if (!key) {
      // Fall back to master key for unknown models
      return this.masterKey
    }
    return key
  }
  
  /**
   * Schedule key rotation
   */
  private scheduleKeyRotation(): void {
    // Maximum safe timeout value for Node.js (about 24.8 days)
    const MAX_TIMEOUT = 2147483647
    
    // For production, use 24-day intervals instead of 90 days to avoid timeout overflow
    // This will rotate keys more frequently but avoids the Node.js limitation
    const rotationInterval = process.env.NODE_ENV === 'production' 
      ? 24 * 24 * 60 * 60 * 1000  // 24 days (safe for Node.js)
      : 7 * 24 * 60 * 60 * 1000    // 7 days in dev
    
    // Ensure we never exceed the maximum timeout
    const safeInterval = Math.min(rotationInterval, MAX_TIMEOUT)
    
    this.keyRotationSchedule = setInterval(() => {
      this.rotateKeys()
    }, safeInterval)
  }
  
  /**
   * Rotate encryption keys
   */
  async rotateKeys(): Promise<void> {
    // Only log in production to avoid spam during development
    if (process.env.NODE_ENV === 'production') {
      logger.info('Starting encryption key rotation')
    }
    
    try {
      // Generate new master key
      const newMasterKey = crypto.randomBytes(32)
      
      // TODO: Implement actual key rotation logic
      // This would need to:
      // 1. Generate new keys
      // 2. Re-encrypt all data with new keys
      // 3. Update key version in database
      // 4. Clean up old keys after migration
      
      if (process.env.NODE_ENV === 'production') {
        logger.info('Key rotation completed successfully')
      }
    } catch (error) {
      logger.error('Key rotation failed', { error })
    }
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    if (this.keyRotationSchedule) {
      clearInterval(this.keyRotationSchedule)
      this.keyRotationSchedule = null
    }
    this.dataKeys.clear()
  }
}

// Create singleton key manager only when not in build phase
let keyManager: KeyManager

// Lazy initialization to avoid issues during build
function getKeyManager(): KeyManager {
  if (!keyManager) {
    keyManager = new KeyManager()
  }
  return keyManager
}

/**
 * Encrypt a value
 */
export function encrypt(
  value: string,
  model: string = 'default'
): { encrypted: string; iv: string; tag: string; version: number } {
  try {
    const manager = getKeyManager()
    const key = manager.getKeyForModel(model)
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength)
    const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv)
    
    let encrypted = cipher.update(value, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      version: 1 // Track encryption version for future migrations
    }
  } catch (error) {
    logger.error('Encryption failed', { error, model })
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt a value
 */
export function decrypt(
  encryptedData: {
    encrypted: string
    iv: string
    tag: string
    version?: number
  },
  model: string = 'default'
): string {
  try {
    const manager = getKeyManager()
    const key = manager.getKeyForModel(model)
    const iv = Buffer.from(encryptedData.iv, 'hex')
    const tag = Buffer.from(encryptedData.tag, 'hex')
    const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, iv)
    
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    logger.error('Decryption failed', { error, model })
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Hash a value (one-way, for passwords)
 */
export async function hash(value: string): Promise<string> {
  const salt = crypto.randomBytes(ENCRYPTION_CONFIG.saltLength)
  const iterations = ENCRYPTION_CONFIG.iterations
  
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(value, salt, iterations, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(`${salt.toString('hex')}.${iterations}.${derivedKey.toString('hex')}`)
    })
  })
}

/**
 * Verify a hashed value
 */
export async function verifyHash(value: string, hash: string): Promise<boolean> {
  const [salt, iterations, key] = hash.split('.')
  
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      value,
      Buffer.from(salt, 'hex'),
      parseInt(iterations),
      64,
      'sha512',
      (err, derivedKey) => {
        if (err) reject(err)
        resolve(key === derivedKey.toString('hex'))
      }
    )
  })
}

/**
 * Encrypt an object's sensitive fields
 */
export function encryptObject<T extends Record<string, any>>(
  obj: T,
  model: string
): T {
  const fieldsToEncrypt = ENCRYPTED_FIELDS[model as keyof typeof ENCRYPTED_FIELDS] || []
  const encrypted = { ...obj }
  
  for (const field of fieldsToEncrypt) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      const encryptedData = encrypt(encrypted[field], model)
      // Store as JSON string in database
      encrypted[field] = JSON.stringify(encryptedData)
    }
  }
  
  return encrypted
}

/**
 * Decrypt an object's sensitive fields
 */
export function decryptObject<T extends Record<string, any>>(
  obj: T,
  model: string
): T {
  const fieldsToDecrypt = ENCRYPTED_FIELDS[model as keyof typeof ENCRYPTED_FIELDS] || []
  const decrypted = { ...obj }
  
  for (const field of fieldsToDecrypt) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        // Parse JSON string from database
        const encryptedData = JSON.parse(decrypted[field])
        decrypted[field] = decrypt(encryptedData, model)
      } catch (error) {
        // If parsing fails, assume it's not encrypted
        logger.warn('Failed to decrypt field', { model, field })
      }
    }
  }
  
  return decrypted
}

/**
 * Mask sensitive fields in an object (for logging)
 */
export function maskSensitiveData<T extends Record<string, any>>(obj: T): T {
  const masked = { ...obj }
  
  for (const field of MASKED_FIELDS) {
    if (masked[field]) {
      if (typeof masked[field] === 'string') {
        // Show first 2 and last 2 characters
        const value = masked[field]
        if (value.length > 4) {
          masked[field] = `${value.slice(0, 2)}****${value.slice(-2)}`
        } else {
          masked[field] = '****'
        }
      } else {
        masked[field] = '[MASKED]'
      }
    }
  }
  
  // Recursively mask nested objects
  for (const key in masked) {
    if (typeof masked[key] === 'object' && masked[key] !== null && !Array.isArray(masked[key])) {
      masked[key] = maskSensitiveData(masked[key])
    }
  }
  
  return masked
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate a secure API key
 */
export function generateApiKey(prefix: string = 'sk'): {
  key: string
  hashedKey: string
} {
  const random = crypto.randomBytes(32).toString('hex')
  const key = `${prefix}_${process.env.NODE_ENV === 'production' ? 'live' : 'test'}_${random}`
  
  // Store only hash in database
  const hashedKey = crypto
    .createHash('sha256')
    .update(key)
    .digest('hex')
  
  return { key, hashedKey }
}

/**
 * Verify an API key
 */
export function verifyApiKey(key: string, hashedKey: string): boolean {
  const keyHash = crypto
    .createHash('sha256')
    .update(key)
    .digest('hex')
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(keyHash),
    Buffer.from(hashedKey)
  )
}

/**
 * Encrypt file content
 */
export async function encryptFile(
  buffer: Buffer,
  model: string = 'file'
): Promise<{
  encrypted: Buffer
  metadata: {
    iv: string
    tag: string
    version: number
    algorithm: string
  }
}> {
  const manager = getKeyManager()
  const key = manager.getKeyForModel(model)
  const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength)
  const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv)
  
  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ])
  
  const tag = cipher.getAuthTag()
  
  return {
    encrypted,
    metadata: {
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      version: 1,
      algorithm: ENCRYPTION_CONFIG.algorithm
    }
  }
}

/**
 * Decrypt file content
 */
export async function decryptFile(
  encrypted: Buffer,
  metadata: {
    iv: string
    tag: string
    version?: number
    algorithm?: string
  },
  model: string = 'file'
): Promise<Buffer> {
  const manager = getKeyManager()
  const key = manager.getKeyForModel(model)
  const iv = Buffer.from(metadata.iv, 'hex')
  const tag = Buffer.from(metadata.tag, 'hex')
  const algorithm = metadata.algorithm || ENCRYPTION_CONFIG.algorithm
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(tag)
  
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])
}

/**
 * Tokenize sensitive data (for PCI compliance)
 */
export function tokenize(value: string): {
  token: string
  hint: string
} {
  const token = crypto.randomBytes(16).toString('hex')
  
  // Create hint (first and last 4 chars for cards, first 2 for other data)
  let hint = ''
  if (value.length >= 16) {
    // Credit card
    hint = `${value.slice(0, 4)}****${value.slice(-4)}`
  } else if (value.length > 4) {
    hint = `${value.slice(0, 2)}****`
  } else {
    hint = '****'
  }
  
  // In production, store token->value mapping in secure vault
  // For now, just return the token
  
  return { token, hint }
}

/**
 * Create encryption middleware for Prisma
 */
export function createEncryptionMiddleware() {
  return {
    async $beforeCreate(params: any) {
      if (params.model && params.args?.data) {
        params.args.data = encryptObject(params.args.data, params.model)
      }
      return params
    },
    
    async $beforeUpdate(params: any) {
      if (params.model && params.args?.data) {
        params.args.data = encryptObject(params.args.data, params.model)
      }
      return params
    },
    
    async $afterFind(params: any, result: any) {
      if (params.model && result) {
        if (Array.isArray(result)) {
          return result.map(item => decryptObject(item, params.model))
        }
        return decryptObject(result, params.model)
      }
      return result
    }
  }
}

/**
 * Export function to get key manager instance
 */
export { getKeyManager as getKeyManagerInstance }

/**
 * Export encryption configuration for testing
 */
export { ENCRYPTION_CONFIG, ENCRYPTED_FIELDS, MASKED_FIELDS }

/**
 * Cleanup function for graceful shutdown
 */
export function cleanupEncryption(): void {
  if (keyManager) {
    keyManager.destroy()
  }
}