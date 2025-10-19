import prisma from '../app/lib/database/prisma'

async function syncGuestBookings() {
  console.log('🔄 Syncing Guest Data with Bookings...\n')
  
  try {
    // Fix review counts
    const reviewers = await prisma.reviewerProfile.findMany()
    
    console.log(`📊 Processing ${reviewers.length} guest profiles...`)
    
    let fixedCount = 0
    let linkedCount = 0
    
    for (const reviewer of reviewers) {
      // Count actual reviews
      const actualReviewCount = await prisma.rentalReview.count({
        where: { reviewerProfileId: reviewer.id }
      })
      
      // Count actual bookings
      const actualBookingCount = await prisma.rentalBooking.count({
        where: { reviewerProfileId: reviewer.id }
      })
      
      // Update if different
      if (reviewer.reviewCount !== actualReviewCount || reviewer.tripCount !== actualBookingCount) {
        await prisma.reviewerProfile.update({
          where: { id: reviewer.id },
          data: {
            reviewCount: actualReviewCount,
            tripCount: actualBookingCount
          }
        })
        fixedCount++
      }
      
      // Link reviews to bookings via reviewerProfile
      const reviews = await prisma.rentalReview.findMany({
        where: { 
          reviewerProfileId: reviewer.id,
          bookingId: null
        }
      })
      
      for (const review of reviews) {
        // Find matching booking by dates and car
        const booking = await prisma.rentalBooking.findFirst({
          where: {
            reviewerProfileId: reviewer.id,
            carId: review.carId,
            endDate: {
              lte: new Date() // Past booking
            }
          }
        })
        
        if (booking && !review.bookingId) {
          await prisma.rentalReview.update({
            where: { id: review.id },
            data: { bookingId: booking.id }
          })
          linkedCount++
        }
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} guest profile counts`)
    console.log(`✅ Linked ${linkedCount} reviews to bookings`)
    
    // Show summary
    const summary = await prisma.reviewerProfile.aggregate({
      _avg: {
        reviewCount: true,
        tripCount: true
      },
      _sum: {
        reviewCount: true,
        tripCount: true
      }
    })
    
    console.log('\n📊 Guest Statistics:')
    console.log(`   Total Reviews: ${summary._sum.reviewCount}`)
    console.log(`   Total Trips: ${summary._sum.tripCount}`)
    console.log(`   Avg Reviews per Guest: ${summary._avg.reviewCount?.toFixed(1)}`)
    console.log(`   Avg Trips per Guest: ${summary._avg.tripCount?.toFixed(1)}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

syncGuestBookings()
  .then(() => {
    console.log('\n✅ Guest sync completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed to sync guests')
    process.exit(1)
  })
