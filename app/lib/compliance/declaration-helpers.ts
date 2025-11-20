// app/lib/compliance/declaration-helpers.ts

import { 
  DECLARATION_CONFIGS, 
  getDeclarationConfig,
  getDeclarationRecommendation,
  type DeclarationConfig
} from '@/app/lib/constants/declarations'

import type {
  DeclarationType,
  ComplianceData,
  ComplianceStatus,
  MileageIntegrity,
  IntegrityScoreBreakdown,
  MileageGapAnalysis,
  ComplianceReport,
  VehicleComplianceSummary,
  SeverityLevel
} from '@/app/types/compliance'

/**
 * ✅ EXPORTED: Check if gap is compliant with declaration
 */
export function isGapCompliant(
  gap: number,
  declaration: DeclarationType
): boolean {
  const config = getDeclarationConfig(declaration)
  return gap <= config.maxGap
}

/**
 * ✅ EXPORTED: Get gap severity level
 */
export function getGapSeverity(
  gap: number,
  declaration: DeclarationType
): SeverityLevel {
  const config = getDeclarationConfig(declaration)
  
  if (gap <= config.maxGap) {
    return 'NORMAL'
  }
  
  if (gap <= config.criticalGap) {
    return 'WARNING'
  }
  
  if (gap <= config.maxGap * 2) {
    return 'CRITICAL'
  }
  
  return 'VIOLATION'
}

/**
 * ✅ EXPORTED: Calculate Mileage Integrity Score
 * 
 * This fixes the broken integrity score calculation in page.tsx
 * 
 * Formula:
 * - If avg gap <= allowed: 100 points (perfect)
 * - If avg gap > allowed: Scale from 100 to 0 based on how far over
 * - Maximum penalty at 10x the allowed gap
 */
export function calculateMileageIntegrity(
  averageGap: number,
  declarationType: DeclarationType
): number {
  const config = getDeclarationConfig(declarationType)
  const allowedGap = config.maxGap
  
  // Perfect compliance
  if (averageGap <= allowedGap) {
    return 100
  }
  
  // Calculate how far over the limit
  const excessGap = averageGap - allowedGap
  const maxPenaltyGap = allowedGap * 10 // 10x the allowed gap = 0 points
  
  // Linear decay from 100 to 0
  const penaltyRatio = Math.min(excessGap / maxPenaltyGap, 1)
  const score = Math.max(0, 100 - (penaltyRatio * 100))
  
  return Math.round(score)
}

/**
 * Calculate Complete Compliance Data
 */
export function calculateCompliance(
  declaration: DeclarationType,
  averageGap: number,
  maxGap: number,
  totalTrips: number,
  gapsBySize?: { compliant: number; warning: number; critical: number; violation: number }
): ComplianceData {
  const config = getDeclarationConfig(declaration)
  const mileageIntegrityScore = calculateMileageIntegrity(averageGap, declaration)
  
  // Calculate compliance rate
  const compliantTrips = gapsBySize?.compliant || 0
  const complianceRate = totalTrips > 0 ? (compliantTrips / totalTrips) * 100 : 100
  
  // Determine if currently compliant
  const isCurrentlyCompliant = averageGap <= config.maxGap
  
  // Get severity
  const severityLevel = getGapSeverity(averageGap, declaration)
  
  // Generate recommendations
  const recommendations: string[] = []
  
  if (!isCurrentlyCompliant) {
    recommendations.push(`Average gap of ${Math.round(averageGap)} miles exceeds ${config.maxGap}-mile limit for ${config.label}`)
  }
  
  if (gapsBySize && gapsBySize.violation > 0) {
    recommendations.push(`${gapsBySize.violation} severe violation(s) detected - claims at high risk of denial`)
  }
  
  if (gapsBySize && gapsBySize.critical > 0) {
    recommendations.push(`${gapsBySize.critical} critical gap(s) require explanation`)
  }
  
  const suggestedDeclaration = getDeclarationRecommendation(declaration, averageGap)
  if (suggestedDeclaration) {
    recommendations.push(suggestedDeclaration)
  }
  
  if (isCurrentlyCompliant && complianceRate >= 95) {
    recommendations.push('Excellent compliance - maintain current practices')
  }
  
  return {
    declaration,
    actualAvgGap: averageGap,
    maxGap,
    allowedMaxGap: config.maxGap,
    isCompliant: isCurrentlyCompliant,
    severityLevel,
    complianceRate,
    mileageIntegrityScore,
    overallComplianceScore: mileageIntegrityScore, // Same for now
    totalTrips,
    compliantTrips: gapsBySize?.compliant || 0,
    warningTrips: gapsBySize?.warning || 0,
    criticalTrips: gapsBySize?.critical || 0,
    violationTrips: gapsBySize?.violation || 0,
    recommendations
  }
}

/**
 * Calculate Complete Integrity Score with Breakdown
 * 
 * This is the CORRECT calculation to use in page.tsx
 */
export function calculateIntegrityScore(
  complianceScore: number, // From existing system (0-100)
  averageGap: number,
  declaration: DeclarationType,
  hasActiveClaim: boolean
): IntegrityScoreBreakdown {
  // Component 1: Compliance Score (40% weight)
  // Documents, service records, rules adherence
  const complianceWeight = 0.4
  const complianceContribution = complianceScore * complianceWeight
  
  // Component 2: Mileage Integrity Score (30% weight)
  // Declaration vs actual usage match
  const mileageIntegrityScore = calculateMileageIntegrity(averageGap, declaration)
  const mileageWeight = 0.3
  const mileageContribution = mileageIntegrityScore * mileageWeight
  
  // Component 3: Claim Status Score (30% weight)
  // Active claim = 0 points, No claim = 100 points
  const claimStatusScore = hasActiveClaim ? 0 : 100
  const claimWeight = 0.3
  const claimContribution = claimStatusScore * claimWeight
  
  // Overall Score
  const overallScore = Math.round(
    complianceContribution + mileageContribution + claimContribution
  )
  
  // Determine tier
  let tier: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention'
  if (overallScore >= 90) tier = 'Excellent'
  else if (overallScore >= 75) tier = 'Good'
  else if (overallScore >= 60) tier = 'Fair'
  else tier = 'Needs Attention'
  
  const config = getDeclarationConfig(declaration)
  
  return {
    complianceScore,
    mileageIntegrityScore,
    claimStatusScore,
    overallScore,
    tier,
    breakdown: {
      compliance: {
        score: complianceScore,
        weight: complianceWeight,
        factors: ['Documents verified', 'Service records current', 'Rules adherence']
      },
      mileageIntegrity: {
        score: mileageIntegrityScore,
        weight: mileageWeight,
        declaration,
        actualAvgGap: averageGap,
        allowedGap: config.maxGap
      },
      claimStatus: {
        score: claimStatusScore,
        weight: claimWeight,
        hasActiveClaim
      }
    }
  }
}

/**
 * Analyze a Specific Mileage Gap
 */
export function analyzeMileageGap(
  gap: number,
  declaration: DeclarationType
): MileageGapAnalysis {
  const config = getDeclarationConfig(declaration)
  const severity = getGapSeverity(gap, declaration)
  const isCompliant = gap <= config.maxGap
  const exceedsBy = Math.max(0, gap - config.maxGap)
  
  let message = ''
  let claimImpact = ''
  
  if (severity === 'NORMAL') {
    message = `Within ${config.maxGap}-mile limit for ${config.label}`
    claimImpact = 'No impact on claim processing'
  } else if (severity === 'WARNING') {
    message = `Exceeds ${config.maxGap}-mile limit by ${exceedsBy} miles`
    claimImpact = 'May require explanation during claim review'
  } else if (severity === 'CRITICAL') {
    message = `Significant gap - ${gap} miles between trips`
    claimImpact = 'Claims may face additional scrutiny and delays'
  } else {
    message = `Severe violation - ${gap} miles far exceeds ${config.maxGap}-mile limit`
    claimImpact = 'High risk of claim denial for misuse of vehicle'
  }
  
  return {
    gap,
    severity,
    isCompliant,
    declaration,
    allowedGap: config.maxGap,
    exceedsBy,
    message,
    claimImpact
  }
}

/**
 * Generate Compliance Report for Insurance Carriers
 */
export function generateComplianceReport(
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    vin?: string
    primaryUse: string
  },
  forensicData: {
    totalTrips: number
    totalMiles: number
    averageGapSize: number
    maxGap: number
    gaps: any[]
    anomalies: any[]
  },
  host: {
    id: string
    name: string
    earningsTier: number
    insuranceType: string
  },
  complianceScore: number
): ComplianceReport {
  const declaration = vehicle.primaryUse as DeclarationType
  const integrityScore = calculateMileageIntegrity(forensicData.averageGapSize, declaration)
  
  // Calculate compliance rate
  const compliantGaps = forensicData.gaps.filter(g => 
    isGapCompliant(g.gapSize, declaration)
  ).length
  const complianceRate = forensicData.totalTrips > 0 
    ? (compliantGaps / forensicData.totalTrips) * 100 
    : 100
  
  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  if (integrityScore >= 90) riskLevel = 'LOW'
  else if (integrityScore >= 75) riskLevel = 'MEDIUM'
  else if (integrityScore >= 60) riskLevel = 'HIGH'
  else riskLevel = 'CRITICAL'
  
  return {
    vehicleId: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    vin: vehicle.vin,
    declaration,
    declarationDate: new Date(), // TODO: Track actual declaration date
    actualUsage: {
      totalTrips: forensicData.totalTrips,
      totalMiles: forensicData.totalMiles,
      averageGapSize: forensicData.averageGapSize,
      maxGap: forensicData.maxGap,
      complianceRate
    },
    forensics: {
      gaps: forensicData.gaps.map(g => ({
        tripEndDate: g.endDate,
        tripEndMileage: g.endMileage,
        nextTripStartDate: g.nextStartDate,
        nextTripStartMileage: g.nextStartMileage,
        gapSize: g.gapSize,
        gapDays: g.gapDays,
        severity: getGapSeverity(g.gapSize, declaration),
        compliant: isGapCompliant(g.gapSize, declaration)
      })),
      anomalies: forensicData.anomalies,
      riskLevel
    },
    integrityScore,
    complianceScore,
    hostId: host.id,
    hostName: host.name,
    earningsTier: host.earningsTier,
    insuranceType: host.insuranceType as any,
    generatedAt: new Date(),
    reportVersion: '1.0'
  }
}

/**
 * Generate Vehicle Compliance Summary for Dashboard
 */
export function generateVehicleComplianceSummary(
  carId: string,
  displayName: string,
  earningsTier: number,
  insuranceType: string,
  declaration: DeclarationType,
  avgGap: number,
  maxGap: number,
  integrityScore: number,
  complianceRate: number
): VehicleComplianceSummary {
  const config = getDeclarationConfig(declaration)
  const isCompliant = avgGap <= config.maxGap
  const severity = getGapSeverity(avgGap, declaration)
  
  let statusColor = 'green'
  let statusText = 'Compliant'
  let needsAttention = false
  
  if (severity === 'VIOLATION') {
    statusColor = 'red'
    statusText = 'Non-Compliant'
    needsAttention = true
  } else if (severity === 'CRITICAL') {
    statusColor = 'orange'
    statusText = 'At Risk'
    needsAttention = true
  } else if (severity === 'WARNING') {
    statusColor = 'yellow'
    statusText = 'Warning'
    needsAttention = false
  }
  
  const recommendations: string[] = []
  const suggestion = getDeclarationRecommendation(declaration, avgGap)
  if (suggestion) {
    recommendations.push(suggestion)
  }
  
  return {
    carId,
    displayName,
    earningsTier,
    insuranceType: insuranceType as any,
    declaration,
    declarationLabel: config.label,
    isCompliant,
    complianceRate,
    integrityScore,
    avgGap,
    maxGap,
    allowedGap: config.maxGap,
    statusColor,
    statusText,
    needsAttention,
    recommendations,
    suggestedDeclaration: !isCompliant ? getRecommendedDeclaration(avgGap) : undefined
  }
}

/**
 * Helper: Get recommended declaration based on average gap
 */
function getRecommendedDeclaration(avgGap: number): DeclarationType | undefined {
  if (avgGap <= 15) return 'Rental'
  if (avgGap <= 300) return 'Business'
  if (avgGap <= 500) return 'Personal'
  return undefined // Exceeds all limits
}

/**
 * Helper: Format mileage gap for display
 */
export function formatMileageGap(gap: number): string {
  if (gap === 0) return 'No gap'
  if (gap === 1) return '1 mile'
  return `${gap.toLocaleString()} miles`
}

/**
 * Helper: Get compliance status object
 */
export function getComplianceStatus(
  gap: number,
  declaration: DeclarationType
): ComplianceStatus {
  const analysis = analyzeMileageGap(gap, declaration)
  
  return {
    isCompliant: analysis.isCompliant,
    severity: analysis.severity,
    message: analysis.message,
    recommendation: analysis.claimImpact
  }
}