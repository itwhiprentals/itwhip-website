// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import db from '@/app/lib/db'

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
)

// Clear ALL auth cookies including NextAuth session cookies
// NextAuth cookies persist after custom logout and cause stale session
// interference on the next OAuth sign-in (extra DB call can fail/conflict)
function clearAllAuthCookies(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === 'production'

  // Custom app cookies
  response.cookies.set('accessToken', '', { httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 0, path: '/' })
  response.cookies.set('refreshToken', '', { httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 0, path: '/' })
  response.cookies.set('access_token', '', { maxAge: 0, path: '/' })
  response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' })
  response.cookies.set('session', '', { maxAge: 0, path: '/' })
  response.cookies.set('current_mode', '', { httpOnly: false, secure: isProduction, sameSite: 'lax', maxAge: 0, path: '/' })

  // NextAuth cookies — MUST clear these to prevent stale session on next OAuth sign-in
  response.cookies.set('next-auth.session-token', '', { maxAge: 0, path: '/' })
  response.cookies.set('next-auth.callback-url', '', { maxAge: 0, path: '/' })
  response.cookies.set('next-auth.csrf-token', '', { maxAge: 0, path: '/' })
  // Production uses __Secure- prefix
  response.cookies.set('__Secure-next-auth.session-token', '', { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 0, path: '/' })
  response.cookies.set('__Secure-next-auth.callback-url', '', { secure: true, maxAge: 0, path: '/' })
  response.cookies.set('__Secure-next-auth.csrf-token', '', { secure: true, maxAge: 0, path: '/' })
  // NextAuth may chunk large JWTs into numbered cookies
  for (let i = 0; i < 5; i++) {
    response.cookies.set(`next-auth.session-token.${i}`, '', { maxAge: 0, path: '/' })
    response.cookies.set(`__Secure-next-auth.session-token.${i}`, '', { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 0, path: '/' })
  }
}

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

    clearAllAuthCookies(response)
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

    clearAllAuthCookies(response)
    return response
  }
}

// GET method for simple logout links (e.g., /api/auth/logout)
export async function GET(request: NextRequest) {
  // Redirect to login page after logout
  const response = NextResponse.redirect(new URL('/auth/login', request.url))
  
  clearAllAuthCookies(response)
  console.log('User logged out via GET request')
  return response
}