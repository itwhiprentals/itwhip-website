import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Check if dry-run mode
const isDryRun = process.argv.includes('--dry-run')

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧹 COMPLETE CLEANUP: All Orphaned Notifications')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (isDryRun) {
    console.log('🔍 MODE: DRY RUN (Preview Only - No Changes)\n')
  } else {
    console.log('⚠️  MODE: LIVE RUN (Will Modify Database!)\n')
  }

  let totalDeleted = 0

  // =========================================================================
  // PART 1: Clean AppealNotifications (Your Existing Logic)
  // =========================================================================
  console.log('📋 PART 1: Cleaning Appeal Notifications...\n')

  const allAppealNotifs = await prisma.appealNotification.findMany({
    select: {
      id: true,
      appealId: true,
      guestId: true,
      type: true,
      seen: true,
      dismissedAt: true,
      createdAt: true
    }
  })

  console.log(`   Found ${allAppealNotifs.length} appeal notification(s)`)

  const appealIds = allAppealNotifs.map(n => n.appealId)
  const existingAppeals = await prisma.guestAppeal.findMany({
    where: { id: { in: appealIds } },
    select: { id: true }
  })

  const existingAppealIds = new Set(existingAppeals.map(a => a.id))
  const orphanedAppealNotifs = allAppealNotifs.filter(n => !existingAppealIds.has(n.appealId))

  console.log(`   - Orphaned (appeal deleted): ${orphanedAppealNotifs.length}`)

  if (orphanedAppealNotifs.length > 0 && !isDryRun) {
    const result = await prisma.appealNotification.deleteMany({
      where: {
        id: { in: orphanedAppealNotifs.map(n => n.id) }
      }
    })
    console.log(`   ✅ Deleted ${result.count} orphaned appeal notification(s)\n`)
    totalDeleted += result.count
  } else if (orphanedAppealNotifs.length > 0) {
    console.log(`   🔍 Would delete ${orphanedAppealNotifs.length} notification(s)\n`)
  } else {
    console.log(`   ✅ No orphaned appeal notifications\n`)
  }

  // =========================================================================
  // PART 2: Clean NotificationDismissal (THE MAIN PROBLEM!)
  // =========================================================================
  console.log('📋 PART 2: Cleaning General Notifications...\n')

  const allDismissals = await prisma.notificationDismissal.findMany({
    select: {
      id: true,
      userId: true,
      notificationType: true,
      dismissedAt: true,
      completedAt: true,
      dismissCount: true
    }
  })

  console.log(`   Found ${allDismissals.length} notification dismissal(s)`)

  // Get all users with their reviewer profiles
  const userIds = [...new Set(allDismissals.map(d => d.userId))]
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      email: true,
    }
  })

  const reviewerProfiles = await prisma.reviewerProfile.findMany({
    where: {
      userId: { in: userIds }
    },
    select: {
      userId: true,
      suspensionLevel: true,
      warningCount: true,
      activeWarningCount: true,
      documentsVerified: true,
      emailVerified: true,
      phoneVerified: true,
      insuranceVerified: true,
      bannedAt: true,
      suspendedAt: true,
    }
  })

  const profileMap = new Map(reviewerProfiles.map(rp => [rp.userId, rp]))

  // =========================================================================
  // IDENTIFY INVALID NOTIFICATIONS
  // =========================================================================
  const invalidNotifications = []

  for (const dismissal of allDismissals) {
    const profile = profileMap.get(dismissal.userId)
    
    if (!profile) {
      // User has no profile - invalid notification
      invalidNotifications.push({
        dismissal,
        reason: 'No reviewer profile found'
      })
      continue
    }

    let isInvalid = false
    let reason = ''

    switch (dismissal.notificationType) {
      case 'ACCOUNT_WARNING':
        // Invalid if no active warnings
        if (profile.activeWarningCount === 0 || profile.suspensionLevel === 'NONE') {
          isInvalid = true
          reason = `No active warnings (count: ${profile.activeWarningCount}, level: ${profile.suspensionLevel})`
        }
        break

      case 'DOCUMENTS_REQUIRED':
        // Invalid if documents are already verified
        if (profile.documentsVerified) {
          isInvalid = true
          reason = 'Documents already verified'
        }
        break

      case 'EMAIL_VERIFICATION':
        // Invalid if email already verified
        if (profile.emailVerified) {
          isInvalid = true
          reason = 'Email already verified'
        }
        break

      case 'PHONE_VERIFICATION':
        // Invalid if phone already verified
        if (profile.phoneVerified) {
          isInvalid = true
          reason = 'Phone already verified'
        }
        break

      case 'INSURANCE_VERIFICATION':
        // Invalid if insurance already verified
        if (profile.insuranceVerified) {
          isInvalid = true
          reason = 'Insurance already verified'
        }
        break

      case 'SUSPENSION_NOTICE':
        // Invalid if not currently suspended
        if (profile.suspensionLevel !== 'TEMPORARY' || !profile.suspendedAt) {
          isInvalid = true
          reason = `Not suspended (level: ${profile.suspensionLevel})`
        }
        break

      case 'BANNED_NOTICE':
        // Invalid if not banned
        if (profile.suspensionLevel !== 'PERMANENT' || !profile.bannedAt) {
          isInvalid = true
          reason = `Not banned (level: ${profile.suspensionLevel})`
        }
        break
    }

    // Also check if already completed
    if (dismissal.completedAt) {
      isInvalid = true
      reason = 'Marked as completed'
    }

    // Check if too old (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    if (dismissal.dismissedAt && dismissal.dismissedAt < thirtyDaysAgo) {
      isInvalid = true
      reason = `Too old (dismissed ${Math.floor((Date.now() - dismissal.dismissedAt.getTime()) / (24 * 60 * 60 * 1000))} days ago)`
    }

    if (isInvalid) {
      const user = users.find(u => u.id === dismissal.userId)
      invalidNotifications.push({
        dismissal,
        reason,
        userEmail: user?.email
      })
    }
  }

  console.log(`   - Invalid notifications: ${invalidNotifications.length}`)

  // =========================================================================
  // SHOW DETAILS
  // =========================================================================
  if (invalidNotifications.length > 0) {
    console.log('\n   🔍 Invalid Notification Details:\n')

    invalidNotifications.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.dismissal.notificationType}`)
      console.log(`      User: ${item.userEmail || item.dismissal.userId}`)
      console.log(`      Reason: ${item.reason}`)
      console.log(`      Dismissed: ${item.dismissal.dismissedAt?.toLocaleDateString() || 'Never'}`)
      console.log(`      Completed: ${item.dismissal.completedAt ? 'Yes' : 'No'}`)
      console.log('')
    })

    if (!isDryRun) {
      console.log('   ⏳ Deleting invalid notifications...\n')
      console.log('   To proceed, press Ctrl+C to cancel, or wait 3 seconds...\n')
      
      await new Promise(resolve => setTimeout(resolve, 3000))

      const result = await prisma.notificationDismissal.deleteMany({
        where: {
          id: { in: invalidNotifications.map(item => item.dismissal.id) }
        }
      })

      console.log(`   ✅ Deleted ${result.count} invalid notification(s)\n`)
      totalDeleted += result.count
    } else {
      console.log(`   🔍 Would delete ${invalidNotifications.length} notification(s)\n`)
    }
  } else {
    console.log(`   ✅ No invalid notifications found\n`)
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (isDryRun) {
    console.log('✅ DRY RUN COMPLETE - No Changes Made')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n💡 Total notifications that would be deleted: ${orphanedAppealNotifs.length + invalidNotifications.length}`)
    console.log('\nTo actually perform the cleanup, run:')
    console.log('  npx tsx scripts/cleanup-all-orphaned-notifications.ts')
    console.log('')
  } else {
    console.log('✅ CLEANUP COMPLETE!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n🗑️  Total deleted: ${totalDeleted} notification(s)\n`)
  }

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })