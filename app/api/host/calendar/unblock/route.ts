// app/api/host/calendar/unblock/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!hostId && !userId) return null
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId }
  })
  
  return host
}

export async function POST(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { carId, date } = body

    if (!carId || !date) {
      return NextResponse.json(
        { error: 'Car ID and date are required' },
        { status: 400 }
      )
    }

    // Verify the car belongs to the host
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or unauthorized' },
        { status: 404 }
      )
    }

    // Find and delete the blocked date
    const result = await prisma.rentalAvailability.deleteMany({
      where: {
        carId: carId,
        date: new Date(date),
        isAvailable: false
      }
    })

    if (result.count === 0) {
      // Try updating if it exists but is marked as available
      await prisma.rentalAvailability.updateMany({
        where: {
          carId: carId,
          date: new Date(date)
        },
        data: {
          isAvailable: true,
          customPrice: null,
          note: null
        }
      })
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'CALENDAR_DATE_UNBLOCKED',
        entityType: 'car',
        entityId: carId,
        metadata: {
          hostId: host.id,
          date: date,
          carDetails: `${car.year} ${car.make} ${car.model}`
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Date unblocked successfully'
    })

  } catch (error) {
    console.error('Unblock date error:', error)
    return NextResponse.json(
      { error: 'Failed to unblock date' },
      { status: 500 }
    )
  }
}