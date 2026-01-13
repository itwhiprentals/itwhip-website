// app/api/partner/esg/route.ts
// Partner ESG Dashboard API - Environmental, Social, Governance metrics

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { calculateESGScore } from '@/app/lib/esg/scoring'
import { getHostBadges } from '@/app/lib/esg/badges'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

// Get partner from token
async function getPartner() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.hostId as string
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const hostId = await getPartner()
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

    // Get badges
    const badges = await getHostBadges(hostId)

    // Calculate carbon offset cost (using Stripe Climate rates)
    // Approximate: $15/metric ton of CO2
    const carbonOffsetCostPerTon = 15
    const totalCO2Tons = (esgProfile.totalCO2Impact || 0) / 1000 // Convert kg to tons
    const estimatedOffsetCost = totalCO2Tons * carbonOffsetCostPerTon

    // Get ESG grade
    const getGrade = (score: number) => {
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

    return NextResponse.json({
      success: true,
      profile: {
        compositeScore: esgProfile.compositeScore,
        grade: getGrade(esgProfile.compositeScore),
        scores: {
          safety: {
            score: esgProfile.safetyScore,
            grade: getGrade(esgProfile.safetyScore)
          },
          emissions: {
            score: esgProfile.emissionsScore,
            grade: getGrade(esgProfile.emissionsScore)
          },
          maintenance: {
            score: esgProfile.maintenanceScore,
            grade: getGrade(esgProfile.maintenanceScore)
          },
          compliance: {
            score: esgProfile.complianceScore,
            grade: getGrade(esgProfile.complianceScore)
          },
          drivingImpact: {
            score: esgProfile.drivingImpactScore,
            grade: getGrade(esgProfile.drivingImpactScore)
          }
        },
        environmental: {
          totalCO2Kg: esgProfile.totalCO2Impact || 0,
          co2SavedKg: esgProfile.estimatedCO2Saved || 0,
          evTrips: esgProfile.totalEVTrips,
          evTripPercentage: esgProfile.evTripPercentage,
          avgCO2PerMile: esgProfile.avgCO2PerMile || 0,
          fuelEfficiencyRating: esgProfile.fuelEfficiencyRating
        },
        carbonOffset: {
          totalCO2Tons,
          estimatedCost: estimatedOffsetCost,
          isOffsetEnabled: false, // Will be enabled when Stripe Climate is configured
          offsetPercentage: 0
        },
        fleet: {
          totalVehicles: esgProfile.totalVehicles,
          activeVehicles: esgProfile.activeVehicles,
          evVehicleCount: esgProfile.evVehicleCount,
          avgVehicleAge: esgProfile.avgVehicleAge
        },
        operations: {
          totalTrips: esgProfile.totalTrips,
          incidentFreeTrips: esgProfile.incidentFreeTrips,
          incidentFreeRate: esgProfile.totalTrips > 0
            ? (esgProfile.incidentFreeTrips / esgProfile.totalTrips) * 100
            : 100,
          totalMilesDriven: esgProfile.totalMilesDriven,
          currentIncidentStreak: esgProfile.currentIncidentStreak,
          maintenanceOnTime: esgProfile.maintenanceOnTime,
          overdueMaintenanceCount: esgProfile.overdueMaintenanceCount
        },
        lastCalculatedAt: esgProfile.lastCalculatedAt
      },
      badges: badges.slice(0, 6), // Show top 6 badges
      history: esgProfile.snapshots.map(s => ({
        date: s.snapshotDate,
        score: s.compositeScore
      }))
    })

  } catch (error) {
    console.error('[Partner ESG] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ESG data' },
      { status: 500 }
    )
  }
}

// POST - Request carbon offset (placeholder for Stripe Climate)
export async function POST() {
  try {
    const hostId = await getPartner()
    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Placeholder for Stripe Climate integration
    // In production, this would create a carbon offset purchase via Stripe Climate API
    return NextResponse.json({
      success: false,
      message: 'Carbon offset coming soon! We are integrating with Stripe Climate.',
      info: {
        what: 'Carbon offsetting allows you to neutralize your fleet\'s carbon emissions',
        how: 'We partner with Stripe Climate to purchase verified carbon removal credits',
        cost: 'Approximately $15 per metric ton of CO2'
      }
    })

  } catch (error) {
    console.error('[Partner ESG Carbon Offset] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process carbon offset request' },
      { status: 500 }
    )
  }
}
