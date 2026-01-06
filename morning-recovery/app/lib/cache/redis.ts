import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create rate limiter
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '60 s'), // 100 requests per minute
  analytics: true,
})

// Cache functions
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get<T>(key)
    if (cached) {
      console.log(`Cache HIT: ${key}`)
    }
    return cached
  } catch (error) {
    console.error('Cache GET error:', error)
    return null
  }
}

export async function cacheSet(
  key: string, 
  value: any, 
  ttl: number = 3600 // 1 hour default
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl })
    console.log(`Cache SET: ${key} (TTL: ${ttl}s)`)
  } catch (error) {
    console.error('Cache SET error:', error)
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key)
    console.log(`Cache DELETE: ${key}`)
  } catch (error) {
    console.error('Cache DELETE error:', error)
  }
}

// Pattern-based cache invalidation
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log(`Cache INVALIDATED: ${keys.length} keys matching ${pattern}`)
    }
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

// Get cache stats
export async function getCacheStats() {
  const dbSize = await redis.dbsize()
  return {
    size: dbSize,
    connected: true,
    url: process.env.UPSTASH_REDIS_REST_URL?.split('@')[1] || 'unknown'
  }
}

export { redis }