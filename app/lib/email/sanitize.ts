// app/lib/email/sanitize.ts
// Email security utilities: HTML sanitization and unsubscribe checking

import { prisma } from '@/app/lib/database/prisma'

/**
 * Escape HTML special characters to prevent XSS in email templates.
 * Apply to ALL user-provided strings before interpolating into HTML.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Sanitize all string fields in a template data object.
 * Specify which fields contain user-provided data that needs escaping.
 * System-generated fields (URLs, bookingCodes) can be skipped.
 */
export function sanitizeTemplateData<T extends Record<string, unknown>>(
  data: T,
  fieldsToEscape: (keyof T)[]
): T {
  const sanitized = { ...data }
  for (const field of fieldsToEscape) {
    const value = sanitized[field]
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[field as string] = escapeHtml(value)
    }
  }
  return sanitized
}

/**
 * Check if an email address has unsubscribed from marketing emails.
 * Returns true if unsubscribed (do NOT send non-transactional emails).
 * Transactional emails (booking confirmations, security alerts) should always send.
 */
export async function isEmailUnsubscribed(email: string): Promise<boolean> {
  try {
    const preference = await prisma.emailPreference.findUnique({
      where: { email: email.toLowerCase().trim() }
    })
    return !!preference
  } catch (error) {
    console.error('[Email] Failed to check unsubscribe status:', error)
    // Fail open for transactional emails, but callers should handle this
    return false
  }
}
