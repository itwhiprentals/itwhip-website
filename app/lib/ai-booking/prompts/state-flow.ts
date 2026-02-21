// app/lib/ai-booking/prompts/state-flow.ts
// Booking sequence and state context builders

import type { BookingSession } from '../types';

/**
 * Build context string showing current state and saved booking data
 */
export function buildStateContext(session: BookingSession): string {
  const saved: string[] = [];
  if (session.location) saved.push(`Location: ${session.location}`);
  if (session.startDate && session.endDate) {
    saved.push(`Dates: ${session.startDate} to ${session.endDate}`);
    if (session.startTime) saved.push(`Pickup time: ${session.startTime}`);
    if (session.endTime) saved.push(`Return time: ${session.endTime}`);
  }
  if (session.vehicleType) saved.push(`Preference: ${session.vehicleType}`);
  if (session.vehicleId) saved.push(`Selected vehicle: ${session.vehicleId}`);

  return `CURRENT STATE: ${session.state}
SAVED DATA:
${saved.length > 0 ? saved.map((s) => `  - ${s}`).join('\n') : '  (none yet)'}`;
}

/**
 * Build user context string showing login/verification status
 */
export function buildUserContext(isLoggedIn: boolean, isVerified: boolean): string {
  return `USER STATUS: logged_in=${isLoggedIn}, email_verified=${isVerified}${isVerified ? ' (can access booking data and proceed to checkout)' : ' (needs email OTP verification for booking status and checkout)'}`;
}

/**
 * The booking sequence instructions - order of steps
 */
export const BOOKING_SEQUENCE = `BOOKING SEQUENCE (follow this order):
1. LOCATION — Get where they need the car in Arizona
2. DATES — Get pickup and return dates (and optionally times)
3. VEHICLE — Show available options, get their selection
4. CONFIRM — Show full summary with pricing, get confirmation
5. HANDOFF — Direct to login/verify/payment as needed

IMPORTANT:
- Extract as much as possible from each message. If user says "Tesla in Scottsdale this weekend", extract location + dates + vehicle type in one go.
- Skip states that already have data. Don't re-ask for information already saved.
- Default times to 10:00 AM if user doesn't specify.
- "This weekend" means the upcoming Saturday-Sunday. "Tomorrow" means the next day. Resolve relative dates to actual ISO dates.
- Today's date is ${new Date().toISOString().split('T')[0]}.
- DATE CALCULATION: For "1 day" or single-day rentals, the endDate must be the day AFTER startDate (e.g. "tomorrow for 1 day" where tomorrow is 2026-02-01 → startDate=2026-02-01, endDate=2026-02-02). Never set startDate and endDate to the same day.
- "Anywhere" or "all of Arizona" → use location "Phoenix, AZ" with no carType filter (Phoenix search has 25-mile radius covering the metro).
- SHOW CARS REQUEST: If user asks to "see cars", "show cars", "need to see cars", or similar AND we already have location saved → IMMEDIATELY trigger a search. Use searchQuery to search. Don't ask for dates — use default dates (tomorrow + 3 days).
- NEVER say a booking is "confirmed" or "booked". You help users find and select a car — the actual booking happens during checkout (insurance → delivery → add-ons → payment). Say "selected" or "ready for checkout" instead.
- ALWAYS answer the user's question before moving to the next step. Never skip or ignore a question to rush through the flow.`;
