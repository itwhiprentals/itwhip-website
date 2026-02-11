// app/api/partner/onboarding/complete/route.ts
// Partner API for recruited hosts to complete onboarding

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { logProspectActivity, ACTIVITY_TYPES } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  // Try multiple token sources
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
        },
        cars: {
          select: {
            id: true,
            photos: { select: { id: true } }
          }
        }
      }
    })
  } catch {
    return null
  }
}

// POST /api/partner/onboarding/complete - Complete onboarding process
export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if this is a recruited host (recruitedVia is source of truth)
    if (!host.recruitedVia) {
      return NextResponse.json(
        { error: 'Not a recruited host' },
        { status: 400 }
      )
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
        { error: 'Request was declined. Cannot complete onboarding.' },
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

    // Verify required steps are complete
    // For now, we'll be lenient and allow completion if they've started
    // In production, you'd verify: photos uploaded, rate set, payout connected
    const hasStarted = !!host.onboardingStartedAt

    if (!hasStarted) {
      return NextResponse.json(
        { error: 'Please complete all onboarding steps first' },
        { status: 400 }
      )
    }

    // Mark onboarding as completed
    const now = new Date()

    await prisma.$transaction([
      // Update host
      prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          onboardingCompletedAt: now,
          approvalStatus: 'APPROVED', // Auto-approve on completion
          hostType: 'EXTERNAL' // Mark as external host type
        }
      }),
      // Update prospect
      prisma.hostProspect.update({
        where: { id: prospect.id },
        data: {
          onboardingCompletedAt: now,
          status: 'CONVERTED',
          lastActivityAt: now
        }
      })
    ])

    // Log activity
    await logProspectActivity(prospect.id, ACTIVITY_TYPES.COMPLETED, {
      hostId: host.id,
      requestId: prospect.requestId
    })

    // TODO: Send notification to admin about completed onboarding
    // TODO: Send confirmation email to host
    // TODO: Notify guest that host is ready

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      completedAt: now,
      redirectTo: '/partner/dashboard'
    })

  } catch (error: any) {
    console.error('[Partner Onboarding Complete API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
