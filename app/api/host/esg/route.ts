// app/api/host/esg/route.ts
// Host ESG score — mobile-compatible (x-host-id header)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'
import { calculateESGScore } from '@/app/lib/esg/scoring'
import { getHostBadges } from '@/app/lib/esg/badges'

async function getHostIdFromHeaders(): Promise<string | null> {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  if (hostId) return hostId
  if (userId) {
    const host = await prisma.rentalHost.findFirst({ where: { userId }, select: { id: true } })
    return host?.id || null
  }
  return null
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 80) return 'A-'
  if (score >= 75) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 65) return 'B-'
  if (score >= 60) return 'C+'
  if (score >= 55) return 'C'
  if (score >= 50) return 'C-'
  if (score >= 40) return 'D'
  return 'F'
}

export async function GET(request: NextRequest) {
  try {
    const hostId = await getHostIdFromHeaders()
    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if ESG profile exists
    let esgProfile = await prisma.hostESGProfile.findUnique({
      where: { hostId },
      include: {
        snapshots: {
          orderBy: { snapshotDate: 'desc' },
          take: 6
        }
      }
    })

    // If no profile exists, calculate and create one
    if (!esgProfile) {
      const calculation = await calculateESGScore(hostId)

      esgProfile = await prisma.hostESGProfile.create({
        data: {
          hostId,
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
          dataConfidence: calculation.scores.dataConfidence
        },
        include: {
          snapshots: {
            orderBy: { snapshotDate: 'desc' },
            take: 6
          }
        }
      })
    }

    const badges = await getHostBadges(hostId)
    const totalCO2Tons = (esgProfile.totalCO2Impact || 0) / 1000

    return NextResponse.json({
      success: true,
      compositeScore: esgProfile.compositeScore,
      grade: getGrade(esgProfile.compositeScore),
      totalEVTrips: esgProfile.totalEVTrips,
      evTripPercentage: esgProfile.evTripPercentage,
      estimatedCO2Saved: esgProfile.estimatedCO2Saved || 0,
      totalCO2Kg: esgProfile.totalCO2Impact || 0,
      totalVehicles: esgProfile.totalVehicles,
      evVehicleCount: esgProfile.evVehicleCount,
      totalTrips: esgProfile.totalTrips,
      incidentFreeTrips: esgProfile.incidentFreeTrips,
      currentIncidentStreak: esgProfile.currentIncidentStreak,
      badges: badges.slice(0, 6),
      history: esgProfile.snapshots.map(s => ({
        date: s.snapshotDate,
        score: s.compositeScore
      })),
      lastCalculatedAt: esgProfile.lastCalculatedAt
    })
  } catch (error) {
    console.error('[Host ESG] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch ESG data' }, { status: 500 })
  }
}
