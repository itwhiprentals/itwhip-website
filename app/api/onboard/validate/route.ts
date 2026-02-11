// app/api/onboard/validate/route.ts
// Validates onboarding token and creates/authenticates external host

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sign } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import {
  generateHostAccessToken,
  getTokenExpiry,
  logProspectActivity,
  ACTIVITY_TYPES
} from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

// Get client IP from request headers
function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || undefined
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find prospect by invite token
    const prospect = await prisma.hostProspect.findUnique({
      where: { inviteToken: token },
      include: {
        request: {
          select: {
            id: true,
            requestCode: true,
            vehicleType: true,
            vehicleMake: true,
            startDate: true,
            endDate: true,
            durationDays: true,
            offeredRate: true,
            pickupCity: true,
            pickupState: true
          }
        }
      }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Invalid or unknown link' },
        { status: 404 }
      )
    }

    const isTokenExpired = prospect.inviteTokenExp && new Date(prospect.inviteTokenExp) < new Date()

    // ========================================================================
    // RETURNING PROSPECT: Already converted — log them in regardless of expiry
    // Prospects use their onboard link as a magic login link. Token expiry
    // should NOT block returning hosts who already have an account.
    // ========================================================================
    if (prospect.convertedHostId) {
      // Track page view for returning prospect
      await prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          pageViewedAt: prospect.pageViewedAt || new Date(),
          pageViewCount: { increment: 1 },
          lastActivityAt: new Date(),
          linkClickedAt: prospect.linkClickedAt || new Date()
        }
      })

      const existingHost = await prisma.rentalHost.findUnique({
        where: { id: prospect.convertedHostId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })

      if (existingHost) {
        // Reactivate if previously expired from prospect deadline
        if (!existingHost.active && existingHost.suspendedReason?.includes('Expired prospect')) {
          await prisma.rentalHost.update({
            where: { id: existingHost.id },
            data: {
              active: true,
              dashboardAccess: true,
              suspendedAt: null,
              suspendedReason: null
            }
          })
          console.log(`[Onboard] Reactivated expired returning host: ${existingHost.id}`)
        }

        console.log(`[Onboard] Returning prospect ${prospect.name} → host ${existingHost.id} (token ${isTokenExpired ? 'expired' : 'valid'})`)

        // Generate tokens and log them in
        const tokens = await generateTokensAndSession(existingHost, request)

        const response = NextResponse.json({
          success: true,
          prospectName: prospect.name.split(' ')[0],
          isReturning: true
        })

        setAuthCookies(response, tokens)
        return response
      }
      // If convertedHostId exists but host was deleted, fall through to re-create
      console.warn(`[Onboard] Converted host ${prospect.convertedHostId} not found — will re-create`)
    }

    // ========================================================================
    // NEW PROSPECT: Token expiry matters — they haven't converted yet
    // ========================================================================
    if (isTokenExpired) {
      // Track expired access attempt (spy system)
      await prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          expiredAccessCount: { increment: 1 },
          lastExpiredAccessAt: new Date(),
          lastActivityAt: new Date()
        }
      })

      console.log(`[Onboard] Token expired for unconverted prospect: ${prospect.name} (${prospect.email})`)

      return NextResponse.json(
        { error: 'This link has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    // Track page view (spy system)
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        pageViewedAt: prospect.pageViewedAt || new Date(),
        pageViewCount: { increment: 1 },
        lastActivityAt: new Date(),
        linkClickedAt: prospect.linkClickedAt || new Date(),
        status: prospect.status === 'EMAIL_SENT' ? 'EMAIL_OPENED' : prospect.status
      }
    })

    // Check if a host already exists with this email
    let host = await prisma.rentalHost.findUnique({
      where: { email: prospect.email.toLowerCase() },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (host) {
      // Reactivate if previously expired from prospect deadline
      const needsReactivation = !host.active && host.suspendedReason?.includes('Expired prospect')
      const updateData: any = {}

      if (!host.recruitedVia) {
        updateData.recruitedVia = prospect.source || 'email_invite'
        updateData.recruitedAt = new Date()
      }

      if (needsReactivation) {
        updateData.active = true
        updateData.dashboardAccess = true
        updateData.suspendedAt = null
        updateData.suspendedReason = null
        console.log(`[Onboard] Reactivating expired prospect host: ${host.id}`)
      }

      if (Object.keys(updateData).length > 0) {
        host = await prisma.rentalHost.update({
          where: { id: host.id },
          data: updateData,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        })
      }

      // Link prospect to host
      await prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          convertedHostId: host.id,
          convertedAt: new Date(),
          status: 'CONVERTED'
        }
      })

      // Generate tokens and log them in
      const tokens = await generateTokensAndSession(host, request)

      const response = NextResponse.json({
        success: true,
        prospectName: prospect.name.split(' ')[0],
        isReturning: true
      })

      setAuthCookies(response, tokens)
      return response
    }

    // Create new host account
    // First, find or create a User record
    let user = await prisma.user.findUnique({
      where: { email: prospect.email.toLowerCase() }
    })

    if (!user) {
      // Create new user with a temporary password hash
      // They can set a real password later if they want
      user = await prisma.user.create({
        data: {
          id: nanoid(),
          email: prospect.email.toLowerCase(),
          name: prospect.name,
          role: 'BUSINESS',
          passwordHash: '', // No password - they use magic link
          isActive: true,
          emailVerified: false,
          updatedAt: new Date()
        }
      })
    }

    // Create the host account
    const newHost = await prisma.rentalHost.create({
      data: {
        id: nanoid(),
        userId: user.id,
        email: prospect.email.toLowerCase(),
        name: prospect.name,
        phone: prospect.phone || '',
        city: prospect.request?.pickupCity || 'Phoenix',
        state: prospect.request?.pickupState || 'AZ',
        // External recruit tracking - recruitedVia is source of truth
        recruitedVia: prospect.source || 'email_invite',
        recruitedAt: new Date(),
        // Default settings for new external hosts
        hostType: 'PENDING',
        approvalStatus: 'PENDING',
        dashboardAccess: true, // Give them dashboard access immediately
        canViewBookings: true,
        autoApproveBookings: false, // Admin reviews first
        // Recruited host flags - they haven't set a password yet
        hasPassword: false,
        isRecruitedRequest: true,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    // Link prospect to new host
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        convertedHostId: newHost.id,
        convertedAt: new Date(),
        status: 'CONVERTED'
      }
    })

    // If there's a linked request, create a claim for the new host
    if (prospect.requestId) {
      try {
        await prisma.requestClaim.create({
          data: {
            id: nanoid(),
            requestId: prospect.requestId,
            hostId: newHost.id,
            status: 'PENDING_CAR',
            offeredRate: prospect.request?.offeredRate,
            claimExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
          }
        })
      } catch (claimError) {
        console.error('[Onboard] Failed to create claim:', claimError)
        // Continue anyway - host is created
      }
    }

    // Generate tokens and log them in
    const tokens = await generateTokensAndSession(newHost, request)

    const response = NextResponse.json({
      success: true,
      prospectName: prospect.name.split(' ')[0],
      isNew: true
    })

    setAuthCookies(response, tokens)
    return response

  } catch (error: any) {
    console.error('[Onboard Validate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to validate link' },
      { status: 500 }
    )
  }
}

// Helper: Generate JWT tokens and create session
async function generateTokensAndSession(
  host: any,
  request: NextRequest
): Promise<{ accessToken: string; refreshToken: string }> {
  // jti (JWT ID) ensures every token is unique — prevents P2002 on Session.token
  const accessToken = sign(
    {
      userId: host.user?.id || host.userId,
      hostId: host.id,
      email: host.email,
      name: host.name,
      role: 'BUSINESS',
      isRentalHost: true,
      approvalStatus: host.approvalStatus,
      hostType: host.hostType,
      recruitedVia: host.recruitedVia,
      jti: nanoid()
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Longer expiry for external hosts
  )

  const refreshToken = sign(
    {
      userId: host.user?.id || host.userId,
      hostId: host.id,
      email: host.email,
      type: 'refresh',
      jti: nanoid()
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  )

  // Create session record — clean up old sessions first to avoid P2002
  if (host.user?.id) {
    try {
      // Delete stale sessions for this user (they're getting a fresh token)
      await prisma.session.deleteMany({
        where: { userId: host.user.id }
      })
      await prisma.session.create({
        data: {
          userId: host.user.id,
          token: accessToken,
          refreshToken: refreshToken,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })
      console.log(`[Onboard] Session created for user ${host.user.id}`)
    } catch (sessionError) {
      console.error('[Onboard] Session create error:', sessionError)
      // Non-blocking — JWT in cookie still works for partner APIs
    }
  }

  // Update last login
  await prisma.rentalHost.update({
    where: { id: host.id },
    data: {
      lastLoginAt: new Date(),
      previousLoginAt: host.lastLoginAt
    }
  })

  return { accessToken, refreshToken }
}

// Helper: Set auth cookies on response
function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
) {
  const isProduction = process.env.NODE_ENV === 'production'

  // Host access token - 7 days for external hosts
  response.cookies.set('hostAccessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  })

  // Refresh token - 30 days
  response.cookies.set('hostRefreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/'
  })

  // Also set accessToken for compatibility
  response.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  })

  // Clear guest cookies
  response.cookies.set('guestAccessToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
}
