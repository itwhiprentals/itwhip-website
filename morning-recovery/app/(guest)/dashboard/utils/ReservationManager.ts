// app/(guest)/dashboard/utils/ReservationManager.ts
// 🎯 RESERVATION MANAGER - Orchestrates all bookings across services
// Handles conflicts, dependencies, scheduling, and multi-service packages

import { stateManager, actions } from './StateManager'
import { EventEmitter } from 'events'

// ========== TYPES & INTERFACES ==========

export interface Reservation {
  id: string
  type: ReservationType
  serviceId: string
  serviceName: string
  status: ReservationStatus
  priority: number
  dependencies: string[] // Other reservation IDs that must be confirmed first
  conflicts: string[] // Reservation IDs that conflict with this one
  data: ReservationData
  pricing: PricingDetails
  schedule: ScheduleDetails
  guest: GuestDetails
  policies: PolicyDetails
  metadata: ReservationMetadata
  createdAt: Date
  updatedAt: Date
  confirmedAt?: Date
  cancelledAt?: Date
}

export type ReservationType = 
  | 'ride'
  | 'hotel'
  | 'flight'
  | 'food'
  | 'amenity'
  | 'transport'
  | 'spa'
  | 'bundle'
  | 'rental'

export type ReservationStatus = 
  | 'draft'
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'refunded'

export interface ReservationData {
  // Common fields
  description: string
  location?: string
  notes?: string
  specialRequests?: string
  
  // Service-specific data
  rideData?: {
    pickup: string
    dropoff: string
    vehicleType: string
    driverId?: string
    estimatedDistance: number
    estimatedDuration: number
  }
  
  hotelData?: {
    checkIn: string
    checkOut: string
    roomType: string
    roomNumber?: string
    amenities: string[]
    boardType: string
  }
  
  flightData?: {
    flightNumber: string
    airline: string
    departure: string
    arrival: string
    gate?: string
    seat?: string
    class: string
  }
  
  foodData?: {
    restaurant: string
    items: FoodItem[]
    deliveryType: 'delivery' | 'pickup' | 'dine-in'
    deliveryAddress?: string
    estimatedTime: number
  }
  
  amenityData?: {
    items: AmenityItem[]
    deliveryLocation: string
    deliveryTime: string
  }
  
  transportData?: {
    vehicleType: string
    duration: string
    tourGuide?: boolean
    meals?: boolean
    pickup: string
    dropoff?: string
  }
  
  spaData?: {
    treatment: string
    therapist?: string
    duration: number
    roomNumber?: string
  }
  
  bundleData?: {
    components: BundleComponent[]
    savings: number
    packageName: string
  }
}

export interface FoodItem {
  id: string
  name: string
  quantity: number
  price: number
  customizations?: string[]
}

export interface AmenityItem {
  id: string
  name: string
  quantity: number
  price: number
}

export interface BundleComponent {
  type: ReservationType
  reservationId?: string
  name: string
  price: number
}

export interface PricingDetails {
  basePrice: number
  taxes: number
  fees: number
  tips: number
  discounts: number
  total: number
  currency: string
  commission?: number // For hotel revenue
  breakdown: PriceBreakdown[]
  paymentMethod: 'roomCharge' | 'card' | 'cash' | 'points'
  paid: boolean
  refundAmount?: number
}

export interface PriceBreakdown {
  item: string
  amount: number
  type: 'charge' | 'discount' | 'tax' | 'fee' | 'tip'
}

export interface ScheduleDetails {
  date: string
  time: string
  duration?: number // in minutes
  timezone: string
  flexible: boolean
  recurring?: RecurrenceRule
  reminders: Reminder[]
  actualStartTime?: Date
  actualEndTime?: Date
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number
  endDate?: string
  daysOfWeek?: number[]
}

export interface Reminder {
  id: string
  time: number // minutes before
  type: 'push' | 'email' | 'sms'
  sent: boolean
}

export interface GuestDetails {
  id: string
  name: string
  email: string
  phone: string
  roomNumber?: string
  preferences: string[]
  loyaltyTier: string
  specialNeeds?: string[]
  partySize: number
  ageGroup?: 'adult' | 'child' | 'infant'
}

export interface PolicyDetails {
  cancellationPolicy: string
  cancellationDeadline: Date
  refundPolicy: string
  modificationAllowed: boolean
  transferable: boolean
  requiresDeposit: boolean
  depositAmount?: number
  insuranceAvailable: boolean
  insurancePrice?: number
}

export interface ReservationMetadata {
  source: 'app' | 'web' | 'phone' | 'desk' | 'partner'
  deviceId?: string
  ipAddress?: string
  userAgent?: string
  referrer?: string
  campaign?: string
  partnerCode?: string
  groupId?: string // For group bookings
  linkedReservations: string[] // Related reservations
  tags: string[]
  version: number // For optimistic locking
}

export interface ReservationConflict {
  type: 'time' | 'resource' | 'capacity' | 'dependency' | 'policy'
  reservation1: string
  reservation2: string
  message: string
  resolvable: boolean
  resolution?: ConflictResolution
}

export interface ConflictResolution {
  type: 'reschedule' | 'upgrade' | 'downgrade' | 'cancel' | 'override'
  targetReservation: string
  newSchedule?: ScheduleDetails
  newResource?: string
  approvalRequired: boolean
}

export interface ReservationValidation {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

export interface AvailabilityCheck {
  available: boolean
  alternatives: Alternative[]
  nextAvailable?: Date
  capacity?: {
    total: number
    used: number
    available: number
  }
}

export interface Alternative {
  date: string
  time: string
  price: number
  discount?: number
  reason: string
}

export interface ReservationQueue {
  id: string
  reservations: Reservation[]
  strategy: 'parallel' | 'sequential' | 'batch'
  retryPolicy: RetryPolicy
  status: 'pending' | 'processing' | 'completed' | 'failed'
  results: QueueResult[]
}

export interface RetryPolicy {
  maxAttempts: number
  backoffMs: number
  exponential: boolean
}

export interface QueueResult {
  reservationId: string
  success: boolean
  error?: string
  attempts: number
}

// ========== RESERVATION MANAGER CLASS ==========

class ReservationManager extends EventEmitter {
  private static instance: ReservationManager
  private reservations: Map<string, Reservation>
  private queues: Map<string, ReservationQueue>
  private conflicts: ConflictDetector
  private scheduler: ReservationScheduler
  private validator: ReservationValidator
  private notifier: ReservationNotifier
  private analytics: ReservationAnalytics
  private debugMode: boolean = false

  private constructor() {
    super()
    this.reservations = new Map()
    this.queues = new Map()
    this.conflicts = new ConflictDetector()
    this.scheduler = new ReservationScheduler()
    this.validator = new ReservationValidator()
    this.notifier = new ReservationNotifier()
    this.analytics = new ReservationAnalytics()
    this.initialize()
  }

  // Singleton pattern
  public static getInstance(): ReservationManager {
    if (!ReservationManager.instance) {
      ReservationManager.instance = new ReservationManager()
    }
    return ReservationManager.instance
  }

  // Initialize the manager
  private initialize(): void {
    // Set up event listeners
    this.setupEventListeners()
    
    // Start background tasks
    this.startBackgroundTasks()
    
    if (this.debugMode) {
      console.log('🎯 ReservationManager initialized')
    }
  }

  // ========== CORE RESERVATION METHODS ==========

  public async createReservation(
    type: ReservationType,
    data: Partial<ReservationData>,
    schedule: Partial<ScheduleDetails>,
    pricing: Partial<PricingDetails>,
    guest?: Partial<GuestDetails>
  ): Promise<Reservation> {
    // Generate ID
    const id = this.generateReservationId(type)
    
    // Get current user from state
    const user = stateManager.getUser()
    
    // Build reservation object
    const reservation: Reservation = {
      id,
      type,
      serviceId: data.description || '',
      serviceName: data.description || '',
      status: 'draft',
      priority: this.calculatePriority(type),
      dependencies: [],
      conflicts: [],
      data: {
        description: '',
        ...data
      },
      pricing: {
        basePrice: 0,
        taxes: 0,
        fees: 0,
        tips: 0,
        discounts: 0,
        total: 0,
        currency: 'USD',
        breakdown: [],
        paymentMethod: 'roomCharge',
        paid: false,
        ...pricing
      },
      schedule: {
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        timezone: 'America/Phoenix',
        flexible: false,
        reminders: this.getDefaultReminders(type),
        ...schedule
      },
      guest: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: '',
        loyaltyTier: user.tier,
        preferences: [],
        partySize: 1,
        ...guest
      },
      policies: this.getDefaultPolicies(type),
      metadata: {
        source: 'app',
        linkedReservations: [],
        tags: [],
        version: 1
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Validate reservation
    const validation = await this.validator.validate(reservation)
    if (!validation.valid) {
      throw new Error(`Reservation validation failed: ${validation.errors[0].message}`)
    }
    
    // Check for conflicts
    const conflicts = await this.conflicts.detect(reservation, Array.from(this.reservations.values()))
    if (conflicts.length > 0 && !conflicts[0].resolvable) {
      throw new Error(`Reservation conflict: ${conflicts[0].message}`)
    }
    
    // Store reservation
    this.reservations.set(id, reservation)
    
    // Emit event
    this.emit('reservation:created', reservation)
    
    // Add to state manager
    actions.createBooking({
      type: type,
      service: reservation.serviceName,
      status: 'pending',
      price: reservation.pricing.total,
      commission: reservation.pricing.commission,
      date: reservation.schedule.date,
      time: reservation.schedule.time,
      details: reservation.data
    })
    
    if (this.debugMode) {
      console.log('🎯 Reservation created:', reservation)
    }
    
    return reservation
  }

  public async confirmReservation(reservationId: string): Promise<Reservation> {
    const reservation = this.reservations.get(reservationId)
    if (!reservation) {
      throw new Error('Reservation not found')
    }
    
    // Check dependencies
    const unconfirmedDeps = await this.checkDependencies(reservation)
    if (unconfirmedDeps.length > 0) {
      throw new Error(`Cannot confirm: waiting for ${unconfirmedDeps.length} dependencies`)
    }
    
    // Check availability
    const availability = await this.checkAvailability(reservation)
    if (!availability.available) {
      throw new Error('Service not available at requested time')
    }
    
    // Process payment if needed
    if (!reservation.pricing.paid) {
      await this.processPayment(reservation)
    }
    
    // Update status
    reservation.status = 'confirmed'
    reservation.confirmedAt = new Date()
    reservation.updatedAt = new Date()
    
    // Schedule reminders
    this.scheduler.scheduleReminders(reservation)
    
    // Send confirmation
    await this.notifier.sendConfirmation(reservation)
    
    // Update analytics
    this.analytics.trackConfirmation(reservation)
    
    // Emit event
    this.emit('reservation:confirmed', reservation)
    
    // Show success message
    actions.showToast('success', `${reservation.serviceName} confirmed!`)
    
    return reservation
  }

  public async cancelReservation(
    reservationId: string,
    reason?: string
  ): Promise<Reservation> {
    const reservation = this.reservations.get(reservationId)
    if (!reservation) {
      throw new Error('Reservation not found')
    }
    
    // Check cancellation policy
    const canCancel = this.checkCancellationPolicy(reservation)
    if (!canCancel) {
      throw new Error('Cannot cancel: past cancellation deadline')
    }
    
    // Calculate refund
    const refundAmount = this.calculateRefund(reservation)
    
    // Update reservation
    reservation.status = 'cancelled'
    reservation.cancelledAt = new Date()
    reservation.updatedAt = new Date()
    reservation.pricing.refundAmount = refundAmount
    
    // Process refund if applicable
    if (refundAmount > 0) {
      await this.processRefund(reservation, refundAmount)
    }
    
    // Cancel dependent reservations
    await this.cancelDependentReservations(reservation)
    
    // Send cancellation notification
    await this.notifier.sendCancellation(reservation, reason)
    
    // Update analytics
    this.analytics.trackCancellation(reservation)
    
    // Emit event
    this.emit('reservation:cancelled', reservation)
    
    // Show message
    actions.showToast('info', `${reservation.serviceName} cancelled`)
    
    return reservation
  }

  public async modifyReservation(
    reservationId: string,
    updates: Partial<Reservation>
  ): Promise<Reservation> {
    const reservation = this.reservations.get(reservationId)
    if (!reservation) {
      throw new Error('Reservation not found')
    }
    
    // Check modification policy
    if (!reservation.policies.modificationAllowed) {
      throw new Error('Modifications not allowed for this reservation')
    }
    
    // Create modified copy
    const modified = {
      ...reservation,
      ...updates,
      updatedAt: new Date(),
      metadata: {
        ...reservation.metadata,
        version: reservation.metadata.version + 1
      }
    }
    
    // Validate modifications
    const validation = await this.validator.validate(modified)
    if (!validation.valid) {
      throw new Error(`Invalid modification: ${validation.errors[0].message}`)
    }
    
    // Check for new conflicts
    const conflicts = await this.conflicts.detect(modified, Array.from(this.reservations.values()))
    if (conflicts.length > 0) {
      throw new Error(`Modification creates conflict: ${conflicts[0].message}`)
    }
    
    // Apply modifications
    this.reservations.set(reservationId, modified)
    
    // Send modification notification
    await this.notifier.sendModification(modified)
    
    // Emit event
    this.emit('reservation:modified', modified)
    
    return modified
  }

  // ========== BUNDLE MANAGEMENT ==========

  public async createBundle(
    components: Array<{
      type: ReservationType
      data: Partial<ReservationData>
      schedule: Partial<ScheduleDetails>
    }>
  ): Promise<ReservationQueue> {
    const queueId = this.generateQueueId()
    const reservations: Reservation[] = []
    
    // Calculate bundle discount
    const bundleDiscount = 0.10 // 10% off
    
    // Create reservations for each component
    for (const component of components) {
      const pricing: Partial<PricingDetails> = {
        discounts: component.data.amenityData?.items[0]?.price 
          ? component.data.amenityData.items[0].price * bundleDiscount 
          : 0
      }
      
      const reservation = await this.createReservation(
        component.type,
        component.data,
        component.schedule,
        pricing
      )
      
      // Link reservations
      reservation.metadata.groupId = queueId
      reservations.push(reservation)
    }
    
    // Set dependencies (hotel must be confirmed before other services)
    const hotelRes = reservations.find(r => r.type === 'hotel')
    if (hotelRes) {
      reservations.forEach(r => {
        if (r.id !== hotelRes.id) {
          r.dependencies.push(hotelRes.id)
        }
      })
    }
    
    // Create queue
    const queue: ReservationQueue = {
      id: queueId,
      reservations,
      strategy: 'sequential',
      retryPolicy: {
        maxAttempts: 3,
        backoffMs: 1000,
        exponential: true
      },
      status: 'pending',
      results: []
    }
    
    this.queues.set(queueId, queue)
    
    // Process queue
    await this.processQueue(queue)
    
    return queue
  }

  private async processQueue(queue: ReservationQueue): Promise<void> {
    queue.status = 'processing'
    
    if (queue.strategy === 'sequential') {
      // Process one by one
      for (const reservation of queue.reservations) {
        try {
          await this.confirmReservation(reservation.id)
          queue.results.push({
            reservationId: reservation.id,
            success: true,
            attempts: 1
          })
        } catch (error: any) {
          queue.results.push({
            reservationId: reservation.id,
            success: false,
            error: error.message,
            attempts: 1
          })
        }
      }
    } else if (queue.strategy === 'parallel') {
      // Process all at once
      const promises = queue.reservations.map(r => this.confirmReservation(r.id))
      const results = await Promise.allSettled(promises)
      
      results.forEach((result, index) => {
        queue.results.push({
          reservationId: queue.reservations[index].id,
          success: result.status === 'fulfilled',
          error: result.status === 'rejected' ? result.reason : undefined,
          attempts: 1
        })
      })
    }
    
    queue.status = queue.results.every(r => r.success) ? 'completed' : 'failed'
  }

  // ========== CONFLICT DETECTION ==========

  private async checkDependencies(reservation: Reservation): Promise<string[]> {
    const unconfirmed: string[] = []
    
    for (const depId of reservation.dependencies) {
      const dep = this.reservations.get(depId)
      if (!dep || dep.status !== 'confirmed') {
        unconfirmed.push(depId)
      }
    }
    
    return unconfirmed
  }

  private async checkAvailability(reservation: Reservation): Promise<AvailabilityCheck> {
    // This would normally call the API
    // Mock implementation
    
    // Check capacity for the service
    const capacity = await this.getServiceCapacity(reservation)
    
    if (capacity.available <= 0) {
      return {
        available: false,
        alternatives: this.suggestAlternatives(reservation),
        nextAvailable: new Date(Date.now() + 3600000), // 1 hour later
        capacity
      }
    }
    
    return {
      available: true,
      alternatives: [],
      capacity
    }
  }

  private async getServiceCapacity(reservation: Reservation): Promise<any> {
    // Mock capacity check
    return {
      total: 100,
      used: 85,
      available: 15
    }
  }

  private suggestAlternatives(reservation: Reservation): Alternative[] {
    // Suggest alternative times
    const alternatives: Alternative[] = []
    const baseDate = new Date(reservation.schedule.date)
    
    for (let i = 1; i <= 3; i++) {
      const altDate = new Date(baseDate)
      altDate.setHours(baseDate.getHours() + i)
      
      alternatives.push({
        date: altDate.toISOString().split('T')[0],
        time: altDate.toTimeString().split(' ')[0].substring(0, 5),
        price: reservation.pricing.basePrice * (1 + i * 0.05), // Slight price increase
        reason: `Available ${i} hour${i > 1 ? 's' : ''} later`
      })
    }
    
    return alternatives
  }

  // ========== PAYMENT PROCESSING ==========

  private async processPayment(reservation: Reservation): Promise<void> {
    // Simulate payment processing
    await this.delay(1000)
    
    // Update reservation
    reservation.pricing.paid = true
    
    // Add to room charges if applicable
    if (reservation.pricing.paymentMethod === 'roomCharge') {
      actions.addToCart({
        type: reservation.type,
        serviceId: reservation.id,
        name: reservation.serviceName,
        description: reservation.data.description,
        price: reservation.pricing.total,
        quantity: 1,
        metadata: reservation
      })
    }
    
    // Track revenue
    if (reservation.pricing.commission) {
      const revenue = stateManager.getRevenue()
      const newRevenue = {
        ...revenue,
        today: revenue.today + reservation.pricing.commission,
        commissions: {
          ...revenue.commissions,
          total: revenue.commissions.total + reservation.pricing.commission
        }
      }
      stateManager.setState({ revenue: newRevenue })
    }
  }

  private async processRefund(reservation: Reservation, amount: number): Promise<void> {
    // Simulate refund processing
    await this.delay(1500)
    
    // Update revenue
    if (reservation.pricing.commission) {
      const revenue = stateManager.getRevenue()
      const newRevenue = {
        ...revenue,
        today: revenue.today - reservation.pricing.commission,
        commissions: {
          ...revenue.commissions,
          total: revenue.commissions.total - reservation.pricing.commission
        }
      }
      stateManager.setState({ revenue: newRevenue })
    }
  }

  // ========== POLICIES ==========

  private checkCancellationPolicy(reservation: Reservation): boolean {
    const now = new Date()
    const deadline = new Date(reservation.policies.cancellationDeadline)
    return now < deadline
  }

  private calculateRefund(reservation: Reservation): number {
    if (!reservation.pricing.paid) return 0
    
    const now = new Date()
    const reservationDate = new Date(reservation.schedule.date)
    const hoursUntil = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    // Refund policy based on time
    if (hoursUntil > 48) {
      return reservation.pricing.total // Full refund
    } else if (hoursUntil > 24) {
      return reservation.pricing.total * 0.5 // 50% refund
    } else {
      return 0 // No refund
    }
  }

  private getDefaultPolicies(type: ReservationType): PolicyDetails {
    const basePolicy: PolicyDetails = {
      cancellationPolicy: 'Free cancellation up to 24 hours before',
      cancellationDeadline: new Date(Date.now() + 86400000), // 24 hours
      refundPolicy: 'Full refund if cancelled 48+ hours before',
      modificationAllowed: true,
      transferable: false,
      requiresDeposit: false,
      insuranceAvailable: true,
      insurancePrice: 10
    }
    
    // Customize by type
    switch (type) {
      case 'flight':
        basePolicy.transferable = true
        basePolicy.requiresDeposit = true
        basePolicy.depositAmount = 100
        break
      case 'hotel':
        basePolicy.cancellationDeadline = new Date(Date.now() + 172800000) // 48 hours
        break
      case 'spa':
        basePolicy.cancellationDeadline = new Date(Date.now() + 43200000) // 12 hours
        break
    }
    
    return basePolicy
  }

  private getDefaultReminders(type: ReservationType): Reminder[] {
    const reminders: Reminder[] = []
    
    switch (type) {
      case 'flight':
        reminders.push(
          { id: '1', time: 1440, type: 'email', sent: false }, // 24 hours
          { id: '2', time: 180, type: 'push', sent: false }   // 3 hours
        )
        break
      case 'spa':
      case 'transport':
        reminders.push(
          { id: '1', time: 60, type: 'push', sent: false }    // 1 hour
        )
        break
      default:
        reminders.push(
          { id: '1', time: 30, type: 'push', sent: false }    // 30 minutes
        )
    }
    
    return reminders
  }

  // ========== DEPENDENT RESERVATIONS ==========

  private async cancelDependentReservations(reservation: Reservation): Promise<void> {
    // Find reservations that depend on this one
    const dependents = Array.from(this.reservations.values()).filter(r => 
      r.dependencies.includes(reservation.id)
    )
    
    for (const dependent of dependents) {
      if (dependent.status !== 'cancelled') {
        await this.cancelReservation(dependent.id, 'Dependency cancelled')
      }
    }
  }

  // ========== PRIORITY CALCULATION ==========

  private calculatePriority(type: ReservationType): number {
    const priorities: Record<ReservationType, number> = {
      flight: 10,
      hotel: 9,
      transport: 8,
      spa: 7,
      rental: 6,
      ride: 5,
      food: 4,
      amenity: 3,
      bundle: 2
    }
    
    return priorities[type] || 1
  }

  // ========== BACKGROUND TASKS ==========

  private startBackgroundTasks(): void {
    // Check for reminders every minute
    setInterval(() => {
      this.processReminders()
    }, 60000)
    
    // Update reservation statuses
    setInterval(() => {
      this.updateStatuses()
    }, 30000)
    
    // Clean up old reservations
    setInterval(() => {
      this.cleanupOldReservations()
    }, 3600000) // Every hour
  }

  private processReminders(): void {
    const now = new Date()
    
    this.reservations.forEach(reservation => {
      if (reservation.status === 'confirmed') {
        const reservationTime = new Date(`${reservation.schedule.date} ${reservation.schedule.time}`)
        
        reservation.schedule.reminders.forEach(reminder => {
          if (!reminder.sent) {
            const reminderTime = new Date(reservationTime.getTime() - reminder.time * 60000)
            
            if (now >= reminderTime) {
              this.notifier.sendReminder(reservation, reminder)
              reminder.sent = true
            }
          }
        })
      }
    })
  }

  private updateStatuses(): void {
    const now = new Date()
    
    this.reservations.forEach(reservation => {
      const reservationTime = new Date(`${reservation.schedule.date} ${reservation.schedule.time}`)
      
      // Update status based on time
      if (reservation.status === 'confirmed' && now >= reservationTime) {
        reservation.status = 'in-progress'
        this.emit('reservation:started', reservation)
      }
      
      // Complete reservations after duration
      if (reservation.status === 'in-progress' && reservation.schedule.duration) {
        const endTime = new Date(reservationTime.getTime() + reservation.schedule.duration * 60000)
        if (now >= endTime) {
          reservation.status = 'completed'
          this.emit('reservation:completed', reservation)
        }
      }
    })
  }

  private cleanupOldReservations(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    this.reservations.forEach((reservation, id) => {
      if (reservation.status === 'completed' || reservation.status === 'cancelled') {
        if (reservation.updatedAt < thirtyDaysAgo) {
          this.reservations.delete(id)
        }
      }
    })
  }

  // ========== EVENT LISTENERS ==========

  private setupEventListeners(): void {
    // Listen for state changes
    stateManager.subscribe('user', (user: any) => {
      // Update guest details for draft reservations
      this.reservations.forEach(reservation => {
        if (reservation.status === 'draft') {
          reservation.guest.loyaltyTier = user.tier
        }
      })
    })
  }

  // ========== UTILITY METHODS ==========

  private generateReservationId(type: ReservationType): string {
    const prefix = type.substring(0, 3).toUpperCase()
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 6)
    return `${prefix}-${timestamp}-${random}`
  }

  private generateQueueId(): string {
    return `QUEUE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ========== PUBLIC GETTERS ==========

  public getReservation(id: string): Reservation | undefined {
    return this.reservations.get(id)
  }

  public getAllReservations(): Reservation[] {
    return Array.from(this.reservations.values())
  }

  public getReservationsByType(type: ReservationType): Reservation[] {
    return Array.from(this.reservations.values()).filter(r => r.type === type)
  }

  public getReservationsByStatus(status: ReservationStatus): Reservation[] {
    return Array.from(this.reservations.values()).filter(r => r.status === status)
  }

  public getUpcomingReservations(): Reservation[] {
    const now = new Date()
    return Array.from(this.reservations.values()).filter(r => {
      const resTime = new Date(`${r.schedule.date} ${r.schedule.time}`)
      return r.status === 'confirmed' && resTime > now
    })
  }

  // ========== DEBUG METHODS ==========

  public enableDebug(): void {
    this.debugMode = true
    console.log('🎯 ReservationManager Debug Mode Enabled')
  }

  public getDebugInfo(): any {
    return {
      totalReservations: this.reservations.size,
      byStatus: this.getStatusBreakdown(),
      byType: this.getTypeBreakdown(),
      queues: this.queues.size,
      upcomingReminders: this.getUpcomingReminders()
    }
  }

  private getStatusBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {}
    this.reservations.forEach(r => {
      breakdown[r.status] = (breakdown[r.status] || 0) + 1
    })
    return breakdown
  }

  private getTypeBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {}
    this.reservations.forEach(r => {
      breakdown[r.type] = (breakdown[r.type] || 0) + 1
    })
    return breakdown
  }

  private getUpcomingReminders(): number {
    let count = 0
    this.reservations.forEach(r => {
      if (r.status === 'confirmed') {
        count += r.schedule.reminders.filter(rem => !rem.sent).length
      }
    })
    return count
  }
}

// ========== HELPER CLASSES ==========

class ConflictDetector {
  detect(reservation: Reservation, existing: Reservation[]): ReservationConflict[] {
    const conflicts: ReservationConflict[] = []
    
    existing.forEach(existing => {
      // Skip self and cancelled
      if (existing.id === reservation.id || existing.status === 'cancelled') {
        return
      }
      
      // Check time conflicts for same resource
      if (this.hasTimeConflict(reservation, existing)) {
        conflicts.push({
          type: 'time',
          reservation1: reservation.id,
          reservation2: existing.id,
          message: `Time conflict with ${existing.serviceName}`,
          resolvable: true,
          resolution: {
            type: 'reschedule',
            targetReservation: reservation.id,
            approvalRequired: false
          }
        })
      }
    })
    
    return conflicts
  }
  
  private hasTimeConflict(r1: Reservation, r2: Reservation): boolean {
    if (r1.schedule.date !== r2.schedule.date) return false
    
    const time1 = new Date(`${r1.schedule.date} ${r1.schedule.time}`)
    const time2 = new Date(`${r2.schedule.date} ${r2.schedule.time}`)
    
    const duration1 = r1.schedule.duration || 60
    const duration2 = r2.schedule.duration || 60
    
    const end1 = new Date(time1.getTime() + duration1 * 60000)
    const end2 = new Date(time2.getTime() + duration2 * 60000)
    
    return (time1 < end2 && end1 > time2)
  }
}

class ReservationScheduler {
  scheduleReminders(reservation: Reservation): void {
    // In production, this would schedule actual notifications
    reservation.schedule.reminders.forEach(reminder => {
      const reservationTime = new Date(`${reservation.schedule.date} ${reservation.schedule.time}`)
      const reminderTime = new Date(reservationTime.getTime() - reminder.time * 60000)
      
      if (reminderTime > new Date()) {
        // Schedule notification
        setTimeout(() => {
          actions.addNotification({
            type: 'info',
            title: 'Upcoming Reservation',
            message: `${reservation.serviceName} in ${reminder.time} minutes`,
            actionUrl: `/reservations/${reservation.id}`,
            actionLabel: 'View Details'
          })
        }, reminderTime.getTime() - Date.now())
      }
    })
  }
}

class ReservationValidator {
  async validate(reservation: Reservation): Promise<ReservationValidation> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    
    // Required fields
    if (!reservation.serviceName) {
      errors.push({
        field: 'serviceName',
        message: 'Service name is required',
        code: 'REQUIRED_FIELD'
      })
    }
    
    if (!reservation.schedule.date) {
      errors.push({
        field: 'schedule.date',
        message: 'Date is required',
        code: 'REQUIRED_FIELD'
      })
    }
    
    // Date validation
    const reservationDate = new Date(reservation.schedule.date)
    if (reservationDate < new Date()) {
      errors.push({
        field: 'schedule.date',
        message: 'Cannot book in the past',
        code: 'INVALID_DATE'
      })
    }
    
    // Price validation
    if (reservation.pricing.total < 0) {
      errors.push({
        field: 'pricing.total',
        message: 'Invalid price',
        code: 'INVALID_PRICE'
      })
    }
    
    // Warnings
    if (reservationDate > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
      warnings.push({
        field: 'schedule.date',
        message: 'Booking more than a year in advance',
        code: 'FAR_FUTURE'
      })
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

class ReservationNotifier {
  async sendConfirmation(reservation: Reservation): Promise<void> {
    actions.addNotification({
      type: 'success',
      title: 'Reservation Confirmed!',
      message: `Your ${reservation.serviceName} is confirmed for ${reservation.schedule.date} at ${reservation.schedule.time}`,
      actionUrl: `/reservations/${reservation.id}`,
      actionLabel: 'View Reservation'
    })
  }
  
  async sendCancellation(reservation: Reservation, reason?: string): Promise<void> {
    actions.addNotification({
      type: 'info',
      title: 'Reservation Cancelled',
      message: `Your ${reservation.serviceName} has been cancelled. ${reason || ''}`,
      actionUrl: `/reservations`,
      actionLabel: 'View All Reservations'
    })
  }
  
  async sendModification(reservation: Reservation): Promise<void> {
    actions.addNotification({
      type: 'info',
      title: 'Reservation Modified',
      message: `Your ${reservation.serviceName} has been updated`,
      actionUrl: `/reservations/${reservation.id}`,
      actionLabel: 'View Changes'
    })
  }
  
  async sendReminder(reservation: Reservation, reminder: Reminder): Promise<void> {
    actions.addNotification({
      type: 'info',
      title: `Reminder: ${reservation.serviceName}`,
      message: `Your reservation is coming up at ${reservation.schedule.time}`,
      actionUrl: `/reservations/${reservation.id}`,
      actionLabel: 'View Details'
    })
  }
}

class ReservationAnalytics {
  trackConfirmation(reservation: Reservation): void {
    // Track metrics
    console.log('📊 Reservation confirmed:', {
      type: reservation.type,
      value: reservation.pricing.total,
      commission: reservation.pricing.commission
    })
  }
  
  trackCancellation(reservation: Reservation): void {
    // Track metrics
    console.log('📊 Reservation cancelled:', {
      type: reservation.type,
      value: reservation.pricing.total,
      refund: reservation.pricing.refundAmount
    })
  }
}

// ========== EXPORTS ==========

export const reservationManager = ReservationManager.getInstance()

export const createReservation = (
  type: ReservationType,
  data: Partial<ReservationData>,
  schedule: Partial<ScheduleDetails>,
  pricing: Partial<PricingDetails>,
  guest?: Partial<GuestDetails>
) => reservationManager.createReservation(type, data, schedule, pricing, guest)

export const confirmReservation = (id: string) => reservationManager.confirmReservation(id)
export const cancelReservation = (id: string, reason?: string) => reservationManager.cancelReservation(id, reason)
export const modifyReservation = (id: string, updates: Partial<Reservation>) => reservationManager.modifyReservation(id, updates)
export const createBundle = (components: any[]) => reservationManager.createBundle(components)

export default reservationManager