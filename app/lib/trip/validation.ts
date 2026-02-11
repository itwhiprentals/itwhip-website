// app/lib/trip/validation.ts

import { TRIP_CONSTANTS } from './constants'

// TESTING MODE - Set to true to bypass all date/time validations
const TESTING_MODE = true

export interface ValidationResult {
  valid: boolean
  error?: string
}

export interface PhotoValidation extends ValidationResult {
  category?: string
  url?: string
}

// Validate odometer reading
export function validateOdometer(
  value: string | number,
  previousReading?: number
): ValidationResult {
  const reading = typeof value === 'string' ? parseInt(value, 10) : value
  
  if (isNaN(reading)) {
    return { valid: false, error: 'Invalid odometer reading' }
  }
  
  if (reading < 0) {
    return { valid: false, error: 'Odometer cannot be negative' }
  }
  
  if (reading > 999999) {
    return { valid: false, error: 'Odometer reading seems too high' }
  }
  
  if (previousReading && reading < previousReading) {
    return { valid: false, error: 'Odometer cannot be less than starting value' }
  }
  
  return { valid: true }
}

// Validate fuel level
export function validateFuelLevel(level: string): ValidationResult {
  if (!TRIP_CONSTANTS.FUEL_LEVELS.includes(level)) {
    return { 
      valid: false, 
      error: `Invalid fuel level. Must be one of: ${TRIP_CONSTANTS.FUEL_LEVELS.join(', ')}` 
    }
  }
  
  return { valid: true }
}

// Validate GPS coordinates
export function validateLocation(
  lat: number,
  lng: number,
  expectedLat?: number,
  expectedLng?: number,
  maxDistanceMeters: number = TRIP_CONSTANTS.PICKUP_RADIUS_METERS
): ValidationResult {
  // TESTING MODE - Skip location validation
  if (TESTING_MODE) {
    return { valid: true }
  }
  
  // Basic coordinate validation
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Invalid latitude' }
  }
  
  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Invalid longitude' }
  }
  
  // If expected location provided, check distance
  if (expectedLat && expectedLng) {
    const distance = calculateDistance(lat, lng, expectedLat, expectedLng)
    
    if (distance > maxDistanceMeters) {
      return { 
        valid: false, 
        error: `You must be within ${maxDistanceMeters}m of the pickup location` 
      }
    }
  }
  
  return { valid: true }
}

// Calculate distance between two coordinates in meters
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Validate inspection photos completeness
export function validateInspectionPhotos(
  photos: Record<string, string>,
  type: 'start' | 'end'
): ValidationResult {
  // TESTING MODE - Only require one photo for testing
  if (TESTING_MODE) {
    if (Object.keys(photos).length > 0) {
      return { valid: true }
    }
    return {
      valid: false,
      error: 'Please capture at least one photo for testing'
    }
  }
  
  const requiredPhotos = TRIP_CONSTANTS.REQUIRED_PHOTOS[type]
    .filter(photo => photo.required)
  
  const missingPhotos = requiredPhotos.filter(
    photo => !photos[photo.id]
  )
  
  if (missingPhotos.length > 0) {
    return {
      valid: false,
      error: `Missing required photos: ${missingPhotos.map(p => p.label).join(', ')}`
    }
  }
  
  return { valid: true }
}

// Validate photo file
export function validatePhotoFile(file: File): ValidationResult {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Photo must be JPEG, PNG, or WebP format' 
    }
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'Photo must be less than 10MB' 
    }
  }
  
  return { valid: true }
}

// Validate trip can start
export function canStartTrip(
  booking: any,
  currentTime: Date = new Date()
): ValidationResult {
  // TESTING MODE - Bypass all validations
  if (TESTING_MODE) {
    console.log('🧪 TESTING MODE: Bypassing all trip start validations')
    return { valid: true }
  }
  
  // Check booking status
  if (booking.status !== 'CONFIRMED') {
    return { 
      valid: false, 
      error: 'Booking must be confirmed to start trip' 
    }
  }
  
  // Check if trip already started
  if (booking.tripStartedAt) {
    return {
      valid: false,
      error: 'Trip has already been started'
    }
  }

  // Check onboarding is complete (DL + insurance uploaded)
  if (!booking.onboardingCompletedAt) {
    return {
      valid: false,
      error: 'Please complete onboarding (upload driver\'s license and insurance) before starting your trip'
    }
  }
  
  // Check time window
  const scheduledTime = new Date(booking.startDate)
  const [hours, minutes] = booking.startTime.split(':').map(Number)
  scheduledTime.setHours(hours, minutes, 0, 0)
  
  const earliestStart = new Date(
    scheduledTime.getTime() - TRIP_CONSTANTS.PICKUP_WINDOW_BEFORE_MINUTES * 60 * 1000
  )
  
  const latestStart = new Date(
    scheduledTime.getTime() + TRIP_CONSTANTS.PICKUP_WINDOW_AFTER_HOURS * 60 * 60 * 1000
  )
  
  if (currentTime < earliestStart) {
    const minutesUntil = Math.ceil((earliestStart.getTime() - currentTime.getTime()) / 60000)
    return { 
      valid: false, 
      error: `Trip can start in ${minutesUntil} minutes` 
    }
  }
  
  if (currentTime > latestStart) {
    return { 
      valid: false, 
      error: 'Trip window has expired. Please contact support.' 
    }
  }
  
  return { valid: true }
}