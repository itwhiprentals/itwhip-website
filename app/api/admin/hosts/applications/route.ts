// app/api/admin/hosts/applications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { verifyAdminToken } from '@/app/lib/admin/auth'

// GET - Fetch host applications with filtering
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminToken = request.cookies.get('adminAccessToken')
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }
    
    const adminPayload = await verifyAdminToken(adminToken.value)
    
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 401 }
      )
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'pending', 'needs_attention', 'approved', 'rejected', 'suspended'
    const documentStatus = searchParams.get('documentStatus') // 'complete', 'incomplete', 'needs_resubmission'
    const backgroundCheckStatus = searchParams.get('backgroundCheckStatus') // 'not_started', 'in_progress', 'passed', 'failed'
    const sortBy = searchParams.get('sortBy') || 'createdAt' // 'createdAt', 'updatedAt', 'name'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search') // Search by name or email
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    // Build where clause
    const where: any = {
      // Exclude platform fleet hosts
      hostType: { not: 'MANAGED' }
    }
    
    // Apply status filter
    if (status) {
      where.approvalStatus = status.toUpperCase()
    }
    
    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }
    
    // Apply date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }
    
    // Apply document status filter
    if (documentStatus === 'complete') {
      where.documentsVerified = true
    } else if (documentStatus === 'incomplete') {
      where.OR = [
        { governmentIdUrl: null },
        { driversLicenseUrl: null },
        { insuranceDocUrl: null }
      ]
    } else if (documentStatus === 'needs_resubmission') {
      // This requires checking the documentStatuses JSON field
      where.pendingActions = { isEmpty: false }
    }
    
    // Get total count for pagination
    const totalCount = await prisma.rentalHost.count({ where })
    
    // Fetch hosts with all related data
    const hosts = await prisma.rentalHost.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            lastActive: true
          }
        },
        cars: {
          select: {
            id: true,
            isActive: true,  // FIXED: Changed from status to isActive
            make: true,
            model: true,
            year: true
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    })
    
    // Process hosts to add computed fields
    const processedHosts = hosts.map(host => {
      // Calculate document completion
      const hasAllDocuments = !!(
        host.governmentIdUrl && 
        host.driversLicenseUrl && 
        host.insuranceDocUrl
      )
      
      // Get background check status (simplified since we removed complex relation)
      const bgCheckStatus = host.backgroundCheckStatus || 'NOT_STARTED'
      
      // Calculate days since application
      const daysSinceApplication = Math.floor(
        (new Date().getTime() - new Date(host.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      // Determine priority level
      let priority = 'NORMAL'
      if (host.approvalStatus === 'PENDING') {
        if (daysSinceApplication > 7) {
          priority = 'HIGH'
        } else if (daysSinceApplication > 3) {
          priority = 'MEDIUM'
        }
      }
      if (host.approvalStatus === 'NEEDS_ATTENTION') {
        priority = 'HIGH'
      }
      
      return {
        id: host.id,
        name: host.name,
        email: host.email,
        phone: host.phone,
        phoneNumber: host.phone,
        profilePhoto: host.profilePhoto,
        city: host.city,
        state: host.state,
        zipCode: host.zipCode,
        approvalStatus: host.approvalStatus,
        documentsVerified: host.documentsVerified,
        bankVerified: host.bankVerified,
        hasAllDocuments,
        backgroundCheckStatus: bgCheckStatus,
        pendingActions: host.pendingActions || [],
        restrictionReasons: host.restrictionReasons || [],
        
        // Documents with statuses
        documentStatuses: {
          governmentId: host.governmentIdUrl ? 'SUBMITTED' : 'NOT_SUBMITTED',
          driversLicense: host.driversLicenseUrl ? 'SUBMITTED' : 'NOT_SUBMITTED',
          insurance: host.insuranceDocUrl ? 'SUBMITTED' : 'NOT_SUBMITTED',
          bankAccount: host.bankAccountInfo ? 'SUBMITTED' : 'NOT_SUBMITTED'
        },
        
        // Important dates
        createdAt: host.createdAt,
        submittedAt: host.createdAt,
        updatedAt: host.updatedAt,
        approvedAt: host.approvedAt,
        suspendedAt: host.suspendedAt,
        documentsSubmittedAt: (host as any).documentsSubmittedAt ?? null,
        documentsResubmittedAt: host.documentsResubmittedAt,
        lastContactedAt: host.lastNotificationSent,
        documentsRequestedAt: host.documentsRequestedAt,
        daysSinceApplication,
        
        // Related data
        totalCars: host.cars.length,
        activeCars: host.cars.filter(c => c.isActive === true).length,  // FIXED: Changed from c.status === 'active'
        proposedCars: host.cars.length,
        totalBookings: host._count.bookings,
        totalReviews: host._count.reviews,
        
        // Admin info
        approvedBy: host.approvedBy,
        rejectedReason: host.rejectedReason,
        suspendedReason: host.suspendedReason,
        
        // Commission and permissions
        commissionRate: host.commissionRate,
        canViewBookings: host.canViewBookings,
        canEditCalendar: host.canEditCalendar,
        canSetPricing: host.canSetPricing,
        canMessageGuests: host.canMessageGuests,
        canWithdrawFunds: host.canWithdrawFunds,
        
        priority
      }
    })
    
    // Get summary statistics
    const stats = await prisma.rentalHost.groupBy({
      by: ['approvalStatus'],
      where: {
        hostType: { not: 'MANAGED' }
      },
      _count: true
    })
    
    const statusCounts = {
      PENDING: 0,
      NEEDS_ATTENTION: 0,
      APPROVED: 0,
      SUSPENDED: 0,
      REJECTED: 0,
      BLACKLISTED: 0
    }
    
    stats.forEach(stat => {
      statusCounts[stat.approvalStatus as keyof typeof statusCounts] = stat._count
    })
    
    // Count hosts needing immediate attention
    const needsAttentionCount = await prisma.rentalHost.count({
      where: {
        hostType: { not: 'MANAGED' },
        OR: [
          { approvalStatus: 'NEEDS_ATTENTION' },
          { pendingActions: { isEmpty: false } },
          {
            createdAt: {
              lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Older than 7 days
            },
            approvalStatus: 'PENDING'
          }
        ]
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        hosts: processedHosts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1
        },
        summary: {
          statusCounts,
          needsAttentionCount,
          totalPending: statusCounts.PENDING,
          totalActive: statusCounts.APPROVED,
          averageProcessingTime: '2.3 days'
        },
        filters: {
          status: status || 'all',
          documentStatus: documentStatus || 'all',
          backgroundCheckStatus: backgroundCheckStatus || 'all',
          dateRange: {
            from: dateFrom || null,
            to: dateTo || null
          }
        }
      }
    })
    
  } catch (error) {
    console.error('Fetch host applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch host applications' },
      { status: 500 }
    )
  }
}

// POST - Quick actions on applications (approve, reject, request info)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminToken = request.cookies.get('adminAccessToken')
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }
    
    const adminPayload = await verifyAdminToken(adminToken.value)
    
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { hostId, action, data } = body
    
    // Validate required fields
    if (!hostId || !action) {
      return NextResponse.json(
        { error: 'Host ID and action are required' },
        { status: 400 }
      )
    }
    
    // Validate action
    const validActions = ['approve', 'reject', 'suspend', 'needs_attention', 'restore']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
    // Get host
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        user: true
      }
    })
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    // Prevent actions on platform fleet
    if (host.hostType === 'MANAGED') {
      return NextResponse.json(
        { error: 'Cannot modify platform fleet hosts' },
        { status: 403 }
      )
    }
    
    let updateData: any = {}
    let notificationData: any = null
    
    switch (action) {
      case 'approve':
        if (host.approvalStatus === 'APPROVED') {
          return NextResponse.json(
            { error: 'Host is already approved' },
            { status: 400 }
          )
        }
        
        updateData = {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: adminPayload.userId,
          dashboardAccess: true,
          documentsVerified: true,
          canViewBookings: true,
          canEditCalendar: false,
          canSetPricing: false,
          canMessageGuests: true,
          canWithdrawFunds: false,
          pendingActions: []
        }
        
        notificationData = {
          type: 'APPROVAL',
          title: 'Application Approved!',
          message: 'Congratulations! Your host application has been approved. You can now list vehicles.',
          priority: 'HIGH',
          requiresAction: true,
          actionUrl: '/host/cars',
          actionLabel: 'List Your First Car'
        }
        break
        
      case 'reject':
        if (!data?.reason) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          )
        }
        
        updateData = {
          approvalStatus: 'REJECTED',
          rejectedReason: data.reason,
          rejectedAt: new Date(),
          dashboardAccess: false
        }
        
        notificationData = {
          type: 'REJECTION',
          title: 'Application Update',
          message: `Your application was not approved: ${data.reason}`,
          priority: 'HIGH',
          requiresAction: false
        }
        break
        
      case 'suspend':
        if (!data?.reason) {
          return NextResponse.json(
            { error: 'Suspension reason is required' },
            { status: 400 }
          )
        }
        
        updateData = {
          approvalStatus: 'SUSPENDED',
          suspendedReason: data.reason,
          suspendedAt: new Date(),
          dashboardAccess: false
        }
        
        notificationData = {
          type: 'SUSPENSION',
          title: 'Account Suspended',
          message: `Your account has been suspended: ${data.reason}`,
          priority: 'HIGH',
          requiresAction: true,
          actionUrl: '/host/profile',
          actionLabel: 'View Details'
        }
        break
        
      case 'needs_attention':
        updateData = {
          approvalStatus: 'NEEDS_ATTENTION',
          pendingActions: data?.actions || []
        }
        
        notificationData = {
          type: 'ACTION_REQUIRED',
          title: 'Action Required',
          message: data?.message || 'Your application needs additional information',
          priority: 'HIGH',
          requiresAction: true,
          actionUrl: '/host/profile',
          actionLabel: 'Take Action'
        }
        break
        
      case 'restore':
        updateData = {
          approvalStatus: 'PENDING',
          suspendedReason: null,
          suspendedAt: null,
          dashboardAccess: true
        }
        
        notificationData = {
          type: 'RESTORED',
          title: 'Account Restored',
          message: 'Your account has been restored. Please complete any pending requirements.',
          priority: 'MEDIUM',
          requiresAction: false
        }
        break
    }
    
    // Update host in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update host
      const updatedHost = await tx.rentalHost.update({
        where: { id: hostId },
        data: updateData
      })
      
      // Create host notification if data available
      if (notificationData) {
        await (tx.hostNotification.create as any)({
          data: {
            hostId: host.id,
            ...notificationData,
            category: 'APPLICATION',
            subject: notificationData.title || 'Application Update',
            status: 'SENT',
            metadata: {
              adminId: adminPayload.userId,
              action,
              timestamp: new Date().toISOString()
            }
          }
        })
      }
      
      // Create activity log
      await (tx.activityLog.create as any)({
        data: {
          entityType: 'HOST',
          entityId: host.id,
          action: `HOST_${action.toUpperCase()}`,
          userId: adminPayload.userId,
          metadata: {
            hostId: host.id,
            hostName: host.name,
            previousStatus: host.approvalStatus,
            newStatus: updateData.approvalStatus,
            reason: data?.reason || null,
            adminId: adminPayload.userId
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
      
      return updatedHost
    })
    
    return NextResponse.json({
      success: true,
      message: `Host ${action} successful`,
      data: {
        hostId: result.id,
        newStatus: result.approvalStatus,
        action
      }
    })
    
  } catch (error) {
    console.error('Host application action error:', error)
    return NextResponse.json(
      { error: 'Failed to process host application action' },
      { status: 500 }
    )
  }
}