// app/api/rentals/availability/route.ts
// MILITARY GRADE: Public availability endpoint — uses core engine.
// Two modes:
//   ?carId=X&startDate=Y&endDate=Z  → range check (available: true/false + blockedDates + days)
//   ?carId=X&month=2026-03          → calendar mode (all blocked dates in that month + days)

import { NextRequest, NextResponse } from 'next/server'
import { getCarAvailability } from '@/app/lib/availability/getCarAvailability'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const carId = searchParams.get('carId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const month = searchParams.get('month') // YYYY-MM format

  if (!carId) {
    return NextResponse.json({ error: 'carId is required' }, { status: 400 })
  }

  try {
    // Determine date window
    let windowStart: Date
    let windowEnd: Date

    if (month) {
      // Calendar mode: accept comma-separated months: "2026-03,2026-04,2026-05"
      const months = month.split(',').map(m => m.trim())
      const firstMonth = months[0]
      const lastMonth = months[months.length - 1]
      const [firstYear, firstMon] = firstMonth.split('-').map(Number)
      const [lastYear, lastMon] = lastMonth.split('-').map(Number)
      windowStart = new Date(firstYear, firstMon - 1, 1)
      windowEnd = new Date(lastYear, lastMon, 0) // Last day of last month
    } else if (startDate && endDate) {
      // Range check mode
      windowStart = new Date(startDate + 'T00:00:00')
      windowEnd = new Date(endDate + 'T23:59:59')
    } else {
      return NextResponse.json(
        { error: 'Provide either month=YYYY-MM or startDate+endDate' },
        { status: 400 }
      )
    }

    // ── Use the core availability engine ──
    const { days, blockedDates } = await getCarAvailability(carId, windowStart, windowEnd)

    // For range check mode, determine if the requested range is available
    if (startDate && endDate) {
      const conflictDates = days
        .filter(d => !d.available && d.date >= startDate && d.date <= endDate)
        .map(d => d.date)

      return NextResponse.json({
        available: conflictDates.length === 0,
        blockedDates,
        conflictDates,
        days, // full per-day breakdown
        carId,
      })
    }

    // Calendar mode — return blocked dates + per-day breakdown
    return NextResponse.json({
      blockedDates,
      days,
      carId,
    })
  } catch (error) {
    console.error('[Availability API] Error:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
