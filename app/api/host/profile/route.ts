// app/api/host/profile/route.ts - ENHANCED WITH INSURANCE ACTIVITY LOGGING

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'

// ========== DUAL-ROLE SYNC IMPORTS ==========
import { syncEmailAcrossProfiles, syncPhoneAcrossProfiles } from '@/app/lib/dual-role/sync-profile'
import { sendEmailChangeNotification, sendPhoneChangeNotification } from '@/app/lib/dual-role/notifications'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!userId) {
    return null
  }
  
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

// ✅ NEW: Log profile/insurance activity
async function logProfileActivity(params: {
  hostId: string
  hostName: string
  action: string
  category: string
  changes?: any
  metadata?: any
}) {
  const { hostId, hostName, action, category, changes, metadata } = params

  let description = ''
  switch (action) {
    case 'PROFILE_UPDATED':
      description = `Profile information updated`
      break
    case 'INSURANCE_ADDED':
      description = `${metadata?.insuranceType || 'Insurance'} added`
      break
    case 'INSURANCE_UPDATED':
      description = `${metadata?.insuranceType || 'Insurance'} updated`
      break
    case 'INSURANCE_REMOVED':
      description = `${metadata?.insuranceType || 'Insurance'} removed`
      break
    case 'BANK_ACCOUNT_ADDED':
      description = `Bank account added`
      break
    case 'BANK_ACCOUNT_UPDATED':
      description = `Bank account updated`
      break
    case 'SETTINGS_UPDATED':
      description = `Settings updated`
      break
    default:
      description = action.toLowerCase().replace(/_/g, ' ')
  }

  await prisma.activityLog.create({
    data: {
      entityType: 'HOST',
      entityId: hostId,
      hostId: hostId,
      action: action,
      category: category,
      severity: 'INFO',
      description: description,
      oldValue: changes?.oldValues ? JSON.stringify(changes.oldValues) : null,
      newValue: changes?.newValues ? JSON.stringify(changes.newValues) : null,
      metadata: JSON.stringify({
        ...metadata,
        hostName,
        timestamp: new Date().toISOString()
      }),
      createdAt: new Date()
    }
  })
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
    
    const profile = {
      id: host.id,
      email: host.email,
      name: host.name,
      phone: host.phone,
      profilePhoto: host.profilePhoto,
      bio: host.bio,
      city: host.city,
      state: host.state,
      zipCode: host.zipCode,
      isVerified: host.isVerified,
      verifiedAt: host.verifiedAt,
      verificationLevel: host.verificationLevel,
      responseTime: host.responseTime,
      responseRate: host.responseRate,
      acceptanceRate: host.acceptanceRate,
      totalTrips: host.totalTrips || totalBookings,
      rating: host.rating,
      governmentIdUrl: host.governmentIdUrl,
      driversLicenseUrl: host.driversLicenseUrl,
      insuranceDocUrl: host.insuranceDocUrl,
      documentsVerified: host.documentsVerified,
      documentStatuses: host.documentStatuses,
      earningsTier: host.earningsTier,
      usingLegacyInsurance: host.usingLegacyInsurance,
      insuranceProviderId: host.insuranceProviderId,
      insuranceProvider: host.insuranceProvider,
      insurancePolicyNumber: host.insurancePolicyNumber,
      insuranceActive: host.insuranceActive,
      insuranceAssignedAt: host.insuranceAssignedAt,
      insuranceAssignedBy: host.insuranceAssignedBy,
      hostInsuranceProvider: host.hostInsuranceProvider,
      hostPolicyNumber: host.hostPolicyNumber,
      hostInsuranceExpires: host.hostInsuranceExpires,
      hostInsuranceStatus: host.hostInsuranceStatus,
      hostInsuranceDeactivatedAt: host.hostInsuranceDeactivatedAt,
      deactivationReason: host.deactivationReason,
      p2pInsuranceStatus: host.p2pInsuranceStatus,
      p2pInsuranceProvider: host.p2pInsuranceProvider,
      p2pPolicyNumber: host.p2pPolicyNumber,
      p2pInsuranceExpires: host.p2pInsuranceExpires,
      p2pInsuranceActive: host.p2pInsuranceActive,
      commercialInsuranceStatus: host.commercialInsuranceStatus,
      commercialInsuranceProvider: host.commercialInsuranceProvider,
      commercialPolicyNumber: host.commercialPolicyNumber,
      commercialInsuranceExpires: host.commercialInsuranceExpires,
      commercialInsuranceActive: host.commercialInsuranceActive,
      bankAccountInfo: host.bankVerified ? { verified: true } : null,
      bankVerified: host.bankVerified,
      autoApproveBookings: host.autoApproveBookings,
      requireDeposit: host.requireDeposit,
      depositAmount: host.depositAmount,
      commissionRate: host.commissionRate,
      approvalStatus: host.approvalStatus,
      pendingActions: host.pendingActions,
      restrictionReasons: host.restrictionReasons,
      suspendedReason: host.suspendedReason,
      rejectedReason: host.rejectedReason,
      active: host.active,
      joinedAt: host.joinedAt,
      approvedAt: host.approvedAt,
      approvedBy: host.approvedBy,
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

// PUT - Update host profile (ENHANCED WITH ACTIVITY LOGGING)
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

    // ========== HOST DISPLAY NAME LOCK ==========
    // Prevent approved hosts from changing their display name
    if (host.approvedAt && body.name) {
      return NextResponse.json({
        error: 'Display name is locked',
        message: 'Your display name cannot be changed after approval. This protects your reputation and guest trust. Contact support if you need to update it.',
        code: 'NAME_LOCKED_AFTER_APPROVAL'
      }, { status: 403 })
    }
    // ========== END NAME LOCK ==========

    // ========== DUAL-ROLE EMAIL/PHONE SYNC ==========
    // Handle email change - sync across User + RentalHost + ReviewerProfile
    if (body.email && body.email !== host.email) {
      const oldEmail = host.email
      const userId = host.userId || host.user?.id

      if (!userId) {
        return NextResponse.json(
          { error: 'Cannot sync email: User ID not found' },
          { status: 400 }
        )
      }

      const result = await syncEmailAcrossProfiles(userId, body.email, oldEmail)

      if (!result.success) {
        console.error('[Host Profile] Email sync failed:', result.error)
        return NextResponse.json(
          { error: result.error || 'Failed to sync email across profiles' },
          { status: 500 }
        )
      }

      // Send security notifications to both old and new email addresses
      try {
        await sendEmailChangeNotification(
          host.name || 'User',
          oldEmail,
          body.email,
          request.headers.get('user-agent') || 'Unknown device',
          request.headers.get('x-forwarded-for') || 'Unknown IP'
        )
      } catch (emailError) {
        console.error('[Host Profile] Email notification failed:', emailError)
        // Continue - don't block profile update if email fails
      }
    }

    // Handle phone change - sync across User + RentalHost + ReviewerProfile
    if (body.phone && body.phone !== host.phone) {
      const userId = host.userId || host.user?.id

      if (!userId) {
        return NextResponse.json(
          { error: 'Cannot sync phone: User ID not found' },
          { status: 400 }
        )
      }

      const result = await syncPhoneAcrossProfiles(userId, body.phone)

      if (!result.success) {
        console.error('[Host Profile] Phone sync failed:', result.error)
        return NextResponse.json(
          { error: result.error || 'Failed to sync phone across profiles' },
          { status: 500 }
        )
      }

      // Send notification
      try {
        await sendPhoneChangeNotification(
          host.name || 'User',
          host.email,
          host.phone || 'None',
          body.phone
        )
      } catch (emailError) {
        console.error('[Host Profile] Phone notification failed:', emailError)
        // Continue - don't block profile update if email fails
      }
    }
    // ========== END DUAL-ROLE SYNC ==========

    // Validate input - Remove 'name' from allowedFields for approved hosts
    const allowedFields = host.approvedAt
      ? [
          // No 'name' field for approved hosts
          'phone',
          'bio',
          'city',
          'state',
          'zipCode',
          'autoApproveBookings',
          'requireDeposit',
          'depositAmount'
        ]
      : [
          'name', // Unapproved hosts can update name
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

    // ✅ TRACK CHANGES FOR ACTIVITY LOG
    const changedFields = Object.keys(updateData)
    const oldValues: any = {}
    const newValues: any = {}

    for (const field of changedFields) {
      oldValues[field] = (host as any)[field]
      newValues[field] = updateData[field]
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

    // ✅ LOG PROFILE UPDATE
    if (changedFields.length > 0) {
      await logProfileActivity({
        hostId: host.id,
        hostName: host.name || host.email,
        action: 'PROFILE_UPDATED',
        category: 'DOCUMENT',
        changes: {
          updated: changedFields,
          oldValues,
          newValues
        },
        metadata: {
          fields: changedFields
        }
      })
    }
    
    // Return updated profile
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
      earningsTier: updatedHost.earningsTier,
      usingLegacyInsurance: updatedHost.usingLegacyInsurance,
      insuranceProviderId: updatedHost.insuranceProviderId,
      insuranceProvider: updatedHost.insuranceProvider,
      insurancePolicyNumber: updatedHost.insurancePolicyNumber,
      insuranceActive: updatedHost.insuranceActive,
      insuranceAssignedAt: updatedHost.insuranceAssignedAt,
      insuranceAssignedBy: updatedHost.insuranceAssignedBy,
      hostInsuranceProvider: updatedHost.hostInsuranceProvider,
      hostPolicyNumber: updatedHost.hostPolicyNumber,
      hostInsuranceExpires: updatedHost.hostInsuranceExpires,
      hostInsuranceStatus: updatedHost.hostInsuranceStatus,
      hostInsuranceDeactivatedAt: updatedHost.hostInsuranceDeactivatedAt,
      p2pInsuranceStatus: updatedHost.p2pInsuranceStatus,
      p2pInsuranceProvider: updatedHost.p2pInsuranceProvider,
      p2pPolicyNumber: updatedHost.p2pPolicyNumber,
      p2pInsuranceExpires: updatedHost.p2pInsuranceExpires,
      p2pInsuranceActive: updatedHost.p2pInsuranceActive,
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

// DELETE - Deactivate host account (ENHANCED)
export async function DELETE(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
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
    
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        active: false,
        updatedAt: new Date()
      }
    })
    
    await prisma.rentalCar.updateMany({
      where: { hostId: host.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    // ✅ LOG ACCOUNT DEACTIVATION
    await logProfileActivity({
      hostId: host.id,
      hostName: host.name || host.email,
      action: 'ACCOUNT_DEACTIVATED',
      category: 'DOCUMENT',
      metadata: {
        reason: 'host_requested',
        activeBookings: 0
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