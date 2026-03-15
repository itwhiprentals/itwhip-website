// app/lib/bookings/auto-complete.ts
// Checks for expired bookings that should be marked as no-show
// Called inline from user-bookings API and from cron job

import { prisma } from '@/app/lib/database/prisma'

// Arizona is UTC-7 (no DST)
const ARIZONA_UTC_OFFSET = 7

interface BookingRow {
  id: string
  status: string
  bookingType?: string | null
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
    // Skip non-CONFIRMED, already-started trips, and MANUAL bookings (host manages those)
    if (booking.status !== 'CONFIRMED' || booking.tripStartedAt || booking.bookingType === 'MANUAL') continue

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

/**
 * Inline expiration for all overdue bookings (endDate passed).
 * Handles: PENDING → CANCELLED, ON_HOLD → NO_SHOW, CONFIRMED → NO_SHOW, ACTIVE → COMPLETED.
 * Mutates booking objects in-place so the response reflects correct status.
 * Called from dashboard/initial-data and user-bookings APIs.
 */
export async function expireOverdueBookings(bookings: Array<{ id: string; status: string; endDate: Date | string; startDate: Date | string; startTime?: string | null; tripStartedAt?: Date | null; bookingType?: string | null; paymentType?: string | null; noShowDeadline?: Date | null }>): Promise<string[]> {
  const now = new Date()
  const toCancelIds: string[] = []
  const toNoShowIds: string[] = []
  const toCompleteIds: string[] = []

  for (const booking of bookings) {
    const endDate = new Date(booking.endDate)
    if (endDate >= now) continue // not overdue
    if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(booking.status)) continue // already terminal

    switch (booking.status) {
      case 'PENDING':
        toCancelIds.push(booking.id)
        booking.status = 'CANCELLED'
        break
      case 'ON_HOLD':
        toNoShowIds.push(booking.id)
        booking.status = 'NO_SHOW'
        break
      case 'CONFIRMED':
        // If trip never started, it's a no-show
        if (!booking.tripStartedAt) {
          toNoShowIds.push(booking.id)
          booking.status = 'NO_SHOW'
        } else {
          toCompleteIds.push(booking.id)
          booking.status = 'COMPLETED'
        }
        break
      case 'ACTIVE':
        toCompleteIds.push(booking.id)
        booking.status = 'COMPLETED'
        break
    }
  }

  const allIds = [...toCancelIds, ...toNoShowIds, ...toCompleteIds]
  if (allIds.length === 0) return []

  console.log(`[Auto-expire] Expiring ${allIds.length} overdue booking(s):`, {
    cancelled: toCancelIds.length,
    noShow: toNoShowIds.length,
    completed: toCompleteIds.length,
  })

  try {
    const updates: Promise<unknown>[] = []

    if (toCancelIds.length > 0) {
      updates.push(prisma.rentalBooking.updateMany({
        where: { id: { in: toCancelIds } },
        data: {
          status: 'CANCELLED',
          cancelledBy: 'SYSTEM',
          cancelledAt: now,
          cancellationReason: 'Trip period passed without approval. Auto-cancelled by system.',
        },
      }))
    }

    if (toNoShowIds.length > 0) {
      updates.push(prisma.rentalBooking.updateMany({
        where: { id: { in: toNoShowIds } },
        data: {
          status: 'NO_SHOW',
          noShowMarkedBy: 'SYSTEM',
          noShowMarkedAt: now,
        },
      }))
    }

    if (toCompleteIds.length > 0) {
      updates.push(prisma.rentalBooking.updateMany({
        where: { id: { in: toCompleteIds } },
        data: {
          status: 'COMPLETED',
          tripStatus: 'COMPLETED',
        },
      }))
    }

    await Promise.all(updates)
  } catch (err) {
    console.error('[Auto-expire] Database update error:', err)
  }

  return allIds
}
