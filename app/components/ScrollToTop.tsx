'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Global scroll-to-top on route changes.
 * - New page navigations: scrolls to top
 * - Browser back/forward: lets the browser restore scroll position naturally
 */
export default function ScrollToTop() {
  const pathname = usePathname()
  const isPopState = useRef(false)

  // Track browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      isPopState.current = true
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Scroll to top on pathname change (unless it's back/forward)
  useEffect(() => {
    if (isPopState.current) {
      // Back/forward — let browser handle scroll restoration
      isPopState.current = false
      return
    }
    // New navigation — scroll to top
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
