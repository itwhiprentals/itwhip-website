// app/api/invitations/send/route.ts
// POST /api/invitations/send - Create and send fleet management invitation

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendEmail } from '@/app/lib/email/send-email'
import { getManagementInvitationTemplate } from '@/app/lib/email/templates/management-invitation'
import { getEffectiveOwnerPercent, getEffectiveManagerPercent, validateCommissionSplit } from '@/app/lib/commission/calculate-split'
import {
  CreateInvitationPayload,
  DEFAULT_OWNER_PERCENT,
  DEFAULT_MANAGER_PERCENT,
  DEFAULT_PERMISSIONS,
  INVITATION_EXPIRY_DAYS
} from '@/app/types/fleet-management'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get sender's host profile
    const senderHost = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        isHostManager: true,
        isVehicleOwner: true,
        managesOthersCars: true
      }
    })

    if (!senderHost) {
      return NextResponse.json(
        { error: 'Host profile not found. Please complete your host registration first.' },
        { status: 404 }
      )
    }

    // Parse request body
    const body: CreateInvitationPayload = await request.json()
    const {
      type,
      recipientEmail,
      vehicleIds = [],
      proposedOwnerPercent = DEFAULT_OWNER_PERCENT,
      proposedManagerPercent = DEFAULT_MANAGER_PERCENT,
      permissions = DEFAULT_PERMISSIONS
    } = body

    // Validate invitation type
    if (!type || !['OWNER_INVITES_MANAGER', 'MANAGER_INVITES_OWNER'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid invitation type. Must be OWNER_INVITES_MANAGER or MANAGER_INVITES_OWNER' },
        { status: 400 }
      )
    }

    // Validate recipient email
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid recipient email is required' },
        { status: 400 }
      )
    }

    // Prevent self-invitation
    if (recipientEmail.toLowerCase() === senderHost.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'You cannot send an invitation to yourself' },
        { status: 400 }
      )
    }

    // Validate commission split
    const validationError = validateCommissionSplit(proposedOwnerPercent, proposedManagerPercent)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // Type-specific validations
    if (type === 'OWNER_INVITES_MANAGER') {
      // Owner inviting manager - must have vehicles
      if (!vehicleIds || vehicleIds.length === 0) {
        return NextResponse.json(
          { error: 'You must select at least one vehicle to be managed' },
          { status: 400 }
        )
      }

      // Verify sender owns these vehicles
      const ownedVehicles = await prisma.rentalCar.findMany({
        where: {
          id: { in: vehicleIds },
          hostId: senderHost.id
        },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          photos: {
            take: 1,
            orderBy: { isHero: 'desc' }
          },
          vehicleManagement: {
            select: { id: true, managerId: true }
          }
        }
      })

      if (ownedVehicles.length !== vehicleIds.length) {
        return NextResponse.json(
          { error: 'One or more vehicles not found or you do not own them' },
          { status: 400 }
        )
      }

      // Check if any vehicles already have managers
      const managedVehicles = ownedVehicles.filter(v => v.vehicleManagement)
      if (managedVehicles.length > 0) {
        return NextResponse.json(
          { error: `${managedVehicles.length} vehicle(s) already have a manager assigned` },
          { status: 400 }
        )
      }
    }

    // Check for existing pending invitation to same recipient
    const existingInvitation = await prisma.managementInvitation.findFirst({
      where: {
        senderId: senderHost.id,
        recipientEmail: recipientEmail.toLowerCase(),
        status: { in: ['PENDING', 'COUNTER_OFFERED'] },
        expiresAt: { gt: new Date() }
      }
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'You already have a pending invitation to this email address' },
        { status: 400 }
      )
    }

    // Check if recipient already has a host profile
    const recipientHost = await prisma.rentalHost.findFirst({
      where: { email: recipientEmail.toLowerCase() },
      select: { id: true, name: true, email: true }
    })

    // Get vehicle details for email
    let vehicleDetails: { make: string; model: string; year: number; photo?: string }[] = []
    if (vehicleIds.length > 0) {
      const vehicles = await prisma.rentalCar.findMany({
        where: { id: { in: vehicleIds } },
        select: {
          make: true,
          model: true,
          year: true,
          photos: {
            take: 1,
            orderBy: { isHero: 'desc' }
          }
        }
      })
      vehicleDetails = vehicles.map(v => ({
        make: v.make,
        model: v.model,
        year: v.year,
        photo: v.photos[0]?.url
      }))
    }

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS)

    // Create invitation
    const invitation = await prisma.managementInvitation.create({
      data: {
        id: crypto.randomUUID(),
        token: crypto.randomUUID(),
        updatedAt: new Date(),
        type,
        senderId: senderHost.id,
        recipientId: recipientHost?.id,
        recipientEmail: recipientEmail.toLowerCase(),
        vehicleIds,
        proposedOwnerPercent,
        proposedManagerPercent,
        proposedCanEditListing: permissions.canEditListing,
        proposedCanAdjustPricing: permissions.canAdjustPricing,
        proposedCanCommunicateGuests: permissions.canCommunicateGuests,
        proposedCanApproveBookings: permissions.canApproveBookings,
        proposedCanHandleIssues: permissions.canHandleIssues,
        status: 'PENDING',
        expiresAt,
        negotiationHistory: [{
          round: 0,
          proposedBy: type === 'OWNER_INVITES_MANAGER' ? 'OWNER' : 'MANAGER',
          ownerPercent: proposedOwnerPercent,
          managerPercent: proposedManagerPercent,
          timestamp: new Date().toISOString()
        }]
      } as any
    })

    // Send invitation email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'
    const inviteUrl = type === 'OWNER_INVITES_MANAGER'
      ? `${baseUrl}/invite/manage/${invitation.token}`
      : `${baseUrl}/invite/owner/${invitation.token}`

    const emailData = {
      recipientName: recipientHost?.name || recipientEmail.split('@')[0],
      recipientEmail: recipientEmail.toLowerCase(),
      senderName: senderHost.name,
      senderEmail: senderHost.email,
      senderPhoto: senderHost.profilePhoto || undefined,
      invitationType: type,
      vehicles: vehicleDetails,
      proposedOwnerPercent,
      proposedManagerPercent,
      effectiveOwnerPercent: getEffectiveOwnerPercent(proposedOwnerPercent),
      effectiveManagerPercent: getEffectiveManagerPercent(proposedManagerPercent),
      permissions,
      inviteUrl,
      expiresAt: expiresAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const emailTemplate = getManagementInvitationTemplate(emailData)

    await sendEmail({
      to: recipientEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        action: 'invitation_sent',
        entityType: 'ManagementInvitation',
        entityId: invitation.id,
        metadata: {
          type,
          recipientEmail,
          proposedOwnerPercent,
          proposedManagerPercent,
          vehicleCount: vehicleIds.length
        }
      }
    })

    console.log(`[Fleet Invitation] Sent ${type} from ${senderHost.email} to ${recipientEmail}`)

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        token: invitation.token,
        type: invitation.type,
        recipientEmail: invitation.recipientEmail,
        status: invitation.status,
        expiresAt: invitation.expiresAt.toISOString()
      }
    })

  } catch (error) {
    console.error('[Fleet Invitation] Send error:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
