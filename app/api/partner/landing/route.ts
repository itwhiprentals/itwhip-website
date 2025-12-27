// app/api/partner/landing/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('partner_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      landing: {
        slug: partner.partnerSlug || '',
        heroTitle: partner.partnerHeroTitle || `Rent with ${partner.partnerCompanyName || 'Us'}`,
        heroSubtitle: partner.partnerHeroSubtitle || 'Premium vehicle rentals for rideshare drivers',
        heroImage: partner.partnerHeroImage || '',
        aboutTitle: 'About Us',
        aboutText: partner.partnerAboutText || '',
        primaryColor: partner.partnerPrimaryColor || '#f97316',
        features: [],
        faqs: []
      }
    })
  } catch (error) {
    console.error('[Partner Landing] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch landing page' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('partner_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string
    const body = await request.json()

    await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        partnerHeroTitle: body.heroTitle,
        partnerHeroSubtitle: body.heroSubtitle,
        partnerHeroImage: body.heroImage,
        partnerAboutText: body.aboutText,
        partnerPrimaryColor: body.primaryColor
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Partner Landing] Error:', error)
    return NextResponse.json({ error: 'Failed to update landing page' }, { status: 500 })
  }
}
