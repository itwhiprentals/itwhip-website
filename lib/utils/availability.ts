// lib/utils/availability.ts
// Utilities for checking car availability against bookings and blocked dates
// Handles both complete unavailability and partial availability scenarios

export interface DateRange {
    startDate: Date | string
    endDate: Date | string
  }
  
  export interface Booking {
    id: string
    carId: string
    startDate: Date | string
    endDate: Date | string
    status: string
  }
  
  export interface BlockedDate {
    id: string
    carId: string
    date: Date | string
    isAvailable: boolean
  }
  
  export interface AvailabilityResult {
    isFullyAvailable: boolean
    isPartiallyAvailable: boolean
    isCompletelyUnavailable: boolean
    availableDays: number
    unavailableDays: number
    totalDays: number
    unavailableRanges: DateRange[]
    conflictingBookings: string[]
    blockedDates: string[]
  }
  
  /**
   * Normalize date to Date object
   */
  function normalizeDate(date: Date | string): Date {
    return typeof date === 'string' ? new Date(date) : date
  }
  
  /**
   * Get date string in YYYY-MM-DD format
   */
  function getDateString(date: Date): string {
    return date.toISOString().split('T')[0]
  }
  
  /**
   * Check if two date ranges overlap
   */
  export function datesOverlap(range1: DateRange, range2: DateRange): boolean {
    const start1 = normalizeDate(range1.startDate)
    const end1 = normalizeDate(range1.endDate)
    const start2 = normalizeDate(range2.startDate)
    const end2 = normalizeDate(range2.endDate)
  
    return start1 <= end2 && start2 <= end1
  }
  
  /**
   * Get all dates in a range
   */
  export function getDatesInRange(startDate: Date | string, endDate: Date | string): Date[] {
    const dates: Date[] = []
    const start = normalizeDate(startDate)
    const end = normalizeDate(endDate)
    
    const current = new Date(start)
    
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }
  
  /**
   * Calculate number of days between two dates (inclusive)
   */
  export function calculateDays(startDate: Date | string, endDate: Date | string): number {
    const start = normalizeDate(startDate)
    const end = normalizeDate(endDate)
    
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 for inclusive
    
    return diffDays
  }
  
  /**
   * Check availability for a car against bookings and blocked dates
   * Returns detailed availability information
   */
  export function checkAvailability(
    carId: string,
    requestedRange: DateRange,
    bookings: Booking[],
    blockedDates: BlockedDate[]
  ): AvailabilityResult {
    const requestStart = normalizeDate(requestedRange.startDate)
    const requestEnd = normalizeDate(requestedRange.endDate)
    const totalDays = calculateDays(requestStart, requestEnd)
    const requestedDates = getDatesInRange(requestStart, requestEnd)
    const requestedDateStrings = new Set(requestedDates.map(getDateString))
  
    // Filter relevant bookings (for this car, not cancelled/completed)
    const activeBookings = bookings.filter(
      booking =>
        booking.carId === carId &&
        !['CANCELLED', 'COMPLETED'].includes(booking.status)
    )
  
    // Check for booking conflicts
    const conflictingBookings: string[] = []
    const unavailableDatesFromBookings = new Set<string>()
  
    activeBookings.forEach(booking => {
      if (datesOverlap(requestedRange, booking)) {
        conflictingBookings.push(booking.id)
        
        // Get all dates in this booking that overlap with request
        const bookingDates = getDatesInRange(booking.startDate, booking.endDate)
        bookingDates.forEach(date => {
          const dateStr = getDateString(date)
          if (requestedDateStrings.has(dateStr)) {
            unavailableDatesFromBookings.add(dateStr)
          }
        })
      }
    })
  
    // Filter relevant blocked dates (for this car, not available)
    const relevantBlockedDates = blockedDates.filter(
      blocked =>
        blocked.carId === carId &&
        blocked.isAvailable === false
    )
  
    // Check for blocked date conflicts
    const blockedDateStrings: string[] = []
    const unavailableDatesFromBlocked = new Set<string>()
  
    relevantBlockedDates.forEach(blocked => {
      const blockedDateStr = getDateString(normalizeDate(blocked.date))
      
      if (requestedDateStrings.has(blockedDateStr)) {
        blockedDateStrings.push(blockedDateStr)
        unavailableDatesFromBlocked.add(blockedDateStr)
      }
    })
  
    // Combine all unavailable dates
    const allUnavailableDates = new Set([
      ...unavailableDatesFromBookings,
      ...unavailableDatesFromBlocked
    ])
  
    const unavailableDays = allUnavailableDates.size
    const availableDays = totalDays - unavailableDays
  
    // Determine availability status
    const isFullyAvailable = unavailableDays === 0
    const isCompletelyUnavailable = unavailableDays === totalDays
    const isPartiallyAvailable = unavailableDays > 0 && unavailableDays < totalDays
  
    // Build unavailable ranges (consecutive unavailable dates)
    const unavailableRanges: DateRange[] = []
    if (allUnavailableDates.size > 0) {
      const sortedUnavailable = Array.from(allUnavailableDates)
        .sort()
        .map(dateStr => new Date(dateStr))
  
      let rangeStart = sortedUnavailable[0]
      let rangeEnd = sortedUnavailable[0]
  
      for (let i = 1; i < sortedUnavailable.length; i++) {
        const currentDate = sortedUnavailable[i]
        const prevDate = sortedUnavailable[i - 1]
        
        // Check if dates are consecutive
        const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        
        if (dayDiff === 1) {
          rangeEnd = currentDate
        } else {
          unavailableRanges.push({
            startDate: rangeStart,
            endDate: rangeEnd
          })
          rangeStart = currentDate
          rangeEnd = currentDate
        }
      }
      
      // Add final range
      unavailableRanges.push({
        startDate: rangeStart,
        endDate: rangeEnd
      })
    }
  
    return {
      isFullyAvailable,
      isPartiallyAvailable,
      isCompletelyUnavailable,
      availableDays,
      unavailableDays,
      totalDays,
      unavailableRanges,
      conflictingBookings,
      blockedDates: blockedDateStrings
    }
  }
  
  /**
   * Check if a car is available for specific dates (simple boolean check)
   */
  export function isCarAvailable(
    carId: string,
    requestedRange: DateRange,
    bookings: Booking[],
    blockedDates: BlockedDate[]
  ): boolean {
    const result = checkAvailability(carId, requestedRange, bookings, blockedDates)
    return result.isFullyAvailable
  }
  
  /**
   * Filter cars by availability
   * Returns only cars that meet the availability criteria
   */
  export function filterAvailableCars<T extends { id: string }>(
    cars: T[],
    requestedRange: DateRange,
    bookings: Booking[],
    blockedDates: BlockedDate[],
    includePartial: boolean = true
  ): (T & { availabilityInfo: AvailabilityResult })[] {
    return cars
      .map(car => {
        const availabilityInfo = checkAvailability(
          car.id,
          requestedRange,
          bookings,
          blockedDates
        )
  
        return {
          ...car,
          availabilityInfo
        }
      })
      .filter(car => {
        if (includePartial) {
          return car.availabilityInfo.isFullyAvailable || car.availabilityInfo.isPartiallyAvailable
        }
        return car.availabilityInfo.isFullyAvailable
      })
  }
  
  /**
   * Get availability status label for display
   */
  export function getAvailabilityLabel(availability: AvailabilityResult): string {
    if (availability.isFullyAvailable) {
      return 'Available'
    }
    
    if (availability.isCompletelyUnavailable) {
      return 'Unavailable'
    }
    
    if (availability.isPartiallyAvailable) {
      return `${availability.availableDays} of ${availability.totalDays} days available`
    }
    
    return 'Unknown'
  }
  
  /**
   * Get availability color for UI (Tailwind classes)
   */
  export function getAvailabilityColor(availability: AvailabilityResult): {
    badge: string
    text: string
    bg: string
  } {
    if (availability.isFullyAvailable) {
      return {
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        text: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20'
      }
    }
    
    if (availability.isCompletelyUnavailable) {
      return {
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20'
      }
    }
    
    // Partial availability
    return {
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      text: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20'
    }
  }
  
  /**
   * Format unavailable ranges for display
   */
  export function formatUnavailableRanges(ranges: DateRange[]): string[] {
    return ranges.map(range => {
      const start = normalizeDate(range.startDate)
      const end = normalizeDate(range.endDate)
      
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      if (getDateString(start) === getDateString(end)) {
        return startStr
      }
      
      return `${startStr} - ${endStr}`
    })
  }
  
  /**
   * Get available date ranges (opposite of unavailable)
   */
  export function getAvailableRanges(
    requestedRange: DateRange,
    unavailableRanges: DateRange[]
  ): DateRange[] {
    if (unavailableRanges.length === 0) {
      return [requestedRange]
    }
  
    const availableRanges: DateRange[] = []
    const requestStart = normalizeDate(requestedRange.startDate)
    const requestEnd = normalizeDate(requestedRange.endDate)
    
    // Sort unavailable ranges by start date
    const sortedUnavailable = [...unavailableRanges].sort((a, b) => 
      normalizeDate(a.startDate).getTime() - normalizeDate(b.startDate).getTime()
    )
    
    let currentStart = requestStart
    
    sortedUnavailable.forEach(unavailable => {
      const unavailStart = normalizeDate(unavailable.startDate)
      const unavailEnd = normalizeDate(unavailable.endDate)
      
      // If there's a gap before this unavailable range
      if (currentStart < unavailStart) {
        availableRanges.push({
          startDate: currentStart,
          endDate: new Date(unavailStart.getTime() - 24 * 60 * 60 * 1000) // Day before
        })
      }
      
      // Move current start to day after unavailable range
      currentStart = new Date(unavailEnd.getTime() + 24 * 60 * 60 * 1000)
    })
    
    // If there's availability after last unavailable range
    if (currentStart <= requestEnd) {
      availableRanges.push({
        startDate: currentStart,
        endDate: requestEnd
      })
    }
    
    return availableRanges
  }
  
  /**
   * Check if dates are in the past
   */
  export function isInPast(date: Date | string): boolean {
    const checkDate = normalizeDate(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return checkDate < today
  }
  
  /**
   * Validate date range
   */
  export function validateDateRange(range: DateRange): {
    valid: boolean
    error?: string
  } {
    const start = normalizeDate(range.startDate)
    const end = normalizeDate(range.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (start < today) {
      return { valid: false, error: 'Start date cannot be in the past' }
    }
    
    if (end < start) {
      return { valid: false, error: 'End date must be after start date' }
    }
    
    if (start.getTime() === end.getTime()) {
      return { valid: false, error: 'Rental must be at least 1 day' }
    }
    
    return { valid: true }
  }
  
  /**
   * Get minimum available trip duration
   * Useful when car has minimum trip duration requirement
   */
  export function meetsMinimumDuration(
    range: DateRange,
    minDays: number
  ): boolean {
    const days = calculateDays(range.startDate, range.endDate)
    return days >= minDays
  }
  
  /**
   * Get maximum available trip duration
   * Useful when car has maximum trip duration restriction
   */
  export function exceedsMaximumDuration(
    range: DateRange,
    maxDays: number
  ): boolean {
    const days = calculateDays(range.startDate, range.endDate)
    return days > maxDays
  }