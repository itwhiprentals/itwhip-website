// app/lib/twilio/phone.ts
// Phone number normalization and validation

/**
 * Normalize any phone format to E.164 (+1XXXXXXXXXX)
 * Returns null if normalization fails — caller should skip SMS silently
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null

  // Strip all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '')
  const digits = cleaned.replace(/\D/g, '')

  // US 10-digit: 6025551234 → +16025551234
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // US 11-digit with country code: 16025551234 → +16025551234
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  // Already has + prefix and looks valid
  if (cleaned.startsWith('+') && digits.length >= 11) {
    return `+${digits}`
  }

  // Can't normalize — skip silently
  return null
}

/**
 * Strip to last 10 digits for DB lookup matching
 * Handles inconsistent storage formats in ReviewerProfile.phoneNumber and RentalHost.phone
 */
export function normalizeForLookup(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // Take last 10 digits (strips country code)
  return digits.slice(-10)
}

/**
 * Check if a phone number is a US number
 * International numbers are not supported for SMS (higher cost, different regulations)
 */
export function isUsNumber(phone: string): boolean {
  const normalized = normalizePhone(phone)
  if (!normalized) return false
  return normalized.startsWith('+1') && normalized.length === 12
}
