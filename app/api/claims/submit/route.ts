// app/api/claims/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

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
        insurancePolicy: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.insurancePolicy) {
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

    // Create claim
    const claim = await prisma.claim.create({
      data: {
        policyId: booking.insurancePolicy.id,
        bookingId,
        hostId,
        type,
        reportedBy: reportedBy || 'HOST',
        description,
        incidentDate: new Date(incidentDate),
        damagePhotos: damagePhotos || [],
        estimatedCost: estimatedCost || 0,
        status: 'PENDING',
        deductible: booking.insurancePolicy.deductible
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
        policy: {
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

    return NextResponse.json({
      message: 'Claim submitted successfully',
      claim
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}