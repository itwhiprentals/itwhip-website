import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DRY_RUN = true // Set to false to actually update

// Helper to calculate base deposit by car class
function getBaseDeposit(dailyRate: number): number {
  if (dailyRate < 150) return 250  // Economy
  if (dailyRate < 500) return 700  // Luxury
  return 1000 // Exotic
}

async function seedInsuranceWithDeposits() {
  try {
    console.log('\n' + '='.repeat(60))
    console.log(DRY_RUN ? '🔍 DRY RUN MODE - No changes will be made' : '🚀 STARTING FULL SEEDING...')
    console.log('='.repeat(60))

    // Get all bookings to check deposit status
    const allBookings = await prisma.rentalBooking.findMany({
      select: {
        id: true,
        securityDeposit: true,
        depositHeld: true,
        depositAmount: true,
        reviewerProfileId: true
      }
    })

    const bookingsWithoutDeposits = allBookings.filter(b => 
      !b.securityDeposit || b.securityDeposit === 0 || 
      !b.depositHeld || b.depositHeld === 0
    ).length

    const bookingsWithGuests = await prisma.rentalBooking.count({
      where: {
        reviewerProfileId: { not: null },
        reviewerProfile: {
          insuranceVerified: true
        }
      }
    })

    console.log('\n📊 CURRENT STATE:')
    console.log(`   Total bookings: ${allBookings.length}`)
    console.log(`   Bookings missing deposit data: ${bookingsWithoutDeposits}`)
    console.log(`   Bookings with verified guest insurance: ${bookingsWithGuests}`)

    // Get all bookings with their relations
    const bookings = await prisma.rentalBooking.findMany({
      include: {
        car: true,
        insurancePolicy: true,
        reviewerProfile: {
          select: {
            insuranceVerified: true,
            insuranceProvider: true
          }
        }
      }
    })

    let updateCount = 0
    let depositStats = {
      economy: { count: 0, totalBase: 0, totalHeld: 0 },
      luxury: { count: 0, totalBase: 0, totalHeld: 0 },
      exotic: { count: 0, totalBase: 0, totalHeld: 0 }
    }

    console.log('\n📝 PROCESSING BOOKINGS:')
    console.log('='.repeat(60))

    for (const booking of bookings) {
      const dailyRate = booking.car?.dailyRate || 100
      const baseDeposit = getBaseDeposit(dailyRate)
      
      // Determine car class for stats
      const carClass = dailyRate < 150 ? 'economy' : dailyRate < 500 ? 'luxury' : 'exotic'
      
      // Check if guest has verified insurance (50% discount)
      const guestHasInsurance = booking.reviewerProfile?.insuranceVerified === true
      const depositDiscount = guestHasInsurance ? 0.5 : 1.0
      
      // Check for MINIMUM tier (increased deposit)
      let finalBaseDeposit = baseDeposit
      if (booking.insurancePolicy?.tier === 'MINIMUM') {
        // MINIMUM tier has massively increased deposits
        finalBaseDeposit = dailyRate < 150 ? 2500 : dailyRate < 500 ? 5000 : 10000
      }
      
      // Calculate actual deposit held
      const depositHeld = Math.round(finalBaseDeposit * depositDiscount)
      
      // Update stats
      depositStats[carClass].count++
      depositStats[carClass].totalBase += finalBaseDeposit
      depositStats[carClass].totalHeld += depositHeld

      if (updateCount < 5) { // Show first 5 examples
        console.log(`\n   Example ${updateCount + 1}:`)
        console.log(`      Booking: ${booking.bookingCode.slice(0, 10)}...`)
        console.log(`      Car: $${dailyRate}/day (${carClass})`)
        console.log(`      Insurance Tier: ${booking.insurancePolicy?.tier || 'NONE'}`)
        console.log(`      Base Deposit: $${finalBaseDeposit}`)
        console.log(`      Guest Insurance: ${guestHasInsurance ? 'YES (-50%)' : 'NO'}`)
        console.log(`      Final Deposit Held: $${depositHeld}`)
        if (booking.insurancePolicy?.tier === 'MINIMUM') {
          console.log(`      ⚠️  MINIMUM tier penalty applied!`)
        }
      }

      if (!DRY_RUN) {
        // Actually update the booking
        await prisma.rentalBooking.update({
          where: { id: booking.id },
          data: {
            securityDeposit: finalBaseDeposit,
            depositHeld: depositHeld,
            depositAmount: depositHeld // Also update the legacy field
          }
        })
      }
      
      updateCount++
    }

    // Count by insurance tier
    const tierCounts = await prisma.insurancePolicy.groupBy({
      by: ['tier'],
      _count: true
    })

    console.log('\n' + '='.repeat(60))
    console.log('📈 DEPOSIT SUMMARY BY CAR CLASS:')
    console.log('='.repeat(60))
    
    Object.entries(depositStats).forEach(([carClass, stats]) => {
      if (stats.count > 0) {
        const avgBase = Math.round(stats.totalBase / stats.count)
        const avgHeld = Math.round(stats.totalHeld / stats.count)
        console.log(`\n   ${carClass.toUpperCase()} CLASS:`)
        console.log(`      Bookings: ${stats.count}`)
        console.log(`      Avg Base Deposit: $${avgBase.toLocaleString()}`)
        console.log(`      Avg Held Deposit: $${avgHeld.toLocaleString()}`)
        console.log(`      Total Held: $${stats.totalHeld.toLocaleString()}`)
      }
    })

    console.log('\n' + '='.repeat(60))
    console.log('📊 INSURANCE TIER DISTRIBUTION:')
    console.log('='.repeat(60))
    tierCounts.forEach(t => {
      console.log(`   ${t.tier}: ${t._count} bookings`)
    })

    console.log('\n' + '='.repeat(60))
    console.log(DRY_RUN 
      ? '✅ DRY RUN COMPLETE - No changes made\n   To execute for real, set DRY_RUN = false'
      : `✅ SEEDING COMPLETE - Updated ${updateCount} bookings`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedInsuranceWithDeposits()
