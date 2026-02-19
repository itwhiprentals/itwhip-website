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
      timeout: 30,
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
