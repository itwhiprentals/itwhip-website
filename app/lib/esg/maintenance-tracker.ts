// app/lib/esg/maintenance-tracker.ts
/**
 * Maintenance Tracking & Compliance Scoring
 * Monitors vehicle maintenance schedules and flags overdue service
 */

import prisma from '@/app/lib/database/prisma'
import { daysBetween, isOverdue, daysUntil } from './esg-helpers'

// ============================================================================
// TYPES
// ============================================================================

export interface MaintenanceAnalysis {
  carId: string
  maintenanceScore: number
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'OVERDUE' | 'CRITICAL'
  lastServiceDate: Date | null
  nextServiceDue: Date | null
  daysSinceService: number
  daysUntilService: number
  isOverdue: boolean
  overdueBy: number
  recommendedActions: string[]
  maintenanceHistory: MaintenanceRecord[]
  complianceRate: number
}

export interface MaintenanceRecord {
  date: Date
  type: 'OIL_CHANGE' | 'INSPECTION' | 'TIRE_ROTATION' | 'BRAKE_SERVICE' | 'OTHER'
  mileage: number
  daysFromLastService: number
  wasOnTime: boolean
  notes?: string
}

export interface FleetMaintenanceStatus {
  totalVehicles: number
  excellentCount: number
  goodCount: number
  fairCount: number
  overdueCount: number
  criticalCount: number
  averageComplianceRate: number
  totalOverdueDays: number
  recommendations: string[]
}

// ============================================================================
// MAIN MAINTENANCE ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyze maintenance status for a single vehicle
 */
export async function analyzeVehicleMaintenance(carId: string): Promise<MaintenanceAnalysis> {
  const car = await prisma.rentalCar.findUnique({
    where: { id: carId },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      currentMileage: true,
      lastOdometerCheck: true,
      maintenanceCadence: true,
      safetyHold: true,
      requiresInspection: true,
      repairVerified: true,
      createdAt: true,
      totalTrips: true,
      hasActiveClaim: true,
    },
  })

  if (!car) {
    throw new Error(`Vehicle not found: ${carId}`)
  }

  const maintenanceCadence = car.maintenanceCadence || 90 // Default: 90 days
  const lastServiceDate = car.lastOdometerCheck || car.createdAt
  const daysSinceService = daysBetween(new Date(lastServiceDate), new Date())
  const nextServiceDue = new Date(lastServiceDate)
  nextServiceDue.setDate(nextServiceDue.getDate() + maintenanceCadence)

  const daysUntilServiceDue = daysUntil(nextServiceDue)
  const isOverdueFlag = daysSinceService > maintenanceCadence
  const overdueBy = Math.max(0, daysSinceService - maintenanceCadence)

  // Calculate maintenance score (0-100)
  let maintenanceScore = 100

  // Penalty for overdue maintenance
  if (isOverdueFlag) {
    const overdueWeeks = overdueBy / 7
    maintenanceScore -= Math.min(50, overdueWeeks * 5) // -5 points per week, max -50
  } else {
    // Bonus for being ahead of schedule
    if (daysUntilServiceDue > 30) {
      maintenanceScore += 10 // Well-maintained
    } else if (daysUntilServiceDue > 14) {
      maintenanceScore += 5 // On track
    }
  }

  // Penalty for safety holds
  if (car.safetyHold) {
    maintenanceScore -= 30
  }

  // Penalty for required inspections
  if (car.requiresInspection) {
    maintenanceScore -= 20
  }

  // Bonus for verified repairs
  if (car.repairVerified) {
    maintenanceScore += 10
  }

  // Penalty for active claims (may need repairs)
  if (car.hasActiveClaim) {
    maintenanceScore -= 15
  }

  // Clamp score
  maintenanceScore = Math.max(0, Math.min(100, maintenanceScore))

  // Determine status
  let status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'OVERDUE' | 'CRITICAL'
  if (car.safetyHold || overdueBy > 60) {
    status = 'CRITICAL'
  } else if (isOverdueFlag) {
    status = 'OVERDUE'
  } else if (maintenanceScore >= 90) {
    status = 'EXCELLENT'
  } else if (maintenanceScore >= 75) {
    status = 'GOOD'
  } else {
    status = 'FAIR'
  }

  // Build maintenance history (simplified - would come from dedicated table)
  const maintenanceHistory = buildMaintenanceHistory(car, lastServiceDate, maintenanceCadence)

  // Calculate compliance rate
  const complianceRate = calculateComplianceRate(maintenanceHistory)

  // Generate recommendations
  const recommendedActions = generateMaintenanceRecommendations(
    status,
    overdueBy,
    daysUntilServiceDue,
    car
  )

  return {
    carId,
    maintenanceScore,
    status,
    lastServiceDate,
    nextServiceDue,
    daysSinceService,
    daysUntilService: daysUntilServiceDue,
    isOverdue: isOverdueFlag,
    overdueBy,
    recommendedActions,
    maintenanceHistory,
    complianceRate,
  }
}

// ============================================================================
// MAINTENANCE HISTORY BUILDER
// ============================================================================

function buildMaintenanceHistory(
  car: any,
  lastServiceDate: Date,
  cadence: number
): MaintenanceRecord[] {
  // Simplified implementation - in production this would query a MaintenanceLog table
  // For now, we'll create a synthetic history based on lastOdometerCheck

  const history: MaintenanceRecord[] = []

  if (car.lastOdometerCheck) {
    history.push({
      date: new Date(car.lastOdometerCheck),
      type: 'INSPECTION',
      mileage: car.currentMileage || 0,
      daysFromLastService: 0,
      wasOnTime: true,
      notes: 'Most recent service',
    })
  }

  return history
}

// ============================================================================
// COMPLIANCE RATE CALCULATION
// ============================================================================

function calculateComplianceRate(history: MaintenanceRecord[]): number {
  if (history.length === 0) return 100 // No history = assume compliant

  const onTimeServices = history.filter((record) => record.wasOnTime).length
  const totalServices = history.length

  return Math.round((onTimeServices / totalServices) * 100)
}

// ============================================================================
// RECOMMENDATIONS GENERATOR
// ============================================================================

function generateMaintenanceRecommendations(
  status: string,
  overdueBy: number,
  daysUntilService: number,
  car: any
): string[] {
  const recommendations: string[] = []

  // Critical status
  if (status === 'CRITICAL') {
    recommendations.push('🚨 URGENT: Vehicle requires immediate maintenance')
    if (car.safetyHold) {
      recommendations.push('Vehicle is on safety hold - resolve issues before reactivating')
    }
    if (overdueBy > 60) {
      recommendations.push(
        `Maintenance is ${overdueBy} days overdue - schedule service immediately`
      )
    }
    recommendations.push('Consider deactivating vehicle until maintenance is complete')
  }

  // Overdue status
  else if (status === 'OVERDUE') {
    recommendations.push(
      `⚠️ Maintenance is ${overdueBy} days overdue - schedule service soon`
    )
    recommendations.push('Continuing to operate may void warranty or insurance coverage')
  }

  // Fair status
  else if (status === 'FAIR') {
    if (daysUntilService <= 14) {
      recommendations.push(
        `Maintenance due in ${daysUntilService} days - schedule appointment now`
      )
    } else {
      recommendations.push('Monitor maintenance schedule closely')
    }
  }

  // Good status
  else if (status === 'GOOD') {
    recommendations.push(
      `✓ Next service due in ${daysUntilService} days - on track`
    )
  }

  // Excellent status
  else if (status === 'EXCELLENT') {
    recommendations.push('✅ Maintenance is up to date - excellent!')
  }

  // Additional context-specific recommendations
  if (car.requiresInspection) {
    recommendations.push('Vehicle requires inspection - schedule with certified mechanic')
  }

  if (car.hasActiveClaim) {
    recommendations.push(
      'Active claim may require repairs - coordinate with insurance adjuster'
    )
  }

  if (!car.repairVerified && car.totalTrips > 0) {
    recommendations.push('Consider getting vehicle inspected to verify condition')
  }

  // Mileage-based recommendations
  if (car.currentMileage && car.currentMileage > 100000) {
    recommendations.push('High-mileage vehicle - consider more frequent maintenance')
  }

  return recommendations
}

// ============================================================================
// FLEET-WIDE MAINTENANCE ANALYSIS
// ============================================================================

/**
 * Analyze maintenance status across entire fleet
 */
export async function analyzeFleetMaintenance(hostId: string): Promise<FleetMaintenanceStatus> {
  const cars = await prisma.rentalCar.findMany({
    where: { hostId, isActive: true },
    select: { id: true },
  })

  if (cars.length === 0) {
    return {
      totalVehicles: 0,
      excellentCount: 0,
      goodCount: 0,
      fairCount: 0,
      overdueCount: 0,
      criticalCount: 0,
      averageComplianceRate: 100,
      totalOverdueDays: 0,
      recommendations: ['No active vehicles in fleet'],
    }
  }

  // Analyze each vehicle
  const analyses = await Promise.all(
    cars.map((car) => analyzeVehicleMaintenance(car.id))
  )

  // Count statuses
  const excellentCount = analyses.filter((a) => a.status === 'EXCELLENT').length
  const goodCount = analyses.filter((a) => a.status === 'GOOD').length
  const fairCount = analyses.filter((a) => a.status === 'FAIR').length
  const overdueCount = analyses.filter((a) => a.status === 'OVERDUE').length
  const criticalCount = analyses.filter((a) => a.status === 'CRITICAL').length

  // Calculate average compliance rate
  const averageComplianceRate =
    analyses.reduce((sum, a) => sum + a.complianceRate, 0) / analyses.length

  // Calculate total overdue days
  const totalOverdueDays = analyses.reduce((sum, a) => sum + a.overdueBy, 0)

  // Generate fleet-level recommendations
  const recommendations = generateFleetMaintenanceRecommendations({
    totalVehicles: cars.length,
    excellentCount,
    goodCount,
    fairCount,
    overdueCount,
    criticalCount,
    averageComplianceRate,
    totalOverdueDays,
    recommendations: [], // ✅ Added missing property
  })

  return {
    totalVehicles: cars.length,
    excellentCount,
    goodCount,
    fairCount,
    overdueCount,
    criticalCount,
    averageComplianceRate: Math.round(averageComplianceRate),
    totalOverdueDays,
    recommendations,
  }
}

// ============================================================================
// FLEET RECOMMENDATIONS
// ============================================================================

function generateFleetMaintenanceRecommendations(
  status: FleetMaintenanceStatus
): string[] {
  const recommendations: string[] = []

  const { totalVehicles, criticalCount, overdueCount, averageComplianceRate } = status

  // Critical vehicles
  if (criticalCount > 0) {
    recommendations.push(
      `🚨 ${criticalCount} vehicle(s) require immediate maintenance attention`
    )
  }

  // Overdue vehicles
  if (overdueCount > 0) {
    recommendations.push(`⚠️ ${overdueCount} vehicle(s) have overdue maintenance`)
  }

  // Overall fleet health
  const healthyCount = status.excellentCount + status.goodCount
  const healthyPercentage = Math.round((healthyCount / totalVehicles) * 100)

  if (healthyPercentage >= 90) {
    recommendations.push('✅ Excellent fleet maintenance - 90%+ vehicles are up to date')
  } else if (healthyPercentage >= 75) {
    recommendations.push('✓ Good fleet maintenance overall')
  } else if (healthyPercentage >= 50) {
    recommendations.push('Fleet maintenance needs attention - schedule services')
  } else {
    recommendations.push('⚠️ Fleet maintenance is behind schedule - prioritize catch-up')
  }

  // Compliance rate feedback
  if (averageComplianceRate >= 95) {
    recommendations.push('Outstanding maintenance compliance rate!')
  } else if (averageComplianceRate < 70) {
    recommendations.push('Consider implementing automated maintenance reminders')
  }

  return recommendations
}

// ============================================================================
// UPDATE DATABASE WITH MAINTENANCE STATUS
// ============================================================================

/**
 * Analyze maintenance and update vehicle maintenance score
 */
export async function updateVehicleMaintenanceStatus(carId: string): Promise<void> {
  const analysis = await analyzeVehicleMaintenance(carId)

  // Update vehicle with maintenance score
  await prisma.rentalCar.update({
    where: { id: carId },
    data: {
      esgMaintenanceScore: analysis.maintenanceScore,
      lastOdometerCheck: analysis.lastServiceDate,
      requiresInspection:
        analysis.status === 'CRITICAL' || analysis.status === 'OVERDUE',
    },
  })
}

// ============================================================================
// SCHEDULED MAINTENANCE CHECKER
// ============================================================================

/**
 * Check all vehicles for upcoming/overdue maintenance
 * Run this nightly as a cron job
 */
export async function checkScheduledMaintenance(hostId?: string): Promise<{
  upcomingCount: number
  overdueCount: number
  criticalCount: number
  vehiclesNeedingAttention: Array<{
    carId: string
    make: string
    model: string
    status: string
    daysOverdue: number
  }>
}> {
  const whereClause = hostId ? { hostId, isActive: true } : { isActive: true }

  const cars = await prisma.rentalCar.findMany({
    where: whereClause,
    select: {
      id: true,
      make: true,
      model: true,
    },
  })

  const analyses = await Promise.all(
    cars.map((car) => analyzeVehicleMaintenance(car.id))
  )

  const upcomingCount = analyses.filter(
    (a) => !a.isOverdue && a.daysUntilService <= 14
  ).length

  const overdueCount = analyses.filter((a) => a.status === 'OVERDUE').length
  const criticalCount = analyses.filter((a) => a.status === 'CRITICAL').length

  const vehiclesNeedingAttention = analyses
    .filter((a) => a.status === 'CRITICAL' || a.status === 'OVERDUE')
    .map((a, index) => ({
      carId: a.carId,
      make: cars[index].make,
      model: cars[index].model,
      status: a.status,
      daysOverdue: a.overdueBy,
    }))

  return {
    upcomingCount,
    overdueCount,
    criticalCount,
    vehiclesNeedingAttention,
  }
}