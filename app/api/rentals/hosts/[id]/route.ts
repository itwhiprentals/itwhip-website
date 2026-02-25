// app/api/rentals/hosts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      )
    }

    // Fetch host with related data (excluding reviews which we'll fetch separately)
    const host = await prisma.rentalHost.findUnique({
      where: { id },
      include: {
        cars: {
          where: { isActive: true },
          include: {
            photos: {
              where: { isHero: true },
              take: 1,
              orderBy: { order: 'asc' }
            },
            _count: {
              select: { bookings: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Limit to 10 cars for performance
        },
        _count: {
          select: {
            cars: { where: { isActive: true } }, // Only count active cars
            bookings: true
          }
        }
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Fetch ALL reviews for counting (only visible reviews for active cars)
    const allReviews = await prisma.rentalReview.findMany({
      where: {
        hostId: id,
        isVisible: true,
        car: {
          isActive: true
        }
      },
      select: { rating: true }
    })

    // Calculate actual counts based on visible reviews
    const actualReviewCount = allReviews.length
    const averageRating = actualReviewCount > 0
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / actualReviewCount
      : 0

    // Fetch detailed reviews for display (limited for performance)
    const hostReviews = await prisma.rentalReview.findMany({
      where: {
        hostId: id,
        isVisible: true,
        car: {
          isActive: true
        }
      },
      include: {
        reviewerProfile: {
          select: {
            name: true,
            profilePhotoUrl: true
          }
        },
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format the response data
    const responseData = {
      id: host.id,
      name: host.name,
      profilePhoto: host.partnerLogo || host.profilePhoto,
      city: host.city,
      state: host.state,
      memberSince: host.joinedAt,
      totalTrips: actualReviewCount, // FIXED: Use actual visible review count instead of stored totalTrips
      trips: actualReviewCount, // Add trips field for compatibility
      rating: {
        average: averageRating,
        count: actualReviewCount
      },
      responseTime: host.responseTime || 60, // Default to 1 hour
      responseRate: host.responseRate || 90, // Default to 90%
      badge: determineBadge(actualReviewCount, averageRating, host.responseRate || 90), // Use actual count for badge
      bio: host.bio,
      isVerified: host.isVerified,
      verificationLevel: host.verificationLevel,
      totalCars: host._count.cars,
      cars: host.cars.map(car => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        photoUrl: car.photos[0]?.url || null,
        dailyRate: parseFloat(car.dailyRate.toString()),
        rating: parseFloat(car.rating.toString()),
        totalTrips: car.totalTrips // Car's individual trips
      })),
      recentReviews: hostReviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        hostResponse: review.hostResponse,
        hostRespondedAt: review.hostRespondedAt,
        supportResponse: review.supportResponse,
        supportRespondedAt: review.supportRespondedAt,
        supportRespondedBy: review.supportRespondedBy,
        reviewer: {
          name: review.reviewerProfile?.name || 'Anonymous',
          profilePhotoUrl: review.reviewerProfile?.profilePhotoUrl || null
        },
        car: review.car ? {
          make: review.car.make,
          model: review.car.model,
          year: review.car.year
        } : null
      })),
      stats: {
        totalReviews: actualReviewCount, // FIXED: Use actual count
        averageRating: averageRating,
        responseRate: host.responseRate || 90,
        responseTime: host.responseTime || 60
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error fetching host data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to determine host badge
function determineBadge(
  totalTrips: number, 
  rating: number, 
  responseRate: number
): 'elite_host' | 'super_host' | 'all_star' | 'top_rated' | null {
  if (totalTrips >= 500 && rating >= 4.9 && responseRate >= 95) {
    return 'elite_host'
  }
  if (totalTrips >= 100 && rating >= 4.8 && responseRate >= 90) {
    return 'super_host'
  }
  if (totalTrips >= 50 && rating >= 4.7) {
    return 'all_star'
  }
  if (rating >= 4.9 && totalTrips >= 20) {
    return 'top_rated'
  }
  return null
}