// app/api/partner/upload/route.ts
// Partner photo upload endpoint using JWT cookie auth

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        hostType: true
      }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

// Helper to upload a single file to Cloudinary
async function uploadToCloudinary(
  file: File,
  folder: string,
  partnerId: string,
  index?: number
): Promise<any> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  const publicId = index !== undefined
    ? `${partnerId}-vehicle-${Date.now()}-${index}`
    : `${partnerId}-vehicle-${Date.now()}`

  const uploadResult = await cloudinary.uploader.upload(dataUri, {
    folder: folder,
    public_id: publicId,
    resource_type: 'auto',
    exif: true,
    colors: true,
    image_metadata: true
  })

  return uploadResult
}

// POST - Upload vehicle photos
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      console.log('❌ Partner upload failed: No partner found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('📤 Partner upload request from:', partner.id, partner.email)

    const formData = await request.formData()
    const type = formData.get('type') as string
    const carId = formData.get('carId') as string | null

    // Get all files from formData
    const files: File[] = []
    const fileEntries = formData.getAll('file')
    const filesEntries = formData.getAll('files')

    for (const entry of [...fileEntries, ...filesEntries]) {
      if (entry instanceof File) {
        files.push(entry)
      }
    }

    console.log('📁 Files received:', files.length)

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate all files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only images are allowed.` },
          { status: 400 }
        )
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 10MB.` },
          { status: 400 }
        )
      }
    }

    // Only support vehicle photos for partners
    if (type !== 'vehicle-photo' && type !== 'carPhoto') {
      return NextResponse.json(
        { error: 'Invalid upload type. Only vehicle photos are supported.' },
        { status: 400 }
      )
    }

    const folder = 'partner-vehicle-photos'

    // If carId provided, verify ownership and save to database
    if (carId) {
      const car = await prisma.rentalCar.findFirst({
        where: {
          id: carId,
          hostId: partner.id
        }
      })

      if (!car) {
        return NextResponse.json(
          { error: 'Vehicle not found or unauthorized' },
          { status: 404 }
        )
      }

      // Get current photo count for ordering
      const currentPhotoCount = await prisma.rentalCarPhoto.count({
        where: { carId, deletedAt: null }
      })

      // Upload all files in parallel
      const uploadPromises = files.map((file, index) =>
        uploadToCloudinary(file, folder, partner.id, index)
      )

      const uploadResults = await Promise.all(uploadPromises)

      // Create photo records for all uploads
      const photoRecords = []

      for (let i = 0; i < uploadResults.length; i++) {
        const uploadResult = uploadResults[i]

        const photo = await prisma.rentalCarPhoto.create({
          data: {
            id: crypto.randomUUID(),
            carId: carId,
            url: uploadResult.secure_url,
            isHero: currentPhotoCount === 0 && i === 0,
            order: currentPhotoCount + i,
            uploadedBy: partner.id,
            uploadedByType: 'HOST'
          }
        })

        photoRecords.push({
          id: photo.id,
          url: photo.url,
          isHero: photo.isHero,
          order: photo.order
        })
      }

      console.log('✅ Partner uploaded', files.length, 'photos for vehicle:', carId)

      return NextResponse.json({
        success: true,
        photos: photoRecords,
        photo: photoRecords[0]
      })
    }

    // Upload without saving to database (for wizard flow before vehicle is created)
    const uploadPromises = files.map((file, index) =>
      uploadToCloudinary(file, folder, partner.id, index)
    )

    const uploadResults = await Promise.all(uploadPromises)

    const urls = uploadResults.map(result => ({
      url: result.secure_url,
      isHero: false
    }))

    console.log('✅ Partner uploaded', files.length, 'photos (not yet attached to vehicle)')

    return NextResponse.json({
      success: true,
      photos: urls,
      url: urls[0]?.url
    })

  } catch (error) {
    console.error('Partner upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
