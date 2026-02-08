// app/api/admin/hosts/[id]/suspend/route.ts
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
      reason,
      suspensionType = 'MANUAL', // MANUAL, PERFORMANCE, POLICY_VIOLATION, DISPUTE, DOCUMENT_EXPIRED
      duration, // in days, null for indefinite
      notes
    } = body

    // Verify admin authentication
    const adminId = request.headers.get('x-admin-id')
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Validation
    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { error: 'Suspension reason is required' },
        { status: 400 }
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

    // Check if already suspended or blacklisted
    if (host.approvalStatus === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Host is already suspended' },
        { status: 400 }
      )
    }

    if (host.approvalStatus === 'BLACKLISTED') {
      return NextResponse.json(
        { error: 'Host is blacklisted and cannot be suspended' },
        { status: 400 }
      )
    }

    // Calculate suspension end date if duration provided
    let suspensionEndDate = null
    if (duration && duration > 0) {
      suspensionEndDate = new Date()
      suspensionEndDate.setDate(suspensionEndDate.getDate() + duration)
    }

    // Update host suspension status
    const updatedHost = await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        approvalStatus: 'SUSPENDED',
        suspendedReason: reason,
        suspendedAt: new Date(),
        suspensionExpiresAt: suspensionEndDate,
      } as any
    })

    // Deactivate all vehicles for this host
    let vehiclesDeactivated = 0
    if ((host as any).cars.length > 0) {
      const result = await prisma.rentalCar.updateMany({
        where: {
          hostId: hostId,
          isActive: true
        },
        data: {
          isActive: false
        }
      })
      vehiclesDeactivated = result.count
    }

    // Check for active bookings and create notifications
    const activeBookings = await prisma.rentalBooking.findMany({
      where: {
        hostId: hostId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        } as any
      },
      include: {
        car: true,
        renter: true
      }
    })

    // Create admin notification
    await prisma.adminNotification.create({
      data: {
        type: 'HOST_SUSPENDED',
        title: `Host Suspended: ${host.name}`,
        message: `${host.name} (${host.email}) has been suspended`,
        metadata: {
          hostId,
          hostName: host.name,
          hostEmail: host.email,
          suspendedBy: adminId,
          reason,
          suspensionType,
          duration: duration || 'indefinite',
          activeBookingsAffected: activeBookings.length,
          vehiclesDeactivated
        },
        priority: 'HIGH',
      } as any
    })

    // TODO: Send suspension email to host
    // TODO: Notify guests with active bookings
    console.log(`Suspension email should be sent to: ${host.email}`)
    console.log(`${activeBookings.length} active bookings need guest notifications`)

    const hostResult: any = updatedHost
    return NextResponse.json({
      success: true,
      message: 'Host suspended successfully',
      data: {
        hostId: hostResult.id,
        approvalStatus: hostResult.approvalStatus,
        suspensionReason: hostResult.suspendedReason,
        suspensionType: suspensionType,
        suspendedAt: hostResult.suspendedAt,
        suspensionEndDate: hostResult.suspensionExpiresAt,
        vehiclesDeactivated,
        activeBookingsAffected: activeBookings.length
      },
      warnings: activeBookings.length > 0 ? [
        `${activeBookings.length} active booking(s) will be affected by this suspension`
      ] : []
    })

  } catch (error) {
    console.error('Error suspending host:', error)
    return NextResponse.json(
      { error: 'Failed to suspend host' },
      { status: 500 }
    )
  }
}