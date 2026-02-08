// app/api/admin/hosts/[id]/reactivate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params
    const body = await request.json()
    
    const {
      notes,
      reactivateVehicles = true,
      probationPeriod = 30, // days
      restrictedPermissions = false
    } = body

    // Verify admin authentication
    const adminId = request.headers.get('x-admin-id')
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Find the host
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        user: true,
        cars: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Check if host can be reactivated
    if (host.approvalStatus === 'BLACKLISTED') {
      return NextResponse.json(
        { error: 'Blacklisted hosts cannot be reactivated. Please contact senior management.' },
        { status: 403 }
      )
    }

    if (host.approvalStatus !== 'SUSPENDED') {
      return NextResponse.json(
        { error: `Host is not suspended (current status: ${host.approvalStatus})` },
        { status: 400 }
      )
    }

    // Calculate probation end date
    let probationEndDate = null
    if (probationPeriod && probationPeriod > 0) {
      probationEndDate = new Date()
      probationEndDate.setDate(probationEndDate.getDate() + probationPeriod)
    }

    // Prepare permissions (restrict if needed)
    const hostAny: any = host
    let permissions: any = hostAny.permissions || {}
    if (restrictedPermissions) {
      permissions = {
        ...permissions,
        canWithdrawFunds: false,
        canSetPricing: false,
        canEditCalendar: true,
        canViewBookings: true,
        canMessageGuests: true
      }
    }

    // Update host to approved with probation
    const updatedHost = await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        approvalStatus: 'APPROVED',
        suspendedReason: null,
        suspendedAt: null,
        suspensionExpiresAt: null,
      } as any
    })

    // Reactivate vehicles if requested
    let vehiclesReactivated = 0
    if (reactivateVehicles && hostAny.cars.length > 0) {
      const result = await prisma.rentalCar.updateMany({
        where: {
          hostId: hostId,
          isActive: false
        },
        data: {
          isActive: true
        }
      })
      vehiclesReactivated = result.count
    }

    // Create admin notification
    await prisma.adminNotification.create({
      data: {
        type: 'HOST_REACTIVATED',
        title: `Host Reactivated: ${host.name}`,
        message: `${host.name} (${host.email}) has been reactivated${probationPeriod ? ` with ${probationPeriod}-day probation` : ''}`,
        metadata: {
          hostId,
          hostName: host.name,
          hostEmail: host.email,
          reactivatedBy: adminId,
          probationPeriod: probationPeriod || 'none',
          restrictedPermissions,
          vehiclesReactivated,
          previousSuspensionReason: host.suspendedReason
        },
        priority: 'MEDIUM',
      } as any
    })

    // TODO: Send reactivation email to host
    console.log(`Reactivation email should be sent to: ${host.email}`)
    console.log(`Probation period: ${probationPeriod} days`)

    const updatedHostAny: any = updatedHost
    return NextResponse.json({
      success: true,
      message: 'Host reactivated successfully',
      data: {
        hostId: updatedHostAny.id,
        approvalStatus: updatedHostAny.approvalStatus,
        reactivatedAt: new Date().toISOString(),
        probationEndDate: probationEndDate?.toISOString() || null,
        vehiclesReactivated,
        restrictedPermissions,
        permissions
      },
      info: probationPeriod > 0 ? [
        `Host is on probation for ${probationPeriod} days`,
        restrictedPermissions ? 'Restricted permissions applied during probation' : 'Full permissions restored'
      ] : []
    })

  } catch (error) {
    console.error('Error reactivating host:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate host' },
      { status: 500 }
    )
  }
}