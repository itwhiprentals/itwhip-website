// app/lib/email/types.ts

// Base email data that all emails need
export interface BaseEmailData {
  to: string
  guestName: string
  bookingCode: string
}

// Booking received - sent immediately after booking
export interface BookingReceivedData extends BaseEmailData {
  carMake: string
  carModel: string
  carImage: string
  startDate: string
  endDate: string
  pickupLocation: string
  pickupTime: string
  totalAmount: string
  isP2P: boolean
  source: 'p2p' | 'amadeus' | 'traditional'
}

// Verification pending - sent to P2P bookings under review
export interface VerificationPendingData extends BaseEmailData {
  carMake: string
  carModel: string
  carImage: string
  startDate: string
  endDate: string
  pickupLocation: string
  totalAmount: string
  documentsSubmittedAt: string
  estimatedReviewTime: string
  trackingUrl: string
}

// Booking confirmed - sent after admin approval
export interface BookingConfirmedData extends BaseEmailData {
  carMake: string
  carModel: string
  carImage: string
  startDate: string
  endDate: string
  pickupLocation: string
  pickupTime: string
  totalAmount: string
  hostName: string
  hostPhone: string
  dashboardUrl: string
}

// Booking rejected - sent after admin rejection
export interface BookingRejectedData extends BaseEmailData {
  carMake: string
  carModel: string
  reason: string
  canRebook: boolean
  supportEmail: string
}

// Booking cancelled - sent after cancellation
export interface BookingCancelledData extends BaseEmailData {
  carMake: string
  carModel: string
  startDate: string
  cancellationReason?: string
  refundAmount?: string
  refundTimeframe?: string
}

// Pickup reminder - sent 24hrs before
export interface PickupReminderData extends BaseEmailData {
  carMake: string
  carModel: string
  carImage: string
  pickupDate: string
  pickupTime: string
  pickupLocation: string
  hostName: string
  hostPhone: string
  dashboardUrl: string
}

// Payment receipt - sent after payment
export interface PaymentReceiptData extends BaseEmailData {
  carMake: string
  carModel: string
  paymentDate: string
  paymentMethod: string
  subtotal: string
  taxes: string
  fees: string
  totalAmount: string
  transactionId: string
}

// Trip complete - sent after trip ends
export interface TripCompleteData extends BaseEmailData {
  carMake: string
  carModel: string
  tripDuration: string
  totalCost: string
  reviewUrl: string
  hostName: string
}

// ============================================================================
// HOST EMAIL INTERFACES - PHASE 2 ADDITIONS
// ============================================================================

// Host verification - for email/phone verification
export interface HostVerificationData {
  hostName: string
  verificationType: 'email' | 'phone'
  verificationCode: string
  verificationUrl: string
  expiresIn: string // e.g., "15 minutes"
}

// Host document request - for requesting document updates
export interface DocumentIssue {
  documentType: string
  issue: string
  instructions: string
}

export interface HostDocumentRequestData {
  hostName: string
  documentIssues: DocumentIssue[]
  uploadUrl: string
  deadline: string // e.g., "3 days"
  supportEmail?: string
}

// Host background check status - for background check updates
export interface BackgroundCheckDetail {
  checkType: string
  status: 'pending' | 'passed' | 'failed' | 'review'
  message?: string
}

export interface HostBackgroundCheckData {
  hostName: string
  checkStatus: 'started' | 'completed' | 'failed' | 'action_required'
  checks: BackgroundCheckDetail[]
  nextSteps?: string
  actionUrl?: string
  estimatedCompletion?: string
  supportEmail?: string
}

// Host action required - generic action template
export interface HostActionRequiredData {
  hostName: string
  actionType: string // e.g., "Complete Profile", "Update Insurance", "Renew Documents"
  actionDescription: string
  actionReason: string
  actionUrl: string
  deadline?: string // e.g., "48 hours", "7 days"
  consequences?: string // What happens if they don't take action
  supportEmail?: string
}

// Host rejection - application rejection
export interface RejectionReason {
  category: string
  description: string
  canResolve: boolean
}

export interface HostRejectionData {
  hostName: string
  reasons: RejectionReason[]
  canReapply: boolean
  reapplyTimeframe?: string // e.g., "30 days", "6 months"
  reapplyUrl?: string
  appealUrl?: string
  supportEmail?: string
}

// Host approval - welcome email
export interface HostApprovalData {
  hostName: string
  dashboardUrl: string
  commissionRate: number // e.g., 20 for 20%
  permissions: {
    canListCars: boolean
    canSetPricing: boolean
    canMessageGuests: boolean
    canWithdrawFunds: boolean
    instantBookEnabled: boolean
  }
  nextSteps: string[]
  hostId?: string
  supportEmail?: string
  trainingUrl?: string
}

// ============================================================================
// CLAIMS EMAIL INTERFACES - PHASE 2C
// ============================================================================

// Claim filed - host notification
export interface ClaimFiledHostData {
  hostName: string
  claimId: string
  bookingCode: string
  carDetails: string
  incidentDate: string
  estimatedCost: number
  claimType: string
  claimUrl: string
  vehicleDeactivated: boolean
}

// Claim notification - guest notification (48hr deadline)
export interface ClaimNotificationGuestData {
  guestName: string
  claimId: string
  bookingCode: string
  carDetails: string
  incidentDate: string
  estimatedCost: number
  claimType: string
  responseDeadline: string // ISO date string
  responseUrl: string
  hoursRemaining: number
  deductibleAmount: number
  depositHeld: number
  potentialCharge: number
}

// Claim notification - fleet admin
export interface ClaimNotificationFleetData {
  claimId: string
  bookingCode: string
  hostName: string
  guestName: string
  carDetails: string
  incidentDate: string
  estimatedCost: number
  claimType: string
  reviewUrl: string
  priority: 'low' | 'medium' | 'high'
  insuranceProvider: string
  earningsTier: string
}

// Claim approved - host notification
export interface ClaimApprovedHostData {
  hostName: string
  claimId: string
  bookingCode: string
  carDetails: string
  approvedAmount: number
  hostPayout: number
  earningsPercent: number
  reviewNotes?: string
  expectedPayoutDate: string
  claimUrl: string
}

// Claim decision - guest notification (approved or denied)
export interface ClaimDecisionGuestData {
  guestName: string
  claimId: string
  bookingCode: string
  carDetails: string
  decision: 'approved' | 'denied'
  approvedAmount?: number
  guestResponsibility?: number
  denialReason?: string
  appealUrl?: string
  paymentDueDate?: string
  claimUrl: string
}

// Claim reminder - guest 24hr reminder
export interface ClaimReminderGuestData {
  guestName: string
  claimId: string
  bookingCode: string
  carDetails: string
  hoursRemaining: number
  responseUrl: string
  consequences: string
}

// ============================================================================
// DECLARATION SYSTEM EMAIL INTERFACES - PHASE 2D
// ============================================================================

// ✅ NEW: Declaration updated - host notification
export interface DeclarationUpdatedData {
  hostName: string
  vehicleName: string
  oldDeclaration: string
  newDeclaration: string
  oldMaxGap: number
  newMaxGap: number
  earningsTier: number
  insuranceNote: string
  taxImplication?: string
  claimImpact?: string
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

// Email response type
export interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

// Template response type
export interface EmailTemplate {
  subject: string
  html: string
  text: string
}