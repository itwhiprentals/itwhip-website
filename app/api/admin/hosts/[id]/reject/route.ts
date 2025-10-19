// app/api/admin/hosts/[id]/reject/route.ts
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
      rejectionDetails,
      canReapply = true,
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
        { error: 'Rejection reason is required' },
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

    // Check if already rejected or blacklisted
    if (host.approvalStatus === 'REJECTED' || host.approvalStatus === 'BLACKLISTED') {
      return NextResponse.json(
        { error: `Host is already ${host.approvalStatus.toLowerCase()}` },
        { status: 400 }
      )
    }

    // Update host rejection status
    const updatedHost = await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        approvalStatus: 'REJECTED',
        rejectionReason: reason,
        rejectionDetails: rejectionDetails || null,
        canReapply,
        rejectedBy: adminId,
        rejectedAt: new Date(),
        notes: notes || null
      }
    })

    // Deactivate all vehicles for this host
    if (host.cars.length > 0) {
      await prisma.car.updateMany({
        where: {
          hostId: hostId
        },
        data: {
          isActive: false
        }
      })
    }

    // Create admin notification
    await prisma.adminNotification.create({
      data: {
        type: 'HOST_REJECTED',
        title: `Host Rejected: ${host.name}`,
        message: `${host.name} (${host.email}) application was rejected`,
        metadata: {
          hostId,
          hostName: host.name,
          hostEmail: host.email,
          rejectedBy: adminId,
          reason,
          canReapply
        },
        priority: 'MEDIUM',
        category: 'HOST_MANAGEMENT'
      }
    })

    // TODO: Send rejection email to host with reason and next steps
    console.log(`Rejection email should be sent to: ${host.email}`)
    console.log(`Reason: ${reason}`)
    console.log(`Can reapply: ${canReapply}`)

    return NextResponse.json({
      success: true,
      message: 'Host application rejected',
      data: {
        hostId: updatedHost.id,
        approvalStatus: updatedHost.approvalStatus,
        rejectionReason: updatedHost.rejectionReason,
        canReapply: updatedHost.canReapply,
        rejectedAt: updatedHost.rejectedAt,
        vehiclesDeactivated: host.cars.length
      }
    })

  } catch (error) {
    console.error('Error rejecting host:', error)
    return NextResponse.json(
      { error: 'Failed to reject host application' },
      { status: 500 }
    )
  }
}