// app/lib/ai-booking/security.ts
// Security layer for Choé AI booking assistant

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { detectBot } from '@/app/lib/security/botDetection'
import { NextRequest, NextResponse } from 'next/server'

// =============================================================================
// REDIS CLIENT (shared with other rate limiters)
// =============================================================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// =============================================================================
// RATE LIMITERS FOR AI CHAT
// =============================================================================

// Per-IP limit: 30 messages per 5 minutes (generous but protective)
export const aiChatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '5 m'),
  analytics: true,
  prefix: 'ratelimit:ai-chat',
})

// Per-session limit: 100 messages per hour (prevents runaway sessions)
export const aiSessionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true,
  prefix: 'ratelimit:ai-session',
})

// Daily cost protection: 500 API calls per day per IP
export const aiDailyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(500, '24 h'),
  analytics: true,
  prefix: 'ratelimit:ai-daily',
})

// =============================================================================
// SECURITY CONFIGURATION
// =============================================================================

export const AI_SECURITY_CONFIG = {
  // Message limits
  MAX_MESSAGE_LENGTH: 500,        // Max chars per message
  MAX_SESSION_MESSAGES: 50,       // Max messages per session before reset

  // Suspicious patterns (potential prompt injection)
  BLOCKED_PATTERNS: [
    /ignore.*previous.*instructions/i,
    /disregard.*system.*prompt/i,
    /you.*are.*now/i,
    /pretend.*you.*are/i,
    /act.*as.*if/i,
    /override.*rules/i,
    /jailbreak/i,
    /dan.*mode/i,
    /developer.*mode/i,
    /bypass.*restrictions/i,
    /reveal.*system.*prompt/i,
    /show.*instructions/i,
  ],

  // Allowed (booking-related) topics
  ALLOWED_TOPICS: [
    'car', 'vehicle', 'rental', 'book', 'reserve',
    'date', 'time', 'location', 'phoenix', 'scottsdale', 'tempe', 'mesa',
    'price', 'cost', 'rate', 'deposit', 'fee',
    'suv', 'sedan', 'tesla', 'bmw', 'luxury', 'exotic',
    'pickup', 'dropoff', 'airport', 'hotel',
    'weather', 'available', 'show', 'find', 'search',
  ],
}

// =============================================================================
// SECURITY CHECK RESULT
// =============================================================================

export interface AISecurityCheckResult {
  allowed: boolean
  reason?: string
  rateLimit?: {
    remaining: number
    reset: Date
  }
}

// =============================================================================
// MAIN SECURITY CHECK FUNCTION
// =============================================================================

export async function checkAISecurity(
  request: NextRequest,
  message: string,
  sessionMessageCount: number
): Promise<AISecurityCheckResult> {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || ''

  // ==========================================================================
  // 1. BOT DETECTION
  // ==========================================================================
  const botCheck = detectBot(userAgent, ip, request.headers)
  if (botCheck.isBot && botCheck.confidence >= 70) {
    await logSecurityEvent('bot_detected', ip, {
      confidence: botCheck.confidence,
      reasons: botCheck.reasons,
      userAgent,
    })
    return {
      allowed: false,
      reason: 'Automated requests are not allowed',
    }
  }

  // ==========================================================================
  // 2. RATE LIMITING (per-IP)
  // ==========================================================================
  const ipLimit = await aiChatRateLimit.limit(ip)
  if (!ipLimit.success) {
    await logSecurityEvent('rate_limit_exceeded', ip, { type: 'ip' })
    return {
      allowed: false,
      reason: 'Too many requests. Please wait a moment.',
      rateLimit: {
        remaining: ipLimit.remaining,
        reset: new Date(ipLimit.reset),
      },
    }
  }

  // ==========================================================================
  // 3. DAILY LIMIT CHECK
  // ==========================================================================
  const dailyLimit = await aiDailyRateLimit.limit(ip)
  if (!dailyLimit.success) {
    await logSecurityEvent('daily_limit_exceeded', ip, {})
    return {
      allowed: false,
      reason: 'Daily limit reached. Please try again tomorrow.',
      rateLimit: {
        remaining: dailyLimit.remaining,
        reset: new Date(dailyLimit.reset),
      },
    }
  }

  // ==========================================================================
  // 4. MESSAGE LENGTH CHECK
  // ==========================================================================
  if (message.length > AI_SECURITY_CONFIG.MAX_MESSAGE_LENGTH) {
    await logSecurityEvent('message_too_long', ip, { length: message.length })
    return {
      allowed: false,
      reason: `Message too long. Please keep it under ${AI_SECURITY_CONFIG.MAX_MESSAGE_LENGTH} characters.`,
    }
  }

  // ==========================================================================
  // 5. SESSION MESSAGE LIMIT
  // ==========================================================================
  if (sessionMessageCount >= AI_SECURITY_CONFIG.MAX_SESSION_MESSAGES) {
    await logSecurityEvent('session_limit', ip, { count: sessionMessageCount })
    return {
      allowed: false,
      reason: 'Session limit reached. Please start a new conversation.',
    }
  }

  // ==========================================================================
  // 6. PROMPT INJECTION DETECTION
  // ==========================================================================
  const lowerMessage = message.toLowerCase()
  for (const pattern of AI_SECURITY_CONFIG.BLOCKED_PATTERNS) {
    if (pattern.test(message)) {
      await logSecurityEvent('prompt_injection_attempt', ip, {
        pattern: pattern.toString(),
        message: message.substring(0, 100),
      })
      return {
        allowed: false,
        reason: "I can only help with car rentals. What kind of vehicle are you looking for?",
      }
    }
  }

  // ==========================================================================
  // 7. EMPTY OR NONSENSE MESSAGE
  // ==========================================================================
  if (message.trim().length < 2) {
    return {
      allowed: false,
      reason: 'Please tell me what kind of car you need!',
    }
  }

  // All checks passed
  return { allowed: true }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')

  if (cfIp) return cfIp
  if (realIp) return realIp
  if (forwarded) return forwarded.split(',')[0].trim()

  return '127.0.0.1'
}

async function logSecurityEvent(
  event: string,
  ip: string,
  details: Record<string, unknown>
): Promise<void> {
  try {
    // Log to Redis for real-time monitoring
    const key = `ai-security:${event}:${new Date().toISOString().split('T')[0]}`
    await redis.hincrby(key, ip, 1)
    await redis.expire(key, 86400 * 7) // Keep 7 days

    // Console log for immediate visibility
    console.warn(`[AI-SECURITY] ${event}`, { ip, ...details })

    // TODO: Could also write to SecurityEvent table for persistent audit log
  } catch (error) {
    console.error('[AI-SECURITY] Failed to log event:', error)
  }
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

export function createSecurityBlockedResponse(result: AISecurityCheckResult): NextResponse {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (result.rateLimit) {
    const retryAfter = Math.ceil((result.rateLimit.reset.getTime() - Date.now()) / 1000)
    headers['Retry-After'] = retryAfter.toString()
    headers['X-RateLimit-Remaining'] = result.rateLimit.remaining.toString()
    headers['X-RateLimit-Reset'] = result.rateLimit.reset.toISOString()
  }

  return NextResponse.json(
    {
      error: result.reason || 'Request blocked',
      type: 'security_block'
    },
    {
      status: result.rateLimit ? 429 : 400,
      headers,
    }
  )
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  checkAISecurity,
  createSecurityBlockedResponse,
  AI_SECURITY_CONFIG,
}
