// scripts/geocode-cars.ts

import { PrismaClient } from '@prisma/client'
import { geocodeAddress, validateCoordinates, getCityFallbackCoordinates } from '../app/lib/geocoding/mapbox'

const prisma = new PrismaClient()

async function geocodeMissingCars() {
  console.log('🗺️  Starting geocoding process...\n')
  
  try {
    // Find all cars without coordinates
    const carsWithoutCoords = await prisma.rentalCar.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        address: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true
      }
    })
    
    if (carsWithoutCoords.length === 0) {
      console.log('✅ All cars already have coordinates!')
      return
    }
    
    console.log(`Found ${carsWithoutCoords.length} cars without coordinates:\n`)
    
    let successCount = 0
    let failCount = 0
    
    for (const car of carsWithoutCoords) {
      console.log(`Processing: ${car.year} ${car.make} ${car.model}`)
      console.log(`  Address: ${car.address}, ${car.city}, ${car.state}`)
      
      // Try to geocode the address
      const geocodeResult = await geocodeAddress(
        car.address,
        car.city,
        car.state
      )
      
      let latitude: number | null = null
      let longitude: number | null = null
      
      if (geocodeResult && validateCoordinates(geocodeResult.latitude, geocodeResult.longitude)) {
        // Geocoding successful
        latitude = geocodeResult.latitude
        longitude = geocodeResult.longitude
        
        console.log(`  ✅ Geocoded successfully!`)
        console.log(`  📍 Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        console.log(`  📍 Formatted: ${geocodeResult.formattedAddress}`)
        console.log(`  📍 Confidence: ${geocodeResult.confidence}`)
      } else {
        // Geocoding failed, use city center as fallback
        console.log(`  ⚠️  Geocoding failed, using city center fallback`)
        
        const fallback = getCityFallbackCoordinates(car.city)
        latitude = fallback.lat
        longitude = fallback.lng
        
        console.log(`  📍 Fallback: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
      }
      
      // Update the car in database
      if (latitude && longitude) {
        try {
          await prisma.rentalCar.update({
            where: { id: car.id },
            data: {
              latitude,
              longitude
            }
          })
          
          console.log(`  💾 Database updated successfully!\n`)
          successCount++
        } catch (error) {
          console.error(`  ❌ Failed to update database:`, error)
          console.log('')
          failCount++
        }
      } else {
        console.log(`  ❌ No valid coordinates found\n`)
        failCount++
      }
      
      // Add delay to respect Mapbox rate limits (600 requests/minute)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // Summary
    console.log('━'.repeat(50))
    console.log('\n📊 Geocoding Complete!\n')
    console.log(`✅ Successfully updated: ${successCount} cars`)
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount} cars`)
    }
    
    // Verify all cars now have coordinates
    const remainingWithoutCoords = await prisma.rentalCar.count({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    })
    
    if (remainingWithoutCoords === 0) {
      console.log('\n🎉 All cars now have coordinates!')
    } else {
      console.log(`\n⚠️  ${remainingWithoutCoords} cars still missing coordinates`)
    }
    
  } catch (error) {
    console.error('Fatal error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
geocodeMissingCars()
  .then(() => {
    console.log('\n✨ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })