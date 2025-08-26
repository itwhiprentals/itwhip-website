/**
 * Validation Middleware for ItWhip Platform
 * Validates request bodies, query parameters, and ensures data integrity
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError, ZodSchema } from 'zod'
import { createAuditLog } from '@/app/lib/database/audit'
import { detectAnomaly } from '@/app/lib/security/anomaly'
import type { ValidationError } from '@/app/types/security'

// Common validation schemas
export const schemas = {
  // Authentication schemas
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    rememberMe: z.boolean().optional()
  }),
  
  register: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    hotelName: z.string().min(2).max(100),
    gdsCode: z.string().regex(/^[A-Z0-9]{6,10}$/, 'Invalid GDS code format'),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions'
    })
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),
  
  // Hotel schemas
  hotelSearch: z.object({
    query: z.string().min(2).max(100).optional(),
    city: z.string().min(2).max(50).optional(),
    state: z.string().length(2).optional(),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    rooms: z.number().min(1).max(10).optional(),
    guests: z.number().min(1).max(20).optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    sortBy: z.enum(['price', 'rating', 'distance', 'name']).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc')
  }),
  
  hotelClaim: z.object({
    gdsCode: z.string().regex(/^[A-Z0-9]{6,10}$/),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    jobTitle: z.string().min(2).max(50),
    verificationDocuments: z.array(z.string().url()).optional()
  }),
  
  // Booking schemas
  createBooking: z.object({
    hotelId: z.string().cuid(),
    guestInfo: z.object({
      firstName: z.string().min(1).max(50),
      lastName: z.string().min(1).max(50),
      email: z.string().email(),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
      country: z.string().length(2)
    }),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    roomType: z.string().min(1).max(50),
    roomCount: z.number().min(1).max(10),
    specialRequests: z.string().max(500).optional(),
    addOns: z.object({
      airportPickup: z.boolean().default(false),
      airportDropoff: z.boolean().default(false),
      rideCredits: z.number().min(0).max(10).default(0)
    }).optional()
  }),
  
  // Ride schemas
  createRide: z.object({
    bookingId: z.string().cuid().optional(),
    pickup: z.object({
      address: z.string().min(5).max(200),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
      time: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    }),
    dropoff: z.object({
      address: z.string().min(5).max(200),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional()
    }),
    passengers: z.number().min(1).max(8),
    luggage: z.number().min(0).max(10).optional(),
    vehicleType: z.enum(['sedan', 'suv', 'luxury', 'van']).optional(),
    notes: z.string().max(200).optional()
  }),
  
  // Revenue schemas
  withdrawRevenue: z.object({
    amount: z.number().min(100).max(100000),
    currency: z.enum(['USD', 'EUR', 'GBP']).default('USD'),
    method: z.enum(['bank_transfer', 'wire', 'check']),
    accountDetails: z.object({
      accountNumber: z.string().regex(/^\d{8,17}$/),
      routingNumber: z.string().regex(/^\d{9}$/),
      accountName: z.string().min(2).max(100),
      bankName: z.string().min(2).max(100)
    })
  }),
  
  // API key schemas
  createApiKey: z.object({
    name: z.string().min(2).max(50),
    permissions: z.array(z.string()).min(1),
    rateLimit: z.number().min(100).max(10000).optional(),
    expiresIn: z.enum(['30d', '90d', '180d', '1y']).optional()
  }),
  
  // Common pagination
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc')
  }),
  
  // Common ID validation
  id: z.object({
    id: z.string().cuid('Invalid ID format')
  }),
  
  // Date range validation
  dateRange: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }).refine(data => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return end >= start
  }, {
    message: 'End date must be after start date'
  })
}

// Validation rules for specific endpoints
const ENDPOINT_SCHEMAS: Record<string, {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}> = {
  'POST:/api/v3/auth/login': { body: schemas.login },
  'POST:/api/v3/auth/register': { body: schemas.register },
  'GET:/api/v3/hotels/search': { query: schemas.hotelSearch },
  'POST:/api/v3/hotels/claim': { body: schemas.hotelClaim },
  'POST:/api/v3/bookings': { body: schemas.createBooking },
  'POST:/api/v3/rides': { body: schemas.createRide },
  'POST:/api/v3/revenue/withdraw': { body: schemas.withdrawRevenue },
  'POST:/api/v3/api-keys': { body: schemas.createApiKey },
  'GET:/api/v3/analytics': { query: schemas.pagination },
  'GET:/api/v3/bookings': { query: schemas.pagination },
  'GET:/api/v3/rides': { query: schemas.pagination }
}

// Dangerous input patterns
const DANGEROUS_PATTERNS = {
  sqlInjection: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi,
    /(--|\||;|\/\*|\*\/)/g,
    /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s*\d+\s*=\s*\d+)/gi
  ],
  xss: [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ],
  commandInjection: [
    /[;&|`$]/g,
    /\$\(.*\)/g,
    /`.*`/g
  ],
  pathTraversal: [
    /\.\.\//g,
    /\.\.%2f/gi,
    /%2e%2e\//gi
  ]
}

/**
 * Sanitize a single value
 */
function sanitizeValue(value: any, fieldName: string): any {
  if (value === null || value === undefined) {
    return value
  }
  
  if (typeof value === 'string') {
    let sanitized = value
    
    // Check for dangerous patterns
    for (const [type, patterns] of Object.entries(DANGEROUS_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(sanitized)) {
          console.warn(`Dangerous pattern detected in field ${fieldName}: ${type}`)
          // Remove the dangerous content
          sanitized = sanitized.replace(pattern, '')
        }
      }
    }
    
    // Trim whitespace
    sanitized = sanitized.trim()
    
    // Limit string length
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000)
    }
    
    return sanitized
  }
  
  if (Array.isArray(value)) {
    return value.map((item, index) => sanitizeValue(item, `${fieldName}[${index}]`))
  }
  
  if (typeof value === 'object') {
    const sanitized: any = {}
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val, `${fieldName}.${key}`)
    }
    return sanitized
  }
  
  return value
}

/**
 * Validate request body against schema
 */
async function validateBody(
  body: any,
  schema: ZodSchema
): Promise<{ valid: boolean; data?: any; errors?: ValidationError[] }> {
  try {
    // Sanitize input first
    const sanitized = sanitizeValue(body, 'body')
    
    // Validate against schema
    const validated = await schema.parseAsync(sanitized)
    
    return { valid: true, data: validated }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.path.reduce((obj, key) => obj?.[key], body)
      }))
      
      return { valid: false, errors }
    }
    
    return { 
      valid: false, 
      errors: [{ 
        field: 'unknown', 
        message: 'Validation error',
        code: 'UNKNOWN_ERROR'
      }] 
    }
  }
}

/**
 * Validate query parameters
 */
function validateQuery(
  query: URLSearchParams,
  schema: ZodSchema
): { valid: boolean; data?: any; errors?: ValidationError[] } {
  try {
    // Convert URLSearchParams to object
    const queryObject: any = {}
    query.forEach((value, key) => {
      // Handle array parameters
      if (key.endsWith('[]')) {
        const cleanKey = key.slice(0, -2)
        if (!queryObject[cleanKey]) {
          queryObject[cleanKey] = []
        }
        queryObject[cleanKey].push(value)
      } else {
        // Try to parse numbers
        const numValue = Number(value)
        queryObject[key] = !isNaN(numValue) && value !== '' ? numValue : value
      }
    })
    
    // Sanitize
    const sanitized = sanitizeValue(queryObject, 'query')
    
    // Validate
    const validated = schema.parse(sanitized)
    
    return { valid: true, data: validated }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
      
      return { valid: false, errors }
    }
    
    return { 
      valid: false, 
      errors: [{ 
        field: 'unknown', 
        message: 'Query validation error',
        code: 'UNKNOWN_ERROR'
      }] 
    }
  }
}

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (real) return real.trim()
  
  return '127.0.0.1'
}

/**
 * Main validation middleware
 */
export async function validationMiddleware(
  request: NextRequest,
  options?: {
    skipBodyValidation?: boolean
    skipQueryValidation?: boolean
    customSchemas?: {
      body?: ZodSchema
      query?: ZodSchema
      params?: ZodSchema
    }
    maxBodySize?: number
    allowUnknownFields?: boolean
  }
): Promise<NextResponse | null> {
  const method = request.method
  const pathname = request.nextUrl.pathname
  const clientIp = getClientIp(request)
  
  try {
    // Get validation schemas for this endpoint
    const endpointKey = `${method}:${pathname}`
    const schemas = options?.customSchemas || ENDPOINT_SCHEMAS[endpointKey]
    
    // Validate query parameters
    if (!options?.skipQueryValidation && schemas?.query) {
      const queryValidation = validateQuery(request.nextUrl.searchParams, schemas.query)
      
      if (!queryValidation.valid) {
        await createAuditLog({
          category: 'SECURITY',
          eventType: 'validation.query_failed',
          severity: 'MEDIUM',
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          action: 'reject',
          resource: pathname,
          details: { 
            errors: queryValidation.errors,
            method 
          }
        })
        
        return NextResponse.json(
          {
            error: 'Invalid query parameters',
            message: 'The request contains invalid query parameters',
            code: 'INVALID_QUERY',
            errors: queryValidation.errors
          },
          { status: 400 }
        )
      }
    }
    
    // Validate request body for methods that have one
    if (!options?.skipBodyValidation && 
        ['POST', 'PUT', 'PATCH'].includes(method) && 
        schemas?.body) {
      
      // Check content type
      const contentType = request.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        return NextResponse.json(
          {
            error: 'Invalid content type',
            message: 'Content-Type must be application/json',
            code: 'INVALID_CONTENT_TYPE'
          },
          { status: 415 }
        )
      }
      
      // Check body size
      const contentLength = parseInt(request.headers.get('content-length') || '0')
      const maxSize = options?.maxBodySize || 1024 * 1024 // 1MB default
      
      if (contentLength > maxSize) {
        await createAuditLog({
          category: 'SECURITY',
          eventType: 'validation.body_too_large',
          severity: 'MEDIUM',
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          action: 'reject',
          resource: pathname,
          details: { 
            size: contentLength,
            maxSize,
            method 
          }
        })
        
        return NextResponse.json(
          {
            error: 'Request too large',
            message: `Request body exceeds maximum size of ${maxSize} bytes`,
            code: 'PAYLOAD_TOO_LARGE'
          },
          { status: 413 }
        )
      }
      
      // Parse and validate body
      try {
        const body = await request.json()
        
        // Check for potential data exfiltration (too many fields)
        const fieldCount = JSON.stringify(body).split(':').length - 1
        if (fieldCount > 100) {
          await detectAnomaly({
            type: 'data_exfiltration',
            identifier: clientIp,
            details: {
              fieldCount,
              endpoint: pathname
            }
          })
          
          return NextResponse.json(
            {
              error: 'Too many fields',
              message: 'Request contains too many fields',
              code: 'TOO_MANY_FIELDS'
            },
            { status: 400 }
          )
        }
        
        const bodyValidation = await validateBody(body, schemas.body)
        
        if (!bodyValidation.valid) {
          await createAuditLog({
            category: 'SECURITY',
            eventType: 'validation.body_failed',
            severity: 'MEDIUM',
            ipAddress: clientIp,
            userAgent: request.headers.get('user-agent') || 'unknown',
            action: 'reject',
            resource: pathname,
            details: { 
              errors: bodyValidation.errors,
              method 
            }
          })
          
          return NextResponse.json(
            {
              error: 'Invalid request body',
              message: 'The request body contains invalid data',
              code: 'INVALID_BODY',
              errors: bodyValidation.errors
            },
            { status: 400 }
          )
        }
        
        // Add validated data to request for downstream use
        const headers = new Headers(request.headers)
        headers.set('x-validated-body', JSON.stringify(bodyValidation.data))
        
        return NextResponse.next({
          request: {
            headers
          }
        })
        
      } catch (error) {
        await createAuditLog({
          category: 'SECURITY',
          eventType: 'validation.parse_error',
          severity: 'HIGH',
          ipAddress: clientIp,
          userAgent: request.headers.get('user-agent') || 'unknown',
          action: 'reject',
          resource: pathname,
          details: { 
            error: error instanceof Error ? error.message : 'Parse error',
            method 
          }
        })
        
        return NextResponse.json(
          {
            error: 'Invalid JSON',
            message: 'The request body is not valid JSON',
            code: 'INVALID_JSON'
          },
          { status: 400 }
        )
      }
    }
    
    // Log successful validation
    await createAuditLog({
      category: 'DATA_ACCESS',
      eventType: 'validation.success',
      severity: 'LOW',
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || 'unknown',
      action: 'allow',
      resource: pathname,
      details: { method }
    })
    
    return null // Allow request to proceed
    
  } catch (error) {
    console.error('Validation middleware error:', error)
    
    await createAuditLog({
      category: 'SECURITY',
      eventType: 'validation.error',
      severity: 'CRITICAL',
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || 'unknown',
      action: 'error',
      resource: pathname,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        method 
      }
    })
    
    return NextResponse.json(
      {
        error: 'Validation error',
        message: 'An error occurred during request validation',
        code: 'VALIDATION_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * Create custom validator for specific needs
 */
export function createValidator(schema: ZodSchema) {
  return async (data: any) => {
    try {
      const validated = await schema.parseAsync(data)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof ZodError) {
        return { 
          success: false, 
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      }
      return { 
        success: false, 
        errors: [{ field: 'unknown', message: 'Validation failed' }] 
      }
    }
  }
}

/**
 * Helper to validate and sanitize email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 320
}

/**
 * Helper to validate and sanitize phone number
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

/**
 * Helper to validate GDS code
 */
export function validateGDSCode(code: string): boolean {
  const gdsRegex = /^[A-Z0-9]{6,10}$/
  return gdsRegex.test(code)
}

export default validationMiddleware