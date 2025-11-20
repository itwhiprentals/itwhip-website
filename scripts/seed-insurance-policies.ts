import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DRY_RUN = false // Set to false to actually seed data

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
    console.log('🚀 STARTING INSURANCE SEEDING...')
    console.log('=' .repeat(60))
    
    // Check BEFORE state
    const before = await checkDatabaseState('BEFORE SEEDING')
    
    if (before.bookingsWithInsurance > 0) {
      console.log('\n⚠️  Some bookings already have insurance. Skipping to avoid duplicates.')
      return
    }
    
    // Get provider
    const provider = await prisma.insuranceProvider.findFirst({
      where: { isPrimary: true }
    })
    
    if (!provider) {
      throw new Error('No primary insurance provider found!')
    }
    
    console.log(`\n📍 Using provider: ${provider.name}`)
    
    // Update host tiers - ONLY if they're not already set correctly
    console.log('\n📍 Updating host earning tiers (only where needed)...')
    
    // Only update to PREMIUM if not already PREMIUM
    const commercialUpdate = await prisma.rentalHost.updateMany({
      where: { 
        commercialInsuranceStatus: 'ACTIVE',
        NOT: { earningsTier: 'PREMIUM' }
      },
      data: { earningsTier: 'PREMIUM' }
    })
    console.log(`   ✅ ${commercialUpdate.count} hosts updated to PREMIUM (skipped those already PREMIUM)`)
    
    // Only update to STANDARD if not already STANDARD
    const p2pUpdate = await prisma.rentalHost.updateMany({
      where: { 
        p2pInsuranceStatus: 'ACTIVE',
        NOT: { commercialInsuranceStatus: 'ACTIVE' },
        NOT: { earningsTier: 'STANDARD' }
      },
      data: { earningsTier: 'STANDARD' }
    })
    console.log(`   ✅ ${p2pUpdate.count} hosts updated to STANDARD`)
    
    // Only update to BASIC if not already set to a tier
    const basicUpdate = await prisma.rentalHost.updateMany({
      where: {
        AND: [
          { NOT: { commercialInsuranceStatus: 'ACTIVE' } },
          { NOT: { p2pInsuranceStatus: 'ACTIVE' } },
          { NOT: { earningsTier: 'PREMIUM' } },
          { NOT: { earningsTier: 'STANDARD' } },
          { NOT: { earningsTier: 'BASIC' } }
        ]
      },
      data: { earningsTier: 'BASIC' }
    })
    console.log(`   ✅ ${basicUpdate.count} hosts updated to BASIC (only those without a tier)`)
    
    // Create insurance policies
    console.log('\n📍 Creating insurance policies...')
    
    const bookings = await prisma.rentalBooking.findMany({
      where: { insurancePolicy: null },
      include: { car: true }
    })
    
    const tiers = ['MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY']
    const distribution = [0.2, 0.4, 0.3, 0.1]
    let tierCounts = { MINIMUM: 0, BASIC: 0, PREMIUM: 0, LUXURY: 0 }
    
    for (const booking of bookings) {
      // Assign tier
      const random = Math.random()
      let tierIndex = 0
      let cumulative = distribution[0]
      while (random > cumulative && tierIndex < 3) {
        tierIndex++
        cumulative += distribution[tierIndex]
      }
      const tier = tiers[tierIndex] as 'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY'
      tierCounts[tier]++
      
      // Calculate days
      const days = Math.ceil(
        (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) 
        / (1000 * 60 * 60 * 24)
      )
      
      // Get pricing
      const dailyRate = booking.car?.dailyRate || 100
      const vehicleValue = dailyRate < 75 ? 20000 : 
                          dailyRate < 150 ? 35000 : 
                          dailyRate < 300 ? 75000 : 150000
      
      const pricingRules = provider.pricingRules as any
      const bracket = vehicleValue < 25000 ? pricingRules.under25k :
                     vehicleValue < 50000 ? pricingRules['25to50k'] :
                     vehicleValue < 100000 ? pricingRules['50to100k'] :
                     pricingRules.over100k
      
      const dailyPremium = bracket[tier] || 0
      const totalPremium = dailyPremium * days
      const platformRevenue = totalPremium * 0.7
      
      // Coverage amounts
      const coverage = {
        MINIMUM: { liability: 750000, collision: 0, deductible: 0 },
        BASIC: { liability: 750000, collision: vehicleValue, deductible: 1000 },
        PREMIUM: { liability: 1000000, collision: vehicleValue, deductible: 500 },
        LUXURY: { liability: 2000000, collision: vehicleValue * 1.2, deductible: 0 }
      }
      
      await prisma.insurancePolicy.create({
        data: {
          bookingId: booking.id,
          providerId: provider.id,
          tier,
          liabilityCoverage: coverage[tier].liability,
          collisionCoverage: coverage[tier].collision,
          deductible: coverage[tier].deductible,
          dailyPremium,
          totalPremium,
          platformRevenue,
          status: 'ACTIVE',
          effectiveDate: booking.startDate,
          expiryDate: booking.endDate
        }
      })
    }
    
    console.log(`   ✅ Created ${bookings.length} policies:`)
    console.log(`      - MINIMUM: ${tierCounts.MINIMUM}`)
    console.log(`      - BASIC: ${tierCounts.BASIC}`)
    console.log(`      - PREMIUM: ${tierCounts.PREMIUM}`)
    console.log(`      - LUXURY: ${tierCounts.LUXURY}`)
    
    // Check AFTER state
    await checkDatabaseState('AFTER SEEDING')
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ SEEDING COMPLETE!')
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedInsurancePolicies()
