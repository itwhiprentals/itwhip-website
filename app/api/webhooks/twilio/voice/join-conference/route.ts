// app/api/webhooks/twilio/voice/join-conference/route.ts
// TwiML for the host/support when they answer the outbound call
// Joins them into the same conference room as the waiting caller

import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

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
  const url = new URL(request.url)
  const room = url.searchParams.get('room') || 'default'
  const lang = (url.searchParams.get('lang') || 'en') as Lang

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
    endConferenceOnExit: true,
    beep: 'false',
  }, room)

  return xml(twiml.toString())
}
