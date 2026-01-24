// app/fleet/analytics/components/StatsDetailModal.tsx
// Modal showing detailed information about analytics stats

'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoEyeOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoExitOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoStatsChartOutline
} from 'react-icons/io5'

export type StatType = 'totalViews' | 'uniqueVisitors' | 'avgLoadTime' | 'bounceRate'

interface StatsDetailModalProps {
  stat: StatType | null
  data: {
    totalViews: number
    uniqueVisitors: number
    avgLoadTime: number | null
    bounceRate: number
    topPages?: { path: string; views: number }[]
    viewsByCountry?: { country: string; views: number }[]
    viewsByDevice?: { device: string; views: number }[]
  }
  onClose: () => void
}

const statConfig: Record<StatType, {
  title: string
  icon: typeof IoEyeOutline
  color: string
  description: string
  explanation: string
  goodValues: string
  tips: string[]
}> = {
  totalViews: {
    title: 'Total Page Views',
    icon: IoEyeOutline,
    color: 'text-blue-500',
    description: 'The total number of pages viewed during the selected time period.',
    explanation: 'Each page load counts as one view. If a user visits 5 pages, that counts as 5 page views. This metric shows overall engagement and traffic volume.',
    goodValues: 'Higher is generally better. Compare with previous periods to track growth.',
    tips: [
      'Create compelling content to increase page views per session',
      'Optimize internal linking to encourage exploration',
      'Ensure fast page loads to prevent abandonment',
      'Use analytics to identify high-performing content',
      'Promote your content on social media and other channels'
    ]
  },
  uniqueVisitors: {
    title: 'Unique Visitors',
    icon: IoPeopleOutline,
    color: 'text-green-500',
    description: 'The number of distinct users who visited your site during the selected period.',
    explanation: 'Unique visitors are tracked using visitor IDs (fingerprinting). One person visiting multiple times counts as one unique visitor. This shows your actual audience reach.',
    goodValues: 'Higher unique visitors means broader reach. Track growth over time.',
    tips: [
      'Focus on SEO to attract new visitors organically',
      'Run targeted marketing campaigns',
      'Create shareable content that attracts referrals',
      'Engage on social media to build audience',
      'Consider paid advertising for faster growth'
    ]
  },
  avgLoadTime: {
    title: 'Average Load Time',
    icon: IoTimeOutline,
    color: 'text-yellow-500',
    description: 'The average time it takes for your pages to fully load.',
    explanation: 'Load time is measured from the initial request to when the page is interactive. Faster load times improve user experience and SEO rankings.',
    goodValues: '<200ms is excellent, <500ms is good, >1000ms is slow, >2000ms needs immediate attention',
    tips: [
      'Optimize and compress images',
      'Enable browser caching',
      'Use a CDN for static assets',
      'Minimize JavaScript and CSS',
      'Consider lazy loading for images and components',
      'Use server-side rendering for critical content'
    ]
  },
  bounceRate: {
    title: 'Bounce Rate',
    icon: IoExitOutline,
    color: 'text-red-500',
    description: 'The percentage of visitors who leave after viewing only one page.',
    explanation: 'A "bounce" occurs when a visitor views a single page and leaves without any other interaction. High bounce rates may indicate content or UX issues, but can also be normal for blogs or landing pages.',
    goodValues: '20-40% is excellent, 40-60% is average, 60-80% needs attention, >80% is concerning',
    tips: [
      'Improve page content relevance and quality',
      'Add clear calls-to-action',
      'Optimize page load speed',
      'Ensure mobile-friendly design',
      'Add related content suggestions',
      'Improve navigation and internal linking'
    ]
  }
}

function getLoadTimeStatus(ms: number | null): { label: string; color: string } {
  if (ms === null) return { label: 'No data', color: 'text-gray-400' }
  if (ms < 200) return { label: 'Excellent', color: 'text-green-500' }
  if (ms < 500) return { label: 'Good', color: 'text-green-500' }
  if (ms < 1000) return { label: 'Fair', color: 'text-yellow-500' }
  if (ms < 2000) return { label: 'Slow', color: 'text-orange-500' }
  return { label: 'Critical', color: 'text-red-500' }
}

function getBounceRateStatus(rate: number): { label: string; color: string } {
  if (rate <= 40) return { label: 'Excellent', color: 'text-green-500' }
  if (rate <= 60) return { label: 'Average', color: 'text-yellow-500' }
  if (rate <= 80) return { label: 'High', color: 'text-orange-500' }
  return { label: 'Concerning', color: 'text-red-500' }
}

export default function StatsDetailModal({ stat, data, onClose }: StatsDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (stat) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [stat])

  if (!stat) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const config = statConfig[stat]
  const Icon = config.icon

  // Get current value and status
  let currentValue = ''
  let status = { label: '', color: '' }

  switch (stat) {
    case 'totalViews':
      currentValue = data.totalViews.toLocaleString()
      status = { label: 'Tracking', color: 'text-blue-500' }
      break
    case 'uniqueVisitors':
      currentValue = data.uniqueVisitors.toLocaleString()
      status = { label: 'Tracking', color: 'text-green-500' }
      break
    case 'avgLoadTime':
      currentValue = data.avgLoadTime ? `${data.avgLoadTime}ms` : 'N/A'
      status = getLoadTimeStatus(data.avgLoadTime)
      break
    case 'bounceRate':
      currentValue = `${data.bounceRate}%`
      status = getBounceRateStatus(data.bounceRate)
      break
  }

  // Calculate pages per visitor
  const pagesPerVisitor = data.uniqueVisitors > 0
    ? (data.totalViews / data.uniqueVisitors).toFixed(1)
    : '0'

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
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {config.title}
              </h2>
              <p className={`text-sm font-medium ${status.color}`}>
                {currentValue} • {status.label}
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
          {/* Description */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {config.description}
            </p>
          </div>

          {/* Explanation */}
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {config.explanation}
              </p>
            </div>
          </div>

          {/* Related Stats */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Related Metrics
            </label>
            <div className="grid grid-cols-2 gap-3">
              {stat === 'totalViews' && (
                <>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Unique Visitors</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {data.uniqueVisitors.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pages/Visitor</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {pagesPerVisitor}
                    </p>
                  </div>
                </>
              )}
              {stat === 'uniqueVisitors' && (
                <>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {data.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pages/Visitor</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {pagesPerVisitor}
                    </p>
                  </div>
                </>
              )}
              {stat === 'avgLoadTime' && (
                <>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bounce Rate</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {data.bounceRate}%
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {data.totalViews.toLocaleString()}
                    </p>
                  </div>
                </>
              )}
              {stat === 'bounceRate' && (
                <>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg Load Time</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {data.avgLoadTime ? `${data.avgLoadTime}ms` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pages/Visitor</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {pagesPerVisitor}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Good Values Reference */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Reference Values
            </label>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {config.goodValues}
              </p>
            </div>
          </div>

          {/* Top Pages (for views/visitors) */}
          {(stat === 'totalViews' || stat === 'uniqueVisitors') && data.topPages && data.topPages.length > 0 && (
            <div className="mb-4">
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                Top Pages
              </label>
              <div className="space-y-2">
                {data.topPages.slice(0, 5).map((page, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                      {page.path === '/' ? 'Home' : page.path}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <IoStatsChartOutline className="w-4 h-4" />
              Tips to Improve
            </label>
            <ul className="space-y-2">
              {config.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700">
            <a
              href="/fleet/monitoring"
              className="px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              View Monitoring
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
