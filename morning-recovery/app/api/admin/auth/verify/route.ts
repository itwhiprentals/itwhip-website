// app/api/admin/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/app/lib/admin/auth'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('adminAccessToken')
    
    if (!adminToken) {
      return NextResponse.json(
        { 
          authenticated: false,
          error: 'No admin token found' 
        },
        { status: 401 }
      )
    }

    // Verify the admin token
    const payload = await verifyAdminToken(adminToken.value)
    
    if (!payload) {
      // Clear invalid cookies
      const response = NextResponse.json(
        { 
          authenticated: false,
          error: 'Invalid admin token' 
        },
        { status: 401 }
      )
      
      // Clear the invalid tokens
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

    // Verify user still exists and is admin
    const user = await prisma.user.findUnique({
      where: { 
        id: payload.userId,
        role: 'ADMIN',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastActive: true,
        createdAt: true,
        hotelId: true
      }
    })

    if (!user) {
      // User no longer exists or is not admin
      const response = NextResponse.json(
        { 
          authenticated: false,
          error: 'Admin user not found or inactive' 
        },
        { status: 403 }
      )
      
      // Clear the tokens
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

    // Calculate session info
    const tokenExp = payload.exp ? new Date(payload.exp * 1000) : null
    const sessionDuration = tokenExp ? Math.floor((tokenExp.getTime() - Date.now()) / 1000 / 60) : 0 // minutes remaining
    
    // Check if token is about to expire (less than 30 minutes)
    const shouldRefresh = sessionDuration < 30 && sessionDuration > 0

    // Update last active timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    }).catch(err => {
      console.error('Failed to update last active:', err)
      // Don't fail the request for this
    })

    // Return authenticated admin data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastActive: user.lastActive,
        createdAt: user.createdAt
      },
      session: {
        expiresAt: tokenExp?.toISOString(),
        minutesRemaining: sessionDuration,
        shouldRefresh,
        type: 'admin'
      }
    })

  } catch (error) {
    console.error('Admin verify error:', error)
    
    // For any unexpected error, return unauthenticated
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'Verification failed' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST method for active session heartbeat
 * Can be called periodically to keep session active
 */
export async function POST(request: NextRequest) {
  try {
    const adminToken = request.cookies.get('adminAccessToken')
    
    if (!adminToken) {
      return NextResponse.json(
        { success: false, error: 'No admin session' },
        { status: 401 }
      )
    }

    const payload = await verifyAdminToken(adminToken.value)
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Update last active
    await prisma.user.update({
      where: { 
        id: payload.userId,
        role: 'ADMIN'
      },
      data: { lastActive: new Date() }
    })

    // Log heartbeat for monitoring
    console.log(`Admin heartbeat: ${payload.email} at ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin heartbeat error:', error)
    return NextResponse.json(
      { success: false, error: 'Heartbeat failed' },
      { status: 500 }
    )
  }
}