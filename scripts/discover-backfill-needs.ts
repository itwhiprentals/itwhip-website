import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function discoverBackfillNeeds() {
  console.log('🔍 ===== DATA DISCOVERY FOR BACKFILL =====\n')

  // 1. GET ALL APPROVED HOSTS
  console.log('📊 Step 1: Analyzing Approved Hosts...\n')
  
  const approvedHosts = await prisma.rentalHost.findMany({
    where: { approvalStatus: 'APPROVED' },
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
          vinVerifiedBy: true,
          registrationVerifiedAt: true,
          registrationVerifiedBy: true,
          titleVerifiedAt: true,
          titleVerifiedBy: true,
          insuranceVerifiedAt: true,
          insuranceVerifiedBy: true,
          bookings: {
            select: {
              id: true,
              startDate: true,
              status: true
            },
            orderBy: { startDate: 'asc' },
            take: 1 // Only first booking
          }
        }
      }
    }
  })

  console.log(`✅ Total Approved Hosts: ${approvedHosts.length}\n`)

  // 2. ANALYZE HOST DATA
  const hostAnalysis = {
    totalApproved: approvedHosts.length,
    missingApprovedAt: 0,
    missingVerifiedAt: 0,
    missingApprovedBy: 0,
    documentsNotVerified: 0,
    hostsWithTrips: 0,
    hostsWithoutTrips: 0
  }

  const hostsNeedingBackfill: any[] = []

  for (const host of approvedHosts) {
    const hasTrips = host.cars.some(car => car.bookings.length > 0)
    const firstTrip = host.cars
      .flatMap(car => car.bookings)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0]

    // Count issues
    if (!host.approvedAt) hostAnalysis.missingApprovedAt++
    if (!host.verifiedAt) hostAnalysis.missingVerifiedAt++
    if (!host.approvedBy) hostAnalysis.missingApprovedBy++
    if (!host.documentsVerified) hostAnalysis.documentsNotVerified++
    if (hasTrips) hostAnalysis.hostsWithTrips++
    if (!hasTrips) hostAnalysis.hostsWithoutTrips++

    // Check if needs backfill
    const needsBackfill = !host.approvedAt || !host.verifiedAt || !host.documentsVerified

    if (needsBackfill) {
      hostsNeedingBackfill.push({
        id: host.id,
        name: host.name,
        email: host.email,
        joinedAt: host.joinedAt,
        approvedAt: host.approvedAt,
        verifiedAt: host.verifiedAt,
        approvedBy: host.approvedBy,
        documentsVerified: host.documentsVerified,
        vehicleCount: host.cars.length,
        firstTripDate: firstTrip?.startDate || null,
        issues: {
          noApprovedAt: !host.approvedAt,
          noVerifiedAt: !host.verifiedAt,
          noApprovedBy: !host.approvedBy,
          docsNotVerified: !host.documentsVerified
        }
      })
    }
  }

  console.log('📊 HOST ANALYSIS:')
  console.table(hostAnalysis)
  console.log('\n')

  // 3. ANALYZE VEHICLE DATA
  console.log('🚗 Step 2: Analyzing Vehicle Verification...\n')

  const vehicleAnalysis = {
    totalVehicles: 0,
    missingVinVerification: 0,
    missingRegistrationVerification: 0,
    missingTitleVerification: 0,
    missingInsuranceVerification: 0,
    vehiclesWithTrips: 0,
    vehiclesWithoutTrips: 0
  }

  const vehiclesNeedingBackfill: any[] = []

  for (const host of approvedHosts) {
    for (const car of host.cars) {
      vehicleAnalysis.totalVehicles++

      const hasTrips = car.bookings.length > 0
      const firstTrip = car.bookings[0]

      // Count issues
      if (!car.vinVerifiedAt) vehicleAnalysis.missingVinVerification++
      if (!car.registrationVerifiedAt) vehicleAnalysis.missingRegistrationVerification++
      if (!car.titleVerifiedAt) vehicleAnalysis.missingTitleVerification++
      if (!car.insuranceVerifiedAt) vehicleAnalysis.missingInsuranceVerification++
      if (hasTrips) vehicleAnalysis.vehiclesWithTrips++
      if (!hasTrips) vehicleAnalysis.vehiclesWithoutTrips++

      // Check if needs backfill
      const needsBackfill = !car.vinVerifiedAt || !car.registrationVerifiedAt || !car.titleVerifiedAt

      if (needsBackfill) {
        vehiclesNeedingBackfill.push({
          carId: car.id,
          hostName: host.name,
          vehicle: `${car.year} ${car.make} ${car.model}`,
          createdAt: car.createdAt,
          vinVerifiedAt: car.vinVerifiedAt,
          registrationVerifiedAt: car.registrationVerifiedAt,
          titleVerifiedAt: car.titleVerifiedAt,
          insuranceVerifiedAt: car.insuranceVerifiedAt,
          hostApprovedAt: host.approvedAt,
          hostVerifiedAt: host.verifiedAt,
          firstTripDate: firstTrip?.startDate || null,
          issues: {
            noVinVerified: !car.vinVerifiedAt,
            noRegVerified: !car.registrationVerifiedAt,
            noTitleVerified: !car.titleVerifiedAt,
            noInsuranceVerified: !car.insuranceVerifiedAt
          }
        })
      }
    }
  }

  console.log('📊 VEHICLE ANALYSIS:')
  console.table(vehicleAnalysis)
  console.log('\n')

  // 4. DISPLAY HOSTS NEEDING BACKFILL
  if (hostsNeedingBackfill.length > 0) {
    console.log('⚠️  HOSTS NEEDING BACKFILL:', hostsNeedingBackfill.length)
    console.log('\n')
    
    // Show first 10
    console.log('First 10 hosts needing backfill:')
    hostsNeedingBackfill.slice(0, 10).forEach((host, index) => {
      console.log(`\n${index + 1}. ${host.name} (${host.email})`)
      console.log(`   Joined: ${host.joinedAt}`)
      console.log(`   Approved At: ${host.approvedAt || '❌ MISSING'}`)
      console.log(`   Verified At: ${host.verifiedAt || '❌ MISSING'}`)
      console.log(`   Approved By: ${host.approvedBy || '❌ MISSING'}`)
      console.log(`   Docs Verified: ${host.documentsVerified ? '✅' : '❌'}`)
      console.log(`   Vehicles: ${host.vehicleCount}`)
      console.log(`   First Trip: ${host.firstTripDate || 'No trips yet'}`)
      console.log(`   Issues: ${Object.entries(host.issues).filter(([_, v]) => v).map(([k]) => k).join(', ')}`)
    })

    if (hostsNeedingBackfill.length > 10) {
      console.log(`\n... and ${hostsNeedingBackfill.length - 10} more hosts`)
    }
  } else {
    console.log('✅ All hosts have complete verification data!\n')
  }

  // 5. DISPLAY VEHICLES NEEDING BACKFILL
  if (vehiclesNeedingBackfill.length > 0) {
    console.log('\n⚠️  VEHICLES NEEDING BACKFILL:', vehiclesNeedingBackfill.length)
    console.log('\n')
    
    // Show first 10
    console.log('First 10 vehicles needing backfill:')
    vehiclesNeedingBackfill.slice(0, 10).forEach((vehicle, index) => {
      console.log(`\n${index + 1}. ${vehicle.vehicle} (${vehicle.hostName})`)
      console.log(`   Created: ${vehicle.createdAt}`)
      console.log(`   VIN Verified: ${vehicle.vinVerifiedAt || '❌ MISSING'}`)
      console.log(`   Reg Verified: ${vehicle.registrationVerifiedAt || '❌ MISSING'}`)
      console.log(`   Title Verified: ${vehicle.titleVerifiedAt || '❌ MISSING'}`)
      console.log(`   Insurance Verified: ${vehicle.insuranceVerifiedAt || '❌ MISSING'}`)
      console.log(`   Host Approved: ${vehicle.hostApprovedAt || '❌'}`)
      console.log(`   First Trip: ${vehicle.firstTripDate || 'No trips yet'}`)
    })

    if (vehiclesNeedingBackfill.length > 10) {
      console.log(`\n... and ${vehiclesNeedingBackfill.length - 10} more vehicles`)
    }
  } else {
    console.log('✅ All vehicles have complete verification data!\n')
  }

  // 6. SUMMARY & RECOMMENDATIONS
  console.log('\n📋 ===== SUMMARY & RECOMMENDATIONS =====\n')
  
  console.log(`Total Issues Found:`)
  console.log(`  - Hosts needing backfill: ${hostsNeedingBackfill.length}`)
  console.log(`  - Vehicles needing backfill: ${vehiclesNeedingBackfill.length}`)
  console.log(`\n`)

  if (hostsNeedingBackfill.length > 0 || vehiclesNeedingBackfill.length > 0) {
    console.log('💡 RECOMMENDED ACTIONS:')
    console.log('  1. Review the data above')
    console.log('  2. Confirm backfill logic looks correct')
    console.log('  3. Run backfill script in DRY RUN mode')
    console.log('  4. Validate results')
    console.log('  5. Execute actual backfill')
  } else {
    console.log('🎉 No backfill needed - all data is complete!')
  }

  console.log('\n===== END OF DISCOVERY =====\n')

  // Return data for potential use
  return {
    hostAnalysis,
    vehicleAnalysis,
    hostsNeedingBackfill,
    vehiclesNeedingBackfill
  }
}

// Run the discovery
discoverBackfillNeeds()
  .then(() => {
    console.log('✅ Discovery complete!')
    prisma.$disconnect()
  })
  .catch((error) => {
    console.error('❌ Discovery failed:', error)
    prisma.$disconnect()
    process.exit(1)
  })
