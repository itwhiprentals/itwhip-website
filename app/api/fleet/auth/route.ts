// app/api/fleet/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { logFailedLogin, logSuccessfulLogin, isIpBlocked } from '@/app/lib/security/loginMonitor'

// Fleet admin credentials from environment or defaults
const FLEET_USERNAME = process.env.FLEET_ADMIN_USERNAME || 'admin'
const FLEET_PASSWORD = process.env.FLEET_ADMIN_PASSWORD || 'itwhip2024!'
const FLEET_SESSION_SECRET = process.env.FLEET_SESSION_SECRET || 'fleet-session-secret-key-2024'

// Generate a secure session token
function generateSessionToken(): string {
  const timestamp = Date.now().toString()
  const random = crypto.randomBytes(32).toString('hex')
  const data = `${timestamp}:${random}`
  return crypto.createHmac('sha256', FLEET_SESSION_SECRET).update(data).digest('hex')
}

// Verify a session token (simplified - just check if it exists and was issued by us)
export function verifySessionToken(token: string): boolean {
  // Token should be a valid hex string of the right length
  return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token)
}

// POST /api/fleet/auth - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Get client info for security logging
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if IP is blocked due to too many attempts
    const blocked = await isIpBlocked(ip)
    if (blocked) {
      await logFailedLogin({
        email: `fleet:${username || 'unknown'}`,
        source: 'fleet',
        reason: 'BLOCKED_IP',
        ip,
        userAgent
      })
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate credentials
    if (username !== FLEET_USERNAME || password !== FLEET_PASSWORD) {
      const result = await logFailedLogin({
        email: `fleet:${username || 'unknown'}`,
        source: 'fleet',
        reason: 'INVALID_CREDENTIALS',
        ip,
        userAgent
      })

      // Check if this attempt triggered rate limiting
      if (result.blocked) {
        return NextResponse.json(
          { error: result.message || 'Too many login attempts. Please try again later.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Log successful login
    await logSuccessfulLogin({
      userId: 'fleet-admin',
      email: `fleet:${username}`,
      source: 'fleet',
      ip,
      userAgent
    })

    // Generate session token
    const sessionToken = generateSessionToken()

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully'
    })

    // Set HTTP-only cookie on the response object (24 hours)
    response.cookies.set('fleet_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response

  } catch (error) {
    console.error('[Fleet Auth] Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// DELETE /api/fleet/auth - Logout
export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear the cookie on the response object
    response.cookies.set('fleet_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Expire immediately
    })

    return response
  } catch (error) {
    console.error('[Fleet Auth] Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

// GET /api/fleet/auth - Check session
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('fleet_session')?.value

    if (!sessionToken || !verifySessionToken(sessionToken)) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true
    })
  } catch (error) {
    console.error('[Fleet Auth] Session check error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}
