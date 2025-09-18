// app/api/rentals/cars/[carId]/reviews/route.ts
// Public endpoint for fetching visible reviews (guest-facing)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Helper function to format dates to be less precise for display
function formatDateForDisplay(date: Date | string | null): string | null {
  if (!date) return null
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

// Helper function to get relative time
function getRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 7) return 'This week'
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`
}

// GET - Fetch visible reviews for a car
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ carId: string }> }
) {
  try {
    const { carId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '999999')
    const skip = (page - 1) * limit

    // Get car details - SELECT only public fields
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        host: {
          select: {
            name: true,
            profilePhoto: true,
            rating: true
            // Removed responseTime and totalTrips as discussed
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      )
    }

    // Fetch only visible reviews with SELECT instead of INCLUDE
    const [reviews, totalCount] = await Promise.all([
      prisma.rentalReview.findMany({
        where: {
          carId,
          isVisible: true
        },
        select: {
          // Review fields
          rating: true,
          title: true,
          comment: true,
          cleanliness: true,
          accuracy: true,
          communication: true,
          convenience: true,
          value: true,
          helpfulCount: true,
          isVerified: true,
          isPinned: true,
          hostResponse: true,
          hostRespondedAt: true,
          supportResponse: true,
          supportRespondedAt: true,
          supportRespondedBy: true,
          tripStartDate: true,
          tripEndDate: true,
          createdAt: true,
          
          // Reviewer profile - SELECT specific fields only
          reviewerProfile: {
            select: {
              id: true, // Keep real ID for profile modal functionality
              name: true,
              profilePhotoUrl: true,
              city: true,
              state: true,
              memberSince: true,
              tripCount: true,
              reviewCount: true,
              isVerified: true
            }
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { helpfulCount: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.rentalReview.count({
        where: {
          carId,
          isVisible: true
        }
      })
    ])

    // Calculate actual counts for each unique reviewer profile
    const profileIds = [...new Set(reviews
      .filter(r => r.reviewerProfile?.id)
      .map(r => r.reviewerProfile!.id))]

    // Get actual review counts for each profile
    const profileCounts = await Promise.all(
      profileIds.map(async (profileId) => {
        const count = await prisma.rentalReview.count({
          where: {
            reviewerProfileId: profileId,
            isVisible: true  // Only count visible reviews
          }
        })
        return { profileId, count }
      })
    )

    // Create a map for quick lookup
    const countsMap = new Map(profileCounts.map(p => [p.profileId, p.count]))

    // Calculate statistics from all visible reviews
    const allVisibleReviews = await prisma.rentalReview.findMany({
      where: {
        carId,
        isVisible: true
      },
      select: {
        rating: true,
        cleanliness: true,
        accuracy: true,
        communication: true,
        convenience: true,
        value: true
      }
    })

    // Calculate average ratings
    const calculateAverage = (field: keyof typeof allVisibleReviews[0]) => {
      const values = allVisibleReviews
        .map(r => r[field])
        .filter(v => v !== null) as number[]
      return values.length > 0 
        ? parseFloat((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1))
        : 0
    }

    const stats = {
      total: totalCount,
      averageRating: calculateAverage('rating'),
      averages: {
        cleanliness: calculateAverage('cleanliness'),
        accuracy: calculateAverage('accuracy'),
        communication: calculateAverage('communication'),
        convenience: calculateAverage('convenience'),
        value: calculateAverage('value')
      },
      distribution: [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: allVisibleReviews.filter(r => r.rating === rating).length,
        percentage: totalCount > 0 
          ? parseFloat(((allVisibleReviews.filter(r => r.rating === rating).length / totalCount) * 100).toFixed(1))
          : 0
      }))
    }

    // Format reviews for display with actual profile counts
    const formattedReviews = reviews.map((review, index) => {
      // Get actual count for this profile if it exists
      const actualCount = review.reviewerProfile?.id 
        ? countsMap.get(review.reviewerProfile.id) || 0 
        : 0

      return {
        // Use index-based ID for React keys
        id: `review-${carId.substring(0, 8)}-${index}`,
        
        // Review content
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        
        // Subcategory ratings (if provided)
        ...(review.cleanliness && {
          ratings: {
            cleanliness: review.cleanliness,
            accuracy: review.accuracy,
            communication: review.communication,
            convenience: review.convenience,
            value: review.value
          }
        }),
        
        // Engagement metrics
        helpfulCount: review.helpfulCount,
        isVerified: review.isVerified,
        isPinned: review.isPinned,
        
        // Host/Support responses - keep dates for display
        ...(review.hostResponse && {
          hostResponse: review.hostResponse,
          hostRespondedAt: review.hostRespondedAt
        }),
        
        ...(review.supportResponse && {
          supportResponse: review.supportResponse,
          supportRespondedAt: review.supportRespondedAt,
          supportRespondedBy: review.supportRespondedBy || 'ItWhip Support'
        }),
        
        // Trip dates
        tripStartDate: review.tripStartDate,
        tripEndDate: review.tripEndDate,
        
        // Review date
        createdAt: review.createdAt,
        
        // Reviewer info - with ACTUAL counts
        reviewer: review.reviewerProfile ? {
          id: review.reviewerProfile.id, // Real ID for API lookup
          name: review.reviewerProfile.name,
          profilePhotoUrl: review.reviewerProfile.profilePhotoUrl,
          city: review.reviewerProfile.city,
          state: review.reviewerProfile.state,
          memberSince: review.reviewerProfile.memberSince,
          tripCount: actualCount,      // CHANGED: Use actual count instead of static value
          reviewCount: actualCount,    // CHANGED: Use actual count instead of static value
          isVerified: review.reviewerProfile.isVerified
        } : {
          id: null, // Guest has no profile
          name: 'Guest',
          profilePhotoUrl: null,
          city: 'Phoenix',
          state: 'AZ',
          memberSince: review.createdAt,
          tripCount: 1,
          reviewCount: 1,
          isVerified: false
        },
        
        // Add host data
        host: car.host
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        car: {
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          host: car.host
        },
        reviews: formattedReviews,
        stats,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}