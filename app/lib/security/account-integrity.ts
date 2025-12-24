// app/lib/security/account-integrity.ts
// Centralized logging utility for account integrity issues
// Used to track and monitor security issues like userId mismatches, orphaned profiles, etc.

export type AccountIntegrityIssueType =
  | 'userId_mismatch'
  | 'orphaned_profile'
  | 'duplicate_email'
  | 'invalid_userId'
  | 'cross_account_access'
  | 'missing_profile'

export interface AccountIntegrityContext {
  userId?: string
  profileId?: string
  email?: string
  profileType?: 'host' | 'guest'
  authenticatedUserId?: string
  profileUserId?: string
  [key: string]: any
}

/**
 * Log account integrity issues for monitoring and investigation
 *
 * @param type - The type of integrity issue detected
 * @param context - Additional context about the issue
 *
 * @example
 * logAccountIntegrityIssue('userId_mismatch', {
 *   authenticatedUserId: 'user123',
 *   profileUserId: 'user456',
 *   email: 'user@example.com',
 *   profileType: 'host'
 * })
 */
export function logAccountIntegrityIssue(
  type: AccountIntegrityIssueType,
  context: AccountIntegrityContext
) {
  const timestamp = new Date().toISOString()

  // Build structured log message
  const logData = {
    timestamp,
    severity: 'CRITICAL',
    category: 'ACCOUNT_INTEGRITY',
    type,
    ...context
  }

  // Log to console with appropriate emoji for visibility
  const emoji = getIssueEmoji(type)
  console.error(`${emoji} ACCOUNT INTEGRITY ISSUE: ${type}`, logData)

  // TODO: Send to monitoring service (Sentry, DataDog, etc.)
  // Example:
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(new Error(`Account Integrity: ${type}`), {
  //     level: 'error',
  //     tags: { category: 'account_integrity', type },
  //     extra: context
  //   })
  // }

  // TODO: Create admin notification for critical issues
  // Example:
  // if (['userId_mismatch', 'cross_account_access'].includes(type)) {
  //   await notifyAdmin({
  //     subject: `🚨 Critical Account Integrity Issue: ${type}`,
  //     body: JSON.stringify(logData, null, 2)
  //   })
  // }

  // TODO: Store in database for audit trail
  // Example:
  // await prisma.securityAuditLog.create({
  //   data: {
  //     type: 'ACCOUNT_INTEGRITY_ISSUE',
  //     severity: 'CRITICAL',
  //     details: logData,
  //     userId: context.userId || context.authenticatedUserId
  //   }
  // })
}

/**
 * Get appropriate emoji for issue type
 */
function getIssueEmoji(type: AccountIntegrityIssueType): string {
  switch (type) {
    case 'userId_mismatch':
      return '🚨' // Critical security issue
    case 'cross_account_access':
      return '🔴' // Severe security breach
    case 'orphaned_profile':
      return '⚠️' // Warning
    case 'invalid_userId':
      return '❌' // Error
    case 'duplicate_email':
      return '⚡' // Data integrity issue
    case 'missing_profile':
      return '🔍' // Investigation needed
    default:
      return '⚠️' // Default warning
  }
}

/**
 * Log successful account integrity validation
 * Use this for positive confirmation that security checks passed
 */
export function logAccountIntegritySuccess(
  operation: string,
  context: AccountIntegrityContext
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Account Integrity Check Passed: ${operation}`, {
      timestamp: new Date().toISOString(),
      ...context
    })
  }
}

/**
 * Validate that a profile's userId matches the authenticated user
 *
 * @returns true if valid, false if mismatch detected
 */
export function validateProfileUserId(
  authenticatedUserId: string,
  profileUserId: string | null | undefined,
  profileType: 'host' | 'guest',
  email: string
): boolean {
  // If profile has no userId, it's orphaned
  if (!profileUserId) {
    logAccountIntegrityIssue('orphaned_profile', {
      authenticatedUserId,
      profileType,
      email
    })
    return false
  }

  // If userId doesn't match authenticated user, it's a mismatch
  if (profileUserId !== authenticatedUserId) {
    logAccountIntegrityIssue('userId_mismatch', {
      authenticatedUserId,
      profileUserId,
      profileType,
      email
    })
    return false
  }

  // Validation passed
  return true
}
