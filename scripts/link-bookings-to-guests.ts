import prisma from '../app/lib/database/prisma'

async function linkBookingsToGuests() {
  console.log('🔗 Linking Bookings to Guest Profiles...\n')
  
  try {
    // Get all bookings without reviewerProfileId
    const unlinkedBookings = await prisma.rentalBooking.findMany({
      where: { 
        reviewerProfileId: null,
        guestEmail: { not: null }
      }
    })
    
    console.log(`📊 Found ${unlinkedBookings.length} bookings to link`)
    
    let linkedCount = 0
    let createdCount = 0
    
    for (const booking of unlinkedBookings) {
      // Find reviewer by email
      let reviewer = await prisma.reviewerProfile.findFirst({
        where: { 
          email: booking.guestEmail 
        }
      })
      
      // If no reviewer exists, check if we should create one
      if (!reviewer && booking.guestEmail && booking.guestName) {
        // Extract city from pickupLocation or use default
        const city = 'Phoenix' // Default for now
        
        reviewer = await prisma.reviewerProfile.create({
          data: {
            email: booking.guestEmail,
            name: booking.guestName,
            city: city,
            state: 'AZ',
            tripCount: 0,
            reviewCount: 0,
            memberSince: booking.createdAt
          }
        })
        createdCount++
        console.log(`  Created profile for ${booking.guestName}`)
      }
      
      // Link booking to reviewer
      if (reviewer) {
        await prisma.rentalBooking.update({
          where: { id: booking.id },
          data: { reviewerProfileId: reviewer.id }
        })
        linkedCount++
      }
    }
    
    console.log(`\n✅ Linked ${linkedCount} bookings to guest profiles`)
    console.log(`✅ Created ${createdCount} new guest profiles`)
    
    // Update trip counts for all reviewers
    const reviewers = await prisma.reviewerProfile.findMany()
    
    for (const reviewer of reviewers) {
      const bookingCount = await prisma.rentalBooking.count({
        where: { reviewerProfileId: reviewer.id }
      })
      
      await prisma.reviewerProfile.update({
        where: { id: reviewer.id },
        data: { tripCount: bookingCount }
      })
    }
    
    // Final stats
    const finalStats = await prisma.rentalBooking.aggregate({
      where: { reviewerProfileId: { not: null } },
      _count: true
    })
    
    console.log(`\n📊 Final Status:`)
    console.log(`   Total Bookings: ${await prisma.rentalBooking.count()}`)
    console.log(`   Linked Bookings: ${finalStats._count}`)
    console.log(`   Guest Profiles: ${await prisma.reviewerProfile.count()}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

linkBookingsToGuests()
  .then(() => {
    console.log('\n✅ Booking-Guest linking completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed to link bookings')
    process.exit(1)
  })
