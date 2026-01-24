// app/fleet/monitoring/components/SystemHealthDetailModal.tsx
// Modal showing detailed information about a system health metric with diagnosis and fixes

'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoSpeedometerOutline,
  IoTimeOutline,
  IoCloudOutline,
  IoTrendingUpOutline,
  IoShieldOutline,
  IoEyeOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoConstructOutline,
  IoInformationCircleOutline,
  IoFlashOutline,
  IoServerOutline
} from 'react-icons/io5'

export type MetricType = 'uptime' | 'database' | 'p95' | 'avgLoadTime' | 'errorRate' | 'pageViews' | 'criticalErrors' | 'activeAlerts'

interface SystemHealth {
  avgLoadTime: number | null
  totalPageViews: number
  criticalErrors: number
  alertsActive: number
  p95ResponseTime?: number | null
  errorRate?: number
  dbStatus?: 'healthy' | 'degraded' | 'down'
  dbLatency?: number
  uptimePercent?: number
  lastChecked?: string
}

interface SystemHealthDetailModalProps {
  metric: MetricType | null
  health: SystemHealth
  onClose: () => void
}

const metricConfig: Record<MetricType, {
  title: string
  icon: typeof IoSpeedometerOutline
  color: string
  description: string
  explanation: string
  goodValues: string
  possibleCauses: string[]
  fixes: string[]
}> = {
  uptime: {
    title: 'Uptime',
    icon: IoTrendingUpOutline,
    color: 'text-green-500',
    description: 'The percentage of time your system has been operational.',
    explanation: 'Uptime is calculated based on the absence of critical system errors and database downtime. Industry standard for production systems is 99.9% (three nines) or higher.',
    goodValues: '≥99.9% is excellent, ≥99% is good, <99% needs attention',
    possibleCauses: [
      'Server or infrastructure failures',
      'Database connection issues',
      'Network connectivity problems',
      'Resource exhaustion (memory, CPU, disk)',
      'Deployment issues or misconfigurations'
    ],
    fixes: [
      'Review server logs for errors during downtime periods',
      'Set up monitoring and alerting for proactive detection',
      'Implement redundancy and failover mechanisms',
      'Consider auto-scaling to handle traffic spikes',
      'Review deployment processes to minimize downtime'
    ]
  },
  database: {
    title: 'Database Status',
    icon: IoCloudOutline,
    color: 'text-purple-500',
    description: 'The current health and responsiveness of your database connection.',
    explanation: 'Database latency is measured by the round-trip time to complete a query. High latency affects all operations that depend on the database.',
    goodValues: '<50ms is excellent, <200ms is good, >500ms is slow',
    possibleCauses: [
      'Database server overload',
      'Unoptimized queries (missing indexes)',
      'Network latency to database server',
      'Connection pool exhaustion',
      'Large dataset without proper pagination'
    ],
    fixes: [
      'Add indexes to frequently queried columns',
      'Optimize slow queries using EXPLAIN',
      'Increase connection pool size if needed',
      'Consider read replicas for read-heavy workloads',
      'Implement caching for frequently accessed data',
      'Review and optimize N+1 query patterns'
    ]
  },
  p95: {
    title: 'P95 Response Time',
    icon: IoTimeOutline,
    color: 'text-blue-500',
    description: '95th percentile of response times - 95% of requests complete faster than this.',
    explanation: 'P95 is more useful than average because it shows the experience of your slowest users (excluding extreme outliers). If your P95 is 500ms, 95% of users experience a response time of 500ms or less.',
    goodValues: '<200ms is excellent, <500ms is good, >1000ms needs attention',
    possibleCauses: [
      'Slow database queries',
      'Third-party API latency',
      'Missing caching',
      'Unoptimized code or algorithms',
      'Server resource constraints'
    ],
    fixes: [
      'Implement response caching (Redis, CDN)',
      'Optimize database queries and add indexes',
      'Use async processing for heavy operations',
      'Profile and optimize slow endpoints',
      'Consider code splitting and lazy loading',
      'Review and optimize third-party API calls'
    ]
  },
  avgLoadTime: {
    title: 'Average Load Time',
    icon: IoSpeedometerOutline,
    color: 'text-cyan-500',
    description: 'The average time it takes for pages to fully load.',
    explanation: 'Load time includes time to first byte (TTFB), resource loading, and rendering. It directly impacts user experience and SEO rankings.',
    goodValues: '<200ms is excellent, <500ms is good, >1000ms is slow, >2000ms is critical',
    possibleCauses: [
      'Large JavaScript bundles',
      'Unoptimized images',
      'Too many HTTP requests',
      'Slow server response time',
      'No compression (gzip/brotli)',
      'Render-blocking resources'
    ],
    fixes: [
      'Enable compression (gzip/brotli)',
      'Optimize and lazy-load images',
      'Implement code splitting',
      'Use a CDN for static assets',
      'Minimize render-blocking CSS/JS',
      'Enable browser caching',
      'Consider server-side rendering for critical pages'
    ]
  },
  errorRate: {
    title: 'Error Rate',
    icon: IoShieldOutline,
    color: 'text-red-500',
    description: 'The percentage of requests that result in errors (4xx, 5xx responses).',
    explanation: 'Error rate is calculated as (failed requests / total requests) × 100. A healthy system should have <1% error rate.',
    goodValues: '0% is ideal, <1% is acceptable, >5% needs investigation, >10% is critical',
    possibleCauses: [
      'Application bugs or exceptions',
      'Database connection failures',
      'Third-party service outages',
      'Invalid user input not being handled',
      'Resource exhaustion',
      'Rate limiting or blocked requests'
    ],
    fixes: [
      'Review error logs to identify patterns',
      'Add proper error handling and fallbacks',
      'Implement retry logic for transient failures',
      'Set up proper input validation',
      'Add circuit breakers for external services',
      'Increase logging for better debugging'
    ]
  },
  pageViews: {
    title: 'Page Views',
    icon: IoEyeOutline,
    color: 'text-indigo-500',
    description: 'Total number of pages viewed during the selected time period.',
    explanation: 'Page views indicate overall traffic and engagement. Sudden changes (increases or decreases) may indicate marketing campaigns, SEO changes, or technical issues.',
    goodValues: 'Depends on your baseline. Look for consistent growth trends.',
    possibleCauses: [
      'Marketing campaigns or viral content',
      'SEO improvements or penalties',
      'Bot traffic or scraping',
      'Technical issues blocking tracking',
      'Seasonal variations'
    ],
    fixes: [
      'Compare with historical data for anomalies',
      'Filter out bot traffic in analytics',
      'Review marketing campaign effectiveness',
      'Check for tracking script issues',
      'Monitor referrer sources for unusual patterns'
    ]
  },
  criticalErrors: {
    title: 'Critical Events',
    icon: IoWarningOutline,
    color: 'text-red-500',
    description: 'Number of high-severity security or system events detected.',
    explanation: 'Critical events include security threats, system failures, and other incidents requiring immediate attention. Zero is the goal.',
    goodValues: '0 is ideal. Any critical events should be investigated immediately.',
    possibleCauses: [
      'Security attacks (brute force, injection attempts)',
      'System failures or crashes',
      'Database connection issues',
      'Third-party service failures',
      'Configuration errors'
    ],
    fixes: [
      'Review each critical event in detail',
      'Implement additional security measures',
      'Add rate limiting for repeated attacks',
      'Set up automated blocking rules',
      'Create runbooks for common incidents',
      'Consider a WAF (Web Application Firewall)'
    ]
  },
  activeAlerts: {
    title: 'Active Alerts',
    icon: IoFlashOutline,
    color: 'text-orange-500',
    description: 'Number of alerts currently requiring attention.',
    explanation: 'Active alerts are system-generated warnings about issues that need to be addressed. They can be acknowledged to track progress.',
    goodValues: '0 is ideal. Acknowledge and resolve alerts promptly.',
    possibleCauses: [
      'System health thresholds exceeded',
      'Security incidents detected',
      'Performance degradation',
      'Service availability issues',
      'Scheduled maintenance'
    ],
    fixes: [
      'Review each alert and assess severity',
      'Address root causes, not just symptoms',
      'Acknowledge alerts youre working on',
      'Resolve alerts once issues are fixed',
      'Fine-tune alert thresholds if too noisy'
    ]
  }
}

function getStatusColor(metric: MetricType, health: SystemHealth): { status: 'good' | 'warning' | 'critical', color: string } {
  switch (metric) {
    case 'uptime':
      if (!health.uptimePercent) return { status: 'warning', color: 'text-gray-400' }
      if (health.uptimePercent >= 99.9) return { status: 'good', color: 'text-green-500' }
      if (health.uptimePercent >= 99) return { status: 'warning', color: 'text-yellow-500' }
      return { status: 'critical', color: 'text-red-500' }
    case 'database':
      if (health.dbStatus === 'healthy') return { status: 'good', color: 'text-green-500' }
      if (health.dbStatus === 'degraded') return { status: 'warning', color: 'text-yellow-500' }
      return { status: 'critical', color: 'text-red-500' }
    case 'p95':
      if (!health.p95ResponseTime) return { status: 'warning', color: 'text-gray-400' }
      if (health.p95ResponseTime < 200) return { status: 'good', color: 'text-green-500' }
      if (health.p95ResponseTime < 500) return { status: 'good', color: 'text-green-500' }
      if (health.p95ResponseTime < 1000) return { status: 'warning', color: 'text-yellow-500' }
      return { status: 'critical', color: 'text-red-500' }
    case 'avgLoadTime':
      if (!health.avgLoadTime) return { status: 'warning', color: 'text-gray-400' }
      if (health.avgLoadTime < 200) return { status: 'good', color: 'text-green-500' }
      if (health.avgLoadTime < 500) return { status: 'good', color: 'text-green-500' }
      if (health.avgLoadTime < 1000) return { status: 'warning', color: 'text-yellow-500' }
      return { status: 'critical', color: 'text-red-500' }
    case 'errorRate':
      if (!health.errorRate || health.errorRate === 0) return { status: 'good', color: 'text-green-500' }
      if (health.errorRate < 1) return { status: 'good', color: 'text-green-500' }
      if (health.errorRate < 5) return { status: 'warning', color: 'text-yellow-500' }
      return { status: 'critical', color: 'text-red-500' }
    case 'pageViews':
      return { status: 'good', color: 'text-indigo-500' } // Page views don't have a "bad" state
    case 'criticalErrors':
      if (health.criticalErrors === 0) return { status: 'good', color: 'text-green-500' }
      if (health.criticalErrors < 5) return { status: 'warning', color: 'text-orange-500' }
      return { status: 'critical', color: 'text-red-500' }
    case 'activeAlerts':
      if (health.alertsActive === 0) return { status: 'good', color: 'text-green-500' }
      if (health.alertsActive < 3) return { status: 'warning', color: 'text-orange-500' }
      return { status: 'critical', color: 'text-red-500' }
    default:
      return { status: 'good', color: 'text-gray-500' }
  }
}

function getCurrentValue(metric: MetricType, health: SystemHealth): string {
  switch (metric) {
    case 'uptime':
      return health.uptimePercent !== undefined ? `${health.uptimePercent}%` : 'Unknown'
    case 'database':
      return health.dbStatus ? `${health.dbStatus} (${health.dbLatency}ms)` : 'Unknown'
    case 'p95':
      return health.p95ResponseTime ? `${health.p95ResponseTime}ms` : 'No data'
    case 'avgLoadTime':
      return health.avgLoadTime ? `${health.avgLoadTime}ms` : 'No data'
    case 'errorRate':
      return health.errorRate !== undefined ? `${health.errorRate}%` : 'No data'
    case 'pageViews':
      return health.totalPageViews.toLocaleString()
    case 'criticalErrors':
      return health.criticalErrors.toString()
    case 'activeAlerts':
      return health.alertsActive.toString()
    default:
      return 'Unknown'
  }
}

export default function SystemHealthDetailModal({ metric, health, onClose }: SystemHealthDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (metric) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [metric])

  if (!metric) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const config = metricConfig[metric]
  const Icon = config.icon
  const { status, color } = getStatusColor(metric, health)
  const currentValue = getCurrentValue(metric, health)

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-200 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b dark:border-gray-700 ${
          status === 'good' ? 'bg-green-50 dark:bg-green-900/10' :
          status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10' :
          'bg-red-50 dark:bg-red-900/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              status === 'good' ? 'bg-green-100 dark:bg-green-900/30' :
              status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              'bg-red-100 dark:bg-red-900/30'
            }`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {config.title}
              </h2>
              <p className={`text-sm font-medium ${color}`}>
                Current: {currentValue}
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
          {/* Status Banner */}
          <div className={`mb-4 p-3 rounded-lg ${
            status === 'good' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
            status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
            'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {status === 'good' ? (
                <>
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    This metric is within healthy range
                  </span>
                </>
              ) : status === 'warning' ? (
                <>
                  <IoWarningOutline className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    This metric needs attention
                  </span>
                </>
              ) : (
                <>
                  <IoWarningOutline className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    This metric is in critical state - immediate action recommended
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              What is this?
            </label>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
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

          {/* Good Values */}
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

          {/* Possible Causes */}
          {status !== 'good' && (
            <div className="mb-4">
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <IoInformationCircleOutline className="w-4 h-4" />
                Possible Causes
              </label>
              <ul className="space-y-2">
                {config.possibleCauses.map((cause, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Fixes */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <IoConstructOutline className="w-4 h-4" />
              {status === 'good' ? 'Best Practices' : 'Recommended Fixes'}
            </label>
            <ul className="space-y-2">
              {config.fixes.map((fix, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{fix}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700">
            <a
              href="/fleet/analytics"
              className="px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              View Analytics
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
