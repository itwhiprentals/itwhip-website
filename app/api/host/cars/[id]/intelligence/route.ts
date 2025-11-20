// app/api/host/cars/[id]/intelligence/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { generateVehicleIntelligence, getIntelligenceSummary, calculateInsuranceImpact } from '@/app/lib/mileage/intelligence'
// ✅ FIXED: Import from correct locations
import { getDeclarationConfig, getEarningsTierInfo } from '@/app/lib/constants/declarations'
import { isGapCompliant, getGapSeverity } from '@/app/lib/compliance/declaration-helpers'

// ✅ NEW: Calculate tier from host insurance status (automatic)
function calculateTierFromHost(host: any): { insuranceType: string; revenueSplit: number } {
  // Check commercial insurance first (90% tier)
  if (host.commercialInsuranceStatus === 'ACTIVE') {
    return {
      insuranceType: 'commercial',
      revenueSplit: 90
    }
  }
  
  // Check P2P insurance (75% tier)
  if (host.p2pInsuranceStatus === 'ACTIVE') {
    return {
      insuranceType: 'p2p',
      revenueSplit: 75
    }
  }
  
  // Default to platform insurance (40% tier)
  return {
    insuranceType: 'none',
    revenueSplit: 40
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: carId } = await params
  const hostId = request.headers.get('x-host-id')
  
  if (!hostId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  try {
    // ✅ FIXED: Fetch car WITH host insurance data
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId
      },
      include: {
        host: {  // ✅ ADD THIS - Fetch host insurance data
          select: {
            id: true,
            name: true,
            earningsTier: true,
            
            // Insurance status fields
            commercialInsuranceStatus: true,
            commercialInsuranceProvider: true,
            p2pInsuranceStatus: true,
            p2pInsuranceProvider: true,
            
            // Legacy fields (for backwards compatibility)
            insuranceType: true,
            revenueSplit: true
          }
        },
        bookings: {
          where: {
            status: 'COMPLETED',
            endMileage: { not: null }
          },
          select: {
            id: true,
            bookingCode: true,
            startDate: true,
            endDate: true,
            startMileage: true,
            endMileage: true,
            status: true
          },
          orderBy: {
            endDate: 'desc'
          },
          take: 50
        }
      }
    })
    
    if (!car) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // ✅ Calculate the actual tier from host insurance status (automatic)
    const tierData = calculateTierFromHost(car.host)

    // For now, create mock data since these models might not have data yet
    const serviceRecords: any[] = []
    const mileageAnomalies: any[] = []
    const claims: any[] = []
    
    // Try to fetch related data - wrapped in try/catch to handle if tables don't exist
    try {
      const [serviceData, anomalyData, claimsData] = await Promise.all([
        // Fetch service records
        prisma.vehicleServiceRecord.findMany({
          where: { carId },
          orderBy: { serviceDate: 'desc' },
          take: 10
        }).catch(() => []),
        
        // Fetch mileage anomalies
        prisma.mileageAnomaly.findMany({
          where: {
            carId,
            resolved: false
          },
          orderBy: { detectedAt: 'desc' }
        }).catch(() => []),
        
        // Fetch claims through bookings
        prisma.claim.findMany({
          where: {
            booking: {
              carId: carId
            }
          },
          select: {
            id: true,
            status: true,
            type: true,
            createdAt: true,
            incidentDate: true,
            estimatedCost: true,
            approvedAmount: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }).catch(() => [])
      ])
      
      // Assign data if successfully fetched
      if (serviceData) serviceRecords.push(...serviceData)
      if (anomalyData) mileageAnomalies.push(...anomalyData)
      if (claimsData) claims.push(...claimsData)
    } catch (e) {
      console.log('Some related data could not be fetched, continuing with available data')
    }
    
    // Generate comprehensive intelligence
    const intelligence = await generateVehicleIntelligence(
      {
        id: car.id,
        primaryUse: car.primaryUse || 'Rental',
        currentMileage: car.currentMileage,
        lastRentalEndMileage: car.lastRentalEndMileage,
        lastRentalEndDate: car.lastRentalEndDate,
        hasActiveClaim: car.hasActiveClaim || false,
        serviceOverdue: car.serviceOverdue || false,
        inspectionExpired: car.inspectionExpired || false,
        insuranceType: tierData.insuranceType,  // ✅ Use calculated tier
        revenueSplit: tierData.revenueSplit,    // ✅ Use calculated tier
        registeredOwner: car.registeredOwner,
        vin: car.vin,
        licensePlate: car.licensePlate
      },
      car.bookings
    )
    
    // Get summary and insurance impact
    const summary = getIntelligenceSummary(intelligence)
    const insuranceImpact = calculateInsuranceImpact(intelligence)
    
    // Calculate service metrics
    const lastServiceDate = serviceRecords.length > 0 
      ? serviceRecords[0].serviceDate 
      : car.lastOilChange
      
    const daysSinceLastService = lastServiceDate
      ? Math.floor((Date.now() - new Date(lastServiceDate).getTime()) / (1000 * 60 * 60 * 24))
      : null
    
    const nextServiceDue = car.nextOilChangeDue || car.nextInspectionDue
    const daysUntilService = nextServiceDue
      ? Math.floor((new Date(nextServiceDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null
    
    // ✅ FIXED: Get declaration and earnings tier info
    const declaration = car.primaryUse || 'Rental'
    const declarationConfig = getDeclarationConfig(declaration as any)
    const averageGap = intelligence.forensicAnalysis?.averageGapSize || 0
    const earningsTierInfo = getEarningsTierInfo(tierData.insuranceType)  // ✅ Use calculated tier
    
    // Compile vehicle details for display
    const vehicleDetails = {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      trim: car.trim,
      color: car.color,
      licensePlate: car.licensePlate,
      vin: car.vin,
      primaryUse: declaration, // ✅ This is the declaration
      currentMileage: car.currentMileage || 0,
      lastRentalEndMileage: car.lastRentalEndMileage || 0,
      lastRentalEndDate: car.lastRentalEndDate,
      
      // Location
      address: car.address,
      city: car.city,
      state: car.state,
      zipCode: car.zipCode,
      
      // Insurance info (calculated from host)
      insuranceType: tierData.insuranceType,  // ✅ Use calculated tier
      revenueSplit: tierData.revenueSplit,    // ✅ Use calculated tier
      registeredOwner: car.registeredOwner,
      hasLien: car.hasLien || false,
      lienholderName: car.lienholderName,
      
      // Service info
      serviceOverdue: car.serviceOverdue || false,
      inspectionExpired: car.inspectionExpired || false,
      lastOilChange: car.lastOilChange,
      lastInspection: car.lastInspection,
      nextOilChangeDue: car.nextOilChangeDue,
      nextInspectionDue: car.nextInspectionDue,
      
      // Stats
      totalTrips: car.totalTrips || 0,
      rating: car.rating || 0,
      totalClaimsCount: car.totalClaimsCount || 0,
      claimFreeMonths: car.claimFreeMonths || 0,
      
      // Status
      isActive: car.isActive || false,
      hasActiveClaim: car.hasActiveClaim || false
    }
    
    // Prepare timeline events
    const timelineEvents: any[] = []
    
    // Add booking events
    car.bookings.slice(0, 10).forEach(booking => {
      timelineEvents.push({
        type: 'booking',
        date: booking.endDate,
        title: `Trip ${booking.bookingCode}`,
        description: `${booking.startMileage || 0} → ${booking.endMileage || 0} miles`,
        mileage: booking.endMileage
      })
    })
    
    // Add service events
    serviceRecords.forEach(service => {
      timelineEvents.push({
        type: 'service',
        date: service.serviceDate,
        title: service.serviceType?.replace(/_/g, ' ') || 'Service',
        description: `${service.shopName} - $${service.costTotal}`,
        mileage: service.mileageAtService
      })
    })
    
    // Add anomaly events
    mileageAnomalies.forEach(anomaly => {
      timelineEvents.push({
        type: 'anomaly',
        date: anomaly.detectedAt,
        title: `Mileage Gap Detected`,
        description: `${anomaly.gapMiles} mile gap - ${anomaly.severity}`,
        mileage: anomaly.currentMileage
      })
    })
    
    // Add claim events
    claims.forEach(claim => {
      timelineEvents.push({
        type: 'claim',
        date: claim.incidentDate,
        title: `Claim: ${claim.type}`,
        description: `Est. $${claim.estimatedCost} - Status: ${claim.status}`,
        mileage: null
      })
    })
    
    // Sort timeline by date
    timelineEvents.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
    
    return NextResponse.json({
      success: true,
      data: {
        vehicle: vehicleDetails,
        intelligence,
        summary,
        insuranceImpact,
        
        // ✅ NEW: Declaration data (separate from earnings)
        declaration: {
          type: declaration,
          label: declarationConfig.label,
          allowedGap: declarationConfig.maxGap,
          criticalGap: declarationConfig.criticalGap,
          description: declarationConfig.description,
          insuranceNote: declarationConfig.insuranceNote,
          taxImplication: declarationConfig.taxImplication,
          isCompliant: isGapCompliant(averageGap, declaration as any),
          severity: getGapSeverity(averageGap, declaration as any),
          actualAvgGap: averageGap
        },
        
        // ✅ NEW: Earnings tier data (calculated from host insurance)
        earningsTier: {
          percentage: tierData.revenueSplit,      // ✅ Use calculated tier
          label: earningsTierInfo.label,
          description: earningsTierInfo.description,
          insuranceType: tierData.insuranceType,  // ✅ Use calculated tier
          primaryCoverage: earningsTierInfo.primaryCoverage,
          hostInsurance: earningsTierInfo.hostInsurance,
          notes: earningsTierInfo.notes
        },
        
        serviceMetrics: {
          lastServiceDate,
          daysSinceLastService,
          nextServiceDue,
          daysUntilService,
          serviceCount: serviceRecords.length,
          lastService: serviceRecords[0] || null
        },
        timeline: timelineEvents.slice(0, 20),
        anomalies: mileageAnomalies,
        claimsHistory: claims
      }
    })
  } catch (error) {
    console.error('Failed to generate vehicle intelligence:', error)
    return NextResponse.json(
      { error: 'Failed to generate intelligence report' },
      { status: 500 }
    )
  }
}

// POST endpoint to update usage or resolve anomalies
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: carId } = await params
  const hostId = request.headers.get('x-host-id')
  
  if (!hostId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json()
    const { action, newUsage, anomalyId, explanation } = body
    
    if (!action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Verify car ownership
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId
      }
    })
    
    if (!car) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }
    
    if (action === 'update_usage') {
      // Update the car's primary use (declaration)
      if (newUsage && ['Rental', 'Personal', 'Business'].includes(newUsage)) {
        await prisma.rentalCar.update({
          where: { id: carId },
          data: {
            primaryUse: newUsage
            // ✅ NOTE: We do NOT update revenueSplit here
            // Revenue split is based on insuranceType, not declaration
          }
        })
      }
    } else if (action === 'resolve_anomaly' && anomalyId) {
      // Try to resolve anomaly if the model exists
      try {
        await prisma.mileageAnomaly.update({
          where: { id: anomalyId },
          data: {
            resolved: true,
            explanation: explanation || 'Resolved by host'
          }
        })
      } catch (e) {
        console.log('Could not resolve anomaly - table may not exist')
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Request processed'
    })
  } catch (error) {
    console.error('Failed to handle request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}