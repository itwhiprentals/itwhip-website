// app/api/webhooks/twilio/voice/conference-status/route.ts
// Status callback for the outbound call to host/support
//
// When the host doesn't answer (no-answer, busy, failed, canceled),
// we end the conference so the caller's <Dial> completes and
// routes to the voicemail prompt via the action URL.

import { NextRequest, NextResponse } from 'next/server'
import { parseTwilioBody } from '@/app/lib/twilio/verify-signature'
import { endConference } from '@/app/lib/twilio/conference'

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const url = new URL(request.url)
    const room = url.searchParams.get('room') || ''
    const callStatus = params.CallStatus || ''

    console.log(`[Conference Status] Room: ${room}, Status: ${callStatus}`)

    // If the outbound call didn't connect, end the conference
    // This causes the caller's <Dial> to complete → action URL → voicemail
    if (['no-answer', 'busy', 'failed', 'canceled'].includes(callStatus)) {
      console.log(`[Conference Status] Host didn't answer (${callStatus}), ending conference ${room}`)
      await endConference(room)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[Conference Status] Error:', error)
    return new NextResponse('OK', { status: 200 })
  }
}
