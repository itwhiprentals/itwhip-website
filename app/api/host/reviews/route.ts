// app/api/host/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get host ID from middleware headers
    const hostId = request.headers.get('x-host-id')
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID not found' },
        { status: 401 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const carId = searchParams.get('carId')
    const minRating = searchParams.get('minRating')
    const source = searchParams.get('source')

    // Build where clause
    const where: any = {
      hostId: hostId,
      isVisible: true // Only show visible reviews
    }

    if (carId) {
      where.carId = carId
    }

    if (minRating) {
      where.rating = {
        gte: parseInt(minRating)
      }
    }

    if (source && source !== 'all') {
      where.source = source
    }

    // Fetch reviews with related data
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
              take: 1,
              orderBy: { order: 'asc' },
              select: { url: true }
            }
          }
        },
        booking: {
          select: {
            guestName: true,
            guestEmail: true,
            startDate: true,
            endDate: true
          }
        },
        reviewerProfile: {
          select: {
            name: true,
            profilePhotoUrl: true,
            city: true,
            state: true,
            tripCount: true,
            memberSince: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Calculate rating statistics
    const totalReviews = reviews.length
    const avgRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0

    // Rating breakdown
    const ratingBreakdown = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    }

    // Average category ratings
    const avgCategoryRatings = {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      convenience: 0,
      value: 0
    }

    if (totalReviews > 0) {
      const validReviews = reviews.filter(r => 
        r.cleanliness && r.accuracy && r.communication && r.convenience && r.value
      )

      if (validReviews.length > 0) {
        avgCategoryRatings.cleanliness = validReviews.reduce((sum, r) => sum + (r.cleanliness || 0), 0) / validReviews.length
        avgCategoryRatings.accuracy = validReviews.reduce((sum, r) => sum + (r.accuracy || 0), 0) / validReviews.length
        avgCategoryRatings.communication = validReviews.reduce((sum, r) => sum + (r.communication || 0), 0) / validReviews.length
        avgCategoryRatings.convenience = validReviews.reduce((sum, r) => sum + (r.convenience || 0), 0) / validReviews.length
        avgCategoryRatings.value = validReviews.reduce((sum, r) => sum + (r.value || 0), 0) / validReviews.length
      }
    }

    // Get unique cars for filter
    const cars = await prisma.rentalCar.findMany({
      where: { hostId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true
      },
      orderBy: { year: 'desc' }
    })

    return NextResponse.json({
      success: true,
      reviews,
      stats: {
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingBreakdown,
        avgCategoryRatings
      },
      cars
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST endpoint for responding to reviews
export async function POST(request: NextRequest) {
  try {
    const hostId = request.headers.get('x-host-id')
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID not found' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reviewId, response } = body

    if (!reviewId || !response) {
      return NextResponse.json(
        { error: 'Review ID and response are required' },
        { status: 400 }
      )
    }

    // Verify review belongs to this host
    const review = await prisma.rentalReview.findFirst({
      where: {
        id: reviewId,
        hostId: hostId
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Update review with host response
    const updatedReview = await prisma.rentalReview.update({
      where: { id: reviewId },
      data: {
        hostResponse: response,
        hostRespondedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      review: updatedReview
    })

  } catch (error) {
    console.error('Error responding to review:', error)
    return NextResponse.json(
      { error: 'Failed to respond to review' },
      { status: 500 }
    )
  }
}