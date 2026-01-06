// app/lib/service/calculate-service-triggers.ts

import { ServiceType } from '@prisma/client'
import { isServiceOverdue, getDaysUntilService, getMilesUntilService } from './calculate-next-service-due'

/**
 * Service status result
 */
export interface ServiceStatus {
  isOverdue: boolean
  daysOverdue: number
  milesOverdue: number
  penalty: number
  severity: 'none' | 'minor' | 'moderate' | 'severe' | 'critical'
  message: string
}

/**
 * Complete service trigger analysis for a vehicle
 */
export interface ServiceTriggerAnalysis {
  oilChange: ServiceStatus
  inspection: ServiceStatus
  tireRotation: ServiceStatus
  brakeCheck: ServiceStatus
  highUsageInspection: ServiceStatus
  overallStatus: 'current' | 'due_soon' | 'overdue' | 'critical'
  totalPenalty: number
  criticalIssues: string[]
  warnings: string[]
  recommendations: string[]
}

/**
 * Check oil change status
 */
export function checkOilChangeStatus(
  lastOilChange: Date | null,
  lastOilChangeMileage: number | null,
  nextOilChangeDue: Date | null,
  nextOilChangeMileage: number | null,
  currentMileage: number,
  currentDate: Date = new Date()
): ServiceStatus {
  // No oil change record
  if (!lastOilChange) {
    return {
      isOverdue: true,
      daysOverdue: 0,
      milesOverdue: 0,
      penalty: 20,
      severity: 'moderate',
      message: 'No oil change record found'
    }
  }

  // Check if overdue
  const overdueCheck = isServiceOverdue(
    nextOilChangeDue,
    nextOilChangeMileage,
    currentDate,
    currentMileage
  )

  if (!overdueCheck.isOverdue) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      milesOverdue: 0,
      penalty: 0,
      severity: 'none',
      message: 'Oil change current'
    }
  }

  // Calculate penalty based on how overdue
  let penalty = 0
  let severity: ServiceStatus['severity'] = 'minor'
  let message = 'Oil change overdue'

  if (overdueCheck.overdueByDays > 0) {
    if (overdueCheck.overdueByDays <= 30) {
      penalty = 10
      severity = 'minor'
      message = `Oil change overdue by ${overdueCheck.overdueByDays} days`
    } else if (overdueCheck.overdueByDays <= 60) {
      penalty = 20
      severity = 'moderate'
      message = `Oil change overdue by ${overdueCheck.overdueByDays} days`
    } else {
      penalty = 30
      severity = 'severe'
      message = `Oil change critically overdue by ${overdueCheck.overdueByDays} days`
    }
  }

  if (overdueCheck.overdueByMiles > 0) {
    if (overdueCheck.overdueByMiles <= 1000) {
      penalty = Math.max(penalty, 10)
      severity = severity === 'none' ? 'minor' : severity
    } else if (overdueCheck.overdueByMiles <= 3000) {
      penalty = Math.max(penalty, 20)
      severity = severity === 'none' || severity === 'minor' ? 'moderate' : severity
    } else {
      penalty = Math.max(penalty, 30)
      severity = 'severe'
    }
  }

  return {
    isOverdue: true,
    daysOverdue: overdueCheck.overdueByDays,
    milesOverdue: overdueCheck.overdueByMiles,
    penalty,
    severity,
    message
  }
}

/**
 * Check state inspection status
 */
export function checkInspectionStatus(
  lastInspection: Date | null,
  inspectionExpiresAt: Date | null,
  currentDate: Date = new Date()
): ServiceStatus {
  // No inspection record
  if (!lastInspection || !inspectionExpiresAt) {
    return {
      isOverdue: true,
      daysOverdue: 0,
      milesOverdue: 0,
      penalty: 30,
      severity: 'critical',
      message: 'No inspection record found - inspection required'
    }
  }

  const expiresDate = new Date(inspectionExpiresAt)
  const daysUntilExpiration = Math.floor(
    (expiresDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Inspection expired
  if (currentDate > expiresDate) {
    const daysExpired = Math.abs(daysUntilExpiration)
    return {
      isOverdue: true,
      daysOverdue: daysExpired,
      milesOverdue: 0,
      penalty: 30,
      severity: 'critical',
      message: `Inspection expired ${daysExpired} days ago`
    }
  }

  // Inspection expires soon (within 30 days)
  if (daysUntilExpiration <= 30) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      milesOverdue: 0,
      penalty: 0,
      severity: 'minor',
      message: `Inspection expires in ${daysUntilExpiration} days`
    }
  }

  // Inspection current
  return {
    isOverdue: false,
    daysOverdue: 0,
    milesOverdue: 0,
    penalty: 0,
    severity: 'none',
    message: 'Inspection current'
  }
}

/**
 * Check tire rotation status
 */
export function checkTireRotationStatus(
  lastTireRotation: Date | null,
  lastTireRotationMileage: number | null,
  nextTireRotationDue: Date | null,
  nextTireRotationMileage: number | null,
  currentMileage: number,
  currentDate: Date = new Date()
): ServiceStatus {
  // No tire rotation record - not critical
  if (!lastTireRotation) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      milesOverdue: 0,
      penalty: 0,
      severity: 'minor',
      message: 'No tire rotation record found'
    }
  }

  const overdueCheck = isServiceOverdue(
    nextTireRotationDue,
    nextTireRotationMileage,
    currentDate,
    currentMileage
  )

  if (!overdueCheck.isOverdue) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      milesOverdue: 0,
      penalty: 0,
      severity: 'none',
      message: 'Tire rotation current'
    }
  }

  // Minor penalty for overdue tire rotation
  let penalty = 0
  let severity: ServiceStatus['severity'] = 'minor'

  if (overdueCheck.overdueByDays > 60 || overdueCheck.overdueByMiles > 5000) {
    penalty = 10
    severity = 'moderate'
  } else if (overdueCheck.overdueByDays > 30 || overdueCheck.overdueByMiles > 2000) {
    penalty = 5
    severity = 'minor'
  }

  return {
    isOverdue: true,
    daysOverdue: overdueCheck.overdueByDays,
    milesOverdue: overdueCheck.overdueByMiles,
    penalty,
    severity,
    message: `Tire rotation overdue by ${overdueCheck.overdueByDays} days`
  }
}

/**
 * Check brake inspection status
 */
export function checkBrakeStatus(
  lastBrakeCheck: Date | null,
  lastBrakeCheckMileage: number | null,
  nextBrakeCheckDue: Date | null,
  nextBrakeCheckMileage: number | null,
  currentMileage: number,
  currentDate: Date = new Date()
): ServiceStatus {
  // No brake check record
  if (!lastBrakeCheck) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      milesOverdue: 0,
      penalty: 0,
      severity: 'minor',
      message: 'No brake inspection record found'
    }
  }

  const overdueCheck = isServiceOverdue(
    nextBrakeCheckDue,
    nextBrakeCheckMileage,
    currentDate,
    currentMileage
  )

  if (!overdueCheck.isOverdue) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      milesOverdue: 0,
      penalty: 0,
      severity: 'none',
      message: 'Brake inspection current'
    }
  }

  // Moderate penalty for overdue brake check
  let penalty = 0
  let severity: ServiceStatus['severity'] = 'minor'

  if (overdueCheck.overdueByDays > 60) {
    penalty = 20
    severity = 'severe'
  } else if (overdueCheck.overdueByDays > 30) {
    penalty = 10
    severity = 'moderate'
  }

  return {
    isOverdue: true,
    daysOverdue: overdueCheck.overdueByDays,
    milesOverdue: overdueCheck.overdueByMiles,
    penalty,
    severity,
    message: `Brake inspection overdue by ${overdueCheck.overdueByDays} days`
  }
}

/**
 * Check if high-usage inspection is needed (50+ trips in 4 months)
 */
export function checkHighUsageInspection(
  totalTrips: number,
  lastInspectionDate: Date | null,
  currentDate: Date = new Date()
): ServiceStatus {
  if (!lastInspectionDate) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      milesOverdue: 0,
      penalty: 0,
      severity: 'none',
      message: 'No inspection baseline to check high usage'
    }
  }

  const fourMonthsAgo = new Date(currentDate)
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)

  // If last inspection was more than 4 months ago and vehicle has 50+ trips total
  // this is a simplified check - in production you'd count trips since last inspection
  if (lastInspectionDate < fourMonthsAgo && totalTrips >= 50) {
    return {
      isOverdue: true,
      daysOverdue: Math.floor(
        (currentDate.getTime() - fourMonthsAgo.getTime()) / (1000 * 60 * 60 * 24)
      ),
      milesOverdue: 0,
      penalty: 25,
      severity: 'severe',
      message: 'High-usage inspection required (50+ trips in 4 months)'
    }
  }

  return {
    isOverdue: false,
    daysOverdue: 0,
    milesOverdue: 0,
    penalty: 0,
    severity: 'none',
    message: 'No high-usage inspection needed'
  }
}

/**
 * Analyze all service triggers for a vehicle
 */
export function analyzeServiceTriggers(
  serviceRecords: any[],
  totalTrips: number,
  currentMileage: number,
  currentDate: Date = new Date()
): ServiceTriggerAnalysis {
  // Find latest service records by type
  const lastOilChange = serviceRecords
    .filter(s => s.serviceType === ServiceType.OIL_CHANGE)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())[0]

  const lastInspection = serviceRecords
    .filter(s => s.serviceType === ServiceType.STATE_INSPECTION)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())[0]

  const lastTireRotation = serviceRecords
    .filter(s => s.serviceType === ServiceType.TIRE_ROTATION)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())[0]

  const lastBrakeCheck = serviceRecords
    .filter(s => s.serviceType === ServiceType.BRAKE_CHECK)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())[0]

  // Check each service type
  const oilChange = checkOilChangeStatus(
    lastOilChange?.serviceDate || null,
    lastOilChange?.mileageAtService || null,
    lastOilChange?.nextServiceDue || null,
    lastOilChange?.nextServiceMileage || null,
    currentMileage,
    currentDate
  )

  const inspection = checkInspectionStatus(
    lastInspection?.serviceDate || null,
    lastInspection?.nextServiceDue || null,
    currentDate
  )

  const tireRotation = checkTireRotationStatus(
    lastTireRotation?.serviceDate || null,
    lastTireRotation?.mileageAtService || null,
    lastTireRotation?.nextServiceDue || null,
    lastTireRotation?.nextServiceMileage || null,
    currentMileage,
    currentDate
  )

  const brakeCheck = checkBrakeStatus(
    lastBrakeCheck?.serviceDate || null,
    lastBrakeCheck?.mileageAtService || null,
    lastBrakeCheck?.nextServiceDue || null,
    lastBrakeCheck?.nextServiceMileage || null,
    currentMileage,
    currentDate
  )

  const highUsageInspection = checkHighUsageInspection(
    totalTrips,
    lastInspection?.serviceDate || null,
    currentDate
  )

  // Calculate total penalty
  const totalPenalty = 
    oilChange.penalty +
    inspection.penalty +
    tireRotation.penalty +
    brakeCheck.penalty +
    highUsageInspection.penalty

  // Gather critical issues
  const criticalIssues: string[] = []
  if (inspection.severity === 'critical') criticalIssues.push(inspection.message)
  if (oilChange.severity === 'severe' || oilChange.severity === 'critical') criticalIssues.push(oilChange.message)
  if (highUsageInspection.severity === 'severe') criticalIssues.push(highUsageInspection.message)

  // Gather warnings
  const warnings: string[] = []
  if (oilChange.severity === 'moderate') warnings.push(oilChange.message)
  if (tireRotation.severity === 'moderate') warnings.push(tireRotation.message)
  if (brakeCheck.severity === 'moderate' || brakeCheck.severity === 'severe') warnings.push(brakeCheck.message)

  // Generate recommendations
  const recommendations: string[] = []
  if (oilChange.isOverdue) {
    recommendations.push('Schedule oil change as soon as possible')
  }
  if (inspection.isOverdue) {
    recommendations.push('Schedule state inspection immediately - required by law')
  }
  if (highUsageInspection.isOverdue) {
    recommendations.push('Schedule safety inspection due to high usage')
  }
  if (tireRotation.isOverdue && tireRotation.daysOverdue > 60) {
    recommendations.push('Consider tire rotation to extend tire life')
  }

  // Determine overall status
  let overallStatus: ServiceTriggerAnalysis['overallStatus'] = 'current'
  if (criticalIssues.length > 0) {
    overallStatus = 'critical'
  } else if (totalPenalty >= 20) {
    overallStatus = 'overdue'
  } else if (warnings.length > 0 || totalPenalty > 0) {
    overallStatus = 'due_soon'
  }

  return {
    oilChange,
    inspection,
    tireRotation,
    brakeCheck,
    highUsageInspection,
    overallStatus,
    totalPenalty,
    criticalIssues,
    warnings,
    recommendations
  }
}

/**
 * Generate service due alerts for UI display
 */
export function generateServiceAlerts(analysis: ServiceTriggerAnalysis): Array<{
  severity: 'error' | 'warning' | 'info' | 'success'
  message: string
  action?: string
}> {
  const alerts: Array<{
    severity: 'error' | 'warning' | 'info' | 'success'
    message: string
    action?: string
  }> = []

  // Critical alerts
  if (analysis.inspection.severity === 'critical') {
    alerts.push({
      severity: 'error',
      message: analysis.inspection.message,
      action: 'Schedule inspection immediately'
    })
  }

  if (analysis.oilChange.severity === 'severe' || analysis.oilChange.severity === 'critical') {
    alerts.push({
      severity: 'error',
      message: analysis.oilChange.message,
      action: 'Schedule oil change now'
    })
  }

  if (analysis.highUsageInspection.isOverdue) {
    alerts.push({
      severity: 'error',
      message: analysis.highUsageInspection.message,
      action: 'Schedule safety inspection'
    })
  }

  // Warning alerts
  if (analysis.oilChange.severity === 'moderate') {
    alerts.push({
      severity: 'warning',
      message: analysis.oilChange.message,
      action: 'Schedule oil change soon'
    })
  }

  if (analysis.brakeCheck.severity === 'moderate' || analysis.brakeCheck.severity === 'severe') {
    alerts.push({
      severity: 'warning',
      message: analysis.brakeCheck.message,
      action: 'Schedule brake inspection'
    })
  }

  // Info alerts
  if (analysis.inspection.severity === 'minor') {
    alerts.push({
      severity: 'info',
      message: analysis.inspection.message
    })
  }

  // Success - all current
  if (analysis.overallStatus === 'current') {
    alerts.push({
      severity: 'success',
      message: 'All maintenance is up to date'
    })
  }

  return alerts
}

/**
 * Calculate maintenance score from service triggers (0-100)
 * Used by ESG calculation
 */
export function calculateMaintenanceScoreFromTriggers(analysis: ServiceTriggerAnalysis): number {
  // Start at 100, deduct penalties
  const score = 100 - analysis.totalPenalty
  
  // Clamp between 0-100
  return Math.max(0, Math.min(100, score))
}