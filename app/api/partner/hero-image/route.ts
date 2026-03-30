// app/api/partner/hero-image/route.ts
// Partner Hero Image Upload API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { uploadPublicImage, deletePublicImage, extractKeyFromUrl, generateKey } from '@/app/lib/storage/s3'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// Hero image specs
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function getAuthenticatedPartner() {
  const cookieStore = await cookies()
  // Accept both partner_token AND hostAccessToken for unified portal
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) {
    return null
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const payload = verified.payload
    const hostId = payload.hostId as string

    if (!hostId) {
      return null
    }

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        partnerCompanyName: true,
        partnerSlug: true,
        partnerHeroImage: true,
        approvalStatus: true,
        hostType: true
      }
    })

    // Allow all host types since we've unified the portals
    if (!partner) {
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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Delete old hero image if exists
    if (partner.partnerHeroImage) {
      const oldKey = extractKeyFromUrl(partner.partnerHeroImage)
      if (oldKey) {
        try {
          await deletePublicImage(oldKey)
        } catch (e) {
          console.error('Failed to delete old hero image:', e)
        }
      }
    }

    // Upload to S3 (public via CloudFront)
    const key = generateKey('host-hero', partner.id)
    const heroUrl = await uploadPublicImage(key, buffer, file.type)

    // Update partner record
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: { partnerHeroImage: heroUrl }
    })

    return NextResponse.json({
      success: true,
      heroImage: heroUrl
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

    // Delete from S3
    const heroKey = extractKeyFromUrl(partner.partnerHeroImage)
    if (heroKey) {
      try {
        await deletePublicImage(heroKey)
      } catch (e) {
        console.error('Failed to delete from S3:', e)
      }
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
