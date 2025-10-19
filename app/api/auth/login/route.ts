// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import * as argon2 from 'argon2'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import db from '@/app/lib/db'
import { loginRateLimit, getClientIp, createRateLimitResponse } from '@/app/lib/rate-limit'

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
    // ✅ STEP 1: Rate Limit Check (5 attempts per 15 minutes)
    const clientIp = getClientIp(request)
    const identifier = `login:${clientIp}`
    
    const { success, limit, reset, remaining } = await loginRateLimit.limit(identifier)
    
    if (!success) {
      console.warn(`🚨 Rate limit exceeded for IP: ${clientIp}`)
      return createRateLimitResponse(reset, remaining)
    }

    console.log(`✅ Rate limit check passed for ${clientIp} (${remaining}/${limit} remaining)`)

    // ✅ STEP 2: Parse and validate input
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // ✅ STEP 3: Get user from database
    const user = await db.getUserByEmail(email.toLowerCase())
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // ✅ STEP 4: Verify password with hybrid approach
    const { valid: passwordValid, needsRehash } = await verifyPassword(password, user.password_hash)
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // ✅ STEP 5: Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    // ✅ STEP 6: Upgrade password hash if needed (bcrypt -> Argon2)
    if (needsRehash) {
      // Run in background - don't wait for completion
      upgradePasswordHash(user.id, password).catch(err => {
        console.error('Background password upgrade failed:', err)
      })
    }

    // ✅ STEP 7: Generate tokens
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

    // ✅ STEP 8: Save refresh token to database
    await db.saveRefreshToken({
      userId: user.id,
      token: refreshToken,
      family: refreshFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    // ✅ STEP 9: Update last login
    await db.updateLastLogin(user.id)

    // ✅ STEP 10: Create response with cookies
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

    // ✅ STEP 11: Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())

    console.log(`✅ User logged in successfully: ${user.email} ${needsRehash ? '(password upgraded)' : '(argon2)'}`)
    
    return response

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}