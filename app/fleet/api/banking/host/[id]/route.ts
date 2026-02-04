// app/fleet/api/banking/host/[id]/route.ts
// Returns detailed host information including Stripe account info

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: hostId } = await params

    // Fetch host with all financial data
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        totalPayoutsAmount: true,
        totalTrips: true,
        rating: true,
        commissionRate: true,
        currentBalance: true,
        pendingBalance: true,
        holdBalance: true,
        negativeBalance: true,
        stripeAccountId: true,
        stripeAccountStatus: true,
        instantPayoutEnabled: true,
        payoutSchedule: true,
        _count: {
          select: { cars: true }
        }
      }
    })

    if (!host) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    }

    // Get last payout date
    const lastPayout = await prisma.rentalPayout.findFirst({
      where: {
        hostId,
        status: { in: ['COMPLETED', 'PAID'] }
      },
      orderBy: { processedAt: 'desc' },
      select: { processedAt: true }
    })

    // Determine tier from commission rate
    const commissionRate = host.commissionRate || 0.25
    let tier: 'Standard' | 'Gold' | 'Platinum' | 'Diamond' = 'Standard'
    if (commissionRate <= 0.10) tier = 'Diamond'
    else if (commissionRate <= 0.15) tier = 'Platinum'
    else if (commissionRate <= 0.20) tier = 'Gold'

    // Format response
    const hostData = {
      id: host.id,
      name: host.name,
      email: host.email,
      phone: host.phone || undefined,
      totalPayouts: Number(host.totalPayoutsAmount) || 0,
      tripCount: host.totalTrips || 0,
      rating: Number(host.rating) || 0,
      tier,
      fleetSize: host._count.cars,
      stripeAccountId: host.stripeAccountId || null,
      stripeAccountStatus: (host.stripeAccountStatus as any) || 'NOT_CONNECTED',
      instantPayoutEnabled: host.instantPayoutEnabled || false,
      payoutSchedule: host.payoutSchedule || 'STANDARD',
      lastPayoutDate: lastPayout?.processedAt?.toISOString() || null,
      currentBalance: Number(host.currentBalance) || 0,
      pendingBalance: Number(host.pendingBalance) || 0,
      holdBalance: Number(host.holdBalance) || 0,
      negativeBalance: Number(host.negativeBalance) || 0
    }

    return NextResponse.json({
      success: true,
      host: hostData
    })

  } catch (error: any) {
    console.error('Error fetching host details:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch host details' },
      { status: 500 }
    )
  }
}
