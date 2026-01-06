// app/lib/utils/booking-code-generator.ts

/**
 * Generates P2PR format booking codes
 * Format: P2PR[MAKE]-[6-DIGIT-ID]-[STATE][YEAR]
 * Example: P2PRLAMBSP-847293-AZ24
 */

interface BookingCodeParams {
    carMake: string
    carModel: string
    state: string
    tripStartDate: Date
  }
  
  /**
   * Extract letters only from car make/model for code
   * Max 6 characters
   */
  function extractCarLetters(make: string, model: string): string {
    // Combine make and model
    const combined = `${make} ${model}`
    
    // Remove all non-letter characters
    const lettersOnly = combined.replace(/[^A-Za-z]/g, '').toUpperCase()
    
    // Take first 6 characters
    return lettersOnly.substring(0, 6)
  }
  
  /**
   * Generate random 6-digit ID
   */
  function generateTripId(): string {
    // Generate random number between 100000 and 999999
    const randomNum = Math.floor(Math.random() * 900000) + 100000
    return randomNum.toString()
  }
  
  /**
   * Get 2-digit year from date
   */
  function getTwoDigitYear(date: Date): string {
    const year = date.getFullYear()
    return year.toString().substring(2) // Get last 2 digits
  }
  
  /**
   * Main function to generate booking code
   */
  export function generateBookingCode(params: BookingCodeParams): string {
    const { carMake, carModel, state, tripStartDate } = params
    
    // Extract car identifier (max 6 letters)
    const carLetters = extractCarLetters(carMake, carModel)
    
    // Generate random 6-digit trip ID
    const tripId = generateTripId()
    
    // Get state code (ensure uppercase, max 2 chars)
    const stateCode = state.toUpperCase().substring(0, 2)
    
    // Get 2-digit year
    const year = getTwoDigitYear(tripStartDate)
    
    // Combine all parts
    const bookingCode = `P2PR${carLetters}-${tripId}-${stateCode}${year}`
    
    return bookingCode
  }
  
  /**
   * Validate booking code format
   */
  export function isValidBookingCode(code: string): boolean {
    // Pattern: P2PR[LETTERS]-[6DIGITS]-[2LETTERS][2DIGITS]
    const pattern = /^P2PR[A-Z]{1,6}-\d{6}-[A-Z]{2}\d{2}$/
    return pattern.test(code)
  }
  
  /**
   * Parse booking code to extract components
   */
  export function parseBookingCode(code: string): {
    prefix: string
    carIdentifier: string
    tripId: string
    state: string
    year: string
  } | null {
    if (!isValidBookingCode(code)) {
      return null
    }
    
    // Split by hyphens
    const parts = code.split('-')
    
    if (parts.length !== 3) {
      return null
    }
    
    const prefix = 'P2PR'
    const carIdentifier = parts[0].substring(4) // Remove 'P2PR'
    const tripId = parts[1]
    const stateYear = parts[2]
    const state = stateYear.substring(0, 2)
    const year = stateYear.substring(2)
    
    return {
      prefix,
      carIdentifier,
      tripId,
      state,
      year
    }
  }
  
  /**
   * Generate multiple unique booking codes (useful for batch operations)
   */
  export async function generateUniqueBookingCodes(
    params: BookingCodeParams,
    count: number,
    existingCodes: string[] = []
  ): Promise<string[]> {
    const codes: string[] = []
    const existingSet = new Set(existingCodes)
    
    while (codes.length < count) {
      const code = generateBookingCode(params)
      
      // Ensure uniqueness
      if (!existingSet.has(code) && !codes.includes(code)) {
        codes.push(code)
        existingSet.add(code)
      }
    }
    
    return codes
  }
  
  // Export types
  export type { BookingCodeParams }