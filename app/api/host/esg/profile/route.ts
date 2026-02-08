// app/api/host/esg/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import prisma from "@/app/lib/database/prisma";
import { calculateESGScore } from "@/app/lib/esg/scoring";
import { getHostBadges } from "@/app/lib/esg/badges";
import { analyzeFleetComposition } from "@/app/lib/esg/fleet-composition";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies - check all auth cookie types
    const cookieStore = await cookies();
    const hostAccessToken = cookieStore.get('hostAccessToken');
    const accessToken = cookieStore.get('accessToken');
    const partnerToken = cookieStore.get('partner_token');

    const token = hostAccessToken?.value || accessToken?.value || partnerToken?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!decoded?.hostId) {
      return NextResponse.json(
        { error: "Invalid token - no host ID" },
        { status: 401 }
      );
    }

    console.log('✅ Authenticated host:', decoded.hostId);

    // Find host by ID
    const host = await prisma.rentalHost.findUnique({
      where: { id: decoded.hostId },
    });

    if (!host) {
      return NextResponse.json(
        { error: "Host profile not found" },
        { status: 404 }
      );
    }

    // Check if ESG profile exists
    let esgProfile = await prisma.hostESGProfile.findUnique({
      where: { hostId: host.id },
      include: {
        snapshots: {
          orderBy: { snapshotDate: "desc" },
          take: 6,
        },
      },
    });

    // If no profile exists, calculate and create one
    if (!esgProfile) {
      console.log("No ESG profile found, calculating...");

      const calculation = await calculateESGScore(host.id);

      esgProfile = await prisma.hostESGProfile.create({
        data: {
          id: crypto.randomUUID(),
          hostId: host.id,
          compositeScore: calculation.scores.compositeScore,
          drivingImpactScore: calculation.scores.drivingImpactScore,
          emissionsScore: calculation.scores.emissionsScore,
          maintenanceScore: calculation.scores.maintenanceScore,
          safetyScore: calculation.scores.safetyScore,
          complianceScore: calculation.scores.complianceScore,
          totalTrips: calculation.scores.totalTrips,
          incidentFreeTrips: calculation.scores.incidentFreeTrips,
          totalClaimsFiled: calculation.scores.totalClaimsFiled,
          currentIncidentStreak: calculation.scores.currentIncidentStreak,
          longestIncidentStreak: calculation.scores.longestIncidentStreak,
          lastIncidentDate: calculation.scores.lastIncidentDate,
          totalEVTrips: calculation.scores.totalEVTrips,
          evTripPercentage: calculation.scores.evTripPercentage,
          estimatedCO2Saved: calculation.scores.estimatedCO2Saved,
          totalCO2Impact: calculation.scores.totalCO2Impact || 0,
          avgCO2PerMile: calculation.scores.avgCO2PerMile || 0,
          fuelEfficiencyRating: calculation.scores.fuelEfficiencyRating,
          maintenanceOnTime: calculation.scores.maintenanceOnTime,
          lastMaintenanceDate: calculation.scores.lastMaintenanceDate,
          overdueMaintenanceCount: calculation.scores.overdueMaintenanceCount,
          fnolCompletionRate: calculation.scores.claimResponseRate,
          avgResponseTimeHours: calculation.scores.avgResponseTimeHours,
          unauthorizedMileage: calculation.scores.unauthorizedMileage,
          suspiciousActivityCount: calculation.scores.suspiciousActivityCount,
          verificationFailures: calculation.scores.verificationFailures,
          fraudRiskLevel: calculation.scores.fraudRiskLevel,
          totalMilesDriven: calculation.scores.totalMilesDriven,
          avgMilesPerTrip: calculation.scores.avgMilesPerTrip,
          tripCompletionRate: calculation.scores.tripCompletionRate,
          idleTimeEfficiency: calculation.scores.idleTimeEfficiency,
          tripCancellationRate: calculation.scores.tripCancellationRate,
          lateReturnCount: calculation.scores.lateReturnCount,
          earlyReturnCount: calculation.scores.earlyReturnCount,
          guestRatingAverage: calculation.scores.guestRatingAverage,
          totalVehicles: calculation.scores.totalVehicles,
          activeVehicles: calculation.scores.activeVehicles,
          evVehicleCount: calculation.scores.evVehicleCount,
          avgVehicleAge: calculation.scores.avgVehicleAge,
          hasCommercialInsurance: calculation.scores.hasCommercialInsurance,
          hasP2PInsurance: calculation.scores.hasP2PInsurance,
          insuranceTier: calculation.scores.insuranceTier,
          claimApprovalRate: calculation.scores.claimApprovalRate,
          avgClaimProcessingDays: calculation.scores.avgClaimProcessingDays,
          achievedBadges: calculation.scores.achievedBadges,
          milestoneReached: calculation.scores.milestoneReached,
          nextMilestone: calculation.scores.nextMilestone,
          calculationVersion: calculation.scores.calculationVersion,
          dataConfidence: calculation.scores.dataConfidence,
          lastCalculatedAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          snapshots: {
            orderBy: { snapshotDate: "desc" },
            take: 6,
          },
        },
      });

      await prisma.eSGSnapshot.create({
        data: {
          id: crypto.randomUUID(),
          profileId: esgProfile!.id,
          compositeScore: calculation.scores.compositeScore,
          drivingImpactScore: calculation.scores.drivingImpactScore,
          emissionsScore: calculation.scores.emissionsScore,
          maintenanceScore: calculation.scores.maintenanceScore,
          safetyScore: calculation.scores.safetyScore,
          complianceScore: calculation.scores.complianceScore,
          snapshotReason: "MANUAL_REFRESH",
        },
      });

      console.log("✅ ESG profile created");
    }

    // At this point esgProfile is guaranteed non-null (either found or created above)
    const profile = esgProfile!;

    // ✅ Fetch fleet composition
    console.log('🚗 Fetching fleet composition for host:', host.id);
    const fleetComposition = await analyzeFleetComposition(host.id);
    console.log('✅ Fleet composition fetched:', JSON.stringify(fleetComposition, null, 2));

    // Get badges
    const badges = await getHostBadges(host.id);

    const responseData = {
      success: true,
      data: {
        profile: {
          compositeScore: profile.compositeScore,
          safetyScore: profile.safetyScore,
          drivingImpactScore: profile.drivingImpactScore,
          emissionsScore: profile.emissionsScore,
          maintenanceScore: profile.maintenanceScore,
          complianceScore: profile.complianceScore,
          totalTrips: profile.totalTrips,
          incidentFreeTrips: profile.incidentFreeTrips,
          currentIncidentStreak: profile.currentIncidentStreak,
          totalClaimsFiled: profile.totalClaimsFiled,
          evTripPercentage: profile.evTripPercentage,
          estimatedCO2Saved: profile.estimatedCO2Saved,
          totalCO2Impact: profile.totalCO2Impact || 0,
          avgCO2PerMile: profile.avgCO2PerMile || 0,
          claimResponseRate: profile.fnolCompletionRate,
          avgResponseTimeHours: profile.avgResponseTimeHours,
          maintenanceOnTime: profile.maintenanceOnTime,
          unauthorizedMileage: profile.unauthorizedMileage,
          totalMilesDriven: profile.totalMilesDriven,
          tripCompletionRate: profile.tripCompletionRate,
          metrics: {
            safety: {
              totalTrips: profile.totalTrips,
              incidentFreeTrips: profile.incidentFreeTrips,
              totalClaimsFiled: profile.totalClaimsFiled,
              currentStreak: profile.currentIncidentStreak,
              longestStreak: profile.longestIncidentStreak,
              lastIncidentDate: profile.lastIncidentDate,
            },
            drivingImpact: {
              totalMiles: profile.totalMilesDriven,
              avgMilesPerTrip: profile.avgMilesPerTrip,
              completionRate: profile.tripCompletionRate,
              unauthorizedMileage: profile.unauthorizedMileage,
              lateReturns: profile.lateReturnCount,
            },
            environmental: {
              totalEVTrips: profile.totalEVTrips,
              evTripPercentage: profile.evTripPercentage,
              estimatedCO2Saved: profile.estimatedCO2Saved,
              totalCO2Impact: profile.totalCO2Impact || 0,
              avgCO2PerMile: profile.avgCO2PerMile || 0,
              fuelEfficiencyRating: profile.fuelEfficiencyRating,
            },
            maintenance: {
              onTime: profile.maintenanceOnTime,
              lastMaintenanceDate: profile.lastMaintenanceDate,
              overdueCount: profile.overdueMaintenanceCount,
            },
            compliance: {
              responseRate: profile.fnolCompletionRate,
              avgResponseTimeHours: profile.avgResponseTimeHours,
            },
            fleet: {
              totalVehicles: profile.totalVehicles,
              activeVehicles: profile.activeVehicles,
              evVehicleCount: profile.evVehicleCount,
              avgVehicleAge: profile.avgVehicleAge,
            },
          },
          lastCalculatedAt: profile.lastCalculatedAt,
          dataConfidence: profile.dataConfidence,
        },
        fleetComposition,
        history: profile.snapshots.map((snapshot) => ({
          date: snapshot.snapshotDate,
          compositeScore: snapshot.compositeScore,
          safetyScore: snapshot.safetyScore,
          drivingImpactScore: snapshot.drivingImpactScore,
          emissionsScore: snapshot.emissionsScore,
          maintenanceScore: snapshot.maintenanceScore,
          complianceScore: snapshot.complianceScore,
        })),
        badges,
      },
    };

    console.log('📦 Final response structure:', {
      success: responseData.success,
      hasProfile: !!responseData.data.profile,
      hasFleetComposition: !!responseData.data.fleetComposition,
      fleetVehicles: responseData.data.fleetComposition?.totalVehicles,
      hasBadges: !!responseData.data.badges,
      hasHistory: !!responseData.data.history,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Error fetching ESG profile:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch ESG profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}