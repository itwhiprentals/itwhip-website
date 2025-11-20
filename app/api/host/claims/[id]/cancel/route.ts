// app/api/host/claims/[id]/cancel/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const claimId = params.id

    if (!claimId) {
      return NextResponse.json(
        { error: 'Claim ID is required' },
        { status: 400 }
      )
    }

    // Get host info from middleware headers
    const hostId = request.headers.get('x-host-id')

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized - Host ID not found' },
        { status: 401 }
      )
    }

    // Find the claim
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        booking: {
          include: {
            car: {
              select: {
                id: true,
                rules: true,
                isActive: true
              }
            }
          }
        }
      }
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // Verify host owns this claim
    if (claim.hostId !== hostId) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this claim' },
        { status: 403 }
      )
    }

    // Only allow canceling PENDING claims
    if (claim.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Cannot cancel a claim with status: ${claim.status}. Only PENDING claims can be cancelled.` },
        { status: 400 }
      )
    }

    // Update claim status to CANCELLED
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: 'CANCELLED',
        reviewNotes: `Claim cancelled by host at ${new Date().toISOString()}`
      }
    })

    // Reactivate vehicle if it was deactivated due to this claim
    if (claim.booking.car) {
      try {
        const carRules = claim.booking.car.rules 
          ? JSON.parse(claim.booking.car.rules as string) 
          : {}

        // Check if this car was deactivated for this specific claim
        if (carRules.claimId === claimId && carRules.deactivatedAt) {
          // Restore previous active status or default to true
          const previousStatus = carRules.previousActiveStatus !== undefined 
            ? carRules.previousActiveStatus 
            : true

          // Remove claim-related metadata from rules
          const { 
            deactivationReason, 
            deactivatedAt, 
            deactivatedBy, 
            claimId: _, 
            claimType, 
            previousActiveStatus,
            ...cleanRules 
          } = carRules

          await prisma.rentalCar.update({
            where: { id: claim.booking.car.id },
            data: {
              isActive: previousStatus,
              rules: JSON.stringify(cleanRules)
            }
          })

          console.log(`Vehicle ${claim.booking.car.id} reactivated after claim cancellation`)
        }
      } catch (error) {
        console.error('Error reactivating vehicle:', error)
        // Don't fail the cancellation if vehicle reactivation fails
      }
    }

    // Delete or mark notification as read
    try {
      await prisma.hostNotification.updateMany({
        where: {
          hostId: hostId,
          type: 'CLAIM_FILED',
          message: {
            contains: claimId
          }
        },
        data: {
          status: 'DISMISSED'
        }
      })
    } catch (error) {
      console.error('Error updating notification:', error)
    }

    // Log the cancellation
    await prisma.activityLog.create({
      data: {
        userId: hostId,
        action: 'claim_cancelled',
        entityType: 'claim',
        entityId: claimId,
        metadata: {
          claimId: claimId,
          claimType: claim.type,
          bookingId: claim.bookingId,
          cancelledAt: new Date().toISOString(),
          vehicleReactivated: !!claim.booking.car
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Claim cancelled successfully',
      claim: {
        id: updatedClaim.id,
        status: updatedClaim.status,
        vehicleReactivated: !!claim.booking.car
      }
    })

  } catch (error) {
    console.error('Error cancelling claim:', error)
    return NextResponse.json(
      { error: 'Failed to cancel claim' },
      { status: 500 }
    )
  }
}