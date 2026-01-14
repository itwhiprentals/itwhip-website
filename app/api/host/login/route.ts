// app/api/host/login/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'argon2'
import { sign, verify as jwtVerify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'

// POST - Host login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔐 HOST LOGIN DEBUG')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', email)

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find host by email
    const host = await prisma.rentalHost.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        user: {  // lowercase 'user'
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        },
        cars: {  // 'cars' not 'RentalCar'
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            isActive: true
          }
        }
      }
    })

    // Check if host is a Fleet Partner
    const isFleetPartner = host?.hostType === 'FLEET_PARTNER'

    console.log('🔍 Host found:', !!host)
    console.log('🔍 Host ID:', host?.id)
    console.log('🔍 Host approvalStatus:', host?.approvalStatus)
    console.log('🔍 Host active:', host?.active)
    console.log('🔍 Host has user:', !!host?.user)
    console.log('🔍 Host userId:', host?.userId)

    if (!host || !host.user) {  // lowercase 'user'
      // Check if user exists but is a GUEST (no host profile)
      const userByEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, email: true }
      })

      if (userByEmail) {
        // Check if they have a guest profile
        const guestProfile = await prisma.reviewerProfile.findFirst({
          where: { OR: [{ userId: userByEmail.id }, { email: email.toLowerCase() }] },
          select: { id: true }
        })

        if (guestProfile) {
          console.log('❌ GUARD: GUEST user tried host login - blocking')
          return NextResponse.json(
            {
              error: 'Guest account detected',
              guard: {
                type: 'guest-on-host',
                title: 'Guest Account Detected',
                message: 'You have a Guest account. Please use the Guest login page to access your account, or apply to become a Host.',
                actions: {
                  primary: { label: 'Go to Guest Login', url: '/auth/login' },
                  secondary: { label: 'Apply to Become a Host', url: '/host/signup' }
                }
              }
            },
            { status: 403 }
          )
        }
      }

      console.log('❌ 401: Host not found or no associated user')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password (assuming password is on the User model)
    const user = await prisma.user.findUnique({
      where: { id: host.userId },
      select: { passwordHash: true }
    })

    console.log('🔍 User found for password check:', !!user)
    console.log('🔍 User has passwordHash:', !!user?.passwordHash)
    console.log('🔍 passwordHash length:', user?.passwordHash?.length || 0)

    if (!user?.passwordHash) {
      console.log('❌ 401: No password hash found')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const passwordValid = await verify(user.passwordHash, password)
    console.log('🔍 Password valid:', passwordValid)

    if (!passwordValid) {
      console.log('❌ 401: Password verification failed')
      // Log failed attempt
      await prisma.loginAttempt.create({
        data: {
          identifier: email,
          userId: host.user.id,  // lowercase 'user'
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: false,
          reason: 'Invalid password'
        }
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('✅ Password verified - generating tokens')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Generate JWT tokens
    const accessToken = sign(
      {
        userId: host.user.id,  // lowercase 'user'
        hostId: host.id,
        email: host.email,
        name: host.name,
        role: 'BUSINESS',
        isRentalHost: true,
        approvalStatus: host.approvalStatus,
        hostType: host.hostType,
        isFleetPartner: isFleetPartner
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = sign(
      {
        userId: host.user.id,  // lowercase 'user'
        hostId: host.id,
        email: host.email,
        type: 'refresh'
      },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    // Create session record
    const session = await prisma.session.create({
      data: {
        userId: host.user.id,  // lowercase 'user'
        token: accessToken,
        refreshToken: refreshToken,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    // Log successful login
    await prisma.loginAttempt.create({
      data: {
        identifier: email,
        userId: host.user.id,  // lowercase 'user'
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: true,
        reason: 'Successful login'
      }
    })

    // Update last active
    await prisma.user.update({
      where: { id: host.user.id },  // lowercase 'user'
      data: { 
        lastActive: new Date(),
        updatedAt: new Date()
      }
    })

    // UNIFIED PORTAL: All hosts now redirect to /partner/dashboard
    // The partner portal handles role-based visibility internally
    const redirectPath = '/partner/dashboard'

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      host: {
        id: host.id,
        name: host.name,
        email: host.email,
        approvalStatus: host.approvalStatus,
        profilePhoto: host.profilePhoto,
        hostType: host.hostType,
        // Partner-specific fields
        partnerCompanyName: host.partnerCompanyName,
        partnerSlug: host.partnerSlug
      },
      // Unified portal - all hosts use partner dashboard
      isPartner: true,  // Treat all hosts as "partners" in unified portal
      redirect: redirectPath
    })

    // Set HTTP-only cookies
    response.cookies.set('hostAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    response.cookies.set('hostRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // Also set accessToken for compatibility
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Host login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

// GET - Verify host session
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('hostAccessToken')?.value ||
                       request.cookies.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    let userId: string | null = null

    // Try to find session in database first (traditional login)
    const session = await prisma.session.findFirst({
      where: {
        OR: [
          { token: accessToken },
          { refreshToken: accessToken }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            lastActive: true
          }
        }
      }
    })

    if (session && session.user) {
      // Check if session is expired
      if (session.expiresAt && session.expiresAt < new Date()) {
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        )
      }
      userId = session.user.id
    } else {
      // No session found - try JWT verification (OAuth login)
      try {
        const decoded = jwtVerify(accessToken, JWT_SECRET) as any
        if (decoded && decoded.userId) {
          userId = decoded.userId
          console.log('[Host Login GET] Verified JWT token for userId:', userId)
        }
      } catch (jwtError) {
        console.error('[Host Login GET] JWT verification failed:', jwtError)
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        )
      }
    }

    if (!userId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Get host data - use findFirst with OR to check both userId and email
    // This handles cases where OAuth created the host or legacy hosts without userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    const host = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: userId },
          { email: user?.email }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        approvalStatus: true,
        active: true,
        userId: true,
        hostType: true,
        partnerCompanyName: true,
        partnerSlug: true
      }
    })

    if (!host) {
      console.log('[Host Login GET] No host found for userId:', userId, 'or email:', user?.email)
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    const isFleetPartner = host.hostType === 'FLEET_PARTNER'
    console.log('[Host Login GET] Found host:', host.id, 'approvalStatus:', host.approvalStatus, 'hostType:', host.hostType)

    return NextResponse.json({
      authenticated: true,
      host: {
        id: host.id,
        name: host.name,
        email: host.email,
        profilePhoto: host.profilePhoto,
        approvalStatus: host.approvalStatus,
        active: host.active,
        hostType: host.hostType,
        partnerCompanyName: host.partnerCompanyName,
        partnerSlug: host.partnerSlug
      },
      isPartner: isFleetPartner,
      redirect: isFleetPartner ? '/partner/dashboard' : '/host/dashboard'
    })

  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

// DELETE - Host logout
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('hostAccessToken')?.value || 
                       request.cookies.get('accessToken')?.value

    if (accessToken) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: {
          OR: [
            { token: accessToken },
            { refreshToken: accessToken }
          ]
        }
      })
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear ALL auth-related cookies (unified portal)
    const cookiesToClear = [
      'hostAccessToken',
      'hostRefreshToken',
      'accessToken',
      'refreshToken',
      'partner_token',
      'guestAccessToken',
      'guestRefreshToken'
    ]

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0,
      path: '/'
    }

    // Clear each cookie
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', cookieOptions)
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

// PUT - Refresh access token
export async function PUT(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('hostRefreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Find session
    const session = await prisma.session.findFirst({
      where: { refreshToken },
      include: {
        user: {  // lowercase 'user'
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    if (!session || !session.user) {  // lowercase 'user'
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Check if session is expired
    if (session.expiresAt && session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Refresh token expired' },
        { status: 401 }
      )
    }

    // Get host data for approvalStatus
    const host = await prisma.rentalHost.findUnique({
      where: { userId: session.user.id },  // lowercase 'user'
      select: {
        id: true,
        email: true,
        name: true,
        approvalStatus: true,
        userId: true,  // Added to get userId
        hostType: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    const isFleetPartner = host.hostType === 'FLEET_PARTNER'

    // Generate new access token
    const newAccessToken = sign(
      {
        userId: host.userId,
        hostId: host.id,
        email: host.email,
        name: host.name,
        role: 'BUSINESS',
        isRentalHost: true,
        approvalStatus: host.approvalStatus,
        hostType: host.hostType,
        isFleetPartner: isFleetPartner
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    // Update session
    await prisma.session.updateMany({
      where: { 
        userId: session.user.id,  // lowercase 'user'
        refreshToken: refreshToken
      },
      data: { 
        token: newAccessToken,
        updatedAt: new Date()
      }
    })

    const response = NextResponse.json({ 
      success: true,
      message: 'Token refreshed'
    })

    // Set new access token
    response.cookies.set('hostAccessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/'
    })

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}