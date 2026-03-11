'use client'

// app/hooks/useBookingTime.ts
// React hook wrapper around booking-time-rules.ts.
// Use this in any component that needs booking date/time logic.

import { useMemo } from 'react'
import {
  calculateEarliestPickup,
  calculateNextAvailableAfterReturn,
  getAvailableTimeSlots,
  validateBookingTimes,
  isArizonaToday,
  getArizonaTodayString,
  addDays,
  type TimeSlot,
} from '@/app/lib/booking/booking-time-rules'

interface CarBookingSettings {
  advanceNotice?: number    // car.advanceNotice — hours, default 2
  minTripDuration?: number  // car.minTripDuration — days, default 1
  maxTripDuration?: number  // car.maxTripDuration — days, default 30
}

export function useBookingTime(carSettings?: CarBookingSettings) {
  const advanceNotice = carSettings?.advanceNotice ?? 2
  const minTripDuration = carSettings?.minTripDuration ?? 1
  const maxTripDuration = carSettings?.maxTripDuration ?? 30

  /** Earliest valid pickup { date, time } right now */
  const earliestPickup = useMemo(
    () => calculateEarliestPickup(advanceNotice),
    // Re-compute each render (time moves forward). For stable renders pass advanceNotice only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [advanceNotice]
  )

  /** Tomorrow's date as YYYY-MM-DD */
  const tomorrow = useMemo(() => addDays(getArizonaTodayString(), 1), [])

  /** Time slots for a given date, with disabled flags */
  function getTimeSlots(dateStr: string): TimeSlot[] {
    return getAvailableTimeSlots(dateStr, advanceNotice)
  }

  /** Earliest next available date+time after a return */
  function nextAvailableAfterReturn(returnDateStr: string, returnTimeStr: string) {
    return calculateNextAvailableAfterReturn(returnDateStr, returnTimeStr)
  }

  /** Full booking validation — returns null if valid, error string otherwise */
  function validateDates(params: {
    pickupDate: string
    pickupTime: string
    returnDate: string
    returnTime: string
  }): string | null {
    return validateBookingTimes({
      ...params,
      advanceNoticeHours: advanceNotice,
      minTripDuration,
      maxTripDuration,
    })
  }

  return {
    earliestPickup,
    tomorrow,
    isToday: isArizonaToday,
    getTimeSlots,
    nextAvailableAfterReturn,
    validateDates,
    advanceNotice,
    minTripDuration,
    maxTripDuration,
  }
}
