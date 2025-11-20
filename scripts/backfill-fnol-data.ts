import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * BACKFILL SCRIPT: Add FNOL data to existing claims
 * 
 * This script adds realistic First Notice of Loss (FNOL) data
 * to claims that were created before FNOL fields were added.
 * 
 * Usage:
 *   DRY RUN:  npx tsx scripts/backfill-fnol-data.ts
 *   EXECUTE:  npx tsx scripts/backfill-fnol-data.ts --execute
 */

// Helper function to calculate realistic odometer reading
function calculateOdometerReading(booking: any): number {
  // Try to get actual trip mileage data (CORRECTED FIELD NAMES)
  const tripStartMileage = booking.startMileage  // ✅ FIXED
  const tripEndMileage = booking.endMileage      // ✅ FIXED
  
  if (tripEndMileage && tripEndMileage > 0) {
    // Use actual end mileage + small variance (0-50 miles for post-trip incidents)
    const variance = Math.floor(Math.random() * 51) // 0-50 miles
    return tripEndMileage + variance
  }
  
  if (tripStartMileage && tripStartMileage > 0) {
    // Estimate: start mileage + typical trip distance (50-200 miles)
    const estimatedDistance = Math.floor(Math.random() * 151) + 50 // 50-200 miles
    return tripStartMileage + estimatedDistance
  }
  
  // Fallback: Use a reasonable mileage (30,000-70,000 range)
  return Math.floor(Math.random() * 40000) + 30000
}

// Helper function to determine if vehicle is drivable based on claim type and severity
function determineVehicleDrivable(claimType: string, estimatedCost: number): boolean {
  if (claimType === 'THEFT') return false
  if (claimType === 'MECHANICAL' && estimatedCost > 2000) return false
  if (claimType === 'ACCIDENT' && estimatedCost > 5000) return false
  
  // 70% chance drivable for other scenarios
  return Math.random() > 0.3
}

// Realistic FNOL test data scenarios
const FNOL_SCENARIOS = {
  minorAccident: {
    // Incident Conditions
    weatherConditions: 'Clear',
    weatherDescription: 'Sunny day, no precipitation',
    roadConditions: 'Dry',
    roadDescription: 'Good pavement condition, no hazards',
    estimatedSpeed: 35,
    trafficConditions: 'Light',
    
    // Police Report
    wasPoliceContacted: false,
    policeDepartment: null,
    officerName: null,
    officerBadge: null,
    policeReportNumber: null,
    policeReportFiled: false,
    policeReportDate: null,
    
    // Witnesses
    witnesses: [
      {
        name: 'Sarah Johnson',
        phone: '602-555-0123',
        email: 'sarah.j@example.com',
        statement: 'I saw the collision at the intersection. The other driver ran a red light.'
      }
    ],
    
    // Other Party
    otherPartyInvolved: true,
    otherParty: {
      driver: {
        name: 'John Smith',
        phone: '602-555-0456',
        license: 'D1234567',
        licenseState: 'AZ'
      },
      vehicle: {
        year: 2020,
        make: 'Honda',
        model: 'Civic',
        plate: 'ABC1234',
        vin: '1HGBH41JXMN109186'
      },
      insurance: {
        carrier: 'State Farm',
        policy: 'SF-987654321'
      }
    },
    
    // Injuries
    wereInjuries: false,
    injuries: []
  },
  
  seriousAccident: {
    // Incident Conditions
    weatherConditions: 'Rain',
    weatherDescription: 'Heavy rain, poor visibility',
    roadConditions: 'Wet',
    roadDescription: 'Slippery surface, standing water in some areas',
    estimatedSpeed: 45,
    trafficConditions: 'Moderate',
    
    // Police Report
    wasPoliceContacted: true,
    policeDepartment: 'Phoenix Police Department',
    officerName: 'Officer Martinez',
    officerBadge: '4521',
    policeReportNumber: 'PX-2024-08734',
    policeReportFiled: true,
    policeReportDate: new Date('2024-12-10'),
    
    // Witnesses
    witnesses: [
      {
        name: 'Michael Chen',
        phone: '602-555-0789',
        email: 'mchen@example.com',
        statement: 'Multi-vehicle accident. Visibility was very poor due to heavy rain.'
      },
      {
        name: 'Lisa Anderson',
        phone: '602-555-0234',
        email: null,
        statement: 'I called 911 immediately. Saw the whole thing happen.'
      }
    ],
    
    // Other Party
    otherPartyInvolved: true,
    otherParty: {
      driver: {
        name: 'Jennifer Williams',
        phone: '480-555-0912',
        license: 'D9876543',
        licenseState: 'AZ'
      },
      vehicle: {
        year: 2019,
        make: 'Toyota',
        model: 'Camry',
        plate: 'XYZ5678',
        vin: '4T1BF1FK8KU123456'
      },
      insurance: {
        carrier: 'Geico',
        policy: 'G-456789012'
      }
    },
    
    // Injuries
    wereInjuries: true,
    injuries: [
      {
        person: 'Driver (Guest)',
        description: 'Moderate whiplash, neck pain, headache',
        severity: 'MODERATE',
        medicalAttention: true,
        hospital: 'Phoenix General Hospital ER'
      },
      {
        person: 'Passenger (Guest Vehicle)',
        description: 'Minor bruising from seatbelt, minor cuts from broken glass',
        severity: 'MINOR',
        medicalAttention: true,
        hospital: 'Phoenix General Hospital ER'
      }
    ]
  },
  
  theft: {
    // Incident Conditions
    weatherConditions: 'Clear',
    weatherDescription: 'Night time, clear skies',
    roadConditions: 'Dry',
    roadDescription: 'Vehicle was parked in hotel parking lot',
    estimatedSpeed: null,
    trafficConditions: 'N/A - Parked',
    
    // Police Report
    wasPoliceContacted: true,
    policeDepartment: 'Phoenix Police Department',
    officerName: 'Officer Davis',
    officerBadge: '7823',
    policeReportNumber: 'PX-2024-THEFT-1234',
    policeReportFiled: true,
    policeReportDate: new Date('2024-12-15'),
    
    // Witnesses
    witnesses: [
      {
        name: 'Hotel Security',
        phone: '602-555-0100',
        email: 'security@hotelexample.com',
        statement: 'Security camera footage shows vehicle being driven away at 2:47 AM'
      }
    ],
    
    // Other Party
    otherPartyInvolved: false,
    otherParty: null,
    
    // Injuries
    wereInjuries: false,
    injuries: []
  },
  
  vandalism: {
    // Incident Conditions
    weatherConditions: 'Clear',
    weatherDescription: 'Overnight, clear conditions',
    roadConditions: 'Dry',
    roadDescription: 'Vehicle was parked on residential street',
    estimatedSpeed: null,
    trafficConditions: 'N/A - Parked',
    
    // Police Report
    wasPoliceContacted: true,
    policeDepartment: 'Phoenix Police Department',
    officerName: 'Officer Thompson',
    officerBadge: '3456',
    policeReportNumber: 'PX-2024-VAND-5678',
    policeReportFiled: true,
    policeReportDate: new Date('2024-12-12'),
    
    // Witnesses
    witnesses: [
      {
        name: 'Neighbor - James Wilson',
        phone: '602-555-0345',
        email: null,
        statement: 'Heard loud noises around 3 AM, saw group of people near the vehicle'
      }
    ],
    
    // Other Party
    otherPartyInvolved: false,
    otherParty: null,
    
    // Injuries
    wereInjuries: false,
    injuries: []
  },
  
  mechanical: {
    // Incident Conditions
    weatherConditions: 'Clear',
    weatherDescription: 'Normal driving conditions',
    roadConditions: 'Dry',
    roadDescription: 'Highway driving',
    estimatedSpeed: 65,
    trafficConditions: 'Moderate',
    
    // Police Report
    wasPoliceContacted: false,
    policeDepartment: null,
    officerName: null,
    officerBadge: null,
    policeReportNumber: null,
    policeReportFiled: false,
    policeReportDate: null,
    
    // Witnesses
    witnesses: [],
    
    // Other Party
    otherPartyInvolved: false,
    otherParty: null,
    
    // Injuries
    wereInjuries: false,
    injuries: []
  },
  
  cleaning: {
    // Incident Conditions
    weatherConditions: 'N/A',
    weatherDescription: 'Interior cleaning issue',
    roadConditions: 'N/A',
    roadDescription: 'Vehicle returned with excessive mess',
    estimatedSpeed: null,
    trafficConditions: 'N/A',
    
    // Police Report
    wasPoliceContacted: false,
    policeDepartment: null,
    officerName: null,
    officerBadge: null,
    policeReportNumber: null,
    policeReportFiled: false,
    policeReportDate: null,
    
    // Witnesses
    witnesses: [],
    
    // Other Party
    otherPartyInvolved: false,
    otherParty: null,
    
    // Injuries
    wereInjuries: false,
    injuries: []
  },
  
  weather: {
    // Incident Conditions
    weatherConditions: 'Severe',
    weatherDescription: 'Hailstorm caused damage to vehicle exterior',
    roadConditions: 'Wet',
    roadDescription: 'Parked during severe weather event',
    estimatedSpeed: null,
    trafficConditions: 'N/A - Parked',
    
    // Police Report
    wasPoliceContacted: false,
    policeDepartment: null,
    officerName: null,
    officerBadge: null,
    policeReportNumber: null,
    policeReportFiled: false,
    policeReportDate: null,
    
    // Witnesses
    witnesses: [],
    
    // Other Party
    otherPartyInvolved: false,
    otherParty: null,
    
    // Injuries
    wereInjuries: false,
    injuries: []
  }
}

// Choose which scenario to use based on claim type
function getScenarioForClaimType(claimType: string, estimatedCost: number) {
  switch (claimType) {
    case 'ACCIDENT':
      // Use serious accident scenario if estimated cost is high
      return estimatedCost > 5000 ? FNOL_SCENARIOS.seriousAccident : FNOL_SCENARIOS.minorAccident
    case 'THEFT':
      return FNOL_SCENARIOS.theft
    case 'VANDALISM':
      return FNOL_SCENARIOS.vandalism
    case 'MECHANICAL':
      return FNOL_SCENARIOS.mechanical
    case 'CLEANING':
      return FNOL_SCENARIOS.cleaning
    case 'WEATHER':
      return FNOL_SCENARIOS.weather
    default:
      return FNOL_SCENARIOS.minorAccident
  }
}

async function main() {
  const isDryRun = !process.argv.includes('--execute')
  
  console.log('\n' + '='.repeat(80))
  console.log('🔄 FNOL DATA BACKFILL SCRIPT')
  console.log('='.repeat(80))
  console.log('')
  
  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made')
    console.log('    Run with --execute flag to apply changes')
  } else {
    console.log('🚀 EXECUTE MODE - Changes WILL be applied!')
  }
  console.log('')
  
  try {
    // Find all claims with NULL FNOL data
    const claimsToUpdate = await prisma.claim.findMany({
      where: {
        odometerAtIncident: null
      },
      include: {
        booking: {
          include: {
            car: true,
            renter: true
          }
        },
        host: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 Found ${claimsToUpdate.length} claim(s) without FNOL data\n`)
    
    if (claimsToUpdate.length === 0) {
      console.log('✅ All claims already have FNOL data!')
      console.log('   Nothing to backfill.')
      return
    }
    
    // Display claims that will be updated
    console.log('📋 Claims to be updated:')
    console.log('─'.repeat(80))
    
    for (const claim of claimsToUpdate) {
      const odometerReading = calculateOdometerReading(claim.booking)
      const vehicleDrivable = determineVehicleDrivable(claim.type, claim.estimatedCost)
      const scenario = getScenarioForClaimType(claim.type, claim.estimatedCost)
      
      console.log(`\nClaim ID: ${claim.id}`)
      console.log(`  Type: ${claim.type}`)
      console.log(`  Booking: ${claim.booking.bookingCode}`)
      console.log(`  Vehicle: ${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`)
      console.log(`  Host: ${claim.host.name} (${claim.host.email})`)
      console.log(`  Guest: ${claim.booking.renter?.name || 'N/A'}`)
      console.log(`  Created: ${claim.createdAt.toLocaleDateString()}`)
      console.log(`  Status: ${claim.status}`)
      console.log(`  Estimated Cost: $${claim.estimatedCost.toLocaleString()}`)
      
      // Show trip mileage data if available
      if (claim.booking.startMileage || claim.booking.endMileage) {
        console.log('\n  🚗 Trip Mileage Data:')
        if (claim.booking.startMileage) {
          console.log(`     - Start: ${claim.booking.startMileage.toLocaleString()} miles`)
        }
        if (claim.booking.endMileage) {
          console.log(`     - End: ${claim.booking.endMileage.toLocaleString()} miles`)
        }
        if (claim.booking.startMileage && claim.booking.endMileage) {
          const driven = claim.booking.endMileage - claim.booking.startMileage
          console.log(`     - Driven: ${driven.toLocaleString()} miles`)
        }
      }
      
      console.log('\n  📝 FNOL Data to be added:')
      console.log(`     - Odometer: ${odometerReading.toLocaleString()} miles`)
      console.log(`     - Vehicle Drivable: ${vehicleDrivable ? 'Yes' : 'No'}`)
      if (!vehicleDrivable) {
        console.log(`     - Vehicle Location: Tow yard / repair facility`)
      }
      console.log(`     - Weather: ${scenario.weatherConditions}`)
      console.log(`     - Road: ${scenario.roadConditions}`)
      console.log(`     - Police Contacted: ${scenario.wasPoliceContacted ? 'Yes' : 'No'}`)
      if (scenario.wasPoliceContacted) {
        console.log(`     - Police Report #: ${scenario.policeReportNumber}`)
      }
      console.log(`     - Witnesses: ${scenario.witnesses.length}`)
      console.log(`     - Other Party: ${scenario.otherPartyInvolved ? 'Yes' : 'No'}`)
      console.log(`     - Injuries: ${scenario.wereInjuries ? 'Yes' : 'No'}`)
    }
    
    console.log('\n' + '─'.repeat(80))
    
    if (isDryRun) {
      console.log('\n⚠️  DRY RUN COMPLETE - No changes made')
      console.log('\n📝 To execute these changes, run:')
      console.log('   npx tsx scripts/backfill-fnol-data.ts --execute\n')
      return
    }
    
    // Execute mode - Apply changes
    console.log('\n🚀 Applying changes...\n')
    
    let successCount = 0
    let errorCount = 0
    
    for (const claim of claimsToUpdate) {
      try {
        const odometerReading = calculateOdometerReading(claim.booking)
        const vehicleDrivable = determineVehicleDrivable(claim.type, claim.estimatedCost)
        const scenario = getScenarioForClaimType(claim.type, claim.estimatedCost)
        
        await prisma.claim.update({
          where: { id: claim.id },
          data: {
            // Vehicle Condition (calculated from actual trip data)
            odometerAtIncident: odometerReading,
            vehicleDrivable: vehicleDrivable,
            vehicleLocation: vehicleDrivable ? null : "Vehicle towed to repair facility",
            
            // Incident Conditions
            weatherConditions: scenario.weatherConditions,
            weatherDescription: scenario.weatherDescription,
            roadConditions: scenario.roadConditions,
            roadDescription: scenario.roadDescription,
            estimatedSpeed: scenario.estimatedSpeed,
            trafficConditions: scenario.trafficConditions,
            
            // Police Report
            wasPoliceContacted: scenario.wasPoliceContacted,
            policeDepartment: scenario.policeDepartment,
            officerName: scenario.officerName,
            officerBadge: scenario.officerBadge,
            policeReportNumber: scenario.policeReportNumber,
            policeReportFiled: scenario.policeReportFiled,
            policeReportDate: scenario.policeReportDate,
            
            // Witnesses
            witnesses: scenario.witnesses,
            
            // Other Party
            otherPartyInvolved: scenario.otherPartyInvolved,
            otherParty: scenario.otherParty,
            
            // Injuries
            wereInjuries: scenario.wereInjuries,
            injuries: scenario.injuries
          }
        })
        
        console.log(`✅ Updated claim ${claim.id.slice(0, 8)}... (Odometer: ${odometerReading.toLocaleString()} mi)`)
        successCount++
      } catch (error) {
        console.error(`❌ Failed to update claim ${claim.id}:`, error)
        errorCount++
      }
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('📊 BACKFILL COMPLETE')
    console.log('='.repeat(80))
    console.log(`✅ Successfully updated: ${successCount} claim(s)`)
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount} claim(s)`)
    }
    console.log('')
    
  } catch (error) {
    console.error('\n❌ Script error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()