// scripts/cleanup-test-users.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Check if dry-run mode
const isDryRun = process.argv.includes('--dry-run')

// Protected emails - NEVER delete these
const PROTECTED_EMAILS = [
  'hxris007@gmail.com',
  'maxwellnyatsambo@gmail.com',  // Maxwell Jackson
  'product700@gmail.com',         // DAngelo Troupe
  'joeespinosa98@gmail.com',      // Melissa Espinosa
  'richceo6@gmail.com'            // Rich CEO
]

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧹 CLEANUP: Test Gmail Accounts ONLY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (isDryRun) {
    console.log('🔍 MODE: DRY RUN (Preview Only - No Changes Will Be Made)\n')
  } else {
    console.log('⚠️  MODE: LIVE RUN (This Will Delete Data!)\n')
  }

  // Find ONLY Gmail accounts to delete (NOT protected email, NOT @itwhip.com, NOT @guest.itwhip.com)
  const usersToDelete = await prisma.user.findMany({
    where: {
      AND: [
        {
          email: {
            notIn: PROTECTED_EMAILS,
            endsWith: '@gmail.com'  // ONLY Gmail accounts
          }
        }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          accounts: true,
          sessions: true,
          paymentMethods: true,
          notificationDismissals: true
        }
      }
    }
  })

  // Get protected users for reference
  const protectedUsers = await prisma.user.findMany({
    where: { email: { in: PROTECTED_EMAILS } },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  })

  console.log('🛡️  Protected Users (will NOT be deleted):')
  protectedUsers.forEach(user => {
    console.log(`   - ${user.email} (${user.name})`)
  })
  console.log('   - All @itwhip.com and @guest.itwhip.com accounts')
  console.log('')

  console.log(`📊 Found ${usersToDelete.length} test user(s) to delete:\n`)

  if (usersToDelete.length === 0) {
    console.log('✅ No test users found to delete!\n')
    await prisma.$disconnect()
    return
  }

  // Display users to be deleted
  usersToDelete.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email || 'No email'}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Name: ${user.name || 'No name'}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Created: ${user.createdAt.toLocaleString()}`)
    console.log(`   Related: ${user._count.accounts} account(s), ${user._count.sessions} session(s)`)
    console.log('')
  })

  const userIds = usersToDelete.map(u => u.id)

  // Count related records
  const [
    accountCount,
    reviewerProfileCount,
    rentalHostCount,
    sessionCount,
    notificationDismissalCount,
    paymentMethodCount
  ] = await Promise.all([
    prisma.account.count({ where: { userId: { in: userIds } } }),
    prisma.reviewerProfile.count({ where: { userId: { in: userIds } } }),
    prisma.rentalHost.count({ where: { userId: { in: userIds } } }),
    prisma.session.count({ where: { userId: { in: userIds } } }),
    prisma.notificationDismissal.count({ where: { userId: { in: userIds } } }),
    prisma.paymentMethod.count({ where: { userId: { in: userIds } } })
  ])

  console.log('📈 Related Records Summary:')
  console.log(`   - Accounts: ${accountCount}`)
  console.log(`   - ReviewerProfiles: ${reviewerProfileCount}`)
  console.log(`   - RentalHosts: ${rentalHostCount}`)
  console.log(`   - Sessions: ${sessionCount}`)
  console.log(`   - NotificationDismissals: ${notificationDismissalCount}`)
  console.log(`   - PaymentMethods: ${paymentMethodCount}`)
  console.log('')

  if (isDryRun) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ DRY RUN COMPLETE - No changes were made')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n💡 This would delete:`)
    console.log(`   - ${usersToDelete.length} user(s)`)
    console.log(`   - ${accountCount} account(s)`)
    console.log(`   - ${reviewerProfileCount} reviewer profile(s)`)
    console.log(`   - ${rentalHostCount} rental host(s)`)
    console.log(`   - ${sessionCount} session(s)`)
    console.log(`   - ${notificationDismissalCount} notification dismissal(s)`)
    console.log(`   - ${paymentMethodCount} payment method(s)`)
    console.log('\nTo actually perform the cleanup, run:')
    console.log('  npx tsx scripts/cleanup-test-users.ts')
    console.log('')
  } else {
    console.log('⏳ Deleting test users in 5 seconds...')
    console.log('   Press Ctrl+C to cancel\n')

    await new Promise(resolve => setTimeout(resolve, 5000))

    console.log('🗑️  Deleting related records in correct order...\n')

    // Delete in order to respect foreign key constraints
    // Order: Most dependent first → Users last

    // 1. Delete Accounts (OAuth links)
    const deletedAccounts = await prisma.account.deleteMany({
      where: { userId: { in: userIds } }
    })
    console.log(`   ✓ Deleted ${deletedAccounts.count} account(s)`)

    // 2. Delete Sessions
    const deletedSessions = await prisma.session.deleteMany({
      where: { userId: { in: userIds } }
    })
    console.log(`   ✓ Deleted ${deletedSessions.count} session(s)`)

    // 3. Delete NotificationDismissals
    const deletedDismissals = await prisma.notificationDismissal.deleteMany({
      where: { userId: { in: userIds } }
    })
    console.log(`   ✓ Deleted ${deletedDismissals.count} notification dismissal(s)`)

    // 4. Delete PaymentMethods
    const deletedPayments = await prisma.paymentMethod.deleteMany({
      where: { userId: { in: userIds } }
    })
    console.log(`   ✓ Deleted ${deletedPayments.count} payment method(s)`)

    // 5. Delete ReviewerProfiles
    const deletedProfiles = await prisma.reviewerProfile.deleteMany({
      where: { userId: { in: userIds } }
    })
    console.log(`   ✓ Deleted ${deletedProfiles.count} reviewer profile(s)`)

    // 6. Unlink RentalHosts from Users (set userId to null) instead of deleting
    // This preserves any RentalHosts that have RentalCars linked
    const unlinkedHosts = await prisma.rentalHost.updateMany({
      where: { userId: { in: userIds } },
      data: { userId: null }
    })
    console.log(`   ✓ Unlinked ${unlinkedHosts.count} rental host(s) from users`)

    // 7. Finally, delete Users
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    })
    console.log(`   ✓ Deleted ${deletedUsers.count} user(s)`)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ CLEANUP COMPLETE!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
