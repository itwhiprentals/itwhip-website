// app/lib/upload/rate-limiter.ts
// Shared upload rate limiter — prevents abuse across all upload endpoints

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Per-user upload rate limiter: 50 uploads per day per user
const uploadRateLimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }),
  limiter: Ratelimit.slidingWindow(50, '1 d'), // 50 uploads per day
  analytics: true,
  prefix: 'ratelimit:upload',
})

// Per-IP upload rate limiter for unauthenticated endpoints: 10/hour
const uploadIpRateLimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads per hour per IP
  analytics: true,
  prefix: 'ratelimit:upload-ip',
})

/**
 * Check upload rate limit for an authenticated user.
 * Returns { allowed, remaining, resetAt } or throws with limit info.
 */
export async function checkUploadRateLimit(userId: string): Promise<{
  allowed: boolean
  remaining: number
  resetAt: number
}> {
  const { success, remaining, reset } = await uploadRateLimit.limit(userId)
  return { allowed: success, remaining, resetAt: reset }
}

/**
 * Check upload rate limit by IP address (for unauthenticated endpoints).
 */
export async function checkUploadIpRateLimit(ip: string): Promise<{
  allowed: boolean
  remaining: number
  resetAt: number
}> {
  const { success, remaining, reset } = await uploadIpRateLimit.limit(ip)
  return { allowed: success, remaining, resetAt: reset }
}
