// app/api/partner/payouts/route.ts
// Partner Payout History API - Full payout history with pagination

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // all, pending, processing, completed, failed
    const year = searchParams.get('year')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      hostId: partner.id
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (year) {
      where.period = { startsWith: year }
    }

    // Get total count
    const totalCount = await prisma.partner_payouts.count({ where })

    // Get payouts
    const payouts = await prisma.partner_payouts.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Format payouts
    const formattedPayouts = payouts.map(p => ({
      id: p.id,
      period: p.period,
      periodLabel: formatPeriodLabel(p.period),
      bookingCount: p.bookingCount,
      grossRevenue: p.grossRevenue,
      commission: p.commission,
      netAmount: p.netAmount,
      status: p.status.toLowerCase(),
      stripePayoutId: p.stripePayoutId,
      paidAt: p.paidAt?.toISOString() || null,
      createdAt: p.createdAt.toISOString(),
      failureReason: p.failureReason
    }))

    // Calculate summary stats
    const allPayouts = await prisma.partner_payouts.findMany({
      where: { hostId: partner.id }
    })

    const stats = {
      totalPaid: allPayouts
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.netAmount, 0),
      pendingAmount: allPayouts
        .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
        .reduce((sum, p) => sum + p.netAmount, 0),
      totalPayouts: allPayouts.length,
      completedPayouts: allPayouts.filter(p => p.status === 'COMPLETED').length
    }

    // Get available years for filtering
    const years = [...new Set(allPayouts.map(p => p.period.split('-')[0]))].sort((a, b) => b.localeCompare(a))

    return NextResponse.json({
      success: true,
      payouts: formattedPayouts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats,
      filters: {
        years
      }
    })

  } catch (error) {
    console.error('[Partner Payouts] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
  }
}

function formatPeriodLabel(period: string): string {
  // Handle monthly format: "2025-01"
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }

  // Handle weekly format: "2025-W03"
  if (/^\d{4}-W\d{2}$/.test(period)) {
    const [year, week] = period.split('-W')
    return `Week ${parseInt(week)}, ${year}`
  }

  return period
}
