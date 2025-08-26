// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'

// Get JWT secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change'
)

// Helper to create JWT tokens
async function createTokens(userId: string, email: string, role: string) {
  // Create access token (15 minutes)
  const accessToken = await new SignJWT({ 
    userId, 
    email, 
    role,
    type: 'access' 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)

  // Create refresh token (7 days)
  const refreshToken = await new SignJWT({ 
    userId,
    email,
    role,
    type: 'refresh',
    family: nanoid() // Token family for rotation
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET)

  return { accessToken, refreshToken }
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

    // Validate password strength (basic for now)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email.toLowerCase())
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create the user
    const newUser = await db.createUser({
      email: email.toLowerCase(),
      passwordHash,
      name: name || null,
      phone: phone || null,
      role: 'guest' // Default role
    })

    // Create JWT tokens
    const { accessToken, refreshToken } = await createTokens(
      newUser.id,
      newUser.email,
      newUser.role
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
        role: newUser.role
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

    // Set access token as httpOnly cookie too (optional)
    response.cookies.set({
      name: 'accessToken',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15 // 15 minutes
    })

    return response

  } catch (error) {
    console.error('Signup error:', error)
    
    // Database errors
    if (error instanceof Error) {
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
    optionalFields: ['name', 'phone']
  })
}