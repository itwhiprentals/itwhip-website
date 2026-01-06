// app/lib/esg/scoring.ts

import prisma from '@/app/lib/database/prisma';
import {
  ESGScore,
  ScoreCalculationResult,
  ScoreBreakdown,
  ScoreWeights,
  FuelEfficiencyRating,
  FraudRiskLevel,
  DataConfidence,
} from "./types";
import { clampScore, getImprovementRecommendations } from "./utils";
import { checkBadgeEligibility } from "./badges";
import { analyzeFleetMaintenance } from './maintenance-tracker';

// ============================================================================
// CO2 EMISSION FACTORS (kg CO2 per mile)
// ============================================================================
const CO2_EMISSIONS_BY_FUEL_TYPE: Record<string, number> = {
  REGULAR: 0.404,      // Regular gasoline
  PREMIUM: 0.404,      // Premium gasoline (same as regular)
  DIESEL: 0.466,       // Diesel fuel
  ELECTRIC: 0.0,       // Electric vehicles (zero tailpipe emissions)
  HYBRID: 0.202,       // Hybrid (50% of gas)
  PLUGIN_HYBRID: 0.101, // Plugin hybrid (25% of gas)
};

// ============================================================================
// ESG SCORING ENGINE
// ============================================================================

/**
 * Default score weights (must sum to 1.0)
 */
const DEFAULT_WEIGHTS: ScoreWeights = {
  safety: 0.3, // 30% - Highest priority
  drivingImpact: 0.2, // 20%
  maintenance: 0.2, // 20%
  emissions: 0.15, // 15%
  compliance: 0.15, // 15%
};

/**
 * Calculate complete ESG score for a host
 */
export async function calculateESGScore(
  hostId: string,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): Promise<ScoreCalculationResult> {
  // Fetch all data needed for calculation
  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    include: {
      bookings: {
        where: {
          status: "COMPLETED",
        },
        include: {
          car: true,
        },
      },
      claims: true,
      cars: true,
    },
  });

  if (!host) {
    throw new Error(`Host not found: ${hostId}`);
  }

  // Calculate individual scores
  const safetyScore = calculateSafetyScore(host);
  const drivingImpactScore = calculateDrivingImpactScore(host);
  const emissionsScore = calculateEmissionsScore(host);
  const maintenanceScore = await calculateMaintenanceScore(host); // ⭐ NOW ASYNC
  const complianceScore = calculateComplianceScore(host);

  // Calculate composite score
  const compositeScore = clampScore(
    safetyScore.score * weights.safety +
      drivingImpactScore.score * weights.drivingImpact +
      emissionsScore.score * weights.emissions +
      maintenanceScore.score * weights.maintenance +
      complianceScore.score * weights.compliance
  );

  // Build complete ESG score object
  const esgScore: ESGScore = {
    // Composite scores
    compositeScore: Math.round(compositeScore),
    safetyScore: Math.round(safetyScore.score),
    drivingImpactScore: Math.round(drivingImpactScore.score),
    emissionsScore: Math.round(emissionsScore.score),
    maintenanceScore: Math.round(maintenanceScore.score),
    complianceScore: Math.round(complianceScore.score),

    // Safety metrics
    totalTrips: safetyScore.metrics.totalTrips,
    incidentFreeTrips: safetyScore.metrics.incidentFreeTrips,
    totalClaimsFiled: safetyScore.metrics.totalClaimsFiled,
    currentIncidentStreak: safetyScore.metrics.currentStreak,
    longestIncidentStreak: safetyScore.metrics.longestStreak,
    lastIncidentDate: safetyScore.metrics.lastIncidentDate,

    // Environmental metrics
    totalEVTrips: emissionsScore.metrics.totalEVTrips,
    evTripPercentage: emissionsScore.metrics.evTripPercentage,
    estimatedCO2Saved: emissionsScore.metrics.estimatedCO2Saved,
    totalCO2Impact: emissionsScore.metrics.totalCO2Impact || 0,
    avgCO2PerMile: emissionsScore.metrics.avgCO2PerMile || 0,
    fuelEfficiencyRating: emissionsScore.metrics.fuelEfficiencyRating,

    // Compliance metrics
    maintenanceOnTime: maintenanceScore.metrics.onTime,
    lastMaintenanceDate: maintenanceScore.metrics.lastMaintenanceDate,
    overdueMaintenanceCount: maintenanceScore.metrics.overdueCount,
    claimResponseRate: complianceScore.metrics.responseRate,
    avgResponseTimeHours: complianceScore.metrics.avgResponseTimeHours,

    // Fraud detection
    unauthorizedMileage: drivingImpactScore.metrics.unauthorizedMileage,
    suspiciousActivityCount: 0, // TODO: Implement fraud detection logic
    verificationFailures: 0,
    fraudRiskLevel: determineFraudRiskLevel(drivingImpactScore.metrics),

    // Usage patterns
    totalMilesDriven: drivingImpactScore.metrics.totalMiles,
    avgMilesPerTrip: drivingImpactScore.metrics.avgMilesPerTrip,
    tripCompletionRate: drivingImpactScore.metrics.completionRate,
    idleTimeEfficiency: drivingImpactScore.metrics.idleEfficiency,

    // Trip quality
    tripCancellationRate: drivingImpactScore.metrics.cancellationRate,
    lateReturnCount: drivingImpactScore.metrics.lateReturns,
    earlyReturnCount: drivingImpactScore.metrics.earlyReturns,
    guestRatingAverage: host.rating || 0,

    // Vehicle fleet
    totalVehicles: host.cars.length,
    activeVehicles: host.cars.filter((c) => c.isActive).length,
    evVehicleCount: host.cars.filter((c) => c.fuelType === "ELECTRIC").length,
    avgVehicleAge: calculateAvgVehicleAge(host.cars),

    // Insurance & risk
    hasCommercialInsurance:
      host.commercialInsuranceActive || host.earningsTier === "PREMIUM",
    hasP2PInsurance: host.p2pInsuranceActive || false,
    insuranceTier: host.earningsTier || "BASIC",
    claimApprovalRate: calculateClaimApprovalRate(host.claims),
    avgClaimProcessingDays: calculateAvgClaimProcessingDays(host.claims),

    // Gamification
    achievedBadges: [], // Will be populated by badge check
    milestoneReached: [],
    nextMilestone: null,

    // Metadata
    lastCalculatedAt: new Date(),
    calculationVersion: "1.0",
    dataConfidence: determineDataConfidence(host),
  };

  // Build score breakdown
  const breakdown: ScoreBreakdown = {
    safety: {
      score: safetyScore.score,
      factors: safetyScore.breakdown,
    },
    drivingImpact: {
      score: drivingImpactScore.score,
      factors: drivingImpactScore.breakdown,
    },
    emissions: {
      score: emissionsScore.score,
      factors: emissionsScore.breakdown,
    },
    maintenance: {
      score: maintenanceScore.score,
      factors: maintenanceScore.breakdown,
    },
    compliance: {
      score: complianceScore.score,
      factors: complianceScore.breakdown,
    },
  };

  // Generate recommendations
  const recommendations = getImprovementRecommendations({
    safety: safetyScore.score,
    drivingImpact: drivingImpactScore.score,
    emissions: emissionsScore.score,
    maintenance: maintenanceScore.score,
    compliance: complianceScore.score,
  });

  // Check badge eligibility
  const badges = await checkBadgeEligibility(hostId, esgScore);

  return {
    scores: esgScore,
    breakdown,
    recommendations,
    badges,
  };
}

// ============================================================================
// INDIVIDUAL SCORE CALCULATORS
// ============================================================================

/**
 * Calculate Safety Score (0-100)
 * Based on incident-free trips, claims history, and safety streaks
 */
function calculateSafetyScore(host: any) {
  const completedBookings = host.bookings;
  const totalTrips = completedBookings.length;
  const claims = host.claims || [];

  // No trips = default score
  if (totalTrips === 0) {
    return {
      score: 50,
      metrics: {
        totalTrips: 0,
        incidentFreeTrips: 0,
        totalClaimsFiled: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastIncidentDate: null,
      },
      breakdown: {
        incidentFreeRate: 50,
        streakBonus: 0,
        claimPenalty: 0,
      },
    };
  }

  // Calculate incident-free rate
  const incidentFreeTrips = totalTrips - claims.length;
  const incidentFreeRate = (incidentFreeTrips / totalTrips) * 100;

  // Calculate current streak
  const sortedBookings = [...completedBookings].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let currentStreak = 0;
  for (const booking of sortedBookings) {
    const hasClaim = claims.some((c: any) => c.bookingId === booking.id);
    if (hasClaim) break;
    currentStreak++;
  }

  // Find longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (const booking of sortedBookings) {
    const hasClaim = claims.some((c: any) => c.bookingId === booking.id);
    if (!hasClaim) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Last incident date
  const lastIncidentDate =
    claims.length > 0
      ? new Date(
          Math.max(...claims.map((c: any) => new Date(c.createdAt).getTime()))
        )
      : null;

  // Calculate score components
  const baseScore = incidentFreeRate; // 0-100

  // Streak bonus (up to +10 points)
  const streakBonus = Math.min(10, currentStreak * 0.5);

  // Claim penalty (up to -20 points)
  const claimPenalty = Math.min(20, claims.length * 5);

  const finalScore = clampScore(baseScore + streakBonus - claimPenalty);

  return {
    score: finalScore,
    metrics: {
      totalTrips,
      incidentFreeTrips,
      totalClaimsFiled: claims.length,
      currentStreak,
      longestStreak,
      lastIncidentDate,
    },
    breakdown: {
      incidentFreeRate: baseScore,
      streakBonus,
      claimPenalty,
    },
  };
}

/**
 * Calculate Driving Impact Score (0-100)
 * Based on trip completion, mileage patterns, and usage efficiency
 */
function calculateDrivingImpactScore(host: any) {
  const completedBookings = host.bookings;
  const totalBookings = completedBookings.length;

  // No trips = default score
  if (totalBookings === 0) {
    return {
      score: 50,
      metrics: {
        totalMiles: 0,
        avgMilesPerTrip: 0,
        completionRate: 100,
        idleEfficiency: 100,
        unauthorizedMileage: 0,
        cancellationRate: 0,
        lateReturns: 0,
        earlyReturns: 0,
      },
      breakdown: {
        completionRate: 50,
        mileageHealth: 50,
        idleEfficiency: 50,
      },
    };
  }

  // Calculate mileage metrics
  const totalMiles = completedBookings.reduce((sum: number, b: any) => {
    if (b.endMileage && b.startMileage) {
      return sum + (b.endMileage - b.startMileage);
    }
    return sum;
  }, 0);

  const avgMilesPerTrip = totalMiles / totalBookings;

  // Detect unauthorized mileage (trips with excessive mileage)
  const expectedMilesPerDay = 200; // Platform average
  const unauthorizedMileage = completedBookings.reduce(
    (sum: number, b: any) => {
      if (b.endMileage && b.startMileage) {
        const actualMiles = b.endMileage - b.startMileage;
        const days = b.numberOfDays || 1;
        const expectedMiles = expectedMilesPerDay * days;
        const excess = Math.max(0, actualMiles - expectedMiles * 1.2); // 20% tolerance
        return sum + excess;
      }
      return sum;
    },
    0
  );

  // Trip completion rate (assume 100% for completed bookings)
  const completionRate = 100;

  // Idle efficiency (simplified - assume good if active)
  const idleEfficiency = 95;

  // Late/early returns
  const lateReturns = completedBookings.filter(
    (b: any) =>
      b.actualEndTime &&
      new Date(b.actualEndTime) > new Date(b.endDate)
  ).length;
  const earlyReturns = 0; // TODO: Implement if needed

  // Cancellation rate (from all bookings)
  const cancellationRate = 0; // Only looking at completed bookings

  // Calculate score components
  const completionScore = completionRate;

  // Mileage health (penalize unauthorized mileage)
  const mileageHealthPenalty = Math.min(30, unauthorizedMileage / 100);
  const mileageHealth = clampScore(100 - mileageHealthPenalty);

  // Idle efficiency score
  const idleScore = idleEfficiency;

  const finalScore = clampScore(
    (completionScore + mileageHealth + idleScore) / 3
  );

  return {
    score: finalScore,
    metrics: {
      totalMiles,
      avgMilesPerTrip,
      completionRate,
      idleEfficiency,
      unauthorizedMileage,
      cancellationRate,
      lateReturns,
      earlyReturns,
    },
    breakdown: {
      completionRate: completionScore,
      mileageHealth,
      idleEfficiency: idleScore,
    },
  };
}

/**
 * Calculate Emissions Score (0-100)
 * Based on EV usage, fuel efficiency, and environmental impact
 */
function calculateEmissionsScore(host: any) {
  const completedBookings = host.bookings;
  const totalTrips = completedBookings.length;

  // No trips = default score
  if (totalTrips === 0) {
    return {
      score: 50,
      metrics: {
        totalEVTrips: 0,
        evTripPercentage: 0,
        estimatedCO2Saved: 0,
        totalCO2Impact: 0,
        avgCO2PerMile: 0,
        fuelEfficiencyRating: FuelEfficiencyRating.UNKNOWN,
      },
      breakdown: {
        evUsageBonus: 0,
        fuelEfficiency: 50,
        co2Impact: 50,
      },
    };
  }

  // Count EV trips
  const evTrips = completedBookings.filter(
    (b: any) => b.car?.fuelType === "ELECTRIC"
  ).length;
  const evTripPercentage = (evTrips / totalTrips) * 100;

  // ============================================================================
  // CALCULATE TOTAL CO2 IMPACT AND AVERAGE CO2 PER MILE
  // ============================================================================
  
  let totalCO2Impact = 0;
  let totalMilesWithCO2 = 0;

  for (const booking of completedBookings) {
    if (booking.endMileage && booking.startMileage && booking.car?.fuelType) {
      const tripMiles = booking.endMileage - booking.startMileage;
      const fuelType = booking.car.fuelType;
      const co2Factor = CO2_EMISSIONS_BY_FUEL_TYPE[fuelType] || CO2_EMISSIONS_BY_FUEL_TYPE.REGULAR;
      
      const tripCO2 = tripMiles * co2Factor;
      totalCO2Impact += tripCO2;
      totalMilesWithCO2 += tripMiles;
    }
  }

  // Calculate average CO2 per mile across all trips
  const avgCO2PerMile = totalMilesWithCO2 > 0 ? totalCO2Impact / totalMilesWithCO2 : 0;

  // ============================================================================
  // ESTIMATE CO2 SAVED (EV vs GAS)
  // ============================================================================
  
  const avgGasCO2PerMile = CO2_EMISSIONS_BY_FUEL_TYPE.REGULAR; // 0.404 kg CO2/mile
  const evMiles = completedBookings.reduce((sum: number, b: any) => {
    if (b.endMileage && b.startMileage && b.car?.fuelType === "ELECTRIC") {
      return sum + (b.endMileage - b.startMileage);
    }
    return sum;
  }, 0);
  
  const estimatedCO2Saved = evMiles * avgGasCO2PerMile;

  // Determine fuel efficiency rating
  const fuelEfficiencyRating =
    evTripPercentage >= 50
      ? FuelEfficiencyRating.EXCELLENT
      : evTripPercentage >= 25
      ? FuelEfficiencyRating.GOOD
      : evTripPercentage >= 10
      ? FuelEfficiencyRating.FAIR
      : FuelEfficiencyRating.POOR;

  // Calculate score components
  const baseScore = 50; // Baseline

  // EV usage bonus (up to +40 points)
  const evUsageBonus = Math.min(40, evTripPercentage * 0.8);

  // Fuel efficiency contribution
  const fuelEfficiencyScore = 50 + evUsageBonus / 2;

  // CO2 impact score (lower CO2 per mile = higher score)
  const co2ImpactScore = avgCO2PerMile === 0 
    ? 100 // Perfect score for all-electric
    : avgCO2PerMile < 0.2 
    ? 90 
    : avgCO2PerMile < 0.3 
    ? 70 
    : avgCO2PerMile < 0.4 
    ? 50 
    : 30;

  const finalScore = clampScore(
    (baseScore + evUsageBonus + fuelEfficiencyScore + co2ImpactScore) / 3
  );

  return {
    score: finalScore,
    metrics: {
      totalEVTrips: evTrips,
      evTripPercentage: evTripPercentage / 100,
      estimatedCO2Saved,
      totalCO2Impact,
      avgCO2PerMile,
      fuelEfficiencyRating,
    },
    breakdown: {
      evUsageBonus,
      fuelEfficiency: fuelEfficiencyScore,
      co2Impact: co2ImpactScore,
    },
  };
}

/**
 * ⭐ FIXED: Calculate Maintenance Score (0-100)
 * Now uses the actual maintenance-tracker system
 */
async function calculateMaintenanceScore(host: any) {
  try {
    // Use the existing fleet maintenance analyzer
    const fleetStatus = await analyzeFleetMaintenance(host.id);

    // Get the most recent service date from any vehicle
    let mostRecentServiceDate: Date | null = null;
    
    if (host.cars && host.cars.length > 0) {
      for (const car of host.cars) {
        const serviceDate = car.lastOdometerCheck || car.createdAt;
        if (!mostRecentServiceDate || serviceDate > mostRecentServiceDate) {
          mostRecentServiceDate = serviceDate;
        }
      }
    }

    // Calculate score components
    const baseScore = 70; // Base score for having vehicles

    // Fleet compliance score (0-30 points)
    const complianceBonus = Math.round((fleetStatus.averageComplianceRate / 100) * 30);

    // Overdue penalty (0 to -30 points)
    const overduePenalty = Math.min(30, fleetStatus.overdueCount * 10);

    // Critical penalty (0 to -20 points)
    const criticalPenalty = Math.min(20, fleetStatus.criticalCount * 10);

    // Excellent bonus (0-10 points) - if most vehicles are well-maintained
    const excellentBonus = fleetStatus.excellentCount >= (fleetStatus.totalVehicles * 0.5) ? 10 : 0;

    const finalScore = Math.max(0, Math.min(100, 
      baseScore + complianceBonus - overduePenalty - criticalPenalty + excellentBonus
    ));

    return {
      score: finalScore,
      metrics: {
        onTime: fleetStatus.overdueCount === 0,
        lastMaintenanceDate: mostRecentServiceDate,
        overdueCount: fleetStatus.overdueCount,
      },
      breakdown: {
        onTimeCompliance: baseScore + complianceBonus,
        overduesPenalty: overduePenalty + criticalPenalty,
        proactiveBonus: excellentBonus,
      },
    };
  } catch (error) {
    console.error('Error calculating maintenance score:', error);
    
    // Fallback to simplified calculation
    return {
      score: 70,
      metrics: {
        onTime: true,
        lastMaintenanceDate: null,
        overdueCount: 0,
      },
      breakdown: {
        onTimeCompliance: 70,
        overduesPenalty: 0,
        proactiveBonus: 0,
      },
    };
  }
}

/**
 * Calculate Compliance Score (0-100)
 * Based on claim response rates, documentation, and timeliness
 */
function calculateComplianceScore(host: any) {
  const claims = host.claims || [];

  // No claims = perfect score
  if (claims.length === 0) {
    return {
      score: 100,
      metrics: {
        responseRate: 1.0,
        avgResponseTimeHours: 0,
      },
      breakdown: {
        responseRate: 100,
        responseTime: 100,
        documentationQuality: 100,
      },
    };
  }

  // Calculate response rate (claims with complete info)
  const completeClaims = claims.filter(
    (c: any) => c.description && c.estimatedCost
  ).length;
  const responseRate = completeClaims / claims.length;

  // Calculate average response time
  const responseTimes = claims
    .filter((c: any) => c.reviewedAt)
    .map((c: any) => {
      const filed = new Date(c.createdAt);
      const reviewed = new Date(c.reviewedAt);
      return (reviewed.getTime() - filed.getTime()) / (1000 * 60 * 60); // Hours
    });

  const avgResponseTimeHours =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 2.4; // Default good response time

  // Calculate score components
  const responseRateScore = responseRate * 100;

  // Response time score (faster = better)
  const responseTimeScore =
    avgResponseTimeHours <= 2
      ? 100
      : avgResponseTimeHours <= 6
      ? 90
      : avgResponseTimeHours <= 12
      ? 80
      : avgResponseTimeHours <= 24
      ? 70
      : 60;

  // Documentation quality (assume good if complete)
  const documentationScore = responseRateScore;

  const finalScore = clampScore(
    (responseRateScore + responseTimeScore + documentationScore) / 3
  );

  return {
    score: finalScore,
    metrics: {
      responseRate,
      avgResponseTimeHours,
    },
    breakdown: {
      responseRate: responseRateScore,
      responseTime: responseTimeScore,
      documentationQuality: documentationScore,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateAvgVehicleAge(cars: any[]): number {
  if (cars.length === 0) return 0;

  const currentYear = new Date().getFullYear();
  const totalAge = cars.reduce((sum, car) => sum + (currentYear - car.year), 0);

  return totalAge / cars.length;
}

function calculateClaimApprovalRate(claims: any[]): number {
  if (claims.length === 0) return 0;

  const approvedClaims = claims.filter((c) => c.status === "APPROVED").length;
  return (approvedClaims / claims.length) * 100;
}

function calculateAvgClaimProcessingDays(claims: any[]): number {
  if (claims.length === 0) return 0;

  const processedClaims = claims.filter((c) => c.resolvedAt);
  if (processedClaims.length === 0) return 0;

  const totalDays = processedClaims.reduce((sum, claim) => {
    const filed = new Date(claim.createdAt);
    const resolved = new Date(claim.resolvedAt);
    const days = (resolved.getTime() - filed.getTime()) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);

  return totalDays / processedClaims.length;
}

function determineFraudRiskLevel(metrics: any): FraudRiskLevel {
  if (metrics.unauthorizedMileage > 1000) return FraudRiskLevel.CRITICAL;
  if (metrics.unauthorizedMileage > 500) return FraudRiskLevel.HIGH;
  if (metrics.unauthorizedMileage > 100) return FraudRiskLevel.MEDIUM;
  return FraudRiskLevel.LOW;
}

function determineDataConfidence(host: any): DataConfidence {
  const totalTrips = host.bookings.length;

  if (totalTrips >= 20) return DataConfidence.HIGH;
  if (totalTrips >= 5) return DataConfidence.MEDIUM;
  return DataConfidence.LOW;
}