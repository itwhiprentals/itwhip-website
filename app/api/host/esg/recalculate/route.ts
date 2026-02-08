// app/api/host/esg/recalculate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/app/lib/database/prisma";
import { calculateESGScore } from "@/app/lib/esg/scoring";

// ============================================================================
// POST /api/host/esg/recalculate
// Manually recalculate ESG scores for current host
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Find host by email
    const host = await prisma.rentalHost.findUnique({
      where: { email: session.user.email.toLowerCase() },
    });

    if (!host) {
      return NextResponse.json(
        { error: "Host profile not found" },
        { status: 404 }
      );
    }

    console.log(`🔄 Recalculating ESG score for host: ${host.id}`);

    // Calculate fresh ESG scores
    const calculation = await calculateESGScore(host.id);

    // Check if profile exists
    const existingProfile = await prisma.hostESGProfile.findUnique({
      where: { hostId: host.id },
    });

    let esgProfile;

    if (existingProfile) {
      // Update existing profile
      esgProfile = await prisma.hostESGProfile.update({
        where: { hostId: host.id },
        data: {
          // Scores
          compositeScore: calculation.scores.compositeScore,
          drivingImpactScore: calculation.scores.drivingImpactScore,
          emissionsScore: calculation.scores.emissionsScore,
          maintenanceScore: calculation.scores.maintenanceScore,
          safetyScore: calculation.scores.safetyScore,
          complianceScore: calculation.scores.complianceScore,

          // Safety metrics
          totalTrips: calculation.scores.totalTrips,
          incidentFreeTrips: calculation.scores.incidentFreeTrips,
          totalClaimsFiled: calculation.scores.totalClaimsFiled,
          currentIncidentStreak: calculation.scores.currentIncidentStreak,
          longestIncidentStreak: calculation.scores.longestIncidentStreak,
          lastIncidentDate: calculation.scores.lastIncidentDate,

          // Environmental metrics
          totalEVTrips: calculation.scores.totalEVTrips,
          evTripPercentage: calculation.scores.evTripPercentage,
          estimatedCO2Saved: calculation.scores.estimatedCO2Saved,
          fuelEfficiencyRating: calculation.scores.fuelEfficiencyRating,

          // Compliance metrics
          maintenanceOnTime: calculation.scores.maintenanceOnTime,
          lastMaintenanceDate: calculation.scores.lastMaintenanceDate,
          overdueMaintenanceCount: calculation.scores.overdueMaintenanceCount,
          fnolCompletionRate: calculation.scores.claimResponseRate,
          avgResponseTimeHours: calculation.scores.avgResponseTimeHours,

          // Fraud detection
          unauthorizedMileage: calculation.scores.unauthorizedMileage,
          suspiciousActivityCount: calculation.scores.suspiciousActivityCount,
          verificationFailures: calculation.scores.verificationFailures,
          fraudRiskLevel: calculation.scores.fraudRiskLevel,

          // Usage patterns
          totalMilesDriven: calculation.scores.totalMilesDriven,
          avgMilesPerTrip: calculation.scores.avgMilesPerTrip,
          tripCompletionRate: calculation.scores.tripCompletionRate,
          idleTimeEfficiency: calculation.scores.idleTimeEfficiency,

          // Trip quality
          tripCancellationRate: calculation.scores.tripCancellationRate,
          lateReturnCount: calculation.scores.lateReturnCount,
          earlyReturnCount: calculation.scores.earlyReturnCount,
          guestRatingAverage: calculation.scores.guestRatingAverage,

          // Vehicle fleet
          totalVehicles: calculation.scores.totalVehicles,
          activeVehicles: calculation.scores.activeVehicles,
          evVehicleCount: calculation.scores.evVehicleCount,
          avgVehicleAge: calculation.scores.avgVehicleAge,

          // Insurance & risk
          hasCommercialInsurance: calculation.scores.hasCommercialInsurance,
          hasP2PInsurance: calculation.scores.hasP2PInsurance,
          insuranceTier: calculation.scores.insuranceTier,
          claimApprovalRate: calculation.scores.claimApprovalRate,
          avgClaimProcessingDays: calculation.scores.avgClaimProcessingDays,

          // Gamification
          achievedBadges: calculation.scores.achievedBadges,
          milestoneReached: calculation.scores.milestoneReached,
          nextMilestone: calculation.scores.nextMilestone,

          // Metadata
          calculationVersion: calculation.scores.calculationVersion,
          dataConfidence: calculation.scores.dataConfidence,
        },
      });
    } else {
      // Create new profile
      esgProfile = await prisma.hostESGProfile.create({
        data: {
          id: crypto.randomUUID(),
          updatedAt: new Date(),
          lastCalculatedAt: new Date(),
          hostId: host.id,

          // Scores
          compositeScore: calculation.scores.compositeScore,
          drivingImpactScore: calculation.scores.drivingImpactScore,
          emissionsScore: calculation.scores.emissionsScore,
          maintenanceScore: calculation.scores.maintenanceScore,
          safetyScore: calculation.scores.safetyScore,
          complianceScore: calculation.scores.complianceScore,

          // Safety metrics
          totalTrips: calculation.scores.totalTrips,
          incidentFreeTrips: calculation.scores.incidentFreeTrips,
          totalClaimsFiled: calculation.scores.totalClaimsFiled,
          currentIncidentStreak: calculation.scores.currentIncidentStreak,
          longestIncidentStreak: calculation.scores.longestIncidentStreak,
          lastIncidentDate: calculation.scores.lastIncidentDate,

          // Environmental metrics
          totalEVTrips: calculation.scores.totalEVTrips,
          evTripPercentage: calculation.scores.evTripPercentage,
          estimatedCO2Saved: calculation.scores.estimatedCO2Saved,
          fuelEfficiencyRating: calculation.scores.fuelEfficiencyRating,

          // Compliance metrics
          maintenanceOnTime: calculation.scores.maintenanceOnTime,
          lastMaintenanceDate: calculation.scores.lastMaintenanceDate,
          overdueMaintenanceCount: calculation.scores.overdueMaintenanceCount,
          fnolCompletionRate: calculation.scores.claimResponseRate,
          avgResponseTimeHours: calculation.scores.avgResponseTimeHours,

          // Fraud detection
          unauthorizedMileage: calculation.scores.unauthorizedMileage,
          suspiciousActivityCount: calculation.scores.suspiciousActivityCount,
          verificationFailures: calculation.scores.verificationFailures,
          fraudRiskLevel: calculation.scores.fraudRiskLevel,

          // Usage patterns
          totalMilesDriven: calculation.scores.totalMilesDriven,
          avgMilesPerTrip: calculation.scores.avgMilesPerTrip,
          tripCompletionRate: calculation.scores.tripCompletionRate,
          idleTimeEfficiency: calculation.scores.idleTimeEfficiency,

          // Trip quality
          tripCancellationRate: calculation.scores.tripCancellationRate,
          lateReturnCount: calculation.scores.lateReturnCount,
          earlyReturnCount: calculation.scores.earlyReturnCount,
          guestRatingAverage: calculation.scores.guestRatingAverage,

          // Vehicle fleet
          totalVehicles: calculation.scores.totalVehicles,
          activeVehicles: calculation.scores.activeVehicles,
          evVehicleCount: calculation.scores.evVehicleCount,
          avgVehicleAge: calculation.scores.avgVehicleAge,

          // Insurance & risk
          hasCommercialInsurance: calculation.scores.hasCommercialInsurance,
          hasP2PInsurance: calculation.scores.hasP2PInsurance,
          insuranceTier: calculation.scores.insuranceTier,
          claimApprovalRate: calculation.scores.claimApprovalRate,
          avgClaimProcessingDays: calculation.scores.avgClaimProcessingDays,

          // Gamification
          achievedBadges: calculation.scores.achievedBadges,
          milestoneReached: calculation.scores.milestoneReached,
          nextMilestone: calculation.scores.nextMilestone,

          // Metadata
          calculationVersion: calculation.scores.calculationVersion,
          dataConfidence: calculation.scores.dataConfidence,
        } as any,
      });
    }

    // Create snapshot
    await prisma.eSGSnapshot.create({
      data: {
        id: crypto.randomUUID(),
        profileId: esgProfile.id,
        compositeScore: calculation.scores.compositeScore,
        drivingImpactScore: calculation.scores.drivingImpactScore,
        emissionsScore: calculation.scores.emissionsScore,
        maintenanceScore: calculation.scores.maintenanceScore,
        safetyScore: calculation.scores.safetyScore,
        complianceScore: calculation.scores.complianceScore,
        snapshotReason: "MANUAL_REFRESH",
      },
    });

    // Log event
    await prisma.eSGEvent.create({
      data: {
        id: crypto.randomUUID(),
        hostId: host.id,
        eventType: "SCORE_CALCULATED",
        eventCategory: "GAMIFICATION",
        scoreBefore: existingProfile?.compositeScore,
        scoreAfter: calculation.scores.compositeScore,
        scoreChange: existingProfile
          ? calculation.scores.compositeScore - existingProfile.compositeScore
          : 0,
        description: "ESG score manually recalculated",
        metadata: {
          trigger: "manual",
          version: calculation.scores.calculationVersion,
        },
      },
    });

    console.log("✅ ESG score recalculated successfully");

    return NextResponse.json({
      success: true,
      message: "ESG scores recalculated successfully",
      data: {
        compositeScore: calculation.scores.compositeScore,
        safetyScore: calculation.scores.safetyScore,
        drivingImpactScore: calculation.scores.drivingImpactScore,
        emissionsScore: calculation.scores.emissionsScore,
        maintenanceScore: calculation.scores.maintenanceScore,
        complianceScore: calculation.scores.complianceScore,
        change: existingProfile
          ? calculation.scores.compositeScore - existingProfile.compositeScore
          : 0,
        newBadges: calculation.badges,
        recommendations: calculation.recommendations,
      },
    });
  } catch (error) {
    console.error("Error recalculating ESG score:", error);
    return NextResponse.json(
      {
        error: "Failed to recalculate ESG score",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}