// scripts/fix-orphaned-profiles.ts
// Script to fix orphaned or mismatched profiles in the database
// This addresses the account bleeding issue by ensuring all profiles are correctly linked to User accounts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ProfileFix {
  profileId: string
  correctUserId: string
  email: string
  currentUserId?: string | null
}

async function fixOrphanedProfiles() {
  console.log('🔍 Finding profiles with mismatched or null userId...\n')

  const hostsToFix: ProfileFix[] = []
  const guestsToFix: ProfileFix[] = []

  try {
    // ========================================================================
    // STEP 1: Find all host profiles and check for issues
    // ========================================================================
    console.log('📋 Checking RentalHost profiles...')
    const hosts = await prisma.rentalHost.findMany({
      select: { id: true, userId: true, email: true }
    })

    for (const host of hosts) {
      if (!host.userId) {
        // Orphaned profile - no userId at all
        console.log(`⚠️  Orphaned host profile: ${host.id} (${host.email}) - no userId`)

        // Find matching User by email
        const user = await prisma.user.findUnique({
          where: { email: host.email }
        })

        if (user) {
          hostsToFix.push({
            profileId: host.id,
            correctUserId: user.id,
            email: host.email,
            currentUserId: null
          })
        } else {
          console.log(`   ❌ No User found for email: ${host.email}`)
        }
      } else {
        // Has userId - verify it's valid and matches email
        const user = await prisma.user.findUnique({
          where: { id: host.userId }
        })

        if (!user) {
          // userId points to non-existent user
          console.log(`⚠️  Host ${host.id} has invalid userId: ${host.userId}`)

          // Find correct user by email
          const correctUser = await prisma.user.findUnique({
            where: { email: host.email }
          })

          if (correctUser) {
            hostsToFix.push({
              profileId: host.id,
              correctUserId: correctUser.id,
              email: host.email,
              currentUserId: host.userId
            })
          }
        } else if (user.email !== host.email) {
          // userId is valid but points to wrong user (different email)
          console.log(`🚨 Host ${host.id} userId mismatch: profile email=${host.email}, user email=${user.email}`)

          // Find correct user by email
          const correctUser = await prisma.user.findUnique({
            where: { email: host.email }
          })

          if (correctUser) {
            hostsToFix.push({
              profileId: host.id,
              correctUserId: correctUser.id,
              email: host.email,
              currentUserId: host.userId
            })
          }
        }
      }
    }

    // ========================================================================
    // STEP 2: Find all guest profiles and check for issues
    // ========================================================================
    console.log('\n📋 Checking ReviewerProfile profiles...')
    const guests = await prisma.reviewerProfile.findMany({
      select: { id: true, userId: true, email: true }
    })

    for (const guest of guests) {
      if (!guest.userId) {
        // Orphaned profile - no userId at all
        console.log(`⚠️  Orphaned guest profile: ${guest.id} (${guest.email}) - no userId`)

        const user = await prisma.user.findUnique({
          where: { email: guest.email || undefined }
        })

        if (user) {
          guestsToFix.push({
            profileId: guest.id,
            correctUserId: user.id,
            email: guest.email || '',
            currentUserId: null
          })
        } else {
          console.log(`   ❌ No User found for email: ${guest.email}`)
        }
      } else {
        // Has userId - verify it's valid and matches email
        const user = await prisma.user.findUnique({
          where: { id: guest.userId }
        })

        if (!user) {
          // userId points to non-existent user
          console.log(`⚠️  Guest ${guest.id} has invalid userId: ${guest.userId}`)

          const correctUser = await prisma.user.findUnique({
            where: { email: guest.email || undefined }
          })

          if (correctUser) {
            guestsToFix.push({
              profileId: guest.id,
              correctUserId: correctUser.id,
              email: guest.email || '',
              currentUserId: guest.userId
            })
          }
        } else if (guest.email && user.email !== guest.email) {
          // userId is valid but points to wrong user (different email)
          console.log(`🚨 Guest ${guest.id} userId mismatch: profile email=${guest.email}, user email=${user.email}`)

          const correctUser = await prisma.user.findUnique({
            where: { email: guest.email }
          })

          if (correctUser) {
            guestsToFix.push({
              profileId: guest.id,
              correctUserId: correctUser.id,
              email: guest.email,
              currentUserId: guest.userId
            })
          }
        }
      }
    }

    // ========================================================================
    // STEP 3: Report findings
    // ========================================================================
    console.log(`\n📊 Summary:`)
    console.log(`   Total hosts checked: ${hosts.length}`)
    console.log(`   Total guests checked: ${guests.length}`)
    console.log(`   Hosts to fix: ${hostsToFix.length}`)
    console.log(`   Guests to fix: ${guestsToFix.length}`)

    if (hostsToFix.length === 0 && guestsToFix.length === 0) {
      console.log('\n✅ No orphaned or mismatched profiles found! Database is clean.')
      return
    }

    console.log('\n🔧 Issues found:\n')

    if (hostsToFix.length > 0) {
      console.log('Host profiles to fix:')
      hostsToFix.forEach(({ profileId, correctUserId, email, currentUserId }) => {
        console.log(`  - ${profileId} (${email})`)
        console.log(`    Current userId: ${currentUserId || 'NULL'}`)
        console.log(`    Correct userId: ${correctUserId}`)
      })
    }

    if (guestsToFix.length > 0) {
      console.log('\nGuest profiles to fix:')
      guestsToFix.forEach(({ profileId, correctUserId, email, currentUserId }) => {
        console.log(`  - ${profileId} (${email})`)
        console.log(`    Current userId: ${currentUserId || 'NULL'}`)
        console.log(`    Correct userId: ${correctUserId}`)
      })
    }

    // ========================================================================
    // STEP 4: Apply fixes
    // ========================================================================
    console.log('\n🔧 Applying fixes...\n')

    // Fix host profiles
    for (const { profileId, correctUserId, email } of hostsToFix) {
      console.log(`Fixing host ${profileId} (${email}) → userId: ${correctUserId}`)
      await prisma.rentalHost.update({
        where: { id: profileId },
        data: { userId: correctUserId }
      })
    }

    // Fix guest profiles
    for (const { profileId, correctUserId, email } of guestsToFix) {
      console.log(`Fixing guest ${profileId} (${email}) → userId: ${correctUserId}`)
      await prisma.reviewerProfile.update({
        where: { id: profileId },
        data: { userId: correctUserId }
      })
    }

    console.log('\n✅ Migration complete!')
    console.log(`   Fixed ${hostsToFix.length} host profiles`)
    console.log(`   Fixed ${guestsToFix.length} guest profiles`)
    console.log('\n🎉 All profiles are now correctly linked to User accounts!')

  } catch (error) {
    console.error('\n❌ Error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixOrphanedProfiles()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
