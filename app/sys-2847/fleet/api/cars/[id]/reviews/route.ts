// app/fleet/api/cars/[id]/reviews/route.ts
// Admin endpoint for managing car reviews

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Helper function to calculate realistic member since date
function calculateMemberSince(tripStartDate?: string | Date | null): Date {
  if (tripStartDate) {
    const tripStart = new Date(tripStartDate)
    
    // Create weighted distribution for realistic variety
    const rand = Math.random()
    let daysBeforeTrip: number
    
    if (rand < 0.35) {
      // 35% are newer members (2.3 - 6 months)
      daysBeforeTrip = Math.floor(Math.random() * 110) + 70  // 70-180 days
    } else if (rand < 0.65) {
      // 30% are medium tenure (6 - 12 months)  
      daysBeforeTrip = Math.floor(Math.random() * 185) + 180  // 180-365 days
    } else if (rand < 0.85) {
      // 20% are established (1 - 2 years)
      daysBeforeTrip = Math.floor(Math.random() * 365) + 365  // 365-730 days
    } else {
      // 15% are long-term (2 - 3.75 years)
      daysBeforeTrip = Math.floor(Math.random() * 639) + 730  // 730-1369 days
    }
    
    const memberSince = new Date(tripStart)
    memberSince.setDate(memberSince.getDate() - daysBeforeTrip)
    
    // Add day-of-month variation for extra realism
    const dayOfMonth = Math.floor(Math.random() * 28) + 1
    memberSince.setDate(dayOfMonth)
    
    return memberSince
  } else {
    // No trip date? Default to 3-18 months ago from today
    const monthsAgo = Math.floor(Math.random() * 16) + 3
    const memberSince = new Date()
    memberSince.setMonth(memberSince.getMonth() - monthsAgo)
    return memberSince
  }
}

// Helper function to sanitize review data for response
function sanitizeReview(review: any) {
  // Create a clean copy without internal fields
  const {
    source,           // Never expose
    bookingId,        // Internal reference
    renterId,         // Internal reference
    ...cleanReview
  } = review
  
  return cleanReview
}

// GET - Fetch all reviews for a car (includes hidden ones for admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params

    // Fetch all reviews with reviewer profiles
    const reviews = await prisma.rentalReview.findMany({
      where: { carId },
      include: {
        reviewerProfile: true,
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
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
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Debug logging
    console.log(`Reviews found for car ${carId}:`, reviews.length)
    if (reviews.length === 0) {
      console.log(`No reviews found for car ${carId}. This car may not have any reviews yet.`)
    }

    // Get unique reviewer profile IDs to calculate their actual counts
    const profileIds = [...new Set(reviews
      .filter(r => r.reviewerProfile?.id)
      .map(r => r.reviewerProfile!.id))]

    // Calculate actual review counts for each profile
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

    // Update reviews with actual profile counts
    const reviewsWithActualCounts = reviews.map(review => {
      if (review.reviewerProfile) {
        const actualCount = countsMap.get(review.reviewerProfile.id) || 0
        return {
          ...review,
          reviewerProfile: {
            ...review.reviewerProfile,
            reviewCount: actualCount,  // Override with actual count
            tripCount: actualCount      // For now, trips = reviews
          }
        }
      }
      return review
    })

    // Sanitize reviews to remove internal fields
    const sanitizedReviews = reviewsWithActualCounts.map(sanitizeReview)

    // Calculate public statistics only
    const stats = {
      total: reviews.length,
      average: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0,
      distribution: [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => r.rating === rating).length,
        percentage: reviews.length > 0 
          ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
          : 0
      }))
      // REMOVED: sources breakdown that exposed fake vs real reviews
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews: sanitizedReviews,
        stats
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

// POST - Create a new review (admin use only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const body = await request.json()

    // Verify car exists and get host info
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      include: { host: true }
    })

    if (!car) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      )
    }

    // Handle reviewer profile - create new or use existing
    let reviewerProfileId = body.reviewerProfileId

    if (!reviewerProfileId && body.createNewProfile) {
      // Calculate smart member since date
      const memberSince = body.memberSince 
        ? new Date(body.memberSince) 
        : calculateMemberSince(body.tripStartDate)

      // Create new reviewer profile
      const newProfile = await prisma.reviewerProfile.create({
        data: {
          name: body.reviewerName || 'Anonymous Guest',
          profilePhotoUrl: body.profilePhotoUrl,
          city: body.reviewerCity || car.city,
          state: body.reviewerState || car.state,
          memberSince: memberSince,
          tripCount: body.tripCount || 1,
          reviewCount: 1,
          isVerified: body.isVerified || false
        } as any
      })
      reviewerProfileId = newProfile.id
    } else if (!reviewerProfileId && body.reviewerName) {
      // Try to find existing profile by name
      const existingProfile = await prisma.reviewerProfile.findFirst({
        where: { name: body.reviewerName }
      })
      
      if (existingProfile) {
        reviewerProfileId = existingProfile.id
        // Note: We don't increment here anymore since we calculate dynamically
      } else {
        // Calculate smart member since date for basic profile too
        const memberSince = calculateMemberSince(body.tripStartDate)
        
        // Create basic profile
        const newProfile = await prisma.reviewerProfile.create({
          data: {
            name: body.reviewerName,
            city: car.city,
            state: car.state,
            memberSince: memberSince,
            tripCount: 1,
            reviewCount: 1
          } as any
        })
        reviewerProfileId = newProfile.id
      }
    }

    // Calculate review creation date
    let reviewCreatedAt: Date
    
    if (body.createdAt) {
      // If explicitly provided, use that date
      reviewCreatedAt = new Date(body.createdAt)
    } else if (body.tripEndDate) {
      // If trip end date exists, add 1-7 days randomly for realistic timing
      const tripEnd = new Date(body.tripEndDate)
      const daysAfterTrip = Math.floor(Math.random() * 7) + 1 // 1-7 days
      reviewCreatedAt = new Date(tripEnd)
      reviewCreatedAt.setDate(reviewCreatedAt.getDate() + daysAfterTrip)
      
      // Make sure it's not in the future
      const now = new Date()
      if (reviewCreatedAt > now) {
        reviewCreatedAt = now
      }
    } else {
      // Default to current date if no trip date provided
      reviewCreatedAt = new Date()
    }

    // Create the review with proper date
    // Note: We still store source internally for tracking, but never expose it
    const review = await prisma.rentalReview.create({
      data: {
        carId,
        hostId: car.hostId,
        reviewerProfileId,
        source: body.source || 'SEED', // Store internally but never expose
        rating: body.rating, // Rating is required
        cleanliness: body.cleanliness,
        accuracy: body.accuracy,
        communication: body.communication,
        convenience: body.convenience,
        value: body.value,
        title: body.title,
        comment: body.comment,
        tripStartDate: body.tripStartDate ? new Date(body.tripStartDate) : null,
        tripEndDate: body.tripEndDate ? new Date(body.tripEndDate) : null,
        isVisible: body.isVisible !== false,
        isPinned: body.isPinned || false,
        isVerified: body.isVerified || false,
        helpfulCount: body.helpfulCount || 0,
        createdAt: reviewCreatedAt, // Use calculated date
        hostResponse: body.hostResponse || null,
        hostRespondedAt: body.hostRespondedAt ? new Date(body.hostRespondedAt) : null,
        supportResponse: body.supportResponse || null,
        supportRespondedAt: body.supportRespondedAt ? new Date(body.supportRespondedAt) : null,
        supportRespondedBy: body.supportRespondedBy || null
      } as any,
      include: {
        reviewerProfile: true,
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        }
      }
    })

    // If review has a profile, calculate its actual current counts
    if (review.reviewerProfile) {
      const actualCount = await prisma.rentalReview.count({
        where: {
          reviewerProfileId: review.reviewerProfile.id,
          isVisible: true
        }
      })

      ;(review as any).reviewerProfile.reviewCount = actualCount
      ;(review as any).reviewerProfile.tripCount = actualCount
    }

    // ONLY update stats if the review is visible (represents a real completed trip)
    if (body.isVisible !== false) {
      // Calculate new average rating for all visible reviews
      const allReviews = await prisma.rentalReview.findMany({
        where: { carId, isVisible: true },
        select: { rating: true }
      })
      
      const newAverage = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

      // Count total visible reviews for this car (this is the actual trip count)
      const totalVisibleReviews = allReviews.length

      // Update both car and host stats in a transaction
      await prisma.$transaction([
        // Update car's rating and trip count - USE ABSOLUTE VALUE NOT INCREMENT
        prisma.rentalCar.update({
          where: { id: carId },
          data: { 
            rating: newAverage,
            totalTrips: totalVisibleReviews  // Set to actual count, not increment
          }
        }),
        
        // Update host's trip count - recalculate based on all their cars
        prisma.rentalHost.update({
          where: { id: car.hostId },
          data: { 
            totalTrips: {
              increment: 1  // Host can still increment since it's probably not null
            }
          }
        })
      ])

      console.log(`✅ Visible review created - Updated car ${carId}:`)
      console.log(`   - New rating: ${newAverage.toFixed(1)}`)
      console.log(`   - Total trips set to: ${totalVisibleReviews}`)
      console.log(`   - Host ${car.hostId} trips incremented`)
    } else {
      console.log(`⚠️ Hidden review created - No stats updated for car ${carId}`)
      console.log(`   - Hidden/draft reviews don't count as completed trips`)
    }

    // Sanitize the response to remove internal fields
    const sanitizedReview = sanitizeReview(review)

    return NextResponse.json({
      success: true,
      data: sanitizedReview,
      message: `Review created successfully${body.isVisible === false ? ' (hidden - no trip count)' : ''}`
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}