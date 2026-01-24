// app/lib/analytics/parse-user-agent.ts
// Military-grade user agent parser for accurate device detection
// Based on MDN best practices and Matomo Device Detector patterns

interface ParsedUA {
  browser: string | null
  browserVer: string | null
  os: string | null
  device: 'desktop' | 'mobile' | 'tablet' | null
  deviceConfidence: 'high' | 'medium' | 'low'
}

// Tablet detection regex (from Matomo/industry standard)
// Matches: iPad, Android tablets (no "mobile"), PlayBook, Kindle, Silk
const TABLET_REGEX = /(tablet|ipad|playbook|silk|kindle)|(android(?!.*mobi))/i

// Mobile detection - look for "Mobi" keyword (MDN recommended)
// Plus specific mobile indicators
const MOBILE_REGEX = /mobi|iphone|ipod|android.*mobile|windows phone|blackberry|bb10|opera mini|iemobile/i

// Bot/crawler detection
const BOT_REGEX = /bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck/i

export function parseUserAgent(ua: string): ParsedUA {
  if (!ua) {
    return { browser: null, browserVer: null, os: null, device: null, deviceConfidence: 'low' }
  }

  const result: ParsedUA = {
    browser: null,
    browserVer: null,
    os: null,
    device: null,
    deviceConfidence: 'high'
  }

  const uaLower = ua.toLowerCase()

  // Skip bots - they're not real devices
  if (BOT_REGEX.test(ua)) {
    return { browser: 'Bot', browserVer: null, os: null, device: 'desktop', deviceConfidence: 'high' }
  }

  // Detect browser (order matters - check specific before generic)
  if (ua.includes('Edg/')) {
    result.browser = 'Edge'
    result.browserVer = ua.match(/Edg\/([\d.]+)/)?.[1] || null
  } else if (ua.includes('OPR/') || ua.includes('Opera')) {
    result.browser = 'Opera'
    result.browserVer = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || null
  } else if (ua.includes('Chrome/') && !ua.includes('Chromium/')) {
    result.browser = 'Chrome'
    result.browserVer = ua.match(/Chrome\/([\d.]+)/)?.[1] || null
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/') && !ua.includes('Chromium/')) {
    result.browser = 'Safari'
    result.browserVer = ua.match(/Version\/([\d.]+)/)?.[1] || null
  } else if (ua.includes('Firefox/')) {
    result.browser = 'Firefox'
    result.browserVer = ua.match(/Firefox\/([\d.]+)/)?.[1] || null
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    result.browser = 'IE'
    result.browserVer = ua.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] || null
  } else if (ua.includes('SamsungBrowser')) {
    result.browser = 'Samsung Browser'
    result.browserVer = ua.match(/SamsungBrowser\/([\d.]+)/)?.[1] || null
  }

  // Detect OS
  if (ua.includes('Windows NT')) {
    result.os = 'Windows'
    // Get Windows version
    const winVer = ua.match(/Windows NT ([\d.]+)/)
    if (winVer) {
      const verMap: Record<string, string> = {
        '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP'
      }
      result.os = `Windows ${verMap[winVer[1]] || winVer[1]}`
    }
  } else if (ua.includes('Mac OS X')) {
    result.os = 'macOS'
  } else if (ua.includes('iPhone')) {
    result.os = 'iOS'
  } else if (ua.includes('iPad')) {
    result.os = 'iPadOS'
  } else if (ua.includes('Android')) {
    result.os = 'Android'
    const androidVer = ua.match(/Android ([\d.]+)/)
    if (androidVer) result.os = `Android ${androidVer[1]}`
  } else if (ua.includes('CrOS')) {
    result.os = 'Chrome OS'
  } else if (ua.includes('Linux')) {
    result.os = 'Linux'
  }

  // MILITARY-GRADE DEVICE DETECTION
  // Priority order: explicit tablet → explicit mobile → default desktop
  // This follows MDN best practices and handles edge cases

  // Step 1: Check for explicit tablets FIRST
  // iPad is ALWAYS a tablet (even with "Mobile" in UA for old Safari)
  if (ua.includes('iPad')) {
    result.device = 'tablet'
    result.deviceConfidence = 'high'
  }
  // Check tablet regex (catches Android tablets, Kindle, PlayBook, Silk)
  else if (TABLET_REGEX.test(ua)) {
    result.device = 'tablet'
    result.deviceConfidence = 'high'
  }
  // Step 2: Check for mobile
  // "Mobi" is the MDN-recommended indicator
  else if (MOBILE_REGEX.test(ua)) {
    result.device = 'mobile'
    result.deviceConfidence = 'high'
  }
  // Step 3: iPhone is always mobile
  else if (ua.includes('iPhone') || ua.includes('iPod')) {
    result.device = 'mobile'
    result.deviceConfidence = 'high'
  }
  // Step 4: Android without "mobile" could be tablet or TV - mark as tablet with medium confidence
  else if (ua.includes('Android')) {
    result.device = 'tablet'
    result.deviceConfidence = 'medium'
  }
  // Step 5: Default to desktop
  else {
    result.device = 'desktop'
    // If we have Windows/macOS/Linux, high confidence. Otherwise medium.
    result.deviceConfidence = result.os ? 'high' : 'medium'
  }

  return result
}

// Parse Client Hints for even better accuracy (when available)
export function parseClientHints(headers: Headers): {
  mobile?: boolean
  platform?: string
  model?: string
} {
  return {
    mobile: headers.get('sec-ch-ua-mobile') === '?1',
    platform: headers.get('sec-ch-ua-platform')?.replace(/"/g, '') || undefined,
    model: headers.get('sec-ch-ua-model')?.replace(/"/g, '') || undefined
  }
}

// Combine UA parsing with Client Hints for best accuracy
export function detectDevice(ua: string, headers?: Headers): ParsedUA {
  const parsed = parseUserAgent(ua)

  // If we have Client Hints, they override UA parsing (more reliable)
  if (headers) {
    const hints = parseClientHints(headers)

    // Client Hints mobile flag is authoritative
    if (hints.mobile !== undefined) {
      if (hints.mobile && parsed.device !== 'tablet') {
        parsed.device = 'mobile'
        parsed.deviceConfidence = 'high'
      } else if (!hints.mobile && parsed.device === 'mobile') {
        // Client says not mobile, but UA says mobile - trust Client Hints
        parsed.device = 'desktop'
        parsed.deviceConfidence = 'high'
      }
    }

    // Platform can help identify OS
    if (hints.platform && !parsed.os) {
      parsed.os = hints.platform
    }
  }

  return parsed
}
