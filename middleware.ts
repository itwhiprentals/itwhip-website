// middleware.ts (in root directory, not in app folder)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Get JWT secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

// Define protected routes and their required roles
// BE SPECIFIC - use trailing slashes or full paths to avoid conflicts
const protectedRoutes = {
  '/dashboard': ['guest', 'driver', 'hotel', 'admin'],
  '/guest/': ['guest', 'admin'],  // Added trailing slash
  '/driver/': ['driver', 'admin'], // Added trailing slash
  '/hotel/dashboard': ['hotel', 'admin'], // More specific path - NOT /hotel-portal
  '/admin/': ['admin'], // Added trailing slash
  '/api/protected': ['guest', 'driver', 'hotel', 'admin'],
}

// Public routes that should redirect to dashboard if already logged in
const authRoutes = ['/auth/login', '/auth/signup']

// EXPLICITLY PUBLIC ROUTES - Never protect these
const publicRoutes = [
  '/hotel-portal',     // Hotel marketing page
  '/portal/login',     // Hotel portal login
  '/portal/verify',    // Hotel verification
  '/hotel-solutions',  // Hotel marketing
  '/portal',          // General portal pages
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // FIRST: Check if it's an explicitly public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // These routes are always public - no auth needed
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('access_token')?.value

  // Check if it's an auth route (login/signup)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    // If user has valid token, redirect to dashboard
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET)
        // User is logged in, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } catch {
        // Token is invalid, let them access login/signup
      }
    }
    // No token or invalid token, allow access to auth pages
    return NextResponse.next()
  }

  // Check if route needs protection
  const needsProtection = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  )

  if (!needsProtection) {
    // Not a protected route, allow access
    return NextResponse.next()
  }

  // Route needs protection, check JWT
  if (!token) {
    // No token, redirect to login
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Check if token is expired (jose handles this, but double-check)
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired')
    }

    // Get user role from token
    const userRole = payload.role as string

    // Find which roles are allowed for this route
    let allowedRoles: string[] = []
    for (const [route, roles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        allowedRoles = roles
        break
      }
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(userRole)) {
      // User doesn't have permission, redirect to appropriate dashboard
      switch (userRole) {
        case 'driver':
          return NextResponse.redirect(new URL('/driver/dashboard', request.url))
        case 'hotel':
          return NextResponse.redirect(new URL('/hotel/dashboard', request.url))
        case 'admin':
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        default:
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // User is authenticated and authorized
    const response = NextResponse.next()
    
    // Add user info to headers so pages can access it
    response.headers.set('x-user-id', payload.userId as string)
    response.headers.set('x-user-email', payload.email as string)
    response.headers.set('x-user-role', userRole)
    response.headers.set('x-user-name', payload.name as string || '')

    return response

  } catch (error) {
    console.error('JWT verification failed:', error)
    
    // Token is invalid or expired, clear cookies and redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    
    // Clear invalid cookies
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
    
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need protection
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}