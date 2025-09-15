// app/api/admin/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

// Admin JWT secret
const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-secret-key-change-this'
)

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('adminRefreshToken')
    
    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No refresh token found',
          code: 'NO_REFRESH_TOKEN'
        },
        { status: 401 }
      )
    }

    // Verify the refresh token
    let payload
    try {
      const verified = await jwtVerify(refreshToken.value, ADMIN_JWT_SECRET)
      payload = verified.payload
    } catch (error) {
      console.error('Refresh token verification failed:', error)
      
      // Clear invalid tokens
      const response = NextResponse.json(
        { 
          success: false,
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        },
        { status: 401 }
      )
      
      response.cookies.set('adminAccessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })
      response.cookies.set('adminRefreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })
      
      return response
    }

    // Verify it's an admin refresh token
    if (payload.type !== 'admin-refresh') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token is not an admin refresh token',
          code: 'WRONG_TOKEN_TYPE'
        },
        { status: 401 }
      )
    }

    // Get the admin user from database
    const user = await prisma.user.findUnique({
      where: { 
        id: payload.userId as string,
        role: 'ADMIN',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastActive: true
      }
    })

    if (!user) {
      // User no longer exists or is not admin
      console.warn(`Admin refresh failed - user not found or inactive: ${payload.userId}`)
      
      const response = NextResponse.json(
        { 
          success: false,
          error: 'Admin user not found or inactive',
          code: 'USER_NOT_FOUND'
        },
        { status: 403 }
      )
      
      // Clear tokens
      response.cookies.set('adminAccessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })
      response.cookies.set('adminRefreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })
      
      return response
    }

    // Generate new access token (4 hours)
    const newAccessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'admin'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('4h')
      .setIssuedAt()
      .sign(ADMIN_JWT_SECRET)

    // Optionally generate new refresh token (rolling refresh)
    // This extends the session each time they refresh
    const newRefreshToken = await new SignJWT({
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
    }).catch(err => {
      console.error('Failed to update last active:', err)
      // Don't fail the refresh for this
    })

    // Log the refresh event
    await prisma.auditLog.create({
      data: {
        category: 'AUTHENTICATION',
        eventType: 'ADMIN_TOKEN_REFRESH',
        severity: 'INFO',
        userId: user.id,
        adminId: user.id,
        adminEmail: user.email,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'refresh',
        resource: 'admin_auth',
        details: {
          timestamp: new Date().toISOString(),
          authType: 'admin'
        } as any,
        hash: '',
        timestamp: new Date()
      }
    }).catch(err => {
      console.error('Failed to log token refresh:', err)
      // Don't fail the refresh for this
    })

    console.log(`✅ Admin token refreshed: ${user.email}`)

    // Create response with new tokens
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      expiresIn: '4h',
      timestamp: new Date().toISOString()
    })

    // Set new cookies
    response.cookies.set('adminAccessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 4 * 60 * 60, // 4 hours
      path: '/'
    })

    response.cookies.set('adminRefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Admin token refresh error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Token refresh failed',
        code: 'REFRESH_FAILED'
      },
      { status: 500 }
    )
  }
}

/**
 * GET method - Check if refresh is needed
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('adminAccessToken')
    const refreshToken = request.cookies.get('adminRefreshToken')
    
    if (!accessToken && !refreshToken) {
      return NextResponse.json({
        needsRefresh: false,
        reason: 'No tokens present - login required',
        hasRefreshToken: false
      })
    }
    
    if (!accessToken && refreshToken) {
      return NextResponse.json({
        needsRefresh: true,
        reason: 'Access token missing but refresh token exists',
        hasRefreshToken: true
      })
    }
    
    // Check if access token is expired or about to expire
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken.value, ADMIN_JWT_SECRET)
        const exp = payload.exp as number
        const now = Math.floor(Date.now() / 1000)
        const minutesUntilExpiry = Math.floor((exp - now) / 60)
        
        if (minutesUntilExpiry < 30) {
          return NextResponse.json({
            needsRefresh: true,
            reason: `Access token expiring in ${minutesUntilExpiry} minutes`,
            minutesUntilExpiry,
            hasRefreshToken: !!refreshToken
          })
        }
        
        return NextResponse.json({
          needsRefresh: false,
          reason: 'Access token still valid',
          minutesUntilExpiry,
          hasRefreshToken: !!refreshToken
        })
        
      } catch (error) {
        return NextResponse.json({
          needsRefresh: true,
          reason: 'Access token invalid or expired',
          hasRefreshToken: !!refreshToken
        })
      }
    }
    
    return NextResponse.json({
      needsRefresh: false,
      reason: 'Unknown state'
    })
    
  } catch (error) {
    console.error('Refresh check error:', error)
    return NextResponse.json(
      { 
        needsRefresh: false,
        error: 'Check failed'
      },
      { status: 500 }
    )
  }
}