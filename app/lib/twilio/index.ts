// app/lib/twilio/index.ts
// Barrel export for Twilio service layer

export { twilioClient, TWILIO_LOCAL_NUMBER, TWILIO_TOLLFREE_NUMBER, WEBHOOK_BASE_URL } from './client'
export { normalizePhone, normalizeForLookup, isUsNumber } from './phone'
export { verifyTwilioWebhook, parseTwilioBody } from './verify-signature'
export { sendSms, canSendToGuest, getGuestLocale } from './sms'
export type { SmsType } from './sms'
export * from './sms-triggers'
export { lookupCaller, lookupBookingByCode } from './caller-lookup'
export type { CallerIdentity, ActiveBooking } from './caller-lookup'
