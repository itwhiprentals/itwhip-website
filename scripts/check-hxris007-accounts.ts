// scripts/check-hxris007-accounts.ts
// Check all accounts for hxris007@gmail.com

import { prisma } from '../app/lib/database/prisma'

async function checkHxris007Accounts() {
  try {
    console.log('🔍 Checking all accounts for hxris007@gmail.com...\n')

    // Find User account
    const user = await prisma.user.findUnique({
      where: {
        email: 'hxris007@gmail.com'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        legacyDualId: true,
        createdAt: true
      }
    })

    if (!user) {
      console.log('❌ No User found for hxris007@gmail.com')
      return
    }

    console.log('✅ User Account:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      legacyDualId: user.legacyDualId || 'NOT SET',
      createdAt: user.createdAt
    })
    console.log()

    // Check for RentalHost profile
    const hostProfile = await prisma.rentalHost.findFirst({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        approvalStatus: true,
        createdAt: true
      }
    })

    if (hostProfile) {
      console.log('✅ RentalHost Profile:', {
        hostId: hostProfile.id,
        email: hostProfile.email,
        name: hostProfile.name,
        approvalStatus: hostProfile.approvalStatus,
        createdAt: hostProfile.createdAt
      })
    } else {
      console.log('❌ No RentalHost profile found')
    }
    console.log()

    // Check for ReviewerProfile (guest)
    const guestProfile = await prisma.reviewerProfile.findFirst({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    if (guestProfile) {
      console.log('✅ ReviewerProfile (Guest):', {
        guestId: guestProfile.id,
        email: guestProfile.email,
        name: guestProfile.name,
        createdAt: guestProfile.createdAt
      })
    } else {
      console.log('❌ No ReviewerProfile (guest) found')
    }
    console.log()

    // Summary
    console.log('📊 SUMMARY:')
    console.log(`- User exists: ✅`)
    console.log(`- Host profile: ${hostProfile ? '✅' : '❌'}`)
    console.log(`- Guest profile: ${guestProfile ? '✅' : '❌'}`)
    console.log(`- legacyDualId: ${user.legacyDualId || 'NOT SET'}`)
    console.log()

    if (!guestProfile && hostProfile) {
      console.log('✅ PERFECT! User is HOST-ONLY (no auto-created guest profile)')
      console.log('✅ Ready to test account linking flow')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkHxris007Accounts()
