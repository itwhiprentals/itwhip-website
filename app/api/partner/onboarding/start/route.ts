// app/api/partner/onboarding/start/route.ts
// Partner API for recruited hosts to start onboarding

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { logProspectActivity, ACTIVITY_TYPES } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  // Check multiple token sources
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string; userId?: string }
    const hostId = decoded.hostId

    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        convertedFromProspect: {
          include: {
            request: true
          }
        }
      }
    })
  } catch {
    return null
  }
}

// POST /api/partner/onboarding/start - Start onboarding process
export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if this is a recruited host
    if (!host.isExternalRecruit) {
      return NextResponse.json(
        { error: 'Not a recruited host' },
        { status: 400 }
      )
    }

    // Check if already started
    if (host.onboardingStartedAt) {
      return NextResponse.json({
        success: true,
        message: 'Onboarding already started',
        startedAt: host.onboardingStartedAt
      })
    }

    // Check if already completed
    if (host.onboardingCompletedAt) {
      return NextResponse.json({
        success: true,
        message: 'Onboarding already completed',
        completedAt: host.onboardingCompletedAt
      })
    }

    // Check if declined
    if (host.declinedRequestAt) {
      return NextResponse.json(
        { error: 'Request was declined. Contact support to re-open.' },
        { status: 400 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json(
        { error: 'No linked prospect found' },
        { status: 404 }
      )
    }

    // Check request expiry
    const fleetRequest = prospect.request
    if (fleetRequest?.expiresAt && new Date() > fleetRequest.expiresAt) {
      return NextResponse.json(
        { error: 'This request has expired' },
        { status: 400 }
      )
    }

    // Mark onboarding as started
    const now = new Date()

    await prisma.$transaction([
      // Update host
      prisma.rentalHost.update({
        where: { id: host.id },
        data: { onboardingStartedAt: now }
      }),
      // Update prospect - CLAIMED_REQUEST indicates they've started working on it
      prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          onboardingStartedAt: now,
          status: 'CLAIMED_REQUEST',
          lastActivityAt: now
        }
      })
    ])

    // Log activity
    await logProspectActivity(prospect.id, ACTIVITY_TYPES.ONBOARDING_STARTED, {
      hostId: host.id,
      requestId: fleetRequest?.id
    })

    return NextResponse.json({
      success: true,
      message: 'Onboarding started',
      startedAt: now,
      nextStep: 'photos' // First step is to upload photos
    })

  } catch (error: any) {
    console.error('[Partner Onboarding Start API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to start onboarding' },
      { status: 500 }
    )
  }
}
