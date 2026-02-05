// app/lib/analytics/use-analytics.ts
// React hook for military-grade visitor tracking
// Automatically identifies visitors and tracks page views

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getVisitorId, getDetailedFingerprint, type VisitorFingerprint } from './visitor-fingerprint'

interface TrackingConfig {
  /** Enable tracking (default: true in production) */
  enabled?: boolean
  /** API endpoint (default: /api/fleet/analytics/track/v2) */
  endpoint?: string
  /** Track page views automatically (default: true) */
  autoTrackPageViews?: boolean
  /** Include detailed fingerprint (default: false for privacy) */
  includeDetailedFingerprint?: boolean
  /** Custom metadata to include with each event */
  metadata?: Record<string, any>
}

interface VisitorInfo {
  visitorId: string
  source: 'storage' | 'fingerprint' | 'new'
  confidence: number
  isReturning?: boolean
  previousVisits?: number
}

interface TrackingResult {
  /** Track a custom event */
  trackEvent: (eventType: string, metadata?: Record<string, any>) => Promise<void>
  /** Track a page view manually */
  trackPageView: (path?: string, metadata?: Record<string, any>) => Promise<void>
  /** Get current visitor info */
  visitorInfo: VisitorInfo | null
  /** Whether tracking is ready */
  isReady: boolean
  /** Get detailed fingerprint for fraud detection */
  getFingerprint: () => Promise<VisitorFingerprint>
}

const DEFAULT_ENDPOINT = '/api/fleet/analytics/track/v2'

/**
 * Hook for tracking analytics with military-grade visitor identification
 */
export function useAnalytics(config: TrackingConfig = {}): TrackingResult {
  const {
    enabled = process.env.NODE_ENV === 'production',
    endpoint = DEFAULT_ENDPOINT,
    autoTrackPageViews = true,
    includeDetailedFingerprint = false,
    metadata: defaultMetadata
  } = config

  const pathname = usePathname()
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null)
  const [isReady, setIsReady] = useState(false)
  const fingerprintRef = useRef<VisitorFingerprint | null>(null)
  const trackedPaths = useRef<Set<string>>(new Set())
  const initializingRef = useRef(false)

  // Initialize visitor identification
  useEffect(() => {
    if (!enabled || initializingRef.current) return

    initializingRef.current = true

    const initVisitor = async () => {
      try {
        const visitor = await getVisitorId()
        setVisitorInfo(visitor)

        // Optionally get detailed fingerprint
        if (includeDetailedFingerprint) {
          fingerprintRef.current = await getDetailedFingerprint()
        }

        setIsReady(true)
      } catch (err) {
        console.error('[Analytics] Failed to initialize visitor:', err)
        // Still mark as ready, will use server-side identification
        setIsReady(true)
      }
    }

    initVisitor()
  }, [enabled, includeDetailedFingerprint])

  // Track page view
  const trackPageView = useCallback(async (
    path?: string,
    metadata?: Record<string, any>
  ) => {
    if (!enabled) return

    const trackPath = path || pathname || window.location.pathname

    try {
      const payload: Record<string, any> = {
        path: trackPath + window.location.search,
        referrer: document.referrer || undefined,
        loadTime: getPageLoadTime(),
        eventType: 'pageview',
        metadata: {
          ...defaultMetadata,
          ...metadata
        }
      }

      // Add visitor identification
      if (visitorInfo) {
        payload.visitorId = visitorInfo.visitorId
        payload.confidence = visitorInfo.confidence
      }

      // Add fingerprint hash
      if (fingerprintRef.current) {
        payload.fingerprintHash = fingerprintRef.current.fingerprintHash
        if (includeDetailedFingerprint) {
          payload.fingerprint = fingerprintRef.current
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true // Ensure request completes even on page unload
      })

      if (response.ok) {
        const result = await response.json()
        // Update visitor info with server response
        if (result.visitor) {
          setVisitorInfo(prev => ({
            ...prev!,
            isReturning: result.visitor.isReturning,
            previousVisits: result.visitor.previousVisits
          }))
        }
      }
    } catch (err) {
      console.error('[Analytics] Failed to track page view:', err)
    }
  }, [enabled, pathname, visitorInfo, defaultMetadata, endpoint, includeDetailedFingerprint])

  // Track custom event
  const trackEvent = useCallback(async (
    eventType: string,
    metadata?: Record<string, any>
  ) => {
    if (!enabled) return

    try {
      const payload: Record<string, any> = {
        path: pathname || window.location.pathname,
        eventType,
        metadata: {
          ...defaultMetadata,
          ...metadata
        }
      }

      if (visitorInfo) {
        payload.visitorId = visitorInfo.visitorId
        payload.confidence = visitorInfo.confidence
      }

      if (fingerprintRef.current) {
        payload.fingerprintHash = fingerprintRef.current.fingerprintHash
      }

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      })
    } catch (err) {
      console.error('[Analytics] Failed to track event:', err)
    }
  }, [enabled, pathname, visitorInfo, defaultMetadata, endpoint])

  // Get detailed fingerprint
  const getFingerprint = useCallback(async (): Promise<VisitorFingerprint> => {
    if (fingerprintRef.current) {
      return fingerprintRef.current
    }
    const fp = await getDetailedFingerprint()
    fingerprintRef.current = fp
    return fp
  }, [])

  // Auto-track page views on navigation
  useEffect(() => {
    if (!enabled || !autoTrackPageViews || !isReady || !pathname) return

    // Prevent duplicate tracking for same path
    const fullPath = pathname + window.location.search
    if (trackedPaths.current.has(fullPath)) return
    trackedPaths.current.add(fullPath)

    // Small delay to ensure page load metrics are available
    const timer = setTimeout(() => {
      trackPageView()
    }, 100)

    return () => clearTimeout(timer)
  }, [enabled, autoTrackPageViews, isReady, pathname, trackPageView])

  // Track page visibility changes
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && visitorInfo) {
        // Track time spent when user leaves
        trackEvent('visibility_hidden', {
          timeSpent: performance.now()
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, visitorInfo, trackEvent])

  return {
    trackEvent,
    trackPageView,
    visitorInfo,
    isReady,
    getFingerprint
  }
}

/**
 * Get page load time from Performance API
 */
function getPageLoadTime(): number | undefined {
  if (typeof window === 'undefined' || !window.performance) return undefined

  try {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (entries.length > 0) {
      return Math.round(entries[0].loadEventEnd - entries[0].startTime)
    }

    // Fallback for older browsers
    const timing = (performance as any).timing
    if (timing) {
      return timing.loadEventEnd - timing.navigationStart
    }
  } catch {
    // Ignore errors
  }

  return undefined
}

/**
 * Analytics provider component for automatic tracking
 */
export function AnalyticsProvider({
  children,
  config
}: {
  children: React.ReactNode
  config?: TrackingConfig
}) {
  useAnalytics(config)
  return <>{children}</>
}
