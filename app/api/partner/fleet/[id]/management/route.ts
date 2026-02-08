// app/api/partner/fleet/[id]/management/route.ts
// Get and manage vehicle management assignments (partner's perspective)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET - Get current management status for a vehicle
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: vehicleId } = await context.params

    // Get the partner's RentalHost record
    const partner = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: user.userId },
          { id: user.userId }
        ]
      },
      select: { id: true }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Verify vehicle belongs to this partner (hostId = owner for partners)
    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id: vehicleId,
        hostId: partner.id
      },
      select: {
        id: true,
        hostId: true,
        year: true,
        make: true,
        model: true
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or not owned by you' },
        { status: 404 }
      )
    }

    // Get current management assignment (if any)
    const management = await prisma.vehicleManagement.findFirst({
      where: {
        vehicleId: vehicleId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        status: true,
        ownerCommissionPercent: true,
        managerCommissionPercent: true,
        canEditListing: true,
        canAdjustPricing: true,
        canCommunicateGuests: true,
        canApproveBookings: true,
        canHandleIssues: true,
        createdAt: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            businessName: true,
            city: true,
            rating: true,
            totalTrips: true
          }
        }
      }
    })

    // Get pending invitations for this vehicle (vehicleIds is an array)
    const pendingInvitations = await prisma.managementInvitation.findMany({
      where: {
        vehicleIds: { has: vehicleId },
        status: 'PENDING',
        type: 'OWNER_INVITES_MANAGER'
      },
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Check if self-managed (hostId === ownerId)
    const isSelfManaged = vehicle.hostId === partner.id || !management

    return NextResponse.json({
      success: true,
      vehicleId,
      isSelfManaged,
      management: management ? {
        id: management.id,
        status: management.status,
        ownerPercent: Number(management.ownerCommissionPercent),
        managerPercent: Number(management.managerCommissionPercent),
        startDate: management.createdAt,
        manager: management.manager,
        permissions: {
          canEditListing: management.canEditListing,
          canAdjustPricing: management.canAdjustPricing,
          canCommunicate: management.canCommunicateGuests,
          canApproveBookings: management.canApproveBookings,
          canHandleIssues: management.canHandleIssues
        }
      } : null,
      pendingInvitations: pendingInvitations.map(inv => ({
        id: inv.id,
        recipientEmail: inv.recipientEmail,
        recipient: inv.recipient,
        proposedOwnerPercent: Number(inv.proposedOwnerPercent),
        proposedManagerPercent: Number(inv.proposedManagerPercent),
        status: inv.status,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt
      }))
    })

  } catch (error: any) {
    console.error('[Vehicle Management GET] Error:', error?.message || error)
    console.error('[Vehicle Management GET] Stack:', error?.stack)
    return NextResponse.json(
      { error: error?.message || 'Failed to get vehicle management' },
      { status: 500 }
    )
  }
}

// DELETE - Remove manager assignment (end management agreement)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: vehicleId } = await context.params

    // Get the partner's RentalHost record
    const partner = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: user.userId },
          { id: user.userId }
        ]
      },
      select: { id: true, name: true }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Verify vehicle belongs to this partner (hostId = owner for partners)
    const vehicle = await prisma.rentalCar.findFirst({
      where: {
        id: vehicleId,
        hostId: partner.id
      },
      select: {
        id: true,
        hostId: true,
        year: true,
        make: true,
        model: true
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or not owned by you' },
        { status: 404 }
      )
    }

    // Find active management
    const management = await prisma.vehicleManagement.findFirst({
      where: {
        vehicleId: vehicleId,
        status: 'ACTIVE'
      },
      include: {
        manager: { select: { id: true, name: true, email: true } }
      }
    })

    if (!management) {
      return NextResponse.json(
        { error: 'No active management to remove' },
        { status: 400 }
      )
    }

    // End management agreement
    await prisma.$transaction(async (tx) => {
      // Update management status
      await tx.vehicleManagement.update({
        where: { id: management.id },
        data: {
          status: 'TERMINATED' as any,
          updatedAt: new Date()
        }
      })

      // Set vehicle back to self-managed (hostId = partner.id)
      await tx.rentalCar.update({
        where: { id: vehicleId },
        data: { hostId: partner.id }
      })

      // Log the action
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'MANAGEMENT_TERMINATED',
          entityType: 'VEHICLE_MANAGEMENT',
          entityId: management.id,
          hostId: partner.id,
          category: 'FLEET',
          severity: 'INFO',
          metadata: {
            description: `${partner.name} ended management agreement`,
            vehicleId,
            vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            managerId: management.manager.id,
            managerName: management.manager.name
          }
        }
      })

      // Create notification for the manager
      await tx.hostNotification.create({
        data: {
          recipientId: management.manager.id,
          recipientType: 'HOST',
          type: 'MANAGEMENT_ENDED',
          title: 'Management Agreement Ended',
          message: `${partner.name} has ended your management of their ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          priority: 'HIGH',
          actionUrl: `/host/fleet`
        } as any
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Management agreement terminated successfully'
    })

  } catch (error) {
    console.error('[Vehicle Management DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to remove management' },
      { status: 500 }
    )
  }
}
