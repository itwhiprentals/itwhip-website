// app/lib/mileage/intelligence.ts

import { calculateComplianceScore, getUsageRecommendation, USAGE_RULES } from './rules'
import { analyzeBookingMileage, type ForensicAnalysis } from './forensics'

export interface VehicleIntelligence {
  carId: string
  primaryUse: string
  currentMileage: number
  lastRentalEndMileage: number | null
  lastRentalEndDate: Date | null
  forensicAnalysis: ForensicAnalysis
  complianceScore: number
  complianceStatus: string
  insuranceTier: number
  insuranceReadiness: {
    ready: boolean
    issues: string[]
    documentsComplete: boolean
    fnolReady: boolean
  }
  recommendations: string[]
  alerts: Alert[]
  lastUpdated: Date
}

export interface Alert {
  id: string
  type: 'WARNING' | 'CRITICAL' | 'INFO'
  category: 'MILEAGE' | 'SERVICE' | 'INSURANCE' | 'COMPLIANCE'
  title: string
  message: string
  action?: string
  actionUrl?: string
  createdAt: Date
}

export async function generateVehicleIntelligence(
  car: {
    id: string
    primaryUse: string
    currentMileage: number | null
    lastRentalEndMileage: number | null
    lastRentalEndDate: Date | null
    hasActiveClaim: boolean
    serviceOverdue: boolean
    inspectionExpired: boolean
    insuranceType: string
    revenueSplit: number
    registeredOwner?: string | null
    vin?: string | null
    licensePlate?: string | null
  },
  bookings: Array<{
    id: string
    bookingCode: string
    startDate: Date
    endDate: Date
    startMileage: number | null
    endMileage: number | null
    status: string
  }>
): Promise<VehicleIntelligence> {
  const currentMileage = car.currentMileage || 0
  const primaryUse = car.primaryUse || 'Rental'
  
  // Perform forensic analysis
  const forensicAnalysis = analyzeBookingMileage(
    bookings,
    currentMileage,
    primaryUse
  )
  
  // Calculate compliance score
  const violations = forensicAnalysis.gaps.filter(g => g.severity === 'VIOLATION').length
  const criticals = forensicAnalysis.gaps.filter(g => g.severity === 'CRITICAL').length
  const warnings = forensicAnalysis.gaps.filter(g => g.severity === 'WARNING').length
  const totalGaps = forensicAnalysis.gaps.length
  const totalTrips = bookings.filter(b => b.status === 'COMPLETED').length
  
  const compliance = calculateComplianceScore(
    totalGaps,
    warnings,
    criticals,
    violations,
    totalTrips
  )
  
  // Check insurance readiness
  const insuranceIssues: string[] = []
  
  if (!car.registeredOwner) {
    insuranceIssues.push('Registered owner not specified')
  }
  if (!car.vin) {
    insuranceIssues.push('VIN not recorded')
  }
  if (!car.licensePlate) {
    insuranceIssues.push('License plate not recorded')
  }
  if (car.serviceOverdue) {
    insuranceIssues.push('Service overdue - may affect coverage')
  }
  if (car.inspectionExpired) {
    insuranceIssues.push('Inspection expired - coverage at risk')
  }
  if (forensicAnalysis.riskLevel === 'CRITICAL') {
    insuranceIssues.push('Critical mileage anomalies detected')
  }
  
  const fnolReady = insuranceIssues.length === 0
  
  // Generate alerts
  const alerts: Alert[] = []
  
  // Add mileage alerts
  if (forensicAnalysis.anomalies.length > 0) {
    alerts.push({
      id: `mileage-anomaly-${Date.now()}`,
      type: 'CRITICAL',
      category: 'MILEAGE',
      title: 'Mileage Anomalies Detected',
      message: `${forensicAnalysis.anomalies.length} anomalies require immediate investigation`,
      action: 'Review Anomalies',
      actionUrl: `/host/cars/${car.id}/edit?tab=insurance`,
      createdAt: new Date()
    })
  }
  
  if (violations > 0) {
    alerts.push({
      id: `mileage-violation-${Date.now()}`,
      type: 'CRITICAL',
      category: 'COMPLIANCE',
      title: 'Usage Violations Detected',
      message: `${violations} mileage gaps exceed ${primaryUse} mode limits`,
      action: 'Update Usage Mode',
      actionUrl: `/host/cars/${car.id}/edit?tab=insurance`,
      createdAt: new Date()
    })
  }
  
  // Add service alerts
  if (car.serviceOverdue) {
    alerts.push({
      id: `service-overdue-${Date.now()}`,
      type: 'WARNING',
      category: 'SERVICE',
      title: 'Service Overdue',
      message: 'Vehicle maintenance is overdue. Schedule service immediately.',
      action: 'Schedule Service',
      actionUrl: `/host/cars/${car.id}/edit?tab=service`,
      createdAt: new Date()
    })
  }
  
  if (car.inspectionExpired) {
    alerts.push({
      id: `inspection-expired-${Date.now()}`,
      type: 'CRITICAL',
      category: 'SERVICE',
      title: 'Inspection Expired',
      message: 'Vehicle inspection has expired. Insurance coverage may be void.',
      action: 'Schedule Inspection',
      actionUrl: `/host/cars/${car.id}/edit?tab=service`,
      createdAt: new Date()
    })
  }
  
  // Add insurance alerts
  if (!fnolReady) {
    alerts.push({
      id: `insurance-incomplete-${Date.now()}`,
      type: 'WARNING',
      category: 'INSURANCE',
      title: 'Insurance Documentation Incomplete',
      message: `${insuranceIssues.length} issues prevent quick claim processing`,
      action: 'Complete Documentation',
      actionUrl: `/host/cars/${car.id}/edit?tab=insurance`,
      createdAt: new Date()
    })
  }
  
  // Compile recommendations
  const recommendations: string[] = [
    ...forensicAnalysis.recommendations
  ]
  
  // Add usage recommendation
  const usageRec = getUsageRecommendation(
    primaryUse,
    forensicAnalysis.averageGapSize
  )
  if (usageRec) {
    recommendations.unshift(usageRec)
  }
  
  // Add service recommendations
  if (car.serviceOverdue) {
    recommendations.push('Schedule overdue maintenance to maintain coverage')
  }
  
  // Add documentation recommendations
  if (insuranceIssues.length > 0) {
    recommendations.push('Complete vehicle documentation for faster claim processing')
  }
  
  return {
    carId: car.id,
    primaryUse,
    currentMileage,
    lastRentalEndMileage: car.lastRentalEndMileage,
    lastRentalEndDate: car.lastRentalEndDate,
    forensicAnalysis,
    complianceScore: compliance.score,
    complianceStatus: compliance.status,
    insuranceTier: car.revenueSplit,
    insuranceReadiness: {
      ready: fnolReady,
      issues: insuranceIssues,
      documentsComplete: insuranceIssues.length === 0,
      fnolReady
    },
    recommendations: recommendations.slice(0, 5), // Top 5 recommendations
    alerts,
    lastUpdated: new Date()
  }
}

export function getIntelligenceSummary(
  intelligence: VehicleIntelligence
): {
  headline: string
  status: 'EXCELLENT' | 'GOOD' | 'ATTENTION' | 'CRITICAL'
  color: string
  icon: string
} {
  const { forensicAnalysis, complianceScore, alerts } = intelligence
  
  const criticalAlerts = alerts.filter(a => a.type === 'CRITICAL').length
  const warningAlerts = alerts.filter(a => a.type === 'WARNING').length
  
  if (criticalAlerts > 0) {
    return {
      headline: `${criticalAlerts} critical issues require immediate attention`,
      status: 'CRITICAL',
      color: 'red',
      icon: 'IoCloseCircleOutline'
    }
  }
  
  if (forensicAnalysis.riskLevel === 'HIGH' || complianceScore < 70) {
    return {
      headline: 'High risk detected - action required',
      status: 'ATTENTION',
      color: 'orange',
      icon: 'IoWarningOutline'
    }
  }
  
  if (warningAlerts > 0 || complianceScore < 85) {
    return {
      headline: `${warningAlerts} issues need attention`,
      status: 'ATTENTION',
      color: 'yellow',
      icon: 'IoAlertCircleOutline'
    }
  }
  
  if (complianceScore >= 95) {
    return {
      headline: 'Excellent compliance - all systems optimal',
      status: 'EXCELLENT',
      color: 'green',
      icon: 'IoCheckmarkCircleOutline'
    }
  }
  
  return {
    headline: 'Good standing - minor improvements possible',
    status: 'GOOD',
    color: 'blue',
    icon: 'IoCheckmarkCircleOutline'
  }
}

export function calculateInsuranceImpact(
  intelligence: VehicleIntelligence
): {
  claimApprovalLikelihood: number
  processingSpeed: 'FAST' | 'NORMAL' | 'SLOW' | 'MANUAL_REVIEW'
  requiredDocumentation: string[]
  riskFactors: string[]
} {
  const likelihood = Math.max(
    0,
    Math.min(100, 
      intelligence.complianceScore * 0.6 + 
      (intelligence.insuranceReadiness.ready ? 40 : 20)
    )
  )
  
  let processingSpeed: 'FAST' | 'NORMAL' | 'SLOW' | 'MANUAL_REVIEW' = 'NORMAL'
  
  if (intelligence.forensicAnalysis.riskLevel === 'CRITICAL') {
    processingSpeed = 'MANUAL_REVIEW'
  } else if (intelligence.complianceScore >= 90 && intelligence.insuranceReadiness.ready) {
    processingSpeed = 'FAST'
  } else if (intelligence.complianceScore < 70) {
    processingSpeed = 'SLOW'
  }
  
  const requiredDocumentation: string[] = []
  const riskFactors: string[] = []
  
  // Add documentation requirements based on issues
  if (intelligence.forensicAnalysis.gaps.filter(g => g.flagged).length > 0) {
    requiredDocumentation.push('Mileage gap explanations')
  }
  
  if (intelligence.forensicAnalysis.anomalies.length > 0) {
    requiredDocumentation.push('Anomaly investigation reports')
    riskFactors.push('Unexplained mileage anomalies')
  }
  
  if (!intelligence.insuranceReadiness.documentsComplete) {
    requiredDocumentation.push('Complete vehicle registration')
    riskFactors.push('Incomplete documentation')
  }
  
  if (intelligence.primaryUse === 'Rental' && intelligence.forensicAnalysis.averageGapSize > 30) {
    riskFactors.push('Usage pattern inconsistent with declaration')
  }
  
  return {
    claimApprovalLikelihood: Math.round(likelihood),
    processingSpeed,
    requiredDocumentation,
    riskFactors
  }
}