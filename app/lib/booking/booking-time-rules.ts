// app/lib/booking/booking-time-rules.ts
// Single source of truth for all booking date/time/buffer logic.
// Pure functions — no React, no browser APIs required. Works on SSR.

// =============================================================================
// CONSTANTS
// =============================================================================

export const BOOKING_RULES = {
  /** Platform minimum advance notice in hours (hard floor) */
  platformMinAdvanceNotice: 1,
  /** Platform minimum trip buffer in hours (hard floor) */
  platformMinTripBuffer: 2,
  /** Default guest advance-notice buffer in hours */
  defaultAdvanceNotice: 2,
  /** Default buffer hours between trips */
  defaultTripBuffer: 3,
  /** @deprecated use defaultAdvanceNotice */
  defaultBufferHours: 2,
  /** Round time slots to this interval (minutes) */
  slotInterval: 30,
  /** If earliest pickup is at or after this hour (0-23), bump to next day — standard cars only */
  eveningCutoffHour: 22,
  /** Default start time for next-day (or post-cutoff) pickup */
  morningOpenHour: 10,
  /** No pickups allowed between these hours (0-23) — standard cars only */
  nightBlackoutStart: 1,
  nightBlackoutEnd: 5,
  /** @deprecated use defaultTripBuffer * 60 */
  postReturnBufferMinutes: 240,
  /** @deprecated use eveningCutoffHour */
  postReturnEveningCutoffHour: 18,
}

// =============================================================================
// DB-BACKED RULES (server-side only — reads from PlatformSettings)
// =============================================================================

/**
 * Returns BOOKING_RULES merged with overrides from PlatformSettings DB record.
 * Falls back to hardcoded BOOKING_RULES values if DB is unavailable.
 * Server-side only — do NOT import on the client.
 */
export async function getPlatformBookingRules(): Promise<typeof BOOKING_RULES> {
  try {
    const { prisma } = await import('@/app/lib/database/prisma')
    const s = await prisma.platformSettings.findUnique({ where: { id: 'global' } })
    if (!s) return BOOKING_RULES
    return {
      ...BOOKING_RULES,
      platformMinAdvanceNotice: s.platformMinAdvanceNotice ?? BOOKING_RULES.platformMinAdvanceNotice,
      platformMinTripBuffer: s.platformMinTripBuffer ?? BOOKING_RULES.platformMinTripBuffer,
      defaultAdvanceNotice: s.defaultAdvanceNotice ?? BOOKING_RULES.defaultAdvanceNotice,
      defaultTripBuffer: s.defaultTripBuffer ?? BOOKING_RULES.defaultTripBuffer,
    }
  } catch {
    return BOOKING_RULES
  }
}

// =============================================================================
// OPTION LISTS (for UI dropdowns)
// =============================================================================

export const ADVANCE_NOTICE_OPTIONS = [
  { value: 1,  label: '1 hour' },
  { value: 2,  label: '2 hours' },
  { value: 3,  label: '3 hours' },
  { value: 6,  label: '6 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '1 day' },
  { value: 48, label: '2 days' },
  { value: 72, label: '3 days' },
]

export const TRIP_BUFFER_OPTIONS = [
  { value: 2,  label: '2 hours' },
  { value: 3,  label: '3 hours' },
  { value: 4,  label: '4 hours' },
  { value: 6,  label: '6 hours' },
  { value: 8,  label: '8 hours' },
  { value: 12, label: '12 hours' },
]

// =============================================================================
// ARIZONA TIME PRIMITIVES
// =============================================================================

/** Returns current Arizona time as minutes since midnight. Works on server + client. */
export function getArizonaNowMinutes(): number {
  const now = new Date()
  const az = now.toLocaleString('en-US', {
    timeZone: 'America/Phoenix',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })
  const [h, m] = az.split(':').map(Number)
  return h * 60 + m
}

/** Returns Arizona "today" as YYYY-MM-DD. Works on server + client. */
export function getArizonaTodayString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' })
}

/** Returns true if dateStr (YYYY-MM-DD) is today in Arizona timezone. */
export function isArizonaToday(dateStr: string): boolean {
  if (!dateStr) return false
  return dateStr === getArizonaTodayString()
}

/** Adds N calendar days to a YYYY-MM-DD string, returns YYYY-MM-DD. */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const dy = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${dy}`
}

/** Convert minutes-since-midnight to "HH:MM" string. */
export function minutesToTimeString(minutes: number): string {
  const clamped = Math.max(0, Math.min(minutes, 23 * 60 + 59))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// =============================================================================
// CORE CALCULATIONS
// =============================================================================

/**
 * Calculates the earliest valid pickup date + time for a guest booking.
 *
 * Rules (standard car):
 * 1. candidateA = now + advanceNoticeHours, rounded up to 30-min slot
 * 2. candidateB = lastReturn + tripBufferHours (if lastReturnTime provided)
 * 3. earliest = max(candidateA, candidateB)
 * 4. Night blackout (1AM–5AM) → push to tomorrow 10AM
 * 5. Evening cutoff (>10PM) → push to tomorrow 10AM
 *
 * For allow24HourPickup cars: skip steps 4 and 5 (any time allowed).
 *
 * @param advanceNoticeHours - from car.advanceNotice (default 2)
 * @param options.allow24HourPickup - skip overnight restrictions (default false)
 * @param options.lastReturnTime - { date, time } of the previous trip return
 * @param options.tripBufferHours - cleanup buffer after last return (default 3)
 */
export function calculateEarliestPickup(
  advanceNoticeHours: number = BOOKING_RULES.defaultAdvanceNotice,
  options: {
    allow24HourPickup?: boolean
    lastReturnTime?: { date: string; time: string }
    tripBufferHours?: number
  } = {}
): { date: string; time: string } {
  const { allow24HourPickup = false, lastReturnTime, tripBufferHours = BOOKING_RULES.defaultTripBuffer } = options
  const today = getArizonaTodayString()
  const nowMinutes = getArizonaNowMinutes()

  // candidateA: now + advanceNotice, rounded to next slot
  const bufferedA = nowMinutes + advanceNoticeHours * 60
  const earliestA = Math.ceil(bufferedA / BOOKING_RULES.slotInterval) * BOOKING_RULES.slotInterval

  // candidateB: lastReturn + tripBuffer (if provided)
  let earliestB: { totalMinutes: number; daysFromToday: number } | null = null
  if (lastReturnTime) {
    const [rh, rm] = lastReturnTime.time.split(':').map(Number)
    const returnMinutes = rh * 60 + rm
    const bufferedB = returnMinutes + tripBufferHours * 60
    const slottedB = Math.ceil(bufferedB / BOOKING_RULES.slotInterval) * BOOKING_RULES.slotInterval
    // How many days from today is the return date?
    const returnDate = new Date(`${lastReturnTime.date}T00:00:00`)
    const todayDate = new Date(`${today}T00:00:00`)
    const daysDiff = Math.round((returnDate.getTime() - todayDate.getTime()) / (24 * 60 * 60 * 1000))
    earliestB = { totalMinutes: slottedB, daysFromToday: daysDiff }
  }

  // Resolve candidateA to { daysFromToday, minutes }
  const daysAFromToday = Math.floor(earliestA / (24 * 60))
  const minutesA = earliestA % (24 * 60)

  // Pick max(candidateA, candidateB)
  let resolvedDays: number
  let resolvedMinutes: number

  if (earliestB !== null) {
    const aScore = daysAFromToday * 24 * 60 + minutesA
    const bScore = earliestB.daysFromToday * 24 * 60 + earliestB.totalMinutes
    if (bScore > aScore) {
      resolvedDays = earliestB.daysFromToday
      resolvedMinutes = earliestB.totalMinutes
    } else {
      resolvedDays = daysAFromToday
      resolvedMinutes = minutesA
    }
  } else {
    resolvedDays = daysAFromToday
    resolvedMinutes = minutesA
  }

  // Handle overflow into next day
  if (resolvedMinutes >= 24 * 60) {
    resolvedDays += Math.floor(resolvedMinutes / (24 * 60))
    resolvedMinutes = resolvedMinutes % (24 * 60)
  }

  const resolvedDate = addDays(today, resolvedDays)

  // 24-hour car: no overnight restrictions
  if (allow24HourPickup) {
    return { date: resolvedDate, time: minutesToTimeString(resolvedMinutes) }
  }

  // Standard car: apply night blackout (1AM–5AM)
  if (resolvedMinutes < BOOKING_RULES.nightBlackoutEnd * 60 && resolvedMinutes >= BOOKING_RULES.nightBlackoutStart * 60) {
    return {
      date: addDays(resolvedDate, 1),
      time: `${String(BOOKING_RULES.morningOpenHour).padStart(2, '0')}:00`,
    }
  }

  // Standard car: apply evening cutoff (>10PM → tomorrow morning)
  if (resolvedMinutes > BOOKING_RULES.eveningCutoffHour * 60) {
    return {
      date: addDays(resolvedDate, 1),
      time: `${String(BOOKING_RULES.morningOpenHour).padStart(2, '0')}:00`,
    }
  }

  // Same-day, future days, within allowed hours — check morning floor for multi-day spans
  if (resolvedDays > 0) {
    const flooredMinutes = Math.max(resolvedMinutes, BOOKING_RULES.morningOpenHour * 60)
    if (flooredMinutes > BOOKING_RULES.eveningCutoffHour * 60) {
      return {
        date: addDays(resolvedDate, 1),
        time: `${String(BOOKING_RULES.morningOpenHour).padStart(2, '0')}:00`,
      }
    }
    return { date: resolvedDate, time: minutesToTimeString(flooredMinutes) }
  }

  return { date: resolvedDate, time: minutesToTimeString(resolvedMinutes) }
}

/**
 * Returns the earliest date + time this car can be picked up AFTER a previous
 * booking that returns at `returnDateStr` + `returnTimeStr`.
 *
 * @param options.tripBufferHours - cleanup buffer hours (default 3)
 * @param options.allow24HourPickup - skip evening cutoff for 24hr cars
 * @param options.hostMarkedReady - host confirmed car is ready early (uses platform min 2hr)
 */
export function calculateNextAvailableAfterReturn(
  returnDateStr: string,
  returnTimeStr: string,
  options: {
    tripBufferHours?: number
    allow24HourPickup?: boolean
    hostMarkedReady?: boolean
  } = {}
): { date: string; time: string } {
  const { tripBufferHours = BOOKING_RULES.defaultTripBuffer, allow24HourPickup = false, hostMarkedReady = false } = options

  // If host marked ready, use platform minimum buffer (2hr) instead of full tripBuffer
  const effectiveBufferHours = hostMarkedReady
    ? BOOKING_RULES.platformMinTripBuffer
    : tripBufferHours

  const [rh, rm] = returnTimeStr.split(':').map(Number)
  const returnMinutes = rh * 60 + rm
  const buffered = returnMinutes + effectiveBufferHours * 60
  const earliest = Math.ceil(buffered / BOOKING_RULES.slotInterval) * BOOKING_RULES.slotInterval

  // Handle midnight overflow
  if (earliest >= 24 * 60) {
    const nextDayMinutes = earliest - 24 * 60
    const nextDate = addDays(returnDateStr, 1)
    if (!allow24HourPickup && nextDayMinutes > BOOKING_RULES.eveningCutoffHour * 60) {
      return {
        date: addDays(returnDateStr, 2),
        time: `${String(BOOKING_RULES.morningOpenHour).padStart(2, '0')}:00`,
      }
    }
    return { date: nextDate, time: minutesToTimeString(nextDayMinutes) }
  }

  // 24-hour car: no evening cutoff — can be available even at midnight
  if (allow24HourPickup) {
    return { date: returnDateStr, time: minutesToTimeString(earliest) }
  }

  // Standard car: evening cutoff at 10PM
  if (earliest > BOOKING_RULES.eveningCutoffHour * 60) {
    return {
      date: addDays(returnDateStr, 1),
      time: `${String(BOOKING_RULES.morningOpenHour).padStart(2, '0')}:00`,
    }
  }

  return { date: returnDateStr, time: minutesToTimeString(earliest) }
}

// =============================================================================
// TIME SLOT GENERATOR
// =============================================================================

export interface TimeSlot {
  value: string   // "HH:MM"
  label: string   // "9:00 AM"
  disabled: boolean
}

/**
 * Generates all 30-min time slots for a given date.
 * Slots before the earliest allowed time are marked `disabled: true`.
 *
 * For 24-hour cars: all 48 slots (00:00–23:30) are available.
 * For standard cars: slots outside 05:00–22:00 are hidden/disabled.
 *
 * @param dateStr - YYYY-MM-DD of the proposed pickup date
 * @param advanceNoticeHours - from car.advanceNotice (default 2)
 * @param options.allow24HourPickup - show all slots including overnight
 */
export function getAvailableTimeSlots(
  dateStr: string,
  advanceNoticeHours: number = BOOKING_RULES.defaultAdvanceNotice,
  options: { allow24HourPickup?: boolean } = {}
): TimeSlot[] {
  const { allow24HourPickup = false } = options
  const { date: earliestDate, time: earliestTime } = calculateEarliestPickup(advanceNoticeHours, { allow24HourPickup })
  const isToday = isArizonaToday(dateStr)
  const isEarliestDate = dateStr === earliestDate

  let cutoffMinutes = 0
  if (isToday || isEarliestDate) {
    const [eh, em] = earliestTime.split(':').map(Number)
    cutoffMinutes = eh * 60 + em
  }

  const slots: TimeSlot[] = []
  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? 0 : 30
    const slotMinutes = hour * 60 + minute
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const ampm = hour < 12 ? 'AM' : 'PM'
    const label = `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`

    // Standard cars: disable overnight slots (1AM–5AM) and after 10PM
    if (!allow24HourPickup) {
      const inBlackout = slotMinutes >= BOOKING_RULES.nightBlackoutStart * 60 && slotMinutes < BOOKING_RULES.nightBlackoutEnd * 60
      const afterCutoff = slotMinutes > BOOKING_RULES.eveningCutoffHour * 60
      if (inBlackout || afterCutoff) continue
    }

    const disabled = (isToday || isEarliestDate) && slotMinutes < cutoffMinutes
    slots.push({ value, label, disabled })
  }

  return slots
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates a complete booking time selection.
 * Returns null if valid, or a human-readable error string if invalid.
 *
 * @param params.advanceNoticeHours - from car.advanceNotice (default 2)
 * @param params.allow24HourPickup - skip overnight restrictions
 * @param params.minTripDuration - from car.minTripDuration (days, default 1)
 * @param params.maxTripDuration - from car.maxTripDuration (days, default 30)
 */
export function validateBookingTimes(params: {
  pickupDate: string
  pickupTime: string
  returnDate: string
  returnTime: string
  advanceNoticeHours?: number
  allow24HourPickup?: boolean
  minTripDuration?: number
  maxTripDuration?: number
}): string | null {
  const {
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    advanceNoticeHours = BOOKING_RULES.defaultAdvanceNotice,
    allow24HourPickup = false,
    minTripDuration = 1,
    maxTripDuration = 30,
  } = params

  if (!pickupDate || !returnDate) return null

  const pickup = new Date(`${pickupDate}T${pickupTime || '10:00'}`)
  const ret = new Date(`${returnDate}T${returnTime || '10:00'}`)

  // Return must be after pickup
  if (ret <= pickup) {
    return 'Return must be after pickup'
  }

  // Pickup cannot be in the past (respect advance notice)
  if (isArizonaToday(pickupDate)) {
    const { time: earliestTime } = calculateEarliestPickup(advanceNoticeHours, { allow24HourPickup })
    const [eh, em] = earliestTime.split(':').map(Number)
    const [ph, pm] = (pickupTime || '10:00').split(':').map(Number)
    if (ph * 60 + pm < eh * 60 + em) {
      return `Pickup must be at least ${advanceNoticeHours} hour${advanceNoticeHours !== 1 ? 's' : ''} from now`
    }
  }

  // Min trip duration
  const diffMs = ret.getTime() - pickup.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < minTripDuration) {
    return `Minimum trip is ${minTripDuration} day${minTripDuration !== 1 ? 's' : ''}`
  }

  if (diffDays > maxTripDuration) {
    return `Maximum trip is ${maxTripDuration} day${maxTripDuration !== 1 ? 's' : ''}`
  }

  return null
}
