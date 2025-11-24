import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function diagnose() {
  console.log('========================================')
  console.log('🔍 PRODUCTION SEARCH DIAGNOSTIC')
  console.log('========================================\n')

  // 1. Check total vehicles
  const totalVehicles = await prisma.rentalCar.count()
  console.log(`📊 Total vehicles in database: ${totalVehicles}`)

  // 2. Check active vehicles
  const activeVehicles = await prisma.rentalCar.count({
    where: { isActive: true }
  })
  console.log(`✅ Active vehicles: ${activeVehicles}`)

  // 3. Check vehicles with coordinates
  const withCoords = await prisma.rentalCar.count({
    where: {
      AND: [
        { latitude: { not: null } },
        { longitude: { not: null } }
      ]
    }
  })
  console.log(`📍 Vehicles with coordinates: ${withCoords}`)

  // 4. Check active vehicles with coordinates
  const activeWithCoords = await prisma.rentalCar.count({
    where: {
      AND: [
        { isActive: true },
        { latitude: { not: null } },
        { longitude: { not: null } }
      ]
    }
  })
  console.log(`✅📍 Active vehicles WITH coordinates: ${activeWithCoords}`)

  // 5. Get sample of all vehicles
  console.log('\n========================================')
  console.log('📋 SAMPLE VEHICLES (First 10)')
  console.log('========================================\n')

  const sampleVehicles = await prisma.rentalCar.findMany({
    take: 10,
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      isActive: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      hostId: true
    }
  })

  for (const car of sampleVehicles) {
    const host = await prisma.rentalHost.findUnique({
      where: { id: car.hostId },
      select: { name: true, email: true }
    })

    console.log(`${sampleVehicles.indexOf(car) + 1}. ${car.year} ${car.make} ${car.model}`)
    console.log(`   ID: ${car.id}`)
    console.log(`   Active: ${car.isActive ? '✅ YES' : '❌ NO'}`)
    console.log(`   Location: ${car.city}, ${car.state}`)
    console.log(`   Coords: ${car.latitude ? `${car.latitude}, ${car.longitude}` : '❌ MISSING'}`)
    console.log(`   Host: ${host?.name} (${host?.email})`)
    console.log('')
  }

  // 6. Check what the homepage query would return
  console.log('========================================')
  console.log('🔍 HOMEPAGE DEFAULT SEARCH SIMULATION')
  console.log('========================================\n')

  // Phoenix area bounds (what the homepage likely uses)
  const phoenixBounds = {
    minLat: 33.0,
    maxLat: 34.0,
    minLng: -113.0,
    maxLng: -111.0
  }

  const homepageResults = await prisma.rentalCar.findMany({
    where: {
      AND: [
        { isActive: true },
        { latitude: { gte: phoenixBounds.minLat, lte: phoenixBounds.maxLat } },
        { longitude: { gte: phoenixBounds.minLng, lte: phoenixBounds.maxLng } }
      ]
    },
    take: 6
  })

  console.log(`🏠 Homepage would show: ${homepageResults.length} vehicles`)

  if (homepageResults.length === 0) {
    console.log('\n❌ PROBLEM FOUND: No vehicles match homepage search criteria!')
    console.log('\nPossible issues:')
    console.log('1. Vehicles are not active')
    console.log('2. Vehicles missing coordinates')
    console.log('3. Coordinates outside Phoenix area')
  } else {
    console.log('\n✅ Homepage should be showing vehicles!')
    homepageResults.forEach((car, i) => {
      console.log(`${i + 1}. ${car.year} ${car.make} ${car.model}`)
    })
  }

  await prisma.$disconnect()
}

diagnose().catch(console.error)
