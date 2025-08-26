// app/(guest)/dashboard/widgets/index.ts
// Central export file for all dashboard widgets

// Widget components
export { default as Cart } from './Cart'
export { default as LiveFeed } from './LiveFeed'
export { default as StatsWidget } from './StatsWidget'
export { default as RoomChargeWidget } from './RoomChargeWidget'
export { default as HotelMapWidget } from './HotelMapWidget'
export { default as NotificationCenter } from './NotificationCenter'

// Widget prop types
export type {
  CartProps,
  CartItem,
  CartSummary
} from './Cart'

export type {
  LiveFeedProps,
  FeedItem,
  FeedType
} from './LiveFeed'

export type {
  StatsWidgetProps,
  StatItem,
  StatsData
} from './StatsWidget'

export type {
  RoomChargeWidgetProps,
  RoomCharge,
  ChargeCategory
} from './RoomChargeWidget'

export type {
  HotelMapWidgetProps,
  MapLocation,
  MapMarker
} from './HotelMapWidget'

export type {
  NotificationCenterProps,
  Notification,
  NotificationType,
  NotificationPriority
} from './NotificationCenter'

// Common widget interfaces
export interface BaseWidgetProps {
  className?: string
  isCompact?: boolean
  onClose?: () => void
}

// Widget state types
export interface WidgetState {
  isExpanded: boolean
  isLoading: boolean
  hasError: boolean
  errorMessage?: string
}

// Widget data types
export interface WidgetData<T = any> {
  data: T
  lastUpdated: Date
  isStale: boolean
}

// Notification types for widgets
export interface WidgetNotification {
  id: string
  widgetId: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: Date
  action?: {
    label: string
    onClick: () => void
  }
}

// Widget update subscription
export interface WidgetSubscription {
  widgetId: string
  callback: (data: any) => void
  interval?: number
}

// Widget configuration
export interface WidgetConfig {
  refreshInterval?: number
  maxItems?: number
  showHeader?: boolean
  showFooter?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  theme?: 'light' | 'dark' | 'auto'
}

// Utility functions for widgets
export const widgetUtils = {
  // Format relative time for feed items
  formatRelativeTime: (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString()
  },
  
  // Format currency for cart and charges
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  },
  
  // Calculate cart total
  calculateCartTotal: (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  },
  
  // Group notifications by type
  groupNotifications: (notifications: Notification[]): Record<string, Notification[]> => {
    return notifications.reduce((groups, notification) => {
      const key = notification.type
      if (!groups[key]) groups[key] = []
      groups[key].push(notification)
      return groups
    }, {} as Record<string, Notification[]>)
  }
}

// Widget event types
export enum WidgetEvent {
  EXPANDED = 'widget:expanded',
  COLLAPSED = 'widget:collapsed',
  REFRESHED = 'widget:refreshed',
  ERROR = 'widget:error',
  ACTION = 'widget:action'
}

// Widget action handlers
export interface WidgetActions {
  onExpand?: () => void
  onCollapse?: () => void
  onRefresh?: () => Promise<void>
  onSettings?: () => void
  onClear?: () => void
}

// Default export with all widgets
export default {
  Cart,
  LiveFeed,
  StatsWidget,
  RoomChargeWidget,
  HotelMapWidget,
  NotificationCenter,
  utils: widgetUtils
}