// app/lib/utils/guest-email-generator.ts

/**
 * Generates guest emails from reviewer names
 * Format: firstname.lastname@guest.itwhip.com
 * Examples:
 *   "Evelyn M." → evelyn.m@guest.itwhip.com
 *   "Christopher R." → christopher.r@guest.itwhip.com
 *   "Steve" → steve@guest.itwhip.com
 */

const EMAIL_DOMAIN = 'guest.itwhip.com'

/**
 * Clean and format name for email
 */
function cleanNameForEmail(name: string): string {
  // Convert to lowercase
  let cleaned = name.toLowerCase().trim()
  
  // Remove any special characters except spaces, dots, and hyphens
  cleaned = cleaned.replace(/[^a-z0-9\s\.\-]/g, '')
  
  // Replace multiple spaces with single space
  cleaned = cleaned.replace(/\s+/g, ' ')
  
  return cleaned
}

/**
 * Convert name to email username
 */
function nameToEmailUsername(name: string): string {
  const cleaned = cleanNameForEmail(name)
  
  // Replace spaces with dots
  const username = cleaned.replace(/\s+/g, '.')
  
  // Remove any trailing or leading dots
  return username.replace(/^\.+|\.+$/g, '')
}

/**
 * Generate email from reviewer name
 */
export function generateGuestEmail(name: string, suffix?: number): string {
  if (!name || name.trim() === '') {
    // Fallback for empty names
    const randomId = Math.floor(Math.random() * 100000)
    return `guest${randomId}@${EMAIL_DOMAIN}`
  }
  
  // Convert name to username
  const username = nameToEmailUsername(name)
  
  // Add suffix if provided (for handling duplicates)
  const finalUsername = suffix ? `${username}${suffix}` : username
  
  // Construct email
  return `${finalUsername}@${EMAIL_DOMAIN}`
}

/**
 * Check if email is valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate unique email, checking against existing emails
 */
export function generateUniqueGuestEmail(
  name: string,
  existingEmails: string[] = []
): string {
  // Convert existing emails to Set for faster lookup
  const existingSet = new Set(existingEmails.map(e => e.toLowerCase()))
  
  // Try base email first
  let email = generateGuestEmail(name)
  
  if (!existingSet.has(email.toLowerCase())) {
    return email
  }
  
  // If base email exists, try with numeric suffixes
  let suffix = 2
  while (suffix < 1000) { // Prevent infinite loop
    email = generateGuestEmail(name, suffix)
    
    if (!existingSet.has(email.toLowerCase())) {
      return email
    }
    
    suffix++
  }
  
  // Fallback: use random number
  const randomId = Math.floor(Math.random() * 1000000)
  return `${nameToEmailUsername(name)}.${randomId}@${EMAIL_DOMAIN}`
}

/**
 * Batch generate unique emails for multiple reviewers
 */
export function generateUniqueGuestEmails(
  names: string[],
  existingEmails: string[] = []
): Map<string, string> {
  const emailMap = new Map<string, string>()
  const allExistingEmails = [...existingEmails]
  
  for (const name of names) {
    const email = generateUniqueGuestEmail(name, allExistingEmails)
    emailMap.set(name, email)
    
    // Add to existing list to prevent duplicates in this batch
    allExistingEmails.push(email)
  }
  
  return emailMap
}

/**
 * Extract name from email (reverse operation)
 */
export function extractNameFromEmail(email: string): string {
  // Get username part before @
  const username = email.split('@')[0]
  
  if (!username) {
    return 'Guest'
  }
  
  // Replace dots with spaces
  let name = username.replace(/\./g, ' ')
  
  // Remove numeric suffixes (e.g., "evelyn m2" → "evelyn m")
  name = name.replace(/\d+$/, '').trim()
  
  // Capitalize first letter of each word
  name = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return name
}

/**
 * Validate that email is a guest.itwhip.com email
 */
export function isGuestEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${EMAIL_DOMAIN}`)
}

/**
 * Get email domain
 */
export function getEmailDomain(): string {
  return EMAIL_DOMAIN
}

// Export types
export interface EmailGenerationResult {
  name: string
  email: string
  isDuplicate: boolean
}

/**
 * Generate emails with metadata about duplicates
 */
export function generateGuestEmailsWithMetadata(
  names: string[],
  existingEmails: string[] = []
): EmailGenerationResult[] {
  const results: EmailGenerationResult[] = []
  const existingSet = new Set(existingEmails.map(e => e.toLowerCase()))
  const allEmails = [...existingEmails]
  
  for (const name of names) {
    const baseEmail = generateGuestEmail(name)
    const isDuplicate = existingSet.has(baseEmail.toLowerCase())
    
    const email = generateUniqueGuestEmail(name, allEmails)
    
    results.push({
      name,
      email,
      isDuplicate
    })
    
    allEmails.push(email)
    existingSet.add(email.toLowerCase())
  }
  
  return results
}