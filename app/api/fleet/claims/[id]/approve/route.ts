// app/api/fleet/claims/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

// ========== ✅ NEW: ESG EVENT HOOK IMPORT ==========
import { handleClaimApproved } from '@/app/lib/esg/event-hooks'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { approvedAmount, reviewNotes, reviewedBy } = body;

    if (!approvedAmount || !reviewedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: approvedAmount, reviewedBy' },
        { status: 400 }
      );
    }

    // Get claim with booking details
    const existingClaim = await prisma.claim.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            reviewerProfile: true,
            car: true,
            host: true, // ✅ Include host for ESG event
          }
        }
      }
    });

    if (!existingClaim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Update claim with approval
    const claim = await prisma.claim.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedAmount: parseFloat(approvedAmount),
        reviewedBy,
        reviewedAt: new Date(),
        reviewNotes,
        // Set guest response deadline (48 hours from now)
        guestResponseDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        // Apply account hold immediately
        accountHoldApplied: true,
      }
    });

    // Update guest profile - apply account hold
    if (existingClaim.booking.reviewerProfile) {
      await prisma.reviewerProfile.update({
        where: { id: existingClaim.booking.reviewerProfile.id },
        data: {
          accountOnHold: true,
          accountHoldReason: 'Active insurance claim pending resolution',
          accountHoldClaimId: params.id,
          accountHoldAppliedAt: new Date(),
        }
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        category: 'FINANCIAL',
        eventType: 'CLAIM_APPROVED',
        severity: 'INFO',
        adminEmail: reviewedBy,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'APPROVE_CLAIM',
        resource: 'Claim',
        resourceId: params.id,
        amount: parseFloat(approvedAmount),
        details: {
          claimId: params.id,
          bookingId: existingClaim.bookingId,
          approvedAmount: parseFloat(approvedAmount),
          reviewNotes,
          accountHoldApplied: true,
        },
        hash: '',
        previousHash: null,
      }
    });

    // ========================================================================
    // ✅ NEW: TRIGGER ESG EVENT - CLAIM APPROVED
    // ========================================================================
    
    try {
      await handleClaimApproved(existingClaim.booking.host.id, {
        claimId: params.id,
        bookingId: existingClaim.bookingId,
        claimType: existingClaim.type,
        approvedAmount: parseFloat(approvedAmount),
        wasAtFault: true // Claim approved = incident confirmed
      })

      console.log('✅ ESG claim approval event triggered:', {
        hostId: existingClaim.booking.host.id,
        claimId: params.id,
        approvedAmount: parseFloat(approvedAmount),
        claimType: existingClaim.type
      })
    } catch (esgError) {
      // Don't fail claim approval if ESG update fails
      console.error('❌ ESG event failed (non-critical):', esgError)
    }

    return NextResponse.json({
      success: true,
      claim,
      message: 'Claim approved successfully. Guest account placed on hold.',
    });

  } catch (error) {
    console.error('Error approving claim:', error);
    return NextResponse.json(
      { error: 'Failed to approve claim' },
      { status: 500 }
    );
  }
}