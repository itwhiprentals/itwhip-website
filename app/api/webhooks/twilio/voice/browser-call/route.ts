// app/api/webhooks/twilio/voice/browser-call/route.ts
// TwiML webhook for browser-initiated calls via Twilio Client
// All outbound calls use conferences to enable hold, add participant, etc.
// Special prefixes:
//   +1... → conference-based outbound call
//   monitor:{room} → join conference silently (muted, no beep)
//   client:{id} → direct client call (future use)

import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { parseTwilioBody, verifyTwilioWebhook } from '@/app/lib/twilio/verify-signature'
import { twilioClient, TWILIO_LOCAL_NUMBER, WEBHOOK_BASE_URL } from '@/app/lib/twilio/client'

const VoiceResponse = twilio.twiml.VoiceResponse

function xml(twiml: string): NextResponse {
  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const signature = request.headers.get('x-twilio-signature')

    const reqUrl = new URL(request.url)
    const fullPath = reqUrl.pathname + reqUrl.search
    if (!verifyTwilioWebhook(fullPath, params, signature)) {
      console.error('[Browser Call] Invalid Twilio signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const to = params.To || ''
    const callSid = params.CallSid || ''
    const twiml = new VoiceResponse()

    if (to.startsWith('monitor:')) {
      // Silent monitor — join conference muted, no beep, don't start/end it
      const roomName = to.replace('monitor:', '')
      console.log(`[Browser Call] Monitor: joining ${roomName} silently`)
      const dial = twiml.dial()
      dial.conference({
        startConferenceOnEnter: false,
        endConferenceOnExit: false,
        beep: 'false',
        muted: true,
      }, roomName)

    } else if (to && to.startsWith('+')) {
      // Conference-based outbound call
      const roomName = `browser-${callSid}`
      console.log(`[Browser Call] Conference call to ${to}, room: ${roomName}`)

      // Put browser into conference (admin is the "owner")
      const dial = twiml.dial()
      dial.conference({
        startConferenceOnEnter: true,
        endConferenceOnExit: true,
        beep: 'false',
      }, roomName)

      // Async: dial the target into the same conference
      if (twilioClient) {
        twilioClient.calls.create({
          to,
          from: TWILIO_LOCAL_NUMBER,
          url: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/join-conference?room=${encodeURIComponent(roomName)}&lang=en&endOnExit=false`,
          method: 'POST',
          timeout: 30,
          machineDetection: 'Enable',
          statusCallback: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/conference-status?room=${encodeURIComponent(roomName)}&callerSid=${callSid}&lang=en`,
          statusCallbackEvent: ['completed', 'busy', 'no-answer', 'failed', 'canceled'],
          statusCallbackMethod: 'POST',
        }).then(call => {
          console.log(`[Browser Call] Dialing ${to} into room ${roomName}: ${call.sid}`)
        }).catch(err => {
          console.error(`[Browser Call] Failed to dial ${to}:`, err)
        })
      }

    } else if (to && to.startsWith('client:')) {
      // Direct client-to-client call (future)
      const dial = twiml.dial({ callerId: TWILIO_LOCAL_NUMBER })
      dial.client(to.replace('client:', ''))

    } else {
      twiml.say('No destination specified.')
      twiml.hangup()
    }

    return xml(twiml.toString())
  } catch (error) {
    console.error('[Browser Call] Error:', error)
    const twiml = new VoiceResponse()
    twiml.say('An error occurred. Please try again.')
    twiml.hangup()
    return xml(twiml.toString())
  }
}
