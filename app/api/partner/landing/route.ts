// app/api/partner/landing/route.ts
// Partner Landing Page Configuration API

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
      where: { id: hostId },
      include: {
        partnerFaqs: {
          orderBy: { order: 'asc' }
        }
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

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Map database fields to frontend expected format
    return NextResponse.json({
      success: true,
      data: {
        slug: partner.partnerSlug || '',
        companyName: partner.partnerCompanyName || '',
        logo: partner.partnerLogo || null,
        heroImage: partner.partnerHeroImage || null,
        headline: partner.partnerHeroTitle || '',
        subheadline: partner.partnerHeroSubtitle || '',
        bio: partner.partnerBio || '',
        supportEmail: partner.partnerSupportEmail || '',
        supportPhone: partner.partnerSupportPhone || '',
        primaryColor: partner.partnerPrimaryColor || '#f97316',
        faqs: partner.partnerFaqs.map(faq => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer
        })),
        isPublished: partner.approvalStatus === 'APPROVED',
        // Social Media & Website
        website: partner.partnerWebsite || '',
        instagram: partner.partnerInstagram || '',
        facebook: partner.partnerFacebook || '',
        twitter: partner.partnerTwitter || '',
        linkedin: partner.partnerLinkedIn || '',
        tiktok: partner.partnerTikTok || '',
        youtube: partner.partnerYouTube || '',
        // Visibility Settings
        showEmail: partner.partnerShowEmail ?? true,
        showPhone: partner.partnerShowPhone ?? true,
        showWebsite: partner.partnerShowWebsite ?? true
      }
    })
  } catch (error) {
    console.error('[Partner Landing] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch landing page' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Update partner landing page fields
    await prisma.rentalHost.update({
      where: { id: partner.id },
      data: {
        partnerHeroTitle: body.headline,
        partnerHeroSubtitle: body.subheadline,
        partnerHeroImage: body.heroImage,
        partnerLogo: body.logo,
        partnerBio: body.bio,
        partnerSupportEmail: body.supportEmail,
        partnerSupportPhone: body.supportPhone,
        partnerPrimaryColor: body.primaryColor,
        // Social Media & Website
        partnerWebsite: body.website || null,
        partnerInstagram: body.instagram || null,
        partnerFacebook: body.facebook || null,
        partnerTwitter: body.twitter || null,
        partnerLinkedIn: body.linkedin || null,
        partnerTikTok: body.tiktok || null,
        partnerYouTube: body.youtube || null,
        // Visibility Settings
        partnerShowEmail: body.showEmail ?? true,
        partnerShowPhone: body.showPhone ?? true,
        partnerShowWebsite: body.showWebsite ?? true
      }
    })

    // Handle FAQs - delete all and recreate
    if (body.faqs && Array.isArray(body.faqs)) {
      // Delete existing FAQs
      await prisma.partnerFAQ.deleteMany({
        where: { hostId: partner.id }
      })

      // Create new FAQs
      if (body.faqs.length > 0) {
        await prisma.partnerFAQ.createMany({
          data: body.faqs.map((faq: { question: string; answer: string }, index: number) => ({
            hostId: partner.id,
            question: faq.question,
            answer: faq.answer,
            order: index
          }))
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Partner Landing] Error updating:', error)
    return NextResponse.json({ error: 'Failed to update landing page' }, { status: 500 })
  }
}
