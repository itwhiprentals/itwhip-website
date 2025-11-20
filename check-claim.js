const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkClaim() {
  try {
    // Get the most recent claim
    const claim = await prisma.claim.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            car: true
          }
        }
      }
    })

    if (!claim) {
      console.log('❌ No claims found')
      return
    }

    console.log('\n🔍 CLAIM VERIFICATION RESULTS:\n')
    console.log('✅ Claim ID:', claim.id)
    console.log('✅ Claim Type:', claim.type)
    console.log('✅ Claim Status:', claim.status)
    console.log('✅ Booking ID:', claim.bookingId)
    console.log('✅ Car ID:', claim.booking.car.id)
    console.log('✅ Car:', claim.booking.car.year, claim.booking.car.make, claim.booking.car.model)
    console.log('\n🚗 VEHICLE STATUS:')
    console.log('   isActive:', claim.booking.car.isActive)
    
    if (claim.booking.car.isActive === false) {
      console.log('   ✅ CORRECT - Car is deactivated')
    } else {
      console.log('   ❌ PROBLEM - Car is still active!')
    }

    // Check rules field
    if (claim.booking.car.rules) {
      try {
        const rules = JSON.parse(claim.booking.car.rules)
        if (rules.deactivationReason) {
          console.log('   ✅ Deactivation reason:', rules.deactivationReason)
          console.log('   ✅ Deactivated at:', rules.deactivatedAt)
          console.log('   ✅ Claim ID in rules:', rules.claimId)
        } else {
          console.log('   ❌ No deactivation info in rules')
        }
      } catch (e) {
        console.log('   ❌ Could not parse rules JSON')
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkClaim()
