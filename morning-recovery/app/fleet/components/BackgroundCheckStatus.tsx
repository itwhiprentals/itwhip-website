// app/fleet/components/BackgroundCheckStatus.tsx
'use client'

import {
  IoCheckmarkCircle,
  IoTimeOutline,
  IoCloseCircle,
  IoAlertCircleOutline,
  IoShieldCheckmarkOutline,
  IoPersonOutline,
  IoCarOutline,
  IoCardOutline,
  IoWalletOutline
} from 'react-icons/io5'

interface BackgroundCheck {
  id: string
  hostId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  identityCheck?: 'PASS' | 'FAIL' | 'PENDING'
  dmvCheck?: 'PASS' | 'FAIL' | 'PENDING'
  criminalCheck?: 'PASS' | 'FAIL' | 'PENDING'
  creditCheck?: 'PASS' | 'FAIL' | 'PENDING'
  insuranceCheck?: 'PASS' | 'FAIL' | 'PENDING'
  startedAt?: string
  completedAt?: string
  estimatedCompletion?: string
  notes?: string
}

interface BackgroundCheckStatusProps {
  backgroundCheck: BackgroundCheck | null
  onInitiateCheck?: () => void
  onOverride?: (checkType: string) => void
  className?: string
}

export default function BackgroundCheckStatus({
  backgroundCheck,
  onInitiateCheck,
  onOverride,
  className = ''
}: BackgroundCheckStatusProps) {
  const getStatusIcon = (status?: 'PASS' | 'FAIL' | 'PENDING') => {
    switch (status) {
      case 'PASS':
        return <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
      case 'FAIL':
        return <IoCloseCircle className="w-5 h-5 text-red-600" />
      case 'PENDING':
        return <IoTimeOutline className="w-5 h-5 text-yellow-600 animate-pulse" />
      default:
        return <IoAlertCircleOutline className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status?: 'PASS' | 'FAIL' | 'PENDING') => {
    switch (status) {
      case 'PASS':
        return 'text-green-600 dark:text-green-400'
      case 'FAIL':
        return 'text-red-600 dark:text-red-400'
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const checks = [
    {
      id: 'identity',
      label: 'Identity Verification',
      icon: IoPersonOutline,
      status: backgroundCheck?.identityCheck,
      description: 'Verifies identity matches government ID'
    },
    {
      id: 'dmv',
      label: 'DMV Records',
      icon: IoCarOutline,
      status: backgroundCheck?.dmvCheck,
      description: 'Checks driving history and license validity'
    },
    {
      id: 'criminal',
      label: 'Criminal Background',
      icon: IoShieldCheckmarkOutline,
      status: backgroundCheck?.criminalCheck,
      description: 'Reviews criminal records and sex offender registry'
    },
    {
      id: 'insurance',
      label: 'Insurance Verification',
      icon: IoCardOutline,
      status: backgroundCheck?.insuranceCheck,
      description: 'Confirms insurance coverage'
    },
    {
      id: 'credit',
      label: 'Credit Check',
      icon: IoWalletOutline,
      status: backgroundCheck?.creditCheck,
      description: 'Optional for luxury vehicle hosts'
    }
  ]

  const completedChecks = checks.filter(c => c.status === 'PASS').length
  const totalChecks = checks.filter(c => c.status !== undefined).length
  const progressPercentage = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0

  if (!backgroundCheck) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <IoShieldCheckmarkOutline className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Background Check Started
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Initiate a background check to verify this host's credentials
          </p>
          {onInitiateCheck && (
            <button
              onClick={onInitiateCheck}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Start Background Check
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <IoShieldCheckmarkOutline className="w-5 h-5 mr-2 text-purple-600" />
            Background Check Status
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            backgroundCheck.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            backgroundCheck.status === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
            backgroundCheck.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {backgroundCheck.status.replace('_', ' ')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">
              {completedChecks} of {totalChecks} checks completed
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Timing Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
          {backgroundCheck.startedAt && (
            <span>Started: {new Date(backgroundCheck.startedAt).toLocaleDateString()}</span>
          )}
          {backgroundCheck.estimatedCompletion && backgroundCheck.status === 'IN_PROGRESS' && (
            <span>Est. completion: {new Date(backgroundCheck.estimatedCompletion).toLocaleDateString()}</span>
          )}
          {backgroundCheck.completedAt && (
            <span>Completed: {new Date(backgroundCheck.completedAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* Check Items */}
      <div className="p-6 space-y-4">
        {checks.map(check => {
          const Icon = check.icon
          return (
            <div
              key={check.id}
              className="flex items-start justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start space-x-3 flex-1">
                <Icon className={`w-5 h-5 mt-0.5 ${
                  check.status === 'PASS' ? 'text-green-600' :
                  check.status === 'FAIL' ? 'text-red-600' :
                  check.status === 'PENDING' ? 'text-yellow-600' :
                  'text-gray-400'
                }`} />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {check.label}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {check.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStatusIcon(check.status)}
                <span className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                  {check.status || 'Not Started'}
                </span>
                {check.status === 'FAIL' && onOverride && (
                  <button
                    onClick={() => onOverride(check.id)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Override
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Notes */}
      {backgroundCheck.notes && (
        <div className="px-6 pb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Additional Notes
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {backgroundCheck.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}