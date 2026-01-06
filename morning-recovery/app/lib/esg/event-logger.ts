// app/lib/esg/event-logger.ts
/**
 * ESG Event Logger
 * Logs all ESG-related events to the database for audit trails
 */

import prisma from '@/app/lib/database/prisma'
import { ESGEventData } from './event-hooks'

// ============================================================================
// LOG ESG EVENT TO DATABASE
// ============================================================================

/**
 * Log an ESG event to the database
 */
export async function logESGEvent(eventData: ESGEventData): Promise<string | null> {
  try {
    console.log(`📝 Logging ESG Event: ${eventData.eventType} for host ${eventData.hostId}`)

    const event = await prisma.eSGEvent.create({
      data: {
        hostId: eventData.hostId,
        eventType: eventData.eventType,
        eventCategory: eventData.eventCategory,
        description: eventData.description,
        metadata: eventData.metadata || {},
        relatedTripId: eventData.relatedTripId,
        relatedClaimId: eventData.relatedClaimId,
        relatedBookingId: eventData.relatedBookingId,
        // Score changes will be updated by auto-update.ts after calculation
        scoreBefore: null,
        scoreAfter: null,
        scoreChange: null,
      },
    })

    console.log(`✅ ESG Event Logged: ${event.id}`)
    return event.id
  } catch (error) {
    console.error(`❌ Error logging ESG event:`, error)
    return null
  }
}

// ============================================================================
// UPDATE EVENT WITH SCORE CHANGES
// ============================================================================

/**
 * Update an ESG event with score changes after calculation
 */
export async function updateEventWithScores(
  eventId: string,
  scoreBefore: number,
  scoreAfter: number
): Promise<void> {
  try {
    const scoreChange = scoreAfter - scoreBefore

    await prisma.eSGEvent.update({
      where: { id: eventId },
      data: {
        scoreBefore,
        scoreAfter,
        scoreChange,
      },
    })

    console.log(
      `📊 Score change logged: ${scoreBefore} → ${scoreAfter} (${scoreChange >= 0 ? '+' : ''}${scoreChange})`
    )
  } catch (error) {
    console.error(`❌ Error updating event with scores:`, error)
  }
}

// ============================================================================
// RETRIEVE EVENT HISTORY
// ============================================================================

/**
 * Get event history for a host
 */
export async function getEventHistory(
  hostId: string,
  options: {
    limit?: number
    eventType?: string
    eventCategory?: string
    startDate?: Date
    endDate?: Date
  } = {}
) {
  try {
    const where: any = { hostId }

    if (options.eventType) {
      where.eventType = options.eventType
    }

    if (options.eventCategory) {
      where.eventCategory = options.eventCategory
    }

    if (options.startDate || options.endDate) {
      where.createdAt = {}
      if (options.startDate) {
        where.createdAt.gte = options.startDate
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate
      }
    }

    const events = await prisma.eSGEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
    })

    return events
  } catch (error) {
    console.error(`❌ Error fetching event history:`, error)
    return []
  }
}

// ============================================================================
// GET EVENTS IN DATE RANGE
// ============================================================================

/**
 * Get events within a specific date range
 */
export async function getEventsInDateRange(
  startDate: Date,
  endDate: Date,
  options: {
    hostId?: string
    eventType?: string
    eventCategory?: string
  } = {}
) {
  try {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (options.hostId) {
      where.hostId = options.hostId
    }

    if (options.eventType) {
      where.eventType = options.eventType
    }

    if (options.eventCategory) {
      where.eventCategory = options.eventCategory
    }

    const events = await prisma.eSGEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return events
  } catch (error) {
    console.error(`❌ Error fetching events in date range:`, error)
    return []
  }
}

// ============================================================================
// GET EVENT STATISTICS
// ============================================================================

/**
 * Get event statistics for a host
 */
export async function getEventStats(hostId: string) {
  try {
    const [totalEvents, eventsByType, eventsByCategory, recentEvents] = await Promise.all([
      // Total events count
      prisma.eSGEvent.count({
        where: { hostId },
      }),

      // Events grouped by type
      prisma.eSGEvent.groupBy({
        by: ['eventType'],
        where: { hostId },
        _count: { eventType: true },
      }),

      // Events grouped by category
      prisma.eSGEvent.groupBy({
        by: ['eventCategory'],
        where: { hostId },
        _count: { eventCategory: true },
      }),

      // Recent events (last 30 days)
      prisma.eSGEvent.count({
        where: {
          hostId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return {
      totalEvents,
      eventsByType: eventsByType.reduce((acc: any, item) => {
        acc[item.eventType] = item._count.eventType
        return acc
      }, {}),
      eventsByCategory: eventsByCategory.reduce((acc: any, item) => {
        acc[item.eventCategory] = item._count.eventCategory
        return acc
      }, {}),
      recentEvents,
    }
  } catch (error) {
    console.error(`❌ Error fetching event stats:`, error)
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByCategory: {},
      recentEvents: 0,
    }
  }
}

// ============================================================================
// GET LATEST EVENT FOR HOST
// ============================================================================

/**
 * Get the most recent event for a host
 */
export async function getLatestEvent(hostId: string, eventType?: string) {
  try {
    const where: any = { hostId }
    if (eventType) {
      where.eventType = eventType
    }

    const event = await prisma.eSGEvent.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return event
  } catch (error) {
    console.error(`❌ Error fetching latest event:`, error)
    return null
  }
}

// ============================================================================
// CLEANUP OLD EVENTS (OPTIONAL - FOR MAINTENANCE)
// ============================================================================

/**
 * Delete events older than specified days (for cleanup/maintenance)
 * Recommended: Run this as a scheduled job monthly
 */
export async function cleanupOldEvents(olderThanDays: number = 365) {
  try {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)

    const result = await prisma.eSGEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    console.log(`🧹 Cleaned up ${result.count} old ESG events (older than ${olderThanDays} days)`)
    return result.count
  } catch (error) {
    console.error(`❌ Error cleaning up old events:`, error)
    return 0
  }
}

// ============================================================================
// GET EVENT BY ID
// ============================================================================

/**
 * Get a specific event by ID
 */
export async function getEventById(eventId: string) {
  try {
    const event = await prisma.eSGEvent.findUnique({
      where: { id: eventId },
    })

    return event
  } catch (error) {
    console.error(`❌ Error fetching event by ID:`, error)
    return null
  }
}