// app/lib/ai-booking/security.ts
// Security layer for Choé AI booking assistant
// Uses database settings from ChoeAISettings table

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { detectBot } from '@/app/lib/security/botDetection'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { getRateLimitConfig, isChoeEnabled } from './choe-settings'

// =============================================================================
// REDIS CLIENT (shared with other rate limiters)
// =============================================================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// =============================================================================
// DYNAMIC RATE LIMITERS (created based on DB settings)
// =============================================================================

// Cache for rate limiters to avoid recreating on every request
let cachedRateLimiters: {
  chat: Ratelimit
  daily: Ratelimit
  config: { messagesPerWindow: number; rateLimitWindowMins: number; dailyApiLimit: number }
} | null = null

async function getRateLimiters() {
  const config = await getRateLimitConfig()

  // Check if we need to recreate limiters (config changed)
  if (
    cachedRateLimiters &&
    cachedRateLimiters.config.messagesPerWindow === config.messagesPerWindow &&
    cachedRateLimiters.config.rateLimitWindowMins === config.rateLimitWindowMins &&
    cachedRateLimiters.config.dailyApiLimit === config.dailyApiLimit
  ) {
    return cachedRateLimiters
  }

  // Create new rate limiters with current DB settings
  cachedRateLimiters = {
    chat: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.messagesPerWindow, `${config.rateLimitWindowMins} m`),
      analytics: true,
      prefix: 'ratelimit:ai-chat',
    }),
    daily: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.dailyApiLimit, '24 h'),
      analytics: true,
      prefix: 'ratelimit:ai-daily',
    }),
    config,
  }

  return cachedRateLimiters
}

// =============================================================================
// SECURITY CONFIGURATION (fallback defaults, overridden by DB)
// =============================================================================

export const AI_SECURITY_CONFIG = {
  // Fallback limits (DB settings take priority via getRateLimitConfig())
  MAX_MESSAGE_LENGTH: 200,        // Max chars per message (matches DB default)
  MAX_SESSION_MESSAGES: 30,       // Max messages per session (matches DB default)

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

  // Content moderation patterns (abusive, sexual, threatening content)
  // Follows Anthropic's content moderation guide: pre-screen before Claude API call
  CONTENT_MODERATION_PATTERNS: [
    // Sexual content / solicitation
    { pattern: /\b(sex|fuck|pussy|dick|cock|anal|blowjob|handjob|nude|naked|porn)\b/i, category: 'sexual_content' as const },
    { pattern: /\b(tits|boobs|ass\s*hole|orgasm|masturbat|erotic)\b/i, category: 'sexual_content' as const },
    { pattern: /\bwanna\s*(fuck|bang|screw|hook\s*up)\b/i, category: 'sexual_content' as const },
    { pattern: /\b(send\s*nudes|show\s*me\s*your\s*body|take\s*off)\b/i, category: 'sexual_content' as const },
    // Harassment / slurs / degrading language
    { pattern: /\b(nigger|nigga|faggot|retard|spic|chink|kike)\b/i, category: 'harassment' as const },
    { pattern: /\b(kill\s*yourself|go\s*die|hope\s*you\s*die)\b/i, category: 'threats' as const },
    { pattern: /\b(stupid\s*(bitch|bot|ai)|dumb\s*(bitch|bot|ai)|worthless\s*(bitch|bot|ai))\b/i, category: 'harassment' as const },
    { pattern: /\b(shut\s*the\s*fuck\s*up|stfu)\b/i, category: 'harassment' as const },
    // Threats / violence
    { pattern: /\b(i('ll|m\s*going\s*to|will)\s*(kill|shoot|stab|hurt|bomb|attack))\b/i, category: 'threats' as const },
    { pattern: /\b(gonna\s*(kill|shoot|stab|hurt|bomb|attack))\b/i, category: 'threats' as const },
    { pattern: /\b(blow\s*up|shoot\s*up|burn\s*down)\b/i, category: 'threats' as const },
    { pattern: /\b(where\s*do\s*you\s*live|find\s*you|come\s*for\s*you)\b/i, category: 'threats' as const },
  ] as { pattern: RegExp; category: 'sexual_content' | 'harassment' | 'threats' }[],

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
  sessionMessageCount: number,
  visitorId?: string,
  sessionId?: string
): Promise<AISecurityCheckResult> {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || ''

  // ==========================================================================
  // 0. CHECK IF CHOÉ IS ENABLED
  // ==========================================================================
  const enabled = await isChoeEnabled()
  if (!enabled) {
    return {
      allowed: false,
      reason: 'AI assistant is temporarily unavailable. Please use classic search.',
    }
  }

  // Get rate limit config from database
  const rateLimitConfig = await getRateLimitConfig()
  const rateLimiters = await getRateLimiters()

  // ==========================================================================
  // 1. BOT DETECTION
  // ==========================================================================
  const botCheck = detectBot(userAgent, ip, request.headers)
  if (botCheck.isBot && botCheck.confidence >= 70) {
    await logSecurityEvent('bot_detected', ip, {
      confidence: botCheck.confidence,
      reasons: botCheck.reasons,
      userAgent,
    }, visitorId, sessionId, true)
    return {
      allowed: false,
      reason: 'Automated requests are not allowed',
    }
  }

  // ==========================================================================
  // 2. RATE LIMITING (per-IP) - Uses DB settings
  // ==========================================================================
  const ipLimit = await rateLimiters.chat.limit(ip)
  if (!ipLimit.success) {
    await logSecurityEvent('rate_limit', ip, { type: 'ip' }, visitorId, sessionId, true)
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
  // 3. DAILY LIMIT CHECK - Uses DB settings
  // ==========================================================================
  const dailyLimit = await rateLimiters.daily.limit(ip)
  if (!dailyLimit.success) {
    await logSecurityEvent('rate_limit', ip, { type: 'daily' }, visitorId, sessionId, true)
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
  // 4. MESSAGE LENGTH CHECK - Uses DB settings
  // ==========================================================================
  if (message.length > rateLimitConfig.maxMessageLength) {
    await logSecurityEvent('message_length', ip, { length: message.length }, visitorId, sessionId, false)
    return {
      allowed: false,
      reason: `Message too long. Please keep it under ${rateLimitConfig.maxMessageLength} characters.`,
    }
  }

  // ==========================================================================
  // 5. SESSION MESSAGE LIMIT - Uses DB settings
  // ==========================================================================
  if (sessionMessageCount >= rateLimitConfig.sessionMessageLimit) {
    await logSecurityEvent('session_limit', ip, { count: sessionMessageCount }, visitorId, sessionId, false)
    return {
      allowed: false,
      reason: 'Session limit reached. Please start a new conversation.',
    }
  }

  // ==========================================================================
  // 6. PROMPT INJECTION DETECTION
  // ==========================================================================
  for (const pattern of AI_SECURITY_CONFIG.BLOCKED_PATTERNS) {
    if (pattern.test(message)) {
      await logSecurityEvent('prompt_injection', ip, {
        pattern: pattern.toString(),
        message: message.substring(0, 100),
      }, visitorId, sessionId, true)
      return {
        allowed: false,
        reason: "I can only help with car rentals. What kind of vehicle are you looking for?",
      }
    }
  }

  // ==========================================================================
  // 6.5 CONTENT MODERATION (sexual, harassment, threats)
  // ==========================================================================
  for (const { pattern, category } of AI_SECURITY_CONFIG.CONTENT_MODERATION_PATTERNS) {
    if (pattern.test(message)) {
      await logSecurityEvent('content_moderation', ip, {
        category,
        pattern: pattern.toString(),
        message: message.substring(0, 100),
      }, visitorId, sessionId, true)
      return {
        allowed: false,
        reason: "I can only help with car rentals. Please keep our conversation respectful.",
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
  eventType: string,
  ip: string,
  details: Record<string, unknown>,
  visitorId?: string,
  sessionId?: string,
  blocked: boolean = false
): Promise<void> {
  try {
    // Determine severity based on event type
    let severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO'
    if (eventType === 'prompt_injection' || eventType === 'bot_detected' || eventType === 'content_moderation' || eventType === 'session_terminated') {
      severity = 'CRITICAL'
    } else if (eventType === 'rate_limit' || eventType === 'session_limit') {
      severity = 'WARNING'
    }

    // Log to Redis for real-time monitoring (legacy)
    const key = `ai-security:${eventType}:${new Date().toISOString().split('T')[0]}`
    await redis.hincrby(key, ip, 1)
    await redis.expire(key, 86400 * 7) // Keep 7 days

    // Log to database for persistent audit (ChoeAISecurityEvent table)
    await prisma.choeAISecurityEvent.create({
      data: {
        eventType,
        severity,
        ipAddress: ip,
        visitorId: visitorId || null,
        sessionId: sessionId || null,
        details: details as object,
        blocked,
      }
    })

    // Console log for immediate visibility
    console.warn(`[AI-SECURITY] ${eventType}`, { ip, severity, blocked, ...details })
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
