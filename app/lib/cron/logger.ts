// app/lib/cron/logger.ts
// Structured logging for cron jobs — creates CronLog records for monitoring dashboard

import { prisma } from '@/app/lib/database/prisma'

export interface CronLogHandle {
  logId: string
  startTime: number
  complete: (result: {
    processed?: number
    failed?: number
    details?: Record<string, unknown>
  }) => Promise<void>
  fail: (error: string, details?: Record<string, unknown>) => Promise<void>
}

/**
 * Start a cron log entry. Returns a handle with complete() and fail() methods.
 *
 * Usage:
 *   const log = await startCronLog('noshow-detection', 'cron')
 *   try {
 *     // ... do work ...
 *     await log.complete({ processed: 3, failed: 0, details: { ... } })
 *   } catch (err) {
 *     await log.fail(err.message)
 *   }
 */
export async function startCronLog(
  jobName: string,
  triggeredBy: 'cron' | 'manual' | 'master' = 'cron'
): Promise<CronLogHandle> {
  const startTime = Date.now()

  const record = await prisma.cronLog.create({
    data: {
      jobName,
      status: 'running',
      triggeredBy,
      processed: 0,
      failed: 0,
    }
  })

  return {
    logId: record.id,
    startTime,
    complete: async ({ processed = 0, failed = 0, details }) => {
      const durationMs = Date.now() - startTime
      await prisma.cronLog.update({
        where: { id: record.id },
        data: {
          status: failed > 0 && processed === 0 ? 'failed' : 'success',
          completedAt: new Date(),
          durationMs,
          processed,
          failed,
          details: details as Record<string, unknown> | undefined,
        }
      })
    },
    fail: async (error: string, details?: Record<string, unknown>) => {
      const durationMs = Date.now() - startTime
      await prisma.cronLog.update({
        where: { id: record.id },
        data: {
          status: 'error',
          completedAt: new Date(),
          durationMs,
          error,
          details: details as Record<string, unknown> | undefined,
        }
      })
    }
  }
}
