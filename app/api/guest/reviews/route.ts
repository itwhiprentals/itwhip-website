// app/api/guest/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

// GET: Fetch guest reviews
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id

    // Find profile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      }
    })

    // Get all reviews for this guest - simplified approach
    const reviews = await prisma.rentalReview.findMany({
      where: {
        OR: [
          // Reviews where this user is the reviewer
          ...(profile ? [{ reviewerProfileId: profile.id }] : []),
          
          // Reviews linked by renter ID
          ...(userId ? [{ renterId: userId }] : []),
          
          // Reviews through bookings
          ...(userEmail ? [{
            booking: {
              guestEmail: userEmail
            }
          }] : []),
          
          // Reviews where the booking belongs to this user
          ...(userId ? [{
            booking: {
              renterId: userId
            }
          }] : [])
        ]
      },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        },
        booking: {
          select: {
            id: true,
            bookingCode: true,
            startDate: true,
            endDate: true,
            renterId: true,
            guestEmail: true
          }
        },
        host: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group reviews by booking to get both sides of the conversation
    const bookingReviewMap = new Map()
    
    reviews.forEach(review => {
      const bookingId = review.bookingId || review.booking?.id
      const bookingCode = review.booking?.bookingCode || 'N/A'
      
      if (!bookingReviewMap.has(bookingCode)) {
        bookingReviewMap.set(bookingCode, {
          bookingCode,
          bookingId: bookingId, // Store the booking ID
          booking: review.booking,
          car: review.car,
          host: review.host,
          guestReview: null,
          hostReview: null
        })
      }
      
      const entry = bookingReviewMap.get(bookingCode)
      
      // Determine if this is a review BY the guest or OF the guest
      // If reviewerProfileId matches our profile, it's the guest's review
      // Otherwise, it's the host's review of the guest
      if (review.reviewerProfileId === profile?.id || 
          review.renterId === userId || 
          review.source === 'GUEST') {
        entry.guestReview = review
      } else {
        entry.hostReview = review
      }
    })

    // Format for response - creating unified review objects
    const formattedReviews = Array.from(bookingReviewMap.values())
      .filter(entry => entry.hostReview || entry.guestReview) // Must have at least one review
      .map(({ bookingCode, bookingId, booking, car, host, guestReview, hostReview }) => ({
        id: hostReview?.id || guestReview?.id || '',
        bookingCode,
        bookingId: bookingId || booking?.id || '', // ✅ Include booking ID for navigation
        
        // Host's review of the guest (main rating shown)
        rating: hostReview?.rating || 0,
        comment: hostReview?.comment || '',
        
        // Guest's review of the trip (if exists)
        guestReviewComment: guestReview?.comment || null,
        guestReviewRating: guestReview?.rating || null,
        
        // Host's response to guest's review
        hostResponse: guestReview?.hostResponse || null,
        hostRespondedAt: guestReview?.hostRespondedAt || null,
        
        // Support responses
        supportResponse: guestReview?.supportResponse || hostReview?.supportResponse || null,
        supportRespondedAt: guestReview?.supportRespondedAt || hostReview?.supportRespondedAt || null,
        
        // Trip details
        hostName: host?.name || 'Host',
        carMake: car?.make || '',
        carModel: car?.model || '',
        carYear: car?.year || 0,
        tripStartDate: booking?.startDate || new Date(),
        tripEndDate: booking?.endDate || new Date(),
        createdAt: hostReview?.createdAt || guestReview?.createdAt || new Date()
      }))

    // Calculate average rating from host reviews only
    const hostReviews = formattedReviews.filter(r => r.rating > 0)
    const averageRating = hostReviews.length > 0
      ? hostReviews.reduce((sum, r) => sum + r.rating, 0) / hostReviews.length
      : 0

    // 🔍 LOG: Check what's being returned
    console.log('🔍 First formatted review:', JSON.stringify(formattedReviews[0], null, 2))
    console.log('📊 Total reviews found:', formattedReviews.length)

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: hostReviews.length
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}