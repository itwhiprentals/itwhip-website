// app/api/invitations/[token]/accept/route.ts
// POST /api/invitations/[token]/accept - Accept fleet management invitation

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendEmail } from '@/app/lib/email/send-email'
import { getInvitationAcceptedTemplate } from '@/app/lib/email/templates/invitation-accepted'
import { getEffectiveOwnerPercent, getEffectiveManagerPercent } from '@/app/lib/commission/calculate-split'

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

    // Find invitation
    const invitation = await prisma.managementInvitation.findUnique({
      where: { token },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true
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

    // Check status
    if (!['PENDING', 'COUNTER_OFFERED'].includes(invitation.status as string)) {
      return NextResponse.json(
        { error: `Invitation cannot be accepted - current status: ${invitation.status}` },
        { status: 400 }
      )
    }

    // Check expiration
    if (new Date() > invitation.expiresAt) {
      await prisma.managementInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' as any }
      })
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Get acceptor's host profile (or create one)
    let acceptorHost = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      }
    })

    // Validate acceptor is the intended recipient
    if (invitation.recipientEmail.toLowerCase() !== user.email.toLowerCase()) {
      // Check if user matches recipientId
      if (invitation.recipientId && acceptorHost?.id !== invitation.recipientId) {
        return NextResponse.json(
          { error: 'You are not the intended recipient of this invitation' },
          { status: 403 }
        )
      }
      // Allow if email doesn't match exactly but user owns the account
      console.log(`[Fleet Invitation] Acceptor email mismatch but proceeding: invite=${invitation.recipientEmail}, user=${user.email}`)
    }

    // If acceptor doesn't have a host profile, create a basic one
    if (!acceptorHost) {
      acceptorHost = await prisma.rentalHost.create({
        data: {
          userId: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          phone: '',
          city: 'Not Set',
          state: 'N/A',
          active: true,
          hostType: 'INDIVIDUAL',
          isVehicleOwner: invitation.type === 'MANAGER_INVITES_OWNER',
          isHostManager: invitation.type === 'OWNER_INVITES_MANAGER',
          managesOthersCars: invitation.type === 'OWNER_INVITES_MANAGER',
          updatedAt: new Date()
        } as any
      })
    }

    // Determine final commission terms (use counter-offer if present)
    const finalOwnerPercent = invitation.counterOfferOwnerPercent
      ? Number(invitation.counterOfferOwnerPercent)
      : Number(invitation.proposedOwnerPercent)
    const finalManagerPercent = invitation.counterOfferManagerPercent
      ? Number(invitation.counterOfferManagerPercent)
      : Number(invitation.proposedManagerPercent)

    // Determine owner and manager based on invitation type
    const isOwnerInvitingManager = invitation.type === 'OWNER_INVITES_MANAGER'
    const ownerId = isOwnerInvitingManager ? invitation.sender.id : acceptorHost.id
    const managerId = isOwnerInvitingManager ? acceptorHost.id : invitation.sender.id

    // Get vehicles to manage
    const vehicleIds = invitation.vehicleIds || []

    // Create vehicle management records and collect vehicle data
    const vehicleManagementRecords = []
    const vehicleDetails = []

    if (vehicleIds.length > 0) {
      // Create management record for each vehicle
      for (const vehicleId of vehicleIds) {
        // Check if vehicle already has management
        const existingManagement = await prisma.vehicleManagement.findUnique({
          where: { vehicleId }
        })

        if (existingManagement) {
          console.log(`[Fleet Invitation] Vehicle ${vehicleId} already has manager, skipping`)
          continue
        }

        const management = await prisma.vehicleManagement.create({
          data: {
            vehicleId,
            ownerId,
            managerId,
            ownerCommissionPercent: finalOwnerPercent,
            managerCommissionPercent: finalManagerPercent,
            canEditListing: invitation.proposedCanEditListing,
            canAdjustPricing: invitation.proposedCanAdjustPricing,
            canCommunicateGuests: invitation.proposedCanCommunicateGuests,
            canApproveBookings: invitation.proposedCanApproveBookings,
            canHandleIssues: invitation.proposedCanHandleIssues,
            status: 'ACTIVE',
            agreementSignedAt: new Date()
          } as any,
          include: {
            vehicle: {
              select: {
                make: true,
                model: true,
                year: true,
                photos: { take: 1, orderBy: { isHero: 'desc' } }
              }
            }
          }
        })

        vehicleManagementRecords.push(management)
        vehicleDetails.push({
          make: management.vehicle.make,
          model: management.vehicle.model,
          year: management.vehicle.year,
          photo: management.vehicle.photos[0]?.url
        })
      }
    }

    // Update sender's flags if needed
    const senderUpdateData: any = {}
    if (isOwnerInvitingManager) {
      // Sender is owner - mark as vehicle owner
      senderUpdateData.isVehicleOwner = true
    } else {
      // Sender is manager - mark as host manager
      senderUpdateData.isHostManager = true
      senderUpdateData.managesOthersCars = true
    }

    if (Object.keys(senderUpdateData).length > 0) {
      await prisma.rentalHost.update({
        where: { id: invitation.sender.id },
        data: senderUpdateData
      })
    }

    // Update acceptor's flags
    const acceptorUpdateData: any = {}
    if (isOwnerInvitingManager) {
      // Acceptor is manager
      acceptorUpdateData.isHostManager = true
      acceptorUpdateData.managesOthersCars = true
    } else {
      // Acceptor is owner
      acceptorUpdateData.isVehicleOwner = true
    }

    await prisma.rentalHost.update({
      where: { id: acceptorHost.id },
      data: acceptorUpdateData
    })

    // Update invitation status
    await prisma.managementInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED' as any,
        recipientId: acceptorHost.id,
        respondedAt: new Date()
      }
    })

    // Prepare email data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'
    const agreementDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const permissions = {
      canEditListing: invitation.proposedCanEditListing,
      canAdjustPricing: invitation.proposedCanAdjustPricing,
      canCommunicateGuests: invitation.proposedCanCommunicateGuests,
      canApproveBookings: invitation.proposedCanApproveBookings,
      canHandleIssues: invitation.proposedCanHandleIssues
    }

    // Send confirmation email to acceptor
    const acceptorEmailData = {
      recipientName: acceptorHost.name,
      recipientEmail: acceptorHost.email,
      otherPartyName: invitation.sender.name,
      otherPartyEmail: invitation.sender.email,
      role: isOwnerInvitingManager ? 'manager' as const : 'owner' as const,
      vehicles: vehicleDetails,
      finalOwnerPercent,
      finalManagerPercent,
      effectiveOwnerPercent: getEffectiveOwnerPercent(finalOwnerPercent),
      effectiveManagerPercent: getEffectiveManagerPercent(finalManagerPercent),
      permissions,
      dashboardUrl: `${baseUrl}/host/dashboard`,
      agreementDate
    }

    const acceptorEmail = getInvitationAcceptedTemplate(acceptorEmailData as any)
    await sendEmail({
      to: acceptorHost.email,
      subject: acceptorEmail.subject,
      html: acceptorEmail.html,
      text: acceptorEmail.text
    })

    // Send confirmation email to sender
    const senderEmailData = {
      recipientName: invitation.sender.name,
      recipientEmail: invitation.sender.email,
      otherPartyName: acceptorHost.name,
      otherPartyEmail: acceptorHost.email,
      role: isOwnerInvitingManager ? 'owner' as const : 'manager' as const,
      vehicles: vehicleDetails,
      finalOwnerPercent,
      finalManagerPercent,
      effectiveOwnerPercent: getEffectiveOwnerPercent(finalOwnerPercent),
      effectiveManagerPercent: getEffectiveManagerPercent(finalManagerPercent),
      permissions,
      dashboardUrl: `${baseUrl}/host/dashboard`,
      agreementDate
    }

    const senderEmail = getInvitationAcceptedTemplate(senderEmailData as any)
    await sendEmail({
      to: invitation.sender.email,
      subject: senderEmail.subject,
      html: senderEmail.html,
      text: senderEmail.text
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        action: 'invitation_accepted',
        entityType: 'ManagementInvitation',
        entityId: invitation.id,
        metadata: {
          type: invitation.type,
          finalOwnerPercent,
          finalManagerPercent,
          vehiclesManaged: vehicleManagementRecords.length
        }
      }
    })

    console.log(`[Fleet Invitation] Accepted: ${invitation.type} by ${acceptorHost.email}`)

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      vehicleManagement: vehicleManagementRecords.map(vm => ({
        id: vm.id,
        vehicleId: vm.vehicleId,
        status: vm.status
      })),
      agreement: {
        ownerPercent: finalOwnerPercent,
        managerPercent: finalManagerPercent,
        effectiveOwnerPercent: getEffectiveOwnerPercent(finalOwnerPercent),
        effectiveManagerPercent: getEffectiveManagerPercent(finalManagerPercent)
      }
    })

  } catch (error) {
    console.error('[Fleet Invitation] Accept error:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
