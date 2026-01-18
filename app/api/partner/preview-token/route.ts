// app/api/partner/preview-token/route.ts
// Generate a preview token for hosts to preview their landing page before publishing

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

// Preview tokens expire after 1 hour
const PREVIEW_TOKEN_EXPIRY = '1h'

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        partnerSlug: true,
        partnerCompanyName: true,
        name: true,
        approvalStatus: true,
        active: true,
        enableRideshare: true,
        enableRentals: true
      }
    })

    return partner
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!partner.partnerSlug) {
      return NextResponse.json(
        { error: 'No slug configured. Please set a slug in the Content tab first.' },
        { status: 400 }
      )
    }

    // Generate a preview token with limited scope
    const previewToken = await new SignJWT({
      type: 'preview',
      hostId: partner.id,
      slug: partner.partnerSlug,
      editMode: true, // Always enable edit mode in preview
      iat: Math.floor(Date.now() / 1000)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(PREVIEW_TOKEN_EXPIRY)
      .sign(JWT_SECRET)

    return NextResponse.json({
      success: true,
      token: previewToken,
      slug: partner.partnerSlug,
      previewUrl: `/rideshare/${partner.partnerSlug}?preview_token=${previewToken}`,
      expiresIn: PREVIEW_TOKEN_EXPIRY
    })
  } catch (error) {
    console.error('[Preview Token] Error:', error)
    return NextResponse.json({ error: 'Failed to generate preview token' }, { status: 500 })
  }
}

// Validate a preview token (used by the landing page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)

      // Verify it's a preview token
      if (payload.type !== 'preview') {
        return NextResponse.json({ valid: false, error: 'Invalid token type' })
      }

      // Check if the host and slug still exist
      const partner = await prisma.rentalHost.findFirst({
        where: {
          id: payload.hostId as string,
          partnerSlug: payload.slug as string
        },
        select: {
          id: true,
          partnerSlug: true,
          partnerCompanyName: true,
          name: true
        }
      })

      if (!partner) {
        return NextResponse.json({ valid: false, error: 'Partner not found' })
      }

      return NextResponse.json({
        valid: true,
        hostId: partner.id,
        slug: partner.partnerSlug,
        companyName: partner.partnerCompanyName || partner.name,
        editMode: payload.editMode === true
      })
    } catch (jwtError) {
      // Token expired or invalid
      return NextResponse.json({ valid: false, error: 'Token expired or invalid' })
    }
  } catch (error) {
    console.error('[Preview Token Validation] Error:', error)
    return NextResponse.json({ error: 'Failed to validate token' }, { status: 500 })
  }
}
