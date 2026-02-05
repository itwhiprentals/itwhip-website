// app/lib/ai-booking/validators/index.ts
// Main export - combines all validation utilities

// Re-export date validators
export {
  isValidDate,
  isFutureDate,
  isToday,
  calculateDays,
  isValidDateRange,
  validateBookingDates,
  getTodayISO,
  getTomorrowISO,
  getDatePlusDaysISO,
  type DateValidationResult,
} from './date-validator';

// Re-export location validators
export {
  validateLocation,
  isOutOfServiceArea,
  getOutOfAreaMessage,
  getSuggestedCity,
  type LocationValidationResult,
} from './location-validator';

// Re-export message validators
export {
  validateMessage,
  sanitizeMessage,
  detectInjection,
  detectSpam,
  isEmptyMessage,
  MAX_MESSAGE_LENGTH,
  MIN_MESSAGE_LENGTH,
  type MessageValidationResult,
} from './message-validator';

/**
 * Combined validation for a complete booking request
 */
export interface BookingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all aspects of a booking request at once
 */
export function validateBookingRequest(params: {
  message?: string;
  location?: string;
  pickupDate?: string;
  returnDate?: string;
}): BookingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate message if provided
  if (params.message) {
    const { validateMessage } = require('./message-validator');
    const messageResult = validateMessage(params.message);
    if (!messageResult.valid && messageResult.error) {
      errors.push(messageResult.error);
    }
    if (messageResult.flags?.potentialInjection) {
      warnings.push('Message flagged for review');
    }
  }

  // Validate location if provided
  if (params.location) {
    const { validateLocation, isOutOfServiceArea } = require('./location-validator');
    if (isOutOfServiceArea(params.location)) {
      errors.push('Location is outside our service area (Arizona only)');
    } else {
      const locationResult = validateLocation(params.location);
      if (!locationResult.valid && locationResult.error) {
        errors.push(locationResult.error);
      }
    }
  }

  // Validate dates if both provided
  if (params.pickupDate && params.returnDate) {
    const { validateBookingDates } = require('./date-validator');
    const dateResult = validateBookingDates(params.pickupDate, params.returnDate);
    if (!dateResult.valid && dateResult.error) {
      errors.push(dateResult.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
