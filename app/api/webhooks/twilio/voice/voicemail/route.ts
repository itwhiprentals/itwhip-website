// app/api/webhooks/twilio/voice/voicemail/route.ts
// Recording callback — Twilio POSTs after voicemail recording completes
// Saves recording URL + SID to CallLog

import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { prisma } from '@/app/lib/database/prisma'
import { verifyTwilioWebhook, parseTwilioBody } from '@/app/lib/twilio/verify-signature'

const VOICES: Record<string, { voice: string; language: string }> = {
  en: { voice: 'Polly.Danielle-Neural', language: 'en-US' },
  es: { voice: 'Polly.Mia', language: 'es-MX' },
  fr: { voice: 'Polly.Lea', language: 'fr-FR' },
}

const THANKS: Record<string, string> = {
  en: 'Thank you. Your message has been recorded. For immediate help, visit itwhip.com and chat with Cowi, our AI booking assistant. Goodbye.',
  es: 'Gracias. Su mensaje ha sido grabado. Para ayuda inmediata, visite itwhip.com y hable con Cowi, nuestra asistente de reservas. Adiós.',
  fr: 'Merci. Votre message a été enregistré. Pour une aide immédiate, visitez itwhip.com et parlez avec Cowi, notre assistant de réservation. Au revoir.',
}

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const signature = request.headers.get('x-twilio-signature')

    // Must include query params — Twilio signs against the full URL
    const reqUrl = new URL(request.url)
    const fullPath = reqUrl.pathname + reqUrl.search
    if (!verifyTwilioWebhook(fullPath, params, signature)) {
      console.error('[Voicemail] Invalid Twilio signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const {
      CallSid: callSid,
      RecordingUrl: recordingUrl,
      RecordingSid: recordingSid,
      RecordingDuration: duration,
    } = params

    if (callSid) {
      await prisma.callLog.updateMany({
        where: { callSid },
        data: {
          recordingUrl: recordingUrl || null,
          recordingSid: recordingSid || null,
          duration: duration ? parseInt(duration, 10) : null,
          status: 'voicemail',
          menuPath: 'voicemail',
        },
      })

      console.log(`[Voicemail] Saved recording for call ${callSid}: ${recordingUrl}`)
    }

    const url = new URL(request.url)
    const lang = url.searchParams.get('lang') || 'en'
    const voiceConfig = VOICES[lang] || VOICES.en

    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say(voiceConfig, THANKS[lang] || THANKS.en)
    twiml.hangup()

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('[Voicemail] Error:', error)
    const twiml = new twilio.twiml.VoiceResponse()
    twiml.hangup()
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}
