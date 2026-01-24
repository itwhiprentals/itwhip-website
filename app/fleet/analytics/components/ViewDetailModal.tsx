// app/fleet/analytics/components/ViewDetailModal.tsx
// Modal showing detailed information about a page view

'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoGlobeOutline,
  IoPhonePortraitOutline,
  IoDesktopOutline,
  IoTabletPortraitOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoLinkOutline,
  IoSpeedometerOutline,
  IoPersonOutline,
  IoLayersOutline,
  IoLogoChrome,
  IoLogoFirefox,
  IoLogoApple,
  IoLogoWindows,
  IoLogoAndroid
} from 'react-icons/io5'

// Extended view details from API
export interface ViewDetail {
  id: string
  path: string
  referrer?: string | null
  queryParams?: string | null
  sessionId?: string | null
  visitorId?: string | null
  userAgent?: string | null
  device?: string | null
  browser?: string | null
  browserVer?: string | null
  os?: string | null
  country?: string | null
  region?: string | null
  city?: string | null
  loadTime?: number | null
  timestamp: string
}

interface ViewDetailModalProps {
  view: ViewDetail | null
  onClose: () => void
}

// Get device icon
function getDeviceIcon(device: string | null | undefined) {
  switch (device?.toLowerCase()) {
    case 'mobile':
      return <IoPhonePortraitOutline className="w-5 h-5" />
    case 'tablet':
      return <IoTabletPortraitOutline className="w-5 h-5" />
    default:
      return <IoDesktopOutline className="w-5 h-5" />
  }
}

// Get OS icon
function getOSIcon(os: string | null | undefined) {
  const osLower = os?.toLowerCase() || ''
  if (osLower.includes('ios') || osLower.includes('mac')) {
    return <IoLogoApple className="w-4 h-4" />
  }
  if (osLower.includes('windows')) {
    return <IoLogoWindows className="w-4 h-4" />
  }
  if (osLower.includes('android')) {
    return <IoLogoAndroid className="w-4 h-4" />
  }
  return <IoLayersOutline className="w-4 h-4" />
}

// Get browser icon
function getBrowserIcon(browser: string | null | undefined) {
  const browserLower = browser?.toLowerCase() || ''
  if (browserLower.includes('chrome')) {
    return <IoLogoChrome className="w-4 h-4" />
  }
  if (browserLower.includes('firefox')) {
    return <IoLogoFirefox className="w-4 h-4" />
  }
  if (browserLower.includes('safari')) {
    return <IoLogoApple className="w-4 h-4" />
  }
  return <IoGlobeOutline className="w-4 h-4" />
}

// Format load time with color
function getLoadTimeColor(loadTime: number | null | undefined): string {
  if (!loadTime) return 'text-gray-400'
  if (loadTime < 200) return 'text-green-500'
  if (loadTime < 500) return 'text-green-500'
  if (loadTime < 1000) return 'text-yellow-500'
  if (loadTime < 2000) return 'text-orange-500'
  return 'text-red-500'
}

function getLoadTimeLabel(loadTime: number | null | undefined): string {
  if (!loadTime) return 'No data'
  if (loadTime < 200) return 'Excellent'
  if (loadTime < 500) return 'Good'
  if (loadTime < 1000) return 'Fair'
  if (loadTime < 2000) return 'Slow'
  return 'Critical'
}

export default function ViewDetailModal({ view, onClose }: ViewDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (view) {
      // Small delay for animation
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [view])

  if (!view) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const timestamp = new Date(view.timestamp)
  const formattedDate = timestamp.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  // Build location string
  const locationParts = [view.city, view.region, view.country].filter(Boolean)
  const fullLocation = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden transition-all duration-200 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              {getDeviceIcon(view.device)}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                Page View Details
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formattedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Page Path */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Page Visited
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-all bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
              {view.path}
            </p>
          </div>

          {/* Time & Location Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoTimeOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Time</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formattedTime}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <IoLocationOutline className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Location</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={fullLocation}>
                {fullLocation}
              </p>
            </div>
          </div>

          {/* Device Info */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Device Information
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="flex justify-center mb-1 text-blue-500">
                  {getDeviceIcon(view.device)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Device</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {view.device || 'Unknown'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="flex justify-center mb-1 text-purple-500">
                  {getBrowserIcon(view.browser)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Browser</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {view.browser || 'Unknown'}
                  {view.browserVer && <span className="text-xs text-gray-400 ml-1">v{view.browserVer}</span>}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="flex justify-center mb-1 text-green-500">
                  {getOSIcon(view.os)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">OS</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {view.os || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Performance
            </label>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoSpeedometerOutline className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Page Load Time</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${getLoadTimeColor(view.loadTime)}`}>
                    {view.loadTime ? `${view.loadTime}ms` : '—'}
                  </span>
                  <p className={`text-xs ${getLoadTimeColor(view.loadTime)}`}>
                    {getLoadTimeLabel(view.loadTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Referrer */}
          {view.referrer && (
            <div className="mb-4">
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                Referrer
              </label>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <IoLinkOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                    {view.referrer}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Session & Visitor IDs */}
          <div className="grid grid-cols-2 gap-4">
            {view.sessionId && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <IoLayersOutline className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Session</span>
                </div>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate" title={view.sessionId}>
                  {view.sessionId.slice(0, 12)}...
                </p>
              </div>
            )}
            {view.visitorId && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <IoPersonOutline className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Visitor</span>
                </div>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate" title={view.visitorId}>
                  {view.visitorId.slice(0, 12)}...
                </p>
              </div>
            )}
          </div>

          {/* User Agent (collapsed by default) */}
          {view.userAgent && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
                User Agent
              </summary>
              <p className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 break-all">
                {view.userAgent}
              </p>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
