// app/api/host/cars/[id]/photos/[photoId]/route.ts

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

// DELETE endpoint to remove a photo
export async function DELETE(
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

    // Check if car has minimum required photos
    if (car.photos.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete photo. Cars must have at least one photo.' },
        { status: 400 }
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

    // Check if this is the hero photo
    const wasHero = targetPhoto.isHero
    const photoUrl = targetPhoto.url

    // Start a transaction to handle deletion and reordering
    const result = await prisma.$transaction(async (tx) => {
      // Delete the photo
      await tx.rentalCarPhoto.delete({
        where: {
          id: photoId
        }
      })

      // If this was the hero photo, set another as hero
      if (wasHero && car.photos.length > 1) {
        // Get the first remaining photo
        const remainingPhotos = car.photos.filter(p => p.id !== photoId)
        if (remainingPhotos.length > 0) {
          const newHeroPhoto = remainingPhotos[0]
          
          await tx.rentalCarPhoto.update({
            where: {
              id: newHeroPhoto.id
            },
            data: {
              isHero: true,
              order: 0
            }
          })

          // Update car's hero photo URL
          await tx.rentalCar.update({
            where: {
              id: carId
            },
            data: {
              updatedAt: new Date()
            }
          })
        }
      }

      // Reorder remaining photos
      const remainingPhotos = await tx.rentalCarPhoto.findMany({
        where: {
          carId: carId
        },
        orderBy: {
          order: 'asc'
        }
      })

      for (let i = 0; i < remainingPhotos.length; i++) {
        await tx.rentalCarPhoto.update({
          where: {
            id: remainingPhotos[i].id
          },
          data: {
            order: i
          }
        })
      }

      // Update car's updated timestamp
      await tx.rentalCar.update({
        where: {
          id: carId
        },
        data: {
          updatedAt: new Date()
        }
      })

      return {
        deletedPhotoId: photoId,
        remainingPhotosCount: remainingPhotos.length
      }
    })

    // Log the activity
    await (prisma.activityLog.create as any)({
      data: {
        action: 'CAR_PHOTO_DELETED',
        entityType: 'car',
        entityId: carId,
        metadata: {
          hostId: host.id,
          photoId: photoId,
          wasHero: wasHero,
          photoUrl: photoUrl,
          carDetails: `${car.year} ${car.make} ${car.model}`,
          remainingPhotos: result.remainingPhotosCount
        }
      }
    })

    // Optional: Delete from Cloudinary or S3 if you're managing storage
    // This would be done asynchronously to not slow down the response
    // Example:
    // await deleteFromCloudinary(photoUrl)

    return NextResponse.json({
      success: true,
      data: {
        message: 'Photo deleted successfully',
        deletedPhotoId: result.deletedPhotoId,
        remainingPhotos: result.remainingPhotosCount,
        newHeroAssigned: wasHero && result.remainingPhotosCount > 0
      }
    })

  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch a specific photo
export async function GET(
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

    // Get the specific photo
    const photo = await prisma.rentalCarPhoto.findFirst({
      where: {
        id: photoId,
        carId: carId
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: photo.id,
        url: photo.url,
        caption: photo.caption || null,
        isHero: photo.isHero,
        order: photo.order,
        uploadedAt: photo.createdAt
      }
    })

  } catch (error) {
    console.error('Get photo error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photo' },
      { status: 500 }
    )
  }
}

// PUT endpoint to update photo details (caption, order)
export async function PUT(
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

    const body = await request.json()
    const { caption, order } = body

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

    // Verify the photo exists
    const photo = await prisma.rentalCarPhoto.findFirst({
      where: {
        id: photoId,
        carId: carId
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Update the photo
    const updatedPhoto = await prisma.rentalCarPhoto.update({
      where: {
        id: photoId
      },
      data: {
        ...(caption !== undefined && { caption }),
        ...(order !== undefined && { order })
      }
    })

    // Update car's updated timestamp
    await prisma.rentalCar.update({
      where: {
        id: carId
      },
      data: {
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPhoto.id,
        url: updatedPhoto.url,
        caption: updatedPhoto.caption,
        isHero: updatedPhoto.isHero,
        order: updatedPhoto.order,
        message: 'Photo updated successfully'
      }
    })

  } catch (error) {
    console.error('Update photo error:', error)
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    )
  }
}