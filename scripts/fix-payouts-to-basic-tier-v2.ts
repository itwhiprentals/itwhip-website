import prisma from '../app/lib/database/prisma'

async function fixPayoutsToBasicTier() {
  console.log('🔧 Fixing Payouts to BASIC Tier (40% host / 60% platform)...\n')
  
  try {
    // Get all payouts with their bookings
    const payouts = await prisma.rentalPayout.findMany({
      include: {
        booking: {
          include: {
            host: {
              select: {
                id: true,
                email: true,
                earningsTier: true
              }
            }
          }
        }
      }
    })
    
    console.log(`📊 Processing ${payouts.length} payouts...`)
    
    let updatedCount = 0
    let totalAdjustment = 0
    const corrections = []
    
    for (const payout of payouts) {
      const booking = payout.booking
      if (!booking) continue
      
      // Calculate correct amount based on BASIC tier (40%)
      const bookingTotal = booking.totalAmount
      const correctHostAmount = bookingTotal * 0.40
      const correctPlatformFee = bookingTotal * 0.60
      const currentAmount = payout.amount
      const adjustment = currentAmount - correctHostAmount
      
      // Update if different
      if (Math.abs(currentAmount - correctHostAmount) > 0.01) {
        await prisma.rentalPayout.update({
          where: { id: payout.id },
          data: { 
            amount: correctHostAmount,
            grossEarnings: bookingTotal,
            platformFee: correctPlatformFee,
            netPayout: correctHostAmount // Assuming no processing fee for now
          }
        })
        
        updatedCount++
        totalAdjustment += adjustment
        
        corrections.push({
          bookingCode: booking.bookingCode,
          was: currentAmount,
          now: correctHostAmount,
          adjustment: adjustment
        })
        
        if (updatedCount <= 5) {
          console.log(`  ✅ Fixed: Booking ${booking.bookingCode} - Was: $${currentAmount.toFixed(2)}, Now: $${correctHostAmount.toFixed(2)}`)
        }
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} payouts`)
    console.log(`💰 Total adjustment: $${totalAdjustment.toFixed(2)} returned to platform`)
    
    // Verify the fix
    const allPayouts = await prisma.rentalPayout.findMany()
    const totalHostEarnings = allPayouts.reduce((sum, p) => sum + p.amount, 0)
    
    const allBookings = await prisma.rentalBooking.findMany()
    const totalRevenue = allBookings.reduce((sum, b) => sum + b.totalAmount, 0)
    
    const platformEarnings = totalRevenue - totalHostEarnings
    const hostPercentage = (totalHostEarnings / totalRevenue * 100)
    const platformPercentage = (platformEarnings / totalRevenue * 100)
    
    console.log('\n📊 New Financial Summary:')
    console.log(`   Total Revenue: $${totalRevenue.toFixed(2)}`)
    console.log(`   Host Earnings: $${totalHostEarnings.toFixed(2)} (${hostPercentage.toFixed(1)}%)`)
    console.log(`   Platform Earnings: $${platformEarnings.toFixed(2)} (${platformPercentage.toFixed(1)}%)`)
    
    if (Math.abs(hostPercentage - 40) < 1) {
      console.log('\n✅ SUCCESS: Payouts now correctly at BASIC tier (40/60 split)!')
    } else {
      console.log('\n⚠️  Some discrepancy remains, may need manual review')
    }
    
    // Save corrections log
    if (corrections.length > 0) {
      const logContent = JSON.stringify(corrections, null, 2)
      require('fs').writeFileSync('payout-corrections.json', logContent)
      console.log('\n📝 Corrections log saved to payout-corrections.json')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

fixPayoutsToBasicTier()
  .then(() => {
    console.log('\n✅ Payout fix completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed to fix payouts')
    process.exit(1)
  })
