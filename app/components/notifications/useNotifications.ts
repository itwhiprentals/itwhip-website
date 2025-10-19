// app/components/notifications/useNotifications.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Notification, NotificationsResponse, UnreadCountResponse } from './types'

interface UseNotificationsOptions {
  userRole?: 'GUEST' | 'HOST' | 'ADMIN'
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  dismissNotification: (notificationId: string) => Promise<void>
  dismissing: string | null
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    userRole = 'GUEST',
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissing, setDismissing] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      const response = await fetch(`/api/notifications?userRole=${userRole}`, {
        signal: abortControllerRef.current.signal,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data: NotificationsResponse = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
        // 🔧 FIX: Always update count from API, never reset to 0 unless API says so
        setUnreadCount(data.notifications.length)
        setError(null)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled, ignore
        return
      }
      console.error('Failed to fetch notifications:', err)
      setError('Failed to load notifications')
      // 🔧 FIX: Don't reset count on error - maintain existing state
    } finally {
      setIsLoading(false)
    }
  }, [userRole])

  // Fetch unread count only (lighter request)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count', {
        credentials: 'include'
      })

      if (!response.ok) return

      const data: UnreadCountResponse = await response.json()

      if (data.success) {
        // 🔧 FIX: Use unreadCount from API response
        const count = data.unreadCount || 0
        setUnreadCount(count)
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
      // 🔧 FIX: Don't reset count on error - maintain existing state
    }
  }, [])

  // Refresh notifications manually
  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchNotifications()
    await fetchUnreadCount() // Also refresh count
  }, [fetchNotifications, fetchUnreadCount])

  // Dismiss a notification
  const dismissNotification = useCallback(async (notificationId: string) => {
    setDismissing(notificationId)

    try {
      const response = await fetch('/api/notifications/dismiss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationId })
      })

      if (!response.ok) {
        throw new Error('Failed to dismiss notification')
      }

      const data = await response.json()

      if (data.success) {
        // 🔧 FIX: Remove from local state immediately
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        // 🔧 FIX: Decrease count but never go below 0
        setUnreadCount(prev => Math.max(0, prev - 1))
      } else {
        throw new Error(data.message || 'Failed to dismiss notification')
      }
    } catch (err: any) {
      console.error('Failed to dismiss notification:', err)
      setError('Failed to dismiss notification')
      // Re-fetch to sync state
      await fetchNotifications()
      await fetchUnreadCount()
    } finally {
      setDismissing(null)
    }
  }, [fetchNotifications, fetchUnreadCount])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // 🔧 FIX: Set up new interval - fetch count to keep it updated
    refreshIntervalRef.current = setInterval(() => {
      fetchUnreadCount()
    }, refreshInterval)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    dismissNotification,
    dismissing
  }
}