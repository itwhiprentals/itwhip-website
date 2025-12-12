// app/components/LocationAwareContent.tsx
// Client component that dynamically updates content based on user's detected location
// Used in "near-me" pages to show location-specific titles and content

'use client'

import { useEffect, useState } from 'react'
import { useLocation } from '@/app/providers'

// ============================================================================
// TYPES
// ============================================================================

interface LocationAwareContentProps {
  children: React.ReactNode
  className?: string
}

interface LocationAwareTitleProps {
  prefix?: string // "Car Rentals Near Me in"
  suffix?: string // ", AZ"
  fallbackCity?: string // "Phoenix"
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p'
}

interface LocationAwareTextProps {
  template: string // "Find cars in {city}" or "Rentals near {displayName}"
  fallbackCity?: string
  className?: string
  as?: 'span' | 'p' | 'div'
}

// ============================================================================
// LOCATION AWARE WRAPPER
// ============================================================================

export function LocationAwareContent({ children, className }: LocationAwareContentProps) {
  return <div className={className}>{children}</div>
}

// ============================================================================
// LOCATION AWARE TITLE
// Shows: "Car Rentals Near Me in Scottsdale, AZ"
// ============================================================================

export function LocationAwareTitle({
  prefix = '',
  suffix = ', AZ',
  fallbackCity = 'Phoenix',
  className = '',
  as: Component = 'h1'
}: LocationAwareTitleProps) {
  const { location, loading } = useLocation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // SSR: Show fallback
  if (!mounted) {
    return (
      <Component className={className}>
        {prefix}{fallbackCity}{suffix}
      </Component>
    )
  }

  // Client: Show detected city (or fallback while loading)
  const city = loading ? fallbackCity : location.city

  return (
    <Component className={className}>
      {prefix}{city}{suffix}
    </Component>
  )
}

// ============================================================================
// LOCATION AWARE TEXT
// Template-based text replacement: "Find {make} cars in {city}"
// ============================================================================

export function LocationAwareText({
  template,
  fallbackCity = 'Phoenix',
  className = '',
  as: Component = 'span'
}: LocationAwareTextProps) {
  const { location, loading } = useLocation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Replace placeholders in template
  const renderText = (city: string, displayName: string) => {
    return template
      .replace(/{city}/g, city)
      .replace(/{displayName}/g, displayName)
      .replace(/{state}/g, 'AZ')
  }

  // SSR: Show fallback
  if (!mounted) {
    return (
      <Component className={className}>
        {renderText(fallbackCity, `${fallbackCity}, AZ`)}
      </Component>
    )
  }

  // Client: Show detected location
  const city = loading ? fallbackCity : location.city
  const displayName = loading ? `${fallbackCity}, AZ` : location.displayName

  return (
    <Component className={className}>
      {renderText(city, displayName)}
    </Component>
  )
}

// ============================================================================
// LOCATION AWARE SPAN (inline text)
// Just returns the city name, useful for inline usage
// ============================================================================

export function LocationCity({
  fallback = 'Phoenix',
  className = ''
}: {
  fallback?: string
  className?: string
}) {
  const { location, loading } = useLocation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return <span className={className}>{fallback}</span>
  }

  return <span className={className}>{location.city}</span>
}

// ============================================================================
// LOCATION INDICATOR (shows loading state)
// ============================================================================

export function LocationIndicator({
  showIcon = true,
  className = ''
}: {
  showIcon?: boolean
  className?: string
}) {
  const { location, loading, error, hasPermission } = useLocation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={`flex items-center gap-1.5 text-sm ${className}`}>
      {showIcon && (
        <svg
          className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
      <span>
        {loading ? 'Detecting location...' : location.displayName}
      </span>
      {error && hasPermission === false && (
        <span className="text-xs text-gray-500">(Location access denied)</span>
      )}
    </div>
  )
}

// ============================================================================
// DYNAMIC PAGE TITLE (updates document.title)
// ============================================================================

export function DynamicPageTitle({
  template, // "Tesla Rentals Near Me in {city}, AZ | ItWhip"
  fallbackCity = 'Phoenix'
}: {
  template: string
  fallbackCity?: string
}) {
  const { location, loading } = useLocation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const city = loading ? fallbackCity : location.city
    const title = template
      .replace(/{city}/g, city)
      .replace(/{displayName}/g, location.displayName)

    document.title = title
  }, [mounted, loading, location, template, fallbackCity])

  return null
}

// ============================================================================
// EXPORTS
// ============================================================================

export default LocationAwareContent
