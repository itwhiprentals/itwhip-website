// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import * as argon2 from 'argon2'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'

// Get JWT secrets - UPDATED FOR GUEST SEPARATION
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-change-in-production'
)
const GUEST_JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_REFRESH_SECRET || 'fallback-guest-refresh-secret-change'
)

// Fallback to general secrets if guest secrets not available
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change'
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
async function createTokens(userId: string, email: string, role: string, name?: string) {
  const { accessSecret, refreshSecret, userType } = getJWTSecrets(role)
  
  // Create access token (15 minutes)
  const accessToken = await new SignJWT({ 
    userId, 
    email, 
    role,
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
    // Parse request body
    const body = await request.json()
    const { email, password, name, phone } = body

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

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email.toLowerCase())
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

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

    // Create JWT tokens with guest-specific secrets
    const { accessToken, refreshToken, userType } = await createTokens(
      newUser.id,
      newUser.email,
      newUser.role,
      newUser.name
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
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        userType // Include user type in response
      },
      accessToken
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