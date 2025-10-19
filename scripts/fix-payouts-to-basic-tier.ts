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
    
    for (const payout of payouts) {
      const booking = payout.booking
      if (!booking) continue
      
      // Calculate correct amount based on BASIC tier (40%)
      const correctAmount = booking.totalAmount * 0.40
      const currentAmount = payout.amount
      const adjustment = currentAmount - correctAmount
      
      // Update if different
      if (Math.abs(currentAmount - correctAmount) > 0.01) {
        await prisma.rentalPayout.update({
          where: { id: payout.id },
          data: { 
            amount: correctAmount,
            // Update metadata to track the correction
            metadata: {
              originalAmount: currentAmount,
              correctedAt: new Date().toISOString(),
              tierUsed: 'BASIC',
              hostEarningsPercentage: 0.40,
              platformFeePercentage: 0.60
            }
          }
        })
        
        updatedCount++
        totalAdjustment += adjustment
        
        console.log(`  ✅ Fixed: Booking ${booking.bookingCode} - Was: $${currentAmount.toFixed(2)}, Now: $${correctAmount.toFixed(2)}`)
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
    
    console.log('\n📊 New Financial Summary:')
    console.log(`   Total Revenue: $${totalRevenue.toFixed(2)}`)
    console.log(`   Host Earnings (40%): $${totalHostEarnings.toFixed(2)}`)
    console.log(`   Platform Earnings (60%): $${platformEarnings.toFixed(2)}`)
    console.log(`   Actual Host %: ${hostPercentage.toFixed(1)}%`)
    
    if (Math.abs(hostPercentage - 40) < 1) {
      console.log('\n✅ SUCCESS: Payouts now correctly at BASIC tier (40/60 split)!')
    } else {
      console.log('\n⚠️  Some discrepancy remains, may need manual review')
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
