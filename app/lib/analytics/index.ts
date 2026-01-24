// app/lib/analytics/index.ts
// Analytics utilities barrel export

export { parseUserAgent } from './parse-user-agent'
export { extractGeoFromHeaders, getClientIP } from './extract-geo'

// Military-grade visitor identification (v2)
export {
  collectVisitorFingerprint,
  getVisitorId,
  getDetailedFingerprint,
  type VisitorFingerprint
} from './visitor-fingerprint'

export {
  identifyVisitor,
  generateServerVisitorId,
  getVisitorStats
} from './visitor-identification'

// Sensitive query params to exclude from tracking
export const SENSITIVE_PARAMS = [
  'token',
  'key',
  'password',
  'secret',
  'api_key',
  'apikey',
  'auth',
  'access_token',
  'refresh_token',
  'code',
  'state',
  'session'
]

// Sanitize query params by removing sensitive data
export function sanitizeQueryParams(params: URLSearchParams): string | null {
  const sanitized = new URLSearchParams()
  let hasParams = false

  params.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (!SENSITIVE_PARAMS.some(s => lowerKey.includes(s))) {
      sanitized.set(key, value)
      hasParams = true
    }
  })

  return hasParams ? sanitized.toString() : null
}

// Generate a simple visitor ID from request data (privacy-friendly)
// This is NOT a fingerprint - just a daily session identifier
export function generateVisitorId(userAgent: string, ip: string | null): string {
  const date = new Date().toISOString().split('T')[0] // Daily rotation
  const data = `${userAgent}-${ip || 'unknown'}-${date}`

  // Simple hash - not cryptographic, just for grouping
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  return `v_${Math.abs(hash).toString(36)}`
}
