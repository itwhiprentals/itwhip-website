// app/fleet/guests/[id]/components/GuestStatusDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import QuickActions from './QuickActions'
import { IoCloseCircle } from 'react-icons/io5'

// SVG Icons
const ShieldCheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const AlertCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const BanIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
)

const DocumentTextIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ChevronRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

interface GuestStatusDashboardProps {
  guestId: string
  guestName: string
  onTabChange?: (tab: string) => void
}

interface StatusSummary {
  accountStatus: 'ACTIVE' | 'WARNED' | 'SOFT_SUSPENDED' | 'HARD_SUSPENDED' | 'BANNED'
  activeIssues: {
    warningCount: number
    warnings: Array<{
      id: string
      category: string
      reason: string
      daysRemaining: number
    }>
    suspension: {
      level: string
      reason: string
      daysRemaining: number | null
      autoReactivate: boolean
    } | null
  }
  appeals: {
    totalSubmitted: number
    pending: number
    underReview: number
    approved: number
    denied: number
    recentAppeals: Array<{
      id: string
      status: string
      submittedAt: string
      reason: string
    }>
  }
  restrictions: {
    canBookLuxury: boolean
    canBookPremium: boolean
    requiresManualApproval: boolean
    canInstantBook: boolean
  }
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  lastModeratedAt: string | null
  totalModerationActions: number
}

export default function GuestStatusDashboard({ 
  guestId, 
  guestName,
  onTabChange 
}: GuestStatusDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [statusSummary, setStatusSummary] = useState<StatusSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Force Clear Warnings State
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearReason, setClearReason] = useState('')
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    loadStatusSummary()
  }, [guestId])

  const loadStatusSummary = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/fleet/api/guests/${guestId}/status-summary?key=phoenix-fleet-2847`
      )

      if (!response.ok) {
        throw new Error('Failed to load status summary')
      }

      const data = await response.json()
      
      if (data.success && data.statusSummary) {
        setStatusSummary(data.statusSummary)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error loading status summary:', err)
      setError(err instanceof Error ? err.message : 'Failed to load status')
    } finally {
      setLoading(false)
    }
  }

  const handleForceClearWarnings = async () => {
    if (!clearReason.trim()) {
      alert('Please provide a reason for clearing warnings')
      return
    }

    setClearing(true)
    try {
      const response = await fetch(
        `/fleet/api/guests/${guestId}/clear-warnings?key=phoenix-fleet-2847`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: clearReason.trim(),
            clearedBy: 'fleet-admin@itwhip.com'
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to clear warnings')
      }

      const data = await response.json()
      alert(`Successfully cleared ${data.clearedCount} warning(s)!`)
      setShowClearModal(false)
      setClearReason('')
      loadStatusSummary() // Refresh the dashboard
    } catch (error) {
      console.error('Error clearing warnings:', error)
      alert('Failed to clear warnings. Please try again.')
    } finally {
      setClearing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-300',
          icon: 'text-green-600 dark:text-green-400'
        }
      case 'WARNED':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-700 dark:text-yellow-300',
          icon: 'text-yellow-600 dark:text-yellow-400'
        }
      case 'SOFT_SUSPENDED':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-700 dark:text-orange-300',
          icon: 'text-orange-600 dark:text-orange-400'
        }
      case 'HARD_SUSPENDED':
      case 'BANNED':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-300',
          icon: 'text-red-600 dark:text-red-400'
        }
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-700 dark:text-gray-300',
          icon: 'text-gray-600 dark:text-gray-400'
        }
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      case 'MEDIUM':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
      case 'LOW':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ')
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !statusSummary) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircleIcon className="w-5 h-5" />
          <div>
            <p className="font-medium">Failed to load status</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const statusColors = getStatusColor(statusSummary.accountStatus)
  const hasPendingAppeals = statusSummary.appeals.pending > 0 || statusSummary.appeals.underReview > 0
  const pendingCount = statusSummary.appeals.pending + statusSummary.appeals.underReview

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4" />
            Guest Status Overview
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskColor(statusSummary.riskLevel)}`}>
            {statusSummary.riskLevel} Risk
          </span>
        </div>
      </div>

      {/* Main Status Card */}
      <div className="p-4 space-y-4">
        {/* Account Status */}
        <div className={`rounded-lg border p-4 ${statusColors.bg} ${statusColors.border}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {statusSummary.accountStatus === 'ACTIVE' ? (
                <ShieldCheckIcon className={`w-5 h-5 ${statusColors.icon}`} />
              ) : statusSummary.accountStatus === 'BANNED' || statusSummary.accountStatus === 'HARD_SUSPENDED' ? (
                <BanIcon className={`w-5 h-5 ${statusColors.icon}`} />
              ) : (
                <AlertCircleIcon className={`w-5 h-5 ${statusColors.icon}`} />
              )}
              <div>
                <p className={`text-sm font-semibold ${statusColors.text}`}>
                  Account Status: {formatStatus(statusSummary.accountStatus)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {statusSummary.totalModerationActions} total moderation action{statusSummary.totalModerationActions !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Active Issues Summary */}
          {(statusSummary.activeIssues.warningCount > 0 || statusSummary.activeIssues.suspension) && (
            <div className="space-y-2 text-sm">
              {statusSummary.activeIssues.warningCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className={statusColors.text}>Active Warnings:</span>
                  <span className={`font-semibold ${statusColors.text}`}>
                    {statusSummary.activeIssues.warningCount}
                  </span>
                </div>
              )}
              
              {statusSummary.activeIssues.suspension && (
                <div className="flex items-center justify-between">
                  <span className={statusColors.text}>Suspension Level:</span>
                  <span className={`font-semibold ${statusColors.text}`}>
                    {statusSummary.activeIssues.suspension.level}
                    {statusSummary.activeIssues.suspension.daysRemaining && (
                      <span className="text-xs ml-1">
                        ({statusSummary.activeIssues.suspension.daysRemaining}d left)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Issues Details */}
        {statusSummary.activeIssues.warnings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Active Warnings
              </h4>
              <button
                onClick={() => setShowClearModal(true)}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <IoCloseCircle className="w-3 h-3" />
                Force Clear All
              </button>
            </div>
            
            {statusSummary.activeIssues.warnings.slice(0, 2).map((warning) => (
              <div
                key={warning.id}
                className="flex items-start justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {formatWarningCategory(warning.category)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {warning.reason}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-2">
                  <ClockIcon className="w-3 h-3" />
                  <span>{warning.daysRemaining}d</span>
                </div>
              </div>
            ))}
            
            {statusSummary.activeIssues.warnings.length > 2 && (
              <button
                onClick={() => onTabChange?.('moderation')}
                className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-1"
              >
                View all {statusSummary.activeIssues.warnings.length} warnings
                <ChevronRightIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Appeals Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Total Appeals</span>
              <DocumentTextIcon className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {statusSummary.appeals.totalSubmitted}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {statusSummary.appeals.approved} approved, {statusSummary.appeals.denied} denied
            </p>
          </div>

          {hasPendingAppeals ? (
            <button
              onClick={() => onTabChange?.('appeals')}
              className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Pending Review</span>
                <AlertCircleIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                {pendingCount}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5 flex items-center gap-1">
                Review now
                <ChevronRightIcon className="w-3 h-3" />
              </p>
            </button>
          ) : (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
                <ClockIcon className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                No pending appeals
              </p>
            </div>
          )}
        </div>

        {/* Restrictions */}
        {(!statusSummary.restrictions.canBookLuxury || 
          !statusSummary.restrictions.canBookPremium || 
          statusSummary.restrictions.requiresManualApproval) && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Active Restrictions
            </h4>
            <div className="space-y-1.5 text-sm">
              {!statusSummary.restrictions.canBookLuxury && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Luxury bookings disabled</span>
                </div>
              )}
              {!statusSummary.restrictions.canBookPremium && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Premium bookings disabled</span>
                </div>
              )}
              {statusSummary.restrictions.requiresManualApproval && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                  <span>Manual approval required</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <QuickActions
            guestId={guestId}
            guestName={guestName}
            hasPendingAppeals={hasPendingAppeals}
            pendingAppealsCount={pendingCount}
            hasActiveWarnings={statusSummary.activeIssues.warningCount > 0}
            warningCount={statusSummary.activeIssues.warningCount}
            accountStatus={statusSummary.accountStatus}
            onRefresh={loadStatusSummary}
          />
        </div>
      </div>

      {/* Force Clear Warnings Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Force Clear All Warnings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Guest: {guestName}
                </p>
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                disabled={clearing}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <IoCloseCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-semibold">Warning!</p>
                  <p>This will immediately expire all {statusSummary.activeIssues.warningCount} active warning{statusSummary.activeIssues.warningCount !== 1 ? 's' : ''} for this guest. This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Reason for Clearing Warnings *
              </label>
              <textarea
                value={clearReason}
                onChange={(e) => setClearReason(e.target.value)}
                placeholder="e.g., Appeal approved, situation resolved, administrative error, etc."
                rows={3}
                disabled={clearing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                disabled={clearing}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleForceClearWarnings}
                disabled={clearing || !clearReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clearing ? 'Clearing...' : 'Yes, Clear All Warnings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function
function formatWarningCategory(category: string): string {
  const categories: Record<string, string> = {
    'LATE_RETURN': 'Late Return',
    'LATE_RETURNS': 'Late Returns',
    'NO_SHOW': 'No Show',
    'VEHICLE_DAMAGE': 'Vehicle Damage',
    'POLICY_VIOLATION': 'Policy Violation',
    'POLICY_VIOLATIONS': 'Policy Violations',
    'PAYMENT_ISSUE': 'Payment Issue',
    'PAYMENT_ISSUES': 'Payment Issues',
    'INAPPROPRIATE_BEHAVIOR': 'Inappropriate Behavior',
    'CLEANLINESS_ISSUES': 'Cleanliness Issues',
    'MILEAGE_VIOLATIONS': 'Mileage Violations',
    'FRAUDULENT_ACTIVITY': 'Fraudulent Activity',
    'COMMUNICATION_ISSUES': 'Communication Issues',
    'UNAUTHORIZED_DRIVER': 'Unauthorized Driver',
    'SMOKING_VIOLATION': 'Smoking Violation',
    'PET_VIOLATION': 'Pet Violation',
    'FUEL_VIOLATIONS': 'Fuel Violations',
    'DOCUMENTATION_ISSUES': 'Documentation Issues'
  }
  return categories[category] || category
}