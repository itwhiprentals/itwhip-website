// app/lib/availability/getCarAvailability.ts
// MILITARY GRADE: Core availability engine.
// Returns per-day availability with reasons, buffer awareness, and time-level precision.
// Used by: availability API, canBookCar(), BookingWidget, mobile app.

import { prisma } from '@/app/lib/database/prisma'
import { BOOKING_RULES } from '@/app/lib/booking/booking-time-rules'
import { format, addDays as dfAddDays, differenceInHours, differenceInMinutes, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns'

// =============================================================================
// TYPES
// =============================================================================

export interface DayAvailability {
  date: string                    // YYYY-MM-DD
  available: boolean              // can this day be a pickup day?
  reason?: string                 // why unavailable
  earliestPickupTime?: string     // HH:MM if available (after buffer/advance notice)
  bookingId?: string              // which booking blocks this day
  returnExpected?: boolean        // is a car returning this day?
  returnCompleted?: boolean       // has the return been confirmed?
  bufferEndsAt?: string           // ISO datetime when buffer expires
}

interface BookingRecord {
  id: string
  status: string
  startDate: Date
  endDate: Date
  startTime: string | null
  endTime: string | null
  actualEndTime: Date | null
  markedReadyAt: Date | null
}

interface HostBlockedDate {
  date: Date
}

// =============================================================================
// CORE FUNCTION
// =============================================================================

export async function getCarAvailability(
  carId: string,
  windowStart: Date,
  windowEnd: Date,
): Promise<{ days: DayAvailability[]; blockedDates: string[] }> {

  // ── Fetch car config ──
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: {
      id: true,
      advanceNotice: true,
      tripBuffer: true,
      allow24HourPickup: true,
      isActive: true,
    },
  })

  if (!car) {
    return { days: [], blockedDates: [] }
  }

  const advanceNotice = Math.max(BOOKING_RULES.platformMinAdvanceNotice, car.advanceNotice ?? BOOKING_RULES.defaultAdvanceNotice)
  const tripBuffer = Math.max(BOOKING_RULES.platformMinTripBuffer, car.tripBuffer ?? BOOKING_RULES.defaultTripBuffer)

  // ── Fetch ALL relevant bookings ──
  // Include COMPLETED (for buffer calc) — look back 72hrs before windowStart
  const bufferLookback = dfAddDays(windowStart, -3)

  const bookings: BookingRecord[] = await prisma.rentalBooking.findMany({
    where: {
      carId,
      status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED'] },
      // Booking overlaps the extended window (including lookback for completed)
      startDate: { lte: windowEnd },
      endDate: { gte: bufferLookback },
    },
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      actualEndTime: true,
      markedReadyAt: true,
    },
    orderBy: { startDate: 'asc' },
  })

  // ── Fetch host-blocked dates ──
  const hostBlocked: HostBlockedDate[] = await prisma.rentalAvailability.findMany({
    where: {
      carId,
      isAvailable: false,
      date: { gte: windowStart, lte: windowEnd },
    },
    select: { date: true },
    orderBy: { date: 'asc' },
  })

  const hostBlockedSet = new Set(hostBlocked.map(h => format(new Date(h.date), 'yyyy-MM-dd')))

  // ── Arizona "now" ──
  const nowAZ = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' }))

  // ── Build per-day availability ──
  const days: DayAvailability[] = []
  const blockedDates: string[] = []

  let currentDate = startOfDay(windowStart)
  while (currentDate <= windowEnd) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const day = evaluateDay(dateStr, currentDate, bookings, hostBlockedSet, nowAZ, advanceNotice, tripBuffer, car.allow24HourPickup ?? false)

    days.push(day)
    if (!day.available) {
      blockedDates.push(dateStr)
    }

    currentDate = dfAddDays(currentDate, 1)
  }

  console.log(`[AVAILABILITY] carId=${carId} window=${format(windowStart, 'yyyy-MM-dd')}→${format(windowEnd, 'yyyy-MM-dd')} blocked=${blockedDates.length}/${days.length}`)

  return { days, blockedDates }
}

// =============================================================================
// PER-DAY EVALUATION — THE GOLDEN RULE
// =============================================================================

function evaluateDay(
  dateStr: string,
  date: Date,
  bookings: BookingRecord[],
  hostBlockedSet: Set<string>,
  now: Date,
  advanceNotice: number,
  tripBuffer: number,
  allow24Hr: boolean,
): DayAvailability {

  // ── Check 1: Host blocked this day on their calendar ──
  if (hostBlockedSet.has(dateStr)) {
    return { date: dateStr, available: false, reason: 'Host blocked this date' }
  }

  // ── Check 2: Date is in the past ──
  if (isBefore(date, startOfDay(now)) && !isSameDay(date, now)) {
    return { date: dateStr, available: false, reason: 'Date is in the past' }
  }

  // ── Check 3: Active/Confirmed/Pending bookings that span this day ──
  for (const b of bookings) {
    if (['CANCELLED'].includes(b.status)) continue

    const bStart = startOfDay(new Date(b.startDate))
    const bEnd = startOfDay(new Date(b.endDate))

    if (b.status === 'COMPLETED') {
      // COMPLETED: only matters for buffer on return day
      continue // handled in Check 4
    }

    // PENDING, CONFIRMED, ACTIVE — does this booking span this day?
    if (date >= bStart && date <= bEnd) {
      // Special case: return day of an ACTIVE booking
      if (isSameDay(date, bEnd) && b.status === 'ACTIVE') {
        return {
          date: dateStr,
          available: false,
          reason: 'Car is currently on a trip. Available after return.',
          bookingId: b.id,
          returnExpected: true,
          returnCompleted: false,
        }
      }

      // Return day of CONFIRMED/PENDING — still reserved
      if (isSameDay(date, bEnd) && (b.status === 'CONFIRMED' || b.status === 'PENDING')) {
        return {
          date: dateStr,
          available: false,
          reason: 'Reserved for existing booking',
          bookingId: b.id,
          returnExpected: true,
          returnCompleted: false,
        }
      }

      // Mid-trip day
      return {
        date: dateStr,
        available: false,
        reason: b.status === 'ACTIVE' ? 'Car is on an active trip' : 'Reserved for existing booking',
        bookingId: b.id,
      }
    }
  }

  // ── Check 4: COMPLETED bookings — buffer check ──
  // If a booking returned today or recently, check if buffer has passed
  for (const b of bookings) {
    if (b.status !== 'COMPLETED') continue

    const returnDay = startOfDay(new Date(b.endDate))
    if (!isSameDay(date, returnDay)) continue

    // Car was returned on this day — when exactly?
    const actualReturn = b.actualEndTime
      ? new Date(b.actualEndTime)
      : b.markedReadyAt
        ? new Date(b.markedReadyAt)
        : null

    if (!actualReturn) {
      // COMPLETED but no actual return time recorded — use scheduled end
      const scheduledEnd = new Date(b.endDate)
      if (b.endTime) {
        const [h, m] = b.endTime.split(':').map(Number)
        scheduledEnd.setHours(h, m, 0, 0)
      }
      const bufferEnd = new Date(scheduledEnd.getTime() + tripBuffer * 60 * 60 * 1000)
      const bufferEndStr = bufferEnd.toISOString()

      if (isBefore(now, bufferEnd)) {
        // Buffer hasn't passed yet
        const minsLeft = differenceInMinutes(bufferEnd, now)
        return {
          date: dateStr,
          available: false,
          reason: `Post-return buffer: available in ${Math.ceil(minsLeft / 60)}hr ${minsLeft % 60}min`,
          bookingId: b.id,
          returnExpected: true,
          returnCompleted: true,
          bufferEndsAt: bufferEndStr,
        }
      }

      // Buffer passed — calculate earliest pickup time
      const bufferEndMinutes = bufferEnd.getHours() * 60 + bufferEnd.getMinutes()
      const advanceEndMinutes = now.getHours() * 60 + now.getMinutes() + advanceNotice * 60
      const earliestMinutes = Math.max(bufferEndMinutes, advanceEndMinutes)
      const rounded = Math.ceil(earliestMinutes / BOOKING_RULES.slotInterval) * BOOKING_RULES.slotInterval

      // Check if fits in operating hours
      if (!allow24Hr && rounded >= BOOKING_RULES.eveningCutoffHour * 60) {
        return { date: dateStr, available: false, reason: 'Available tomorrow (past evening cutoff after buffer)', bufferEndsAt: bufferEndStr }
      }

      const hh = String(Math.floor(rounded / 60)).padStart(2, '0')
      const mm = String(rounded % 60).padStart(2, '0')
      return {
        date: dateStr,
        available: true,
        earliestPickupTime: `${hh}:${mm}`,
        returnCompleted: true,
        bufferEndsAt: bufferEndStr,
      }
    }

    // Actual return time known
    const bufferEnd = new Date(actualReturn.getTime() + tripBuffer * 60 * 60 * 1000)
    const bufferEndStr = bufferEnd.toISOString()

    if (isBefore(now, bufferEnd)) {
      const minsLeft = differenceInMinutes(bufferEnd, now)
      return {
        date: dateStr,
        available: false,
        reason: `Post-return buffer: available in ${Math.ceil(minsLeft / 60)}hr ${minsLeft % 60}min`,
        bookingId: b.id,
        returnExpected: true,
        returnCompleted: true,
        bufferEndsAt: bufferEndStr,
      }
    }

    // Buffer passed
    const bufferEndMinutes = bufferEnd.getHours() * 60 + bufferEnd.getMinutes()
    const advanceEndMinutes = isSameDay(now, date) ? now.getHours() * 60 + now.getMinutes() + advanceNotice * 60 : 0
    const earliestMinutes = Math.max(bufferEndMinutes, advanceEndMinutes)
    const rounded = Math.ceil(earliestMinutes / BOOKING_RULES.slotInterval) * BOOKING_RULES.slotInterval

    if (!allow24Hr && rounded >= BOOKING_RULES.eveningCutoffHour * 60) {
      return { date: dateStr, available: false, reason: 'Available tomorrow (past evening cutoff after buffer)', bufferEndsAt: bufferEndStr }
    }

    const hh = String(Math.floor(rounded / 60)).padStart(2, '0')
    const mm = String(rounded % 60).padStart(2, '0')
    return {
      date: dateStr,
      available: true,
      earliestPickupTime: `${hh}:${mm}`,
      returnCompleted: true,
      bufferEndsAt: bufferEndStr,
    }
  }

  // ── Check 5: Advance notice for today ──
  if (isSameDay(date, now)) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const earliestMinutes = nowMinutes + advanceNotice * 60
    const rounded = Math.ceil(earliestMinutes / BOOKING_RULES.slotInterval) * BOOKING_RULES.slotInterval

    if (!allow24Hr && rounded >= BOOKING_RULES.eveningCutoffHour * 60) {
      return { date: dateStr, available: false, reason: 'Too late today (advance notice pushes past cutoff)' }
    }
    if (rounded >= 24 * 60) {
      return { date: dateStr, available: false, reason: 'Too late today' }
    }

    const hh = String(Math.floor(rounded / 60)).padStart(2, '0')
    const mm = String(rounded % 60).padStart(2, '0')
    return { date: dateStr, available: true, earliestPickupTime: `${hh}:${mm}` }
  }

  // ── Default: day is available ──
  return { date: dateStr, available: true }
}
