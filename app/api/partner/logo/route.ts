// app/api/partner/logo/route.ts
// Partner Logo Upload API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { uploadPublicImage, deletePublicImage, extractKeyFromUrl, generateKey } from '@/app/lib/storage/s3'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// Logo specs
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

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
        partnerLogo: true,
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

// GET - Get current logo
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
      logo: partner.partnerLogo
    })

  } catch (error: any) {
    console.error('[Partner Logo GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get logo' },
      { status: 500 }
    )
  }
}

// POST - Upload new logo
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
        { success: false, error: 'Invalid file type. Allowed: JPG, PNG, WebP, SVG' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum 2MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Delete old logo if exists
    if (partner.partnerLogo) {
      const oldKey = extractKeyFromUrl(partner.partnerLogo)
      if (oldKey) {
        try {
          await deletePublicImage(oldKey)
        } catch (e) {
          console.error('Failed to delete old logo:', e)
        }
      }
    }

    // Upload to S3 (public via CloudFront)
    const key = generateKey('host-logo', partner.id)
    const logoUrl = await uploadPublicImage(key, buffer, file.type)

    // Update partner record
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: { partnerLogo: logoUrl }
    })

    return NextResponse.json({
      success: true,
      logo: logoUrl
    })

  } catch (error: any) {
    console.error('[Partner Logo POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}

// DELETE - Remove logo
export async function DELETE(request: NextRequest) {
  try {
    const partner = await getAuthenticatedPartner()

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!partner.partnerLogo) {
      return NextResponse.json(
        { success: false, error: 'No logo to delete' },
        { status: 400 }
      )
    }

    // Delete from S3
    const logoKey = extractKeyFromUrl(partner.partnerLogo)
    if (logoKey) {
      try {
        await deletePublicImage(logoKey)
      } catch (e) {
        console.error('Failed to delete from S3:', e)
      }
    }

    // Update partner record
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: { partnerLogo: null }
    })

    return NextResponse.json({
      success: true,
      message: 'Logo deleted'
    })

  } catch (error: any) {
    console.error('[Partner Logo DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete logo' },
      { status: 500 }
    )
  }
}
