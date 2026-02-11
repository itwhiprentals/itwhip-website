// app/api/partner/fleet/[id]/photos/[photoId]/route.ts
// DELETE /api/partner/fleet/[id]/photos/[photoId] - Delete a photo

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, photoId } = await params

    // Verify vehicle belongs to partner
    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id,
        hostId: partner.id
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Verify photo belongs to this vehicle
    const photo = await prisma.rentalCarPhoto.findFirst({
      where: {
        id: photoId,
        carId: id
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const wasHero = photo.isHero

    // Delete the photo
    await prisma.rentalCarPhoto.delete({
      where: { id: photoId }
    })

    // If deleted photo was hero, make the first remaining photo the hero
    if (wasHero) {
      const firstPhoto = await prisma.rentalCarPhoto.findFirst({
        where: { carId: id },
        orderBy: { order: 'asc' }
      })

      if (firstPhoto) {
        await prisma.rentalCarPhoto.update({
          where: { id: firstPhoto.id },
          data: { isHero: true }
        })
      }
    }

    // Get remaining photos
    const remainingPhotos = await prisma.rentalCarPhoto.findMany({
      where: { carId: id },
      orderBy: [{ isHero: 'desc' }, { order: 'asc' }]
    })

    console.log(`[Partner Fleet] Photo deleted:`, {
      partnerId: partner.id,
      vehicleId: id,
      photoId
    })

    return NextResponse.json({
      success: true,
      message: 'Photo deleted',
      photos: remainingPhotos.map(p => ({
        id: p.id,
        url: p.url,
        isHero: p.isHero,
        order: p.order
      }))
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
