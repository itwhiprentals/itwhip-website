// app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT } from 'jose'
import { compare } from 'bcryptjs'
import argon2 from 'argon2'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// SECURITY FIX: Admin login rate limiter - stricter than regular login
const adminLoginRateLimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }),
  limiter: Ratelimit.slidingWindow(3, '15 m'), // 3 attempts per 15 minutes
  analytics: true,
  prefix: 'ratelimit:admin:login',
})

// Admin-specific JWT secret
const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-secret-key-change-this'
)

// Audit log function
async function logAdminAttempt(
  email: string, 
  success: boolean, 
  ipAddress: string,
  userAgent: string,
  failureReason?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        category: 'AUTHENTICATION',
        eventType: 'ADMIN_LOGIN_ATTEMPT',
        severity: success ? 'INFO' : 'WARNING',
        adminEmail: email,
        ipAddress,
        userAgent,
        action: 'login',
        resource: 'admin_auth',
        details: {
          success,
          failureReason,
          timestamp: new Date().toISOString(),
          authType: 'admin'
        } as any,
        hash: '', // You can implement hash if needed
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log admin attempt:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get request metadata for logging
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // SECURITY FIX: Rate limiting - FIRST thing before any processing
    const { success, remaining, reset } = await adminLoginRateLimit.limit(ipAddress)

    if (!success) {
      console.warn(`[ADMIN LOGIN] 🚨 Rate limit exceeded for IP: ${ipAddress}`)
      await logAdminAttempt('rate-limited', false, ipAddress, userAgent, 'RATE_LIMITED')

      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
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

    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      await logAdminAttempt(email || 'unknown', false, ipAddress, userAgent, 'Missing credentials')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        isActive: true,
        hotelId: true
      }
    })

    // Check if user exists and is an admin
    if (!user) {
      await logAdminAttempt(email, false, ipAddress, userAgent, 'User not found')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // CRITICAL: Verify user is ADMIN role
    if (user.role !== 'ADMIN') {
      await logAdminAttempt(email, false, ipAddress, userAgent, 'Not admin role')
      console.warn(`Non-admin login attempt: ${email} (${user.role})`)
      return NextResponse.json(
        { error: 'Access denied. Admin credentials required.' },
        { status: 403 }
      )
    }

    // Check if account is active
    if (!user.isActive) {
      await logAdminAttempt(email, false, ipAddress, userAgent, 'Account inactive')
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      )
    }

    // Verify password
    if (!user.passwordHash) {
      await logAdminAttempt(email, false, ipAddress, userAgent, 'No password set')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    let isPasswordValid = false
    let passwordHashType = 'unknown'

    // Try Argon2 first (new secure standard)
    if (user.passwordHash.startsWith('$argon2')) {
      try {
        isPasswordValid = await argon2.verify(user.passwordHash, password)
        passwordHashType = 'argon2'
      } catch (error) {
        console.error('Argon2 verification error:', error)
      }
    }
    
    // Fall back to bcrypt for legacy passwords
    if (!isPasswordValid && !user.passwordHash.startsWith('$argon2')) {
      try {
        isPasswordValid = await compare(password, user.passwordHash)
        passwordHashType = 'bcrypt'
        
        // Upgrade to Argon2 if bcrypt verification succeeds
        if (isPasswordValid) {
          const newHash = await argon2.hash(password)
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash }
          })
          console.log(`[Admin password upgraded to Argon2]: ${email}`)
        }
      } catch (error) {
        console.error('Bcrypt verification error:', error)
      }
    }

    if (!isPasswordValid) {
      await logAdminAttempt(email, false, ipAddress, userAgent, 'Invalid password')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate admin access token (4 hours)
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'admin'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('4h')
      .setIssuedAt()
      .sign(ADMIN_JWT_SECRET)

    // Generate admin refresh token (7 days)
    const refreshToken = await new SignJWT({
      userId: user.id,
      type: 'admin-refresh'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(ADMIN_JWT_SECRET)

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    })

    // Log successful login
    await logAdminAttempt(email, true, ipAddress, userAgent)
    console.log(`✅ Admin logged in: ${email} [${passwordHashType}]`)

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

    // Set admin-specific cookies
    response.cookies.set('adminAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 4 * 60 * 60, // 4 hours
      path: '/'
    })

    response.cookies.set('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}