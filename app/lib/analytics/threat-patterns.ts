// app/lib/analytics/threat-patterns.ts
// Pure functions for threat pattern detection.
// Each returns independently — no DB access, no side effects.

interface PageViewData {
  path: string
  ip: string | null
  isVpn: boolean
  isProxy: boolean
  isTor: boolean
  isHosting: boolean
  riskScore: number
  country: string | null
  city: string | null
  isp: string | null
}

interface ThreatAlert {
  shouldAlert: boolean
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  pattern: string
  message: string
}

const NO_ALERT: ThreatAlert = { shouldAlert: false, severity: 'LOW', pattern: '', message: '' }

const SENSITIVE_PATHS = ['/fleet', '/admin', '/sys-2847', '/api/admin', '/api/fleet']
const BOOKING_PATHS = ['/rentals/book', '/api/rentals/book', '/checkout']

/** CRITICAL: Visitor accessing fleet/admin paths */
export function checkSensitivePaths(view: PageViewData): ThreatAlert {
  const isSensitive = SENSITIVE_PATHS.some(p => view.path.startsWith(p))
  if (!isSensitive) return NO_ALERT

  // Fleet session access is normal — only flag if combined with threat signals
  if (!view.isVpn && !view.isProxy && !view.isTor && !view.isHosting && view.riskScore < 30) return NO_ALERT

  return {
    shouldAlert: true,
    severity: 'CRITICAL',
    pattern: 'sensitive_path_threat',
    message: `Threat actor accessing ${view.path} from ${view.city || 'unknown'} (${view.isp || 'unknown ISP'}, risk: ${view.riskScore})`,
  }
}

/** HIGH: VPN/Tor + booking attempt */
export function checkVpnBooking(view: PageViewData): ThreatAlert {
  const isBooking = BOOKING_PATHS.some(p => view.path.includes(p))
  if (!isBooking) return NO_ALERT
  if (!view.isVpn && !view.isTor && !view.isProxy) return NO_ALERT

  const method = view.isTor ? 'Tor' : view.isVpn ? 'VPN' : 'Proxy'
  return {
    shouldAlert: true,
    severity: 'HIGH',
    pattern: 'vpn_booking',
    message: `Booking attempt via ${method} from ${view.city || 'unknown'} (${view.isp || 'unknown'})`,
  }
}

/** HIGH: Risk score > 70 */
export function checkHighRisk(view: PageViewData): ThreatAlert {
  if (view.riskScore < 70) return NO_ALERT

  return {
    shouldAlert: true,
    severity: 'HIGH',
    pattern: 'high_risk_score',
    message: `High-risk visitor (score: ${view.riskScore}) from ${view.city || 'unknown'}, ${view.country || '??'} (${view.isp || 'unknown'})`,
  }
}

/** HIGH: Datacenter IP with significant browsing (called with recent view count) */
export function checkDatacenterActivity(view: PageViewData, recentViewCount: number): ThreatAlert {
  if (!view.isHosting || recentViewCount < 10) return NO_ALERT

  return {
    shouldAlert: true,
    severity: 'HIGH',
    pattern: 'datacenter_scraping',
    message: `Datacenter IP (${view.isp || 'unknown'}) hit ${recentViewCount} pages — possible scraper/bot`,
  }
}

/** MEDIUM: Rapid-fire page views (called with count in last 5 min) */
export function checkRapidFire(view: PageViewData, viewsInLast5Min: number): ThreatAlert {
  if (viewsInLast5Min < 50) return NO_ALERT

  return {
    shouldAlert: true,
    severity: 'MEDIUM',
    pattern: 'rapid_fire',
    message: `${viewsInLast5Min} page views in 5 minutes from ${view.ip || 'unknown'} (${view.isp || 'unknown'})`,
  }
}

/**
 * Evaluate all threat patterns for a single page view.
 * Returns array of alerts that should be fired (may be empty).
 */
export function evaluateThreats(
  view: PageViewData,
  recentViewCount: number = 0,
  viewsInLast5Min: number = 0,
): ThreatAlert[] {
  const checks = [
    checkSensitivePaths(view),
    checkVpnBooking(view),
    checkHighRisk(view),
    checkDatacenterActivity(view, recentViewCount),
    checkRapidFire(view, viewsInLast5Min),
  ]

  return checks.filter(c => c.shouldAlert)
}
