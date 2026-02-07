// app/api/claims/[id]/payout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

// POST /api/claims/[id]/payout - Process payout to host
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json();
    const {
      processedBy,
      stripeTransferId,
      paidAmount,
      recoveredFromGuest,
      notes
    } = body;

    // Validation
    if (!processedBy) {
      return NextResponse.json(
        { error: 'processedBy is required' },
        { status: 400 }
      );
    }

    // Get existing claim
    const claim = await prisma.claim.findUnique({
      where: { id: id },
      include: {
        booking: {
          select: {
            id: true,
            securityDeposit: true,
            depositHeld: true,
            depositUsedForClaim: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeConnectAccountId: true
          }
        }
      }
    });

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Can only payout APPROVED claims
    if (claim.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Can only payout APPROVED claims' },
        { status: 400 }
      );
    }

    // Check if already paid
    if (claim.status === 'PAID' || claim.paidToHost) {
      return NextResponse.json(
        { error: 'Claim has already been paid out' },
        { status: 400 }
      );
    }

    const approvedAmount = claim.approvedAmount || claim.estimatedCost;
    const amountToPay = paidAmount || approvedAmount;

    // Calculate platform advance and recovery
    const platformAdvance = amountToPay; // Platform pays host immediately
    const recovered = recoveredFromGuest || 0; // Amount recovered from guest deposit

    // Determine recovery status
    let recoveryStatus: 'PENDING' | 'PARTIAL' | 'FULL' | 'FAILED' | 'WAIVED';
    if (recovered === 0) {
      recoveryStatus = 'PENDING';
    } else if (recovered >= platformAdvance) {
      recoveryStatus = 'FULL';
    } else if (recovered > 0) {
      recoveryStatus = 'PARTIAL';
    } else {
      recoveryStatus = 'FAILED';
    }

    // Update claim with payout info
    const updatedClaim = await prisma.claim.update({
      where: { id: id },
      data: {
        status: 'PAID',
        paidToHost: new Date(),
        paidAmount: amountToPay,
        payoutId: stripeTransferId || `manual_${Date.now()}`,
        platformAdvanceAmount: platformAdvance,
        recoveredFromGuest: recovered,
        recoveryStatus,
        reviewNotes: notes 
          ? `${claim.reviewNotes || ''}\n\nPayout Notes: ${notes}` 
          : claim.reviewNotes
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
        }
      }
    });

    // Update booking security deposit tracking
    if (recovered > 0) {
      await prisma.rentalBooking.update({
        where: { id: claim.bookingId },
        data: {
          depositUsedForClaim: {
            increment: recovered
          }
        }
      });
    }

    return NextResponse.json({
      message: 'Payout processed successfully',
      claim: updatedClaim,
      payout: {
        amountPaid: amountToPay,
        platformAdvance: platformAdvance,
        recoveredFromGuest: recovered,
        recoveryStatus,
        stripeTransferId: stripeTransferId || null,
        processedBy,
        processedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error processing payout:', error);
    return NextResponse.json(
      { error: 'Failed to process payout' },
      { status: 500 }
    );
  }
}