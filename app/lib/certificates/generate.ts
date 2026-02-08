/**
 * Certificate Generation System for ItWhip Platform
 * Generates TU-1, TU-2, TU-3 security compliance certificates
 */

import crypto from 'crypto'
// @ts-ignore -- no type declarations available for this module
import { QRCodeCanvas } from '@lifi/qrcode'
import { logger } from '@/app/lib/monitoring/logger'
import { encrypt, generateSecureToken } from '@/app/lib/database/encryption'
import prisma from '@/app/lib/database/prisma'

// Certificate types and their requirements
export enum CertificateType {
  TU_1_A = 'TU-1-A', // Basic Security Compliance
  TU_1_B = 'TU-1-B', // Basic Security with Performance
  TU_1_C = 'TU-1-C', // Basic Security with Excellence
  TU_2_A = 'TU-2-A', // Advanced Security Compliance
  TU_2_B = 'TU-2-B', // Advanced Security with Performance
  TU_2_C = 'TU-2-C', // Advanced Security with Excellence
  TU_3_A = 'TU-3-A', // Enterprise Security Compliance
  TU_3_B = 'TU-3-B', // Enterprise Security with Performance
  TU_3_C = 'TU-3-C', // Enterprise Security with Excellence
}

// Certificate grade requirements
export interface CertificateRequirements {
  // Security requirements
  soc2Compliant: boolean
  pcidssCompliant: boolean
  gdprCompliant: boolean
  ccpaCompliant: boolean
  hipaaCompliant: boolean
  iso27001: boolean
  
  // Performance requirements
  uptimePercentage: number
  averageResponseTime: number
  errorRate: number
  
  // Business requirements
  monthlyRides: number
  customerSatisfaction: number
  driverRating: number
  revenueThreshold: number
  
  // ESG requirements
  carbonNeutral: boolean
  sustainabilityScore: number
  diversityScore: number
}

// Certificate levels and their requirements
const CERTIFICATE_REQUIREMENTS: Record<CertificateType, Partial<CertificateRequirements>> = {
  // TU-1 Series (Starter)
  [CertificateType.TU_1_A]: {
    soc2Compliant: true,
    uptimePercentage: 95,
    monthlyRides: 100,
    customerSatisfaction: 3.5
  },
  [CertificateType.TU_1_B]: {
    soc2Compliant: true,
    uptimePercentage: 97,
    monthlyRides: 250,
    customerSatisfaction: 4.0,
    averageResponseTime: 3000
  },
  [CertificateType.TU_1_C]: {
    soc2Compliant: true,
    pcidssCompliant: true,
    uptimePercentage: 99,
    monthlyRides: 500,
    customerSatisfaction: 4.5,
    averageResponseTime: 2000,
    driverRating: 4.5
  },
  
  // TU-2 Series (Business)
  [CertificateType.TU_2_A]: {
    soc2Compliant: true,
    pcidssCompliant: true,
    gdprCompliant: true,
    uptimePercentage: 99,
    monthlyRides: 1000,
    customerSatisfaction: 4.0,
    revenueThreshold: 50000
  },
  [CertificateType.TU_2_B]: {
    soc2Compliant: true,
    pcidssCompliant: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    uptimePercentage: 99.5,
    monthlyRides: 2000,
    customerSatisfaction: 4.5,
    averageResponseTime: 1500,
    revenueThreshold: 100000,
    sustainabilityScore: 60
  },
  [CertificateType.TU_2_C]: {
    soc2Compliant: true,
    pcidssCompliant: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    iso27001: true,
    uptimePercentage: 99.9,
    monthlyRides: 3000,
    customerSatisfaction: 4.7,
    averageResponseTime: 1000,
    driverRating: 4.7,
    revenueThreshold: 150000,
    sustainabilityScore: 75,
    carbonNeutral: true
  },
  
  // TU-3 Series (Enterprise)
  [CertificateType.TU_3_A]: {
    soc2Compliant: true,
    pcidssCompliant: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    hipaaCompliant: true,
    iso27001: true,
    uptimePercentage: 99.9,
    monthlyRides: 5000,
    customerSatisfaction: 4.5,
    revenueThreshold: 250000,
    sustainabilityScore: 70
  },
  [CertificateType.TU_3_B]: {
    soc2Compliant: true,
    pcidssCompliant: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    hipaaCompliant: true,
    iso27001: true,
    uptimePercentage: 99.95,
    monthlyRides: 10000,
    customerSatisfaction: 4.7,
    averageResponseTime: 750,
    driverRating: 4.8,
    revenueThreshold: 500000,
    sustainabilityScore: 80,
    carbonNeutral: true,
    diversityScore: 75
  },
  [CertificateType.TU_3_C]: {
    soc2Compliant: true,
    pcidssCompliant: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    hipaaCompliant: true,
    iso27001: true,
    uptimePercentage: 99.99,
    monthlyRides: 20000,
    customerSatisfaction: 4.9,
    averageResponseTime: 500,
    errorRate: 0.1,
    driverRating: 4.9,
    revenueThreshold: 1000000,
    sustainabilityScore: 90,
    carbonNeutral: true,
    diversityScore: 85
  }
}

// Certificate template
export interface Certificate {
  id: string
  certificateNumber: string
  type: CertificateType
  hotelId: string
  hotelName: string
  issuedDate: Date
  expiryDate: Date
  status: 'active' | 'expired' | 'revoked' | 'pending'
  
  // Certificate details
  complianceScore: number
  performanceScore: number
  sustainabilityScore: number
  overallGrade: string
  
  // Verification
  verificationCode: string
  qrCode: string
  publicKey: string
  signature: string
  blockchain?: {
    txHash: string
    blockNumber: number
    network: string
  }
  
  // Metadata
  issuer: {
    name: string
    title: string
    organization: string
  }
  achievements: string[]
  badges: string[]
  auditTrail: Array<{
    date: Date
    action: string
    auditor: string
  }>
}

/**
 * Certificate generator class
 */
class CertificateGenerator {
  private privateKey: string
  private publicKey: string
  
  constructor() {
    // In production, load from secure storage
    const keyPair = this.generateKeyPair()
    this.privateKey = keyPair.privateKey
    this.publicKey = keyPair.publicKey
  }
  
  /**
   * Generate RSA key pair for signing
   */
  private generateKeyPair(): { privateKey: string; publicKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })
    
    return { privateKey, publicKey }
  }
  
  /**
   * Check if hotel meets certificate requirements
   */
  async checkEligibility(
    hotelId: string,
    certificateType: CertificateType
  ): Promise<{
    eligible: boolean
    score: number
    missingRequirements: string[]
  }> {
    const requirements = CERTIFICATE_REQUIREMENTS[certificateType]
    if (!requirements) {
      throw new Error(`Invalid certificate type: ${certificateType}`)
    }
    
    // Get hotel metrics from database
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        Booking: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
      }
    }) as any
    
    if (!hotel) {
      throw new Error(`Hotel not found: ${hotelId}`)
    }
    
    const metrics = hotel.metrics
    const missingRequirements: string[] = []
    let score = 100
    
    // Check each requirement
    if (requirements.soc2Compliant && !metrics?.soc2Compliant) {
      missingRequirements.push('SOC 2 Compliance')
      score -= 20
    }
    
    if (requirements.pcidssCompliant && !metrics?.pcidssCompliant) {
      missingRequirements.push('PCI-DSS Compliance')
      score -= 15
    }
    
    if (requirements.gdprCompliant && !metrics?.gdprCompliant) {
      missingRequirements.push('GDPR Compliance')
      score -= 10
    }
    
    if (requirements.uptimePercentage && metrics?.uptime < requirements.uptimePercentage) {
      missingRequirements.push(`Uptime ${requirements.uptimePercentage}% (current: ${metrics.uptime}%)`)
      score -= 10
    }
    
    if (requirements.monthlyRides && hotel.rides.length < requirements.monthlyRides) {
      missingRequirements.push(`Monthly rides: ${requirements.monthlyRides} (current: ${hotel.rides.length})`)
      score -= 10
    }
    
    if (requirements.customerSatisfaction && metrics?.guestSatisfaction < requirements.customerSatisfaction) {
      missingRequirements.push(`Customer satisfaction: ${requirements.customerSatisfaction} (current: ${metrics.guestSatisfaction})`)
      score -= 10
    }
    
    return {
      eligible: missingRequirements.length === 0,
      score: Math.max(0, score),
      missingRequirements
    }
  }
  
  /**
   * Generate certificate number
   */
  private generateCertificateNumber(type: CertificateType): string {
    const prefix = type.replace(/-/g, '')
    const year = new Date().getFullYear()
    const random = crypto.randomBytes(4).toString('hex').toUpperCase()
    return `${prefix}-${year}-${random}`
  }
  
  /**
   * Generate verification code
   */
  private generateVerificationCode(): string {
    const code = crypto.randomBytes(16).toString('hex').toUpperCase()
    return code.match(/.{4}/g)?.join('-') || code
  }
  
  /**
   * Sign certificate data
   */
  private signCertificate(data: any): string {
    const sign = crypto.createSign('SHA256')
    sign.update(JSON.stringify(data))
    sign.end()
    return sign.sign(this.privateKey, 'hex')
  }
  
  /**
   * Generate QR code for certificate
   */
  private async generateQRCode(certificateId: string, verificationCode: string): Promise<string> {
    const verificationUrl = `https://verify.itwhip.com/certificate/${certificateId}?code=${verificationCode}`
    
    // In production, use a proper QR code library
    // For now, return a placeholder
    const qrData = {
      url: verificationUrl,
      certificateId,
      verificationCode,
      issuer: 'ItWhip Security'
    }
    
    return Buffer.from(JSON.stringify(qrData)).toString('base64')
  }
  
  /**
   * Generate certificate
   */
  async generateCertificate(
    hotelId: string,
    certificateType: CertificateType,
    options?: {
      customExpiry?: Date
      skipEligibilityCheck?: boolean
      reason?: string
    }
  ): Promise<Certificate> {
    try {
      // Check eligibility
      if (!options?.skipEligibilityCheck) {
        const eligibility = await this.checkEligibility(hotelId, certificateType)
        if (!eligibility.eligible) {
          throw new Error(`Hotel not eligible for ${certificateType}. Missing: ${eligibility.missingRequirements.join(', ')}`)
        }
      }
      
      // Get hotel details
      const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
      }) as any
      
      if (!hotel) {
        throw new Error(`Hotel not found: ${hotelId}`)
      }
      
      // Generate certificate details
      const certificateId = generateSecureToken(16)
      const certificateNumber = this.generateCertificateNumber(certificateType)
      const verificationCode = this.generateVerificationCode()
      const issuedDate = new Date()
      const expiryDate = options?.customExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      
      // Calculate scores
      const complianceScore = this.calculateComplianceScore(hotel.metrics)
      const performanceScore = this.calculatePerformanceScore(hotel.metrics)
      const sustainabilityScore = hotel.metrics?.sustainabilityScore || 0
      const overallGrade = this.calculateGrade(complianceScore, performanceScore, sustainabilityScore)
      
      // Generate QR code
      const qrCode = await this.generateQRCode(certificateId, verificationCode)
      
      // Determine achievements and badges
      const achievements = this.determineAchievements(hotel.metrics, certificateType)
      const badges = this.determineBadges(hotel.metrics, certificateType)
      
      // Create certificate data
      const certificateData = {
        id: certificateId,
        certificateNumber,
        type: certificateType,
        hotelId,
        hotelName: hotel.name,
        issuedDate,
        expiryDate,
        complianceScore,
        performanceScore,
        sustainabilityScore,
        overallGrade,
        verificationCode,
        achievements,
        badges
      }
      
      // Sign certificate
      const signature = this.signCertificate(certificateData)
      
      // Create certificate object
      const certificate: Certificate = {
        ...certificateData,
        status: 'active',
        qrCode,
        publicKey: this.publicKey,
        signature,
        issuer: {
          name: 'ItWhip Security Team',
          title: 'Chief Compliance Officer',
          organization: 'ItWhip Platform'
        },
        auditTrail: [{
          date: issuedDate,
          action: 'Certificate Issued',
          auditor: 'System'
        }]
      }
      
      // Store in database (encrypted)
      await this.storeCertificate(certificate)
      
      // Log certificate generation
      logger.info('Certificate generated', {
        certificateId,
        certificateNumber,
        type: certificateType,
        hotelId,
        hotelName: hotel.name
      })
      
      return certificate
      
    } catch (error) {
      logger.error('Failed to generate certificate', {
        error,
        hotelId,
        certificateType
      })
      throw error
    }
  }
  
  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(metrics: any): number {
    if (!metrics) return 0
    
    let score = 0
    const weights = {
      soc2Compliant: 20,
      pcidssCompliant: 20,
      gdprCompliant: 15,
      ccpaCompliant: 15,
      hipaaCompliant: 15,
      iso27001: 15
    }
    
    for (const [key, weight] of Object.entries(weights)) {
      if (metrics[key]) {
        score += weight
      }
    }
    
    return score
  }
  
  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(metrics: any): number {
    if (!metrics) return 0
    
    let score = 0
    
    // Uptime (max 30 points)
    if (metrics.uptime >= 99.99) score += 30
    else if (metrics.uptime >= 99.9) score += 25
    else if (metrics.uptime >= 99) score += 20
    else if (metrics.uptime >= 95) score += 10
    
    // Response time (max 25 points)
    if (metrics.avgResponseTime <= 500) score += 25
    else if (metrics.avgResponseTime <= 1000) score += 20
    else if (metrics.avgResponseTime <= 2000) score += 15
    else if (metrics.avgResponseTime <= 3000) score += 10
    
    // Error rate (max 25 points)
    if (metrics.errorRate <= 0.1) score += 25
    else if (metrics.errorRate <= 0.5) score += 20
    else if (metrics.errorRate <= 1) score += 15
    else if (metrics.errorRate <= 2) score += 10
    
    // Customer satisfaction (max 20 points)
    if (metrics.guestSatisfaction >= 4.8) score += 20
    else if (metrics.guestSatisfaction >= 4.5) score += 15
    else if (metrics.guestSatisfaction >= 4.0) score += 10
    else if (metrics.guestSatisfaction >= 3.5) score += 5
    
    return Math.min(100, score)
  }
  
  /**
   * Calculate overall grade
   */
  private calculateGrade(compliance: number, performance: number, sustainability: number): string {
    const overall = (compliance * 0.4 + performance * 0.4 + sustainability * 0.2)
    
    if (overall >= 95) return 'A+'
    if (overall >= 90) return 'A'
    if (overall >= 85) return 'A-'
    if (overall >= 80) return 'B+'
    if (overall >= 75) return 'B'
    if (overall >= 70) return 'B-'
    if (overall >= 65) return 'C+'
    if (overall >= 60) return 'C'
    return 'C-'
  }
  
  /**
   * Determine achievements
   */
  private determineAchievements(metrics: any, type: CertificateType): string[] {
    const achievements: string[] = []
    
    if (metrics?.soc2Compliant) achievements.push('SOC 2 Type II Certified')
    if (metrics?.pcidssCompliant) achievements.push('PCI-DSS Level 1 Compliant')
    if (metrics?.gdprCompliant) achievements.push('GDPR Compliant')
    if (metrics?.iso27001) achievements.push('ISO 27001 Certified')
    if (metrics?.carbonNeutral) achievements.push('Carbon Neutral Operations')
    if (metrics?.uptime >= 99.99) achievements.push('Four Nines Uptime')
    if (metrics?.guestSatisfaction >= 4.8) achievements.push('Excellence in Guest Satisfaction')
    if (metrics?.monthlyRides >= 10000) achievements.push('High Volume Operator')
    
    // Type-specific achievements
    if (type.includes('TU-3')) {
      achievements.push('Enterprise Security Leader')
    } else if (type.includes('TU-2')) {
      achievements.push('Business Security Excellence')
    }
    
    return achievements
  }
  
  /**
   * Determine badges
   */
  private determineBadges(metrics: any, type: CertificateType): string[] {
    const badges: string[] = []
    
    // Compliance badges
    if (metrics?.soc2Compliant && metrics?.pcidssCompliant) {
      badges.push('🛡️ Security Champion')
    }
    
    // Performance badges
    if (metrics?.uptime >= 99.9 && metrics?.avgResponseTime <= 1000) {
      badges.push('⚡ Performance Leader')
    }
    
    // Sustainability badges
    if (metrics?.carbonNeutral) {
      badges.push('🌱 Eco-Friendly')
    }
    
    if (metrics?.sustainabilityScore >= 80) {
      badges.push('♻️ Sustainability Star')
    }
    
    // Volume badges
    if (metrics?.monthlyRides >= 5000) {
      badges.push('🚀 High Volume')
    }
    
    // Grade badges
    const grade = type.split('-')[2] // Get A, B, or C
    if (grade === 'C') {
      badges.push('🏆 Excellence Award')
    } else if (grade === 'B') {
      badges.push('🥈 Performance Award')
    } else if (grade === 'A') {
      badges.push('🥉 Compliance Award')
    }
    
    return badges
  }
  
  /**
   * Store certificate in database
   */
  private async storeCertificate(certificate: Certificate): Promise<void> {
    // In production, store this in database
    // For now, just encrypt sensitive parts
    const encrypted = encrypt(JSON.stringify(certificate), 'Certificate')
    
    // Store encrypted certificate
    // await prisma.certificate.create({ data: encrypted })
    
    logger.debug('Certificate stored', { certificateId: certificate.id })
  }
  
  /**
   * Revoke a certificate
   */
  async revokeCertificate(
    certificateId: string,
    reason: string
  ): Promise<void> {
    // Update certificate status in database
    // await prisma.certificate.update({
    //   where: { id: certificateId },
    //   data: { status: 'revoked' }
    // })
    
    logger.warn('Certificate revoked', {
      certificateId,
      reason
    })
  }
  
  /**
   * Renew a certificate
   */
  async renewCertificate(
    certificateId: string
  ): Promise<Certificate> {
    // Get existing certificate
    // const existing = await prisma.certificate.findUnique({
    //   where: { id: certificateId }
    // })
    
    // Generate new certificate with same type
    // return this.generateCertificate(existing.hotelId, existing.type)
    
    throw new Error('Renewal not implemented')
  }
}

// Create singleton instance
const certificateGenerator = new CertificateGenerator()

// Export functions
export async function generateCertificate(
  hotelId: string,
  type: CertificateType,
  options?: any
): Promise<Certificate> {
  return certificateGenerator.generateCertificate(hotelId, type, options)
}

export async function checkCertificateEligibility(
  hotelId: string,
  type: CertificateType
): Promise<any> {
  return certificateGenerator.checkEligibility(hotelId, type)
}

export async function revokeCertificate(
  certificateId: string,
  reason: string
): Promise<void> {
  return certificateGenerator.revokeCertificate(certificateId, reason)
}

export async function renewCertificate(
  certificateId: string
): Promise<Certificate> {
  return certificateGenerator.renewCertificate(certificateId)
}

export { certificateGenerator, CertificateGenerator }

export default certificateGenerator