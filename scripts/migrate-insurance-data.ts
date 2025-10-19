// scripts/migrate-insurance-data.ts
import prisma from '../app/lib/database/prisma'

async function migrateInsuranceData() {
  console.log('🚀 Starting insurance data migration...\n')
  
  try {
    // Get all hosts with existing insurance status
    const hosts = await prisma.rentalHost.findMany({
      where: {
        usingLegacyInsurance: true,
        hostInsuranceStatus: {
          in: ['ACTIVE', 'EXPIRED', 'DEACTIVATED', 'SUSPENDED', 'PENDING']
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        hostInsuranceStatus: true,
        hostInsuranceProvider: true,
        hostPolicyNumber: true,
        hostInsuranceExpires: true
      }
    })
    
    console.log(`📊 Found ${hosts.length} hosts with insurance data to migrate\n`)
    
    let successCount = 0
    
    for (const host of hosts) {
      const status = host.hostInsuranceStatus
      
      // Map old status to new InsuranceStatus
      let newStatus: 'ACTIVE' | 'EXPIRED' | 'DEACTIVATED' | 'SUSPENDED' | 'PENDING' | 'NONE' = 'NONE'
      let newTier: 'BASIC' | 'STANDARD' | 'PREMIUM' = 'BASIC'
      let isActive = false
      
      switch (status) {
        case 'ACTIVE':
          newStatus = 'ACTIVE'
          newTier = 'STANDARD' // Upgrade to 75% earnings
          isActive = true
          break
        case 'EXPIRED':
          newStatus = 'EXPIRED'
          break
        case 'DEACTIVATED':
          newStatus = 'DEACTIVATED'
          break
        case 'SUSPENDED':
          newStatus = 'SUSPENDED'
          break
        case 'PENDING':
          newStatus = 'PENDING'
          break
      }
      
      // Update to new fields
      await prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          // Copy to P2P insurance fields
          p2pInsuranceStatus: newStatus,
          p2pInsuranceProvider: host.hostInsuranceProvider || 'Legacy Provider',
          p2pPolicyNumber: host.hostPolicyNumber,
          p2pInsuranceExpires: host.hostInsuranceExpires,
          p2pInsuranceActive: isActive,
          
          // Set earnings tier
          earningsTier: newTier,
          
          // Mark as migrated
          usingLegacyInsurance: false,
          lastTierChange: new Date(),
          tierChangeReason: `Auto-migrated from legacy insurance (${status} -> ${newTier})`,
          tierChangeBy: 'SYSTEM_MIGRATION'
        }
      })
      
      console.log(`✅ ${host.email} | ${status} -> ${newTier}`)
      successCount++
    }
    
    console.log(`\n🎉 Migration Complete! ${successCount} hosts migrated`)
    
    // Show tier distribution - FIXED
    const tierCounts = await prisma.rentalHost.groupBy({
      by: ['earningsTier'],
      _count: true
    })
    
    console.log(`\n📊 Earnings Tier Distribution:`)
    tierCounts.forEach(tier => {
      const percentage = tier.earningsTier === 'BASIC' ? '40%' : 
                        tier.earningsTier === 'STANDARD' ? '75%' : '90%'
      console.log(`   ${tier.earningsTier} (${percentage}): ${tier._count} hosts`)
    })
    
    // Additional summary stats
    const totalHosts = await prisma.rentalHost.count()
    const legacyHosts = await prisma.rentalHost.count({ where: { usingLegacyInsurance: true } })
    
    console.log(`\n📈 Migration Summary:`)
    console.log(`   Total Hosts: ${totalHosts}`)
    console.log(`   Migrated: ${totalHosts - legacyHosts}`)
    console.log(`   Still on Legacy: ${legacyHosts}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateInsuranceData()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })