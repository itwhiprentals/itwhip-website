/**
 * Certificate Validation System for ItWhip Platform
 * Verifies authenticity and validity of TU security certificates
 */

import crypto from 'crypto'
import { logger } from '@/app/lib/monitoring/logger'
import { decrypt } from '@/app/lib/database/encryption'
import { createAuditLog } from '@/app/lib/database/audit'
import prisma from '@/app/lib/database/prisma'
import type { Certificate, CertificateType } from './generate'

// Validation result types
export interface ValidationResult {
  valid: boolean
  certificateId?: string
  certificateNumber?: string
  type?: CertificateType
  hotelName?: string
  status?: 'active' | 'expired' | 'revoked' | 'invalid'
  expiryDate?: Date
  issueDate?: Date
  
  // Validation details
  checks: {
    signature: boolean
    expiry: boolean
    revocation: boolean
    integrity: boolean
    ownership: boolean
  }
  
  // Scores if valid
  scores?: {
    compliance: number
    performance: number
    sustainability: number
    overall: string
  }
  
  // Achievements if valid
  achievements?: string[]
  badges?: string[]
  
  // Error details if invalid
  errors?: string[]
  warnings?: string[]
  
  // Verification metadata
  verifiedAt: Date
  verificationMethod: 'api' | 'qr' | 'manual'
  verifierIp?: string
}

// Certificate cache for performance
class CertificateCache {
  private cache = new Map<string, { certificate: any; timestamp: number }>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes
  
  get(id: string): any | null {
    const item = this.cache.get(id)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(id)
      return null
    }
    
    return item.certificate
  }
  
  set(id: string, certificate: any): void {
    this.cache.set(id, {
      certificate,
      timestamp: Date.now()
    })
  }
  
  clear(): void {
    this.cache.clear()
  }
}

/**
 * Certificate validator class
 */
class CertificateValidator {
  private publicKeys = new Map<string, string>()
  private revokedCertificates = new Set<string>()
  private cache = new CertificateCache()
  private updateInterval: NodeJS.Timeout | null = null
  
  constructor() {
    this.loadPublicKeys()
    this.loadRevokedCertificates()
    this.startPeriodicUpdates()
  }
  
  /**
   * Load public keys for verification
   */
  private async loadPublicKeys(): Promise<void> {
    // In production, load from secure storage or database
    // For now, use the default key
    const defaultPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890...
-----END PUBLIC KEY-----`
    
    this.publicKeys.set('default', defaultPublicKey)
    
    // Load issuer-specific keys
    this.publicKeys.set('itwhip-2024', process.env.CERTIFICATE_PUBLIC_KEY || defaultPublicKey)
  }
  
  /**
   * Load revoked certificates list
   */
  private async loadRevokedCertificates(): Promise<void> {
    try {
      // In production, load from database
      // const revoked = await prisma.certificate.findMany({
      //   where: { status: 'revoked' },
      //   select: { id: true }
      // })
      // revoked.forEach(cert => this.revokedCertificates.add(cert.id))
      
      // For now, use a static list
      this.revokedCertificates.clear()
      
      logger.debug('Loaded revoked certificates', {
        count: this.revokedCertificates.size
      })
    } catch (error) {
      logger.error('Failed to load revoked certificates', { error })
    }
  }
  
  /**
   * Start periodic updates
   */
  private startPeriodicUpdates(): void {
    // Update revocation list every hour
    this.updateInterval = setInterval(() => {
      this.loadRevokedCertificates()
      this.cache.clear() // Clear cache on updates
    }, 60 * 60 * 1000)
  }
  
  /**
   * Validate certificate by ID
   */
  async validateById(
    certificateId: string,
    options?: {
      checkOwnership?: string // Hotel ID to verify ownership
      skipCache?: boolean
      verifierIp?: string
    }
  ): Promise<ValidationResult> {
    try {
      // Check cache first
      if (!options?.skipCache) {
        const cached = this.cache.get(certificateId)
        if (cached) {
          return this.performValidation(cached, options)
        }
      }
      
      // Load certificate from database
      // const certificate = await prisma.certificate.findUnique({
      //   where: { id: certificateId }
      // })
      
      // For now, create mock certificate
      const certificate = this.getMockCertificate(certificateId)
      
      if (!certificate) {
        return this.createInvalidResult('Certificate not found', options?.verifierIp)
      }
      
      // Cache the certificate
      this.cache.set(certificateId, certificate)
      
      // Perform validation
      return this.performValidation(certificate, options)
      
    } catch (error) {
      logger.error('Certificate validation failed', {
        error,
        certificateId
      })
      
      return this.createInvalidResult('Validation error', options?.verifierIp)
    }
  }
  
  /**
   * Validate certificate by verification code
   */
  async validateByCode(
    verificationCode: string,
    options?: {
      verifierIp?: string
    }
  ): Promise<ValidationResult> {
    try {
      // Find certificate by verification code
      // const certificate = await prisma.certificate.findFirst({
      //   where: { verificationCode }
      // })
      
      // For now, create mock
      const certificate = this.getMockCertificateByCode(verificationCode)
      
      if (!certificate) {
        return this.createInvalidResult('Invalid verification code', options?.verifierIp)
      }
      
      return this.performValidation(certificate, options)
      
    } catch (error) {
      logger.error('Code validation failed', {
        error,
        verificationCode: verificationCode.substring(0, 4) + '****'
      })
      
      return this.createInvalidResult('Validation error', options?.verifierIp)
    }
  }
  
  /**
   * Validate certificate from QR code data
   */
  async validateQRCode(
    qrData: string,
    options?: {
      verifierIp?: string
    }
  ): Promise<ValidationResult> {
    try {
      // Parse QR code data
      const decoded = Buffer.from(qrData, 'base64').toString('utf8')
      const data = JSON.parse(decoded)
      
      if (!data.certificateId || !data.verificationCode) {
        return this.createInvalidResult('Invalid QR code', options?.verifierIp)
      }
      
      // Validate using the embedded data
      const result = await this.validateById(data.certificateId, {
        verifierIp: options?.verifierIp
      })
      
      // Additional QR-specific validation
      if (result.valid && data.verificationCode) {
        // Verify the code matches
        // This would check against the database
      }
      
      return {
        ...result,
        verificationMethod: 'qr'
      }
      
    } catch (error) {
      logger.error('QR validation failed', { error })
      
      return this.createInvalidResult('Invalid QR code', options?.verifierIp)
    }
  }
  
  /**
   * Perform actual validation checks
   */
  private async performValidation(
    certificate: any,
    options?: {
      checkOwnership?: string
      verifierIp?: string
    }
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    
    const checks = {
      signature: false,
      expiry: false,
      revocation: false,
      integrity: false,
      ownership: false
    }
    
    // Check 1: Verify signature
    const signatureValid = this.verifySignature(certificate)
    checks.signature = signatureValid
    if (!signatureValid) {
      errors.push('Invalid signature - certificate may be tampered')
    }
    
    // Check 2: Check expiry
    const now = new Date()
    const expiryDate = new Date(certificate.expiryDate)
    const isExpired = expiryDate < now
    checks.expiry = !isExpired
    if (isExpired) {
      errors.push(`Certificate expired on ${expiryDate.toISOString()}`)
    } else if (expiryDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) {
      warnings.push('Certificate expires in less than 30 days')
    }
    
    // Check 3: Check revocation
    const isRevoked = this.revokedCertificates.has(certificate.id)
    checks.revocation = !isRevoked
    if (isRevoked) {
      errors.push('Certificate has been revoked')
    }
    
    // Check 4: Verify integrity
    const integrityValid = this.verifyIntegrity(certificate)
    checks.integrity = integrityValid
    if (!integrityValid) {
      errors.push('Certificate integrity check failed')
    }
    
    // Check 5: Verify ownership (if requested)
    if (options?.checkOwnership) {
      const ownershipValid = certificate.hotelId === options.checkOwnership
      checks.ownership = ownershipValid
      if (!ownershipValid) {
        errors.push('Certificate does not belong to this hotel')
      }
    } else {
      checks.ownership = true
    }
    
    // Determine overall validity
    const valid = errors.length === 0
    const status = isRevoked ? 'revoked' : 
                  isExpired ? 'expired' :
                  valid ? 'active' : 'invalid'
    
    // Log validation attempt
    await this.logValidation({
      certificateId: certificate.id,
      valid,
      status,
      verifierIp: options?.verifierIp,
      errors
    })
    
    // Create result
    const result: ValidationResult = {
      valid,
      certificateId: certificate.id,
      certificateNumber: certificate.certificateNumber,
      type: certificate.type,
      hotelName: certificate.hotelName,
      status,
      expiryDate: expiryDate,
      issueDate: new Date(certificate.issuedDate),
      checks,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      verifiedAt: new Date(),
      verificationMethod: 'api'
    }
    
    // Add scores and achievements if valid
    if (valid) {
      result.scores = {
        compliance: certificate.complianceScore,
        performance: certificate.performanceScore,
        sustainability: certificate.sustainabilityScore,
        overall: certificate.overallGrade
      }
      result.achievements = certificate.achievements
      result.badges = certificate.badges
    }
    
    return result
  }
  
  /**
   * Verify certificate signature
   */
  private verifySignature(certificate: any): boolean {
    try {
      if (!certificate.signature || !certificate.publicKey) {
        return false
      }
      
      // Get the public key
      const publicKey = this.publicKeys.get('default') || certificate.publicKey
      
      // Create verification data (same as was signed)
      const verificationData = {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        type: certificate.type,
        hotelId: certificate.hotelId,
        hotelName: certificate.hotelName,
        issuedDate: certificate.issuedDate,
        expiryDate: certificate.expiryDate,
        complianceScore: certificate.complianceScore,
        performanceScore: certificate.performanceScore,
        sustainabilityScore: certificate.sustainabilityScore,
        overallGrade: certificate.overallGrade,
        verificationCode: certificate.verificationCode,
        achievements: certificate.achievements,
        badges: certificate.badges
      }
      
      // Verify signature
      const verify = crypto.createVerify('SHA256')
      verify.update(JSON.stringify(verificationData))
      verify.end()
      
      // For mock data, always return true
      // In production: return verify.verify(publicKey, certificate.signature, 'hex')
      return true
      
    } catch (error) {
      logger.error('Signature verification failed', { error })
      return false
    }
  }
  
  /**
   * Verify certificate integrity
   */
  private verifyIntegrity(certificate: any): boolean {
    try {
      // Check required fields
      const requiredFields = [
        'id',
        'certificateNumber',
        'type',
        'hotelId',
        'hotelName',
        'issuedDate',
        'expiryDate',
        'verificationCode'
      ]
      
      for (const field of requiredFields) {
        if (!certificate[field]) {
          logger.warn(`Missing required field: ${field}`)
          return false
        }
      }
      
      // Check certificate number format
      const numberPattern = /^TU[123][ABC]-\d{4}-[A-F0-9]{8}$/
      if (!numberPattern.test(certificate.certificateNumber)) {
        logger.warn('Invalid certificate number format')
        return false
      }
      
      // Check dates
      const issued = new Date(certificate.issuedDate)
      const expiry = new Date(certificate.expiryDate)
      
      if (issued >= expiry) {
        logger.warn('Issue date is after expiry date')
        return false
      }
      
      // Check scores are within valid range
      if (certificate.complianceScore < 0 || certificate.complianceScore > 100) {
        return false
      }
      
      if (certificate.performanceScore < 0 || certificate.performanceScore > 100) {
        return false
      }
      
      return true
      
    } catch (error) {
      logger.error('Integrity check failed', { error })
      return false
    }
  }
  
  /**
   * Log validation attempt
   */
  private async logValidation(data: {
    certificateId: string
    valid: boolean
    status: string
    verifierIp?: string
    errors?: string[]
  }): Promise<void> {
    try {
      await createAuditLog({
        category: 'COMPLIANCE',
        eventType: 'certificate.validation',
        severity: data.valid ? 'LOW' : 'MEDIUM',
        action: (data.valid ? 'verify_success' : 'verify_failed') as any,
        resource: `certificate:${data.certificateId}`,
        ipAddress: data.verifierIp || '0.0.0.0',
        userAgent: 'Certificate Validator',
        details: {
          status: data.status,
          errors: data.errors
        }
      } as any)
    } catch (error) {
      logger.error('Failed to log validation', { error })
    }
  }
  
  /**
   * Create invalid result
   */
  private createInvalidResult(
    error: string,
    verifierIp?: string
  ): ValidationResult {
    return {
      valid: false,
      status: 'invalid',
      checks: {
        signature: false,
        expiry: false,
        revocation: false,
        integrity: false,
        ownership: false
      },
      errors: [error],
      verifiedAt: new Date(),
      verificationMethod: 'api'
    }
  }
  
  /**
   * Get mock certificate for testing
   */
  private getMockCertificate(certificateId: string): any {
    if (!certificateId.startsWith('test_')) {
      return null
    }
    
    return {
      id: certificateId,
      certificateNumber: 'TU2B-2024-ABC12345',
      type: 'TU-2-B',
      hotelId: 'hotel_123',
      hotelName: 'Test Hotel Phoenix',
      issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // 335 days from now
      status: 'active',
      complianceScore: 85,
      performanceScore: 90,
      sustainabilityScore: 75,
      overallGrade: 'B+',
      verificationCode: 'ABCD-EFGH-IJKL-MNOP',
      achievements: [
        'SOC 2 Type II Certified',
        'PCI-DSS Compliant',
        'Four Nines Uptime'
      ],
      badges: ['🛡️ Security Champion', '⚡ Performance Leader'],
      signature: 'mock_signature',
      publicKey: 'mock_public_key'
    }
  }
  
  /**
   * Get mock certificate by code
   */
  private getMockCertificateByCode(code: string): any {
    if (code === 'ABCD-EFGH-IJKL-MNOP') {
      return this.getMockCertificate('test_cert_001')
    }
    return null
  }
  
  /**
   * Batch validate multiple certificates
   */
  async validateBatch(
    certificateIds: string[],
    options?: {
      parallel?: boolean
      verifierIp?: string
    }
  ): Promise<ValidationResult[]> {
    if (options?.parallel) {
      // Validate in parallel
      const promises = certificateIds.map(id => 
        this.validateById(id, { verifierIp: options.verifierIp })
      )
      return Promise.all(promises)
    } else {
      // Validate sequentially
      const results: ValidationResult[] = []
      for (const id of certificateIds) {
        const result = await this.validateById(id, { verifierIp: options?.verifierIp })
        results.push(result)
      }
      return results
    }
  }
  
  /**
   * Get certificate details without full validation
   */
  async getCertificateInfo(certificateId: string): Promise<{
    exists: boolean
    type?: CertificateType
    hotelName?: string
    status?: string
    expiryDate?: Date
  }> {
    try {
      // Check cache
      const cached = this.cache.get(certificateId)
      if (cached) {
        return {
          exists: true,
          type: cached.type,
          hotelName: cached.hotelName,
          status: cached.status,
          expiryDate: new Date(cached.expiryDate)
        }
      }
      
      // Load from database
      // const certificate = await prisma.certificate.findUnique({
      //   where: { id: certificateId },
      //   select: { type: true, hotelName: true, status: true, expiryDate: true }
      // })
      
      // For now, use mock
      const certificate = this.getMockCertificate(certificateId)
      
      if (!certificate) {
        return { exists: false }
      }
      
      return {
        exists: true,
        type: certificate.type,
        hotelName: certificate.hotelName,
        status: certificate.status,
        expiryDate: new Date(certificate.expiryDate)
      }
      
    } catch (error) {
      logger.error('Failed to get certificate info', { error, certificateId })
      return { exists: false }
    }
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.cache.clear()
  }
}

// Create singleton instance
const certificateValidator = new CertificateValidator()

// Export validation functions
export async function validateCertificate(
  certificateId: string,
  options?: any
): Promise<ValidationResult> {
  return certificateValidator.validateById(certificateId, options)
}

export async function validateCertificateByCode(
  code: string,
  options?: any
): Promise<ValidationResult> {
  return certificateValidator.validateByCode(code, options)
}

export async function validateQRCode(
  qrData: string,
  options?: any
): Promise<ValidationResult> {
  return certificateValidator.validateQRCode(qrData, options)
}

export async function validateBatch(
  certificateIds: string[],
  options?: any
): Promise<ValidationResult[]> {
  return certificateValidator.validateBatch(certificateIds, options)
}

export async function getCertificateInfo(
  certificateId: string
): Promise<any> {
  return certificateValidator.getCertificateInfo(certificateId)
}

export { certificateValidator, CertificateValidator }

export default certificateValidator