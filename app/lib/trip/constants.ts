// app/lib/trip/constants.ts

export const TRIP_CONSTANTS = {
  // Time windows
  PICKUP_WINDOW_BEFORE_MINUTES: 30,
  PICKUP_WINDOW_AFTER_HOURS: 3,
  TRIP_EXPIRY_HOURS: 24,
  CHARGE_HOLD_HOURS: 24, // NEW: 24-hour hold period for charge review
  
  // Charge Processing
  CHARGE_PROCESSING: {
    AUTO_CHARGE_THRESHOLD: 500, // Auto-charge if under this amount
    REVIEW_REQUIRED_THRESHOLD: 1000, // Require review if over this amount
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    DISPUTE_HOLD_DAYS: 3, // Hold charges for 3 days if disputed
  },
  
  // Waive Percentages
  WAIVE_PERCENTAGES: {
    FULL: 100,
    HALF: 50,
    QUARTER: 25,
    PRESETS: [100, 50, 25], // Quick waive button options
  },
  
  // Mileage
  DAILY_MILEAGE_INCLUDED: 200,
  OVERAGE_RATE_PER_MILE: 0.45,
  
  // Fuel
  FUEL_LEVELS: ['Empty', '1/4', '1/2', '3/4', 'Full'],
  FUEL_LEVEL_VALUES: { // NEW: Numeric values for calculations
    'Empty': 0,
    '1/4': 0.25,
    '1/2': 0.5,
    '3/4': 0.75,
    'Full': 1.0
  },
  REFUEL_FEE: 75,
  FUEL_CHARGE_PER_QUARTER_TANK: 75, // NEW: $75 per quarter tank
  FUEL_CHARGE_FULL_TANK: 300, // NEW: Full tank refill charge
  FUEL_TOLERANCE_PERCENT: 5,
  
  // Late fees
  GRACE_PERIOD_MINUTES: 15,
  LATE_FEE_PER_HOUR: 50,
  LATE_FEE_DAILY_MAX: 500, // NEW: Max late fee per day
  
  // Cleaning fees (NEW)
  CLEANING_FEES: {
    STANDARD: 150,
    EXCESSIVE_MESS: 250,
    BIOHAZARD: 500
  },
  
  // Damage categories with preset costs
  DAMAGE_PRESETS: {
    'scratch_small': { name: 'Small Scratch (< 3")', cost: 150 },
    'scratch_large': { name: 'Large Scratch (> 3")', cost: 250 },
    'dent_small': { name: 'Small Dent', cost: 250 },
    'dent_large': { name: 'Large Dent', cost: 450 },
    'windshield_chip': { name: 'Windshield Chip', cost: 75 },
    'windshield_crack': { name: 'Windshield Crack', cost: 400 },
    'tire_damage': { name: 'Tire Damage', cost: 200 },
    'interior_stain': { name: 'Interior Stain', cost: 150 },
    'smoking': { name: 'Smoking Violation', cost: 250 },
    'missing_equipment': { name: 'Missing Equipment', cost: 100 }, // NEW
    'key_loss': { name: 'Lost Key/Remote', cost: 300 }, // NEW
    'other': { name: 'Other Damage', cost: 0 }
  },
  
  // Photo requirements
  REQUIRED_PHOTOS: {
    start: [
      { id: 'front', label: 'Front Exterior', required: true },
      { id: 'back', label: 'Rear Exterior', required: true },
      { id: 'driver_side', label: 'Driver Side', required: true },
      { id: 'passenger_side', label: 'Passenger Side', required: true },
      { id: 'odometer', label: 'Odometer Reading', required: true },
      { id: 'fuel', label: 'Fuel Gauge', required: true },
      { id: 'interior_front', label: 'Interior Front', required: true },
      { id: 'interior_back', label: 'Interior Back', required: false },
      { id: 'existing_damage', label: 'Any Existing Damage', required: false }
    ],
    end: [
      { id: 'front', label: 'Front Exterior', required: true },
      { id: 'back', label: 'Rear Exterior', required: true },
      { id: 'driver_side', label: 'Driver Side', required: true },
      { id: 'passenger_side', label: 'Passenger Side', required: true },
      { id: 'odometer', label: 'Odometer Reading', required: true },
      { id: 'fuel', label: 'Fuel Gauge', required: true },
      { id: 'interior_front', label: 'Interior Front', required: true },
      { id: 'new_damage', label: 'Any New Damage', required: false }
    ]
  },
  
  // Geolocation
  PICKUP_RADIUS_METERS: 500,

  // Handoff verification
  HANDOFF_RADIUS_METERS: 500,           // Guest must be within 500m
  HOST_HANDOFF_RADIUS_METERS: 500,      // Host soft-check (logged, doesn't block)
  HANDOFF_AUTO_FALLBACK_MINUTES: 5,     // Auto-complete after 5min (instant-book only)
  HANDOFF_POLLING_INTERVAL: 5000,       // 5s polling during handoff
  HANDOFF_TIMEOUT_MINUTES: 30,          // Mark expired after 30min no-action
  GUEST_PING_INTERVAL: 15000,           // 15s guest location ping
  GUEST_ETA_INTERVAL: 4,               // Call Haiku every 4th ping (~60s)
  IMPOSSIBLE_SPEED_MPH: 200,           // Anti-spoofing: flag if faster than this
  DROPOFF_POLLING_INTERVAL: 10000,     // 10s polling for drop-off notifications
  
  // Dispute
  DISPUTE_RESOLUTION_HOURS: 24, // UPDATED: 24 hours for resolution
  DISPUTE_REVIEW_SLA_HOURS: 2, // NEW: 2 hours to start review
  DISPUTE_REASONS: [
    'Mileage reading incorrect',
    'Fuel level disputed',
    'Damage was pre-existing',
    'Late fee unfair',
    'Cleaning fee excessive',
    'Charge calculation error',
    'Service issue during rental',
    'Other issue'
  ],
  
  // Payment Processing (NEW)
  PAYMENT: {
    STRIPE_RETRY_CODES: ['card_declined', 'processing_error', 'network_error'],
    NON_RETRYABLE_CODES: ['card_not_supported', 'invalid_account', 'lost_card', 'stolen_card'],
    REQUIRES_AUTH_CODES: ['authentication_required', '3d_secure_required']
  },
  
  // Admin Actions (NEW)
  ADMIN_ACTIONS: {
    WAIVE: 'waive',
    PARTIAL_WAIVE: 'partial_waive',
    ADJUST: 'adjust',
    PROCESS_CHARGES: 'process_charges',
    REVIEW_DISPUTE: 'review_dispute',
    RETRY_PAYMENT: 'retry_payment'
  },
  
  // Charge Status (NEW)
  CHARGE_STATUS: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    CHARGED: 'CHARGED',
    FAILED: 'FAILED',
    WAIVED: 'WAIVED',
    PARTIAL_WAIVED: 'PARTIAL_WAIVED',
    DISPUTED: 'DISPUTED',
    REFUNDED: 'REFUNDED',
    NO_PAYMENT_METHOD: 'NO_PAYMENT_METHOD',
    REQUIRES_AUTH: 'REQUIRES_AUTH',
    REVIEW_REQUESTED: 'REVIEW_REQUESTED'
  },
  
  // Notification Timing (NEW)
  NOTIFICATIONS: {
    CHARGE_REMINDER_HOURS: [2, 12, 24], // Remind guest at these intervals
    DISPUTE_UPDATE_HOURS: 24, // Update guest every 24 hours on dispute
    PAYMENT_FAILED_RETRY_HOURS: 4 // Retry notification after 4 hours
  }
}

export const TRIP_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED' // NEW
} as const

export type TripStatus = typeof TRIP_STATUS[keyof typeof TRIP_STATUS]

export const HANDOFF_STATUS = {
  PENDING: 'PENDING',
  GUEST_VERIFIED: 'GUEST_VERIFIED',
  HANDOFF_COMPLETE: 'HANDOFF_COMPLETE',
  EXPIRED: 'EXPIRED',
  BYPASSED: 'BYPASSED',
} as const

export type HandoffStatus = typeof HANDOFF_STATUS[keyof typeof HANDOFF_STATUS]

// NEW: Charge types for better type safety
export const CHARGE_TYPES = {
  MILEAGE: 'mileage',
  FUEL: 'fuel',
  LATE: 'late',
  DAMAGE: 'damage',
  CLEANING: 'cleaning',
  OTHER: 'other'
} as const

export type ChargeType = typeof CHARGE_TYPES[keyof typeof CHARGE_TYPES]

// NEW: Helper function to get charge rate
export const getChargeRate = (type: ChargeType): number => {
  switch (type) {
    case CHARGE_TYPES.MILEAGE:
      return TRIP_CONSTANTS.OVERAGE_RATE_PER_MILE
    case CHARGE_TYPES.FUEL:
      return TRIP_CONSTANTS.FUEL_CHARGE_PER_QUARTER_TANK
    case CHARGE_TYPES.LATE:
      return TRIP_CONSTANTS.LATE_FEE_PER_HOUR
    default:
      return 0
  }
}

// NEW: Validation thresholds
export const VALIDATION_LIMITS = {
  MAX_ODOMETER_READING: 999999,
  MIN_ODOMETER_READING: 0,
  MAX_DAILY_MILEAGE: 1000, // Flag for review if over 1000 miles/day
  MAX_CHARGE_AMOUNT: 10000, // Flag amounts over $10k for review
  MIN_CHARGE_AMOUNT: 0.01
}

// NEW: Time zone handling (for accurate late fees)
export const TIMEZONE_CONFIG = {
  DEFAULT: 'America/Phoenix',
  DISPLAY_FORMAT: 'MMM DD, YYYY h:mm A',
  ISO_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
}