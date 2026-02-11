// app/api/auth/invite/[token]/route.ts
// Magic link handler for host prospect invitations

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import { sign } from 'jsonwebtoken'
import {
  generateHostAccessToken,
  getTokenExpiry,
  logProspectActivity,
  ACTIVITY_TYPES
} from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET!

// Get client IP from request headers
function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || undefined
}

// GET /api/auth/invite/[token] - Validate invite and redirect
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    // Use request origin for local dev, otherwise use configured URL
    const requestOrigin = request.headers.get('origin') || request.nextUrl.origin
    const isLocalhost = requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1')
    const baseUrl = isLocalhost ? requestOrigin : (process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com')

    // Find the prospect with this token
    const prospect = await prisma.hostProspect.findUnique({
      where: { inviteToken: token },
      include: {
        request: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    if (!prospect) {
      // Invalid token - redirect to error page
      return NextResponse.redirect(`${baseUrl}/invite/invalid`)
    }

    // Check if token is expired
    if (prospect.inviteTokenExp && new Date() > prospect.inviteTokenExp) {
      return NextResponse.redirect(`${baseUrl}/invite/expired?email=${encodeURIComponent(prospect.email)}`)
    }

    // Get client IP for tracking
    const clientIp = getClientIp(request)

    // Mark link as clicked and increment click count
    const isFirstClick = !prospect.linkClickedAt
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        linkClickedAt: isFirstClick ? new Date() : prospect.linkClickedAt,
        linkClickCount: { increment: 1 },
        lastActivityAt: new Date(),
        status: prospect.status === 'EMAIL_SENT' || prospect.status === 'EMAIL_OPENED'
          ? 'LINK_CLICKED'
          : prospect.status
      }
    })

    // Log activity
    await logProspectActivity(prospect.id, ACTIVITY_TYPES.LINK_CLICKED, {
      ip: clientIp,
      userAgent: request.headers.get('user-agent'),
      isFirstClick,
      referrer: request.headers.get('referer')
    })

    // Check if this email already has a host account
    let host = await prisma.rentalHost.findFirst({
      where: { email: prospect.email.toLowerCase() }
    })

    if (host) {
      // Existing host - link the prospect
      // If they already have an account, just link the prospect to track conversion
      if (!host.linkedProspectId) {
        await prisma.rentalHost.update({
          where: { id: host.id },
          data: {
            linkedProspectId: prospect.id,
            hostTokenLastUsedAt: new Date(),
            hostTokenUsedFromIp: clientIp || null
          }
        })
      }

      await prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          convertedHostId: host.id,
          convertedAt: new Date(),
          status: 'CONVERTED'
        }
      })
    } else {
      // Create a new host account from prospect data
      // This is a RECRUITED HOST - they came from a recruitment email
      const hostId = nanoid()

      // Generate host access token for passwordless access
      const hostAccessToken = generateHostAccessToken()
      const hostAccessTokenExp = getTokenExpiry(7) // 7 days

      host = await prisma.rentalHost.create({
        data: {
          id: hostId,
          updatedAt: new Date(),
          email: prospect.email.toLowerCase(),
          name: prospect.name,
          phone: prospect.phone || '',
          city: 'Phoenix', // Default, they can update later
          state: 'AZ',
          hostType: 'PENDING',
          approvalStatus: 'PENDING',
          // Mark as needing to complete profile
          documentsVerified: false,
          isVerified: false,
          // ═══════════════════════════════════════════════════════════════
          // RECRUITED HOST - Source of truth is recruitedVia field
          // ═══════════════════════════════════════════════════════════════
          recruitedVia: prospect.source || 'email_invite',
          recruitedAt: new Date(),
          hasPassword: false, // No password yet - using token-based access
          linkedProspectId: prospect.id,
          // Token-based access for passwordless login
          hostAccessToken,
          hostAccessTokenExp,
          hostTokenLastUsedAt: new Date(),
          hostTokenUsedFromIp: clientIp || null
        }
      })

      // Link prospect to new host
      await prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          convertedHostId: host.id,
          convertedAt: new Date(),
          status: 'CONVERTED'
        }
      })
    }

    // Generate auth token for the host
    // Include userId if the host has a linked User record (for dual-role check)
    const tokenPayload: Record<string, string> = {
      hostId: host.id,
      email: host.email,
      name: host.name || '',
      type: 'host'
    }
    // Add userId if host has a linked User (important for dual-role check)
    if (host.userId) {
      tokenPayload.userId = host.userId
    }
    const authToken = sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' })

    // Log dashboard view activity
    await logProspectActivity(prospect.id, ACTIVITY_TYPES.DASHBOARD_VIEWED, {
      ip: clientIp,
      userAgent: request.headers.get('user-agent'),
      hostId: host.id,
      isRecruitedHost: !!host.recruitedVia
    })

    // Update prospect with dashboard viewed timestamp
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        dashboardViewedAt: new Date(),
        lastActivityAt: new Date()
      }
    })

    // ALWAYS redirect to dashboard first (per the plan)
    // The dashboard shows the Request Card for recruited hosts
    // This makes it feel like they're "seeing their dashboard" not "signing up"
    const redirectUrl = `${baseUrl}/partner/dashboard`

    // Create redirect response and set cookie on it directly
    // IMPORTANT: We must set the cookie on the response, not via cookies() helper,
    // because cookies() sets on the incoming request context which doesn't propagate to redirects
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('partner_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response

  } catch (error: any) {
    console.error('[Invite Auth] Error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
    return NextResponse.redirect(`${baseUrl}/invite/error`)
  }
}
