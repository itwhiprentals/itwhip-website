// app/api/fleet/claims/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

// ========== ✅ ESG EVENT HOOK IMPORT ==========
import { handleClaimApproved } from '@/app/lib/esg/event-hooks'

// ========== ✅ GUEST NOTIFICATION EMAIL IMPORT ==========
import { sendClaimNotificationGuestEmail } from '@/app/lib/services/claimEmailService'

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
    const { approvedAmount, reviewNotes, reviewedBy } = body;

    if (!approvedAmount || !reviewedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: approvedAmount, reviewedBy' },
        { status: 400 }
      );
    }

    // Get claim with booking details
    const existingClaim = await prisma.claim.findUnique({
      where: { id: id },
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
      where: { id: id },
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
          accountHoldClaimId: id,
          accountHoldAppliedAt: new Date(),
        }
      });
    }

    // ========================================================================
    // ✅ SEND NOTIFICATION EMAIL TO GUEST
    // ========================================================================

    if (existingClaim.booking.reviewerProfile?.email) {
      try {
        const guestResponseDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        const carDetails = `${existingClaim.booking.car.year} ${existingClaim.booking.car.make} ${existingClaim.booking.car.model}`

        const emailResult = await sendClaimNotificationGuestEmail(
          existingClaim.booking.reviewerProfile.email,
          {
            guestName: (existingClaim.booking.reviewerProfile as any).firstName || 'Guest',
            claimId: id,
            bookingCode: existingClaim.booking.bookingCode || '',
            carDetails,
            incidentDate: existingClaim.incidentDate?.toISOString() || new Date().toISOString(),
            estimatedCost: parseFloat(approvedAmount),
            claimType: existingClaim.type,
            responseDeadline: guestResponseDeadline,
            deductibleAmount: Number(existingClaim.deductible) || 0,
            depositHeld: Number(existingClaim.booking.securityDeposit) || 0,
          }
        )

        // Track notification sent
        if (emailResult.success) {
          await prisma.claim.update({
            where: { id: id },
            data: { guestNotifiedAt: new Date() }
          })
          console.log('✅ Guest notified of claim approval:', existingClaim.booking.reviewerProfile.email)
        } else {
          console.error('❌ Failed to send guest notification email:', emailResult.error)
        }
      } catch (emailError) {
        // Don't fail claim approval if email fails - log and continue
        console.error('❌ Error sending guest notification:', emailError)
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: crypto.randomUUID(),
        category: 'FINANCIAL',
        eventType: 'CLAIM_APPROVED',
        severity: 'INFO',
        adminEmail: reviewedBy,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'APPROVE_CLAIM',
        resource: 'Claim',
        resourceId: id,
        amount: parseFloat(approvedAmount),
        details: {
          claimId: id,
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
        claimId: id,
        bookingId: existingClaim.bookingId,
        claimType: existingClaim.type,
        approvedAmount: parseFloat(approvedAmount),
        wasAtFault: true // Claim approved = incident confirmed
      })

      console.log('✅ ESG claim approval event triggered:', {
        hostId: existingClaim.booking.host.id,
        claimId: id,
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