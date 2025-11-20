import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeDataPatterns() {
  console.log('🔍 ===== DEEP DATA PATTERN ANALYSIS =====\n')

  // 1. FIND THE ONE HOST WITH PROPER APPROVAL
  console.log('📊 Step 1: Finding hosts WITH approval data...\n')
  
  const hostsWithApproval = await prisma.rentalHost.findMany({
    where: {
      approvalStatus: 'APPROVED',
      approvedAt: { not: null }
    },
    select: {
      id: true,
      name: true,
      email: true,
      joinedAt: true,
      approvedAt: true,
      verifiedAt: true,
      approvedBy: true,
      documentsVerified: true,
      earningsTier: true,
      cars: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          createdAt: true,
          vinVerifiedAt: true,
          registrationVerifiedAt: true,
          titleVerifiedAt: true,
          bookings: {
            select: {
              id: true,
              bookingCode: true,
              startDate: true,
              endDate: true,
              status: true
            },
            orderBy: { startDate: 'asc' }
          }
        }
      }
    }
  })

  console.log(`✅ Hosts WITH proper approval: ${hostsWithApproval.length}\n`)

  if (hostsWithApproval.length > 0) {
    hostsWithApproval.forEach(host => {
      console.log(`\n📌 ${host.name} (${host.email})`)
      console.log(`   Joined: ${host.joinedAt}`)
      console.log(`   Approved: ${host.approvedAt}`)
      console.log(`   Approved By: ${host.approvedBy}`)
      console.log(`   Verified: ${host.verifiedAt}`)
      console.log(`   Docs Verified: ${host.documentsVerified}`)
      console.log(`   Tier: ${host.earningsTier}`)
      console.log(`   Vehicles: ${host.cars.length}`)
      
      host.cars.forEach(car => {
        console.log(`\n   🚗 ${car.year} ${car.make} ${car.model}`)
        console.log(`      Created: ${car.createdAt}`)
        console.log(`      VIN Verified: ${car.vinVerifiedAt || '❌'}`)
        console.log(`      Reg Verified: ${car.registrationVerifiedAt || '❌'}`)
        console.log(`      Title Verified: ${car.titleVerifiedAt || '❌'}`)
        console.log(`      Bookings: ${car.bookings.length}`)
        
        if (car.bookings.length > 0) {
          const firstTrip = car.bookings[0]
          console.log(`      First Trip: ${firstTrip.startDate} (${firstTrip.status})`)
        }
      })
    })
  }

  // 2. ANALYZE TIMELINE ANOMALIES
  console.log('\n\n📊 Step 2: Finding timeline anomalies...\n')

  const allHosts = await prisma.rentalHost.findMany({
    where: { approvalStatus: 'APPROVED' },
    select: {
      id: true,
      name: true,
      joinedAt: true,
      cars: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          createdAt: true,
          bookings: {
            select: {
              startDate: true,
              status: true
            },
            orderBy: { startDate: 'asc' },
            take: 1
          }
        }
      }
    }
  })

  const anomalies: any[] = []

  for (const host of allHosts) {
    for (const car of host.cars) {
      if (car.bookings.length > 0) {
        const firstTrip = car.bookings[0]
        
        // Check if trip happened before vehicle was created
        if (firstTrip.startDate < car.createdAt) {
          anomalies.push({
            type: 'TRIP_BEFORE_VEHICLE',
            host: host.name,
            vehicle: `${car.year} ${car.make} ${car.model}`,
            vehicleCreated: car.createdAt,
            firstTrip: firstTrip.startDate,
            daysDifference: Math.round((car.createdAt.getTime() - firstTrip.startDate.getTime()) / (1000 * 60 * 60 * 24))
          })
        }
        
        // Check if trip happened before host joined
        if (firstTrip.startDate < host.joinedAt) {
          anomalies.push({
            type: 'TRIP_BEFORE_SIGNUP',
            host: host.name,
            vehicle: `${car.year} ${car.make} ${car.model}`,
            hostJoined: host.joinedAt,
            firstTrip: firstTrip.startDate,
            daysDifference: Math.round((host.joinedAt.getTime() - firstTrip.startDate.getTime()) / (1000 * 60 * 60 * 24))
          })
        }
      }
    }
  }

  if (anomalies.length > 0) {
    console.log(`⚠️  Found ${anomalies.length} timeline anomalies:\n`)
    anomalies.forEach(anomaly => {
      console.log(`\n🚨 ${anomaly.type}: ${anomaly.host}`)
      console.log(`   Vehicle: ${anomaly.vehicle}`)
      if (anomaly.vehicleCreated) {
        console.log(`   Vehicle Created: ${anomaly.vehicleCreated}`)
      }
      if (anomaly.hostJoined) {
        console.log(`   Host Joined: ${anomaly.hostJoined}`)
      }
      console.log(`   First Trip: ${anomaly.firstTrip}`)
      console.log(`   ⚠️  Difference: ${Math.abs(anomaly.daysDifference)} days`)
    })
  } else {
    console.log('✅ No timeline anomalies found')
  }

  // 3. CHECK IF THIS IS TEST/SEED DATA
  console.log('\n\n📊 Step 3: Checking for test/seed data patterns...\n')

  const testPatterns = {
    emailsWithItwhip: 0,
    multipleHostsSameDay: 0,
    hostNamesPattern: [] as string[]
  }

  const hostsByDate = new Map<string, number>()

  for (const host of allHosts) {
    // Check email patterns
    if (host.name.includes('@itwhip.com')) {
      testPatterns.emailsWithItwhip++
    }

    // Check names for test patterns
    const testNames = ['test', 'demo', 'example', 'sample', 'admin']
    if (testNames.some(pattern => host.name.toLowerCase().includes(pattern))) {
      testPatterns.hostNamesPattern.push(host.name)
    }

    // Group by join date
    const dateKey = host.joinedAt.toDateString()
    hostsByDate.set(dateKey, (hostsByDate.get(dateKey) || 0) + 1)
  }

  // Find dates with many signups (likely seed data)
  const bulkSignupDates = Array.from(hostsByDate.entries())
    .filter(([_, count]) => count > 10)
    .sort((a, b) => b[1] - a[1])

  console.log('🔍 Test/Seed Data Indicators:')
  console.log(`   Hosts with @itwhip.com: ${testPatterns.emailsWithItwhip}`)
  console.log(`   Test-pattern names: ${testPatterns.hostNamesPattern.length}`)
  console.log(`\n   Bulk signup dates (>10 hosts same day):`)
  
  bulkSignupDates.slice(0, 5).forEach(([date, count]) => {
    console.log(`      ${date}: ${count} hosts`)
  })

  // 4. RECOMMENDATIONS
  console.log('\n\n📋 ===== ANALYSIS RESULTS =====\n')

  const isLikelyTestData = 
    testPatterns.emailsWithItwhip > 50 ||
    bulkSignupDates.length > 0 ||
    anomalies.length > 5

  if (isLikelyTestData) {
    console.log('⚠️  THIS APPEARS TO BE TEST/SEED DATA\n')
    console.log('Evidence:')
    if (testPatterns.emailsWithItwhip > 50) {
      console.log(`  - ${testPatterns.emailsWithItwhip} hosts with @itwhip.com emails`)
    }
    if (bulkSignupDates.length > 0) {
      console.log(`  - ${bulkSignupDates[0][1]} hosts signed up on ${bulkSignupDates[0][0]}`)
    }
    if (anomalies.length > 5) {
      console.log(`  - ${anomalies.length} timeline anomalies (trips before signup)`)
    }
    
    console.log('\n💡 RECOMMENDATIONS:')
    console.log('  1. This is likely seed/test data from migration')
    console.log('  2. Backfill strategy: Use vehicle.createdAt or host.joinedAt')
    console.log('  3. Set approvedAt = MIN(vehicle.createdAt, firstTrip - 1 day)')
    console.log('  4. Set approvedBy = "legacy-migration" or "seed-data"')
    console.log('  5. For anomalies, use firstTrip - 30 days as safe estimate')
  } else {
    console.log('✅ This appears to be PRODUCTION DATA\n')
    console.log('💡 RECOMMENDATIONS:')
    console.log('  1. Contact hosts to verify their approval dates')
    console.log('  2. Check if there was a system migration')
    console.log('  3. Use first trip date - 1 day as conservative estimate')
  }

  console.log('\n===== END OF ANALYSIS =====\n')
}

analyzeDataPatterns()
  .then(() => {
    console.log('✅ Analysis complete!')
    prisma.$disconnect()
  })
  .catch((error) => {
    console.error('❌ Analysis failed:', error)
    prisma.$disconnect()
    process.exit(1)
  })
