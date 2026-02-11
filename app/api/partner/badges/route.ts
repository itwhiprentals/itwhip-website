// app/api/partner/badges/route.ts
// Partner Trust Badges API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { v2 as cloudinary } from 'cloudinary'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Badge specs
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB per badge
const MAX_BADGES = 6
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

interface Badge {
  name: string
  imageUrl: string
}

async function getAuthenticatedPartner() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) {
    return null
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const payload = verified.payload

    if (!(payload as any).isPartner) {
      return null
    }

    const partner = await prisma.rentalHost.findUnique({
      where: { id: payload.hostId as string },
      select: {
        id: true,
        partnerCompanyName: true,
        partnerSlug: true,
        partnerBadges: true,
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

// GET - Get all badges
export async function GET(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const badges = (partner.partnerBadges as unknown as Badge[]) || []

    return NextResponse.json({
      success: true,
      badges,
      maxBadges: MAX_BADGES,
      remainingSlots: MAX_BADGES - badges.length
    })

  } catch (error: any) {
    console.error('[Partner Badges GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get badges' },
      { status: 500 }
    )
  }
}

// POST - Upload new badge
export async function POST(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const currentBadges = (partner.partnerBadges as unknown as Badge[]) || []

    // Check badge limit
    if (currentBadges.length >= MAX_BADGES) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_BADGES} badges allowed` },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Badge name is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPG, PNG, WebP, SVG' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum 1MB' },
        { status: 400 }
      )
    }

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: `partner-badges/${partner.id}`,
      resource_type: 'image',
      transformation: [
        { width: 200, height: 200, crop: 'fit' as any },
        { quality: 'auto:good' as any },
        { fetch_format: 'auto' as any }
      ]
    })

    // Add new badge
    const newBadge: Badge = {
      name: name.trim(),
      imageUrl: uploadResult.secure_url
    }

    const updatedBadges = [...currentBadges, newBadge]

    // Update partner record
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: { partnerBadges: updatedBadges as any }
    })

    return NextResponse.json({
      success: true,
      badge: newBadge,
      badges: updatedBadges,
      remainingSlots: MAX_BADGES - updatedBadges.length
    })

  } catch (error: any) {
    console.error('[Partner Badges POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload badge' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a badge by index
export async function DELETE(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const indexStr = searchParams.get('index')

    if (indexStr === null) {
      return NextResponse.json(
        { success: false, error: 'Badge index required' },
        { status: 400 }
      )
    }

    const index = parseInt(indexStr)
    const currentBadges = (partner.partnerBadges as unknown as Badge[]) || []

    if (isNaN(index) || index < 0 || index >= currentBadges.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid badge index' },
        { status: 400 }
      )
    }

    const badgeToDelete = currentBadges[index]

    // Delete from Cloudinary
    try {
      const urlParts = badgeToDelete.imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const publicId = `partner-badges/${partner.id}/${fileName.split('.')[0]}`
      await cloudinary.uploader.destroy(publicId)
    } catch (e) {
      console.error('Failed to delete from Cloudinary:', e)
    }

    // Remove badge from array
    const updatedBadges = currentBadges.filter((_, i) => i !== index)

    // Update partner record
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: { partnerBadges: updatedBadges as any }
    })

    return NextResponse.json({
      success: true,
      message: 'Badge deleted',
      badges: updatedBadges,
      remainingSlots: MAX_BADGES - updatedBadges.length
    })

  } catch (error: any) {
    console.error('[Partner Badges DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete badge' },
      { status: 500 }
    )
  }
}

// PATCH - Reorder badges
export async function PATCH(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { badges } = body

    if (!Array.isArray(badges)) {
      return NextResponse.json(
        { success: false, error: 'Badges array required' },
        { status: 400 }
      )
    }

    // Validate badge structure
    for (const badge of badges) {
      if (!badge.name || !badge.imageUrl) {
        return NextResponse.json(
          { success: false, error: 'Invalid badge structure' },
          { status: 400 }
        )
      }
    }

    // Update partner record
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: { partnerBadges: badges }
    })

    return NextResponse.json({
      success: true,
      badges,
      remainingSlots: MAX_BADGES - badges.length
    })

  } catch (error: any) {
    console.error('[Partner Badges PATCH] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reorder badges' },
      { status: 500 }
    )
  }
}
