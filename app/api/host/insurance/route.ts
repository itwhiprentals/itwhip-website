// app/api/host/insurance/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'jsonwebtoken'
import { validateNewInsurance } from '@/app/lib/insurance/validation'
import { calculateHostTier } from '@/app/lib/insurance/tier-calculator'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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
        insuranceDocUrl: true,
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

// POST - Submit new insurance (validates no duplicates, maintains tier if other insurance is ACTIVE)
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
        { error: 'Account status does not allow insurance updates.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { provider, policyNumber, expirationDate, insuranceType: explicitType } = body
    
    // Validate required fields
    if (!provider || !policyNumber || !expirationDate) {
      return NextResponse.json(
        { error: 'Provider, policy number, and expiration date are required' },
        { status: 400 }
      )
    }
    
    // Validate expiration date
    const expiryDate = new Date(expirationDate)
    if (expiryDate <= new Date()) {
      return NextResponse.json(
        { error: 'Insurance expiration date must be in the future' },
        { status: 400 }
      )
    }
    
    // Determine insurance type
    const insuranceType = explicitType || 
      (provider.toLowerCase().includes('commercial') || 
       policyNumber.toLowerCase().includes('comm') 
       ? 'COMMERCIAL' 
       : 'P2P')
    
    // Validate no duplicate insurance type
    const validation = await validateNewInsurance(host.id, insuranceType)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason, code: validation.code },
        { status: 400 }
      )
    }
    
    // CRITICAL: Check if host has OTHER ACTIVE insurance before changing tier
    const hasActiveP2P = host.p2pInsuranceStatus === 'ACTIVE' || 
                         (host.usingLegacyInsurance && host.hostInsuranceStatus === 'ACTIVE')
    const hasActiveCommercial = host.commercialInsuranceStatus === 'ACTIVE'
    
    console.log('🔍 Insurance Submission Check:', {
      hostId: host.id,
      hostName: host.name,
      submittingType: insuranceType,
      hasActiveP2P,
      hasActiveCommercial,
      currentTier: host.earningsTier,
      currentCommission: host.commissionRate
    })
    
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        documentsResubmittedAt: new Date(),
        insuranceHistory: {
          ...(host.insuranceHistory as object || {}),
          submissions: [
            ...((host.insuranceHistory as any)?.submissions || []),
            {
              submittedAt: new Date().toISOString(),
              provider,
              policyNumber,
              expirationDate: expiryDate.toISOString(),
              type: insuranceType,
              status: 'PENDING'
            }
          ]
        }
      }
      
      // TIER LOGIC: Only change tier if host has NO other ACTIVE insurance
      let shouldChangeTier = false
      let tierMessage = ''
      
      if (insuranceType === 'COMMERCIAL') {
        // Submitting Commercial insurance
        if (hasActiveP2P) {
          // ✅ Has P2P ACTIVE - KEEP current tier (STANDARD 75%)
          shouldChangeTier = false
          tierMessage = 'Your earnings remain at 75% (STANDARD tier) while Commercial insurance is pending approval.'
          console.log('✅ KEEPING TIER - P2P is ACTIVE, staying at STANDARD 75%')
        } else {
          // ⚠️ No active insurance - drop to BASIC
          shouldChangeTier = true
          updateData.earningsTier = 'BASIC'
          updateData.commissionRate = 0.60
          updateData.lastTierChange = new Date()
          updateData.tierChangeReason = 'Commercial insurance pending approval'
          tierMessage = 'Your earnings are at 40% (BASIC tier) until Commercial insurance is approved.'
          console.log('⚠️ DROPPING TO BASIC - No active insurance')
        }
        
        // Set Commercial fields to PENDING
        updateData.commercialInsuranceProvider = provider
        updateData.commercialPolicyNumber = policyNumber
        updateData.commercialInsuranceExpires = expiryDate
        updateData.commercialInsuranceStatus = 'PENDING'
        
      } else {
        // Submitting P2P insurance
        if (hasActiveCommercial) {
          // ✅ Has Commercial ACTIVE - KEEP current tier (PREMIUM 90%)
          shouldChangeTier = false
          tierMessage = 'Your earnings remain at 90% (PREMIUM tier) while P2P insurance is pending approval.'
          console.log('✅ KEEPING TIER - Commercial is ACTIVE, staying at PREMIUM 90%')
        } else {
          // ⚠️ No active insurance - drop to BASIC
          shouldChangeTier = true
          updateData.earningsTier = 'BASIC'
          updateData.commissionRate = 0.60
          updateData.lastTierChange = new Date()
          updateData.tierChangeReason = 'P2P insurance pending approval'
          tierMessage = 'Your earnings are at 40% (BASIC tier) until P2P insurance is approved.'
          console.log('⚠️ DROPPING TO BASIC - No active insurance')
        }
        
        // Set P2P fields to PENDING
        updateData.p2pInsuranceProvider = provider
        updateData.p2pPolicyNumber = policyNumber
        updateData.p2pInsuranceExpires = expiryDate
        updateData.p2pInsuranceStatus = 'PENDING'
        
        // Update legacy fields if using legacy system
        if (host.usingLegacyInsurance) {
          updateData.hostInsuranceProvider = provider
          updateData.hostPolicyNumber = policyNumber
          updateData.hostInsuranceExpires = expiryDate
          updateData.hostInsuranceStatus = 'PENDING'
        }
      }
      
      const updatedHost = await tx.rentalHost.update({
        where: { id: host.id },
        data: updateData
      })
      
      console.log('✅ Host Updated Successfully:', {
        hostId: updatedHost.id,
        newTier: updatedHost.earningsTier,
        newCommission: updatedHost.commissionRate,
        tierChanged: shouldChangeTier,
        p2pStatus: updatedHost.p2pInsuranceStatus,
        commercialStatus: updatedHost.commercialInsuranceStatus
      })
      
      // Create notifications
      await tx.hostNotification.create({
        data: {
          hostId: host.id,
          type: 'INSURANCE_SUBMITTED',
          category: 'documents',
          subject: `${insuranceType} Insurance Submitted`,
          message: `Your ${insuranceType} insurance has been submitted for review. ${tierMessage}`,
          status: 'SENT',
          priority: 'high',
          responseRequired: false
        }
      })
      
      await tx.adminNotification.create({
        data: {
          type: 'HOST_INSURANCE_PENDING',
          title: `${insuranceType} Insurance Pending Review`,
          message: `${host.name} submitted ${insuranceType} insurance for approval.`,
          priority: 'medium',
          status: 'UNREAD',
          actionRequired: true,
          actionUrl: `/fleet/hosts/${host.id}`,
          relatedId: host.id,
          relatedType: 'HOST',
          metadata: {
            hostId: host.id,
            hostName: host.name,
            insuranceType,
            provider,
            policyNumber,
            expirationDate: expiryDate.toISOString(),
            hasOtherActiveInsurance: hasActiveP2P || hasActiveCommercial,
            keptCurrentTier: !shouldChangeTier
          }
        }
      })
      
      // Log activity
      await tx.activityLog.create({
        data: {
          entityType: 'HOST',
          entityId: host.id,
          action: 'INSURANCE_SUBMITTED',
          metadata: {
            type: insuranceType,
            provider,
            policyNumber,
            expirationDate: expiryDate.toISOString(),
            status: 'PENDING',
            keptCurrentTier: !shouldChangeTier,
            hasActiveP2P,
            hasActiveCommercial
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      
      return updatedHost
    })
    
    // Calculate current tier
    const currentTier = calculateHostTier(result)
    
    const responseMessage = (hasActiveP2P || hasActiveCommercial)
      ? `${insuranceType} insurance submitted. Your current ${Math.round(currentTier.hostEarnings * 100)}% earnings remain unchanged until approved.`
      : `${insuranceType} insurance submitted. Awaiting admin approval. You're currently at 40% earnings (BASIC tier).`
    
    console.log('📤 Sending Response:', {
      success: true,
      tier: currentTier.tier,
      earnings: currentTier.hostEarnings,
      message: responseMessage
    })
    
    return NextResponse.json({
      success: true,
      message: responseMessage,
      data: {
        type: insuranceType,
        provider,
        policyNumber,
        expirationDate: expiryDate,
        status: 'PENDING',
        currentTier: currentTier.tier,
        hostEarnings: currentTier.hostEarnings,
        tierMaintained: hasActiveP2P || hasActiveCommercial
      }
    })
    
  } catch (error) {
    console.error('❌ Insurance submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit insurance details' },
      { status: 500 }
    )
  }
}

// GET - Get all insurance details
export async function GET(request: NextRequest) {
  try {
    const host = await verifyHostToken(request)
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }
    
    const currentTier = calculateHostTier(host)
    
    // Prepare P2P insurance data (handle legacy)
    const p2pData = host.usingLegacyInsurance ? {
      provider: host.hostInsuranceProvider,
      policyNumber: host.hostPolicyNumber,
      expirationDate: host.hostInsuranceExpires,
      status: host.hostInsuranceStatus
    } : {
      provider: host.p2pInsuranceProvider,
      policyNumber: host.p2pPolicyNumber,
      expirationDate: host.p2pInsuranceExpires,
      status: host.p2pInsuranceStatus
    }
    
    // Prepare commercial insurance data
    const commercialData = {
      provider: host.commercialInsuranceProvider,
      policyNumber: host.commercialPolicyNumber,
      expirationDate: host.commercialInsuranceExpires,
      status: host.commercialInsuranceStatus
    }
    
    return NextResponse.json({
      success: true,
      data: {
        currentTier: currentTier.tier,
        hostEarnings: currentTier.hostEarnings,
        platformCommission: currentTier.platformCommission,
        p2pInsurance: p2pData,
        commercialInsurance: commercialData,
        documentUploaded: !!host.insuranceDocUrl,
        documentUrl: host.insuranceDocUrl
      }
    })
    
  } catch (error) {
    console.error('Get insurance error:', error)
    return NextResponse.json(
      { error: 'Failed to get insurance details' },
      { status: 500 }
    )
  }
}

// Note: DELETE and PATCH operations should now use /api/host/insurance/manage
// This file only handles new submissions and viewing