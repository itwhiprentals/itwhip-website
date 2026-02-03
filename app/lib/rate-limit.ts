// File: app/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// ✅ LOGIN RATE LIMIT: 5 attempts per 15 minutes
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:login',
})

// ✅ API RATE LIMIT: 100 requests per minute
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
})

// ✅ MESSAGE RATE LIMIT: 20 messages per 5 minutes
export const messageRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '5 m'),
  analytics: true,
  prefix: 'ratelimit:message',
})

// ✅ PASSWORD RESET RATE LIMIT: 3 attempts per hour
export const passwordResetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:password-reset',
})

// ✅ PHONE SMS RATE LIMIT: 5 SMS attempts per 5 minutes per IP (prevent SMS spam)
export const phoneSMSRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '5 m'),
  analytics: true,
  prefix: 'ratelimit:phone-sms',
})

// ✅ PHONE LOGIN RATE LIMIT: 10 login attempts per 5 minutes per IP
export const phoneLoginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '5 m'),
  analytics: true,
  prefix: 'ratelimit:phone-login',
})

// ✅ VERIFY-LINK RATE LIMIT: 5 attempts per 10 minutes per token
export const verifyLinkRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  analytics: true,
  prefix: 'ratelimit:verify-link',
})

// ✅ VERIFY-LINK OTP SEND RATE LIMIT: 3 sends per 10 minutes per IP
export const verifyLinkOtpRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  analytics: true,
  prefix: 'ratelimit:verify-link-otp',
})

// Helper function to get client IP
export function getClientIp(request: Request): string {
  // Check common headers for real IP (when behind proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (cfConnectingIp) return cfConnectingIp
  if (realIp) return realIp
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return '127.0.0.1' // Fallback for local dev
}

// Helper to create rate limit response
export function createRateLimitResponse(reset: number, remaining: number) {
  const resetDate = new Date(reset)
  const retryAfter = Math.ceil((reset - Date.now()) / 1000)

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      retryAfter: retryAfter,
      resetAt: resetDate.toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetDate.toISOString(),
      },
    }
  )
}

// ✅ ADMIN FUNCTION: Reset rate limit for specific IP
export async function resetRateLimitForIp(ip: string): Promise<void> {
  const key = `ratelimit:login:login:${ip}`
  await redis.del(key)
  console.log(`✅ Rate limit reset for IP: ${ip}`)
}

// ✅ ADMIN FUNCTION: Reset all login rate limits
export async function resetAllLoginRateLimits(): Promise<number> {
  const keys = await redis.keys('ratelimit:login:*')
  if (keys.length === 0) return 0
  
  for (const key of keys) {
    await redis.del(key)
  }
  
  console.log(`✅ Reset ${keys.length} login rate limits`)
  return keys.length
}