// app/api/host/dashboard/service-metrics/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { analyzeServiceTriggers, generateServiceAlerts } from '@/app/lib/service/calculate-service-triggers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get('hostId')
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      )
    }

    // Get all cars for this host
    const cars = await prisma.rentalCar.findMany({
      where: {
        hostId: hostId
      },
      include: {
        VehicleServiceRecord: {
          orderBy: {
            serviceDate: 'desc'
          }
        },
        bookings: {
          where: {
            status: {
              in: ['ACTIVE', 'CONFIRMED']
            }
          },
          include: {
            Claim: {
              where: {
                status: {
                  in: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'GUEST_RESPONSE_PENDING', 'GUEST_RESPONDED']
                }
              }
            }
          }
        }
      }
    })

    if (!cars || cars.length === 0) {
      return NextResponse.json({
        totalVehicles: 0,
        overallStatus: 'no_vehicles',
        claimHoldCount: 0,
        criticalCount: 0,
        overdueCount: 0,
        dueSoonCount: 0,
        currentCount: 0,
        alerts: [],
        vehicleStatuses: [],
        esgImpact: {
          maintenanceScore: 'no_impact',
          insuranceRisk: false,
          potentialDeactivations: 0
        },
        graceMode: {
          active: true,
          message: 'Pre-launch grace period active'
        }
      })
    }

    // SOFT COMPLIANCE MODE - Analyze each vehicle
    const vehicleStatuses = cars.map(car => {
      const analysis = analyzeServiceTriggers(
        car.VehicleServiceRecord,
        car.totalTrips || 0,
        car.currentMileage || 0
      )

      const alerts = generateServiceAlerts(analysis)

      // Check if vehicle has active claims
      const hasActiveClaim = car.bookings.some((booking: any) =>
        booking.Claim && booking.Claim.length > 0
      )

      // SOFT COMPLIANCE: Separate claim status from maintenance status
      let claimStatus: 'none' | 'active' = 'none'
      let maintenanceStatus: 'critical' | 'overdue' | 'due_soon' | 'current' | 'needs_verification' = 'current'

      // CLAIM STATUS (separate from maintenance)
      if (!car.isActive || hasActiveClaim) {
        claimStatus = 'active'
      }

      // MAINTENANCE STATUS (independent of claim)
      if (analysis.inspection.severity === 'critical' && analysis.inspection.isOverdue) {
        maintenanceStatus = 'needs_verification' // Grace mode
      }
      else if ((analysis.oilChange.severity === 'severe' || analysis.oilChange.severity === 'critical') || alerts.some(a => a.severity === 'error')) {
        maintenanceStatus = 'critical'
      }
      else if (analysis.oilChange.isOverdue ||
               (analysis.inspection.isOverdue && analysis.inspection.severity !== 'critical') ||
               alerts.some(a => a.severity === 'warning')) {
        maintenanceStatus = 'overdue'
      }
      else if (analysis.inspection.severity === 'minor' ||
               analysis.oilChange.severity === 'minor' ||
               alerts.some(a => a.severity === 'info')) {
        maintenanceStatus = 'due_soon'
      }
      
      // ✅ OVERALL STATUS for dashboard badge
      let overallStatus: 'critical' | 'overdue' | 'due_soon' | 'current' | 'claim_hold' = 'current'
      
      if (claimStatus === 'active') {
        overallStatus = 'claim_hold' // ✅ NEW: Separate from maintenance
      } else if (maintenanceStatus === 'critical') {
        overallStatus = 'critical'
      } else if (maintenanceStatus === 'overdue' || maintenanceStatus === 'needs_verification') {
        overallStatus = 'overdue'
      } else if (maintenanceStatus === 'due_soon') {
        overallStatus = 'due_soon'
      }

      // Get last service dates
      const lastOilChange = car.VehicleServiceRecord.find(
        (r: any) => r.serviceType === 'OIL_CHANGE'
      )
      const lastInspection = car.VehicleServiceRecord.find(
        (r: any) => r.serviceType === 'STATE_INSPECTION'
      )

      return {
        carId: car.id,
        carName: `${car.year} ${car.make} ${car.model}`,
        licensePlate: car.licensePlate || 'N/A',
        status: overallStatus,
        claimStatus: claimStatus,
        maintenanceStatus: maintenanceStatus,
        isActive: car.isActive,
        hasActiveClaim: hasActiveClaim,
        currentMileage: car.currentMileage || 0,
        lastOilChange: lastOilChange?.serviceDate || null,
        lastInspection: lastInspection?.serviceDate || null,
        alerts: alerts.map(a => a.message),
        totalServiceRecords: car.VehicleServiceRecord.length,
        inspectionExpiring: analysis.inspection.severity === 'minor' || (analysis.inspection.severity === 'critical' && analysis.inspection.isOverdue),
        oilChangeOverdue: analysis.oilChange.isOverdue,
        inspectionExpired: analysis.inspection.severity === 'critical' && analysis.inspection.isOverdue
      }
    })

    // ✅ SOFT COMPLIANCE: Calculate counts by CLAIM vs MAINTENANCE
    const claimHoldCount = vehicleStatuses.filter(v => v.claimStatus === 'active').length
    const criticalCount = vehicleStatuses.filter(v => v.maintenanceStatus === 'critical').length
    const overdueCount = vehicleStatuses.filter(v => v.maintenanceStatus === 'overdue' || v.maintenanceStatus === 'needs_verification').length
    const dueSoonCount = vehicleStatuses.filter(v => v.maintenanceStatus === 'due_soon').length
    const currentCount = vehicleStatuses.filter(v => v.maintenanceStatus === 'current' && v.claimStatus === 'none').length

    // ✅ Overall status
    let overallStatus: 'critical' | 'overdue' | 'due_soon' | 'current' = 'current'
    if (criticalCount > 0) overallStatus = 'critical'
    else if (overdueCount > 0) overallStatus = 'overdue'
    else if (dueSoonCount > 0) overallStatus = 'due_soon'

    // ✅ SOFT COMPLIANCE: Generate separate alerts for claims vs maintenance
    const fleetAlerts = []
    
    // CLAIM ALERTS (separate)
    if (claimHoldCount > 0) {
      fleetAlerts.push({
        severity: 'critical',
        category: 'claim',
        message: `${claimHoldCount} vehicle${claimHoldCount > 1 ? 's' : ''} on claim hold`,
        action: 'Resolve active insurance claims to reactivate',
        affectedVehicles: vehicleStatuses.filter(v => v.claimStatus === 'active').map(v => v.carId)
      })
    }
    
    // MAINTENANCE ALERTS (separate)
    const inspectionsExpiring = vehicleStatuses.filter(v => v.inspectionExpired && v.isActive).length
    const oilChangesOverdue = vehicleStatuses.filter(v => v.oilChangeOverdue && v.isActive).length
    
    if (inspectionsExpiring > 0) {
      fleetAlerts.push({
        severity: 'warning',
        category: 'maintenance',
        message: `${inspectionsExpiring} vehicle${inspectionsExpiring > 1 ? 's' : ''} need inspection verification`,
        action: 'Upload recent inspection records during grace period',
        affectedVehicles: vehicleStatuses.filter(v => v.inspectionExpired && v.isActive).map(v => v.carId)
      })
    }

    if (oilChangesOverdue > 0) {
      fleetAlerts.push({
        severity: 'warning',
        category: 'maintenance',
        message: `${oilChangesOverdue} vehicle${oilChangesOverdue > 1 ? 's' : ''} overdue for oil change`,
        action: 'Schedule oil changes to prevent engine damage',
        affectedVehicles: vehicleStatuses.filter(v => v.oilChangeOverdue && v.isActive).map(v => v.carId)
      })
    }

    // ✅ SOFT COMPLIANCE: ESG impact (non-punitive)
    const esgImpact = {
      maintenanceScore: criticalCount > 0 ? 'establishing' : 
                       overdueCount > 0 ? 'in_progress' : 
                       dueSoonCount > 0 ? 'monitoring' : 'compliant',
      insuranceRisk: false, // ✅ Grace mode - no insurance risk during onboarding
      potentialDeactivations: 0 // ✅ Grace mode - no deactivations yet
    }

    // ✅ GRACE MODE STATUS
    const graceMode = {
      active: true,
      message: 'Pre-Launch Maintenance Grace',
      description: 'Vehicles remain active while completing initial onboarding compliance',
      expiresAt: null // TODO: Set actual grace expiry date
    }

    return NextResponse.json({
      totalVehicles: cars.length,
      activeVehicles: vehicleStatuses.filter(v => v.isActive).length,
      deactivatedVehicles: vehicleStatuses.filter(v => !v.isActive).length,
      claimHoldCount, // ✅ NEW: Separate claim count
      overallStatus,
      criticalCount,
      overdueCount,
      dueSoonCount,
      currentCount,
      alerts: fleetAlerts,
      vehicleStatuses: vehicleStatuses.sort((a, b) => {
        // Sort: claim hold first, then by maintenance severity
        if (a.claimStatus === 'active' && b.claimStatus === 'none') return -1
        if (a.claimStatus === 'none' && b.claimStatus === 'active') return 1
        
        const statusOrder = { critical: 0, overdue: 1, needs_verification: 2, due_soon: 3, current: 4 }
        return statusOrder[a.maintenanceStatus] - statusOrder[b.maintenanceStatus]
      }),
      esgImpact,
      graceMode, // ✅ NEW: Grace mode info
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Service metrics API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch service metrics', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}