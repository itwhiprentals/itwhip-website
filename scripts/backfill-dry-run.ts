import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfillDryRun() {
  console.log('🔄 DRY RUN - No changes will be saved!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

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
  console.log('🎯 WHAT WILL BE ADDED:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. Trip Completion
  const tripCompletedBy = 'GUEST'
  const tripStartedAt = booking.tripStartedAt || new Date(booking.startDate.setHours(10, 0, 0, 0))
  const tripEndedAt = booking.tripEndedAt || new Date(booking.endDate.setHours(14, 0, 0, 0))
  
  console.log('1️⃣  TRIP COMPLETION:')
  console.log(`   tripCompletedBy: "${tripCompletedBy}"`)
  console.log(`   tripStartedAt: ${tripStartedAt}`)
  console.log(`   tripEndedAt: ${tripEndedAt}`)
  console.log(`   adminCompletedById: null`)
  console.log(`   adminCompletionNotes: null\n`)

  // 2. Mileage
  const avgMilesPerDay = 150
  const startMileage = Math.floor(Math.random() * (50000 - 10000) + 10000)
  const milesDriven = durationDays * avgMilesPerDay
  const endMileage = startMileage + milesDriven

  console.log('2️⃣  MILEAGE:')
  console.log(`   startMileage: ${startMileage.toLocaleString()} miles`)
  console.log(`   endMileage: ${endMileage.toLocaleString()} miles`)
  console.log(`   Total Driven: ${milesDriven} miles (${durationDays} days × ${avgMilesPerDay} miles/day)\n`)

  // 3. Fuel
  const fuelLevelStart = 'Full'
  const fuelLevelEnd = '1/2'

  console.log('3️⃣  FUEL:')
  console.log(`   fuelLevelStart: "${fuelLevelStart}"`)
  console.log(`   fuelLevelEnd: "${fuelLevelEnd}"`)
  console.log(`   Fuel Used: ~50%\n`)

  // 4. GPS Coordinates (Phoenix area)
  const pickupLatitude = 33.4484
  const pickupLongitude = -112.0740
  const returnLatitude = 33.4484 + (Math.random() * 0.1 - 0.05) // Small offset
  const returnLongitude = -112.0740 + (Math.random() * 0.1 - 0.05)

  console.log('4️⃣  GPS COORDINATES:')
  console.log(`   Pickup: ${pickupLatitude}, ${pickupLongitude} (Phoenix, AZ)`)
  console.log(`   Return: ${returnLatitude.toFixed(4)}, ${returnLongitude.toFixed(4)} (Phoenix, AZ)\n`)

  // 5. Pre-Trip Photos (12 photos)
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

  console.log('5️⃣  PRE-TRIP PHOTOS (12 photos):')
  preTripPhotos.forEach((url, i) => {
    console.log(`   ${i + 1}. ${url}`)
  })
  console.log('')

  // 6. Post-Trip Photos (15 photos including damage)
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
    // DAMAGE PHOTOS (since claim exists)
    'https://via.placeholder.com/800x600/FF6B6B/ffffff?text=Damage+Front+Bumper+1',
    'https://via.placeholder.com/800x600/FF6B6B/ffffff?text=Damage+Front+Bumper+2',
    'https://via.placeholder.com/800x600/FF6B6B/ffffff?text=Damage+Close+Up',
  ]

  console.log('6️⃣  POST-TRIP PHOTOS (15 photos):')
  postTripPhotos.forEach((url, i) => {
    console.log(`   ${i + 1}. ${url}`)
  })
  console.log('')

  // 7. Damage Status
  console.log('7️⃣  DAMAGE STATUS:')
  console.log(`   damageReported: true (claim exists)`)
  console.log(`   damageDescription: "${claim.description}"\n`)

  // 8. InspectionPhoto Records
  const inspectionPhotoCategories = [
    // Pre-trip (12)
    { type: 'START', category: 'FRONT', url: preTripPhotos[0] },
    { type: 'START', category: 'REAR', url: preTripPhotos[1] },
    { type: 'START', category: 'SIDE_LEFT', url: preTripPhotos[2] },
    { type: 'START', category: 'SIDE_RIGHT', url: preTripPhotos[3] },
    { type: 'START', category: 'INTERIOR', url: preTripPhotos[4] },
    { type: 'START', category: 'INTERIOR', url: preTripPhotos[5] },
    { type: 'START', category: 'WHEEL', url: preTripPhotos[6] },
    { type: 'START', category: 'WHEEL', url: preTripPhotos[7] },
    { type: 'START', category: 'WHEEL', url: preTripPhotos[8] },
    { type: 'START', category: 'WHEEL', url: preTripPhotos[9] },
    { type: 'START', category: 'ODOMETER', url: preTripPhotos[10] },
    { type: 'START', category: 'FUEL_GAUGE', url: preTripPhotos[11] },
    // Post-trip (15)
    { type: 'END', category: 'FRONT', url: postTripPhotos[0] },
    { type: 'END', category: 'REAR', url: postTripPhotos[1] },
    { type: 'END', category: 'SIDE_LEFT', url: postTripPhotos[2] },
    { type: 'END', category: 'SIDE_RIGHT', url: postTripPhotos[3] },
    { type: 'END', category: 'INTERIOR', url: postTripPhotos[4] },
    { type: 'END', category: 'INTERIOR', url: postTripPhotos[5] },
    { type: 'END', category: 'WHEEL', url: postTripPhotos[6] },
    { type: 'END', category: 'WHEEL', url: postTripPhotos[7] },
    { type: 'END', category: 'WHEEL', url: postTripPhotos[8] },
    { type: 'END', category: 'WHEEL', url: postTripPhotos[9] },
    { type: 'END', category: 'ODOMETER', url: postTripPhotos[10] },
    { type: 'END', category: 'FUEL_GAUGE', url: postTripPhotos[11] },
    { type: 'END', category: 'DAMAGE', url: postTripPhotos[12] },
    { type: 'END', category: 'DAMAGE', url: postTripPhotos[13] },
    { type: 'END', category: 'DAMAGE', url: postTripPhotos[14] },
  ]

  console.log('8️⃣  INSPECTION PHOTO RECORDS (27 records):')
  console.log(`   12 START photos (pre-trip)`)
  console.log(`   15 END photos (post-trip, includes 3 damage photos)\n`)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 SUMMARY OF CHANGES')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('Database Operations (IF APPROVED):')
  console.log('  • UPDATE RentalBooking:')
  console.log('    - Set tripCompletedBy = "GUEST"')
  console.log('    - Set tripStartedAt/tripEndedAt timestamps')
  console.log(`    - Set startMileage = ${startMileage}`)
  console.log(`    - Set endMileage = ${endMileage}`)
  console.log('    - Set fuelLevelStart = "Full"')
  console.log('    - Set fuelLevelEnd = "1/2"')
  console.log(`    - Set pickup coordinates (${pickupLatitude}, ${pickupLongitude})`)
  console.log(`    - Set return coordinates (${returnLatitude.toFixed(4)}, ${returnLongitude.toFixed(4)})`)
  console.log('    - Set inspectionPhotosStart (JSON with 12 URLs)')
  console.log('    - Set inspectionPhotosEnd (JSON with 15 URLs)')
  console.log('    - Set damageReported = true')
  console.log(`    - Set damageDescription = "${claim.description}"`)
  console.log('')
  console.log('  • CREATE 27 InspectionPhoto records')
  console.log('    - 12 START records (pre-trip)')
  console.log('    - 15 END records (post-trip with damage)')
  console.log('')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ DRY RUN COMPLETE!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('🎯 NEXT STEPS:\n')
  console.log('   Review the changes above carefully.')
  console.log('   If everything looks good, run:\n')
  console.log('   → npx tsx scripts/backfill-run.ts\n')
  console.log('   This will ACTUALLY save the changes to the database.\n')

  await prisma.$disconnect()
}

backfillDryRun().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})