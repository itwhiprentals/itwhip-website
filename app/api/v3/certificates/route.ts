/**
 * Certificate API Endpoint for ItWhip Platform
 * Handles certificate generation, validation, and management
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authMiddleware } from '@/app/middleware/auth'
import { validationMiddleware } from '@/app/middleware/validation'
import { monitoringMiddleware } from '@/app/middleware/monitoring'
import { securityMiddleware } from '@/app/middleware/security'
import { 
  generateCertificate, 
  checkCertificateEligibility,
  revokeCertificate as revokecert,
  renewCertificate as renewCert,
  CertificateType 
} from '@/app/lib/certificates/generate'
import { 
  validateCertificate,
  validateCertificateByCode,
  validateQRCode,
  validateBatch,
  getCertificateInfo
} from '@/app/lib/certificates/validate'
import { logger } from '@/app/lib/monitoring/logger'
import { trackMetric } from '@/app/lib/monitoring/metrics'
import { createAlert } from '@/app/lib/monitoring/alerts'
import prisma from '@/app/lib/database/prisma'

// Request validation schemas
const generateSchema = z.object({
  hotelId: z.string().min(1),
  certificateType: z.enum([
    'TU-1-A', 'TU-1-B', 'TU-1-C',
    'TU-2-A', 'TU-2-B', 'TU-2-C',
    'TU-3-A', 'TU-3-B', 'TU-3-C'
  ]),
  skipEligibilityCheck: z.boolean().optional(),
  reason: z.string().optional()
})

const validateSchema = z.object({
  certificateId: z.string().optional(),
  verificationCode: z.string().optional(),
  qrCode: z.string().optional(),
  checkOwnership: z.string().optional()
}).refine(data => {
  return data.certificateId || data.verificationCode || data.qrCode
}, {
  message: 'Must provide certificateId, verificationCode, or qrCode'
})

const batchValidateSchema = z.object({
  certificateIds: z.array(z.string()).min(1).max(100),
  parallel: z.boolean().optional()
})

const revokeSchema = z.object({
  certificateId: z.string().min(1),
  reason: z.string().min(10).max(500)
})

// Certificate pricing (for display purposes)
const CERTIFICATE_PRICING = {
  'TU-1-A': { monthly: 299, annual: 2990, features: ['Basic Compliance', 'Monthly Reports'] },
  'TU-1-B': { monthly: 499, annual: 4990, features: ['Basic Compliance', 'Performance Monitoring', 'Weekly Reports'] },
  'TU-1-C': { monthly: 699, annual: 6990, features: ['Basic Compliance', 'Performance Excellence', 'Daily Reports', 'Priority Support'] },
  'TU-2-A': { monthly: 999, annual: 9990, features: ['Advanced Compliance', 'GDPR/CCPA', 'Real-time Monitoring'] },
  'TU-2-B': { monthly: 1499, annual: 14990, features: ['Advanced Compliance', 'Performance Analytics', 'API Access', 'Custom Reports'] },
  'TU-2-C': { monthly: 1999, annual: 19990, features: ['Advanced Compliance', 'Excellence Suite', 'White-label Options', 'Dedicated Support'] },
  'TU-3-A': { monthly: 2999, annual: 29990, features: ['Enterprise Compliance', 'HIPAA/ISO27001', 'Audit Support'] },
  'TU-3-B': { monthly: 4999, annual: 49990, features: ['Enterprise Compliance', 'Advanced Analytics', 'Custom Integration', 'SLA'] },
  'TU-3-C': { monthly: 9999, annual: 99990, features: ['Complete Platform', 'All Features', 'Custom Development', 'On-site Support'] }
}

/**
 * GET /api/v3/certificates
 * List certificates or get certificate info
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Apply middleware
    const authResponse = await authMiddleware(request)
    if (authResponse) return authResponse
    
    const searchParams = request.nextUrl.searchParams
    const certificateId = searchParams.get('id')
    const hotelId = searchParams.get('hotelId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Get specific certificate info
    if (certificateId) {
      const info = await getCertificateInfo(certificateId)
      
      if (!info.exists) {
        return NextResponse.json(
          {
            error: 'Certificate not found',
            message: 'The specified certificate does not exist',
            code: 'CERT_NOT_FOUND'
          },
          { status: 404 }
        )
      }
      
      trackMetric('api.certificates.info', Date.now() - startTime)
      
      return NextResponse.json({
        success: true,
        certificate: info,
        pricing: CERTIFICATE_PRICING[info.type as keyof typeof CERTIFICATE_PRICING],
        verificationUrl: `https://verify.itwhip.com/certificate/${certificateId}`
      })
    }
    
    // List certificates (with filters)
    const filters: any = {}
    if (hotelId) filters.hotelId = hotelId
    if (type) filters.type = type
    if (status) filters.status = status
    
    // Mock certificate list (in production, query database)
    const certificates = [
      {
        id: 'cert_001',
        certificateNumber: 'TU2B-2024-ABC12345',
        type: 'TU-2-B',
        hotelId: 'hotel_123',
        hotelName: 'Hilton Phoenix Airport',
        status: 'active',
        issuedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
        complianceScore: 85,
        performanceScore: 90,
        overallGrade: 'B+',
        monthlyValue: 67433,
        achievements: ['SOC 2 Certified', 'PCI-DSS Compliant', '99.9% Uptime']
      },
      {
        id: 'cert_002',
        certificateNumber: 'TU3C-2024-DEF67890',
        type: 'TU-3-C',
        hotelId: 'hotel_456',
        hotelName: 'Four Seasons Scottsdale',
        status: 'active',
        issuedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
        complianceScore: 95,
        performanceScore: 98,
        overallGrade: 'A+',
        monthlyValue: 124567,
        achievements: ['Enterprise Leader', 'Carbon Neutral', 'Excellence Award']
      }
    ]
    
    // Apply pagination
    const paginatedCerts = certificates.slice(offset, offset + limit)
    
    // Calculate statistics
    const stats = {
      totalCertificates: certificates.length,
      activeCertificates: certificates.filter(c => c.status === 'active').length,
      totalMonthlyValue: certificates.reduce((sum, c) => sum + c.monthlyValue, 0),
      averageComplianceScore: Math.round(
        certificates.reduce((sum, c) => sum + c.complianceScore, 0) / certificates.length
      ),
      certificatesByType: {
        'TU-1': certificates.filter(c => c.type.startsWith('TU-1')).length,
        'TU-2': certificates.filter(c => c.type.startsWith('TU-2')).length,
        'TU-3': certificates.filter(c => c.type.startsWith('TU-3')).length
      }
    }
    
    trackMetric('api.certificates.list', Date.now() - startTime)
    
    return NextResponse.json({
      success: true,
      certificates: paginatedCerts,
      pagination: {
        total: certificates.length,
        limit,
        offset,
        hasMore: offset + limit < certificates.length
      },
      stats,
      message: `${stats.activeCertificates} hotels secured with ItWhip certificates`
    })
    
  } catch (error) {
    logger.error('Failed to get certificates', { error })
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve certificates',
        code: 'CERT_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v3/certificates
 * Generate a new certificate or validate existing
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Apply middleware
    const authResponse = await authMiddleware(request, {
      requiredPermissions: ['certificates.manage']
    })
    if (authResponse) return authResponse
    
    const body = await request.json()
    const action = body.action || 'generate'
    
    switch (action) {
      case 'generate': {
        // Validate request
        const validated = generateSchema.parse(body)
        
        // Check hotel exists and is eligible
        const eligibility = await checkCertificateEligibility(
          validated.hotelId,
          validated.certificateType as CertificateType
        )
        
        if (!eligibility.eligible && !validated.skipEligibilityCheck) {
          return NextResponse.json(
            {
              error: 'Not eligible',
              message: 'Hotel does not meet certificate requirements',
              requirements: eligibility.missingRequirements,
              score: eligibility.score,
              code: 'NOT_ELIGIBLE'
            },
            { status: 400 }
          )
        }
        
        // Generate certificate
        const certificate = await generateCertificate(
          validated.hotelId,
          validated.certificateType as CertificateType,
          {
            skipEligibilityCheck: validated.skipEligibilityCheck,
            reason: validated.reason
          }
        )
        
        // Track metrics
        trackMetric('api.certificates.generated', 1, {
          type: validated.certificateType
        })
        
        // Create alert for high-value certificates
        if (validated.certificateType.includes('TU-3')) {
          await createAlert({
            type: 'business' as any,
            severity: 'low' as any,
            title: 'Enterprise Certificate Generated',
            message: `New ${validated.certificateType} certificate issued to ${certificate.hotelName}`,
            details: {
              certificateId: certificate.id,
              hotelId: validated.hotelId,
              value: CERTIFICATE_PRICING[validated.certificateType as keyof typeof CERTIFICATE_PRICING].monthly
            }
          })
        }
        
        logger.info('Certificate generated', {
          certificateId: certificate.id,
          type: validated.certificateType,
          hotelId: validated.hotelId
        })
        
        return NextResponse.json({
          success: true,
          certificate,
          pricing: CERTIFICATE_PRICING[validated.certificateType as keyof typeof CERTIFICATE_PRICING],
          verificationUrl: `https://verify.itwhip.com/certificate/${certificate.id}`,
          message: 'Certificate generated successfully'
        }, {
          status: 201,
          headers: {
            'X-Certificate-ID': certificate.id,
            'X-Certificate-Type': certificate.type
          }
        })
      }
      
      case 'validate': {
        // Validate request
        const validated = validateSchema.parse(body)
        
        let result
        
        if (validated.certificateId) {
          result = await validateCertificate(validated.certificateId, {
            checkOwnership: validated.checkOwnership,
            verifierIp: request.headers.get('x-forwarded-for') || 'unknown'
          })
        } else if (validated.verificationCode) {
          result = await validateCertificateByCode(validated.verificationCode, {
            verifierIp: request.headers.get('x-forwarded-for') || 'unknown'
          })
        } else if (validated.qrCode) {
          result = await validateQRCode(validated.qrCode, {
            verifierIp: request.headers.get('x-forwarded-for') || 'unknown'
          })
        } else {
          return NextResponse.json(
            {
              error: 'Invalid request',
              message: 'Must provide certificate ID, verification code, or QR code',
              code: 'INVALID_REQUEST'
            },
            { status: 400 }
          )
        }
        
        trackMetric('api.certificates.validated', 1, {
          valid: result.valid ? 'true' : 'false'
        })
        
        const statusCode = result.valid ? 200 : 400
        
        return NextResponse.json({
          success: result.valid,
          validation: result,
          message: result.valid 
            ? `Certificate ${result.certificateNumber} is valid and active`
            : 'Certificate validation failed'
        }, { status: statusCode })
      }
      
      case 'batch_validate': {
        // Validate request
        const validated = batchValidateSchema.parse(body)
        
        const results = await validateBatch(validated.certificateIds, {
          parallel: validated.parallel,
          verifierIp: request.headers.get('x-forwarded-for') || 'unknown'
        })
        
        const validCount = results.filter(r => r.valid).length
        
        trackMetric('api.certificates.batch_validated', validated.certificateIds.length)
        
        return NextResponse.json({
          success: true,
          results,
          summary: {
            total: results.length,
            valid: validCount,
            invalid: results.length - validCount
          },
          message: `Validated ${results.length} certificates`
        })
      }
      
      case 'check_eligibility': {
        // Check eligibility without generating
        const { hotelId, certificateType } = body
        
        if (!hotelId || !certificateType) {
          return NextResponse.json(
            {
              error: 'Invalid request',
              message: 'hotelId and certificateType are required',
              code: 'INVALID_REQUEST'
            },
            { status: 400 }
          )
        }
        
        const eligibility = await checkCertificateEligibility(
          hotelId,
          certificateType as CertificateType
        )
        
        const pricing = CERTIFICATE_PRICING[certificateType as keyof typeof CERTIFICATE_PRICING]
        
        return NextResponse.json({
          success: true,
          eligible: eligibility.eligible,
          score: eligibility.score,
          missingRequirements: eligibility.missingRequirements,
          pricing,
          recommendations: eligibility.eligible
            ? ['You are eligible! Generate your certificate now.']
            : [
              'Complete missing requirements to become eligible',
              'Contact support for assistance',
              'Consider a lower tier certificate'
            ]
        })
      }
      
      default:
        return NextResponse.json(
          {
            error: 'Invalid action',
            message: `Unknown action: ${action}`,
            code: 'INVALID_ACTION'
          },
          { status: 400 }
        )
    }
    
  } catch (error) {
    logger.error('Certificate operation failed', { error })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid request data',
          errors: error.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Certificate operation failed',
        code: 'CERT_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v3/certificates
 * Update certificate (renew)
 */
export async function PUT(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Apply middleware
    const authResponse = await authMiddleware(request, {
      requiredPermissions: ['certificates.manage']
    })
    if (authResponse) return authResponse
    
    const body = await request.json()
    const { certificateId, action } = body
    
    if (!certificateId) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'certificateId is required',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      )
    }
    
    switch (action) {
      case 'renew': {
        const renewed = await renewCert(certificateId)
        
        trackMetric('api.certificates.renewed', 1)
        
        logger.info('Certificate renewed', {
          oldId: certificateId,
          newId: renewed.id
        })
        
        return NextResponse.json({
          success: true,
          certificate: renewed,
          message: 'Certificate renewed successfully'
        })
      }
      
      case 'update_scores': {
        // Update certificate scores (admin only)
        // This would update compliance/performance scores
        
        return NextResponse.json({
          success: true,
          message: 'Certificate scores updated'
        })
      }
      
      default:
        return NextResponse.json(
          {
            error: 'Invalid action',
            message: `Unknown action: ${action}`,
            code: 'INVALID_ACTION'
          },
          { status: 400 }
        )
    }
    
  } catch (error) {
    logger.error('Certificate update failed', { error })
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to update certificate',
        code: 'UPDATE_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v3/certificates
 * Revoke a certificate
 */
export async function DELETE(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Apply middleware - require admin
    const authResponse = await authMiddleware(request, {
      requiredRoles: ['ADMIN']
    })
    if (authResponse) return authResponse
    
    const body = await request.json()
    const validated = revokeSchema.parse(body)
    
    // Revoke certificate
    await revokeert(validated.certificateId, validated.reason)
    
    // Create alert
    await createAlert({
      type: 'compliance' as any,
      severity: 'high' as any,
      title: 'Certificate Revoked',
      message: `Certificate ${validated.certificateId} has been revoked`,
      details: {
        certificateId: validated.certificateId,
        reason: validated.reason,
        revokedBy: request.headers.get('x-user-id')
      }
    })
    
    trackMetric('api.certificates.revoked', 1)
    
    logger.warn('Certificate revoked', {
      certificateId: validated.certificateId,
      reason: validated.reason
    })
    
    return NextResponse.json({
      success: true,
      message: 'Certificate revoked successfully',
      certificateId: validated.certificateId
    })
    
  } catch (error) {
    logger.error('Certificate revocation failed', { error })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid request data',
          errors: error.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to revoke certificate',
        code: 'REVOKE_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400'
    }
  })
}