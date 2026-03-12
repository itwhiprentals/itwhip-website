// app/lib/booking/booking-time-rules.ts
// Single source of truth for all booking date/time/buffer logic.
// Pure functions — no React, no browser APIs required. Works on SSR.

// =============================================================================
// CONSTANTS
// =============================================================================

export const BOOKING_RULES = {
  /** Default guest advance-notice buffer in hours */
  defaultBufferHours: 2,
  /** Round time slots to this interval (minutes) */
  slotInterval: 30,
  /** If earliest pickup is at or after this hour (0-23), bump to next day */
  eveningCutoffHour: 22,
  /** Default start time for next-day (or post-cutoff) pickup */
  morningOpenHour: 10,
  /** No pickups allowed between these hours (0-23) */
  nightBlackoutStart: 1,
  nightBlackoutEnd: 5,
  /** Minutes to add after a return before the car is available again */
  postReturnBufferMinutes: 240,
  /** If post-return earliest is at or after this hour (0-23), push to next day */
  postReturnEveningCutoffHour: 18,
}

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
 * Rules:
 * 1. Add `advanceNoticeHours` to current AZ time.
 * 2. Round up to next 30-min slot.
 * 3. If the result is >= 8 PM (eveningCutoffHour), bump to tomorrow at morningOpenHour:00.
 * 4. Returns { date: 'YYYY-MM-DD', time: 'HH:MM' }.
 *
 * Default `advanceNoticeHours` is 2 (matches car.advanceNotice schema default).
 * Pass car.advanceNotice here so per-car settings are respected.
 */
export function calculateEarliestPickup(advanceNoticeHours: number = BOOKING_RULES.defaultBufferHours): {
  date: string
  time: string
} {
  const today = getArizonaTodayString()
  const nowMinutes = getArizonaNowMinutes()
  const bufferedMinutes = nowMinutes + advanceNoticeHours * 60
  const earliest = Math.ceil(bufferedMinutes / BOOKING_RULES.slotInterval) * BOOKING_RULES.slotInterval

  const daysToAdd = Math.floor(earliest / (24 * 60))

  if (daysToAdd > 0) {
    // Advance notice spans into a future day — use actual buffered time, but floor to morning open
    const minutesIntoFutureDay = earliest % (24 * 60)
    const futureMinutes = Math.max(minutesIntoFutureDay, BOOKING_RULES.morningOpenHour * 60)
    // If the result is still past evening cutoff, push to the day after
    if (futureMinutes >= BOOKING_RULES.eveningCutoffHour * 60) {
      return {
        date: addDays(today, daysToAdd + 1),
        time: `${String(BOOKING_RULES.morningOpenHour).padStart(2, '0')}:00`,
      }
    }
    return {
      date: addDays(today, daysToAdd),
      time: minutesToTimeString(futureMinutes),
    }
  }

  // Same day — night blackout: if earliest is before 5 AM, push to tomorrow morning
  if (earliest < BOOKING_RULES.nightBlackoutEnd * 60) {
    return {
      date: addDays(today, 1),
      time: `${String(BOOKING_RULES.morningOpenHour).padStart(2, '0')}:00`,
    }
  }

  // Same day — use exact buffered time, but check evening cutoff
  if (earliest >= BOOKING_RULES.eveningCutoffHour * 60) {
    // Past evening cutoff — bump to tomorrow morning
    return {
      date: addDays(today, 1),
      time: `${String(BOOKING_RULES.morningOpenHour).padStart(2, '0')}:00`,
    }
  }

  return {
    date: today,
    time: minutesToTimeString(earliest),
  }
}

/**
 * Returns the earliest date + time this car can be picked up AFTER a previous
 * booking that returns at `returnDateStr` + `returnTimeStr`.
 *
 * Rules:
 * 1. Add postReturnBufferMinutes (4 hours) to the return time.
 * 2. Round up to next 30-min slot.
 * 3. If result is >= 6 PM (postReturnEveningCutoffHour), push to next day at morningOpenHour:00.
 */
export function calculateNextAvailableAfterReturn(
  returnDateStr: string,
  returnTimeStr: string
): { date: string; time: string } {
  const [rh, rm] = returnTimeStr.split(':').map(Number)
  const returnMinutes = rh * 60 + rm
  const buffered = returnMinutes + BOOKING_RULES.postReturnBufferMinutes
  const earliest = Math.ceil(buffered / BOOKING_RULES.slotInterval) * BOOKING_RULES.slotInterval

  if (earliest >= BOOKING_RULES.postReturnEveningCutoffHour * 60 || earliest >= 24 * 60) {
    return {
      date: addDays(returnDateStr, 1),
      time: `${String(BOOKING_RULES.morningOpenHour).padStart(2, '0')}:00`,
    }
  }

  return {
    date: returnDateStr,
    time: minutesToTimeString(earliest),
  }
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
 * @param dateStr - YYYY-MM-DD of the proposed pickup date
 * @param advanceNoticeHours - from car.advanceNotice (default 2)
 */
export function getAvailableTimeSlots(
  dateStr: string,
  advanceNoticeHours: number = BOOKING_RULES.defaultBufferHours
): TimeSlot[] {
  const { date: earliestDate, time: earliestTime } = calculateEarliestPickup(advanceNoticeHours)
  const isToday = isArizonaToday(dateStr)
  const isEarliestDate = dateStr === earliestDate

  // Compute cutoff minutes for this date
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
 * @param params.minTripDuration - from car.minTripDuration (days, default 1)
 * @param params.maxTripDuration - from car.maxTripDuration (days, default 30)
 */
export function validateBookingTimes(params: {
  pickupDate: string
  pickupTime: string
  returnDate: string
  returnTime: string
  advanceNoticeHours?: number
  minTripDuration?: number
  maxTripDuration?: number
}): string | null {
  const {
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    advanceNoticeHours = BOOKING_RULES.defaultBufferHours,
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
    const { time: earliestTime } = calculateEarliestPickup(advanceNoticeHours)
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
