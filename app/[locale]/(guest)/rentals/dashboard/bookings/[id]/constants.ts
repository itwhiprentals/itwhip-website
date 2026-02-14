// app/(guest)/rentals/dashboard/bookings/[id]/constants.ts

export const CANCELLATION_POLICIES = {
    STANDARD: {
      name: 'Standard',
      description: 'Day-based cancellation — deposit always released',
      freeWindowHours: 24,
      tiers: [
        { hours: 24, refund: 1.0, label: 'Full refund', penalty: 'None' },
        { hours: 0, refund: null, label: 'Late cancellation', penalty: '1 day avg cost (50% for short trips)' }
      ]
    }
  }
  
  export const QUICK_ACTION_MESSAGES = [
    "Thank you!",
    "When can I pick up the car?",
    "I've uploaded my documents",
    "What's the exact pickup location?",
    "Can I extend my rental?",
  ]
  
  export const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
    ACTIVE: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  }
  
  export const VERIFICATION_STATUS = {
    PENDING: 'pending',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    VERIFIED: 'verified'
  }
  
  export const PAYMENT_STATUS = {
    NOT_REQUIRED: 'not_required',
    PENDING: 'pending',
    PENDING_CHARGE: 'pending_charge',
    PAID: 'paid',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    PARTIAL_REFUND: 'partial_refund'
  }
  
  export const PICKUP_TYPES = {
    HOST: 'host',
    DELIVERY: 'delivery',
    AIRPORT: 'airport',
    HOTEL: 'hotel'
  }
  
  export const MESSAGE_POLLING_INTERVAL = 10000 // 10 seconds
  export const BOOKING_POLLING_INTERVAL = 15000 // 15 seconds
  
  export const FILE_UPLOAD_CONFIG = {
    validTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedFormats: 'image/*,.pdf'
  }
  
  export const TIME_THRESHOLDS = {
    SHOW_HOST_INTRO_DAYS: 7,
    SHOW_FULL_DETAILS_HOURS: 24,
    SHOW_ACCESS_CODES_HOURS: 1,
    SERVICE_FEE_REFUND_DAYS: 7,
    MESSAGE_GRACE_PERIOD_MINUTES: 30
  }