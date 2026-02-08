// app/api/rentals/verify/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('bookingId')
    const token = searchParams.get('token')
    
    if (!bookingId && !token) {
      return NextResponse.json(
        { error: 'Booking ID or token required' },
        { status: 400 }
      )
    }
    
    // Find booking by ID or token
    let booking: any

    if (token) {
      const { validateToken } = await import('@/app/lib/auth/guest-tokens')
      const result = await validateToken(token) as any
      booking = result.booking
    } else {
      // SECURE QUERY - USE SELECT NOT INCLUDE
      booking = await prisma.rentalBooking.findUnique({
        where: { id: bookingId! },
        select: {
          id: true,
          bookingCode: true,
          status: true,
          verificationStatus: true,
          verificationDeadline: true,
          documentsSubmittedAt: true,
          reviewedAt: true,
          reviewedBy: true,
          verificationNotes: true,
          licenseVerified: true,
          selfieVerified: true,
          licensePhotoUrl: true,
          insurancePhotoUrl: true,
          selfiePhotoUrl: true,
          guestName: true,
          guestEmail: true,
          startDate: true,
          endDate: true,
          totalAmount: true,
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
                take: 1
              },
              host: {
                select: {
                  id: true,
                  name: true,
                  responseTime: true
                }
              }
            }
          }
        }
      })
    }
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Calculate time remaining for verification
    let timeRemaining = null
    if (booking.verificationDeadline) {
      const now = new Date()
      const deadline = new Date(booking.verificationDeadline)
      const hoursRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)))
      timeRemaining = {
        hours: hoursRemaining,
        isExpired: hoursRemaining === 0
      }
    }
    
    // Determine verification progress
    const verificationSteps = {
      documentsSubmitted: !!booking.documentsSubmittedAt,
      licenseVerified: booking.licenseVerified,
      selfieVerified: booking.selfieVerified,
      completed: booking.verificationStatus === 'APPROVED'
    }
    
    const progress = Object.values(verificationSteps).filter(Boolean).length / 4 * 100
    
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        verificationStatus: booking.verificationStatus,
        car: {
          make: booking.car.make,
          model: booking.car.model,
          year: booking.car.year,
          photo: booking.car.photos[0]?.url || null
        },
        host: {
          name: booking.car.host.name,
          responseTime: booking.car.host.responseTime
        },
        dates: {
          start: booking.startDate,
          end: booking.endDate
        }
      },
      verification: {
        status: booking.verificationStatus,
        steps: verificationSteps,
        progress: Math.round(progress),
        documentsSubmittedAt: booking.documentsSubmittedAt,
        reviewedAt: booking.reviewedAt,
        reviewedBy: booking.reviewedBy,
        notes: booking.verificationNotes,
        timeRemaining,
        documents: {
          license: booking.licensePhotoUrl ? 'submitted' : 'pending',
          insurance: booking.insurancePhotoUrl ? 'submitted' : 'optional',
          selfie: booking.selfiePhotoUrl ? 'submitted' : 'pending'
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching verification status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    )
  }
}