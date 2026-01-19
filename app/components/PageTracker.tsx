// app/components/PageTracker.tsx
// Client-side page view tracker
// Add to layouts to automatically track page views

'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface PageTrackerProps {
  // Optional: only track paths starting with this prefix
  pathPrefix?: string
  // Optional: disable tracking (for development)
  disabled?: boolean
}

export default function PageTracker({ pathPrefix, disabled = false }: PageTrackerProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string | null>(null)
  const loadStartTime = useRef<number>(Date.now())

  useEffect(() => {
    // Reset load time on path change
    loadStartTime.current = Date.now()
  }, [pathname])

  useEffect(() => {
    if (disabled) return

    // Build full path with search params
    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    // Check prefix filter
    if (pathPrefix && !pathname?.startsWith(pathPrefix)) {
      return
    }

    // Avoid duplicate tracking on same path
    if (lastTrackedPath.current === fullPath) {
      return
    }

    // Track the page view
    const trackPageView = async () => {
      try {
        const loadTime = Date.now() - loadStartTime.current

        await fetch('/api/fleet/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: fullPath,
            referrer: document.referrer || null,
            loadTime,
            eventType: 'pageview'
          }),
          // Don't wait for response, fire and forget
          keepalive: true
        })

        lastTrackedPath.current = fullPath
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug('[PageTracker] Failed to track:', error)
      }
    }

    // Small delay to ensure page is fully loaded
    const timeoutId = setTimeout(trackPageView, 100)

    return () => clearTimeout(timeoutId)
  }, [pathname, searchParams, pathPrefix, disabled])

  // This component renders nothing
  return null
}

// Hook version for more control
export function usePageTracker(options?: { disabled?: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasTracked = useRef(false)

  useEffect(() => {
    if (options?.disabled || hasTracked.current) return

    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    fetch('/api/fleet/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: fullPath,
        referrer: document.referrer || null,
        eventType: 'pageview'
      }),
      keepalive: true
    }).catch(() => {})

    hasTracked.current = true

    // Reset on path change
    return () => {
      hasTracked.current = false
    }
  }, [pathname, searchParams, options?.disabled])
}
