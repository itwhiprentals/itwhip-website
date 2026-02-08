// app/fleet/api/hosts/[id]/approve/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      commissionRate = 0.20,
      minDailyRate = 50,
      maxDailyRate = 500,
      permissions = {
        canViewBookings: true,
        canEditCalendar: true,
        canSetPricing: false,
        canMessageGuests: true,
        canWithdrawFunds: false
      },
      notes
    } = body

    // Fetch the host to ensure they exist and are pending
    const host = await prisma.rentalHost.findUnique({
      where: { id },
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

    if (host.approvalStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Host is not pending approval' },
        { status: 400 }
      )
    }

    // Update host to approved status with settings
    const updatedHost = await prisma.rentalHost.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        hostType: 'REAL',
        dashboardAccess: true,
        active: true,
        isVerified: true,
        verifiedAt: new Date(),
        documentsVerified: true,
        
        // Set permissions
        canViewBookings: permissions.canViewBookings,
        canEditCalendar: permissions.canEditCalendar,
        canSetPricing: permissions.canSetPricing,
        canMessageGuests: permissions.canMessageGuests,
        canWithdrawFunds: permissions.canWithdrawFunds,
        
        // Set boundaries
        minDailyRate,
        maxDailyRate,
        commissionRate,
        
        // Approval tracking
        approvedBy: request.headers.get('user-email') || 'fleet-admin',
        approvedAt: new Date()
      }
    })

    // Activate all their cars if they have any
    if (host.cars.length > 0) {
      await prisma.rentalCar.updateMany({
        where: { hostId: id },
        data: { isActive: true }
      })
    }

    // Update the admin notification
    await prisma.adminNotification.updateMany({
      where: {
        relatedId: id,
        type: 'HOST_APPLICATION',
        status: { not: 'RESOLVED' }
      },
      data: {
        status: 'RESOLVED',
        resolvedBy: request.headers.get('user-email') || 'fleet-admin',
        resolvedAt: new Date(),
        resolution: 'Application approved'
      }
    })

    // Create audit log for approval
    await prisma.auditLog.create({
      data: {
        category: 'HOST_MANAGEMENT',
        eventType: 'host_approved',
        severity: 'INFO',
        userId: host.userId,
        adminEmail: request.headers.get('user-email') || 'fleet-admin',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'approve',
        resource: 'host',
        resourceId: id,
        details: {
          hostName: host.name,
          hostEmail: host.email,
          commissionRate,
          minDailyRate,
          maxDailyRate,
          permissions,
          notes
        },
        metadata: {
          approvalTime: new Date().toISOString(),
          carsActivated: host.cars.length
        },
        hash: '',
        verified: false
      } as any
    })

    // Send approval email (placeholder - implement your email service)
    // await sendEmail({
    //   to: host.email,
    //   subject: 'Welcome to ItWhip - You\'re Approved!',
    //   template: 'host-approved',
    //   data: {
    //     name: host.name,
    //     dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/host/dashboard`
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Host approved successfully',
      data: {
        hostId: updatedHost.id,
        name: updatedHost.name,
        email: updatedHost.email,
        approvalStatus: updatedHost.approvalStatus,
        dashboardAccess: updatedHost.dashboardAccess,
        permissions: {
          canViewBookings: updatedHost.canViewBookings,
          canEditCalendar: updatedHost.canEditCalendar,
          canSetPricing: updatedHost.canSetPricing,
          canMessageGuests: updatedHost.canMessageGuests,
          canWithdrawFunds: updatedHost.canWithdrawFunds
        }
      }
    })

  } catch (error) {
    console.error('Failed to approve host:', error)
    return NextResponse.json(
      { error: 'Failed to approve host' },
      { status: 500 }
    )
  }
}

// Reject host application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Fetch the host
    const host = await prisma.rentalHost.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    if (host.approvalStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Host is not pending approval' },
        { status: 400 }
      )
    }

    // Update host to rejected status
    const updatedHost = await prisma.rentalHost.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        dashboardAccess: false,
        active: false,
        rejectedReason: reason,
        approvedBy: request.headers.get('user-email') || 'fleet-admin',
        approvedAt: new Date() // Track when the decision was made
      }
    })

    // Update the admin notification
    await prisma.adminNotification.updateMany({
      where: {
        relatedId: id,
        type: 'HOST_APPLICATION',
        status: { not: 'RESOLVED' }
      },
      data: {
        status: 'RESOLVED',
        resolvedBy: request.headers.get('user-email') || 'fleet-admin',
        resolvedAt: new Date(),
        resolution: `Application rejected: ${reason}`
      }
    })

    // Create audit log for rejection
    await prisma.auditLog.create({
      data: {
        category: 'HOST_MANAGEMENT',
        eventType: 'host_rejected',
        severity: 'INFO',
        userId: host.userId,
        adminEmail: request.headers.get('user-email') || 'fleet-admin',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'reject',
        resource: 'host',
        resourceId: id,
        details: {
          hostName: host.name,
          hostEmail: host.email,
          rejectionReason: reason
        },
        hash: '',
        verified: false
      } as any
    })

    // Send rejection email (placeholder - implement your email service)
    // await sendEmail({
    //   to: host.email,
    //   subject: 'ItWhip Host Application Update',
    //   template: 'host-rejected',
    //   data: {
    //     name: host.name,
    //     reason
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Host application rejected',
      data: {
        hostId: updatedHost.id,
        status: updatedHost.approvalStatus
      }
    })

  } catch (error) {
    console.error('Failed to reject host:', error)
    return NextResponse.json(
      { error: 'Failed to reject host' },
      { status: 500 }
    )
  }
}