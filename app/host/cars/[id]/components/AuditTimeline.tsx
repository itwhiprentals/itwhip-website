// app/host/cars/[id]/components/AuditTimeline.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  IoTimeOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoCloseCircleOutline,
  IoFilterOutline,
  IoCarOutline,
  IoDocumentTextOutline,
  IoCameraOutline,
  IoConstructOutline,
  IoCalendarOutline,
  IoAlertOutline,
  IoStarOutline,
  IoCashOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoLeafOutline,
  IoSpeedometerOutline,
  IoDocumentAttachOutline
} from 'react-icons/io5'

interface Activity {
  id: string
  type: string
  category: string
  action: string
  description: string
  performedBy: string
  performedByType: string
  severity: string
  metadata?: any
  oldValue?: any
  newValue?: any
  timestamp: Date | string
  createdAt: string
}

interface AuditTimelineProps {
  carId: string
}

export default function AuditTimeline({ carId }: AuditTimelineProps) {
  const [timeline, setTimeline] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [statistics, setStatistics] = useState<any>(null)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTimeline()
  }, [carId, selectedCategory, selectedSeverity])

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: '1',
        limit: '100'
      })

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      if (selectedSeverity !== 'all') {
        params.append('severity', selectedSeverity)
      }

      const response = await fetch(
        `/api/host/cars/${carId}/activity?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch timeline')
      }

      const data = await response.json()
      
      console.log('📊 Timeline data received:', data)

      setTimeline(data.timeline || [])
      setStatistics(data.statistics || null)
    } catch (err) {
      console.error('Error fetching timeline:', err)
      setError(err instanceof Error ? err.message : 'Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const toggleEventExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'VEHICLE':
        return <IoCarOutline className="h-5 w-5" />
      case 'DOCUMENT':
        return <IoDocumentTextOutline className="h-5 w-5" />
      case 'PHOTO':
        return <IoCameraOutline className="h-5 w-5" />
      case 'SERVICE':
        return <IoConstructOutline className="h-5 w-5" />
      case 'BOOKING':
        return <IoCalendarOutline className="h-5 w-5" />
      case 'CLAIM':
        return <IoAlertOutline className="h-5 w-5" />
      case 'REVIEW':
        return <IoStarOutline className="h-5 w-5" />
      case 'PAYOUT':
        return <IoCashOutline className="h-5 w-5" />
      case 'COMPLIANCE':
        return <IoShieldCheckmarkOutline className="h-5 w-5" />
      default:
        return <IoInformationCircleOutline className="h-5 w-5" />
    }
  }

  const getActionIcon = (action: string) => {
    // Special icons for specific actions
    switch (action) {
      case 'ESG_SCORE_UPDATED':
      case 'ESG_MILESTONE':
        return <IoLeafOutline className="h-5 w-5" />
      case 'MILEAGE_ANOMALY_DETECTED':
      case 'MILEAGE_ANOMALY_RESOLVED':
        return <IoSpeedometerOutline className="h-5 w-5" />
      case 'FNOL_SUBMITTED':
      case 'ADJUSTER_ASSIGNED':
      case 'CLAIM_SUBMITTED_TO_INSURER':
        return <IoDocumentAttachOutline className="h-5 w-5" />
      case 'CHECK_IN_PHOTOS_UPLOADED':
      case 'CHECK_OUT_PHOTOS_UPLOADED':
        return <IoCameraOutline className="h-5 w-5" />
      case 'COMMERCIAL_INSURANCE_EXPIRY_WARNING':
      case 'P2P_INSURANCE_EXPIRY_WARNING':
      case 'REGISTRATION_EXPIRY_WARNING':
        return <IoWarningOutline className="h-5 w-5" />
      case 'COMMERCIAL_INSURANCE_EXPIRED':
      case 'REGISTRATION_EXPIRED':
        return <IoCloseCircleOutline className="h-5 w-5" />
      default:
        return getCategoryIcon(action)
    }
  }

  const getCategoryColor = (category: string, severity?: string) => {
    // Override color based on severity for compliance events
    if (category === 'COMPLIANCE') {
      switch (severity) {
        case 'CRITICAL':
          return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        case 'ERROR':
          return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
        case 'WARNING':
          return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        default:
          return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
      }
    }

    switch (category) {
      case 'VEHICLE':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'DOCUMENT':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'PHOTO':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
      case 'SERVICE':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'BOOKING':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'CLAIM':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'PAYOUT':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'COMPLIANCE':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <IoCloseCircleOutline className="h-4 w-4 text-red-600" />
      case 'ERROR':
        return <IoAlertCircleOutline className="h-4 w-4 text-red-500" />
      case 'WARNING':
        return <IoWarningOutline className="h-4 w-4 text-yellow-500" />
      case 'INFO':
        return <IoInformationCircleOutline className="h-4 w-4 text-blue-500" />
      default:
        return <IoCheckmarkCircleOutline className="h-4 w-4 text-green-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Critical
          </span>
        )
      case 'ERROR':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
            Error
          </span>
        )
      case 'WARNING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Warning
          </span>
        )
      case 'INFO':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Info
          </span>
        )
      default:
        return null
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
    return date.toLocaleDateString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Group timeline by date
  const groupedTimeline = timeline.reduce((acc, event) => {
    const date = formatDate(event.createdAt)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {} as Record<string, Activity[]>)

  const categories = [
    { value: 'all', label: 'All Events', count: statistics?.totalEvents },
    { value: 'VEHICLE', label: 'Vehicle', count: statistics?.categoryBreakdown?.VEHICLE },
    { value: 'DOCUMENT', label: 'Documents', count: statistics?.categoryBreakdown?.DOCUMENT },
    { value: 'PHOTO', label: 'Photos', count: statistics?.categoryBreakdown?.PHOTO },
    { value: 'SERVICE', label: 'Service', count: statistics?.categoryBreakdown?.SERVICE },
    { value: 'BOOKING', label: 'Bookings', count: statistics?.categoryBreakdown?.BOOKING },
    { value: 'CLAIM', label: 'Claims', count: statistics?.categoryBreakdown?.CLAIM },
    { value: 'REVIEW', label: 'Reviews', count: statistics?.categoryBreakdown?.REVIEW },
    { value: 'PAYOUT', label: 'Payouts', count: statistics?.categoryBreakdown?.PAYOUT },
    { value: 'COMPLIANCE', label: 'Compliance', count: statistics?.categoryBreakdown?.COMPLIANCE }
  ]

  const severities = [
    { value: 'all', label: 'All Levels', count: statistics?.totalEvents },
    { value: 'INFO', label: 'Info', count: statistics?.severityBreakdown?.INFO },
    { value: 'WARNING', label: 'Warning', count: statistics?.severityBreakdown?.WARNING },
    { value: 'ERROR', label: 'Error', count: statistics?.severityBreakdown?.ERROR },
    { value: 'CRITICAL', label: 'Critical', count: statistics?.severityBreakdown?.CRITICAL }
  ]

  if (loading && timeline.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading timeline...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-red-200 dark:border-red-900">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <IoAlertCircleOutline className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters & Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <IoFilterOutline className="inline h-4 w-4 mr-1" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                  {cat.count ? ` (${cat.count})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <IoWarningOutline className="inline h-4 w-4 mr-1" />
              Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {severities.map(sev => (
                <option key={sev.value} value={sev.value}>
                  {sev.label}
                  {sev.count ? ` (${sev.count})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {statistics && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {statistics.totalEvents}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Total Events</div>
              </div>
              {statistics.dataSources && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {statistics.dataSources.bookings}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Trips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {statistics.dataSources.serviceRecords}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Services</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {statistics.dataSources.claims}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {statistics.dataSources.mileageAnomalies || 0}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Anomalies</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.keys(groupedTimeline).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700 text-center">
            <IoTimeOutline className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No activity found for the selected filters
            </p>
          </div>
        ) : (
          Object.entries(groupedTimeline).map(([date, events]) => (
            <div key={date} className="space-y-3">
              {/* Date Separator */}
              <div className="flex items-center gap-3">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent flex-1"></div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {date}
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent flex-1"></div>
              </div>

              {/* Events for this date */}
              {events.map((activity) => {
                const isExpanded = expandedEvents.has(activity.id)
                const hasMetadata = activity.metadata && Object.keys(activity.metadata).length > 0

                return (
                  <div
                    key={activity.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 p-2 rounded-lg ${getCategoryColor(activity.category, activity.severity)}`}>
                          {getActionIcon(activity.action)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(activity.category, activity.severity)}`}>
                              {activity.category}
                            </span>
                            {activity.severity !== 'INFO' && getSeverityBadge(activity.severity)}
                            {getSeverityIcon(activity.severity)}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(activity.createdAt)}
                            </span>
                          </div>

                          <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">
                            {activity.description}
                          </p>

                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <IoPersonOutline className="h-4 w-4" />
                              {activity.performedBy}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <IoTimeOutline className="h-4 w-4" />
                              {formatTimeAgo(activity.createdAt)}
                            </span>
                          </div>

                          {/* Expandable Metadata */}
                          {hasMetadata && (
                            <div className="mt-2">
                              <button
                                onClick={() => toggleEventExpanded(activity.id)}
                                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                              >
                                {isExpanded ? (
                                  <>
                                    <IoChevronUpOutline className="h-4 w-4" />
                                    Hide details
                                  </>
                                ) : (
                                  <>
                                    <IoChevronDownOutline className="h-4 w-4" />
                                    View details
                                  </>
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <div className="space-y-2 text-xs">
                                    {Object.entries(activity.metadata).map(([key, value]) => {
                                      // Skip rendering null/undefined values
                                      if (value === null || value === undefined) return null

                                      // Format the key (convert camelCase to Title Case)
                                      const formattedKey = key
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, str => str.toUpperCase())

                                      // Format the value
                                      let formattedValue: any = value
                                      if (typeof value === 'object' && !Array.isArray(value)) {
                                        formattedValue = JSON.stringify(value, null, 2)
                                      } else if (Array.isArray(value)) {
                                        formattedValue = value.join(', ')
                                      } else if (typeof value === 'boolean') {
                                        formattedValue = value ? 'Yes' : 'No'
                                      } else if (key.includes('Date') || key.includes('At')) {
                                        try {
                                          const date = new Date(value as string)
                                          formattedValue = date.toLocaleString()
                                        } catch {
                                          formattedValue = String(value)
                                        }
                                      }

                                      return (
                                        <div key={key} className="flex justify-between gap-2">
                                          <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {formattedKey}:
                                          </span>
                                          <span className="text-gray-600 dark:text-gray-400 text-right break-words">
                                            {String(formattedValue)}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Load More (if needed) */}
      {timeline.length >= 100 && (
        <div className="text-center">
          <button
            onClick={fetchTimeline}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load More Events
          </button>
        </div>
      )}
    </div>
  )
}