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