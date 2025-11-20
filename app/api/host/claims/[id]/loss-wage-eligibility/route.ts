// app/api/host/claims/[id]/loss-wage-eligibility/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as required in Next.js 15
    const { id } = await params
    
    // Get claim details
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            createdAt: true,
          }
        },
        booking: {
          select: {
            dailyRate: true,
            car: {
              select: {
                id: true,
              }
            }
          }
        }
      }
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Get host's first booking date (start of 6-month window)
    const firstBooking = await prisma.rentalBooking.findFirst({
      where: {
        hostId: claim.hostId,
        status: 'COMPLETED'
      },
      orderBy: { startDate: 'asc' },
      select: { startDate: true }
    })

    if (!firstBooking) {
      return NextResponse.json({
        eligible: false,
        reason: 'No completed bookings yet',
        pathA: { qualified: false, progress: 0 },
        pathB: { qualified: false, progress: 0 },
        potentialPayout: 0,
      })
    }

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Calculate time since first booking
    const daysSinceFirstBooking = Math.floor(
      (Date.now() - new Date(firstBooking.startDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    const sixMonthsActive = daysSinceFirstBooking >= 180

    // Get completed bookings in last 6 months
    const recentBookings = await prisma.rentalBooking.findMany({
      where: {
        hostId: claim.hostId,
        status: 'COMPLETED',
        startDate: { gte: sixMonthsAgo }
      }
    })

    const tripCount = recentBookings.length

    // Count cancellations in last 6 months
    const cancellations = await prisma.rentalBooking.count({
      where: {
        hostId: claim.hostId,
        status: 'CANCELLED',
        cancelledBy: 'HOST',
        startDate: { gte: sixMonthsAgo }
      }
    })

    // Check for warnings/suspensions
    const hostProfile = await prisma.rentalHost.findUnique({
      where: { id: claim.hostId },
      select: {
        suspendedAt: true,
        // Add warning fields when available
      }
    })

    const hasWarnings = hostProfile?.suspendedAt !== null
    const cleanRecord = !hasWarnings && cancellations <= 3

    // Path A: 6 months active + 10 trips
    const pathAQualified = sixMonthsActive && tripCount >= 10 && cleanRecord

    // Path B: 50 trips within 6 months
    const pathBQualified = tripCount >= 50 && cleanRecord

    const eligible = pathAQualified || pathBQualified

    // Calculate potential payout
    const dailyRate = claim.booking.dailyRate || 0
    const potentialPayout = eligible ? Math.floor(dailyRate * 0.25 * 10) : 0

    return NextResponse.json({
      eligible,
      reason: !eligible ? getDenialReason(sixMonthsActive, tripCount, cancellations, hasWarnings) : null,
      pathA: {
        qualified: pathAQualified,
        progress: {
          timeActive: {
            current: daysSinceFirstBooking,
            required: 180,
            met: sixMonthsActive,
            percentage: Math.min(100, (daysSinceFirstBooking / 180) * 100)
          },
          trips: {
            current: tripCount,
            required: 10,
            met: tripCount >= 10,
            percentage: Math.min(100, (tripCount / 10) * 100)
          }
        }
      },
      pathB: {
        qualified: pathBQualified,
        progress: {
          trips: {
            current: tripCount,
            required: 50,
            met: tripCount >= 50,
            percentage: Math.min(100, (tripCount / 50) * 100)
          }
        }
      },
      cleanRecord: {
        met: cleanRecord,
        cancellations: {
          current: cancellations,
          allowed: 3,
          met: cancellations <= 3
        },
        warnings: {
          current: hasWarnings ? 1 : 0,
          allowed: 0,
          met: !hasWarnings
        }
      },
      potentialPayout,
      dailyRate,
      firstBookingDate: firstBooking.startDate,
      daysSinceFirstBooking,
    })

  } catch (error) {
    console.error('Error checking loss wage eligibility:', error)
    return NextResponse.json(
      { error: 'Failed to check eligibility' },
      { status: 500 }
    )
  }
}

function getDenialReason(
  sixMonthsActive: boolean,
  tripCount: number,
  cancellations: number,
  hasWarnings: boolean
): string {
  if (hasWarnings) return 'Account has active warnings or suspensions'
  if (cancellations > 3) return `Too many cancellations (${cancellations}/3 allowed)`
  if (!sixMonthsActive && tripCount < 10) return 'Need 6 months active with 10+ trips OR 50 trips total'
  if (sixMonthsActive && tripCount < 10) return `Need ${10 - tripCount} more trips to qualify via Path A`
  if (tripCount < 50) return `Need ${50 - tripCount} more trips to qualify via Path B`
  return 'Not qualified'
}