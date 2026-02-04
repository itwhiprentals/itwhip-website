// app/lib/services/identityResolution.ts
// Identity Resolution System - 1 Person = 1 Account
// Prevents duplicate accounts and catches suspended users trying to re-register

import { prisma } from '@/app/lib/database/prisma'

// Types
export type IdentifierType = 'phone' | 'email' | 'driver_license' | 'vin'

export type ResolutionAction =
  | 'CREATE_NEW'         // No matches found, create new account
  | 'LINK_TO_EXISTING'   // Identifier matches existing user, link to that account
  | 'BLOCK_SUSPENDED'    // Identifier is in suspension blocklist
  | 'CONFLICT'           // Multiple conflicting matches (needs manual resolution)

export interface IdentityCheckResult {
  action: ResolutionAction
  existingUserId?: string
  existingHostId?: string
  existingGuestId?: string
  suspensionReason?: string
  matchedIdentifiers: string[]
  message?: string
}

export interface IdentityCheckInput {
  phone?: string
  email?: string
  driverLicenseNumber?: string
  driverLicenseState?: string
  vin?: string
}

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Normalize phone number to 10 digits (US format)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return ''
  // Remove all non-digits, then take last 10 digits
  const digits = phone.replace(/\D/g, '')
  return digits.slice(-10)
}

/**
 * Normalize email to lowercase, trimmed
 */
export function normalizeEmail(email: string): string {
  if (!email) return ''
  return email.toLowerCase().trim()
}

/**
 * Normalize driver license to "STATE-NUMBER" format
 */
export function normalizeDriverLicense(state: string, number: string): string {
  if (!state || !number) return ''
  return `${state.toUpperCase()}-${number.toUpperCase().replace(/\s/g, '')}`
}

/**
 * Normalize VIN to uppercase, alphanumeric only
 * VINs are 17 characters, exclude I, O, Q
 */
export function normalizeVin(vin: string): string {
  if (!vin) return ''
  return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
}

// ============================================================================
// SUSPENSION CHECK
// ============================================================================

/**
 * Check if any of the provided identifiers are in the suspension blocklist
 */
export async function checkSuspendedIdentifiers(
  identifiers: IdentityCheckInput
): Promise<{ blocked: boolean; reason?: string; identifierType?: string }> {
  const checks: { type: IdentifierType; value: string }[] = []

  if (identifiers.phone) {
    checks.push({ type: 'phone', value: normalizePhone(identifiers.phone) })
  }
  if (identifiers.email) {
    checks.push({ type: 'email', value: normalizeEmail(identifiers.email) })
  }
  if (identifiers.driverLicenseNumber && identifiers.driverLicenseState) {
    checks.push({
      type: 'driver_license',
      value: normalizeDriverLicense(identifiers.driverLicenseState, identifiers.driverLicenseNumber)
    })
  }
  if (identifiers.vin) {
    checks.push({ type: 'vin', value: normalizeVin(identifiers.vin) })
  }

  if (checks.length === 0) {
    return { blocked: false }
  }

  // Check each identifier against the blocklist
  for (const check of checks) {
    const suspended = await prisma.suspendedIdentifier.findUnique({
      where: {
        identifierType_identifierValue: {
          identifierType: check.type,
          identifierValue: check.value
        }
      }
    })

    if (suspended) {
      // Check if suspension has expired
      if (suspended.expiresAt && suspended.expiresAt < new Date()) {
        // Suspension expired, remove it
        await prisma.suspendedIdentifier.delete({
          where: { id: suspended.id }
        })
        continue
      }

      return {
        blocked: true,
        reason: suspended.reason,
        identifierType: check.type
      }
    }
  }

  return { blocked: false }
}

// ============================================================================
// IDENTITY LINK MATCHING
// ============================================================================

/**
 * Find existing IdentityLink records that match the provided identifiers
 */
async function findMatchingIdentityLinks(
  identifiers: IdentityCheckInput
): Promise<Array<{ userId: string; identifierType: string; identifierValue: string }>> {
  const orConditions: Array<{ identifierType: string; identifierValue: string }> = []

  if (identifiers.phone) {
    orConditions.push({
      identifierType: 'phone',
      identifierValue: normalizePhone(identifiers.phone)
    })
  }
  if (identifiers.email) {
    orConditions.push({
      identifierType: 'email',
      identifierValue: normalizeEmail(identifiers.email)
    })
  }
  if (identifiers.driverLicenseNumber && identifiers.driverLicenseState) {
    orConditions.push({
      identifierType: 'driver_license',
      identifierValue: normalizeDriverLicense(identifiers.driverLicenseState, identifiers.driverLicenseNumber)
    })
  }
  if (identifiers.vin) {
    orConditions.push({
      identifierType: 'vin',
      identifierValue: normalizeVin(identifiers.vin)
    })
  }

  if (orConditions.length === 0) {
    return []
  }

  const links = await prisma.identityLink.findMany({
    where: { OR: orConditions },
    select: {
      userId: true,
      identifierType: true,
      identifierValue: true
    }
  })

  return links
}

// ============================================================================
// LEGACY ACCOUNT MATCHING
// ============================================================================

/**
 * Check existing User/Host/Guest records for matching identifiers
 * This handles accounts created before the IdentityLink system
 */
async function checkLegacyAccounts(
  identifiers: IdentityCheckInput
): Promise<{ userId?: string; hostId?: string; guestId?: string; matchedOn: string[] } | null> {
  const matchedOn: string[] = []
  let userId: string | undefined
  let hostId: string | undefined
  let guestId: string | undefined

  // Check User by phone or email
  if (identifiers.phone || identifiers.email) {
    const userWhere: any = { OR: [] }
    if (identifiers.phone) {
      userWhere.OR.push({ phone: normalizePhone(identifiers.phone) })
    }
    if (identifiers.email) {
      userWhere.OR.push({ email: normalizeEmail(identifiers.email) })
    }

    const user = await prisma.user.findFirst({
      where: userWhere,
      select: {
        id: true,
        phone: true,
        email: true,
        rentalHost: { select: { id: true } },
        reviewerProfile: { select: { id: true } }
      }
    })

    if (user) {
      userId = user.id
      hostId = user.rentalHost?.id
      guestId = user.reviewerProfile?.id

      if (identifiers.phone && user.phone === normalizePhone(identifiers.phone)) {
        matchedOn.push('phone')
      }
      if (identifiers.email && user.email === normalizeEmail(identifiers.email)) {
        matchedOn.push('email')
      }
    }
  }

  // Check RentalHost by email (may exist without linked User)
  if (!hostId && identifiers.email) {
    const host = await prisma.rentalHost.findUnique({
      where: { email: normalizeEmail(identifiers.email) },
      select: { id: true, userId: true }
    })
    if (host) {
      hostId = host.id
      if (!userId && host.userId) {
        userId = host.userId
      }
      if (!matchedOn.includes('email')) {
        matchedOn.push('email (host)')
      }
    }
  }

  // Check ReviewerProfile by email (may exist without linked User)
  if (!guestId && identifiers.email) {
    const guest = await prisma.reviewerProfile.findUnique({
      where: { email: normalizeEmail(identifiers.email) },
      select: { id: true, userId: true }
    })
    if (guest) {
      guestId = guest.id
      if (!userId && guest.userId) {
        userId = guest.userId
      }
      if (!matchedOn.includes('email') && !matchedOn.includes('email (host)')) {
        matchedOn.push('email (guest)')
      }
    }
  }

  // Check RentalCar by VIN (get the host who owns it)
  if (identifiers.vin) {
    const car = await prisma.rentalCar.findUnique({
      where: { vin: normalizeVin(identifiers.vin) },
      select: {
        hostId: true,
        host: {
          select: { userId: true }
        }
      }
    })
    if (car) {
      if (!hostId) hostId = car.hostId
      if (!userId && car.host.userId) userId = car.host.userId
      matchedOn.push('vin')
    }
  }

  // Check ReviewerProfile by driver license
  if (identifiers.driverLicenseNumber && identifiers.driverLicenseState) {
    const guest = await prisma.reviewerProfile.findFirst({
      where: {
        driverLicenseNumber: identifiers.driverLicenseNumber.toUpperCase().replace(/\s/g, ''),
        driverLicenseState: identifiers.driverLicenseState.toUpperCase()
      },
      select: { id: true, userId: true }
    })
    if (guest) {
      if (!guestId) guestId = guest.id
      if (!userId && guest.userId) userId = guest.userId
      matchedOn.push('driver_license')
    }
  }

  if (matchedOn.length === 0) {
    return null
  }

  return { userId, hostId, guestId, matchedOn }
}

// ============================================================================
// MAIN RESOLUTION FUNCTION
// ============================================================================

/**
 * Main function called during signup/registration
 * Determines whether to create a new account, link to existing, or block
 */
export async function resolveIdentity(
  identifiers: IdentityCheckInput
): Promise<IdentityCheckResult> {
  // 1. Check suspended blocklist first (highest priority)
  const suspended = await checkSuspendedIdentifiers(identifiers)
  if (suspended.blocked) {
    return {
      action: 'BLOCK_SUSPENDED',
      suspensionReason: suspended.reason,
      matchedIdentifiers: [suspended.identifierType || 'unknown'],
      // SECURITY: Generic message - don't reveal which identifier triggered the block
      message: 'Unable to create account at this time'
    }
  }

  // 2. Check IdentityLink table for matches
  const links = await findMatchingIdentityLinks(identifiers)
  if (links.length > 0) {
    // Check if all links point to the same user
    const uniqueUserIds = [...new Set(links.map(l => l.userId))]

    if (uniqueUserIds.length === 1) {
      // All links point to same user -> LINK_TO_EXISTING
      const userId = uniqueUserIds[0]

      // Get additional info about the user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          rentalHost: { select: { id: true } },
          reviewerProfile: { select: { id: true } }
        }
      })

      return {
        action: 'LINK_TO_EXISTING',
        existingUserId: userId,
        existingHostId: user?.rentalHost?.id,
        existingGuestId: user?.reviewerProfile?.id,
        matchedIdentifiers: links.map(l => l.identifierType)
      }
    } else {
      // Links point to different users -> CONFLICT (needs manual resolution)
      return {
        action: 'CONFLICT',
        matchedIdentifiers: links.map(l => `${l.identifierType}:${l.userId}`),
        message: 'Multiple accounts found with these identifiers. Please contact support.'
      }
    }
  }

  // 3. Legacy check: Direct DB queries for existing accounts
  const legacyMatch = await checkLegacyAccounts(identifiers)
  if (legacyMatch && (legacyMatch.userId || legacyMatch.hostId || legacyMatch.guestId)) {
    return {
      action: 'LINK_TO_EXISTING',
      existingUserId: legacyMatch.userId,
      existingHostId: legacyMatch.hostId,
      existingGuestId: legacyMatch.guestId,
      matchedIdentifiers: legacyMatch.matchedOn
    }
  }

  // 4. No matches -> CREATE_NEW
  return {
    action: 'CREATE_NEW',
    matchedIdentifiers: []
  }
}

// ============================================================================
// IDENTITY LINK MANAGEMENT
// ============================================================================

/**
 * Link a new identifier to a user account
 * Called after account creation or when adding new identifiers
 */
export async function linkIdentifier(
  userId: string,
  type: IdentifierType,
  value: string,
  options: { isPrimary?: boolean; verified?: boolean } = {}
): Promise<void> {
  let normalizedValue: string

  switch (type) {
    case 'phone':
      normalizedValue = normalizePhone(value)
      break
    case 'email':
      normalizedValue = normalizeEmail(value)
      break
    case 'driver_license':
      // For driver_license, value should already be in "STATE-NUMBER" format
      normalizedValue = value.toUpperCase()
      break
    case 'vin':
      normalizedValue = normalizeVin(value)
      break
    default:
      normalizedValue = value
  }

  if (!normalizedValue) return

  await prisma.identityLink.upsert({
    where: {
      identifierType_identifierValue: {
        identifierType: type,
        identifierValue: normalizedValue
      }
    },
    update: {
      userId, // Update if exists (account linking)
      isPrimary: options.isPrimary ?? false,
      verified: options.verified ?? false
    },
    create: {
      userId,
      identifierType: type,
      identifierValue: normalizedValue,
      isPrimary: options.isPrimary ?? false,
      verified: options.verified ?? false
    }
  })
}

/**
 * Link multiple identifiers at once (for new account creation)
 */
export async function linkAllIdentifiers(
  userId: string,
  identifiers: IdentityCheckInput,
  options: { verified?: boolean } = {}
): Promise<void> {
  const operations: Promise<void>[] = []

  if (identifiers.phone) {
    operations.push(
      linkIdentifier(userId, 'phone', identifiers.phone, { isPrimary: true, verified: options.verified })
    )
  }

  if (identifiers.email) {
    operations.push(
      linkIdentifier(userId, 'email', identifiers.email, { isPrimary: true, verified: options.verified })
    )
  }

  if (identifiers.driverLicenseNumber && identifiers.driverLicenseState) {
    operations.push(
      linkIdentifier(
        userId,
        'driver_license',
        normalizeDriverLicense(identifiers.driverLicenseState, identifiers.driverLicenseNumber),
        { verified: options.verified }
      )
    )
  }

  if (identifiers.vin) {
    operations.push(
      linkIdentifier(userId, 'vin', identifiers.vin, { verified: options.verified })
    )
  }

  await Promise.all(operations)
}

// ============================================================================
// SUSPENSION MANAGEMENT
// ============================================================================

/**
 * Suspend an identifier (add to blocklist)
 */
export async function suspendIdentifier(
  type: IdentifierType,
  value: string,
  reason: string,
  options: { suspendedBy?: string; expiresAt?: Date; notes?: string } = {}
): Promise<void> {
  let normalizedValue: string

  switch (type) {
    case 'phone':
      normalizedValue = normalizePhone(value)
      break
    case 'email':
      normalizedValue = normalizeEmail(value)
      break
    case 'driver_license':
      normalizedValue = value.toUpperCase()
      break
    case 'vin':
      normalizedValue = normalizeVin(value)
      break
    default:
      normalizedValue = value
  }

  await prisma.suspendedIdentifier.upsert({
    where: {
      identifierType_identifierValue: {
        identifierType: type,
        identifierValue: normalizedValue
      }
    },
    update: {
      reason,
      suspendedAt: new Date(),
      suspendedBy: options.suspendedBy,
      expiresAt: options.expiresAt,
      notes: options.notes
    },
    create: {
      identifierType: type,
      identifierValue: normalizedValue,
      reason,
      suspendedBy: options.suspendedBy,
      expiresAt: options.expiresAt,
      notes: options.notes
    }
  })
}

/**
 * Suspend all identifiers associated with a user account
 */
export async function suspendAllUserIdentifiers(
  userId: string,
  reason: string,
  options: { suspendedBy?: string; expiresAt?: Date; notes?: string } = {}
): Promise<number> {
  // Get user's linked identifiers
  const links = await prisma.identityLink.findMany({
    where: { userId },
    select: { identifierType: true, identifierValue: true }
  })

  // Also get identifiers from legacy sources
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      phone: true,
      email: true,
      rentalHost: {
        select: {
          email: true,
          cars: { select: { vin: true } }
        }
      },
      reviewerProfile: {
        select: {
          email: true,
          phoneNumber: true,
          driverLicenseNumber: true,
          driverLicenseState: true
        }
      }
    }
  })

  const toSuspend = new Set<string>()

  // Add from IdentityLinks
  for (const link of links) {
    toSuspend.add(`${link.identifierType}:${link.identifierValue}`)
  }

  // Add from User
  if (user?.phone) toSuspend.add(`phone:${normalizePhone(user.phone)}`)
  if (user?.email) toSuspend.add(`email:${normalizeEmail(user.email)}`)

  // Add from Host
  if (user?.rentalHost?.email) toSuspend.add(`email:${normalizeEmail(user.rentalHost.email)}`)
  for (const car of user?.rentalHost?.cars || []) {
    if (car.vin) toSuspend.add(`vin:${normalizeVin(car.vin)}`)
  }

  // Add from Guest
  if (user?.reviewerProfile?.email) toSuspend.add(`email:${normalizeEmail(user.reviewerProfile.email)}`)
  if (user?.reviewerProfile?.phoneNumber) toSuspend.add(`phone:${normalizePhone(user.reviewerProfile.phoneNumber)}`)
  if (user?.reviewerProfile?.driverLicenseNumber && user?.reviewerProfile?.driverLicenseState) {
    toSuspend.add(`driver_license:${normalizeDriverLicense(
      user.reviewerProfile.driverLicenseState,
      user.reviewerProfile.driverLicenseNumber
    )}`)
  }

  // Suspend each unique identifier
  let count = 0
  for (const entry of toSuspend) {
    const [type, value] = entry.split(':') as [IdentifierType, string]
    await suspendIdentifier(type, value, reason, options)
    count++
  }

  return count
}

/**
 * Remove suspension from an identifier
 */
export async function unsuspendIdentifier(
  type: IdentifierType,
  value: string
): Promise<boolean> {
  let normalizedValue: string

  switch (type) {
    case 'phone':
      normalizedValue = normalizePhone(value)
      break
    case 'email':
      normalizedValue = normalizeEmail(value)
      break
    case 'driver_license':
      normalizedValue = value.toUpperCase()
      break
    case 'vin':
      normalizedValue = normalizeVin(value)
      break
    default:
      normalizedValue = value
  }

  try {
    await prisma.suspendedIdentifier.delete({
      where: {
        identifierType_identifierValue: {
          identifierType: type,
          identifierValue: normalizedValue
        }
      }
    })
    return true
  } catch {
    return false // Not found or already removed
  }
}
