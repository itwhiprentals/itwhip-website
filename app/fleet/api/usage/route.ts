import { NextRequest, NextResponse } from 'next/server'
import { getCostSummary } from '@/app/lib/costTracker'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get('period') || 'month'
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break
      case 'all': startDate = new Date('2024-01-01'); break
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // month
    }

    const [costSummary, bookingCount] = await Promise.all([
      getCostSummary(startDate, now),
      prisma.rentalBooking.count({
        where: { createdAt: { gte: startDate, lte: now }, status: { in: ['CONFIRMED', 'COMPLETED', 'ACTIVE'] } },
      }),
    ])

    return NextResponse.json({
      ...costSummary,
      bookingCount,
      costPerBooking: bookingCount > 0 ? Math.round((costSummary.total / bookingCount) * 100) / 100 : 0,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load usage' }, { status: 500 })
  }
}
