// app/lib/admin/auth.ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/app/lib/database/prisma'

// Admin JWT secret
const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-secret-key-change-this'
)

// Types
export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
}

export interface AdminTokenPayload {
  userId: string
  email: string
  role: string
  type: 'admin' | 'admin-refresh'
  exp?: number
  iat?: number
}

/**
 * Verify an admin token
 */
export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET)
    
    // Ensure it's an admin token
    if (payload.type !== 'admin' && payload.type !== 'admin-refresh') {
      console.warn('Token is not an admin token:', payload.type)
      return null
    }

    // Ensure user has admin role
    if (payload.role !== 'ADMIN') {
      console.warn('Token does not have ADMIN role:', payload.role)
      return null
    }

    return payload as AdminTokenPayload
  } catch (error) {
    console.error('Admin token verification failed:', error)
    return null
  }
}

/**
 * Get current admin user from cookies (for server components)
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('adminAccessToken')

    if (!token) {
      return null
    }

    const payload = await verifyAdminToken(token.value)
    if (!payload) {
      return null
    }

    // Fetch fresh user data from database
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
        role: true
      }
    })

    if (!user) {
      console.warn('Admin user not found or inactive:', payload.userId)
      return null
    }

    return user as AdminUser
  } catch (error) {
    console.error('Error getting current admin:', error)
    return null
  }
}

/**
 * Generate new admin tokens
 */
export async function generateAdminTokens(user: AdminUser) {
  // Access token (4 hours)
  const accessToken = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'admin'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('4h')
    .setIssuedAt()
    .sign(ADMIN_JWT_SECRET)

  // Refresh token (7 days)
  const refreshToken = await new SignJWT({
    userId: user.id,
    type: 'admin-refresh'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(ADMIN_JWT_SECRET)

  return { accessToken, refreshToken }
}

/**
 * Refresh admin access token using refresh token
 */
export async function refreshAdminToken(refreshToken: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(refreshToken, ADMIN_JWT_SECRET)
    
    // Verify it's a refresh token
    if (payload.type !== 'admin-refresh') {
      console.warn('Token is not an admin refresh token')
      return null
    }

    // Get user from database
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
        role: true
      }
    })

    if (!user) {
      console.warn('Admin user not found for refresh:', payload.userId)
      return null
    }

    // Generate new access token
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'admin'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('4h')
      .setIssuedAt()
      .sign(ADMIN_JWT_SECRET)

    return accessToken
  } catch (error) {
    console.error('Admin token refresh failed:', error)
    return null
  }
}

/**
 * Clear admin cookies (for logout)
 */
export function clearAdminCookies() {
  const cookieStore = cookies()
  
  // Clear admin tokens
  cookieStore.set('adminAccessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
  
  cookieStore.set('adminRefreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
}

/**
 * Check if request has valid admin token (for API routes)
 */
export async function requireAdmin(request: Request): Promise<AdminUser | null> {
  try {
    // Check for token in cookies
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      return null
    }

    // Parse cookies manually
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [key, value] = cookie.split('=')
        return [key, decodeURIComponent(value)]
      })
    )

    const token = cookies.adminAccessToken
    if (!token) {
      return null
    }

    // Verify token
    const payload = await verifyAdminToken(token)
    if (!payload) {
      return null
    }

    // Get user from database
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
        role: true
      }
    })

    return user as AdminUser
  } catch (error) {
    console.error('requireAdmin error:', error)
    return null
  }
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  resource: string,
  details?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        category: 'ADMIN_ACTION',
        eventType: action,
        severity: 'INFO',
        userId: adminId,
        action,
        resource,
        resourceId: details?.resourceId,
        details: details || {},
        ipAddress: 'system',
        userAgent: 'admin-system',
        hash: '',
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}