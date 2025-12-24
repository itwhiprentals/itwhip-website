// app/(guest)/rentals/lib/rental-utils.ts
// Helper functions for the rental system

import { format, differenceInDays, addDays, parseISO, isAfter, isBefore } from 'date-fns'
import { RentalCar, RentalBooking, RentalAvailability } from '@/app/lib/dal/types'

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

export function calculateRentalDays(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
  const days = differenceInDays(end, start)
  return days > 0 ? days : 1 // Minimum 1 day
}

export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
  
  if (format(start, 'MMM yyyy') === format(end, 'MMM yyyy')) {
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
  }
  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`
}

export function formatTime(time: string): string {
  // Convert "10:00" to "10:00 AM"
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

export function getDefaultPickupTime(): string {
  return '10:00'
}

export function getDefaultReturnTime(): string {
  return '10:00'
}

// ============================================================================
// AVAILABILITY UTILITIES
// ============================================================================

export function isCarAvailable(
  car: RentalCar & { availability?: RentalAvailability[], bookings?: RentalBooking[] },
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate

  // Check if car is active
  if (!car.isActive) return false

  // Check minimum and maximum trip duration
  const days = calculateRentalDays(start, end)
  if (days < car.minTripDuration || days > car.maxTripDuration) return false

  // Check availability calendar
  if (car.availability) {
    const dateRange = []
    let currentDate = start
    while (currentDate <= end) {
      dateRange.push(format(currentDate, 'yyyy-MM-dd'))
      currentDate = addDays(currentDate, 1)
    }

    for (const date of dateRange) {
      const availability = car.availability.find(a => 
        format(new Date(a.date), 'yyyy-MM-dd') === date
      )
      if (availability && !availability.isAvailable) {
        return false
      }
    }
  }

  // Check existing bookings
  if (car.bookings) {
    for (const booking of car.bookings) {
      if (booking.status === 'CANCELLED') continue
      
      const bookingStart = new Date(booking.startDate)
      const bookingEnd = new Date(booking.endDate)
      
      // Check for overlap
      if (
        (isAfter(start, bookingStart) && isBefore(start, bookingEnd)) ||
        (isAfter(end, bookingStart) && isBefore(end, bookingEnd)) ||
        (isBefore(start, bookingStart) && isAfter(end, bookingEnd)) ||
        (format(start, 'yyyy-MM-dd') === format(bookingStart, 'yyyy-MM-dd')) ||
        (format(end, 'yyyy-MM-dd') === format(bookingEnd, 'yyyy-MM-dd'))
      ) {
        return false
      }
    }
  }

  return true
}

export function getBlockedDates(
  car: RentalCar & { availability?: RentalAvailability[], bookings?: RentalBooking[] }
): string[] {
  const blockedDates: string[] = []

  // Add unavailable dates from availability calendar
  if (car.availability) {
    car.availability.forEach(a => {
      if (!a.isAvailable) {
        blockedDates.push(format(new Date(a.date), 'yyyy-MM-dd'))
      }
    })
  }

  // Add dates from confirmed bookings
  if (car.bookings) {
    car.bookings.forEach(booking => {
      if (booking.status !== 'CANCELLED') {
        let currentDate = new Date(booking.startDate)
        const endDate = new Date(booking.endDate)
        
        while (currentDate <= endDate) {
          blockedDates.push(format(currentDate, 'yyyy-MM-dd'))
          currentDate = addDays(currentDate, 1)
        }
      }
    })
  }

  return [...new Set(blockedDates)] // Remove duplicates
}

// ============================================================================
// PRICING UTILITIES
// ============================================================================

export function calculateBasePrice(
  dailyRate: number,
  numberOfDays: number,
  weeklyDiscount?: number | null,
  monthlyDiscount?: number | null
): number {
  let totalPrice = dailyRate * numberOfDays

  // Apply weekly discount if applicable
  if (numberOfDays >= 7 && numberOfDays < 30 && weeklyDiscount) {
    totalPrice = totalPrice * (1 - weeklyDiscount)
  }
  
  // Apply monthly discount if applicable
  if (numberOfDays >= 30 && monthlyDiscount) {
    totalPrice = totalPrice * (1 - monthlyDiscount)
  }

  return Math.round(totalPrice * 100) / 100
}

export function calculateInsuranceTotal(
  insuranceDaily: number,
  numberOfDays: number
): number {
  return Math.round(insuranceDaily * numberOfDays * 100) / 100
}

export function calculateServiceFee(subtotal: number): number {
  // 10% service fee
  return Math.round(subtotal * 0.10 * 100) / 100
}

export function calculateTaxes(subtotal: number): number {
  // 8.05% tax rate for Phoenix
  const TAX_RATE = 0.0805
  return Math.round(subtotal * TAX_RATE * 100) / 100
}

export function calculateTotalPrice(
  dailyRate: number,
  numberOfDays: number,
  options: {
    weeklyDiscount?: number | null
    monthlyDiscount?: number | null
    deliveryFee?: number
    insuranceDaily?: number
    includeInsurance?: boolean
  } = {}
): {
  subtotal: number
  deliveryFee: number
  insuranceFee: number
  serviceFee: number
  taxes: number
  total: number
  deposit: number
} {
  const subtotal = calculateBasePrice(
    dailyRate, 
    numberOfDays, 
    options.weeklyDiscount, 
    options.monthlyDiscount
  )
  
  const deliveryFee = options.deliveryFee || 0
  const insuranceFee = options.includeInsurance && options.insuranceDaily 
    ? calculateInsuranceTotal(options.insuranceDaily, numberOfDays)
    : 0
  
  const serviceFee = calculateServiceFee(subtotal + deliveryFee + insuranceFee)
  const taxes = calculateTaxes(subtotal + deliveryFee + insuranceFee + serviceFee)
  
  const total = subtotal + deliveryFee + insuranceFee + serviceFee + taxes
  const deposit = 500 // Fixed deposit amount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    insuranceFee: Math.round(insuranceFee * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    taxes: Math.round(taxes * 100) / 100,
    total: Math.round(total * 100) / 100,
    deposit
  }
}

// ============================================================================
// LOCATION UTILITIES
// ============================================================================

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula for distance between two points
  const R = 3959 // Radius of Earth in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function getDeliveryFee(distance: number): number {
  if (distance <= 10) return 0 // Free within 10 miles
  if (distance <= 25) return 35 // Flat fee for 10-25 miles
  return 35 + Math.ceil(distance - 25) * 2 // $2 per mile over 25
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export function formatMileage(miles: number): string {
  return new Intl.NumberFormat('en-US').format(miles)
}

export function getCarTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    economy: 'Economy',
    compact: 'Compact',
    midsize: 'Midsize',
    fullsize: 'Full Size',
    suv: 'SUV',
    luxury: 'Luxury',
    convertible: 'Convertible',
    minivan: 'Minivan',
    sports: 'Sports',
    electric: 'Electric',
    exotic: 'Exotic'
  }
  return labels[type.toLowerCase()] || type
}

export function getTransmissionLabel(transmission: string): string {
  return transmission.toLowerCase() === 'automatic' ? 'Automatic' : 'Manual'
}

export function getFuelTypeLabel(fuelType: string): string {
  const labels: Record<string, string> = {
    gas: 'Gasoline',
    electric: 'Electric',
    hybrid: 'Hybrid',
    diesel: 'Diesel'
  }
  return labels[fuelType.toLowerCase()] || fuelType
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function validateBookingDates(
  startDate: Date | string,
  endDate: Date | string
): { valid: boolean; error?: string } {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
  const now = new Date()
  
  // Start date must be in the future
  if (isBefore(start, now)) {
    return { valid: false, error: 'Start date must be in the future' }
  }
  
  // End date must be after start date
  if (!isAfter(end, start)) {
    return { valid: false, error: 'End date must be after start date' }
  }
  
  // Maximum booking period (e.g., 90 days)
  const maxDays = 90
  if (calculateRentalDays(start, end) > maxDays) {
    return { valid: false, error: `Maximum rental period is ${maxDays} days` }
  }
  
  return { valid: true }
}

export function validateDriverAge(birthDate: Date | string, minAge: number = 21): boolean {
  const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate
  const today = new Date()
  const age = differenceInDays(today, birth) / 365.25
  return age >= minAge
}

// ============================================================================
// SEARCH & FILTER UTILITIES
// ============================================================================

export function filterCarsByLocation(
  cars: any[],
  userLat: number,
  userLon: number,
  radiusMiles: number = 25
): any[] {
  return cars.filter(car => {
    if (!car.latitude || !car.longitude) return false
    const distance = calculateDistance(userLat, userLon, car.latitude, car.longitude)
    return distance <= radiusMiles
  })
}

export function sortCarsByPrice(cars: any[], ascending: boolean = true): any[] {
  return [...cars].sort((a, b) => {
    const priceA = a.dailyRate || 0
    const priceB = b.dailyRate || 0
    return ascending ? priceA - priceB : priceB - priceA
  })
}

export function sortCarsByDistance(
  cars: any[],
  userLat: number,
  userLon: number
): any[] {
  return [...cars].sort((a, b) => {
    const distA = calculateDistance(userLat, userLon, a.latitude || 0, a.longitude || 0)
    const distB = calculateDistance(userLat, userLon, b.latitude || 0, b.longitude || 0)
    return distA - distB
  })
}

// ============================================================================
// BOOKING CODE GENERATION
// ============================================================================

export function generateBookingCode(): string {
  const prefix = 'RENT'
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}-${random}`
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const rentalUtils = {
  // Date utilities
  calculateRentalDays,
  formatDateRange,
  formatTime,
  getDefaultPickupTime,
  getDefaultReturnTime,
  
  // Availability
  isCarAvailable,
  getBlockedDates,
  
  // Pricing
  calculateBasePrice,
  calculateInsuranceTotal,
  calculateServiceFee,
  calculateTaxes,
  calculateTotalPrice,
  
  // Location
  calculateDistance,
  getDeliveryFee,
  
  // Formatting
  formatPrice,
  formatMileage,
  getCarTypeLabel,
  getTransmissionLabel,
  getFuelTypeLabel,
  
  // Validation
  validateBookingDates,
  validateDriverAge,
  
  // Search & Filter
  filterCarsByLocation,
  sortCarsByPrice,
  sortCarsByDistance,
  
  // Booking
  generateBookingCode
}
// Currency formatting
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Check car availability for dates
export async function checkAvailability(
  carId: string,
  startDate: Date | string,
  endDate: Date | string
): Promise<boolean> {
  // For now, return true (available)
  // In production, this would check the database
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Basic validation
  if (start >= end) {
    return false
  }
  
  if (start < new Date()) {
    return false
  }
  
  // Mock availability check
  // In production: await prisma.rentalAvailability.findMany(...)
  return true
}
