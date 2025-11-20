// app/lib/esg/badges.ts

import prisma from '@/app/lib/database/prisma';
import {
  Badge,
  BadgeEarned,
  BadgeCategory,
  BadgeRarity,
  ESGScore,
} from "./types";

// ============================================================================
// BADGE DEFINITIONS & AWARD LOGIC
// ============================================================================

/**
 * All available badges in the system
 */
export const ALL_BADGES: Badge[] = [
  // SAFETY BADGES
  {
    badgeCode: "SAFETY_CHAMPION",
    badgeName: "Safety Champion",
    badgeDescription: "Maintained 50+ incident-free trips",
    badgeIcon: "🛡️",
    badgeCategory: BadgeCategory.SAFETY,
    requiredStreak: 50,
    rarity: BadgeRarity.EPIC,
    points: 100,
  },
  {
    badgeCode: "ZERO_CLAIMS",
    badgeName: "Zero Claims",
    badgeDescription: "Completed 25+ trips without a single claim",
    badgeIcon: "💎",
    badgeCategory: BadgeCategory.SAFETY,
    requiredTrips: 25,
    requiredMetric: "totalClaimsFiled",
    requiredValue: 0,
    rarity: BadgeRarity.RARE,
    points: 75,
  },
  {
    badgeCode: "STREAK_MASTER",
    badgeName: "Streak Master",
    badgeDescription: "Achieved 100 consecutive incident-free trips",
    badgeIcon: "🔥",
    badgeCategory: BadgeCategory.SAFETY,
    requiredStreak: 100,
    rarity: BadgeRarity.LEGENDARY,
    points: 200,
  },
  {
    badgeCode: "SAFE_DRIVER",
    badgeName: "Safe Driver",
    badgeDescription: "Safety score above 90",
    badgeIcon: "🚗",
    badgeCategory: BadgeCategory.SAFETY,
    requiredScore: 90,
    rarity: BadgeRarity.COMMON,
    points: 25,
  },

  // ENVIRONMENTAL BADGES
  {
    badgeCode: "ECO_WARRIOR",
    badgeName: "Eco Warrior",
    badgeDescription: "25%+ of trips use electric vehicles",
    badgeIcon: "🌱",
    badgeCategory: BadgeCategory.ENVIRONMENTAL,
    requiredMetric: "evTripPercentage",
    requiredValue: 0.25,
    rarity: BadgeRarity.RARE,
    points: 75,
  },
  {
    badgeCode: "GREEN_FLEET",
    badgeName: "Green Fleet",
    badgeDescription: "50%+ of fleet is electric vehicles",
    badgeIcon: "🔋",
    badgeCategory: BadgeCategory.ENVIRONMENTAL,
    requiredMetric: "evTripPercentage",
    requiredValue: 0.5,
    rarity: BadgeRarity.EPIC,
    points: 150,
  },
  {
    badgeCode: "CARBON_NEUTRAL",
    badgeName: "Carbon Neutral",
    badgeDescription: "Saved 500kg+ CO2 through EV usage",
    badgeIcon: "🌍",
    badgeCategory: BadgeCategory.ENVIRONMENTAL,
    requiredMetric: "estimatedCO2Saved",
    requiredValue: 500,
    rarity: BadgeRarity.EPIC,
    points: 125,
  },
  {
    badgeCode: "ECO_STARTER",
    badgeName: "Eco Starter",
    badgeDescription: "Added your first electric vehicle",
    badgeIcon: "⚡",
    badgeCategory: BadgeCategory.ENVIRONMENTAL,
    requiredMetric: "totalEVTrips",
    requiredValue: 1,
    rarity: BadgeRarity.COMMON,
    points: 20,
  },

  // COMPLIANCE BADGES
  {
    badgeCode: "PERFECT_COMPLIANCE",
    badgeName: "Perfect Compliance",
    badgeDescription: "100% claim response rate",
    badgeIcon: "⭐",
    badgeCategory: BadgeCategory.COMPLIANCE,
    requiredMetric: "claimResponseRate",
    requiredValue: 1.0,
    requiredTrips: 10,
    rarity: BadgeRarity.RARE,
    points: 50,
  },
  {
    badgeCode: "MAINTENANCE_PRO",
    badgeName: "Maintenance Pro",
    badgeDescription: "Always on-schedule with maintenance",
    badgeIcon: "🔧",
    badgeCategory: BadgeCategory.COMPLIANCE,
    requiredScore: 85,
    requiredTrips: 15,
    rarity: BadgeRarity.RARE,
    points: 60,
  },
  {
    badgeCode: "QUICK_RESPONDER",
    badgeName: "Quick Responder",
    badgeDescription: "Average response time under 2 hours",
    badgeIcon: "⚡",
    badgeCategory: BadgeCategory.COMPLIANCE,
    requiredMetric: "avgResponseTimeHours",
    requiredValue: 2,
    rarity: BadgeRarity.COMMON,
    points: 30,
  },

  // MILESTONE BADGES
  {
    badgeCode: "GOLD_HOST",
    badgeName: "Gold Host",
    badgeDescription: "Completed 50+ trips with 85+ ESG score",
    badgeIcon: "🏆",
    badgeCategory: BadgeCategory.MILESTONE,
    requiredTrips: 50,
    requiredScore: 85,
    rarity: BadgeRarity.EPIC,
    points: 150,
  },
  {
    badgeCode: "VETERAN_HOST",
    badgeName: "Veteran Host",
    badgeDescription: "Completed 100+ trips",
    badgeIcon: "👑",
    badgeCategory: BadgeCategory.MILESTONE,
    requiredTrips: 100,
    rarity: BadgeRarity.LEGENDARY,
    points: 250,
  },
  {
    badgeCode: "FIRST_TRIP",
    badgeName: "First Trip",
    badgeDescription: "Completed your first trip",
    badgeIcon: "🎉",
    badgeCategory: BadgeCategory.MILESTONE,
    requiredTrips: 1,
    rarity: BadgeRarity.COMMON,
    points: 10,
  },
  {
    badgeCode: "TEN_TRIPS",
    badgeName: "Rising Star",
    badgeDescription: "Completed 10 trips",
    badgeIcon: "⭐",
    badgeCategory: BadgeCategory.MILESTONE,
    requiredTrips: 10,
    rarity: BadgeRarity.COMMON,
    points: 25,
  },
  {
    badgeCode: "FIVE_STAR_HOST",
    badgeName: "Five Star Host",
    badgeDescription: "Maintained 5.0 guest rating",
    badgeIcon: "🌟",
    badgeCategory: BadgeCategory.MILESTONE,
    requiredMetric: "guestRatingAverage",
    requiredValue: 5.0,
    requiredTrips: 20,
    rarity: BadgeRarity.EPIC,
    points: 100,
  },
];

/**
 * Check which badges a host is eligible for
 */
export async function checkBadgeEligibility(
  hostId: string,
  esgScore: ESGScore
): Promise<BadgeEarned[]> {
  // Get already earned badges
  const earnedBadges = await prisma.hostBadgeEarned.findMany({
    where: { hostId },
  });

  const earnedBadgeCodes = earnedBadges.map((b) => b.badgeCode);
  const newlyEarned: BadgeEarned[] = [];

  // Check each badge
  for (const badge of ALL_BADGES) {
    // Skip if already earned
    if (earnedBadgeCodes.includes(badge.badgeCode)) {
      continue;
    }

    // Check eligibility
    if (isBadgeEligible(badge, esgScore)) {
      // Award badge
      await awardBadge(hostId, badge.badgeCode);

      newlyEarned.push({
        badgeCode: badge.badgeCode,
        badgeName: badge.badgeName,
        badgeIcon: badge.badgeIcon,
        earnedAt: new Date(),
        rarity: badge.rarity,
      });
    }
  }

  return newlyEarned;
}

/**
 * Check if host meets badge requirements
 */
function isBadgeEligible(badge: Badge, esgScore: ESGScore): boolean {
  // Check required score
  if (badge.requiredScore && esgScore.compositeScore < badge.requiredScore) {
    return false;
  }

  // Check required trips
  if (badge.requiredTrips && esgScore.totalTrips < badge.requiredTrips) {
    return false;
  }

  // Check required streak
  if (
    badge.requiredStreak &&
    esgScore.currentIncidentStreak < badge.requiredStreak
  ) {
    return false;
  }

  // Check specific metric requirements
  if (badge.requiredMetric && badge.requiredValue !== undefined) {
    const metricValue = (esgScore as any)[badge.requiredMetric];

    // Handle "less than" requirements (like avgResponseTimeHours)
    if (badge.requiredMetric === "avgResponseTimeHours") {
      if (metricValue > badge.requiredValue) {
        return false;
      }
    } else {
      // Normal "greater than or equal" requirements
      if (metricValue < badge.requiredValue) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Award a badge to a host
 */
async function awardBadge(hostId: string, badgeCode: string): Promise<void> {
  try {
    await prisma.hostBadgeEarned.create({
      data: {
        hostId,
        badgeCode,
        earnedAt: new Date(),
      },
    });

    // Log event
    await prisma.eSGEvent.create({
      data: {
        hostId,
        eventType: "BADGE_EARNED",
        eventCategory: "GAMIFICATION",
        description: `Earned badge: ${badgeCode}`,
        metadata: {
          badgeCode,
        },
      },
    });
  } catch (error) {
    console.error(`Failed to award badge ${badgeCode} to host ${hostId}:`, error);
  }
}

/**
 * Get all badges earned by a host
 */
export async function getHostBadges(hostId: string): Promise<BadgeEarned[]> {
  const earnedBadges = await prisma.hostBadgeEarned.findMany({
    where: { hostId },
    orderBy: { earnedAt: "desc" },
  });

  return earnedBadges.map((earned) => {
    const badgeDefinition = ALL_BADGES.find(
      (b) => b.badgeCode === earned.badgeCode
    );

    return {
      badgeCode: earned.badgeCode,
      badgeName: badgeDefinition?.badgeName || earned.badgeCode,
      badgeIcon: badgeDefinition?.badgeIcon || "🏅",
      earnedAt: earned.earnedAt,
      rarity: badgeDefinition?.rarity || BadgeRarity.COMMON,
    };
  });
}

/**
 * Get next badge the host is close to earning
 */
export function getNextBadge(
  esgScore: ESGScore,
  earnedBadgeCodes: string[]
): Badge | null {
  // Filter out already earned badges
  const unearnedBadges = ALL_BADGES.filter(
    (b) => !earnedBadgeCodes.includes(b.badgeCode)
  );

  // Find closest badge
  let closestBadge: Badge | null = null;
  let closestProgress = 0;

  for (const badge of unearnedBadges) {
    const progress = calculateBadgeProgress(badge, esgScore);

    if (progress > closestProgress && progress < 100) {
      closestBadge = badge;
      closestProgress = progress;
    }
  }

  return closestBadge;
}

/**
 * Calculate progress toward a badge (0-100%)
 */
export function calculateBadgeProgress(
  badge: Badge,
  esgScore: ESGScore
): number {
  let progress = 100; // Start at 100%, reduce based on unmet requirements

  // Check score requirement
  if (badge.requiredScore) {
    const scoreProgress = (esgScore.compositeScore / badge.requiredScore) * 100;
    progress = Math.min(progress, scoreProgress);
  }

  // Check trip requirement
  if (badge.requiredTrips) {
    const tripProgress = (esgScore.totalTrips / badge.requiredTrips) * 100;
    progress = Math.min(progress, tripProgress);
  }

  // Check streak requirement
  if (badge.requiredStreak) {
    const streakProgress =
      (esgScore.currentIncidentStreak / badge.requiredStreak) * 100;
    progress = Math.min(progress, streakProgress);
  }

  // Check metric requirement
  if (badge.requiredMetric && badge.requiredValue !== undefined) {
    const metricValue = (esgScore as any)[badge.requiredMetric];

    // Handle "less than" requirements
    if (badge.requiredMetric === "avgResponseTimeHours") {
      const metricProgress = (badge.requiredValue / metricValue) * 100;
      progress = Math.min(progress, metricProgress);
    } else {
      const metricProgress = (metricValue / badge.requiredValue) * 100;
      progress = Math.min(progress, metricProgress);
    }
  }

  return Math.min(100, Math.max(0, progress));
}

/**
 * Seed initial badges into database
 */
export async function seedBadges(): Promise<void> {
  for (const badge of ALL_BADGES) {
    await prisma.eSGBadge.upsert({
      where: { badgeCode: badge.badgeCode },
      create: {
        badgeCode: badge.badgeCode,
        badgeName: badge.badgeName,
        badgeDescription: badge.badgeDescription,
        badgeIcon: badge.badgeIcon,
        badgeCategory: badge.badgeCategory,
        requiredScore: badge.requiredScore,
        requiredTrips: badge.requiredTrips,
        requiredStreak: badge.requiredStreak,
        requiredMetric: badge.requiredMetric,
        requiredValue: badge.requiredValue,
        rarity: badge.rarity,
        points: badge.points,
      },
      update: {
        badgeName: badge.badgeName,
        badgeDescription: badge.badgeDescription,
        badgeIcon: badge.badgeIcon,
        badgeCategory: badge.badgeCategory,
        requiredScore: badge.requiredScore,
        requiredTrips: badge.requiredTrips,
        requiredStreak: badge.requiredStreak,
        requiredMetric: badge.requiredMetric,
        requiredValue: badge.requiredValue,
        rarity: badge.rarity,
        points: badge.points,
      },
    });
  }

  console.log(`✅ Seeded ${ALL_BADGES.length} badges`);
}

/**
 * Get badge by code
 */
export function getBadgeByCode(badgeCode: string): Badge | undefined {
  return ALL_BADGES.find((b) => b.badgeCode === badgeCode);
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return ALL_BADGES.filter((b) => b.badgeCategory === category);
}

/**
 * Get badges by rarity
 */
export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return ALL_BADGES.filter((b) => b.rarity === rarity);
}

// ============================================================================
// ✅ EXPORT ALIAS FOR AUTO-UPDATE COMPATIBILITY
// ============================================================================

/**
 * Alias for checkBadgeEligibility - used by auto-update.ts
 * This provides compatibility with the event hooks system
 * 
 * @param hostId - The host ID
 * @param profile - ESG profile/score object (same as ESGScore)
 * @returns Array of newly earned badges
 */
export async function checkAndAwardBadges(
  hostId: string,
  profile: any
): Promise<BadgeEarned[]> {
  return checkBadgeEligibility(hostId, profile);
}