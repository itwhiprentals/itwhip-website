// app/api/webhooks/twilio/voice/conference-status/route.ts
// Status callback for the outbound call to host/support/browser
//
// When the target doesn't answer (no-answer, busy, failed, canceled):
// - If it was a browser client call with a fallback phone → dial the fallback
// - Otherwise → end conference so caller routes to voicemail

import { NextRequest, NextResponse } from 'next/server'
import { parseTwilioBody } from '@/app/lib/twilio/verify-signature'
import { endConference, dialIntoConference } from '@/app/lib/twilio/conference'

type Lang = 'en' | 'es' | 'fr'

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const url = new URL(request.url)
    const room = url.searchParams.get('room') || ''
    const callerSid = url.searchParams.get('callerSid') || ''
    const lang = (url.searchParams.get('lang') || 'en') as Lang
    const fallbackPhone = url.searchParams.get('fallback') || ''
    const callStatus = params.CallStatus || ''
    const calledTo = params.To || ''

    console.log(`[Conference Status] Room: ${room}, Status: ${callStatus}, To: ${calledTo}`)

    // If the outbound call didn't connect, check for browser→cell fallback
    if (['no-answer', 'busy', 'failed', 'canceled'].includes(callStatus)) {
      if (calledTo === 'client:fleet-agent' && fallbackPhone) {
        // Browser didn't answer — fall back to cell phone
        console.log(`[Conference Status] Browser didn't answer (${callStatus}), falling back to cell ${fallbackPhone}`)
        await dialIntoConference(fallbackPhone, room, callerSid, lang)
      } else {
        // No fallback — end conference so caller routes to voicemail
        console.log(`[Conference Status] Didn't answer (${callStatus}), ending conference ${room}`)
        await endConference(room)
      }
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[Conference Status] Error:', error)
    return new NextResponse('OK', { status: 200 })
  }
}
