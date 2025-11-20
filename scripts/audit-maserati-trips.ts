// scripts/audit-maserati-trips.ts
import { prisma } from '@/app/lib/database/prisma'

async function auditMaseratiTrips() {
  const carId = 'cmfn3fdhf0001l8040ao0a3h8'
  
  console.log('🔍 MASERATI TRIP AUDIT\n')
  console.log('=' .repeat(70))
  
  try {
    // Get car with all trips
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        currentMileage: true,
        createdAt: true,
        
        host: {
          select: {
            name: true,
            joinedAt: true,
            approvedAt: true,
          }
        },
        
        bookings: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            tripStatus: true,
            startDate: true,
            endDate: true,
            actualStartTime: true,
            actualEndTime: true,
            startMileage: true,
            endMileage: true,
            guestName: true,
            guestEmail: true,
            createdAt: true,
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        
        serviceRecords: {
          select: {
            serviceType: true,
            serviceDate: true,
            mileageAtService: true,
          },
          orderBy: {
            serviceDate: 'asc'
          }
        }
      }
    })
    
    if (!car) {
      console.log('❌ Car not found')
      return
    }
    
    console.log(`\n🚗 ${car.year} ${car.make} ${car.model}`)
    console.log(`   Current Mileage: ${car.currentMileage?.toLocaleString() || 'NOT SET'}`)
    console.log(`   Car Added: ${car.createdAt.toLocaleDateString()}`)
    console.log(`   Host: ${car.host.name}`)
    console.log(`   Host Joined: ${car.host.joinedAt.toLocaleDateString()}`)
    console.log(`   Host Approved: ${car.host.approvedAt?.toLocaleDateString() || 'Not approved'}`)
    
    console.log('\n📋 SERVICE HISTORY:')
    car.serviceRecords.forEach((service, i) => {
      console.log(`   ${i + 1}. ${service.serviceDate.toLocaleDateString()}: ${service.serviceType} at ${service.mileageAtService.toLocaleString()} miles`)
    })
    
    console.log('\n📋 BOOKING HISTORY:')
    console.log(`   Total Bookings: ${car.bookings.length}`)
    
    car.bookings.forEach((booking, i) => {
      console.log(`\n   ${i + 1}. Booking ${booking.bookingCode}`)
      console.log(`      Status: ${booking.status} | Trip Status: ${booking.tripStatus}`)
      console.log(`      Guest: ${booking.guestName || 'Unknown'} (${booking.guestEmail || 'No email'})`)
      console.log(`      Booked: ${booking.createdAt.toLocaleDateString()}`)
      console.log(`      Dates: ${booking.startDate.toLocaleDateString()} → ${booking.endDate.toLocaleDateString()}`)
      console.log(`      Start Mileage: ${booking.startMileage?.toLocaleString() || 'NOT SET'}`)
      console.log(`      End Mileage: ${booking.endMileage?.toLocaleString() || 'NOT SET'}`)
      
      if (booking.startMileage && booking.endMileage) {
        const milesDriven = booking.endMileage - booking.startMileage
        const days = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24))
        console.log(`      Miles Driven: ${milesDriven.toLocaleString()} (${(milesDriven/days).toFixed(1)} mi/day)`)
      }
      
      // Check for anomalies
      if (i > 0 && booking.startMileage && car.bookings[i-1].endMileage) {
        const prevEnd = car.bookings[i-1].endMileage!
        const gap = booking.startMileage - prevEnd
        const daysBetween = Math.ceil((booking.startDate.getTime() - car.bookings[i-1].endDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (gap < 0) {
          console.log(`      ❌ ANOMALY: Mileage went BACKWARD by ${Math.abs(gap).toLocaleString()} miles`)
        } else if (gap > 0) {
          console.log(`      ✅ Gap from previous trip: +${gap.toLocaleString()} miles (${daysBetween} days between trips)`)
          if (daysBetween > 0) {
            console.log(`      📊 Host usage: ${(gap/daysBetween).toFixed(1)} mi/day`)
          }
        }
      }
    })
    
    console.log('\n🎯 MILEAGE VALIDATION RULES TO APPLY:')
    console.log('   1. First trip validates against inspection mileage')
    console.log('   2. Each trip start must be ≥ previous trip end')
    console.log('   3. Host usage between trips calculated automatically')
    console.log('   4. Service records must align with trip mileage')
    console.log('   5. Backward movement flagged as CRITICAL')
    console.log('   6. Large gaps (>500mi in <7 days) flagged as WARNING')
    
  } catch (error) {
    console.error('❌ Audit failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

auditMaseratiTrips()