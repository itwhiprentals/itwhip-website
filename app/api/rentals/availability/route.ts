// app/api/rentals/availability/route.ts
// Public endpoint — returns blocked/booked dates for a car
// Two modes:
//   ?carId=X&startDate=Y&endDate=Z  → range check (available: true/false + blockedDates)
//   ?carId=X&month=2026-03          → calendar mode (all blocked dates in that month)

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { format, addDays } from 'date-fns'

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
      // Calendar mode: return all blocked dates for the given month(s)
      // Accept comma-separated months: "2026-03,2026-04,2026-05"
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

    // Fetch active bookings that overlap the window
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId,
        status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
        startDate: { lte: windowEnd },
        endDate: { gte: windowStart },
      },
      select: {
        startDate: true,
        endDate: true,
      },
      orderBy: { startDate: 'asc' },
    })

    // Fetch host-blocked dates in the window
    const hostBlocked = await prisma.rentalAvailability.findMany({
      where: {
        carId,
        isAvailable: false,
        date: { gte: windowStart, lte: windowEnd },
      },
      select: { date: true },
      orderBy: { date: 'asc' },
    })

    // Build set of all blocked YYYY-MM-DD strings
    const blockedSet = new Set<string>()

    // Expand booking ranges into individual dates
    for (const booking of bookings) {
      let current = new Date(booking.startDate)
      const end = new Date(booking.endDate)
      while (current <= end) {
        blockedSet.add(format(current, 'yyyy-MM-dd'))
        current = addDays(current, 1)
      }
    }

    // Add host-blocked dates
    for (const blocked of hostBlocked) {
      blockedSet.add(format(new Date(blocked.date), 'yyyy-MM-dd'))
    }

    const blockedDates = Array.from(blockedSet).sort()

    // For range check mode, determine if the requested range is available
    if (startDate && endDate) {
      let current = new Date(startDate + 'T00:00:00')
      const end = new Date(endDate + 'T00:00:00')
      const conflictDates: string[] = []

      while (current <= end) {
        const dateStr = format(current, 'yyyy-MM-dd')
        if (blockedSet.has(dateStr)) {
          conflictDates.push(dateStr)
        }
        current = addDays(current, 1)
      }

      return NextResponse.json({
        available: conflictDates.length === 0,
        blockedDates,
        conflictDates,
        carId,
      })
    }

    // Calendar mode — just return blocked dates
    return NextResponse.json({
      blockedDates,
      carId,
    })
  } catch (error) {
    console.error('[Availability API] Error:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
