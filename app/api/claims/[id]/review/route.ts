// app/api/claims/[id]/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

// PATCH /api/claims/[id]/review - Admin reviews claim (approve/deny)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json();
    const {
      status,
      reviewedBy,
      reviewNotes,
      approvedAmount,
      guestAtFault,
      faultPercentage
    } = body;

    // Validation
    if (!status || !['APPROVED', 'DENIED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be APPROVED or DENIED' },
        { status: 400 }
      );
    }

    if (!reviewedBy) {
      return NextResponse.json(
        { error: 'reviewedBy is required' },
        { status: 400 }
      );
    }

    // Get existing claim
    const existing = await prisma.claim.findUnique({
      where: { id: id },
      include: {
        booking: true,
        policy: true
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Can only review PENDING or UNDER_REVIEW claims
    if (!['PENDING', 'UNDER_REVIEW'].includes(existing.status)) {
      return NextResponse.json(
        { error: `Cannot review claim with status ${existing.status}` },
        { status: 400 }
      );
    }

    // Build override history entry
    const overrideEntry = {
      timestamp: new Date().toISOString(),
      by: reviewedBy,
      fromStatus: existing.status,
      toStatus: status,
      reason: reviewNotes || 'Claim reviewed'
    };

    // Update override history
    const updatedOverrideHistory = [
      ...(Array.isArray(existing.overrideHistory) ? existing.overrideHistory : []),
      overrideEntry
    ];

    // Update claim
    const claim = await prisma.claim.update({
      where: { id: id },
      data: {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        reviewNotes,
        approvedAmount: status === 'APPROVED' ? (approvedAmount || existing.estimatedCost) : null,
        guestAtFault: guestAtFault ?? false,
        faultPercentage: faultPercentage || null,
        overrideHistory: updatedOverrideHistory,
        resolvedAt: status === 'APPROVED' ? new Date() : null
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
            guestName: true,
            guestEmail: true
          }
        },
        policy: {
          select: {
            tier: true,
            deductible: true
          }
        }
      }
    });

    return NextResponse.json({
      message: `Claim ${status.toLowerCase()} successfully`,
      claim
    });

  } catch (error) {
    console.error('Error reviewing claim:', error);
    return NextResponse.json(
      { error: 'Failed to review claim' },
      { status: 500 }
    );
  }
}