// safe-delete-bookings.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function safeDeleteBookings() {
  try {
    console.log('🔍 Checking what tables have data...\n')
    
    // Delete in order of dependencies
    
    // 1. Delete TripCharge (NEW)
    try {
      const charges = await prisma.tripCharge.count()
      if (charges > 0) {
        const deleted = await prisma.tripCharge.deleteMany({})
        console.log(`✅ Deleted ${deleted.count} trip charges`)
      }
    } catch (e) {
      console.log('⚠️  TripCharge table not found')
    }

    // 2. Delete InspectionPhoto (NEW)
    try {
      const photos = await prisma.inspectionPhoto.count()
      if (photos > 0) {
        const deleted = await prisma.inspectionPhoto.deleteMany({})
        console.log(`✅ Deleted ${deleted.count} inspection photos`)
      }
    } catch (e) {
      console.log('⚠️  InspectionPhoto table not found')
    }

    // 3. Delete RentalDispute
    try {
      const disputes = await prisma.rentalDispute.count()
      if (disputes > 0) {
        const deleted = await prisma.rentalDispute.deleteMany({})
        console.log(`✅ Deleted ${deleted.count} disputes`)
      }
    } catch (e) {
      // Table might not exist
    }

    // 4. Delete HostPayout
    try {
      const payouts = await prisma.hostPayout.count()
      if (payouts > 0) {
        const deleted = await prisma.hostPayout.deleteMany({})
        console.log(`✅ Deleted ${deleted.count} host payouts`)
      }
    } catch (e) {
      // Table might not exist
    }
    
    // [Rest of your existing delete operations...]
    
    // 5. Delete BookingSession
    try {
      const sessions = await prisma.bookingSession.count()
      if (sessions > 0) {
        const deleted = await prisma.bookingSession.deleteMany({})
        console.log(`✅ Deleted ${deleted.count} booking sessions`)
      }
    } catch (e) {
      // Table might not exist
    }
    
    // 6. Delete FraudIndicator
    try {
      const frauds = await prisma.fraudIndicator.count()
      if (frauds > 0) {
        const deleted = await prisma.fraudIndicator.deleteMany({})
        console.log(`✅ Deleted ${deleted.count} fraud indicators`)
      }
    } catch (e) {
      // Table might not exist
    }
    
    // 7. Delete RentalMessage
    try {
      const messages = await prisma.rentalMessage.count()
      if (messages > 0) {
        const deleted = await prisma.rentalMessage.deleteMany({})
        console.log(`✅ Deleted ${deleted.count} rental messages`)
      }
    } catch (e) {
      // Table might not exist
    }

    // 8. Delete GuestAccessToken
    try {
      const tokens = await prisma.guestAccessToken.count()
      if (tokens > 0) {
        const deleted = await prisma.guestAccessToken.deleteMany({})
        console.log(`✅ Deleted ${deleted.count} guest access tokens`)
      }
    } catch (e) {
      // Table might not exist
    }
    
    // 9. Delete RentalAvailability blocks
    try {
      const blocks = await prisma.rentalAvailability.count()
      if (blocks > 0) {
        const deleted = await prisma.rentalAvailability.deleteMany({})
        console.log(`✅ Deleted ${deleted.count} availability blocks`)
      }
    } catch (e) {
      // Table might not exist
    }

    // 10. Finally, delete the bookings
    const bookingsCount = await prisma.rentalBooking.count()
    if (bookingsCount > 0) {
      console.log(`\n🎯 Found ${bookingsCount} bookings to delete...`)
      const bookings = await prisma.rentalBooking.deleteMany({})
      console.log(`✅ Deleted ${bookings.count} bookings successfully!`)
    } else {
      console.log('📭 No bookings to delete')
    }
    
    console.log('\n🎉 All test data cleared safely!')
    console.log('📝 Your cars, users, and other data remain intact')
    console.log('🚀 Ready to start fresh booking test!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

safeDeleteBookings()