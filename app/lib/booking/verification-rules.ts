// app/lib/booking/verification-rules.ts

/**
 * Business logic for determining verification requirements
 * Replaces internal source field checks with legitimate business rules
 */

// Business rule thresholds (adjustable without code changes)
export const VERIFICATION_THRESHOLDS = {
    LUXURY_PRICE: 500,        // Daily rate threshold for luxury vehicles
    LONG_TRIP_DAYS: 7,        // Trip duration requiring extra verification
    HIGH_VALUE_TOTAL: 2000,   // Total booking value requiring verification
    YOUNG_DRIVER_AGE: 25,     // Age threshold for additional verification
    ADVANCE_NOTICE_HOURS: 2,  // Minimum hours before pickup
  }
  
  // Verification reasons for transparency
  export enum VerificationReason {
    LUXURY_VEHICLE = 'luxury_vehicle',
    NON_INSTANT_BOOK = 'host_approval_required',
    UNVERIFIED_HOST = 'host_verification_pending',
    LONG_TERM_RENTAL = 'extended_rental_period',
    HIGH_VALUE_BOOKING = 'high_value_transaction',
    YOUNG_DRIVER = 'young_driver_verification',
    LAST_MINUTE = 'last_minute_booking',
    EXOTIC_VEHICLE = 'exotic_car_category',
    FIRST_TIME_RENTER = 'new_customer_verification',
    NO_REASON = 'standard_booking'
  }
  
  // Car categories requiring verification (publicly visible attribute)
  const VERIFIED_CAR_TYPES = ['luxury', 'exotic', 'convertible', 'sports']
  
  /**
   * Main function to determine if a booking requires verification
   * Uses only publicly visible business attributes
   */
  export function requiresVerification(
    car: {
      dailyRate: number
      instantBook: boolean
      carType?: string
      host?: {
        isVerified?: boolean
        responseTime?: number
      }
    },
    booking: {
      numberOfDays: number
      totalAmount: number
      guestEmail?: string
      startDate: Date
      driverAge?: number
    }
  ): boolean {
    
    // Rule 1: Luxury price threshold
    if (car.dailyRate >= VERIFICATION_THRESHOLDS.LUXURY_PRICE) {
      return true
    }
  
    // Rule 2: Non-instant book always requires host approval
    if (!car.instantBook) {
      return true
    }
  
    // Rule 3: Unverified hosts require verification
    if (car.host && !car.host.isVerified) {
      return true
    }
  
    // Rule 4: Long-term rentals need extra verification
    if (booking.numberOfDays >= VERIFICATION_THRESHOLDS.LONG_TRIP_DAYS) {
      return true
    }
  
    // Rule 5: High-value bookings
    if (booking.totalAmount >= VERIFICATION_THRESHOLDS.HIGH_VALUE_TOTAL) {
      return true
    }
  
    // Rule 6: Exotic/luxury car types
    if (car.carType && VERIFIED_CAR_TYPES.includes(car.carType.toLowerCase())) {
      return true
    }
  
    // Rule 7: Young drivers (if age provided)
    if (booking.driverAge && booking.driverAge < VERIFICATION_THRESHOLDS.YOUNG_DRIVER_AGE) {
      return true
    }
  
    // Rule 8: Last-minute bookings
    const hoursUntilStart = (booking.startDate.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntilStart < VERIFICATION_THRESHOLDS.ADVANCE_NOTICE_HOURS) {
      return true
    }
  
    // Default: No verification required
    return false
  }
  
  /**
   * Get the primary reason for verification requirement
   * Used for transparency in user messaging
   */
  export function getVerificationReason(
    car: {
      dailyRate: number
      instantBook: boolean
      carType?: string
      host?: {
        isVerified?: boolean
      }
    },
    booking: {
      numberOfDays: number
      totalAmount: number
      startDate: Date
      driverAge?: number
    }
  ): VerificationReason {
    
    // Check reasons in priority order
    if (car.dailyRate >= VERIFICATION_THRESHOLDS.LUXURY_PRICE) {
      return VerificationReason.LUXURY_VEHICLE
    }
  
    if (!car.instantBook) {
      return VerificationReason.NON_INSTANT_BOOK
    }
  
    if (car.host && !car.host.isVerified) {
      return VerificationReason.UNVERIFIED_HOST
    }
  
    if (booking.numberOfDays >= VERIFICATION_THRESHOLDS.LONG_TRIP_DAYS) {
      return VerificationReason.LONG_TERM_RENTAL
    }
  
    if (booking.totalAmount >= VERIFICATION_THRESHOLDS.HIGH_VALUE_TOTAL) {
      return VerificationReason.HIGH_VALUE_BOOKING
    }
  
    if (car.carType && VERIFIED_CAR_TYPES.includes(car.carType.toLowerCase())) {
      return VerificationReason.EXOTIC_VEHICLE
    }
  
    if (booking.driverAge && booking.driverAge < VERIFICATION_THRESHOLDS.YOUNG_DRIVER_AGE) {
      return VerificationReason.YOUNG_DRIVER
    }
  
    const hoursUntilStart = (booking.startDate.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntilStart < VERIFICATION_THRESHOLDS.ADVANCE_NOTICE_HOURS) {
      return VerificationReason.LAST_MINUTE
    }
  
    return VerificationReason.NO_REASON
  }
  
  /**
   * Get estimated review time based on verification reason
   * Returns user-friendly timeframe
   */
  export function getEstimatedReviewTime(reason: VerificationReason): string {
    switch (reason) {
      case VerificationReason.LAST_MINUTE:
        return 'within 1 hour'
      case VerificationReason.LUXURY_VEHICLE:
      case VerificationReason.EXOTIC_VEHICLE:
        return '1-2 hours'
      case VerificationReason.NON_INSTANT_BOOK:
        return '2-4 hours'
      case VerificationReason.HIGH_VALUE_BOOKING:
      case VerificationReason.YOUNG_DRIVER:
        return '2-3 hours'
      case VerificationReason.LONG_TERM_RENTAL:
        return '3-4 hours'
      case VerificationReason.UNVERIFIED_HOST:
        return '4-6 hours'
      default:
        return '2-4 hours'
    }
  }
  
  /**
   * Get user-friendly message explaining verification requirement
   */
  export function getVerificationMessage(reason: VerificationReason): string {
    switch (reason) {
      case VerificationReason.LUXURY_VEHICLE:
        return 'This luxury vehicle requires identity verification for security.'
      case VerificationReason.NON_INSTANT_BOOK:
        return 'This listing requires host approval before confirmation.'
      case VerificationReason.UNVERIFIED_HOST:
        return 'New host listings require additional verification steps.'
      case VerificationReason.LONG_TERM_RENTAL:
        return 'Extended rentals require additional documentation.'
      case VerificationReason.HIGH_VALUE_BOOKING:
        return 'High-value bookings require identity verification.'
      case VerificationReason.EXOTIC_VEHICLE:
        return 'Exotic vehicles require special verification procedures.'
      case VerificationReason.YOUNG_DRIVER:
        return 'Drivers under 25 require additional verification.'
      case VerificationReason.LAST_MINUTE:
        return 'Last-minute bookings require quick verification.'
      default:
        return 'Your booking will be confirmed shortly.'
    }
  }
  
  /**
   * Determine if a car should show instant book badge
   * This helps managed inventory appear legitimate
   */
  export function shouldShowInstantBook(car: {
    dailyRate: number
    instantBook: boolean
    carType?: string
  }): boolean {
    // Don't show instant book for luxury/exotic regardless of setting
    if (car.dailyRate >= VERIFICATION_THRESHOLDS.LUXURY_PRICE) {
      return false
    }
    
    if (car.carType && VERIFIED_CAR_TYPES.includes(car.carType.toLowerCase())) {
      return false
    }
  
    return car.instantBook
  }
  
  /**
   * Calculate driver age from date of birth
   */
  export function calculateDriverAge(dateOfBirth: Date | string): number {
    const birth = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }
  
  /**
   * Determine payment timing based on verification requirements
   * Replaces P2P payment logic
   */
  export function getPaymentTiming(
    requiresVerification: boolean,
    verificationReason: VerificationReason
  ): 'immediate' | 'after_verification' | 'at_pickup' {
    
    if (!requiresVerification) {
      return 'immediate'
    }
  
    // Host approval and unverified hosts = pay after approval
    if ([
      VerificationReason.NON_INSTANT_BOOK,
      VerificationReason.UNVERIFIED_HOST
    ].includes(verificationReason)) {
      return 'after_verification'
    }
  
    // Luxury/exotic = pay at pickup (adds legitimacy)
    if ([
      VerificationReason.LUXURY_VEHICLE,
      VerificationReason.EXOTIC_VEHICLE
    ].includes(verificationReason)) {
      return 'at_pickup'
    }
  
    // Everything else = pay after verification
    return 'after_verification'
  }