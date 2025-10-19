// app/components/notifications/NotificationBell.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { IoNotificationsOutline } from 'react-icons/io5'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationDropdown from './NotificationDropdown'

interface NotificationBellProps {
  userRole: 'GUEST' | 'HOST' | 'ADMIN'
}

export default function NotificationBell({ userRole }: NotificationBellProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [localDismissing, setLocalDismissing] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ✅ NOW USING REACT QUERY HOOK - SHARED ACROSS ALL COMPONENTS
  const { notifications, unreadCount, dismissNotification, refresh } = useNotifications({ 
    userRole,
    autoRefresh: true,
    refreshInterval: 30000
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Close dropdown on ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isDropdownOpen])

  const handleNotificationClick = (actionUrl: string) => {
    setIsDropdownOpen(false)
    router.push(actionUrl)
  }

  const handleDismiss = async (notificationId: string) => {
    setLocalDismissing(notificationId)
    try {
      await dismissNotification(notificationId)
      await refresh()
    } finally {
      setLocalDismissing(null)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
      >
        <IoNotificationsOutline 
          className={`w-5 h-5 transition-colors ${
            unreadCount > 0 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-600 dark:text-gray-400'
          }`} 
        />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <NotificationDropdown
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onDismiss={handleDismiss}
          dismissing={localDismissing}
        />
      )}
    </div>
  )
}