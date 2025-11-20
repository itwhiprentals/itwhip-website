// lib/validation/claimValidation.ts

/**
 * Claim Description Validation Constants and Functions
 * Shared between ClaimForm (create) and EditDescriptionModal (edit)
 */

// Constants
export const DESCRIPTION_MIN_LENGTH = 20
export const DESCRIPTION_MAX_LENGTH = 5000

// Tooltips and help text
export const DESCRIPTION_TOOLTIP = "Describe in detail what happened - more details the better"
export const DESCRIPTION_PLACEHOLDER = "Describe what happened, when it occurred, and the extent of the damage..."

/**
 * Validates claim description
 * @param description - The description text to validate
 * @returns Error message string if invalid, null if valid
 */
export const validateDescription = (description: string): string | null => {
  // Check if empty
  if (!description || description.trim().length === 0) {
    return 'Description is required'
  }

  // Check minimum length
  if (description.trim().length < DESCRIPTION_MIN_LENGTH) {
    return `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`
  }

  // Check maximum length
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return `Description is too long (max ${DESCRIPTION_MAX_LENGTH} characters)`
  }

  return null
}

/**
 * Formats character count display
 * @param length - Current character count
 * @returns Formatted string for display
 */
export const formatCharacterCount = (length: number): string => {
  return `${length} / ${DESCRIPTION_MIN_LENGTH} minimum`
}

/**
 * Checks if description meets minimum requirements
 * @param description - The description to check
 * @returns true if valid, false otherwise
 */
export const isDescriptionValid = (description: string): boolean => {
  return validateDescription(description) === null
}