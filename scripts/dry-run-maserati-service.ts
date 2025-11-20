// scripts/dry-run-maserati-service.ts
import { prisma } from '@/app/lib/database/prisma'

async function dryRunMaseratiService() {
  const carId = 'cmfn3fdhf0001l8040ao0a3h8'
  const hostId = 'cmfj0oxqm004udomy7qivgt18'

  console.log('🔍 DRY RUN: MASERATI SERVICE BACKFILL\n')
  console.log('=' .repeat(60))

  try {
    // 1. Check if car exists
    console.log('\n📋 STEP 1: Verify Car Exists')
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        currentMileage: true,
        lastOilChange: true,
        lastInspection: true,
        inspectionExpiresAt: true,
        serviceOverdue: true,
        inspectionExpired: true,
        hostId: true,
      }
    })

    if (!car) {
      console.log('❌ Car not found!')
      return
    }

    console.log('✅ Car found:', `${car.year} ${car.make} ${car.model}`)
    console.log('   Current Mileage:', car.currentMileage || 'Not set')
    console.log('   Last Oil Change:', car.lastOilChange || 'Never recorded')
    console.log('   Last Inspection:', car.lastInspection || 'Never recorded')
    console.log('   Inspection Expires:', car.inspectionExpiresAt || 'Not set')
    console.log('   Service Overdue:', car.serviceOverdue)
    console.log('   Inspection Expired:', car.inspectionExpired)

    // 2. Check existing service records
    console.log('\n📋 STEP 2: Check Existing Service Records')
    const existingRecords = await prisma.vehicleServiceRecord.findMany({
      where: { carId },
      select: {
        id: true,
        serviceType: true,
        serviceDate: true,
        mileageAtService: true,
      },
      orderBy: { serviceDate: 'desc' }
    })

    if (existingRecords.length > 0) {
      console.log(`⚠️  Found ${existingRecords.length} existing service records:`)
      existingRecords.forEach((record, i) => {
        console.log(`   ${i + 1}. ${record.serviceType} - ${record.serviceDate.toLocaleDateString()} (${record.mileageAtService} miles)`)
      })
    } else {
      console.log('✅ No existing service records (clean slate)')
    }

    // 3. Check HostESGProfile
    console.log('\n📋 STEP 3: Check ESG Profile')
    const esgProfile = await prisma.hostESGProfile.findUnique({
      where: { hostId },
      select: {
        id: true,
        compositeScore: true,
        maintenanceScore: true,
        safetyScore: true,
        lastCalculatedAt: true,
      }
    })

    if (esgProfile) {
      console.log('✅ ESG Profile exists')
      console.log('   Composite Score:', esgProfile.compositeScore)
      console.log('   Maintenance Score:', esgProfile.maintenanceScore)
      console.log('   Safety Score:', esgProfile.safetyScore)
      console.log('   Last Calculated:', esgProfile.lastCalculatedAt?.toLocaleDateString() || 'Never')
    } else {
      console.log('⚠️  No ESG Profile found (will need to create)')
    }

    // 4. Preview what will be created
    console.log('\n📋 STEP 4: Preview Service Records to Create')
    console.log('=' .repeat(60))

    const records = [
      {
        serviceType: 'OIL_CHANGE',
        date: '2024-10-15',
        mileage: 68000,
        cost: 285.00,
        description: 'Recent oil change at Maserati dealer'
      },
      {
        serviceType: 'MAJOR_SERVICE_60K',
        date: '2023-06-20',
        mileage: 60500,
        cost: 1250.00,
        description: '60k mile service + state inspection'
      },
      {
        serviceType: 'OIL_CHANGE',
        date: '2022-08-10',
        mileage: 48000,
        cost: 320.00,
        description: 'Oil change + tire rotation'
      },
      {
        serviceType: 'STATE_INSPECTION',
        date: '2021-03-15',
        mileage: 40000,
        cost: 350.00,
        description: 'State inspection + oil change'
      }
    ]

    records.forEach((record, i) => {
      console.log(`\n${i + 1}. ${record.serviceType}`)
      console.log(`   Date: ${record.date}`)
      console.log(`   Mileage: ${record.mileage.toLocaleString()} miles`)
      console.log(`   Cost: $${record.cost.toFixed(2)}`)
      console.log(`   Notes: ${record.description}`)
    })

    // 5. Preview RentalCar updates
    console.log('\n📋 STEP 5: Preview RentalCar Updates')
    console.log('=' .repeat(60))
    console.log('\nCURRENT VALUES:')
    console.log('  lastOilChange:', car.lastOilChange || 'null')
    console.log('  lastInspection:', car.lastInspection || 'null')
    console.log('  inspectionExpiresAt:', car.inspectionExpiresAt || 'null')
    console.log('  serviceOverdue:', car.serviceOverdue)
    console.log('  inspectionExpired:', car.inspectionExpired)
    console.log('  currentMileage:', car.currentMileage || 'null')

    console.log('\nNEW VALUES:')
    console.log('  lastOilChange: 2024-10-15')
    console.log('  lastInspection: 2023-06-20')
    console.log('  inspectionExpiresAt: 2024-06-20 ⚠️  EXPIRED')
    console.log('  nextOilChangeDue: 2025-04-15')
    console.log('  nextInspectionDue: 2024-06-20 ⚠️  OVERDUE')
    console.log('  serviceOverdue: false (oil change OK)')
    console.log('  inspectionExpired: true ⚠️')
    console.log('  currentMileage: 68000')

    // 6. Check API endpoints exist
    console.log('\n📋 STEP 6: Verify API Endpoints')
    console.log('=' .repeat(60))

    const fs = require('fs')
    const path = require('path')

    const apiChecks = [
      'app/api/host/cars/[id]/route.ts',
      'app/api/host/cars/[id]/service',
      'app/api/host/cars/[id]/esg',
    ]

    apiChecks.forEach(apiPath => {
      const fullPath = path.join(process.cwd(), apiPath)
      const exists = fs.existsSync(fullPath)
      console.log(`${exists ? '✅' : '❌'} ${apiPath}`)
    })

    // 7. Summary
    console.log('\n📊 DRY RUN SUMMARY')
    console.log('=' .repeat(60))
    console.log(`✅ Car verified: ${car.year} ${car.make} ${car.model}`)
    console.log(`✅ Host ID: ${hostId}`)
    console.log(`${existingRecords.length === 0 ? '✅' : '⚠️ '} Existing service records: ${existingRecords.length}`)
    console.log(`${esgProfile ? '✅' : '⚠️ '} ESG Profile: ${esgProfile ? 'Exists' : 'Missing'}`)
    console.log(`✅ Will create: 4 service records`)
    console.log(`✅ Will update: RentalCar service fields`)
    console.log(`⚠️  Result: Inspection overdue warning will appear`)

    console.log('\n🎯 NEXT STEPS:')
    console.log('1. Review the API endpoints check above')
    console.log('2. If everything looks good, run the actual backfill')
    console.log('3. Then test the service tab in the edit page')

  } catch (error) {
    console.error('❌ Dry run failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

dryRunMaseratiService()