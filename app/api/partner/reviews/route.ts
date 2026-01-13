// app/api/partner/reviews/route.ts
// Partner Reviews Management API

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  // Accept both partner_token AND hostAccessToken for unified portal
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
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
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all, responded, pending
    const vehicleId = searchParams.get('vehicleId')
    const rating = searchParams.get('rating') // 1-5 or 'all'

    // Build where clause
    const where: any = {
      hostId: partner.id,
      isVisible: true
    }

    if (vehicleId) {
      where.carId = vehicleId
    }

    if (filter === 'responded') {
      where.hostResponse = { not: null }
    } else if (filter === 'pending') {
      where.hostResponse = null
    }

    if (rating && rating !== 'all') {
      where.rating = parseInt(rating)
    }

    // Get reviews with relations
    const reviews = await prisma.rentalReview.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            photos: {
              select: {
                url: true
              },
              orderBy: [{ isHero: 'desc' }, { order: 'asc' }],
              take: 1
            }
          }
        },
        reviewerProfile: {
          select: {
            id: true,
            name: true,
            profilePhotoUrl: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get partner's vehicles for filter dropdown
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true, make: true, model: true, year: true }
    })

    // Calculate stats
    const allReviews = await prisma.rentalReview.findMany({
      where: { hostId: partner.id, isVisible: true },
      select: { rating: true, hostResponse: true }
    })

    const totalReviews = allReviews.length
    const avgRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0
    const pendingResponses = allReviews.filter(r => !r.hostResponse).length
    const respondedCount = allReviews.filter(r => r.hostResponse).length

    // Calculate rating distribution
    const distribution = [5, 4, 3, 2, 1].map(star => {
      const count = allReviews.filter(r => r.rating === star).length
      return {
        rating: star,
        count,
        percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
      }
    })

    // Format reviews
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      cleanliness: review.cleanliness,
      accuracy: review.accuracy,
      communication: review.communication,
      convenience: review.convenience,
      value: review.value,
      hostResponse: review.hostResponse,
      hostRespondedAt: review.hostRespondedAt?.toISOString() || null,
      tripStartDate: review.tripStartDate?.toISOString() || null,
      tripEndDate: review.tripEndDate?.toISOString() || null,
      createdAt: review.createdAt.toISOString(),
      isVerified: review.isVerified,
      isPinned: review.isPinned,
      helpfulCount: review.helpfulCount,
      vehicleId: review.carId,
      vehicleName: review.car
        ? `${review.car.year} ${review.car.make} ${review.car.model}`
        : 'Unknown Vehicle',
      vehiclePhoto: review.car?.photos?.[0]?.url || null,
      reviewer: review.reviewerProfile ? {
        id: review.reviewerProfile.id,
        name: review.reviewerProfile.name,
        photo: review.reviewerProfile.profilePhotoUrl,
        location: review.reviewerProfile.city && review.reviewerProfile.state
          ? `${review.reviewerProfile.city}, ${review.reviewerProfile.state}`
          : null
      } : {
        id: null,
        name: 'Guest',
        photo: null,
        location: null
      }
    }))

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      stats: {
        total: totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        pendingResponses,
        respondedCount,
        responseRate: totalReviews > 0 ? Math.round((respondedCount / totalReviews) * 100) : 0,
        distribution
      },
      vehicles: vehicles.map(v => ({
        id: v.id,
        name: `${v.year} ${v.make} ${v.model}`
      }))
    })

  } catch (error) {
    console.error('[Partner Reviews] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
