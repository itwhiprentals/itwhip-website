// app/components/claims/LossWageEligibility.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCashOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoTrophyOutline,
  IoInformationCircleOutline,
  IoCarSportOutline,
  IoWarningOutline,
  IoCalendarOutline,
} from 'react-icons/io5'

interface LossWageEligibilityProps {
  claimId: string
}

interface EligibilityData {
  eligible: boolean
  reason: string | null
  pathA: {
    qualified: boolean
    progress: {
      timeActive: {
        current: number
        required: number
        met: boolean
        percentage: number
      }
      trips: {
        current: number
        required: number
        met: boolean
        percentage: number
      }
    }
  }
  pathB: {
    qualified: boolean
    progress: {
      trips: {
        current: number
        required: number
        met: boolean
        percentage: number
      }
    }
  }
  cleanRecord: {
    met: boolean
    cancellations: {
      current: number
      allowed: number
      met: boolean
    }
    warnings: {
      current: number
      allowed: number
      met: boolean
    }
  }
  potentialPayout: number
  dailyRate: number
  firstBookingDate: string
  daysSinceFirstBooking: number
}

export default function LossWageEligibility({ claimId }: LossWageEligibilityProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<EligibilityData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchEligibility()
  }, [claimId])

  const fetchEligibility = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/claims/${claimId}/loss-wage-eligibility`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch eligibility')
      }

      const result = await response.json()
      setData(result)
    } catch (err: any) {
      console.error('Error fetching loss wage eligibility:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const ProgressBar = ({ 
    percentage, 
    label, 
    current, 
    required, 
    met 
  }: { 
    percentage: number
    label: string
    current: number
    required: number
    met: boolean
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className={`font-semibold ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
          {current}/{required}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 transition-all duration-500 rounded-full ${
            met 
              ? 'bg-green-500' 
              : percentage >= 50 
                ? 'bg-blue-500' 
                : 'bg-purple-500'
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-800 dark:text-red-300">
          Unable to load loss wage eligibility
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-sm border-2 border-purple-200 dark:border-purple-700 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            data.eligible 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {data.eligible ? (
              <IoTrophyOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <IoCarSportOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              ItWhip Loss Wage Protection
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <IoInformationCircleOutline className="w-4 h-4" />
              </button>
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {data.eligible 
                ? '✅ You qualify for loss wage protection!'
                : 'Keep hosting to unlock this benefit'}
            </p>
          </div>
        </div>

        {data.eligible && (
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Protected</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(data.potentialPayout)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">10 days</div>
          </div>
        )}
      </div>

      {/* Info Box */}
      {showDetails && (
        <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg p-3 space-y-2 text-xs">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>What is Loss Wage Protection?</strong>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            If your vehicle is in repair due to an approved claim, ItWhip compensates you for lost income at 25% of your daily rate for up to 10 days.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            <strong>How to Qualify:</strong>
          </p>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400 ml-4 list-disc">
            <li><strong>Path A:</strong> 6 months active + 10 completed trips</li>
            <li><strong>Path B:</strong> 50 completed trips in 6 months</li>
            <li>Clean record (max 3 cancellations, no warnings)</li>
          </ul>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              Your daily rate: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.dailyRate)}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              25% per day: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(Math.floor(data.dailyRate * 0.25))}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Max payout (10 days): <span className="font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(data.potentialPayout || Math.floor(data.dailyRate * 0.25 * 10))}</span>
            </p>
          </div>
        </div>
      )}

      {/* Status */}
      {data.eligible ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">
                Qualified via {data.pathA.qualified ? 'Path A' : 'Path B'}!
              </p>
              <p className="text-xs text-green-800 dark:text-green-300">
                If your vehicle requires repairs due to this claim, you're eligible for {formatCurrency(data.potentialPayout)} in loss wage compensation.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Path A Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${
                data.pathA.qualified ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                Path A: 6 Months Active + 10 Trips
              </h4>
              {data.pathA.qualified && (
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 ml-auto" />
              )}
            </div>
            <div className="space-y-2">
              <ProgressBar
                percentage={data.pathA.progress.timeActive.percentage}
                label="Time Active"
                current={data.daysSinceFirstBooking}
                required={180}
                met={data.pathA.progress.timeActive.met}
              />
              <ProgressBar
                percentage={data.pathA.progress.trips.percentage}
                label="Completed Trips"
                current={data.pathA.progress.trips.current}
                required={10}
                met={data.pathA.progress.trips.met}
              />
            </div>
            {!data.pathA.qualified && data.pathA.progress.timeActive.met && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                ⏰ Just {10 - data.pathA.progress.trips.current} more trip{10 - data.pathA.progress.trips.current !== 1 ? 's' : ''} to qualify!
              </p>
            )}
          </div>

          {/* Path B Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${
                data.pathB.qualified ? 'bg-green-500' : 'bg-purple-500'
              }`} />
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                Path B: 50 Trips in 6 Months
              </h4>
              {data.pathB.qualified && (
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 ml-auto" />
              )}
            </div>
            <ProgressBar
              percentage={data.pathB.progress.trips.percentage}
              label="Completed Trips (Last 6 Months)"
              current={data.pathB.progress.trips.current}
              required={50}
              met={data.pathB.progress.trips.met}
            />
          </div>

          {/* Clean Record */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.cleanRecord.met ? 'bg-green-500' : 'bg-red-500'
              }`} />
              Clean Record
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Host Cancellations</span>
                <span className={`font-semibold ${
                  data.cleanRecord.cancellations.met 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.cleanRecord.cancellations.current}/{data.cleanRecord.cancellations.allowed}
                  {data.cleanRecord.cancellations.met && ' ✓'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Warnings</span>
                <span className={`font-semibold ${
                  data.cleanRecord.warnings.met 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.cleanRecord.warnings.current} {data.cleanRecord.warnings.met && '✓'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* First Booking Date */}
      {!data.eligible && data.firstBookingDate && (
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <IoCalendarOutline className="w-3.5 h-3.5" />
          <span>
            Active since {formatDate(data.firstBookingDate)} ({data.daysSinceFirstBooking} days)
          </span>
        </div>
      )}

      {/* Potential Payout Preview */}
      {!data.eligible && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <IoCashOutline className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
              Unlock {formatCurrency(Math.floor(data.dailyRate * 0.25 * 10))} Protection
            </span>
          </div>
          <p className="text-xs text-purple-800 dark:text-purple-300">
            Complete your qualification path to earn loss wage compensation on future claims!
          </p>
        </div>
      )}
    </div>
  )
}