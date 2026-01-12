// app/partner/notifications/page.tsx
// Partner Notifications - Activity Feed

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoNotificationsOutline,
  IoCalendarOutline,
  IoStarOutline,
  IoChatbubblesOutline,
  IoBuildOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
  IoFilterOutline,
  IoRefreshOutline,
  IoEllipseSharp
} from 'react-icons/io5'

interface Notification {
  id: string
  type: 'booking' | 'review' | 'message' | 'maintenance' | 'claim' | 'payout'
  title: string
  description: string
  timestamp: string
  isRead: boolean
  link?: string
  metadata?: Record<string, any>
}

interface Counts {
  total: number
  unread: number
  booking: number
  review: number
  message: number
  maintenance: number
  claim: number
  payout: number
}

const typeConfig = {
  booking: {
    icon: IoCalendarOutline,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  review: {
    icon: IoStarOutline,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  message: {
    icon: IoChatbubblesOutline,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  maintenance: {
    icon: IoBuildOutline,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  claim: {
    icon: IoShieldCheckmarkOutline,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  payout: {
    icon: IoWalletOutline,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
  }
}

export default function PartnerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [counts, setCounts] = useState<Counts>({
    total: 0, unread: 0, booking: 0, review: 0,
    message: 0, maintenance: 0, claim: 0, payout: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      const url = filter
        ? `/api/partner/notifications?type=${filter}`
        : '/api/partner/notifications'
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
        setCounts(data.counts)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const groupNotificationsByDate = (notifs: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    notifs.forEach(notif => {
      const date = new Date(notif.timestamp)
      date.setHours(0, 0, 0, 0)

      let key: string
      if (date.getTime() === today.getTime()) {
        key = 'Today'
      } else if (date.getTime() === yesterday.getTime()) {
        key = 'Yesterday'
      } else {
        key = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(notif)
    })

    return groups
  }

  const filterButtons = [
    { key: null, label: 'All', count: counts.total },
    { key: 'booking', label: 'Bookings', count: counts.booking },
    { key: 'review', label: 'Reviews', count: counts.review },
    { key: 'message', label: 'Messages', count: counts.message },
    { key: 'maintenance', label: 'Maintenance', count: counts.maintenance },
    { key: 'claim', label: 'Claims', count: counts.claim },
    { key: 'payout', label: 'Payouts', count: counts.payout }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const groupedNotifications = groupNotificationsByDate(notifications)

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IoNotificationsOutline className="w-7 h-7" />
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {counts.unread > 0 ? `${counts.unread} unread` : 'All caught up!'}
          </p>
        </div>

        <button
          onClick={() => fetchNotifications()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <IoRefreshOutline className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {filterButtons.map(({ key, label, count }) => (
            <button
              key={key || 'all'}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <IoNotificationsOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {filter ? `No ${filter} notifications` : 'No notifications yet'}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Activity will appear here as it happens
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, notifs]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-2">
                {date}
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                {notifs.map(notification => {
                  const config = typeConfig[notification.type]
                  const Icon = config.icon

                  return (
                    <Link
                      key={notification.id}
                      href={notification.link || '#'}
                      className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !notification.isRead ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className={`font-medium ${
                              !notification.isRead
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {notification.description}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                              {formatTime(notification.timestamp)}
                            </span>
                            {!notification.isRead && (
                              <IoEllipseSharp className="w-2.5 h-2.5 text-orange-500" />
                            )}
                          </div>
                        </div>

                        {/* Metadata badges */}
                        {notification.metadata && (
                          <div className="flex items-center gap-2 mt-2">
                            {notification.type === 'review' && notification.metadata.rating && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                                <IoStarOutline className="w-3 h-3" />
                                {notification.metadata.rating}
                              </span>
                            )}
                            {notification.type === 'message' && notification.metadata.isUrgent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                                <IoAlertCircleOutline className="w-3 h-3" />
                                Urgent
                              </span>
                            )}
                            {notification.type === 'maintenance' && notification.metadata.isOverdue && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                                <IoAlertCircleOutline className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                            {notification.type === 'payout' && notification.metadata.amount && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                                <IoWalletOutline className="w-3 h-3" />
                                ${notification.metadata.amount.toFixed(2)}
                              </span>
                            )}
                            {notification.type === 'claim' && notification.metadata.status && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                                notification.metadata.status === 'APPROVED' || notification.metadata.status === 'PAID'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : notification.metadata.status === 'DENIED'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {notification.metadata.status}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
