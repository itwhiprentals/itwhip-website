// app/api/webhooks/twilio/voice/join-conference/route.ts
// TwiML for the host/support when they answer the outbound call
// Joins them into the same conference room as the waiting caller
//
// AMD (Answering Machine Detection): If Twilio detects voicemail,
// we hang up and end the conference so the caller routes to IVR voicemail.

import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { parseTwilioBody } from '@/app/lib/twilio/verify-signature'
import { endConference } from '@/app/lib/twilio/conference'

const VoiceResponse = twilio.twiml.VoiceResponse

type Lang = 'en' | 'es' | 'fr'

const VOICE: Record<Lang, { voice: string; language: string }> = {
  en: { voice: 'Polly.Danielle-Neural', language: 'en-US' },
  es: { voice: 'Polly.Mia', language: 'es-MX' },
  fr: { voice: 'Polly.Lea-Neural', language: 'fr-FR' },
}

function xml(twiml: string): NextResponse {
  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

export async function POST(request: NextRequest) {
  const params = await parseTwilioBody(request)
  const url = new URL(request.url)
  const room = url.searchParams.get('room') || 'default'
  const lang = (url.searchParams.get('lang') || 'en') as Lang
  const endOnExit = url.searchParams.get('endOnExit') !== 'false'

  // AMD check: if voicemail answered, don't join the conference
  const answeredBy = params.AnsweredBy || ''
  if (answeredBy.startsWith('machine')) {
    console.log(`[Conference] AMD detected voicemail (${answeredBy}), ending conference ${room}`)
    // End the conference so the caller routes to IVR voicemail
    endConference(room).catch(e => console.error('[Conference] Failed to end:', e))
    // Hang up the outbound call
    const twiml = new VoiceResponse()
    twiml.hangup()
    return xml(twiml.toString())
  }

  const twiml = new VoiceResponse()

  // Brief message so the host/support knows it's an ItWhip call
  const msgs: Record<Lang, string> = {
    en: 'Incoming ItWhip call. You are being connected now.',
    es: 'Llamada entrante de ItWhip. Te estamos conectando ahora.',
    fr: 'Appel entrant ItWhip. Nous vous connectons maintenant.',
  }
  twiml.say(VOICE[lang], msgs[lang])

  // Join the conference — startConferenceOnEnter=true starts the call
  // endConferenceOnExit=true ends when host hangs up → caller routes to action URL
  const dial = twiml.dial()
  dial.conference({
    startConferenceOnEnter: true,
    endConferenceOnExit: endOnExit,
    beep: 'false',
  }, room)

  return xml(twiml.toString())
}
