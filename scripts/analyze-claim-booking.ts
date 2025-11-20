import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeClaimBooking() {
  console.log('🔍 Finding booking with pending claim...\n')

  // Find the pending claim
  const claim = await prisma.claim.findFirst({
    where: {
      status: 'PENDING'
    },
    include: {
      booking: {
        include: {
          car: true,
          host: true,
          reviewerProfile: true,
          review: true,
          inspectionPhotos: true,
        }
      }
    }
  })

  if (!claim) {
    console.log('❌ No pending claims found!')
    return
  }

  console.log('✅ Found pending claim!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 CLAIM INFORMATION')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Claim ID: ${claim.id}`)
  console.log(`Type: ${claim.type}`)
  console.log(`Status: ${claim.status}`)
  console.log(`Estimated Cost: $${claim.estimatedCost}`)
  console.log(`Incident Date: ${claim.incidentDate}`)
  console.log(`Description: ${claim.description}`)
  
  let damagePhotoCount = 0
  try {
    if (claim.damagePhotos && typeof claim.damagePhotos === 'object') {
      damagePhotoCount = Array.isArray(claim.damagePhotos) 
        ? claim.damagePhotos.length 
        : Object.keys(claim.damagePhotos).length
    }
  } catch (e) {
    damagePhotoCount = 0
  }
  console.log(`Damage Photos: ${damagePhotoCount} photos\n`)

  const booking = claim.booking

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 BOOKING INFORMATION')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Booking ID: ${booking.id}`)
  console.log(`Booking Code: ${booking.bookingCode}`)
  console.log(`Status: ${booking.status}`)
  console.log(`Start Date: ${booking.startDate}`)
  console.log(`End Date: ${booking.endDate}`)
  console.log(`Vehicle: ${booking.car.year} ${booking.car.make} ${booking.car.model}`)
  console.log(`Host: ${booking.host.name}`)
  console.log(`Guest: ${booking.reviewerProfile?.name || booking.guestName || 'N/A'}\n`)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ WHAT BOOKING HAS (Current State)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Count inspection photos from JSON strings
  let preTripPhotoCount = 0
  let postTripPhotoCount = 0
  
  try {
    if (booking.inspectionPhotosStart) {
      preTripPhotoCount = JSON.parse(booking.inspectionPhotosStart).length
    }
  } catch (e) {
    preTripPhotoCount = 0
  }
  
  try {
    if (booking.inspectionPhotosEnd) {
      postTripPhotoCount = JSON.parse(booking.inspectionPhotosEnd).length
    }
  } catch (e) {
    postTripPhotoCount = 0
  }

  const hasData = {
    tripCompletion: !!booking.tripCompletedBy,
    tripStartTime: !!booking.tripStartedAt,
    tripEndTime: !!booking.tripEndedAt,
    startMileage: booking.startMileage !== null,
    endMileage: booking.endMileage !== null,
    fuelStart: !!booking.fuelLevelStart,
    fuelEnd: !!booking.fuelLevelEnd,
    pickupCoords: booking.pickupLatitude !== null && booking.pickupLongitude !== null,
    returnCoords: booking.returnLatitude !== null && booking.returnLongitude !== null,
    preTripPhotos: !!booking.inspectionPhotosStart,
    postTripPhotos: !!booking.inspectionPhotosEnd,
    inspectionRecords: booking.inspectionPhotos.length > 0,
    damageReported: booking.damageReported,
    damageDescription: !!booking.damageDescription,
    review: !!booking.review,
  }

  console.log(`Trip Completion: ${hasData.tripCompletion ? '✅' : '❌'} ${booking.tripCompletedBy || 'NULL'}`)
  console.log(`Trip Start Time: ${hasData.tripStartTime ? '✅' : '❌'} ${booking.tripStartedAt || 'NULL'}`)
  console.log(`Trip End Time: ${hasData.tripEndTime ? '✅' : '❌'} ${booking.tripEndedAt || 'NULL'}`)
  console.log(`Start Mileage: ${hasData.startMileage ? '✅' : '❌'} ${booking.startMileage || 'NULL'}`)
  console.log(`End Mileage: ${hasData.endMileage ? '✅' : '❌'} ${booking.endMileage || 'NULL'}`)
  console.log(`Fuel Start: ${hasData.fuelStart ? '✅' : '❌'} ${booking.fuelLevelStart || 'NULL'}`)
  console.log(`Fuel End: ${hasData.fuelEnd ? '✅' : '❌'} ${booking.fuelLevelEnd || 'NULL'}`)
  console.log(`Pickup GPS: ${hasData.pickupCoords ? '✅' : '❌'} ${booking.pickupLatitude ? `${booking.pickupLatitude}, ${booking.pickupLongitude}` : 'NULL'}`)
  console.log(`Return GPS: ${hasData.returnCoords ? '✅' : '❌'} ${booking.returnLatitude ? `${booking.returnLatitude}, ${booking.returnLongitude}` : 'NULL'}`)
  console.log(`Pre-Trip Photos (JSON): ${hasData.preTripPhotos ? '✅' : '❌'} ${preTripPhotoCount > 0 ? `${preTripPhotoCount} photos` : 'NULL'}`)
  console.log(`Post-Trip Photos (JSON): ${hasData.postTripPhotos ? '✅' : '❌'} ${postTripPhotoCount > 0 ? `${postTripPhotoCount} photos` : 'NULL'}`)
  console.log(`InspectionPhoto Records: ${hasData.inspectionRecords ? '✅' : '❌'} ${booking.inspectionPhotos.length} records`)
  console.log(`Damage Reported: ${hasData.damageReported ? '✅' : '❌'} ${booking.damageReported}`)
  console.log(`Damage Description: ${hasData.damageDescription ? '✅' : '❌'} ${booking.damageDescription || 'NULL'}`)
  console.log(`Guest Review: ${hasData.review ? '✅' : '❌'} ${booking.review ? `${booking.review.rating} stars` : 'NULL'}\n`)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('❌ WHAT BOOKING NEEDS (Missing Data)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const missing = []
  if (!hasData.tripCompletion) missing.push('• tripCompletedBy')
  if (!hasData.tripStartTime) missing.push('• tripStartedAt')
  if (!hasData.tripEndTime) missing.push('• tripEndedAt')
  if (!hasData.startMileage) missing.push('• startMileage')
  if (!hasData.endMileage) missing.push('• endMileage')
  if (!hasData.fuelStart) missing.push('• fuelLevelStart')
  if (!hasData.fuelEnd) missing.push('• fuelLevelEnd')
  if (!hasData.pickupCoords) missing.push('• pickupLatitude/pickupLongitude')
  if (!hasData.returnCoords) missing.push('• returnLatitude/returnLongitude')
  if (!hasData.preTripPhotos) missing.push('• inspectionPhotosStart (JSON)')
  if (!hasData.postTripPhotos) missing.push('• inspectionPhotosEnd (JSON)')
  if (!hasData.inspectionRecords) missing.push('• InspectionPhoto records')
  if (!hasData.damageReported) missing.push('• damageReported flag')
  if (!hasData.damageDescription) missing.push('• damageDescription')
  if (!hasData.review) missing.push('• Guest review')

  if (missing.length === 0) {
    console.log('✅ No missing data! Booking is complete!\n')
  } else {
    console.log('Missing fields:')
    missing.forEach(field => console.log(field))
    console.log('')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const totalFields = 15
  const completedFields = Object.values(hasData).filter(Boolean).length
  const completionPercent = Math.round((completedFields / totalFields) * 100)

  console.log(`Completion: ${completedFields}/${totalFields} fields (${completionPercent}%)`)
  console.log(`Missing: ${missing.length} fields\n`)

  if (completionPercent < 100) {
    console.log('🎯 READY FOR BACKFILL!')
    console.log('Next: npx tsx scripts/backfill-dry-run.ts')
    console.log('      (Shows what would change without saving)\n')
  }

  await prisma.$disconnect()
}

analyzeClaimBooking().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})