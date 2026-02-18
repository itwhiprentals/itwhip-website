// app/lib/twilio/client.ts
// Twilio client singleton — same pattern as app/lib/database/prisma.ts

import twilio from 'twilio'

const twilioClientSingleton = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    console.warn('[Twilio] Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN')
    return null
  }

  return twilio(accountSid, authToken)
}

type TwilioClient = ReturnType<typeof twilio>

declare global {
  // eslint-disable-next-line no-var
  var __twilioClient: TwilioClient | null | undefined
}

const client: TwilioClient | null = globalThis.__twilioClient ?? twilioClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__twilioClient = client
}

export { client as twilioClient }

// Phone numbers
export const TWILIO_LOCAL_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+16026092577'
export const TWILIO_TOLLFREE_NUMBER = process.env.TWILIO_TOLLFREE_NUMBER || '+18557030806'

// Messaging Service SID — used for outbound SMS (handles 10DLC compliance automatically)
export const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || ''

// Base URL for webhooks
export const WEBHOOK_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'
