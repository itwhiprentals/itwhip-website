// app/(guest)/dashboard/widgets/NotificationCenter.tsx
// Notification Center Widget - Real-time alerts, updates, and important messages
// Keeps users informed about bookings, promotions, and system updates

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  IoNotificationsOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoInformationCircle,
  IoWarningOutline,
  IoGiftOutline,
  IoCarOutline,
  IoBedOutline,
  IoRestaurantOutline,
  IoAirplaneOutline,
  IoSparklesOutline,
  IoTimeOutline,
  IoCashOutline,
  IoTrendingUp,
  IoCalendarOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoMailOutline,
  IoSettingsOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoFilterOutline,
  IoCheckmarkDoneOutline,
  IoEllipsisHorizontalOutline,
  IoFlashOutline,
  IoRocketOutline,
  IoThunderstormOutline,
  IoSunnyOutline,
  IoTicketOutline,
  IoTrophyOutline,
  IoHeartOutline,
  IoStarOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoVolumeHighOutline,
  IoVolumeMuteOutline
} from 'react-icons/io5'

// Types
interface NotificationCenterProps {
  userId?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  maxNotifications?: number
  autoHideDelay?: number
  playSound?: boolean
  showBadge?: boolean
  onNotificationClick?: (notification: Notification) => void
  onMarkAllRead?: () => void
}

interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  timestamp: Date
  read: boolean
  important: boolean
  persistent: boolean
  actionUrl?: string
  actionLabel?: string
  icon?: any
  image?: string
  metadata?: any
  expiresAt?: Date
}

type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'promotion' 
  | 'booking' 
  | 'payment'
  | 'achievement'
  | 'system'
  | 'social'

type NotificationCategory = 
  | 'rides' 
  | 'hotels' 
  | 'food' 
  | 'spa' 
  | 'transport' 
  | 'general' 
  | 'revenue'
  | 'alerts'
  | 'updates'
  | 'marketing'

interface NotificationGroup {
  date: string
  notifications: Notification[]
}

interface NotificationPreferences {
  bookingUpdates: boolean
  promotions: boolean
  systemAlerts: boolean
  revenueReports: boolean
  sound: boolean
  desktop: boolean
  email: boolean
}

interface NotificationStats {
  total: number
  unread: number
  today: number
  thisWeek: number
  byType: Record<NotificationType, number>
  byCategory: Record<NotificationCategory, number>
}

export default function NotificationCenter({
  userId = 'user-123',
  position = 'top-right',
  maxNotifications = 50,
  autoHideDelay = 5000,
  playSound = true,
  showBadge = true,
  onNotificationClick,
  onMarkAllRead
}: NotificationCenterProps) {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<NotificationCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bookingUpdates: true,
    promotions: true,
    systemAlerts: true,
    revenueReports: true,
    sound: playSound,
    desktop: false,
    email: true
  })
  const [showPreferences, setShowPreferences] = useState(false)
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0,
    byType: {} as Record<NotificationType, number>,
    byCategory: {} as Record<NotificationCategory, number>
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastNotification, setToastNotification] = useState<Notification | null>(null)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()
    requestNotificationPermission()
    
    // Set up WebSocket or polling for real-time updates
    const interval = setInterval(() => {
      checkForNewNotifications()
    }, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Update stats when notifications change
  useEffect(() => {
    updateStats()
  }, [notifications])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      // This would normally fetch from API
      // Mock data for now
      const mockNotifications: Notification[] = [
        {
          id: 'notif-1',
          type: 'booking',
          category: 'rides',
          title: 'Ride Confirmed',
          message: 'Your airport transfer is confirmed for tomorrow at 10:00 AM',
          timestamp: new Date(Date.now() - 300000), // 5 min ago
          read: false,
          important: true,
          persistent: false,
          actionUrl: '/bookings/ride-123',
          actionLabel: 'View Details',
          icon: IoCarOutline
        },
        {
          id: 'notif-2',
          type: 'promotion',
          category: 'spa',
          title: 'Flash Sale: 30% Off Spa',
          message: 'Book any massage today and save 30%. Limited time offer!',
          timestamp: new Date(Date.now() - 1800000), // 30 min ago
          read: false,
          important: false,
          persistent: true,
          actionUrl: '/spa',
          actionLabel: 'Book Now',
          icon: IoSparklesOutline,
          expiresAt: new Date(Date.now() + 86400000) // Expires in 24 hours
        },
        {
          id: 'notif-3',
          type: 'revenue',
          category: 'revenue',
          title: 'Commission Earned',
          message: 'You earned $127.50 commission from today\'s bookings',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          read: true,
          important: false,
          persistent: false,
          icon: IoCashOutline,
          metadata: { amount: 127.50, bookings: 5 }
        },
        {
          id: 'notif-4',
          type: 'success',
          category: 'food',
          title: 'Order Delivered',
          message: 'Your room service order has been delivered. Enjoy your meal!',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          read: true,
          important: false,
          persistent: false,
          icon: IoRestaurantOutline
        },
        {
          id: 'notif-5',
          type: 'achievement',
          category: 'general',
          title: 'Gold Status Achieved!',
          message: 'Congratulations! You\'ve reached Gold tier with 10% discount on all services',
          timestamp: new Date(Date.now() - 10800000), // 3 hours ago
          read: false,
          important: true,
          persistent: true,
          icon: IoTrophyOutline,
          actionUrl: '/rewards',
          actionLabel: 'View Rewards'
        },
        {
          id: 'notif-6',
          type: 'warning',
          category: 'alerts',
          title: 'Check-out Tomorrow',
          message: 'Reminder: Your check-out is scheduled for tomorrow at 11:00 AM',
          timestamp: new Date(Date.now() - 14400000), // 4 hours ago
          read: false,
          important: true,
          persistent: false,
          icon: IoWarningOutline
        },
        {
          id: 'notif-7',
          type: 'info',
          category: 'transport',
          title: 'Driver En Route',
          message: 'Your driver Michael is 5 minutes away in a Black Toyota Camry',
          timestamp: new Date(Date.now() - 60000), // 1 min ago
          read: false,
          important: true,
          persistent: false,
          icon: IoCarOutline,
          metadata: { driverName: 'Michael', vehicle: 'Black Toyota Camry', eta: 5 }
        },
        {
          id: 'notif-8',
          type: 'system',
          category: 'updates',
          title: 'New Features Available',
          message: 'Check out our new bundle packages for maximum savings!',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          read: true,
          important: false,
          persistent: false,
          icon: IoRocketOutline,
          actionUrl: '/bundles',
          actionLabel: 'Explore'
        }
      ]
      
      setNotifications(mockNotifications)
      
      // Show toast for newest unread notification
      const newestUnread = mockNotifications.find(n => !n.read)
      if (newestUnread) {
        showNotificationToast(newestUnread)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check for new notifications
  const checkForNewNotifications = async () => {
    try {
      // This would normally check API for new notifications
      // For demo, randomly add a notification
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: `notif-new-${Date.now()}`,
          type: 'info',
          category: 'general',
          title: 'New Update',
          message: 'You have a new message from the hotel concierge',
          timestamp: new Date(),
          read: false,
          important: false,
          persistent: false,
          icon: IoMailOutline
        }
        
        addNotification(newNotification)
      }
    } catch (error) {
      console.error('Failed to check for new notifications:', error)
    }
  }

  // Add new notification
  const addNotification = (notification: Notification) => {
    setNotifications(prev => {
      const updated = [notification, ...prev]
      // Keep only max notifications
      if (updated.length > maxNotifications) {
        updated.pop()
      }
      return updated
    })
    
    // Show toast
    showNotificationToast(notification)
    
    // Play sound
    if (preferences.sound && !notification.read) {
      playNotificationSound()
    }
    
    // Show desktop notification
    if (preferences.desktop && !notification.read) {
      showDesktopNotification(notification)
    }
  }

  // Show notification toast
  const showNotificationToast = (notification: Notification) => {
    setToastNotification(notification)
    setShowToast(true)
    
    if (autoHideDelay > 0 && !notification.persistent) {
      setTimeout(() => {
        setShowToast(false)
      }, autoHideDelay)
    }
  }

  // Play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Could not play sound:', e))
    }
  }

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setPreferences(prev => ({ ...prev, desktop: true }))
      }
    }
  }

  // Show desktop notification
  const showDesktopNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const desktopNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        tag: notification.id,
        requireInteraction: notification.important
      })
      
      desktopNotif.onclick = () => {
        window.focus()
        handleNotificationClick(notification)
      }
    }
  }

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    if (onMarkAllRead) {
      onMarkAllRead()
    }
  }

  // Delete notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  // Update stats
  const updateStats = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const newStats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      today: notifications.filter(n => n.timestamp >= today).length,
      thisWeek: notifications.filter(n => n.timestamp >= weekAgo).length,
      byType: {} as Record<NotificationType, number>,
      byCategory: {} as Record<NotificationCategory, number>
    }
    
    // Count by type and category
    notifications.forEach(n => {
      newStats.byType[n.type] = (newStats.byType[n.type] || 0) + 1
      newStats.byCategory[n.category] = (newStats.byCategory[n.category] || 0) + 1
    })
    
    setStats(newStats)
  }

  // Get filtered notifications
  const getFilteredNotifications = () => {
    let filtered = [...notifications]
    
    // Category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(n => n.category === selectedFilter)
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }

  // Group notifications by date
  const groupNotificationsByDate = (notifs: Notification[]): NotificationGroup[] => {
    const groups: Map<string, Notification[]> = new Map()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    notifs.forEach(notification => {
      const date = new Date(notification.timestamp)
      let dateKey: string
      
      if (date >= today) {
        dateKey = 'Today'
      } else if (date >= yesterday) {
        dateKey = 'Yesterday'
      } else {
        dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(notification)
    })
    
    return Array.from(groups.entries()).map(([date, notifications]) => ({
      date,
      notifications
    }))
  }

  // Get notification icon
  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon
    
    switch (notification.type) {
      case 'success': return IoCheckmarkCircle
      case 'error': return IoCloseCircle
      case 'warning': return IoWarningOutline
      case 'info': return IoInformationCircle
      case 'promotion': return IoGiftOutline
      case 'booking': return IoCalendarOutline
      case 'payment': return IoCashOutline
      case 'achievement': return IoTrophyOutline
      case 'system': return IoSettingsOutline
      case 'social': return IoHeartOutline
      default: return IoNotificationsOutline
    }
  }

  // Get notification color
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      case 'promotion': return 'text-purple-600 bg-purple-50'
      case 'booking': return 'text-indigo-600 bg-indigo-50'
      case 'payment': return 'text-green-600 bg-green-50'
      case 'achievement': return 'text-yellow-600 bg-yellow-50'
      case 'system': return 'text-gray-600 bg-gray-50'
      case 'social': return 'text-pink-600 bg-pink-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredNotifications = getFilteredNotifications()
  const groupedNotifications = groupNotificationsByDate(filteredNotifications)

  // Toast notification
  if (showToast && toastNotification) {
    const ToastIcon = getNotificationIcon(toastNotification)
    const colorClass = getNotificationColor(toastNotification.type)
    
    return (
      <div className={`fixed ${position.includes('top') ? 'top-4' : 'bottom-4'} ${position.includes('right') ? 'right-4' : 'left-4'} z-50`}>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm animate-slide-in">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <ToastIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{toastNotification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{toastNotification.message}</p>
              {toastNotification.actionLabel && (
                <button
                  onClick={() => handleNotificationClick(toastNotification)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                  {toastNotification.actionLabel} →
                </button>
              )}
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <IoCloseCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={notificationRef} className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <IoNotificationsOutline className="w-6 h-6" />
        {showBadge && stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {stats.unread > 9 ? '9+' : stats.unread}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {stats.unread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                >
                  <IoSettingsOutline className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{stats.unread} unread</span>
              <span>•</span>
              <span>{stats.today} today</span>
              <span>•</span>
              <span>{stats.total} total</span>
            </div>
          </div>

          {/* Preferences Panel */}
          {showPreferences && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Notification Preferences</h4>
              <div className="space-y-2">
                {Object.entries({
                  bookingUpdates: 'Booking Updates',
                  promotions: 'Promotions',
                  systemAlerts: 'System Alerts',
                  revenueReports: 'Revenue Reports',
                  sound: 'Sound',
                  desktop: 'Desktop Notifications'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={preferences[key as keyof NotificationPreferences]}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        [key]: e.target.checked
                      })}
                      className="text-green-600"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  selectedFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {['rides', 'hotels', 'food', 'spa', 'revenue', 'alerts'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedFilter(category as NotificationCategory)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${
                    selectedFilter === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                  {stats.byCategory[category as NotificationCategory] > 0 && (
                    <span className="ml-1">({stats.byCategory[category as NotificationCategory]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <IoNotificationsOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications</p>
                <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div>
                {groupedNotifications.map(group => (
                  <div key={group.date}>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs font-medium text-gray-500">{group.date}</p>
                    </div>
                    {group.notifications.map(notification => {
                      const Icon = getNotificationIcon(notification)
                      const colorClass = getNotificationColor(notification.type)
                      
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${colorClass}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                    {notification.important && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                        Important
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                  {notification.metadata && (
                                    <div className="mt-2 text-xs text-gray-500">
                                      {notification.metadata.amount && (
                                        <span className="font-medium text-green-600">
                                          ${notification.metadata.amount.toFixed(2)}
                                        </span>
                                      )}
                                      {notification.metadata.eta && (
                                        <span>ETA: {notification.metadata.eta} min</span>
                                      )}
                                    </div>
                                  )}
                                  {notification.actionLabel && (
                                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2">
                                      {notification.actionLabel} →
                                    </button>
                                  )}
                                </div>
                                <div className="ml-2 flex flex-col items-end">
                                  <p className="text-xs text-gray-500">
                                    {formatTimestamp(notification.timestamp)}
                                  </p>
                                  {!notification.read && (
                                    <span className="mt-1 w-2 h-2 bg-blue-600 rounded-full" />
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              <IoTrashOutline className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={clearAllNotifications}
                className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
        <source src="/notification-sound.ogg" type="audio/ogg" />
      </audio>
    </div>
  )
}