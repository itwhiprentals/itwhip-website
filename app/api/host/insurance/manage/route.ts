// app/api/host/insurance/manage/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { 
  calculateHostTier, 
  calculateTierAfterAction,
  getTierChangeWarning,
  calculateFinancialImpact,
  getInsuranceStatuses
} from '@/app/lib/insurance/tier-calculator'
import {
  validateInsuranceDeletion,
  validateInsuranceToggle,
  checkInsuranceCooldown
} from '@/app/lib/insurance/validation'

/**
 * GET /api/host/insurance/manage
 * Get current insurance status and available actions
 */
export async function GET(request: NextRequest) {
  try {
    const hostToken = request.cookies.get('hostToken')?.value
    
    if (!hostToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const session = await prisma.session.findFirst({
      where: {
        token: hostToken,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          include: {
            host: true
          }
        }
      }
    })
    
    if (!session?.user?.host) {
      return NextResponse.json(
        { error: 'Host account not found' },
        { status: 404 }
      )
    }
    
    const host = session.user.host
    const currentTier = calculateHostTier(host)
    const statuses = getInsuranceStatuses(host)
    
    // Determine available actions
    const availableActions = {
      canDeleteP2P: statuses.p2p.exists && statuses.p2p.status !== 'PENDING',
      canDeleteCommercial: statuses.commercial.exists && statuses.commercial.status !== 'PENDING',
      canToggle: statuses.p2p.status === 'ACTIVE' && statuses.commercial.status === 'ACTIVE',
      canAddP2P: !statuses.p2p.exists,
      canAddCommercial: !statuses.commercial.exists
    }
    
    return NextResponse.json({
      currentTier,
      insuranceStatuses: statuses,
      availableActions
    })
    
  } catch (error) {
    console.error('Error getting insurance status:', error)
    return NextResponse.json(
      { error: 'Failed to get insurance status' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/host/insurance/manage
 * Delete insurance with tier recalculation
 */
export async function DELETE(request: NextRequest) {
  try {
    const hostToken = request.cookies.get('hostToken')?.value
    
    if (!hostToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { type, confirmationText } = await request.json()
    
    if (!type || !['P2P', 'COMMERCIAL'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid insurance type' },
        { status: 400 }
      )
    }
    
    // Require explicit confirmation for deletion
    if (confirmationText !== 'DELETE') {
      return NextResponse.json(
        { error: 'Please type DELETE to confirm' },
        { status: 400 }
      )
    }
    
    const session = await prisma.session.findFirst({
      where: {
        token: hostToken,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          include: {
            host: true
          }
        }
      }
    })
    
    if (!session?.user?.host) {
      return NextResponse.json(
        { error: 'Host account not found' },
        { status: 404 }
      )
    }
    
    const host = session.user.host
    const hostId = host.id
    
    // Validate deletion
    const validation = await validateInsuranceDeletion(hostId, type)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason, code: validation.code },
        { status: 400 }
      )
    }
    
    // Check cooldown
    const cooldown = await checkInsuranceCooldown(hostId)
    if (!cooldown.valid) {
      return NextResponse.json(
        { error: cooldown.reason, code: cooldown.code },
        { status: 429 }
      )
    }
    
    // Calculate current and new tier
    const currentTier = calculateHostTier(host)
    const actionType = type === 'P2P' ? 'DELETE_P2P' : 'DELETE_COMMERCIAL'
    const newTier = calculateTierAfterAction(host, actionType)
    const warning = getTierChangeWarning(currentTier, newTier, `Deleting ${type} insurance`)
    const impact = calculateFinancialImpact(currentTier, newTier)
    
    // Perform the deletion in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update host insurance fields and tier
      const updateData: any = {
        earningsTier: newTier.tier,
        commissionRate: newTier.platformCommission,
        lastTierChange: new Date(),
        tierChangeReason: `${type} insurance deleted by host`,
        tierChangeBy: host.email
      }
      
      if (type === 'P2P') {
        // Clear P2P fields (handle legacy too)
        updateData.p2pInsuranceStatus = null
        updateData.p2pInsuranceProvider = null
        updateData.p2pPolicyNumber = null
        updateData.p2pInsuranceExpires = null
        updateData.p2pInsuranceActive = false
        
        if (host.usingLegacyInsurance) {
          updateData.hostInsuranceStatus = null
          updateData.hostInsuranceProvider = null
          updateData.hostPolicyNumber = null
          updateData.hostInsuranceExpires = null
        }
      } else {
        // Clear Commercial fields
        updateData.commercialInsuranceStatus = null
        updateData.commercialInsuranceProvider = null
        updateData.commercialPolicyNumber = null
        updateData.commercialInsuranceExpires = null
        updateData.commercialInsuranceActive = false
      }
      
      const updatedHost = await tx.rentalHost.update({
        where: { id: hostId },
        data: updateData
      })
      
      // Create activity log
      await tx.activityLog.create({
        data: {
          entityType: 'HOST',
          entityId: hostId,
          action: 'INSURANCE_DELETED',
          metadata: {
            type,
            previousTier: currentTier.tier,
            newTier: newTier.tier,
            previousEarnings: currentTier.hostEarnings,
            newEarnings: newTier.hostEarnings,
            deletedBy: host.email,
            impact: impact
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      
      // Create host notification
      await tx.hostNotification.create({
        data: {
          hostId,
          type: 'INSURANCE_DELETED',
          category: 'insurance',
          subject: `${type} Insurance Removed`,
          message: `Your ${type} insurance has been removed. Your earnings have changed from ${Math.round(currentTier.hostEarnings * 100)}% to ${Math.round(newTier.hostEarnings * 100)}%.`,
          status: 'SENT',
          priority: 'high'
        }
      })
      
      // Create admin notification
      await tx.adminNotification.create({
        data: {
          type: 'INSURANCE_DELETED',
          title: 'Host Deleted Insurance',
          message: `${host.name} (${host.email}) deleted their ${type} insurance. Tier: ${currentTier.tier} → ${newTier.tier}`,
          priority: 'medium',
          status: 'UNREAD',
          relatedId: hostId,
          relatedType: 'HOST',
          metadata: {
            hostName: host.name,
            hostEmail: host.email,
            insuranceType: type,
            tierChange: `${currentTier.tier} → ${newTier.tier}`,
            earningsChange: `${Math.round(currentTier.hostEarnings * 100)}% → ${Math.round(newTier.hostEarnings * 100)}%`
          }
        }
      })
      
      return updatedHost
    })
    
    return NextResponse.json({
      success: true,
      message: `${type} insurance deleted successfully`,
      previousTier: currentTier,
      newTier,
      warning,
      impact
    })
    
  } catch (error) {
    console.error('Error deleting insurance:', error)
    return NextResponse.json(
      { error: 'Failed to delete insurance' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/host/insurance/manage
 * Toggle between insurance types or update status
 */
export async function PATCH(request: NextRequest) {
  try {
    const hostToken = request.cookies.get('hostToken')?.value
    
    if (!hostToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { action, targetType } = await request.json()
    
    if (action !== 'TOGGLE' || !['P2P', 'COMMERCIAL'].includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid toggle request' },
        { status: 400 }
      )
    }
    
    const session = await prisma.session.findFirst({
      where: {
        token: hostToken,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          include: {
            host: true
          }
        }
      }
    })
    
    if (!session?.user?.host) {
      return NextResponse.json(
        { error: 'Host account not found' },
        { status: 404 }
      )
    }
    
    const host = session.user.host
    const hostId = host.id
    
    // Validate toggle
    const validation = await validateInsuranceToggle(hostId, targetType)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason, code: validation.code },
        { status: 400 }
      )
    }
    
    // Check cooldown
    const cooldown = await checkInsuranceCooldown(hostId, 2) // 2 minute cooldown for toggles
    if (!cooldown.valid) {
      return NextResponse.json(
        { error: cooldown.reason, code: cooldown.code },
        { status: 429 }
      )
    }
    
    // Calculate tier change
    const currentTier = calculateHostTier(host)
    const newTier = targetType === 'COMMERCIAL'
      ? { tier: 'PREMIUM' as const, hostEarnings: 0.90, platformCommission: 0.10, source: 'COMMERCIAL' as const, status: 'ACTIVE' }
      : { tier: 'STANDARD' as const, hostEarnings: 0.75, platformCommission: 0.25, source: 'P2P' as const, status: 'ACTIVE' }
    
    const warning = getTierChangeWarning(currentTier, newTier, `Switching to ${targetType} insurance`)
    const impact = calculateFinancialImpact(currentTier, newTier)
    
    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedHost = await tx.rentalHost.update({
        where: { id: hostId },
        data: {
          earningsTier: newTier.tier,
          commissionRate: newTier.platformCommission,
          lastTierChange: new Date(),
          tierChangeReason: `Toggled to ${targetType} insurance`,
          tierChangeBy: host.email
        }
      })
      
      // Log the toggle
      await tx.activityLog.create({
        data: {
          entityType: 'HOST',
          entityId: hostId,
          action: 'INSURANCE_TOGGLED',
          metadata: {
            from: currentTier.source,
            to: targetType,
            previousTier: currentTier.tier,
            newTier: newTier.tier,
            previousEarnings: currentTier.hostEarnings,
            newEarnings: newTier.hostEarnings
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      
      // Notify host
      await tx.hostNotification.create({
        data: {
          hostId,
          type: 'INSURANCE_TOGGLED',
          category: 'insurance',
          subject: 'Insurance Switched',
          message: `Successfully switched to ${targetType} insurance. Now earning ${Math.round(newTier.hostEarnings * 100)}% per booking.`,
          status: 'SENT',
          priority: 'medium'
        }
      })
      
      return updatedHost
    })
    
    return NextResponse.json({
      success: true,
      message: `Switched to ${targetType} insurance`,
      previousTier: currentTier,
      newTier,
      warning,
      impact
    })
    
  } catch (error) {
    console.error('Error toggling insurance:', error)
    return NextResponse.json(
      { error: 'Failed to toggle insurance' },
      { status: 500 }
    )
  }
}