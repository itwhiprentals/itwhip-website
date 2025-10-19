// app/(guest)/profile/components/tabs/StatusTab.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  IoShieldCheckmarkOutline, 
  IoWarningOutline, 
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoDocumentTextOutline,
  IoBanOutline,
  IoLockClosedOutline,
  IoInformationCircleOutline,
  IoDocumentsOutline,
  IoImageOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoChatbubbleEllipsesOutline,
  IoDownloadOutline,
  IoHelpCircleOutline
} from 'react-icons/io5'
import AppealBottomSheet from '@/app/components/moderation/AppealBottomSheet'

interface StatusTabProps {
  guestId: string
}

interface StatusData {
  summary: {
    status: string
    warningCount: number
    restrictionCount: number
    healthScore: number
    healthStatus: string
  }
  timeline: TimelineEvent[]
  activeRestrictions: ActiveRestriction[]
  recentNotifications: Notification[]
}

interface TimelineEvent {
  id: string
  date: string
  time: string
  icon: string
  title: string
  description: string
  color: string
  action?: string
  category?: string
}

interface ActiveRestriction {
  type: string
  reason: string
  appliedAt: string
  expiresAt: string | null
  daysRemaining: number | null
}

interface Notification {
  id: string
  type: string
  subject: string
  sentAt: string
  method: string
  status: string
}

interface AppealEligibility {
  canAppeal: boolean
  reason?: string
  appealsUsed: number
  maxAppeals: number
  remainingAppeals?: number
  existingAppeal?: any
  allAppeals?: any[]
  isCleared?: boolean
  hasDeniedAppeal?: boolean
}

interface Warning {
  id: string
  category: string | null
  reason: string
  issuedAt: string
  expiresAt: string | null
  daysRemaining: number | null
  appealEligibility: AppealEligibility
  hasDeniedAppeal?: boolean
}

interface Suspension {
  id: string
  level: string
  reason: string
  suspendedAt: string
  expiresAt: string | null
  daysRemaining: number | null
  isPermanent: boolean
  appealEligibility: AppealEligibility
}

interface ModerationData {
  success: boolean
  hasActiveIssues: boolean
  accountStatus: string
  activeWarningCount: number
  totalHistoricalWarnings: number
  suspension?: Suspension
  warnings?: Warning[]
  restrictions: {
    canBookLuxury: boolean
    canBookPremium: boolean
    requiresManualApproval: boolean
    canInstantBook: boolean
  }
  moderationHistory?: any[]
}

interface Appeal {
  id: string
  status: string
  moderationId: string
  moderationCategory: string
  reason: string
  submittedAt: string
  reviewedAt: string | null
  reviewNotes: string | null
  reviewedBy: string | null
  evidence: Array<{
    url: string
    type: string
  }>
}

interface AppealLimit {
  totalSubmitted: number
  limit: number
  remainingAppeals: number
  canSubmitMore: boolean
}

interface AppealNotification {
  id: string
  type: string
  message: string | null
  seen: boolean
  createdAt: string
  appealId: string
}

export default function StatusTab({ guestId }: StatusTabProps) {
  const [loading, setLoading] = useState(true)
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [moderationData, setModerationData] = useState<ModerationData | null>(null)
  const [allAppeals, setAllAppeals] = useState<Appeal[]>([])
  const [appealLimit, setAppealLimit] = useState<AppealLimit | null>(null)
  const [expandedAppeal, setExpandedAppeal] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [appealNotifications, setAppealNotifications] = useState<AppealNotification[]>([])
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [guestId])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [statusRes, moderationRes, appealsRes, notificationsRes] = await Promise.all([
        fetch('/api/guest/profile-status', { credentials: 'include' }),
        fetch('/api/guest/moderation', { credentials: 'include' }),
        fetch('/api/guest/appeals', { credentials: 'include' }),
        fetch('/api/guest/appeal-notifications', { credentials: 'include' })
      ])

      if (!statusRes.ok || !moderationRes.ok || !appealsRes.ok) {
        throw new Error('Failed to fetch status data')
      }

      const [statusData, moderationData, appealsData, notificationsData] = await Promise.all([
        statusRes.json(),
        moderationRes.json(),
        appealsRes.json(),
        notificationsRes.ok ? notificationsRes.json() : { notifications: [] }
      ])

      // Sort timeline by date (newest first)
      if (statusData.timeline) {
        statusData.timeline.sort((a: TimelineEvent, b: TimelineEvent) => {
          const dateA = new Date(a.date + ' ' + a.time)
          const dateB = new Date(b.date + ' ' + b.time)
          return dateB.getTime() - dateA.getTime()
        })
      }

      setStatusData(statusData)
      setModerationData(moderationData)
      setAllAppeals(appealsData.appeals || [])
      setAppealLimit(appealsData.appealLimit || appealsData.appealLimits || null)
      
      // Safely handle notifications data structure
      const notifications = Array.isArray(notificationsData.notifications) 
        ? notificationsData.notifications 
        : []
      setAppealNotifications(notifications)
      
      setError(null)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Unable to load account status')
    } finally {
      setLoading(false)
    }
  }

  const dismissNotification = async (notificationId: string) => {
    try {
      const res = await fetch('/api/guest/appeal-notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId })
      })

      if (res.ok) {
        setAppealNotifications(prev => prev.filter(n => n.id !== notificationId))
      }
    } catch (err) {
      console.error('Failed to dismiss notification:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-2.5">
          <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-0.5">Error Loading Status</h3>
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!statusData || !moderationData) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">No status data available</p>
      </div>
    )
  }

  const { summary, timeline, activeRestrictions, recentNotifications } = statusData
  
  // ✅ FIX: Don't filter out warnings - API already returns only active warnings
  // The API now properly handles warnings with denied appeals
  const activeWarnings = moderationData.warnings || []
  
  const activeSuspension = moderationData.suspension || null
  const activeWarningCount = activeWarnings.length
  
  // Split appeals by status
  const pendingAppeals = allAppeals.filter(
    appeal => appeal.status === 'PENDING' || appeal.status === 'UNDER_REVIEW'
  )
  
  const deniedAppeals = allAppeals.filter(
    appeal => appeal.status === 'DENIED'
  )
  
  const approvedAppeals = allAppeals.filter(
    appeal => appeal.status === 'APPROVED'
  )

  // Format account status for display
  const getDisplayStatus = () => {
    switch(moderationData.accountStatus) {
      case 'GOOD_STANDING': return 'GOOD STANDING'
      case 'WARNED': return 'WARNED'
      case 'SUSPENDED': return 'SUSPENDED'
      case 'BANNED': return 'BANNED'
      default: return 'GOOD STANDING'
    }
  }

  const accountStatus = getDisplayStatus()

  // Safely filter unseen notifications
  const unseenNotifications = Array.isArray(appealNotifications) 
    ? appealNotifications.filter(n => !n.seen)
    : []

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Account Status</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Monitor your account health, activity timeline, and notifications
        </p>
      </div>

      {/* Appeal Notifications Banner */}
      {unseenNotifications.length > 0 && (
        <div className="mb-4 space-y-2">
          {unseenNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`border rounded-lg p-3 ${
                notification.type === 'APPROVED'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {notification.type === 'APPROVED' ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <IoCloseCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold mb-1 ${
                    notification.type === 'APPROVED'
                      ? 'text-green-900 dark:text-green-200'
                      : 'text-red-900 dark:text-red-200'
                  }`}>
                    Appeal {notification.type === 'APPROVED' ? 'Approved' : 'Denied'}
                  </h3>
                  <p className={`text-xs mb-2 ${
                    notification.type === 'APPROVED'
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-red-800 dark:text-red-300'
                  }`}>
                    {notification.message || (
                      notification.type === 'APPROVED'
                        ? 'Your appeal has been approved. The warning has been removed from your account.'
                        : 'Your appeal has been reviewed and denied. The warning remains on your account.'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className={`text-[10px] font-medium underline ${
                        notification.type === 'APPROVED'
                          ? 'text-green-600 dark:text-green-400 hover:text-green-700'
                          : 'text-red-600 dark:text-red-400 hover:text-red-700'
                      }`}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Account Health Score */}
      <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-2.5">
            <div className={`p-1.5 rounded-lg ${getHealthColorBg(summary.healthStatus)}`}>
              <IoShieldCheckmarkOutline className={`w-5 h-5 ${getHealthColorText(summary.healthStatus)}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Account Health</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {summary.healthStatus}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${getHealthColorText(summary.healthStatus)}`}>
              {summary.healthScore}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">/ 100</div>
          </div>
        </div>
        
        {/* Health Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-3">
          <div 
            className={`h-full transition-all duration-500 ${getHealthColorBar(summary.healthStatus)}`}
            style={{ width: `${summary.healthScore}%` }}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {moderationData.accountStatus === 'SUSPENDED' || moderationData.accountStatus === 'BANNED' 
                ? '-' 
                : activeWarningCount}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              {moderationData.accountStatus === 'SUSPENDED' || moderationData.accountStatus === 'BANNED'
                ? 'Warnings (Hidden)'
                : 'Active Warnings'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{pendingAppeals.length}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Pending Appeals</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getStatusColor(accountStatus)}`}>
              {accountStatus}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Status</div>
          </div>
        </div>
      </div>

      {/* Active Warnings OR Active Suspension - Show based on hierarchy */}
      {moderationData.accountStatus === 'SUSPENDED' || moderationData.accountStatus === 'BANNED' ? (
        // Show suspension/ban when active (overrides warnings)
        activeSuspension && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2.5 mb-3">
              <IoBanOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                  {activeSuspension.isPermanent ? 'Account Banned' : 'Active Suspension'}
                </h3>
                <p className="text-xs text-red-800 dark:text-red-300">
                  Your account has been {activeSuspension.isPermanent ? 'permanently banned' : 'temporarily suspended'}
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                    {activeSuspension.level === 'BANNED' ? 'Permanent Ban' : 
                     activeSuspension.level === 'HARD' ? 'Hard Suspension' : 'Soft Suspension'}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activeSuspension.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  Suspended: {new Date(activeSuspension.suspendedAt).toLocaleDateString()}
                  {activeSuspension.expiresAt && !activeSuspension.isPermanent && 
                    ` • Expires: ${new Date(activeSuspension.expiresAt).toLocaleDateString()}`}
                </span>
                {activeSuspension.appealEligibility.canAppeal && (
                  <button 
                    onClick={() => setIsAppealModalOpen(true)}
                    className="text-[10px] font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                  >
                    Submit Appeal
                  </button>
                )}
                {activeSuspension.appealEligibility.reason === 'EXISTING_APPEAL' && (
                  <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                    Appeal Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        // Show warnings when NOT suspended
        activeWarnings.length > 0 && (
          <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2.5 mb-3">
              <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                  Active Warnings ({activeWarningCount})
                </h3>
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  These warnings are currently on your account and will expire automatically
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              {activeWarnings.map((warning) => {
                const progress = warning.daysRemaining ? Math.max(0, Math.min(100, (warning.daysRemaining / 30) * 100)) : 0
                const hasActiveAppeal = pendingAppeals.some(appeal => appeal.moderationId === warning.id)
                
                // ✅ FIX: Use the hasDeniedAppeal flag from API response
                const hasDeniedAppeal = warning.hasDeniedAppeal || warning.appealEligibility?.hasDeniedAppeal || false
                const deniedAppeal = deniedAppeals.find(appeal => appeal.moderationId === warning.id)
                
                return (
                  <div 
                    key={warning.id}
                    className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                          {formatWarningCategory(warning.category || 'Policy Violation')}
                        </h4>
                        
                        {/* ✅ Show denial message if appeal was denied */}
                        {hasDeniedAppeal && (
                          <p className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">
                            Previous appeal denied • You can submit a new appeal
                          </p>
                        )}
                        
                        {/* Show original reason */}
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {warning.reason}
                        </p>
                      </div>
                      {warning.daysRemaining && (
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 whitespace-nowrap ml-2">
                          {warning.daysRemaining} days left
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        Issued: {new Date(warning.issuedAt).toLocaleDateString()}
                      </span>
                      {hasActiveAppeal ? (
                        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                          Appeal Pending
                        </span>
                      ) : warning.appealEligibility.canAppeal ? (
                        <button 
                          onClick={() => setIsAppealModalOpen(true)}
                          className="text-[10px] font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 underline"
                        >
                          {hasDeniedAppeal 
                            ? `Appeal Again (${warning.appealEligibility.remainingAppeals || 1} left)` 
                            : 'Appeal This Warning'}
                        </button>
                      ) : warning.appealEligibility.reason === 'LIMIT_REACHED' ? (
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                          Appeals Used ({warning.appealEligibility.appealsUsed}/{warning.appealEligibility.maxAppeals})
                        </span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}

      {/* Pending Appeals */}
      {pendingAppeals.length > 0 && (
        <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <IoDocumentsOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pending Appeals</h3>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Appeals currently under review
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {pendingAppeals.length} pending
            </span>
          </div>

          <div className="space-y-2">
            {pendingAppeals.map((appeal) => (
              <AppealCard 
                key={appeal.id} 
                appeal={appeal}
                expanded={expandedAppeal === appeal.id}
                onToggle={() => setExpandedAppeal(expandedAppeal === appeal.id ? null : appeal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Appeals (Success) */}
      {approvedAppeals.length > 0 && (
        <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Approved Appeals</h3>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Successfully cleared moderation actions
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              {approvedAppeals.length} approved
            </span>
          </div>

          <div className="space-y-2">
            {approvedAppeals.map((appeal) => (
              <AppealCard 
                key={appeal.id} 
                appeal={appeal}
                expanded={expandedAppeal === appeal.id}
                onToggle={() => setExpandedAppeal(expandedAppeal === appeal.id ? null : appeal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Denied Appeals */}
      {deniedAppeals.length > 0 && (
        <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <IoDocumentsOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Denied Appeals</h3>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Appeals that were not approved
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {deniedAppeals.length} denied
            </span>
          </div>

          <div className="space-y-2">
            {deniedAppeals.map((appeal) => (
              <AppealCard 
                key={appeal.id} 
                appeal={appeal}
                expanded={expandedAppeal === appeal.id}
                onToggle={() => setExpandedAppeal(expandedAppeal === appeal.id ? null : appeal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              if (appealLimit?.canSubmitMore) {
                setIsAppealModalOpen(true)
              }
            }}
            disabled={!appealLimit?.canSubmitMore}
            className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-left ${
              appealLimit?.canSubmitMore
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                : 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed'
            }`}
          >
            <IoDocumentsOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">Submit Appeal</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                {appealLimit?.canSubmitMore ? `${appealLimit.remainingAppeals} left` : 'Limit reached'}
              </div>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/support'}
            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <IoChatbubbleEllipsesOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">Contact Support</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">Get help</div>
            </div>
          </button>

          <button
            onClick={() => window.open('/community-guidelines', '_blank')}
            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <IoHelpCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">Guidelines</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">Learn more</div>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/profile/download-report'}
            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <IoDownloadOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">Download Report</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">Account history</div>
            </div>
          </button>
        </div>
      </div>

      {/* Active Restrictions */}
      {activeRestrictions.length > 0 && (
        <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <div className="flex items-start gap-2.5 mb-3">
            <IoLockClosedOutline className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
                Current Restrictions ({activeRestrictions.length})
              </h3>
              <p className="text-xs text-orange-800 dark:text-orange-300">
                These restrictions are currently applied to your account
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            {activeRestrictions.map((restriction, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 rounded-lg p-3"
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <IoBanOutline className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatRestrictionType(restriction.type)}
                  </h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 pl-6">
                  {restriction.reason}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400 pl-6">
                  <span>Applied: {new Date(restriction.appliedAt).toLocaleDateString()}</span>
                  {restriction.expiresAt && (
                    <span className="flex items-center gap-1">
                      <IoTimeOutline className="w-3 h-3" />
                      {restriction.daysRemaining} days left
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Timeline */}
      <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <IoCalendarOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Account Timeline</h3>
            <p className="text-[10px] text-gray-600 dark:text-gray-400">Recent activity (newest first)</p>
          </div>
        </div>

        {timeline.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
              <IoCalendarOutline className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">No activity to display</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timeline.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`p-1.5 rounded-full ${getTimelineIconBg(event.color)}`}>
                    {getTimelineIcon(event.icon)}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1.5" />
                  )}
                </div>

                {/* Event Content */}
                <div className="flex-1 pb-3">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{event.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {event.description}
                  </p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{event.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification History */}
      <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <IoMailOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notification History</h3>
            <p className="text-[10px] text-gray-600 dark:text-gray-400">Recent notifications sent to you</p>
          </div>
        </div>

        {recentNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
              <IoMailOutline className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">No notifications sent</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentNotifications.map((notification) => (
              <div 
                key={notification.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                    <IoMailOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5 truncate">
                      {notification.subject}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                      <span>{notification.sentAt}</span>
                      <span>•</span>
                      <span>{notification.method}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {getNotificationStatusBadge(notification.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
        <div className="flex items-start gap-2.5">
          <IoInformationCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1.5">
              Need Help with Your Account Status?
            </h4>
            <p className="text-[10px] text-green-800 dark:text-green-300 mb-2">
              If you believe a warning or restriction was issued in error, you can submit an appeal for review by our support team.
            </p>
            <button 
              onClick={() => window.location.href = '/support'}
              className="text-[10px] font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline"
            >
              Contact Support →
            </button>
          </div>
        </div>
      </div>

      {/* Appeal Bottom Sheet Modal */}
      <AppealBottomSheet 
        isOpen={isAppealModalOpen}
        onClose={() => setIsAppealModalOpen(false)}
        guestId={guestId}
        onSuccess={() => {
          setIsAppealModalOpen(false)
          fetchAllData() // Refresh the data after successful appeal
        }}
      />
    </div>
  )
}

// Appeal Card Component
function AppealCard({ appeal, expanded, onToggle }: { 
  appeal: Appeal, 
  expanded: boolean, 
  onToggle: () => void 
}) {
  // Determine the type of moderation action
  const getModerationType = (category: string | null) => {
    if (!category) return 'Suspension/Ban'
    return 'Warning'
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5 flex-1">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {appeal.moderationCategory 
                    ? formatWarningCategory(appeal.moderationCategory)
                    : 'Account Suspension'}
                </h4>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  ({getModerationType(appeal.moderationCategory)})
                </span>
                {getAppealStatusBadge(appeal.status)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {appeal.reason.substring(0, 100)}{appeal.reason.length > 100 ? '...' : ''}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                <span>Submitted: {new Date(appeal.submittedAt).toLocaleDateString()}</span>
                {appeal.reviewedAt && (
                  <>
                    <span>•</span>
                    <span>Reviewed: {new Date(appeal.reviewedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="ml-2">
            {expanded ? (
              <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
            ) : (
              <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="pt-3 space-y-3">
            <div>
              <h5 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Your Appeal:</h5>
              <p className="text-xs text-gray-600 dark:text-gray-400">{appeal.reason}</p>
            </div>

            {appeal.evidence && appeal.evidence.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Evidence Submitted:</h5>
                <div className="flex flex-wrap gap-2">
                  {appeal.evidence.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-[10px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {file.type.startsWith('image/') ? (
                        <IoImageOutline className="w-3 h-3" />
                      ) : (
                        <IoDocumentTextOutline className="w-3 h-3" />
                      )}
                      View {file.type.startsWith('image/') ? 'Image' : 'Document'}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {appeal.reviewNotes && (
              <div className={`p-2.5 rounded-lg ${
                appeal.status === 'APPROVED' 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : appeal.status === 'DENIED'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-start gap-2">
                  <IoPersonOutline className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    appeal.status === 'APPROVED' 
                      ? 'text-green-600 dark:text-green-400'
                      : appeal.status === 'DENIED'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <h5 className={`text-xs font-semibold mb-1 ${
                      appeal.status === 'APPROVED'
                        ? 'text-green-900 dark:text-green-200'
                        : appeal.status === 'DENIED'
                        ? 'text-red-900 dark:text-red-200'
                        : 'text-blue-900 dark:text-blue-200'
                    }`}>
                      {appeal.status === 'APPROVED' ? 'Approval' : appeal.status === 'DENIED' ? 'Denial' : 'Review'} from {appeal.reviewedBy || 'Fleet Team'}:
                    </h5>
                    <p className={`text-xs ${
                      appeal.status === 'APPROVED'
                        ? 'text-green-800 dark:text-green-300'
                        : appeal.status === 'DENIED'
                        ? 'text-red-800 dark:text-red-300'
                        : 'text-blue-800 dark:text-blue-300'
                    }`}>
                      {appeal.reviewNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Functions
function getHealthColorBg(status: string): string {
  switch (status) {
    case 'EXCELLENT': return 'bg-green-100 dark:bg-green-900/30'
    case 'GOOD': return 'bg-blue-100 dark:bg-blue-900/30'
    case 'FAIR': return 'bg-yellow-100 dark:bg-yellow-900/30'
    case 'POOR': return 'bg-red-100 dark:bg-red-900/30'
    default: return 'bg-gray-100 dark:bg-gray-800'
  }
}

function getHealthColorText(status: string): string {
  switch (status) {
    case 'EXCELLENT': return 'text-green-600 dark:text-green-400'
    case 'GOOD': return 'text-blue-600 dark:text-blue-400'
    case 'FAIR': return 'text-yellow-600 dark:text-yellow-400'
    case 'POOR': return 'text-red-600 dark:text-red-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

function getHealthColorBar(status: string): string {
  switch (status) {
    case 'EXCELLENT': return 'bg-green-500'
    case 'GOOD': return 'bg-blue-500'
    case 'FAIR': return 'bg-yellow-500'
    case 'POOR': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'GOOD STANDING': return 'text-green-600 dark:text-green-400'
    case 'WARNED': return 'text-yellow-600 dark:text-yellow-400'
    case 'SUSPENDED': return 'text-red-600 dark:text-red-400'
    case 'BANNED': return 'text-red-600 dark:text-red-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

function getTimelineIconBg(color: string): string {
  switch (color) {
    case 'green': return 'bg-green-100 dark:bg-green-900/30'
    case 'yellow': return 'bg-yellow-100 dark:bg-yellow-900/30'
    case 'orange': return 'bg-orange-100 dark:bg-orange-900/30'
    case 'red': return 'bg-red-100 dark:bg-red-900/30'
    case 'blue': return 'bg-blue-100 dark:bg-blue-900/30'
    default: return 'bg-gray-100 dark:bg-gray-800'
  }
}

function getTimelineIcon(iconName: string) {
  const className = "w-4 h-4"
  
  switch (iconName) {
    case 'warning':
      return <IoWarningOutline className={`${className} text-yellow-600 dark:text-yellow-400`} />
    case 'ban':
      return <IoBanOutline className={`${className} text-red-600 dark:text-red-400`} />
    case 'suspend':
      return <IoCloseCircleOutline className={`${className} text-orange-600 dark:text-orange-400`} />
    case 'check':
      return <IoCheckmarkCircleOutline className={`${className} text-green-600 dark:text-green-400`} />
    case 'person':
      return <IoPersonOutline className={`${className} text-blue-600 dark:text-blue-400`} />
    default:
      return <IoAlertCircleOutline className={`${className} text-gray-600 dark:text-gray-400`} />
  }
}

function getNotificationStatusBadge(status: string) {
  const badges = {
    'Delivered': (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
        <IoCheckmarkCircleOutline className="w-3 h-3" />
        Delivered
      </span>
    ),
    'Opened': (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
        <IoCheckmarkCircleOutline className="w-3 h-3" />
        Opened
      </span>
    ),
    'Failed': (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
        <IoCloseCircleOutline className="w-3 h-3" />
        Failed
      </span>
    ),
    'Pending': (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
        <IoTimeOutline className="w-3 h-3" />
        Pending
      </span>
    )
  }
  
  return badges[status as keyof typeof badges] || badges['Pending']
}

function getAppealStatusBadge(status: string) {
  const badges = {
    'PENDING': (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
        <IoTimeOutline className="w-3 h-3" />
        Pending
      </span>
    ),
    'UNDER_REVIEW': (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
        <IoAlertCircleOutline className="w-3 h-3" />
        Under Review
      </span>
    ),
    'APPROVED': (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
        <IoCheckmarkCircleOutline className="w-3 h-3" />
        Approved
      </span>
    ),
    'DENIED': (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
        <IoCloseCircleOutline className="w-3 h-3" />
        Denied
      </span>
    )
  }
  
  return badges[status as keyof typeof badges] || badges['PENDING']
}

function formatRestrictionType(type: string): string {
  const types: Record<string, string> = {
    'INSTANT_BOOK': 'Instant Book Disabled',
    'LUXURY_CARS': 'Luxury Cars Restricted',
    'PREMIUM_CARS': 'Premium Cars Restricted',
    'MANUAL_APPROVAL': 'Manual Approval Required'
  }
  return types[type] || type
}

function formatWarningCategory(category: string): string {
  if (!category) return 'Policy Violation'
  
  // Handle underscores - convert to spaces and title case
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}