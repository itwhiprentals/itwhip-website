// app/api/rideshare/partners/route.ts
// GET /api/rideshare/partners - List all active fleet partners with vehicles

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build vehicle filter
    const vehicleFilter: any = {
      isActive: true
    }

    if (city) {
      vehicleFilter.city = {
        contains: city,
        mode: 'insensitive'
      }
    }

    // Fetch all active partners with their vehicles and discounts
    const partners = await prisma.rentalHost.findMany({
      where: {
        hostType: { in: ['FLEET_PARTNER', 'PARTNER'] },
        approvalStatus: 'APPROVED',
        active: true
      },
      include: {
        cars: {
          where: vehicleFilter,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            dailyRate: true,
            weeklyRate: true,
            photos: true,
            city: true,
            state: true,
            instantBook: true,
            transmission: true,
            fuelType: true,
            seats: true,
            rating: true,
            totalTrips: true
          }
        },
        partnerDiscounts: {
          where: {
            isActive: true,
            AND: [
              { OR: [
                { expiresAt: null },
                { expiresAt: { gte: new Date() } }
              ] },
              { OR: [
                { startsAt: null },
                { startsAt: { lte: new Date() } }
              ] }
            ]
          },
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            percentage: true,
            expiresAt: true
          }
        }
      },
      orderBy: { partnerFleetSize: 'desc' },
      take: limit
    })

    // Transform data for response
    const formattedPartners = partners
      .filter(partner => partner.cars.length > 0) // Only show partners with vehicles
      .map(partner => ({
        id: partner.id,
        companyName: partner.partnerCompanyName || (partner as any).displayName || partner.name,
        slug: partner.partnerSlug,
        logo: partner.partnerLogo,
        bio: partner.partnerBio,
        fleetSize: partner.partnerFleetSize || partner.cars.length,
        avgRating: partner.partnerAvgRating || partner.rating || 0,
        totalReviews: (partner as any).totalReviews || 0,
        location: `${partner.city}, ${partner.state}`,
        vehicles: partner.cars.map((car: any) => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          dailyRate: car.dailyRate,
          weeklyRate: car.weeklyRate,
          photo: car.photos?.[0] || null,
          photos: car.photos || [],
          location: car.city && car.state ? `${car.city}, ${car.state}` : '',
          instantBook: car.instantBook,
          transmission: car.transmission,
          fuelType: car.fuelType,
          seats: car.seats,
          rating: car.rating || 0,
          trips: car.totalTrips || 0
        })),
        discounts: partner.partnerDiscounts.map(discount => ({
          id: discount.id,
          code: discount.code,
          title: discount.title,
          description: discount.description,
          percentage: discount.percentage,
          expiresAt: discount.expiresAt?.toISOString() || null
        })),
        hasActiveDiscount: partner.partnerDiscounts.length > 0
      }))

    // Also get ItWhip platform vehicles (managed hosts)
    const platformVehicles = await prisma.rentalCar.findMany({
      where: {
        isActive: true,
        host: {
          hostType: 'MANAGED',
          active: true,
          approvalStatus: 'APPROVED'
        },
        ...(city ? {
          city: {
            contains: city,
            mode: 'insensitive'
          }
        } : {})
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        dailyRate: true,
        weeklyRate: true,
        photos: true,
        city: true,
        state: true,
        instantBook: true,
        transmission: true,
        fuelType: true,
        seats: true,
        rating: true,
        totalTrips: true
      }
    })

    // Count total platform vehicles
    const platformVehicleCount = await prisma.rentalCar.count({
      where: {
        isActive: true,
        host: {
          hostType: 'MANAGED',
          active: true,
          approvalStatus: 'APPROVED'
        }
      }
    })

    return NextResponse.json({
      success: true,
      partners: formattedPartners,
      platformVehicles: {
        name: 'ItWhip Fleet',
        description: 'Quality rideshare-ready vehicles from the ItWhip platform',
        fleetSize: platformVehicleCount,
        vehicles: platformVehicles.map((car: any) => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          dailyRate: car.dailyRate,
          weeklyRate: car.weeklyRate,
          photo: car.photos?.[0] || null,
          photos: car.photos || [],
          location: car.city && car.state ? `${car.city}, ${car.state}` : '',
          instantBook: car.instantBook,
          transmission: car.transmission,
          fuelType: car.fuelType,
          seats: car.seats,
          rating: car.rating || 0,
          trips: car.totalTrips || 0
        }))
      },
      total: formattedPartners.length
    })

  } catch (error: any) {
    console.error('[Rideshare Partners] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}
