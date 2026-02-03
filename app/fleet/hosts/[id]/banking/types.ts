// app/fleet/hosts/[id]/banking/types.ts
// Shared types for host banking page

export interface BankingData {
  host: {
    id: string
    name: string
    email: string
    approvalStatus: string
    hostType: string
  }
  stripeConnect: {
    accountId: string | null
    status: string | null
    payoutsEnabled: boolean
    chargesEnabled: boolean
    detailsSubmitted: boolean
    stripeData: any
  }
  stripeCustomer: {
    customerId: string | null
    defaultPaymentMethod: string | null
    stripeData: any
  }
  balances: {
    current: number
    pending: number
    hold: number
    negative: number
    availableForPayout: number
  }
  subscription: {
    tier: string
    status: string
    monthlyFee: number
    startDate: string | null
    endDate: string | null
    lastChargeDate: string | null
    nextChargeDate: string | null
  }
  payout: {
    schedule: string
    minimumAmount: number
    instantEnabled: boolean
    nextScheduled: string | null
    lastPayoutDate: string | null
    lastPayoutAmount: number | null
    totalPayouts: number
    payoutCount: number
    enabled: boolean
    disabledReason: string | null
  }
  bankAccount: {
    last4: string
    bankName: string
    accountType: string
    verified: boolean
  } | null
  debitCard: {
    last4: string
    brand: string
    expMonth: number
    expYear: number
  } | null
  paymentMethods: PaymentMethod[]
  recentCharges: HostCharge[]
  stats: {
    totalCharges: number
    totalChargedAmount: number
    currentBalance: number
    pendingBalance: number
    holdBalance: number
    negativeBalance: number
    availableForPayout: number
    totalPayouts: number
    payoutCount: number
  }
}

export interface PaymentMethod {
  id: string
  type: 'bank_account' | 'card'
  brand?: string
  last4: string
  accountType?: string
  status?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export interface HostCharge {
  id: string
  amount: number
  chargeType: string
  reason: string
  status: string
  chargedBy: string
  createdAt: string
}

export interface ChargeFormData {
  amount: string
  chargeType: string
  reason: string
  notes: string
  deductFromBalance: boolean
}

export interface HoldFormData {
  action: 'hold' | 'release' | 'suspend_payouts' | 'enable_payouts'
  amount: string
  reason: string
  notes: string
  holdUntil: string
}

export interface PayoutFormData {
  amount: string
  reason: string
  notes: string
}

// Utility functions
export const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

export const formatDate = (date: string) => new Date(date).toLocaleDateString()
