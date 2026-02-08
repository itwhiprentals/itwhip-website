// app/api/host/esg/history/route.ts
/**
 * ESG Score History API
 * Returns historical ESG scores for trend visualization
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// ============================================================================
// GET: Fetch ESG Score History
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30') // Default: last 30 snapshots
    const period = searchParams.get('period') || 'all' // 'week', 'month', 'quarter', 'year', 'all'

    // Calculate date range based on period
    let dateFilter: Date | undefined
    const now = new Date()

    switch (period) {
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        dateFilter = undefined
    }

    // Verify host exists
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: { id: true, name: true },
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Fetch snapshots
    const snapshots = await prisma.eSGSnapshot.findMany({
      where: {
        profileId: hostId,
        ...(dateFilter && { snapshotDate: { gte: dateFilter } }),
      },
      orderBy: {
        snapshotDate: 'asc',
      },
      take: limit,
      select: {
        id: true,
        compositeScore: true,
        drivingImpactScore: true,
        emissionsScore: true,
        maintenanceScore: true,
        safetyScore: true,
        complianceScore: true,
        snapshotDate: true,
        snapshotReason: true,
        triggerEventId: true,
      },
    })

    // If no snapshots, include current profile as single data point
    if (snapshots.length === 0) {
      const currentProfile = await prisma.hostESGProfile.findUnique({
        where: { hostId },
        select: {
          compositeScore: true,
          drivingImpactScore: true,
          emissionsScore: true,
          maintenanceScore: true,
          safetyScore: true,
          complianceScore: true,
          lastCalculatedAt: true,
        },
      })

      if (currentProfile) {
        return NextResponse.json({
          hostId,
          hostName: host.name,
          period,
          dataPoints: 1,
          history: [
            {
              date: currentProfile.lastCalculatedAt || new Date(),
              compositeScore: currentProfile.compositeScore,
              drivingImpactScore: currentProfile.drivingImpactScore,
              emissionsScore: currentProfile.emissionsScore,
              maintenanceScore: currentProfile.maintenanceScore,
              safetyScore: currentProfile.safetyScore,
              complianceScore: currentProfile.complianceScore,
              reason: 'CURRENT',
            },
          ],
          analysis: {
            trend: 'STABLE',
            changePercent: 0,
            highestScore: currentProfile.compositeScore,
            lowestScore: currentProfile.compositeScore,
            averageScore: currentProfile.compositeScore,
          },
        })
      }
    }

    // Calculate analytics
    const scores = snapshots.map((s) => s.compositeScore)
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length

    // Calculate trend
    let trend: 'IMPROVING' | 'DECLINING' | 'STABLE' = 'STABLE'
    let changePercent = 0

    if (snapshots.length >= 2) {
      const firstScore = snapshots[0].compositeScore
      const lastScore = snapshots[snapshots.length - 1].compositeScore
      changePercent = ((lastScore - firstScore) / firstScore) * 100

      if (changePercent > 5) {
        trend = 'IMPROVING'
      } else if (changePercent < -5) {
        trend = 'DECLINING'
      }
    }

    // Format history for response
    const history = snapshots.map((snapshot) => ({
      date: snapshot.snapshotDate,
      compositeScore: snapshot.compositeScore,
      drivingImpactScore: snapshot.drivingImpactScore,
      emissionsScore: snapshot.emissionsScore,
      maintenanceScore: snapshot.maintenanceScore,
      safetyScore: snapshot.safetyScore,
      complianceScore: snapshot.complianceScore,
      reason: snapshot.snapshotReason,
      eventId: snapshot.triggerEventId,
    }))

    // Get recent events that caused score changes
    const recentEvents = await prisma.eSGEvent.findMany({
      where: {
        hostId,
        createdAt: dateFilter ? { gte: dateFilter } : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        eventType: true,
        eventCategory: true,
        description: true,
        scoreChange: true,
        scoreAfter: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      hostId,
      hostName: host.name,
      period,
      dataPoints: snapshots.length,
      history,
      analysis: {
        trend,
        changePercent: Math.round(changePercent * 10) / 10,
        highestScore,
        lowestScore,
        averageScore: Math.round(averageScore),
      },
      recentEvents: recentEvents.map((event) => ({
        type: event.eventType,
        category: event.eventCategory,
        description: event.description,
        scoreChange: event.scoreChange,
        scoreAfter: event.scoreAfter,
        date: event.createdAt,
      })),
    })
  } catch (error) {
    console.error('❌ Error fetching ESG history:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch ESG history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST: Create Manual Snapshot
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get host ID from headers
    const hostId = request.headers.get('x-host-id')
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { reason, notes } = body

    // Get current profile
    const profile = await prisma.hostESGProfile.findUnique({
      where: { hostId },
      select: {
        compositeScore: true,
        drivingImpactScore: true,
        emissionsScore: true,
        maintenanceScore: true,
        safetyScore: true,
        complianceScore: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'ESG profile not found' },
        { status: 404 }
      )
    }

    // Create snapshot
    const snapshot = await prisma.eSGSnapshot.create({
      data: {
        id: crypto.randomUUID(),
        profileId: hostId,
        compositeScore: profile.compositeScore,
        drivingImpactScore: profile.drivingImpactScore,
        emissionsScore: profile.emissionsScore,
        maintenanceScore: profile.maintenanceScore,
        safetyScore: profile.safetyScore,
        complianceScore: profile.complianceScore,
        snapshotDate: new Date(),
        snapshotReason: reason || 'MANUAL_SNAPSHOT',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Snapshot created successfully',
      snapshot: {
        id: snapshot.id,
        date: snapshot.snapshotDate,
        compositeScore: snapshot.compositeScore,
        reason: snapshot.snapshotReason,
      },
    })
  } catch (error) {
    console.error('❌ Error creating snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to create snapshot' },
      { status: 500 }
    )
  }
}