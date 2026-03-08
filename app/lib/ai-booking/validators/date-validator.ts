// app/lib/ai-booking/validators/date-validator.ts
// Date validation utilities for booking dates

/**
 * Check if string is a valid ISO date format (YYYY-MM-DD)
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Check if date is in the future (Arizona timezone)
 */
export function isFutureDate(dateStr: string): boolean {
  if (!isValidDate(dateStr)) return false;

  // Arizona doesn't observe DST, so it's always MST (UTC-7)
  const now = new Date();
  const arizonaNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Phoenix' })
  );

  const date = new Date(dateStr + 'T00:00:00-07:00');
  return date >= arizonaNow;
}

/**
 * Check if date is today (Arizona timezone)
 */
export function isToday(dateStr: string): boolean {
  if (!isValidDate(dateStr)) return false;

  const now = new Date();
  const arizonaToday = now.toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
  return dateStr === arizonaToday;
}

/**
 * Calculate number of days between two dates
 * Returns at least 1 (minimum rental period)
 */
export function calculateDays(startDate: string, endDate: string): number {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return 1;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(diffDays, 1);
}

/**
 * Check if return date is after pickup date
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;

  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
}

/**
 * Validation result type
 */
export interface DateValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Check if a date+time combination is in the future (Arizona timezone)
 * Returns false if the time has already passed today
 */
export function isFutureDateTime(dateStr: string, timeStr: string): boolean {
  if (!isValidDate(dateStr)) return false;
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return true; // no time = skip check

  const now = new Date();
  const arizonaNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Phoenix' })
  );

  const [h, m] = timeStr.split(':').map(Number);
  const bookingDate = new Date(dateStr + 'T00:00:00-07:00');
  bookingDate.setHours(h, m, 0, 0);

  return bookingDate > arizonaNow;
}

/**
 * Validate complete booking date range
 */
export function validateBookingDates(
  pickupDate: string,
  returnDate: string,
  pickupTime?: string
): DateValidationResult {
  if (!pickupDate) {
    return { valid: false, error: 'Pickup date is required' };
  }

  if (!returnDate) {
    return { valid: false, error: 'Return date is required' };
  }

  if (!isValidDate(pickupDate)) {
    return { valid: false, error: 'Invalid pickup date format. Use YYYY-MM-DD' };
  }

  if (!isValidDate(returnDate)) {
    return { valid: false, error: 'Invalid return date format. Use YYYY-MM-DD' };
  }

  if (!isFutureDate(pickupDate)) {
    return { valid: false, error: 'Pickup date must be today or in the future' };
  }

  // If pickup is today, check that the time hasn't already passed
  if (pickupTime && isToday(pickupDate) && !isFutureDateTime(pickupDate, pickupTime)) {
    return { valid: false, error: 'Pickup time has already passed. Please select a later time.' };
  }

  if (!isValidDateRange(pickupDate, returnDate)) {
    return { valid: false, error: 'Return date must be after pickup date' };
  }

  const days = calculateDays(pickupDate, returnDate);
  if (days > 90) {
    return { valid: false, error: 'Maximum rental period is 90 days' };
  }

  return { valid: true };
}

/**
 * Get today's date in ISO format (Arizona timezone)
 */
export function getTodayISO(): string {
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
}

/**
 * Get tomorrow's date in ISO format (Arizona timezone)
 */
export function getTomorrowISO(): string {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
}

/**
 * Get a date N days from now in ISO format
 */
export function getDatePlusDaysISO(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
}
