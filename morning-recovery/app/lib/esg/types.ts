// app/lib/esg/types.ts

// ============================================================================
// ESG TYPE DEFINITIONS
// ============================================================================

/**
 * Main ESG Score Interface
 * Represents a complete ESG profile for a host
 */
export interface ESGScore {
  // Composite Scores (0-100)
  compositeScore: number;
  drivingImpactScore: number;
  emissionsScore: number;
  maintenanceScore: number;
  safetyScore: number;
  complianceScore: number;

  // Safety Metrics
  totalTrips: number;
  incidentFreeTrips: number;
  totalClaimsFiled: number;
  currentIncidentStreak: number;
  longestIncidentStreak: number;
  lastIncidentDate: Date | null;

  // Environmental Metrics
  totalEVTrips: number;
  evTripPercentage: number;
  estimatedCO2Saved: number;
  totalCO2Impact: number;        // ✅ ADDED: Total CO2 emitted (kg)
  avgCO2PerMile: number;         // ✅ ADDED: Average CO2 per mile
  fuelEfficiencyRating: FuelEfficiencyRating;

  // Compliance Metrics
  maintenanceOnTime: boolean;
  lastMaintenanceDate: Date | null;
  overdueMaintenanceCount: number;
  claimResponseRate: number; // User-friendly term (not FNOL)
  avgResponseTimeHours: number;

  // Fraud Detection
  unauthorizedMileage: number;
  suspiciousActivityCount: number;
  verificationFailures: number;
  fraudRiskLevel: FraudRiskLevel;

  // Usage Pattern Metrics
  totalMilesDriven: number;
  avgMilesPerTrip: number;
  tripCompletionRate: number;
  idleTimeEfficiency: number;

  // Trip Quality
  tripCancellationRate: number;
  lateReturnCount: number;
  earlyReturnCount: number;
  guestRatingAverage: number;

  // Vehicle Fleet
  totalVehicles: number;
  activeVehicles: number;
  evVehicleCount: number;
  avgVehicleAge: number;

  // Insurance & Risk
  hasCommercialInsurance: boolean;
  hasP2PInsurance: boolean;
  insuranceTier: string;
  claimApprovalRate: number;
  avgClaimProcessingDays: number;

  // Gamification
  achievedBadges: string[];
  milestoneReached: string[];
  nextMilestone: string | null;

  // Metadata
  lastCalculatedAt: Date;
  calculationVersion: string;
  dataConfidence: DataConfidence;
}

/**
 * Score Calculation Result
 * Returned by scoring engine with breakdown
 */
export interface ScoreCalculationResult {
  scores: ESGScore;
  breakdown: ScoreBreakdown;
  recommendations: string[];
  badges: BadgeEarned[];
}

/**
 * Detailed Score Breakdown
 * Shows how each score was calculated
 */
export interface ScoreBreakdown {
  safety: {
    score: number;
    factors: {
      incidentFreeRate: number;
      streakBonus: number;
      claimPenalty: number;
    };
  };
  drivingImpact: {
    score: number;
    factors: {
      completionRate: number;
      mileageHealth: number;
      idleEfficiency: number;
    };
  };
  emissions: {
    score: number;
    factors: {
      evUsageBonus: number;
      fuelEfficiency: number;
      co2Impact: number;
    };
  };
  maintenance: {
    score: number;
    factors: {
      onTimeCompliance: number;
      overduesPenalty: number;
      proactiveBonus: number;
    };
  };
  compliance: {
    score: number;
    factors: {
      responseRate: number;
      responseTime: number;
      documentationQuality: number;
    };
  };
}

/**
 * ESG Snapshot for Historical Tracking
 */
export interface ESGSnapshotData {
  compositeScore: number;
  drivingImpactScore: number;
  emissionsScore: number;
  maintenanceScore: number;
  safetyScore: number;
  complianceScore: number;
  snapshotDate: Date;
  snapshotReason: SnapshotReason;
  triggerEventId?: string;
}

/**
 * ESG Event for Audit Trail
 */
export interface ESGEventData {
  eventType: ESGEventType;
  eventCategory: EventCategory;
  scoreBefore?: number;
  scoreAfter?: number;
  scoreChange?: number;
  description: string;
  metadata: Record<string, any>;
  relatedTripId?: string;
  relatedClaimId?: string;
  relatedBookingId?: string;
}

/**
 * Badge Definition
 */
export interface Badge {
  badgeCode: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  badgeCategory: BadgeCategory;
  requiredScore?: number;
  requiredTrips?: number;
  requiredStreak?: number;
  requiredMetric?: string;
  requiredValue?: number;
  rarity: BadgeRarity;
  points: number;
}

/**
 * Badge Earned by Host
 */
export interface BadgeEarned {
  badgeCode: string;
  badgeName: string;
  badgeIcon: string;
  earnedAt: Date;
  rarity: BadgeRarity;
}

/**
 * Score Weights Configuration
 */
export interface ScoreWeights {
  safety: number; // 0.30 (30%)
  drivingImpact: number; // 0.20 (20%)
  maintenance: number; // 0.20 (20%)
  emissions: number; // 0.15 (15%)
  compliance: number; // 0.15 (15%)
}

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export enum FuelEfficiencyRating {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
  UNKNOWN = "UNKNOWN",
}

export enum FraudRiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum DataConfidence {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum SnapshotReason {
  DAILY_UPDATE = "DAILY_UPDATE",
  TRIP_COMPLETED = "TRIP_COMPLETED",
  CLAIM_FILED = "CLAIM_FILED",
  MANUAL_REFRESH = "MANUAL_REFRESH",
  MAINTENANCE_LOGGED = "MAINTENANCE_LOGGED",
}

export enum ESGEventType {
  TRIP_COMPLETED = "TRIP_COMPLETED",
  CLAIM_FILED = "CLAIM_FILED",
  MAINTENANCE_LOGGED = "MAINTENANCE_LOGGED",
  SCORE_CALCULATED = "SCORE_CALCULATED",
  BADGE_EARNED = "BADGE_EARNED",
  MILESTONE_REACHED = "MILESTONE_REACHED",
  FRAUD_DETECTED = "FRAUD_DETECTED",
  INSURANCE_UPDATED = "INSURANCE_UPDATED",
}

export enum EventCategory {
  SAFETY = "SAFETY",
  ENVIRONMENTAL = "ENVIRONMENTAL",
  COMPLIANCE = "COMPLIANCE",
  FRAUD = "FRAUD",
  GAMIFICATION = "GAMIFICATION",
}

export enum BadgeCategory {
  SAFETY = "SAFETY",
  ENVIRONMENTAL = "ENVIRONMENTAL",
  COMPLIANCE = "COMPLIANCE",
  MILESTONE = "MILESTONE",
}

export enum BadgeRarity {
  COMMON = "COMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Score Range (for visual display)
 */
export type ScoreRange = "excellent" | "good" | "fair" | "poor";

/**
 * Score Color (for UI)
 */
export type ScoreColor = "green" | "yellow" | "orange" | "red";

/**
 * Get Score Range from numeric score
 */
export function getScoreRange(score: number): ScoreRange {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

/**
 * Get Score Color from numeric score
 */
export function getScoreColor(score: number): ScoreColor {
  if (score >= 85) return "green";
  if (score >= 70) return "yellow";
  if (score >= 50) return "orange";
  return "red";
}

/**
 * Get Score Label from numeric score
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return "Outstanding";
  if (score >= 85) return "Excellent";
  if (score >= 75) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Above Average";
  if (score >= 50) return "Average";
  if (score >= 40) return "Below Average";
  return "Needs Improvement";
}