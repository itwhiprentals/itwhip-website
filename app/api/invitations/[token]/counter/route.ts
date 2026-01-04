// app/api/invitations/[token]/counter/route.ts
// POST /api/invitations/[token]/counter - Counter-offer on fleet management invitation

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendEmail } from '@/app/lib/email/send-email'
import { getCounterOfferTemplate } from '@/app/lib/email/templates/counter-offer'
import {
  getEffectiveOwnerPercent,
  getEffectiveManagerPercent,
  validateCommissionSplit
} from '@/app/lib/commission/calculate-split'
import {
  MAX_NEGOTIATION_ROUNDS,
  COUNTER_OFFER_EXTENSION_DAYS,
  NegotiationHistoryEntry
} from '@/app/types/fleet-management'

interface CounterOfferBody {
  proposedOwnerPercent: number
  proposedManagerPercent: number
  message?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Verify authentication
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: CounterOfferBody = await request.json()
    const { proposedOwnerPercent, proposedManagerPercent, message } = body

    // Validate commission split
    const validationError = validateCommissionSplit(proposedOwnerPercent, proposedManagerPercent)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // Find invitation
    const invitation = await prisma.managementInvitation.findUnique({
      where: { token },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
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
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check status allows counter-offer
    if (!['PENDING', 'COUNTER_OFFERED'].includes(invitation.status)) {
      return NextResponse.json(
        { error: `Cannot counter-offer - invitation status: ${invitation.status}` },
        { status: 400 }
      )
    }

    // Check expiration
    if (new Date() > invitation.expiresAt) {
      await prisma.managementInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check negotiation rounds
    if (invitation.negotiationRounds >= MAX_NEGOTIATION_ROUNDS) {
      return NextResponse.json(
        { error: `Maximum negotiation rounds (${MAX_NEGOTIATION_ROUNDS}) reached. Please accept or decline.` },
        { status: 400 }
      )
    }

    // Get user's host profile
    const userHost = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      }
    })

    // Determine if user is sender or recipient
    const isSender = userHost?.id === invitation.senderId
    const isRecipient = user.email.toLowerCase() === invitation.recipientEmail.toLowerCase() ||
                       userHost?.id === invitation.recipientId

    if (!isSender && !isRecipient) {
      return NextResponse.json(
        { error: 'You are not a party to this invitation' },
        { status: 403 }
      )
    }

    // Get current terms to compare
    const currentOwnerPercent = invitation.counterOfferOwnerPercent
      ? Number(invitation.counterOfferOwnerPercent)
      : Number(invitation.proposedOwnerPercent)
    const currentManagerPercent = invitation.counterOfferManagerPercent
      ? Number(invitation.counterOfferManagerPercent)
      : Number(invitation.proposedManagerPercent)

    // Check if counter-offer is actually different
    if (proposedOwnerPercent === currentOwnerPercent && proposedManagerPercent === currentManagerPercent) {
      return NextResponse.json(
        { error: 'Counter-offer must propose different terms than current offer' },
        { status: 400 }
      )
    }

    // Determine proposer role
    const isOwnerInvitingManager = invitation.type === 'OWNER_INVITES_MANAGER'
    let proposedByRole: 'OWNER' | 'MANAGER'

    if (isOwnerInvitingManager) {
      // Owner sent initial invite
      proposedByRole = isSender ? 'OWNER' : 'MANAGER'
    } else {
      // Manager sent initial invite
      proposedByRole = isSender ? 'MANAGER' : 'OWNER'
    }

    // Build negotiation history entry
    const newHistoryEntry: NegotiationHistoryEntry = {
      round: invitation.negotiationRounds + 1,
      proposedBy: proposedByRole,
      ownerPercent: proposedOwnerPercent,
      managerPercent: proposedManagerPercent,
      message,
      timestamp: new Date().toISOString()
    }

    // Get existing history
    const existingHistory = (invitation.negotiationHistory as NegotiationHistoryEntry[]) || []

    // Extend expiration
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + COUNTER_OFFER_EXTENSION_DAYS)

    // Update invitation
    await prisma.managementInvitation.update({
      where: { id: invitation.id },
      data: {
        counterOfferOwnerPercent: proposedOwnerPercent,
        counterOfferManagerPercent: proposedManagerPercent,
        negotiationRounds: invitation.negotiationRounds + 1,
        negotiationNotes: message || invitation.negotiationNotes,
        negotiationHistory: [...existingHistory, newHistoryEntry],
        status: 'COUNTER_OFFERED',
        expiresAt: newExpiresAt
      }
    })

    // Determine who to notify (the other party)
    const notifyEmail = isSender ? invitation.recipientEmail : invitation.sender.email
    const notifyName = isSender
      ? (invitation.recipient?.name || invitation.recipientEmail.split('@')[0])
      : invitation.sender.name
    const counterPartyName = userHost?.name || user.name || user.email.split('@')[0]
    const counterPartyEmail = userHost?.email || user.email

    // Get vehicle details for email
    let vehicleDetails: { make: string; model: string; year: number; photo?: string }[] = []
    if (invitation.vehicleIds && invitation.vehicleIds.length > 0) {
      const vehicles = await prisma.rentalCar.findMany({
        where: { id: { in: invitation.vehicleIds } },
        select: {
          make: true,
          model: true,
          year: true,
          photos: { take: 1, orderBy: { isHero: 'desc' } }
        }
      })
      vehicleDetails = vehicles.map(v => ({
        make: v.make,
        model: v.model,
        year: v.year,
        photo: v.photos[0]?.url
      }))
    }

    // Send counter-offer notification email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'
    const respondUrl = `${baseUrl}/invite/view/${invitation.token}`

    const emailData = {
      recipientName: notifyName,
      recipientEmail: notifyEmail,
      counterPartyName,
      counterPartyEmail,
      invitationType: invitation.type,
      vehicles: vehicleDetails,
      originalOwnerPercent: currentOwnerPercent,
      originalManagerPercent: currentManagerPercent,
      newOwnerPercent: proposedOwnerPercent,
      newManagerPercent: proposedManagerPercent,
      effectiveOwnerPercent: getEffectiveOwnerPercent(proposedOwnerPercent),
      effectiveManagerPercent: getEffectiveManagerPercent(proposedManagerPercent),
      negotiationRound: invitation.negotiationRounds + 1,
      maxRounds: MAX_NEGOTIATION_ROUNDS,
      counterOfferMessage: message,
      respondUrl,
      expiresAt: newExpiresAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const emailTemplate = getCounterOfferTemplate(emailData)
    await sendEmail({
      to: notifyEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'counter_offer_sent',
        entityType: 'ManagementInvitation',
        entityId: invitation.id,
        metadata: {
          round: invitation.negotiationRounds + 1,
          proposedOwnerPercent,
          proposedManagerPercent,
          previousOwnerPercent: currentOwnerPercent,
          previousManagerPercent: currentManagerPercent
        }
      }
    })

    console.log(`[Fleet Invitation] Counter-offer round ${invitation.negotiationRounds + 1}: ${proposedOwnerPercent}/${proposedManagerPercent}`)

    return NextResponse.json({
      success: true,
      message: 'Counter-offer submitted successfully',
      counterOffer: {
        round: invitation.negotiationRounds + 1,
        roundsRemaining: MAX_NEGOTIATION_ROUNDS - (invitation.negotiationRounds + 1),
        proposedOwnerPercent,
        proposedManagerPercent,
        effectiveOwnerPercent: getEffectiveOwnerPercent(proposedOwnerPercent),
        effectiveManagerPercent: getEffectiveManagerPercent(proposedManagerPercent),
        expiresAt: newExpiresAt.toISOString()
      }
    })

  } catch (error) {
    console.error('[Fleet Invitation] Counter-offer error:', error)
    return NextResponse.json(
      { error: 'Failed to submit counter-offer' },
      { status: 500 }
    )
  }
}
