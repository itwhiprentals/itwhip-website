// app/components/notifications/NotificationDropdown.tsx
'use client'

import { useState } from 'react'
import { Notification } from './types'
import { 
  IoCardOutline,
  IoShieldCheckmarkOutline,
  IoCallOutline,
  IoPersonOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

interface NotificationDropdownProps {
  notifications: Notification[]
  onDismiss: (notificationId: string) => void
  onNotificationClick?: (notification: Notification) => void
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'IoCardOutline': IoCardOutline,
  'IoShieldCheckmarkOutline': IoShieldCheckmarkOutline,
  'IoCallOutline': IoCallOutline,
  'IoPersonOutline': IoPersonOutline,
  'IoLockClosedOutline': IoLockClosedOutline,
  'CREDIT_CARD': IoCardOutline, // Changed from IoCreditCardOutline
  'CARD': IoCardOutline,
  'SHIELD': IoShieldCheckmarkOutline,
  'PHONE': IoCallOutline,
  'CALL': IoCallOutline,
  'PERSON': IoPersonOutline,
  'LOCK': IoLockClosedOutline,
  'ALERT': IoAlertCircleOutline,
  'payment': IoCardOutline, // Changed from IoCreditCardOutline
  'license': IoCardOutline,
  'insurance': IoShieldCheckmarkOutline,
  'emergency': IoCallOutline,
  'profile': IoPersonOutline,
  'security': IoLockClosedOutline,
}

export default function NotificationDropdown({
  notifications,
  onDismiss,
  onNotificationClick
}: NotificationDropdownProps) {
  const [dismissing, setDismissing] = useState<string | null>(null)

  const handleDismiss = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDismissing(notificationId)
    await onDismiss(notificationId)
    setDismissing(null)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification)
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-4 z-50 animate-fadeIn">
        <div className="px-4 py-8 text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <IoCheckmarkCircleOutline className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            All caught up!
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            No notifications right now
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-fadeIn">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {notifications.length} {notifications.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.map((notification) => {
          let IconComponent: React.ComponentType<{ className?: string }>
          
          if (typeof notification.icon === 'string') {
            const iconKey = notification.icon.toUpperCase()
            IconComponent = ICON_MAP[iconKey] || ICON_MAP[notification.icon] || IoAlertCircleOutline
          } else if (typeof notification.icon === 'function') {
            IconComponent = notification.icon as React.ComponentType<{ className?: string }>
          } else {
            IconComponent = IoAlertCircleOutline
          }
          
          const isDismissing = dismissing === notification.id

          const priorityColors = {
            1: { bg: 'bg-red-500', icon: 'text-red-500' },
            2: { bg: 'bg-orange-500', icon: 'text-orange-500' },
            3: { bg: 'bg-yellow-500', icon: 'text-yellow-500' },
            4: { bg: 'bg-blue-500', icon: 'text-blue-500' },
            5: { bg: 'bg-gray-500', icon: 'text-gray-500' },
            6: { bg: 'bg-gray-400', icon: 'text-gray-400' }
          }

          const colors = priorityColors[notification.priority as keyof typeof priorityColors] || priorityColors[6]
          const iconColor = notification.iconColor || colors.icon

          return (
            <div
              key={notification.id}
              className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            >
              <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-opacity-10 ${colors.bg}`}>
                  <IconComponent className={`w-4 h-4 ${iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="text-left w-full group"
                    disabled={isDismissing}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {notification.description}
                    </p>
                    {notification.actionLabel && (
                      <div className="flex items-center mt-1.5 text-xs text-green-600 dark:text-green-400">
                        <span className="font-medium">{notification.actionLabel}</span>
                        <IoChevronForwardOutline className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </button>
                </div>

                {notification.isDismissible && (
                  <button
                    onClick={(e) => handleDismiss(notification.id, e)}
                    disabled={isDismissing}
                    className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    aria-label="Dismiss notification"
                  >
                    {isDismissing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                    ) : (
                      <IoCloseCircleOutline className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}