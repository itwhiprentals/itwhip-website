const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function backfillClaim() {
  try {
    console.log('🔄 Starting backfill process...\n')
    
    // Get the existing claim
    const claim = await prisma.claim.findUnique({
      where: { id: 'cmh6ohqop0005doilht4bag3z' },
      include: {
        booking: {
          include: {
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                isActive: true,
                rules: true
              }
            }
          }
        }
      }
    })
    
    if (!claim) {
      console.log('❌ Claim not found')
      return
    }
    
    console.log('✅ Found claim:', claim.id)
    console.log('✅ Claim type:', claim.type)
    console.log('✅ Car ID:', claim.booking.car.id)
    console.log('✅ Current isActive:', claim.booking.car.isActive)
    console.log('\n🔄 Backfilling vehicle deactivation...\n')
    
    // Parse existing rules
    const existingRules = claim.booking.car.rules 
      ? JSON.parse(claim.booking.car.rules) 
      : {}
    
    // Update car to deactivated state (as the new code would have done)
    const updatedCar = await prisma.rentalCar.update({
      where: { id: claim.booking.car.id },
      data: {
        isActive: false,
        rules: JSON.stringify({
          ...existingRules,
          deactivationReason: `Claim filed: ${claim.type}`,
          deactivatedAt: new Date().toISOString(),
          deactivatedBy: claim.hostId,
          claimId: claim.id,
          claimType: claim.type,
          previousActiveStatus: claim.booking.car.isActive,
          backfilled: true,
          backfilledAt: new Date().toISOString()
        })
      }
    })
    
    console.log('✅ BACKFILL COMPLETE!\n')
    console.log('📊 Updated Vehicle Status:')
    console.log('   Car ID:', updatedCar.id)
    console.log('   Make/Model:', updatedCar.year, updatedCar.make, updatedCar.model)
    console.log('   isActive:', updatedCar.isActive, '(was:', claim.booking.car.isActive, ')')
    console.log('   Deactivation reason: Claim filed:', claim.type)
    console.log('   Claim ID:', claim.id)
    console.log('\n✅ The car is now in the correct state!')
    console.log('\n🧪 Next steps:')
    console.log('   1. Run: node check-claim.js')
    console.log('   2. Refresh browser - car should show unavailable')
    console.log('   3. Search results - car should NOT appear')
    console.log('   4. Direct URL - should show unavailable badge')
    console.log('   5. Booking page - should be greyed out\n')
    
  } catch (error) {
    console.error('❌ Error during backfill:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

backfillClaim()
