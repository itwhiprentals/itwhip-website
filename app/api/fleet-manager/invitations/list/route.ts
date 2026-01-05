// app/api/fleet-manager/invitations/list/route.ts
// GET /api/fleet-manager/invitations/list - Get invitation list for fleet managers
// Query params:
//   - type: 'sent' | 'received' (required)
//   - status: 'all' | 'pending' | 'accepted' | 'declined' | 'expired' | 'counter_offered' (default: 'all')
//   - limit: number (default: 20)
//   - offset: number (default: 0)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { InvitationDetails, ManagementPermissions, NegotiationHistoryEntry } from '@/app/types/fleet-management'
import { ManagementInvitationStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'sent' | 'received' | null
    const status = searchParams.get('status') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!type || !['sent', 'received'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "sent" or "received"' },
        { status: 400 }
      )
    }

    // Get host profile
    const hostProfile = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      },
      select: {
        id: true,
        isHostManager: true
      }
    })

    if (!hostProfile) {
      return NextResponse.json(
        { error: 'Host profile not found' },
        { status: 404 }
      )
    }

    // Build where clause
    const whereClause: any = {}

    if (type === 'sent') {
      whereClause.senderId = hostProfile.id
    } else {
      whereClause.OR = [
        { recipientId: hostProfile.id },
        { recipientEmail: user.email }
      ]
    }

    // Filter by status
    if (status !== 'all') {
      const statusMap: Record<string, ManagementInvitationStatus> = {
        'pending': 'PENDING',
        'accepted': 'ACCEPTED',
        'declined': 'DECLINED',
        'expired': 'EXPIRED',
        'counter_offered': 'COUNTER_OFFERED',
        'cancelled': 'CANCELLED'
      }
      if (statusMap[status]) {
        whereClause.status = statusMap[status]
      }
    }

    // Fetch invitations
    const [invitations, totalCount] = await Promise.all([
      prisma.managementInvitation.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              user: {
                select: {
                  image: true
                }
              }
            }
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              user: {
                select: {
                  image: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.managementInvitation.count({ where: whereClause })
    ])

    // Get vehicles for invitations that have vehicle IDs
    const allVehicleIds = invitations.flatMap(inv => inv.vehicleIds)
    const vehicles = allVehicleIds.length > 0
      ? await prisma.rentalCar.findMany({
          where: { id: { in: allVehicleIds } },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            photos: true
          }
        })
      : []

    const vehicleMap = new Map(vehicles.map(v => [v.id, v]))

    // Transform to InvitationDetails format
    const formattedInvitations: InvitationDetails[] = invitations.map(inv => {
      // Get vehicles for this invitation
      const invVehicles = inv.vehicleIds
        .map(id => vehicleMap.get(id))
        .filter(Boolean)
        .map(v => ({
          id: v!.id,
          make: v!.make,
          model: v!.model,
          year: v!.year,
          photos: Array.isArray(v!.photos)
            ? (v!.photos as any[]).slice(0, 1).map(p => p?.url || p).filter(Boolean)
            : []
        }))

      // Build permissions object
      const permissions: ManagementPermissions = {
        canEditListing: inv.proposedCanEditListing,
        canAdjustPricing: inv.proposedCanAdjustPricing,
        canCommunicateGuests: inv.proposedCanCommunicateGuests,
        canApproveBookings: inv.proposedCanApproveBookings,
        canHandleIssues: inv.proposedCanHandleIssues
      }

      // Parse negotiation history
      let negotiationHistory: NegotiationHistoryEntry[] = []
      if (inv.negotiationHistory) {
        try {
          negotiationHistory = Array.isArray(inv.negotiationHistory)
            ? inv.negotiationHistory as NegotiationHistoryEntry[]
            : JSON.parse(inv.negotiationHistory as string)
        } catch {
          negotiationHistory = []
        }
      }

      return {
        id: inv.id,
        token: inv.token,
        type: inv.type,
        sender: {
          id: inv.sender.id,
          name: inv.sender.name || 'Unknown',
          email: inv.sender.email,
          profilePhoto: inv.sender.user?.image || undefined
        },
        recipientEmail: inv.recipientEmail,
        recipient: inv.recipient ? {
          id: inv.recipient.id,
          name: inv.recipient.name || 'Unknown',
          email: inv.recipient.email
        } : undefined,
        vehicles: invVehicles.length > 0 ? invVehicles : undefined,
        proposedOwnerPercent: Number(inv.proposedOwnerPercent),
        proposedManagerPercent: Number(inv.proposedManagerPercent),
        counterOfferOwnerPercent: inv.counterOfferOwnerPercent
          ? Number(inv.counterOfferOwnerPercent)
          : undefined,
        counterOfferManagerPercent: inv.counterOfferManagerPercent
          ? Number(inv.counterOfferManagerPercent)
          : undefined,
        negotiationRounds: inv.negotiationRounds,
        negotiationHistory,
        permissions,
        status: inv.status as InvitationDetails['status'],
        expiresAt: inv.expiresAt.toISOString(),
        createdAt: inv.createdAt.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      invitations: formattedInvitations,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + invitations.length < totalCount
      }
    })

  } catch (error) {
    console.error('[Invitation List] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}
