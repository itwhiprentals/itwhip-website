// app/api/host/insurance/toggle/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper function to verify host token
async function verifyHostToken(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('hostAccessToken')?.value
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    const token = cookieToken || headerToken
    
    if (!token) {
      return null
    }
    
    const decoded = verify(token, JWT_SECRET) as any
    
    const host = await prisma.rentalHost.findUnique({
      where: { id: decoded.hostId },
      select: {
        id: true,
        email: true,
        name: true,
        approvalStatus: true,
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
        // Legacy fields
        hostInsuranceProvider: true,
        hostPolicyNumber: true,
        hostInsuranceExpires: true,
        hostInsuranceStatus: true,
        insuranceHistory: true
      }
    })
    
    return host
  } catch (error) {
    console.error('Host token verification failed:', error)
    return null
  }
}

// POST - Toggle between P2P and Commercial insurance
// RULE: Only ONE can be ACTIVE at a time
export async function POST(request: NextRequest) {
  try {
    const host = await verifyHostToken(request)
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }
    
    if (host.approvalStatus === 'BLACKLISTED') {
      return NextResponse.json(
        { error: 'Account status does not allow insurance changes.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { targetType } = body // 'P2P' or 'COMMERCIAL'
    
    // Validate target type
    if (!targetType || !['P2P', 'COMMERCIAL'].includes(targetType)) {
      return NextResponse.json(
        { error: 'Target type must be either "P2P" or "COMMERCIAL"' },
        { status: 400 }
      )
    }
    
    console.log(`🔄 Toggle Request: Switch to ${targetType}`)
    
    // Check if target insurance exists
    const hasP2P = host.p2pInsuranceProvider || (host.usingLegacyInsurance && host.hostInsuranceProvider)
    const hasCommercial = host.commercialInsuranceProvider
    
    if (targetType === 'P2P' && !hasP2P) {
      return NextResponse.json(
        { error: 'You do not have P2P insurance. Please add it first.' },
        { status: 400 }
      )
    }
    
    if (targetType === 'COMMERCIAL' && !hasCommercial) {
      return NextResponse.json(
        { error: 'You do not have commercial insurance. Please add it first.' },
        { status: 400 }
      )
    }
    
    // Check if target is already ACTIVE
    const p2pStatus = host.usingLegacyInsurance ? host.hostInsuranceStatus : host.p2pInsuranceStatus
    const commercialStatus = host.commercialInsuranceStatus
    
    if (targetType === 'P2P' && p2pStatus === 'ACTIVE') {
      return NextResponse.json(
        { error: 'P2P insurance is already active.' },
        { status: 400 }
      )
    }
    
    if (targetType === 'COMMERCIAL' && commercialStatus === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Commercial insurance is already active.' },
        { status: 400 }
      )
    }
    
    // Check if target insurance is approved (not PENDING)
    if (targetType === 'P2P' && p2pStatus !== 'INACTIVE' && p2pStatus !== 'ACTIVE') {
      return NextResponse.json(
        { error: `P2P insurance is ${p2pStatus}. Only approved insurances can be activated.` },
        { status: 400 }
      )
    }
    
    if (targetType === 'COMMERCIAL' && commercialStatus !== 'INACTIVE' && commercialStatus !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Commercial insurance is ${commercialStatus}. Only approved insurances can be activated.` },
        { status: 400 }
      )
    }
    
    // ✅ FIXED: Check for active rental bookings with correct VerificationStatus values
    const activeBookings = await prisma.rentalBooking.count({
      where: {
        hostId: host.id,
        verificationStatus: {
          in: ['PENDING', 'SUBMITTED', 'APPROVED', 'PENDING_CHARGES'] // ✅ Correct enum values
        },
        OR: [
          { startDate: { gte: new Date() } }, // Future bookings
          { endDate: { gte: new Date() } }    // Current bookings
        ]
      }
    })
    
    if (activeBookings > 0) {
      // Find next available date
      const nextAvailable = await prisma.rentalBooking.findFirst({
        where: {
          hostId: host.id,
          verificationStatus: {
            in: ['PENDING', 'SUBMITTED', 'APPROVED', 'PENDING_CHARGES'] // ✅ Correct enum values
          }
        },
        orderBy: {
          endDate: 'desc'
        },
        select: {
          endDate: true
        }
      })
      
      return NextResponse.json(
        { 
          error: 'Cannot toggle insurance while you have active or future bookings.',
          hasActiveBookings: true,
          activeBookingsCount: activeBookings,
          nextAvailableDate: nextAvailable?.endDate
        },
        { status: 400 }
      )
    }
    
    // Perform the toggle
    const result = await prisma.$transaction(async (tx) => {
      let newTier = 'BASIC'
      let newCommissionRate = 0.60
      const updateData: any = {
        lastTierChange: new Date(),
        tierChangeReason: `Switched to ${targetType} insurance`,
        insuranceHistory: {
          ...(host.insuranceHistory as object || {}),
          updates: [
            ...((host.insuranceHistory as any)?.updates || []),
            {
              action: 'TOGGLED',
              toggledAt: new Date().toISOString(),
              fromType: targetType === 'COMMERCIAL' ? 'P2P' : 'COMMERCIAL',
              toType: targetType,
              previousTier: host.earningsTier
            }
          ]
        }
      }
      
      if (targetType === 'COMMERCIAL') {
        // ✅ Activate Commercial, 🔄 Deactivate P2P
        console.log('✅ Activating Commercial (90%)')
        console.log('🔄 Deactivating P2P')
        
        updateData.commercialInsuranceStatus = 'ACTIVE'
        updateData.p2pInsuranceStatus = 'INACTIVE'
        if (host.usingLegacyInsurance) {
          updateData.hostInsuranceStatus = 'INACTIVE'
        }
        
        newTier = 'PREMIUM'
        newCommissionRate = 0.10 // 90% earnings
        
      } else {
        // ✅ Activate P2P, 🔄 Deactivate Commercial
        console.log('✅ Activating P2P (75%)')
        console.log('🔄 Deactivating Commercial')
        
        updateData.p2pInsuranceStatus = 'ACTIVE'
        if (host.usingLegacyInsurance) {
          updateData.hostInsuranceStatus = 'ACTIVE'
        }
        updateData.commercialInsuranceStatus = 'INACTIVE'
        
        newTier = 'STANDARD'
        newCommissionRate = 0.25 // 75% earnings
      }
      
      updateData.earningsTier = newTier
      updateData.commissionRate = newCommissionRate
      
      // Update history with new tier
      updateData.insuranceHistory.updates[updateData.insuranceHistory.updates.length - 1].newTier = newTier
      updateData.insuranceHistory.updates[updateData.insuranceHistory.updates.length - 1].previousCommission = host.commissionRate
      updateData.insuranceHistory.updates[updateData.insuranceHistory.updates.length - 1].newCommission = newCommissionRate
      
      const updatedHost = await tx.rentalHost.update({
        where: { id: host.id },
        data: updateData
      })
      
      console.log('✅ Toggle Complete:', {
        newTier,
        earnings: `${Math.round((1 - newCommissionRate) * 100)}%`,
        p2pStatus: updatedHost.p2pInsuranceStatus,
        commercialStatus: updatedHost.commercialInsuranceStatus
      })
      
      // Create notification
      const earningsPercent = newTier === 'PREMIUM' ? '90%' : '75%'
      await tx.hostNotification.create({
        data: {
          id: crypto.randomUUID(),
          updatedAt: new Date(),
          hostId: host.id,
          type: 'INSURANCE_TOGGLED',
          category: 'documents',
          subject: `Switched to ${targetType} Insurance`,
          message: `You've successfully switched to ${targetType} insurance. You're now earning ${earningsPercent} per booking (${newTier} tier).`,
          status: 'SENT',
          priority: 'medium',
          responseRequired: false
        } as any
      })

      // Log activity
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          entityType: 'HOST',
          entityId: host.id,
          action: 'INSURANCE_TOGGLED',
          metadata: {
            hostId: host.id,
            hostName: host.name,
            fromType: targetType === 'COMMERCIAL' ? 'P2P' : 'COMMERCIAL',
            toType: targetType,
            previousTier: host.earningsTier,
            newTier: newTier,
            previousCommission: host.commissionRate,
            newCommission: newCommissionRate
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      
      return updatedHost
    })
    
    const earningsPercent = result.earningsTier === 'PREMIUM' ? '90%' : '75%'
    
    return NextResponse.json({
      success: true,
      message: `Successfully switched to ${targetType} insurance. You're now earning ${earningsPercent} per booking.`,
      data: {
        currentTier: result.earningsTier,
        hostEarnings: 1 - result.commissionRate,
        platformCommission: result.commissionRate,
        p2pInsurance: {
          status: result.p2pInsuranceStatus,
          provider: result.p2pInsuranceProvider || (result.usingLegacyInsurance ? result.hostInsuranceProvider : null)
        },
        commercialInsurance: {
          status: result.commercialInsuranceStatus,
          provider: result.commercialInsuranceProvider
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Insurance toggle error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle insurance' },
      { status: 500 }
    )
  }
}