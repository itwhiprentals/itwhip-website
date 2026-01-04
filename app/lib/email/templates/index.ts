// app/lib/email/templates/index.ts

/**
 * Central export file for all email templates
 * Each template exports a function that returns { subject, html, text }
 */

// Guest booking templates
export { getBookingReceivedTemplate } from './booking-received'
export { getVerificationPendingTemplate } from './verification-pending'
export { getBookingConfirmedTemplate } from './booking-confirmed'
export { getBookingRejectedTemplate } from './booking-rejected'
export { getBookingCancelledTemplate } from './booking-cancelled'
export { getPickupReminderTemplate } from './pickup-reminder'
export { getPaymentReceiptTemplate } from './payment-receipt'
export { getTripCompleteTemplate } from './trip-complete'

// Host templates
export { getHostVerificationTemplate } from './host-verification'

// NEW HOST LIFECYCLE TEMPLATES - PHASE 2
export { getHostDocumentRequestTemplate } from './host-document-request'
// Fix: Export the actual function name and alias it
export { getHostBackgroundCheckStatusTemplate as getHostBackgroundCheckTemplate } from './host-background-check-status'
export { getHostActionRequiredTemplate } from './host-action-required'
export { getHostRejectionTemplate } from './host-rejection'
export { getHostApprovalTemplate } from './host-approval'

// CLAIMS EMAIL TEMPLATES - PHASE 2C
export { getClaimFiledHostTemplate } from './claim-filed-host'
export { getClaimNotificationGuestTemplate } from './claim-notification-guest'
export { getClaimNotificationFleetTemplate } from './claim-notification-fleet'
export { getClaimApprovedHostTemplate } from './claim-approved-host'
export { getClaimDecisionGuestTemplate } from './claim-decision-guest'
export { getClaimReminderGuestTemplate } from './claim-reminder-guest'

// GUEST CLAIMS EMAIL TEMPLATES - PHASE 3
export { getClaimFiledByGuestTemplate } from './claim-filed-by-guest'
export { getClaimResponseConfirmationTemplate } from './claim-response-confirmation'
export { getClaimGuestResponseReceivedTemplate } from './claim-guest-response-received'
export { getClaimAccountHoldAppliedTemplate } from './claim-account-hold-applied'

// ✅ NEW: DECLARATION SYSTEM TEMPLATE - PHASE 2D
export { declarationUpdatedTemplate } from './declaration-updated'

// OAuth Welcome Email - New User Signup
export { getOAuthWelcomeTemplate } from './oauth-welcome'

// FLEET MANAGEMENT INVITATION TEMPLATES - PHASE 4
export { getManagementInvitationTemplate } from './management-invitation'
export { getCounterOfferTemplate } from './counter-offer'
export { getInvitationAcceptedTemplate } from './invitation-accepted'
export { getInvitationDeclinedTemplate } from './invitation-declined'

// Re-export all types for convenience
export type {
  // Base types
  BaseEmailData,
  EmailResponse,
  EmailTemplate,
  
  // Guest booking types
  BookingReceivedData,
  VerificationPendingData,
  BookingConfirmedData,
  BookingRejectedData,
  BookingCancelledData,
  PickupReminderData,
  PaymentReceiptData,
  TripCompleteData,
  
  // Host verification type
  HostVerificationData,
  
  // Host lifecycle types - Phase 2
  HostDocumentRequestData,
  DocumentIssue,
  HostBackgroundCheckData,
  BackgroundCheckDetail,
  HostActionRequiredData,
  HostRejectionData,
  RejectionReason,
  HostApprovalData,
  
  // Claims types - Phase 2C
  ClaimFiledHostData,
  ClaimNotificationGuestData,
  ClaimNotificationFleetData,
  ClaimApprovedHostData,
  ClaimDecisionGuestData,
  ClaimReminderGuestData,

  // Guest Claims types - Phase 3
  ClaimFiledByGuestData,
  ClaimResponseConfirmationData,
  ClaimGuestResponseReceivedData,
  ClaimAccountHoldAppliedData,

  // OAuth Welcome type
  OAuthWelcomeData,

  // Fleet Management Invitation types - Phase 4
  InvitationVehicleInfo,
  ManagementInvitationData,
  CounterOfferData,
  InvitationAcceptedData,
  InvitationDeclinedData
} from '../types'