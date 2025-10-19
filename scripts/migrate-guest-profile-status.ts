// scripts/migrate-guest-profile-status.ts

/**
 * Migration Script: Create GuestProfileStatus for Existing Guests
 * 
 * This script:
 * - Creates GuestProfileStatus records for all guests without one
 * - Migrates existing GuestModeration history into statusHistory
 * - Sets up initial state based on ReviewerProfile data
 * - Safe to run multiple times (idempotent)
 * 
 * Usage:
 *   npx ts-node scripts/migrate-guest-profile-status.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface MigrationStats {
  totalGuests: number
  alreadyMigrated: number
  newlyCreated: number
  withModeratedHistory: number
  errors: number
  errorDetails: string[]
}

async function migrateGuestProfileStatus() {
  console.log('🚀 Starting Guest Profile Status Migration...\n')

  const stats: MigrationStats = {
    totalGuests: 0,
    alreadyMigrated: 0,
    newlyCreated: 0,
    withModeratedHistory: 0,
    errors: 0,
    errorDetails: []
  }

  try {
    // Step 1: Fetch all ReviewerProfiles
    console.log('📊 Step 1: Fetching all guest profiles...')
    const guests = await prisma.reviewerProfile.findMany({
      include: {
        profileStatus: true,
        moderationHistory: {
          orderBy: { takenAt: 'desc' }
        }
      }
    })

    stats.totalGuests = guests.length
    console.log(`   Found ${stats.totalGuests} guest profiles\n`)

    // Step 2: Process each guest
    console.log('🔄 Step 2: Processing guests...')
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i]
      const progressPercent = Math.round(((i + 1) / guests.length) * 100)
      
      process.stdout.write(`\r   Progress: ${i + 1}/${guests.length} (${progressPercent}%) - ${guest.name}${' '.repeat(20)}`)

      try {
        // Check if already has GuestProfileStatus
        if (guest.profileStatus) {
          stats.alreadyMigrated++
          continue
        }

        // Determine initial account status
        const accountStatus = determineAccountStatus(guest)

        // Count active warnings (non-expired OR no expiration date)
        const now = new Date()
        const activeWarnings = guest.moderationHistory.filter(
          m => m.actionType === 'WARNING' &&
               (!m.expiresAt || new Date(m.expiresAt) > now) // Include warnings without expiration
        )

        // Collect active restrictions from ReviewerProfile flags
        const activeRestrictions: string[] = []
        if (!guest.canInstantBook) activeRestrictions.push('INSTANT_BOOK')
        if (guest.canBookLuxury === false) activeRestrictions.push('LUXURY_CARS')
        if (guest.canBookPremium === false) activeRestrictions.push('PREMIUM_CARS')
        if (guest.requiresManualApproval) activeRestrictions.push('MANUAL_APPROVAL')

        // Build status history from moderation history
        const statusHistory = guest.moderationHistory.map(mod => ({
          timestamp: mod.takenAt.toISOString(),
          action: mod.actionType,
          category: mod.warningCategory || undefined,
          suspensionLevel: mod.suspensionLevel || undefined,
          description: buildHistoryDescription(mod),
          reason: mod.publicReason,
          internalNotes: mod.internalNotes || undefined,
          performedBy: mod.takenBy,
          expiresAt: mod.expiresAt?.toISOString() || null,
          relatedBookingId: mod.relatedBookingId || undefined,
          relatedClaimId: mod.relatedClaimId || undefined
        }))

        // Add "Account Created" entry if no history
        if (statusHistory.length === 0) {
          statusHistory.push({
            timestamp: guest.createdAt.toISOString(),
            action: 'NOTE_ADDED',
            category: undefined,
            suspensionLevel: undefined,
            description: 'Guest account created',
            reason: 'New account',
            internalNotes: undefined,
            performedBy: 'SYSTEM',
            expiresAt: null,
            relatedBookingId: undefined,
            relatedClaimId: undefined
          })
        }

        // Build restriction history from moderation records
        const restrictionHistory = guest.moderationHistory
          .filter(mod => mod.restrictionsApplied && Array.isArray(mod.restrictionsApplied))
          .flatMap(mod => {
            const restrictions = mod.restrictionsApplied as any[]
            return restrictions.map(restriction => ({
              timestamp: mod.takenAt.toISOString(),
              action: 'ADDED' as const,
              restrictionType: restriction,
              reason: mod.publicReason,
              category: mod.warningCategory || undefined,
              appliedBy: mod.takenBy,
              expiresAt: mod.expiresAt?.toISOString() || null
            }))
          })

        // Count active suspensions
        const activeSuspensions = guest.suspensionLevel ? 1 : 0

        // Create GuestProfileStatus
        await prisma.guestProfileStatus.create({
          data: {
            guestId: guest.id,
            accountStatus,
            activeWarningCount: activeWarnings.length,
            activeSuspensions,
            activeRestrictions,
            statusHistory,
            restrictionHistory,
            notificationHistory: [],
            lastWarningAt: guest.lastWarningAt,
            lastSuspensionAt: guest.suspendedAt,
            lastNotificationAt: null,
            createdAt: guest.createdAt,
            updatedAt: new Date()
          }
        })

        stats.newlyCreated++
        if (guest.moderationHistory.length > 0) {
          stats.withModeratedHistory++
        }

      } catch (error: any) {
        stats.errors++
        stats.errorDetails.push(`Guest ${guest.id} (${guest.name}): ${error.message}`)
      }
    }

    console.log('\n')

    // Step 3: Print summary
    console.log('✅ Migration Complete!\n')
    console.log('📊 Summary:')
    console.log(`   Total Guests:              ${stats.totalGuests}`)
    console.log(`   Already Migrated:          ${stats.alreadyMigrated}`)
    console.log(`   Newly Created:             ${stats.newlyCreated}`)
    console.log(`   With Moderation History:   ${stats.withModeratedHistory}`)
    console.log(`   Errors:                    ${stats.errors}`)

    if (stats.errors > 0) {
      console.log('\n❌ Errors encountered:')
      stats.errorDetails.forEach(error => console.log(`   - ${error}`))
    }

    console.log('\n🎉 Migration finished successfully!')

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function determineAccountStatus(guest: any): string {
  if (guest.suspensionLevel === 'BANNED') return 'BANNED'
  if (guest.suspensionLevel === 'HARD') return 'HARD_SUSPENDED'
  if (guest.suspensionLevel === 'SOFT') return 'SOFT_SUSPENDED'
  
  const now = new Date()
  const hasActiveWarnings = guest.moderationHistory.some(
    (m: any) => m.actionType === 'WARNING' &&
                m.expiresAt &&
                new Date(m.expiresAt) > now
  )
  
  if (hasActiveWarnings || guest.warningCount > 0) return 'WARNED'
  
  return 'ACTIVE'
}

function buildHistoryDescription(mod: any): string {
  switch (mod.actionType) {
    case 'WARNING':
      return `Warning issued: ${mod.warningCategory || 'Policy violation'}`
    case 'SUSPEND':
      return `Account suspended (${mod.suspensionLevel}): ${mod.publicReason}`
    case 'BAN':
      return `Account banned: ${mod.publicReason}`
    case 'UNSUSPEND':
      return 'Account reactivated'
    case 'UNBAN':
      return 'Ban removed'
    default:
      return mod.publicReason
  }
}

// ============================================================================
// RUN MIGRATION
// ============================================================================

migrateGuestProfileStatus()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })