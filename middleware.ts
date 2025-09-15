// middleware.ts (in root directory, not in app folder)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Get all three JWT secrets
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-secret-key-change-this'
)

// Define protected routes and their required roles
// Using uppercase to match Prisma UserRole enum
const protectedRoutes = {
  '/dashboard': ['CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE'], // Guest users only (removed ADMIN)
  '/guest/': ['CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE'],
  '/driver/': ['DRIVER'],
  '/hotel/dashboard': ['HOTEL'],
  '/admin/': ['ADMIN'], // Admin routes require ADMIN role
  '/api/protected': ['CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE'],
  '/api/admin/': ['ADMIN'], // Admin API routes
}

// Public routes that should redirect to dashboard if already logged in
const authRoutes = ['/auth/login', '/auth/signup']
const adminAuthRoutes = ['/admin/auth/login'] // Admin login is separate

// EXPLICITLY PUBLIC ROUTES - Never protect these
const publicRoutes = [
  '/hotel-portal',     // Hotel marketing page
  '/portal/login',     // Hotel portal login
  '/portal/verify',    // Hotel verification
  '/hotel-solutions',  // Hotel marketing
  '/portal',          // General portal pages
  '/rentals',         // Public rental pages
  '/(guest)/rentals', // Guest rental pages (public browsing)
  '/admin/auth',       // ALL admin auth pages are public
  '/api/admin/auth',   // ALL admin auth API routes are public
]

// Helper function to verify guest/platform token
async function verifyGuestToken(token: string) {
  const secrets = [
    { secret: GUEST_JWT_SECRET, type: 'guest' },
    { secret: JWT_SECRET, type: 'platform' }
  ]

  for (const { secret, type } of secrets) {
    try {
      const { payload } = await jwtVerify(token, secret)
      return { payload, secretType: type, success: true }
    } catch (error) {
      continue
    }
  }
  
  throw new Error('Guest token verification failed')
}

// Helper function to verify admin token
async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET)
    
    // Ensure it's an admin token
    if (payload.type !== 'admin' || payload.role !== 'ADMIN') {
      throw new Error('Invalid admin token')
    }
    
    return { payload, success: true }
  } catch (error) {
    throw new Error('Admin token verification failed')
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // FIRST: Check if it's an explicitly public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // HANDLE ADMIN API ROUTES (except auth endpoints)
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/auth/')) {
    // Special handling for system monitoring endpoints - allow CRON_SECRET
    if (pathname.startsWith('/api/admin/system/')) {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET || 'itwhip-cron-secret-2024'
      
      if (authHeader === `Bearer ${cronSecret}`) {
        // Valid CRON_SECRET for system monitoring, allow access
        const response = NextResponse.next()
        response.headers.set('x-cron-access', 'true')
        response.headers.set('x-auth-type', 'cron')
        return response
      }
    }
    
    // This is a protected admin API route
    const adminToken = request.cookies.get('adminAccessToken')?.value
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }
    
    try {
      const { payload } = await verifyAdminToken(adminToken)
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        throw new Error('Admin token expired')
      }
      
      const response = NextResponse.next()
      response.headers.set('x-admin-id', payload.userId as string)
      response.headers.set('x-admin-email', payload.email as string)
      return response
      
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 401 }
      )
    }
  }

  // HANDLE ADMIN ROUTES
  if (pathname.startsWith('/admin/') && !pathname.startsWith('/admin/auth/')) {
    // This is a protected admin route
    const adminToken = request.cookies.get('adminAccessToken')?.value
    
    if (!adminToken) {
      // No admin token, redirect to admin login
      const loginUrl = new URL('/admin/auth/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    try {
      // Verify admin token
      const { payload } = await verifyAdminToken(adminToken)
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        throw new Error('Admin token expired')
      }
      
      // Admin is authenticated, add headers and continue
      const response = NextResponse.next()
      response.headers.set('x-admin-id', payload.userId as string)
      response.headers.set('x-admin-email', payload.email as string)
      response.headers.set('x-admin-role', 'ADMIN')
      response.headers.set('x-auth-type', 'admin')
      
      // Apply security headers for admin routes
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      
      return response
      
    } catch (error) {
      console.error('Admin JWT verification failed:', error)
      
      // Clear invalid admin cookies and redirect to admin login
      const response = NextResponse.redirect(new URL('/admin/auth/login', request.url))
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

  // HANDLE GUEST/PLATFORM ROUTES
  const guestToken = request.cookies.get('accessToken')?.value

  // Check if it's a guest auth route (login/signup)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    // If user has valid guest token, redirect to guest dashboard
    if (guestToken) {
      try {
        const { payload } = await verifyGuestToken(guestToken)
        const userRole = (payload.role as string).toUpperCase()
        
        // Redirect based on role
        switch (userRole) {
          case 'DRIVER':
            return NextResponse.redirect(new URL('/driver/dashboard', request.url))
          case 'HOTEL':
            return NextResponse.redirect(new URL('/hotel/dashboard', request.url))
          case 'ADMIN':
            // Admin with guest token should go to admin area
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
          case 'CLAIMED':
          case 'STARTER':
          case 'BUSINESS':
          case 'ENTERPRISE':
          default:
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch {
        // Token is invalid, let them access login/signup
      }
    }
    return NextResponse.next()
  }

  // Check if admin auth route
  if (adminAuthRoutes.some(route => pathname.startsWith(route))) {
    // Check if admin is already logged in
    const adminToken = request.cookies.get('adminAccessToken')?.value
    if (adminToken) {
      try {
        await verifyAdminToken(adminToken)
        // Valid admin token, redirect to admin dashboard
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } catch {
        // Invalid token, let them access admin login
      }
    }
    return NextResponse.next()
  }

  // Check if route needs guest/platform protection
  const needsProtection = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route) && !pathname.startsWith('/admin/')
  )

  if (!needsProtection) {
    return NextResponse.next()
  }

  // Route needs guest/platform protection
  if (!guestToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify guest/platform token
    const { payload, secretType } = await verifyGuestToken(guestToken)
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired')
    }

    const userRole = (payload.role as string).toUpperCase()

    // Find allowed roles for this route
    let allowedRoles: string[] = []
    for (const [route, roles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        allowedRoles = roles
        break
      }
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard
      switch (userRole) {
        case 'DRIVER':
          return NextResponse.redirect(new URL('/driver/dashboard', request.url))
        case 'HOTEL':
          return NextResponse.redirect(new URL('/hotel/dashboard', request.url))
        case 'ADMIN':
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        case 'CLAIMED':
        case 'STARTER':
        case 'BUSINESS':
        case 'ENTERPRISE':
        default:
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // User is authenticated and authorized
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId as string)
    response.headers.set('x-user-email', payload.email as string)
    response.headers.set('x-user-role', userRole)
    response.headers.set('x-user-name', payload.name as string || '')
    response.headers.set('x-token-type', secretType)

    return response

  } catch (error) {
    console.error('Guest JWT verification failed:', error)
    
    // Clear invalid cookies and redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
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