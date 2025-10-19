// app/admin/components/BackgroundCheckViewer.tsx
'use client'

import { useState } from 'react'
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoPersonOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoRefreshOutline,
  IoWarningOutline
} from 'react-icons/io5'

interface BackgroundCheck {
  id: string
  hostId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  initiatedAt?: string
  completedAt?: string
  checks: {
    identity: CheckDetail
    dmv: CheckDetail
    criminal: CheckDetail
    insurance: CheckDetail
    credit?: CheckDetail
  }
  overallResult?: 'PASS' | 'FAIL' | 'MANUAL_REVIEW'
  flags?: string[]
  notes?: string
}

interface CheckDetail {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  result?: 'PASS' | 'FAIL' | 'PENDING'
  score?: number
  details?: any
  completedAt?: string
  estimatedCompletion?: string
  flags?: string[]
  errorMessage?: string
}

interface BackgroundCheckViewerProps {
  backgroundCheck: BackgroundCheck | null
  hostId: string
  onRefresh?: () => void
  onManualOverride?: (checkType: string, newResult: 'PASS' | 'FAIL') => Promise<void>
  onInitiateCheck?: () => Promise<void>
  allowOverride?: boolean
}

const CHECK_TYPES = [
  {
    id: 'identity',
    label: 'Identity Verification',
    description: 'Validates identity against government databases',
    icon: IoPersonOutline,
    estimatedTime: '2-5 minutes'
  },
  {
    id: 'dmv',
    label: 'DMV Records',
    description: 'Driving history, license validity, violations',
    icon: IoCarOutline,
    estimatedTime: '1-2 days'
  },
  {
    id: 'criminal',
    label: 'Criminal Background',
    description: 'Criminal records and sex offender registry',
    icon: IoShieldCheckmarkOutline,
    estimatedTime: '3-5 days'
  },
  {
    id: 'insurance',
    label: 'Insurance Verification',
    description: 'Validates insurance coverage and history',
    icon: IoDocumentTextOutline,
    estimatedTime: '1-2 days'
  },
  {
    id: 'credit',
    label: 'Credit Check',
    description: 'Credit score and financial history (luxury vehicles only)',
    icon: IoCashOutline,
    estimatedTime: '1-2 days'
  }
]

export default function BackgroundCheckViewer({
  backgroundCheck,
  hostId,
  onRefresh,
  onManualOverride,
  onInitiateCheck,
  allowOverride = false
}: BackgroundCheckViewerProps) {
  const [expandedChecks, setExpandedChecks] = useState<string[]>([])
  const [overriding, setOverriding] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const toggleExpanded = (checkId: string) => {
    setExpandedChecks(prev =>
      prev.includes(checkId)
        ? prev.filter(id => id !== checkId)
        : [...prev, checkId]
    )
  }

  const handleRefresh = async () => {
    if (!onRefresh) return
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  const handleManualOverride = async (checkType: string, newResult: 'PASS' | 'FAIL') => {
    if (!onManualOverride) return
    
    if (!confirm(`Are you sure you want to manually override this check to ${newResult}? This action will be logged.`)) {
      return
    }

    setOverriding(checkType)
    try {
      await onManualOverride(checkType, newResult)
    } finally {
      setOverriding(null)
    }
  }

  const getStatusIcon = (status: string, result?: string) => {
    if (status === 'COMPLETED') {
      if (result === 'PASS') {
        return <IoCheckmarkCircleOutline className="w-6 h-6 text-green-500" />
      } else if (result === 'FAIL') {
        return <IoCloseCircleOutline className="w-6 h-6 text-red-500" />
      }
    }
    if (status === 'IN_PROGRESS') {
      return (
        <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      )
    }
    if (status === 'FAILED') {
      return <IoAlertCircleOutline className="w-6 h-6 text-red-500" />
    }
    return <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
  }

  const getStatusColor = (status: string, result?: string) => {
    if (status === 'COMPLETED') {
      if (result === 'PASS') return 'text-green-600 dark:text-green-400'
      if (result === 'FAIL') return 'text-red-600 dark:text-red-400'
    }
    if (status === 'IN_PROGRESS') return 'text-blue-600 dark:text-blue-400'
    if (status === 'FAILED') return 'text-red-600 dark:text-red-400'
    return 'text-gray-500 dark:text-gray-400'
  }

  const getStatusLabel = (status: string, result?: string) => {
    if (status === 'COMPLETED') {
      if (result === 'PASS') return 'Passed'
      if (result === 'FAIL') return 'Failed'
      return 'Completed'
    }
    if (status === 'IN_PROGRESS') return 'In Progress'
    if (status === 'FAILED') return 'Error'
    return 'Not Started'
  }

  const getOverallStatus = () => {
    if (!backgroundCheck) return null
    
    const { checks } = backgroundCheck
    const checkList = [checks.identity, checks.dmv, checks.criminal, checks.insurance]
    if (checks.credit) checkList.push(checks.credit)

    const allCompleted = checkList.every(c => c.status === 'COMPLETED')
    const anyFailed = checkList.some(c => c.result === 'FAIL')
    const anyInProgress = checkList.some(c => c.status === 'IN_PROGRESS')

    if (anyInProgress) return 'IN_PROGRESS'
    if (allCompleted && !anyFailed) return 'PASS'
    if (anyFailed) return 'FAIL'
    return 'PENDING'
  }

  // No background check initiated
  if (!backgroundCheck) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <IoShieldCheckmarkOutline className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Background Check Not Started
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Initiate a background check to verify the host's identity, driving history, and criminal records.
          </p>
          {onInitiateCheck && (
            <button
              onClick={onInitiateCheck}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <IoShieldCheckmarkOutline className="w-5 h-5" />
              Initiate Background Check
            </button>
          )}
        </div>
      </div>
    )
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <div className={`rounded-xl border-2 p-6 ${
        overallStatus === 'PASS'
          ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
          : overallStatus === 'FAIL'
          ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
          : overallStatus === 'IN_PROGRESS'
          ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {overallStatus === 'PASS' && <IoCheckmarkCircleOutline className="w-12 h-12 text-green-600 dark:text-green-400" />}
              {overallStatus === 'FAIL' && <IoCloseCircleOutline className="w-12 h-12 text-red-600 dark:text-red-400" />}
              {overallStatus === 'IN_PROGRESS' && (
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
              {overallStatus === 'PENDING' && <IoTimeOutline className="w-12 h-12 text-gray-400" />}
            </div>
            <div>
              <h3 className={`text-xl font-bold mb-1 ${
                overallStatus === 'PASS'
                  ? 'text-green-900 dark:text-green-100'
                  : overallStatus === 'FAIL'
                  ? 'text-red-900 dark:text-red-100'
                  : overallStatus === 'IN_PROGRESS'
                  ? 'text-blue-900 dark:text-blue-100'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {overallStatus === 'PASS' && 'Background Check Passed'}
                {overallStatus === 'FAIL' && 'Background Check Failed'}
                {overallStatus === 'IN_PROGRESS' && 'Background Check In Progress'}
                {overallStatus === 'PENDING' && 'Background Check Pending'}
              </h3>
              <div className="space-y-1 text-sm">
                {backgroundCheck.initiatedAt && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Initiated: {new Date(backgroundCheck.initiatedAt).toLocaleString()}
                  </p>
                )}
                {backgroundCheck.completedAt && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Completed: {new Date(backgroundCheck.completedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh status"
            >
              <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Flags */}
        {backgroundCheck.flags && backgroundCheck.flags.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Issues Detected
                </p>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  {backgroundCheck.flags.map((flag, index) => (
                    <li key={index}>• {flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Admin Notes */}
        {backgroundCheck.notes && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Admin Notes
            </p>
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {backgroundCheck.notes}
            </p>
          </div>
        )}
      </div>

      {/* Individual Checks */}
      <div className="space-y-3">
        {CHECK_TYPES.map((checkType) => {
          const check = backgroundCheck.checks[checkType.id as keyof typeof backgroundCheck.checks] as CheckDetail | undefined
          if (!check && checkType.id === 'credit') return null // Credit check is optional

          const isExpanded = expandedChecks.includes(checkType.id)
          const Icon = checkType.icon

          return (
            <div
              key={checkType.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Check Header */}
              <button
                onClick={() => toggleExpanded(checkType.id)}
                className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Icon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                
                <div className="flex-1 text-left min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {checkType.label}
                    {check?.flags && check.flags.length > 0 && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                        {check.flags.length} flag{check.flags.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {checkType.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {check ? (
                    <>
                      {getStatusIcon(check.status, check.result)}
                      <span className={`text-sm font-medium ${getStatusColor(check.status, check.result)}`}>
                        {getStatusLabel(check.status, check.result)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Not Started</span>
                  )}
                  
                  {isExpanded ? (
                    <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                  ) : (
                    <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && check && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                  {/* Score */}
                  {check.score !== undefined && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Score
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              check.score >= 80
                                ? 'bg-green-500'
                                : check.score >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${check.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[3rem] text-right">
                          {check.score}/100
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Estimated Completion */}
                  {check.status === 'IN_PROGRESS' && check.estimatedCompletion && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <IoTimeOutline className="w-4 h-4" />
                      <span>Estimated completion: {check.estimatedCompletion}</span>
                    </div>
                  )}

                  {/* Flags */}
                  {check.flags && check.flags.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Flags
                      </p>
                      <ul className="space-y-1">
                        {check.flags.map((flag, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                            <IoAlertCircleOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Error Message */}
                  {check.errorMessage && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Error:</strong> {check.errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  {check.details && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Details
                      </p>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                          {JSON.stringify(check.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Completed At */}
                  {check.completedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Completed: {new Date(check.completedAt).toLocaleString()}
                    </p>
                  )}

                  {/* Manual Override */}
                  {allowOverride && check.status === 'COMPLETED' && onManualOverride && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Manual Override
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleManualOverride(checkType.id, 'PASS')}
                          disabled={overriding === checkType.id || check.result === 'PASS'}
                          className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          Override to PASS
                        </button>
                        <button
                          onClick={() => handleManualOverride(checkType.id, 'FAIL')}
                          disabled={overriding === checkType.id || check.result === 'FAIL'}
                          className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          Override to FAIL
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Manual overrides are logged and auditable
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}