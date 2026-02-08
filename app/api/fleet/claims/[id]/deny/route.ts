// app/api/fleet/claims/[id]/deny/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

// ========== ✅ NEW: ESG EVENT HOOK IMPORT ==========
import { handleClaimDenied } from '@/app/lib/esg/event-hooks'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reviewNotes, reviewedBy, denialReason } = body;

    if (!reviewedBy || !denialReason) {
      return NextResponse.json(
        { error: 'Missing required fields: reviewedBy, denialReason' },
        { status: 400 }
      );
    }

    // Get claim with vehicle details
    const existingClaim = await prisma.claim.findUnique({
      where: { id: id },
      include: {
        booking: {
          include: {
            car: true,
            host: true, // ✅ Include host for ESG event
          }
        }
      }
    });

    if (!existingClaim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Update claim with denial
    const claim = await prisma.claim.update({
      where: { id: id },
      data: {
        status: 'DENIED',
        reviewedBy,
        reviewedAt: new Date(),
        reviewNotes,
        insurerDenialReason: denialReason,
      }
    });

    // If vehicle was deactivated, reactivate it since claim is denied
    if (existingClaim.vehicleDeactivated && existingClaim.booking.car.hasActiveClaim) {
      await prisma.rentalCar.update({
        where: { id: existingClaim.booking.car.id },
        data: {
          hasActiveClaim: false,
          activeClaimId: null,
          claimLockUntil: null,
          safetyHold: false,
        }
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: crypto.randomUUID(),
        category: 'FINANCIAL',
        eventType: 'CLAIM_DENIED',
        severity: 'WARNING',
        adminEmail: reviewedBy,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'DENY_CLAIM',
        resource: 'Claim',
        resourceId: id,
        details: {
          claimId: id,
          bookingId: existingClaim.bookingId,
          denialReason,
          reviewNotes,
          vehicleReactivated: existingClaim.vehicleDeactivated,
        },
        hash: '',
        previousHash: null,
      }
    });

    // ========================================================================
    // ✅ NEW: TRIGGER ESG EVENT - CLAIM DENIED
    // ========================================================================
    
    try {
      await handleClaimDenied(existingClaim.booking.host.id, {
        claimId: id,
        bookingId: existingClaim.bookingId,
        claimType: existingClaim.type,
        denialReason
      })

      console.log('✅ ESG claim denial event triggered:', {
        hostId: existingClaim.booking.host.id,
        claimId: id,
        claimType: existingClaim.type,
        denialReason
      })
    } catch (esgError) {
      // Don't fail claim denial if ESG update fails
      console.error('❌ ESG event failed (non-critical):', esgError)
    }

    return NextResponse.json({
      success: true,
      claim,
      message: 'Claim denied successfully. Vehicle reactivated.',
    });

  } catch (error) {
    console.error('Error denying claim:', error);
    return NextResponse.json(
      { error: 'Failed to deny claim' },
      { status: 500 }
    );
  }
}