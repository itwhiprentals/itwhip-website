// app/api/partner/fleet/[id]/photos/route.ts
// POST /api/partner/fleet/[id]/photos - Upload photos to vehicle
// PUT /api/partner/fleet/[id]/photos - Set hero photo

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
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

// POST - Add photos to vehicle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify vehicle belongs to partner
    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id,
        hostId: partner.id
      },
      include: {
        photos: true
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { photos } = body

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      )
    }

    // Determine starting order
    const maxOrder = vehicle.photos.length > 0
      ? Math.max(...vehicle.photos.map(p => p.order))
      : -1

    // Create photos
    const createdPhotos = await prisma.rentalCarPhoto.createMany({
      data: photos.map((photo: { url: string; isHero?: boolean }, index: number) => ({
        id: crypto.randomUUID(),
        carId: id,
        url: photo.url,
        isHero: photo.isHero && vehicle.photos.length === 0 && index === 0,
        order: maxOrder + 1 + index,
        uploadedBy: partner.id,
        uploadedByType: 'HOST'
      }))
    })

    // If first photo and no existing hero, set as hero
    if (vehicle.photos.length === 0 && photos.length > 0) {
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

    // Fetch updated photos
    const updatedPhotos = await prisma.rentalCarPhoto.findMany({
      where: { carId: id },
      orderBy: [{ isHero: 'desc' }, { order: 'asc' }]
    })

    console.log(`[Partner Fleet] Photos added:`, {
      partnerId: partner.id,
      vehicleId: id,
      count: createdPhotos.count
    })

    return NextResponse.json({
      success: true,
      message: `${createdPhotos.count} photo(s) added`,
      photos: updatedPhotos.map(p => ({
        id: p.id,
        url: p.url,
        isHero: p.isHero,
        order: p.order
      }))
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error adding photos:', error)
    return NextResponse.json(
      { error: 'Failed to add photos' },
      { status: 500 }
    )
  }
}

// PUT - Set hero photo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

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

    const body = await request.json()
    const { photoId } = body

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
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

    // Unset all other photos as hero
    await prisma.rentalCarPhoto.updateMany({
      where: { carId: id },
      data: { isHero: false }
    })

    // Set new hero
    await prisma.rentalCarPhoto.update({
      where: { id: photoId },
      data: { isHero: true }
    })

    console.log(`[Partner Fleet] Hero photo set:`, {
      partnerId: partner.id,
      vehicleId: id,
      photoId
    })

    return NextResponse.json({
      success: true,
      message: 'Hero photo updated'
    })

  } catch (error: any) {
    console.error('[Partner Fleet] Error setting hero photo:', error)
    return NextResponse.json(
      { error: 'Failed to set hero photo' },
      { status: 500 }
    )
  }
}
