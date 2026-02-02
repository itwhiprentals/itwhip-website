// Bot detection service with 1000+ signatures and confidence scoring
import { isbot } from 'isbot'
import { UAParser } from 'ua-parser-js'

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
  const parser = new UAParser(userAgent)
  const ua = parser.getResult()

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
 * Check if request is from a legitimate search engine bot.
 * Uses reverse DNS + forward DNS verification (Google's recommended method).
 * Falls back to user agent check if DNS lookup fails.
 */
export async function isLegitimateBot(userAgent: string, ip: string): Promise<boolean> {
  const legitimateBots = [
    'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot',
    'Baiduspider', 'YandexBot', 'facebookexternalhit',
    'Twitterbot', 'LinkedInBot', 'Discordbot'
  ]

  // First check: does the UA even claim to be a known bot?
  const claimsBot = legitimateBots.some(bot => userAgent.includes(bot))
  if (!claimsBot) return false

  // Second check: verify via reverse DNS (cached, non-blocking)
  try {
    const verified = await verifyBotIp(ip, userAgent)
    if (verified !== null) return verified
  } catch {
    // DNS failed — fall back to UA check
  }

  return true // Trust the UA claim if DNS is unavailable
}

// In-memory cache for bot DNS verification (10 min TTL)
const botDnsCache = new Map<string, { result: boolean; expires: number }>()
const BOT_DNS_CACHE_TTL = 10 * 60 * 1000

// Map bot names to their valid reverse DNS domains
const botDomains: Record<string, string[]> = {
  'Googlebot': ['googlebot.com', 'google.com', 'googleusercontent.com'],
  'Bingbot': ['search.msn.com'],
  'Baiduspider': ['baidu.com', 'baidu.jp'],
  'YandexBot': ['yandex.ru', 'yandex.net', 'yandex.com'],
}

/**
 * Verify bot IP via reverse DNS + forward DNS lookup.
 * Returns true if verified, false if spoofed, null if DNS unavailable.
 */
async function verifyBotIp(ip: string, userAgent: string): Promise<boolean | null> {
  // Check cache
  const cached = botDnsCache.get(ip)
  if (cached && cached.expires > Date.now()) return cached.result

  // Only do DNS verification for bots we have domain lists for
  const botName = Object.keys(botDomains).find(name => userAgent.includes(name))
  if (!botName) return null // No domain list — can't verify, trust UA

  try {
    const dns = await import('dns')
    const dnsPromises = dns.promises

    // Step 1: Reverse DNS lookup (IP → hostname)
    const hostnames = await Promise.race([
      dnsPromises.reverse(ip),
      new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 2000))
    ])

    if (!hostnames || hostnames.length === 0) {
      cacheResult(ip, false)
      return false
    }

    // Step 2: Check if hostname ends with a valid domain
    const validDomains = botDomains[botName]
    const hostname = hostnames[0]
    const matchesDomain = validDomains.some(domain => hostname.endsWith(`.${domain}`) || hostname === domain)

    if (!matchesDomain) {
      console.warn(`[BotVerify] ${botName} claimed by ${ip} but reverse DNS = ${hostname} (SPOOFED)`)
      cacheResult(ip, false)
      return false
    }

    // Step 3: Forward DNS lookup (hostname → IP) to confirm
    const addresses = await Promise.race([
      dnsPromises.resolve4(hostname).catch(() => [] as string[]),
      new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 2000))
    ])

    const verified = addresses.includes(ip)
    if (!verified) {
      console.warn(`[BotVerify] ${botName} reverse DNS matched ${hostname} but forward DNS doesn't resolve to ${ip} (SPOOFED)`)
    } else {
      console.log(`[BotVerify] ✅ ${botName} verified: ${ip} → ${hostname} → ${ip}`)
    }

    cacheResult(ip, verified)
    return verified
  } catch (error: any) {
    if (error.message === 'DNS timeout') {
      console.warn(`[BotVerify] DNS timeout for ${ip}`)
    }
    return null // DNS unavailable
  }
}

function cacheResult(ip: string, result: boolean) {
  botDnsCache.set(ip, { result, expires: Date.now() + BOT_DNS_CACHE_TTL })
  // Clean old entries
  if (botDnsCache.size > 200) {
    const now = Date.now()
    for (const [key, val] of botDnsCache) {
      if (val.expires < now) botDnsCache.delete(key)
    }
  }
}
