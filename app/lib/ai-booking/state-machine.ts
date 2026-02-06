// app/lib/ai-booking/state-machine.ts
// Booking state transitions, validation, and session management
// SDK-extractable — no framework-specific imports

import {
  BookingState,
  BookingSession,
  ChatMessage,
  ClaudeBookingOutput,
} from './types';

// Import date validators from dedicated module (avoid duplication)
import {
  isValidDate,
  isFutureDate,
  isValidDateRange,
  calculateDays,
} from './validators/date-validator';

// Re-export for backward compatibility with existing imports
export { isValidDate, isFutureDate, isValidDateRange, calculateDays };

// =============================================================================
// DEFAULT SESSION
// =============================================================================

/** Generate a unique session ID */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `choe_${timestamp}_${random}`
}

export function createInitialSession(): BookingSession {
  return {
    sessionId: generateSessionId(),
    state: BookingState.INIT,
    location: null,
    locationId: null,
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    vehicleType: null,
    vehicleId: null,
    messages: [],
    maxTotalBudget: null,
    rentalDays: null,
  };
}

// =============================================================================
// STATE ADVANCEMENT
// =============================================================================

/** Determines the furthest valid state based on what data is present */
export function computeNextState(session: BookingSession): BookingState {
  if (!session.location) return BookingState.COLLECTING_LOCATION;
  if (!session.startDate || !session.endDate) return BookingState.COLLECTING_DATES;
  if (!session.vehicleId) return BookingState.COLLECTING_VEHICLE;
  return BookingState.CONFIRMING;
}

/** Apply Claude's extracted data to session and advance state */
export function applyExtractedData(
  session: BookingSession,
  output: ClaudeBookingOutput
): BookingSession {
  const updated = { ...session };

  // Merge extracted fields
  const { extractedData } = output;
  if (extractedData.location) updated.location = extractedData.location;
  if (extractedData.locationId) updated.locationId = extractedData.locationId;
  if (extractedData.startDate) updated.startDate = extractedData.startDate;
  if (extractedData.endDate) updated.endDate = extractedData.endDate;
  if (extractedData.startTime) updated.startTime = extractedData.startTime;
  if (extractedData.endTime) updated.endTime = extractedData.endTime;
  if (extractedData.vehicleType) updated.vehicleType = extractedData.vehicleType;
  if (extractedData.vehicleId) updated.vehicleId = extractedData.vehicleId;

  // Always compute state from data — Claude's suggestion is secondary
  const computed = computeNextState(updated);
  updated.state = computed;

  // Override: if Claude says START_OVER action, reset (preserve sessionId)
  if (output.action === 'START_OVER') {
    const newSession = createInitialSession()
    newSession.sessionId = session.sessionId // Keep same session ID for tracking
    return newSession
  }

  return updated;
}

// =============================================================================
// ADD MESSAGE TO SESSION
// =============================================================================

/** Append a message to the session, keeping last 20 messages max */
export function addMessage(
  session: BookingSession,
  role: 'user' | 'assistant',
  content: string
): BookingSession {
  const message: ChatMessage = {
    role,
    content,
    timestamp: Date.now(),
  };

  const messages = [...session.messages, message].slice(-20);
  return { ...session, messages };
}

// =============================================================================
// VALIDATION
// =============================================================================

// Note: isValidDate, isFutureDate, isValidDateRange, calculateDays are imported
// from ./validators/date-validator.ts and re-exported above for backward compatibility

/** Validate session has minimum required data for a given state */
export function validateForState(
  session: BookingSession,
  targetState: BookingState
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (stateOrder(targetState) > stateOrder(BookingState.COLLECTING_LOCATION)) {
    if (!session.location) missing.push('location');
  }

  if (stateOrder(targetState) > stateOrder(BookingState.COLLECTING_DATES)) {
    if (!session.startDate) missing.push('startDate');
    if (!session.endDate) missing.push('endDate');
  }

  if (stateOrder(targetState) > stateOrder(BookingState.COLLECTING_VEHICLE)) {
    if (!session.vehicleId) missing.push('vehicleId');
  }

  return { valid: missing.length === 0, missing };
}

// =============================================================================
// HELPERS
// =============================================================================

function stateOrder(state: BookingState): number {
  const order: Record<BookingState, number> = {
    [BookingState.INIT]: 0,
    [BookingState.COLLECTING_LOCATION]: 1,
    [BookingState.COLLECTING_DATES]: 2,
    [BookingState.COLLECTING_VEHICLE]: 3,
    [BookingState.CONFIRMING]: 4,
    [BookingState.CHECKING_AUTH]: 5,
    [BookingState.READY_FOR_PAYMENT]: 6,
  };
  return order[state] ?? 0;
}

// =============================================================================
// DEFAULT DATES
// =============================================================================

/**
 * Generate default dates for search when user hasn't specified
 * Returns tomorrow + 3 days as a reasonable default rental period
 */
export function getDefaultDates(): { startDate: string; endDate: string } {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const endDate = new Date(tomorrow);
  endDate.setDate(endDate.getDate() + 3);

  return {
    startDate: tomorrow.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * Check if a message suggests user wants default dates
 * e.g., "just show me", "doesn't matter", "any dates", "whatever works"
 */
export function wantsDefaultDates(message: string): boolean {
  const patterns = [
    /\bjust show\b/i,
    /\bdoesn'?t matter\b/i,
    /\bany date/i,
    /\bwhatever\b/i,
    /\bflexible\b/i,
    /\bdon'?t care\b/i,
    /\bwhen.?ever\b/i,
  ];
  return patterns.some(p => p.test(message));
}
