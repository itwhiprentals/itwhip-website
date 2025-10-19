// scripts/recalculate-host-tiers-conservative.ts
import prisma from '../app/lib/database/prisma'

async function recalculateHostTiersConservative() {
  console.log('🔄 Recalculating host earnings tiers (CONSERVATIVE)...\n')
  console.log('⚠️  Hosts will be set to BASIC (40%) unless they have VERIFIED insurance\n')
  
  const hosts = await prisma.rentalHost.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      earningsTier: true,
      
      // Insurance fields
      p2pInsuranceStatus: true,
      p2pInsuranceProvider: true,
      p2pPolicyNumber: true,
      p2pInsuranceExpires: true,
      
      commercialInsuranceStatus: true,
      commercialInsuranceProvider: true,
      commercialPolicyNumber: true,
      commercialInsuranceExpires: true,
      
      hostInsuranceStatus: true,
      hostInsuranceProvider: true,
      hostPolicyNumber: true,
      hostInsuranceExpires: true,
      
      // Documents
      insuranceDocUrl: true,
      documentsVerified: true
    }
  })
  
  console.log(`📊 Found ${hosts.length} hosts\n`)
  
  let basicCount = 0
  let standardCount = 0
  let premiumCount = 0
  let updatedCount = 0
  
  for (const host of hosts) {
    let correctTier: 'BASIC' | 'STANDARD' | 'PREMIUM'
    let reason = ''
    
    // Check if insurance is expired
    const now = new Date()
    const p2pExpired = host.p2pInsuranceExpires ? new Date(host.p2pInsuranceExpires) < now : false
    const commercialExpired = host.commercialInsuranceExpires ? new Date(host.commercialInsuranceExpires) < now : false
    const legacyExpired = host.hostInsuranceExpires ? new Date(host.hostInsuranceExpires) < now : false
    
    // ✅ TIER 1: Check commercial insurance (PREMIUM - 90%)
    if (
      host.commercialInsuranceStatus === 'ACTIVE' &&
      host.commercialInsuranceProvider &&
      host.commercialPolicyNumber &&
      !commercialExpired
    ) {
      correctTier = 'PREMIUM'
      reason = `Commercial insurance: ${host.commercialInsuranceProvider}`
      premiumCount++
    }
    // ✅ TIER 2: Check P2P insurance (STANDARD - 75%)
    else if (
      host.p2pInsuranceStatus === 'ACTIVE' &&
      host.p2pInsuranceProvider &&
      host.p2pPolicyNumber &&
      !p2pExpired
    ) {
      correctTier = 'STANDARD'
      reason = `P2P insurance: ${host.p2pInsuranceProvider}`
      standardCount++
    }
    // ✅ TIER 3: Check legacy insurance (STANDARD - 75%)
    // ONLY if they have provider, policy number, and it's not expired
    else if (
      host.hostInsuranceStatus === 'ACTIVE' &&
      host.hostInsuranceProvider &&
      host.hostPolicyNumber &&
      !legacyExpired
    ) {
      correctTier = 'STANDARD'
      reason = `Legacy insurance: ${host.hostInsuranceProvider}`
      standardCount++
    }
    // ❌ DEFAULT: No verified insurance (BASIC - 40%)
    else {
      correctTier = 'BASIC'
      reason = 'No verified insurance'
      basicCount++
    }
    
    // Update if different
    if (host.earningsTier !== correctTier) {
      await prisma.rentalHost.update({
        where: { id: host.id },
        data: { 
          earningsTier: correctTier,
          lastTierChange: new Date(),
          tierChangeReason: `Recalculated: ${reason}`,
          tierChangeBy: 'SYSTEM_RECALCULATION'
        }
      })
      console.log(`✅ ${host.email}: ${host.earningsTier} → ${correctTier} (${reason})`)
      updatedCount++
    } else {
      console.log(`⏭️  ${host.email}: ${correctTier} (already correct)`)
    }
  }
  
  console.log(`\n📊 Final Distribution:`)
  console.log(`   BASIC (40%): ${basicCount} hosts - No insurance`)
  console.log(`   STANDARD (75%): ${standardCount} hosts - P2P/Legacy insurance`)
  console.log(`   PREMIUM (90%): ${premiumCount} hosts - Commercial insurance`)
  console.log(`\n✅ Updated ${updatedCount} hosts`)
  console.log(`⏭️  Skipped ${hosts.length - updatedCount} hosts (already correct)`)
}

recalculateHostTiersConservative()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })