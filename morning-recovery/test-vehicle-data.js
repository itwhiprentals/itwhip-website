// test-vehicle-data.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testVehicleData() {
  console.log('🔍 TESTING VEHICLE INTELLIGENCE DATA')
  console.log('=' .repeat(80))
  
  try {
    // Step 1: Get active host session
    console.log('\n1️⃣ Getting active host session...')
    const session = await prisma.session.findFirst({
      where: {
        user: {
          role: 'BUSINESS',
          rentalHost: {
            isNot: null
          }
        },
        revokedAt: null,
        expiresAt: {
          gte: new Date()
        }
      },
      orderBy: {
        lastActivity: 'desc'
      },
      include: {
        user: {
          include: {
            rentalHost: {
              include: {
                cars: {
                  take: 5,
                  orderBy: {
                    createdAt: 'desc'
                  }
                }
              }
            }
          }
        }
      }
    })
    
    if (!session) {
      console.log('❌ No active host session found')
      console.log('🔑 Please log in as a host first at: http://localhost:3000/host/login')
      await prisma.$disconnect()
      return
    }
    
    const host = session.user.rentalHost
    console.log('✅ Host:', host.name)
    console.log('✅ Email:', session.user.email)
    console.log('✅ Host ID:', host.id)
    
    // Step 2: Get host's vehicles directly from database
    console.log('\n2️⃣ Getting host vehicles from database...')
    const cars = host.cars
    
    if (cars.length === 0) {
      console.log('❌ No vehicles found for this host')
      await prisma.$disconnect()
      return
    }
    
    console.log(`✅ Found ${cars.length} vehicle(s)`)
    
    // Step 3: Show detailed data for each vehicle
    console.log('\n3️⃣ VEHICLE DATA ANALYSIS:')
    console.log('=' .repeat(80))
    
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i]
      
      console.log(`\n🚗 VEHICLE ${i + 1}: ${car.year} ${car.make} ${car.model}`)
      console.log('-' .repeat(80))
      console.log(`   ID: ${car.id}`)
      console.log(`   VIN: ${car.vin || 'NOT SET'}`)
      console.log(`   License Plate: ${car.licensePlate || 'NOT SET'}`)
      
      console.log('\n   🔑 CRITICAL INSURANCE FIELDS:')
      console.log(`   insuranceType: "${car.insuranceType || 'NULL'}"`)
      console.log(`   revenueSplit: ${car.revenueSplit || 'NULL'}`)
      console.log(`   primaryUse: "${car.primaryUse || 'NULL'}"`)
      
      console.log('\n   📊 TRIP DATA:')
      console.log(`   totalTrips: ${car.totalTrips || 0}`)
      console.log(`   totalBookings: ${car.totalBookings || 0}`)
      console.log(`   isActive: ${car.isActive}`)
      console.log(`   hasActiveClaim: ${car.hasActiveClaim || false}`)
      
      // Calculate what tier SHOULD be
      console.log('\n   🧮 TIER CALCULATION:')
      const insuranceType = (car.insuranceType || '').toLowerCase()
      let expectedTier = 40
      let expectedLabel = '40% (Platform/No Insurance)'
      
      if (insuranceType === 'commercial') {
        expectedTier = 90
        expectedLabel = '90% (Commercial)'
      } else if (insuranceType === 'p2p') {
        expectedTier = 75
        expectedLabel = '75% (P2P)'
      }
      
      console.log(`   Insurance Type: "${car.insuranceType || 'none'}"`)
      console.log(`   Expected Tier: ${expectedLabel}`)
      console.log(`   Database revenueSplit: ${car.revenueSplit || 'NULL'}%`)
      
      // Check for mismatch
      if (car.revenueSplit !== expectedTier) {
        console.log('\n   ⚠️  MISMATCH DETECTED!')
        console.log(`   Database shows ${car.revenueSplit}% but should be ${expectedTier}%`)
        console.log(`   Frontend should calculate from insuranceType, not use revenueSplit`)
      } else {
        console.log('\n   ✅ Database revenueSplit matches expected tier')
      }
    }
    
    // Step 4: Test API call using the session token
    console.log('\n4️⃣ TESTING INTELLIGENCE API...')
    console.log('=' .repeat(80))
    
    const testCar = cars[0]
    console.log(`\nTesting with: ${testCar.year} ${testCar.make} ${testCar.model}`)
    console.log(`Car ID: ${testCar.id}`)
    
    const fetch = (await import('node-fetch')).default
    
    const response = await fetch(
      `http://localhost:3000/api/host/cars/${testCar.id}/intelligence`,
      {
        headers: {
          'Cookie': `hostAccessToken=${session.token}`,
          'x-host-id': host.id
        }
      }
    )
    
    if (!response.ok) {
      console.log(`❌ API returned status: ${response.status}`)
      const errorText = await response.text()
      console.log('Error:', errorText)
    } else {
      const apiData = await response.json()
      const apiVehicle = apiData.data?.vehicle
      
      if (apiVehicle) {
        console.log('\n✅ API RESPONSE DATA:')
        console.log('-' .repeat(80))
        console.log(`   insuranceType: "${apiVehicle.insuranceType || 'NULL'}"`)
        console.log(`   revenueSplit: ${apiVehicle.revenueSplit || 'NULL'}`)
        console.log(`   primaryUse: "${apiVehicle.primaryUse || 'NULL'}"`)
        
        // Compare with database
        console.log('\n📊 DATABASE vs API COMPARISON:')
        console.log('-' .repeat(80))
        console.log(`   insuranceType: DB="${testCar.insuranceType || 'NULL'}" | API="${apiVehicle.insuranceType || 'NULL'}"`)
        console.log(`   revenueSplit: DB=${testCar.revenueSplit || 'NULL'} | API=${apiVehicle.revenueSplit || 'NULL'}`)
        console.log(`   primaryUse: DB="${testCar.primaryUse || 'NULL'}" | API="${apiVehicle.primaryUse || 'NULL'}"`)
        
        if (testCar.insuranceType !== apiVehicle.insuranceType) {
          console.log('\n⚠️  API insuranceType does NOT match database!')
        } else {
          console.log('\n✅ API data matches database')
        }
      } else {
        console.log('❌ No vehicle data in API response')
        console.log('Response:', JSON.stringify(apiData, null, 2))
      }
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('✅ TEST COMPLETE')
    console.log('=' .repeat(80))
    console.log('\n📋 SUMMARY:')
    console.log(`   Total Vehicles: ${cars.length}`)
    console.log(`   Host: ${host.name}`)
    console.log(`   Email: ${session.user.email}`)
    console.log('\n💡 If insuranceType is NULL, the host needs to add insurance in their profile.')
    console.log('💡 If revenueSplit doesn\'t match expected tier, frontend should calculate from insuranceType.')
    console.log('')
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testVehicleData()