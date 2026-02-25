// app/fleet/bookings/types.ts

export interface FleetBooking {
  id: string
  bookingCode: string

  // Guest information
  guestId?: string
  guestName: string
  guestEmail: string
  guestPhone: string
  guestProfileUrl?: string
  guestStripeVerified?: boolean

  // Car information
  car: {
    id: string
    make: string
    model: string
    year: number
    photoUrl?: string
    source: string
    licensePlate?: string
  }

  // Host information
  host: {
    id: string
    name: string
    email: string
    phone?: string
  }

  // Dates and times
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  numberOfDays: number

  // Location
  pickupType: string
  pickupLocation: string
  deliveryAddress?: string
  returnLocation?: string

  // Pricing
  dailyRate: number
  subtotal: number
  deliveryFee: number
  insuranceFee: number
  serviceFee: number
  taxes: number
  totalAmount: number
  depositAmount: number

  // Status
  status: BookingStatus
  paymentStatus: PaymentStatus
  paymentType?: string | null
  fleetStatus?: string
  hostStatus?: string | null
  verificationStatus: VerificationStatus
  tripStatus: TripStatus

  // Host Final Review
  hostFinalReviewStatus?: string | null
  hostFinalReviewDeadline?: string | null
  depositRefunded?: boolean
  depositRefundedAt?: string | null

  // Verification details
  licenseVerified: boolean
  selfieVerified: boolean
  licensePhotoUrl?: string
  insurancePhotoUrl?: string
  selfiePhotoUrl?: string
  licenseNumber?: string
  licenseState?: string
  licenseExpiry?: string
  dateOfBirth?: string
  documentsSubmittedAt?: string
  verificationDeadline?: string
  verificationNotes?: string
  reviewedBy?: string
  reviewedAt?: string

  // Hold
  holdReason?: string | null
  heldAt?: string | null
  heldBy?: string | null
  holdDeadline?: string | null
  holdMessage?: string | null
  previousStatus?: string | null

  // Cancellation
  cancellationReason?: string
  cancelledBy?: string
  cancelledAt?: string

  // Trip details
  tripStartedAt?: string
  tripEndedAt?: string
  startMileage?: number
  endMileage?: number
  fuelLevelStart?: string
  fuelLevelEnd?: string

  // Risk analysis
  riskScore?: number
  riskFlags?: string
  flaggedForReview: boolean

  // Disputes/Claims
  hasDispute: boolean
  disputes?: BookingDispute[]

  // Timestamps
  createdAt: string
  updatedAt: string
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ON_HOLD'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'DISPUTE_REVIEW'

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'

export type VerificationStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'

export type TripStatus =
  | 'NOT_STARTED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CHECKED_OUT'

export interface BookingDispute {
  id: string
  type: string
  status: string
  description: string
  createdAt: string
}

export interface BookingFilters {
  status?: BookingStatus | 'all'
  verificationStatus?: VerificationStatus | 'all'
  search?: string
  dateFrom?: string
  dateTo?: string
  hostId?: string
  guestId?: string
  page?: number
  limit?: number
}

export interface BookingStats {
  totalBookings: number
  totalRevenue: number
  totalServiceFees: number
  pendingVerification: number
  activeBookings: number
  completedToday: number
  needsAttention: number
  todayBookings: number
  pendingReview: number
  pendingHostReview: number
}

export interface BookingActionPayload {
  bookingId: string
  action: 'approve' | 'reject' | 'cancel' | 'modify' | 'change_car' | 'request_documents' | 'resend_email'
  reason?: string
  notes?: string
  newCarId?: string
  modifications?: {
    startDate?: string
    endDate?: string
    pickupLocation?: string
    deliveryAddress?: string
  }
  documentTypes?: string[]
}

export interface ModifyBookingFormData {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  pickupLocation: string
  deliveryAddress: string
  notes: string
}

export interface ChangeCarFormData {
  newCarId: string
  reason: string
  adjustPrice: boolean
  newDailyRate?: number
  notes: string
}

export interface RequestDocumentsFormData {
  documentTypes: string[]
  deadline: string
  customMessage: string
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function getStatusColor(status: BookingStatus): string {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'CONFIRMED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'ON_HOLD': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'COMPLETED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'NO_SHOW': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    case 'DISPUTE_REVIEW': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusLabel(status: BookingStatus): string {
  switch (status) {
    case 'PENDING': return 'Pending'
    case 'CONFIRMED': return 'Confirmed'
    case 'ON_HOLD': return 'On Hold'
    case 'ACTIVE': return 'Active'
    case 'COMPLETED': return 'Completed'
    case 'CANCELLED': return 'Cancelled'
    case 'NO_SHOW': return 'No-Show'
    case 'DISPUTE_REVIEW': return 'Dispute Review'
    default: return status
  }
}

export function getVerificationLabel(status: VerificationStatus): string {
  switch (status) {
    case 'PENDING': return 'Pending'
    case 'IN_REVIEW': return 'In Review'
    case 'APPROVED': return 'Verified'
    case 'REJECTED': return 'Rejected'
    case 'EXPIRED': return 'Expired'
    default: return status
  }
}

export function isTerminalStatus(status: BookingStatus): boolean {
  return status === 'CANCELLED' || status === 'COMPLETED' || status === 'NO_SHOW'
}

export function getVerificationColor(status: VerificationStatus): string {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'IN_REVIEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'EXPIRED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getTripStatusLabel(status: TripStatus): string {
  switch (status) {
    case 'NOT_STARTED': return 'Not Started'
    case 'CHECKED_IN': return 'Checked In'
    case 'IN_PROGRESS': return 'In Progress'
    case 'COMPLETED': return 'Trip Completed'
    case 'CHECKED_OUT': return 'Checked Out'
    default: return status
  }
}

export function getReviewStatusColor(status: string | null | undefined): string {
  switch (status) {
    case 'PENDING_REVIEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'AUTO_APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'CLAIM_FILED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getReviewStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'PENDING_REVIEW': return 'Pending Host Review'
    case 'APPROVED': return 'Host Approved'
    case 'AUTO_APPROVED': return 'Auto-Approved (24h)'
    case 'CLAIM_FILED': return 'Claim Filed'
    default: return ''
  }
}
