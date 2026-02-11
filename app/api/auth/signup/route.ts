// app/api/auth/signup/route.ts
// SECURITY FIX: Added rate limiting to prevent bot account creation
import { NextRequest, NextResponse } from 'next/server'
import * as argon2 from 'argon2'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'
import { prisma } from '@/app/lib/database/prisma'
import { resolveIdentity, linkAllIdentifiers, normalizeEmail, normalizePhone } from '@/app/lib/services/identityResolution'
import { sanitizeValue } from '@/app/middleware/validation'
import { validateEmail as validateEmailRisk } from '@/app/utils/email-validator'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// SECURITY FIX: Signup rate limiter - prevent mass account creation
const signupRateLimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 signups per hour per IP
  analytics: true,
  prefix: 'ratelimit:signup',
})

// Generate 8-digit verification code (SECURITY FIX: increased from 6)
function generateVerificationCode(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}

// Get JWT secrets - UPDATED FOR GUEST SEPARATION
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET!
)
const GUEST_JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_REFRESH_SECRET!
)

// Fallback to general secrets if guest secrets not available
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
)

// Argon2 configuration for enterprise-grade security
const ARGON2_CONFIG = {
  type: argon2.argon2id,        // Hybrid type - best security
  memoryCost: 65536,            // 64 MB memory usage
  timeCost: 3,                  // 3 iterations
  parallelism: 4,               // 4 threads
  hashLength: 32,               // 32-byte output
  saltLength: 16                // 16-byte salt
}

// Helper to get appropriate JWT secrets based on user role
function getJWTSecrets(role: string) {
  const guestRoles = ['ANONYMOUS', 'CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE']
  
  if (guestRoles.includes(role.toUpperCase())) {
    return {
      accessSecret: GUEST_JWT_SECRET,
      refreshSecret: GUEST_JWT_REFRESH_SECRET,
      userType: 'guest'
    }
  }
  
  // Hotel, Admin, Driver users use general secrets
  return {
    accessSecret: JWT_SECRET,
    refreshSecret: JWT_REFRESH_SECRET,
    userType: 'platform'
  }
}

// Helper to create JWT tokens with appropriate secrets
// SECURITY FIX: Include status for middleware enforcement
async function createTokens(userId: string, email: string, role: string, name?: string, status: string = 'ACTIVE') {
  const { accessSecret, refreshSecret, userType } = getJWTSecrets(role)

  // Create access token (15 minutes)
  const accessToken = await new SignJWT({
    userId,
    email,
    role,
    status, // Include for runtime enforcement
    name: name || null,
    type: 'access',
    userType // Add user type to token for identification
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret)

  // Create refresh token (7 days)
  const refreshToken = await new SignJWT({ 
    userId,
    email,
    role,
    type: 'refresh',
    userType,
    family: nanoid() // Token family for rotation
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(refreshSecret)

  return { accessToken, refreshToken, userType }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY FIX: Rate limiting - check FIRST before any processing
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    const { success, remaining, reset } = await signupRateLimit.limit(ipAddress)

    if (!success) {
      console.warn(`[SIGNUP] 🚨 Rate limit exceeded for IP: ${ipAddress}`)
      return NextResponse.json(
        {
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            'X-RateLimit-Remaining': String(remaining),
          }
        }
      )
    }

    // Parse request body
    const body = await request.json()
    const { password, roleHint } = body

    // Sanitize user-provided string fields (XSS, SQL injection, etc.)
    const email = sanitizeValue(body.email, 'email') as string
    const name = sanitizeValue(body.name, 'name') as string | undefined
    const phone = sanitizeValue(body.phone, 'phone') as string | undefined

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check for disposable/high-risk email domains
    const emailRisk = validateEmailRisk(email)
    if (emailRisk.flags.includes('disposable_domain')) {
      console.warn(`[Signup] Disposable email blocked: ${email} (domain: ${emailRisk.domain})`)
      return NextResponse.json(
        { error: 'Please use a permanent email address. Temporary or disposable email addresses are not accepted.' },
        { status: 400 }
      )
    }

    // Enhanced password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check password strength (optional but recommended)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    if (password.length >= 8 && (!hasUpperCase || !hasLowerCase || !hasNumbers)) {
      // Don't block, but could warn client about weak password
      console.log('Password could be stronger')
    }

    // ========================================================================
    // IDENTITY RESOLUTION - Check for existing accounts or suspensions
    // ========================================================================
    const resolution = await resolveIdentity({
      email: email.toLowerCase(),
      phone: phone || undefined
    })

    // Handle blocked (suspended) identifiers
    if (resolution.action === 'BLOCK_SUSPENDED') {
      console.log(`[Signup] BLOCKED: Suspended identifier detected for email: ${email}`)
      // SECURITY: Generic message - don't reveal which identifier triggered the block
      return NextResponse.json({
        error: 'Unable to create account',
        guard: {
          type: 'suspended-account',
          title: 'Unable to Create Account',
          message: 'Your account cannot be created at this time. Please contact support for assistance.',
          actions: {
            primary: { label: 'Contact Support', url: '/support' }
          }
        }
      }, { status: 403 })
    }

    // Handle conflict (multiple accounts matched different users)
    if (resolution.action === 'CONFLICT') {
      console.log(`[Signup] CONFLICT: Multiple accounts found for identifiers`)
      return NextResponse.json({
        error: 'Account conflict detected',
        guard: {
          type: 'identity-conflict',
          title: 'Account Issue Detected',
          message: resolution.message || 'There was an issue with your account. Please contact support.',
          actions: {
            primary: { label: 'Contact Support', url: '/support' }
          }
        }
      }, { status: 409 })
    }

    // Handle linking to existing account
    if (resolution.action === 'LINK_TO_EXISTING') {
      console.log(`[Signup] Existing account found, matched on: ${resolution.matchedIdentifiers.join(', ')}`)

      // If they have the same email, tell them to login
      if (resolution.matchedIdentifiers.includes('email')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        )
      }

      // If matched on phone but different email, we could offer to link
      // For now, just inform them an account exists with that phone
      if (resolution.matchedIdentifiers.includes('phone')) {
        return NextResponse.json({
          error: 'Account already exists',
          guard: {
            type: 'phone-linked',
            title: 'Phone Already Registered',
            message: 'This phone number is already linked to an account. Please sign in with the email associated with that account.',
            actions: {
              primary: { label: 'Sign In', url: '/auth/login' },
              secondary: { label: 'Use Different Phone', url: '/auth/signup' }
            }
          }
        }, { status: 409 })
      }
    }

    // ========================================================================
    // CREATE NEW ACCOUNT - No existing matches found
    // ========================================================================

    // Hash the password with Argon2
    const passwordHash = await argon2.hash(password, ARGON2_CONFIG)

    // Create the user - CLAIMED role for regular registered users (guest type)
    const newUser = await db.createUser({
      email: email.toLowerCase(),
      passwordHash,
      name: name || null,
      phone: phone || null,
      role: 'CLAIMED' // Guest users start as CLAIMED
    })

    // Link identifiers to the new user for identity resolution
    try {
      await linkAllIdentifiers(newUser.id, {
        email: email.toLowerCase(),
        phone: phone || undefined
      })
      console.log(`[Signup] Identity links created for user: ${newUser.id}`)
    } catch (linkError) {
      console.error('[Signup] Failed to create identity links:', linkError)
      // Don't block signup if linking fails
    }

    // Generate email verification code
    const verificationCode = generateVerificationCode()
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Update user with verification code
    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpiry: verificationExpiry
      }
    })

    // Create ReviewerProfile for all signups (ensures visibility in fleet guest list)
    // Host signups will also get a RentalHost profile through separate flow later
    {
      try {
        const reviewerProfile = await prisma.reviewerProfile.create({
          data: {
            id: nanoid(),
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name || '',
            city: 'Phoenix',
            state: 'AZ',
            phoneNumber: phone || null,
            memberSince: new Date(),
            loyaltyPoints: 0,
            memberTier: 'BRONZE',
            emailVerified: false,
            phoneVerified: false,
            documentsVerified: false,
            insuranceVerified: false,
            fullyVerified: false,
            canInstantBook: false,
            totalTrips: 0,
            averageRating: 0,
            profileCompletion: 10, // Basic info only
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
            preferredLanguage: 'en',
            preferredCurrency: 'USD',
            updatedAt: new Date(),
          }
        })
        console.log(`[Signup] ReviewerProfile created for GUEST user: ${newUser.id}`)

        // Create AdminNotification for Fleet/Admin visibility
        try {
          await prisma.adminNotification.create({
            data: {
              id: nanoid(),
              type: 'NEW_GUEST_SIGNUP',
              title: 'New Guest Registered',
              message: `${name || email} just signed up as a guest`,
              priority: 'LOW',
              status: 'UNREAD',
              actionRequired: false,
              actionUrl: `/fleet/guests/${reviewerProfile.id}`,
              relatedId: reviewerProfile.id,
              relatedType: 'REVIEWER_PROFILE',
              metadata: {
                guestEmail: email,
                guestName: name || null,
                guestPhone: phone || null,
                signupSource: 'email',
                hasPhone: !!phone
              },
              updatedAt: new Date(),
            }
          })
          console.log(`[Signup] AdminNotification created for new guest: ${reviewerProfile.id}`)
        } catch (notifError) {
          console.error('[Signup] Failed to create AdminNotification:', notifError)
          // Don't block signup if notification fails
        }
      } catch (profileError) {
        console.error('[Signup] Failed to create ReviewerProfile:', profileError)
        // Don't block signup if profile creation fails
      }
    }

    // Send verification email
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      const htmlContent = generateVerificationEmail(name || 'User', verificationCode)
      const textContent = `
Welcome to ItWhip!

Hi ${name || 'User'},

Thank you for signing up! Please verify your email address using this code:

${verificationCode}

This code will expire in 15 minutes.

If you didn't create an account, please ignore this email.

- ItWhip Team
      `.trim()

      await sendEmail(
        email.toLowerCase(),
        'Verify Your ItWhip Account',
        htmlContent,
        textContent
      )

      console.log(`[Signup] Verification email sent to: ${email}`)
    } catch (emailError) {
      console.error('[Signup] Verification email failed:', emailError)
      // Don't block signup if email fails, but log it
    }

    // Create JWT tokens with guest-specific secrets
    const { accessToken, refreshToken, userType } = await createTokens(
      newUser.id,
      newUser.email as string,
      newUser.role,
      newUser.name || undefined
    )

    // Save refresh token to database
    const tokenFamily = nanoid()
    await db.saveRefreshToken({
      userId: newUser.id,
      token: refreshToken,
      family: tokenFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name || '',
        role: newUser.role,
        userType // Include user type in response
      },
      accessToken,
      requiresVerification: true, // Flag for frontend to redirect to verification page
      redirect: '/dashboard' // Guest signup goes to dashboard
    }, { status: 201 })

    // Set refresh token as httpOnly cookie
    response.cookies.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    // Set access token as httpOnly cookie
    response.cookies.set({
      name: 'accessToken',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15 // 15 minutes
    })

    console.log(`New ${userType} user created with Argon2 hash:`, email, `(${newUser.role})`)
    return response

  } catch (error) {
    console.error('Signup error:', error)
    
    // Handle Argon2 specific errors
    if (error instanceof Error) {
      if (error.message.includes('argon2')) {
        return NextResponse.json(
          { error: 'Password processing failed. Please try again.' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/auth/signup',
    method: 'POST',
    requiredFields: ['email', 'password'],
    optionalFields: ['name', 'phone'],
    security: 'Argon2id with 64MB memory cost',
    authentication: 'Guest-specific JWT secrets'
  })
}

// Email template for verification
function generateVerificationEmail(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Welcome!</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Verify Your Email</h2>
                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px; text-align: center;">
                      Hi ${name}, thanks for signing up! Use the code below to verify your email:
                    </p>
                    <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Your verification code:</p>
                      <p style="margin: 0; color: #1f2937; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: monospace;">${code}</p>
                    </div>
                    <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                      This code will expire in <strong>15 minutes</strong>.
                    </p>
                    <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        If you didn't create an account, please ignore this email.
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">ItWhip Technologies, Inc.</p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2025 ItWhip. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}