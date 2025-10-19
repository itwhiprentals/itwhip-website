// app/components/notifications/SuspensionNotifications.tsx
'use client'

import { useState, useEffect } from 'react'

// SVG Icons
const WarningIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const AlertCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const BanIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
)

const InfoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// Types
interface SuspensionNotification {
  id: string
  type: 'warning' | 'soft_suspend' | 'hard_suspend' | 'ban' | 'unsuspend' | 'info'
  title: string
  message: string
  reason: string
  timestamp: string
  expiresAt?: string
  actionLink?: string
  actionLabel?: string
  takenBy?: string
  suspensionLevel?: string | null
}

interface SuspensionNotificationsProps {
  onClose?: () => void
  maxNotifications?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export default function SuspensionNotifications({ 
  onClose,
  maxNotifications = 5,
  autoRefresh = false,
  refreshInterval = 60000 // 1 minute
}: SuspensionNotificationsProps) {
  const [notifications, setNotifications] = useState<SuspensionNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()

    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchNotifications, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const fetchNotifications = async () => {
    try {
      setError(null)
      const response = await fetch('/api/guest/moderation-notifications')
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, silently fail
          setNotifications([])
          return
        }
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      
      if (data.success) {
        // Limit notifications to maxNotifications
        const limitedNotifications = data.notifications.slice(0, maxNotifications)
        setNotifications(limitedNotifications)
      } else {
        throw new Error(data.error || 'Failed to load notifications')
      }
    } catch (err: any) {
      console.error('Failed to fetch suspension notifications:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return WarningIcon
      case 'soft_suspend':
        return AlertCircleIcon
      case 'hard_suspend':
        return XCircleIcon
      case 'ban':
        return BanIcon
      case 'unsuspend':
        return CheckCircleIcon
      default:
        return InfoIcon
    }
  }

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          titleColor: 'text-yellow-900 dark:text-yellow-100'
        }
      case 'soft_suspend':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-300 dark:border-yellow-700',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          titleColor: 'text-yellow-900 dark:text-yellow-100'
        }
      case 'hard_suspend':
        return {
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-300 dark:border-orange-700',
          iconColor: 'text-orange-600 dark:text-orange-400',
          textColor: 'text-orange-800 dark:text-orange-200',
          titleColor: 'text-orange-900 dark:text-orange-100'
        }
      case 'ban':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-400 dark:border-red-700',
          iconColor: 'text-red-600 dark:text-red-400',
          textColor: 'text-red-800 dark:text-red-200',
          titleColor: 'text-red-900 dark:text-red-100'
        }
      case 'unsuspend':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          textColor: 'text-green-800 dark:text-green-200',
          titleColor: 'text-green-900 dark:text-green-100'
        }
      default:
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-800 dark:text-blue-200',
          titleColor: 'text-blue-900 dark:text-blue-100'
        }
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Loading notifications...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <XCircleIcon className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchNotifications}
          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <CheckCircleIcon className="w-6 h-6 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-xs text-gray-600 dark:text-gray-400">No recent notifications</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const style = getNotificationStyle(notification.type)
        const Icon = getNotificationIcon(notification.type)

        return (
          <div
            key={notification.id}
            className={`${style.bgColor} border ${style.borderColor} rounded-lg p-3 sm:p-4 transition-all hover:shadow-md`}
          >
            <div className="flex items-start">
              <Icon className={`w-5 h-5 ${style.iconColor} mt-0.5 mr-3 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className={`font-semibold ${style.titleColor} text-sm sm:text-base`}>
                    {notification.title}
                  </h4>
                  <span className={`text-xs ${style.textColor} opacity-75 ml-2 whitespace-nowrap`}>
                    {formatTimestamp(notification.timestamp)}
                  </span>
                </div>

                <p className={`text-xs sm:text-sm ${style.textColor} mb-2`}>
                  {notification.message}
                </p>

                {notification.reason && (
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2 mb-2">
                    <p className={`text-xs font-semibold ${style.titleColor} mb-1`}>
                      Reason:
                    </p>
                    <p className={`text-xs ${style.textColor}`}>
                      {notification.reason}
                    </p>
                  </div>
                )}

                {notification.expiresAt && (
                  <p className={`text-xs ${style.textColor} mt-2 opacity-75`}>
                    <strong>Expires:</strong> {new Date(notification.expiresAt).toLocaleString()}
                  </p>
                )}

                {notification.actionLink && notification.actionLabel && (
                  <a
                    href={notification.actionLink}
                    className={`inline-block mt-2 text-xs sm:text-sm font-medium ${style.iconColor} hover:underline`}
                  >
                    {notification.actionLabel} →
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {notifications.length >= maxNotifications && (
        <div className="text-center pt-2">
          <button
            onClick={() => window.location.href = '/profile/notifications'}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  )
}