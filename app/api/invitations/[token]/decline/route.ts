// app/api/invitations/[token]/decline/route.ts
// POST /api/invitations/[token]/decline - Decline fleet management invitation

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendEmail } from '@/app/lib/email/send-email'
import { getInvitationDeclinedTemplate } from '@/app/lib/email/templates/invitation-declined'

interface DeclineBody {
  reason?: string
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
    const body: DeclineBody = await request.json().catch(() => ({}))
    const { reason } = body

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

    // Check status allows decline
    if (!['PENDING', 'COUNTER_OFFERED'].includes(invitation.status)) {
      return NextResponse.json(
        { error: `Cannot decline - invitation status: ${invitation.status}` },
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

    // Record who declined
    const wasCounterOffer = invitation.status === 'COUNTER_OFFERED'

    // Update invitation status
    await prisma.managementInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
        negotiationNotes: reason
          ? `${invitation.negotiationNotes || ''}\n[Decline reason]: ${reason}`.trim()
          : invitation.negotiationNotes
      }
    })

    // Determine who to notify
    const declinerName = userHost?.name || user.name || user.email.split('@')[0]
    const declinerEmail = userHost?.email || user.email

    // Notify the other party
    const notifyEmail = isSender ? invitation.recipientEmail : invitation.sender.email
    const notifyName = isSender
      ? (invitation.recipient?.name || invitation.recipientEmail.split('@')[0])
      : invitation.sender.name

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

    // Send decline notification email
    const emailData = {
      recipientName: notifyName,
      recipientEmail: notifyEmail,
      declinerName,
      declinerEmail,
      invitationType: invitation.type,
      vehicles: vehicleDetails,
      declineReason: reason,
      wasCounterOffer
    }

    const emailTemplate = getInvitationDeclinedTemplate(emailData)
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
        action: 'invitation_declined',
        entityType: 'ManagementInvitation',
        entityId: invitation.id,
        metadata: {
          type: invitation.type,
          wasCounterOffer,
          reason: reason || null,
          declinedByRole: isSender ? 'sender' : 'recipient'
        }
      }
    })

    console.log(`[Fleet Invitation] Declined by ${declinerEmail}${wasCounterOffer ? ' (was counter-offer)' : ''}`)

    return NextResponse.json({
      success: true,
      message: 'Invitation declined successfully'
    })

  } catch (error) {
    console.error('[Fleet Invitation] Decline error:', error)
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    )
  }
}
