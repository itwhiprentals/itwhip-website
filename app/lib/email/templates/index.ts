// app/lib/email/templates/index.ts

/**
* Central export file for all email templates
* Each template exports a function that returns { subject, html, text }
*/

export { getBookingReceivedTemplate } from './booking-received'
export { getVerificationPendingTemplate } from './verification-pending'
export { getBookingConfirmedTemplate } from './booking-confirmed'
export { getBookingRejectedTemplate } from './booking-rejected'
export { getBookingCancelledTemplate } from './booking-cancelled'
export { getPickupReminderTemplate } from './pickup-reminder'
export { getPaymentReceiptTemplate } from './payment-receipt'
export { getTripCompleteTemplate } from './trip-complete'

// Re-export types for convenience
export type {
 BaseEmailData,
 BookingReceivedData,
 VerificationPendingData,
 BookingConfirmedData,
 BookingRejectedData,
 BookingCancelledData,
 PickupReminderData,
 PaymentReceiptData,
 TripCompleteData,
 EmailResponse,
 EmailTemplate
} from '../types'