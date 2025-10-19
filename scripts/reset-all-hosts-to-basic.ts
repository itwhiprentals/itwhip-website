import prisma from '../app/lib/database/prisma'

async function resetAllHostsToBasic() {
  console.log('🔄 Resetting ALL hosts to BASIC tier (no insurance)...\n')
  console.log('📝 This will:')
  console.log('   - Set earningsTier to BASIC (40% earnings)')
  console.log('   - Clear fake "Legacy Provider" insurance data')
  console.log('   - Reset all insurance fields to inactive\n')
  
  try {
    // Count current state
    const beforeStats = await prisma.rentalHost.groupBy({
      by: ['earningsTier'],
      _count: true
    })
    
    console.log('📊 Before Reset:')
    beforeStats.forEach(stat => {
      console.log(`   ${stat.earningsTier}: ${stat._count} hosts`)
    })
    
    // Reset ALL hosts to BASIC with no insurance
    const result = await prisma.rentalHost.updateMany({
      data: {
        // Set to BASIC tier (40% earnings)
        earningsTier: 'BASIC',
        
        // Clear all fake insurance data
        p2pInsuranceStatus: null,
        p2pInsuranceProvider: null,
        p2pPolicyNumber: null,
        p2pInsuranceExpires: null,
        p2pInsuranceActive: false,
        
        commercialInsuranceStatus: null,
        commercialInsuranceProvider: null,
        commercialPolicyNumber: null,
        commercialInsuranceExpires: null,
        commercialInsuranceActive: false,
        
        // Keep legacy fields but mark as inactive
        hostInsuranceStatus: 'DEACTIVATED',
        
        // Update tracking
        lastTierChange: new Date(),
        tierChangeReason: 'System reset: No verified insurance on file',
        tierChangeBy: 'SYSTEM_CLEANUP'
      }
    })
    
    console.log(`\n✅ Updated ${result.count} hosts to BASIC tier`)
    
    // Verify the update
    const afterStats = await prisma.rentalHost.groupBy({
      by: ['earningsTier'],
      _count: true
    })
    
    console.log('\n📊 After Reset:')
    afterStats.forEach(stat => {
      console.log(`   ${stat.earningsTier}: ${stat._count} hosts`)
    })
    
    console.log('\n✅ All hosts now at BASIC tier (40% earnings)')
    console.log('📝 Next steps:')
    console.log('   1. Hosts can request to add their insurance')
    console.log('   2. Admin reviews and assigns insurance via /fleet/hosts/[id]/insurance/assign/')
    console.log('   3. System automatically upgrades tier based on insurance type')
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

resetAllHostsToBasic()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed to complete reset')
    process.exit(1)
  })
