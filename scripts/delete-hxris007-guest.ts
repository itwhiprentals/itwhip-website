// scripts/delete-hxris007-guest.ts
// Delete auto-created guest profile for hxris007@gmail.com

import { prisma } from '../app/lib/database/prisma'

async function deleteHxris007GuestProfile() {
  try {
    console.log('🔍 Searching for hxris007@gmail.com ReviewerProfile...')

    // Find the ReviewerProfile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        email: 'hxris007@gmail.com'
      },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    if (!profile) {
      console.log('❌ No ReviewerProfile found for hxris007@gmail.com')
      return
    }

    console.log('✅ Found ReviewerProfile:', {
      id: profile.id,
      userId: profile.userId,
      email: profile.email,
      name: profile.name,
      createdAt: profile.createdAt
    })

    // Check if this user also has a RentalHost profile
    const hostProfile = await prisma.rentalHost.findFirst({
      where: {
        userId: profile.userId
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (hostProfile) {
      console.log('✅ User also has RentalHost profile:', {
        hostId: hostProfile.id,
        email: hostProfile.email,
        name: hostProfile.name
      })
    }

    // Delete the ReviewerProfile
    console.log('🗑️  Deleting ReviewerProfile...')
    await prisma.reviewerProfile.delete({
      where: {
        id: profile.id
      }
    })

    console.log('✅ Successfully deleted ReviewerProfile for hxris007@gmail.com')
    console.log('✅ User can now properly link accounts through the account linking flow')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

deleteHxris007GuestProfile()
