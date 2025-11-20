// check-host-insurance.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkHostInsurance() {
  console.log('🔍 CHECKING HOST INSURANCE STATUS')
  console.log('=' .repeat(80))
  
  const host = await prisma.rentalHost.findUnique({
    where: {
      id: 'cmfj0oxqm004udomy7qivgt18' // Parker Mills
    },
    select: {
      id: true,
      name: true,
      email: true,
      commissionRate: true,
      earningsTier: true,
      
      // Legacy insurance fields
      insuranceProviderId: true,
      insurancePolicyNumber: true,
      insuranceActive: true,
      
      // Host personal insurance
      hostInsuranceProvider: true,
      hostInsuranceStatus: true,
      hostPolicyNumber: true,
      hostInsuranceExpires: true,
      
      // P2P Insurance
      p2pInsuranceStatus: true,
      p2pInsuranceProvider: true,
      p2pPolicyNumber: true,
      p2pInsuranceExpires: true,
      
      // Commercial Insurance
      commercialInsuranceStatus: true,
      commercialInsuranceProvider: true,
      commercialPolicyNumber: true,
      commercialInsuranceExpires: true,
      
      insuranceProvider: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    }
  })
  
  if (!host) {
    console.log('❌ Host not found')
    await prisma.$disconnect()
    return
  }
  
  console.log('\n👤 HOST INFO:')
  console.log(`   Name: ${host.name}`)
  console.log(`   Email: ${host.email}`)
  console.log(`   Commission Rate: ${host.commissionRate}%`)
  console.log(`   Earnings Tier: ${host.earningsTier || 'NOT SET'}`)
  
  console.log('\n🔑 INSURANCE STATUS:')
  console.log('-' .repeat(80))
  
  // Check Platform Insurance (Legacy)
  console.log('\n📦 PLATFORM INSURANCE:')
  if (host.insuranceProviderId) {
    console.log(`   ✅ Provider: ${host.insuranceProvider?.name || 'Unknown'}`)
    console.log(`   Policy: ${host.insurancePolicyNumber || 'N/A'}`)
    console.log(`   Active: ${host.insuranceActive}`)
  } else {
    console.log(`   ❌ Not assigned`)
  }
  
  // Check P2P Insurance
  console.log('\n🤝 P2P INSURANCE:')
  if (host.p2pInsuranceStatus && host.p2pInsuranceStatus !== 'DEACTIVATED') {
    console.log(`   ✅ Status: ${host.p2pInsuranceStatus}`)
    console.log(`   Provider: ${host.p2pInsuranceProvider || 'N/A'}`)
    console.log(`   Policy: ${host.p2pPolicyNumber || 'N/A'}`)
    console.log(`   Expires: ${host.p2pInsuranceExpires || 'N/A'}`)
  } else {
    console.log(`   ❌ Not active`)
  }
  
  // Check Commercial Insurance
  console.log('\n🏢 COMMERCIAL INSURANCE:')
  if (host.commercialInsuranceStatus && host.commercialInsuranceStatus !== 'DEACTIVATED') {
    console.log(`   ✅ Status: ${host.commercialInsuranceStatus}`)
    console.log(`   Provider: ${host.commercialInsuranceProvider || 'N/A'}`)
    console.log(`   Policy: ${host.commercialPolicyNumber || 'N/A'}`)
    console.log(`   Expires: ${host.commercialInsuranceExpires || 'N/A'}`)
  } else {
    console.log(`   ❌ Not active`)
  }
  
  console.log('\n🧮 EXPECTED TIER CALCULATION:')
  console.log('-' .repeat(80))
  
  let expectedTier = 40
  let tierLabel = '40% (Platform/No Insurance)'
  let insuranceType = 'none'
  
  if (host.commercialInsuranceStatus === 'ACTIVE') {
    expectedTier = 90
    tierLabel = '90% (Commercial)'
    insuranceType = 'commercial'
  } else if (host.p2pInsuranceStatus === 'ACTIVE') {
    expectedTier = 75
    tierLabel = '75% (P2P)'
    insuranceType = 'p2p'
  }
  
  console.log(`   Insurance Type: ${insuranceType}`)
  console.log(`   Expected Tier: ${tierLabel}`)
  console.log(`   Current commissionRate: ${host.commissionRate}%`)
  
  if (host.commissionRate !== expectedTier) {
    console.log('\n   ⚠️  MISMATCH!')
    console.log(`   Database shows ${host.commissionRate}% but should be ${expectedTier}%`)
  } else {
    console.log('\n   ✅ Tier matches insurance status')
  }
  
  console.log('\n' + '=' .repeat(80))
  console.log('✅ CHECK COMPLETE')
  console.log('=' .repeat(80))
  
  await prisma.$disconnect()
}

checkHostInsurance()