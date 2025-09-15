// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import * as argon2 from 'argon2'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'

// Get JWT secrets
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
)

// Argon2 configuration (matching signup)
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
  hashLength: 32,
  saltLength: 16
}

// Helper function to verify password with hybrid approach
async function verifyPassword(password: string, hash: string): Promise<{ valid: boolean, needsRehash: boolean }> {
  try {
    // Try Argon2 first (new format)
    if (hash.startsWith('$argon2id$')) {
      const valid = await argon2.verify(hash, password)
      return { valid, needsRehash: false }
    }
    
    // Fallback to bcrypt (legacy format)
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      const valid = await bcrypt.compare(password, hash)
      return { valid, needsRehash: valid } // If valid, flag for rehashing to Argon2
    }
    
    // Unknown hash format
    console.warn('Unknown password hash format')
    return { valid: false, needsRehash: false }
    
  } catch (error) {
    console.error('Password verification error:', error)
    return { valid: false, needsRehash: false }
  }
}

// Helper function to upgrade bcrypt hash to Argon2
async function upgradePasswordHash(userId: string, password: string): Promise<void> {
  try {
    const newHash = await argon2.hash(password, ARGON2_CONFIG)
    await db.updateUserPasswordHash(userId, newHash)
    console.log(`Password hash upgraded to Argon2 for user: ${userId}`)
  } catch (error) {
    console.error('Failed to upgrade password hash:', error)
    // Don't throw - login should still succeed even if upgrade fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await db.getUserByEmail(email.toLowerCase())
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password with hybrid approach
    const { valid: passwordValid, needsRehash } = await verifyPassword(password, user.password_hash)
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    // Upgrade password hash if needed (bcrypt -> Argon2)
    if (needsRehash) {
      // Run in background - don't wait for completion
      upgradePasswordHash(user.id, password).catch(err => {
        console.error('Background password upgrade failed:', err)
      })
    }

    // Generate tokens
    const tokenId = nanoid()
    const refreshTokenId = nanoid()
    const refreshFamily = nanoid()

    // Create access token (15 minutes)
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      jti: tokenId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET)

    // Create refresh token (7 days)
    const refreshToken = await new SignJWT({
      userId: user.id,
      family: refreshFamily,
      jti: refreshTokenId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_REFRESH_SECRET)

    // Save refresh token to database
    await db.saveRefreshToken({
      userId: user.id,
      token: refreshToken,
      family: refreshFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    // Update last login
    await db.updateLastLogin(user.id)

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    // Set secure HTTP-only cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    console.log(`User logged in successfully: ${user.email} ${needsRehash ? '(password upgraded)' : '(argon2)'}`)
    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}