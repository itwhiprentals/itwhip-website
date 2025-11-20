// scripts/audit-mileage-integrity.ts
import { prisma } from '@/app/lib/database/prisma'

async function auditMileageIntegrity() {
  console.log('🔍 MILEAGE INTEGRITY AUDIT\n')
  console.log('=' .repeat(70))

  try {
    // 1. GET ALL CARS WITH THEIR MILEAGE DATA
    console.log('\n📋 STEP 1: Analyze All Vehicles\n')
    
    const cars = await prisma.rentalCar.findMany({
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        hostId: true,
        currentMileage: true,
        lastRentalEndMileage: true,
        lastRentalEndDate: true,
        createdAt: true,
        
        // Get host info
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            joinedAt: true,
            approvalStatus: true,
            approvedAt: true,
            documentsVerified: true,
          }
        },
        
        // Get all bookings with mileage
        bookings: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            startDate: true,
            endDate: true,
            startMileage: true,
            endMileage: true,
            actualStartTime: true,
            actualEndTime: true,
            tripStatus: true,
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        
        // Get all service records
        serviceRecords: {
          select: {
            id: true,
            serviceType: true,
            serviceDate: true,
            mileageAtService: true,
          },
          orderBy: {
            serviceDate: 'asc'
          }
        },
        
        // Get existing anomalies
        mileageAnomalies: {
          select: {
            id: true,
            detectedAt: true,
            lastKnownMileage: true,
            currentMileage: true,
            gapMiles: true,
            severity: true,
            resolved: true,
          }
        }
      }
    })

    console.log(`Found ${cars.length} vehicles\n`)

    // 2. ANALYZE EACH CAR
    for (const car of cars) {
      console.log('=' .repeat(70))
      console.log(`\n🚗 ${car.year} ${car.make} ${car.model}`)
      console.log(`   ID: ${car.id}`)
      console.log(`   Host: ${car.host.name} (${car.host.email})`)
      console.log(`   Host Joined: ${car.host.joinedAt.toLocaleDateString()}`)
      console.log(`   Host Approved: ${car.host.approvedAt?.toLocaleDateString() || 'Not approved'}`)
      console.log(`   Documents Verified: ${car.host.documentsVerified}`)
      console.log(`   Car Added: ${car.createdAt.toLocaleDateString()}`)
      
      // Current mileage state
      console.log('\n📊 CURRENT MILEAGE STATE:')
      console.log(`   Current Mileage: ${car.currentMileage?.toLocaleString() || 'NOT SET'}`)
      console.log(`   Last Rental End: ${car.lastRentalEndMileage?.toLocaleString() || 'No trips yet'}`)
      console.log(`   Last Rental Date: ${car.lastRentalEndDate?.toLocaleDateString() || 'N/A'}`)

      // Build complete mileage timeline
      const timeline: Array<{
        date: Date,
        type: string,
        mileage: number,
        source: string,
        details?: string
      }> = []

      // Add service records to timeline
      car.serviceRecords.forEach(service => {
        timeline.push({
          date: service.serviceDate,
          type: 'SERVICE',
          mileage: service.mileageAtService,
          source: service.serviceType,
          details: `${service.serviceType} - ID: ${service.id.substring(0, 8)}`
        })
      })

      // Add booking mileage to timeline
      car.bookings.forEach(booking => {
        if (booking.startMileage) {
          timeline.push({
            date: booking.actualStartTime || booking.startDate,
            type: 'TRIP_START',
            mileage: booking.startMileage,
            source: 'BOOKING',
            details: `Booking ${booking.bookingCode} start`
          })
        }
        if (booking.endMileage) {
          timeline.push({
            date: booking.actualEndTime || booking.endDate,
            type: 'TRIP_END',
            mileage: booking.endMileage,
            source: 'BOOKING',
            details: `Booking ${booking.bookingCode} end`
          })
        }
      })

      // Sort timeline by date
      timeline.sort((a, b) => a.date.getTime() - b.date.getTime())

      // Display timeline
      console.log('\n📅 COMPLETE MILEAGE TIMELINE:')
      if (timeline.length === 0) {
        console.log('   ⚠️  No mileage history recorded')
      } else {
        timeline.forEach((entry, index) => {
          const prevMileage = index > 0 ? timeline[index - 1].mileage : 0
          const delta = index > 0 ? entry.mileage - prevMileage : 0
          const days = index > 0 ? Math.floor((entry.date.getTime() - timeline[index - 1].date.getTime()) / (1000 * 60 * 60 * 24)) : 0
          
          console.log(`\n   ${index + 1}. ${entry.date.toLocaleDateString()} - ${entry.type}`)
          console.log(`      Mileage: ${entry.mileage.toLocaleString()}`)
          if (index > 0) {
            console.log(`      Delta: +${delta.toLocaleString()} miles (${days} days)`)
            if (days > 0) {
              const dailyAvg = (delta / days).toFixed(1)
              console.log(`      Daily Avg: ${dailyAvg} mi/day`)
            }
          }
          console.log(`      Source: ${entry.source}`)
          console.log(`      Details: ${entry.details}`)
        })
      }

      // Detect anomalies
      console.log('\n🔍 ANOMALY DETECTION:')
      const anomalies: string[] = []

      // Check for gaps in timeline
      for (let i = 1; i < timeline.length; i++) {
        const prev = timeline[i - 1]
        const curr = timeline[i]
        const delta = curr.mileage - prev.mileage
        const days = Math.floor((curr.date.getTime() - prev.date.getTime()) / (1000 * 60 * 60 * 24))
        const dailyAvg = days > 0 ? delta / days : 0

        // Flag unusual patterns
        if (delta < 0) {
          anomalies.push(`❌ CRITICAL: Mileage decreased from ${prev.mileage.toLocaleString()} to ${curr.mileage.toLocaleString()}`)
        } else if (delta === 0 && days > 30) {
          anomalies.push(`⚠️  WARNING: No mileage change for ${days} days`)
        } else if (dailyAvg > 500 && days < 7) {
          anomalies.push(`⚠️  WARNING: Unusually high usage: ${dailyAvg.toFixed(0)} mi/day over ${days} days`)
        } else if (delta > 10000 && days < 30) {
          anomalies.push(`⚠️  WARNING: Large mileage jump: +${delta.toLocaleString()} miles in ${days} days`)
        }
      }

      // Check currentMileage vs timeline
      if (car.currentMileage && timeline.length > 0) {
        const lastRecorded = timeline[timeline.length - 1].mileage
        const diff = car.currentMileage - lastRecorded
        if (diff !== 0) {
          anomalies.push(`⚠️  INFO: Current mileage (${car.currentMileage.toLocaleString()}) differs from last recorded (${lastRecorded.toLocaleString()}) by ${diff.toLocaleString()} miles`)
        }
      }

      if (anomalies.length === 0) {
        console.log('   ✅ No anomalies detected')
      } else {
        anomalies.forEach(anomaly => console.log(`   ${anomaly}`))
      }

      // Existing anomaly records
      if (car.mileageAnomalies.length > 0) {
        console.log('\n📋 EXISTING ANOMALY RECORDS:')
        car.mileageAnomalies.forEach(anomaly => {
          console.log(`   - ${anomaly.severity}: ${anomaly.gapMiles.toLocaleString()} mile gap`)
          console.log(`     From ${anomaly.lastKnownMileage.toLocaleString()} to ${anomaly.currentMileage.toLocaleString()}`)
          console.log(`     Detected: ${anomaly.detectedAt.toLocaleDateString()}`)
          console.log(`     Resolved: ${anomaly.resolved}`)
        })
      }

      // Recommendations
      console.log('\n💡 RECOMMENDATIONS:')
      if (!car.currentMileage) {
        console.log('   ⚠️  Set initial currentMileage')
      }
      if (timeline.length === 0) {
        console.log('   ⚠️  No mileage history - needs baseline')
      }
      if (car.bookings.some(b => !b.startMileage || !b.endMileage)) {
        console.log('   ⚠️  Some bookings missing mileage data')
      }
      if (anomalies.length > 0) {
        console.log('   ⚠️  Create MileageAnomaly records for flagged issues')
      }
    }

    // 3. SYSTEM-WIDE SUMMARY
    console.log('\n' + '=' .repeat(70))
    console.log('\n📊 SYSTEM-WIDE SUMMARY\n')

    const totalCars = cars.length
    const carsWithMileage = cars.filter(c => c.currentMileage).length
    const carsWithHistory = cars.filter(c => c.serviceRecords.length > 0 || c.bookings.some(b => b.startMileage)).length
    const carsWithAnomalies = cars.filter(c => c.mileageAnomalies.length > 0).length
    const totalBookings = cars.reduce((sum, c) => sum + c.bookings.length, 0)
    const bookingsWithMileage = cars.reduce((sum, c) => sum + c.bookings.filter(b => b.startMileage && b.endMileage).length, 0)
    const totalServices = cars.reduce((sum, c) => sum + c.serviceRecords.length, 0)

    console.log(`Total Vehicles: ${totalCars}`)
    console.log(`Vehicles with currentMileage set: ${carsWithMileage} (${((carsWithMileage/totalCars)*100).toFixed(0)}%)`)
    console.log(`Vehicles with mileage history: ${carsWithHistory} (${((carsWithHistory/totalCars)*100).toFixed(0)}%)`)
    console.log(`Vehicles with anomalies: ${carsWithAnomalies}`)
    console.log(`\nTotal Bookings: ${totalBookings}`)
    console.log(`Bookings with mileage data: ${bookingsWithMileage} (${totalBookings > 0 ? ((bookingsWithMileage/totalBookings)*100).toFixed(0) : 0}%)`)
    console.log(`\nTotal Service Records: ${totalServices}`)

    console.log('\n🎯 NEXT STEPS:')
    console.log('1. Review anomalies flagged above')
    console.log('2. Decide on baseline mileage for vehicles without history')
    console.log('3. Create MileageAnomaly records for flagged issues')
    console.log('4. Build mileage verification workflow')
    console.log('5. Update dashboard to display mileage integrity status')

  } catch (error) {
    console.error('❌ Audit failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

auditMileageIntegrity()