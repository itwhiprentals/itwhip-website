// app/fleet/analytics/components/shared/types.ts
// Shared types for SOC components — single source of truth

export interface EnrichedVisitor {
  visitorId: string
  ip: string | null
  isp: string | null
  asn: string | null
  org: string | null
  country: string | null
  region: string | null
  city: string | null
  isVpn: boolean
  isProxy: boolean
  isTor: boolean
  isHosting: boolean
  riskScore: number
  device: string | null
  browser: string | null
  pageCount: number
  firstSeen: string
  lastSeen: string
}

export interface PageViewEntry {
  id: string
  path: string
  timestamp: string
  loadTime: number | null
  device: string | null
  browser: string | null
  ip: string | null
  isp: string | null
  isVpn: boolean
  isProxy: boolean
  isTor: boolean
  isHosting: boolean
  riskScore: number
}

export interface SecurityEventEntry {
  id: string
  type: string
  severity: string
  sourceIp: string
  message: string
  action: string
  blocked: boolean
  timestamp: string
}

export interface CityData {
  city: string
  country: string | null
  region: string | null
  totalViews: number
  uniqueVisitors: number
  vpnCount: number
  torCount: number
  proxyCount: number
  hostingCount: number
  avgRiskScore: number
  maxRiskScore: number
  visitors: EnrichedVisitor[]
  recentViews: PageViewEntry[]
}

export interface VisitorProfile {
  visitor: EnrichedVisitor
  pageViews: PageViewEntry[]
  securityEvents: SecurityEventEntry[]
  behavioral: {
    totalPages: number
    avgTimeBetweenPages: number | null
    authPagesVisited: string[]
    sensitivePagesVisited: string[]
    sessionDurationMs: number | null
  }
}

// Risk score color helpers
export function getRiskColor(score: number): string {
  if (score >= 51) return 'text-red-600'
  if (score >= 21) return 'text-yellow-600'
  return 'text-green-600'
}

export function getRiskBgColor(score: number): string {
  if (score >= 51) return 'bg-red-100 text-red-700'
  if (score >= 21) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

export function getRiskLabel(score: number): string {
  if (score >= 70) return 'Critical'
  if (score >= 51) return 'High'
  if (score >= 21) return 'Medium'
  if (score > 0) return 'Low'
  return 'Clean'
}
