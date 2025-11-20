// scripts/backfill-trip-photos.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ✅ SET THIS TO true TO ACTUALLY UPDATE, false TO DRY RUN
const DRY_RUN = false

async function backfillTripPhotos() {
  console.log('🚀 Starting trip photo backfill...')
  console.log(`🔍 Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will update database)'}\n`)

  try {
    // 1. Get the booking with the correct relation name
    const bookingId = 'cmgj3gidz00addoig9iy7imxi'
    const claimId = 'cmh6ohqop0005doilht4bag3z'

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          include: {
            photos: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!booking || !booking.car) {
      console.error('❌ Booking or car not found')
      return
    }

    console.log(`📋 Booking: ${booking.bookingCode}`)
    console.log(`🚗 Car: ${booking.car.year} ${booking.car.make} ${booking.car.model}`)
    console.log(`📸 Found ${booking.car.photos.length} car photos\n`)

    // 2. Get all car photo URLs
    const carPhotoUrls = booking.car.photos.map(p => p.url)

    if (carPhotoUrls.length === 0) {
      console.error('❌ No car photos found to use')
      return
    }

    console.log('📸 Car Photos:')
    carPhotoUrls.forEach((url, i) => {
      console.log(`   ${i + 1}. ${url}`)
    })
    console.log('')

    // 3. Create photo arrays
    const preTripPhotos = [...carPhotoUrls]
    const postTripPhotos = [...carPhotoUrls]
    const damagePhotos = carPhotoUrls.slice(0, Math.min(3, carPhotoUrls.length))

    console.log('✅ Photo Arrays Created:')
    console.log(`   Pre-Trip: ${preTripPhotos.length} photos`)
    console.log(`   Post-Trip: ${postTripPhotos.length} photos`)
    console.log(`   Damage: ${damagePhotos.length} photos\n`)

    // 4. Show what would be updated in booking
    console.log('📝 BOOKING UPDATE (would set):')
    console.log('   Field: inspectionPhotosStart')
    console.log(`   Value: Array of ${preTripPhotos.length} URLs`)
    console.log('   Field: inspectionPhotosEnd')
    console.log(`   Value: Array of ${postTripPhotos.length} URLs\n`)

    // 5. Show what would be updated in claim
    console.log('📝 CLAIM UPDATE (would set):')
    console.log('   Field: damagePhotos')
    console.log(`   Value: Array of ${damagePhotos.length} URLs\n`)

    // 6. Show inspection photo records that would be created
    const categories = ['FRONT', 'REAR', 'SIDE_LEFT', 'SIDE_RIGHT', 'INTERIOR', 'WHEEL', 'ODOMETER', 'FUEL_GAUGE']
    
    const startPhotos = preTripPhotos.map((url, index) => ({
      bookingId,
      type: 'START',
      category: categories[index % categories.length],
      url,
      uploadedAt: new Date(booking.tripStartedAt || booking.startDate)
    }))

    const endPhotos = postTripPhotos.map((url, index) => ({
      bookingId,
      type: 'END',
      category: index < damagePhotos.length ? 'DAMAGE' : categories[index % categories.length],
      url,
      uploadedAt: new Date(booking.tripEndedAt || booking.endDate)
    }))

    console.log('📝 INSPECTION PHOTOS (would create):')
    console.log(`   ${startPhotos.length} START photos`)
    console.log(`   ${endPhotos.length} END photos`)
    console.log(`   Total: ${startPhotos.length + endPhotos.length} records\n`)

    if (DRY_RUN) {
      console.log('🔍 DRY RUN COMPLETE - No changes made')
      console.log('\n📍 To apply these changes:')
      console.log('   1. Edit scripts/backfill-trip-photos.ts')
      console.log('   2. Change: const DRY_RUN = false  →  const DRY_RUN = false')
      console.log('   3. Run the script again\n')
      return
    }

    // ============================================================
    // ACTUAL DATABASE UPDATES (only if DRY_RUN = false)
    // ============================================================

    console.log('⚠️  APPLYING CHANGES TO DATABASE...\n')

    // Update booking
    console.log('📝 Updating booking...')
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        inspectionPhotosStart: JSON.stringify(preTripPhotos),
        inspectionPhotosEnd: JSON.stringify(postTripPhotos),
      }
    })
    console.log('✅ Booking updated\n')

    // Update claim
    console.log('📝 Updating claim...')
    await prisma.claim.update({
      where: { id: claimId },
      data: {
        damagePhotos: damagePhotos
      }
    })
    console.log('✅ Claim updated\n')

    // Create inspection photo records
    console.log('📝 Creating inspection photo records...')
    await prisma.inspectionPhoto.deleteMany({
      where: { bookingId }
    })

    await prisma.inspectionPhoto.createMany({
      data: [...startPhotos, ...endPhotos]
    })
    console.log('✅ Inspection photos created\n')

    // Verify
    const updatedBooking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        inspectionPhotosStart: true,
        inspectionPhotosEnd: true
      }
    })

    const updatedClaim = await prisma.claim.findUnique({
      where: { id: claimId },
      select: {
        damagePhotos: true
      }
    })

    const inspectionPhotoCount = await prisma.inspectionPhoto.count({
      where: { bookingId }
    })

    console.log('✅ Verification:')
    console.log(`   Booking pre-trip: ${updatedBooking?.inspectionPhotosStart ? JSON.parse(updatedBooking.inspectionPhotosStart).length : 0} photos`)
    console.log(`   Booking post-trip: ${updatedBooking?.inspectionPhotosEnd ? JSON.parse(updatedBooking.inspectionPhotosEnd).length : 0} photos`)
    console.log(`   Claim damage: ${updatedClaim?.damagePhotos?.length || 0} photos`)
    console.log(`   Inspection records: ${inspectionPhotoCount}\n`)

    console.log('🎉 Backfill completed successfully!')
    console.log('\n📍 Visit: http://localhost:3001/host/claims/cmh6ohqop0005doilht4bag3z\n')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backfillTripPhotos()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })