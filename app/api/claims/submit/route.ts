// app/api/claims/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

// TEMPORARY: Testing flag - REMOVE BEFORE PRODUCTION
const TESTING_MODE = process.env.NODE_ENV === 'development' && process.env.ENABLE_CLAIM_TESTING === 'true';

// POST /api/claims/submit - Submit new claim
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      hostId,
      type,
      description,
      incidentDate,
      damagePhotos,
      estimatedCost,
      reportedBy
    } = body;

    // Validation
    if (!bookingId || !hostId || !type || !description || !incidentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        InsurancePolicy: true
      }
    }) as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.InsurancePolicy) {
      return NextResponse.json(
        { error: 'No insurance policy found for this booking' },
        { status: 400 }
      );
    }

    // Verify host owns this booking
    if (booking.hostId !== hostId) {
      return NextResponse.json(
        { error: 'Host does not own this booking' },
        { status: 403 }
      );
    }

    // TEMPORARY: Date validation with testing override - REMOVE BEFORE PRODUCTION
    const incident = new Date(incidentDate);
    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);
    const thirtyDaysAfter = new Date(bookingEnd);
    thirtyDaysAfter.setDate(thirtyDaysAfter.getDate() + 30);
    
    if (!TESTING_MODE) {
      // Normal validation
      if (incident < bookingStart) {
        return NextResponse.json(
          { error: 'Incident date cannot be before trip start date' },
          { status: 400 }
        );
      }
      
      if (incident > thirtyDaysAfter) {
        return NextResponse.json(
          { error: 'Claims must be filed within 30 days of trip end' },
          { status: 400 }
        );
      }
    } else {
      // Testing mode - log warning
      console.warn('⚠️ TESTING MODE: Claim date validation bypassed for booking:', bookingId);
      console.warn('  Booking dates:', bookingStart.toISOString(), '-', bookingEnd.toISOString());
      console.warn('  Incident date:', incident.toISOString());
      console.warn('  Normal window would end:', thirtyDaysAfter.toISOString());
    }

    // Create claim
    const claim = await (prisma.claim.create as any)({
      data: {
        policyId: booking.InsurancePolicy.id,
        bookingId,
        hostId,
        type,
        reportedBy: reportedBy || 'HOST',
        description,
        incidentDate: new Date(incidentDate),
        damagePhotosLegacy: damagePhotos || [],
        estimatedCost: estimatedCost || 0,
        status: 'PENDING',
        deductible: booking.InsurancePolicy.deductible
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        booking: {
          select: {
            id: true,
            bookingCode: true,
            guestName: true
          }
        },
        InsurancePolicy: {
          select: {
            tier: true,
            policyNumber: true
          }
        }
      }
    });

    // Update booking to flag damage
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: { damageReported: true }
    });

    // Add warning in response if testing mode
    const response: any = {
      message: 'Claim submitted successfully',
      claim
    };
    
    if (TESTING_MODE) {
      response.warning = 'Claim submitted in TESTING MODE - date validation was bypassed';
    }

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}