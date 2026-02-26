// app/lib/twilio/conference.ts
// Conference-based call connection — enables hold music while connecting
//
// Flow:
// 1. Caller enters a Conference room (hears hold music + promo messages)
// 2. REST API dials the host/support → when they answer, they join the same room
// 3. Music stops, both parties talk
// 4. If no answer after 30s → conference ends → caller routes to voicemail

import { twilioClient, TWILIO_LOCAL_NUMBER, WEBHOOK_BASE_URL } from './client'

type Lang = 'en' | 'es' | 'fr'

/**
 * Create an outbound call to a phone number and join them into a conference room.
 * Non-blocking — fires the REST API call and returns immediately.
 */
export async function dialIntoConference(
  phone: string,
  roomName: string,
  callerCallSid: string,
  lang: Lang = 'en'
): Promise<string | null> {
  if (!twilioClient) {
    console.error('[Conference] Twilio client not initialized')
    return null
  }

  try {
    const call = await twilioClient.calls.create({
      to: phone,
      from: TWILIO_LOCAL_NUMBER,
      url: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/join-conference?room=${encodeURIComponent(roomName)}&lang=${lang}`,
      method: 'POST',
      timeout: 25,
      // AMD disabled — was falsely detecting real humans as voicemail (machine_start)
      // and hanging up on customers. Better to connect to a real voicemail than drop real calls.
      statusCallback: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/conference-status?room=${encodeURIComponent(roomName)}&callerSid=${callerCallSid}&lang=${lang}`,
      statusCallbackEvent: ['completed', 'busy', 'no-answer', 'failed', 'canceled'],
      statusCallbackMethod: 'POST',
    })

    console.log(`[Conference] Dialing ${phone} into room ${roomName}: ${call.sid}`)
    return call.sid
  } catch (error) {
    console.error('[Conference] Failed to create outbound call:', error)
    // If the outbound call fails immediately, end the conference
    // so the caller's <Dial> completes and routes to voicemail
    await endConference(roomName)
    return null
  }
}

/**
 * Dial the browser client (fleet-agent) into a conference room.
 * Falls back to cell phone if browser doesn't answer within 15s.
 * Non-blocking — fires and returns immediately.
 */
export async function dialClientIntoConference(
  roomName: string,
  callerCallSid: string,
  lang: Lang = 'en',
  fallbackPhone?: string
): Promise<string | null> {
  if (!twilioClient) {
    console.error('[Conference] Twilio client not initialized')
    return null
  }

  try {
    const call = await twilioClient.calls.create({
      to: 'client:fleet-agent',
      from: TWILIO_LOCAL_NUMBER,
      url: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/join-conference?room=${encodeURIComponent(roomName)}&lang=${lang}`,
      method: 'POST',
      timeout: 15,
      // No AMD for browser client
      statusCallback: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/conference-status?room=${encodeURIComponent(roomName)}&callerSid=${callerCallSid}&lang=${lang}${fallbackPhone ? `&fallback=${encodeURIComponent(fallbackPhone)}` : ''}`,
      statusCallbackEvent: ['completed', 'busy', 'no-answer', 'failed', 'canceled'],
      statusCallbackMethod: 'POST',
    })

    console.log(`[Conference] Dialing browser client into room ${roomName}: ${call.sid}`)
    return call.sid
  } catch (error) {
    console.error('[Conference] Failed to dial browser client:', error)
    // Fallback to cell phone if browser dial fails immediately
    if (fallbackPhone) {
      console.log(`[Conference] Falling back to cell phone ${fallbackPhone}`)
      return dialIntoConference(fallbackPhone, roomName, callerCallSid, lang)
    }
    await endConference(roomName)
    return null
  }
}

/**
 * End a conference by friendly name — forces all participants out.
 * Used when the outbound call to host/support fails or goes unanswered.
 */
export async function endConference(roomName: string): Promise<void> {
  if (!twilioClient) return

  try {
    const conferences = await twilioClient.conferences.list({
      friendlyName: roomName,
      status: 'in-progress',
    })

    for (const conf of conferences) {
      await twilioClient.conferences(conf.sid).update({ status: 'completed' })
      console.log(`[Conference] Ended conference ${roomName} (${conf.sid})`)
    }
  } catch (error) {
    console.error(`[Conference] Failed to end conference ${roomName}:`, error)
  }
}
