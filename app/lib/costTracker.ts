// app/lib/costTracker.ts
// Track cost of every external API call for billing + analytics

import { prisma } from '@/app/lib/database/prisma'

// Known costs per action
export const COST_TABLE: Record<string, number> = {
  SMS_SENT: 0.0079,           // Twilio per message
  PUSH_SENT: 0.00,            // Free (track volume)
  EMAIL_SENT: 0.001,          // Resend estimate
  STRIPE_IDENTITY: 1.50,      // Per verification
  FIREBASE_PHONE: 0.00,       // Free under 10K/month
  S3_UPLOAD_MB: 0.0004,       // ~$0.023/GB
}

export async function logCost(
  action: string,
  cost: number,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await prisma.costLog.create({
      data: { action, cost, userId, metadata: metadata || undefined },
    })
  } catch (err) {
    console.error('[CostTracker] Failed to log:', action, err)
  }
}

// Convenience: log Choé conversation cost from token usage
export async function logChoeCost(
  inputTokens: number,
  outputTokens: number,
  model: string,
  userId?: string
): Promise<void> {
  // Haiku pricing (per 1M tokens)
  const PRICING: Record<string, { input: number; output: number }> = {
    'claude-haiku-4-5-20251001': { input: 1.00, output: 5.00 },
    'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
    'claude-opus-4-6': { input: 15.00, output: 75.00 },
  }
  const price = PRICING[model] || PRICING['claude-haiku-4-5-20251001']
  const cost = (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output

  await logCost('CHOE_CONVERSATION', cost, userId, {
    model, inputTokens, outputTokens,
  })
}

// Log S3 upload cost based on file size
export async function logS3Cost(fileSizeBytes: number, userId?: string): Promise<void> {
  const sizeMB = fileSizeBytes / (1024 * 1024)
  await logCost('S3_UPLOAD', sizeMB * COST_TABLE.S3_UPLOAD_MB, userId, { sizeMB: Math.round(sizeMB * 100) / 100 })
}

// Get cost summary for a period
export async function getCostSummary(startDate: Date, endDate: Date) {
  const logs = await prisma.costLog.groupBy({
    by: ['action'],
    where: { createdAt: { gte: startDate, lte: endDate } },
    _sum: { cost: true },
    _count: true,
  })

  const total = logs.reduce((sum, l) => sum + (l._sum.cost || 0), 0)

  return {
    total: Math.round(total * 100) / 100,
    breakdown: logs.map(l => ({
      action: l.action,
      cost: Math.round((l._sum.cost || 0) * 100) / 100,
      count: l._count,
    })),
    period: { start: startDate, end: endDate },
  }
}
