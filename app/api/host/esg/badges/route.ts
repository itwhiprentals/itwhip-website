// app/api/host/esg/badges/route.ts
/**
 * ESG Badges & Achievements API
 * Returns earned badges and progress toward next achievements
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

interface BadgeDefinition {
  code: string
  name: string
  description: string
  icon: string
  category: 'SAFETY' | 'ENVIRONMENTAL' | 'COMPLIANCE' | 'MILESTONE' | 'FLEET'
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  requirements: {
    trips?: number
    streak?: number
    score?: number
    evCount?: number
    vehicleCount?: number
    maintenanceScore?: number
  }
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Safety Badges
  {
    code: 'FIRST_TRIP',
    name: 'First Trip',
    description: 'Completed your first trip',
    icon: '🚗',
    category: 'MILESTONE',
    rarity: 'COMMON',
    requirements: { trips: 1 },
  },
  {
    code: 'INCIDENT_FREE_25',
    name: '25 Incident-Free Trips',
    description: '25 trips without any claims',
    icon: '🛡️',
    category: 'SAFETY',
    rarity: 'COMMON',
    requirements: { streak: 25 },
  },
  {
    code: 'INCIDENT_FREE_50',
    name: '50 Incident-Free Trips',
    description: '50 trips without any claims',
    icon: '🏆',
    category: 'SAFETY',
    rarity: 'RARE',
    requirements: { streak: 50 },
  },
  {
    code: 'INCIDENT_FREE_100',
    name: '100 Incident-Free Trips',
    description: '100 trips without any claims',
    icon: '💎',
    category: 'SAFETY',
    rarity: 'EPIC',
    requirements: { streak: 100 },
  },
  {
    code: 'SAFETY_CHAMPION',
    name: 'Safety Champion',
    description: 'Safety score of 90 or higher',
    icon: '⭐',
    category: 'SAFETY',
    rarity: 'RARE',
    requirements: { score: 90 },
  },
  {
    code: 'SAFETY_MASTER',
    name: 'Safety Master',
    description: 'Safety score of 95 or higher',
    icon: '🌟',
    category: 'SAFETY',
    rarity: 'EPIC',
    requirements: { score: 95 },
  },

  // Milestone Badges
  {
    code: '50_TRIPS_MILESTONE',
    name: '50 Trips',
    description: 'Completed 50 total trips',
    icon: '📍',
    category: 'MILESTONE',
    rarity: 'COMMON',
    requirements: { trips: 50 },
  },
  {
    code: '100_TRIPS_MILESTONE',
    name: '100 Trips',
    description: 'Completed 100 total trips',
    icon: '🎯',
    category: 'MILESTONE',
    rarity: 'RARE',
    requirements: { trips: 100 },
  },
  {
    code: '500_TRIPS_MILESTONE',
    name: '500 Trips',
    description: 'Completed 500 total trips',
    icon: '🚀',
    category: 'MILESTONE',
    rarity: 'EPIC',
    requirements: { trips: 500 },
  },
  {
    code: '1000_TRIPS_MILESTONE',
    name: '1000 Trips',
    description: 'Completed 1000 total trips',
    icon: '👑',
    category: 'MILESTONE',
    rarity: 'LEGENDARY',
    requirements: { trips: 1000 },
  },

  // Environmental Badges
  {
    code: 'ECO_WARRIOR',
    name: 'Eco Warrior',
    description: 'Added your first electric vehicle',
    icon: '🌱',
    category: 'ENVIRONMENTAL',
    rarity: 'COMMON',
    requirements: { evCount: 1 },
  },
  {
    code: 'GREEN_FLEET_PIONEER',
    name: 'Green Fleet Pioneer',
    description: '2 or more electric vehicles in fleet',
    icon: '🌿',
    category: 'ENVIRONMENTAL',
    rarity: 'RARE',
    requirements: { evCount: 2 },
  },
  {
    code: 'ALL_ELECTRIC_FLEET',
    name: 'All-Electric Fleet',
    description: 'Entire fleet is electric (3+ vehicles)',
    icon: '⚡',
    category: 'ENVIRONMENTAL',
    rarity: 'LEGENDARY',
    requirements: { evCount: 3, vehicleCount: 3 },
  },

  // Fleet Badges
  {
    code: 'FIRST_VEHICLE',
    name: 'First Vehicle',
    description: 'Added your first vehicle',
    icon: '🎉',
    category: 'FLEET',
    rarity: 'COMMON',
    requirements: { vehicleCount: 1 },
  },
  {
    code: 'FLEET_BUILDER_5',
    name: 'Fleet Builder',
    description: '5 vehicles in your fleet',
    icon: '🚙',
    category: 'FLEET',
    rarity: 'RARE',
    requirements: { vehicleCount: 5 },
  },
  {
    code: 'FLEET_BUILDER_10',
    name: 'Fleet Master',
    description: '10 vehicles in your fleet',
    icon: '🚗',
    category: 'FLEET',
    rarity: 'EPIC',
    requirements: { vehicleCount: 10 },
  },

  // Maintenance Badges
  {
    code: 'MAINTENANCE_PRO',
    name: 'Maintenance Pro',
    description: 'Maintenance score of 90 or higher',
    icon: '🔧',
    category: 'COMPLIANCE',
    rarity: 'RARE',
    requirements: { maintenanceScore: 90 },
  },
  {
    code: 'MAINTENANCE_MASTER',
    name: 'Maintenance Master',
    description: 'Maintenance score of 95 or higher',
    icon: '⚙️',
    category: 'COMPLIANCE',
    rarity: 'EPIC',
    requirements: { maintenanceScore: 95 },
  },
  {
    code: 'ALWAYS_ON_TIME',
    name: 'Always On Time',
    description: 'Perfect maintenance schedule adherence',
    icon: '⏰',
    category: 'COMPLIANCE',
    rarity: 'RARE',
    requirements: { maintenanceScore: 85 },
  },
]

// ============================================================================
// GET: Fetch Badges & Progress
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Get host ID from headers
    const hostId = request.headers.get('x-host-id')
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID required' },
        { status: 400 }
      )
    }

    // Fetch host profile with ESG data
    const profile = await prisma.hostESGProfile.findUnique({
      where: { hostId },
      select: {
        totalTrips: true,
        currentIncidentStreak: true,
        safetyScore: true,
        maintenanceScore: true,
        evVehicleCount: true,
        totalVehicles: true,
        achievedBadges: true,
        maintenanceOnTime: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'ESG profile not found' },
        { status: 404 }
      )
    }

    // Separate earned and unearned badges
    const earnedBadges: Array<BadgeDefinition & { earnedAt?: Date }> = []
    const unearnedBadges: Array
      BadgeDefinition & { progress: number; nextMilestone?: any }
    > = []

    BADGE_DEFINITIONS.forEach((badge) => {
      const isEarned = profile.achievedBadges.includes(badge.code)

      if (isEarned) {
        earnedBadges.push(badge)
      } else {
        // Calculate progress toward this badge
        const progress = calculateBadgeProgress(badge, profile)
        unearnedBadges.push({
          ...badge,
          progress: Math.min(100, progress.percentage),
          nextMilestone: progress.nextMilestone,
        })
      }
    })

    // Sort unearned badges by progress (closest to earning first)
    unearnedBadges.sort((a, b) => b.progress - a.progress)

    // Get next badge to earn (highest progress)
    const nextBadge = unearnedBadges[0] || null

    // Calculate overall badge statistics
    const totalBadges = BADGE_DEFINITIONS.length
    const earnedCount = earnedBadges.length
    const completionPercentage = Math.round((earnedCount / totalBadges) * 100)

    // Group earned badges by category
    const badgesByCategory = {
      SAFETY: earnedBadges.filter((b) => b.category === 'SAFETY').length,
      ENVIRONMENTAL: earnedBadges.filter((b) => b.category === 'ENVIRONMENTAL')
        .length,
      COMPLIANCE: earnedBadges.filter((b) => b.category === 'COMPLIANCE').length,
      MILESTONE: earnedBadges.filter((b) => b.category === 'MILESTONE').length,
      FLEET: earnedBadges.filter((b) => b.category === 'FLEET').length,
    }

    // Group by rarity
    const badgesByRarity = {
      COMMON: earnedBadges.filter((b) => b.rarity === 'COMMON').length,
      RARE: earnedBadges.filter((b) => b.rarity === 'RARE').length,
      EPIC: earnedBadges.filter((b) => b.rarity === 'EPIC').length,
      LEGENDARY: earnedBadges.filter((b) => b.rarity === 'LEGENDARY').length,
    }

    return NextResponse.json({
      hostId,
      summary: {
        totalBadges,
        earnedCount,
        completionPercentage,
        byCategory: badgesByCategory,
        byRarity: badgesByRarity,
      },
      earnedBadges: earnedBadges.map((badge) => ({
        code: badge.code,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        rarity: badge.rarity,
      })),
      nextBadge: nextBadge
        ? {
            code: nextBadge.code,
            name: nextBadge.name,
            description: nextBadge.description,
            icon: nextBadge.icon,
            category: nextBadge.category,
            rarity: nextBadge.rarity,
            progress: nextBadge.progress,
            requirements: nextBadge.nextMilestone,
          }
        : null,
      inProgress: unearnedBadges.slice(0, 5).map((badge) => ({
        code: badge.code,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        rarity: badge.rarity,
        progress: badge.progress,
        requirements: badge.nextMilestone,
      })),
    })
  } catch (error) {
    console.error('❌ Error fetching badges:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch badges',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER: CALCULATE BADGE PROGRESS
// ============================================================================

function calculateBadgeProgress(
  badge: BadgeDefinition,
  profile: any
): { percentage: number; nextMilestone: any } {
  const req = badge.requirements
  let progress = 0
  let nextMilestone: any = {}

  // Trip-based badges
  if (req.trips !== undefined) {
    progress = (profile.totalTrips / req.trips) * 100
    nextMilestone = {
      current: profile.totalTrips,
      required: req.trips,
      remaining: Math.max(0, req.trips - profile.totalTrips),
    }
  }

  // Streak-based badges
  else if (req.streak !== undefined) {
    progress = (profile.currentIncidentStreak / req.streak) * 100
    nextMilestone = {
      current: profile.currentIncidentStreak,
      required: req.streak,
      remaining: Math.max(0, req.streak - profile.currentIncidentStreak),
    }
  }

  // Score-based badges (safety)
  else if (req.score !== undefined && badge.category === 'SAFETY') {
    progress = (profile.safetyScore / req.score) * 100
    nextMilestone = {
      current: profile.safetyScore,
      required: req.score,
      remaining: Math.max(0, req.score - profile.safetyScore),
    }
  }

  // Maintenance score badges
  else if (req.maintenanceScore !== undefined) {
    progress = (profile.maintenanceScore / req.maintenanceScore) * 100
    nextMilestone = {
      current: profile.maintenanceScore,
      required: req.maintenanceScore,
      remaining: Math.max(0, req.maintenanceScore - profile.maintenanceScore),
    }
  }

  // EV count badges
  else if (req.evCount !== undefined) {
    progress = (profile.evVehicleCount / req.evCount) * 100
    nextMilestone = {
      current: profile.evVehicleCount,
      required: req.evCount,
      remaining: Math.max(0, req.evCount - profile.evVehicleCount),
    }
  }

  // Vehicle count badges
  else if (req.vehicleCount !== undefined) {
    progress = (profile.totalVehicles / req.vehicleCount) * 100
    nextMilestone = {
      current: profile.totalVehicles,
      required: req.vehicleCount,
      remaining: Math.max(0, req.vehicleCount - profile.totalVehicles),
    }
  }

  // Special: All-electric fleet
  if (badge.code === 'ALL_ELECTRIC_FLEET') {
    if (profile.totalVehicles >= 3 && profile.evVehicleCount === profile.totalVehicles) {
      progress = 100
    } else {
      progress = 0
    }
    nextMilestone = {
      current: `${profile.evVehicleCount} EVs / ${profile.totalVehicles} vehicles`,
      required: '100% electric fleet (3+ vehicles)',
      remaining: 'Add more EVs or remove gas vehicles',
    }
  }

  // Special: Always on time
  if (badge.code === 'ALWAYS_ON_TIME') {
    if (profile.maintenanceOnTime && profile.maintenanceScore >= 85) {
      progress = 100
    } else {
      progress = profile.maintenanceScore >= 85 ? 50 : 0
    }
  }

  return {
    percentage: Math.round(progress),
    nextMilestone,
  }
}