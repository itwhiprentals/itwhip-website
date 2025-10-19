// scripts/cleanup-orphaned-notifications.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Check if dry-run mode
const isDryRun = process.argv.includes('--dry-run')

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧹 CLEANUP: Orphaned Appeal Notifications')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (isDryRun) {
    console.log('🔍 MODE: DRY RUN (Preview Only - No Changes Will Be Made)\n')
  } else {
    console.log('⚠️  MODE: LIVE RUN (This Will Modify Your Database!)\n')
  }

  // Find all appeal notifications
  const allNotifications = await prisma.appealNotification.findMany({
    select: {
      id: true,
      appealId: true,
      guestId: true,
      type: true,
      message: true,
      seen: true,
      dismissedAt: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`📊 Found ${allNotifications.length} total notification(s)\n`)

  // Find which appeals actually exist
  const appealIds = allNotifications.map(n => n.appealId)
  const existingAppeals = await prisma.guestAppeal.findMany({
    where: {
      id: { in: appealIds }
    },
    select: {
      id: true,
      status: true
    }
  })

  const existingAppealMap = new Map(existingAppeals.map(a => [a.id, a]))

  // Find orphaned notifications (appeal doesn't exist)
  const orphanedNotifications = allNotifications.filter(n => !existingAppealMap.has(n.appealId))

  // Find active (non-dismissed) notifications
  const activeNotifications = allNotifications.filter(n => !n.dismissedAt)

  console.log(`📈 Notification Summary:`)
  console.log(`   - Total: ${allNotifications.length}`)
  console.log(`   - Active (not dismissed): ${activeNotifications.length}`)
  console.log(`   - Orphaned (appeal deleted): ${orphanedNotifications.length}`)
  console.log(`   - Seen: ${allNotifications.filter(n => n.seen).length}`)
  console.log(`   - Unseen: ${allNotifications.filter(n => !n.seen).length}`)
  console.log('')

  if (orphanedNotifications.length > 0) {
    console.log(`🔍 Orphaned Notification Details:\n`)

    orphanedNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. Notification ID: ${notif.id}`)
      console.log(`   Appeal ID: ${notif.appealId} (❌ DELETED)`)
      console.log(`   Type: ${notif.type}`)
      console.log(`   Guest ID: ${notif.guestId}`)
      console.log(`   Seen: ${notif.seen ? 'Yes' : 'No'}`)
      console.log(`   Dismissed: ${notif.dismissedAt ? 'Yes' : 'No'}`)
      console.log(`   Created: ${notif.createdAt.toLocaleString()}`)
      console.log(`   Message: ${notif.message.substring(0, 80)}...`)
      console.log('')
    })

    if (isDryRun) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('✅ DRY RUN COMPLETE - No changes were made')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`\n💡 This would delete ${orphanedNotifications.length} orphaned notification(s)`)
      console.log('\nTo actually perform the cleanup, run:')
      console.log('  npx tsx scripts/cleanup-orphaned-notifications.ts')
      console.log('')
    } else {
      console.log('⏳ Deleting orphaned notifications...\n')
      console.log('To proceed, press Ctrl+C to cancel, or wait 3 seconds...\n')
      
      await new Promise(resolve => setTimeout(resolve, 3000))

      const result = await prisma.appealNotification.deleteMany({
        where: {
          id: {
            in: orphanedNotifications.map(n => n.id)
          }
        }
      })

      console.log(`✅ Deleted ${result.count} orphaned notification(s)\n`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('✅ CLEANUP COMPLETE!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    }
  } else {
    console.log('✅ No orphaned notifications found!\n')
    
    if (activeNotifications.length > 0) {
      console.log(`ℹ️  Note: You have ${activeNotifications.length} active notification(s) with valid appeals.`)
      console.log('   These are working correctly and should not be deleted.\n')
    }
  }

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })