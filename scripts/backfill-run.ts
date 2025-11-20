import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfillRun() {
  console.log('🚀 RUNNING BACKFILL - Changes WILL be saved!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Find the pending claim
    const claim = await prisma.claim.findFirst({
      where: { status: 'PENDING' },
      include: {
        booking: {
          include: {
            car: true,
            host: true,
            reviewerProfile: true,
            review: true,
          }
        }
      }
    })

    if (!claim) {
      console.log('❌ No pending claim found!')
      return
    }

    const booking = claim.booking
    
    console.log(`📋 Found Booking: ${booking.bookingCode}`)
    console.log(`   Vehicle: ${booking.car.year} ${booking.car.make} ${booking.car.model}`)
    console.log(`   Duration: ${booking.startDate} → ${booking.endDate}\n`)

    // Calculate trip duration in days
    const startDate = new Date(booking.startDate)
    const endDate = new Date(booking.endDate)
    const durationMs = endDate.getTime() - startDate.getTime()
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💾 SAVING DATA TO DATABASE...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Prepare data
    const tripCompletedBy = 'GUEST'
    const tripStartedAt = booking.tripStartedAt || new Date(booking.startDate.setHours(10, 0, 0, 0))
    const tripEndedAt = booking.tripEndedAt || new Date(booking.endDate.setHours(14, 0, 0, 0))
    
    const avgMilesPerDay = 150
    const startMileage = Math.floor(Math.random() * (50000 - 10000) + 10000)
    const milesDriven = durationDays * avgMilesPerDay
    const endMileage = startMileage + milesDriven

    const fuelLevelStart = 'Full'
    const fuelLevelEnd = '1/2'

    const pickupLatitude = 33.4484
    const pickupLongitude = -112.0740
    const returnLatitude = 33.4484 + (Math.random() * 0.1 - 0.05)
    const returnLongitude = -112.0740 + (Math.random() * 0.1 - 0.05)

    // Pre-Trip Photos (12 photos)
    const preTripPhotos = [
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Front+View+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Rear+View+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Left+Side+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Right+Side+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Interior+Dashboard+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Interior+Seats+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Wheel+FL+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Wheel+FR+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Wheel+RL+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Wheel+RR+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Odometer+Start',
      'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Fuel+Gauge+Start',
    ]

    // Post-Trip Photos (15 photos including damage)
    const postTripPhotos = [
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Front+View+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Rear+View+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Left+Side+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Right+Side+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Interior+Dashboard+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Interior+Seats+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Wheel+FL+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Wheel+FR+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Wheel+RL+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Wheel+RR+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Odometer+End',
      'https://via.placeholder.com/800x600/E74C3C/ffffff?text=Fuel+Gauge+End',
      'https://via.placeholder.com/800x600/FF6B6B/ffffff?text=Damage+Front+Bumper+1',
      'https://via.placeholder.com/800x600/FF6B6B/ffffff?text=Damage+Front+Bumper+2',
      'https://via.placeholder.com/800x600/FF6B6B/ffffff?text=Damage+Close+Up',
    ]

    // Step 1: Update RentalBooking
    console.log('1️⃣  Updating RentalBooking...')
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        tripCompletedBy,
        tripStartedAt,
        tripEndedAt,
        startMileage,
        endMileage,
        fuelLevelStart,
        fuelLevelEnd,
        pickupLatitude,
        pickupLongitude,
        returnLatitude,
        returnLongitude,
        inspectionPhotosStart: JSON.stringify(preTripPhotos),
        inspectionPhotosEnd: JSON.stringify(postTripPhotos),
        damageReported: true,
        damageDescription: claim.description,
      }
    })
    console.log('   ✅ Booking updated successfully!\n')

    // Step 2: Create InspectionPhoto records
    console.log('2️⃣  Creating InspectionPhoto records...')
    
    const inspectionPhotos = [
      // Pre-trip (12)
      { type: 'START', category: 'FRONT', url: preTripPhotos[0], uploadedAt: tripStartedAt },
      { type: 'START', category: 'REAR', url: preTripPhotos[1], uploadedAt: tripStartedAt },
      { type: 'START', category: 'SIDE_LEFT', url: preTripPhotos[2], uploadedAt: tripStartedAt },
      { type: 'START', category: 'SIDE_RIGHT', url: preTripPhotos[3], uploadedAt: tripStartedAt },
      { type: 'START', category: 'INTERIOR', url: preTripPhotos[4], uploadedAt: tripStartedAt },
      { type: 'START', category: 'INTERIOR', url: preTripPhotos[5], uploadedAt: tripStartedAt },
      { type: 'START', category: 'WHEEL', url: preTripPhotos[6], uploadedAt: tripStartedAt },
      { type: 'START', category: 'WHEEL', url: preTripPhotos[7], uploadedAt: tripStartedAt },
      { type: 'START', category: 'WHEEL', url: preTripPhotos[8], uploadedAt: tripStartedAt },
      { type: 'START', category: 'WHEEL', url: preTripPhotos[9], uploadedAt: tripStartedAt },
      { type: 'START', category: 'ODOMETER', url: preTripPhotos[10], uploadedAt: tripStartedAt },
      { type: 'START', category: 'FUEL_GAUGE', url: preTripPhotos[11], uploadedAt: tripStartedAt },
      // Post-trip (15)
      { type: 'END', category: 'FRONT', url: postTripPhotos[0], uploadedAt: tripEndedAt },
      { type: 'END', category: 'REAR', url: postTripPhotos[1], uploadedAt: tripEndedAt },
      { type: 'END', category: 'SIDE_LEFT', url: postTripPhotos[2], uploadedAt: tripEndedAt },
      { type: 'END', category: 'SIDE_RIGHT', url: postTripPhotos[3], uploadedAt: tripEndedAt },
      { type: 'END', category: 'INTERIOR', url: postTripPhotos[4], uploadedAt: tripEndedAt },
      { type: 'END', category: 'INTERIOR', url: postTripPhotos[5], uploadedAt: tripEndedAt },
      { type: 'END', category: 'WHEEL', url: postTripPhotos[6], uploadedAt: tripEndedAt },
      { type: 'END', category: 'WHEEL', url: postTripPhotos[7], uploadedAt: tripEndedAt },
      { type: 'END', category: 'WHEEL', url: postTripPhotos[8], uploadedAt: tripEndedAt },
      { type: 'END', category: 'WHEEL', url: postTripPhotos[9], uploadedAt: tripEndedAt },
      { type: 'END', category: 'ODOMETER', url: postTripPhotos[10], uploadedAt: tripEndedAt },
      { type: 'END', category: 'FUEL_GAUGE', url: postTripPhotos[11], uploadedAt: tripEndedAt },
      { type: 'END', category: 'DAMAGE', url: postTripPhotos[12], uploadedAt: tripEndedAt },
      { type: 'END', category: 'DAMAGE', url: postTripPhotos[13], uploadedAt: tripEndedAt },
      { type: 'END', category: 'DAMAGE', url: postTripPhotos[14], uploadedAt: tripEndedAt },
    ]

    for (const photo of inspectionPhotos) {
      await prisma.inspectionPhoto.create({
        data: {
          bookingId: booking.id,
          type: photo.type,
          category: photo.category,
          url: photo.url,
          uploadedAt: photo.uploadedAt,
        }
      })
    }
    console.log('   ✅ Created 27 InspectionPhoto records!\n')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ BACKFILL COMPLETE!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('📊 SUMMARY:')
    console.log(`   Booking ID: ${booking.id}`)
    console.log(`   Booking Code: ${booking.bookingCode}`)
    console.log(`   Trip Completed By: ${tripCompletedBy}`)
    console.log(`   Mileage: ${startMileage} → ${endMileage} miles`)
    console.log(`   Fuel: ${fuelLevelStart} → ${fuelLevelEnd}`)
    console.log(`   GPS: (${pickupLatitude}, ${pickupLongitude}) → (${returnLatitude.toFixed(4)}, ${returnLongitude.toFixed(4)})`)
    console.log(`   Pre-Trip Photos: 12`)
    console.log(`   Post-Trip Photos: 15 (includes 3 damage photos)`)
    console.log(`   InspectionPhoto Records: 27`)
    console.log(`   Damage Reported: true`)
    console.log(`   Damage Description: "${claim.description}"\n`)

    console.log('🎯 NEXT STEPS:\n')
    console.log('   1. Verify the data:')
    console.log('      → npx tsx scripts/analyze-claim-booking.ts\n')
    console.log('   2. Build Fleet/Admin claim detail page')
    console.log('      → Display complete trip documentation\n')
    console.log('   3. Test the claims workflow')
    console.log('      → Approve/deny with full context\n')

  } catch (error) {
    console.error('❌ Error during backfill:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backfillRun().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})