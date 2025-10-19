// app/api/host/profile/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'

// Helper to get host ID from session/token
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!userId) {
    return null
  }
  
  // Get host by user ID or host ID with insurance provider
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      },
      insuranceProvider: {
        select: {
          id: true,
          name: true,
          type: true,
          isActive: true,
          coverageNotes: true,
          contractStart: true,
          contractEnd: true,
          revenueShare: true
        }
      }
    }
  })
  
  return host
}

// GET - Fetch host profile
export async function GET(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    // Calculate performance metrics
    const bookingStats = await prisma.rentalBooking.groupBy({
      by: ['hostId'],
      where: {
        hostId: host.id,
        status: {
          in: ['COMPLETED', 'ACTIVE', 'CONFIRMED']
        }
      },
      _count: true
    })
    
    const totalBookings = bookingStats[0]?._count || 0
    
    // Format profile response
    const profile = {
      id: host.id,
      email: host.email,
      name: host.name,
      phone: host.phone,
      profilePhoto: host.profilePhoto,
      bio: host.bio,
      
      // Location
      city: host.city,
      state: host.state,
      zipCode: host.zipCode,
      
      // Verification
      isVerified: host.isVerified,
      verifiedAt: host.verifiedAt,
      verificationLevel: host.verificationLevel,
      
      // Performance
      responseTime: host.responseTime,
      responseRate: host.responseRate,
      acceptanceRate: host.acceptanceRate,
      totalTrips: host.totalTrips || totalBookings,
      rating: host.rating,
      
      // Documents
      governmentIdUrl: host.governmentIdUrl,
      driversLicenseUrl: host.driversLicenseUrl,
      insuranceDocUrl: host.insuranceDocUrl,
      documentsVerified: host.documentsVerified,
      documentStatuses: host.documentStatuses,
      
      // Earnings Tier
      earningsTier: host.earningsTier,
      usingLegacyInsurance: host.usingLegacyInsurance,
      
      // Platform Insurance (assigned by admin)
      insuranceProviderId: host.insuranceProviderId,
      insuranceProvider: host.insuranceProvider,
      insurancePolicyNumber: host.insurancePolicyNumber,
      insuranceActive: host.insuranceActive,
      insuranceAssignedAt: host.insuranceAssignedAt,
      insuranceAssignedBy: host.insuranceAssignedBy,
      
      // Legacy Host Insurance (for backward compatibility)
      hostInsuranceProvider: host.hostInsuranceProvider,
      hostPolicyNumber: host.hostPolicyNumber,
      hostInsuranceExpires: host.hostInsuranceExpires,
      hostInsuranceStatus: host.hostInsuranceStatus,
      hostInsuranceDeactivatedAt: host.hostInsuranceDeactivatedAt,
      deactivationReason: host.deactivationReason,
      
      // NEW: P2P Insurance Fields
      p2pInsuranceStatus: host.p2pInsuranceStatus,
      p2pInsuranceProvider: host.p2pInsuranceProvider,
      p2pPolicyNumber: host.p2pPolicyNumber,
      p2pInsuranceExpires: host.p2pInsuranceExpires,
      p2pInsuranceActive: host.p2pInsuranceActive,
      
      // NEW: Commercial Insurance Fields
      commercialInsuranceStatus: host.commercialInsuranceStatus,
      commercialInsuranceProvider: host.commercialInsuranceProvider,
      commercialPolicyNumber: host.commercialPolicyNumber,
      commercialInsuranceExpires: host.commercialInsuranceExpires,
      commercialInsuranceActive: host.commercialInsuranceActive,
      
      // Banking
      bankAccountInfo: host.bankVerified ? { verified: true } : null,
      bankVerified: host.bankVerified,
      
      // Settings
      autoApproveBookings: host.autoApproveBookings,
      requireDeposit: host.requireDeposit,
      depositAmount: host.depositAmount,
      commissionRate: host.commissionRate,
      
      // Status
      approvalStatus: host.approvalStatus,
      pendingActions: host.pendingActions,
      restrictionReasons: host.restrictionReasons,
      suspendedReason: host.suspendedReason,
      rejectedReason: host.rejectedReason,
      active: host.active,
      joinedAt: host.joinedAt,
      approvedAt: host.approvedAt,
      approvedBy: host.approvedBy,
      
      // Permissions
      canViewBookings: host.canViewBookings,
      canEditCalendar: host.canEditCalendar,
      canSetPricing: host.canSetPricing,
      canMessageGuests: host.canMessageGuests,
      canWithdrawFunds: host.canWithdrawFunds
    }
    
    return NextResponse.json({ profile })
    
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT - Update host profile
export async function PUT(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    
    // Validate input
    const allowedFields = [
      'name',
      'phone',
      'bio',
      'city',
      'state',
      'zipCode',
      'autoApproveBookings',
      'requireDeposit',
      'depositAmount'
    ]
    
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    // Update host profile
    const updatedHost = await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        insuranceProvider: {
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true,
            coverageNotes: true,
            contractStart: true,
            contractEnd: true,
            revenueShare: true
          }
        }
      }
    })
    
    // If name was updated, also update User record
    if (updateData.name && host.userId) {
      await prisma.user.update({
        where: { id: host.userId },
        data: { name: updateData.name }
      })
    }
    
    // Log the update in activity log
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'profile_updated',
        entityType: 'host',
        entityId: host.id,
        metadata: {
          fields: Object.keys(updateData),
          updatedBy: 'host'
        }
      }
    })
    
    // Return updated profile with ALL insurance fields
    const profile = {
      id: updatedHost.id,
      email: updatedHost.email,
      name: updatedHost.name,
      phone: updatedHost.phone,
      profilePhoto: updatedHost.profilePhoto,
      bio: updatedHost.bio,
      city: updatedHost.city,
      state: updatedHost.state,
      zipCode: updatedHost.zipCode,
      isVerified: updatedHost.isVerified,
      verifiedAt: updatedHost.verifiedAt,
      verificationLevel: updatedHost.verificationLevel,
      responseTime: updatedHost.responseTime,
      responseRate: updatedHost.responseRate,
      acceptanceRate: updatedHost.acceptanceRate,
      totalTrips: updatedHost.totalTrips,
      rating: updatedHost.rating,
      governmentIdUrl: updatedHost.governmentIdUrl,
      driversLicenseUrl: updatedHost.driversLicenseUrl,
      insuranceDocUrl: updatedHost.insuranceDocUrl,
      documentsVerified: updatedHost.documentsVerified,
      documentStatuses: updatedHost.documentStatuses,
      
      // Earnings Tier
      earningsTier: updatedHost.earningsTier,
      usingLegacyInsurance: updatedHost.usingLegacyInsurance,
      
      // Platform Insurance
      insuranceProviderId: updatedHost.insuranceProviderId,
      insuranceProvider: updatedHost.insuranceProvider,
      insurancePolicyNumber: updatedHost.insurancePolicyNumber,
      insuranceActive: updatedHost.insuranceActive,
      insuranceAssignedAt: updatedHost.insuranceAssignedAt,
      insuranceAssignedBy: updatedHost.insuranceAssignedBy,
      
      // Legacy Host Insurance
      hostInsuranceProvider: updatedHost.hostInsuranceProvider,
      hostPolicyNumber: updatedHost.hostPolicyNumber,
      hostInsuranceExpires: updatedHost.hostInsuranceExpires,
      hostInsuranceStatus: updatedHost.hostInsuranceStatus,
      hostInsuranceDeactivatedAt: updatedHost.hostInsuranceDeactivatedAt,
      
      // NEW: P2P Insurance
      p2pInsuranceStatus: updatedHost.p2pInsuranceStatus,
      p2pInsuranceProvider: updatedHost.p2pInsuranceProvider,
      p2pPolicyNumber: updatedHost.p2pPolicyNumber,
      p2pInsuranceExpires: updatedHost.p2pInsuranceExpires,
      p2pInsuranceActive: updatedHost.p2pInsuranceActive,
      
      // NEW: Commercial Insurance
      commercialInsuranceStatus: updatedHost.commercialInsuranceStatus,
      commercialInsuranceProvider: updatedHost.commercialInsuranceProvider,
      commercialPolicyNumber: updatedHost.commercialPolicyNumber,
      commercialInsuranceExpires: updatedHost.commercialInsuranceExpires,
      commercialInsuranceActive: updatedHost.commercialInsuranceActive,
      
      bankVerified: updatedHost.bankVerified,
      autoApproveBookings: updatedHost.autoApproveBookings,
      requireDeposit: updatedHost.requireDeposit,
      depositAmount: updatedHost.depositAmount,
      commissionRate: updatedHost.commissionRate,
      approvalStatus: updatedHost.approvalStatus,
      active: updatedHost.active,
      joinedAt: updatedHost.joinedAt
    }
    
    return NextResponse.json({ 
      success: true,
      profile 
    })
    
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// DELETE - Deactivate host account
export async function DELETE(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    // Check for active bookings
    const activeBookings = await prisma.rentalBooking.count({
      where: {
        hostId: host.id,
        status: {
          in: ['CONFIRMED', 'ACTIVE']
        }
      }
    })
    
    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'Cannot deactivate account with active bookings' },
        { status: 400 }
      )
    }
    
    // Deactivate host account
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        active: false,
        updatedAt: new Date()
      }
    })
    
    // Deactivate all cars
    await prisma.rentalCar.updateMany({
      where: { hostId: host.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })
    
    // Log deactivation
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'account_deactivated',
        entityType: 'host',
        entityId: host.id,
        metadata: {
          reason: 'host_requested'
        }
      }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Account deactivated successfully'
    })
    
  } catch (error) {
    console.error('Account deactivation error:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate account' },
      { status: 500 }
    )
  }
}