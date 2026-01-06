// app/api/admin/rentals/verifications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { VERIFICATION_THRESHOLDS } from '@/app/lib/booking/verification-rules'

// GET handler to fetch pending verifications (documents AND charges)
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Build where clause based on verification requirements (no source field)
    const verificationRequiredConditions = {
      OR: [
        // Non-instant book cars always require verification
        { car: { instantBook: false } },
        // Luxury price threshold
        { car: { dailyRate: { gte: VERIFICATION_THRESHOLDS.LUXURY_PRICE } } },
        // Exotic/luxury car types
        { car: { carType: { in: ['luxury', 'exotic', 'convertible', 'sports'] } } },
        // High-value bookings
        { totalAmount: { gte: VERIFICATION_THRESHOLDS.HIGH_VALUE_TOTAL } },
        // Unverified hosts
        { car: { host: { isVerified: false } } },
        // Long-term rentals
        { numberOfDays: { gte: VERIFICATION_THRESHOLDS.LONG_TRIP_DAYS } }
      ]
    }
    
    // Build where clause - MORE INCLUSIVE
    const where: any = {
      ...verificationRequiredConditions
    }
    
    // Map status to verification statuses
    if (status === 'pending') {
      // EXPANDED: Include MORE statuses that need admin attention
      where.AND = [
        verificationRequiredConditions,
        {
          OR: [
            { verificationStatus: 'SUBMITTED' },
            { verificationStatus: 'PENDING_CHARGES' },
            { 
              // Also include bookings with pending charges regardless of verificationStatus
              pendingChargesAmount: {
                gt: 0
              }
            },
            {
              // Include completed trips that might have charges
              AND: [
                { tripStatus: 'COMPLETED' },
                { verificationStatus: { not: 'COMPLETED' } }
              ]
            },
            {
              // Include bookings with unresolved trip charges
              tripCharges: {
                some: {
                  chargeStatus: {
                    in: ['PENDING', 'DISPUTED', 'FAILED']
                  }
                }
              }
            }
          ]
        }
      ]
    } else if (status === 'approved') {
      where.AND = [
        verificationRequiredConditions,
        { verificationStatus: 'APPROVED' }
      ]
    } else if (status === 'rejected') {
      where.AND = [
        verificationRequiredConditions,
        { verificationStatus: 'REJECTED' }
      ]
    } else if (status === 'completed') {
      where.AND = [
        verificationRequiredConditions,
        { verificationStatus: 'COMPLETED' }
      ]
    } else if (status === 'all') {
      // Return all bookings that require verification
    } else if (status) {
      where.AND = [
        verificationRequiredConditions,
        { verificationStatus: status }
      ]
    } else {
      // Default to showing ALL items that need attention
      where.AND = [
        verificationRequiredConditions,
        {
          OR: [
            { verificationStatus: 'SUBMITTED' },
            { verificationStatus: 'PENDING_CHARGES' },
            { 
              pendingChargesAmount: {
                gt: 0
              }
            },
            {
              AND: [
                { tripStatus: 'COMPLETED' },
                { verificationStatus: { not: 'COMPLETED' } }
              ]
            },
            {
              tripCharges: {
                some: {
                  chargeStatus: {
                    in: ['PENDING', 'DISPUTED', 'FAILED']
                  }
                }
              }
            }
          ]
        }
      ]
    }
    
    // Debug logging
    console.log('Searching for bookings requiring verification with query:', JSON.stringify(where, null, 2))
    
    // Count total for pagination
    const total = await prisma.rentalBooking.count({ where })
    console.log('Total bookings found:', total)
    
    // Fetch bookings that need verification or charge processing
    const bookings = await prisma.rentalBooking.findMany({
      where,
      include: {
        car: {
          include: {
            host: true,
            photos: {
              take: 1,
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        renter: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        tripCharges: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        disputes: {
          where: {
            status: {
              in: ['OPEN', 'UNDER_REVIEW']
            }
          }
        }
      },
      orderBy: [
        // Prioritize based on urgency
        {
          disputes: {
            _count: 'desc' // Disputed items first
          }
        },
        {
          tripEndedAt: 'desc' // Recently ended trips next
        },
        {
          documentsSubmittedAt: 'desc' // Then recent document submissions
        }
      ],
      skip: (page - 1) * limit,
      take: limit
    })
    
    console.log('Bookings fetched:', bookings.length)
    
    // Format response for dashboard
    const formattedBookings = bookings.map(booking => {
      // Determine if this is post-trip based on multiple factors
      const isPostTrip = booking.verificationStatus === 'PENDING_CHARGES' || 
                        (booking.tripStatus === 'COMPLETED' && booking.pendingChargesAmount && Number(booking.pendingChargesAmount) > 0) ||
                        (booking.tripEndedAt !== null && booking.verificationStatus !== 'COMPLETED') ||
                        (booking.tripCharges && booking.tripCharges.length > 0)
                        
      const tripCharge = booking.tripCharges?.[0]
      
      // Calculate charges if not in TripCharge table
      let pendingCharges = { mileage: 0, fuel: 0, late: 0, damage: 0, total: 0 }
      
      // Use existing charges if available
      if (booking.pendingChargesAmount && Number(booking.pendingChargesAmount) > 0) {
        pendingCharges.total = Number(booking.pendingChargesAmount)
      }
      
      if (isPostTrip && !tripCharge && booking.startMileage && booking.endMileage) {
        // Calculate charges from booking data
        const milesDriven = (booking.endMileage || 0) - (booking.startMileage || 0)
        const includedMiles = (booking.numberOfDays || 1) * 200
        const overageMiles = Math.max(0, milesDriven - includedMiles)
        if (overageMiles > 0) {
          pendingCharges.mileage = overageMiles * 0.45
        }

        // Fuel charge calculation
        const fuelLevels: Record<string, number> = {
          'Full': 1.0, '3/4': 0.75, '1/2': 0.5, '1/4': 0.25, 'Empty': 0
        }
        const startLevel = fuelLevels[booking.fuelLevelStart || 'Full'] || 1
        const endLevel = fuelLevels[booking.fuelLevelEnd || 'Full'] || 1
        if (endLevel < startLevel) {
          pendingCharges.fuel = (startLevel - endLevel) * 300 // $300 per tank
        }

        // Late return charge
        if (booking.actualEndTime && booking.endDate) {
          const scheduledEnd = new Date(booking.endDate)
          const actualEnd = new Date(booking.actualEndTime)
          if (actualEnd > scheduledEnd) {
            const hoursLate = Math.max(0, (actualEnd.getTime() - scheduledEnd.getTime()) / (1000 * 60 * 60))
            pendingCharges.late = Math.ceil(hoursLate) * 50 // $50 per hour late
          }
        }

        // Damage charges if reported
        if (booking.damageReported) {
          pendingCharges.damage = 500 // Base damage charge, adjust as needed
        }

        // Update total if calculated
        if (pendingCharges.mileage || pendingCharges.fuel || pendingCharges.late || pendingCharges.damage) {
          pendingCharges.total = pendingCharges.mileage + pendingCharges.fuel + pendingCharges.late + pendingCharges.damage
        }
      }
      
      return {
        id: booking.id,
        bookingCode: booking.bookingCode,
        guestName: booking.guestName || booking.renter?.name || 'Guest',
        guestEmail: booking.guestEmail || booking.renter?.email || '',
        guestPhone: booking.guestPhone || '',
        car: {
          id: booking.car.id,
          make: booking.car.make,
          model: booking.car.model,
          year: booking.car.year,
          photos: booking.car.photos,
          host: {
            id: booking.car.host.id,
            name: booking.car.host.name,
            email: booking.car.host.email
          },
          dailyRate: booking.car.dailyRate,
          carType: booking.car.carType,
          instantBook: booking.car.instantBook
        },
        status: booking.status,
        verificationStatus: booking.verificationStatus,
        verificationMode: isPostTrip ? 'charges' : 'documents', // Indicates what type of review
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
        numberOfDays: booking.numberOfDays,
        
        // Enhanced charge information
        pendingChargesAmount: tripCharge ? 
          Number(tripCharge.totalCharges) : 
          pendingCharges.total,
        chargeBreakdown: isPostTrip ? pendingCharges : null,
        
        // Trip information
        tripEndedAt: booking.tripEndedAt,
        tripStartedAt: booking.tripStartedAt,
        milesDriven: (booking.endMileage || 0) - (booking.startMileage || 0),
        tripStatus: booking.tripStatus,
        
        // Document verification info
        documentsSubmittedAt: booking.documentsSubmittedAt,
        licensePhotoUrl: booking.licensePhotoUrl,
        insurancePhotoUrl: booking.insurancePhotoUrl,
        selfiePhotoUrl: booking.selfiePhotoUrl,
        
        // Review information
        reviewedBy: booking.reviewedBy,
        reviewedAt: booking.reviewedAt,
        verificationNotes: booking.verificationNotes,
        
        // Charge details if post-trip
        tripCharge: tripCharge ? {
          id: tripCharge.id,
          totalCharges: Number(tripCharge.totalCharges),
          chargeStatus: tripCharge.chargeStatus,
          disputes: tripCharge.disputes,
          failureReason: tripCharge.failureReason,
          mileageCharge: Number(tripCharge.mileageCharge || 0),
          fuelCharge: Number(tripCharge.fuelCharge || 0),
          lateCharge: Number(tripCharge.lateCharge || 0),
          damageCharge: Number(tripCharge.damageCharge || 0)
        } : null,
        
        // Payment information
        stripePaymentMethodId: booking.stripePaymentMethodId,
        stripeCustomerId: booking.stripeCustomerId,
        hasPaymentMethod: !!booking.stripePaymentMethodId,
        
        // Dispute information
        hasDisputes: booking.disputes.length > 0,
        disputeCount: booking.disputes.length,
        disputes: booking.disputes,
        
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        
        // Priority indicators for admin UI
        isUrgent: booking.disputes.length > 0 || 
                 tripCharge?.chargeStatus === 'FAILED' ||
                 (isPostTrip && pendingCharges.total > 500),
        priority: booking.disputes.length > 0 ? 'HIGH' : 
                 isPostTrip ? 'MEDIUM' : 
                 'NORMAL',
        daysSinceSubmission: isPostTrip 
          ? Math.floor((Date.now() - new Date(booking.tripEndedAt || booking.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
          : Math.floor((Date.now() - new Date(booking.documentsSubmittedAt || booking.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        
        // Add urgency for list view
        urgency: {
          hoursRemaining: 48 - Math.floor((Date.now() - new Date(booking.documentsSubmittedAt || booking.createdAt).getTime()) / (1000 * 60 * 60)),
          submittedHoursAgo: Math.floor((Date.now() - new Date(booking.documentsSubmittedAt || booking.createdAt).getTime()) / (1000 * 60 * 60)),
          isUrgent: isPostTrip || booking.disputes.length > 0
        },
        
        // Verification reason (why this booking requires verification)
        verificationReason: booking.car.instantBook === false ? 'host_approval_required' :
                           booking.car.dailyRate >= VERIFICATION_THRESHOLDS.LUXURY_PRICE ? 'luxury_vehicle' :
                           booking.car.carType && ['luxury', 'exotic', 'convertible', 'sports'].includes(booking.car.carType) ? 'exotic_vehicle' :
                           booking.totalAmount >= VERIFICATION_THRESHOLDS.HIGH_VALUE_TOTAL ? 'high_value_transaction' :
                           booking.numberOfDays >= VERIFICATION_THRESHOLDS.LONG_TRIP_DAYS ? 'extended_rental_period' :
                           !booking.car.host.isVerified ? 'host_verification_pending' :
                           'standard_verification'
      }
    })
    
    // Calculate comprehensive stats using verification criteria
    const baseVerificationConditions = {
      OR: [
        { car: { instantBook: false } },
        { car: { dailyRate: { gte: VERIFICATION_THRESHOLDS.LUXURY_PRICE } } },
        { car: { carType: { in: ['luxury', 'exotic', 'convertible', 'sports'] } } },
        { totalAmount: { gte: VERIFICATION_THRESHOLDS.HIGH_VALUE_TOTAL } },
        { car: { host: { isVerified: false } } },
        { numberOfDays: { gte: VERIFICATION_THRESHOLDS.LONG_TRIP_DAYS } }
      ]
    }
    
    const [
      pendingDocs,
      pendingChargesCount,
      approved,
      rejected,
      completed,
      totalChargesPending,
      disputedCharges,
      failedCharges,
      bookingsWithPendingAmount
    ] = await Promise.all([
      prisma.rentalBooking.count({ 
        where: { 
          ...baseVerificationConditions,
          verificationStatus: 'SUBMITTED'
        }
      }),
      prisma.rentalBooking.count({ 
        where: { 
          ...baseVerificationConditions,
          verificationStatus: 'PENDING_CHARGES'
        }
      }),
      prisma.rentalBooking.count({ 
        where: { 
          ...baseVerificationConditions,
          verificationStatus: 'APPROVED'
        }
      }),
      prisma.rentalBooking.count({ 
        where: { 
          ...baseVerificationConditions,
          verificationStatus: 'REJECTED'
        }
      }),
      prisma.rentalBooking.count({ 
        where: { 
          ...baseVerificationConditions,
          verificationStatus: 'COMPLETED'
        }
      }),
      prisma.rentalBooking.aggregate({
        where: { 
          AND: [
            baseVerificationConditions,
            {
              OR: [
                { verificationStatus: 'PENDING_CHARGES' },
                { pendingChargesAmount: { gt: 0 } }
              ]
            }
          ]
        },
        _sum: {
          pendingChargesAmount: true
        }
      }),
      prisma.tripCharge.count({
        where: { chargeStatus: 'DISPUTED' }
      }),
      prisma.tripCharge.count({
        where: { chargeStatus: 'FAILED' }
      }),
      prisma.rentalBooking.count({
        where: {
          ...baseVerificationConditions,
          pendingChargesAmount: { gt: 0 }
        }
      })
    ])
    
    console.log('Stats calculated:', {
      pendingDocs,
      pendingChargesCount,
      bookingsWithPendingAmount,
      totalFound: formattedBookings.length
    })
    
    return NextResponse.json({ 
      bookings: formattedBookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        pending: pendingDocs + pendingChargesCount + bookingsWithPendingAmount, // Total pending items
        pendingDocuments: pendingDocs, // Just document verifications
        pendingCharges: pendingChargesCount + bookingsWithPendingAmount, // Charges needing review
        pendingChargesTotal: totalChargesPending._sum.pendingChargesAmount || 0, // Total $ amount pending
        approved: approved,
        rejected: rejected,
        completed: completed,
        disputed: disputedCharges, // Number of disputed charges
        failedCharges: failedCharges, // Number of failed charge attempts
        bookingsWithPendingAmount: bookingsWithPendingAmount // New stat
      }
    })
    
  } catch (error) {
    console.error('Error fetching verifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verifications', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST handler for batch operations (simplified - individual processing via /approve endpoint)
export async function POST(request: NextRequest) {
  try {
    const { bookingIds, action, notes } = await request.json()
    
    if (!bookingIds || !Array.isArray(bookingIds)) {
      return NextResponse.json(
        { error: 'Invalid booking IDs' },
        { status: 400 }
      )
    }
    
    // For batch operations, redirect to individual processing
    const results = []
    
    for (const bookingId of bookingIds) {
      try {
        // Call the individual approval endpoint for each booking
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/rentals/verifications/${bookingId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action,
            notes,
            waiveReason: notes // If action is waive
          })
        })
        
        const result = await response.json()
        results.push({
          bookingId,
          success: response.ok,
          ...result
        })
      } catch (error) {
        console.error(`Error processing booking ${bookingId}:`, error)
        results.push({ 
          bookingId, 
          success: false, 
          error: (error as Error).message 
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${bookingIds.length} bookings`,
      results
    })
    
  } catch (error) {
    console.error('Error processing batch verifications:', error)
    return NextResponse.json(
      { error: 'Failed to process verifications', details: (error as Error).message },
      { status: 500 }
    )
  }
}