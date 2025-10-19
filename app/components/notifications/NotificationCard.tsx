// app/components/notifications/NotificationCard.tsx
'use client'

import { Notification } from './types'
import { IoCloseOutline, IoChevronForwardOutline } from 'react-icons/io5'

interface NotificationCardProps {
  notification: Notification
  onCardClick: (actionUrl: string) => void
  onDismiss: (notificationId: string) => void
  isDismissing: boolean
}

export default function NotificationCard({
  notification,
  onCardClick,
  onDismiss,
  isDismissing
}: NotificationCardProps) {
  const Icon = notification.icon
  
  // 🔧 FIX: Safe color handling with fallback
  const bgColor = notification.iconColor 
    ? notification.iconColor.replace('text-', 'bg-')
    : 'bg-gray-200 dark:bg-gray-700'
  
  const iconColor = notification.iconColor || 'text-gray-600 dark:text-gray-400'

  const handleCardClick = () => {
    if (!isDismissing) {
      onCardClick(notification.actionUrl)
    }
  }

  const handleDismissClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDismissing) {
      onDismiss(notification.id)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`
        flex-shrink-0 w-[280px] sm:w-[320px] bg-white dark:bg-gray-800 rounded-lg shadow-sm 
        border border-gray-200 dark:border-gray-700 p-4 cursor-pointer
        hover:shadow-md hover:border-green-300 dark:hover:border-green-700 
        transition-all duration-200 active:scale-[0.98]
        ${isDismissing ? 'opacity-50 pointer-events-none' : ''}
      `}
      role="button"
      tabIndex={0}
      aria-label={`${notification.title}: ${notification.description}. Click to ${notification.actionLabel}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* Header with Icon and Dismiss */}
      <div className="flex items-start justify-between mb-3">
        {/* 🔧 FIX: Use safe bgColor variable instead of inline replace */}
        <div className={`p-2 rounded-lg ${bgColor} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* Dismiss Button */}
        {notification.isDismissible && (
          <button
            onClick={handleDismissClick}
            disabled={isDismissing}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            aria-label="Dismiss notification"
            tabIndex={0}
          >
            {isDismissing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
            ) : (
              <IoCloseOutline className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
            )}
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
        {notification.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        {notification.description}
      </p>

      {/* Action Label */}
      <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">
        <span>{notification.actionLabel}</span>
        <IoChevronForwardOutline className="w-3 h-3 ml-1" />
      </div>
    </div>
  )
}