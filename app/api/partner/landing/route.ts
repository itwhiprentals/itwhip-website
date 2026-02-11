// app/api/partner/landing/route.ts
// Partner Landing Page Configuration API

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

async function getPartnerFromToken(request?: NextRequest) {
  // Check Authorization header first (mobile app), then fall back to cookies
  let token: string | undefined
  const authHeader = request?.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieStore = await cookies()
    // Accept both partner_token AND hostAccessToken for unified portal
    token = cookieStore.get('partner_token')?.value ||
                  cookieStore.get('hostAccessToken')?.value
  }

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

    // Allow all host types since we've unified the portals
    if (!partner) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if partner has at least one active car
    const carCount = await prisma.rentalCar.count({
      where: {
        hostId: partner.id,
        isActive: true
      }
    })

    // Parse policies JSON
    const policies = partner.partnerPolicies as {
      refundPolicy?: string
      cancellationPolicy?: string
      bookingRequirements?: string
      additionalTerms?: string
    } | null

    // Publishing requirements checklist
    const hasApproval = partner.approvalStatus === 'APPROVED'
    const hasValidSlug = !!partner.partnerSlug && partner.partnerSlug !== 'your-company-slug'
    const hasVehicles = carCount > 0
    const hasService = partner.enableRideshare || partner.enableRentals
    const canPublish = hasApproval && hasValidSlug && hasVehicles && hasService

    // Map database fields to frontend expected format
    // Fall back to profilePhoto if partnerLogo is not set (unified portal support)
    return NextResponse.json({
      success: true,
      data: {
        slug: partner.partnerSlug || '',
        companyName: partner.partnerCompanyName || '',
        logo: partner.partnerLogo || partner.profilePhoto || null,
        heroImage: partner.partnerHeroImage || null,
        heroImageFilter: partner.partnerHeroImageFilter ?? false,
        headline: partner.partnerHeroTitle || '',
        subheadline: partner.partnerHeroSubtitle || '',
        bio: partner.partnerBio || '',
        supportEmail: partner.partnerSupportEmail || '',
        supportPhone: partner.partnerSupportPhone || '',
        primaryColor: partner.partnerPrimaryColor || '#f97316',
        faqs: partner.partnerFaqs.map((faq: any) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer
        })),
        // Only published if ALL requirements are met
        isPublished: canPublish,
        // Publishing checklist for frontend
        publishingRequirements: {
          hasApproval,
          hasValidSlug,
          hasVehicles,
          hasService,
          canPublish,
          vehicleCount: carCount
        },
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
        showWebsite: partner.partnerShowWebsite ?? true,
        // Policies
        policies: {
          refundPolicy: policies?.refundPolicy || '',
          cancellationPolicy: policies?.cancellationPolicy || '',
          bookingRequirements: policies?.bookingRequirements || '',
          additionalTerms: policies?.additionalTerms || ''
        },
        // Service Settings
        enableRideshare: partner.enableRideshare ?? true,
        enableRentals: partner.enableRentals ?? false,
        enableSales: partner.enableSales ?? false,
        enableLeasing: partner.enableLeasing ?? false,
        enableRentToOwn: partner.enableRentToOwn ?? false
      }
    })
  } catch (error) {
    console.error('[Partner Landing] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch landing page' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken(request)

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Build policies object (only include if provided)
    const policiesData = body.policies ? {
      refundPolicy: body.policies.refundPolicy || '',
      cancellationPolicy: body.policies.cancellationPolicy || '',
      bookingRequirements: body.policies.bookingRequirements || '',
      additionalTerms: body.policies.additionalTerms || ''
    } : undefined

    // Build update data - only include fields that were explicitly sent
    // This prevents partial saves from overwriting unrelated fields
    const updateData: Record<string, any> = {}

    // Validate slug if provided
    if (body.slug !== undefined) {
      const slug = body.slug.trim()

      // Prevent placeholder value
      if (slug === 'your-company-slug' || slug === 'your-company-name') {
        return NextResponse.json(
          { error: 'Please enter your actual company slug, not the placeholder text.' },
          { status: 400 }
        )
      }

      // Format validation
      const slugRegex = /^[a-z0-9-]+$/
      if (!slugRegex.test(slug)) {
        return NextResponse.json(
          { error: 'Invalid slug format. Only lowercase letters, numbers, and hyphens allowed.' },
          { status: 400 }
        )
      }

      // Minimum length
      if (slug.length < 3) {
        return NextResponse.json(
          { error: 'Slug must be at least 3 characters long.' },
          { status: 400 }
        )
      }

      // Reserved slugs
      const reservedSlugs = [
        'admin', 'api', 'app', 'auth', 'blog', 'contact', 'dashboard',
        'docs', 'fleet', 'help', 'host', 'login', 'logout', 'partner',
        'profile', 'register', 'settings', 'signup', 'support', 'terms',
        'privacy', 'about', 'home', 'search', 'cars', 'vehicles', 'bookings',
        'earnings', 'messages', 'notifications', 'itwhip', 'www', 'mail'
      ]

      if (reservedSlugs.includes(slug)) {
        return NextResponse.json(
          { error: 'This slug is reserved and cannot be used.' },
          { status: 400 }
        )
      }

      // Check uniqueness
      const existingSlug = await prisma.rentalHost.findFirst({
        where: {
          partnerSlug: slug,
          id: { not: partner.id }
        }
      })

      if (existingSlug) {
        return NextResponse.json(
          { error: 'This slug is already taken.' },
          { status: 400 }
        )
      }

      updateData.partnerSlug = slug
    }

    // Basic fields - only update if provided
    if (body.headline !== undefined) updateData.partnerHeroTitle = body.headline
    if (body.subheadline !== undefined) updateData.partnerHeroSubtitle = body.subheadline
    if (body.heroImage !== undefined) updateData.partnerHeroImage = body.heroImage
    if (body.heroImageFilter !== undefined) updateData.partnerHeroImageFilter = body.heroImageFilter
    if (body.logo !== undefined) updateData.partnerLogo = body.logo
    if (body.bio !== undefined) updateData.partnerBio = body.bio
    if (body.supportEmail !== undefined) updateData.partnerSupportEmail = body.supportEmail
    if (body.supportPhone !== undefined) updateData.partnerSupportPhone = body.supportPhone
    if (body.primaryColor !== undefined) updateData.partnerPrimaryColor = body.primaryColor

    // Social Media & Website - only update if provided
    if (body.website !== undefined) updateData.partnerWebsite = body.website || null
    if (body.instagram !== undefined) updateData.partnerInstagram = body.instagram || null
    if (body.facebook !== undefined) updateData.partnerFacebook = body.facebook || null
    if (body.twitter !== undefined) updateData.partnerTwitter = body.twitter || null
    if (body.linkedin !== undefined) updateData.partnerLinkedIn = body.linkedin || null
    if (body.tiktok !== undefined) updateData.partnerTikTok = body.tiktok || null
    if (body.youtube !== undefined) updateData.partnerYouTube = body.youtube || null

    // Visibility Settings - only update if provided
    if (body.showEmail !== undefined) updateData.partnerShowEmail = body.showEmail
    if (body.showPhone !== undefined) updateData.partnerShowPhone = body.showPhone
    if (body.showWebsite !== undefined) updateData.partnerShowWebsite = body.showWebsite

    // Policies - only update if provided
    if (policiesData) updateData.partnerPolicies = policiesData

    // Service Settings - only update if provided
    if (body.enableRideshare !== undefined) updateData.enableRideshare = body.enableRideshare
    if (body.enableRentals !== undefined) updateData.enableRentals = body.enableRentals
    if (body.enableSales !== undefined) updateData.enableSales = body.enableSales
    if (body.enableLeasing !== undefined) updateData.enableLeasing = body.enableLeasing
    if (body.enableRentToOwn !== undefined) updateData.enableRentToOwn = body.enableRentToOwn

    // Only update if there's something to update
    if (Object.keys(updateData).length > 0) {
      await prisma.rentalHost.update({
        where: { id: partner.id },
        data: updateData
      })
    }

    // Handle FAQs - delete all and recreate
    if (body.faqs && Array.isArray(body.faqs)) {
      // Delete existing FAQs
      await prisma.partner_faqs.deleteMany({
        where: { hostId: partner.id }
      })

      // Create new FAQs
      if (body.faqs.length > 0) {
        await prisma.partner_faqs.createMany({
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
