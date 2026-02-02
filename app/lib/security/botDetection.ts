// Bot detection service with 1000+ signatures and confidence scoring
import { isbot } from 'isbot'
import UAParser from 'ua-parser-js'

export interface BotDetectionResult {
  isBot: boolean
  botName: string | null
  confidence: number  // 0-100
  reasons: string[]
}

/**
 * Comprehensive bot detection using multiple signals
 */
export function detectBot(userAgent: string, ip: string, headers: Headers): BotDetectionResult {
  const reasons: string[] = []
  let confidence = 0

  // ============================================================================
  // Check 1: isbot library (1000+ bot signatures)
  // ============================================================================
  if (isbot(userAgent)) {
    reasons.push('Known bot signature detected')
    confidence += 50
  }

  // ============================================================================
  // Check 2: Parse user agent
  // ============================================================================
  const ua = UAParser(userAgent)

  // Missing browser = likely bot
  if (!ua.browser.name) {
    reasons.push('No browser detected in user agent')
    confidence += 30
  }

  // Headless Chrome/PhantomJS = automation tool
  if (userAgent.includes('HeadlessChrome') || userAgent.includes('PhantomJS') || userAgent.includes('Puppeteer')) {
    reasons.push('Headless browser detected')
    confidence += 80
  }

  // Selenium = automation framework
  if (userAgent.includes('Selenium') || userAgent.includes('WebDriver')) {
    reasons.push('Automation framework detected')
    confidence += 90
  }

  // ============================================================================
  // Check 3: Missing common headers (real browsers always send these)
  // ============================================================================
  if (!headers.get('accept-language')) {
    reasons.push('Missing Accept-Language header')
    confidence += 20
  }

  if (!headers.get('accept-encoding')) {
    reasons.push('Missing Accept-Encoding header')
    confidence += 20
  }

  if (!headers.get('accept')) {
    reasons.push('Missing Accept header')
    confidence += 15
  }

  // ============================================================================
  // Check 4: Suspicious header order (bots often send headers alphabetically)
  // ============================================================================
  const headerKeys = Array.from(headers.keys())
  const isSorted = headerKeys.slice().sort().every((key, i) => key === headerKeys[i])
  if (isSorted && headerKeys.length > 5) {
    reasons.push('Headers in alphabetical order (bot-like)')
    confidence += 25
  }

  // ============================================================================
  // Check 5: Old/unusual browser versions
  // ============================================================================
  const browserVersion = parseFloat(ua.browser.version || '0')

  if (ua.browser.name === 'Chrome' && browserVersion > 0 && browserVersion < 90) {
    reasons.push(`Outdated ${ua.browser.name} version ${browserVersion}`)
    confidence += 15
  }

  if (ua.browser.name === 'Firefox' && browserVersion > 0 && browserVersion < 80) {
    reasons.push(`Outdated ${ua.browser.name} version ${browserVersion}`)
    confidence += 15
  }

  // ============================================================================
  // Check 6: Common bot user agent patterns
  // ============================================================================
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java/i,
    /okhttp/i, /axios/i, /fetch/i
  ]

  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      reasons.push(`Bot pattern matched: ${pattern.source}`)
      confidence += 10
      break // Only count once
    }
  }

  // ============================================================================
  // Check 7: Empty or suspicious user agent
  // ============================================================================
  if (!userAgent || userAgent.trim() === '') {
    reasons.push('Empty user agent')
    confidence += 40
  }

  if (userAgent.length < 20) {
    reasons.push('Suspiciously short user agent')
    confidence += 25
  }

  // ============================================================================
  // Check 8: Known crawler IPs (datacenter ranges)
  // ============================================================================
  // This would integrate with geolocation isDatacenter flag
  // Handled separately in main security check

  // ============================================================================
  // Result
  // ============================================================================
  return {
    isBot: confidence >= 50,  // 50%+ confidence = bot
    botName: isbot(userAgent) ? extractBotName(userAgent) : null,
    confidence: Math.min(confidence, 100),
    reasons
  }
}

/**
 * Extract bot name from user agent
 */
function extractBotName(userAgent: string): string {
  // Try to extract bot name from common patterns
  const botNameMatch = userAgent.match(/\b(bot|crawler|spider|scraper)[\w-]*/i)
  if (botNameMatch) {
    return botNameMatch[0]
  }

  // Known bots
  if (userAgent.includes('Googlebot')) return 'Googlebot'
  if (userAgent.includes('Bingbot')) return 'Bingbot'
  if (userAgent.includes('Slurp')) return 'Yahoo Slurp'
  if (userAgent.includes('DuckDuckBot')) return 'DuckDuckBot'
  if (userAgent.includes('Baiduspider')) return 'Baiduspider'
  if (userAgent.includes('YandexBot')) return 'YandexBot'
  if (userAgent.includes('facebookexternalhit')) return 'Facebook Bot'
  if (userAgent.includes('Twitterbot')) return 'Twitterbot'
  if (userAgent.includes('LinkedInBot')) return 'LinkedInBot'

  return 'Unknown Bot'
}

/**
 * Check if request is from a legitimate search engine bot
 */
export function isLegitimateBot(userAgent: string, ip: string): boolean {
  const legitimateBots = [
    'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot',
    'Baiduspider', 'YandexBot', 'facebookexternalhit',
    'Twitterbot', 'LinkedInBot', 'Discordbot'
  ]

  return legitimateBots.some(bot => userAgent.includes(bot))
}
