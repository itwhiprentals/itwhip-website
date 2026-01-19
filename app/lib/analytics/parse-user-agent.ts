// app/lib/analytics/parse-user-agent.ts
// Lightweight user agent parser - no external dependencies

interface ParsedUA {
  browser: string | null
  browserVer: string | null
  os: string | null
  device: 'desktop' | 'mobile' | 'tablet' | null
}

export function parseUserAgent(ua: string): ParsedUA {
  if (!ua) {
    return { browser: null, browserVer: null, os: null, device: null }
  }

  const result: ParsedUA = {
    browser: null,
    browserVer: null,
    os: null,
    device: null
  }

  // Detect browser
  if (ua.includes('Edg/')) {
    result.browser = 'Edge'
    const match = ua.match(/Edg\/([\d.]+)/)
    result.browserVer = match?.[1] || null
  } else if (ua.includes('Chrome/') && !ua.includes('Chromium/')) {
    result.browser = 'Chrome'
    const match = ua.match(/Chrome\/([\d.]+)/)
    result.browserVer = match?.[1] || null
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    result.browser = 'Safari'
    const match = ua.match(/Version\/([\d.]+)/)
    result.browserVer = match?.[1] || null
  } else if (ua.includes('Firefox/')) {
    result.browser = 'Firefox'
    const match = ua.match(/Firefox\/([\d.]+)/)
    result.browserVer = match?.[1] || null
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    result.browser = 'IE'
    const match = ua.match(/(?:MSIE |rv:)([\d.]+)/)
    result.browserVer = match?.[1] || null
  } else if (ua.includes('Opera') || ua.includes('OPR/')) {
    result.browser = 'Opera'
    const match = ua.match(/(?:Opera|OPR)\/([\d.]+)/)
    result.browserVer = match?.[1] || null
  }

  // Detect OS
  if (ua.includes('Windows NT')) {
    result.os = 'Windows'
  } else if (ua.includes('Mac OS X')) {
    result.os = 'macOS'
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    result.os = 'iOS'
  } else if (ua.includes('Android')) {
    result.os = 'Android'
  } else if (ua.includes('Linux')) {
    result.os = 'Linux'
  } else if (ua.includes('CrOS')) {
    result.os = 'Chrome OS'
  }

  // Detect device type
  if (ua.includes('Mobile') || ua.includes('iPhone') || ua.includes('Android') && !ua.includes('Tablet')) {
    result.device = 'mobile'
  } else if (ua.includes('iPad') || ua.includes('Tablet') || ua.includes('PlayBook')) {
    result.device = 'tablet'
  } else {
    result.device = 'desktop'
  }

  return result
}
