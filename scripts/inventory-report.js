// scripts/inventory-report.js
// Run with: node scripts/inventory-report.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function generateInventoryReport() {
  console.log('🚗 FETCHING VEHICLE INVENTORY...\n')
  console.log('=' .repeat(120))
  
  try {
    const cars = await prisma.rentalCar.findMany({
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            state: true
          }
        },
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'ACTIVE', 'COMPLETED']
            }
          },
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { make: 'asc' },
        { model: 'asc' }
      ]
    })

    console.log(`📋 TOTAL VEHICLES: ${cars.length}\n`)
    console.log('=' .repeat(120))
    
    // Generate detailed report
    cars.forEach((car, index) => {
      console.log(`\n🚗 VEHICLE #${index + 1}`)
      console.log('-'.repeat(120))
      
      // Basic Info
      console.log(`ID:           ${car.id}`)
      console.log(`Vehicle:      ${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''}`)
      console.log(`Color:        ${car.color}`)
      console.log(`Type:         ${car.carType}`)
      console.log(`Transmission: ${car.transmission}`)
      console.log(`Fuel:         ${car.fuelType}`)
      
      // Current Data Status
      console.log(`\n📄 CURRENT DATA:`)
      console.log(`VIN:          ${car.vin || '❌ NOT SET'}`)
      console.log(`License:      ${car.licensePlate || '❌ NOT SET'}`)
      console.log(`Mileage:      ${car.currentMileage ? `${car.currentMileage.toLocaleString()} miles` : 'Not set'}`)
      
      // Location
      console.log(`\n📍 LOCATION:`)
      console.log(`Address:      ${car.address}`)
      console.log(`City:         ${car.city}`)
      console.log(`State:        ${car.state}`)
      console.log(`ZIP:          ${car.zipCode}`)
      
      // Host Info
      console.log(`\n👤 HOST:`)
      console.log(`Name:         ${car.host.name}`)
      console.log(`Email:        ${car.host.email}`)
      console.log(`Host ID:      ${car.host.id}`)
      
      // FNOL Status
      console.log(`\n🔍 FNOL DATA STATUS:`)
      console.log(`Registered Owner:    ${car.registeredOwner || '⚠️  NEEDS BACKFILL'}`)
      console.log(`Estimated Value:     ${car.estimatedValue ? `$${car.estimatedValue.toLocaleString()}` : '⚠️  NEEDS BACKFILL'}`)
      console.log(`Garage Address:      ${car.garageAddress || '⚠️  NEEDS BACKFILL'}`)
      console.log(`Garage City:         ${car.garageCity || '⚠️  NEEDS BACKFILL'}`)
      console.log(`Garage State:        ${car.garageState || '⚠️  NEEDS BACKFILL'}`)
      console.log(`Garage ZIP:          ${car.garageZip || '⚠️  NEEDS BACKFILL'}`)
      console.log(`Has Lien:            ${car.hasLien ? 'Yes' : 'No'}`)
      console.log(`Has Alarm:           ${car.hasAlarm ? 'Yes' : 'No'}`)
      console.log(`Has Tracking:        ${car.hasTracking ? 'Yes' : 'No'}`)
      console.log(`Has Immobilizer:     ${car.hasImmobilizer ? 'Yes' : 'No'}`)
      console.log(`Is Modified:         ${car.isModified ? 'Yes' : 'No'}`)
      console.log(`Annual Mileage:      ${car.annualMileage || '⚠️  NEEDS BACKFILL'}`)
      console.log(`Primary Use:         ${car.primaryUse || '⚠️  NEEDS BACKFILL'}`)
      
      // Stats
      console.log(`\n📊 STATS:`)
      console.log(`Daily Rate:   $${car.dailyRate}`)
      console.log(`Total Trips:  ${car.totalTrips}`)
      console.log(`Rating:       ⭐ ${car.rating.toFixed(1)}`)
      console.log(`Active:       ${car.isActive ? '✅ Yes' : '❌ No'}`)
      console.log(`Bookings:     ${car.bookings.length} total`)
      
      console.log('-'.repeat(120))
    })

    // Summary Statistics
    console.log('\n\n📊 SUMMARY STATISTICS')
    console.log('=' .repeat(120))
    
    const needsVIN = cars.filter(c => !c.vin).length
    const needsPlate = cars.filter(c => !c.licensePlate).length
    const needsOwner = cars.filter(c => !c.registeredOwner).length
    const needsValue = cars.filter(c => !c.estimatedValue).length
    const needsGarage = cars.filter(c => !c.garageAddress).length
    
    console.log(`Total Vehicles:              ${cars.length}`)
    console.log(`Needs VIN:                   ${needsVIN}`)
    console.log(`Needs License Plate:         ${needsPlate}`)
    console.log(`Needs Registered Owner:      ${needsOwner}`)
    console.log(`Needs Estimated Value:       ${needsValue}`)
    console.log(`Needs Garage Address:        ${needsGarage}`)
    
    console.log('\n🎯 BACKFILL REQUIRED FOR: ' + (needsOwner > 0 ? `${needsOwner} vehicles` : 'NONE ✅'))
    
    // Generate CSV Export
    console.log('\n\n📄 CSV EXPORT (Copy below for spreadsheet)')
    console.log('=' .repeat(120))
    console.log('ID,Make,Model,Year,Type,Color,Host Name,Host ID,Address,City,State,ZIP,Current VIN,Current Plate,Current Mileage,Needs VIN?,Needs Plate?,Needs Owner?,Needs Value?,Needs Garage?')
    
    cars.forEach(car => {
      console.log([
        car.id,
        car.make,
        car.model,
        car.year,
        car.carType,
        car.color,
        car.host.name,
        car.host.id,
        `"${car.address}"`,
        car.city,
        car.state,
        car.zipCode,
        car.vin || 'NONE',
        car.licensePlate || 'NONE',
        car.currentMileage || 'NONE',
        car.vin ? 'No' : 'Yes',
        car.licensePlate ? 'No' : 'Yes',
        car.registeredOwner ? 'No' : 'Yes',
        car.estimatedValue ? 'No' : 'Yes',
        car.garageAddress ? 'No' : 'Yes'
      ].join(','))
    })

    console.log('\n' + '='.repeat(120))
    console.log('✅ INVENTORY REPORT COMPLETE')
    console.log('Next Steps:')
    console.log('1. Copy CSV data above to spreadsheet')
    console.log('2. Research realistic values for each vehicle')
    console.log('3. Generate realistic VINs and Arizona plates')
    console.log('4. Return approved data for backfill script')
    console.log('=' .repeat(120))

  } catch (error) {
    console.error('❌ Error generating inventory report:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the report
generateInventoryReport()