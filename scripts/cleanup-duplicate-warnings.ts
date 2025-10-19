// scripts/cleanup-duplicate-warnings.ts
/**
 * 🧹 CLEANUP SCRIPT: Remove Duplicate Warning Records
 * 
 * Problem: When appeals were denied, the system incorrectly created new WARNING records
 * instead of audit entries. This script removes those malformed warnings.
 * 
 * What it does:
 * 1. Finds GuestModeration records with actionType='WARNING' and denial messages in publicReason
 * 2. Deletes related appeals first (to avoid foreign key constraint)
 * 3. Deletes the malformed warning records
 * 4. Recalculates warning counts for affected guests
 * 
 * Usage:
 *   DRY RUN (preview only):  npx tsx scripts/cleanup-duplicate-warnings.ts --dry-run
 *   ACTUAL RUN (make changes): npx tsx scripts/cleanup-duplicate-warnings.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Check if dry-run mode
const isDryRun = process.argv.includes('--dry-run')

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧹 DUPLICATE WARNING CLEANUP SCRIPT')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (isDryRun) {
    console.log('🔍 MODE: DRY RUN (Preview Only - No Changes Will Be Made)\n')
  } else {
    console.log('⚠️  MODE: LIVE RUN (This Will Modify Your Database!)\n')
    console.log('⚠️  IMPORTANT: Make sure you have a database backup before proceeding!\n')
  }

  // Step 1: Find malformed warnings
  console.log('📊 Step 1: Finding malformed warning records...\n')

  const malformedWarnings = await prisma.guestModeration.findMany({
    where: {
      actionType: 'WARNING',
      OR: [
        { publicReason: { contains: 'Your appeal has been reviewed and denied' } },
        { publicReason: { contains: 'appeal has been reviewed and denied' } }
      ]
    },
    orderBy: {
      takenAt: 'desc'
    }
  })

  if (malformedWarnings.length === 0) {
    console.log('✅ No malformed warnings found! Database is clean.\n')
    await prisma.$disconnect()
    return
  }

  console.log(`🔍 Found ${malformedWarnings.length} malformed warning record(s):\n`)

  // Fetch guest info for each warning
  const guestIds = [...new Set(malformedWarnings.map(w => w.guestId))]
  const guests = await prisma.reviewerProfile.findMany({
    where: {
      id: { in: guestIds }
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  })

  const guestMap = new Map(guests.map(g => [g.id, g]))

  // Check for appeals pointing to these warnings
  const relatedAppeals = await prisma.guestAppeal.findMany({
    where: {
      moderationId: {
        in: malformedWarnings.map(w => w.id)
      }
    },
    select: {
      id: true,
      moderationId: true,
      status: true
    }
  })

  console.log(`🔍 Found ${relatedAppeals.length} appeal(s) related to these warnings\n`)

  // Display found records
  malformedWarnings.forEach((warning, index) => {
    const guest = guestMap.get(warning.guestId)
    const relatedAppealCount = relatedAppeals.filter(a => a.moderationId === warning.id).length
    console.log(`${index + 1}. Warning ID: ${warning.id}`)
    console.log(`   Guest: ${guest?.name || 'Unknown'} (${guest?.email || 'no email'})`)
    console.log(`   Reason: ${warning.publicReason.substring(0, 80)}...`)
    console.log(`   Created: ${warning.takenAt.toLocaleString()} by ${warning.takenBy}`)
    console.log(`   Guest ID: ${warning.guestId}`)
    console.log(`   Related Appeals: ${relatedAppealCount}`)
    console.log('')
  })

  // Group by guest to show impact
  const guestWarningCounts = malformedWarnings.reduce((acc, warning) => {
    acc[warning.guestId] = (acc[warning.guestId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const affectedGuestCount = Object.keys(guestWarningCounts).length

  console.log(`📈 Impact Summary:`)
  console.log(`   - ${malformedWarnings.length} malformed warning records will be removed`)
  console.log(`   - ${relatedAppeals.length} appeal(s) will be deleted first (foreign key constraint)`)
  console.log(`   - ${affectedGuestCount} guest(s) affected`)
  console.log('')

  Object.entries(guestWarningCounts).forEach(([guestId, count]) => {
    const guest = guestMap.get(guestId)
    console.log(`   • ${guest?.name || 'Unknown'}: ${count} duplicate(s)`)
  })

  console.log('')

  if (isDryRun) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ DRY RUN COMPLETE - No changes were made')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\nTo actually perform the cleanup, run:')
    console.log('  npx tsx scripts/cleanup-duplicate-warnings.ts')
    console.log('')
    await prisma.$disconnect()
    return
  }

  // If not dry run, ask for confirmation
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  CONFIRMATION REQUIRED')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('This will:')
  console.log(`  1. DELETE ${relatedAppeals.length} appeal(s) pointing to malformed warnings`)
  console.log(`  2. DELETE ${malformedWarnings.length} malformed warning record(s)`)
  console.log(`  3. Recalculate warning counts for ${affectedGuestCount} guest(s)`)
  console.log('  4. Update GuestProfileStatus for affected guests\n')
  
  console.log('⚠️  This action CANNOT be undone without a database backup!\n')

  // Simple confirmation (since we can't use readline in a simple script)
  console.log('To proceed, press Ctrl+C to cancel, or wait 5 seconds...\n')
  
  await new Promise(resolve => setTimeout(resolve, 5000))

  // Step 2: Perform cleanup
  console.log('🔧 Step 2: Performing cleanup...\n')

  let deletedAppealsCount = 0
  let deletedWarningsCount = 0
  let updatedGuestCount = 0

  try {
    // Delete appeals and malformed warnings, then recalculate counts in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete related appeals first (to avoid foreign key constraint)
      if (relatedAppeals.length > 0) {
        const deleteAppealsResult = await tx.guestAppeal.deleteMany({
          where: {
            id: {
              in: relatedAppeals.map(a => a.id)
            }
          }
        })
        deletedAppealsCount = deleteAppealsResult.count
        console.log(`✅ Deleted ${deletedAppealsCount} appeal(s)`)
      }

      // 2. Delete the malformed warnings
      const deleteWarningsResult = await tx.guestModeration.deleteMany({
        where: {
          id: {
            in: malformedWarnings.map(w => w.id)
          }
        }
      })

      deletedWarningsCount = deleteWarningsResult.count
      console.log(`✅ Deleted ${deletedWarningsCount} malformed warning record(s)`)

      // 3. Recalculate warning counts for each affected guest
      const now = new Date()

      for (const guestId of Object.keys(guestWarningCounts)) {
        // Count actual active warnings (not expired)
        const actualWarningCount = await tx.guestModeration.count({
          where: {
            guestId,
            actionType: 'WARNING',
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } }
            ]
          }
        })

        // Update guest profile with correct counts
        await tx.reviewerProfile.update({
          where: { id: guestId },
          data: {
            activeWarningCount: actualWarningCount,
            warningCount: actualWarningCount
          }
        })

        // Update GuestProfileStatus if it exists
        const profileStatus = await tx.guestProfileStatus.findUnique({
          where: { guestId }
        })

        if (profileStatus) {
          await tx.guestProfileStatus.update({
            where: { guestId },
            data: {
              activeWarningCount: actualWarningCount
            }
          })
        }

        updatedGuestCount++

        const guest = guestMap.get(guestId)
        console.log(`✅ Updated ${guest?.name || guestId}: ${actualWarningCount} active warning(s)`)
      }
    })

    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ CLEANUP COMPLETE!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`Summary:`)
    console.log(`  • Deleted Appeals: ${deletedAppealsCount}`)
    console.log(`  • Deleted Warnings: ${deletedWarningsCount}`)
    console.log(`  • Updated Guests: ${updatedGuestCount}`)
    console.log(`  • Status: All warning counts recalculated\n`)

  } catch (error) {
    console.error('\n❌ ERROR during cleanup:')
    console.error(error)
    console.log('\n⚠️  The transaction was rolled back. No changes were made.\n')
    throw error
  }

  await prisma.$disconnect()
}

// Run the script
main()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })