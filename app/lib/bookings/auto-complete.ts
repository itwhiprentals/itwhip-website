// app/lib/bookings/auto-complete.ts
// Checks for expired bookings that should be marked as no-show
// Called inline from user-bookings API and from cron job

import { prisma } from '@/app/lib/database/prisma'

// Arizona is UTC-7 (no DST)
const ARIZONA_UTC_OFFSET = 7

interface BookingRow {
  id: string
  status: string
  tripStartedAt: Date | null
  startDate: Date | string
  endDate: Date | string
  startTime: string | null
  endTime: string | null
  paymentType: string | null
  noShowDeadline: Date | null
}

/**
 * Calculate the no-show deadline for a booking.
 * Card bookings: pickup time + 24 hours
 * Cash bookings: pickup time + 12 hours
 */
export function calculateNoShowDeadline(
  startDate: Date | string,
  startTime: string | null,
  paymentType: string | null
): Date {
  const date = new Date(startDate)
  const [h, m] = (startTime || '10:00').split(':').map(Number)
  // Convert Arizona local time to UTC
  date.setUTCHours((h || 10) + ARIZONA_UTC_OFFSET, m || 0, 0, 0)

  const graceHours = paymentType === 'CASH' ? 12 : 24
  date.setUTCHours(date.getUTCHours() + graceHours)

  return date
}

/**
 * Check bookings for no-show conditions and mark them.
 * Returns array of booking IDs that were marked as no-show.
 * Mutates the booking objects in-place (sets status/tripStatus/tripEndedAt).
 */
export async function checkAndMarkNoShows(bookings: BookingRow[]): Promise<string[]> {
  const now = new Date()
  const noShowIds: string[] = []

  for (const booking of bookings) {
    if (booking.status !== 'CONFIRMED' || booking.tripStartedAt) continue

    // Use pre-calculated deadline if available, otherwise calculate from dates
    let deadline: Date
    if (booking.noShowDeadline) {
      deadline = new Date(booking.noShowDeadline)
    } else {
      // Fallback: use endDate + endTime (legacy behavior)
      const endDate = new Date(booking.endDate)
      const [endH, endM] = (booking.endTime || '10:00').split(':').map(Number)
      endDate.setUTCHours((endH || 10) + ARIZONA_UTC_OFFSET, endM || 0, 0, 0)
      deadline = endDate
    }

    if (now.getTime() > deadline.getTime()) {
      noShowIds.push(booking.id)
      // Mutate in-place for the response
      booking.status = 'NO_SHOW'
    }
  }

  if (noShowIds.length > 0) {
    console.log(`[Auto-complete] Marking ${noShowIds.length} expired booking(s) as NO_SHOW:`, noShowIds)
    try {
      await prisma.rentalBooking.updateMany({
        where: { id: { in: noShowIds } },
        data: {
          status: 'NO_SHOW',
          noShowMarkedBy: 'SYSTEM',
          noShowMarkedAt: now,
        }
      })
    } catch (err) {
      console.error('[Auto-complete] No-show update error:', err)
    }
  }

  return noShowIds
}
