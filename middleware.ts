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

// 🔒 FLEET API SECURITY KEY
const FLEET_API_KEY = process.env.FLEET_API_KEY

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE'],
  '/guest/': ['CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE'],
  '/driver/': ['DRIVER'],
  '/hotel/dashboard': ['HOTEL'],
  '/host/dashboard': ['HOST'],
  '/host/calendar': ['HOST'],
  '/host/earnings': ['HOST'],
  '/host/cars': ['HOST'],
  '/host/bookings': ['HOST'],
  '/admin/': ['ADMIN'],
  '/api/protected': ['CLAIMED', 'STARTER', 'BUSINESS', 'ENTERPRISE'],
  '/api/admin/': ['ADMIN'],
  '/api/host/protected': ['HOST'],
}

// Host routes that ALL hosts (including PENDING) can access
const HOST_ACCESSIBLE_ROUTES = [
  '/host/dashboard',
  '/host/profile',
  '/host/settings',
  '/host/cars',
  '/host/bookings',
  '/host/messages',
  '/host/earnings',
  '/host/calendar',
  '/host/trips',
  '/host/reviews',
  '/host/notifications',
  '/host/claims',
  '/host/logout',
  '/api/host/messages',
  '/api/host/profile',
  '/api/host/documents/upload',
  '/api/host/verification-status',
  '/api/host/cars',
  '/api/host/bookings',
  '/api/host/earnings',
  '/api/host/calendar',
  '/api/host/trips',
  '/api/host/reviews',
  '/api/host/notifications',
  '/api/host/claims',
  '/api/host/banking',
  '/api/host/payout-methods',
  '/api/host/upload',
  '/api/account/link',
]

// ✅ FIXED: Routes that require APPROVED status
// Removed '/api/host/cars/[id]' - PENDING hosts need to edit their incomplete cars
// The route handler itself controls what PENDING hosts can/cannot do (e.g., can't activate)
const APPROVED_ONLY_ROUTES = [
  '/host/claims/new',
  '/api/host/bookings/[id]/approve',
  '/api/host/bookings/[id]/decline',
  '/api/host/earnings/payout',
  '/api/host/claims/create',
]

// Public routes that should redirect to dashboard if already logged in
const authRoutes = ['/auth/login', '/auth/signup']
const adminAuthRoutes = ['/admin/auth/login']
const hostAuthRoutes = ['/host/login']

// EXPLICITLY PUBLIC ROUTES
const publicRoutes = [
  '/hotel-portal',
  '/portal/login',
  '/portal/verify',
  '/hotel-solutions',
  '/portal',
  '/rentals',
  '/(guest)/rentals',
  '/admin/auth',
  '/api/admin/auth',
  '/api/auth',  // NextAuth routes (session, providers, callbacks)
  '/host/signup',
  '/host/forgot-password',
  '/host/reset-password',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/confirm-link',  // Account linking confirmation page
  '/auth/verify-phone',  // Phone verification page (Firebase)
  '/api/host/signup',
  '/api/host/login',
  '/api/host/verify',
  '/api/host/forgot-password',
  '/api/host/reset-password',
  '/api/account/link/confirm-guest',  // Account linking confirmation endpoints
  '/api/account/link/confirm-host',
  '/verify',
  // Host landing pages (public SEO pages)
  '/host/fleet-owners',
  '/host/tax-benefits',
  '/host/payouts',
  '/host/insurance-options',
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

// Helper function to verify platform token
async function verifyPlatformToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    const role = payload.role as string
    const isRentalHost = payload.isRentalHost === true
    
    if (!['DRIVER', 'HOTEL'].includes(role) && !(role === 'BUSINESS' && isRentalHost)) {
      throw new Error('Not a platform user')
    }
    
    return { payload, success: true }
  } catch (error) {
    throw new Error('Platform token verification failed')
  }
}

// Helper function to verify admin token
async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET)
    
    if (payload.type !== 'admin' || payload.role !== 'ADMIN') {
      throw new Error('Invalid admin token')
    }
    
    return { payload, success: true }
  } catch (error) {
    throw new Error('Admin token verification failed')
  }
}

// Check if host can access route
function canHostAccessRoute(pathname: string, approvalStatus: string): boolean {
  if (['SUSPENDED', 'REJECTED', 'BLACKLISTED'].includes(approvalStatus)) {
    return pathname === '/host/dashboard' || pathname === '/host/profile'
  }
  
  return HOST_ACCESSIBLE_ROUTES.some(route => pathname.startsWith(route))
}

// Check if operation requires approval
function requiresApproval(pathname: string, method: string = 'GET'): boolean {
  if (method === 'GET') return false
  
  if (APPROVED_ONLY_ROUTES.includes(pathname)) {
    return true
  }
  
  return APPROVED_ONLY_ROUTES.some(route => {
    const routePattern = route.replace(/\[id\]/g, '[^/]+')
    const regex = new RegExp(`^${routePattern}$`)
    return regex.test(pathname)
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 🔒 FLEET API PROTECTION - Allow phoenix-fleet-2847 key (legacy/internal)
  // EXCLUDE: /api/fleet/auth - public login endpoint with its own session-based auth
  if ((pathname.startsWith('/api/fleet/') || pathname.startsWith('/fleet/api/')) &&
      !pathname.startsWith('/api/fleet/auth')) {
    const url = new URL(request.url)
    const urlKey = url.searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')

    // Valid keys
    const phoenixKey = 'phoenix-fleet-2847'
    const externalKey = FLEET_API_KEY

    console.log(`[FLEET API] ${request.method} ${pathname}`, {
      hasUrlKey: !!urlKey,
      hasHeaderKey: !!headerKey,
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      timestamp: new Date().toISOString()
    })

    if (urlKey === phoenixKey || headerKey === phoenixKey) {
      console.log(`[FLEET API] ✅ ALLOWED with phoenix key`)
      return NextResponse.next()
    }

    if (headerKey && headerKey === externalKey) {
      console.log(`[FLEET API] ✅ ALLOWED with external key`)
      return NextResponse.next()
    }

    console.warn(`[FLEET API] 🚫 BLOCKED unauthorized access to ${pathname}`)

    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Valid authentication required',
        timestamp: new Date().toISOString()
      },
      { status: 403 }
    )
  }

  // FIRST: Check if it's an explicitly public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // HANDLE HOST LOGIN ROUTE
  if (hostAuthRoutes.some(route => pathname.startsWith(route))) {
    const platformToken = request.cookies.get('hostAccessToken')?.value || 
                         request.cookies.get('accessToken')?.value
    
    if (platformToken) {
      try {
        const { payload } = await verifyPlatformToken(platformToken)
        if (payload.role === 'HOST') {
          return NextResponse.redirect(new URL('/host/dashboard', request.url))
        }
      } catch {
        // Invalid token, let them access login
      }
    }
    return NextResponse.next()
  }

  // HANDLE HOST PROTECTED ROUTES
  if (pathname.startsWith('/host/') && 
      !pathname.startsWith('/host/signup') && 
      !pathname.startsWith('/host/login') && 
      !pathname.startsWith('/host/forgot-password') && 
      !pathname.startsWith('/host/reset-password')) {
    const hostToken = request.cookies.get('hostAccessToken')?.value || 
                     request.cookies.get('accessToken')?.value
    
    if (!hostToken) {
      const loginUrl = new URL('/host/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    try {
      const { payload } = await verifyPlatformToken(hostToken)
      
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        throw new Error('Host token expired')
      }
      
      const isRentalHost = payload.isRentalHost === true
      if (payload.role !== 'BUSINESS' || !isRentalHost) {
        const role = payload.role as string
        switch (role) {
          case 'DRIVER':
            return NextResponse.redirect(new URL('/driver/dashboard', request.url))
          case 'HOTEL':
            return NextResponse.redirect(new URL('/hotel/dashboard', request.url))
          case 'BUSINESS':
            return NextResponse.redirect(new URL('/dashboard', request.url))
          default:
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
      
      const approvalStatus = payload.approvalStatus as string || 'PENDING'
      const isApproved = approvalStatus === 'APPROVED'
      
      if (!canHostAccessRoute(pathname, approvalStatus)) {
        console.log('🚫 ACCESS DENIED:', {
          approvalStatus,
          attemptedPath: pathname,
          reason: 'Route not accessible for this status'
        })
        
        const dashboardUrl = new URL('/host/dashboard', request.url)
        dashboardUrl.searchParams.set('restricted', 'true')
        return NextResponse.redirect(dashboardUrl)
      }
      
      if (!isApproved && requiresApproval(pathname, 'GET')) {
        console.log('🚫 APPROVAL REQUIRED:', {
          approvalStatus,
          attemptedPath: pathname,
          reason: 'Only APPROVED hosts can perform this action'
        })
        
        const claimsUrl = new URL('/host/claims', request.url)
        claimsUrl.searchParams.set('approval_required', 'true')
        claimsUrl.searchParams.set('action', 'create_claim')
        return NextResponse.redirect(claimsUrl)
      }
      
      console.log('✅ ACCESS GRANTED:', {
        pathname,
        approvalStatus,
        isApproved
      })
      
      const response = NextResponse.next()
      response.headers.set('x-host-id', payload.hostId as string || '')
      response.headers.set('x-user-id', payload.userId as string || '')
      response.headers.set('x-host-email', payload.email as string)
      response.headers.set('x-host-name', payload.name as string || '')
      response.headers.set('x-host-role', 'HOST')
      response.headers.set('x-auth-type', 'platform')
      response.headers.set('x-host-approved', isApproved ? 'true' : 'false')
      response.headers.set('x-approval-status', approvalStatus)
      
      return response
      
    } catch (error) {
      console.error('Host JWT verification failed:', error)
      
      const response = NextResponse.redirect(new URL('/host/login', request.url))
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
      return response
    }
  }

  // HANDLE HOST API ROUTES
  if (pathname.startsWith('/api/host/') && 
      !pathname.startsWith('/api/host/login') && 
      !pathname.startsWith('/api/host/signup') && 
      !pathname.startsWith('/api/host/verify') &&
      !pathname.startsWith('/api/host/forgot-password') &&
      !pathname.startsWith('/api/host/reset-password')) {
    const hostToken = request.cookies.get('hostAccessToken')?.value || 
                     request.cookies.get('accessToken')?.value
    
    if (!hostToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Host access required' },
        { status: 401 }
      )
    }
    
    try {
      const { payload } = await verifyPlatformToken(hostToken)
      
      const isRentalHost = payload.isRentalHost === true
      if (payload.role !== 'BUSINESS' || !isRentalHost) {
        throw new Error('Not a rental host')
      }
      
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        throw new Error('Host token expired')
      }
      
      const approvalStatus = payload.approvalStatus as string || 'PENDING'
      const isApproved = approvalStatus === 'APPROVED'
      const method = request.method
      
      if (!isApproved && requiresApproval(pathname, method)) {
        return NextResponse.json(
          { 
            error: 'Account approval required',
            message: 'Only approved hosts can perform this action. Contact support if you need assistance.',
            approvalStatus,
            action: 'requires_approval'
          },
          { status: 403 }
        )
      }
      
      const response = NextResponse.next()
      response.headers.set('x-host-id', payload.hostId as string || '')
      response.headers.set('x-user-id', payload.userId as string || '')
      response.headers.set('x-host-email', payload.email as string)
      response.headers.set('x-host-approved', isApproved ? 'true' : 'false')
      response.headers.set('x-approval-status', approvalStatus)
      return response
      
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid host token' },
        { status: 401 }
      )
    }
  }

  // HANDLE ADMIN API ROUTES
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/auth/')) {
    if (pathname.startsWith('/api/admin/system/')) {
      const authHeader = request.headers.get('authorization')
      const cronSecret = process.env.CRON_SECRET || 'itwhip-cron-secret-2024'
      
      if (authHeader === `Bearer ${cronSecret}`) {
        const response = NextResponse.next()
        response.headers.set('x-cron-access', 'true')
        response.headers.set('x-auth-type', 'cron')
        return response
      }
    }
    
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
    const adminToken = request.cookies.get('adminAccessToken')?.value
    
    if (!adminToken) {
      const loginUrl = new URL('/admin/auth/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
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
      response.headers.set('x-admin-role', 'ADMIN')
      response.headers.set('x-auth-type', 'admin')
      
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      
      return response
      
    } catch (error) {
      console.error('Admin JWT verification failed:', error)
      
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

  if (authRoutes.some(route => pathname.startsWith(route))) {
    // Check if this is account linking flow or switching accounts - allow access even if logged in
    const isLinking = request.nextUrl.searchParams.get('linking') === 'true'
    const isSwitching = request.nextUrl.searchParams.get('switching') === 'true'

    if (guestToken && !isLinking && !isSwitching) {
      try {
        const { payload } = await verifyGuestToken(guestToken)
        const userRole = (payload.role as string).toUpperCase()

        switch (userRole) {
          case 'DRIVER':
            return NextResponse.redirect(new URL('/driver/dashboard', request.url))
          case 'HOTEL':
            return NextResponse.redirect(new URL('/hotel/dashboard', request.url))
          case 'HOST':
            return NextResponse.redirect(new URL('/host/dashboard', request.url))
          case 'ADMIN':
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

  if (adminAuthRoutes.some(route => pathname.startsWith(route))) {
    const adminToken = request.cookies.get('adminAccessToken')?.value
    if (adminToken) {
      try {
        await verifyAdminToken(adminToken)
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } catch {
        // Invalid token, let them access admin login
      }
    }
    return NextResponse.next()
  }

  const needsProtection = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route) && !pathname.startsWith('/admin/') && !pathname.startsWith('/host/')
  )

  if (!needsProtection) {
    return NextResponse.next()
  }

  if (!guestToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload, secretType } = await verifyGuestToken(guestToken)
    
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired')
    }

    const userRole = (payload.role as string).toUpperCase()

    let allowedRoles: string[] = []
    for (const [route, roles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        allowedRoles = roles
        break
      }
    }

    if (!allowedRoles.includes(userRole)) {
      switch (userRole) {
        case 'DRIVER':
          return NextResponse.redirect(new URL('/driver/dashboard', request.url))
        case 'HOTEL':
          return NextResponse.redirect(new URL('/hotel/dashboard', request.url))
        case 'HOST':
          return NextResponse.redirect(new URL('/host/dashboard', request.url))
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

    // ========== GUEST SUSPENSION CHECKS ==========
    // Check guest suspension for booking routes
    if (pathname.startsWith('/api/rentals/book') ||
        pathname.startsWith('/rentals/') ||
        pathname.startsWith('/api/bookings')) {
      try {
        const guestProfile = await prisma.reviewerProfile.findFirst({
          where: {
            OR: [
              { userId: payload.userId as string },
              { email: payload.email as string }
            ]
          },
          select: {
            suspensionLevel: true,
            suspendedAt: true,
            suspensionExpiresAt: true,
            bannedAt: true
          }
        })

        if (guestProfile) {
          // Check if banned (permanent)
          if (guestProfile.bannedAt) {
            console.log('🚫 Guest banned - redirecting to suspended page:', {
              userId: payload.userId,
              email: payload.email,
              bannedAt: guestProfile.bannedAt
            })
            return NextResponse.redirect(new URL('/suspended?role=guest', request.url))
          }

          // Check if suspended and not expired
          if (guestProfile.suspendedAt && guestProfile.suspensionLevel) {
            const now = new Date()
            const isExpired = guestProfile.suspensionExpiresAt &&
                            guestProfile.suspensionExpiresAt < now

            if (!isExpired) {
              console.log('🚫 Guest suspended - redirecting to suspended page:', {
                userId: payload.userId,
                email: payload.email,
                suspensionLevel: guestProfile.suspensionLevel,
                expiresAt: guestProfile.suspensionExpiresAt
              })
              return NextResponse.redirect(new URL('/suspended?role=guest', request.url))
            } else {
              console.log('✅ Guest suspension expired - allowing access:', {
                userId: payload.userId,
                expiresAt: guestProfile.suspensionExpiresAt
              })
            }
          }
        }
      } catch (error) {
        console.error('❌ Error checking guest suspension status:', error)
        // Don't block on error - allow access
      }
    }

    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId as string)
    response.headers.set('x-user-email', payload.email as string)
    response.headers.set('x-user-role', userRole)
    response.headers.set('x-user-name', payload.name as string || '')
    response.headers.set('x-token-type', secretType)

    return response

  } catch (error) {
    console.error('Guest JWT verification failed:', error)
    
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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}