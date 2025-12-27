// app/api/partner/hero-image/route.ts
// Partner Hero Image Upload API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { v2 as cloudinary } from 'cloudinary'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
)

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Hero image specs
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function getAuthenticatedPartner() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) {
    return null
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const payload = verified.payload

    if (!payload.isPartner) {
      return null
    }

    const partner = await prisma.rentalHost.findUnique({
      where: { id: payload.hostId as string },
      select: {
        id: true,
        partnerCompanyName: true,
        partnerSlug: true,
        partnerHeroImage: true,
        approvalStatus: true,
        hostType: true
      }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch (error) {
    return null
  }
}

// GET - Get current hero image
export async function GET(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      heroImage: partner.partnerHeroImage
    })

  } catch (error: any) {
    console.error('[Partner Hero Image GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get hero image' },
      { status: 500 }
    )
  }
}

// POST - Upload new hero image
export async function POST(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPG, PNG, WebP' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum 5MB' },
        { status: 400 }
      )
    }

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Delete old hero image if exists
    if (partner.partnerHeroImage) {
      try {
        // Extract public_id from URL
        const urlParts = partner.partnerHeroImage.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const publicId = `partner-hero/${partner.id}/${fileName.split('.')[0]}`
        await cloudinary.uploader.destroy(publicId)
      } catch (e) {
        console.error('Failed to delete old hero image:', e)
      }
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: `partner-hero/${partner.id}`,
      resource_type: 'image',
      transformation: [
        { width: 1920, height: 400, crop: 'fill', gravity: 'center' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    })

    // Update partner record
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: { partnerHeroImage: uploadResult.secure_url }
    })

    return NextResponse.json({
      success: true,
      heroImage: uploadResult.secure_url
    })

  } catch (error: any) {
    console.error('[Partner Hero Image POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload hero image' },
      { status: 500 }
    )
  }
}

// DELETE - Remove hero image
export async function DELETE(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!partner.partnerHeroImage) {
      return NextResponse.json(
        { success: false, error: 'No hero image to delete' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    try {
      const urlParts = partner.partnerHeroImage.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const publicId = `partner-hero/${partner.id}/${fileName.split('.')[0]}`
      await cloudinary.uploader.destroy(publicId)
    } catch (e) {
      console.error('Failed to delete from Cloudinary:', e)
    }

    // Update partner record
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: { partnerHeroImage: null }
    })

    return NextResponse.json({
      success: true,
      message: 'Hero image deleted'
    })

  } catch (error: any) {
    console.error('[Partner Hero Image DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete hero image' },
      { status: 500 }
    )
  }
}
