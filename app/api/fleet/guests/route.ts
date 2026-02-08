// app/api/fleet/guests/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - Fetch all guests/reviewers
export async function GET(request: NextRequest) {
  try {
    // Verify fleet access - check URL key OR header key
    const { searchParams } = new URL(request.url)
    const urlKey = searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    
    const phoenixKey = 'phoenix-fleet-2847'
    
    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get other query params
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'recent'
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count
    const total = await prisma.reviewerProfile.count({ where })

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'name') {
      orderBy = { name: 'asc' }
    } else if (sortBy === 'trips') {
      orderBy = { tripCount: 'desc' }
    } else if (sortBy === 'reviews') {
      orderBy = { reviewCount: 'desc' }
    }

    // Fetch guests
    const guests = await prisma.reviewerProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            lastActive: true
          }
        },
        RentalBooking: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            verificationStatus: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        RentalReview: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        // Include recent credit transactions for credit management
        CreditBonusTransaction: {
          select: {
            id: true,
            amount: true,
            type: true,
            action: true,
            reason: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            RentalBooking: true,
            RentalReview: true
          }
        }
      }
    })

    // Format response
    const formattedGuests = guests.map(guest => ({
      id: guest.id,
      email: guest.email,
      name: guest.name,
      phone: (guest as any).phone,
      profilePhotoUrl: guest.profilePhotoUrl,
      city: guest.city,
      state: guest.state,
      tripCount: guest.tripCount,
      reviewCount: guest.reviewCount,
      isVerified: guest.isVerified,
      memberSince: guest.memberSince,
      userId: guest.userId,
      user: guest.user,
      recentBookings: guest.RentalBooking,
      recentReviews: guest.RentalReview,
      totalBookings: guest._count.RentalBooking,
      totalReviews: guest._count.RentalReview,
      createdAt: guest.createdAt,
      // Credit management fields
      balances: {
        credit: guest.creditBalance || 0,
        bonus: guest.bonusBalance || 0,
        deposit: guest.depositWalletBalance || 0,
        total: (guest.creditBalance || 0) + (guest.bonusBalance || 0) + (guest.depositWalletBalance || 0)
      },
      verification: {
        isIdentityVerified: guest.stripeIdentityStatus === 'verified' || guest.documentsVerified === true,
        stripeStatus: guest.stripeIdentityStatus,
        documentsVerified: guest.documentsVerified
      },
      creditTransactions: guest.CreditBonusTransaction
    }))

    return NextResponse.json({
      success: true,
      guests: formattedGuests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Fleet guests fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guests' },
      { status: 500 }
    )
  }
}