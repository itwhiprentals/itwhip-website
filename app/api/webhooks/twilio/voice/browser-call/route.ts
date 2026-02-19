// app/api/webhooks/twilio/voice/browser-call/route.ts
// TwiML webhook for browser-initiated outbound calls via Twilio Client
// When fleet admin dials a number from PhoneWidget, Twilio hits this URL
// Returns TwiML that dials the target number with ItWhip caller ID

import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { parseTwilioBody, verifyTwilioWebhook } from '@/app/lib/twilio/verify-signature'
import { TWILIO_LOCAL_NUMBER } from '@/app/lib/twilio/client'

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
    const twiml = new VoiceResponse()

    if (to && to.startsWith('+')) {
      // Outbound call to a phone number
      const dial = twiml.dial({ callerId: TWILIO_LOCAL_NUMBER })
      dial.number(to)
    } else if (to && to.startsWith('client:')) {
      // Call another Twilio Client (future use)
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
