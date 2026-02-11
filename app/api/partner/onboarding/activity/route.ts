// app/api/partner/onboarding/activity/route.ts
// Partner API for tracking recruited host activity (page views, time on page)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { logProspectActivity } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId: string }
    return await prisma.rentalHost.findUnique({
      where: { id: decoded.hostId },
      select: {
        id: true,
        isRecruitedRequest: true,
        linkedProspectId: true
      }
    })
  } catch {
    return null
  }
}

// Get client IP from request headers
function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || undefined
}

// POST /api/partner/onboarding/activity - Track activity (heartbeat)
export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only track for recruited hosts (recruitedVia is source of truth)
    if (!(host as any).recruitedVia || !host.linkedProspectId) {
      return NextResponse.json({ success: true })
    }

    // Get activity data from body
    const body = await request.json()
    const { activityType, page, duration, metadata } = body

    // Validate activity type
    const validTypes = [
      'HEARTBEAT',
      'PAGE_VIEW',
      'SCROLL',
      'FORM_INTERACTION',
      'BUTTON_CLICK'
    ]

    if (!activityType || !validTypes.includes(activityType)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      )
    }

    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent')

    // Update prospect with activity
    const updateData: any = {
      lastActivityAt: new Date()
    }

    // If duration provided (heartbeat), update page view duration
    if (typeof duration === 'number' && duration > 0) {
      updateData.pageViewDuration = duration
    }

    await prisma.hostProspect.update({
      where: { id: host.linkedProspectId },
      data: updateData
    })

    // Log the activity
    await logProspectActivity(host.linkedProspectId, activityType, {
      hostId: host.id,
      page,
      duration,
      ip: clientIp,
      userAgent,
      ...metadata
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    // Don't log errors for activity tracking - it's not critical
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
