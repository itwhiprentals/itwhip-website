// File: app/api/rentals/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// SECURITY FIX: Added authentication and ownership verification to prevent IDOR attacks

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET!
)

interface AuthUser {
  userId: string
  role: string
  isAdmin: boolean
  isHost: boolean
  hostId?: string
}

async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()

    // Check admin token first
    const adminToken = cookieStore.get('adminAccessToken')?.value
    if (adminToken) {
      try {
        const { payload } = await jwtVerify(adminToken, ADMIN_JWT_SECRET)
        if (payload.type === 'admin' && payload.role === 'ADMIN') {
          return {
            userId: payload.userId as string,
            role: 'ADMIN',
            isAdmin: true,
            isHost: false
          }
        }
      } catch {}
    }

    // Check host token
    const hostToken = cookieStore.get('hostAccessToken')?.value || cookieStore.get('partner_token')?.value
    if (hostToken) {
      try {
        const { payload } = await jwtVerify(hostToken, JWT_SECRET)
        return {
          userId: payload.userId as string,
          role: 'HOST',
          isAdmin: false,
          isHost: true,
          hostId: payload.hostId as string
        }
      } catch {}
    }

    // Check guest token
    const guestToken = cookieStore.get('accessToken')?.value
    if (guestToken) {
      try {
        const { payload } = await jwtVerify(guestToken, JWT_SECRET)
        return {
          userId: payload.userId as string,
          role: 'GUEST',
          isAdmin: false,
          isHost: false
        }
      } catch {}
    }

    return null
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

async function verifyBookingOwnership(
  bookingId: string,
  user: AuthUser
): Promise<{ allowed: boolean; booking: any | null; reason?: string }> {
  // Admins can access any booking
  if (user.isAdmin) {
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: { id: true, renterId: true, hostId: true }
    })
    return { allowed: true, booking }
  }

  // Fetch booking with ownership info
  const booking = await prisma.rentalBooking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      renterId: true,
      hostId: true,
      car: {
        select: { hostId: true }
      }
    }
  })

  if (!booking) {
    return { allowed: false, booking: null, reason: 'Booking not found' }
  }

  // Hosts can access bookings for their cars
  if (user.isHost) {
    const carHostId = booking.car?.hostId
    if (booking.hostId === user.hostId || carHostId === user.hostId) {
      return { allowed: true, booking }
    }
    return { allowed: false, booking, reason: 'Not your booking' }
  }

  // Guests can only access their own bookings
  if (booking.renterId === user.userId) {
    return { allowed: true, booking }
  }

  return { allowed: false, booking, reason: 'Not your booking' }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    // SECURITY FIX: Verify authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // SECURITY FIX: Verify ownership before returning booking data
    const { allowed, reason } = await verifyBookingOwnership(resolvedParams.id, user)
    if (!allowed) {
      return NextResponse.json(
        { error: reason || 'Access denied' },
        { status: reason === 'Booking not found' ? 404 : 403 }
      )
    }

    // SECURE QUERY - USE SELECT NOT INCLUDE
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: resolvedParams.id },
      select: {
        // Booking core details
        id: true,
        bookingCode: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        
        // Guest information
        guestEmail: true,
        guestPhone: true,
        guestName: true,
        renterId: true,
        
        // Status fields
        status: true,
        paymentStatus: true,
        verificationStatus: true,
        tripStatus: true,
        
        // Location and delivery
        pickupLocation: true,
        pickupType: true,
        deliveryAddress: true,
        returnLocation: true,
        pickupWindowStart: true,
        pickupWindowEnd: true,
        
        // Pricing breakdown
        dailyRate: true,
        numberOfDays: true,
        subtotal: true,
        deliveryFee: true,
        insuranceFee: true,
        serviceFee: true,
        taxes: true,
        totalAmount: true,
        depositAmount: true,
        
        // Payment tracking
        paymentIntentId: true,
        stripeCustomerId: true,
        stripePaymentMethodId: true,
        paymentProcessedAt: true,
        
        // Trip tracking
        tripStartedAt: true,
        tripEndedAt: true,
        actualStartTime: true,
        actualEndTime: true,
        startMileage: true,
        endMileage: true,
        fuelLevelStart: true,
        fuelLevelEnd: true,
        
        // Verification info (for guest to see their own)
        licenseVerified: true,
        selfieVerified: true,
        documentsSubmittedAt: true,
        verificationDeadline: true,
        
        // Damage and charges
        damageReported: true,
        damageDescription: true,
        pendingChargesAmount: true,
        chargesProcessedAt: true,
        
        // Cancellation info
        cancellationReason: true,
        cancelledBy: true,
        cancelledAt: true,
        
        // Notes and extras
        notes: true,
        extras: true,
        
        // Car - LIMITED PUBLIC FIELDS ONLY
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            trim: true,
            color: true,
            carType: true,
            transmission: true,
            fuelType: true,
            seats: true,
            doors: true,
            
            // Basic info for display
            dailyRate: true,
            features: true,
            rules: true,
            
            // Location
            address: true,
            city: true,
            state: true,
            zipCode: true,
            
            // Delivery options
            airportPickup: true,
            hotelDelivery: true,
            homeDelivery: true,
            
            // Insurance
            insuranceIncluded: true,
            insuranceDaily: true,
            
            // Photos - LIMITED TO HERO AND A FEW OTHERS
            photos: {
              select: {
                id: true,
                url: true,
                caption: true,
                order: true,
                isHero: true
              },
              orderBy: { order: 'asc' },
              take: 5  // Limit to 5 photos
            }
          }
        },
        
        // Host - ONLY PUBLIC CONTACT INFO
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            phone: true,
            email: true,
            responseTime: true,
            responseRate: true,
            isVerified: true,
            city: true,
            state: true
          }
        },
        
        // Messages count (not the actual messages)
        _count: {
          select: {
            messages: true,
            disputes: true
          }
        },
        
        // Timestamps
        createdAt: true,
        updatedAt: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Format the response to ensure clean data
    // Strip Stripe IDs from guest-facing responses (only admins/hosts need them)
    const response = {
      ...booking,
      messageCount: booking._count.messages,
      disputeCount: booking._count.disputes,
      _count: undefined,  // Remove internal structure
      // Redact Stripe internals for guest users
      ...(!user.isAdmin && !user.isHost ? {
        paymentIntentId: undefined,
        stripeCustomerId: undefined,
        stripePaymentMethodId: undefined,
      } : {})
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    // SECURITY FIX: Verify authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // SECURITY FIX: Verify ownership before allowing update
    const { allowed, reason } = await verifyBookingOwnership(resolvedParams.id, user)
    if (!allowed) {
      return NextResponse.json(
        { error: reason || 'Access denied' },
        { status: reason === 'Booking not found' ? 404 : 403 }
      )
    }

    const body = await request.json()

    // Only allow updating certain fields
    const allowedUpdates = {
      notes: body.notes,
      verificationStatus: body.verificationStatus,
      documentsSubmittedAt: body.documentsSubmittedAt,
      licenseVerified: body.licenseVerified,
      selfieVerified: body.selfieVerified
    }
    
    // Remove undefined values
    const updates = Object.entries(allowedUpdates)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: resolvedParams.id },
      data: updates,
      select: {
        id: true,
        status: true,
        verificationStatus: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedBooking)
    
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    // SECURITY FIX: Verify authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // SECURITY FIX: Verify ownership before allowing cancellation
    const { allowed, reason } = await verifyBookingOwnership(resolvedParams.id, user)
    if (!allowed) {
      return NextResponse.json(
        { error: reason || 'Access denied' },
        { status: reason === 'Booking not found' ? 404 : 403 }
      )
    }

    // Determine who is cancelling based on authenticated user
    const cancelledBy = user.isAdmin ? 'ADMIN' : user.isHost ? 'HOST' : 'GUEST'

    // Only allow cancellation, not actual deletion
    const cancelledBooking = await prisma.rentalBooking.update({
      where: { id: resolvedParams.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: cancelledBy
      },
      select: {
        id: true,
        status: true,
        cancelledAt: true,
        paymentStatus: true,
        paymentIntentId: true,
        totalAmount: true,
        guestEmail: true,
      }
    })

    // Auto-create refund request if booking was paid
    if (cancelledBooking.paymentStatus === 'PAID' && cancelledBooking.paymentIntentId) {
      try {
        await prisma.refundRequest.create({
          data: {
            id: crypto.randomUUID(),
            bookingId: cancelledBooking.id,
            amount: cancelledBooking.totalAmount,
            reason: `Booking cancelled by ${cancelledBy.toLowerCase()}`,
            requestedBy: cancelledBooking.guestEmail || cancelledBy.toLowerCase(),
            requestedByType: cancelledBy,
            status: 'PENDING',
            updatedAt: new Date(),
          }
        })
        console.log(`[Cancel Booking] Auto-created refund request for booking ${cancelledBooking.id}`)
      } catch (refundError) {
        console.error('[Cancel Booking] Failed to create refund request:', refundError)
      }
    }

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      booking: { id: cancelledBooking.id, status: cancelledBooking.status, cancelledAt: cancelledBooking.cancelledAt }
    })
    
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}