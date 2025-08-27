// app/api/rentals/user-bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyJWT } from '@/lib/auth/jwt'
import type { RentalBookingStatus } from '@/app/lib/dal/types'

// GET /api/rentals/user-bookings - Get user's rental bookings
export async function GET(request: NextRequest) {
  try {
    // TEMPORARY: Skip auth check for testing
    // Uncomment this block when you have proper auth flow
    /*
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token)
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    */

    // TEMPORARY: Mock user for testing
    const payload = { userId: 'test-user-1' }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as RentalBookingStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // For now, return mock data since we don't have real bookings yet
    const mockBookings = [
      {
        id: 'booking-1',
        bookingCode: 'RENT-2025-001',
        status: 'CONFIRMED',
        bookingState: 'UPCOMING',
        
        car: {
          id: 'car-1',
          make: 'Tesla',
          model: 'Model 3',
          year: 2024,
          type: 'SEDAN',
          transmission: 'AUTOMATIC',
          seats: 5,
          photo: 'https://via.placeholder.com/400x300?text=Tesla+Model+3',
          location: 'Phoenix, AZ'
        },
        
        host: {
          id: 'host-1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '555-0123',
          profilePhoto: null,
          rating: 4.8,
          responseTime: 15,
          isVerified: true
        },
        
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        startTime: '10:00 AM',
        endTime: '10:00 AM',
        numberOfDays: 3,
        
        pickupLocation: 'Phoenix Sky Harbor Airport',
        pickupType: 'airport',
        returnLocation: 'Phoenix Sky Harbor Airport',
        
        dailyRate: 85,
        subtotal: 255,
        deliveryFee: 0,
        insuranceFee: 75,
        serviceFee: 33,
        taxes: 29.04,
        totalAmount: 392.04,
        depositAmount: 500,
        
        paymentStatus: 'paid',
        paymentIntentId: 'pi_mock_123',
        
        licenseVerified: true,
        selfieVerified: true,
        
        hasReview: false,
        review: null,
        
        hasUnreadMessages: false,
        latestMessage: null,
        
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'booking-2',
        bookingCode: 'RENT-2025-002',
        status: 'COMPLETED',
        bookingState: 'COMPLETED',
        
        car: {
          id: 'car-2',
          make: 'BMW',
          model: 'X5',
          year: 2023,
          type: 'SUV',
          transmission: 'AUTOMATIC',
          seats: 7,
          photo: 'https://via.placeholder.com/400x300?text=BMW+X5',
          location: 'Scottsdale, AZ'
        },
        
        host: {
          id: 'host-2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '555-0456',
          profilePhoto: null,
          rating: 4.9,
          responseTime: 10,
          isVerified: true
        },
        
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        startTime: '2:00 PM',
        endTime: '2:00 PM',
        numberOfDays: 5,
        
        pickupLocation: 'Hotel Delivery - Scottsdale Marriott',
        pickupType: 'hotel',
        returnLocation: 'Hotel Delivery - Scottsdale Marriott',
        
        dailyRate: 120,
        subtotal: 600,
        deliveryFee: 35,
        insuranceFee: 125,
        serviceFee: 76,
        taxes: 66.88,
        totalAmount: 902.88,
        depositAmount: 500,
        
        paymentStatus: 'paid',
        paymentIntentId: 'pi_mock_456',
        
        licenseVerified: true,
        selfieVerified: true,
        
        hasReview: true,
        review: {
          rating: 5,
          comment: 'Excellent car and service!',
          createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000)
        },
        
        hasUnreadMessages: false,
        latestMessage: null,
        
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000)
      }
    ]

    // Filter by status if provided
    let filteredBookings = mockBookings
    if (status) {
      filteredBookings = mockBookings.filter(b => b.status === status)
    }

    // Calculate stats
    const stats = {
      total: mockBookings.length,
      upcoming: mockBookings.filter(b => b.bookingState === 'UPCOMING').length,
      active: mockBookings.filter(b => b.bookingState === 'ACTIVE').length,
      completed: mockBookings.filter(b => b.bookingState === 'COMPLETED').length,
      cancelled: 0
    }

    // Pagination info
    const pagination = {
      page,
      limit,
      totalPages: Math.ceil(filteredBookings.length / limit),
      totalCount: filteredBookings.length,
      hasMore: page * limit < filteredBookings.length
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedBookings = filteredBookings.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      bookings: paginatedBookings,
      stats,
      pagination
    })

  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST /api/rentals/user-bookings/cancel - Cancel a booking
export async function POST(request: NextRequest) {
  try {
    // TEMPORARY: Skip auth for testing
    const payload = { userId: 'test-user-1' }

    const body = await request.json()
    const { bookingId, reason } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }

    // For mock data, just return success
    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        status: 'CANCELLED',
        notes: reason || 'Cancelled by user'
      },
      refund: {
        amount: 0,
        percentage: 0,
        status: 'not_applicable'
      }
    })

  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}

// PUT /api/rentals/user-bookings/extend - Extend a booking
export async function PUT(request: NextRequest) {
  try {
    // TEMPORARY: Skip auth for testing
    const payload = { userId: 'test-user-1' }

    const body = await request.json()
    const { bookingId, newEndDate } = body

    if (!bookingId || !newEndDate) {
      return NextResponse.json(
        { error: 'Booking ID and new end date required' },
        { status: 400 }
      )
    }

    // For mock data, just return success
    const additionalDays = 2 // Mock extension
    const additionalCost = 170 // Mock cost

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        endDate: newEndDate,
        status: 'EXTENDED'
      },
      extension: {
        additionalDays,
        additionalCost,
        newEndDate: new Date(newEndDate)
      }
    })

  } catch (error) {
    console.error('Error extending booking:', error)
    return NextResponse.json(
      { error: 'Failed to extend booking' },
      { status: 500 }
    )
  }
}

// Helper function for date formatting
function format(date: Date, formatStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}