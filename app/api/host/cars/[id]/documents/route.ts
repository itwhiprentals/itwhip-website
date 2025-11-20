// app/api/host/cars/[id]/documents/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params

    console.log('🔍 ===== FETCHING DOCUMENTS FOR CAR:', carId, '=====')

    const vehicle = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        licensePlate: true,
        vin: true,
        hostId: true,
        
        vinVerifiedBy: true,
        vinVerifiedAt: true,
        vinVerificationMethod: true,
        registrationVerifiedBy: true,
        registrationVerifiedAt: true,
        registrationExpiryDate: true,
        registrationState: true,
        insuranceVerifiedBy: true,
        insuranceVerifiedAt: true,
        insuranceExpiryDate: true,
        titleVerifiedBy: true,
        titleVerifiedAt: true,
        
        registeredOwner: true,
        titleStatus: true,
        hasLien: true,
        lienholderName: true,
        lienholderAddress: true,
        
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            approvalStatus: true,
            approvedAt: true,
            approvedBy: true,
            verifiedAt: true,
            documentsVerified: true,
            earningsTier: true,
            insuranceType: true,
            revenueSplit: true,
            commercialInsuranceStatus: true,
            commercialInsuranceProvider: true,
            commercialPolicyNumber: true,
            commercialInsuranceExpires: true,
            commercialInsuranceActive: true,
            p2pInsuranceStatus: true,
            p2pInsuranceProvider: true,
            p2pPolicyNumber: true,
            p2pInsuranceExpires: true,
            p2pInsuranceActive: true,
            usingLegacyInsurance: true,
            hostInsuranceProvider: true,
            hostInsuranceStatus: true,
            hostPolicyNumber: true,
            hostInsuranceExpires: true,
            insuranceProviderId: true,
            insurancePolicyNumber: true,
            insuranceActive: true
          }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const host = vehicle.host

    console.log('📊 ===== HOST APPROVAL DATA =====')
    console.log('Approval Status:', host.approvalStatus)
    console.log('Approved At:', host.approvedAt)
    console.log('Approved By:', host.approvedBy)
    console.log('Verified At:', host.verifiedAt)
    console.log('Documents Verified:', host.documentsVerified)
    console.log('=====================================')

    const calculateDaysUntil = (date: Date | null) => {
      if (!date) return null
      const now = new Date()
      const diff = date.getTime() - now.getTime()
      return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    const getDocumentStatus = (
      manuallyVerified: boolean, 
      expiryDays: number | null, 
      hostDocumentsVerified: boolean
    ) => {
      // If manually verified by fleet for this specific document
      if (manuallyVerified) {
        if (expiryDays === null) return 'VERIFIED'
        if (expiryDays < 0) return 'EXPIRED'
        if (expiryDays < 30) return 'EXPIRING_SOON'
        return 'VERIFIED'
      }
      
      // If host is approved and documents verified during approval process
      if (hostDocumentsVerified) {
        if (expiryDays === null) return 'VERIFIED'
        if (expiryDays < 0) return 'EXPIRED'
        if (expiryDays < 30) return 'EXPIRING_SOON'
        return 'VERIFIED'
      }
      
      return 'NOT_VERIFIED'
    }

    const registrationExpiryDays = calculateDaysUntil(vehicle.registrationExpiryDate)
    const insuranceExpiryDays = calculateDaysUntil(vehicle.insuranceExpiryDate)

    const isHostApproved = host.approvalStatus === 'APPROVED'
    const documentsVerified = host.documentsVerified === true
    
    console.log('✅ Host Approved:', isHostApproved)
    console.log('✅ Documents Verified:', documentsVerified)

    // ===== VIN STATUS =====
    const vinStatus = vehicle.vin 
      ? (vehicle.vinVerifiedBy || documentsVerified ? 'VERIFIED' : 'UPLOADED')
      : 'MISSING'

    // ===== REGISTRATION STATUS =====
    const registrationStatus = getDocumentStatus(
      !!vehicle.registrationVerifiedBy,
      registrationExpiryDays,
      documentsVerified
    )

    // ===== INSURANCE DOCUMENT STATUS =====
    const insuranceDocumentStatus = getDocumentStatus(
      !!vehicle.insuranceVerifiedBy,
      insuranceExpiryDays,
      documentsVerified
    )

    // ===== TITLE VERIFIED =====
    const titleVerified = vehicle.titleVerifiedBy || documentsVerified

    // ===== INSURANCE TIER LOGIC =====
    let insuranceTypeDisplay = 'Platform Only (40%)'
    let insuranceProvider = 'ItWhip Platform Insurance'
    let revenueSplit = 40
    let tierName = 'BASIC'
    let insuranceStatus = 'ACTIVE'
    let canUpgrade = false
    let upgradeMessage = ''
    let hostInsuranceDetails = null

    if (!isHostApproved) {
      insuranceTypeDisplay = 'Platform Only (40%)'
      insuranceProvider = 'ItWhip Platform Insurance'
      revenueSplit = 40
      tierName = 'BASIC'
      canUpgrade = true
      upgradeMessage = 'Complete verification to unlock higher tiers'
      insuranceStatus = 'PENDING_APPROVAL'
    } else {
      if (host.earningsTier === 'PREMIUM') {
        insuranceTypeDisplay = 'Commercial Insurance (90%)'
        insuranceProvider = host.commercialInsuranceProvider || 'Commercial Insurance'
        revenueSplit = 90
        tierName = 'PREMIUM'
        insuranceStatus = host.commercialInsuranceStatus || 'ACTIVE'
        canUpgrade = false
        
        hostInsuranceDetails = {
          type: 'COMMERCIAL',
          provider: host.commercialInsuranceProvider,
          policyNumber: host.commercialPolicyNumber,
          expiresAt: host.commercialInsuranceExpires,
          status: host.commercialInsuranceStatus
        }
      }
      else if (host.earningsTier === 'STANDARD') {
        insuranceTypeDisplay = 'P2P Insurance (75%)'
        insuranceProvider = host.p2pInsuranceProvider || 
                           host.hostInsuranceProvider || 
                           'P2P Insurance'
        revenueSplit = 75
        tierName = 'STANDARD'
        insuranceStatus = host.p2pInsuranceStatus || host.hostInsuranceStatus || 'ACTIVE'
        canUpgrade = true
        upgradeMessage = 'Upgrade to Commercial Insurance for 90% earnings'
        
        hostInsuranceDetails = {
          type: 'P2P',
          provider: host.p2pInsuranceProvider || host.hostInsuranceProvider,
          policyNumber: host.p2pPolicyNumber || host.hostPolicyNumber,
          expiresAt: host.p2pInsuranceExpires || host.hostInsuranceExpires,
          status: host.p2pInsuranceStatus || host.hostInsuranceStatus
        }
      }
      else if (host.earningsTier === 'BASIC') {
        if (host.commercialInsuranceStatus === 'PENDING') {
          insuranceTypeDisplay = 'Platform Only (40%)'
          insuranceProvider = 'ItWhip Platform Insurance'
          revenueSplit = 40
          tierName = 'BASIC'
          insuranceStatus = 'PENDING'
          canUpgrade = false
          upgradeMessage = 'Commercial insurance pending fleet approval'
          
          hostInsuranceDetails = {
            type: 'COMMERCIAL',
            provider: host.commercialInsuranceProvider,
            policyNumber: host.commercialPolicyNumber,
            expiresAt: host.commercialInsuranceExpires,
            status: 'PENDING'
          }
        }
        else if (host.p2pInsuranceStatus === 'PENDING' || host.hostInsuranceStatus === 'PENDING') {
          insuranceTypeDisplay = 'Platform Only (40%)'
          insuranceProvider = 'ItWhip Platform Insurance'
          revenueSplit = 40
          tierName = 'BASIC'
          insuranceStatus = 'PENDING'
          canUpgrade = false
          upgradeMessage = 'P2P insurance pending fleet approval'
          
          hostInsuranceDetails = {
            type: 'P2P',
            provider: host.p2pInsuranceProvider || host.hostInsuranceProvider,
            policyNumber: host.p2pPolicyNumber || host.hostPolicyNumber,
            expiresAt: host.p2pInsuranceExpires || host.hostInsuranceExpires,
            status: 'PENDING'
          }
        }
        else {
          insuranceTypeDisplay = 'Platform Only (40%)'
          insuranceProvider = 'ItWhip Platform Insurance'
          revenueSplit = 40
          tierName = 'BASIC'
          insuranceStatus = 'ACTIVE'
          canUpgrade = true
          upgradeMessage = 'Add your insurance to earn 75-90% per booking'
        }
      }
    }

    console.log('🎯 ===== FINAL DOCUMENT STATUS =====')
    console.log('VIN:', vinStatus)
    console.log('Registration:', registrationStatus)
    console.log('Registration State:', vehicle.registrationState)
    console.log('Registration Expiry:', vehicle.registrationExpiryDate)
    console.log('Insurance Doc:', insuranceDocumentStatus)
    console.log('Title Verified:', titleVerified)
    console.log('Insurance Type:', insuranceTypeDisplay)
    console.log('Revenue Split:', revenueSplit)
    console.log('===================================')

    const documents = {
      vin: {
        value: vehicle.vin,
        status: vinStatus,
        verifiedBy: vehicle.vinVerifiedBy || (documentsVerified ? host.approvedBy : null),
        verifiedAt: vehicle.vinVerifiedAt || (documentsVerified ? host.verifiedAt : null),
        verificationMethod: vehicle.vinVerificationMethod || (documentsVerified ? 'Fleet Approval Process' : null),
        lastEightDigits: vehicle.vin ? vehicle.vin.slice(-8) : null
      },
      
      registration: {
        status: registrationStatus,
        verifiedBy: vehicle.registrationVerifiedBy || (documentsVerified ? host.approvedBy : null),
        verifiedAt: vehicle.registrationVerifiedAt || (documentsVerified ? host.verifiedAt : null),
        expiryDate: vehicle.registrationExpiryDate,
        daysUntilExpiry: registrationExpiryDays,
        registeredOwner: vehicle.registeredOwner,
        registrationState: vehicle.registrationState || null,
        licensePlate: vehicle.licensePlate || null
      },
      
      insurance: {
        type: insuranceTypeDisplay,
        provider: insuranceProvider,
        revenueSplit: revenueSplit,
        tierName: tierName,
        insuranceStatus: insuranceStatus,
        canUpgrade: canUpgrade,
        upgradeMessage: upgradeMessage,
        isApproved: isHostApproved,
        hostInsuranceDetails: hostInsuranceDetails,
        allInsuranceOptions: {
          commercial: host.commercialInsuranceStatus ? {
            status: host.commercialInsuranceStatus,
            provider: host.commercialInsuranceProvider,
            policyNumber: host.commercialPolicyNumber,
            expires: host.commercialInsuranceExpires
          } : null,
          p2p: host.p2pInsuranceStatus ? {
            status: host.p2pInsuranceStatus,
            provider: host.p2pInsuranceProvider,
            policyNumber: host.p2pPolicyNumber,
            expires: host.p2pInsuranceExpires
          } : null,
          legacy: host.hostInsuranceStatus ? {
            status: host.hostInsuranceStatus,
            provider: host.hostInsuranceProvider,
            policyNumber: host.hostPolicyNumber,
            expires: host.hostInsuranceExpires
          } : null
        },
        documentStatus: insuranceDocumentStatus,
        verifiedBy: vehicle.insuranceVerifiedBy || (documentsVerified ? host.approvedBy : null),
        verifiedAt: vehicle.insuranceVerifiedAt || (documentsVerified ? host.verifiedAt : null),
        expiryDate: vehicle.insuranceExpiryDate,
        daysUntilExpiry: insuranceExpiryDays
      },
      
      title: {
        status: vehicle.titleStatus || 'Clean',
        verifiedBy: vehicle.titleVerifiedBy || (documentsVerified ? host.approvedBy : null),
        verifiedAt: vehicle.titleVerifiedAt || (documentsVerified ? host.verifiedAt : null),
        hasLien: vehicle.hasLien,
        lienholderName: vehicle.lienholderName,
        lienholderAddress: vehicle.lienholderAddress
      }
    }

    // ===== COMPLIANCE SCORE =====
    const complianceChecks = [
      vehicle.vin !== null,                                        // 1. Has VIN
      vehicle.vinVerifiedBy !== null || documentsVerified,        // 2. VIN verified
      vehicle.registrationVerifiedBy !== null || documentsVerified, // 3. Registration verified
      registrationExpiryDays ? registrationExpiryDays > 0 : true,  // 4. Registration not expired
      vehicle.insuranceVerifiedBy !== null || documentsVerified,   // 5. Insurance verified
      insuranceExpiryDays ? insuranceExpiryDays > 0 : true,       // 6. Insurance not expired
      vehicle.titleVerifiedBy !== null || documentsVerified        // 7. Title verified
    ]

    const complianceScore = Math.round(
      (complianceChecks.filter(Boolean).length / complianceChecks.length) * 100
    )

    const warnings = []
    if (!vehicle.vin) warnings.push('VIN missing')
    if (vehicle.vin && !vehicle.vinVerifiedBy && !documentsVerified) warnings.push('VIN not verified')
    if (!vehicle.registrationVerifiedBy && !documentsVerified) warnings.push('Registration not verified')
    if (!vehicle.registrationExpiryDate) warnings.push('Registration expiry date not set')
    if (registrationExpiryDays && registrationExpiryDays < 30 && registrationExpiryDays > 0) {
      warnings.push(`Registration expires in ${registrationExpiryDays} days`)
    }
    if (registrationExpiryDays && registrationExpiryDays < 0) {
      warnings.push('Registration expired')
    }
    if (!vehicle.registrationState) warnings.push('Registration state not specified')
    if (!vehicle.insuranceVerifiedBy && !documentsVerified) warnings.push('Insurance documents not verified')
    if (insuranceExpiryDays && insuranceExpiryDays < 30 && insuranceExpiryDays > 0) {
      warnings.push(`Insurance document expires in ${insuranceExpiryDays} days`)
    }
    if (insuranceExpiryDays && insuranceExpiryDays < 0) {
      warnings.push('Insurance document expired')
    }
    if (!vehicle.titleVerifiedBy && !documentsVerified) warnings.push('Title not verified')

    return NextResponse.json({
      success: true,
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        host: {
          id: host.id,
          name: host.name,
          email: host.email,
          approvalStatus: host.approvalStatus,
          approvedAt: host.approvedAt,
          approvedBy: host.approvedBy,
          verifiedAt: host.verifiedAt,
          documentsVerified: host.documentsVerified,
          earningsTier: host.earningsTier,
          revenueSplit: revenueSplit
        }
      },
      documents,
      compliance: {
        score: complianceScore,
        warnings,
        totalChecks: complianceChecks.length,
        passedChecks: complianceChecks.filter(Boolean).length
      }
    })

  } catch (error) {
    console.error('❌ Error fetching vehicle documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}