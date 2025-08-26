/**
 * Encryption Layer for ItWhip Platform
 * Handles data encryption, password hashing, and key management
 */

import {
    randomBytes,
    createCipheriv,
    createDecipheriv,
    createHash,
    pbkdf2Sync,
    scryptSync,
    generateKeyPairSync,
    publicEncrypt,
    privateDecrypt,
    createSign,
    createVerify,
    constants
  } from 'crypto'
  import bcrypt from 'bcryptjs'
  import type { EncryptedData, EncryptionMethod, SecurityKey } from '@/app/types/security'
  
  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  /**
   * Encryption Configuration
   */
  const ENCRYPTION_CONFIG = {
    // AES-256-GCM settings
    AES: {
      ALGORITHM: 'aes-256-gcm',
      KEY_LENGTH: 32, // bytes
      IV_LENGTH: 16, // bytes
      TAG_LENGTH: 16, // bytes
      SALT_LENGTH: 64 // bytes
    },
    
    // Password hashing
    BCRYPT: {
      ROUNDS: 12, // Cost factor
      MIN_LENGTH: 12,
      MAX_LENGTH: 128
    },
    
    // Key derivation
    PBKDF2: {
      ITERATIONS: 100000,
      KEY_LENGTH: 32,
      DIGEST: 'sha256'
    },
    
    // RSA settings
    RSA: {
      KEY_SIZE: 4096,
      PADDING: constants.RSA_PKCS1_OAEP_PADDING,
      OAEP_HASH: 'sha256'
    },
    
    // Master key (should be in HSM/KMS in production)
    MASTER_KEY: process.env.MASTER_ENCRYPTION_KEY || generateMasterKey(),
    
    // Key rotation schedule (days)
    KEY_ROTATION: {
      DATA_KEYS: 90,
      API_KEYS: 180,
      MASTER_KEY: 365
    }
  }
  
  /**
   * Fields that should be encrypted in database
   */
  export const ENCRYPTED_FIELDS = {
    // User fields
    user: ['email', 'phone', 'passwordHash'],
    
    // Guest fields
    guest: ['firstName', 'lastName', 'email', 'phone'],
    
    // Payment fields
    transaction: ['cardNumber', 'cvv', 'accountNumber'],
    
    // API keys
    apiKey: ['key', 'secret'],
    
    // Sensitive logs
    auditLog: ['ipAddress', 'details']
  }
  
  // ============================================================================
  // AES ENCRYPTION (SYMMETRIC)
  // ============================================================================
  
  /**
   * Encrypt data using AES-256-GCM
   */
  export function encryptData(
    plaintext: string | Buffer,
    key?: Buffer
  ): EncryptedData {
    try {
      // Convert string to buffer if needed
      const data = typeof plaintext === 'string' 
        ? Buffer.from(plaintext, 'utf8') 
        : plaintext
      
      // Generate or use provided key
      const salt = randomBytes(ENCRYPTION_CONFIG.AES.SALT_LENGTH)
      const derivedKey = key || deriveKey(ENCRYPTION_CONFIG.MASTER_KEY, salt)
      
      // Generate IV
      const iv = randomBytes(ENCRYPTION_CONFIG.AES.IV_LENGTH)
      
      // Create cipher
      const cipher = createCipheriv(
        ENCRYPTION_CONFIG.AES.ALGORITHM,
        derivedKey,
        iv
      )
      
      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final()
      ])
      
      // Get auth tag
      const tag = cipher.getAuthTag()
      
      return {
        method: EncryptionMethod.AES_256_GCM,
        data: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        salt: salt.toString('base64'),
        tag: tag.toString('base64'),
        keyId: 'master_v1', // Track which key was used
        encryptedAt: new Date()
      }
    } catch (error: any) {
      throw new Error(`Encryption failed: ${error.message}`)
    }
  }
  
  /**
   * Decrypt data using AES-256-GCM
   */
  export function decryptData(
    encryptedData: EncryptedData,
    key?: Buffer
  ): string {
    try {
      // Validate encryption method
      if (encryptedData.method !== EncryptionMethod.AES_256_GCM) {
        throw new Error(`Unsupported encryption method: ${encryptedData.method}`)
      }
      
      // Decode from base64
      const encrypted = Buffer.from(encryptedData.data, 'base64')
      const iv = Buffer.from(encryptedData.iv!, 'base64')
      const salt = Buffer.from(encryptedData.salt!, 'base64')
      const tag = Buffer.from(encryptedData.tag!, 'base64')
      
      // Derive key
      const derivedKey = key || deriveKey(ENCRYPTION_CONFIG.MASTER_KEY, salt)
      
      // Create decipher
      const decipher = createDecipheriv(
        ENCRYPTION_CONFIG.AES.ALGORITHM,
        derivedKey,
        iv
      )
      
      // Set auth tag
      decipher.setAuthTag(tag)
      
      // Decrypt data
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ])
      
      return decrypted.toString('utf8')
    } catch (error: any) {
      throw new Error(`Decryption failed: ${error.message}`)
    }
  }
  
  /**
   * Encrypt sensitive fields in an object
   */
  export function encryptFields<T extends Record<string, any>>(
    obj: T,
    fields: string[]
  ): T {
    const encrypted = { ...obj }
    
    for (const field of fields) {
      if (field in encrypted && encrypted[field] !== null && encrypted[field] !== undefined) {
        const encryptedData = encryptData(String(encrypted[field]))
        encrypted[field] = JSON.stringify(encryptedData)
      }
    }
    
    return encrypted
  }
  
  /**
   * Decrypt sensitive fields in an object
   */
  export function decryptFields<T extends Record<string, any>>(
    obj: T,
    fields: string[]
  ): T {
    const decrypted = { ...obj }
    
    for (const field of fields) {
      if (field in decrypted && decrypted[field]) {
        try {
          const encryptedData = JSON.parse(decrypted[field])
          decrypted[field] = decryptData(encryptedData)
        } catch {
          // Field might not be encrypted, leave as is
        }
      }
    }
    
    return decrypted
  }
  
  // ============================================================================
  // PASSWORD HASHING
  // ============================================================================
  
  /**
   * Hash a password using bcrypt
   */
  export async function hashPassword(password: string): Promise<string> {
    // Validate password
    if (!password || password.length < ENCRYPTION_CONFIG.BCRYPT.MIN_LENGTH) {
      throw new Error(`Password must be at least ${ENCRYPTION_CONFIG.BCRYPT.MIN_LENGTH} characters`)
    }
    
    if (password.length > ENCRYPTION_CONFIG.BCRYPT.MAX_LENGTH) {
      throw new Error(`Password must be less than ${ENCRYPTION_CONFIG.BCRYPT.MAX_LENGTH} characters`)
    }
    
    // Hash password
    return bcrypt.hash(password, ENCRYPTION_CONFIG.BCRYPT.ROUNDS)
  }
  
  /**
   * Verify a password against a hash
   */
  export async function verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash)
    } catch {
      return false
    }
  }
  
  /**
   * Check password strength
   */
  export function checkPasswordStrength(password: string): {
    valid: boolean
    score: number
    issues: string[]
  } {
    const issues: string[] = []
    let score = 0
    
    // Length check
    if (password.length < ENCRYPTION_CONFIG.BCRYPT.MIN_LENGTH) {
      issues.push(`Password must be at least ${ENCRYPTION_CONFIG.BCRYPT.MIN_LENGTH} characters`)
    } else {
      score += 25
    }
    
    // Complexity checks
    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain uppercase letters')
    } else {
      score += 25
    }
    
    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain lowercase letters')
    } else {
      score += 25
    }
    
    if (!/[0-9]/.test(password)) {
      issues.push('Password must contain numbers')
    } else {
      score += 15
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      issues.push('Password must contain special characters')
    } else {
      score += 10
    }
    
    return {
      valid: issues.length === 0,
      score,
      issues
    }
  }
  
  // ============================================================================
  // RSA ENCRYPTION (ASYMMETRIC)
  // ============================================================================
  
  /**
   * Generate RSA key pair
   */
  export function generateKeyPair(): {
    publicKey: string
    privateKey: string
  } {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: ENCRYPTION_CONFIG.RSA.KEY_SIZE,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: ENCRYPTION_CONFIG.MASTER_KEY
      }
    })
    
    return { publicKey, privateKey }
  }
  
  /**
   * Encrypt with RSA public key
   */
  export function encryptWithPublicKey(
    data: string,
    publicKey: string
  ): string {
    const buffer = Buffer.from(data, 'utf8')
    
    const encrypted = publicEncrypt(
      {
        key: publicKey,
        padding: ENCRYPTION_CONFIG.RSA.PADDING,
        oaepHash: ENCRYPTION_CONFIG.RSA.OAEP_HASH
      },
      buffer
    )
    
    return encrypted.toString('base64')
  }
  
  /**
   * Decrypt with RSA private key
   */
  export function decryptWithPrivateKey(
    encryptedData: string,
    privateKey: string
  ): string {
    const buffer = Buffer.from(encryptedData, 'base64')
    
    const decrypted = privateDecrypt(
      {
        key: privateKey,
        padding: ENCRYPTION_CONFIG.RSA.PADDING,
        oaepHash: ENCRYPTION_CONFIG.RSA.OAEP_HASH,
        passphrase: ENCRYPTION_CONFIG.MASTER_KEY
      },
      buffer
    )
    
    return decrypted.toString('utf8')
  }
  
  /**
   * Sign data with private key
   */
  export function signData(
    data: string,
    privateKey: string
  ): string {
    const sign = createSign('SHA256')
    sign.update(data)
    sign.end()
    
    return sign.sign(
      {
        key: privateKey,
        passphrase: ENCRYPTION_CONFIG.MASTER_KEY
      },
      'base64'
    )
  }
  
  /**
   * Verify signature with public key
   */
  export function verifySignature(
    data: string,
    signature: string,
    publicKey: string
  ): boolean {
    const verify = createVerify('SHA256')
    verify.update(data)
    verify.end()
    
    return verify.verify(publicKey, signature, 'base64')
  }
  
  // ============================================================================
  // KEY MANAGEMENT
  // ============================================================================
  
  /**
   * Generate a master key
   */
  function generateMasterKey(): string {
    return randomBytes(32).toString('hex')
  }
  
  /**
   * Derive an encryption key from master key
   */
  function deriveKey(masterKey: string, salt: Buffer): Buffer {
    return pbkdf2Sync(
      masterKey,
      salt,
      ENCRYPTION_CONFIG.PBKDF2.ITERATIONS,
      ENCRYPTION_CONFIG.PBKDF2.KEY_LENGTH,
      ENCRYPTION_CONFIG.PBKDF2.DIGEST
    )
  }
  
  /**
   * Generate a data encryption key (DEK)
   */
  export function generateDataKey(): {
    plainKey: Buffer
    encryptedKey: EncryptedData
  } {
    // Generate random DEK
    const plainKey = randomBytes(ENCRYPTION_CONFIG.AES.KEY_LENGTH)
    
    // Encrypt DEK with master key
    const encryptedKey = encryptData(plainKey)
    
    return { plainKey, encryptedKey }
  }
  
  /**
   * Rotate encryption keys
   */
  export async function rotateEncryptionKeys(): Promise<{
    oldKeyId: string
    newKeyId: string
    rotatedAt: Date
  }> {
    // Generate new master key
    const newMasterKey = generateMasterKey()
    const oldKeyId = 'master_v1'
    const newKeyId = 'master_v2'
    
    // In production, this would:
    // 1. Generate new key in KMS
    // 2. Re-encrypt all data with new key
    // 3. Update key references
    // 4. Archive old key
    
    return {
      oldKeyId,
      newKeyId,
      rotatedAt: new Date()
    }
  }
  
  /**
   * Store encryption key securely
   */
  export async function storeKey(
    key: SecurityKey
  ): Promise<void> {
    // In production, use AWS KMS, HashiCorp Vault, or similar
    // For now, encrypt and store in database
    
    if (key.key.private) {
      key.key.private = encryptData(key.key.private).data
    }
    
    if (key.key.secret) {
      key.key.secret = encryptData(key.key.secret).data
    }
    
    // Store in database (implementation depends on Prisma setup)
  }
  
  // ============================================================================
  // TOKENIZATION
  // ============================================================================
  
  /**
   * Tokenize sensitive data (PII)
   */
  export function tokenizePII(data: string): {
    token: string
    hint: string
  } {
    // Generate unique token
    const token = `tok_${randomBytes(24).toString('hex')}`
    
    // Create hint (last 4 chars)
    const hint = data.length > 4 
      ? `****${data.slice(-4)}`
      : '****'
    
    // In production, store mapping in secure vault
    tokenStore.set(token, encryptData(data))
    
    return { token, hint }
  }
  
  /**
   * Detokenize to retrieve original data
   */
  export function detokenizePII(token: string): string | null {
    const encryptedData = tokenStore.get(token)
    
    if (!encryptedData) {
      return null
    }
    
    return decryptData(encryptedData)
  }
  
  // Token storage (use secure database in production)
  const tokenStore = new Map<string, EncryptedData>()
  
  // ============================================================================
  // SECURE RANDOM GENERATION
  // ============================================================================
  
  /**
   * Generate secure random string
   */
  export function generateSecureRandom(
    length: number = 32,
    encoding: 'hex' | 'base64' | 'base64url' = 'hex'
  ): string {
    return randomBytes(length).toString(encoding)
  }
  
  /**
   * Generate secure random number
   */
  export function generateSecureRandomNumber(min: number, max: number): number {
    const range = max - min
    const bytesNeeded = Math.ceil(Math.log2(range) / 8)
    const randomValue = randomBytes(bytesNeeded).readUIntBE(0, bytesNeeded)
    
    return min + (randomValue % range)
  }
  
  /**
   * Generate secure UUID
   */
  export function generateSecureUUID(): string {
    const uuid = randomBytes(16)
    
    // Set version (4) and variant bits
    uuid[6] = (uuid[6] & 0x0f) | 0x40
    uuid[8] = (uuid[8] & 0x3f) | 0x80
    
    return [
      uuid.toString('hex', 0, 4),
      uuid.toString('hex', 4, 6),
      uuid.toString('hex', 6, 8),
      uuid.toString('hex', 8, 10),
      uuid.toString('hex', 10, 16)
    ].join('-')
  }
  
  // ============================================================================
  // HASHING UTILITIES
  // ============================================================================
  
  /**
   * Hash data with SHA-256
   */
  export function hashSHA256(data: string | Buffer): string {
    return createHash('sha256').update(data).digest('hex')
  }
  
  /**
   * Hash data with SHA-512
   */
  export function hashSHA512(data: string | Buffer): string {
    return createHash('sha512').update(data).digest('hex')
  }
  
  /**
   * Create HMAC
   */
  export function createHMAC(
    data: string,
    secret: string,
    algorithm: 'sha256' | 'sha512' = 'sha256'
  ): string {
    const hmac = require('crypto').createHmac(algorithm, secret)
    return hmac.update(data).digest('hex')
  }
  
  /**
   * Verify HMAC
   */
  export function verifyHMAC(
    data: string,
    hmac: string,
    secret: string,
    algorithm: 'sha256' | 'sha512' = 'sha256'
  ): boolean {
    const expectedHmac = createHMAC(data, secret, algorithm)
    
    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(expectedHmac)
    )
  }
  
  /**
   * Timing-safe comparison
   */
  function timingSafeEqual(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) {
      return false
    }
    
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i]
    }
    
    return result === 0
  }
  
  // ============================================================================
  // COMPLIANCE UTILITIES
  // ============================================================================
  
  /**
   * Sanitize data for logging (remove PII)
   */
  export function sanitizeForLogging(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data
    }
    
    const sanitized = Array.isArray(data) ? [...data] : { ...data }
    
    const sensitiveFields = [
      'password', 'passwordHash', 'ssn', 'creditCard',
      'cardNumber', 'cvv', 'pin', 'secret', 'token',
      'apiKey', 'privateKey', 'email', 'phone'
    ]
    
    for (const key in sanitized) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeForLogging(sanitized[key])
      }
    }
    
    return sanitized
  }
  
  /**
   * Check if data contains PII
   */
  export function containsPII(data: string): boolean {
    // Check for common PII patterns
    const patterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/ // Phone
    ]
    
    return patterns.some(pattern => pattern.test(data))
  }
  
  // ============================================================================
  // EXPORTS
  // ============================================================================
  
  export default {
    // AES encryption
    encryptData,
    decryptData,
    encryptFields,
    decryptFields,
    
    // Password hashing
    hashPassword,
    verifyPassword,
    checkPasswordStrength,
    
    // RSA encryption
    generateKeyPair,
    encryptWithPublicKey,
    decryptWithPrivateKey,
    signData,
    verifySignature,
    
    // Key management
    generateDataKey,
    rotateEncryptionKeys,
    storeKey,
    
    // Tokenization
    tokenizePII,
    detokenizePII,
    
    // Random generation
    generateSecureRandom,
    generateSecureRandomNumber,
    generateSecureUUID,
    
    // Hashing
    hashSHA256,
    hashSHA512,
    createHMAC,
    verifyHMAC,
    
    // Compliance
    sanitizeForLogging,
    containsPII,
    
    // Configuration
    ENCRYPTION_CONFIG,
    ENCRYPTED_FIELDS
  }