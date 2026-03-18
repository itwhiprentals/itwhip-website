// app/lib/availability/canBookCar.ts
// MILITARY GRADE: Final gatekeeper — 10-check validation before any booking creation.
// Used INSIDE the booking creation transaction AND at payment-element pre-check.
// Every denial is logged with specific reason.

import { prisma } from '@/app/lib/database/prisma'
import { BOOKING_RULES } from '@/app/lib/booking/booking-time-rules'
import { format, differenceInMinutes, isBefore, isAfter, startOfDay, isSameDay } from 'date-fns'

// =============================================================================
// TYPES
// =============================================================================

export interface BookingValidation {
  allowed: boolean
  reason?: string               // human-readable denial reason
  conflicts?: string[]          // booking IDs that conflict
  suggestedPickup?: {           // alternative if denied
    date: string
    time: string
  }
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

export async function canBookCar(
  carId: string,
  pickupDate: string,           // YYYY-MM-DD
  pickupTime: string,           // HH:MM
  returnDate: string,           // YYYY-MM-DD
  returnTime: string,           // HH:MM
  excludeBookingId?: string,    // for modifications
): Promise<BookingValidation> {

  const log = (result: string, reason?: string) => {
    console.log(`[AVAILABILITY_CHECK] carId=${carId} pickup=${pickupDate} ${pickupTime} return=${returnDate} ${returnTime} result=${result}${reason ? ` reason=${reason}` : ''}`)
  }

  // ── Fetch car ──
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: {
      id: true,
      isActive: true,
      advanceNotice: true,
      tripBuffer: true,
      allow24HourPickup: true,
    },
  })

  if (!car) {
    log('DENIED', 'Car not found')
    return { allowed: false, reason: 'Vehicle not found' }
  }

  const advanceNotice = Math.max(BOOKING_RULES.platformMinAdvanceNotice, car.advanceNotice ?? BOOKING_RULES.defaultAdvanceNotice)
  const tripBuffer = Math.max(BOOKING_RULES.platformMinTripBuffer, car.tripBuffer ?? BOOKING_RULES.defaultTripBuffer)
  const allow24Hr = car.allow24HourPickup ?? false

  // Arizona "now"
  const nowAZ = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' }))

  // Parse pickup/return into Date objects
  const [ph, pm] = pickupTime.split(':').map(Number)
  const [rh, rm] = returnTime.split(':').map(Number)
  const pickupDT = new Date(`${pickupDate}T00:00:00`)
  pickupDT.setHours(ph, pm, 0, 0)
  const returnDT = new Date(`${returnDate}T00:00:00`)
  returnDT.setHours(rh, rm, 0, 0)

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK 1: Pickup is in the future
  // ══════════════════════════════════════════════════════════════════════════
  if (isBefore(pickupDT, nowAZ)) {
    log('DENIED', 'Pickup is in the past')
    return { allowed: false, reason: 'Pickup time is in the past' }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK 2: Pickup >= now + advanceNotice
  // ══════════════════════════════════════════════════════════════════════════
  const minPickup = new Date(nowAZ.getTime() + advanceNotice * 60 * 60 * 1000)
  if (isBefore(pickupDT, minPickup)) {
    const minsShort = differenceInMinutes(minPickup, pickupDT)
    log('DENIED', `Advance notice: need ${advanceNotice}hr, short by ${minsShort}min`)
    return {
      allowed: false,
      reason: `Pickup requires ${advanceNotice} hours advance notice. Earliest: ${format(minPickup, 'h:mm a')}`,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK 3: Return > Pickup
  // ══════════════════════════════════════════════════════════════════════════
  if (!isAfter(returnDT, pickupDT)) {
    log('DENIED', 'Return not after pickup')
    return { allowed: false, reason: 'Return must be after pickup' }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK 4: No PENDING/CONFIRMED/ACTIVE booking overlaps
  // ══════════════════════════════════════════════════════════════════════════
  const pickupDay = startOfDay(pickupDT)
  const returnDay = startOfDay(returnDT)

  const conflictingBookings = await prisma.rentalBooking.findMany({
    where: {
      carId,
      status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
      startDate: { lte: returnDT },
      endDate: { gte: pickupDT },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { id: true, status: true, startDate: true, endDate: true },
  })

  if (conflictingBookings.length > 0) {
    const ids = conflictingBookings.map(b => b.id)
    log('DENIED', `Overlap with ${ids.join(', ')}`)
    return {
      allowed: false,
      reason: 'These dates overlap with an existing booking',
      conflicts: ids,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK 5: If same-day as ACTIVE booking return → BLOCK
  // ══════════════════════════════════════════════════════════════════════════
  const activeBookingsReturningOnPickupDay = await prisma.rentalBooking.findMany({
    where: {
      carId,
      status: 'ACTIVE',
      endDate: {
        gte: pickupDay,
        lte: new Date(pickupDay.getTime() + 24 * 60 * 60 * 1000 - 1),
      },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { id: true },
  })

  if (activeBookingsReturningOnPickupDay.length > 0) {
    log('DENIED', 'ACTIVE trip returning on pickup day')
    return {
      allowed: false,
      reason: 'Car is on an active trip. Available after return and buffer.',
      conflicts: activeBookingsReturningOnPickupDay.map(b => b.id),
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK 6: If same-day as COMPLETED booking return → check buffer passed
  // ══════════════════════════════════════════════════════════════════════════
  const completedReturnsOnPickupDay = await prisma.rentalBooking.findMany({
    where: {
      carId,
      status: 'COMPLETED',
      endDate: {
        gte: pickupDay,
        lte: new Date(pickupDay.getTime() + 24 * 60 * 60 * 1000 - 1),
      },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { id: true, endDate: true, endTime: true, actualEndTime: true, markedReadyAt: true },
  })

  for (const b of completedReturnsOnPickupDay) {
    // Determine actual return time
    let actualReturn: Date
    if (b.actualEndTime) {
      actualReturn = new Date(b.actualEndTime)
    } else if (b.markedReadyAt) {
      actualReturn = new Date(b.markedReadyAt)
    } else {
      // Use scheduled end
      actualReturn = new Date(b.endDate)
      if (b.endTime) {
        const [eh, em] = b.endTime.split(':').map(Number)
        actualReturn.setHours(eh, em, 0, 0)
      }
    }

    const bufferEnd = new Date(actualReturn.getTime() + tripBuffer * 60 * 60 * 1000)

    if (isBefore(pickupDT, bufferEnd)) {
      const minsLeft = differenceInMinutes(bufferEnd, pickupDT)
      log('DENIED', `Buffer: return at ${format(actualReturn, 'HH:mm')}, buffer ends ${format(bufferEnd, 'HH:mm')}, pickup at ${pickupTime}`)
      return {
        allowed: false,
        reason: `Post-return buffer: car needs ${tripBuffer}hr after return. Available at ${format(bufferEnd, 'h:mm a')}`,
        conflicts: [b.id],
        suggestedPickup: {
          date: pickupDate,
          time: format(bufferEnd, 'HH:mm'),
        },
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK 7: Pickup time within operating hours
  // ══════════════════════════════════════════════════════════════════════════
  if (!allow24Hr) {
    const pickupMinutes = ph * 60 + pm
    if (pickupMinutes >= BOOKING_RULES.nightBlackoutStart * 60 && pickupMinutes < BOOKING_RULES.nightBlackoutEnd * 60) {
      log('DENIED', `Pickup during blackout (${pickupTime})`)
      return { allowed: false, reason: `Pickup not available between ${BOOKING_RULES.nightBlackoutStart}AM and ${BOOKING_RULES.nightBlackoutEnd}AM` }
    }
    if (pickupMinutes > BOOKING_RULES.eveningCutoffHour * 60) {
      log('DENIED', `Pickup after cutoff (${pickupTime})`)
      return { allowed: false, reason: `Pickup not available after ${BOOKING_RULES.eveningCutoffHour > 12 ? BOOKING_RULES.eveningCutoffHour - 12 : BOOKING_RULES.eveningCutoffHour}PM` }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK 8: Return time within operating hours
  // ══════════════════════════════════════════════════════════════════════════
  if (!allow24Hr) {
    const returnMinutes = rh * 60 + rm
    if (returnMinutes >= BOOKING_RULES.nightBlackoutStart * 60 && returnMinutes < BOOKING_RULES.nightBlackoutEnd * 60) {
      log('DENIED', `Return during blackout (${returnTime})`)
      return { allowed: false, reason: `Return not available between ${BOOKING_RULES.nightBlackoutStart}AM and ${BOOKING_RULES.nightBlackoutEnd}AM` }
    }
    if (returnMinutes > BOOKING_RULES.eveningCutoffHour * 60) {
      log('DENIED', `Return after cutoff (${returnTime})`)
      return { allowed: false, reason: `Return not available after ${BOOKING_RULES.eveningCutoffHour > 12 ? BOOKING_RULES.eveningCutoffHour - 12 : BOOKING_RULES.eveningCutoffHour}PM` }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK 9: Car is active
  // ══════════════════════════════════════════════════════════════════════════
  if (!car.isActive) {
    log('DENIED', 'Car inactive')
    return { allowed: false, reason: 'This vehicle is currently unavailable' }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHECK 10: All checks passed
  // ══════════════════════════════════════════════════════════════════════════
  log('ALLOWED')
  return { allowed: true }
}
