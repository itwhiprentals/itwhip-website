// app/api/rideshare/[partnerSlug]/route.ts
// GET /api/rideshare/[partnerSlug] - Get single partner with all vehicles

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerSlug: string }> }
) {
  try {
    const { partnerSlug } = await params

    // Fetch partner by slug
    const partner = await prisma.rentalHost.findFirst({
      where: {
        partnerSlug: partnerSlug,
        hostType: { in: ['FLEET_PARTNER', 'PARTNER'] },
        approvalStatus: 'APPROVED',
        active: true
      },
      include: {
        cars: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            dailyRate: true,
            weeklyRate: true,
            monthlyRate: true,
            photos: true,
            city: true,
            state: true,
            instantBook: true,
            transmission: true,
            fuelType: true,
            seats: true,
            description: true,
            features: true,
            rating: true,
            totalTrips: true
          }
        },
        partnerDiscounts: {
          where: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: new Date() } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            percentage: true,
            expiresAt: true,
            maxUses: true,
            usedCount: true
          }
        },
        partnerFaqs: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            answer: true
          }
        }
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Get unique operating cities from vehicles
    const operatingCities = [...new Set(
      partner.cars
        .map((car: any) => car.city ? `${car.city}, ${car.state}` : null)
        .filter(Boolean)
    )]

    // Calculate stats
    const totalVehicles = partner.cars.length
    const avgRating = (partner as any).averageRating ||
      (partner.cars.reduce((sum: number, car: any) => sum + (car.rating || 0), 0) / totalVehicles) || 0
    const totalTrips = partner.cars.reduce((sum: number, car: any) => sum + (car.totalTrips || 0), 0)
    const totalReviews = (partner as any).totalReviews || 0

    // Get price range
    const prices = partner.cars.map((car: any) => car.dailyRate).filter((p: number) => p > 0)
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

    // Format response
    const formattedPartner = {
      id: partner.id,
      companyName: partner.partnerCompanyName || (partner as any).displayName || partner.name,
      slug: partner.partnerSlug,
      logo: partner.partnerLogo,
      bio: partner.partnerBio,
      supportEmail: partner.partnerSupportEmail || partner.email,
      supportPhone: partner.partnerSupportPhone || partner.phone,
      location: (partner as any).location || `${partner.city}, ${partner.state}`,

      // Stats
      stats: {
        fleetSize: totalVehicles,
        avgRating: Math.round(avgRating * 10) / 10,
        totalTrips,
        totalReviews,
        operatingCities: operatingCities.length,
        priceRange: {
          min: minPrice,
          max: maxPrice
        }
      },

      // Vehicles
      vehicles: partner.cars.map((car: any) => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        dailyRate: car.dailyRate,
        weeklyRate: car.weeklyRate,
        monthlyRate: car.monthlyRate,
        photo: car.photos?.[0] || null,
        photos: car.photos || [],
        location: car.city && car.state ? `${car.city}, ${car.state}` : '',
        instantBook: car.instantBook,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        description: car.description,
        features: car.features || [],
        rating: car.rating || 0,
        trips: car.totalTrips || 0,
        reviews: 0
      })),

      // Discounts
      discounts: partner.partnerDiscounts.map(discount => ({
        id: discount.id,
        code: discount.code,
        title: discount.title,
        description: discount.description,
        percentage: discount.percentage,
        expiresAt: discount.expiresAt?.toISOString() || null,
        remaining: discount.maxUses ? discount.maxUses - discount.usedCount : null
      })),

      // FAQs
      faqs: partner.partnerFaqs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer
      })),

      // Operating areas
      operatingCities,

      // For SEO
      seo: {
        title: `${partner.partnerCompanyName || partner.name} - Rideshare Rentals | ItWhip`,
        description: partner.partnerBio || `Rent rideshare-ready vehicles from ${partner.partnerCompanyName || partner.name}. ${totalVehicles} vehicles available starting at $${minPrice}/day.`,
        image: partner.partnerLogo || partner.cars[0]?.photos?.[0] || null
      }
    }

    return NextResponse.json({
      success: true,
      partner: formattedPartner
    })

  } catch (error: any) {
    console.error('[Rideshare Partner] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    )
  }
}
