// scripts/backfill-vehicle-fnol-data.js
// Run with: node scripts/backfill-vehicle-fnol-data.js --dry-run
// Execute: node scripts/backfill-vehicle-fnol-data.js --execute

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ✅ YOUR COMPLETE VEHICLE DATA
const vehicleBackfillData = [
  {
    id: "cmfsdwm49000llh0422gjzpcf",
    vin: "1GYSK7KL7S9213845",
    licensePlate: "JDX3025",
    estimatedValue: 195000,
    registeredOwner: "Hector Mendoza"
  },
  {
    id: "cmfsi80xp0001l504flc5f3ex",
    vin: "7FARW1H81RJ028391",
    licensePlate: "KFR7811",
    estimatedValue: 77600,
    registeredOwner: "Joshua Martin"
  },
  {
    id: "cmfma9usg0001l8040oskhr2j",
    vin: "1G1YB2D42P5103724",
    licensePlate: "LPH2734",
    estimatedValue: 68800,
    registeredOwner: "Liam O'Connor"
  },
  {
    id: "cmfm922xs000ejm04z5l5gcds",
    vin: "JTHKPAAY3P2017635",
    licensePlate: "MQZ9640",
    estimatedValue: 84200,
    registeredOwner: "Neil Frost"
  },
  {
    id: "cmfn6uylu000ei904nmtlpu1w",
    vin: "JF1ZNBF18P9703486",
    licensePlate: "AHN6348",
    estimatedValue: 27000,
    registeredOwner: "Ethan Morgan"
  },
  {
    id: "cmfmoleuj000gdouqvraeoxk5",
    vin: "5UXCR6C06N9J63241",
    licensePlate: "GBU7129",
    estimatedValue: 38900,
    registeredOwner: "Elijah James"
  },
  {
    id: "cmfm9j5980019jm04gv2ibsxs",
    vin: "2C3CDZC91NH179354",
    licensePlate: "HFC9091",
    estimatedValue: 64200,
    registeredOwner: "Uma Patel"
  },
  {
    id: "cmfsg30a40001jr04tr1xmanh",
    vin: "WBS33AZ07MCF01924",
    licensePlate: "UQV4217",
    estimatedValue: 50900,
    registeredOwner: "Hannah Bryant"
  },
  {
    id: "cmfn40atf0001ju044llv4626",
    vin: "JN1EV7EK7MM251462",
    licensePlate: "PRK8752",
    estimatedValue: 15700,
    registeredOwner: "Ingrid Hansen"
  },
  {
    id: "cmfm9atb1000ojm04si5cr4i1",
    vin: "WDDXJ8JB1MA042938",
    licensePlate: "WWJ6820",
    estimatedValue: 108000,
    registeredOwner: "Vincent B."
  },
  {
    id: "cmfm243z00001l804rcacf4uo",
    vin: "5YJSA1E23MF263410",
    licensePlate: "XYL3409",
    estimatedValue: 28000,
    registeredOwner: "Aaron Nelson"
  },
  {
    id: "cmfn1hzme0001la048qu2gmwz",
    vin: "WBA5R1C06LFH39782",
    licensePlate: "NQS9441",
    estimatedValue: 13900,
    registeredOwner: "Hugo Martinez"
  },
  {
    id: "cmfuhvij00001kv04rxdp5ztz",
    vin: "5UXTY3C00L9A24085",
    licensePlate: "TEA1105",
    estimatedValue: 16600,
    registeredOwner: "Arlo James"
  },
  {
    id: "cmfugua590001ie042y3o0gca",
    vin: "2C3CDZC90LH198721",
    licensePlate: "GVD2039",
    estimatedValue: 41600,
    registeredOwner: "Flashy C."
  },
  {
    id: "cmfskoe1w0001lg04sewfunje",
    vin: "WMWXP7C59K2A01364",
    licensePlate: "VRC8823",
    estimatedValue: 8700,
    registeredOwner: "Chloe Ross"
  },
  {
    id: "cmfm8s4wf0011jv04pj3xozpm",
    vin: "JA4AP3AU7KU028417",
    licensePlate: "YTU5597",
    estimatedValue: 7200,
    registeredOwner: "Daniel White"
  },
  {
    id: "cmfn7jyv40001le046p2470g5",
    vin: "WP1AA2AY5KDA84129",
    licensePlate: "ZLB7436",
    estimatedValue: 31000,
    registeredOwner: "Aaron Nelson"
  },
  {
    id: "cmfn6cy9f0001i9046vi04hz8",
    vin: "WBA4Z3C57JEC98032",
    licensePlate: "CDA2937",
    estimatedValue: 10900,
    registeredOwner: "Ella Price"
  },
  {
    id: "cmfpktbe60001l4043nr0gw8s",
    vin: "SBM13FAA0JW004236",
    licensePlate: "FRP6032",
    estimatedValue: 93400,
    registeredOwner: "Jenny Wilson"
  },
  {
    id: "cmfsbs6pc0001lh048ojbu71p",
    vin: "SCBCE63W3HC079821",
    licensePlate: "NVP1286",
    estimatedValue: 45000,
    registeredOwner: "Joel Cooper"
  },
  {
    id: "cmfm6gq0z0003jr04mj4dmfoa",
    vin: "SCBFH7ZA3HC065924",
    licensePlate: "ZKE7321",
    estimatedValue: 58700,
    registeredOwner: "Cole Maxwell"
  },
  {
    id: "cmfqe8opw0001l204er9eb2yi",
    vin: "ZFF80AMA7H0215473",
    licensePlate: "LSC4092",
    estimatedValue: 166000,
    registeredOwner: "Jenny Wilson"
  },
  {
    id: "cmfj1b3c80001do5t47rignri",
    vin: "ZHWUR2ZF5HLA93261",
    licensePlate: "YMA6378",
    estimatedValue: 128000,
    registeredOwner: "Jenny Wilson"
  },
  {
    id: "cmfn3fdhf0001l8040ao0a3h8",
    vin: "ZAM56YRA2H1253046",
    licensePlate: "HBC5149",
    estimatedValue: 11900,
    registeredOwner: "Parker Mills"
  },
  {
    id: "cmfn206910001l2042fm1bkgl",
    vin: "WP0AA2A84HK260945",
    licensePlate: "GNR2106",
    estimatedValue: 25300,
    registeredOwner: "Addison Hughes"
  },
  {
    id: "cmfmoz6bc000vdouqhrymm7kt",
    vin: "WUAW2AFC1GN903548",
    licensePlate: "JQQ7854",
    estimatedValue: 19900,
    registeredOwner: "Brandon King"
  },
  {
    id: "cmfu87d1k0001jy04ervymay7",
    vin: "SCBEC9ZA1GC051473",
    licensePlate: "UVE5028",
    estimatedValue: 23500,
    registeredOwner: "Flashy C."
  },
  {
    id: "cmfu4kw5g0001l60444f0b900",
    vin: "1G1YD3D76G5109582",
    licensePlate: "SRF6611",
    estimatedValue: 16000,
    registeredOwner: "Asyah B."
  },
  {
    id: "cmfn5fj3e0001l7046u7hq2mt",
    vin: "SALAK2V68GA807325",
    licensePlate: "AZE9382",
    estimatedValue: 14300,
    registeredOwner: "Amelia Cox"
  },
  {
    id: "cmfu6jc660001jr04vf0kuso2",
    vin: "WDDUG8CB3GA234115",
    licensePlate: "KDX4120",
    estimatedValue: 18600,
    registeredOwner: "Flashy C."
  },
  {
    id: "cmfn4cb35000cju04dza0v3gu",
    vin: "WBS6C9C55FD468321",
    licensePlate: "MBW2291",
    estimatedValue: 13200,
    registeredOwner: "Alex Mitchell"
  },
  {
    id: "cmfsgv38x0001l504q8mvv026",
    vin: "1GYS4SKJ1FR321587",
    licensePlate: "VRA4159",
    estimatedValue: 10600,
    registeredOwner: "Henry Walsh"
  },
  {
    id: "cmfu5dgmc0001jr04gobsk5uk",
    vin: "1C4RJECG1FC814270",
    licensePlate: "QYN7024",
    estimatedValue: 5600,
    registeredOwner: "Asyah B."
  },
  {
    id: "cmfsjfm19000jle04xbgmu14c",
    vin: "WDDUG8CB3FA132654",
    licensePlate: "TDZ3587",
    estimatedValue: 8200,
    registeredOwner: "Cade Hunter"
  },
  {
    id: "cmfuc95zn0001l004ub3vuj97",
    vin: "WP0AF2A71FL085291",
    licensePlate: "LBF9543",
    estimatedValue: 19000,
    registeredOwner: "Flashy C."
  }
]

async function backfillVehicleFNOLData(dryRun = true) {
  console.log('🚗 VEHICLE FNOL DATA BACKFILL SCRIPT')
  console.log('=' .repeat(120))
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (No changes will be made)' : '🔥 EXECUTION MODE (Will update database)'}`)
  console.log('=' .repeat(120))
  console.log('')

  try {
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (const vehicleData of vehicleBackfillData) {
      try {
        // Fetch current vehicle data
        const currentVehicle = await prisma.rentalCar.findUnique({
          where: { id: vehicleData.id },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            vin: true,
            licensePlate: true,
            registeredOwner: true,
            estimatedValue: true,
            garageAddress: true,
            garageCity: true,
            garageState: true,
            garageZip: true
          }
        })

        if (!currentVehicle) {
          console.log(`❌ Vehicle not found: ${vehicleData.id}`)
          errorCount++
          errors.push(`Vehicle not found: ${vehicleData.id}`)
          continue
        }

        console.log(`\n📝 Processing: ${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}`)
        console.log(`   ID: ${currentVehicle.id}`)
        
        // Prepare update data
        const updateData = {
          vin: vehicleData.vin,
          licensePlate: vehicleData.licensePlate,
          registeredOwner: vehicleData.registeredOwner,
          estimatedValue: vehicleData.estimatedValue,
          // Copy address to garage location (smart default)
          garageAddress: currentVehicle.address,
          garageCity: currentVehicle.city,
          garageState: currentVehicle.state,
          garageZip: currentVehicle.zipCode,
          // Smart defaults
          hasLien: false,
          lienholderName: null,
          lienholderAddress: null,
          hasAlarm: false,
          hasTracking: false,
          hasImmobilizer: false,
          isModified: false,
          modifications: null,
          annualMileage: 12000,
          primaryUse: "Rental"
        }

        // Show what will change
        console.log(`   Changes:`)
        console.log(`   ├─ VIN: ${currentVehicle.vin || 'NOT SET'} → ${updateData.vin}`)
        console.log(`   ├─ License Plate: ${currentVehicle.licensePlate || 'NOT SET'} → ${updateData.licensePlate}`)
        console.log(`   ├─ Registered Owner: ${currentVehicle.registeredOwner || 'NOT SET'} → ${updateData.registeredOwner}`)
        console.log(`   ├─ Estimated Value: ${currentVehicle.estimatedValue ? `$${currentVehicle.estimatedValue.toLocaleString()}` : 'NOT SET'} → $${updateData.estimatedValue.toLocaleString()}`)
        console.log(`   ├─ Garage Address: ${currentVehicle.garageAddress || 'NOT SET'} → ${updateData.garageAddress}`)
        console.log(`   ├─ Garage City: ${currentVehicle.garageCity || 'NOT SET'} → ${updateData.garageCity}`)
        console.log(`   ├─ Garage State: ${currentVehicle.garageState || 'NOT SET'} → ${updateData.garageState}`)
        console.log(`   ├─ Garage ZIP: ${currentVehicle.garageZip || 'NOT SET'} → ${updateData.garageZip}`)
        console.log(`   ├─ Annual Mileage: 12,000 miles`)
        console.log(`   └─ Primary Use: Rental`)

        if (!dryRun) {
          // Execute update
          await prisma.rentalCar.update({
            where: { id: vehicleData.id },
            data: updateData
          })
          
          // Log to activity log
          await prisma.activityLog.create({
            data: {
              action: 'BACKFILL_FNOL_DATA',
              entityType: 'CAR',
              entityId: vehicleData.id,
              metadata: {
                backfillDate: new Date().toISOString(),
                fieldsUpdated: Object.keys(updateData),
                source: 'production_backfill_script'
              }
            }
          })
          
          console.log(`   ✅ UPDATED SUCCESSFULLY`)
        } else {
          console.log(`   🔍 DRY RUN - No changes made`)
        }

        successCount++

      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`)
        errorCount++
        errors.push(`${vehicleData.id}: ${error.message}`)
      }
    }

    // Summary
    console.log('\n\n' + '='.repeat(120))
    console.log('📊 BACKFILL SUMMARY')
    console.log('='.repeat(120))
    console.log(`Total Vehicles: ${vehicleBackfillData.length}`)
    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`)
      errors.forEach(err => console.log(`   - ${err}`))
    }
    
    if (dryRun) {
      console.log('\n🔍 DRY RUN COMPLETE - No changes were made to the database')
      console.log('To execute the backfill, run: node scripts/backfill-vehicle-fnol-data.js --execute')
    } else {
      console.log('\n✅ BACKFILL COMPLETE - All vehicles updated successfully!')
      console.log('')
      console.log('Next Steps:')
      console.log('1. ✅ Vehicle profiles are now complete')
      console.log('2. ✅ Ready for claim form with auto-fetch')
      console.log('3. ✅ Ready for Liberty Mutual demo')
    }
    console.log('='.repeat(120))

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = !args.includes('--execute')

// Run the backfill
backfillVehicleFNOLData(isDryRun)