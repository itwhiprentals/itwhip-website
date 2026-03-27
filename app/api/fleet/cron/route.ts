// app/api/fleet/cron/route.ts
// Dashboard API: returns cron job status, recent logs, and stats for the monitoring dashboard

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export const dynamic = 'force-dynamic'

// All known cron jobs with their schedules
// AWS EventBridge Scheduler → Lambda → API endpoint
const CRON_JOBS = [
  { name: 'system-cron', label: 'System Cron Suite', schedule: 'Daily midnight', color: '#64748b' },
  { name: 'expire-overdue-pickups', label: 'Expire Overdue Pickups', schedule: 'Every 10 min', color: '#f97316' },
  { name: 'noshow-detection', label: 'No-Show Detection', schedule: 'Every 10 min', color: '#ec4899' },
  { name: 'auto-complete', label: 'Auto-Complete Overdue', schedule: 'Every 10 min', color: '#8b5cf6' },
  { name: 'payment-deadline', label: 'Payment Deadline', schedule: 'Every 30 min', color: '#6366f1' },
  { name: 'host-acceptance-reminders', label: 'Host Acceptance', schedule: 'Every hour', color: '#22c55e' },
  { name: 'process-payouts', label: 'Process Payouts', schedule: 'Daily 2 AM', color: '#ef4444' },
]

export async function GET() {
  try {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get last 10 runs for each job (for mini charts)
    const recentLogs = await prisma.cronLog.findMany({
      where: { startedAt: { gte: sevenDaysAgo } },
      orderBy: { startedAt: 'desc' },
      take: 200,
    })

    // Get last 50 logs for activity feed
    const activityFeed = await prisma.cronLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
    })

    // Stats: last 24h
    const last24hLogs = recentLogs.filter(l => l.startedAt >= twentyFourHoursAgo)
    const totalRuns24h = last24hLogs.length
    const successRuns24h = last24hLogs.filter(l => l.status === 'success').length
    const failedRuns24h = last24hLogs.filter(l => l.status === 'error' || l.status === 'failed').length
    const totalProcessed24h = last24hLogs.reduce((sum, l) => sum + l.processed, 0)
    const avgDuration24h = last24hLogs.length > 0
      ? Math.round(last24hLogs.reduce((sum, l) => sum + (l.durationMs || 0), 0) / last24hLogs.length)
      : 0

    // Check if any job is currently running
    const runningJobs = await prisma.cronLog.findMany({
      where: { status: 'running' },
    })

    // Build per-job summaries
    const jobSummaries = CRON_JOBS.map(job => {
      const jobLogs = recentLogs
        .filter(l => l.jobName === job.name)
        .slice(0, 10)

      const lastRun = jobLogs[0] || null
      const isRunning = runningJobs.some(r => r.jobName === job.name)

      // Last 10 runs for mini chart
      const miniChart = jobLogs.map(l => ({
        status: l.status,
        durationMs: l.durationMs || 0,
        processed: l.processed,
        startedAt: l.startedAt.toISOString(),
      })).reverse() // oldest first for chart

      return {
        ...job,
        isRunning,
        lastRun: lastRun ? {
          id: lastRun.id,
          status: lastRun.status,
          startedAt: lastRun.startedAt.toISOString(),
          completedAt: lastRun.completedAt?.toISOString() || null,
          durationMs: lastRun.durationMs,
          processed: lastRun.processed,
          failed: lastRun.failed,
          error: lastRun.error,
          triggeredBy: lastRun.triggeredBy,
        } : null,
        miniChart,
      }
    })

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      stats: {
        totalRuns24h,
        successRuns24h,
        failedRuns24h,
        totalProcessed24h,
        avgDuration24h,
        runningCount: runningJobs.length,
      },
      jobs: jobSummaries,
      activityFeed: activityFeed.map(l => ({
        id: l.id,
        jobName: l.jobName,
        status: l.status,
        startedAt: l.startedAt.toISOString(),
        completedAt: l.completedAt?.toISOString() || null,
        durationMs: l.durationMs,
        processed: l.processed,
        failed: l.failed,
        error: l.error,
        triggeredBy: l.triggeredBy,
      })),
    })
  } catch (error) {
    console.error('[Fleet Cron API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to load cron data', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
