// app/lib/ai-booking/parse-response.ts
// Parses and validates Claude's structured JSON output
// SDK-extractable — no framework-specific imports

import { BookingState, ClaudeBookingOutput } from './types';

// =============================================================================
// PARSE CLAUDE RESPONSE
// =============================================================================

/** Parse Claude's raw text response into structured booking output */
export function parseClaudeResponse(raw: string): ClaudeBookingOutput {
  // Try to extract JSON from the response
  const jsonStr = extractJson(raw);

  if (!jsonStr) {
    // Claude didn't return valid JSON — create a fallback
    return createFallbackResponse(raw);
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return validateAndNormalize(parsed);
  } catch {
    // Try sanitizing common JSON issues (unescaped newlines in strings)
    try {
      const sanitized = sanitizeJson(jsonStr);
      const parsed = JSON.parse(sanitized);
      return validateAndNormalize(parsed);
    } catch {
      return createFallbackResponse(raw);
    }
  }
}

// =============================================================================
// JSON EXTRACTION
// =============================================================================

/** Extract JSON object from Claude's response (handles markdown code blocks too) */
function extractJson(raw: string): string | null {
  // Try direct parse first
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  // Try extracting from markdown code block
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try finding the first JSON object
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return null;
}

// =============================================================================
// VALIDATION & NORMALIZATION
// =============================================================================

function validateAndNormalize(parsed: Record<string, unknown>): ClaudeBookingOutput {
  // Validate reply
  const reply = typeof parsed.reply === 'string' && parsed.reply.length > 0
    ? parsed.reply
    : "I'm here to help you find a car. What are you looking for?";

  // Validate nextState
  const nextState = isValidState(parsed.nextState)
    ? (parsed.nextState as BookingState)
    : BookingState.INIT;

  // Validate extractedData
  const extractedData = normalizeExtractedData(
    typeof parsed.extractedData === 'object' && parsed.extractedData !== null
      ? (parsed.extractedData as Record<string, unknown>)
      : {}
  );

  // Validate action (convert 'NONE' to null)
  const rawAction = parsed.action === 'NONE' ? null : parsed.action;
  const action = isValidAction(rawAction) ? (rawAction as ClaudeBookingOutput['action']) : null;

  // Validate searchQuery
  const searchQuery = normalizeSearchQuery(parsed.searchQuery);

  return { reply, nextState, extractedData, action, searchQuery };
}

function isValidState(state: unknown): boolean {
  return typeof state === 'string' && Object.values(BookingState).includes(state as BookingState);
}

function isValidAction(action: unknown): boolean {
  if (action === null || action === undefined || action === 'NONE') return true;
  const validActions = ['HANDOFF_TO_PAYMENT', 'NEEDS_LOGIN', 'NEEDS_VERIFICATION', 'HIGH_RISK_REVIEW', 'START_OVER', 'NEEDS_EMAIL_OTP'];
  return typeof action === 'string' && validActions.includes(action);
}

function normalizeExtractedData(
  data: Record<string, unknown>
): ClaudeBookingOutput['extractedData'] {
  const result: ClaudeBookingOutput['extractedData'] = {};

  if (typeof data.location === 'string' && data.location.length > 0) {
    result.location = data.location;
  }
  if (typeof data.locationId === 'string' && data.locationId.length > 0) {
    result.locationId = data.locationId;
  }
  if (typeof data.startDate === 'string' && isIsoDate(data.startDate)) {
    result.startDate = data.startDate;
  }
  if (typeof data.endDate === 'string' && isIsoDate(data.endDate)) {
    result.endDate = data.endDate;
  }
  if (typeof data.startTime === 'string') {
    result.startTime = data.startTime;
  }
  if (typeof data.endTime === 'string') {
    result.endTime = data.endTime;
  }
  if (typeof data.vehicleType === 'string' && data.vehicleType.length > 0) {
    result.vehicleType = data.vehicleType;
  }
  if (typeof data.vehicleId === 'string' && data.vehicleId.length > 0) {
    result.vehicleId = data.vehicleId;
  }

  return result;
}

function normalizeSearchQuery(
  query: unknown
): ClaudeBookingOutput['searchQuery'] {
  if (!query || typeof query !== 'object') return null;

  const q = query as Record<string, unknown>;
  const result: Record<string, string | number> = {};

  const stringFields = ['location', 'carType', 'pickupDate', 'returnDate', 'pickupTime', 'returnTime', 'make', 'transmission'];
  const numberFields = ['priceMin', 'priceMax', 'seats'];

  for (const field of stringFields) {
    if (typeof q[field] === 'string' && q[field]) {
      result[field] = q[field] as string;
    }
  }

  for (const field of numberFields) {
    if (typeof q[field] === 'number' && !isNaN(q[field] as number)) {
      result[field] = q[field] as number;
    }
  }

  return Object.keys(result).length > 0 ? (result as ClaudeBookingOutput['searchQuery']) : null;
}

// =============================================================================
// FALLBACK
// =============================================================================

function createFallbackResponse(raw: string): ClaudeBookingOutput {
  let reply = "Sorry, I had a moment there. What kind of car are you looking for in Arizona?";

  if (raw.trim().length > 0) {
    // If the raw text looks like JSON, try to extract just the reply field
    const replyMatch = raw.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (replyMatch) {
      reply = replyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    } else {
      // Use raw text but strip any JSON-like content
      const cleaned = raw.trim().replace(/^\{[\s\S]*\}$/, '').trim();
      reply = cleaned.length > 0 ? cleaned.slice(0, 500) : reply;
    }
  }

  return {
    reply,
    nextState: BookingState.INIT,
    extractedData: {},
    action: null,
    searchQuery: null,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

/** Sanitize common JSON issues from LLM output */
function sanitizeJson(str: string): string {
  // Replace literal newlines inside string values with \\n
  // Match content between quotes and escape real newlines
  return str.replace(/"([^"]*?)"/g, (match, content) => {
    const escaped = content
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `"${escaped}"`;
  });
}

function isIsoDate(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str).getTime());
}
