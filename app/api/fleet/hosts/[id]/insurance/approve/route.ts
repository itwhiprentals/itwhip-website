// app/api/fleet/hosts/[id]/insurance/approve/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// POST - Approve or reject host insurance (P2P or Commercial)
// RULE: Only ONE insurance can be ACTIVE at a time
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params

    // Check for fleet key authentication
    const fleetKey = request.headers.get('x-fleet-key')

    if (fleetKey !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { error: 'Unauthorized. Fleet access required.' },
        { status: 401 }
      )
    }

    // For logging purposes, use fleet admin
    const admin = {
      id: 'fleet-admin',
      email: 'admin@itwhip.com',
      name: 'Fleet Admin',
      role: 'ADMIN'
    }
    const body = await request.json()
    const { action, reason, insuranceType = 'P2P' } = body
    
    // Validate action
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }
    
    // Validate insurance type
    if (!['P2P', 'COMMERCIAL'].includes(insuranceType)) {
      return NextResponse.json(
        { error: 'Insurance type must be either "P2P" or "COMMERCIAL"' },
        { status: 400 }
      )
    }
    
    // Rejection requires reason
    if (action === 'reject' && !reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }
    
    // Get host with all insurance fields
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        email: true,
        name: true,
        earningsTier: true,
        commissionRate: true,
        usingLegacyInsurance: true,
        // P2P fields
        p2pInsuranceProvider: true,
        p2pPolicyNumber: true,
        p2pInsuranceExpires: true,
        p2pInsuranceStatus: true,
        // Commercial fields
        commercialInsuranceProvider: true,
        commercialPolicyNumber: true,
        commercialInsuranceExpires: true,
        commercialInsuranceStatus: true,
        // Legacy fields (for P2P)
        hostInsuranceProvider: true,
        hostPolicyNumber: true,
        hostInsuranceExpires: true,
        hostInsuranceStatus: true,
        insuranceHistory: true
      }
    })
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    // Get the correct status and details based on insurance type
    const currentStatus = insuranceType === 'COMMERCIAL' 
      ? host.commercialInsuranceStatus 
      : (host.usingLegacyInsurance ? host.hostInsuranceStatus : host.p2pInsuranceStatus)
    
    const provider = insuranceType === 'COMMERCIAL'
      ? host.commercialInsuranceProvider
      : (host.usingLegacyInsurance ? host.hostInsuranceProvider : host.p2pInsuranceProvider)
    
    const policyNumber = insuranceType === 'COMMERCIAL'
      ? host.commercialPolicyNumber
      : (host.usingLegacyInsurance ? host.hostPolicyNumber : host.p2pPolicyNumber)
    
    const expirationDate = insuranceType === 'COMMERCIAL'
      ? host.commercialInsuranceExpires
      : (host.usingLegacyInsurance ? host.hostInsuranceExpires : host.p2pInsuranceExpires)
    
    // Check if insurance is in PENDING status
    if (currentStatus !== 'PENDING') {
      return NextResponse.json(
        { error: `${insuranceType} insurance is currently ${currentStatus}, not PENDING` },
        { status: 400 }
      )
    }
    
    // Check if insurance details exist
    if (!provider || !policyNumber || !expirationDate) {
      return NextResponse.json(
        { error: `Host has not submitted complete ${insuranceType} insurance details` },
        { status: 400 }
      )
    }
    
    const result = await prisma.$transaction(async (tx) => {
      if (action === 'approve') {
        console.log(`🎯 Approving ${insuranceType} insurance for host ${host.name}`)
        
        // CRITICAL: Determine tier and set OTHER insurance to INACTIVE
        let newTier = 'BASIC'
        let newCommissionRate = 0.60
        let otherInsuranceAction = ''
        
        // Build update data
        const updateData: any = {
          lastTierChange: new Date(),
          tierChangeBy: admin.email,
          insuranceHistory: {
            ...(host.insuranceHistory as object || {}),
            updates: [
              ...((host.insuranceHistory as any)?.updates || []),
              {
                action: 'APPROVED',
                insuranceType,
                approvedBy: admin.email,
                approvedAt: new Date().toISOString(),
                previousTier: host.earningsTier,
              }
            ]
          }
        }
        
        if (insuranceType === 'COMMERCIAL') {
          // ✅ Approving Commercial = PREMIUM (90%)
          newTier = 'PREMIUM'
          newCommissionRate = 0.10
          updateData.commercialInsuranceStatus = 'ACTIVE'
          
          // 🔄 AUTO-DEACTIVATE P2P if it's ACTIVE
          if (host.p2pInsuranceStatus === 'ACTIVE' || (host.usingLegacyInsurance && host.hostInsuranceStatus === 'ACTIVE')) {
            console.log('🔄 Setting P2P to INACTIVE (Commercial takes over)')
            updateData.p2pInsuranceStatus = 'INACTIVE'
            if (host.usingLegacyInsurance) {
              updateData.hostInsuranceStatus = 'INACTIVE'
            }
            otherInsuranceAction = 'P2P insurance automatically set to INACTIVE'
          }
          
        } else {
          // ✅ Approving P2P
          updateData.p2pInsuranceStatus = 'ACTIVE'
          if (host.usingLegacyInsurance) {
            updateData.hostInsuranceStatus = 'ACTIVE'
          }
          
          // Check if Commercial is ACTIVE
          if (host.commercialInsuranceStatus === 'ACTIVE') {
            // 🔄 AUTO-DEACTIVATE Commercial, P2P takes over
            console.log('🔄 Setting Commercial to INACTIVE (P2P takes over)')
            updateData.commercialInsuranceStatus = 'INACTIVE'
            newTier = 'STANDARD'
            newCommissionRate = 0.25
            otherInsuranceAction = 'Commercial insurance automatically set to INACTIVE'
          } else {
            // No Commercial, just upgrade to STANDARD (75%)
            newTier = 'STANDARD'
            newCommissionRate = 0.25
          }
        }
        
        // Set tier
        updateData.earningsTier = newTier
        updateData.commissionRate = newCommissionRate
        updateData.tierChangeReason = `${insuranceType} insurance approved - ${newTier} tier${otherInsuranceAction ? ` (${otherInsuranceAction})` : ''}`
        
        // Update history with new tier
        updateData.insuranceHistory.updates[updateData.insuranceHistory.updates.length - 1].newTier = newTier
        updateData.insuranceHistory.updates[updateData.insuranceHistory.updates.length - 1].previousCommission = host.commissionRate
        updateData.insuranceHistory.updates[updateData.insuranceHistory.updates.length - 1].newCommission = newCommissionRate
        if (otherInsuranceAction) {
          updateData.insuranceHistory.updates[updateData.insuranceHistory.updates.length - 1].autoInactiveAction = otherInsuranceAction
        }
        
        const updatedHost = await tx.rentalHost.update({
          where: { id: hostId },
          data: updateData
        })
        
        console.log('✅ Host updated:', {
          tier: updatedHost.earningsTier,
          p2pStatus: updatedHost.p2pInsuranceStatus,
          commercialStatus: updatedHost.commercialInsuranceStatus
        })
        
        // Create host notification
        const earningsPercent = newTier === 'PREMIUM' ? '90%' : newTier === 'STANDARD' ? '75%' : '40%'
        const notificationMessage = otherInsuranceAction
          ? `Great news! Your ${insuranceType} insurance has been approved. You're now earning ${earningsPercent} per booking (${newTier} tier). ${otherInsuranceAction}. You can switch between insurances anytime.`
          : `Great news! Your ${insuranceType} insurance has been approved. You're now earning ${earningsPercent} per booking (${newTier} tier).`
        
        await tx.hostNotification.create({
          data: {
            hostId: host.id,
            type: 'INSURANCE_APPROVED',
            category: 'documents',
            subject: `${insuranceType} Insurance Approved!`,
            message: notificationMessage,
            status: 'SENT',
            priority: 'high',
            responseRequired: false
          }
        })
        
        // Log activity
        await tx.activityLog.create({
          data: {
            entityType: 'HOST',
            entityId: host.id,
            action: 'INSURANCE_APPROVED',
            metadata: {
              hostId: host.id,
              hostName: host.name,
              insuranceType,
              provider,
              policyNumber,
              expirationDate,
              approvedBy: admin.email,
              previousTier: host.earningsTier,
              newTier: newTier,
              previousCommission: host.commissionRate,
              newCommission: newCommissionRate,
              autoInactiveAction: otherInsuranceAction || null
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
          }
        })
        
        return updatedHost
        
      } else {
        // REJECT: Set status to REJECTED, recalculate tier based on other active insurance
        let newTier = 'BASIC'
        let newCommissionRate = 0.60
        
        // Check what other insurance they have ACTIVE
        if (insuranceType === 'COMMERCIAL') {
          // Rejecting Commercial, check P2P
          if (host.p2pInsuranceStatus === 'ACTIVE' || (host.usingLegacyInsurance && host.hostInsuranceStatus === 'ACTIVE')) {
            newTier = 'STANDARD'
            newCommissionRate = 0.25
          }
        } else {
          // Rejecting P2P, check Commercial
          if (host.commercialInsuranceStatus === 'ACTIVE') {
            newTier = 'PREMIUM'
            newCommissionRate = 0.10
          }
        }
        
        // Build update data
        const updateData: any = {
          earningsTier: newTier,
          commissionRate: newCommissionRate,
          lastTierChange: new Date(),
          tierChangeReason: `${insuranceType} insurance rejected - ${reason}`,
          tierChangeBy: admin.email,
          insuranceHistory: {
            ...(host.insuranceHistory as object || {}),
            updates: [
              ...((host.insuranceHistory as any)?.updates || []),
              {
                action: 'REJECTED',
                insuranceType,
                rejectedBy: admin.email,
                rejectedAt: new Date().toISOString(),
                reason: reason
              }
            ]
          }
        }
        
        // Clear the rejected insurance fields
        if (insuranceType === 'COMMERCIAL') {
          updateData.commercialInsuranceProvider = null
          updateData.commercialPolicyNumber = null
          updateData.commercialInsuranceExpires = null
          updateData.commercialInsuranceStatus = null
        } else {
          // P2P
          updateData.p2pInsuranceProvider = null
          updateData.p2pPolicyNumber = null
          updateData.p2pInsuranceExpires = null
          updateData.p2pInsuranceStatus = null
          // Also clear legacy if using legacy system
          if (host.usingLegacyInsurance) {
            updateData.hostInsuranceProvider = null
            updateData.hostPolicyNumber = null
            updateData.hostInsuranceExpires = null
            updateData.hostInsuranceStatus = null
          }
        }
        
        const updatedHost = await tx.rentalHost.update({
          where: { id: hostId },
          data: updateData
        })
        
        // Create host notification
        await tx.hostNotification.create({
          data: {
            hostId: host.id,
            type: 'INSURANCE_REJECTED',
            category: 'documents',
            subject: `${insuranceType} Insurance Needs Attention`,
            message: `Your ${insuranceType} insurance submission requires updates: ${reason}`,
            status: 'SENT',
            priority: 'high',
            responseRequired: true,
            actionRequired: 'UPDATE_INSURANCE',
            actionUrl: '/host/profile?tab=insurance'
          }
        })
        
        // Log activity
        await tx.activityLog.create({
          data: {
            entityType: 'HOST',
            entityId: host.id,
            action: 'INSURANCE_REJECTED',
            metadata: {
              hostId: host.id,
              hostName: host.name,
              insuranceType,
              rejectedBy: admin.email,
              reason: reason
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
          }
        })
        
        return updatedHost
      }
    })
    
    if (action === 'approve') {
      const tier = result.earningsTier
      const earnings = tier === 'PREMIUM' ? '90%' : tier === 'STANDARD' ? '75%' : '40%'
      
      return NextResponse.json({
        success: true,
        message: `${insuranceType} insurance approved! Host upgraded to ${tier} tier (${earnings} earnings).`,
        data: {
          hostId: result.id,
          insuranceType,
          status: insuranceType === 'COMMERCIAL' ? result.commercialInsuranceStatus : result.p2pInsuranceStatus,
          tier: result.earningsTier,
          commissionRate: result.commissionRate,
          hostEarnings: 1 - result.commissionRate,
          p2pStatus: result.p2pInsuranceStatus,
          commercialStatus: result.commercialInsuranceStatus
        }
      })
    } else {
      const tier = result.earningsTier
      const earnings = tier === 'PREMIUM' ? '90%' : tier === 'STANDARD' ? '75%' : '40%'
      
      return NextResponse.json({
        success: true,
        message: `${insuranceType} insurance rejected. Host ${tier === 'BASIC' ? 'remains at' : 'at'} ${tier} tier (${earnings} earnings).`,
        data: {
          hostId: result.id,
          insuranceType,
          tier: result.earningsTier,
          commissionRate: result.commissionRate,
          rejectionReason: reason
        }
      })
    }
    
  } catch (error) {
    console.error('Insurance approval error:', error)
    return NextResponse.json(
      { error: 'Failed to process insurance approval' },
      { status: 500 }
    )
  }
}

// DELETE - Delete/remove host insurance (P2P or Commercial)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params

    // Check for fleet key authentication
    const fleetKey = request.headers.get('x-fleet-key')

    if (fleetKey !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { error: 'Unauthorized. Fleet access required.' },
        { status: 401 }
      )
    }

    const admin = {
      id: 'fleet-admin',
      email: 'admin@itwhip.com',
      name: 'Fleet Admin',
      role: 'ADMIN'
    }
    const body = await request.json()
    const { insuranceType = 'P2P' } = body
    
    // Validate insurance type
    if (!['P2P', 'COMMERCIAL'].includes(insuranceType)) {
      return NextResponse.json(
        { error: 'Insurance type must be either "P2P" or "COMMERCIAL"' },
        { status: 400 }
      )
    }
    
    // Get host
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        email: true,
        name: true,
        earningsTier: true,
        commissionRate: true,
        usingLegacyInsurance: true,
        p2pInsuranceStatus: true,
        commercialInsuranceStatus: true,
        hostInsuranceStatus: true,
        insuranceHistory: true
      }
    })
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    const result = await prisma.$transaction(async (tx) => {
      // Calculate new tier after deletion
      let newTier = 'BASIC'
      let newCommissionRate = 0.60
      
      if (insuranceType === 'COMMERCIAL') {
        // Deleting Commercial, check if P2P is active or inactive
        if (host.p2pInsuranceStatus === 'ACTIVE' || (host.usingLegacyInsurance && host.hostInsuranceStatus === 'ACTIVE')) {
          newTier = 'STANDARD'
          newCommissionRate = 0.25
        } else if (host.p2pInsuranceStatus === 'INACTIVE' || (host.usingLegacyInsurance && host.hostInsuranceStatus === 'INACTIVE')) {
          // P2P exists but was inactive, activate it automatically
          newTier = 'STANDARD'
          newCommissionRate = 0.25
        }
      } else {
        // Deleting P2P, check if Commercial is active or inactive
        if (host.commercialInsuranceStatus === 'ACTIVE') {
          newTier = 'PREMIUM'
          newCommissionRate = 0.10
        } else if (host.commercialInsuranceStatus === 'INACTIVE') {
          // Commercial exists but was inactive, activate it automatically
          newTier = 'PREMIUM'
          newCommissionRate = 0.10
        }
      }
      
      // Build update data
      const updateData: any = {
        earningsTier: newTier,
        commissionRate: newCommissionRate,
        lastTierChange: new Date(),
        tierChangeReason: `${insuranceType} insurance deleted by admin`,
        tierChangeBy: admin.email,
        insuranceHistory: {
          ...(host.insuranceHistory as object || {}),
          updates: [
            ...((host.insuranceHistory as any)?.updates || []),
            {
              action: 'DELETED',
              insuranceType,
              deletedBy: admin.email,
              deletedAt: new Date().toISOString(),
              previousTier: host.earningsTier,
              newTier: newTier
            }
          ]
        }
      }
      
      // Clear the insurance fields
      if (insuranceType === 'COMMERCIAL') {
        updateData.commercialInsuranceProvider = null
        updateData.commercialPolicyNumber = null
        updateData.commercialInsuranceExpires = null
        updateData.commercialInsuranceStatus = null
        
        // If P2P was inactive, activate it now
        if (host.p2pInsuranceStatus === 'INACTIVE' || (host.usingLegacyInsurance && host.hostInsuranceStatus === 'INACTIVE')) {
          updateData.p2pInsuranceStatus = 'ACTIVE'
          if (host.usingLegacyInsurance) {
            updateData.hostInsuranceStatus = 'ACTIVE'
          }
        }
      } else {
        // P2P
        updateData.p2pInsuranceProvider = null
        updateData.p2pPolicyNumber = null
        updateData.p2pInsuranceExpires = null
        updateData.p2pInsuranceStatus = null
        
        // Also clear legacy if using legacy system
        if (host.usingLegacyInsurance) {
          updateData.hostInsuranceProvider = null
          updateData.hostPolicyNumber = null
          updateData.hostInsuranceExpires = null
          updateData.hostInsuranceStatus = null
        }
        
        // If Commercial was inactive, activate it now
        if (host.commercialInsuranceStatus === 'INACTIVE') {
          updateData.commercialInsuranceStatus = 'ACTIVE'
        }
      }
      
      const updatedHost = await tx.rentalHost.update({
        where: { id: hostId },
        data: updateData
      })
      
      // Create host notification
      const earningsPercent = newTier === 'PREMIUM' ? '90%' : newTier === 'STANDARD' ? '75%' : '40%'
      await tx.hostNotification.create({
        data: {
          hostId: host.id,
          type: 'INSURANCE_REMOVED',
          category: 'documents',
          subject: `${insuranceType} Insurance Removed`,
          message: `Your ${insuranceType} insurance has been removed. You are now at ${newTier} tier earning ${earningsPercent} per booking.`,
          status: 'SENT',
          priority: 'high',
          responseRequired: false
        }
      })
      
      // Log activity
      await tx.activityLog.create({
        data: {
          entityType: 'HOST',
          entityId: host.id,
          action: 'INSURANCE_DELETED',
          metadata: {
            hostId: host.id,
            hostName: host.name,
            insuranceType,
            deletedBy: admin.email,
            previousTier: host.earningsTier,
            newTier: newTier
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      })
      
      return updatedHost
    })
    
    const tier = result.earningsTier
    const earnings = tier === 'PREMIUM' ? '90%' : tier === 'STANDARD' ? '75%' : '40%'
    
    return NextResponse.json({
      success: true,
      message: `${insuranceType} insurance deleted. Host now at ${tier} tier (${earnings} earnings).`,
      data: {
        hostId: result.id,
        insuranceType,
        tier: result.earningsTier,
        commissionRate: result.commissionRate,
        hostEarnings: 1 - result.commissionRate
      }
    })
    
  } catch (error) {
    console.error('Insurance deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete insurance' },
      { status: 500 }
    )
  }
}