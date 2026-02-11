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

// Claim filed by guest - notification to host
export interface ClaimFiledByGuestData {
  hostName: string
  guestName: string
  claimId: string
  bookingCode: string
  carDetails: string
  incidentDate: string
  estimatedCost: number
  claimType: string
  claimDescription: string
  claimUrl: string
  responseDeadline: string
}

// Claim response confirmation - sent to guest after responding
export interface ClaimResponseConfirmationData {
  guestName: string
  claimId: string
  bookingCode: string
  carDetails: string
  claimType: string
  hostName: string
  responseSubmittedAt: string
  evidencePhotosCount: number
  claimUrl: string
}

// Claim guest response received - notification to Fleet
export interface ClaimGuestResponseReceivedData {
  claimId: string
  bookingCode: string
  guestName: string
  guestEmail: string
  hostName: string
  carDetails: string
  claimType: string
  estimatedCost: number
  responseText: string
  evidencePhotosCount: number
  respondedAt: string
  reviewUrl: string
}

// Claim account hold applied - notification to guest
export interface ClaimAccountHoldAppliedData {
  guestName: string
  claimId: string
  bookingCode: string
  carDetails: string
  claimType: string
  estimatedCost: number
  hostName: string
  holdReason: string
  responseUrl: string
  supportEmail: string
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
// OAUTH WELCOME EMAIL - NEW USER SIGNUP
// ============================================================================

// OAuth welcome - sent after user completes profile with phone number
export interface OAuthWelcomeData {
  userName: string
  userEmail: string
  documentsUrl: string  // /profile?tab=documents
  insuranceUrl: string  // /profile?tab=insurance
  dashboardUrl: string  // /dashboard
}

// ============================================================================
// FLEET MANAGEMENT INVITATION EMAIL INTERFACES - PHASE 4
// ============================================================================

// Base vehicle info for invitation emails
export interface InvitationVehicleInfo {
  make: string
  model: string
  year: number
  photo?: string
}

// Management invitation - initial invite from owner or manager
export interface ManagementInvitationData {
  recipientName: string
  recipientEmail: string
  senderName: string
  senderEmail: string
  senderPhoto?: string
  invitationType: 'OWNER_INVITES_MANAGER' | 'MANAGER_INVITES_OWNER'
  vehicles?: InvitationVehicleInfo[]
  proposedOwnerPercent: number
  proposedManagerPercent: number
  effectiveOwnerPercent: number   // After platform 10% cut
  effectiveManagerPercent: number // After platform 10% cut
  permissions: {
    canEditListing: boolean
    canAdjustPricing: boolean
    canCommunicateGuests: boolean
    canApproveBookings: boolean
    canHandleIssues: boolean
  }
  inviteUrl: string
  expiresAt: string
  message?: string
}

// Counter-offer notification
export interface CounterOfferData {
  recipientName: string
  recipientEmail: string
  counterPartyName: string
  counterPartyEmail: string
  invitationType: 'OWNER_INVITES_MANAGER' | 'MANAGER_INVITES_OWNER'
  vehicles?: InvitationVehicleInfo[]
  originalOwnerPercent: number
  originalManagerPercent: number
  newOwnerPercent: number
  newManagerPercent: number
  effectiveOwnerPercent: number
  effectiveManagerPercent: number
  negotiationRound: number
  maxRounds: number
  counterOfferMessage?: string
  respondUrl: string
  expiresAt: string
}

// Invitation accepted - confirmation to both parties
export interface InvitationAcceptedData {
  recipientName: string
  recipientEmail: string
  otherPartyName: string
  otherPartyEmail: string
  role: 'owner' | 'manager'
  vehicles: InvitationVehicleInfo[]
  finalOwnerPercent: number
  finalManagerPercent: number
  effectiveOwnerPercent: number
  effectiveManagerPercent: number
  permissions: {
    canEditListing: boolean
    canAdjustPricing: boolean
    canCommunicateGuests: boolean
    canApproveBookings: boolean
    canHandleIssues: boolean
  }
  dashboardUrl: string
  agreementDate: string
}

// Invitation declined
export interface InvitationDeclinedData {
  recipientName: string
  recipientEmail: string
  declinerName: string
  declinerEmail: string
  invitationType: 'OWNER_INVITES_MANAGER' | 'MANAGER_INVITES_OWNER'
  vehicles?: InvitationVehicleInfo[]
  declineReason?: string
  wasCounterOffer: boolean
}

// Host OAuth welcome - sent after host completes profile with phone and car info
export interface HostOAuthWelcomeData {
  userName: string
  userEmail: string
  profileUrl: string      // /host/profile?tab=profile
  documentsUrl: string    // /host/profile?tab=documents
  carsUrl: string         // /host/cars
  earningsUrl: string     // /host/earnings
  insuranceUrl: string    // /host/profile?tab=insurance
  dashboardUrl: string    // /host/dashboard
}

// ============================================================================
// PARTNER DOCUMENT REQUEST EMAIL INTERFACES
// ============================================================================

export interface PartnerDocumentIssue {
  documentType: string
  displayName: string
  issue?: string
  instructions?: string
}

export interface PartnerDocumentRequestData {
  partnerName: string
  companyName?: string
  documentIssues: PartnerDocumentIssue[]
  uploadUrl: string
  deadline?: string
  requestedBy?: string
  supportEmail?: string
}

// ============================================================================
// DEPOSIT / REFUND EMAIL INTERFACES
// ============================================================================

export interface DepositReleasedData extends BaseEmailData {
  carMake: string
  carModel: string
  depositAmount: string
  cardRefundAmount: string
  walletReturnAmount: string
  tripEndDate: string
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