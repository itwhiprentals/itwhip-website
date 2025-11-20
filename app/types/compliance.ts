// app/types/compliance.ts

/**
 * COMPLIANCE TYPE DEFINITIONS
 * 
 * Types for the Declaration-Based Integrity System
 */

// ✅ DEFINE SeverityLevel here
export type SeverityLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'VIOLATION'

/**
 * Declaration Types (what host declares to insurer)
 */
export type DeclarationType = 'Rental' | 'Personal' | 'Business'

/**
 * Earnings Tiers (based on host's insurance level)
 */
export type EarningsTier = 'BASIC' | 'STANDARD' | 'PREMIUM'

/**
 * Insurance Types (host's insurance status)
 */
export type InsuranceType = 'none' | 'p2p' | 'commercial'

/**
 * Compliance Status
 */
export interface ComplianceStatus {
  isCompliant: boolean
  severity: SeverityLevel
  message: string
  recommendation?: string
}

/**
 * Mileage Integrity Score (0-100)
 * Based on how well actual usage matches declared usage
 */
export interface MileageIntegrity {
  score: number // 0-100
  declaration: DeclarationType
  actualAvgGap: number
  allowedMaxGap: number
  complianceRate: number // % of trips that were compliant
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
}

/**
 * Complete Compliance Data
 */
export interface ComplianceData {
  // Declaration vs Reality
  declaration: DeclarationType
  actualAvgGap: number
  maxGap: number
  allowedMaxGap: number
  
  // Compliance Status
  isCompliant: boolean
  severityLevel: SeverityLevel
  complianceRate: number // % of trips within limits
  
  // Scoring
  mileageIntegrityScore: number // 0-100
  overallComplianceScore: number // 0-100
  
  // Trip Breakdown
  totalTrips: number
  compliantTrips: number
  warningTrips: number
  criticalTrips: number
  violationTrips: number
  
  // Recommendations
  recommendations: string[]
  suggestedDeclaration?: DeclarationType
}

/**
 * Integrity Score Breakdown (weighted components)
 */
export interface IntegrityScoreBreakdown {
  // Component scores (0-100 each)
  complianceScore: number // Documents, service, rules (40% weight)
  mileageIntegrityScore: number // Declaration vs actual usage (30% weight)
  claimStatusScore: number // Active claim penalty (30% weight)
  
  // Composite
  overallScore: number // Weighted average
  tier: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention'
  
  // Details
  breakdown: {
    compliance: {
      score: number
      weight: number
      factors: string[]
    }
    mileageIntegrity: {
      score: number
      weight: number
      declaration: DeclarationType
      actualAvgGap: number
      allowedGap: number
    }
    claimStatus: {
      score: number
      weight: number
      hasActiveClaim: boolean
    }
  }
}

/**
 * Declaration Change Request
 */
export interface DeclarationChangeRequest {
  carId: string
  currentDeclaration: DeclarationType
  newDeclaration: DeclarationType
  reason?: string
  hostId: string
}

/**
 * Declaration Change History Entry
 */
export interface DeclarationChange {
  id: string
  carId: string
  hostId: string
  fromDeclaration: DeclarationType
  toDeclaration: DeclarationType
  reason?: string
  changedAt: Date
  changedBy: string
}

/**
 * Compliance Report (for insurance carriers)
 */
export interface ComplianceReport {
  // Vehicle Info
  vehicleId: string
  make: string
  model: string
  year: number
  vin?: string
  
  // Declaration
  declaration: DeclarationType
  declarationDate: Date
  
  // Actual Usage
  actualUsage: {
    totalTrips: number
    totalMiles: number
    averageGapSize: number
    maxGap: number
    complianceRate: number
  }
  
  // Forensic Analysis
  forensics: {
    gaps: Array<{
      tripEndDate: Date
      tripEndMileage: number
      nextTripStartDate: Date
      nextTripStartMileage: number
      gapSize: number
      gapDays: number
      severity: SeverityLevel
      compliant: boolean
    }>
    anomalies: Array<{
      date: Date
      type: string
      description: string
      severity: string
    }>
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }
  
  // Scoring
  integrityScore: number
  complianceScore: number
  
  // Host Info
  hostId: string
  hostName: string
  earningsTier: number
  insuranceType: InsuranceType
  
  // Generation
  generatedAt: Date
  reportVersion: string
}

/**
 * Compliance Warning
 */
export interface ComplianceWarning {
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  message: string
  recommendation: string
  actionRequired: boolean
  affectsEarnings: boolean // Always false in our system
  affectsClaims: boolean // Usually true
}

/**
 * Mileage Gap Analysis Result
 */
export interface MileageGapAnalysis {
  gap: number
  severity: SeverityLevel
  isCompliant: boolean
  declaration: DeclarationType
  allowedGap: number
  exceedsBy: number
  message: string
  claimImpact: string
}

/**
 * Vehicle Compliance Summary (for dashboard display)
 */
export interface VehicleComplianceSummary {
  // Identity
  carId: string
  displayName: string
  
  // Earnings (Fixed, never changes)
  earningsTier: number // 40, 75, or 90
  insuranceType: InsuranceType
  
  // Declaration (Can change anytime)
  declaration: DeclarationType
  declarationLabel: string
  
  // Compliance Status
  isCompliant: boolean
  complianceRate: number
  integrityScore: number
  
  // Usage Summary
  avgGap: number
  maxGap: number
  allowedGap: number
  
  // Visual Indicators
  statusColor: string
  statusText: string
  needsAttention: boolean
  
  // Recommendations
  recommendations: string[]
  suggestedDeclaration?: DeclarationType
}