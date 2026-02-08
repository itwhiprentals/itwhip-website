// app/api/admin/hosts/[id]/approve/route.ts
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
      commissionRate = 0.20,
      minDailyRate,
      maxDailyRate,
      permissions = {},
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

    // Check if already approved
    if (host.approvalStatus === 'APPROVED') {
      return NextResponse.json(
        { error: 'Host is already approved' },
        { status: 400 }
      )
    }

    // Update host approval status
    const updatedHost = await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        approvalStatus: 'APPROVED',
        commissionRate,
        minDailyRate,
        maxDailyRate,
        approvedBy: adminId,
        approvedAt: new Date(),
        notes: notes || null
      } as any
    })

    // Activate all pending vehicles for this host
    if (host.cars.length > 0) {
      await (prisma as any).car.updateMany({
        where: {
          hostId: hostId,
          isActive: false
        },
        data: {
          isActive: true
        }
      })
    }

    // Create admin notification
    await prisma.adminNotification.create({
      data: {
        id: crypto.randomUUID(),
        type: 'HOST_APPROVED',
        title: `Host Approved: ${host.name}`,
        message: `${host.name} (${host.email}) has been approved as a rental host`,
        metadata: {
          hostId,
          hostName: host.name,
          hostEmail: host.email,
          approvedBy: adminId,
          vehicleCount: host.cars.length
        },
        priority: 'LOW',
        updatedAt: new Date()
      }
    })

    // TODO: Send approval email to host
    // This would integrate with your email service
    console.log(`Approval email should be sent to: ${host.email}`)

    return NextResponse.json({
      success: true,
      message: 'Host approved successfully',
      data: {
        hostId: updatedHost.id,
        approvalStatus: updatedHost.approvalStatus,
        commissionRate: updatedHost.commissionRate,
        approvedAt: updatedHost.approvedAt,
        vehiclesActivated: host.cars.length
      }
    })

  } catch (error) {
    console.error('Error approving host:', error)
    return NextResponse.json(
      { error: 'Failed to approve host' },
      { status: 500 }
    )
  }
}