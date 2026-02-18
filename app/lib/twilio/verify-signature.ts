// app/lib/twilio/verify-signature.ts
// Webhook signature verification for Twilio requests

import twilio from 'twilio'
import { WEBHOOK_BASE_URL } from './client'

/**
 * Verify Twilio webhook signature for form-encoded requests (voice + SMS)
 *
 * IMPORTANT: Use WEBHOOK_BASE_URL + path, NOT request.url
 * Vercel/CDN may rewrite the URL internally, causing signature mismatch
 */
export function verifyTwilioWebhook(
  path: string,
  params: Record<string, string>,
  signature: string | null
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) {
    console.error('[Twilio] Missing TWILIO_AUTH_TOKEN for signature verification')
    return false
  }

  if (!signature) {
    console.error('[Twilio] Missing X-Twilio-Signature header')
    return false
  }

  const url = `${WEBHOOK_BASE_URL}${path}`

  try {
    return twilio.validateRequest(authToken, signature, url, params)
  } catch (error) {
    console.error('[Twilio] Signature verification error:', error)
    return false
  }
}

/**
 * Parse form-encoded body from Twilio webhook request
 * Twilio sends application/x-www-form-urlencoded for both voice and SMS webhooks
 */
export async function parseTwilioBody(request: Request): Promise<Record<string, string>> {
  const text = await request.text()
  const params: Record<string, string> = {}
  const searchParams = new URLSearchParams(text)
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}
