// app/api/tracking/pixel/[prospectId]/route.ts
// Tracking pixel for email open tracking

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { logProspectActivity, ACTIVITY_TYPES } from '@/app/lib/auth/host-tokens'

// 1x1 transparent GIF
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

// Get client IP from request headers
function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || undefined
}

// GET /api/tracking/pixel/[prospectId] - Track email open
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ prospectId: string }> }
) {
  try {
    const { prospectId } = await params

    // Validate prospect ID format
    if (!prospectId || prospectId.length < 10) {
      return new NextResponse(TRANSPARENT_GIF, {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    // Get client info
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent')

    // Check if prospect exists
    const prospect = await prisma.hostProspect.findUnique({
      where: { id: prospectId },
      select: {
        id: true,
        emailOpenedAt: true,
        emailOpenCount: true
      }
    })

    if (prospect) {
      // Update email open tracking
      const isFirstOpen = !prospect.emailOpenedAt

      await prisma.hostProspect.update({
        where: { id: prospectId },
        data: {
          emailOpenedAt: isFirstOpen ? new Date() : prospect.emailOpenedAt,
          emailOpenCount: { increment: 1 },
          lastActivityAt: new Date(),
          // Update status if appropriate
          status: prospect.emailOpenedAt === null ? 'EMAIL_OPENED' : undefined
        }
      })

      // Log activity
      await logProspectActivity(prospectId, ACTIVITY_TYPES.EMAIL_OPENED, {
        ip: clientIp,
        userAgent,
        isFirstOpen,
        openCount: (prospect.emailOpenCount || 0) + 1
      })
    }

  } catch (error) {
    // Silently fail - don't block email display
    console.error('[Tracking Pixel] Error:', error)
  }

  // Always return the transparent GIF
  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}
