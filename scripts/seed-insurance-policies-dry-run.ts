import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Set this to false to actually run the seed
const DRY_RUN = true

async function checkDatabaseState(label: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 ${label}`)
  console.log('='.repeat(60))
  
  const totalBookings = await prisma.rentalBooking.count()
  const bookingsWithInsurance = await prisma.rentalBooking.count({
    where: { insurancePolicy: { isNot: null } }
  })
  
  const totalPolicies = await prisma.insurancePolicy.count()
  const providers = await prisma.insuranceProvider.count()
  
  const hostTiers = await prisma.rentalHost.groupBy({
    by: ['earningsTier'],
    _count: true
  })
  
  console.log(`\n📚 Bookings:`)
  console.log(`   Total: ${totalBookings}`)
  console.log(`   With Insurance: ${bookingsWithInsurance}`)
  console.log(`   Without Insurance: ${totalBookings - bookingsWithInsurance}`)
  
  console.log(`\n📋 Insurance:`)
  console.log(`   Policies: ${totalPolicies}`)
  console.log(`   Providers: ${providers}`)
  
  console.log(`\n👥 Host Earning Tiers:`)
  hostTiers.forEach(tier => {
    const tierName = tier.earningsTier || 'NOT_SET'
    console.log(`   ${tierName}: ${tier._count} hosts`)
  })
  
  return { totalBookings, bookingsWithInsurance, totalPolicies }
}

async function seedInsurancePolicies() {
  try {
    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No changes will be made to database')
      console.log('=' .repeat(60))
    }
    
    // Check BEFORE state
    const before = await checkDatabaseState('CURRENT STATE')
    
    // Simulate what WOULD happen
    console.log('\n' + '='.repeat(60))
    console.log('📝 WHAT WOULD HAPPEN:')
    console.log('='.repeat(60))
    
    // Count hosts by insurance type
    const commercialHosts = await prisma.rentalHost.count({
      where: { commercialInsuranceStatus: 'ACTIVE' }
    })
    
    const p2pHosts = await prisma.rentalHost.count({
      where: { 
        p2pInsuranceStatus: 'ACTIVE',
        NOT: { commercialInsuranceStatus: 'ACTIVE' }
      }
    })
    
    // Count hosts that need to be set to BASIC
    const totalHosts = await prisma.rentalHost.count()
    const basicHosts = totalHosts - commercialHosts - p2pHosts
    
    console.log('\n📍 Host Tier Updates:')
    console.log(`   Would set ${commercialHosts} hosts to PREMIUM (90% earnings)`)
    console.log(`   Would set ${p2pHosts} hosts to STANDARD (75% earnings)`)
    console.log(`   Would set ${basicHosts} hosts to BASIC (40% earnings)`)
    
    // Check bookings without insurance
    const uninsuredBookings = await prisma.rentalBooking.count({
      where: { insurancePolicy: null }
    })
    
    // Check provider
    const provider = await prisma.insuranceProvider.findFirst({
      where: { isPrimary: true }
    })
    
    if (!provider) {
      console.log('\n⚠️  WARNING: No primary insurance provider found!')
      console.log('   Please run the Tint seed script first.')
      return
    }
    
    console.log('\n📍 Insurance Provider:')
    console.log(`   Will use: ${provider.name}`)
    
    console.log('\n📍 Insurance Policies:')
    console.log(`   Would create ${uninsuredBookings} policies`)
    console.log(`   Distribution:`)
    console.log(`     - MINIMUM: ~${Math.round(uninsuredBookings * 0.2)} policies (20%)`)
    console.log(`     - BASIC: ~${Math.round(uninsuredBookings * 0.4)} policies (40%)`)
    console.log(`     - PREMIUM: ~${Math.round(uninsuredBookings * 0.3)} policies (30%)`)
    console.log(`     - LUXURY: ~${Math.round(uninsuredBookings * 0.1)} policies (10%)`)
    
    if (!DRY_RUN) {
      console.log('\n⚠️  THIS WOULD BE A REAL RUN!')
      console.log('Set DRY_RUN = false in the script to execute changes.')
    } else {
      console.log('\n✅ DRY RUN COMPLETE - No changes made')
      console.log('To execute for real, set DRY_RUN = false in the script')
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedInsurancePolicies()
