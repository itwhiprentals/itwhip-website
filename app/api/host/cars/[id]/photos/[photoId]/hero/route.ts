// app/api/host/cars/[id]/photos/[photoId]/hero/route.ts

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const { id: carId, photoId } = await params
    const host = await getHostFromHeaders()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if host is approved
    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved hosts can manage car photos' },
        { status: 403 }
      )
    }

    // Verify the car belongs to the host
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      },
      include: {
        photos: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or unauthorized' },
        { status: 404 }
      )
    }

    // Verify the photo exists and belongs to this car
    const targetPhoto = await prisma.rentalCarPhoto.findFirst({
      where: {
        id: photoId,
        carId: carId
      }
    })

    if (!targetPhoto) {
      return NextResponse.json(
        { error: 'Photo not found or does not belong to this car' },
        { status: 404 }
      )
    }

    // Start a transaction to update photo statuses
    const result = await prisma.$transaction(async (tx) => {
      // First, set all photos for this car to not be hero
      await tx.rentalCarPhoto.updateMany({
        where: {
          carId: carId
        },
        data: {
          isHero: false
        }
      })

      // Then set the selected photo as hero
      const updatedPhoto = await tx.rentalCarPhoto.update({
        where: {
          id: photoId
        },
        data: {
          isHero: true,
          order: 0 // Hero photo should be first in order
        }
      })

      // Update the order of other photos
      const otherPhotos = car.photos.filter(p => p.id !== photoId)
      
      for (let i = 0; i < otherPhotos.length; i++) {
        await tx.rentalCarPhoto.update({
          where: {
            id: otherPhotos[i].id
          },
          data: {
            order: i + 1
          }
        })
      }

      // Update the car's hero photo URL (if your car model has this field)
      await tx.rentalCar.update({
        where: {
          id: carId
        },
        data: {
          heroPhotoUrl: targetPhoto.url,
          updatedAt: new Date()
        } as any
      })

      return updatedPhoto
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        action: 'CAR_HERO_PHOTO_CHANGED',
        entityType: 'car',
        entityId: carId,
        metadata: {
          hostId: host.id,
          photoId: photoId,
          previousHeroPhotoId: car.photos.find(p => p.isHero)?.id || null,
          carDetails: `${car.year} ${car.make} ${car.model}`
        }
      }
    })

    // Return updated photo information
    return NextResponse.json({
      success: true,
      data: {
        photoId: result.id,
        url: result.url,
        isHero: true,
        message: 'Photo set as hero successfully'
      }
    })

  } catch (error) {
    console.error('Set hero photo error:', error)
    return NextResponse.json(
      { error: 'Failed to set hero photo' },
      { status: 500 }
    )
  }
}

// GET endpoint to check current hero photo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const { id: carId } = await params
    const host = await getHostFromHeaders()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the car belongs to the host
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      },
      include: {
        photos: {
          where: {
            isHero: true
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or unauthorized' },
        { status: 404 }
      )
    }

    const heroPhoto = car.photos[0] || null

    return NextResponse.json({
      success: true,
      data: {
        carId: car.id,
        carName: `${car.year} ${car.make} ${car.model}`,
        heroPhoto: heroPhoto ? {
          id: heroPhoto.id,
          url: heroPhoto.url,
          caption: heroPhoto.caption || null
        } : null
      }
    })

  } catch (error) {
    console.error('Get hero photo error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero photo' },
      { status: 500 }
    )
  }
}