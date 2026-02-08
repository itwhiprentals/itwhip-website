// app/api/invitations/[token]/route.ts
// GET /api/invitations/[token] - Get invitation details

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { getEffectiveOwnerPercent, getEffectiveManagerPercent } from '@/app/lib/commission/calculate-split'
import { InvitationDetails, NegotiationHistoryEntry } from '@/app/types/fleet-management'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      )
    }

    // Find invitation by token
    const invitation = await prisma.managementInvitation.findUnique({
      where: { token },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            hostManagerSlug: true,
            hostManagerName: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or has been deleted' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    const isExpired = new Date() > invitation.expiresAt
    if (isExpired && invitation.status === 'PENDING') {
      // Update status to expired
      await prisma.managementInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      invitation.status = 'EXPIRED'
    }

    // Get vehicle details if invitation includes vehicles
    let vehicles: { id: string; make: string; model: string; year: number; photos?: string[] }[] = []
    if (invitation.vehicleIds && invitation.vehicleIds.length > 0) {
      const vehicleData = await prisma.rentalCar.findMany({
        where: { id: { in: invitation.vehicleIds } },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          photos: {
            take: 3,
            orderBy: { isHero: 'desc' }
          }
        }
      })
      vehicles = vehicleData.map(v => ({
        id: v.id,
        make: v.make,
        model: v.model,
        year: v.year,
        photos: v.photos.map(p => p.url)
      }))
    }

    // Parse negotiation history from JSON
    const negotiationHistory: NegotiationHistoryEntry[] = (invitation.negotiationHistory as unknown as NegotiationHistoryEntry[]) || []

    // Calculate current terms (including counter-offer if present)
    const currentOwnerPercent = invitation.counterOfferOwnerPercent
      ? Number(invitation.counterOfferOwnerPercent)
      : Number(invitation.proposedOwnerPercent)
    const currentManagerPercent = invitation.counterOfferManagerPercent
      ? Number(invitation.counterOfferManagerPercent)
      : Number(invitation.proposedManagerPercent)

    // Build response
    const invitationDetails: InvitationDetails = {
      id: invitation.id,
      token: invitation.token,
      type: invitation.type,
      sender: {
        id: invitation.sender.id,
        name: invitation.sender.hostManagerName || invitation.sender.name,
        email: invitation.sender.email,
        profilePhoto: invitation.sender.profilePhoto || undefined
      },
      recipientEmail: invitation.recipientEmail,
      recipient: invitation.recipient ? {
        id: invitation.recipient.id,
        name: invitation.recipient.name,
        email: invitation.recipient.email
      } : undefined,
      vehicles,
      proposedOwnerPercent: Number(invitation.proposedOwnerPercent),
      proposedManagerPercent: Number(invitation.proposedManagerPercent),
      counterOfferOwnerPercent: invitation.counterOfferOwnerPercent
        ? Number(invitation.counterOfferOwnerPercent)
        : undefined,
      counterOfferManagerPercent: invitation.counterOfferManagerPercent
        ? Number(invitation.counterOfferManagerPercent)
        : undefined,
      negotiationRounds: invitation.negotiationRounds,
      negotiationHistory,
      permissions: {
        canEditListing: invitation.proposedCanEditListing,
        canAdjustPricing: invitation.proposedCanAdjustPricing,
        canCommunicateGuests: invitation.proposedCanCommunicateGuests,
        canApproveBookings: invitation.proposedCanApproveBookings,
        canHandleIssues: invitation.proposedCanHandleIssues
      },
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      createdAt: invitation.createdAt.toISOString()
    }

    // Add computed fields
    const response = {
      success: true,
      invitation: invitationDetails,
      computed: {
        isExpired,
        canRespond: ['PENDING', 'COUNTER_OFFERED'].includes(invitation.status) && !isExpired,
        currentOwnerPercent,
        currentManagerPercent,
        effectiveOwnerPercent: getEffectiveOwnerPercent(currentOwnerPercent),
        effectiveManagerPercent: getEffectiveManagerPercent(currentManagerPercent),
        roundsUsed: invitation.negotiationRounds,
        roundsRemaining: 5 - invitation.negotiationRounds,
        canCounterOffer: invitation.negotiationRounds < 5 && ['PENDING', 'COUNTER_OFFERED'].includes(invitation.status)
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Fleet Invitation] Get error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation details' },
      { status: 500 }
    )
  }
}
