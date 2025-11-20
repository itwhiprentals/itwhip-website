// app/api/host/mileage-integrity/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { getMileageGapSeverity } from '@/app/lib/mileage/rules'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const hostId = searchParams.get('hostId')
  
  if (!hostId) {
    return NextResponse.json(
      { error: 'Host ID required' }, 
      { status: 400 }
    )
  }
  
  try {
    // Fetch all cars with their mileage data and recent anomalies
    const cars = await prisma.rentalCar.findMany({
      where: { hostId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        licensePlate: true,
        primaryUse: true,
        currentMileage: true,
        lastRentalEndMileage: true,
        lastRentalEndDate: true,
        hasActiveClaim: true,
        serviceOverdue: true,
        inspectionExpired: true,
        mileageAnomalies: {
          where: { 
            resolved: false,
            severity: { in: ['WARNING', 'CRITICAL'] }
          },
          orderBy: { detectedAt: 'desc' },
          take: 1
        }
      }
    })
    
    // Analyze each vehicle
    const vehicleAnalysis = cars.map(car => {
      const gap = (car.currentMileage || 0) - (car.lastRentalEndMileage || 0)
      const daysSinceLastRental = car.lastRentalEndDate 
        ? Math.floor((Date.now() - new Date(car.lastRentalEndDate).getTime()) / (1000 * 60 * 60 * 24))
        : null
      
      // Determine status based on primaryUse rules
      const severity = getMileageGapSeverity(gap, car.primaryUse)
      
      // Additional risk factors
      const hasServiceIssues = car.serviceOverdue || car.inspectionExpired
      const hasRecentAnomaly = car.mileageAnomalies.length > 0
      const hasActiveClaim = car.hasActiveClaim
      
      // Determine overall status
      let status: 'normal' | 'warning' | 'critical' = 'normal'
      if (severity.level === 'VIOLATION' || severity.level === 'CRITICAL' || hasActiveClaim) {
        status = 'critical'
      } else if (severity.level === 'WARNING' || hasServiceIssues || hasRecentAnomaly) {
        status = 'warning'
      }
      
      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        licensePlate: car.licensePlate || 'Not Set',
        carName: `${car.year} ${car.make} ${car.model}`,
        lastTripEndMileage: car.lastRentalEndMileage || 0,
        currentMileage: car.currentMileage || 0,
        gap,
        daysSinceLastRental,
        primaryUse: car.primaryUse,
        status,
        severity: severity.level,
        hasServiceIssues,
        hasRecentAnomaly,
        hasActiveClaim,
        anomalyType: car.mileageAnomalies[0]?.severity || null
      }
    })
    
    // Calculate summary statistics
    const summary = {
      totalVehicles: vehicleAnalysis.length,
      normalCount: vehicleAnalysis.filter(v => v.status === 'normal').length,
      warningCount: vehicleAnalysis.filter(v => v.status === 'warning').length,
      criticalCount: vehicleAnalysis.filter(v => v.status === 'critical').length
    }
    
    // Identify top issues (vehicles needing immediate attention)
    const topIssues = vehicleAnalysis
      .filter(v => v.status !== 'normal')
      .sort((a, b) => {
        // Sort by severity: critical first, then by gap size
        if (a.status !== b.status) {
          return a.status === 'critical' ? -1 : 1
        }
        return b.gap - a.gap
      })
      .slice(0, 5)
    
    // Generate fleet alerts
    const alerts = []
    
    if (summary.criticalCount > 0) {
      alerts.push({
        type: 'critical',
        message: `${summary.criticalCount} vehicle${summary.criticalCount > 1 ? 's have' : ' has'} critical mileage issues`,
        action: 'Immediate investigation required'
      })
    }
    
    if (summary.warningCount > 2) {
      alerts.push({
        type: 'warning',
        message: `${summary.warningCount} vehicles show irregular mileage patterns`,
        action: 'Review and document usage'
      })
    }
    
    const vehiclesWithClaimsRisk = vehicleAnalysis.filter(
      v => v.severity === 'VIOLATION' || v.severity === 'CRITICAL'
    ).length
    
    if (vehiclesWithClaimsRisk > 0) {
      alerts.push({
        type: 'warning',
        message: `${vehiclesWithClaimsRisk} vehicle${vehiclesWithClaimsRisk > 1 ? 's' : ''} may face claim complications`,
        action: 'Update usage declarations or document gaps'
      })
    }
    
    return NextResponse.json({
      vehicles: topIssues,
      summary,
      alerts,
      analysis: {
        totalAnalyzed: vehicleAnalysis.length,
        complianceRate: vehicleAnalysis.length > 0 
          ? Math.round((summary.normalCount / vehicleAnalysis.length) * 100)
          : 100,
        averageGap: vehicleAnalysis.length > 0
          ? Math.round(vehicleAnalysis.reduce((sum, v) => sum + v.gap, 0) / vehicleAnalysis.length)
          : 0,
        vehiclesAtRisk: vehiclesWithClaimsRisk
      }
    })
  } catch (error) {
    console.error('Mileage integrity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mileage integrity data' }, 
      { status: 500 }
    )
  }
}

// POST endpoint to log anomalies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { carId, anomalyType, severity, gapMiles, explanation } = body
    
    if (!carId || !anomalyType || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create mileage anomaly record
    const anomaly = await prisma.mileageAnomaly.create({
      data: {
        carId,
        detectedAt: new Date(),
        lastKnownMileage: body.lastKnownMileage || 0,
        currentMileage: body.currentMileage || 0,
        gapMiles: gapMiles || 0,
        severity,
        explanation: explanation || null,
        resolved: false
      }
    })
    
    // Update car's lastRentalEndMileage if provided
    if (body.updateLastMileage) {
      await prisma.rentalCar.update({
        where: { id: carId },
        data: {
          lastRentalEndMileage: body.currentMileage,
          lastRentalEndDate: new Date()
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      anomaly
    })
  } catch (error) {
    console.error('Failed to create anomaly:', error)
    return NextResponse.json(
      { error: 'Failed to log anomaly' },
      { status: 500 }
    )
  }
}