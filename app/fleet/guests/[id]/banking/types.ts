// app/fleet/guests/[id]/banking/types.ts
// Shared types for guest banking page

export interface BankingData {
  guest: {
    id: string
    name: string
    email: string
    profilePhotoUrl: string | null
    stripeCustomerId: string | null
  }
  wallet: {
    creditBalance: number
    bonusBalance: number
    depositWalletBalance: number
    totalBalance: number
  }
  paymentMethods: PaymentMethod[]
  summary: {
    totalSpent: number
    pendingChargesCount: number
    pendingChargesAmount: number
    disputedChargesCount: number
    disputedChargesAmount: number
    pendingRefundsCount: number
    activeBookingsCount: number
  }
  alerts: {
    hasPendingCharges: boolean
    hasDisputedCharges: boolean
    hasPendingRefunds: boolean
    hasLockedPaymentMethod: boolean
    hasActiveClaim: boolean
  }
  activeClaims: ActiveClaim[]
  recentActivity: RecentActivity[]
  charges: {
    pending: Charge[]
    disputed: Charge[]
    completed: Charge[]
  }
  refunds: {
    pending: Refund[]
    completed: Refund[]
  }
  activeBookings: ActiveBooking[]
}

export interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  isLocked: boolean
  lockedForBooking?: string
  isLockedForClaim?: boolean
}

export interface RecentActivity {
  type: string
  amount: number
  description: string
  bookingCode?: string
  date: string
  chargeId?: string
}

export interface Charge {
  id: string
  bookingId: string
  bookingCode: string
  carName: string
  mileageCharge: number
  fuelCharge: number
  lateCharge: number
  damageCharge: number
  cleaningCharge: number
  otherCharges: number
  totalCharges: number
  chargeStatus: string
  chargedAt?: string
  chargedAmount?: number
  disputeNotes?: string
}

export interface Refund {
  id: string
  bookingId: string
  bookingCode: string
  amount: number
  reason: string
  status: string
  createdAt: string
  processedAt?: string
}

export interface ActiveBooking {
  id: string
  bookingCode: string
  carName: string
  startDate: string
  endDate: string
  paymentMethodId: string
}

export interface ActiveClaim {
  id: string
  type: string
  status: string
  estimatedCost: number
  approvedAmount: number | null
  deductible: number
  guestResponseDeadline: string | null
  bookingCode: string
  carDetails: string
  hostName: string
}

export type TabType = 'overview' | 'payment-methods' | 'charges' | 'refunds' | 'wallet' | 'disputes'

// Utility functions
export const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

export const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric'
})

export const getBrandIcon = (brand: string) => {
  const icons: Record<string, string> = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    discover: '💳'
  }
  return icons[brand.toLowerCase()] || '💳'
}
