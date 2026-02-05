// app/lib/ai-booking/validators/message-validator.ts
// Message validation and sanitization utilities

/**
 * Maximum allowed message length
 */
export const MAX_MESSAGE_LENGTH = 500;

/**
 * Minimum message length (to filter spam/noise)
 */
export const MIN_MESSAGE_LENGTH = 1;

/**
 * Validation result type
 */
export interface MessageValidationResult {
  valid: boolean;
  sanitizedMessage?: string;
  error?: string;
  flags?: {
    tooLong?: boolean;
    tooShort?: boolean;
    potentialInjection?: boolean;
    spam?: boolean;
  };
}

/**
 * Patterns that may indicate prompt injection attempts
 */
const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior|above) (instructions|prompts|commands)/i,
  /disregard (all )?(previous|prior|above)/i,
  /you are now/i,
  /new instructions:/i,
  /system prompt:/i,
  /\[system\]/i,
  /\[assistant\]/i,
  /\[user\]/i,
  /act as (a |an )?/i,
  /pretend (to be|you('re| are))/i,
  /roleplay as/i,
  /jailbreak/i,
  /bypass/i,
  /override/i,
  /{{.*}}/,  // Template injection
  /<script/i,
  /<\/script>/i,
  /javascript:/i,
];

/**
 * Spam patterns
 */
const SPAM_PATTERNS = [
  /(.)\1{10,}/, // Repeated characters
  /\b(http|https|www\.)\S+/gi, // URLs
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Emails (likely spam)
  /\b\d{10,}\b/, // Long numbers (phone numbers, etc.)
  /buy now|click here|free money|winner|congratulations/i,
];

/**
 * Check for potential prompt injection
 */
export function detectInjection(message: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Check for spam patterns
 */
export function detectSpam(message: string): boolean {
  return SPAM_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Sanitize message content
 * Removes potentially harmful content while preserving legitimate input
 */
export function sanitizeMessage(message: string): string {
  let sanitized = message.trim();

  // Remove null bytes and other control characters (except newlines)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize whitespace (collapse multiple spaces/newlines)
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Remove any HTML-like tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Truncate to max length
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    sanitized = sanitized.substring(0, MAX_MESSAGE_LENGTH);
  }

  return sanitized;
}

/**
 * Validate message content
 */
export function validateMessage(message: string): MessageValidationResult {
  const flags: MessageValidationResult['flags'] = {};

  // Check for empty/missing
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  // Check length
  if (message.length > MAX_MESSAGE_LENGTH) {
    flags.tooLong = true;
    return {
      valid: false,
      error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`,
      flags,
    };
  }

  if (message.trim().length < MIN_MESSAGE_LENGTH) {
    flags.tooShort = true;
    return {
      valid: false,
      error: 'Message too short.',
      flags,
    };
  }

  // Check for injection
  if (detectInjection(message)) {
    flags.potentialInjection = true;
    // Don't reject, but flag it - security layer will handle
  }

  // Check for spam
  if (detectSpam(message)) {
    flags.spam = true;
    // Don't reject, but flag it
  }

  // Sanitize and return
  const sanitizedMessage = sanitizeMessage(message);

  return {
    valid: true,
    sanitizedMessage,
    flags: Object.keys(flags).length > 0 ? flags : undefined,
  };
}

/**
 * Check if message is just whitespace or punctuation
 */
export function isEmptyMessage(message: string): boolean {
  // Remove all whitespace and common punctuation
  const stripped = message.replace(/[\s.,!?;:'"()-]/g, '');
  return stripped.length === 0;
}
