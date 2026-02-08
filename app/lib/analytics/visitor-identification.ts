// app/lib/analytics/visitor-identification.ts
// Server-side visitor identification with fuzzy matching
// Achieves high accuracy by combining multiple signals

import prisma from '@/app/lib/database/prisma'
import crypto from 'crypto'

interface VisitorSignals {
  // Client fingerprint (if provided)
  fingerprintHash?: string
  visitorId?: string
  confidence?: number

  // Request-derived signals
  ip: string
  userAgent: string
  acceptLanguage?: string
  acceptEncoding?: string

  // Geo signals
  country?: string
  region?: string
  city?: string

  // Device signals (parsed from UA)
  device?: string
  browser?: string
  browserVer?: string
  os?: string

  // Timing
  timezone?: string
  localHour?: number
}

interface VisitorMatch {
  visitorId: string
  matchType: 'exact' | 'fingerprint' | 'fuzzy' | 'new'
  confidence: number
  isReturning: boolean
  previousVisits: number
  lastSeen?: Date
}

/**
 * Hash function for server-side fingerprint generation
 */
function serverHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 32)
}

/**
 * Generate a server-side visitor ID from request signals
 * Used when client fingerprint is not available
 */
export function generateServerVisitorId(signals: VisitorSignals): string {
  // Combine stable signals that don't change frequently
  const stableSignals = [
    signals.userAgent,
    signals.ip,
    signals.country || '',
    signals.timezone || '',
    signals.device || '',
    signals.browser || ''
  ].join('|')

  return `sv_${serverHash(stableSignals).slice(0, 16)}`
}

/**
 * Calculate similarity between two visitor signal sets
 * Returns a score from 0-100
 */
function calculateSimilarity(a: VisitorSignals, b: VisitorSignals): number {
  let score = 0
  let maxScore = 0

  // Fingerprint hash (high weight)
  if (a.fingerprintHash && b.fingerprintHash) {
    maxScore += 40
    if (a.fingerprintHash === b.fingerprintHash) {
      score += 40
    }
  }

  // User agent (medium-high weight)
  maxScore += 20
  if (a.userAgent === b.userAgent) {
    score += 20
  } else if (a.userAgent && b.userAgent) {
    // Partial match (same browser family)
    const aUA = a.userAgent.toLowerCase()
    const bUA = b.userAgent.toLowerCase()
    if (
      (aUA.includes('chrome') && bUA.includes('chrome')) ||
      (aUA.includes('safari') && bUA.includes('safari')) ||
      (aUA.includes('firefox') && bUA.includes('firefox'))
    ) {
      score += 5
    }
  }

  // IP address (medium weight)
  maxScore += 15
  if (a.ip === b.ip) {
    score += 15
  } else if (a.ip && b.ip) {
    // Same /24 subnet
    const aOctets = a.ip.split('.')
    const bOctets = b.ip.split('.')
    if (aOctets.length === 4 && bOctets.length === 4) {
      if (aOctets[0] === bOctets[0] && aOctets[1] === bOctets[1] && aOctets[2] === bOctets[2]) {
        score += 8
      }
    }
  }

  // Country (low weight)
  maxScore += 5
  if (a.country && b.country && a.country === b.country) {
    score += 5
  }

  // Timezone (medium weight)
  maxScore += 10
  if (a.timezone && b.timezone && a.timezone === b.timezone) {
    score += 10
  }

  // Device type (low weight)
  maxScore += 5
  if (a.device && b.device && a.device === b.device) {
    score += 5
  }

  // Browser (low weight, considering updates)
  maxScore += 5
  if (a.browser && b.browser && a.browser === b.browser) {
    score += 5
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
}

/**
 * Find existing visitor by fingerprint hash
 */
async function findByFingerprint(fingerprintHash: string): Promise<{
  visitorId: string
  lastSeen: Date
  visits: number
} | null> {
  // Look for recent page views with this fingerprint
  const recentViews = await prisma.pageView.findMany({
    where: {
      visitorId: {
        startsWith: 'fp_' + fingerprintHash.slice(0, 16)
      },
      timestamp: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      }
    },
    select: {
      visitorId: true,
      timestamp: true
    },
    orderBy: { timestamp: 'desc' },
    take: 1
  })

  if (recentViews.length > 0) {
    // Count total visits
    const visitCount = await prisma.pageView.count({
      where: {
        visitorId: recentViews[0].visitorId
      }
    })

    return {
      visitorId: recentViews[0].visitorId || '',
      lastSeen: recentViews[0].timestamp,
      visits: visitCount
    }
  }

  return null
}

/**
 * Find visitor by exact visitor ID
 */
async function findByVisitorId(visitorId: string): Promise<{
  lastSeen: Date
  visits: number
} | null> {
  const views = await prisma.pageView.findMany({
    where: { visitorId },
    select: { timestamp: true },
    orderBy: { timestamp: 'desc' },
    take: 1
  })

  if (views.length > 0) {
    const visitCount = await prisma.pageView.count({
      where: { visitorId }
    })

    return {
      lastSeen: views[0].timestamp,
      visits: visitCount
    }
  }

  return null
}

/**
 * Find similar visitors using fuzzy matching
 * Looks for visitors with similar signals in recent history
 */
async function findSimilarVisitor(signals: VisitorSignals): Promise<{
  visitorId: string
  similarity: number
  lastSeen: Date
  visits: number
} | null> {
  // Get recent unique visitors with similar characteristics
  const candidates = await prisma.pageView.findMany({
    where: {
      timestamp: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      },
      // Filter by same country and device type for efficiency
      ...(signals.country && { country: signals.country }),
      ...(signals.device && { device: signals.device })
    },
    select: {
      visitorId: true,
      userAgent: true,
      country: true,
      device: true,
      browser: true,
      timestamp: true
    },
    distinct: ['visitorId'],
    orderBy: { timestamp: 'desc' },
    take: 100
  })

  let bestMatch: {
    visitorId: string
    similarity: number
    lastSeen: Date
    visits: number
  } | null = null

  for (const candidate of candidates) {
    const candidateSignals: VisitorSignals = {
      ip: '', // We don't store IP for privacy
      userAgent: candidate.userAgent,
      country: candidate.country || undefined,
      device: candidate.device || undefined,
      browser: candidate.browser || undefined
    }

    const similarity = calculateSimilarity(signals, candidateSignals)

    // Only consider matches above 70% similarity
    if (similarity >= 70) {
      const visits = await prisma.pageView.count({
        where: { visitorId: candidate.visitorId }
      })

      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = {
          visitorId: candidate.visitorId || '',
          similarity,
          lastSeen: candidate.timestamp,
          visits
        }
      }
    }
  }

  return bestMatch
}

/**
 * Main visitor identification function
 * Combines multiple strategies to identify returning visitors
 */
export async function identifyVisitor(signals: VisitorSignals): Promise<VisitorMatch> {
  // Strategy 1: Exact client visitor ID match
  if (signals.visitorId) {
    const existing = await findByVisitorId(signals.visitorId)
    if (existing) {
      return {
        visitorId: signals.visitorId,
        matchType: 'exact',
        confidence: signals.confidence || 99,
        isReturning: true,
        previousVisits: existing.visits,
        lastSeen: existing.lastSeen
      }
    }
  }

  // Strategy 2: Fingerprint hash match
  if (signals.fingerprintHash) {
    const fingerprintMatch = await findByFingerprint(signals.fingerprintHash)
    if (fingerprintMatch) {
      return {
        visitorId: fingerprintMatch.visitorId,
        matchType: 'fingerprint',
        confidence: signals.confidence || 95,
        isReturning: true,
        previousVisits: fingerprintMatch.visits,
        lastSeen: fingerprintMatch.lastSeen
      }
    }
  }

  // Strategy 3: Fuzzy matching on similar signals
  const fuzzyMatch = await findSimilarVisitor(signals)
  if (fuzzyMatch && fuzzyMatch.similarity >= 80) {
    return {
      visitorId: fuzzyMatch.visitorId,
      matchType: 'fuzzy',
      confidence: Math.round(fuzzyMatch.similarity * 0.9), // Slightly discount fuzzy matches
      isReturning: true,
      previousVisits: fuzzyMatch.visits,
      lastSeen: fuzzyMatch.lastSeen
    }
  }

  // Strategy 4: Generate new visitor ID
  const newVisitorId = signals.visitorId ||
    (signals.fingerprintHash ? `fp_${signals.fingerprintHash.slice(0, 16)}` : generateServerVisitorId(signals))

  return {
    visitorId: newVisitorId,
    matchType: 'new',
    confidence: signals.confidence || 60,
    isReturning: false,
    previousVisits: 0
  }
}

/**
 * Get visitor statistics
 */
export async function getVisitorStats(visitorId: string): Promise<{
  totalVisits: number
  uniquePages: number
  firstSeen: Date | null
  lastSeen: Date | null
  countries: string[]
  devices: string[]
  topPages: Array<{ path: string; visits: number }>
}> {
  const views = await prisma.pageView.findMany({
    where: { visitorId },
    select: {
      path: true,
      country: true,
      device: true,
      timestamp: true
    },
    orderBy: { timestamp: 'asc' }
  })

  if (views.length === 0) {
    return {
      totalVisits: 0,
      uniquePages: 0,
      firstSeen: null,
      lastSeen: null,
      countries: [],
      devices: [],
      topPages: []
    }
  }

  const countries = new Set<string>()
  const devices = new Set<string>()
  const pages = new Set<string>()
  const pageVisits: Record<string, number> = {}

  views.forEach(v => {
    if (v.country) countries.add(v.country)
    if (v.device) devices.add(v.device)
    pages.add(v.path)
    pageVisits[v.path] = (pageVisits[v.path] || 0) + 1
  })

  const topPages = Object.entries(pageVisits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, visits]) => ({ path, visits }))

  return {
    totalVisits: views.length,
    uniquePages: pages.size,
    firstSeen: views[0].timestamp,
    lastSeen: views[views.length - 1].timestamp,
    countries: Array.from(countries),
    devices: Array.from(devices),
    topPages
  }
}
