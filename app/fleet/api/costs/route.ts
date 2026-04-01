import { NextRequest, NextResponse } from 'next/server'
import { getCostSummary } from '@/app/lib/costTracker'

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get('period') || 'week'
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break
      case 'month': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break
      default: startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // week
    }

    const summary = await getCostSummary(startDate, now)
    return NextResponse.json(summary)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load costs' }, { status: 500 })
  }
}
