// app/api/webhooks/twilio/voice/masked-caller/route.ts
// TwiML when guest/host answers the masked callback
// Says a brief message then joins the conference room
// AMD: if voicemail answers, hang up and end the conference

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
  try {
    const params = await parseTwilioBody(request)
    const url = new URL(request.url)
    const room = url.searchParams.get('room') || 'default'
    const lang = (url.searchParams.get('lang') || 'en') as Lang
    const target = url.searchParams.get('target') || '' // 'host' or 'guest'

    // AMD: if voicemail answered, hang up and end conference
    const answeredBy = params.AnsweredBy || ''
    if (answeredBy.startsWith('machine')) {
      console.log(`[Masked Caller] AMD detected voicemail (${answeredBy}), ending conference ${room}`)
      endConference(room).catch(e => console.error('[Masked Caller] Failed to end conf:', e))
      const twiml = new VoiceResponse()
      twiml.hangup()
      return xml(twiml.toString())
    }

    const twiml = new VoiceResponse()

    // Brief message so they know it's an ItWhip call
    const msgs: Record<string, Record<Lang, string>> = {
      host: {
        en: 'Connecting you to your host through ItWhip.',
        es: 'Conectándote con tu anfitrión a través de ItWhip.',
        fr: 'Connexion avec votre hôte via ItWhip.',
      },
      guest: {
        en: 'Incoming call from your ItWhip guest.',
        es: 'Llamada entrante de tu huésped de ItWhip.',
        fr: 'Appel entrant de votre locataire ItWhip.',
      },
    }

    const message = msgs[target]?.[lang] || msgs.host[lang]
    twiml.say(VOICE[lang], message)

    // Join the conference
    const dial = twiml.dial()
    dial.conference({
      startConferenceOnEnter: true,
      endConferenceOnExit: true,
      beep: 'false',
    }, room)

    return xml(twiml.toString())
  } catch (error) {
    console.error('[Masked Caller] Error:', error)
    const twiml = new VoiceResponse()
    twiml.say('An error occurred. Please try again.')
    twiml.hangup()
    return xml(twiml.toString())
  }
}
