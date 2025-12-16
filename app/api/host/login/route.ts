// app/api/host/login/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'argon2'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'

// POST - Host login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
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

    if (!host || !host.user) {  // lowercase 'user'
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

    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const passwordValid = await verify(user.passwordHash, password)

    if (!passwordValid) {
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

    // Generate JWT tokens
    const accessToken = sign(
      {
        userId: host.user.id,  // lowercase 'user'
        hostId: host.id,
        email: host.email,
        name: host.name,
        role: 'BUSINESS',
        isRentalHost: true,
        approvalStatus: host.approvalStatus
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

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      host: {
        id: host.id,
        name: host.name,
        email: host.email,
        approvalStatus: host.approvalStatus,
        profilePhoto: host.profilePhoto
      }
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

    // Find session
    const session = await prisma.session.findFirst({
      where: {
        OR: [
          { token: accessToken },
          { refreshToken: accessToken }
        ]
      },
      include: {
        user: {  // lowercase 'user'
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

    if (!session || !session.user) {  // lowercase 'user'
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Check if session is expired
    if (session.expiresAt && session.expiresAt < new Date()) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Get host data
    const host = await prisma.rentalHost.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        approvalStatus: true,
        active: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      host: {
        id: host.id,
        name: host.name,
        email: host.email,
        profilePhoto: host.profilePhoto,
        approvalStatus: host.approvalStatus,
        active: host.active
      }
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

    // Clear all cookies
    response.cookies.set('hostAccessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('hostRefreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
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
        userId: true  // Added to get userId
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Generate new access token
    const newAccessToken = sign(
      {
        userId: host.userId,
        hostId: host.id,
        email: host.email,
        name: host.name,
        role: 'BUSINESS',
        isRentalHost: true,
        approvalStatus: host.approvalStatus
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