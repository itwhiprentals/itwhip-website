// app/api/admin/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/app/lib/admin/auth'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get admin token to identify who's logging out
    const adminToken = request.cookies.get('adminAccessToken')
    
    // Get request metadata for logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    let adminEmail = 'unknown'
    let adminId = 'unknown'
    
    // Try to identify the admin (but don't fail if token is invalid)
    if (adminToken) {
      try {
        const payload = await verifyAdminToken(adminToken.value)
        if (payload) {
          adminEmail = payload.email
          adminId = payload.userId
          
          // Log the logout event
          await prisma.auditLog.create({
            data: {
              category: 'AUTHENTICATION',
              eventType: 'ADMIN_LOGOUT',
              severity: 'INFO',
              userId: adminId,
              adminId: adminId,
              adminEmail: adminEmail,
              ipAddress,
              userAgent,
              action: 'logout',
              resource: 'admin_auth',
              details: {
                timestamp: new Date().toISOString(),
                authType: 'admin',
                logoutType: 'manual'
              } as any,
              hash: '',
              timestamp: new Date()
            }
          }).catch(err => {
            console.error('Failed to log admin logout:', err)
            // Don't fail the logout if logging fails
          })
          
          console.log(`✅ Admin logged out: ${adminEmail}`)
        }
      } catch (error) {
        console.error('Error verifying token during logout:', error)
        // Continue with logout even if token verification fails
      }
    }
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Successfully logged out',
      timestamp: new Date().toISOString()
    })
    
    // Clear all admin cookies
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
    
    // Also clear any potential session storage indicators
    response.headers.set('Clear-Site-Data', '"cookies"')
    
    return response
    
  } catch (error) {
    console.error('Admin logout error:', error)
    
    // Even if there's an error, try to clear cookies
    const response = NextResponse.json({
      success: false,
      message: 'Logout encountered an error but cookies were cleared',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    
    // Clear cookies anyway
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
}

/**
 * GET method - Check logout status or provide logout info
 */
export async function GET(request: NextRequest) {
  // This can be used to check if logout was successful
  // or to provide logout confirmation page data
  
  const adminToken = request.cookies.get('adminAccessToken')
  const refreshToken = request.cookies.get('adminRefreshToken')
  
  if (!adminToken && !refreshToken) {
    return NextResponse.json({
      loggedOut: true,
      message: 'No active admin session',
      timestamp: new Date().toISOString()
    })
  }
  
  return NextResponse.json({
    loggedOut: false,
    message: 'Admin session still active',
    hint: 'Use POST method to logout',
    timestamp: new Date().toISOString()
  })
}