// app/(guest)/dashboard/utils/StateManager.ts
// 🧠 STATE MANAGER - The brain of the dashboard that orchestrates all component state
// Manages user context, cart state, bookings, and real-time synchronization

import { EventEmitter } from 'events'

// ========== TYPES & INTERFACES ==========

export interface UserState {
  id: string
  email: string
  name: string
  role: 'guest' | 'member' | 'vip' | 'admin'
  roomNumber?: string
  hotelId?: string
  hotelName?: string
  checkInDate?: string
  checkOutDate?: string
  preferences: UserPreferences
  loyaltyPoints: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  isAuthenticated: boolean
  location?: GeolocationPosition
  currentService?: string
  sessionId: string
}

export interface UserPreferences {
  language: string
  currency: string
  notifications: boolean
  theme: 'light' | 'dark' | 'auto'
  accessibility: {
    fontSize: 'small' | 'medium' | 'large'
    highContrast: boolean
    reducedMotion: boolean
  }
  dietary: string[]
  roomPreferences: string[]
  transportPreferences: string[]
}

export interface CartState {
  items: CartItem[]
  subtotal: number
  tax: number
  fees: number
  discounts: number
  total: number
  currency: string
  lastUpdated: Date
  syncStatus: 'synced' | 'syncing' | 'error'
}

export interface CartItem {
  id: string
  type: 'ride' | 'hotel' | 'food' | 'amenity' | 'transport' | 'spa' | 'bundle'
  serviceId: string
  name: string
  description: string
  price: number
  quantity: number
  metadata: any
  addedAt: Date
  scheduledFor?: Date
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface BookingState {
  active: Booking[]
  upcoming: Booking[]
  past: Booking[]
  drafts: BookingDraft[]
  totalSpent: number
  totalSaved: number
  lastBooking?: Booking
}

export interface Booking {
  id: string
  type: string
  service: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  price: number
  commission?: number
  date: string
  time: string
  location?: string
  details: any
  createdAt: Date
  updatedAt: Date
}

export interface BookingDraft {
  id: string
  type: string
  data: any
  expiresAt: Date
}

export interface HotelState {
  id: string
  name: string
  location: {
    lat: number
    lng: number
    address: string
    city: string
    state: string
    zip: string
  }
  amenities: string[]
  services: ServiceAvailability[]
  occupancy: number
  weather: WeatherInfo
  localTime: string
  events: HotelEvent[]
  announcements: Announcement[]
}

export interface ServiceAvailability {
  id: string
  name: string
  available: boolean
  hours?: string
  waitTime?: number
  capacity?: number
  price?: number
}

export interface WeatherInfo {
  temp: number
  condition: string
  icon: string
  forecast: any[]
}

export interface HotelEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  price?: number
}

export interface Announcement {
  id: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: Date
  expiresAt?: Date
}

export interface RevenueState {
  today: number
  week: number
  month: number
  year: number
  commissions: {
    rides: number
    transport: number
    amenities: number
    food: number
    total: number
  }
  projections: {
    daily: number
    monthly: number
    annual: number
  }
  topServices: ServiceRevenue[]
}

export interface ServiceRevenue {
  service: string
  revenue: number
  bookings: number
  commission: number
}

export interface NotificationState {
  unread: number
  notifications: Notification[]
  preferences: NotificationPreferences
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion'
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  read: boolean
  createdAt: Date
  expiresAt?: Date
}

export interface NotificationPreferences {
  bookingConfirmations: boolean
  promotions: boolean
  serviceUpdates: boolean
  priceAlerts: boolean
  pushEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
}

export interface AppState {
  user: UserState
  cart: CartState
  bookings: BookingState
  hotel: HotelState
  revenue: RevenueState
  notifications: NotificationState
  ui: UIState
  cache: CacheState
  sync: SyncState
}

export interface UIState {
  sidebarOpen: boolean
  currentView: string
  modals: ModalState[]
  toasts: ToastState[]
  loading: LoadingState
  errors: ErrorState[]
}

export interface ModalState {
  id: string
  type: string
  props: any
  open: boolean
}

export interface ToastState {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  duration: number
}

export interface LoadingState {
  global: boolean
  services: { [key: string]: boolean }
}

export interface ErrorState {
  id: string
  code: string
  message: string
  context?: any
  timestamp: Date
}

export interface CacheState {
  version: string
  lastSync: Date
  entries: { [key: string]: CacheEntry }
}

export interface CacheEntry {
  key: string
  data: any
  expires: Date
  hits: number
}

export interface SyncState {
  status: 'idle' | 'syncing' | 'error'
  lastSync: Date
  queue: SyncItem[]
  conflicts: ConflictItem[]
}

export interface SyncItem {
  id: string
  type: string
  action: string
  data: any
  attempts: number
  nextRetry?: Date
}

export interface ConflictItem {
  id: string
  local: any
  remote: any
  resolvedAt?: Date
}

// ========== STATE MANAGER CLASS ==========

class StateManager extends EventEmitter {
  private static instance: StateManager
  private state: AppState
  private subscribers: Map<string, Set<Function>>
  private history: AppState[]
  private maxHistory: number = 10
  private syncInterval: NodeJS.Timeout | null = null
  private persistKey: string = 'itwhip_dashboard_state'
  private debugMode: boolean = false

  private constructor() {
    super()
    this.subscribers = new Map()
    this.history = []
    this.state = this.getInitialState()
    this.initialize()
  }

  // Singleton pattern
  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager()
    }
    return StateManager.instance
  }

  // Initialize state manager
  private initialize(): void {
    // Load persisted state
    this.loadPersistedState()

    // Set up sync interval
    this.startSync()

    // Set up event listeners
    this.setupEventListeners()

    // Initialize real-time connections
    this.initializeRealTimeConnections()

    if (this.debugMode) {
      console.log('🧠 StateManager initialized', this.state)
    }
  }

  // Get initial state
  private getInitialState(): AppState {
    return {
      user: {
        id: '',
        email: '',
        name: 'Guest',
        role: 'guest',
        preferences: {
          language: 'en',
          currency: 'USD',
          notifications: true,
          theme: 'auto',
          accessibility: {
            fontSize: 'medium',
            highContrast: false,
            reducedMotion: false
          },
          dietary: [],
          roomPreferences: [],
          transportPreferences: []
        },
        loyaltyPoints: 0,
        tier: 'bronze',
        isAuthenticated: false,
        sessionId: this.generateSessionId()
      },
      cart: {
        items: [],
        subtotal: 0,
        tax: 0,
        fees: 0,
        discounts: 0,
        total: 0,
        currency: 'USD',
        lastUpdated: new Date(),
        syncStatus: 'synced'
      },
      bookings: {
        active: [],
        upcoming: [],
        past: [],
        drafts: [],
        totalSpent: 0,
        totalSaved: 0
      },
      hotel: {
        id: '',
        name: '',
        location: {
          lat: 0,
          lng: 0,
          address: '',
          city: '',
          state: '',
          zip: ''
        },
        amenities: [],
        services: [],
        occupancy: 0,
        weather: {
          temp: 0,
          condition: '',
          icon: '',
          forecast: []
        },
        localTime: new Date().toISOString(),
        events: [],
        announcements: []
      },
      revenue: {
        today: 0,
        week: 0,
        month: 0,
        year: 0,
        commissions: {
          rides: 0,
          transport: 0,
          amenities: 0,
          food: 0,
          total: 0
        },
        projections: {
          daily: 0,
          monthly: 0,
          annual: 0
        },
        topServices: []
      },
      notifications: {
        unread: 0,
        notifications: [],
        preferences: {
          bookingConfirmations: true,
          promotions: true,
          serviceUpdates: true,
          priceAlerts: true,
          pushEnabled: false,
          emailEnabled: true,
          smsEnabled: false
        }
      },
      ui: {
        sidebarOpen: true,
        currentView: 'dashboard',
        modals: [],
        toasts: [],
        loading: {
          global: false,
          services: {}
        },
        errors: []
      },
      cache: {
        version: '1.0.0',
        lastSync: new Date(),
        entries: {}
      },
      sync: {
        status: 'idle',
        lastSync: new Date(),
        queue: [],
        conflicts: []
      }
    }
  }

  // ========== STATE GETTERS ==========

  public getState(): AppState {
    return { ...this.state }
  }

  public getUser(): UserState {
    return { ...this.state.user }
  }

  public getCart(): CartState {
    return { ...this.state.cart }
  }

  public getBookings(): BookingState {
    return { ...this.state.bookings }
  }

  public getHotel(): HotelState {
    return { ...this.state.hotel }
  }

  public getRevenue(): RevenueState {
    return { ...this.state.revenue }
  }

  public getNotifications(): NotificationState {
    return { ...this.state.notifications }
  }

  // ========== STATE SETTERS ==========

  public setState(updates: Partial<AppState>): void {
    this.saveHistory()
    this.state = {
      ...this.state,
      ...updates
    }
    this.notifySubscribers('state', this.state)
    this.persistState()
  }

  public setUser(user: Partial<UserState>): void {
    this.saveHistory()
    this.state.user = {
      ...this.state.user,
      ...user
    }
    this.notifySubscribers('user', this.state.user)
    this.persistState()
  }

  public setCart(cart: Partial<CartState>): void {
    this.saveHistory()
    this.state.cart = {
      ...this.state.cart,
      ...cart,
      lastUpdated: new Date()
    }
    this.recalculateCartTotals()
    this.notifySubscribers('cart', this.state.cart)
    this.persistState()
    this.syncCart()
  }

  public setBookings(bookings: Partial<BookingState>): void {
    this.saveHistory()
    this.state.bookings = {
      ...this.state.bookings,
      ...bookings
    }
    this.notifySubscribers('bookings', this.state.bookings)
    this.persistState()
  }

  public setHotel(hotel: Partial<HotelState>): void {
    this.saveHistory()
    this.state.hotel = {
      ...this.state.hotel,
      ...hotel
    }
    this.notifySubscribers('hotel', this.state.hotel)
    this.persistState()
  }

  // ========== CART OPERATIONS ==========

  public addToCart(item: Omit<CartItem, 'id' | 'addedAt'>): void {
    const cartItem: CartItem = {
      ...item,
      id: this.generateId(),
      addedAt: new Date(),
      status: 'pending'
    }

    this.state.cart.items.push(cartItem)
    this.recalculateCartTotals()
    this.notifySubscribers('cart', this.state.cart)
    this.persistState()
    this.syncCart()

    // Show success toast
    this.showToast('success', `${item.name} added to cart`)
  }

  public removeFromCart(itemId: string): void {
    this.state.cart.items = this.state.cart.items.filter(item => item.id !== itemId)
    this.recalculateCartTotals()
    this.notifySubscribers('cart', this.state.cart)
    this.persistState()
    this.syncCart()
  }

  public updateCartItem(itemId: string, updates: Partial<CartItem>): void {
    const index = this.state.cart.items.findIndex(item => item.id === itemId)
    if (index !== -1) {
      this.state.cart.items[index] = {
        ...this.state.cart.items[index],
        ...updates
      }
      this.recalculateCartTotals()
      this.notifySubscribers('cart', this.state.cart)
      this.persistState()
      this.syncCart()
    }
  }

  public clearCart(): void {
    this.state.cart = {
      ...this.state.cart,
      items: [],
      subtotal: 0,
      tax: 0,
      fees: 0,
      discounts: 0,
      total: 0,
      lastUpdated: new Date()
    }
    this.notifySubscribers('cart', this.state.cart)
    this.persistState()
    this.syncCart()
  }

  private recalculateCartTotals(): void {
    const subtotal = this.state.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.08 // 8% tax rate
    const fees = this.state.cart.items.length > 0 ? 2.5 : 0 // Service fee
    const discounts = this.calculateDiscounts(subtotal)
    const total = subtotal + tax + fees - discounts

    this.state.cart = {
      ...this.state.cart,
      subtotal,
      tax,
      fees,
      discounts,
      total
    }
  }

  private calculateDiscounts(subtotal: number): number {
    let discount = 0

    // Loyalty tier discounts
    switch (this.state.user.tier) {
      case 'silver':
        discount = subtotal * 0.05 // 5% discount
        break
      case 'gold':
        discount = subtotal * 0.10 // 10% discount
        break
      case 'platinum':
        discount = subtotal * 0.15 // 15% discount
        break
      default:
        discount = 0
    }

    // Bundle discount
    const hasBundle = this.state.cart.items.some(item => item.type === 'bundle')
    if (hasBundle) {
      discount += subtotal * 0.10 // Additional 10% for bundles
    }

    return discount
  }

  // ========== BOOKING OPERATIONS ==========

  public addBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newBooking: Booking = {
      ...booking,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add to appropriate category
    if (booking.status === 'confirmed' || booking.status === 'pending') {
      const bookingDate = new Date(booking.date)
      const now = new Date()
      
      if (bookingDate > now) {
        this.state.bookings.upcoming.push(newBooking)
      } else {
        this.state.bookings.active.push(newBooking)
      }
    }

    // Update totals
    this.state.bookings.totalSpent += booking.price
    if (booking.commission) {
      this.state.revenue.commissions.total += booking.commission
    }

    this.state.bookings.lastBooking = newBooking
    this.notifySubscribers('bookings', this.state.bookings)
    this.persistState()

    // Show confirmation
    this.showToast('success', `Booking confirmed for ${booking.service}`)
  }

  public updateBooking(bookingId: string, updates: Partial<Booking>): void {
    // Check all booking arrays
    const arrays = ['active', 'upcoming', 'past'] as const
    
    for (const arrayName of arrays) {
      const index = this.state.bookings[arrayName].findIndex(b => b.id === bookingId)
      if (index !== -1) {
        this.state.bookings[arrayName][index] = {
          ...this.state.bookings[arrayName][index],
          ...updates,
          updatedAt: new Date()
        }
        break
      }
    }

    this.notifySubscribers('bookings', this.state.bookings)
    this.persistState()
  }

  public cancelBooking(bookingId: string): void {
    this.updateBooking(bookingId, { status: 'cancelled' })
    this.showToast('info', 'Booking cancelled')
  }

  // ========== NOTIFICATION OPERATIONS ==========

  public addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
      read: false
    }

    this.state.notifications.notifications.unshift(newNotification)
    this.state.notifications.unread++
    
    // Keep only last 50 notifications
    if (this.state.notifications.notifications.length > 50) {
      this.state.notifications.notifications = this.state.notifications.notifications.slice(0, 50)
    }

    this.notifySubscribers('notifications', this.state.notifications)
    this.persistState()

    // Show toast for important notifications
    if (notification.type === 'error' || notification.type === 'warning') {
      this.showToast(notification.type, notification.message)
    }
  }

  public markNotificationRead(notificationId: string): void {
    const notification = this.state.notifications.notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      this.state.notifications.unread = Math.max(0, this.state.notifications.unread - 1)
      this.notifySubscribers('notifications', this.state.notifications)
      this.persistState()
    }
  }

  public markAllNotificationsRead(): void {
    this.state.notifications.notifications.forEach(n => n.read = true)
    this.state.notifications.unread = 0
    this.notifySubscribers('notifications', this.state.notifications)
    this.persistState()
  }

  // ========== UI OPERATIONS ==========

  public openModal(type: string, props: any = {}): void {
    const modal: ModalState = {
      id: this.generateId(),
      type,
      props,
      open: true
    }
    this.state.ui.modals.push(modal)
    this.notifySubscribers('ui', this.state.ui)
  }

  public closeModal(modalId?: string): void {
    if (modalId) {
      this.state.ui.modals = this.state.ui.modals.filter(m => m.id !== modalId)
    } else if (this.state.ui.modals.length > 0) {
      this.state.ui.modals.pop()
    }
    this.notifySubscribers('ui', this.state.ui)
  }

  public showToast(type: 'info' | 'success' | 'warning' | 'error', message: string, duration: number = 3000): void {
    const toast: ToastState = {
      id: this.generateId(),
      type,
      message,
      duration
    }
    
    this.state.ui.toasts.push(toast)
    this.notifySubscribers('ui', this.state.ui)

    // Auto-remove toast after duration
    setTimeout(() => {
      this.state.ui.toasts = this.state.ui.toasts.filter(t => t.id !== toast.id)
      this.notifySubscribers('ui', this.state.ui)
    }, duration)
  }

  public setLoading(service: string, loading: boolean): void {
    if (service === 'global') {
      this.state.ui.loading.global = loading
    } else {
      this.state.ui.loading.services[service] = loading
    }
    this.notifySubscribers('ui', this.state.ui)
  }

  public addError(error: Omit<ErrorState, 'id' | 'timestamp'>): void {
    const errorState: ErrorState = {
      ...error,
      id: this.generateId(),
      timestamp: new Date()
    }
    
    this.state.ui.errors.push(errorState)
    
    // Keep only last 10 errors
    if (this.state.ui.errors.length > 10) {
      this.state.ui.errors = this.state.ui.errors.slice(-10)
    }
    
    this.notifySubscribers('ui', this.state.ui)
    
    if (this.debugMode) {
      console.error('🚨 StateManager Error:', errorState)
    }
  }

  // ========== CACHE OPERATIONS ==========

  public cacheData(key: string, data: any, ttl: number = 300000): void {
    const expires = new Date(Date.now() + ttl)
    
    this.state.cache.entries[key] = {
      key,
      data,
      expires,
      hits: 0
    }
    
    // Clean expired entries
    this.cleanCache()
  }

  public getCachedData(key: string): any | null {
    const entry = this.state.cache.entries[key]
    
    if (!entry) return null
    
    if (new Date() > entry.expires) {
      delete this.state.cache.entries[key]
      return null
    }
    
    entry.hits++
    return entry.data
  }

  private cleanCache(): void {
    const now = new Date()
    Object.keys(this.state.cache.entries).forEach(key => {
      if (this.state.cache.entries[key].expires < now) {
        delete this.state.cache.entries[key]
      }
    })
  }

  // ========== SYNC OPERATIONS ==========

  private async syncCart(): Promise<void> {
    if (this.state.cart.syncStatus === 'syncing') return
    
    this.state.cart.syncStatus = 'syncing'
    
    try {
      // Simulate API call
      await this.delay(500)
      
      // In production, this would sync with server
      // const response = await fetch('/api/cart/sync', {
      //   method: 'POST',
      //   body: JSON.stringify(this.state.cart)
      // })
      
      this.state.cart.syncStatus = 'synced'
    } catch (error) {
      this.state.cart.syncStatus = 'error'
      this.addError({
        code: 'SYNC_ERROR',
        message: 'Failed to sync cart',
        context: error
      })
    }
  }

  private startSync(): void {
    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncWithServer()
    }, 30000)
  }

  private async syncWithServer(): Promise<void> {
    if (this.state.sync.status === 'syncing') return
    
    this.state.sync.status = 'syncing'
    
    try {
      // Process sync queue
      for (const item of this.state.sync.queue) {
        await this.processSyncItem(item)
      }
      
      this.state.sync.status = 'idle'
      this.state.sync.lastSync = new Date()
      this.state.sync.queue = []
      
    } catch (error) {
      this.state.sync.status = 'error'
      this.addError({
        code: 'SYNC_ERROR',
        message: 'Failed to sync with server',
        context: error
      })
    }
  }

  private async processSyncItem(item: SyncItem): Promise<void> {
    // In production, this would sync with server
    await this.delay(100)
    
    // Simulate random failure for retry logic
    if (Math.random() > 0.95) {
      item.attempts++
      if (item.attempts < 3) {
        item.nextRetry = new Date(Date.now() + 5000 * item.attempts)
        throw new Error('Sync failed')
      }
    }
  }

  // ========== SUBSCRIPTION MANAGEMENT ==========

  public subscribe(channel: string, callback: Function): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
    }
    
    this.subscribers.get(channel)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(channel)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }

  private notifySubscribers(channel: string, data: any): void {
    const callbacks = this.subscribers.get(channel)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Subscriber error:', error)
        }
      })
    }
    
    // Also emit event
    this.emit(channel, data)
  }

  // ========== PERSISTENCE ==========

  private loadPersistedState(): void {
    try {
      const persisted = localStorage.getItem(this.persistKey)
      if (persisted) {
        const parsed = JSON.parse(persisted)
        
        // Merge with initial state to ensure all properties exist
        this.state = {
          ...this.getInitialState(),
          ...parsed,
          // Don't persist UI state
          ui: this.getInitialState().ui
        }
        
        // Convert date strings back to Date objects
        this.state.cart.lastUpdated = new Date(this.state.cart.lastUpdated)
        this.state.cache.lastSync = new Date(this.state.cache.lastSync)
        this.state.sync.lastSync = new Date(this.state.sync.lastSync)
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error)
    }
  }

  private persistState(): void {
    try {
      const toPersist = {
        ...this.state,
        // Don't persist UI state
        ui: undefined
      }
      
      localStorage.setItem(this.persistKey, JSON.stringify(toPersist))
    } catch (error) {
      console.error('Failed to persist state:', error)
    }
  }

  // ========== HISTORY MANAGEMENT ==========

  private saveHistory(): void {
    this.history.push(JSON.parse(JSON.stringify(this.state)))
    
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }
  }

  public undo(): void {
    if (this.history.length > 0) {
      const previousState = this.history.pop()
      if (previousState) {
        this.state = previousState
        this.notifySubscribers('state', this.state)
        this.persistState()
      }
    }
  }

  public canUndo(): boolean {
    return this.history.length > 0
  }

  // ========== REAL-TIME CONNECTIONS ==========

  private initializeRealTimeConnections(): void {
    // In production, this would connect to WebSocket/SSE
    // For demo, simulate real-time updates
    
    // Simulate revenue updates
    setInterval(() => {
      this.updateRevenue()
    }, 60000) // Every minute
    
    // Simulate notification
    setTimeout(() => {
      this.addNotification({
        type: 'info',
        title: 'Welcome to ItWhip!',
        message: 'Your dashboard is ready. Start booking services to earn rewards!'
      })
    }, 3000)
  }

  private updateRevenue(): void {
    // Simulate revenue growth
    const growth = Math.random() * 100
    this.state.revenue.today += growth
    this.state.revenue.week += growth
    this.state.revenue.month += growth
    this.state.revenue.year += growth
    
    this.notifySubscribers('revenue', this.state.revenue)
  }

  // ========== EVENT LISTENERS ==========

  private setupEventListeners(): void {
    // Listen for visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncWithServer()
      }
    })
    
    // Listen for online/offline
    window.addEventListener('online', () => {
      this.syncWithServer()
      this.showToast('success', 'Back online')
    })
    
    window.addEventListener('offline', () => {
      this.showToast('warning', 'You are offline')
    })
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === this.persistKey && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue)
          this.state = {
            ...this.state,
            ...newState,
            ui: this.state.ui // Keep current tab's UI state
          }
          this.notifySubscribers('state', this.state)
        } catch (error) {
          console.error('Failed to sync state from storage:', error)
        }
      }
    })
  }

  // ========== UTILITY METHODS ==========

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ========== DEBUG METHODS ==========

  public enableDebug(): void {
    this.debugMode = true
    console.log('🧠 StateManager Debug Mode Enabled')
  }

  public disableDebug(): void {
    this.debugMode = false
  }

  public getDebugInfo(): any {
    return {
      state: this.state,
      subscribers: Array.from(this.subscribers.keys()),
      historyLength: this.history.length,
      cacheSize: Object.keys(this.state.cache.entries).length,
      syncQueueLength: this.state.sync.queue.length
    }
  }

  // ========== CLEANUP ==========

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    this.subscribers.clear()
    this.removeAllListeners()
    this.history = []
    
    if (this.debugMode) {
      console.log('🧠 StateManager destroyed')
    }
  }
}

// Export singleton instance
export const stateManager = StateManager.getInstance()

// Export convenience hooks for React components
export const useStateManager = () => {
  return stateManager
}

// Export typed selectors
export const selectors = {
  getUser: () => stateManager.getUser(),
  getCart: () => stateManager.getCart(),
  getBookings: () => stateManager.getBookings(),
  getHotel: () => stateManager.getHotel(),
  getRevenue: () => stateManager.getRevenue(),
  getNotifications: () => stateManager.getNotifications(),
  getState: () => stateManager.getState()
}

// Export typed actions
export const actions = {
  // User actions
  login: (user: Partial<UserState>) => stateManager.setUser({ ...user, isAuthenticated: true }),
  logout: () => stateManager.setUser({ isAuthenticated: false }),
  updatePreferences: (prefs: Partial<UserPreferences>) => {
    const user = stateManager.getUser()
    stateManager.setUser({ preferences: { ...user.preferences, ...prefs } })
  },
  
  // Cart actions
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => stateManager.addToCart(item),
  removeFromCart: (itemId: string) => stateManager.removeFromCart(itemId),
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => stateManager.updateCartItem(itemId, updates),
  clearCart: () => stateManager.clearCart(),
  
  // Booking actions
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => stateManager.addBooking(booking),
  updateBooking: (id: string, updates: Partial<Booking>) => stateManager.updateBooking(id, updates),
  cancelBooking: (id: string) => stateManager.cancelBooking(id),
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => stateManager.addNotification(notification),
  markRead: (id: string) => stateManager.markNotificationRead(id),
  markAllRead: () => stateManager.markAllNotificationsRead(),
  
  // UI actions
  openModal: (type: string, props?: any) => stateManager.openModal(type, props),
  closeModal: (id?: string) => stateManager.closeModal(id),
  showToast: (type: 'info' | 'success' | 'warning' | 'error', message: string) => stateManager.showToast(type, message),
  setLoading: (service: string, loading: boolean) => stateManager.setLoading(service, loading),
  
  // Cache actions
  cache: (key: string, data: any, ttl?: number) => stateManager.cacheData(key, data, ttl),
  getCached: (key: string) => stateManager.getCachedData(key)
}

export default stateManager