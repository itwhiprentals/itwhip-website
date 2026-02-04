// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import db from '@/app/lib/db'

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
)

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie - using camelCase to match login
    const refreshToken = request.cookies.get('refreshToken')?.value

    // If there's a refresh token, invalidate it in the database
    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET)
        
        // Delete all refresh tokens for this user (logs out from all devices)
        if (payload.userId) {
          await db.deleteUserRefreshTokens(payload.userId as string)
          console.log('Deleted refresh tokens for user:', payload.userId)
        }
      } catch (error) {
        // Token might be invalid or expired, but we still want to clear cookies
        console.log('Could not verify refresh token during logout:', error)
      }
    }

    // Create response
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Logged out successfully' 
      },
      { status: 200 }
    )

    // Clear auth cookies - FIXED: Using camelCase to match login cookies
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expire
      path: '/'
    })

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expire
      path: '/'
    })

    // Also clear any old cookie formats that might exist
    response.cookies.set('access_token', '', {
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('refresh_token', '', {
      maxAge: 0,
      path: '/'
    })

    // Clear any session cookie if it exists
    response.cookies.set('session', '', {
      maxAge: 0,
      path: '/'
    })

    // Clear current_mode cookie (role indicator)
    response.cookies.set('current_mode', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    console.log('User logged out successfully, all cookies cleared')
    return response

  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if there's an error, we should still clear cookies
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred during logout, but cookies were cleared' 
      },
      { status: 500 }
    )

    // Clear all possible cookie variations even on error
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('access_token', '', {
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('refresh_token', '', {
      maxAge: 0,
      path: '/'
    })

    // Clear current_mode cookie on error too
    response.cookies.set('current_mode', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  }
}

// GET method for simple logout links (e.g., /api/auth/logout)
export async function GET(request: NextRequest) {
  // Redirect to login page after logout
  const response = NextResponse.redirect(new URL('/auth/login', request.url))
  
  // Clear all auth cookies
  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })

  // Clear old format cookies too
  response.cookies.set('access_token', '', {
    maxAge: 0,
    path: '/'
  })

  response.cookies.set('refresh_token', '', {
    maxAge: 0,
    path: '/'
  })

  // Clear current_mode cookie (role indicator)
  response.cookies.set('current_mode', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })

  console.log('User logged out via GET request')
  return response
}