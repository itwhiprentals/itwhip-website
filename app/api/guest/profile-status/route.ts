// app/api/guest/profile-status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { formatStatusForDisplay } from '@/lib/helpers/guestProfileStatus'

/**
 * GET /api/guest/profile-status
 * 
 * Fetch formatted profile status for authenticated guest
 * Returns dashboard-ready data for StatusTab component
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Get user's ReviewerProfile ID
    const { prisma } = await import('@/app/lib/database/prisma')
    
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviewerProfile: {
          select: {
            id: true
          }
        }
      }
    })

    if (!userRecord || !userRecord.reviewerProfile) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    const guestId = userRecord.reviewerProfile.id

    // Fetch formatted status using helper function
    const formattedStatus = await formatStatusForDisplay(guestId)

    if (!formattedStatus) {
      return NextResponse.json(
        { error: 'Status data not available' },
        { status: 404 }
      )
    }

    return NextResponse.json(formattedStatus)

  } catch (error) {
    console.error('Failed to fetch guest profile status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile status' },
      { status: 500 }
    )
  }
}